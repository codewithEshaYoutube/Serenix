# Serenix AI

### Privacy-Preserving AI for Safety Compliance Monitoring and Inspection

---

## Overview 

Serenix AI checks whether real workplaces actually comply with safety regulations, and explains its answers with the regulation text to back them up.

It sees the workplace through two kinds of cameras feeding one shared backend:

**1. A web inspection app.** An inspector walks the site, opens the website on their phone's browser (or uploads from a desktop), and takes a photo of a fire exit, an extinguisher, or an electrical panel. The system recognizes what kind of asset is in the photo, runs the applicable compliance checklist against it (is the exit path clear, is the sign visible, is the required clearance respected), and returns a verdict on the spot: compliant or not, which regulation applies, how serious it is, and what to fix. This replaces the paper clipboard inspection.

**2. Fixed cameras on a Jetson Orin (continuous monitoring).** A small AI computer on-site ingests directly connected or RTSP CCTV cameras through NVIDIA DeepStream and acts as a tripwire: it spots people, checks safety gear, tracks movement, and flags unsafe moments such as a missing helmet, someone entering a restricted zone, or a person falling and not getting up. Raw video never leaves the site; faces are blurred on the evidence image before upload.

Both paths produce the same thing: an event with a photo, sent to one backend. The backend decides whether it is a regulatory violation using a deterministic rules table, looks up the exact regulation (OSHA and others), and has an LLM write a clear report: what happened, why it violates the rule, the citation, and the corrective action. Ambiguous cases go to a human. Nothing is enforced automatically.

If connectivity drops, the Jetson queues its events locally and syncs later. The web inspection app needs a connection to work (an offline-capable native app is future work).

The idea in one line: detection is a commodity; Serenix reasons about what it sees against real safety regulations, explains itself, and keeps a human in charge.

---

## System Architecture

```
  Web Inspection App             Fixed Cameras (CSI/USB + RTSP)
  (inspector takes photo                     |
   in the browser)                           |
        |                                    v
        |                     +------------------------------+
        |                     |  Jetson Orin + DeepStream    |
        |                     |  nvstreammux: batch streams  |
        |                     |  nvinfer: YOLOv11 (TensorRT) |
        |                     |  nvtracker: track IDs        |
        |                     |  nvdsanalytics: zones, dwell |
        |                     |  probe: gate, debounce,      |
        |                     |    face blur on snapshot     |
        |                     |  nvmsgbroker: MQTT out       |
        |                     |  local offline queue         |
        |                     +------------------------------+
        |                                    |
   photo upload (HTTPS),           event JSON + blurred
   face blur in backend            snapshot over MQTT
   before storage                            |
        |                                    |
        +----------------+-------------------+
                         |
                         v
   +---------------------------------------------+
   |  Backend (FastAPI + PostgreSQL)             |
   |                                             |
   |  Asset registry: asset types, checklists,   |
   |    applicable regulations                   |
   |                                             |
   |  VLM (inspections): classifies the asset    |
   |    in the photo, fills a structured         |
   |    checklist with yes/no/unclear facts      |
   |                                             |
   |  Deterministic rules table (the judge):     |
   |    facts -> violation -> citation ->        |
   |    severity -> remediation                  |
   +---------------------------------------------+
                         |
                         v
   +---------------------------------------------+
   |  Reasoning Layer (LLM + RAG)                |
   |  RAG retrieves the regulation text          |
   |  LLM writes the violation report            |
   |  Q&A over events and regulations            |
   +---------------------------------------------+
                         |
                         v
   +---------------------------------------------+
   |  Human Layer (Review UI)                    |
   |  Inspector sees the verdict on the spot     |
   |  Reviewer confirms or dismisses flags       |
   |  Owns every high-stakes decision            |
   +---------------------------------------------+
```

---

## Responsibilities of Each Layer

### 1a. Web Inspection App (capture front-end)

**Where it runs:** the inspector's browser, on a phone or desktop. No install.

The human-carried camera. Replaces clipboard inspections. No app store, no install: the inspector opens the site on their phone and the camera input works natively (input capture on mobile browsers), or photos are uploaded from a desktop.

