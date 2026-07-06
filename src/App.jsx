import { useEffect, useRef, useState } from "react";
import {
  ShieldAlert, Eye, EyeOff, Cpu, HardDrive, AlertTriangle, CheckCircle2,
  AlertCircle, HardHat, Server, Utensils, Activity, Route, FileText,
  BellRing, BrainCircuit, Wifi, Inbox, ShieldCheck, Check, Clock, Loader
} from "lucide-react";

const CAMERAS = [
  {
    id: "01", label: "CONSTRUCT-A", seedImg: "sentry-construct",
    latency: 14, standards: "NFPA 70E", comply: 78, alertColor: "danger",
    alertText: "1 SEV-2", objCount: "2 OBJ · 1 ALERT",
    detections: [
      { cls: "safe", top: 28, left: 18, w: 11, h: 22, label: "HELMET · 0.98" },
      { cls: "danger", top: 34, left: 54, w: 13, h: 28, label: "NO HELMET · 0.94" },
    ],
    blurs: [
      { top: 23, left: 19, w: 9, h: 6 },
      { top: 29, left: 55, w: 11, h: 7 },
    ],
  },
  {
    id: "02", label: "DC-B / AISLE 3", seedImg: "sentry-datacenter",
    latency: 12, standards: "NFPA 70E · ISA 62443", comply: 96, alertColor: "safe",
    alertText: "COMPLIANT", objCount: "2 OBJ · 0 ALERT",
    detections: [
      { cls: "safe", top: 30, left: 24, w: 14, h: 30, label: "ARC SUIT · 0.96" },
      { cls: "safe", top: 32, left: 60, w: 12, h: 26, label: "HELMET · 0.97" },
    ],
    blurs: [
      { top: 25, left: 25, w: 12, h: 7 },
      { top: 27, left: 61, w: 10, h: 6 },
    ],
  },
  {
    id: "03", label: "KITCHEN-C", seedImg: "sentry-kitchen",
    latency: 15, standards: "NFPA 101 · FDA", comply: 88, alertColor: "warn",
    alertText: "1 SEV-3", objCount: "2 OBJ · 1 WARN",
    detections: [
      { cls: "warning", top: 22, left: 38, w: 18, h: 12, label: "EXIT BLOCKED · 0.91" },
      { cls: "safe", top: 50, left: 14, w: 10, h: 22, label: "EXTINGUISHER · 0.99" },
    ],
    blurs: [{ top: 42, left: 30, w: 8, h: 6 }],
  },
  {
    id: "04", label: "HOSP-D / ICU", seedImg: "sentry-hospital",
    latency: 13, standards: "OSHA · CDC", comply: 92, alertColor: "safe",
    alertText: "COMPLIANT", objCount: "2 OBJ · 0 ALERT",
    detections: [
      { cls: "safe", top: 26, left: 20, w: 12, h: 28, label: "GLOVES · 0.95" },
      { cls: "safe", top: 30, left: 56, w: 14, h: 30, label: "MASK · 0.93" },
    ],
    blurs: [
      { top: 21, left: 22, w: 8, h: 6 },
      { top: 25, left: 58, w: 10, h: 7 },
    ],
  },
];

const FACILITIES = [
  { name: "CONSTRUCT-A", icon: HardHat, comply: 78, color: "danger", status: "1 OPEN · SEV-2" },
  { name: "DC-B", icon: Server, comply: 96, color: "safe", status: "0 OPEN · CLEAN" },
  { name: "KITCHEN-C", icon: Utensils, comply: 88, color: "warn", status: "1 OPEN · SEV-3" },
  { name: "HOSP-D", icon: Activity, comply: 92, color: "safe", status: "0 OPEN · CLEAN" },
];

