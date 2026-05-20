import { useState, useEffect } from "react";

const STORAGE_KEY = "ai-dashboard-v5";
const SHARED = true;

const T = {
  bg:          "#020817",
  bgCard:      "rgba(255,255,255,0.03)",
  bgHeader:    "rgba(2,8,23,0.97)",
  bgRow:       "rgba(14,165,233,0.04)",
  border:      "rgba(14,165,233,0.15)",
  borderHover: "rgba(14,165,233,0.45)",
  primary:     "#38BDF8",   // bright sky blue — readable
  secondary:   "#22D3EE",   // cyan
  accent:      "#7DD3FC",   // soft blue
  dim:         "#0EA5E9",   // medium blue
  // Text — much higher contrast
  textHero:    "#F0F9FF",   // near white
  textPrimary: "#E0F2FE",   // very light blue-white
  textSecond:  "#93C5FD",   // medium blue-white
  textMuted:   "#4B9ECF",   // readable muted
  textDim:     "#1E4D6B",   // dim labels
  // Status colors — vivid & distinct
  green:       "#34D399",
  amber:       "#FBBF24",
  red:         "#F87171",
};

const STATUS_CONFIG = {
  released:    { label: "Released",    color: T.green,    bg: "rgba(52,211,153,0.12)"  },
  in_progress: { label: "In Progress", color: T.amber,    bg: "rgba(251,191,36,0.12)"  },
  upcoming:    { label: "Upcoming",    color: T.primary,  bg: "rgba(56,189,248,0.12)"  },
  blocked:     { label: "Blocked",     color: T.red,      bg: "rgba(248,113,113,0.12)" },
  discovery:   { label: "Discovery",   color: T.accent,   bg: "rgba(125,211,252,0.10)" },
};

const TYPE_CONFIG = {
  poc:        { label: "POC",        color: T.amber    },
  integrated: { label: "Integrated", color: T.green    },
  research:   { label: "Research",   color: T.accent   },
  mvp:        { label: "MVP",        color: T.primary  },
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
    snapshot: {
      summary: "Uses GPT-4o to automatically score and rank product backlog items by effort, business impact, and strategic alignment — reducing manual grooming time by 70%.",
      pocEnvironment: "Azure Dev (dev-ai.acmecorp.internal)",
      productVersion: "v3.2.1 — Released Apr 2026",
      liveUrl: "https://ai.acmecorp.com/backlog",
      nextMilestone: "Multi-team backlog sync — Jun 2026",
      clientFeedback: { sentiment: "Positive", quote: "Cut our sprint planning from 3 hours to 45 minutes. Game changer for the team.", client: "Acme Corp" },
    },
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
    snapshot: {
      summary: "Records and transcribes meetings using Whisper API, then extracts action items with assigned owners and deadlines — delivered as a structured Google Doc within minutes.",
      pocEnvironment: "AWS Sandbox (poc-meetings.skybridge.io)",
      productVersion: "POC v0.4 — In Testing",
      liveUrl: "https://poc.skybridge.io/meeting-ai",
      nextMilestone: "Data privacy sign-off — May 2026",
      clientFeedback: { sentiment: "Positive", quote: "The transcription accuracy is impressive. We just need the privacy approvals sorted.", client: "SkyBridge" },
    },
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
    snapshot: {
      summary: "Converts rough feature ideas into fully structured PRDs with goals, user stories, edge cases, and acceptance criteria — supporting Notion and Google Docs output formats.",
      pocEnvironment: "Internal Staging (staging.internal/prd-gen)",
      productVersion: "MVP — Targeting Jul 2026",
      liveUrl: "",
      nextMilestone: "Internal beta with 3 PMs — Jun 2026",
      clientFeedback: { sentiment: "Needs Work", quote: "Concept is solid but output still needs significant manual editing before it's usable.", client: "Internal Team" },
    },
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
    snapshot: {
      summary: "Aggregates NPS scores, support tickets, and survey responses using K-means clustering to surface weekly insight themes — delivered as an automated email digest every Monday.",
      pocEnvironment: "Production (insights.platform.io)",
      productVersion: "v2.0.0 — Released Mar 2026",
      liveUrl: "https://insights.platform.io/feedback",
      nextMilestone: "Slack digest integration — Jun 2026",
      clientFeedback: { sentiment: "Positive", quote: "We've completely replaced our manual weekly feedback review. Saves the team 5 hours every week.", client: "Pinnacle Group" },
    },
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
    snapshot: {
      summary: "Monitors competitor websites, job postings, and press releases using web scraping and LLM summarisation to deliver weekly competitive signal reports to the strategy team.",
      pocEnvironment: "Not started — in discovery",
      productVersion: "Discovery Phase",
      liveUrl: "",
      nextMilestone: "Build vs buy decision — May 2026",
      clientFeedback: { sentiment: "Neutral", quote: "Interested in the concept but need to see a working prototype before committing resources.", client: "Internal — VP Strategy" },
    },
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
    snapshot: {
      summary: "Pulls sprint data from Jira and generates tailored status updates for three audiences — executive summary, engineering deep-dive, and client-facing progress report.",
      pocEnvironment: "POC (poc-updates.skybridge.io)",
      productVersion: "POC v0.7 — Beta Testing",
      liveUrl: "https://poc-updates.skybridge.io",
      nextMilestone: "Jira webhook automation — May 2026",
      clientFeedback: { sentiment: "Positive", quote: "The exec summary format is exactly what we needed. No more Friday afternoon scramble.", client: "Acme Corp" },
    },
  },
];

const latestProgress = (c) => c.weeklyProgress[c.weeklyProgress.length - 1]?.progress ?? 0;
const allClients = (caps) => [...new Set(caps.flatMap(c => c.clients))].filter(c => c !== "Internal");
const glow = (color, s = 10) => `0 0 ${s}px ${color}88, 0 0 ${s*2}px ${color}22`;