- Inspector takes or uploads a photo of an asset; no QR codes or tags needed
- The VLM identifies the asset type from the photo itself (fire exit, extinguisher, electrical panel) and the backend selects the matching checklist
- Optional asset picker (site, area, asset) when per-asset compliance history matters; otherwise inspections are logged by type
- Face blur happens in the backend immediately on receipt, before the image is stored; only the blurred version is ever persisted
- Shows the verdict, citation, and corrective action to the inspector on the spot

### 1b. Fixed Camera Layer (Jetson Orin + DeepStream)

**Where it runs:** on-site, on the Jetson Orin next to the cameras. Raw video never leaves this device.

The tripwire. Continuous, real-time, and deterministic. One DeepStream process ingests all cameras and keeps frames on the GPU end to end.

- nvstreammux batches all camera streams into one GPU pipeline; per-stream source ids identify which camera fired
- nvinfer runs YOLOv11 as a TensorRT engine for person and PPE detection (custom bounding-box parser from the DeepStream-Yolo project)
- nvtracker (NvDCF) assigns per-stream track IDs, so behavior can be reasoned about over time
- nvdsanalytics handles zone intrusion, line crossing, direction, and dwell time as configuration, not code; a dwell rule on a fire-exit ROI catches obstructions continuously for free
- A pipeline probe holds our logic: confidence gating, debouncing per-frame metadata into one event per incident ("helmet missing for 3 seconds on track 12" fires once, not 90 times), and snapshot extraction
- Face blurring on the evidence snapshot before anything leaves the device
- Local queue so offline events are not lost
- nvmsgconv + nvmsgbroker publish one compact JSON event per flagged incident over MQTT, never per frame

Both front-ends emit the same event shape: what, where, when, confidence, evidence image. Everything downstream is shared and does not know which camera produced the event.

### 2. Decision Layer (FastAPI + PostgreSQL)

**Where it runs:** the backend server (cloud or on-premises), shared by both front-ends.

The judge. Deliberately not an LLM.

- Receives and stores events from both front-ends
- Asset registry: asset types, their checklists, and the regulations that apply to each
- For inspections, the VLM first fills a structured checklist with factual answers (obstructed: yes/no/unclear); it never decides compliance
- A deterministic rules table maps facts (detections or checklist answers) to violation, regulation citation, severity, and remediation
- Every verdict carries the rule id that fired, which forms the audit trail
- "I don't know" is a first-class verdict: low confidence, no matching rule, or an "unclear" checklist answer escalates to human review
- Critical hazards (fire, smoke) carry alert_mode: immediate, bypassing the review queue for notification while still requiring human confirmation for action

### 3. Reasoning Layer (LLM + RAG)

**Where it runs:** the backend server; the LLM/VLM itself is a cloud API call made by the backend, never by the browser or the Jetson.

The analyst and writer. It never decides violation versus no violation; it explains and interfaces.

- Writes the violation report, composing multiple findings into one severity-ranked narrative
- RAG (LangChain + FAISS over regulation texts) retrieves and quotes the actual regulation paragraph, so citations are grounded, not generated
- VLM roles: classifies the asset in inspection photos, fills structured checklists, and gives a second opinion on ambiguous flagged snapshots from the fixed cameras (for example "this is steam from a vent, not smoke")
- Natural-language Q&A over event history and regulations ("which zone had the most violations this week?")
- LLM calls happen per event or per inspection, never per frame

### 4. Human Layer (Review UI)

**Where it runs:** the browser. The inspector sees verdicts in the inspection app; safety reviewers use the dashboard, served by the same React frontend.

The authority. The inspector sees verdicts on the spot; a reviewer dashboard handles escalations and confirms or dismisses flagged events. AI assists; it does not enforce.

---

## Design Q&A

Questions we worked through while designing the system, kept here so the reasoning is not lost.

### Why two front-ends over one backend?

They answer different questions. The web app answers "is this asset compliant right now?" on demand; the fixed cameras answer "did something unsafe just happen?" around the clock. Because both emit the same event JSON, the rules table, RAG pipeline, and review UI are built once and serve both. The browser is a human-carried camera; the Jetson is a wall-mounted inspector.