const VIOLATIONS = [
  { id: "INC-2024-0741", sev: "sev2", sevLabel: "SEV-2", title: "Missing head protection", cam: "CAM-01 · CONSTRUCT-A · zone A-7", time: "14:23:07Z", standards: ["NFPA 70E §130.7", "OSHA 1926.100", "SOP-DC-2401 §4.2"], status: "AGENT INVESTIGATING", statusColor: "accent", rootCause: "Worker entered zone A-7 (active crane area) without class-E hard hat. Hat last logged at station B-3 11m ago." },
  { id: "INC-2024-0740", sev: "sev1", sevLabel: "SEV-1", title: "Arc flash suit absent during CST", cam: "CAM-02 · DC-B · switchgear-3", time: "14:18:52Z", standards: ["NFPA 70E §130.7(C)", "OSHA 1910.269"], status: "ESCALATED · SEV-1", statusColor: "danger", rootCause: "Critical switching task initiated on switchgear-3 without category-4 PPE. Suit present in locker L-7 but not donned." },
  { id: "INC-2024-0739", sev: "sev3", sevLabel: "SEV-3", title: "Fire exit partially obstructed", cam: "CAM-03 · KITCHEN-C · exit-E2", time: "14:11:30Z", standards: ["NFPA 101 §7.1", "OSHA 1910.37"], status: "REMEDIATION QUEUED", statusColor: "warn", rootCause: "Exit E2 obstructed by delivery cart. Cart placed 09:14, exit last cleared 08:50." },
  { id: "INC-2024-0738", sev: "sev2", sevLabel: "SEV-2", title: "No gloves during chemical handling", cam: "CAM-04 · HOSP-D · lab-2", time: "13:54:18Z", standards: ["OSHA 1910.1030", "CDC PPE Protocol"], status: "RESOLVED · 4m ago", statusColor: "safe", rootCause: "Lab technician handled reagents without nitrile gloves. Gloves available at station 2m away." },
  { id: "INC-2024-0737", sev: "sev3", sevLabel: "SEV-3", title: "Improper footwear in server aisle", cam: "CAM-02 · DC-B · aisle-1", time: "13:32:04Z", standards: ["NFPA 70E §130.7(C)(4)"], status: "RESOLVED · 51m ago", statusColor: "safe", rootCause: "Open footwear detected in aisle-1. Steel-toe requirement per NFPA 70E." },
  { id: "INC-2024-0736", sev: "sev2", sevLabel: "SEV-2", title: "Helmet missing near crane swing", cam: "CAM-01 · CONSTRUCT-A · zone B-2", time: "13:08:47Z", standards: ["OSHA 1926.100", "NFPA 70E"], status: "RESOLVED · 1h ago", statusColor: "safe", rootCause: "Worker entered crane swing radius without helmet. Helmet stored in trailer T-2." },
];

const REASONING_SCENARIOS = [
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
  [
    { t: "SCHEDULED AUDIT · KITCHEN-C · fire exit integrity", c: "var(--info)" },
    { t: "CAM-03 capture · exit-E2 region", c: "var(--muted)" },
    { t: "EDGE INFERENCE: obstruction_detected · 0.91", c: "var(--warn)" },
    { t: "INITIATING RAG RETRIEVAL · STANDARDS STORE", c: "var(--muted)" },
    { t: "[PDF] NFPA_101_2024.pdf · §7.1 Means of Egress", c: "var(--info)" },
    { t: "[PDF] OSHA_29CFR_1910.37.pdf · Exit Routes", c: "var(--info)" },
    { t: "CLAUSE MATCH · 0.89 confidence · 2 clauses retrieved", c: "var(--muted)" },
    { t: "VIOLATION CONFIRMED · SEV-3", c: "var(--info)" },
    { t: "GENERATING PATH-TO-GREEN...", c: "var(--muted)" },
    { t: "STEP 1 · RELOCATE delivery cart to staging area", c: "var(--accent)" },
    { t: "STEP 2 · VERIFY 36-inch clear width via CAM-03", c: "var(--accent)" },
    { t: "STEP 3 · UPDATE exit route signage logbook", c: "var(--accent)" },
    { t: "DISPATCHED to kitchen-manager@facility-c", c: "var(--safe)" },
    { t: "── COMPLETE · 1.4s · tokens: 612 ──", c: "var(--muted)" },
  ],
];

const STANDARDS_TAB = [
  { t: "STANDARDS STORE · 5 documents loaded", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "NFPA_70E_2024.pdf · 412 pages · indexed 1.2M tokens", c: "var(--info)" },
  { t: "OSHA_29CFR_1926.100.pdf · 47 pages · indexed 89K tokens", c: "var(--info)" },
  { t: "OSHA_29CFR_1910.269.pdf · 184 pages · indexed 410K tokens", c: "var(--info)" },
  { t: "NFPA_101_2024.pdf · 588 pages · indexed 1.6M tokens", c: "var(--info)" },
  { t: "ISA_62443_2024.pdf · 224 pages · indexed 580K tokens", c: "var(--info)" },
  { t: "ISO_61511_2024.pdf · 198 pages · indexed 470K tokens", c: "var(--info)" },
  { t: "", c: "var(--muted)" },
  { t: "EMBEDDING MODEL · text-embedding-3-large", c: "var(--muted)" },
  { t: "VECTOR STORE · pgvector · 4.3M rows", c: "var(--muted)" },
  { t: "AVG RETRIEVAL · 38ms · top-k=8", c: "var(--accent)" },
  { t: "LAST REINDEX · 2024-07-03 06:00 UTC", c: "var(--muted)" },
];

