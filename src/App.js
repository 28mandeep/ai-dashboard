import { useState, useEffect } from "react";

const STORAGE_KEY = "ai-dashboard-v3";
const SHARED = true;

const STATUS_CONFIG = {
  released:    { label: "Released",    color: "#C084FC", bg: "rgba(192,132,252,0.12)" },
  in_progress: { label: "In Progress", color: "#E879F9", bg: "rgba(232,121,249,0.12)" },
  upcoming:    { label: "Upcoming",    color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  blocked:     { label: "Blocked",     color: "#F43F5E", bg: "rgba(244,63,94,0.12)"  },
  discovery:   { label: "Discovery",  color: "#818CF8", bg: "rgba(129,140,248,0.12)" },
};

const TYPE_CONFIG = {
  poc:        { label: "POC",        color: "#E879F9" },
  integrated: { label: "Integrated", color: "#C084FC" },
  research:   { label: "Research",   color: "#818CF8" },
  mvp:        { label: "MVP",        color: "#A78BFA" },
};

const SEED = [
  {
    id: "cap-001", title: "AI Backlog Prioritization",
    description: "Automatically scores and ranks backlog items by effort, impact, and strategic alignment using LLM analysis.",
    status: "released", type: "integrated", owner: "Priya Sharma",
    stakeholders: ["CTO", "Head of Engineering", "VP Product"],
    clients: ["Acme Corp", "NovaTech", "BlueWave"],
    weeklyProgress: [
      { week: "W1", progress: 20, note: "Kickoff & scoping" },
      { week: "W2", progress: 40, note: "Prototype built" },
      { week: "W3", progress: 70, note: "Beta testing with Acme" },
      { week: "W4", progress: 100, note: "Shipped to production" },
    ],
    decisions: ["Chose GPT-4o for classification", "Excluded archived tickets", "Set refresh cadence to 24h"],
    releaseDate: "2026-04-15", impact: "High", effort: "Medium",
  },
  {
    id: "cap-002", title: "Meeting → Action Items",
    description: "Transcribes meeting recordings and extracts structured action items with owners and due dates.",
    status: "in_progress", type: "poc", owner: "Daniel Osei",
    stakeholders: ["VP Operations", "Head of Customer Success"],
    clients: ["SkyBridge", "Meridian Health"],
    weeklyProgress: [
      { week: "W1", progress: 15, note: "Research phase" },
      { week: "W2", progress: 35, note: "Whisper API integration" },
      { week: "W3", progress: 55, note: "Action item extraction" },
      { week: "W4", progress: 60, note: "Blocked on privacy review" },
    ],
    decisions: ["Using Whisper for transcription", "Storing outputs in Google Drive"],
    releaseDate: "2026-06-01", impact: "High", effort: "High",
  },
  {
    id: "cap-003", title: "PRD Auto-Generator",
    description: "Takes raw idea inputs and generates structured PRDs with goals, user stories, and acceptance criteria.",
    status: "upcoming", type: "mvp", owner: "Leila Nazari",
    stakeholders: ["CPO", "Design Lead", "Engineering Leads"],
    clients: ["Internal"],
    weeklyProgress: [
      { week: "W1", progress: 10, note: "Template design" },
      { week: "W2", progress: 25, note: "Prompt engineering" },
      { week: "W3", progress: 25, note: "On hold" },
      { week: "W4", progress: 40, note: "Schema finalized" },
    ],
    decisions: ["Multiple PRD templates", "Output in Notion + Google Docs"],
    releaseDate: "2026-07-10", impact: "Medium", effort: "Low",
  },
  {
    id: "cap-004", title: "User Feedback Synthesizer",
    description: "Ingests survey responses, NPS data, and support tickets to produce weekly insight reports.",
    status: "released", type: "integrated", owner: "Priya Sharma",
    stakeholders: ["Chief Customer Officer", "VP Product", "Data Team"],
    clients: ["Acme Corp", "Pinnacle Group", "Vertex Industries"],
    weeklyProgress: [
      { week: "W1", progress: 30, note: "Data pipeline setup" },
      { week: "W2", progress: 60, note: "Clustering model tuning" },
      { week: "W3", progress: 85, note: "Dashboard integration" },
      { week: "W4", progress: 100, note: "Live for all accounts" },
    ],
    decisions: ["K-means clustering for theme grouping", "Weekly automated email digest"],
    releaseDate: "2026-03-28", impact: "High", effort: "High",
  },
  {
    id: "cap-005", title: "Competitive Intelligence Bot",
    description: "Monitors competitor websites and press releases to surface weekly competitive signals.",
    status: "discovery", type: "research", owner: "Marcus Johansson",
    stakeholders: ["CEO", "VP Strategy", "VP Product"],
    clients: ["Internal"],
    weeklyProgress: [
      { week: "W1", progress: 5,  note: "Stakeholder interviews" },
      { week: "W2", progress: 10, note: "Scoping document" },
      { week: "W3", progress: 15, note: "Vendor evaluation" },
      { week: "W4", progress: 20, note: "Build vs buy pending" },
    ],
    decisions: [],
    releaseDate: "2026-08-30", impact: "Medium", effort: "High",
  },
  {
    id: "cap-006", title: "Stakeholder Update Generator",
    description: "Produces audience-specific status updates from raw sprint data for exec, engineering, and client audiences.",
    status: "in_progress", type: "poc", owner: "Daniel Osei",
    stakeholders: ["VP Product", "Head of PMO"],
    clients: ["SkyBridge", "Acme Corp"],
    weeklyProgress: [
      { week: "W1", progress: 20, note: "Template library built" },
      { week: "W2", progress: 45, note: "Tone calibration testing" },
      { week: "W3", progress: 65, note: "Beta with PMO team" },
      { week: "W4", progress: 75, note: "Feedback integration" },
    ],
    decisions: ["3 audience modes: Exec, Engineering, Client", "Integrates with Jira sprint data"],
    releaseDate: "2026-05-30", impact: "Medium", effort: "Low",
  },
];

const latestProgress = (cap) => cap.weeklyProgress[cap.weeklyProgress.length - 1]?.progress ?? 0;
const allClients = (caps) => [...new Set(caps.flatMap(c => c.clients))].filter(c => c !== "Internal");

// ── Glow utility ─────────────────────────────────────────────────────────────
const glow = (color, strength = 12) => `0 0 ${strength}px ${color}99, 0 0 ${strength * 2}px ${color}44`;

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ label, color, bg }) => (
  <span style={{
    padding: "3px 11px", borderRadius: 99, fontSize: 11, fontWeight: 700,
    color, background: bg || color + "20", border: `1px solid ${color}55`,
    letterSpacing: "0.05em", whiteSpace: "nowrap",
    boxShadow: `0 0 8px ${color}22`,
  }}>{label}</span>
);

// ── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ value, color, height = 4 }) => (
  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 99, height, overflow: "hidden" }}>
    <div style={{
      height: "100%", borderRadius: 99, width: `${value}%`,
      background: `linear-gradient(90deg, ${color}88, ${color})`,
      boxShadow: glow(color, 6),
      transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
    }} />
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${color}22`,
    borderRadius: 18, padding: "22px 22px 18px",
    display: "flex", flexDirection: "column", gap: 6,
    position: "relative", overflow: "hidden",
    transition: "border-color 0.2s",
  }}>
    <div style={{
      position: "absolute", top: -20, right: -20,
      width: 100, height: 100, borderRadius: "50%",
      background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
    }} />
    <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>{label}</div>
    <div style={{
      fontSize: 44, fontWeight: 800, color, lineHeight: 1,
      fontFamily: "'Space Grotesk', sans-serif",
      textShadow: glow(color, 8),
    }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "#4B5563", marginTop: 2 }}>{sub}</div>}
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }} />
  </div>
);

// ── Section ───────────────────────────────────────────────────────────────────
const Section = ({ title, icon, children, action }) => (
  <div style={{
    background: "rgba(255,255,255,0.015)",
    border: "1px solid rgba(192,132,252,0.12)",
    borderRadius: 18, padding: "20px 22px",
    display: "flex", flexDirection: "column", gap: 16,
    backdropFilter: "blur(4px)",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</span>
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ── Donut Chart ───────────────────────────────────────────────────────────────
const DonutChart = ({ caps }) => {
  const size = 180, stroke = 26, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const groups = Object.entries(STATUS_CONFIG)
    .map(([key, cfg]) => ({ key, ...cfg, count: caps.filter(c => c.status === key).length }))
    .filter(g => g.count > 0);
  const total = caps.length;
  let offset = 0;
  const slices = groups.map(g => {
    const dash = (g.count / total) * circ;
    const s = { ...g, dash, gap: circ - dash, offset };
    offset += dash;
    return s;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        {slices.map((s, i) => (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            style={{ filter: `drop-shadow(0 0 8px ${s.color}88)`, transition: "all 0.6s ease" }}
          />
        ))}
        <text x={size/2} y={size/2 - 8} textAnchor="middle" dominantBaseline="middle"
          fill="#E879F9" fontSize={32} fontWeight={800}
          fontFamily="'Space Grotesk', sans-serif"
          style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px`, filter: "drop-shadow(0 0 10px #E879F988)" }}>
          {total}
        </text>
        <text x={size/2} y={size/2 + 16} textAnchor="middle"
          fill="#4B5563" fontSize={10} fontFamily="sans-serif"
          style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px` }}>
          TOTAL
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {groups.map(g => (
          <div key={g.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: g.color, flexShrink: 0, boxShadow: glow(g.color, 5) }} />
            <span style={{ fontSize: 12, color: "#6B7280", minWidth: 82 }}>{g.label}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: g.color, fontFamily: "'Space Grotesk', sans-serif", textShadow: glow(g.color, 5) }}>{g.count}</span>
            <span style={{ fontSize: 11, color: "#374151" }}>{Math.round(g.count / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Bar Chart ─────────────────────────────────────────────────────────────────
const BarChart = ({ caps }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
      {caps.map(cap => {
        const prog = latestProgress(cap);
        const cfg = STATUS_CONFIG[cap.status];
        const h = Math.max((prog / 100) * 74, 3);
        return (
          <div key={cap.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} title={`${cap.title}: ${prog}%`}>
            <span style={{ fontSize: 10, color: cfg.color, fontWeight: 700, textShadow: glow(cfg.color, 4) }}>{prog}%</span>
            <div style={{
              width: "100%", height: h, borderRadius: "4px 4px 0 0",
              background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}55)`,
              boxShadow: glow(cfg.color, 8),
              transition: "height 0.6s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
        );
      })}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      {caps.map(cap => (
        <div key={cap.id} style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontSize: 9, color: "#374151", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {cap.title.split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ── Timeline ──────────────────────────────────────────────────────────────────
const Timeline = ({ caps, onSelect }) => {
  const sorted = [...caps].sort((a, b) => new Date(a.releaseDate || "2099") - new Date(b.releaseDate || "2099"));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {sorted.map((cap, i) => {
        const cfg = STATUS_CONFIG[cap.status];
        const prog = latestProgress(cap);
        return (
          <div key={cap.id} onClick={() => onSelect(cap)} style={{
            display: "grid", gridTemplateColumns: "200px 20px 1fr 90px",
            gap: 14, alignItems: "center", padding: "12px 4px",
            borderBottom: i < sorted.length - 1 ? "1px solid rgba(192,132,252,0.07)" : "none",
            cursor: "pointer", borderRadius: 8, transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(192,132,252,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 13, color: "#D1D5DB", fontWeight: 600 }}>{cap.title.length > 26 ? cap.title.slice(0, 26) + "…" : cap.title}</span>
              <span style={{ fontSize: 10, color: "#4B5563" }}>{cap.owner?.split(" ")[0]}</span>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color, boxShadow: glow(cfg.color, 6), flexShrink: 0 }} />
            <ProgressBar value={prog} color={cfg.color} height={5} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#4B5563" }}>{cap.releaseDate || "TBD"}</div>
              <div style={{ fontSize: 12, color: cfg.color, fontWeight: 700, textShadow: glow(cfg.color, 4) }}>{prog}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Client Heatmap ────────────────────────────────────────────────────────────
const ClientHeatmap = ({ caps, onSelect }) => {
  const clients = allClients(caps);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 480 }}>
        <thead>
          <tr>
            <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.1em" }}>Client</th>
            {caps.map(cap => (
              <th key={cap.id} style={{ padding: "8px 6px", fontSize: 9, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>
                <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap", maxHeight: 80, overflow: "hidden" }}>
                  {cap.title.length > 18 ? cap.title.slice(0, 18) + "…" : cap.title}
                </div>
              </th>
            ))}
            <th style={{ padding: "8px 10px", fontSize: 10, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, ri) => {
            const clientCaps = caps.filter(c => c.clients.includes(client));
            return (
              <tr key={client} style={{ borderTop: "1px solid rgba(192,132,252,0.07)" }}>
                <td style={{ padding: "10px 12px", fontSize: 13, color: "#C084FC", fontWeight: 600, whiteSpace: "nowrap" }}>{client}</td>
                {caps.map(cap => {
                  const has = cap.clients.includes(client);
                  const cfg = STATUS_CONFIG[cap.status];
                  return (
                    <td key={cap.id} style={{ padding: "8px 6px", textAlign: "center" }}>
                      {has ? (
                        <div onClick={() => onSelect(cap)} style={{
                          width: 28, height: 28, borderRadius: 7, margin: "0 auto",
                          background: cfg.bg, border: `1px solid ${cfg.color}66`,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, color: cfg.color, fontWeight: 700,
                          boxShadow: glow(cfg.color, 4), transition: "all 0.15s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                          title={`${cap.title} · ${cfg.label}`}>✓</div>
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: 7, margin: "0 auto", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }} />
                      )}
                    </td>
                  );
                })}
                <td style={{ padding: "10px 10px", textAlign: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#E879F9", fontFamily: "'Space Grotesk', sans-serif", textShadow: glow("#E879F9", 5) }}>{clientCaps.length}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── CXO Card ──────────────────────────────────────────────────────────────────
const CXOCard = ({ cap, onClick }) => {
  const prog = latestProgress(cap);
  const cfg = STATUS_CONFIG[cap.status];
  const tcfg = TYPE_CONFIG[cap.type];
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(192,132,252,0.07)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? cfg.color + "55" : "rgba(192,132,252,0.1)"}`,
        borderRadius: 16, padding: "18px 20px", cursor: "pointer",
        transition: "all 0.2s ease", display: "flex", flexDirection: "column", gap: 12,
        boxShadow: hovered ? glow(cfg.color, 6) : "none",
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15, color: "#E5E7EB", fontWeight: 700, lineHeight: 1.3, fontFamily: "'Space Grotesk', sans-serif" }}>{cap.title}</h3>
        <Badge label={tcfg.label} color={tcfg.color} />
      </div>
      <ProgressBar value={prog} color={cfg.color} height={4} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {cap.clients.slice(0, 3).map((c, i) => (
            <span key={i} style={{ fontSize: 10, color: "#4B5563", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 99 }}>{c}</span>
          ))}
          {cap.clients.length > 3 && <span style={{ fontSize: 10, color: "#374151" }}>+{cap.clients.length - 3}</span>}
        </div>
        <span style={{ fontSize: 13, color: cfg.color, fontWeight: 800, textShadow: glow(cfg.color, 5) }}>{prog}%</span>
      </div>
    </div>
  );
};

// ── CXO View ──────────────────────────────────────────────────────────────────
const CXOView = ({ caps, onSelect }) => {
  const released = caps.filter(c => c.status === "released");
  const inProgress = caps.filter(c => c.status === "in_progress");
  const upcoming = caps.filter(c => ["upcoming", "discovery"].includes(c.status));
  const clients = allClients(caps);
  const avgProgress = Math.round(caps.reduce((a, c) => a + latestProgress(c), 0) / caps.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <StatCard label="Released"     value={released.length}   sub={`${released.filter(c=>c.type==="integrated").length} integrated`} color="#C084FC" />
        <StatCard label="In Progress"  value={inProgress.length} sub={`${inProgress.filter(c=>c.type==="poc").length} POC`}             color="#E879F9" />
        <StatCard label="POC"          value={caps.filter(c=>c.type==="poc").length} sub="Proof of concept"                             color="#A78BFA" />
        <StatCard label="Pipeline"     value={upcoming.length}   sub="Upcoming"                                                          color="#818CF8" />
        <StatCard label="Clients"      value={clients.length}    sub="Covered"                                                           color="#818CF8" />
        <StatCard label="Avg Progress" value={`${avgProgress}%`} sub="All capabilities"                                                  color="#E879F9" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Section title="Status Breakdown" icon="◉"><DonutChart caps={caps} /></Section>
        <Section title="Progress by Capability" icon="▦"><BarChart caps={caps} /></Section>
      </div>

      {/* Timeline */}
      <Section title="Release Timeline" icon="◷"><Timeline caps={caps} onSelect={onSelect} /></Section>

      {/* Status sections */}
      {[
        { label: "Released",             color: "#C084FC", items: released },
        { label: "In Progress",          color: "#E879F9", items: inProgress },
        { label: "POC",                  color: "#A78BFA", items: caps.filter(c => c.type === "poc") },
        { label: "Upcoming / Discovery", color: "#818CF8", items: upcoming },
      ].filter(s => s.items.length > 0).map(({ label, color, items }) => (
        <div key={label}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: glow(color, 6) }} />
            <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
            {items.map(cap => <CXOCard key={cap.id} cap={cap} onClick={() => onSelect(cap)} />)}
          </div>
        </div>
      ))}

      {/* Client heatmap */}
      <Section title="Client × Capability Coverage" icon="⊞">
        <ClientHeatmap caps={caps} onSelect={onSelect} />
      </Section>
    </div>
  );
};

// ── PM View ───────────────────────────────────────────────────────────────────
const PMView = ({ caps, allCaps, onSelect, onAdd, onEdit, filterStatus, setFilterStatus, filterType, setFilterType }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "#4B5563", marginRight: 2 }}>Status:</span>
      {["all", ...Object.keys(STATUS_CONFIG)].map(s => (
        <button key={s} onClick={() => setFilterStatus(s)} style={{
          padding: "5px 13px", borderRadius: 99, fontSize: 12, cursor: "pointer", fontWeight: 600,
          background: filterStatus === s ? (STATUS_CONFIG[s]?.bg || "rgba(192,132,252,0.15)") : "rgba(255,255,255,0.03)",
          border: filterStatus === s ? `1px solid ${STATUS_CONFIG[s]?.color || "#C084FC"}` : "1px solid rgba(192,132,252,0.1)",
          color: filterStatus === s ? (STATUS_CONFIG[s]?.color || "#C084FC") : "#4B5563",
          fontFamily: "inherit", transition: "all 0.15s",
          boxShadow: filterStatus === s ? glow(STATUS_CONFIG[s]?.color || "#C084FC", 4) : "none",
        }}>{s === "all" ? "All" : STATUS_CONFIG[s].label}</button>
      ))}
      <span style={{ fontSize: 11, color: "#4B5563", marginLeft: 6, marginRight: 2 }}>Type:</span>
      {["all", ...Object.keys(TYPE_CONFIG)].map(t => (
        <button key={t} onClick={() => setFilterType(t)} style={{
          padding: "5px 13px", borderRadius: 99, fontSize: 12, cursor: "pointer", fontWeight: 600,
          background: filterType === t ? "rgba(232,121,249,0.12)" : "rgba(255,255,255,0.03)",
          border: filterType === t ? "1px solid rgba(232,121,249,0.5)" : "1px solid rgba(192,132,252,0.1)",
          color: filterType === t ? "#E879F9" : "#4B5563",
          fontFamily: "inherit", transition: "all 0.15s",
        }}>{t === "all" ? "All" : TYPE_CONFIG[t].label}</button>
      ))}
      <button onClick={onAdd} style={{
        marginLeft: "auto", padding: "8px 22px", borderRadius: 10,
        background: "linear-gradient(135deg, #7C3AED, #C084FC)",
        border: "none", color: "#fff", fontWeight: 700, fontSize: 13,
        cursor: "pointer", fontFamily: "inherit",
        boxShadow: "0 4px 20px rgba(192,132,252,0.35)",
      }}>+ Add Capability</button>
    </div>

    <Section title="All Capabilities" icon="▤">
      <div style={{ borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 100px 90px 28px", gap: 0, padding: "10px 14px", borderBottom: "1px solid rgba(192,132,252,0.08)", background: "rgba(0,0,0,0.2)" }}>
          {["Capability", "Owner", "Status", "Type", "Progress", "Release", ""].map((h, i) => (
            <span key={i} style={{ fontSize: 10, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{h}</span>
          ))}
        </div>
        {caps.map((cap, idx) => {
          const prog = latestProgress(cap);
          const cfg = STATUS_CONFIG[cap.status];
          const tcfg = TYPE_CONFIG[cap.type];
          return (
            <div key={cap.id} onClick={() => onSelect(cap)} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 100px 90px 28px",
              gap: 0, padding: "13px 14px", alignItems: "center",
              borderBottom: idx < caps.length - 1 ? "1px solid rgba(192,132,252,0.06)" : "none",
              cursor: "pointer", transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(192,132,252,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 14, color: "#E5E7EB", fontWeight: 600 }}>{cap.title}</span>
                <span style={{ fontSize: 11, color: "#374151" }}>{cap.clients.slice(0, 2).join(", ")}{cap.clients.length > 2 ? ` +${cap.clients.length - 2}` : ""}</span>
              </div>
              <span style={{ fontSize: 13, color: "#6B7280" }}>{cap.owner?.split(" ")[0] || "—"}</span>
              <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
              <Badge label={tcfg.label} color={tcfg.color} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <ProgressBar value={prog} color={cfg.color} height={4} />
                <span style={{ fontSize: 10, color: "#374151" }}>{prog}%</span>
              </div>
              <span style={{ fontSize: 12, color: "#4B5563" }}>{cap.releaseDate || "TBD"}</span>
              <button onClick={e => { e.stopPropagation(); onEdit(cap); }} style={{
                background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.25)",
                color: "#C084FC", borderRadius: 6, padding: "4px 6px", cursor: "pointer", fontSize: 12,
              }}>✎</button>
            </div>
          );
        })}
      </div>
    </Section>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Section title="Status Breakdown" icon="◉"><DonutChart caps={allCaps} /></Section>
      <Section title="Progress Overview" icon="▦"><BarChart caps={allCaps} /></Section>
    </div>

    <Section title="Stakeholder × Capability Matrix" icon="⊠">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...new Set(allCaps.flatMap(c => c.stakeholders))].slice(0, 8).map(stakeholder => (
          <div key={stakeholder} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12, alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(192,132,252,0.06)" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>{stakeholder}</span>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {allCaps.filter(c => c.stakeholders.includes(stakeholder)).map(c => {
                const cfg = STATUS_CONFIG[c.status];
                return (
                  <span key={c.id} onClick={() => onSelect(c)} style={{
                    padding: "2px 9px", borderRadius: 99, fontSize: 11, cursor: "pointer",
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`,
                    transition: "all 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = glow(cfg.color, 4)}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                  >{c.title.length > 22 ? c.title.slice(0, 22) + "…" : c.title}</span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Client × Capability Coverage" icon="⊞">
      <ClientHeatmap caps={allCaps} onSelect={onSelect} />
    </Section>
  </div>
);

// ── Detail Panel ──────────────────────────────────────────────────────────────
const DetailPanel = ({ cap, onClose, onEdit, persona }) => {
  const prog = latestProgress(cap);
  const cfg = STATUS_CONFIG[cap.status];
  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: "min(460px, 100vw)",
      background: "#080510", borderLeft: "1px solid rgba(192,132,252,0.15)",
      zIndex: 900, overflowY: "auto", padding: 28,
      boxShadow: `-32px 0 80px rgba(0,0,0,0.8), inset 1px 0 0 rgba(192,132,252,0.1)`,
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
            <Badge label={TYPE_CONFIG[cap.type].label} color={TYPE_CONFIG[cap.type].color} />
          </div>
          <h2 style={{ margin: 0, fontSize: 20, color: "#F3F4F6", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.3, fontWeight: 700 }}>{cap.title}</h2>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: 20 }}>✕</button>
      </div>

      <p style={{ margin: 0, color: "#6B7280", fontSize: 14, lineHeight: 1.7 }}>{cap.description}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          ["Impact",   cap.impact, cap.impact==="High"?"#C084FC":cap.impact==="Medium"?"#A78BFA":"#4B5563"],
          ["Effort",   cap.effort, cap.effort==="High"?"#F43F5E":cap.effort==="Medium"?"#E879F9":"#C084FC"],
          ["Progress", `${prog}%`, prog===100?"#C084FC":"#818CF8"],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: "rgba(192,132,252,0.05)", borderRadius: 12, padding: "12px 14px", border: `1px solid ${color}22` }}>
            <div style={{ fontSize: 10, color: "#374151", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif", textShadow: glow(color, 6) }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em" }}>Progress</span>
          <span style={{ fontSize: 11, color: cfg.color, fontWeight: 700 }}>{prog}%</span>
        </div>
        <ProgressBar value={prog} color={cfg.color} height={6} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 11, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em" }}>Week-by-Week</span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56 }}>
          {cap.weeklyProgress.map((w, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                width: "100%", height: Math.max((w.progress/100)*44, 2), minHeight: 2,
                borderRadius: "3px 3px 0 0",
                background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}55)`,
                boxShadow: glow(cfg.color, 5),
              }} title={w.note} />
              <span style={{ fontSize: 9, color: "#374151", fontWeight: 600 }}>{w.week}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#4B5563", fontStyle: "italic" }}>
          {cap.weeklyProgress[cap.weeklyProgress.length - 1]?.note}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["Owner", cap.owner||"—"], ["Target Release", cap.releaseDate||"TBD"]].map(([label, val]) => (
          <div key={label} style={{ background: "rgba(192,132,252,0.05)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(192,132,252,0.1)" }}>
            <div style={{ fontSize: 10, color: "#374151", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 14, color: "#D1D5DB", fontWeight: 600 }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 11, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em" }}>Stakeholders</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {cap.stakeholders.map((s, i) => <Badge key={i} label={s} color="#A78BFA" bg="rgba(167,139,250,0.1)" />)}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 11, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em" }}>Client Mapping</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {cap.clients.map((c, i) => <Badge key={i} label={c} color="#C084FC" bg="rgba(192,132,252,0.08)" />)}
        </div>
      </div>

      {persona === "pm" && cap.decisions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em" }}>Key Decisions</span>
          {cap.decisions.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: "#C084FC", marginTop: 2, flexShrink: 0, textShadow: glow("#C084FC", 4) }}>›</span>
              <span style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>{d}</span>
            </div>
          ))}
        </div>
      )}

      {persona === "pm" && (
        <button onClick={() => onEdit(cap)} style={{
          padding: 12, borderRadius: 10,
          border: "1px solid rgba(192,132,252,0.3)",
          background: "rgba(192,132,252,0.08)", color: "#C084FC",
          fontWeight: 700, cursor: "pointer", fontSize: 14,
          fontFamily: "inherit",
          boxShadow: "0 0 20px rgba(192,132,252,0.1)",
        }}>Edit Capability</button>
      )}
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const CapabilityModal = ({ cap, onSave, onClose }) => {
  const blank = { id:`cap-${Date.now()}`, title:"", description:"", status:"discovery", type:"poc", owner:"", stakeholders:[], clients:[], weeklyProgress:[], decisions:[], releaseDate:"", impact:"Medium", effort:"Medium" };
  const [form, setForm] = useState(cap ? { ...cap } : blank);
  const [stakeholderInput, setStakeholderInput] = useState("");
  const [clientInput, setClientInput] = useState("");
  const [decisionInput, setDecisionInput] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addWeek = () => set("weeklyProgress", [...form.weeklyProgress, { week:`W${form.weeklyProgress.length+1}`, progress:0, note:"" }]);
  const updateWeek = (i, k, v) => { const arr=[...form.weeklyProgress]; arr[i]={...arr[i],[k]:k==="progress"?Number(v):v}; set("weeklyProgress",arr); };
  const inp = { background:"#0D0B18", border:"1px solid rgba(192,132,252,0.2)", borderRadius:8, padding:"9px 12px", color:"#D1D5DB", fontSize:14, outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"inherit" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)", padding:16 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#080510", border:"1px solid rgba(192,132,252,0.2)", borderRadius:20,
        padding:28, width:"100%", maxWidth:580, maxHeight:"90vh", overflowY:"auto",
        display:"flex", flexDirection:"column", gap:16,
        boxShadow:"0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(192,132,252,0.08)"
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ margin:0, fontSize:20, color:"#F3F4F6", fontFamily:"'Space Grotesk',sans-serif" }}>{cap?"Edit Capability":"Add AI Capability"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#374151", cursor:"pointer", fontSize:20 }}>✕</button>
        </div>
        {[["Title","title","text"],["Owner","owner","text"],["Release Date","releaseDate","date"]].map(([label,key,type])=>(
          <label key={key} style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <span style={{ fontSize:11, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</span>
            <input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} style={inp} />
          </label>
        ))}
        <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
          <span style={{ fontSize:11, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.08em" }}>Description</span>
          <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={3} style={{ ...inp, resize:"vertical" }} />
        </label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
          {[["Status","status",Object.keys(STATUS_CONFIG)],["Type","type",Object.keys(TYPE_CONFIG)],["Impact","impact",["Low","Medium","High"]],["Effort","effort",["Low","Medium","High"]]].map(([label,key,opts])=>(
            <label key={key} style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <span style={{ fontSize:11, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</span>
              <select value={form[key]} onChange={e=>set(key,e.target.value)} style={{ ...inp, padding:"9px 8px" }}>
                {opts.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>
        {/* Stakeholders */}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={{ fontSize:11, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.08em" }}>Stakeholders</span>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {form.stakeholders.map((s,i)=>(
              <span key={i} style={{ padding:"3px 10px", borderRadius:99, background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.3)", color:"#A78BFA", fontSize:12, display:"flex", alignItems:"center", gap:5 }}>
                {s} <span style={{ cursor:"pointer", opacity:0.6 }} onClick={()=>set("stakeholders",form.stakeholders.filter((_,j)=>j!==i))}>✕</span>
              </span>
            ))}
          </div>
          <input value={stakeholderInput} onChange={e=>setStakeholderInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&stakeholderInput.trim()){ set("stakeholders",[...form.stakeholders,stakeholderInput.trim()]); setStakeholderInput(""); }}}
            placeholder="Add stakeholder → Enter" style={inp} />
        </div>
        {/* Clients */}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={{ fontSize:11, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.08em" }}>Clients</span>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {form.clients.map((c,i)=>(
              <span key={i} style={{ padding:"3px 10px", borderRadius:99, background:"rgba(192,132,252,0.1)", border:"1px solid rgba(192,132,252,0.3)", color:"#C084FC", fontSize:12, display:"flex", alignItems:"center", gap:5 }}>
                {c} <span style={{ cursor:"pointer", opacity:0.6 }} onClick={()=>set("clients",form.clients.filter((_,j)=>j!==i))}>✕</span>
              </span>
            ))}
          </div>
          <input value={clientInput} onChange={e=>setClientInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&clientInput.trim()){ set("clients",[...form.clients,clientInput.trim()]); setClientInput(""); }}}
            placeholder="Add client → Enter" style={inp} />
        </div>
        {/* Decisions */}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={{ fontSize:11, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.08em" }}>Key Decisions</span>
          {form.decisions.map((d,i)=>(
            <div key={i} style={{ display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ flex:1, fontSize:13, color:"#6B7280" }}>• {d}</span>
              <span style={{ cursor:"pointer", color:"#F43F5E88", fontSize:12 }} onClick={()=>set("decisions",form.decisions.filter((_,j)=>j!==i))}>✕</span>
            </div>
          ))}
          <input value={decisionInput} onChange={e=>setDecisionInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&decisionInput.trim()){ set("decisions",[...form.decisions,decisionInput.trim()]); setDecisionInput(""); }}}
            placeholder="Log a decision → Enter" style={inp} />
        </div>
        {/* Weekly */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.08em" }}>Weekly Progress</span>
            <button onClick={addWeek} style={{ background:"rgba(192,132,252,0.1)", border:"1px solid rgba(192,132,252,0.25)", color:"#C084FC", borderRadius:8, padding:"4px 12px", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>+ Week</button>
          </div>
          {form.weeklyProgress.map((w,i)=>(
            <div key={i} style={{ display:"grid", gridTemplateColumns:"48px 60px 1fr", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:12, color:"#374151", fontWeight:600 }}>{w.week}</span>
              <input type="number" min={0} max={100} value={w.progress} onChange={e=>updateWeek(i,"progress",e.target.value)} style={{ ...inp, padding:"5px 8px" }} />
              <input value={w.note} onChange={e=>updateWeek(i,"note",e.target.value)} placeholder="Note" style={{ ...inp, padding:"5px 10px" }} />
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
          <button onClick={onClose} style={{ padding:"10px 22px", borderRadius:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#6B7280", cursor:"pointer", fontSize:14, fontFamily:"inherit" }}>Cancel</button>
          <button onClick={()=>onSave(form)} style={{ padding:"10px 22px", borderRadius:10, background:"linear-gradient(135deg, #7C3AED, #C084FC)", border:"none", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:14, fontFamily:"inherit", boxShadow:"0 4px 20px rgba(192,132,252,0.4)" }}>Save</button>
        </div>
      </div>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function AIDashboard() {
  const [persona, setPersona] = useState("cxo");
  const [caps, setCaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, SHARED);
        setCaps(result?.value ? JSON.parse(result.value) : SEED);
        if (!result?.value) await window.storage.set(STORAGE_KEY, JSON.stringify(SEED), SHARED);
      } catch { setCaps(SEED); }
      setLoading(false);
    })();
  }, []);

  const save = async (updated) => {
    setCaps(updated);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(updated), SHARED);
      setSaveStatus("Saved ✓");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch { setSaveStatus("Save failed"); }
  };

  const handleSave = async (form) => {
    const exists = caps.find(c => c.id === form.id);
    const updated = exists ? caps.map(c => c.id === form.id ? form : c) : [...caps, form];
    await save(updated);
    setEditing(null); setAddingNew(false);
    if (selected?.id === form.id) setSelected(form);
  };

  const filtered = caps.filter(c =>
    (filterStatus === "all" || c.status === filterStatus) &&
    (filterType === "all" || c.type === filterType)
  );

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#05030F", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"#C084FC", fontFamily:"monospace", fontSize:14, textShadow: glow("#C084FC", 8) }}>Loading…</div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#05030F",
      fontFamily: "'DM Sans', sans-serif",
      color: "#E5E7EB",
      backgroundImage: `
        radial-gradient(ellipse 70% 50% at 20% 0%, rgba(124,58,237,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 80% 0%, rgba(232,121,249,0.08) 0%, transparent 60%)
      `,
    }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(192,132,252,0.1)",
        padding: "0 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
        background: "rgba(5,3,15,0.95)",
        backdropFilter: "blur(16px)",
        position: "sticky", top: 0, zIndex: 800,
        boxShadow: "0 1px 0 rgba(192,132,252,0.08), 0 4px 24px rgba(0,0,0,0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #7C3AED, #C084FC)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 4px 20px rgba(192,132,252,0.4), 0 0 30px rgba(124,58,237,0.3)",
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: "#F9FAFB", letterSpacing: "-0.02em" }}>
              AI Capabilities
            </div>
            <div style={{ fontSize: 10, color: "#374151", marginTop: -1, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Product Intelligence · {new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {saveStatus && <span style={{ fontSize: 12, color: "#C084FC", fontFamily: "monospace", textShadow: glow("#C084FC", 4) }}>{saveStatus}</span>}
          <span style={{ fontSize: 10, color: "#1F2937", fontFamily: "monospace", border: "1px solid rgba(192,132,252,0.1)", padding: "3px 8px", borderRadius: 6 }}>shared · live</span>
          <div style={{ display: "flex", background: "rgba(192,132,252,0.06)", borderRadius: 10, padding: 3, border: "1px solid rgba(192,132,252,0.12)" }}>
            {[["cxo","CXO View"],["pm","PM View"]].map(([key, label]) => (
              <button key={key} onClick={() => setPersona(key)} style={{
                padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                background: persona === key ? "linear-gradient(135deg, #7C3AED, #C084FC)" : "transparent",
                color: persona === key ? "#fff" : "#4B5563",
                fontWeight: 700, fontSize: 13, transition: "all 0.2s",
                fontFamily: "inherit",
                boxShadow: persona === key ? "0 2px 16px rgba(192,132,252,0.4)" : "none",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </header>

      {/* Status bar */}
      <div style={{ padding: "8px 28px", borderBottom: "1px solid rgba(192,132,252,0.06)", display: "flex", gap: 22, alignItems: "center", background: "rgba(5,3,15,0.8)" }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = caps.filter(c => c.status === key).length;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, boxShadow: glow(cfg.color, 5) }} />
              <span style={{ fontSize: 11, color: "#1F2937" }}>{cfg.label}</span>
              <span style={{ fontSize: 13, color: cfg.color, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", textShadow: glow(cfg.color, 4) }}>{count}</span>
            </div>
          );
        })}
      </div>

      <main style={{ padding: "28px", maxWidth: 1200, margin: "0 auto" }}>
        {persona === "cxo"
          ? <CXOView caps={caps} onSelect={setSelected} />
          : <PMView caps={filtered} allCaps={caps} onSelect={setSelected} onAdd={() => setAddingNew(true)} onEdit={setEditing} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterType={filterType} setFilterType={setFilterType} />
        }
      </main>

      {selected && <DetailPanel cap={selected} persona={persona} onClose={() => setSelected(null)} onEdit={(cap) => { setEditing(cap); setSelected(null); }} />}
      {(editing || addingNew) && <CapabilityModal cap={editing||null} onSave={handleSave} onClose={() => { setEditing(null); setAddingNew(false); }} />}
    </div>
  );
}