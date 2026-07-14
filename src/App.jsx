// App.jsx
import { useEffect, useRef, useState } from "react";
import {
  ShieldAlert, Eye, EyeOff, Cpu, HardDrive, AlertTriangle, CheckCircle2,
  AlertCircle, HardHat, Server, Utensils, Activity, Route, FileText,
  BellRing, BrainCircuit, Wifi, Inbox, ShieldCheck, Check, Clock, Loader,
  Flame, Crosshair, Swords, TreePine, Car, Shield, Zap
} from "lucide-react";
import "./serenix.css";
import monitorMain from "./assets/target-data/monitor-main.jpg";
import monitorFeed1 from "./assets/target-data/monitor-feed-1.jpg";
import monitorFeed2 from "./assets/target-data/monitor-feed-2.jpg";
import monitorFeed3 from "./assets/target-data/monitor-feed-3.jpg";
import monitorFeed4 from "./assets/target-data/monitor-feed-4.jpg";
import monitorFeed5 from "./assets/target-data/monitor-feed-5.jpg";
import monitorFeed6 from "./assets/target-data/monitor-feed-6.jpg";

/* ── TARGET DATA IMAGES ── */
const targetImageList = [
  monitorMain,
  monitorFeed1,
  monitorFeed2,
  monitorFeed3,
  monitorFeed4,
  monitorFeed5,
  monitorFeed6,
];

const shuffledTargetImages = [...targetImageList].sort(() => Math.random() - 0.5);
const heroMonitoringImages = shuffledTargetImages.slice(0, 3);

/* ── CAMERA DATA ── */
const cameraImageMap = {
  "01": monitorMain,
  "02": monitorFeed1,
  "03": monitorFeed2,
  "04": monitorFeed3,
  "05": monitorFeed5,
  "06": monitorFeed5,
  "07": monitorFeed6,
};

const CAMERAS = [
  {
    id: "01", label: "CONSTRUCT-A", seedImg: "sentry-construct",
    latency: 14, standards: "NFPA 70E", comply: 78, alertColor: "danger",
    alertText: "1 SEV-2", objCount: "2 OBJ · 1 ALERT", category: "ppe",
    detections: [
      { cls: "safe", top: 28, left: 18, w: 11, h: 22, label: "HELMET · 0.98" },
      { cls: "danger", top: 34, left: 54, w: 13, h: 28, label: "NO HELMET · 0.94" },
    ],
    blurs: [{ top: 23, left: 19, w: 9, h: 6 }, { top: 29, left: 55, w: 11, h: 7 }],
  },
  {
    id: "02", label: "DC-B / AISLE 3", seedImg: "sentry-datacenter",
    latency: 12, standards: "NFPA 70E · ISA 62443", comply: 96, alertColor: "safe",
    alertText: "COMPLIANT", objCount: "2 OBJ · 0 ALERT", category: "ppe",
    detections: [
      { cls: "safe", top: 30, left: 24, w: 14, h: 30, label: "ARC SUIT · 0.96" },
      { cls: "safe", top: 32, left: 60, w: 12, h: 26, label: "HELMET · 0.97" },
    ],
    blurs: [{ top: 25, left: 25, w: 12, h: 7 }, { top: 27, left: 61, w: 10, h: 6 }],
  },
  {
    id: "03", label: "KITCHEN-C", seedImg: "sentry-kitchen",
    latency: 15, standards: "NFPA 101 · FDA", comply: 88, alertColor: "warn",
    alertText: "1 SEV-3", objCount: "2 OBJ · 1 WARN", category: "ppe",
    detections: [
      { cls: "warning", top: 22, left: 38, w: 18, h: 12, label: "EXIT BLOCKED · 0.91" },
      { cls: "safe", top: 50, left: 14, w: 10, h: 22, label: "EXTINGUISHER · 0.99" },
    ],
    blurs: [{ top: 42, left: 30, w: 8, h: 6 }],
  },
  {
    id: "04", label: "HOSP-D / ICU", seedImg: "sentry-hospital",
    latency: 13, standards: "OSHA · CDC", comply: 92, alertColor: "safe",
    alertText: "COMPLIANT", objCount: "2 OBJ · 0 ALERT", category: "ppe",
    detections: [
      { cls: "safe", top: 26, left: 20, w: 12, h: 28, label: "GLOVES · 0.95" },
      { cls: "safe", top: 30, left: 56, w: 14, h: 30, label: "MASK · 0.93" },
    ],
    blurs: [{ top: 21, left: 22, w: 8, h: 6 }, { top: 25, left: 58, w: 10, h: 7 }],
  },
  // Wildfire Smoke Detection — Roboflow Wildfire Smoke Dataset
  // https://public.roboflow.com/object-detection/wildfire-smoke
  {
    id: "05", label: "FOREST-E / RIDGELINE", seedImg: "wildfire-smoke-ridge",
    latency: 18, standards: "NFPA 1142 · NWCG", comply: 42, alertColor: "danger",
    alertText: "SMOKE ALERT", objCount: "3 OBJ · 1 CRITICAL", category: "smoke",
    detections: [
      { cls: "smoke", top: 8, left: 20, w: 45, h: 35, label: "SMOKE PLUME · 0.96" },
      { cls: "smoke", top: 15, left: 55, w: 25, h: 20, label: "SMOKE DRIFT · 0.89" },
      { cls: "smoke", top: 38, left: 10, w: 15, h: 12, label: "GROUND HAZE · 0.82" },
    ],
    blurs: [],
  },
  // Weapon / Pistol Detection — Roboflow Pistols Dataset
  // https://public.roboflow.com/object-detection/pistols
  {
    id: "06", label: "LOBBY-F / MAIN ENTRY", seedImg: "security-lobby-weapon",
    latency: 11, standards: "GFZA · SITE-SEC-001", comply: 0, alertColor: "danger",
    alertText: "WEAPON DETECTED", objCount: "2 OBJ · 1 CRITICAL", category: "weapon",
    detections: [
      { cls: "weapon", top: 35, left: 42, w: 8, h: 14, label: "PISTOL · 0.97" },
      { cls: "safe", top: 28, left: 38, w: 14, h: 32, label: "PERSON · 0.95" },
    ],
    blurs: [{ top: 25, left: 39, w: 10, h: 7 }],
  },
  // Violence / Fighting Detection — Real Life Violence Situations Dataset
  // https://www.kaggle.com/datasets/mohamedmustafa/real-life-violence-situations-dataset
  {
    id: "07", label: "PARKING-G / LEVEL B2", seedImg: "parking-lot-violence",
    latency: 16, standards: "OSHA 5148 · WPV PLAN", comply: 0, alertColor: "danger",
    alertText: "VIOLENCE ALERT", objCount: "3 OBJ · 1 CRITICAL", category: "violence",
    detections: [
      { cls: "violence", top: 25, left: 30, w: 28, h: 35, label: "PHYSICAL ALTERCATION · 0.94" },
      { cls: "safe", top: 26, left: 32, w: 12, h: 28, label: "PERSON-1 · 0.93" },
      { cls: "safe", top: 28, left: 48, w: 11, h: 26, label: "PERSON-2 · 0.91" },
    ],
    blurs: [{ top: 23, left: 33, w: 9, h: 6 }, { top: 25, left: 49, w: 8, h: 6 }],
  },
];

/* ── FACILITY DATA ── */
const FACILITIES = [
  { name: "CONSTRUCT-A", icon: HardHat, comply: 78, color: "danger", status: "1 OPEN · SEV-2", category: "ppe" },
  { name: "DC-B", icon: Server, comply: 96, color: "safe", status: "0 OPEN · CLEAN", category: "ppe" },
  { name: "KITCHEN-C", icon: Utensils, comply: 88, color: "warn", status: "1 OPEN · SEV-3", category: "ppe" },
  { name: "HOSP-D", icon: Activity, comply: 92, color: "safe", status: "0 OPEN · CLEAN", category: "ppe" },
  { name: "FOREST-E", icon: TreePine, comply: 42, color: "smoke", status: "SMOKE ACTIVE · SEV-1", category: "smoke" },
  { name: "LOBBY-F", icon: Shield, comply: 0, color: "weapon", status: "WEAPON · LOCKDOWN", category: "weapon" },
  { name: "PARKING-G", icon: Car, comply: 0, color: "violence", status: "VIOLENCE · DISPATCHED", category: "violence" },
];