### Do we need the Jetson for the inspection use case?

No. The Jetson exists to solve one problem: watching video streams continuously without sending them anywhere. When a human deliberately takes one photo, that problem does not exist. The browser talks to the backend directly over HTTPS, and the backend blurs faces before storing anything. The Jetson path is for continuous monitoring only.

### How does the app know what asset it is looking at without QR codes?

Two jobs the QR code would have done, both covered:

1. What kind of asset: the VLM classifies the photo itself (fire exit, extinguisher, electrical panel) and the backend selects the matching checklist. No user friction at all.
2. Which specific asset: an optional picker in the app when per-asset history matters. For the MVP, logging inspections by asset type is acceptable. QR or NFC tags can be added later as a convenience, not a requirement.

### How does an inspection photo become a compliance verdict?

The VLM is given a structured checklist, not an open question: "Answer yes/no/unclear for each: (a) is the exit path free of obstructions, (b) is an exit sign visible and legible, (c) does the door appear openable." The VLM only reports facts. The deterministic rules table then maps those facts to the verdict: not_obstructed=false maps to a violation of OSHA 1910.37(a)(3), severity high. Unclear answers escalate to a human. The VLM is a remote pair of eyes; the law stays in the table.

### Why DeepStream on the fixed-camera path, and what does it buy us?

DeepStream's value is throughput: hardware-decoded video and batched inference so one Orin handles 8 or more camera streams in a single GPU pipeline. It also gives us tracking (nvtracker), zone and dwell analytics (nvdsanalytics), RTSP reconnect handling, and native MQTT publishing (nvmsgbroker) out of the box. The costs are a GStreamer learning curve and a custom bounding-box parser for YOLOv11 (solved by the community DeepStream-Yolo project rather than written from scratch).

The fallback path: for a single camera, plain Python with Ultralytics YOLOv11 exported to TensorRT gets the same detections in about 50 lines with no parser risk. The event JSON is identical either way, so nothing downstream knows which pipeline produced the event.

### If the cameras and the app do the seeing, what are the LLM calls for?

The LLM never decides anything; it explains and interfaces. Specific uses, ranked:

1. Writing the violation report from the verdict plus retrieved regulation text
2. RAG-grounded citation of the actual regulation paragraph
3. VLM: asset classification, structured checklists, and second opinions on ambiguous snapshots
4. Natural-language Q&A over event history and regulations
5. Shift and incident summarization (many raw events into one readable digest)

### Object detection tells us what is there. What about behavior?

Behavior is a ladder of four techniques; the first two run on the Jetson:

1. Detections + tracking + time: zone intrusion, dwell, dangerous proximity, running, PPE removed over time. In DeepStream, most of this is nvdsanalytics configuration.
2. Pose estimation (YOLOv11-pose): fall detection, climbing, reaching into hazard zones, person down and not moving.
3. Trained action-recognition models (SlowFast, X3D): needed for actions like fighting or improper lifting. Requires training data, skipped for now.
4. VLM as second-stage analyst: when rules flag something ambiguous, the blurred snapshot goes to a vision-language model that describes what the person is doing. The Jetson is the tripwire; the VLM is the analyst who looks at what the tripwire caught.

### What about hazards like fire and smoke?

Same tripwire pattern: trained fire and smoke classes in the detector, new rows in the rules table. The catch is that camera-based fire detection is false-positive prone (sunsets, steam, welding sparks), which makes the VLM second opinion load-bearing rather than optional on these classes. Critical hazards use alert_mode: immediate so notification does not wait for the review queue.

### Why is the decision layer a rules table and not an LLM?

1. Same input, same output. LLMs cannot promise that; a rules table returns the identical verdict every time.
2. Auditability. "Rule R-001 fired: class=person, helmet=false, zone=crane_area" is a complete, inspectable explanation. An LLM's conclusion is not an audit trail.
3. Testability. Fifty unit tests prove the judge correct. Testing an LLM judge means statistical evaluation that every prompt tweak invalidates.
4. Hallucinated citations. LLMs invent plausible-looking regulation numbers. In the rules table, citations are hand-verified data, not generation.
5. Cost, latency, availability. A lookup is free, instant, and works offline. An LLM call is slow, costs money, and needs the network.