// fonts
const MONO = "'Space Mono', monospace";
const SANS = "'Inter', sans-serif";

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ label, color, bg }) => (
  <span style={{
    padding: "4px 12px", borderRadius: 5, fontSize: 12, fontWeight: 700,
    color, background: bg || color + "18",
    border: `1px solid ${color}55`, letterSpacing: "0.04em", whiteSpace: "nowrap",
    fontFamily: SANS,
  }}>{label}</span>
);

// ── Progress Bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ value, color = T.primary, height = 6 }) => (
  <div style={{ background: "rgba(14,165,233,0.1)", borderRadius: 99, height, overflow: "hidden" }}>
    <div style={{
      height: "100%", width: `${value}%`, borderRadius: 99,
      background: `linear-gradient(90deg, ${color}99, ${color})`,
      boxShadow: `0 0 8px ${color}66`,
      transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
    }} />
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background: T.bgCard, border: `1px solid ${color}25`,
    borderRadius: 12, padding: "22px 20px 18px",
    display: "flex", flexDirection: "column", gap: 6,
    position: "relative", overflow: "hidden",
  }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.6 }} />
    <div style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, fontFamily: SANS }}>{label}</div>
    <div style={{ fontSize: 46, fontWeight: 700, color, lineHeight: 1, fontFamily: MONO, textShadow: glow(color, 8) }}>{value}</div>
    {sub && <div style={{ fontSize: 13, color: T.textDim, fontFamily: SANS, marginTop: 2 }}>{sub}</div>}
  </div>
);