const DATASETS = [
  {
    id: "smoke",
    name: "Wildfire Smoke Detection",
    category: "object",
    source: "Roboflow",
    sourceUrl: "https://public.roboflow.com/object-detection/wildfire-smoke",
    badge: "Object Detection",
    desc: "Aerial and ground-level wildfire smoke images for early detection, with bounding boxes around smoke plumes in challenging terrain.",
    format: "YOLOv8 / COCO",
    size: "~2.4 GB",
    images: "~6,800",
    classes: "1 (smoke)",
    progress: 85,
    progressColor: "var(--smoke)",
  },
  {
    id: "weapons",
    name: "Pistols / Weapon Detection",
    category: "object",
    source: "Roboflow",
    sourceUrl: "https://public.roboflow.com/object-detection/pistols",
    badge: "Object Detection",
    desc: "Pistol and handgun detection in real-world surveillance scenes, crowds, and checkpoint areas.",
    format: "YOLOv8 / VOC / COCO",
    size: "~850 MB",
    images: "~4,200",
    classes: "1 (pistol)",
    progress: 75,
    progressColor: "var(--weapon)",
  },
  {
    id: "fall",
    name: "UR Fall Detection Dataset",
    category: "video",
    source: "UR Rzeszow",
    sourceUrl: "http://fenix.univ.rzeszow.pl/~mkepski/ds/uf.html",
    badge: "Video Classification",
    desc: "Ceiling-camera fall videos with ADL sequences and depth data for robust fall detection training.",
    format: "Raw Video + Depth",
    size: "~18 GB",
    images: "~70 videos + depth maps",
    classes: "2 (fall, no_fall)",
    progress: 60,
    progressColor: "var(--warn)",
  },
  {
    id: "violence",
    name: "Real-Life Violence Situations",
    category: "video",
    source: "Kaggle",
    sourceUrl: "https://www.kaggle.com/datasets/mohamedmustafa/real-life-violence-situations-dataset",
    badge: "Video Classification",
    desc: "CCTV footage of violent and non-violent situations, ideal for surveillance violence detection.",
    format: "MP4 Videos",
    size: "~2.5 GB",
    images: "~2,000 videos",
    classes: "2 (Violence, NonViolence)",
    progress: 70,
    progressColor: "var(--violence)",
  },
  {
    id: "ucfcrime",
    name: "UCF-Crime Anomaly Detection",
    category: "anomaly",
    source: "UCF CRCV",
    sourceUrl: "https://www.crcv.ucf.edu/projects/real-world/",
    badge: "Anomaly Detection",
    desc: "Large-scale surveillance dataset with 13 anomaly categories plus normal events.",
    format: "Videos + Temporal Annotations",
    size: "~180 GB",
    images: "~1,900 videos",
    classes: "13 anomaly + Normal",
    progress: 45,
    progressColor: "var(--info)",
  },
  {
    id: "ucf101",
    name: "UCF101 Action Recognition",
    category: "video",
    source: "UCF CRCV",
    sourceUrl: "https://www.crcv.ucf.edu/data/UCF101.php",
    badge: "Action Recognition",
    desc: "101 action classes in realistic settings, a benchmark dataset for human activity recognition.",
    format: "AVI Videos + Splits",
    size: "~6.5 GB",
    images: "~13,320 clips",
    classes: "101 action classes",
    progress: 55,
    progressColor: "var(--accent-secondary)",
  },
  {
    id: "ppe",
    name: "PPE Detection (Helmet, Vest, Gloves)",
    category: "safety",
    source: "Roboflow",
    sourceUrl: "https://universe.roboflow.com/search?q=PPE",
    badge: "Object Detection",
    desc: "Helmets, vests, gloves, goggles and boots detection for construction and industrial safety monitoring.",
    format: "YOLOv8 / COCO",
    size: "~5 GB",
    images: "~15,000+",
    classes: "5+ (Helmet, Vest, Gloves, Goggles, Boots)",
    progress: 65,
    progressColor: "var(--safe)",
  },
  {
    id: "fire",
    name: "Fire Detection Dataset",
    category: "object",
    source: "Roboflow Universe",
    sourceUrl: "https://universe.roboflow.com/search?q=fire+detection",
    badge: "Object Detection",
    desc: "Indoor and outdoor fire datasets covering flames, smoke and unusual ignition sources.",
    format: "YOLOv8 / COCO",
    size: "~3 GB",
    images: "~10,000+",
    classes: "2+ (fire, smoke)",
    progress: 50,
    progressColor: "var(--danger)",
  },
];

/* ── VIOLATION DATA ── */
const VIOLATIONS = [
  {
    id: "INC-2024-0745", sev: "smoke-sev", sevLabel: "SMOKE-1",
    title: "Wildfire smoke plume detected",
    cam: "CAM-05 · FOREST-E · ridgeline-north", time: "14:31:42Z",
    standards: ["NFPA 1142 §4.1", "NWCG PMS 417"],
    status: "FIRE DISPATCH · EN ROUTE", statusColor: "danger",
    category: "smoke", borderClass: "smoke",
    rootCause: "Large smoke plume on ridgeline-north, drifting SE at ~8 kts. Likely ignition 1.2km NW in untreated fuel bed. Humidity 14%, wind gusting 15 mph — extreme fire weather."
  },
  {
    id: "INC-2024-0744", sev: "weapon-sev", sevLabel: "WEAPS-1",
    title: "Pistol detected in main lobby",
    cam: "CAM-06 · LOBBY-F · main entrance", time: "14:28:19Z",
    standards: ["GFZA §922(q)", "SITE-SEC-001 §3.1"],
    status: "LOCKDOWN · ARMED RESPOND", statusColor: "danger",
    category: "weapon", borderClass: "weapon",
    rootCause: "Handgun detected in subject's right hand near main entry turnstile. Subject not authorized. Security notified, building lockdown initiated, armed response dispatched."
  },
  {
    id: "INC-2024-0743", sev: "violence-sev", sevLabel: "VIOL-1",
    title: "Physical altercation in parking structure",
    cam: "CAM-07 · PARKING-G · level B2", time: "14:25:53Z",
    standards: ["OSHA 5148", "WPV Plan §6.2"],
    status: "SECURITY DISPATCHED", statusColor: "danger",
    category: "violence", borderClass: "violence",
    rootCause: "Two subjects engaged in physical altercation near pillar B2-14. Subject-1 initiating strikes. Classification: active physical violence. Civilians at risk within 15m radius."
  },
  {
    id: "INC-2024-0741", sev: "sev2", sevLabel: "SEV-2",
    title: "Missing head protection",
    cam: "CAM-01 · CONSTRUCT-A · zone A-7", time: "14:23:07Z",
    standards: ["NFPA 70E §130.7", "OSHA 1926.100", "SOP-DC-2401 §4.2"],
    status: "AGENT INVESTIGATING", statusColor: "accent",
    category: "ppe", borderClass: "warn",
    rootCause: "Worker entered zone A-7 (active crane area) without class-E hard hat. Hat last logged at station B-3 11m ago."
  },
  {
    id: "INC-2024-0740", sev: "sev1", sevLabel: "SEV-1",
    title: "Arc flash suit absent during CST",
    cam: "CAM-02 · DC-B · switchgear-3", time: "14:18:52Z",
    standards: ["NFPA 70E §130.7(C)", "OSHA 1910.269"],
    status: "ESCALATED · SEV-1", statusColor: "danger",
    category: "ppe", borderClass: "",
    rootCause: "Critical switching task initiated on switchgear-3 without category-4 PPE. Suit present in locker L-7 but not donned."
  },
  {
    id: "INC-2024-0739", sev: "sev3", sevLabel: "SEV-3",
    title: "Fire exit partially obstructed",
    cam: "CAM-03 · KITCHEN-C · exit-E2", time: "14:11:30Z",
    standards: ["NFPA 101 §7.1", "OSHA 1910.37"],
    status: "REMEDIATION QUEUED", statusColor: "warn",
    category: "ppe", borderClass: "info",
    rootCause: "Exit E2 obstructed by delivery cart. Cart placed 09:14, exit last cleared 08:50."
  },
  {
    id: "INC-2024-0738", sev: "sev2", sevLabel: "SEV-2",
    title: "No gloves during chemical handling",
    cam: "CAM-04 · HOSP-D · lab-2", time: "13:54:18Z",
    standards: ["OSHA 1910.1030", "CDC PPE Protocol"],
    status: "RESOLVED · 4m ago", statusColor: "safe",
    category: "ppe", borderClass: "",
    rootCause: "Lab technician handled reagents without nitrile gloves. Gloves available at station 2m away."
  },
  {
    id: "INC-2024-0737", sev: "sev3", sevLabel: "SEV-3",
    title: "Improper footwear in server aisle",
    cam: "CAM-02 · DC-B · aisle-1", time: "13:32:04Z",
    standards: ["NFPA 70E §130.7(C)(4)"],
    status: "RESOLVED · 51m ago", statusColor: "safe",
    category: "ppe", borderClass: "",
    rootCause: "Open footwear detected in aisle-1. Steel-toe requirement per NFPA 70E."
  },
];