const DEVICES_TAB = [
  { t: "EDGE DEVICES · 4 connected", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "EDGE-PI-01 · Raspberry Pi 5 · CAM-01 · CONSTRUCT-A", c: "var(--info)" },
  { t: "  CPU 38% · RAM 1.2GB · TEMP 51°C · MODEL yolov8n", c: "var(--muted)" },
  { t: "  UPTIME 7d14h · QUEUE 0 · LAST SYNC 3s", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "EDGE-JET-02 · Jetson Nano · CAM-02 · DC-B", c: "var(--info)" },
  { t: "  CPU 62% · RAM 2.8GB · TEMP 58°C · MODEL yolov8s", c: "var(--muted)" },
  { t: "  UPTIME 7d14h · QUEUE 0 · LAST SYNC 2s", c: "var(--muted)" },
  { t: "", c: "var(--muted)" },
  { t: "EDGE-PI-03 · Raspberry Pi 5 · CAM-03 · KITCHEN-C", c: "var(--info)" },
  { t: "  CPU 41% · RAM 1.1GB · TEMP 49°C · MODEL yolov8n", c: "var(--muted)" },
  { t: "  UPTIME 7d14h · QUEUE 2 · LAST SYNC 5s", c: "var(--warn)" },
  { t: "", c: "var(--muted)" },
  { t: "EDGE-PI-04 · Raspberry Pi 5 · CAM-04 · HOSP-D", c: "var(--info)" },
  { t: "  CPU 35% · RAM 1.0GB · TEMP 47°C · MODEL yolov8n", c: "var(--muted)" },
  { t: "  UPTIME 7d14h · QUEUE 0 · LAST SYNC 4s", c: "var(--muted)" },
];

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

