import { useState, useEffect, useRef } from "react";

const palette = {
  teal: "#0d9488", tealLight: "#14b8a6",
  cyan: "#06b6d4", cyanLight: "#22d3ee",
  sky: "#7dd3fc", lavender: "#a5b4fc",
  violet: "#8b5cf6", indigo: "#6366f1",
  indigoDark: "#4338ca",
  bg: "#040d14", surface: "#071525", surfaceUp: "#0b1e30",
  border: "rgba(20,184,166,0.18)",
  textPrimary: "#e2f4f4", textSecondary: "#7fb6c1",
  hcl: "#1565C0",
};

/* ── HCLTech Logo ─────────────────────────────────────────────── */
const HCLLogo = ({ height = 22 }) => (
  <svg height={height} viewBox="0 0 148 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="34" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900"
      fontSize="36" fill="#1565C0" letterSpacing="-1">HCL</text>
    <text x="82" y="34" fontFamily="Arial, sans-serif" fontWeight="400"
      fontSize="28" fill="#1565C0">Tech</text>
  </svg>
);

/* ── Tooltip — pure CSS, no react-dom ────────────────────────── */
// Uses position:relative wrapper + absolute bubble.
// "above" by default; "below" prop flips it.
// overflow:visible is enforced on wrappers so it never clips.
const Tooltip = ({ children, tip, below = false }) => {
  const [show, setShow] = useState(false);
  if (!tip) return <>{children}</>;
  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: "absolute",
          [below ? "top" : "bottom"]: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          width: 260,
          background: "linear-gradient(135deg, #0b1e30fb, #040d14fb)",
          border: "1px solid rgba(20,184,166,0.5)",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 11,
          color: "#e2f4f4",
          lineHeight: 1.65,
          boxShadow: "0 16px 48px rgba(0,0,0,0.85)",
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "normal",
          pointerEvents: "none",
        }}>{tip}</div>
      )}
    </div>
  );
};

/* ── Animated counter ─────────────────────────────────────────── */
const useAnimatedCounter = (target, duration = 1200) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.round(start * 10) / 10);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return val;
};

/* ── Sparkline ────────────────────────────────────────────────── */
const Sparkline = ({ data, color, height = 32 }) => {
  const w = 100, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const gid = `sg${color.replace(/[^a-z0-9]/gi, "")}${Math.random().toString(36).slice(2,6)}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gid})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ── Arc Gauge ────────────────────────────────────────────────── */
const RiskGauge = ({ value, label, color, tip }) => {
  const radius = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * radius;
  const dasharray = circ * 0.75;
  const dashoffset = dasharray * (1 - value / 100);
  return (
    <Tooltip tip={tip}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "help" }}>
        <svg width="88" height="68" viewBox="0 0 88 68">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
            strokeDasharray={dasharray} strokeDashoffset="0" strokeLinecap="round" transform={`rotate(-135 ${cx} ${cy})`} />
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={dasharray} strokeDashoffset={dashoffset}
            strokeLinecap="round" transform={`rotate(-135 ${cx} ${cy})`}
            style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 6px ${color})` }} />
          <text x={cx} y={cy - 2} textAnchor="middle" fill={palette.textPrimary} fontSize="13" fontWeight="700" fontFamily="'DM Mono', monospace">{value}%</text>
        </svg>
        <span style={{ fontSize: 10, color: palette.textSecondary, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
      </div>
    </Tooltip>
  );
};

/* ── Heat Cell ────────────────────────────────────────────────── */
const HeatCell = ({ risk, label, tip }) => {
  const colors = ["#1e3a3a", "#0f766e", "#0d9488", "#f59e0b", "#ef4444"];
  const idx = risk <= 0 ? 0 : risk <= 25 ? 1 : risk <= 50 ? 2 : risk <= 75 ? 3 : 4;
  const riskLabels = ["CLEAR", "LOW", "MOD", "HIGH", "CRIT"];
  return (
    <Tooltip tip={tip} below={true}>
      <div style={{
        background: colors[idx], border: `1px solid ${colors[idx]}88`,
        borderRadius: 6, padding: "8px 10px",
        display: "flex", flexDirection: "column", gap: 3,
        transition: "transform 0.2s", cursor: "help",
        position: "relative",
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.75)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono', monospace" }}>{riskLabels[idx]}</span>
        <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: `${risk}%`, background: "rgba(255,255,255,0.4)" }} />
      </div>
    </Tooltip>
  );
};