/* ── REASONING SCENARIOS ── */
const REASONING_SCENARIOS = [
  // Smoke detection
  [
    { t: "ALERT RECEIVED: smoke_plume @ CAM-05 / ridgeline-north", c: "var(--smoke)" },
    { t: "SEV-1 TRIGGER · WILDFIRE SMOKE DETECTED", c: "var(--danger)" },
    { t: "EDGE MODEL: yolov8n-smoke · confidence 0.96", c: "var(--muted)" },
    { t: "DATASET: Roboflow Wildfire Smoke · 1,847 training images", c: "var(--info)" },
    { t: "  https://public.roboflow.com/object-detection/wildfire-smoke", c: "var(--muted)" },
    { t: "INITIATING RAG RETRIEVAL · STANDARDS STORE", c: "var(--muted)" },
    { t: "[PDF] NFPA_1142_2024.pdf · §4.1 Wildfire Assessment", c: "var(--info)" },
    { t: "[PDF] NWCG_PMS_417.pdf · Fire Weather Criteria", c: "var(--info)" },
    { t: "[DOC] SITE_FIRE_PLAN_2024.pdf · §8 Evacuation Zones", c: "var(--info)" },
    { t: "CLAUSE MATCH · 0.96 confidence · 4 clauses retrieved", c: "var(--muted)" },
    { t: "VIOLATION CONFIRMED · SMOKE-1 · AUTOMATIC FIRE DISPATCH", c: "var(--smoke)" },
    { t: "WEATHER: humidity 14% · wind NW 15mph · RED FLAG", c: "var(--danger)" },
    { t: "GENERATING PATH-TO-GREEN...", c: "var(--muted)" },
    { t: "STEP 1 · ACTIVATE fire dispatch · Forest Service + local FD", c: "var(--accent)" },
    { t: "STEP 2 · INITIATE evacuation zone E-3 (0.5km radius)", c: "var(--accent)" },
    { t: "STEP 3 · ALERT all facilities downwind (DC-B, HOSP-D)", c: "var(--accent)" },
    { t: "STEP 4 · DEPLOY drone for thermal confirmation", c: "var(--accent)" },
    { t: "STEP 5 · CONTINUOUS monitoring via CAM-05 + CAM-08", c: "var(--accent)" },
    { t: "DISPATCHED · fire@dispatch · sheriff@county · site-lead", c: "var(--safe)" },
    { t: "── COMPLETE · 2.1s · tokens: 1,047 ──", c: "var(--muted)" },
  ],
  // Weapon detection
  [
    { t: "ALERT RECEIVED: pistol_detected @ CAM-06 / main-entrance", c: "var(--weapon)" },
    { t: "SEV-1 TRIGGER · FIREARM IN GUN-FREE ZONE", c: "var(--danger)" },
    { t: "EDGE MODEL: yolov8n-weapon · confidence 0.97", c: "var(--muted)" },
    { t: "DATASET: Roboflow Pistols · 2,314 training images", c: "var(--info)" },
    { t: "  https://public.roboflow.com/object-detection/pistols", c: "var(--muted)" },
    { t: "SECONDARY: pose estimation confirms hand-held object", c: "var(--muted)" },
    { t: "INITIATING RAG RETRIEVAL · STANDARDS STORE", c: "var(--muted)" },
    { t: "[PDF] GFZA_18USC922q.pdf · §922(q) Gun-Free School Zones", c: "var(--info)" },
    { t: "[PDF] SITE_SEC_001.pdf · §3.1 Prohibited Items Protocol", c: "var(--info)" },
    { t: "[DOC] ACTIVE_THREAT_PLAN.pdf · §2 Lockdown Procedure", c: "var(--info)" },
    { t: "CLAUSE MATCH · 0.98 confidence · 5 clauses retrieved", c: "var(--muted)" },
    { t: "VIOLATION CONFIRMED · WEAPS-1 · LOCKDOWN INITIATED", c: "var(--weapon)" },
    { t: "ESCALATION: security → law-enforcement (911 dispatched)", c: "var(--danger)" },
    { t: "GENERATING PATH-TO-GREEN...", c: "var(--muted)" },
    { t: "STEP 1 · LOCKDOWN all entry points · magnetic locks ENGAGED", c: "var(--accent)" },
    { t: "STEP 2 · ARMED security respond to lobby-F · ETA 45s", c: "var(--accent)" },
    { t: "STEP 3 · CIVILIAN shelter-in-place broadcast on PA", c: "var(--accent)" },
    { t: "STEP 4 · LAW ENFORCEMENT handoff on arrival", c: "var(--accent)" },
    { t: "STEP 5 · POST-INCIDENT: forensic frame export · evidence", c: "var(--accent)" },
    { t: "DISPATCHED · 911 · security-lead · facility-mgr · legal", c: "var(--safe)" },
    { t: "── COMPLETE · 1.6s · tokens: 932 ──", c: "var(--muted)" },
  ],
  // Violence detection
  [
    { t: "ALERT RECEIVED: physical_altercation @ CAM-07 / level-B2", c: "var(--violence)" },
    { t: "SEV-1 TRIGGER · ACTIVE VIOLENCE IN PROGRESS", c: "var(--danger)" },
    { t: "EDGE MODEL: yolov8s-violence · confidence 0.94", c: "var(--muted)" },
    { t: "DATASET: Kaggle Real-Life Violence · 2,000 video clips", c: "var(--info)" },
    { t: "  kaggle.com/datasets/mohamedmustafa/real-life-violence-situations-dataset", c: "var(--muted)" },
    { t: "TEMPORAL ANALYSIS: 12-frame window · action sustained", c: "var(--muted)" },
    { t: "INITIATING RAG RETRIEVAL · STANDARDS STORE", c: "var(--muted)" },
    { t: "[PDF] OSHA_5148.pdf · Guidelines on WPV Prevention", c: "var(--info)" },
    { t: "[PDF] SITE_WPV_PLAN.pdf · §6.2 Response Protocol", c: "var(--info)" },
    { t: "[DOC] SECURITY_SOP_007.pdf · De-escalation & Dispatch", c: "var(--info)" },
    { t: "CLAUSE MATCH · 0.92 confidence · 4 clauses retrieved", c: "var(--muted)" },
    { t: "VIOLATION CONFIRMED · VIOL-1 · SECURITY DISPATCHED", c: "var(--violence)" },
    { t: "NEARBY CIVILIANS: 3 detected within 15m · alert sent", c: "var(--warn)" },
    { t: "GENERATING PATH-TO-GREEN...", c: "var(--muted)" },
    { t: "STEP 1 · DISPATCH security team to parking-G level B2", c: "var(--accent)" },
    { t: "STEP 2 · ACTIVATE overhead lighting · full lumens on B2", c: "var(--accent)" },
    { t: "STEP 3 · PA announcement: 'security responding to B2'", c: "var(--accent)" },
    { t: "STEP 4 · ISOLATE B2 ramp access · prevent escalation path", c: "var(--accent)" },
    { t: "STEP 5 · MEDICAL standby if injuries observed", c: "var(--accent)" },
    { t: "STEP 6 · POST-INCIDENT: 60s clip export · HR notification", c: "var(--accent)" },
    { t: "DISPATCHED · security@parking · medical-standby · HR", c: "var(--safe)" },
    { t: "── COMPLETE · 1.9s · tokens: 1,108 ──", c: "var(--muted)" },
  ],
  // PPE — helmet missing
  [
    { t: "ALERT RECEIVED: helmet_missing @ CAM-01 / zone A-7", c: "var(--danger)" },
    { t: "INITIATING RAG RETRIEVAL · STANDARDS STORE", c: "var(--muted)" },
    { t: "[PDF] NFPA_70E_2024.pdf · §130.7(C)(1) Head Protection", c: "var(--info)" },
    { t: "[PDF] OSHA_29CFR_1926.100.pdf · Head Protection Requirements", c: "var(--info)" },
    { t: "[PDF] SOP-DC-2401.pdf · §4.2 PPE Requirements", c: "var(--info)" },
    { t: "CLAUSE MATCH · 0.94 confidence · 3 clauses retrieved", c: "var(--muted)" },
    { t: "VIOLATION CONFIRMED · SEV-2", c: "var(--warn)" },
    { t: "GENERATING PATH-TO-GREEN...", c: "var(--muted)" },
    { t: "STEP 1 · HALT task in zone A-7 immediately", c: "var(--accent)" },
    { t: "STEP 2 · ISSUE class-E helmet from station B-3", c: "var(--accent)" },
    { t: "STEP 3 · REVERIFY compliance via CAM-01 before resumption", c: "var(--accent)" },
    { t: "STEP 4 · LOG incident to NFPA 70E §130.7 registry", c: "var(--accent)" },
    { t: "DISPATCHED to supervisor@construct-a · wrist device", c: "var(--safe)" },
    { t: "── COMPLETE · 1.8s · tokens: 847 ──", c: "var(--muted)" },
  ],
  // PPE — arc flash
  [
    { t: "ALERT RECEIVED: arc_suit_absent @ CAM-02 / switchgear-3", c: "var(--danger)" },
    { t: "SEV-1 TRIGGER · CRITICAL SWITCHING IN PROGRESS", c: "var(--danger)" },
    { t: "INITIATING RAG RETRIEVAL · STANDARDS STORE", c: "var(--muted)" },
    { t: "[PDF] NFPA_70E_2024.pdf · §130.7(C)(9) Arc Flash PPE", c: "var(--info)" },
    { t: "[PDF] OSHA_29CFR_1910.269.pdf · Electric Power Generation", c: "var(--info)" },
    { t: "[PDF] MOP-DC-3301.pdf · §7.1 Critical Switching Procedure", c: "var(--info)" },
    { t: "CLAUSE MATCH · 0.97 confidence · 5 clauses retrieved", c: "var(--muted)" },
    { t: "VIOLATION CONFIRMED · SEV-1 · TASK HALTED", c: "var(--danger)" },
    { t: "ESCALATION TREE: site-lead → regional-safety → ops-center", c: "var(--warn)" },
    { t: "GENERATING PATH-TO-GREEN...", c: "var(--muted)" },
    { t: "STEP 1 · HALT CST · lockout-tagout initiated", c: "var(--accent)" },
    { t: "STEP 2 · DON category-4 arc suit (locker L-7)", c: "var(--accent)" },
    { t: "STEP 3 · VERIFY suit integrity via CAM-02", c: "var(--accent)" },
    { t: "STEP 4 · RESTART CST with safety witness present", c: "var(--accent)" },
    { t: "DISPATCHED · 3 recipients · page-level: critical", c: "var(--safe)" },
    { t: "── COMPLETE · 2.3s · tokens: 1,204 ──", c: "var(--muted)" },
  ],
];