function Sparkline() {
  const [bars, setBars] = useState(() => Array.from({ length: 20 }, () => 4 + Math.random() * 12));
  useEffect(() => {
    const id = setInterval(() => {
      setBars(Array.from({ length: 20 }, () => 4 + Math.random() * 12));
    }, 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="spark">
      {bars.map((h, i) => <div key={i} className="spark-bar" style={{ height: `${h}px` }} />)}
    </div>
  );
}

function CameraCard({ cam }) {
  return (
    <div className="camera-card lift">
      <div className="camera-feed scanlines grid-overlay vignette">
        <img src={`https://picsum.photos/seed/${cam.seedImg}/640/400`} alt="" />
        <div className="scan-beam" style={{ animationDelay: `${parseInt(cam.id) * 1.2}s` }} />
        {cam.detections.map((d, i) => (
          <div key={i} className={`detection ${d.cls}`} style={{ top: `${d.top}%`, left: `${d.left}%`, width: `${d.w}%`, height: `${d.h}%` }}>
            <span className="detection-label">{d.label}</span>
          </div>
        ))}
        {cam.blurs.map((b, i) => (
          <div key={i} className="blur-region" style={{ top: `${b.top}%`, left: `${b.left}%`, width: `${b.w}%`, height: `${b.h}%` }} />
        ))}
        <div className="absolute top-2 left-2 right-2 flex justify-between z-10">
          <div className="bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded mono text-[9px] flex items-center gap-1.5">
            <span className="rec-dot" />
            <span className="font-bold">CAM-{cam.id}</span>
            <span className="text-[var(--muted)]">·</span>
            <span>{cam.label}</span>
          </div>
          <div className="bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded mono text-[9px] text-[var(--muted)]">1920×1080 · 30fps</div>
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end z-10">
          <div className="bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded mono text-[9px]">
            <span className="text-[var(--muted)]">EDGE</span>
            <span className="text-[var(--accent)] ml-1 font-bold">{cam.latency}ms</span>
            <span className="text-[var(--muted)] mx-1">·</span>
            <span className="text-[var(--muted)]">{cam.standards}</span>
          </div>
          <div className={`px-2 py-0.5 rounded mono text-[9px] font-bold flex items-center gap-1 ${cam.alertColor === "safe" ? "bg-[var(--safe)] text-black" : cam.alertColor === "warn" ? "bg-[var(--warn)] text-black" : "bg-[var(--danger)] text-white"}`}>
            {cam.alertColor === "safe" ? <CheckCircle2 className="w-3 h-3" /> : cam.alertColor === "warn" ? <AlertCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {cam.alertText}
          </div>
        </div>
      </div>
      <div className="px-2 py-1.5 flex items-center justify-between bg-[var(--surface-2)] border-t border-[var(--border)]">
        <div className="flex items-center gap-2 mono text-[9px]">
          <span className="text-[var(--muted)]">COMPLY</span>
          <span className={`live-num text-[var(--${cam.alertColor})]`}>{cam.comply}%</span>
        </div>
        <div className="flex-1 mx-2">
          <div className="gauge-bar">
            <div className="gauge-fill" style={{ width: `${cam.comply}%`, background: cam.alertColor === "danger" ? "linear-gradient(90deg, var(--danger), var(--warn))" : cam.alertColor === "warn" ? "linear-gradient(90deg, var(--warn), var(--accent))" : "linear-gradient(90deg, var(--accent), var(--safe))" }} />
          </div>
        </div>
        <div className="mono text-[9px] text-[var(--muted)]">{cam.objCount}</div>
      </div>
    </div>
  );
}

function ViolationEntry({ v, selected, onClick }) {
  const borderClass = v.sev === "sev1" ? "" : v.sev === "sev2" ? "warn" : "info";
  const statusIcon = v.statusColor === "safe" ? <CheckCircle2 className="w-3 h-3 text-[var(--safe)]" />
    : v.statusColor === "danger" ? <AlertTriangle className="w-3 h-3 text-[var(--danger)]" />
    : v.statusColor === "warn" ? <Clock className="w-3 h-3 text-[var(--warn)]" />
    : <Loader className="w-3 h-3 text-[var(--accent)] spin" />;
  return (
    <div className={`violation-entry ${borderClass} ${selected ? "selected" : ""}`} onClick={onClick}>
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className={`severity ${v.sev}`}>{v.sevLabel}</span>
          <span className="mono text-[10px] font-bold text-[var(--fg)]">{v.title}</span>
        </div>
        <span className="mono text-[9px] text-[var(--muted)]">{v.time}</span>
      </div>
      <div className="mono text-[9px] text-[var(--muted)] mb-1.5">{v.cam}</div>
      <div className="flex items-center gap-1 flex-wrap mb-1.5">
        {v.standards.map((s, i) => (
          <span key={i} className="pdf-chip loaded"><FileText className="w-2.5 h-2.5" />{s}</span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 mono text-[9px]">
          {statusIcon}
          <span style={{ color: `var(--${v.statusColor})` }}>{v.status}</span>
        </div>
        <span className="mono text-[9px] text-[var(--muted)]">{v.id}</span>
      </div>
    </div>
  );
}

const PTG_STEPS = {
  "INC-2024-0741": [
    { state: "done", text: "Halt task in zone A-7", meta: "SYSTEM · auto-dispatched to supervisor wrist device · 14:23:09Z" },
    { state: "active", text: "Issue class-E helmet from station B-3", meta: "PENDING · worker acknowledgement required" },
    { state: "pending", text: "Reverify via CAM-01 before resumption", meta: "SCHEDULED · edge inference pass on resume" },
    { state: "pending", text: "Log incident to compliance registry", meta: "SCHEDULED · NFPA 70E §130.7(C) registry entry" },
  ],
};
const DEFAULT_STEPS = PTG_STEPS["INC-2024-0741"];

function PathToGreen({ violation }) {
  const steps = PTG_STEPS[violation.id] || DEFAULT_STEPS;
  const doneCount = steps.filter((s) => s.state === "done").length;
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded">
      <div className="px-3 py-2.5 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="mono text-[10px] font-bold tracking-wider">PATH-TO-GREEN · REMEDIATION REPORT</h3>
          <span className="mono text-[9px] text-[var(--muted)]">[ AUTO-GENERATED ]</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`severity ${violation.sev}`}>{violation.sevLabel}</span>
          <span className="mono text-[9px] text-[var(--muted)]">{violation.id}</span>
          <button className="btn">EXPORT PDF</button>
        </div>
      </div>
      <div className="p-3 grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-4 space-y-2">
          <div>
            <div className="mono text-[9px] text-[var(--muted)] mb-1">VIOLATION</div>
            <div className="text-sm font-semibold text-[var(--danger)]">{violation.title}</div>
            <div className="mono text-[10px] text-[var(--muted)] mt-1">{violation.cam}</div>
          </div>
          <div>
            <div className="mono text-[9px] text-[var(--muted)] mb-1">DETECTED</div>
            <div className="mono text-[10px]">2024-07-03 {violation.time}</div>
          </div>
          <div>
            <div className="mono text-[9px] text-[var(--muted)] mb-1">STANDARDS CITED</div>
            <div className="flex flex-wrap gap-1">
              {violation.standards.map((s, i) => (
                <span key={i} className="pdf-chip loaded"><FileText className="w-2.5 h-2.5" />{s}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="mono text-[9px] text-[var(--muted)] mb-1">ROOT CAUSE</div>
            <div className="text-[11px] leading-relaxed text-[var(--fg)]">{violation.rootCause}</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-8">
          <div className="flex items-center justify-between mb-2">
            <span className="mono text-[9px] text-[var(--muted)]">REMEDIATION STEPS</span>
            <div className="flex items-center gap-2 mono text-[9px]">
              <span className="text-[var(--muted)]">PROGRESS</span>
              <span className="live-num text-[var(--accent)]">{doneCount}/{steps.length}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {steps.map((s, i) => (
              <div key={i} className={`ptg-step ${s.state === "done" ? "done" : s.state === "pending" ? "pending" : ""}`}>
                <div className="ptg-step-num">{s.state === "done" ? <Check className="w-3 h-3" /> : i + 1}</div>
                <div className="flex-1">
                  <div className="text-[11px] font-medium">{s.text}</div>
                  <div className="mono text-[9px] text-[var(--muted)] mt-0.5">{s.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentPanel() {
  const [tab, setTab] = useState("reasoning");
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const scenarioIdx = useRef(0);
  const streamRef = useRef(null);

  useEffect(() => {
    if (tab !== "reasoning") return;
    let lineIdx = 0;
    let timeoutId;
    setLines([]);
    const pushLine = () => {
      const sc = REASONING_SCENARIOS[scenarioIdx.current];
      if (lineIdx >= sc.length) {
        timeoutId = setTimeout(() => {
          scenarioIdx.current = (scenarioIdx.current + 1) % REASONING_SCENARIOS.length;
          lineIdx = 0;
          setLines([]);
          pushLine();
        }, 3200);
        return;
      }
      setLines((prev) => [...prev, sc[lineIdx]]);
      lineIdx++;
      timeoutId = setTimeout(pushLine, 320 + Math.random() * 180);
    };
    pushLine();
    return () => clearTimeout(timeoutId);
  }, [tab]);

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [lines]);

  const staticLines = tab === "standards" ? STANDARDS_TAB : tab === "devices" ? DEVICES_TAB : null;

  const send = () => {
    if (!input.trim()) return;
    setLines((prev) => [...prev, { t: `QUERY: ${input}`, c: "var(--accent)" }]);
    setInput("");
    setTimeout(() => {
      setLines((prev) => [...prev, { t: "Processing query against standards store...", c: "var(--muted)" }]);
    }, 400);
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded">
      <div className="px-3 py-2.5 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-[var(--info)] to-[var(--accent)] flex items-center justify-center">
            <BrainCircuit className="w-3 h-3 text-black" />
          </div>
          <h3 className="mono text-[10px] font-bold tracking-wider">CLOUD AGENT</h3>
          <span className="mono text-[9px] text-[var(--info)]">RAG · GPT-4o</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="status-dot" />
          <span className="mono text-[9px] text-[var(--muted)]">PROCESSING</span>
        </div>
      </div>
      <div className="flex border-b border-[var(--border)]">
        {["reasoning", "standards", "devices"].map((t) => (
          <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>
      <div ref={streamRef} className="p-3 agent-stream h-[260px] overflow-y-auto">
        {(staticLines || lines).map((l, i) => (
          <div key={i} className="agent-line" style={{ color: l.c }}>
            {l.t && <span style={{ color: "var(--muted)" }}>{"› "}</span>}{l.t}
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-[var(--border)] flex items-center gap-2">
        <span className="mono text-[10px] text-[var(--accent)]">›</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          type="text"
          placeholder="query agent: e.g. summarize today's violations"
          className="flex-1 bg-transparent mono text-[11px] outline-none text-[var(--fg)] placeholder:text-[var(--muted-2)]"
        />
        <button className="btn" onClick={send}>SEND</button>
      </div>
    </div>
  );
}

export default function App() {
  const clock = useClock();
  const [region, setRegion] = useState("AMER");
  const [selectedId, setSelectedId] = useState("INC-2024-0741");
  const [queue, setQueue] = useState(2);
  const [latency, setLatency] = useState(14);
  const [rtt, setRtt] = useState(42);
  const [lastSync, setLastSync] = useState("3s ago");

  useEffect(() => {
    const id = setInterval(() => {
      setQueue(Math.floor(Math.random() * 4));
      setLatency(11 + Math.floor(Math.random() * 8));
      setRtt(35 + Math.floor(Math.random() * 15));
      setLastSync(`${1 + Math.floor(Math.random() * 4)}s ago`);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const selected = VIOLATIONS.find((v) => v.id === selectedId) || VIOLATIONS[0];
  const sevCounts = { sev1: 0, sev2: 0, sev3: 0 };
  VIOLATIONS.forEach((v) => sevCounts[v.sev]++);
  // Keep parity with the reference mock (which shows totals-to-date, not just this list)
  const displayCounts = { sev1: 1, sev2: 3, sev3: 7 };

  return (
    <div className="min-h-screen">
      {/* TOP BAR */}
      <header className="top-bar flex items-center px-4 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-[var(--accent)] flex items-center justify-center relative">
            <ShieldAlert className="w-5 h-5 text-black" style={{ strokeWidth: 2.5 }} />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-[13px] tracking-wider leading-none">SERENIX<span className="text-[var(--accent)]">.</span>AI</div>
            <div className="mono text-[9px] text-[var(--muted)] mt-0.5">SAFETY COMPLIANCE INSPECTOR · v0.9.3</div>
          </div>
        </div>

        <div className="h-8 w-px bg-[var(--border)]" />

        <nav className="flex items-center gap-1">
          <button className="btn active">DASHBOARD</button>
          <button className="btn">INCIDENTS</button>
          <button className="btn">STANDARDS</button>
          <button className="btn">DEVICES</button>
          <button className="btn">REPORTS</button>
        </nav>

        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-4 mono text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="status-dot" />
            <span className="text-[var(--muted)]">EDGE</span>
            <span className="live-num">4/4</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="status-dot" />
            <span className="text-[var(--muted)]">CLOUD</span>
            <span className="text-[var(--safe)]">LINKED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="status-dot warn" />
            <span className="text-[var(--muted)]">QUEUE</span>
            <span className={`live-num ${queue > 1 ? "text-[var(--warn)]" : "text-[var(--accent)]"}`}>{queue}</span>
          </div>
        </div>

        <div className="h-8 w-px bg-[var(--border)]" />

        <div className="flex items-center gap-1">
          <span className="mono text-[9px] text-[var(--muted)] mr-1">REGION</span>
          {["AMER", "EMEA", "APAC"].map((r) => (
            <button key={r} className={`btn ${region === r ? "active" : ""}`} onClick={() => setRegion(r)}>{r}</button>
          ))}
        </div>

        <div className="h-8 w-px bg-[var(--border)]" />

        <div className="mono text-[10px] text-right">
          <div className="text-[var(--fg)]">{clock}</div>
          <div className="text-[9px] text-[var(--muted)]">UTC · DAY <span className="text-[var(--accent)]">7</span>/10</div>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-3 grid grid-cols-12 gap-3 max-w-[1800px] mx-auto">
        {/* LEFT COLUMN */}
        <section className="col-span-12 xl:col-span-8 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h2 className="mono text-[10px] font-bold tracking-wider text-[var(--muted)]">[ 01 ] LIVE FEEDS · EDGE INFERENCE</h2>
              <span className="mono text-[10px] text-[var(--accent)]">YOLOV8-NANO · ONBOARD</span>
            </div>
            <div className="flex items-center gap-4 mono text-[10px]">
              <div className="flex items-center gap-1.5">
                <EyeOff className="w-3 h-3 text-[var(--accent)]" />
                <span className="text-[var(--muted)]">PRIVACY: FACE BLUR</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-[var(--accent)]" />
                <span className="text-[var(--muted)]">AVG LATENCY</span>
                <span className="live-num text-[var(--accent)]">{latency}ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-3 h-3 text-[var(--accent)]" />
                <span className="text-[var(--muted)]">QUEUE</span>
                <span className="live-num">{queue}</span>
              </div>
            </div>
          </div>

          <div className="camera-grid grid grid-cols-2 gap-3">
            {CAMERAS.map((cam) => <CameraCard key={cam.id} cam={cam} />)}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {FACILITIES.map((f) => (
              <div key={f.name} className="bg-[var(--surface)] border border-[var(--border)] rounded p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="mono text-[9px] text-[var(--muted)]">{f.name}</span>
                  <f.icon className={`w-3 h-3 text-[var(--${f.color})]`} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`live-num text-lg text-[var(--${f.color})]`}>{f.comply}</span>
                  <span className="mono text-[9px] text-[var(--muted)]">% COMPLY</span>
                </div>
                <div className="mt-1.5"><Sparkline /></div>
                <div className="mono text-[9px] text-[var(--muted)] mt-1">{f.status}</div>
              </div>
            ))}
          </div>

          <PathToGreen violation={selected} />
        </section>

        {/* RIGHT COLUMN */}
        <aside className="col-span-12 xl:col-span-4 space-y-3">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded">
            <div className="px-3 py-2.5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-3.5 h-3.5 text-[var(--danger)]" />
                <h3 className="mono text-[10px] font-bold tracking-wider">INCIDENT FEED</h3>
                <span className="mono text-[9px] text-[var(--danger)]">[ LIVE ]</span>
              </div>
              <div className="flex items-center gap-2 mono text-[9px]">
                <span className="text-[var(--muted)]">SEV-1</span>
                <span className="live-num text-[var(--danger)]">{displayCounts.sev1}</span>
                <span className="text-[var(--muted)] ml-1">SEV-2</span>
                <span className="live-num text-[var(--warn)]">{displayCounts.sev2}</span>
                <span className="text-[var(--muted)] ml-1">SEV-3</span>
                <span className="live-num text-[var(--info)]">{displayCounts.sev3}</span>
              </div>
            </div>
            <div className="p-2 space-y-1 max-h-[320px] overflow-y-auto">
              {VIOLATIONS.map((v) => (
                <ViolationEntry key={v.id} v={v} selected={v.id === selectedId} onClick={() => setSelectedId(v.id)} />
              ))}
            </div>
          </div>

          <AgentPanel />
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-3">
        <div className="px-4 py-2 flex items-center gap-6 mono text-[10px] flex-wrap">
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-[var(--accent)]" />
            <span className="text-[var(--muted)]">EDGE-PI-01</span>
            <span className="text-[var(--accent)]">38%</span>
            <span className="text-[var(--muted)]">CPU</span>
            <span className="text-[var(--muted)]">·</span>
            <span className="text-[var(--accent)]">51°C</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-[var(--accent)]" />
            <span className="text-[var(--muted)]">EDGE-JET-02</span>
            <span className="text-[var(--accent)]">62%</span>
            <span className="text-[var(--muted)]">CPU</span>
            <span className="text-[var(--muted)]">·</span>
            <span className="text-[var(--accent)]">58°C</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3 text-[var(--safe)]" />
            <span className="text-[var(--muted)]">NETWORK</span>
            <span className="text-[var(--safe)]">STABLE</span>
            <span className="text-[var(--muted)]">·</span>
            <span className="text-[var(--muted)]">RTT</span>
            <span className="text-[var(--accent)]">{rtt}ms</span>
          </div>
          <div className="flex items-center gap-2">
            <Inbox className="w-3 h-3 text-[var(--warn)]" />
            <span className="text-[var(--muted)]">OFFLINE QUEUE</span>
            <span className="text-[var(--warn)]">{queue} packet{queue === 1 ? "" : "s"}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-[var(--accent)]" />
            <span className="text-[var(--muted)]">STANDARDS</span>
            <span className="text-[var(--accent)]">5 loaded</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3 text-[var(--accent)]" />
            <span className="text-[var(--muted)]">PRIVACY</span>
            <span className="text-[var(--accent)]">FACE BLUR · ON-DEVICE</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)]">LAST SYNC</span>
            <span className="text-[var(--accent)]">{lastSync}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)]">UPTIME</span>
            <span className="text-[var(--safe)]">7d 14h 22m</span>
          </div>
        </div>
      </footer>
    </div>
  );
}