/* ── Metric Card ──────────────────────────────────────────────── */
const MetricCard = ({ title, value, unit, trend, sparkData, color, icon, tip }) => {
  const animated = useAnimatedCounter(typeof value === "number" ? value : 0);
  const display = typeof value === "number"
    ? (Number.isInteger(value) ? animated : parseFloat(animated).toFixed(1))
    : value;
  const [hov, setHov] = useState(false);
  return (
    <Tooltip tip={tip} below={true}>
      <div style={{
        background: `linear-gradient(135deg, ${palette.surfaceUp} 0%, ${palette.surface} 100%)`,
        border: `1px solid ${hov ? color + "55" : palette.border}`,
        borderRadius: 12, padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: 8,
        position: "relative", cursor: "help",
        boxShadow: hov ? `0 0 20px ${color}22` : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: palette.textSecondary, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace" }}>{title}</span>
          <span style={{ fontSize: 16 }}>{icon}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: palette.textPrimary, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{display}</span>
          <span style={{ fontSize: 12, color: palette.textSecondary }}>{unit}</span>
          {trend !== undefined && <span style={{ fontSize: 10, color: trend > 0 ? "#f87171" : "#34d399", marginLeft: "auto" }}>{trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%</span>}
        </div>
        {sparkData && <Sparkline data={sparkData} color={color} />}
      </div>
    </Tooltip>
  );
};

/* ── Section Header ───────────────────────────────────────────── */
const SectionHeader = ({ icon, num, title, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
    <div style={{
      width: 28, height: 28, borderRadius: 8,
      background: `${color}22`, border: `1px solid ${color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 800, color, fontFamily: "'DM Mono', monospace",
    }}>{num}</div>
    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color, fontFamily: "'DM Mono', monospace" }}>{title}</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}44, transparent)` }} />
    <span style={{ fontSize: 18 }}>{icon}</span>
  </div>
);

/* ── OWASP dataset ────────────────────────────────────────────── */
const owaspData = [
  { id: "ASI01", label: "Goal Hijack",     risk: 12, tip: "Agent Goal Hijack – Measures prompt deviation score and goal consistency variance. Low risk confirms the agent is executing its assigned mortgage task without being redirected by injected adversarial instructions." },
  { id: "ASI02", label: "Tool Misuse",      risk: 28, tip: "Tool Misuse & Exploitation – Tracks abnormal tool call patterns, parameter injection, and policy gateway blocks. Moderate risk signals that some anomalous tool invocations are being caught and logged." },
  { id: "ASI03", label: "Privilege Abuse",  risk: 18, tip: "Identity & Privilege Abuse – Monitors token scope violations and role mismatches. Low risk means all agents are operating strictly within their authorized permission boundaries as enforced by the Tool Access Broker." },
  { id: "ASI04", label: "Supply Chain",     risk: 45, tip: "Agentic Supply Chain – Monitors model version drift, dependency hash integrity, and unapproved model invocations. Moderate risk flags a detected dependency mismatch requiring remediation before next deployment." },
  { id: "ASI05", label: "Rogue Code",       risk: 8,  tip: "Unexpected Code Execution (RCE) – Detects dynamic code generation and sandbox escape attempts. Near-zero risk confirms no unauthorized execution payloads have been generated or executed by any agent." },
  { id: "ASI06", label: "Memory Poison",    risk: 35, tip: "Memory & Context Poisoning – Tracks memory overwrite anomalies and long-context contamination events. Moderate risk indicates 4 memory overwrite events detected; investigation of embedded instructions is underway." },
  { id: "ASI07", label: "Insecure Comms",   risk: 22, tip: "Insecure Inter-Agent Communication – Monitors for unencrypted agent channels, unauthorized message injection, and inter-agent schema mismatches. Low-moderate risk with 2 schema mismatches currently logged." },
  { id: "ASI08", label: "Cascade Fail",     risk: 15, tip: "Cascading Failures – Tracks multi-agent failure propagation events and orchestrator override activations. Low risk confirms that agent isolation is effectively containing failures to their origin boundary." },
  { id: "ASI09", label: "Trust Exploit",    risk: 62, tip: "Human-Agent Trust Exploitation – Highest current risk area. Flags high-confidence but low-evidence decisions. 3 cases logged this period where confidence score exceeded 90% but supporting data was sparse. Requires HITL review." },
  { id: "ASI10", label: "Rogue Agents",     risk: 5,  tip: "Rogue Agents – Monitors unauthorized agent instantiation, unregistered agent runtimes, and heartbeat irregularities. Near-zero risk confirms all agents are registered, policy-validated, and heartbeat-compliant." },
];

/* ── Agent node ───────────────────────────────────────────────── */
const AgentFlowNode = ({ label, status, color, x, y }) => (
  <g>
    <rect x={x - 40} y={y - 16} width={80} height={32} rx={8} fill={`${color}18`} stroke={color} strokeWidth={1.2} />
    <circle cx={x + 32} cy={y - 12} r={4}
      fill={status === "ok" ? "#34d399" : status === "warn" ? "#f59e0b" : "#f87171"}
      style={{ filter: `drop-shadow(0 0 4px ${status === "ok" ? "#34d399" : status === "warn" ? "#f59e0b" : "#f87171"})` }} />
    <text x={x} y={y + 5} textAnchor="middle" fill={palette.textPrimary} fontSize="9" fontFamily="'DM Mono', monospace" fontWeight="600">{label}</text>
  </g>
);

/* ── Live Pulse ───────────────────────────────────────────────── */
const LivePulse = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(v => v + 1), 1800); return () => clearInterval(t); }, []);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: tick % 2 === 0 ? palette.tealLight : palette.cyan,
        boxShadow: `0 0 8px ${palette.cyan}`, transition: "all 0.9s ease",
      }} />
      <span style={{ fontSize: 10, color: palette.tealLight, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>LIVE</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
export default function GovernanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "owasp",    label: "OWASP Risk" },
    { id: "agents",   label: "Agent Health" },
    { id: "redteam",  label: "Red Team" },
  ];

  return (
    <div style={{ background: palette.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: palette.textPrimary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${palette.bg}; }
        ::-webkit-scrollbar-thumb { background: ${palette.teal}44; border-radius: 2px; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: `linear-gradient(90deg, ${palette.surface} 0%, #071b29 50%, ${palette.surface} 100%)`,
        borderBottom: `1px solid ${palette.border}`,
        padding: "12px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${palette.teal}, ${palette.indigo})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: `0 0 18px ${palette.teal}55`,
          }}>🛡️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em" }}>Governance Telemetry Control Plane</div>
            <div style={{ fontSize: 10, color: palette.textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
              MORTGAGE MULTI-AGENT SYSTEM · OWASP AGENTIC TOP 10
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <LivePulse />
          <span style={{ fontSize: 11, color: palette.textSecondary, fontFamily: "'DM Mono', monospace" }}>{time.toLocaleTimeString()}</span>
          <div style={{
            padding: "4px 12px", borderRadius: 20,
            background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
            fontSize: 10, color: "#34d399", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em",
          }}>ALL SYSTEMS NOMINAL</div>
          {/* HCLTech badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 20,
            background: "rgba(21,101,192,0.12)",
            border: "1px solid rgba(21,101,192,0.35)",
          }}>
            <span style={{ fontSize: 9, color: "#90caf9", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", opacity: 0.8 }}>POWERED BY</span>
            <HCLLogo height={18} />
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{
        display: "flex", gap: 4, padding: "10px 28px",
        borderBottom: `1px solid ${palette.border}`,
        background: `${palette.surface}99`,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "6px 18px", borderRadius: 8,
            background: activeTab === t.id ? `linear-gradient(135deg, ${palette.teal}33, ${palette.indigo}22)` : "transparent",
            border: activeTab === t.id ? `1px solid ${palette.teal}55` : "1px solid transparent",
            color: activeTab === t.id ? palette.tealLight : palette.textSecondary,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            textTransform: "uppercase", letterSpacing: "0.1em",
            fontFamily: "'DM Mono', monospace", transition: "all 0.2s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ════ OVERVIEW ════ */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              <MetricCard title="Escalation Rate" value={4.2} unit="%" trend={-1.3} sparkData={[6,5.5,5,4.8,4.5,4.3,4.2]} color={palette.tealLight} icon="🔺"
                tip="% of loan decisions that exceeded the autonomous confidence threshold and were routed to human review. A declining trend (▼) confirms the model is becoming more reliably confident over time." />
              <MetricCard title="Decision Confidence" value={94} unit="%" trend={0.8} sparkData={[89,90,91,92,93,94,94]} color={palette.cyan} icon="🎯"
                tip="Average model confidence score across all mortgage decisions this period. Scores ≥90% qualify for autonomous approval. Drift below 85% triggers automatic HITL escalation across all active workflows." />
              <MetricCard title="Blocked Tool Calls" value={23} unit="today" trend={12} sparkData={[8,12,15,10,18,21,23]} color={palette.lavender} icon="🔒"
                tip="Tool invocations denied by the Tool Access Broker today. Spikes may indicate privilege escalation attempts, misconfigured agent roles, or active adversarial probing of the permission boundary layer." />
              <MetricCard title="HITL Override Rate" value={2.1} unit="%" trend={-0.4} sparkData={[3.2,2.8,2.5,2.4,2.2,2.1,2.1]} color={palette.violet} icon="👤"
                tip="Rate at which human reviewers reverse the AI recommendation. Low values confirm human-AI alignment. Sustained increases are an early signal of model drift or policy misalignment requiring investigation." />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Autonomy Health */}
              <div style={{ background: `linear-gradient(135deg, ${palette.surfaceUp}, ${palette.surface})`, border: `1px solid ${palette.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <SectionHeader icon="⚡" num="1" title="Autonomy Health" color={palette.tealLight} />
                <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 8 }}>
                  <RiskGauge value={94} label="Confidence Score" color={palette.teal}
                    tip="Average decision confidence across all autonomous mortgage evaluations. Target ≥90%. Values below this automatically route decisions to human-in-the-loop review for manual adjudication." />
                  <RiskGauge value={87} label="Policy Compliance" color={palette.cyan}
                    tip="% of agent actions validated against the current policy version before execution. Any action outside policy boundaries is blocked by the governance layer and logged with full context for audit." />
                  <RiskGauge value={96} label="Decision Integrity" color={palette.sky}
                    tip="Measures immutability and forensic replayability of all logged decisions. 96% means nearly every decision has a complete audit trail: input features, model version, policy version, and agent chain ID." />
                </div>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Auto-approved decisions", val: "87%", pct: 87, color: palette.teal,    tip: "Decisions fully resolved autonomously within confidence and policy thresholds — no human intervention required." },
                    { label: "HITL escalations",        val: "11%", pct: 11, color: palette.cyan,    tip: "Decisions escalated to a human reviewer due to low confidence, high-risk tier, or policy-triggered conditions." },
                    { label: "Manual overrides",        val: "2%",  pct: 2,  color: palette.lavender,tip: "Cases where a human reviewer reversed the AI recommendation. Each requires documented justification in the audit trail." },
                  ].map(r => (
                    <Tooltip key={r.label} tip={r.tip}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "help" }}>
                        <span style={{ fontSize: 10, color: palette.textSecondary, width: 160, fontFamily: "'DM Mono', monospace" }}>{r.label}</span>
                        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                          <div style={{ width: r.val, height: "100%", background: `linear-gradient(90deg, ${r.color}, ${r.color}88)`, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 10, color: r.color, fontFamily: "'DM Mono', monospace", width: 36, textAlign: "right" }}>{r.val}</span>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* OWASP Heatmap */}
              <div style={{ background: `linear-gradient(135deg, ${palette.surfaceUp}, ${palette.surface})`, border: `1px solid ${palette.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <SectionHeader icon="🛡️" num="2" title="Security Posture — OWASP Heatmap" color={palette.violet} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                  {owaspData.map(o => <HeatCell key={o.id} risk={o.risk} label={o.id} tip={o.tip} />)}
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[["CLEAR","#1e3a3a"],["LOW","#0f766e"],["MODERATE","#0d9488"],["HIGH","#f59e0b"],["CRITICAL","#ef4444"]].map(([l,c]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                      <span style={{ fontSize: 9, color: palette.textSecondary, fontFamily: "'DM Mono', monospace" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
              <div style={{ background: `linear-gradient(135deg, ${palette.surfaceUp}, ${palette.surface})`, border: `1px solid ${palette.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <SectionHeader icon="📊" num="3" title="Operational Stability" color={palette.cyan} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  <MetricCard title="Success Rate" value={97.4} unit="%" sparkData={[96,96.5,97,97.2,97.3,97.4,97.4]} color={palette.teal} icon="✅"
                    tip="% of agent workflow runs that completed without error or timeout. Target ≥95%. Values below this trigger automatic investigation of tool failures, orchestration faults, or cascading agent errors." />
                  <MetricCard title="Avg Latency" value={2.3} unit="s" trend={-8} sparkData={[3.5,3.1,2.9,2.7,2.5,2.4,2.3]} color={palette.cyan} icon="⚡"
                    tip="Average end-to-end agent response time. Alert threshold >10s may indicate throttling, network degradation, or adversarial context bloat caused by prompt injection padding the input payload." />
                  <MetricCard title="Token Anomalies" value={3} unit="alerts" sparkData={[1,0,2,1,0,3,3]} color={palette.lavender} icon="⚠️"
                    tip="Agent runs flagged for abnormally high token usage. Spikes can indicate prompt injection attacks, verbose context leakage from memory, or context poisoning via long embedded adversarial content." />
                </div>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${palette.surfaceUp}, ${palette.surface})`, border: `1px solid ${palette.border}`, borderRadius: 14, padding: "20px 22px" }}>
                <SectionHeader icon="🎯" num="4" title="Adversarial Readiness" color={palette.indigo} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Red Team Score",        val: 82, color: palette.teal,    tip: "Composite resilience score from periodic red team exercises against injection, tool abuse, identity spoofing, and privilege escalation attack vectors." },
                    { label: "Fraud Sim Resilience",  val: 91, color: palette.cyan,    tip: "Detection rate in synthetic identity fraud simulations. Measures how accurately the system identifies fabricated borrower profiles designed to bypass approval controls." },
                    { label: "Injection Blocked",     val: 97, color: palette.lavender,tip: "% of prompt injection attempts blocked by guardrails. The remaining 3% are logged as near-misses, triggering model retraining and policy patch cycles." },
                    { label: "Drift Detection",       val: 74, color: palette.violet,  tip: "Coverage score for data and model drift monitoring across credit score distributions, risk thresholds, and confidence inflation trends." },
                  ].map(r => (
                    <Tooltip key={r.label} tip={r.tip}>
                      <div style={{ cursor: "help" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 10, color: palette.textSecondary, fontFamily: "'DM Mono', monospace" }}>{r.label}</span>
                          <span style={{ fontSize: 10, color: r.color, fontFamily: "'DM Mono', monospace" }}>{r.val}%</span>
                        </div>
                        <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3 }}>
                          <div style={{ width: `${r.val}%`, height: "100%", background: `linear-gradient(90deg, ${r.color}, ${r.color}66)`, borderRadius: 3, boxShadow: `0 0 6px ${r.color}66`, transition: "width 1.4s cubic-bezier(0.4,0,0.2,1)" }} />
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ OWASP ════ */}
        {activeTab === "owasp" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {owaspData.map((o, i) => {
              const colors = [palette.teal, palette.cyan, palette.sky, palette.lavender, palette.violet, palette.indigo];
              const c = colors[i % colors.length];
              const rc = o.risk < 20 ? "#34d399" : o.risk < 45 ? "#f59e0b" : "#f87171";
              const metrics = {
                ASI01: ["Prompt deviation: 0.04","Goal consistency: 98.2%","Anomaly flags: 2"],
                ASI02: ["Abnormal call patterns: 3","Parameter injection: 0","Gateway blocks: 23"],
                ASI03: ["Token scope violations: 1","Role mismatches: 0","Escalation events: 2"],
                ASI04: ["Model version drift: LOW","Unapproved invocations: 0","Dep hash mismatches: 1"],
                ASI05: ["Dynamic code gen: 0","Exec payloads flagged: 0","Sandbox escapes: 0"],
                ASI06: ["Memory overwrites: 4","Context contamination: 1","State replay errors: 0"],
                ASI07: ["Unencrypted channels: 0","Msg injections: 0","Schema mismatches: 2"],
                ASI08: ["Failure propagations: 1","Orchestrator overrides: 0","Workflow collapses: 0"],
                ASI09: ["Override w/o justification: 0","Low-evidence highs: 3","Bypass attempts: 0"],
                ASI10: ["Unregistered agents: 0","Heartbeat irregularities: 0","Policy bypasses: 0"],
              };
              return (
                <div key={o.id} style={{
                  background: `linear-gradient(135deg, ${palette.surfaceUp}, ${palette.surface})`,
                  border: `1px solid ${c}33`, borderLeft: `3px solid ${c}`,
                  borderRadius: 12, padding: "16px 18px",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${c}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: c, fontWeight: 700 }}>{o.id}</span>
                      <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 700, color: palette.textPrimary }}>{o.label}</span>
                    </div>
                    <div style={{ padding: "3px 10px", borderRadius: 10, background: `${rc}18`, border: `1px solid ${rc}44`, fontSize: 10, color: rc, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{o.risk}% RISK</div>
                  </div>
                  <p style={{ fontSize: 11, color: palette.textSecondary, lineHeight: 1.65, marginBottom: 12 }}>{o.tip}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {(metrics[o.id] || []).map(m => (
                      <div key={m} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: c, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: palette.textSecondary, fontFamily: "'DM Mono', monospace" }}>{m}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                    <div style={{ width: `${o.risk}%`, height: "100%", background: `linear-gradient(90deg, ${c}, ${c}66)`, borderRadius: 2, boxShadow: `0 0 6px ${c}66` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════ AGENTS ════ */}
        {activeTab === "agents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: `linear-gradient(135deg, ${palette.surfaceUp}, ${palette.surface})`, border: `1px solid ${palette.border}`, borderRadius: 14, padding: "20px 22px" }}>
              <SectionHeader icon="🕸️" num="3" title="Agent Interaction Chain" color={palette.cyan} />
              <svg viewBox="0 0 700 220" style={{ width: "100%", maxHeight: 220 }}>
                {[[170,110,300,60],[170,110,300,110],[170,110,300,160],[300,60,480,80],[300,110,480,130],[300,160,480,160],[480,80,600,110],[480,130,600,110],[480,160,600,110]].map(([x1,y1,x2,y2],i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${palette.teal}44`} strokeWidth={1.2} strokeDasharray="4 3" />
                ))}
                <AgentFlowNode label="ORCHESTRATOR" status="ok"   color={palette.teal}     x={130} y={110} />
                <AgentFlowNode label="CREDIT AGENT" status="ok"   color={palette.cyan}     x={300} y={60}  />
                <AgentFlowNode label="AML AGENT"    status="warn" color={palette.lavender}  x={300} y={110} />
                <AgentFlowNode label="UNDERWRITING" status="ok"   color={palette.violet}   x={300} y={160} />
                <AgentFlowNode label="CORE BANKING" status="ok"   color={palette.sky}      x={480} y={80}  />
                <AgentFlowNode label="FRAUD ENGINE" status="warn" color={palette.indigo}   x={480} y={130} />
                <AgentFlowNode label="LEDGER SVC"   status="ok"   color={palette.cyan}     x={480} y={175} />
                <AgentFlowNode label="DECISION OUT" status="ok"   color={palette.teal}     x={620} y={110} />
              </svg>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                {[["● OK", "#34d399"], ["● WARN (under investigation)", "#f59e0b"], ["● ERROR", "#f87171"]].map(([l, c]) => (
                  <span key={l} style={{ fontSize: 10, color: c, fontFamily: "'DM Mono', monospace" }}>{l}</span>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <MetricCard title="Avg Inter-Agent Latency" value={142} unit="ms" sparkData={[180,165,155,148,145,143,142]} color={palette.teal} icon="⚡"
                tip="Average message round-trip time between agents in the orchestration chain. Latency spikes can indicate memory bloat, cascading overloads, or adversarial context injection increasing inter-agent payload sizes." />
              <MetricCard title="Cascade Incidents" value={1} unit="this week" sparkData={[0,0,1,0,0,0,1]} color={palette.lavender} icon="🔗"
                tip="Times a single agent failure propagated to affect downstream agents this week. Each incident triggers orchestrator override and a root-cause analysis. Currently at 1 — contained and under review." />
              <MetricCard title="Isolation Containment" value={100} unit="%" sparkData={[100,100,100,100,100,100,100]} color={palette.cyan} icon="🛡️"
                tip="Rate at which cascading failures were fully contained within their originating agent boundary. 100% means zero failures have crossed agent trust boundaries this period — isolation controls are working." />
            </div>

            <div style={{ background: `linear-gradient(135deg, ${palette.surfaceUp}, ${palette.surface})`, border: `1px solid ${palette.border}`, borderRadius: 14, padding: "20px 22px" }}>
              <SectionHeader icon="🔧" num="2" title="Tool Access Broker Log" color={palette.violet} />
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 0.8fr", padding: "0 12px 8px", gap: 8 }}>
                {["AGENT","TOOL","PRIVILEGE","STATUS","TIME"].map(h => (
                  <span key={h} style={{ fontSize: 9, color: palette.textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{h}</span>
                ))}
              </div>
              {[
                { agent: "CREDIT AGENT", tool: "CreditBureau.API",  priv: "READ",       status: "APPROVED", time: "0.24s", tip: "Approved: Read-only access to credit bureau data for mortgage eligibility scoring. Within policy scope." },
                { agent: "AML AGENT",    tool: "SanctionsList.DB",  priv: "READ",       status: "APPROVED", time: "0.31s", tip: "Approved: Read-only sanctions database lookup as part of AML compliance check workflow." },
                { agent: "FRAUD ENGINE", tool: "CoreBanking.WRITE", priv: "WRITE",      status: "BLOCKED",  time: "0.08s", tip: "BLOCKED ⚠️ — Fraud Engine attempted a write to Core Banking. This is outside its read-only scope. Flagged as potential privilege escalation (ASI03). Under investigation." },
                { agent: "UNDERWRITING", tool: "LoanLedger.API",    priv: "READ-WRITE", status: "APPROVED", time: "0.19s", tip: "Approved: Read-write access to the loan ledger as part of the authorized underwriting decision workflow." },
                { agent: "FRAUD ENGINE", tool: "ExternalAPI.CALL",  priv: "EXEC",       status: "BLOCKED",  time: "0.05s", tip: "BLOCKED ⚠️ — External API execution is not in Fraud Engine's permission set. Flagged as potential tool misuse (ASI02). Logged for forensic review." },
              ].map((row, i) => (
                <Tooltip key={i} tip={row.tip} >
                  <div style={{
                    display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 0.8fr",
                    alignItems: "center", padding: "8px 12px", gap: 8,
                    background: row.status === "BLOCKED" ? "rgba(248,113,113,0.04)" : i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                    borderRadius: 6, cursor: "help",
                    borderLeft: row.status === "BLOCKED" ? "2px solid rgba(248,113,113,0.4)" : "2px solid transparent",
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = row.status === "BLOCKED" ? "rgba(248,113,113,0.04)" : i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}>
                    <span style={{ fontSize: 10, color: palette.textSecondary, fontFamily: "'DM Mono', monospace" }}>{row.agent}</span>
                    <span style={{ fontSize: 10, color: palette.textPrimary, fontFamily: "'DM Mono', monospace" }}>{row.tool}</span>
                    <span style={{ fontSize: 9, color: palette.lavender, fontFamily: "'DM Mono', monospace" }}>{row.priv}</span>
                    <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", fontWeight: 700, color: row.status === "APPROVED" ? "#34d399" : "#f87171" }}>{row.status}</span>
                    <span style={{ fontSize: 9, color: palette.textSecondary, fontFamily: "'DM Mono', monospace" }}>{row.time}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* ════ RED TEAM ════ */}
        {activeTab === "redteam" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              <MetricCard title="Injection Attempts" value={847} unit="this month" sparkData={[620,680,720,750,790,820,847]} color={palette.teal} icon="💉"
                tip="Total prompt injection attempts detected and logged by the guardrail layer this month across all agent entry points — loan intake forms, document uploads, and API inputs." />
              <MetricCard title="Detection Rate" value={97.3} unit="%" trend={0.4} sparkData={[95,96,96.5,97,97.1,97.2,97.3]} color={palette.cyan} icon="🎯"
                tip="% of simulated and real injection attempts correctly identified and blocked. The remaining ~2.7% are near-misses logged for guardrail model retraining and policy hardening." />
              <MetricCard title="Guardrail Bypasses" value={2} unit="total" sparkData={[0,0,1,0,0,1,2]} color={palette.lavender} icon="🚨"
                tip="Complete guardrail failures where an injection fully executed. These are the highest-priority security incidents — each triggers full forensic review and board-level disclosure in regulated mortgage environments." />
              <MetricCard title="Hardening Cycles" value={14} unit="this quarter" sparkData={[2,4,6,8,10,12,14]} color={palette.violet} icon="🔨"
                tip="Completed governance hardening cycles this quarter. Each cycle may include escalation threshold adjustments, model retraining triggers, or policy version updates based on red team findings and bypass incidents." />
            </div>

            {[
              { title: "Synthetic Identity Fraud Simulation", color: palette.teal, items: [
                { label: "Detection rate",       val: 94.2, good: true,  tip: "% of synthetic borrower profiles correctly flagged as fraudulent. Target ≥95%. Simulated identities include fabricated credit histories and spoofed KYC documents." },
                { label: "False negative rate",  val: 5.8,  good: false, tip: "% of synthetic fraud cases that passed undetected. Each false negative is analyzed to identify which feature patterns successfully evaded the fraud detection model." },
                { label: "Drift vs prev. month", val: 1.2,  note: "↑ improved", tip: "Month-over-month improvement in fraud detection coverage. A positive value means the system caught more fraud than the previous evaluation period — a healthy signal." },
              ]},
              { title: "Prompt Injection Scans", color: palette.cyan, items: [
                { label: "Injections detected",         val: 847, raw: true,              tip: "Total prompt injection attempts flagged this month. Rising volume reflects active red team scanning and is expected — it is the detection rate that matters most." },
                { label: "Injection success rate",      val: 2.7, good: false,            tip: "% of injection attempts that partially or fully influenced agent behavior before interception. Target <1%. Each success triggers an immediate guardrail patch cycle." },
                { label: "Guardrail bypass incidents",  val: 2,   good: false, raw: true, tip: "Complete guardrail failures where an injection fully executed end-to-end. Highest-priority incidents. Both are currently under forensic investigation." },
              ]},
              { title: "Tool Abuse Simulations", color: palette.lavender, items: [
                { label: "Privilege breach attempts",          val: 31,  raw: true,            tip: "Simulated privilege escalation attempts during red team exercises. All 31 were caught by the Tool Access Broker policy enforcement layer — zero succeeded." },
                { label: "Data exfiltration simulations",     val: 0,   good: true, raw: true, tip: "Zero successful data exfiltration attempts in current simulations. Confirms effective DLP controls and agent output filtering are functioning as intended." },
                { label: "Fraud ring simulations blocked",    val: 100, good: true,            tip: "100% of coordinated multi-applicant fraud ring simulations were successfully detected — testing the system's ability to find correlated patterns across loan applications." },
              ]},
              { title: "Data Drift Injection Testing", color: palette.violet, items: [
                { label: "Credit score distribution shift", val: "LOW",   tip: "Measures whether input credit score distribution has shifted from the model's training distribution. LOW means the model is operating within its validated feature space." },
                { label: "Risk threshold shift",           val: "STABLE", tip: "Checks whether risk classification thresholds produce consistent tier distributions over time. Instability may indicate model degradation or dataset poisoning." },
                { label: "Confidence inflation trend",     val: "+0.4%",  tip: "Monitors whether model confidence scores are artificially inflating over time. +0.4% is within acceptable bounds. Values >2% trigger a mandatory model review." },
              ]},
            ].map(section => (
              <div key={section.title} style={{
                background: `linear-gradient(135deg, ${palette.surfaceUp}, ${palette.surface})`,
                border: `1px solid ${section.color}33`, borderLeft: `3px solid ${section.color}`,
                borderRadius: 12, padding: "18px 20px",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: section.color, fontFamily: "'DM Mono', monospace", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>{section.title}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {section.items.map(item => (
                    <Tooltip key={item.label} tip={item.tip} >
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, cursor: "help", padding: 8, borderRadius: 8, transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <span style={{ fontSize: 10, color: palette.textSecondary, fontFamily: "'DM Mono', monospace" }}>{item.label}</span>
                        <span style={{
                          fontSize: 22, fontWeight: 800, fontFamily: "'DM Mono', monospace",
                          color: item.note ? palette.tealLight : item.good === true ? "#34d399" : item.good === false && !item.raw ? "#f87171" : palette.textPrimary,
                        }}>
                          {typeof item.val === "number" && !item.raw ? `${item.val}%` : item.val}
                          {item.note && <span style={{ fontSize: 11, color: palette.tealLight, marginLeft: 6 }}>{item.note}</span>}
                        </span>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{
          marginTop: 32, paddingTop: 16,
          borderTop: `1px solid ${palette.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <span style={{ fontSize: 10, color: palette.textSecondary, fontFamily: "'DM Mono', monospace" }}>
            GOVERNANCE TELEMETRY SPINE v2.1 · ALIGNED TO OWASP AGENTIC TOP 10 (ASI01–ASI10)
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 10, color: palette.textSecondary, fontFamily: "'DM Mono', monospace" }}>
              FORENSIC REPLAY ENABLED · REGULATORY DEFENSIBILITY ACTIVE
            </span>
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "4px 12px", borderRadius: 14,
              background: "rgba(21,101,192,0.1)",
              border: "1px solid rgba(21,101,192,0.28)",
            }}>
              <span style={{ fontSize: 8, color: "#90caf9", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>POWERED BY</span>
              <HCLLogo height={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