Short version: the LLM writes the report about the verdict; it never renders the verdict.

A judge rule looks like this:

```python
{
    "id": "R-001",
    "when": {"class": "person", "helmet": False},
    "zone_in": ["crane_area", "construction_zone"],
    "min_confidence": 0.75,
    "verdict": {
        "violation": True,
        "citation": "OSHA 1926.100(a)",
        "severity": "high",
        "remediation": "Worker must don head protection before re-entering zone.",
    },
}
```

When the rule set grows beyond hand-writing (thousands of clauses across OSHA, NFPA, ISO), the upgrade path is LLM-assisted rule authoring: offline, the LLM plus RAG drafts candidate rules from regulation text, a human expert approves each one, and approved rules join the deterministic table. The LLM helps write the law book; it never sits on the bench at runtime.

---

## Current MVP (Hackathon Scope)

Primary demo: the web inspection app end to end.

- Take or upload a photo of a fire exit, extinguisher, or electrical panel from the browser
- VLM classifies the asset and fills the structured checklist
- Deterministic rules table renders the verdict with the OSHA/NFPA citation
- RAG-grounded, LLM-written report with corrective action, shown in the browser
- Backend face blur before any image is stored
- Reviewer dashboard for escalated (unclear) cases
- Natural-language Q&A over inspection history and regulations

Secondary, as time permits: the fixed-camera path.

- Jetson Orin + DeepStream ingesting one or more cameras: nvstreammux, nvinfer with YOLOv11 (TensorRT), nvtracker, nvdsanalytics, nvmsgbroker to MQTT
- Helmet and PPE detection with confidence gating, feeding the same backend
- Fallback if DeepStream integration stalls: plain Ultralytics YOLOv11 on one camera, same event JSON

Stretch goals:

- Man-down detection via pose rules (side pipeline on one camera)
- Fire/smoke detection with VLM second opinion
- End-of-shift summaries
- Annotated live RTSP output for the demo

---

## Future Work

- Pose estimation inside the batched DeepStream pipeline (custom keypoint parser) instead of a side pipeline
- Trained action recognition (SlowFast, X3D) for behaviors geometry and pose rules cannot express
- RAG at full depth: expand from OSHA to NFPA 70E, ISO 61511, ISA 62443 and international frameworks
- Native mobile app with on-device face blur and offline inspection queue
- Per-asset compliance history with optional QR/NFC tags as a convenience for asset selection
- Scheduled automatic inspections: fixed cameras photograph registered assets on a timer and run the same checklist pipeline
- Fleet scale-out to many sites and devices, where MQTT fan-out and a proper broker pay for themselves
- On-device VLM so even snapshot interpretation never leaves the premises
- Uncertainty quantification: calibrated confidence instead of a raw threshold
- Governance dashboard: audit trails, reviewer-decision analytics, model-drift monitoring
- Federated learning to improve models across sites without pooling video data
- LLM-assisted rule authoring with human approval

---

## Technology Stack

| Category | Technologies |
|-----------|--------------|
| Programming | Python |
| Backend | FastAPI |
| Frontend | React + Vite (inspection app and dashboard) |
| Video Pipeline | NVIDIA DeepStream (nvstreammux, nvinfer, nvtracker, nvdsanalytics, nvmsgbroker) |
| Computer Vision | YOLOv11, YOLOv11-pose, OpenCV |
| Deep Learning | PyTorch, TensorRT |
| Edge Computing | NVIDIA Jetson Orin |
| LLM / VLM | Claude / GPT / Llama |
| Retrieval | LangChain + FAISS |
| Messaging | MQTT (Mosquitto) for the Jetson path, HTTPS for the web app |
| Database | PostgreSQL |
| Deployment | Docker |
| Cloud | AWS |
| Monitoring | Prometheus |

---

## Applications

- Construction Sites
- Hospitals
- Airports
- Industrial Plants
- Manufacturing
- Warehouses
- Data Centers
- Laboratories

---

## Project Status

Active development. Hackathon MVP in progress, see Current MVP above.

---

## License

MIT License