// ── Section ───────────────────────────────────────────────────────────────────
const Section = ({ title, children, action }) => (
  <div style={{
    background: T.bgCard, border: `1px solid ${T.border}`,
    borderRadius: 12, padding: "20px 22px",
    display: "flex", flexDirection: "column", gap: 16,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 4, height: 18, borderRadius: 2, background: T.primary, boxShadow: glow(T.primary, 4) }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: T.textSecond, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: SANS }}>{title}</span>
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ── Donut Chart ───────────────────────────────────────────────────────────────
const DonutChart = ({ caps }) => {
  const size = 190, stroke = 26, r = (size - stroke) / 2;
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
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(14,165,233,0.08)" strokeWidth={stroke} />
        {slices.map((s, i) => (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            style={{ filter: `drop-shadow(0 0 6px ${s.color}88)`, transition: "all 0.6s ease" }}
          />
        ))}
        <text x={size/2} y={size/2 - 10} textAnchor="middle"
          fill={T.textHero} fontSize={34} fontWeight={700} fontFamily={MONO}
          style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px` }}>
          {total}
        </text>
        <text x={size/2} y={size/2 + 16} textAnchor="middle"
          fill={T.textDim} fontSize={11} fontFamily={SANS}
          style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px` }}>
          capabilities
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {groups.map(g => (
          <div key={g.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: g.color, flexShrink: 0, boxShadow: glow(g.color, 4) }} />
            <span style={{ fontSize: 14, color: T.textSecond, minWidth: 90, fontFamily: SANS }}>{g.label}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: g.color, fontFamily: MONO, textShadow: glow(g.color, 4), minWidth: 24 }}>{g.count}</span>
            <span style={{ fontSize: 12, color: T.textDim, fontFamily: SANS }}>{Math.round(g.count/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Bar Chart ─────────────────────────────────────────────────────────────────
const BarChart = ({ caps }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 100 }}>
      {caps.map(cap => {
        const prog = latestProgress(cap);
        const cfg = STATUS_CONFIG[cap.status];
        const h = Math.max((prog / 100) * 84, 3);
        return (
          <div key={cap.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }} title={`${cap.title}: ${prog}%`}>
            <span style={{ fontSize: 11, color: cfg.color, fontWeight: 700, fontFamily: MONO }}>{prog}%</span>
            <div style={{
              width: "100%", height: h, borderRadius: "4px 4px 0 0",
              background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}55)`,
              boxShadow: glow(cfg.color, 6), transition: "height 0.7s ease",
            }} />
          </div>
        );
      })}
    </div>
    <div style={{ display: "flex", gap: 10 }}>
      {caps.map(cap => (
        <div key={cap.id} style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontSize: 10, color: T.textDim, fontFamily: SANS, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
    <div style={{ display: "flex", flexDirection: "column" }}>
      {sorted.map((cap, i) => {
        const cfg = STATUS_CONFIG[cap.status];
        const prog = latestProgress(cap);
        return (
          <div key={cap.id} onClick={() => onSelect(cap)} style={{
            display: "grid", gridTemplateColumns: "220px 14px 1fr 110px",
            gap: 16, alignItems: "center", padding: "13px 8px",
            borderBottom: i < sorted.length-1 ? `1px solid rgba(14,165,233,0.08)` : "none",
            cursor: "pointer", borderRadius: 8, transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.bgRow}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 14, color: T.textPrimary, fontWeight: 600, fontFamily: SANS }}>{cap.title.length > 28 ? cap.title.slice(0,28)+"…" : cap.title}</span>
              <span style={{ fontSize: 12, color: T.textDim, fontFamily: SANS }}>{cap.owner?.split(" ")[0]}</span>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: cfg.color, boxShadow: glow(cfg.color, 6), flexShrink: 0 }} />
            <ProgressBar value={prog} color={cfg.color} height={6} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: T.textMuted, fontFamily: SANS }}>{cap.releaseDate || "TBD"}</div>
              <div style={{ fontSize: 14, color: cfg.color, fontWeight: 700, fontFamily: MONO }}>{prog}%</div>
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
            <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: SANS, fontWeight: 700 }}>Client</th>
            {caps.map(cap => (
              <th key={cap.id} style={{ padding: "8px 6px", fontSize: 11, color: T.textMuted, textAlign: "center", fontFamily: SANS }}>
                <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap", maxHeight: 90, overflow: "hidden" }}>
                  {cap.title.length > 18 ? cap.title.slice(0,18)+"…" : cap.title}
                </div>
              </th>
            ))}
            <th style={{ padding: "10px 10px", fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: SANS, fontWeight: 700 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, ri) => {
            const clientCaps = caps.filter(c => c.clients.includes(client));
            return (
              <tr key={client} style={{ borderTop: `1px solid rgba(14,165,233,0.08)` }}>
                <td style={{ padding: "11px 14px", fontSize: 14, color: T.textPrimary, fontWeight: 600, whiteSpace: "nowrap", fontFamily: SANS }}>{client}</td>
                {caps.map(cap => {
                  const has = cap.clients.includes(client);
                  const cfg = STATUS_CONFIG[cap.status];
                  return (
                    <td key={cap.id} style={{ padding: "8px 6px", textAlign: "center" }}>
                      {has ? (
                        <div onClick={() => onSelect(cap)} style={{
                          width: 30, height: 30, borderRadius: 6, margin: "0 auto",
                          background: cfg.bg, border: `1px solid ${cfg.color}66`,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, color: cfg.color, fontWeight: 700,
                          boxShadow: glow(cfg.color, 4), transition: "all 0.15s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        >✓</div>
                      ) : (
                        <div style={{ width: 30, height: 30, borderRadius: 6, margin: "0 auto", background: "rgba(14,165,233,0.03)", border: "1px solid rgba(14,165,233,0.08)" }} />
                      )}
                    </td>
                  );
                })}
                <td style={{ padding: "11px 10px", textAlign: "center" }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: T.primary, fontFamily: MONO, textShadow: glow(T.primary, 4) }}>{clientCaps.length}</span>
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
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(14,165,233,0.07)" : T.bgCard,
        border: `1px solid ${hov ? cfg.color+"66" : T.border}`,
        borderRadius: 12, padding: "18px 20px", cursor: "pointer",
        transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 12,
        boxShadow: hov ? glow(cfg.color, 8) : "none",
        position: "relative", overflow: "hidden",
      }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${cfg.color}88, transparent)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15, color: T.textHero, fontWeight: 700, lineHeight: 1.4, fontFamily: SANS }}>{cap.title}</h3>
        <Badge label={tcfg.label} color={tcfg.color} />
      </div>
      <ProgressBar value={prog} color={cfg.color} height={5} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {cap.clients.slice(0,3).map((c, i) => (
            <span key={i} style={{ fontSize: 12, color: T.textMuted, background: "rgba(14,165,233,0.06)", padding: "2px 9px", borderRadius: 4, fontFamily: SANS }}>{c}</span>
          ))}
          {cap.clients.length > 3 && <span style={{ fontSize: 12, color: T.textDim, fontFamily: SANS }}>+{cap.clients.length-3}</span>}
        </div>
        <span style={{ fontSize: 16, color: cfg.color, fontWeight: 700, fontFamily: MONO, textShadow: glow(cfg.color, 4) }}>{prog}%</span>
      </div>
    </div>
  );
};

// ── Sentiment config ──────────────────────────────────────────────────────────
const SENTIMENT = {
  "Positive":   { color: T.green,   bg: "rgba(52,211,153,0.12)",  icon: "↑" },
  "Neutral":    { color: T.amber,   bg: "rgba(251,191,36,0.12)",  icon: "→" },
  "Needs Work": { color: T.red,     bg: "rgba(248,113,113,0.12)", icon: "↓" },
};

// ── Snapshot Card ─────────────────────────────────────────────────────────────
const SnapshotCard = ({ cap }) => {
  const s = cap.snapshot || {};
  const cfg = STATUS_CONFIG[cap.status];
  const tcfg = TYPE_CONFIG[cap.type];
  const sentiment = SENTIMENT[s.clientFeedback?.sentiment] || SENTIMENT["Neutral"];
  const prog = latestProgress(cap);
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.border}`,
      borderRadius: 14, overflow: "hidden",
      display: "flex", flexDirection: "column",
      transition: "box-shadow 0.2s",
      position: "relative",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = glow(cfg.color, 8)}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Top accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}44, transparent)` }} />

      {/* Card header */}
      <div style={{ padding: "18px 20px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: T.textHero, fontWeight: 700, fontFamily: SANS, lineHeight: 1.3 }}>{cap.title}</h3>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
            <Badge label={tcfg.label} color={tcfg.color} />
          </div>
        </div>

        {/* Summary */}
        <p style={{ margin: 0, fontSize: 13, color: T.textSecond, lineHeight: 1.7, fontFamily: SANS }}>{s.summary || cap.description}</p>

        {/* Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: T.textMuted, fontFamily: SANS }}>Progress</span>
            <span style={{ fontSize: 13, color: cfg.color, fontWeight: 700, fontFamily: MONO }}>{prog}%</span>
          </div>
          <ProgressBar value={prog} color={cfg.color} height={5} />
        </div>
      </div>

      {/* Info grid */}
      <div style={{ padding: "0 20px 14px", display: "flex", flexDirection: "column", gap: 8 }}>

        {/* POC Environment */}
        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 8, alignItems: "flex-start" }}>
          <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.06em", paddingTop: 2 }}>POC Environment</span>
          <span style={{ fontSize: 13, color: T.textSecond, fontFamily: MONO, background: "rgba(14,165,233,0.06)", padding: "3px 10px", borderRadius: 5, border: `1px solid ${T.border}`, wordBreak: "break-all" }}>{s.pocEnvironment || "—"}</span>
        </div>

        {/* Product Version */}
        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 8, alignItems: "flex-start" }}>
          <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.06em", paddingTop: 2 }}>Product Version</span>
          <span style={{ fontSize: 13, color: T.textPrimary, fontFamily: SANS, fontWeight: 600 }}>{s.productVersion || "—"}</span>
        </div>

        {/* Live URL */}
        {s.liveUrl && (
          <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.06em" }}>Live URL</span>
            <a href={s.liveUrl} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 13, color: T.primary, fontFamily: SANS, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 5,
            }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
            >↗ {s.liveUrl.replace("https://","")}</a>
          </div>
        )}

        {/* Next Milestone */}
        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.06em" }}>Next Milestone</span>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.amber, boxShadow: glow(T.amber, 4), flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: T.amber, fontFamily: SANS, fontWeight: 600 }}>{s.nextMilestone || "TBD"}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin: "0 20px", height: 1, background: `linear-gradient(90deg, ${T.border}, transparent)` }} />

      {/* Client Feedback */}
      {s.clientFeedback && (
        <div style={{ padding: "14px 20px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.06em" }}>Client Feedback</span>
            <span style={{
              padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
              color: sentiment.color, background: sentiment.bg,
              border: `1px solid ${sentiment.color}44`, fontFamily: SANS,
              display: "flex", alignItems: "center", gap: 4,
            }}>{sentiment.icon} {s.clientFeedback.sentiment}</span>
            <span style={{ fontSize: 12, color: T.textDim, fontFamily: SANS, marginLeft: "auto" }}>— {s.clientFeedback.client}</span>
          </div>
          <div style={{
            padding: "12px 14px", borderRadius: 8,
            background: `${sentiment.color}0a`,
            border: `1px solid ${sentiment.color}22`,
            borderLeft: `3px solid ${sentiment.color}`,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: T.textSecond, lineHeight: 1.7, fontFamily: SANS, fontStyle: "italic" }}>"{s.clientFeedback.quote}"</p>
          </div>
        </div>
      )}

      {/* Owner + Release footer */}
      <div style={{ padding: "10px 20px", borderTop: `1px solid rgba(14,165,233,0.07)`, background: "rgba(14,165,233,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: T.textDim, fontFamily: SANS }}>Owner: <span style={{ color: T.textMuted, fontWeight: 600 }}>{cap.owner}</span></span>
        <span style={{ fontSize: 12, color: T.textDim, fontFamily: SANS }}>Release: <span style={{ color: T.textMuted, fontWeight: 600 }}>{cap.releaseDate || "TBD"}</span></span>
      </div>
    </div>
  );
};

// ── Snapshot View ─────────────────────────────────────────────────────────────
const SnapshotView = ({ caps }) => {
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = caps.filter(c => {
    const sentimentMatch = filterSentiment === "all" || c.snapshot?.clientFeedback?.sentiment === filterSentiment;
    const statusMatch = filterStatus === "all" || c.status === filterStatus;
    return sentimentMatch && statusMatch;
  });

  const sentimentCounts = {
    Positive:   caps.filter(c => c.snapshot?.clientFeedback?.sentiment === "Positive").length,
    Neutral:    caps.filter(c => c.snapshot?.clientFeedback?.sentiment === "Neutral").length,
    "Needs Work": caps.filter(c => c.snapshot?.clientFeedback?.sentiment === "Needs Work").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Sentiment summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {Object.entries(SENTIMENT).map(([key, cfg]) => (
          <div key={key} style={{
            background: T.bgCard, border: `1px solid ${cfg.color}22`,
            borderRadius: 12, padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 14,
            cursor: "pointer",
            outline: filterSentiment === key ? `1px solid ${cfg.color}` : "none",
            boxShadow: filterSentiment === key ? glow(cfg.color, 6) : "none",
            transition: "all 0.15s",
          }} onClick={() => setFilterSentiment(filterSentiment === key ? "all" : key)}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: cfg.color, fontWeight: 700, flexShrink: 0 }}>{cfg.icon}</div>
            <div>
              <div style={{ fontSize: 12, color: T.textDim, fontFamily: SANS, marginBottom: 4 }}>{key}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: cfg.color, fontFamily: MONO, lineHeight: 1, textShadow: glow(cfg.color, 6) }}>{sentimentCounts[key]}</div>
            </div>
            <div style={{ position: "absolute", right: 16, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
              <div style={{ width: 3, height: `${(sentimentCounts[key] / caps.length) * 60}%`, borderRadius: 2, background: cfg.color, opacity: 0.4 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: T.textMuted, fontFamily: SANS }}>Status:</span>
        {["all", ...Object.keys(STATUS_CONFIG)].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: "5px 13px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 600,
            background: filterStatus===s ? (STATUS_CONFIG[s]?.bg||"rgba(56,189,248,0.15)") : "rgba(14,165,233,0.04)",
            border: filterStatus===s ? `1px solid ${STATUS_CONFIG[s]?.color||T.primary}` : `1px solid ${T.border}`,
            color: filterStatus===s ? (STATUS_CONFIG[s]?.color||T.primary) : T.textMuted,
            fontFamily: SANS, transition: "all 0.15s",
          }}>{s === "all" ? "All" : STATUS_CONFIG[s].label}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 13, color: T.textDim, fontFamily: SANS }}>{filtered.length} initiative{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))", gap: 18 }}>
        {filtered.map(cap => <SnapshotCard key={cap.id} cap={cap} />)}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.textDim, fontFamily: SANS, fontSize: 15 }}>
          No initiatives match the selected filters.
        </div>
      )}
    </div>
  );
};

// ── CXO View ──────────────────────────────────────────────────────────────────
const CXOView = ({ caps, onSelect }) => {
  const released   = caps.filter(c => c.status === "released");
  const inProgress = caps.filter(c => c.status === "in_progress");
  const pocs       = caps.filter(c => c.type === "poc");
  const upcoming   = caps.filter(c => ["upcoming","discovery"].includes(c.status));
  const clients    = allClients(caps);
  const avgProgress = Math.round(caps.reduce((a,c) => a + latestProgress(c), 0) / caps.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <StatCard label="Released"     value={released.length}   sub={`${released.filter(c=>c.type==="integrated").length} integrated`} color={T.green}   />
        <StatCard label="In Progress"  value={inProgress.length} sub={`${inProgress.filter(c=>c.type==="poc").length} are POC`}          color={T.amber}   />
        <StatCard label="POC"          value={pocs.length}       sub="Proof of concept"                                                  color={T.primary} />
        <StatCard label="Pipeline"     value={upcoming.length}   sub="Upcoming"                                                          color={T.accent}  />
        <StatCard label="Clients"      value={clients.length}    sub="Covered"                                                           color={T.secondary}/>
        <StatCard label="Avg Progress" value={`${avgProgress}%`} sub="All capabilities"                                                  color={T.green}   />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Section title="Status Breakdown"><DonutChart caps={caps} /></Section>
        <Section title="Progress by Capability"><BarChart caps={caps} /></Section>
      </div>

      <Section title="Release Timeline"><Timeline caps={caps} onSelect={onSelect} /></Section>

      {[
        { label: "Released",             color: T.green,    items: released   },
        { label: "In Progress",          color: T.amber,    items: inProgress },
        { label: "POC",                  color: T.primary,  items: pocs       },
        { label: "Upcoming / Discovery", color: T.accent,   items: upcoming   },
      ].filter(s => s.items.length > 0).map(({ label, color, items }) => (
        <div key={label}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: color, boxShadow: glow(color, 6) }} />
            <span style={{ fontSize: 15, fontWeight: 700, color, fontFamily: SANS }}>{label}</span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}44, transparent)` }} />
            <span style={{ fontSize: 13, color: T.textDim, fontFamily: SANS }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
            {items.map(cap => <CXOCard key={cap.id} cap={cap} onClick={() => onSelect(cap)} />)}
          </div>
        </div>
      ))}

      <Section title="Client × Capability Coverage">
        <ClientHeatmap caps={caps} onSelect={onSelect} />
      </Section>
    </div>
  );
};