/* ── STATIC TABS ── */
const STANDARDS_TAB = [
  { t: "STANDARDS STORE · 11 documents loaded", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "NFPA_70E_2024.pdf · 412 pages · indexed 1.2M tokens", c: "var(--info)" },
  { t: "OSHA_29CFR_1926.100.pdf · 47 pages · indexed 89K tokens", c: "var(--info)" },
  { t: "OSHA_29CFR_1910.269.pdf · 184 pages · indexed 410K tokens", c: "var(--info)" },
  { t: "NFPA_101_2024.pdf · 588 pages · indexed 1.6M tokens", c: "var(--info)" },
  { t: "ISA_62443_2024.pdf · 224 pages · indexed 580K tokens", c: "var(--info)" },
  { t: "NFPA_1142_2024.pdf · 96 pages · indexed 240K tokens", c: "var(--smoke)" },
  { t: "NWCG_PMS_417_2024.pdf · 134 pages · indexed 310K tokens", c: "var(--smoke)" },
  { t: "GFZA_18USC922q.pdf · 28 pages · indexed 52K tokens", c: "var(--weapon)" },
  { t: "OSHA_5148_2024.pdf · 64 pages · indexed 150K tokens", c: "var(--violence)" },
  { t: "", c: "var(--muted)" },
  { t: "EMBEDDING MODEL · text-embedding-3-large", c: "var(--muted)" },
  { t: "VECTOR STORE · pgvector · 5.1M rows", c: "var(--muted)" },
  { t: "AVG RETRIEVAL · 38ms · top-k=8", c: "var(--accent)" },
  { t: "LAST REINDEX · 2024-07-03 06:00 UTC", c: "var(--muted)" },
];

const DEVICES_TAB = [
  { t: "EDGE DEVICES · 7 connected", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "EDGE-PI-01 · Raspberry Pi 5 · CAM-01 · CONSTRUCT-A", c: "var(--info)" },
  { t: "  CPU 38% · RAM 1.2GB · TEMP 51°C · MODEL yolov8n-ppe", c: "var(--muted)" },
  { t: "  UPTIME 7d14h · QUEUE 0 · LAST SYNC 3s", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "EDGE-JET-02 · Jetson Nano · CAM-02 · DC-B", c: "var(--info)" },
  { t: "  CPU 62% · RAM 2.8GB · TEMP 58°C · MODEL yolov8n-ppe", c: "var(--muted)" },
  { t: "  UPTIME 7d14h · QUEUE 0 · LAST SYNC 2s", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "EDGE-PI-03 · Raspberry Pi 5 · CAM-03 · KITCHEN-C", c: "var(--info)" },
  { t: "  CPU 41% · RAM 1.1GB · TEMP 49°C · MODEL yolov8n-ppe", c: "var(--muted)" },
  { t: "  UPTIME 7d14h · QUEUE 2 · LAST SYNC 5s", c: "var(--warn)" },
  { t: "", c: "var(--muted)" },
  { t: "EDGE-PI-04 · Raspberry Pi 5 · CAM-04 · HOSP-D", c: "var(--info)" },
  { t: "  CPU 35% · RAM 1.0GB · TEMP 47°C · MODEL yolov8n-ppe", c: "var(--muted)" },
  { t: "  UPTIME 7d14h · QUEUE 0 · LAST SYNC 4s", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "EDGE-JET-05 · Jetson Orin · CAM-05 · FOREST-E", c: "var(--smoke)" },
  { t: "  CPU 71% · RAM 4.2GB · TEMP 63°C · MODEL yolov8n-smoke", c: "var(--muted)" },
  { t: "  UPTIME 3d08h · QUEUE 1 · LAST SYNC 1s · SOLAR POWER", c: "var(--warn)" },
  { t: "", c: "var(--muted)" },
  { t: "EDGE-JET-06 · Jetson Orin · CAM-06 · LOBBY-F", c: "var(--weapon)" },
  { t: "  CPU 68% · RAM 3.8GB · TEMP 61°C · MODEL yolov8n-weapon", c: "var(--muted)" },
  { t: "  UPTIME 7d14h · QUEUE 0 · LAST SYNC 1s · PRIORITY FEED", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "EDGE-JET-07 · Jetson Orin · CAM-07 · PARKING-G", c: "var(--violence)" },
  { t: "  CPU 74% · RAM 4.5GB · TEMP 65°C · MODEL yolov8s-violence", c: "var(--muted)" },
  { t: "  UPTIME 5d22h · QUEUE 3 · LAST SYNC 2s · TEMPORAL ANALYSIS", c: "var(--warn)" },
];

const MODELS_TAB = [
  { t: "EDGE INFERENCE MODELS · 4 deployed", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "━━━ PPE COMPLIANCE ━━━", c: "var(--accent)" },
  { t: "  yolov8n-ppe · fine-tuned · 4 cameras", c: "var(--info)" },
  { t: "  Classes: helmet, arc_suit, gloves, mask, goggles, vest", c: "var(--muted)" },
  { t: "  mAP@0.5: 0.912 · Inference: 12ms (Pi5) · 8ms (Jetson)", c: "var(--muted)" },
  { t: "  Source: in-house labeled · 14,200 images · 6 classes", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "━━━ WILDFIRE SMOKE ━━━", c: "var(--smoke)" },
  { t: "  yolov8n-smoke · fine-tuned · 1 camera (CAM-05)", c: "var(--info)" },
  { t: "  Classes: smoke_plume, smoke_drift, ground_haze, ember", c: "var(--muted)" },
  { t: "  mAP@0.5: 0.887 · Inference: 18ms (Jetson Orin)", c: "var(--muted)" },
  { t: "  Source: Roboflow Wildfire Smoke Dataset · 1,847 images", c: "var(--smoke)" },
  { t: "  https://public.roboflow.com/object-detection/wildfire-smoke", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "━━━ WEAPON / PISTOL ━━━", c: "var(--weapon)" },
  { t: "  yolov8n-weapon · fine-tuned · 1 camera (CAM-06)", c: "var(--info)" },
  { t: "  Classes: pistol, rifle, knife, unknown_weapon", c: "var(--muted)" },
  { t: "  mAP@0.5: 0.934 · Inference: 11ms (Jetson Orin)", c: "var(--muted)" },
  { t: "  Source: Roboflow Pistols Dataset · 2,314 images", c: "var(--weapon)" },
  { t: "  https://public.roboflow.com/object-detection/pistols", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "━━━ VIOLENCE / FIGHTING ━━━", c: "var(--violence)" },
  { t: "  yolov8s-violence · fine-tuned · 1 camera (CAM-07)", c: "var(--info)" },
  { t: "  Classes: physical_altercation, pushing, striking, crowd_flee", c: "var(--muted)" },
  { t: "  mAP@0.5: 0.891 · Inference: 28ms (Jetson Orin) · temporal", c: "var(--muted)" },
  { t: "  Source: Kaggle Real-Life Violence Situations · 2,000 clips", c: "var(--violence)" },
  { t: "  kaggle.com/datasets/mohamedmustafa/real-life-violence-situations-dataset", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "TOTAL PARAMS: 28.6M · QUANTIZED: INT8 · FORMAT: TensorRT", c: "var(--accent)" },
];

/* ── PATH-TO-GREEN STEPS ── */
const PTG_STEPS = {
  "INC-2024-0745": [
    { state: "done", text: "Activate fire dispatch · Forest Service + local FD", meta: "DISPATCHED · 14:31:44Z · unit ETA 12min" },
    { state: "done", text: "Initiate evacuation zone E-3 (0.5km radius)", meta: "COMPLETE · PA broadcast · 14:32:01Z" },
    { state: "active", text: "Alert all facilities downwind (DC-B, HOSP-D)", meta: "IN PROGRESS · DC-B acknowledged · HOSP-D pending" },
    { state: "pending", text: "Deploy drone for thermal confirmation of ignition", meta: "SCHEDULED · drone-D1 prepping · ETA 4min" },
    { state: "pending", text: "Continuous monitoring via CAM-05 + CAM-08", meta: "SCHEDULED · auto-tracked until ALL-CLEAR" },
  ],
  "INC-2024-0744": [
    { state: "done", text: "Lockdown all entry points · magnetic locks engaged", meta: "COMPLETE · 14:28:21Z · all 6 access points sealed" },
    { state: "done", text: "Armed security respond to lobby-F", meta: "ON SCENE · 14:29:04Z · 2 officers positioned" },
    { state: "active", text: "Civilian shelter-in-place · PA broadcast", meta: "IN PROGRESS · floor-by-floor announcement" },
    { state: "pending", text: "Law enforcement handoff on arrival", meta: "SCHEDULED · PD ETA 3min · 911 active" },
    { state: "pending", text: "Post-incident: forensic frame export · evidence", meta: "SCHEDULED · auto-export on ALL-CLEAR" },
  ],
  "INC-2024-0743": [
    { state: "done", text: "Dispatch security team to parking-G level B2", meta: "DISPATCHED · 14:25:55Z · team of 3 en route" },
    { state: "done", text: "Activate overhead lighting · full lumens B2", meta: "COMPLETE · 14:26:02Z · all B2 fixtures at 100%" },
    { state: "active", text: "PA announcement · security responding to B2", meta: "IN PROGRESS · broadcast on loop · 30s interval" },
    { state: "pending", text: "Isolate B2 ramp access · prevent escalation", meta: "SCHEDULED · bollards lowering on approach" },
    { state: "pending", text: "Medical standby · post-incident injury assessment", meta: "SCHEDULED · EMS on standby · not yet dispatched" },
    { state: "pending", text: "Post-incident: 60s clip export · HR notification", meta: "SCHEDULED · auto-triggered on ALL-CLEAR" },
  ],
  "INC-2024-0741": [
    { state: "done", text: "Halt task in zone A-7", meta: "SYSTEM · auto-dispatched to supervisor wrist device · 14:23:09Z" },
    { state: "active", text: "Issue class-E helmet from station B-3", meta: "PENDING · worker acknowledgement required" },
    { state: "pending", text: "Reverify via CAM-01 before resumption", meta: "SCHEDULED · edge inference pass on resume" },
    { state: "pending", text: "Log incident to compliance registry", meta: "SCHEDULED · NFPA 70E §130.7(C) registry entry" },
  ],
};
const DEFAULT_STEPS = PTG_STEPS["INC-2024-0741"];