// ── PM View ───────────────────────────────────────────────────────────────────
const PMView = ({ caps, allCaps, onSelect, onAdd, onEdit, filterStatus, setFilterStatus, filterType, setFilterType }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: T.textMuted, fontFamily: SANS, marginRight: 2 }}>Status:</span>
      {["all", ...Object.keys(STATUS_CONFIG)].map(s => (
        <button key={s} onClick={() => setFilterStatus(s)} style={{
          padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 600,
          background: filterStatus===s ? (STATUS_CONFIG[s]?.bg || "rgba(56,189,248,0.15)") : "rgba(14,165,233,0.04)",
          border: filterStatus===s ? `1px solid ${STATUS_CONFIG[s]?.color || T.primary}` : `1px solid ${T.border}`,
          color: filterStatus===s ? (STATUS_CONFIG[s]?.color || T.primary) : T.textMuted,
          fontFamily: SANS, transition: "all 0.15s",
        }}>{s === "all" ? "All" : STATUS_CONFIG[s].label}</button>
      ))}
      <span style={{ fontSize: 13, color: T.textMuted, fontFamily: SANS, marginLeft: 8, marginRight: 2 }}>Type:</span>
      {["all", ...Object.keys(TYPE_CONFIG)].map(t => (
        <button key={t} onClick={() => setFilterType(t)} style={{
          padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 600,
          background: filterType===t ? "rgba(56,189,248,0.15)" : "rgba(14,165,233,0.04)",
          border: filterType===t ? `1px solid ${T.primary}` : `1px solid ${T.border}`,
          color: filterType===t ? T.primary : T.textMuted,
          fontFamily: SANS, transition: "all 0.15s",
        }}>{t === "all" ? "All" : TYPE_CONFIG[t].label}</button>
      ))}
      <button onClick={onAdd} style={{
        marginLeft: "auto", padding: "8px 20px", borderRadius: 8,
        background: "rgba(56,189,248,0.12)", border: `1px solid ${T.primary}`,
        color: T.primary, fontWeight: 700, fontSize: 14, cursor: "pointer",
        fontFamily: SANS, boxShadow: glow(T.primary, 6), transition: "all 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.2)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(56,189,248,0.12)"}
      >+ Add Capability</button>
    </div>

    <Section title="All Capabilities">
      <div style={{ borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 110px 100px 32px", gap: 0, padding: "11px 16px", borderBottom: `1px solid ${T.border}`, background: "rgba(14,165,233,0.04)" }}>
          {["Capability","Owner","Status","Type","Progress","Release",""].map((h,i) => (
            <span key={i} style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, fontFamily: SANS }}>{h}</span>
          ))}
        </div>
        {caps.map((cap, idx) => {
          const prog = latestProgress(cap);
          const cfg = STATUS_CONFIG[cap.status];
          const tcfg = TYPE_CONFIG[cap.type];
          return (
            <div key={cap.id} onClick={() => onSelect(cap)} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 110px 100px 32px",
              gap: 0, padding: "14px 16px", alignItems: "center",
              borderBottom: idx < caps.length-1 ? `1px solid rgba(14,165,233,0.07)` : "none",
              cursor: "pointer", transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.bgRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 14, color: T.textHero, fontWeight: 600, fontFamily: SANS }}>{cap.title}</span>
                <span style={{ fontSize: 12, color: T.textDim, fontFamily: SANS }}>{cap.clients.slice(0,2).join(", ")}{cap.clients.length>2?` +${cap.clients.length-2}`:""}</span>
              </div>
              <span style={{ fontSize: 13, color: T.textSecond, fontFamily: SANS }}>{cap.owner?.split(" ")[0]||"—"}</span>
              <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
              <Badge label={tcfg.label} color={tcfg.color} />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <ProgressBar value={prog} color={cfg.color} height={5} />
                <span style={{ fontSize: 12, color: T.textMuted, fontFamily: MONO }}>{prog}%</span>
              </div>
              <span style={{ fontSize: 13, color: T.textMuted, fontFamily: SANS }}>{cap.releaseDate||"TBD"}</span>
              <button onClick={e => { e.stopPropagation(); onEdit(cap); }} style={{
                background: "rgba(56,189,248,0.1)", border: `1px solid ${T.border}`,
                color: T.primary, borderRadius: 6, padding: "5px 7px", cursor: "pointer", fontSize: 14,
              }}>✎</button>
            </div>
          );
        })}
      </div>
    </Section>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Section title="Status Breakdown"><DonutChart caps={allCaps} /></Section>
      <Section title="Progress Overview"><BarChart caps={allCaps} /></Section>
    </div>

    <Section title="Stakeholder × Capability Matrix">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[...new Set(allCaps.flatMap(c => c.stakeholders))].slice(0,8).map(stakeholder => (
          <div key={stakeholder} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14, alignItems: "center", padding: "9px 0", borderBottom: `1px solid rgba(14,165,233,0.07)` }}>
            <span style={{ fontSize: 14, color: T.textSecond, fontWeight: 600, fontFamily: SANS }}>{stakeholder}</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {allCaps.filter(c => c.stakeholders.includes(stakeholder)).map(c => {
                const cfg = STATUS_CONFIG[c.status];
                return (
                  <span key={c.id} onClick={() => onSelect(c)} style={{
                    padding: "3px 10px", borderRadius: 5, fontSize: 12, cursor: "pointer",
                    background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`,
                    fontFamily: SANS, transition: "all 0.15s",
                  }}>{c.title.length>22?c.title.slice(0,22)+"…":c.title}</span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Client × Capability Coverage">
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
      position: "fixed", right: 0, top: 0, bottom: 0, width: "min(480px,100vw)",
      background: "#020C1B", borderLeft: `1px solid ${T.border}`,
      zIndex: 900, overflowY: "auto", padding: 28,
      boxShadow: `-32px 0 80px rgba(0,0,0,0.9)`,
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
            <Badge label={TYPE_CONFIG[cap.type].label} color={TYPE_CONFIG[cap.type].color} />
          </div>
          <h2 style={{ margin: 0, fontSize: 20, color: T.textHero, fontFamily: SANS, lineHeight: 1.3, fontWeight: 700 }}>{cap.title}</h2>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 22, flexShrink: 0 }}>✕</button>
      </div>

      <p style={{ margin: 0, color: T.textSecond, fontSize: 14, lineHeight: 1.8, fontFamily: SANS }}>{cap.description}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          ["Impact",   cap.impact, cap.impact==="High"?T.green:cap.impact==="Medium"?T.amber:T.textMuted],
          ["Effort",   cap.effort, cap.effort==="High"?T.red:cap.effort==="Medium"?T.amber:T.green],
          ["Progress", `${prog}%`, prog===100?T.green:T.primary],
        ].map(([label,val,color]) => (
          <div key={label} style={{ background: "rgba(56,189,248,0.05)", borderRadius: 10, padding: "14px 16px", border: `1px solid ${color}22` }}>
            <div style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: SANS }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: MONO, textShadow: glow(color, 6) }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: T.textMuted, fontFamily: SANS, fontWeight: 600 }}>Overall Progress</span>
          <span style={{ fontSize: 14, color: cfg.color, fontWeight: 700, fontFamily: MONO }}>{prog}%</span>
        </div>
        <ProgressBar value={prog} color={cfg.color} height={8} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 13, color: T.textMuted, fontFamily: SANS, fontWeight: 600 }}>Week-by-Week Progress</span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 64 }}>
          {cap.weeklyProgress.map((w,i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: "100%", height: Math.max((w.progress/100)*50,2), borderRadius: "3px 3px 0 0",
                background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}55)`,
                boxShadow: glow(cfg.color,4),
              }} title={w.note} />
              <span style={{ fontSize: 11, color: T.textDim, fontFamily: SANS }}>{w.week}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, fontFamily: SANS, fontStyle: "italic" }}>
          Latest: {cap.weeklyProgress[cap.weeklyProgress.length-1]?.note}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[["Owner", cap.owner||"—"],["Target Release",cap.releaseDate||"TBD"]].map(([label,val]) => (
          <div key={label} style={{ background: "rgba(56,189,248,0.05)", borderRadius: 10, padding: "14px 16px", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: SANS }}>{label}</div>
            <div style={{ fontSize: 15, color: T.textPrimary, fontWeight: 600, fontFamily: SANS }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 13, color: T.textMuted, fontFamily: SANS, fontWeight: 600 }}>Stakeholders</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {cap.stakeholders.map((s,i) => <Badge key={i} label={s} color={T.accent} bg="rgba(125,211,252,0.08)" />)}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 13, color: T.textMuted, fontFamily: SANS, fontWeight: 600 }}>Client Mapping</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {cap.clients.map((c,i) => <Badge key={i} label={c} color={T.primary} bg="rgba(56,189,248,0.08)" />)}
        </div>
      </div>

      {persona === "pm" && cap.decisions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, color: T.textMuted, fontFamily: SANS, fontWeight: 600 }}>Key Decisions</span>
          {cap.decisions.map((d,i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: "rgba(56,189,248,0.05)", borderRadius: 8, border: `1px solid ${T.border}` }}>
              <span style={{ color: T.primary, flexShrink: 0, marginTop: 1 }}>›</span>
              <span style={{ fontSize: 14, color: T.textSecond, lineHeight: 1.6, fontFamily: SANS }}>{d}</span>
            </div>
          ))}
        </div>
      )}

      {persona === "pm" && (
        <button onClick={() => onEdit(cap)} style={{
          padding: 14, borderRadius: 10, border: `1px solid ${T.primary}`,
          background: "rgba(56,189,248,0.08)", color: T.primary,
          fontWeight: 700, cursor: "pointer", fontSize: 15,
          fontFamily: SANS, boxShadow: glow(T.primary, 6),
        }}>Edit Capability</button>
      )}
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const CapabilityModal = ({ cap, onSave, onClose }) => {
  const blank = { id:`cap-${Date.now()}`, title:"", description:"", status:"discovery", type:"poc", owner:"", stakeholders:[], clients:[], weeklyProgress:[], decisions:[], releaseDate:"", impact:"Medium", effort:"Medium" };
  const [form, setForm] = useState(cap ? {...cap} : blank);
  const [stakeholderInput, setStakeholderInput] = useState("");
  const [clientInput, setClientInput] = useState("");
  const [decisionInput, setDecisionInput] = useState("");
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const addWeek = () => set("weeklyProgress",[...form.weeklyProgress,{week:`W${form.weeklyProgress.length+1}`,progress:0,note:""}]);
  const updateWeek = (i,k,v) => { const arr=[...form.weeklyProgress]; arr[i]={...arr[i],[k]:k==="progress"?Number(v):v}; set("weeklyProgress",arr); };
  const inp = { background:"#020C1B", border:`1px solid ${T.border}`, borderRadius:8, padding:"11px 14px", color:T.textPrimary, fontSize:14, outline:"none", width:"100%", boxSizing:"border-box", fontFamily:SANS };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)", padding:16 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#020C1B", border:`1px solid ${T.border}`, borderRadius:16,
        padding:28, width:"100%", maxWidth:580, maxHeight:"90vh", overflowY:"auto",
        display:"flex", flexDirection:"column", gap:16,
        boxShadow:`0 40px 100px rgba(0,0,0,0.95), ${glow(T.primary,12)}`,
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ margin:0, fontSize:20, color:T.textHero, fontFamily:SANS, fontWeight:700 }}>{cap?"Edit Capability":"Add AI Capability"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:22 }}>✕</button>
        </div>
        {[["Title","title","text"],["Owner","owner","text"],["Release Date","releaseDate","date"]].map(([label,key,type])=>(
          <label key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>{label}</span>
            <input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} style={inp} />
          </label>
        ))}
        <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>Description</span>
          <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={3} style={{...inp,resize:"vertical"}} />
        </label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12 }}>
          {[["Status","status",Object.keys(STATUS_CONFIG)],["Type","type",Object.keys(TYPE_CONFIG)],["Impact","impact",["Low","Medium","High"]],["Effort","effort",["Low","Medium","High"]]].map(([label,key,opts])=>(
            <label key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>{label}</span>
              <select value={form[key]} onChange={e=>set(key,e.target.value)} style={{...inp,padding:"11px 10px"}}>
                {opts.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>
        {[
          ["Stakeholders", form.stakeholders, setStakeholderInput, stakeholderInput, "stakeholders", T.accent],
          ["Clients",      form.clients,      setClientInput,       clientInput,       "clients",      T.primary],
        ].map(([label, arr, setInput, input, key, color]) => (
          <div key={key} style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>{label}</span>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {arr.map((s,i)=>(
                <span key={i} style={{ padding:"4px 11px", borderRadius:5, background:`${color}18`, border:`1px solid ${color}44`, color, fontSize:13, display:"flex", alignItems:"center", gap:6, fontFamily:SANS }}>
                  {s} <span style={{ cursor:"pointer", opacity:0.6, fontSize:15 }} onClick={()=>set(key,arr.filter((_,j)=>j!==i))}>✕</span>
                </span>
              ))}
            </div>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&input.trim()){ set(key,[...arr,input.trim()]); setInput(""); }}}
              placeholder={`Add ${label.toLowerCase()} → Enter`} style={inp} />
          </div>
        ))}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>Key Decisions</span>
          {form.decisions.map((d,i)=>(
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center", padding:"8px 12px", background:"rgba(56,189,248,0.04)", borderRadius:7, border:`1px solid ${T.border}` }}>
              <span style={{ flex:1, fontSize:13, color:T.textSecond, fontFamily:SANS }}>› {d}</span>
              <span style={{ cursor:"pointer", color:T.red, fontSize:13, opacity:0.7 }} onClick={()=>set("decisions",form.decisions.filter((_,j)=>j!==i))}>✕</span>
            </div>
          ))}
          <input value={decisionInput} onChange={e=>setDecisionInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&decisionInput.trim()){ set("decisions",[...form.decisions,decisionInput.trim()]); setDecisionInput(""); }}}
            placeholder="Log a decision → Enter" style={inp} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>Weekly Progress</span>
            <button onClick={addWeek} style={{ background:"rgba(56,189,248,0.1)", border:`1px solid ${T.border}`, color:T.primary, borderRadius:7, padding:"6px 14px", fontSize:13, cursor:"pointer", fontFamily:SANS, fontWeight:600 }}>+ Add Week</button>
          </div>
          {form.weeklyProgress.map((w,i)=>(
            <div key={i} style={{ display:"grid", gridTemplateColumns:"52px 70px 1fr", gap:10, alignItems:"center" }}>
              <span style={{ fontSize:13, color:T.textMuted, fontWeight:700, fontFamily:MONO }}>{w.week}</span>
              <input type="number" min={0} max={100} value={w.progress} onChange={e=>updateWeek(i,"progress",e.target.value)} style={{...inp,padding:"8px 10px"}} />
              <input value={w.note} onChange={e=>updateWeek(i,"note",e.target.value)} placeholder="Note" style={{...inp,padding:"8px 12px"}} />
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:6 }}>
          <button onClick={onClose} style={{ padding:"11px 24px", borderRadius:10, background:"transparent", border:`1px solid ${T.border}`, color:T.textMuted, cursor:"pointer", fontSize:14, fontFamily:SANS }}>Cancel</button>
          <button onClick={()=>onSave(form)} style={{ padding:"11px 24px", borderRadius:10, background:"rgba(56,189,248,0.15)", border:`1px solid ${T.primary}`, color:T.primary, fontWeight:700, cursor:"pointer", fontSize:14, fontFamily:SANS, boxShadow:glow(T.primary,8) }}>Save Capability</button>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AIDashboard() {
  const [persona, setPersona] = useState("snapshot");
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
    link.href = "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap";
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
    const updated = exists ? caps.map(c => c.id===form.id?form:c) : [...caps, form];
    await save(updated);
    setEditing(null); setAddingNew(false);
    if (selected?.id === form.id) setSelected(form);
  };

  const filtered = caps.filter(c =>
    (filterStatus==="all"||c.status===filterStatus) &&
    (filterType==="all"||c.type===filterType)
  );

  if (loading) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:T.primary, fontFamily:SANS, fontSize:16 }}>Loading dashboard…</div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      fontFamily: SANS, color: T.textPrimary,
      backgroundImage: `
        radial-gradient(ellipse 80% 40% at 10% 0%, rgba(14,165,233,0.1) 0%, transparent 60%),
        radial-gradient(ellipse 60% 30% at 90% 10%, rgba(6,182,212,0.07) 0%, transparent 60%)
      `,
    }}>
      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${T.border}`, padding: "0 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, background: T.bgHeader,
        backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 800,
        boxShadow: `0 1px 0 ${T.border}, 0 4px 30px rgba(0,0,0,0.6)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            border: `1px solid ${T.primary}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: T.primary,
            fontFamily: MONO, boxShadow: glow(T.primary, 10),
          }}>AI</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: SANS, color: T.textHero, letterSpacing: "-0.01em" }}>AI Capabilities</div>
            <div style={{ fontSize: 11, color: T.textDim, fontFamily: SANS, letterSpacing: "0.04em" }}>
              Product Intelligence · {new Date().toLocaleDateString("en-US", {month:"short",day:"numeric",year:"numeric"})}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {saveStatus && <span style={{ fontSize: 13, color: T.green, fontFamily: SANS }}>{saveStatus}</span>}
          <span style={{ fontSize: 11, color: T.textDim, fontFamily: SANS, border: `1px solid ${T.border}`, padding: "3px 10px", borderRadius: 5 }}>Shared · Live</span>
          <div style={{ display: "flex", background: "rgba(14,165,233,0.05)", borderRadius: 8, padding: 3, border: `1px solid ${T.border}` }}>
            {[["snapshot","AI Snapshot"],["cxo","CXO View"],["pm","PM View"]].map(([key,label]) => (
              <button key={key} onClick={() => setPersona(key)} style={{
                padding: "7px 18px", borderRadius: 6, border: "none", cursor: "pointer",
                background: persona===key ? "rgba(56,189,248,0.18)" : "transparent",
                color: persona===key ? T.primary : T.textMuted,
                fontWeight: 700, fontSize: 14, transition: "all 0.2s",
                fontFamily: SANS,
                outline: persona===key ? `1px solid ${T.primary}` : "none",
                boxShadow: persona===key ? glow(T.primary, 5) : "none",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </header>

      {/* Status bar */}
      <div style={{ padding: "8px 28px", borderBottom: `1px solid rgba(14,165,233,0.07)`, display: "flex", gap: 24, alignItems: "center", background: "rgba(2,8,23,0.9)", flexWrap: "wrap" }}>
        {Object.entries(STATUS_CONFIG).map(([key,cfg]) => {
          const count = caps.filter(c => c.status===key).length;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: cfg.color, boxShadow: glow(cfg.color,5) }} />
              <span style={{ fontSize: 13, color: T.textMuted, fontFamily: SANS }}>{cfg.label}</span>
              <span style={{ fontSize: 15, color: cfg.color, fontWeight: 700, fontFamily: MONO }}>{count}</span>
            </div>
          );
        })}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, boxShadow: glow(T.green,6) }} />
          <span style={{ fontSize: 12, color: T.textDim, fontFamily: SANS }}>System Online</span>
        </div>
      </div>

      <main style={{ padding: "26px 28px", maxWidth: 1200, margin: "0 auto" }}>
        {persona==="snapshot"
          ? <SnapshotView caps={caps} />
          : persona==="cxo"
          ? <CXOView caps={caps} onSelect={setSelected} />
          : <PMView caps={filtered} allCaps={caps} onSelect={setSelected} onAdd={()=>setAddingNew(true)} onEdit={setEditing} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterType={filterType} setFilterType={setFilterType} />
        }
      </main>

      {selected && <DetailPanel cap={selected} persona={persona} onClose={()=>setSelected(null)} onEdit={(cap)=>{ setEditing(cap); setSelected(null); }} />}
      {(editing||addingNew) && <CapabilityModal cap={editing||null} onSave={handleSave} onClose={()=>{ setEditing(null); setAddingNew(false); }} />}
    </div>
  );
}