/* ── HELPERS ── */
function pad(n) { return n.toString().padStart(2, "0"); }

function useClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ── SPARKLINE ── */
function Sparkline({ color }) {
  const [bars, setBars] = useState(() =>
    Array.from({ length: 20 }, () => 4 + Math.random() * 12)
  );
  useEffect(() => {
    const id = setInterval(() => {
      setBars(Array.from({ length: 20 }, () => 4 + Math.random() * 12));
    }, 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="spark">
      {bars.map((h, i) => (
        <div
          key={i}
          className="spark-bar"
          style={{ height: `${h}px`, background: color || "var(--accent)", opacity: 0.35 }}
        />
      ))}
    </div>
  );
}

function ImageDiffPanel() {
  const industryImages = [
    {
      id: "monitor-1",
      title: "Live monitoring feed",
      src: heroMonitoringImages[0] || targetImageList[0],
      description: "Real-time surveillance imagery showing active workspace monitoring and hazard awareness.",
      focus: ["Live coverage", "Asset visibility", "Event tracking"],
    },
    {
      id: "monitor-2",
      title: "Site perimeter view",
      src: heroMonitoringImages[1] || targetImageList[1],
      description: "Operational overview of the monitored zone with clear situational awareness.",
      focus: ["Perimeter awareness", "Entry checkpoints", "Safety oversight"],
    },
    {
      id: "monitor-3",
      title: "Monitoring zone overview",
      src: heroMonitoringImages[2] || targetImageList[2],
      description: "A broad monitoring scene for continuous site inspection and response support.",
      focus: ["Area coverage", "Alert review", "Response readiness"],
    },
  ];

  const [selectedImage, setSelectedImage] = useState(industryImages[0]);
  const [analysis, setAnalysis] = useState(null);

  const analyzeImage = (image) => {
    if (image.id === "datacenter") {
      return {
        summary: "Data center operations appear orderly with strong rack access visibility, but cable management and cooling clearances need coded verification.",
        issues: [
          "Review NFPA 75 cable pathway separation.",
          "Confirm UL-listed server rack grounding and bonding.",
          "Validate aisle clearance meets NEC 110.26 requirements.",
        ],
        codes: ["NFPA 75", "NFPA 70 (NEC) 110.26", "IEEE 1100"],
        recommendation: "Inspect rack power distribution units, labeled cable trays, and emergency exit signage.",
      };
    }
    if (image.id === "manufacturing") {
      return {
        summary: "Manufacturing floor shows automated machinery and work cells, with critical hazard zones requiring PPE and lockout/tagout verification.",
        issues: [
          "Confirm OSHA machine guarding around robotic arms.",
          "Verify ANSI Z535 safety signage for moving equipment.",
          "Check emergency stop access and route clearance.",
        ],
        codes: ["OSHA 1910.212", "ANSI Z535", "NFPA 70E"],
        recommendation: "Audit protective barriers, visible warning labels, and worker PPE enforcement at each cell.",
      };
    }
    return {
      summary: "Assembly area appears functional, but overhead service units and floor markings require code-specific review.",
      issues: [
        "Evaluate floor striping for pedestrian and equipment zones.",
        "Confirm emergency signage is unobstructed.",
        "Review overhead conduit support and fire protection clearances.",
      ],
      codes: ["OSHA 1910.22", "NFPA 70", "NFPA 101"],
      recommendation: "Walk the zone to verify visual controls and emergency access paths against the applicable standard list.",
    };
  };

  useEffect(() => {
    setAnalysis(analyzeImage(selectedImage));
  }, [selectedImage]);

  return (
    <div className="image-diff-panel lift">
      <div className="image-diff-header">
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>MONITORING HERO VIEW</div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>Monitoring Area Analysis with Live Site Awareness</div>
        </div>
        <span className="image-diff-status">MONITOR</span>
      </div>
      <div className="image-diff-grid">
        {industryImages.map((image) => (
          <div
            key={image.id}
            className={`image-diff-card ${selectedImage.id === image.id ? "selected" : ""}`}
            onClick={() => setSelectedImage(image)}
          >
            <img src={image.src} alt={image.title} />
            <div className="image-diff-label">
              <span>{image.title}</span>
              <span className="image-diff-tag">MONITORING</span>
            </div>
          </div>
        ))}
      </div>
      <div className="analysis-panel">
        <div className="analysis-panel-header">
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>SELECTED AREA</div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>{selectedImage.title}</div>
          </div>
          <button className="btn active" onClick={() => setAnalysis(analyzeImage(selectedImage))}>RE-RUN CHECK</button>
        </div>
        <div style={{ fontSize: 10, color: "var(--fg)", lineHeight: 1.6, marginBottom: 10 }}>{selectedImage.description}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="analysis-card">
            <div className="analysis-card-title">Key findings</div>
            <ul>
              {analysis?.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
          <div className="analysis-card">
            <div className="analysis-card-title">Codes to verify</div>
            <div className="analysis-tags">
              {analysis?.codes.map((code) => (
                <span key={code} className="analysis-pill">{code}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="analysis-footer">
          <span>Recommendation</span>
          <p>{analysis?.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

function DatasetManager({ datasets }) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedId, setSelectedId] = useState(datasets[0]?.id || "");

  const filteredDatasets =
    activeTab === "all"
      ? datasets
      : datasets.filter((dataset) => dataset.category === activeTab);

  useEffect(() => {
    if (!filteredDatasets.some((dataset) => dataset.id === selectedId)) {
      setSelectedId(filteredDatasets[0]?.id || datasets[0]?.id || "");
    }
  }, [activeTab, filteredDatasets, selectedId, datasets]);

  const selectedDataset = datasets.find((dataset) => dataset.id === selectedId) || filteredDatasets[0] || datasets[0];

  return (
    <div className="dataset-manager lift">
      <div className="dataset-manager-header">
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>DATASET MANAGER</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Surveillance Dataset Definitions</div>
        </div>
        <span className="image-diff-status">CONNECTED</span>
      </div>

      <div className="dataset-manager-tabs">
        {[
          { key: "all", label: "All" },
          { key: "object", label: "Object" },
          { key: "video", label: "Video" },
          { key: "anomaly", label: "Anomaly" },
          { key: "safety", label: "Safety" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`dataset-manager-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dataset-manager-grid">
        {filteredDatasets.map((dataset) => (
          <div
            key={dataset.id}
            className={`dataset-card ${selectedId === dataset.id ? "selected" : ""}`}
            onClick={() => setSelectedId(dataset.id)}
          >
            <div className="dataset-card-header">
              <div>
                <div className="dataset-card-badge" style={{ background: `${dataset.progressColor}1a`, color: dataset.progressColor }}>
                  {dataset.badge}
                </div>
                <h3>{dataset.name}</h3>
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>{dataset.images}</div>
            </div>
            <div className="dataset-card-body">
              <div className="dataset-card-desc">{dataset.desc}</div>
              <div className="dataset-card-meta">
                <span>{dataset.format}</span>
                <span>{dataset.size}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDataset && (
        <div className="dataset-detail">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>SELECTED DATASET</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedDataset.name}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                {selectedDataset.source} · <a href={selectedDataset.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>{new URL(selectedDataset.sourceUrl).hostname}</a>
              </div>
            </div>
            <div style={{ minWidth: 120 }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>PROGRESS</div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${selectedDataset.progress}%`, background: selectedDataset.progressColor }} />
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 4 }}>
                {selectedDataset.progress}% prepared
              </div>
            </div>
          </div>

          <div className="dataset-detail-grid">
            <div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>CLASS LABELS</div>
              <div style={{ fontSize: 11 }}>{selectedDataset.classes}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>DATA SIZE</div>
              <div style={{ fontSize: 11 }}>{selectedDataset.size}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>FORMAT</div>
              <div style={{ fontSize: 11 }}>{selectedDataset.format}</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <button className="btn active">OPEN DATASET</button>
            <button className="btn">VIEW SOURCE</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── CAMERA CARD ── */
function CameraCard({ cam }) {
  const alertBgMap = {
    safe: { background: "var(--safe)", color: "#000" },
    warn: { background: "var(--warn)", color: "#000" },
    danger: { background: "var(--danger)", color: "white" },
  };
  const AlertIcon =
    cam.alertColor === "safe"
      ? CheckCircle2
      : cam.alertColor === "warn"
      ? AlertCircle
      : AlertTriangle;
  const catLabel = { ppe: "PPE", smoke: "SMOKE", weapon: "WEAPON", violence: "VIOLENCE" }[cam.category];
  const isCritical = cam.category !== "ppe" && cam.alertColor === "danger";
  const criticalColor =
    cam.category === "smoke"
      ? "var(--smoke)"
      : cam.category === "weapon"
      ? "var(--weapon)"
      : cam.category === "violence"
      ? "var(--violence)"
      : null;

  return (
    <div
      className="camera-card lift"
      style={isCritical ? { borderColor: criticalColor } : {}}
    >
      <div className="camera-feed scanlines grid-overlay vignette">
        <img src={cameraImageMap[cam.id] || targetImageList[0]} alt="" />
        <div
          className="scan-beam"
          style={{
            animationDelay: `${parseInt(cam.id) * 1.2}s`,
            ...(isCritical ? { background: `linear-gradient(90deg, transparent, ${criticalColor}, transparent)` } : {}),
          }}
        />
        {cam.detections.map((d, i) => (
          <div
            key={i}
            className={`detection ${d.cls}`}
            style={{ top: `${d.top}%`, left: `${d.left}%`, width: `${d.w}%`, height: `${d.h}%` }}
          >
            <span className="detection-label">{d.label}</span>
          </div>
        ))}
        {cam.blurs.map((b, i) => (
          <div
            key={i}
            className="blur-region"
            style={{ top: `${b.top}%`, left: `${b.left}%`, width: `${b.w}%`, height: `${b.h}%` }}
          />
        ))}
        {/* Top overlays */}
        <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", padding: "2px 8px", borderRadius: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, display: "flex", alignItems: "center", gap: 6 }}>
            <span className="rec-dot" />
            <span style={{ fontWeight: 700 }}>CAM-{cam.id}</span>
            <span style={{ color: "var(--muted)" }}>·</span>
            <span>{cam.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className={`cat-badge ${cam.category}`}>{catLabel}</span>
            <div style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", padding: "2px 8px", borderRadius: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--muted)" }}>1920×1080 · 30fps</div>
          </div>
        </div>
        {/* Bottom overlays */}
        <div style={{ position: "absolute", bottom: 8, left: 8, right: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-end", zIndex: 10 }}>
          <div style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", padding: "2px 8px", borderRadius: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>
            <span style={{ color: "var(--muted)" }}>EDGE</span>
            <span style={{ color: "var(--accent)", marginLeft: 4, fontWeight: 700 }}>{cam.latency}ms</span>
            <span style={{ color: "var(--muted)", margin: "0 4px" }}>·</span>
            <span style={{ color: "var(--muted)" }}>{cam.standards}</span>
          </div>
          <div style={{ padding: "2px 8px", borderRadius: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, ...alertBgMap[cam.alertColor] }}>
            <AlertIcon style={{ width: 12, height: 12 }} />
            {cam.alertText}
          </div>
        </div>
      </div>
      {/* Bottom bar */}
      <div style={{ padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface-2)", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>
          <span style={{ color: "var(--muted)" }}>COMPLY</span>
          <span
            className="live-num"
            style={{ color: criticalColor || `var(--${cam.alertColor})` }}
          >
            {cam.comply}%
          </span>
        </div>
        <div style={{ flex: 1, margin: "0 8px" }}>
          <div className="gauge-bar">
            <div
              className="gauge-fill"
              style={{
                width: `${cam.comply}%`,
                background: cam.category === "smoke"
                  ? "linear-gradient(90deg, var(--danger), var(--smoke))"
                  : cam.category === "weapon"
                  ? "linear-gradient(90deg, var(--weapon), var(--danger))"
                  : cam.category === "violence"
                  ? "linear-gradient(90deg, var(--violence), var(--danger))"
                  : cam.alertColor === "danger"
                  ? "linear-gradient(90deg, var(--danger), var(--warn))"
                  : cam.alertColor === "warn"
                  ? "linear-gradient(90deg, var(--warn), var(--accent))"
                  : "linear-gradient(90deg, var(--accent), var(--safe))",
              }}
            />
          </div>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--muted)" }}>
          {cam.objCount}
        </div>
      </div>
    </div>
  );
}

/* ── VIOLATION ENTRY ── */
function ViolationEntry({ v, selected, onClick }) {
  const statusIcon =
    v.statusColor === "safe" ? (
      <CheckCircle2 style={{ width: 12, height: 12, color: "var(--safe)" }} />
    ) : v.statusColor === "danger" ? (
      <AlertTriangle style={{ width: 12, height: 12, color: "var(--danger)" }} />
    ) : v.statusColor === "warn" ? (
      <Clock style={{ width: 12, height: 12, color: "var(--warn)" }} />
    ) : (
      <Loader style={{ width: 12, height: 12, color: "var(--accent)" }} className="spin" />
    );

  return (
    <div
      className={`violation-entry ${v.borderClass} ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className={`severity ${v.sev}`}>{v.sevLabel}</span>
          <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--fg)" }}>
            {v.title}
          </span>
        </div>
        <span className="mono" style={{ fontSize: 9, color: "var(--muted)", flexShrink: 0, marginLeft: 8 }}>
          {v.time}
        </span>
      </div>
      <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 6 }}>
        {v.cam}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
        {v.standards.map((s, i) => (
          <span key={i} className="pdf-chip loaded">
            <FileText style={{ width: 10, height: 10 }} />
            {s}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>
          {statusIcon}
          <span style={{ color: `var(--${v.statusColor})` }}>{v.status}</span>
        </div>
        <span className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>{v.id}</span>
      </div>
    </div>
  );
}

/* ── PATH-TO-GREEN ── */
function PathToGreen({ violation }) {
  const steps = PTG_STEPS[violation.id] || DEFAULT_STEPS;
  const doneCount = steps.filter((s) => s.state === "done").length;
  const isCritical = violation.category && violation.category !== "ppe";
  const accentColor =
    violation.category === "smoke"
      ? "var(--smoke)"
      : violation.category === "weapon"
      ? "var(--weapon)"
      : violation.category === "violence"
      ? "var(--violence)"
      : "var(--accent)";

  return (
    <div style={{ background: "var(--surface)", border: `1px solid ${isCritical ? accentColor : "var(--border)"}`, borderRadius: 4 }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Route style={{ width: 16, height: 16, color: accentColor }} />
          <h3 className="mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>
            PATH-TO-GREEN · REMEDIATION REPORT
          </h3>
          <span className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>[ AUTO-GENERATED ]</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {violation.category && (
            <span className={`cat-badge ${violation.category}`}>{violation.category.toUpperCase()}</span>
          )}
          <span className={`severity ${violation.sev}`}>{violation.sevLabel}</span>
          <span className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>{violation.id}</span>
          <button className="btn">EXPORT PDF</button>
        </div>
      </div>
      <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>VIOLATION</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: isCritical ? accentColor : "var(--danger)" }}>
              {violation.title}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{violation.cam}</div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>DETECTED</div>
            <div className="mono" style={{ fontSize: 10 }}>2024-07-03 {violation.time}</div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>STANDARDS CITED</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {violation.standards.map((s, i) => (
                <span key={i} className="pdf-chip loaded">
                  <FileText style={{ width: 10, height: 10 }} />
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>ROOT CAUSE</div>
            <div style={{ fontSize: 11, lineHeight: 1.6, color: "var(--fg)" }}>{violation.rootCause}</div>
          </div>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>REMEDIATION STEPS</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>
              <span style={{ color: "var(--muted)" }}>PROGRESS</span>
              <span className="live-num" style={{ color: accentColor }}>
                {doneCount}/{steps.length}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {steps.map((s, i) => (
              <div key={i} className={`ptg-step ${s.state === "done" ? "done" : s.state === "pending" ? "pending" : ""}`}>
                <div className="ptg-step-num">
                  {s.state === "done" ? <Check style={{ width: 12, height: 12 }} /> : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 500 }}>{s.text}</div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
                    {s.meta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AUTOPILOT AGENT ── */
function AgentPanel() {
  const [tab, setTab] = useState("autopilot");
  const [selectedWorkflow, setSelectedWorkflow] = useState("ops");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Autopilot ready. Describe a workflow or select one of the production templates below and I will build an execution plan with approvals and tool checkpoints.",
    },
  ]);
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState("Ready for orchestration");
  const [isRunning, setIsRunning] = useState(false);
  const streamRef = useRef(null);

  const workflowTemplates = [
    {
      id: "ops",
      title: "Operations Alert Remediation",
      description: "Safe triage for system alerts, incident response, and remediation handoffs.",
      focus: "alerts · approvals · evidence",
    },
    {
      id: "sales",
      title: "Customer Inquiry to Quote",
      description: "Turn inbound requests into qualified opportunities, pricing, and handoff steps.",
      focus: "CRM · pricing · follow-up",
    },
    {
      id: "hr",
      title: "Resume Screening to Interview",
      description: "Review candidate data, score fit, and schedule interviews with human checkpoints.",
      focus: "screening · scheduling · compliance",
    },
  ];

  const selectedTemplate = workflowTemplates.find((w) => w.id === selectedWorkflow) || workflowTemplates[0];

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [messages, plan]);

  const staticLines =
    tab === "standards" ? STANDARDS_TAB
    : tab === "devices" ? DEVICES_TAB
    : tab === "models" ? MODELS_TAB
    : null;

  const buildFallbackPlan = (workflow, prompt) => {
    const basePrompt = `${workflow.title} · ${prompt}`.toLowerCase();
    if (workflow.id === "sales") {
      return {
        objective: "Convert an inbound request into a qualified quote and customer handoff.",
        confidence: 0.96,
        summary: "The autopilot will validate requirements, compile a quote, request approval, and prepare the customer follow-up package.",
        steps: [
          { title: "Capture customer intent and product scope", tool: "Inbox + CRM enrichment", status: "complete" },
          { title: "Generate pricing and margin review", tool: "Pricing engine", status: "complete" },
          { title: "Human approval checkpoint", tool: "Sales lead sign-off", status: "pending" },
          { title: "Draft contract and outreach sequence", tool: "Document generator", status: "pending" },
        ],
        checkpoints: ["Sales manager approval before sending quote", "Customer confirmation before contract execution"],
        nextAction: "Approve the quote package and send it to the customer.",
      };
    }
    if (workflow.id === "hr") {
      return {
        objective: "Screen a candidate, score fit, and schedule the next interview step.",
        confidence: 0.95,
        summary: "The workflow extracts evidence from the resume, checks role fit, and pauses for recruiter approval before scheduling.",
        steps: [
          { title: "Extract skills and experience from the resume", tool: "Resume parser", status: "complete" },
          { title: "Score fit against the role requirements", tool: "Decision model", status: "complete" },
          { title: "Recruiter review checkpoint", tool: "Human-in-loop approval", status: "pending" },
          { title: "Schedule interview and send confirmations", tool: "Calendar integration", status: "pending" },
        ],
        checkpoints: ["Recruiter sign-off before interview booking", "Compliance review for regulated roles"],
        nextAction: "Approve shortlisted candidate and reserve the interview slot.",
      };
    }
    return {
      objective: "Contain the incident, preserve evidence, and execute the safest remediation path.",
      confidence: 0.97,
      summary: `The autopilot will classify the alert, correlate evidence, and route the next action to the correct owner with a human checkpoint before closure. ${basePrompt.includes("urgent") ? "Priority handling was boosted due to urgency." : ""}`,
      steps: [
        { title: "Collect alert, system snapshot, and recent events", tool: "Monitoring API", status: "complete" },
        { title: "Classify impact and affected assets", tool: "Risk engine", status: "complete" },
        { title: "Escalate for human approval", tool: "Operations lead approval", status: "pending" },
        { title: "Execute remediation and attach evidence", tool: "Automation runner", status: "pending" },
      ],
      checkpoints: ["Operations lead approval before any destructive action", "Customer or stakeholder update after mitigation"],
      nextAction: "Approve the remediation playbook and run the automation sequence.",
    };
  };

  const callQwenAgent = async (workflow, prompt) => {
    const apiKey = import.meta.env.VITE_DASHSCOPE_API_KEY || import.meta.env.VITE_QWEN_API_KEY || "";
    if (!apiKey) {
      return null;
    }
    try {
      const response = await fetch("https://dashscope-intl.aliyuncs.com/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "qwen3.6-plus",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: "You are Serenix Autopilot, an enterprise workflow orchestrator. Produce a concise plan with objective, confidence, 3-4 execution steps, and human checkpoints. Format as bullet points.",
            },
            {
              role: "user",
              content: `Workflow: ${workflow.title}\nRequest: ${prompt}\nReturn concise output only.`,
            },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || "API request failed");
      return data?.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.error("Dashscope agent failed", error);
      return null;
    }
  };

  const send = async () => {
    const prompt = input.trim();
    if (!prompt) return;
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setStatus("Planning workflow...");
    setIsRunning(true);
    setInput("");
    try {
      const aiText = await callQwenAgent(selectedTemplate, prompt);
      const fallbackPlan = buildFallbackPlan(selectedTemplate, prompt);
      const planText = aiText?.trim() || fallbackPlan.summary;
      setPlan({
        ...fallbackPlan,
        aiSummary: planText,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: aiText ? `Autopilot plan drafted from Qwen Cloud: ${planText}` : `Autopilot plan drafted locally: ${fallbackPlan.summary}`,
        },
      ]);
      setStatus(aiText ? "Qwen Cloud plan generated" : "Local autopilot plan generated");
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Plan generation failed: ${error.message}` }]);
      setStatus("Plan generation failed");
    } finally {
      setIsRunning(false);
    }
  };

  const approvePlan = () => {
    if (!plan) return;
    setPlan((prev) => ({
      ...prev,
      steps: prev.steps.map((step, index) => ({
        ...step,
        status: index === 0 || index === 1 ? "complete" : "active",
      })),
    }));
    setStatus("Human approval granted — workflow is executing");
    setMessages((prev) => [...prev, { role: "assistant", text: "Approval accepted. The automation sequence is now running with the next checkpoints enabled." }]);
  };

  const escalatePlan = () => {
    setStatus("Escalated to operations lead");
    setMessages((prev) => [...prev, { role: "assistant", text: "Escalation logged. A human operator will review the plan before execution proceeds." }]);
  };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4 }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 2, background: "linear-gradient(135deg, var(--info), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BrainCircuit style={{ width: 12, height: 12, color: "#000" }} />
          </div>
          <h3 className="mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>AUTOPILOT AGENT</h3>
          <span className="mono" style={{ fontSize: 9, color: "var(--accent)" }}>QWEN · HUMAN-IN-THE-LOOP</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="status-dot" />
          <span className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>{isRunning ? "PLANNING" : status}</span>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
        {[
          "autopilot",
          "standards",
          "devices",
          "models",
        ].map((t) => (
          <div
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
            style={{ textTransform: "uppercase" }}
          >
            {t}
          </div>
        ))}
      </div>

      {tab === "autopilot" ? (
        <div style={{ padding: 12, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {workflowTemplates.map((template) => (
              <button
                key={template.id}
                className={`btn ${selectedWorkflow === template.id ? "active" : ""}`}
                onClick={() => setSelectedWorkflow(template.id)}
                style={{ padding: "6px 8px", fontSize: 9, borderRadius: 3 }}
              >
                {template.title}
              </button>
            ))}
          </div>

          <div style={{ border: "1px solid var(--border)", borderRadius: 4, padding: 10, background: "rgba(255,255,255,0.03)" }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--accent)", marginBottom: 4 }}>ACTIVE WORKFLOW</div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{selectedTemplate.title}</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--muted)", lineHeight: 1.5 }}>{selectedTemplate.description}</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--info)", marginTop: 6 }}>{selectedTemplate.focus}</div>
          </div>

          <div ref={streamRef} className="agent-stream" style={{ height: 240, overflowY: "auto", padding: 10, border: "1px solid var(--border)", borderRadius: 4, background: "rgba(0,0,0,0.22)" }}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className="agent-line" style={{ color: message.role === "assistant" ? "var(--accent)" : "var(--fg)" }}>
                {message.text}
              </div>
            ))}
            {plan && (
              <div style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 6 }}>EXECUTION PLAN</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)", marginBottom: 6 }}>{plan.objective}</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--info)", marginBottom: 8 }}>Confidence {Math.round(plan.confidence * 100)}%</div>
                <div style={{ fontSize: 11, lineHeight: 1.5, color: "var(--fg)", marginBottom: 8 }}>{plan.aiSummary}</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {plan.steps.map((step, index) => (
                    <div key={`${step.title}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "6px 8px", border: "1px solid var(--border)", borderRadius: 3, background: "rgba(255,255,255,0.03)" }}>
                      <div style={{ fontSize: 10 }}>{step.title}</div>
                      <div className="mono" style={{ fontSize: 8, color: "var(--muted)" }}>{step.tool}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>HUMAN CHECKPOINTS</div>
                  {plan.checkpoints.map((checkpoint, index) => (
                    <div key={`${checkpoint}-${index}`} className="mono" style={{ fontSize: 9, color: "var(--warn)", marginBottom: 4 }}>• {checkpoint}</div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--accent)" }}>{plan.nextAction}</div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              type="text"
              placeholder="Describe your workflow: e.g. handle a customer escalation or triage a system alert"
              style={{
                flex: 1,
                background: "transparent",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                border: "1px solid var(--border)",
                borderRadius: 4,
                outline: "none",
                color: "var(--fg)",
                padding: "8px 10px",
              }}
            />
            <button className="btn" onClick={send} disabled={isRunning}>{isRunning ? "WORKING" : "RUN AUTOPILOT"}</button>
          </div>

          {plan && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn active" onClick={approvePlan}>APPROVE & EXECUTE</button>
              <button className="btn" onClick={escalatePlan}>ESCALATE</button>
            </div>
          )}
        </div>
      ) : (
        <div ref={streamRef} className="agent-stream" style={{ padding: 12, height: 280, overflowY: "auto" }}>
          {(staticLines || []).map((line, index) => (
            <div key={`${line.t}-${index}`} className="agent-line" style={{ color: line.c }}>
              {line.t && <span style={{ color: "var(--muted)" }}>{"› "}</span>}
              {line.t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── MAIN APP ── */
export default function App() {
  const clock = useClock();
  const [region, setRegion] = useState("AMER");
  const [selectedId, setSelectedId] = useState("INC-2024-0745");
  const [filter, setFilter] = useState("all");
  const [queue, setQueue] = useState(2);
  const [latency, setLatency] = useState(14);
  const [rtt, setRtt] = useState(42);
  const [lastSync, setLastSync] = useState("3s ago");

  useEffect(() => {
    const id = setInterval(() => {
      setQueue(Math.floor(Math.random() * 5));
      setLatency(11 + Math.floor(Math.random() * 8));
      setRtt(35 + Math.floor(Math.random() * 15));
      setLastSync(`${1 + Math.floor(Math.random() * 4)}s ago`);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const selected = VIOLATIONS.find((v) => v.id === selectedId) || VIOLATIONS[0];
  const filteredCameras = filter === "all" ? CAMERAS : CAMERAS.filter((c) => c.category === filter);
  const displayCounts = { sev1: 1, sev2: 3, sev3: 7, smoke: 1, weapon: 1, violence: 1 };

  const filters = [
    { key: "all", label: "ALL FEEDS", Icon: null },
    { key: "ppe", label: "PPE", Icon: null },
    { key: "smoke", label: "SMOKE", Icon: Flame },
    { key: "weapon", label: "WEAPON", Icon: Crosshair },
    { key: "violence", label: "VIOLENCE", Icon: Swords },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ── TOP BAR ── */}
      <header className="top-bar" style={{ display: "flex", alignItems: "center", padding: "0 16px", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 2, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <ShieldAlert style={{ width: 20, height: 20, color: "#000", strokeWidth: 2.5 }} />
            <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "var(--danger)", animation: "pulse 2s infinite" }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", lineHeight: 1 }}>
              SERENIX<span style={{ color: "var(--accent)" }}>.</span>AI
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
              MULTI-THREAT DETECTION · v1.2.0
            </div>
          </div>
        </div>

        <div style={{ height: 32, width: 1, background: "var(--border)" }} />

        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["DASHBOARD", "INCIDENTS", "STANDARDS", "DEVICES", "REPORTS"].map((label) => (
            <button key={label} className={`btn ${label === "DASHBOARD" ? "active" : ""}`}>
              {label}
            </button>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Threat level banner */}
        <div className="threat-banner">
          <Zap style={{ width: 14, height: 14, color: "var(--danger)" }} />
          <span className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>THREAT</span>
          <span className="threat-level-text">ELEVATED</span>
          <span className="mono" style={{ fontSize: 9, color: "var(--danger)" }}>3 ACTIVE</span>
        </div>

        <div style={{ height: 32, width: 1, background: "var(--border)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="status-dot" />
            <span style={{ color: "var(--muted)" }}>EDGE</span>
            <span className="live-num">7/7</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="status-dot" />
            <span style={{ color: "var(--muted)" }}>CLOUD</span>
            <span style={{ color: "var(--safe)" }}>LINKED</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="status-dot warn" />
            <span style={{ color: "var(--muted)" }}>QUEUE</span>
            <span className="live-num" style={{ color: queue > 2 ? "var(--danger)" : queue > 0 ? "var(--warn)" : "var(--accent)" }}>
              {queue}
            </span>
          </div>
        </div>

        <div style={{ height: 32, width: 1, background: "var(--border)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className="mono" style={{ fontSize: 9, color: "var(--muted)", marginRight: 4 }}>REGION</span>
          {["AMER", "EMEA", "APAC"].map((r) => (
            <button key={r} className={`btn ${region === r ? "active" : ""}`} onClick={() => setRegion(r)}>
              {r}
            </button>
          ))}
        </div>

        <div style={{ height: 32, width: 1, background: "var(--border)" }} />

        <div className="mono" style={{ fontSize: 10, textAlign: "right" }}>
          <div style={{ color: "var(--fg)" }}>{clock}</div>
          <div style={{ fontSize: 9, color: "var(--muted)" }}>
            UTC · DAY <span style={{ color: "var(--accent)" }}>7</span>/10
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ padding: 12, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, maxWidth: 1900, margin: "0 auto" }}>
        {/* LEFT COLUMN */}
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Section header with filters */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <h2 className="mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--muted)" }}>
              [ 01 ] LIVE FEEDS · 7 CAMERAS
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {filters.map((f) => (
                <button
                  key={f.key}
                  className={`filter-tab ${filter === f.key ? "active" : ""} ${filter === f.key && f.key !== "all" && f.key !== "ppe" ? f.key : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.Icon && <f.Icon style={{ width: 10, height: 10 }} />}
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <EyeOff style={{ width: 12, height: 12, color: "var(--accent)" }} />
                <span style={{ color: "var(--muted)" }}>FACE BLUR</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Cpu style={{ width: 12, height: 12, color: "var(--accent)" }} />
                <span style={{ color: "var(--muted)" }}>AVG</span>
                <span className="live-num" style={{ color: "var(--accent)" }}>{latency}ms</span>
              </div>
            </div>
          </div>

          {/* Camera grid */}
          <div className="camera-grid">
            {filteredCameras.map((cam) => (
              <CameraCard key={cam.id} cam={cam} />
            ))}
          </div>

          {/* Facility cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {FACILITIES.map((f) => {
              const sparkColor =
                f.category === "smoke" ? "var(--smoke)"
                : f.category === "weapon" ? "var(--weapon)"
                : f.category === "violence" ? "var(--violence)"
                : "var(--accent)";
              return (
                <div key={f.name} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, padding: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span className="mono" style={{ fontSize: 8, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.name}
                    </span>
                    <f.icon style={{ width: 10, height: 10, color: `var(--${f.color})`, flexShrink: 0 }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                    <span className="live-num" style={{ fontSize: 16, color: `var(--${f.color})` }}>{f.comply}</span>
                    <span className="mono" style={{ fontSize: 7, color: "var(--muted)" }}>%</span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Sparkline color={sparkColor} />
                  </div>
                  <div className="mono" style={{ fontSize: 7, color: "var(--muted)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.status}
                  </div>
                </div>
              );
            })}
          </div>

          <ImageDiffPanel />

          <PathToGreen violation={selected} />
        </section>

        {/* RIGHT COLUMN */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Incident feed */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4 }}>
            <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BellRing style={{ width: 14, height: 14, color: "var(--danger)" }} />
                <h3 className="mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em" }}>INCIDENT FEED</h3>
                <span className="mono" style={{ fontSize: 9, color: "var(--danger)" }}>[ LIVE ]</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 8, flexWrap: "wrap" }}>
                <span style={{ color: "var(--smoke)" }}>SMOKE:{displayCounts.smoke}</span>
                <span style={{ color: "var(--weapon)" }}>WEAP:{displayCounts.weapon}</span>
                <span style={{ color: "var(--violence)" }}>VIOL:{displayCounts.violence}</span>
                <span style={{ color: "var(--muted)", marginLeft: 4 }}>SEV-1:{displayCounts.sev1}</span>
                <span style={{ color: "var(--muted)" }}>SEV-2:{displayCounts.sev2}</span>
                <span style={{ color: "var(--muted)" }}>SEV-3:{displayCounts.sev3}</span>
              </div>
            </div>
            <div className="incident-feed" style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4, maxHeight: 340, overflowY: "auto" }}>
              {VIOLATIONS.map((v) => (
                <ViolationEntry
                  key={v.id}
                  v={v}
                  selected={v.id === selectedId}
                  onClick={() => setSelectedId(v.id)}
                />
              ))}
            </div>
          </div>

          <DatasetManager datasets={DATASETS} />

          <AgentPanel />
        </aside>
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Cpu style={{ width: 12, height: 12, color: "var(--accent)" }} />
          <span style={{ color: "var(--muted)" }}>EDGE PI×4 JETSON×3</span>
          <span style={{ color: "var(--accent)" }}>AVG {latency}ms</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Flame style={{ width: 12, height: 12, color: "var(--smoke)" }} />
          <span style={{ color: "var(--muted)" }}>SMOKE</span>
          <span style={{ color: "var(--smoke)" }}>ACTIVE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Crosshair style={{ width: 12, height: 12, color: "var(--weapon)" }} />
          <span style={{ color: "var(--muted)" }}>WEAPON</span>
          <span style={{ color: "var(--weapon)" }}>LOCKDOWN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Swords style={{ width: 12, height: 12, color: "var(--violence)" }} />
          <span style={{ color: "var(--muted)" }}>VIOLENCE</span>
          <span style={{ color: "var(--violence)" }}>DISPATCHED</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Wifi style={{ width: 12, height: 12, color: "var(--safe)" }} />
          <span style={{ color: "var(--muted)" }}>NETWORK</span>
          <span style={{ color: "var(--safe)" }}>STABLE</span>
          <span style={{ color: "var(--muted)" }}>· RTT</span>
          <span style={{ color: "var(--accent)" }}>{rtt}ms</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Inbox style={{ width: 12, height: 12, color: "var(--warn)" }} />
          <span style={{ color: "var(--muted)" }}>QUEUE</span>
          <span style={{ color: "var(--warn)" }}>{queue}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck style={{ width: 12, height: 12, color: "var(--accent)" }} />
          <span style={{ color: "var(--muted)" }}>STANDARDS</span>
          <span style={{ color: "var(--accent)" }}>11 loaded</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Eye style={{ width: 12, height: 12, color: "var(--accent)" }} />
          <span style={{ color: "var(--muted)" }}>PRIVACY</span>
          <span style={{ color: "var(--accent)" }}>FACE BLUR</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--muted)" }}>SYNC</span>
          <span style={{ color: "var(--accent)" }}>{lastSync}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--muted)" }}>UPTIME</span>
          <span style={{ color: "var(--safe)" }}>7d 14h 22m</span>
        </div>
      </footer>
    </div>
  );
}