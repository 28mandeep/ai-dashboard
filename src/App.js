import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "ai-dashboard-v6";
const SHARED = true;

const T = {
  bg:         "#020817",
  bgCard:     "rgba(255,255,255,0.03)",
  bgHeader:   "rgba(2,8,23,0.97)",
  bgRow:      "rgba(14,165,233,0.04)",
  border:     "rgba(14,165,233,0.15)",
  primary:    "#38BDF8",
  secondary:  "#22D3EE",
  accent:     "#7DD3FC",
  green:      "#34D399",
  amber:      "#FBBF24",
  red:        "#F87171",
  textHero:   "#F0F9FF",
  textPrimary:"#E0F2FE",
  textSecond: "#93C5FD",
  textMuted:  "#4B9ECF",
  textDim:    "#1E4D6B",
};

const MONO = "'Space Mono', monospace";
const SANS = "'Inter', sans-serif";
const glow = (c, s=10) => `0 0 ${s}px ${c}88, 0 0 ${s*2}px ${c}22`;

const STATUS_CONFIG = {
  released:    { label: "Released",    color: T.green,   bg: "rgba(52,211,153,0.12)"  },
  in_progress: { label: "In Progress", color: T.amber,   bg: "rgba(251,191,36,0.12)"  },
  upcoming:    { label: "Upcoming",    color: T.primary, bg: "rgba(56,189,248,0.12)"  },
  blocked:     { label: "Blocked",     color: T.red,     bg: "rgba(248,113,113,0.12)" },
  discovery:   { label: "Discovery",  color: T.accent,  bg: "rgba(125,211,252,0.10)" },
};

const TYPE_CONFIG = {
  poc:        { label: "POC",        color: T.amber   },
  integrated: { label: "Integrated", color: T.green   },
  research:   { label: "Research",   color: T.accent  },
  mvp:        { label: "MVP",        color: T.primary },
};

const SENTIMENT = {
  "Positive":   { color: T.green, bg: "rgba(52,211,153,0.12)",  icon: "↑" },
  "Neutral":    { color: T.amber, bg: "rgba(251,191,36,0.12)",  icon: "→" },
  "Needs Work": { color: T.red,   bg: "rgba(248,113,113,0.12)", icon: "↓" },
};

// ── Health Score ──────────────────────────────────────────────────────────────
// Signals: status (40pts) + sentiment (40pts) + has live URL (20pts)
const calcHealth = (cap) => {
  let score = 0;
  const statusPts = { released:100, in_progress:70, upcoming:60, discovery:40, blocked:0 };
  score += (statusPts[cap.status] || 0) * 0.4;
  const sentPts = { "Positive":100, "Neutral":60, "Needs Work":20 };
  score += (sentPts[cap.snapshot?.clientFeedback?.sentiment] || 60) * 0.4;
  score += (cap.snapshot?.liveUrl ? 100 : 0) * 0.2;
  if (score >= 75) return { label: "Green",  color: T.green, bg: "rgba(52,211,153,0.12)",  icon: "●" };
  if (score >= 45) return { label: "Amber",  color: T.amber, bg: "rgba(251,191,36,0.12)",  icon: "●" };
  return              { label: "Red",    color: T.red,   bg: "rgba(248,113,113,0.12)", icon: "●" };
};

// ── Real data from Excel ──────────────────────────────────────────────────────
const SEED = [
  {
    id:"cap-001", title:"Auto Alignment",
    description:"Schema matching between Source Attribute & Data Model. Considers Physical Name, Business Name, Business Description, Datatype.",
    status:"released", type:"integrated", owner:"Mandeep Singh",
    clients:["Generic"],
    impact:"Medium", effort:"Medium", releaseDate:"2025-11-20", lastUpdated:"2026-05-20",
    notes:"Available in Opus, behind a feature flag",
    snapshot:{
      summary:"Schema matching between Source Attribute & Data Model. Considers Physical Name, Business Name, Business Description, Datatype.",
      pocEnvironment:"NLPSRH2",
      productVersion:"EDM v19.3.75 — Released Nov 2025",
      liveUrl:"https://qa-nlpsrh2.edm.ihsmarkit.com/login",
      nextMilestone:"Open for all hosted clients — currently behind a feature flag.",
      clientFeedback:{ sentiment:"Positive", quote:"Would love to access all admin portal capabilities on the web including this one.", client:"Generic" },
    },
  },
  {
    id:"cap-002", title:"NLP Global Search",
    description:"A natural language–powered, cross-domain search capability on user-governed data products. Enables users to intuitively discover, connect, and curate data across domains.",
    status:"released", type:"poc", owner:"Mandeep Singh",
    clients:["Mirabaud","Glenmede","BCI"],
    impact:"High", effort:"High", releaseDate:"2026-05-15", lastUpdated:"2026-05-20",
    notes:"",
    snapshot:{
      summary:"A natural language–powered, cross-domain search capability on user-governed data products. Enables users to intuitively discover, connect, and curate data across domains, while building their own custom data products as an extended outer layer on top of the Golden Copy ecosystem.",
      pocEnvironment:"NLPSRH",
      productVersion:"NA",
      liveUrl:"https://qa-nlpsrh.edm.ihsmarkit.com",
      nextMilestone:"Integrate with Opus",
      clientFeedback:{ sentiment:"Positive", quote:"Excited to use this as it provides cross domain search.", client:"Mirabaud" },
    },
  },
  {
    id:"cap-003", title:"Doc Extraction (Structured & Unstructured)",
    description:"Automates ingestion of financial documents by extracting structured & non-structured data from prospectuses, filings, contracts, and regulatory disclosures with high accuracy.",
    status:"released", type:"poc", owner:"Mandeep Singh",
    clients:["Daiwa","Metrobank","Cap Group","Glenmede"],
    impact:"High", effort:"High", releaseDate:"2026-05-15", lastUpdated:"2026-05-20",
    notes:"",
    snapshot:{
      summary:"Automates ingestion of financial documents by extracting structured & non-structured data from prospectuses, filings, contracts, and regulatory disclosures with high accuracy. Maintains model, diagrams, version control, and builds reports.",
      pocEnvironment:"NLPSRH2",
      productVersion:"NA",
      liveUrl:"https://qa-nlpsrh2.edm.ihsmarkit.com/login",
      nextMilestone:"Include Coordinates and Confidence Score",
      clientFeedback:{ sentiment:"Positive", quote:"Is there a possibility to add a configuration layer? We need to capture certain attributes that we're interested in.", client:"Daiwa" },
    },
  },
  {
    id:"cap-004", title:"Agentic Exception Management",
    description:"Automatically detects, classifies, and prioritizes data exceptions to accelerate root-cause analysis and streamline intelligent resolution workflows.",
    status:"released", type:"poc", owner:"Mandeep Singh",
    clients:["LMI","Scotia","SCB","Temasek"],
    impact:"High", effort:"High", releaseDate:"2026-05-15", lastUpdated:"2026-05-20",
    notes:"",
    snapshot:{
      summary:"Automatically detects, classifies, and prioritizes data exceptions to accelerate root-cause analysis and streamline intelligent resolution workflows. Maintains a history of resolutions, continuously learning from past actions to improve accuracy and prevent recurring issues.",
      pocEnvironment:"—",
      productVersion:"NA",
      liveUrl:"",
      nextMilestone:"Work with Opsfleet",
      clientFeedback:{ sentiment:"Needs Work", quote:"No quote captured yet.", client:"LMI" },
    },
  },
  {
    id:"cap-005", title:"NLP Rule Builder",
    description:"Allows users to create, interpret, and optimize financial data rules using natural language, converting business intent into executable logic.",
    status:"released", type:"poc", owner:"Mandeep Singh",
    clients:["Temasek","SCB"],
    impact:"High", effort:"High", releaseDate:"2026-05-15", lastUpdated:"2026-05-20",
    notes:"",
    snapshot:{
      summary:"Allows users to create, interpret, and optimize financial data rules using natural language, converting business intent into executable logic.",
      pocEnvironment:"NLPSRH",
      productVersion:"NA",
      liveUrl:"https://qa-nlpsrh.edm.ihsmarkit.com/login",
      nextMilestone:"Integrate with Opus",
      clientFeedback:{ sentiment:"Neutral", quote:"No quote captured yet.", client:"Temasek" },
    },
  },
  {
    id:"cap-006", title:"AI Driven Metadata Extraction",
    description:"Automatically derives business, technical, and operational metadata from source systems using AI. Enhances data discoverability, strengthens governance controls, and establishes clearer end-to-end lineage.",
    status:"discovery", type:"research", owner:"Mandeep Singh",
    clients:["Internal"],
    impact:"Medium", effort:"High", releaseDate:"", lastUpdated:"",
    notes:"",
    snapshot:{
      summary:"Automatically derives business, technical, and operational metadata from source systems using AI. Enhances data discoverability, strengthens governance controls, and establishes clearer end-to-end lineage across the data ecosystem.",
      pocEnvironment:"—",
      productVersion:"Discovery Phase",
      liveUrl:"",
      nextMilestone:"TBD",
      clientFeedback:{ sentiment:"Neutral", quote:"", client:"Internal" },
    },
  },
  {
    id:"cap-007", title:"AI Based Data Quality Framework (DQF)",
    description:"Proactively builds quality scorecards, and remediates data quality issues using AI-driven profiling, anomaly detection, and adaptive rules.",
    status:"discovery", type:"research", owner:"Mandeep Singh",
    clients:["LMI","SWID Bank","Delta Capital","BNPP"],
    impact:"Medium", effort:"High", releaseDate:"", lastUpdated:"",
    notes:"",
    snapshot:{
      summary:"Proactively builds quality scorecards and remediates data quality issues using AI-driven profiling, anomaly detection, and adaptive rules.",
      pocEnvironment:"—",
      productVersion:"Discovery Phase",
      liveUrl:"",
      nextMilestone:"TBD",
      clientFeedback:{ sentiment:"Neutral", quote:"", client:"LMI" },
    },
  },
  {
    id:"cap-008", title:"AI-Based Cloud Matcher",
    description:"Leverages machine learning to optimize entity and security matching across multiple vendors by dynamically tuning attributes, weights, and thresholds.",
    status:"discovery", type:"research", owner:"Mandeep Singh",
    clients:["Internal"],
    impact:"Medium", effort:"Medium", releaseDate:"", lastUpdated:"",
    notes:"",
    snapshot:{
      summary:"Leverages machine learning to optimize entity and security matching across multiple vendors by dynamically tuning attributes, weights, and thresholds. Performs advanced schema-level search and accurately assigns a common Object ID for precise alignment.",
      pocEnvironment:"—",
      productVersion:"Discovery Phase",
      liveUrl:"",
      nextMilestone:"TBD",
      clientFeedback:{ sentiment:"Neutral", quote:"", client:"Internal" },
    },
  },
  {
    id:"cap-009", title:"AI Change Impact Analysis",
    description:"Predicts downstream impact of schema changes, rule updates, or vendor feed modifications before deployment, reducing operational and regulatory risk.",
    status:"discovery", type:"research", owner:"Mandeep Singh",
    clients:["Internal"],
    impact:"Medium", effort:"Medium", releaseDate:"", lastUpdated:"",
    notes:"",
    snapshot:{
      summary:"Predicts downstream impact of schema changes, rule updates, or vendor feed modifications before deployment, reducing operational and regulatory risk.",
      pocEnvironment:"—",
      productVersion:"Discovery Phase",
      liveUrl:"",
      nextMilestone:"TBD",
      clientFeedback:{ sentiment:"Neutral", quote:"", client:"Internal" },
    },
  },
  {
    id:"cap-010", title:"AI Enabled Web Designer",
    description:"Design complete web pages through an AI chat interface by simply describing the UI — automatically generates layouts with tables, dropdowns, search fields, and checkboxes.",
    status:"upcoming", type:"research", owner:"Mandeep Singh",
    clients:["Internal"],
    impact:"Medium", effort:"Medium", releaseDate:"", lastUpdated:"",
    notes:"",
    snapshot:{
      summary:"Design complete web pages through an AI chat interface by simply describing the UI. Automatically generates layouts with elements like tables, dropdowns, search fields, and checkboxes. Users can iteratively refine through conversational prompts.",
      pocEnvironment:"—",
      productVersion:"Upcoming",
      liveUrl:"",
      nextMilestone:"TBD",
      clientFeedback:{ sentiment:"Neutral", quote:"", client:"Internal" },
    },
  },
  {
    id:"cap-011", title:"AI-Powered Source Hierarchy",
    description:"AI models analyze underlying datasets to automatically recommend the most optimal source hierarchy, ensuring maximum coverage and quality in mastered data.",
    status:"upcoming", type:"research", owner:"Mandeep Singh",
    clients:["Internal"],
    impact:"Medium", effort:"Medium", releaseDate:"", lastUpdated:"",
    notes:"",
    snapshot:{
      summary:"AI models analyze underlying datasets to automatically recommend the most optimal source hierarchy, ensuring maximum coverage and quality in mastered data. The hierarchy dynamically re-evaluates whenever new sources are introduced.",
      pocEnvironment:"—",
      productVersion:"Upcoming",
      liveUrl:"",
      nextMilestone:"TBD",
      clientFeedback:{ sentiment:"Neutral", quote:"", client:"Internal" },
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const allClients = (caps) => [...new Set(caps.flatMap(c => c.clients))].filter(c => c !== "Internal");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});

// ── Atoms ─────────────────────────────────────────────────────────────────────
const Badge = ({ label, color, bg }) => (
  <span style={{ padding:"4px 11px", borderRadius:5, fontSize:12, fontWeight:700, color, background:bg||color+"18", border:`1px solid ${color}44`, letterSpacing:"0.04em", whiteSpace:"nowrap", fontFamily:SANS }}>{label}</span>
);

const HealthBadge = ({ cap }) => {
  const h = calcHealth(cap);
  return <span style={{ padding:"3px 10px", borderRadius:5, fontSize:11, fontWeight:700, color:h.color, background:h.bg, border:`1px solid ${h.color}44`, fontFamily:SANS, display:"flex", alignItems:"center", gap:5 }}><span style={{ textShadow:glow(h.color,4) }}>{h.icon}</span>{h.label}</span>;
};

const ProgressBar = ({ value, color=T.primary, height=6 }) => (
  <div style={{ background:"rgba(14,165,233,0.1)", borderRadius:99, height, overflow:"hidden" }}>
    <div style={{ height:"100%", width:`${value}%`, borderRadius:99, background:`linear-gradient(90deg,${color}88,${color})`, boxShadow:`0 0 8px ${color}66`, transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
  </div>
);

const StatCard = ({ label, value, sub, color }) => (
  <div style={{ background:T.bgCard, border:`1px solid ${color}22`, borderRadius:12, padding:"22px 20px 18px", display:"flex", flexDirection:"column", gap:6, position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${color},transparent)`, opacity:0.6 }} />
    <div style={{ fontSize:12, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600, fontFamily:SANS }}>{label}</div>
    <div style={{ fontSize:44, fontWeight:700, color, lineHeight:1, fontFamily:MONO, textShadow:glow(color,8) }}>{value}</div>
    {sub && <div style={{ fontSize:13, color:T.textDim, fontFamily:SANS, marginTop:2 }}>{sub}</div>}
  </div>
);

const Section = ({ title, children, action }) => (
  <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:12, padding:"20px 22px", display:"flex", flexDirection:"column", gap:14 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:4, height:18, borderRadius:2, background:T.primary, boxShadow:glow(T.primary,4) }} />
        <span style={{ fontSize:13, fontWeight:700, color:T.textSecond, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:SANS }}>{title}</span>
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ── Last Refreshed Banner ─────────────────────────────────────────────────────
const RefreshedBanner = ({ ts }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px", background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.15)", borderRadius:8, width:"fit-content" }}>
    <div style={{ width:7, height:7, borderRadius:"50%", background:T.green, boxShadow:glow(T.green,5) }} />
    <span style={{ fontSize:12, color:T.textMuted, fontFamily:SANS }}>Last refreshed: <span style={{ color:T.green, fontWeight:600 }}>{ts ? fmtDate(ts) : "—"}</span></span>
  </div>
);

// ── Donut Chart ───────────────────────────────────────────────────────────────
const DonutChart = ({ caps }) => {
  const size=190, stroke=26, r=(size-stroke)/2, circ=2*Math.PI*r;
  const groups = Object.entries(STATUS_CONFIG).map(([key,cfg])=>({key,...cfg,count:caps.filter(c=>c.status===key).length})).filter(g=>g.count>0);
  const total = caps.length;
  let offset=0;
  const slices = groups.map(g=>{const dash=(g.count/total)*circ;const s={...g,dash,gap:circ-dash,offset};offset+=dash;return s;});
  return (
    <div style={{ display:"flex", alignItems:"center", gap:28 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(14,165,233,0.08)" strokeWidth={stroke}/>
        {slices.map((s,i)=><circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.offset} style={{filter:`drop-shadow(0 0 6px ${s.color}88)`,transition:"all 0.6s ease"}}/>)}
        <text x={size/2} y={size/2-10} textAnchor="middle" fill={T.textHero} fontSize={34} fontWeight={700} fontFamily={MONO} style={{transform:"rotate(90deg)",transformOrigin:`${size/2}px ${size/2}px`}}>{total}</text>
        <text x={size/2} y={size/2+16} textAnchor="middle" fill={T.textDim} fontSize={11} fontFamily={SANS} style={{transform:"rotate(90deg)",transformOrigin:`${size/2}px ${size/2}px`}}>capabilities</text>
      </svg>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {groups.map(g=>(
          <div key={g.key} style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:g.color, flexShrink:0, boxShadow:glow(g.color,4) }}/>
            <span style={{ fontSize:14, color:T.textSecond, minWidth:90, fontFamily:SANS }}>{g.label}</span>
            <span style={{ fontSize:20, fontWeight:700, color:g.color, fontFamily:MONO, textShadow:glow(g.color,4), minWidth:24 }}>{g.count}</span>
            <span style={{ fontSize:12, color:T.textDim, fontFamily:SANS }}>{Math.round(g.count/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Health Summary ────────────────────────────────────────────────────────────
const HealthSummary = ({ caps }) => {
  const counts = { Green:0, Amber:0, Red:0 };
  caps.forEach(c => counts[calcHealth(c).label]++);
  const items = [
    { label:"Green", count:counts.Green, color:T.green,  bg:"rgba(52,211,153,0.12)",  desc:"On track" },
    { label:"Amber", count:counts.Amber, color:T.amber,  bg:"rgba(251,191,36,0.12)",  desc:"Needs attention" },
    { label:"Red",   count:counts.Red,   color:T.red,    bg:"rgba(248,113,113,0.12)", desc:"At risk" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
      {items.map(it=>(
        <div key={it.label} style={{ background:it.bg, border:`1px solid ${it.color}33`, borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ fontSize:36, fontWeight:700, color:it.color, fontFamily:MONO, textShadow:glow(it.color,6), lineHeight:1 }}>{it.count}</div>
          <div>
            <div style={{ fontSize:14, color:it.color, fontWeight:700, fontFamily:SANS }}>{it.label}</div>
            <div style={{ fontSize:12, color:T.textDim, fontFamily:SANS }}>{it.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── AI Exec Summary ───────────────────────────────────────────────────────────
const ExecSummary = ({ caps }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    const released   = caps.filter(c=>c.status==="released").length;
    const inProgress = caps.filter(c=>c.status==="in_progress").length;
    const blocked    = caps.filter(c=>c.status==="blocked").length;
    const greenCount = caps.filter(c=>calcHealth(c).label==="Green").length;
    const redCount   = caps.filter(c=>calcHealth(c).label==="Red").length;
    const capList    = caps.map(c=>`- ${c.title} (${STATUS_CONFIG[c.status].label}, ${c.type}, owner: ${c.owner}, next: ${c.snapshot?.nextMilestone||"TBD"})`).join("\n");

    const prompt = `You are a Chief Product Officer writing a concise executive portfolio update. Based on the following AI initiative data, write a crisp 3-4 sentence executive summary suitable for a board or leadership audience. Be specific, confident, and highlight what's going well and what needs attention. Do NOT use bullet points — write in flowing prose.

Portfolio snapshot:
- Total initiatives: ${caps.length}
- Released: ${released} | In Progress: ${inProgress} | Blocked: ${blocked}
- Health: ${greenCount} Green, ${redCount} Red
- Initiatives:
${capList}

Write the executive summary now:`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{ role:"user", content:prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.find(b=>b.type==="text")?.text || "Unable to generate summary.";
      setSummary(text);
      setGenerated(true);
    } catch(e) {
      setSummary("Failed to generate summary. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ background:"rgba(56,189,248,0.04)", border:`1px solid ${T.border}`, borderRadius:12, padding:"20px 22px", display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:4, height:18, borderRadius:2, background:T.primary, boxShadow:glow(T.primary,4) }}/>
          <span style={{ fontSize:13, fontWeight:700, color:T.textSecond, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:SANS }}>AI-Generated Exec Summary</span>
          <span style={{ fontSize:11, color:T.textDim, fontFamily:SANS, padding:"2px 8px", border:`1px solid ${T.border}`, borderRadius:4 }}>Powered by Claude</span>
        </div>
        <button onClick={generate} disabled={loading} style={{
          padding:"7px 18px", borderRadius:8, border:`1px solid ${T.primary}`,
          background: loading ? "rgba(56,189,248,0.05)" : "rgba(56,189,248,0.12)",
          color:T.primary, fontWeight:700, fontSize:13, cursor:loading?"not-allowed":"pointer",
          fontFamily:SANS, boxShadow:glow(T.primary,4), transition:"all 0.15s",
        }}>{loading ? "Generating…" : generated ? "Regenerate" : "Generate Summary"}</button>
      </div>
      {loading && (
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:T.primary, animation:"pulse 1s infinite", boxShadow:glow(T.primary,6) }}/>
          <span style={{ fontSize:13, color:T.textMuted, fontFamily:SANS, fontStyle:"italic" }}>Analysing portfolio data…</span>
        </div>
      )}
      {summary && !loading && (
        <p style={{ margin:0, fontSize:15, color:T.textPrimary, lineHeight:1.9, fontFamily:SANS, borderLeft:`3px solid ${T.primary}`, paddingLeft:16 }}>{summary}</p>
      )}
      {!summary && !loading && (
        <p style={{ margin:0, fontSize:13, color:T.textDim, fontFamily:SANS, fontStyle:"italic" }}>Click "Generate Summary" to get an AI-written executive overview of your portfolio.</p>
      )}
    </div>
  );
};

// ── Roadmap View ──────────────────────────────────────────────────────────────
const RoadmapView = ({ caps }) => {
  const quarters = [
    { label:"Q1 2026", start:"2026-01-01", end:"2026-03-31" },
    { label:"Q2 2026", start:"2026-04-01", end:"2026-06-30" },
    { label:"Q3 2026", start:"2026-07-01", end:"2026-09-30" },
    { label:"Q4 2026", start:"2026-10-01", end:"2026-12-31" },
  ];

  const totalStart = new Date("2026-01-01").getTime();
  const totalEnd   = new Date("2026-12-31").getTime();
  const totalSpan  = totalEnd - totalStart;

  const getPct = (dateStr) => {
    const d = new Date(dateStr).getTime();
    return Math.max(0, Math.min(100, ((d - totalStart) / totalSpan) * 100));
  };

  const grouped = Object.keys(TYPE_CONFIG).map(type => ({
    type, label: TYPE_CONFIG[type].label, color: TYPE_CONFIG[type].color,
    items: caps.filter(c => c.type === type),
  })).filter(g => g.items.length > 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Quarter headers */}
      <div style={{ position:"relative", marginLeft:200 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }}>
          {quarters.map((q,i) => (
            <div key={i} style={{ padding:"8px 12px", textAlign:"center", background: i%2===0?"rgba(14,165,233,0.06)":"rgba(14,165,233,0.03)", borderLeft:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:12, fontWeight:700, color:T.textMuted, fontFamily:SANS }}>{q.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today line position */}
      {grouped.map(({ type, label, color, items }) => (
        <div key={type}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:4, height:16, borderRadius:2, background:color, boxShadow:glow(color,4) }}/>
            <span style={{ fontSize:12, fontWeight:700, color, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:SANS }}>{label}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {items.map(cap => {
              const cfg = STATUS_CONFIG[cap.status];
              const health = calcHealth(cap);
              const relPct = cap.releaseDate ? getPct(cap.releaseDate) : null;
              const todayPct = getPct(new Date().toISOString().split("T")[0]);

              return (
                <div key={cap.id} style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:12, alignItems:"center" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                    <span style={{ fontSize:13, color:T.textPrimary, fontWeight:600, fontFamily:SANS }}>{cap.title.length>24?cap.title.slice(0,24)+"…":cap.title}</span>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <HealthBadge cap={cap} />
                    </div>
                  </div>
                  <div style={{ position:"relative", height:32, background:"rgba(14,165,233,0.04)", borderRadius:6, border:`1px solid ${T.border}`, overflow:"hidden" }}>
                    {/* Quarter dividers */}
                    {[25,50,75].map(p=>(
                      <div key={p} style={{ position:"absolute", left:`${p}%`, top:0, bottom:0, width:1, background:"rgba(14,165,233,0.1)" }}/>
                    ))}
                    {/* Today line */}
                    <div style={{ position:"absolute", left:`${todayPct}%`, top:0, bottom:0, width:2, background:T.primary, opacity:0.5, boxShadow:glow(T.primary,4) }}/>
                    {/* Release marker */}
                    {relPct !== null && (
                      <div style={{ position:"absolute", left:`${Math.max(2,relPct-1)}%`, top:"50%", transform:"translateY(-50%)" }}>
                        <div style={{ width:14, height:14, borderRadius:"50%", background:cfg.color, boxShadow:glow(cfg.color,6), border:"2px solid #020817", cursor:"pointer" }} title={`Release: ${cap.releaseDate}`}/>
                      </div>
                    )}
                    {/* Bar from start to release */}
                    {relPct !== null && (
                      <div style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", width:`${relPct}%`, height:6, borderRadius:99, background:`linear-gradient(90deg,${cfg.color}44,${cfg.color}88)` }}/>
                    )}
                    {/* Label */}
                    <div style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)" }}>
                      <span style={{ fontSize:10, color:T.textDim, fontFamily:SANS }}>{cap.releaseDate||"TBD"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div style={{ display:"flex", gap:16, alignItems:"center", padding:"10px 14px", background:"rgba(14,165,233,0.03)", borderRadius:8, border:`1px solid ${T.border}` }}>
        <span style={{ fontSize:12, color:T.textDim, fontFamily:SANS, fontWeight:600 }}>Legend:</span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:14, height:14, borderRadius:"50%", background:T.primary, border:"2px solid #020817" }}/>
          <span style={{ fontSize:12, color:T.textMuted, fontFamily:SANS }}>Release date</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:2, height:16, background:T.primary, opacity:0.5 }}/>
          <span style={{ fontSize:12, color:T.textMuted, fontFamily:SANS }}>Today</span>
        </div>
        {[{label:"Green — On track",color:T.green},{label:"Amber — Needs attention",color:T.amber},{label:"Red — At risk",color:T.red}].map(h=>(
          <div key={h.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ color:h.color, fontSize:14 }}>●</span>
            <span style={{ fontSize:12, color:T.textMuted, fontFamily:SANS }}>{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── CXO Card ──────────────────────────────────────────────────────────────────
const CXOCard = ({ cap, onClick }) => {
  const cfg  = STATUS_CONFIG[cap.status];
  const tcfg = TYPE_CONFIG[cap.type];
  const health = calcHealth(cap);
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      background:hov?"rgba(14,165,233,0.07)":T.bgCard,
      border:`1px solid ${hov?cfg.color+"66":T.border}`,
      borderRadius:12, padding:"18px 20px", cursor:"pointer",
      transition:"all 0.2s", display:"flex", flexDirection:"column", gap:10,
      boxShadow:hov?glow(cfg.color,8):"none", position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${cfg.color}88,transparent)` }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
        <h3 style={{ margin:0, fontSize:15, color:T.textHero, fontWeight:700, lineHeight:1.4, fontFamily:SANS }}>{cap.title}</h3>
        <div style={{ display:"flex", gap:5, flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end" }}>
          <Badge label={tcfg.label} color={tcfg.color}/>
          <HealthBadge cap={cap}/>
        </div>
      </div>
      <p style={{ margin:0, fontSize:12, color:T.textMuted, lineHeight:1.6, fontFamily:SANS }}>{cap.description}</p>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {cap.clients.filter(c=>c!=="Internal").slice(0,3).map((c,i)=>(
            <span key={i} style={{ fontSize:11, color:T.textDim, background:"rgba(14,165,233,0.06)", padding:"2px 8px", borderRadius:4, fontFamily:SANS }}>{c}</span>
          ))}
        </div>
        <span style={{ fontSize:12, color:T.textDim, fontFamily:SANS }}>↗ {cap.releaseDate||"TBD"}</span>
      </div>
    </div>
  );
};

// ── Client Heatmap ────────────────────────────────────────────────────────────
const ClientHeatmap = ({ caps, onSelect }) => {
  const clients = allClients(caps);
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ borderCollapse:"collapse", width:"100%", minWidth:480 }}>
        <thead>
          <tr>
            <th style={{ padding:"10px 14px", textAlign:"left", fontSize:12, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:SANS, fontWeight:700 }}>Client</th>
            {caps.map(cap=>(
              <th key={cap.id} style={{ padding:"8px 6px", fontSize:11, color:T.textMuted, textAlign:"center", fontFamily:SANS }}>
                <div style={{ writingMode:"vertical-rl", transform:"rotate(180deg)", whiteSpace:"nowrap", maxHeight:90, overflow:"hidden" }}>{cap.title.length>18?cap.title.slice(0,18)+"…":cap.title}</div>
              </th>
            ))}
            <th style={{ padding:"10px 10px", fontSize:12, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:SANS, fontWeight:700 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client,ri)=>{
            const clientCaps = caps.filter(c=>c.clients.includes(client));
            return (
              <tr key={client} style={{ borderTop:`1px solid rgba(14,165,233,0.08)` }}>
                <td style={{ padding:"11px 14px", fontSize:14, color:T.textPrimary, fontWeight:600, whiteSpace:"nowrap", fontFamily:SANS }}>{client}</td>
                {caps.map(cap=>{
                  const has = cap.clients.includes(client);
                  const cfg = STATUS_CONFIG[cap.status];
                  return (
                    <td key={cap.id} style={{ padding:"8px 6px", textAlign:"center" }}>
                      {has?(
                        <div onClick={()=>onSelect(cap)} style={{ width:30, height:30, borderRadius:6, margin:"0 auto", background:cfg.bg, border:`1px solid ${cfg.color}66`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:cfg.color, fontWeight:700, boxShadow:glow(cfg.color,4), transition:"all 0.15s" }}
                          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.2)"}
                          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                        >✓</div>
                      ):(
                        <div style={{ width:30, height:30, borderRadius:6, margin:"0 auto", background:"rgba(14,165,233,0.03)", border:`1px solid rgba(14,165,233,0.08)` }}/>
                      )}
                    </td>
                  );
                })}
                <td style={{ padding:"11px 10px", textAlign:"center" }}>
                  <span style={{ fontSize:18, fontWeight:700, color:T.primary, fontFamily:MONO, textShadow:glow(T.primary,4) }}>{clientCaps.length}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Snapshot Card ─────────────────────────────────────────────────────────────
const SnapshotCard = ({ cap }) => {
  const s   = cap.snapshot||{};
  const cfg = STATUS_CONFIG[cap.status];
  const tcfg= TYPE_CONFIG[cap.type];
  const sentiment = SENTIMENT[s.clientFeedback?.sentiment]||SENTIMENT["Neutral"];
  const health = calcHealth(cap);
  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden", display:"flex", flexDirection:"column", transition:"box-shadow 0.2s", position:"relative" }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow=glow(cfg.color,8)}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
    >
      <div style={{ height:3, background:`linear-gradient(90deg,${cfg.color},${cfg.color}44,transparent)` }}/>
      <div style={{ padding:"18px 20px 14px", display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
          <h3 style={{ margin:0, fontSize:16, color:T.textHero, fontWeight:700, fontFamily:SANS, lineHeight:1.3 }}>{cap.title}</h3>
          <div style={{ display:"flex", gap:5, flexShrink:0, flexDirection:"column", alignItems:"flex-end" }}>
            <Badge label={cfg.label} color={cfg.color} bg={cfg.bg}/>
            <div style={{ display:"flex", gap:5 }}><Badge label={tcfg.label} color={tcfg.color}/><HealthBadge cap={cap}/></div>
          </div>
        </div>
        <p style={{ margin:0, fontSize:13, color:T.textSecond, lineHeight:1.7, fontFamily:SANS }}>{s.summary||cap.description}</p>
      </div>

      <div style={{ padding:"0 20px 14px", display:"flex", flexDirection:"column", gap:9 }}>
        {[
          ["POC Environment", s.pocEnvironment, true],
          ["Product Version", s.productVersion, false],
          ["Next Milestone",  s.nextMilestone,  false],
        ].map(([label,val,mono])=>(
          <div key={label} style={{ display:"grid", gridTemplateColumns:"140px 1fr", gap:8, alignItems:"flex-start" }}>
            <span style={{ fontSize:11, color:T.textDim, fontWeight:600, fontFamily:SANS, textTransform:"uppercase", letterSpacing:"0.06em", paddingTop:2 }}>{label}</span>
            <span style={{ fontSize:13, color: label==="Next Milestone"?T.amber:T.textSecond, fontFamily:mono?MONO:SANS, fontWeight: label==="Next Milestone"?600:400, background:mono?"rgba(14,165,233,0.06)":"transparent", padding:mono?"3px 10px":"0", borderRadius:mono?5:0, border:mono?`1px solid ${T.border}`:"none" }}>{val||"—"}</span>
          </div>
        ))}
        {s.liveUrl&&(
          <div style={{ display:"grid", gridTemplateColumns:"140px 1fr", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:11, color:T.textDim, fontWeight:600, fontFamily:SANS, textTransform:"uppercase", letterSpacing:"0.06em" }}>Live URL</span>
            <a href={s.liveUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:T.primary, fontFamily:SANS, textDecoration:"none" }}
              onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"}
              onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}
            >↗ {s.liveUrl.replace("https://","")}</a>
          </div>
        )}
      </div>

      <div style={{ margin:"0 20px", height:1, background:`linear-gradient(90deg,${T.border},transparent)` }}/>

      {s.clientFeedback&&(
        <div style={{ padding:"14px 20px 18px", display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, color:T.textDim, fontWeight:600, fontFamily:SANS, textTransform:"uppercase", letterSpacing:"0.06em" }}>Client Feedback</span>
            <span style={{ padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:700, color:sentiment.color, background:sentiment.bg, border:`1px solid ${sentiment.color}44`, fontFamily:SANS, display:"flex", alignItems:"center", gap:4 }}>{sentiment.icon} {s.clientFeedback.sentiment}</span>
            <span style={{ fontSize:12, color:T.textDim, fontFamily:SANS, marginLeft:"auto" }}>— {s.clientFeedback.client}</span>
          </div>
          <div style={{ padding:"12px 14px", borderRadius:8, background:`${sentiment.color}0a`, border:`1px solid ${sentiment.color}22`, borderLeft:`3px solid ${sentiment.color}` }}>
            <p style={{ margin:0, fontSize:13, color:T.textSecond, lineHeight:1.7, fontFamily:SANS, fontStyle:"italic" }}>"{s.clientFeedback.quote}"</p>
          </div>
        </div>
      )}

      <div style={{ padding:"10px 20px", borderTop:`1px solid rgba(14,165,233,0.07)`, background:"rgba(14,165,233,0.02)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:T.textDim, fontFamily:SANS }}>Owner: <span style={{ color:T.textMuted, fontWeight:600 }}>{cap.owner}</span></span>
        <span style={{ fontSize:12, color:T.textDim, fontFamily:SANS }}>Release: <span style={{ color:T.textMuted, fontWeight:600 }}>{cap.releaseDate||"TBD"}</span></span>
      </div>
    </div>
  );
};

// ── Snapshot View ─────────────────────────────────────────────────────────────
const SnapshotView = ({ caps, refreshedAt }) => {
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterStatus,    setFilterStatus]    = useState("all");
  const filtered = caps.filter(c=>{
    const sm = filterSentiment==="all"||c.snapshot?.clientFeedback?.sentiment===filterSentiment;
    const st = filterStatus==="all"||c.status===filterStatus;
    return sm&&st;
  });
  const sentCounts = { Positive:caps.filter(c=>c.snapshot?.clientFeedback?.sentiment==="Positive").length, Neutral:caps.filter(c=>c.snapshot?.clientFeedback?.sentiment==="Neutral").length, "Needs Work":caps.filter(c=>c.snapshot?.clientFeedback?.sentiment==="Needs Work").length };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
        <RefreshedBanner ts={refreshedAt}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {Object.entries(SENTIMENT).map(([key,cfg])=>(
          <div key={key} onClick={()=>setFilterSentiment(filterSentiment===key?"all":key)} style={{ background:T.bgCard, border:`1px solid ${cfg.color}22`, borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", outline:filterSentiment===key?`1px solid ${cfg.color}`:"none", boxShadow:filterSentiment===key?glow(cfg.color,6):"none", transition:"all 0.15s" }}>
            <div style={{ width:44, height:44, borderRadius:10, background:cfg.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:cfg.color, fontWeight:700, flexShrink:0 }}>{cfg.icon}</div>
            <div>
              <div style={{ fontSize:12, color:T.textDim, fontFamily:SANS, marginBottom:4 }}>{key}</div>
              <div style={{ fontSize:32, fontWeight:700, color:cfg.color, fontFamily:MONO, lineHeight:1, textShadow:glow(cfg.color,6) }}>{sentCounts[key]}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:13, color:T.textMuted, fontFamily:SANS }}>Status:</span>
        {["all",...Object.keys(STATUS_CONFIG)].map(s=>(
          <button key={s} onClick={()=>setFilterStatus(s)} style={{ padding:"5px 13px", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:600, background:filterStatus===s?(STATUS_CONFIG[s]?.bg||"rgba(56,189,248,0.15)"):"rgba(14,165,233,0.04)", border:filterStatus===s?`1px solid ${STATUS_CONFIG[s]?.color||T.primary}`:`1px solid ${T.border}`, color:filterStatus===s?(STATUS_CONFIG[s]?.color||T.primary):T.textMuted, fontFamily:SANS, transition:"all 0.15s" }}>{s==="all"?"All":STATUS_CONFIG[s].label}</button>
        ))}
        <span style={{ marginLeft:"auto", fontSize:13, color:T.textDim, fontFamily:SANS }}>{filtered.length} initiative{filtered.length!==1?"s":""}</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(500px,1fr))", gap:18 }}>
        {filtered.map(cap=><SnapshotCard key={cap.id} cap={cap}/>)}
      </div>
    </div>
  );
};

// ── CXO View ──────────────────────────────────────────────────────────────────
const CXOView = ({ caps, onSelect, refreshedAt }) => {
  const released   = caps.filter(c=>c.status==="released");
  const inProgress = caps.filter(c=>c.status==="in_progress");
  const pocs       = caps.filter(c=>c.type==="poc");
  const upcoming   = caps.filter(c=>["upcoming","discovery"].includes(c.status));
  const clients    = allClients(caps);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
        <RefreshedBanner ts={refreshedAt}/>
      </div>

      {/* Exec Summary */}
      <ExecSummary caps={caps}/>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
        <StatCard label="Released"    value={released.length}   sub={`${released.filter(c=>c.type==="integrated").length} integrated`} color={T.green}/>
        <StatCard label="In Progress" value={inProgress.length} sub={`${inProgress.length} active`}  color={T.amber}/>
        <StatCard label="POC"         value={pocs.length}       sub="Proof of concept"                color={T.primary}/>
        <StatCard label="Pipeline"    value={upcoming.length}   sub="Upcoming"                        color={T.accent}/>
        <StatCard label="Clients"     value={clients.length}    sub="Covered"                         color={T.secondary}/>
      </div>

      {/* Health + Donut */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Section title="Portfolio Health"><HealthSummary caps={caps}/></Section>
        <Section title="Status Breakdown"><DonutChart caps={caps}/></Section>
      </div>

      {/* Roadmap */}
      <Section title="Quarterly Roadmap — 2026"><RoadmapView caps={caps}/></Section>

      {/* Capability sections */}
      {[
        { label:"Released",             color:T.green,   items:released   },
        { label:"In Progress",          color:T.amber,   items:inProgress },
        { label:"POC",                  color:T.primary, items:pocs       },
        { label:"Upcoming / Discovery", color:T.accent,  items:upcoming   },
      ].filter(s=>s.items.length>0).map(({label,color,items})=>(
        <div key={label}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:4, height:20, borderRadius:2, background:color, boxShadow:glow(color,6) }}/>
            <span style={{ fontSize:15, fontWeight:700, color, fontFamily:SANS }}>{label}</span>
            <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${color}44,transparent)` }}/>
            <span style={{ fontSize:13, color:T.textDim, fontFamily:SANS }}>{items.length} item{items.length!==1?"s":""}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:12 }}>
            {items.map(cap=><CXOCard key={cap.id} cap={cap} onClick={()=>onSelect(cap)}/>)}
          </div>
        </div>
      ))}

      {/* Client heatmap */}
      <Section title="Client × Capability Coverage"><ClientHeatmap caps={caps} onSelect={onSelect}/></Section>
    </div>
  );
};

// ── PM View ───────────────────────────────────────────────────────────────────
const PMView = ({ caps, allCaps, onSelect, onAdd, onEdit, filterStatus, setFilterStatus, filterType, setFilterType, refreshedAt }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
      <RefreshedBanner ts={refreshedAt}/>
    </div>
    <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
      <span style={{ fontSize:13, color:T.textMuted, fontFamily:SANS }}>Status:</span>
      {["all",...Object.keys(STATUS_CONFIG)].map(s=>(
        <button key={s} onClick={()=>setFilterStatus(s)} style={{ padding:"6px 14px", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:600, background:filterStatus===s?(STATUS_CONFIG[s]?.bg||"rgba(56,189,248,0.15)"):"rgba(14,165,233,0.04)", border:filterStatus===s?`1px solid ${STATUS_CONFIG[s]?.color||T.primary}`:`1px solid ${T.border}`, color:filterStatus===s?(STATUS_CONFIG[s]?.color||T.primary):T.textMuted, fontFamily:SANS, transition:"all 0.15s" }}>{s==="all"?"All":STATUS_CONFIG[s].label}</button>
      ))}
      <span style={{ fontSize:13, color:T.textMuted, fontFamily:SANS, marginLeft:8 }}>Type:</span>
      {["all",...Object.keys(TYPE_CONFIG)].map(t=>(
        <button key={t} onClick={()=>setFilterType(t)} style={{ padding:"6px 14px", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:600, background:filterType===t?"rgba(56,189,248,0.15)":"rgba(14,165,233,0.04)", border:filterType===t?`1px solid ${T.primary}`:`1px solid ${T.border}`, color:filterType===t?T.primary:T.textMuted, fontFamily:SANS, transition:"all 0.15s" }}>{t==="all"?"All":TYPE_CONFIG[t].label}</button>
      ))}
      <button onClick={onAdd} style={{ marginLeft:"auto", padding:"8px 20px", borderRadius:8, background:"rgba(56,189,248,0.12)", border:`1px solid ${T.primary}`, color:T.primary, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:SANS, boxShadow:glow(T.primary,6) }}>+ Add Capability</button>
    </div>

    <Section title="All Capabilities">
      <div style={{ borderRadius:8, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 80px 100px 32px", gap:0, padding:"11px 16px", borderBottom:`1px solid ${T.border}`, background:"rgba(14,165,233,0.04)" }}>
          {["Capability","Owner","Status","Type","Health","Release",""].map((h,i)=>(
            <span key={i} style={{ fontSize:12, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, fontFamily:SANS }}>{h}</span>
          ))}
        </div>
        {caps.map((cap,idx)=>{
          const cfg=STATUS_CONFIG[cap.status]; const tcfg=TYPE_CONFIG[cap.type];
          return (
            <div key={cap.id} onClick={()=>onSelect(cap)} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 80px 100px 32px", gap:0, padding:"14px 16px", alignItems:"center", borderBottom:idx<caps.length-1?`1px solid rgba(14,165,233,0.07)`:"none", cursor:"pointer", transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background=T.bgRow}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                <span style={{ fontSize:14, color:T.textHero, fontWeight:600, fontFamily:SANS }}>{cap.title}</span>
                <span style={{ fontSize:12, color:T.textDim, fontFamily:SANS }}>{cap.clients.filter(c=>c!=="Internal").slice(0,2).join(", ")}{cap.clients.length>2?` +${cap.clients.length-2}`:""}</span>
              </div>
              <span style={{ fontSize:13, color:T.textSecond, fontFamily:SANS }}>{cap.owner?.split(" ")[0]||"—"}</span>
              <Badge label={cfg.label} color={cfg.color} bg={cfg.bg}/>
              <Badge label={tcfg.label} color={tcfg.color}/>
              <HealthBadge cap={cap}/>
              <span style={{ fontSize:13, color:T.textMuted, fontFamily:SANS }}>{cap.releaseDate||"TBD"}</span>
              <button onClick={e=>{e.stopPropagation();onEdit(cap);}} style={{ background:"rgba(56,189,248,0.1)", border:`1px solid ${T.border}`, color:T.primary, borderRadius:6, padding:"5px 7px", cursor:"pointer", fontSize:14 }}>✎</button>
            </div>
          );
        })}
      </div>
    </Section>

    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
      <Section title="Portfolio Health"><HealthSummary caps={allCaps}/></Section>
      <Section title="Status Breakdown"><DonutChart caps={allCaps}/></Section>
    </div>

    <Section title="Quarterly Roadmap — 2026"><RoadmapView caps={allCaps}/></Section>
    <Section title="Client × Capability Coverage"><ClientHeatmap caps={allCaps} onSelect={onSelect}/></Section>
  </div>
);

// ── Detail Panel ──────────────────────────────────────────────────────────────
const DetailPanel = ({ cap, onClose, onEdit, persona }) => {
  const cfg = STATUS_CONFIG[cap.status];
  const s   = cap.snapshot||{};
  const sentiment = SENTIMENT[s.clientFeedback?.sentiment]||SENTIMENT["Neutral"];
  const health = calcHealth(cap);
  return (
    <div style={{ position:"fixed", right:0, top:0, bottom:0, width:"min(480px,100vw)", background:"#020C1B", borderLeft:`1px solid ${T.border}`, zIndex:900, overflowY:"auto", padding:28, boxShadow:"-32px 0 80px rgba(0,0,0,0.9)", display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Badge label={cfg.label} color={cfg.color} bg={cfg.bg}/>
            <Badge label={TYPE_CONFIG[cap.type].label} color={TYPE_CONFIG[cap.type].color}/>
            <HealthBadge cap={cap}/>
          </div>
          <h2 style={{ margin:0, fontSize:20, color:T.textHero, fontFamily:SANS, lineHeight:1.3, fontWeight:700 }}>{cap.title}</h2>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:22, flexShrink:0 }}>✕</button>
      </div>
      <p style={{ margin:0, color:T.textSecond, fontSize:14, lineHeight:1.8, fontFamily:SANS }}>{s.summary||cap.description}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {[
          ["Impact",  cap.impact, cap.impact==="High"?T.green:cap.impact==="Medium"?T.amber:T.textMuted],
          ["Effort",  cap.effort, cap.effort==="High"?T.red:cap.effort==="Medium"?T.amber:T.green],
          ["Health",  health.label, health.color],
        ].map(([label,val,color])=>(
          <div key={label} style={{ background:"rgba(56,189,248,0.05)", borderRadius:10, padding:"14px 16px", border:`1px solid ${color}22` }}>
            <div style={{ fontSize:12, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, fontFamily:SANS }}>{label}</div>
            <div style={{ fontSize:22, fontWeight:700, color, fontFamily:MONO, textShadow:glow(color,6) }}>{val}</div>
          </div>
        ))}
      </div>
      {[
        ["POC Environment", s.pocEnvironment, true],
        ["Product Version", s.productVersion, false],
        ["Next Milestone",  s.nextMilestone,  false],
      ].map(([label,val,mono])=>(
        <div key={label} style={{ display:"flex", flexDirection:"column", gap:5 }}>
          <span style={{ fontSize:12, color:T.textMuted, fontWeight:600, fontFamily:SANS, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</span>
          <span style={{ fontSize:13, color: label==="Next Milestone"?T.amber:T.textSecond, fontFamily:mono?MONO:SANS, fontWeight: label==="Next Milestone"?600:400, background:mono?"rgba(14,165,233,0.06)":"transparent", padding:mono?"6px 12px":"0", borderRadius:mono?6:0, border:mono?`1px solid ${T.border}`:"none" }}>{val||"—"}</span>
        </div>
      ))}
      {s.liveUrl&&(
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          <span style={{ fontSize:12, color:T.textMuted, fontWeight:600, fontFamily:SANS, textTransform:"uppercase", letterSpacing:"0.08em" }}>Live URL</span>
          <a href={s.liveUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:T.primary, fontFamily:SANS }}>{s.liveUrl}</a>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[["Owner",cap.owner||"—"],["Release",cap.releaseDate||"TBD"],["Last Updated",cap.lastUpdated||"—"],["Notes",cap.notes||"—"]].map(([label,val])=>(
          <div key={label} style={{ background:"rgba(56,189,248,0.05)", borderRadius:10, padding:"12px 14px", border:`1px solid ${T.border}` }}>
            <div style={{ fontSize:11, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, fontFamily:SANS }}>{label}</div>
            <div style={{ fontSize:13, color:T.textPrimary, fontWeight:600, fontFamily:SANS }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <span style={{ fontSize:13, color:T.textMuted, fontFamily:SANS, fontWeight:600 }}>Client Mapping</span>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {cap.clients.map((c,i)=><Badge key={i} label={c} color={T.primary} bg="rgba(56,189,248,0.08)"/>)}
        </div>
      </div>
      {s.clientFeedback&&(
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:13, color:T.textMuted, fontFamily:SANS, fontWeight:600 }}>Client Feedback</span>
            <span style={{ padding:"2px 10px", borderRadius:99, fontSize:11, fontWeight:700, color:sentiment.color, background:sentiment.bg, border:`1px solid ${sentiment.color}44`, fontFamily:SANS }}>{sentiment.icon} {s.clientFeedback.sentiment}</span>
          </div>
          <div style={{ padding:"12px 14px", borderRadius:8, background:`${sentiment.color}0a`, border:`1px solid ${sentiment.color}22`, borderLeft:`3px solid ${sentiment.color}` }}>
            <p style={{ margin:0, fontSize:13, color:T.textSecond, lineHeight:1.7, fontFamily:SANS, fontStyle:"italic" }}>"{s.clientFeedback.quote}"</p>
            <p style={{ margin:"6px 0 0", fontSize:11, color:T.textDim, fontFamily:SANS }}>— {s.clientFeedback.client}</p>
          </div>
        </div>
      )}
      {persona==="pm"&&(
        <button onClick={()=>onEdit(cap)} style={{ padding:14, borderRadius:10, border:`1px solid ${T.primary}`, background:"rgba(56,189,248,0.08)", color:T.primary, fontWeight:700, cursor:"pointer", fontSize:15, fontFamily:SANS, boxShadow:glow(T.primary,6) }}>Edit Capability</button>
      )}
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const CapabilityModal = ({ cap, onSave, onClose }) => {
  const blank = { id:`cap-${Date.now()}`, title:"", description:"", status:"discovery", type:"poc", owner:"", clients:[], impact:"Medium", effort:"Medium", releaseDate:"", lastUpdated:"", notes:"", snapshot:{ summary:"", pocEnvironment:"", productVersion:"", liveUrl:"", nextMilestone:"", clientFeedback:{ sentiment:"Neutral", quote:"", client:"" } } };
  const [form, setForm] = useState(cap?JSON.parse(JSON.stringify(cap)):blank);
  const [clientInput, setClientInput] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const setSnap = (k,v) => setForm(f=>({...f,snapshot:{...f.snapshot,[k]:v}}));
  const setFb = (k,v) => setForm(f=>({...f,snapshot:{...f.snapshot,clientFeedback:{...f.snapshot?.clientFeedback,[k]:v}}}));
  const inp = { background:"#020C1B", border:`1px solid ${T.border}`, borderRadius:8, padding:"11px 14px", color:T.textPrimary, fontSize:14, outline:"none", width:"100%", boxSizing:"border-box", fontFamily:SANS };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)", padding:16 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#020C1B", border:`1px solid ${T.border}`, borderRadius:16, padding:28, width:"100%", maxWidth:580, maxHeight:"90vh", overflowY:"auto", display:"flex", flexDirection:"column", gap:14, boxShadow:`0 40px 100px rgba(0,0,0,0.95)` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ margin:0, fontSize:20, color:T.textHero, fontFamily:SANS, fontWeight:700 }}>{cap?"Edit Capability":"Add AI Capability"}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:22 }}>✕</button>
        </div>
        {[["Title","title","text"],["Owner","owner","text"],["Release Date","releaseDate","date"],["Notes","notes","text"]].map(([label,key,type])=>(
          <label key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>{label}</span>
            <input type={type} value={form[key]||""} onChange={e=>set(key,e.target.value)} style={inp}/>
          </label>
        ))}
        <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>Description</span>
          <textarea value={form.description||""} onChange={e=>set("description",e.target.value)} rows={2} style={{...inp,resize:"vertical"}}/>
        </label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
          {[["Status","status",Object.keys(STATUS_CONFIG)],["Type","type",Object.keys(TYPE_CONFIG)],["Impact","impact",["Low","Medium","High"]],["Effort","effort",["Low","Medium","High"]]].map(([label,key,opts])=>(
            <label key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>{label}</span>
              <select value={form[key]||""} onChange={e=>set(key,e.target.value)} style={{...inp,padding:"11px 10px"}}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>
            </label>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>Clients</span>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {(form.clients||[]).map((c,i)=><span key={i} style={{ padding:"4px 11px", borderRadius:5, background:"rgba(56,189,248,0.1)", border:`1px solid rgba(56,189,248,0.3)`, color:T.primary, fontSize:13, display:"flex", alignItems:"center", gap:6, fontFamily:SANS }}>{c}<span style={{ cursor:"pointer", opacity:0.6 }} onClick={()=>set("clients",(form.clients||[]).filter((_,j)=>j!==i))}>✕</span></span>)}
          </div>
          <input value={clientInput} onChange={e=>setClientInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&clientInput.trim()){set("clients",[...(form.clients||[]),clientInput.trim()]);setClientInput("");}}} placeholder="Add client → Enter" style={inp}/>
        </div>
        <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:14, display:"flex", flexDirection:"column", gap:10 }}>
          <span style={{ fontSize:14, color:T.textSecond, fontWeight:700, fontFamily:SANS }}>Snapshot Details</span>
          {[["Summary","summary",true],["POC Environment","pocEnvironment",false],["Product Version","productVersion",false],["Live URL","liveUrl",false],["Next Milestone","nextMilestone",false]].map(([label,key,isArea])=>(
            <label key={key} style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>{label}</span>
              {isArea?<textarea value={form.snapshot?.[key]||""} onChange={e=>setSnap(key,e.target.value)} rows={2} style={{...inp,resize:"vertical"}}/>:<input value={form.snapshot?.[key]||""} onChange={e=>setSnap(key,e.target.value)} style={inp}/>}
            </label>
          ))}
          <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>Client Feedback Sentiment</span>
            <select value={form.snapshot?.clientFeedback?.sentiment||"Neutral"} onChange={e=>setFb("sentiment",e.target.value)} style={{...inp,padding:"11px 10px"}}>
              {["Positive","Neutral","Needs Work"].map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>Client Quote</span>
            <input value={form.snapshot?.clientFeedback?.quote||""} onChange={e=>setFb("quote",e.target.value)} style={inp}/>
          </label>
          <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={{ fontSize:13, color:T.textMuted, fontWeight:600, fontFamily:SANS }}>Client Name</span>
            <input value={form.snapshot?.clientFeedback?.client||""} onChange={e=>setFb("client",e.target.value)} style={inp}/>
          </label>
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
  const [persona,      setPersona]      = useState("snapshot");
  const [caps,         setCaps]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState(null);
  const [editing,      setEditing]      = useState(null);
  const [addingNew,    setAddingNew]    = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType,   setFilterType]   = useState("all");
  const [saveStatus,   setSaveStatus]   = useState("");
  const [refreshedAt,  setRefreshedAt]  = useState(null);

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
        if (result?.value) {
          const parsed = JSON.parse(result.value);
          setCaps(parsed.caps || SEED);
          setRefreshedAt(parsed.refreshedAt || null);
        } else {
          const now = new Date().toISOString();
          setCaps(SEED);
          setRefreshedAt(now);
          await window.storage.set(STORAGE_KEY, JSON.stringify({ caps:SEED, refreshedAt:now }), SHARED);
        }
      } catch { setCaps(SEED); }
      setLoading(false);
    })();
  }, []);

  const save = async (updated) => {
    const now = new Date().toISOString();
    setCaps(updated);
    setRefreshedAt(now);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify({ caps:updated, refreshedAt:now }), SHARED);
      setSaveStatus("Saved ✓");
      setTimeout(()=>setSaveStatus(""), 2000);
    } catch { setSaveStatus("Save failed"); }
  };

  const handleSave = async (form) => {
    const exists  = caps.find(c=>c.id===form.id);
    const updated = exists ? caps.map(c=>c.id===form.id?form:c) : [...caps, form];
    await save(updated);
    setEditing(null); setAddingNew(false);
    if (selected?.id===form.id) setSelected(form);
  };

  const filtered = caps.filter(c=>
    (filterStatus==="all"||c.status===filterStatus)&&
    (filterType==="all"||c.type===filterType)
  );

  if (loading) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:T.primary, fontFamily:SANS, fontSize:16 }}>Loading dashboard…</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:SANS, color:T.textPrimary, backgroundImage:`radial-gradient(ellipse 80% 40% at 10% 0%,rgba(14,165,233,0.1) 0%,transparent 60%),radial-gradient(ellipse 60% 30% at 90% 10%,rgba(6,182,212,0.07) 0%,transparent 60%)` }}>
      {/* Header */}
      <header style={{ borderBottom:`1px solid ${T.border}`, padding:"0 28px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, background:T.bgHeader, backdropFilter:"blur(16px)", position:"sticky", top:0, zIndex:800, boxShadow:`0 1px 0 ${T.border},0 4px 30px rgba(0,0,0,0.6)` }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:38, height:38, borderRadius:8, border:`1px solid ${T.primary}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:T.primary, fontFamily:MONO, boxShadow:glow(T.primary,10) }}>AI</div>
          <div>
            <div style={{ fontSize:17, fontWeight:700, fontFamily:SANS, color:T.textHero, letterSpacing:"-0.01em" }}>AI Capabilities</div>
            <div style={{ fontSize:11, color:T.textDim, fontFamily:SANS, letterSpacing:"0.04em" }}>Product Intelligence · {new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          {saveStatus&&<span style={{ fontSize:13, color:T.green, fontFamily:SANS }}>{saveStatus}</span>}
          <span style={{ fontSize:11, color:T.textDim, fontFamily:SANS, border:`1px solid ${T.border}`, padding:"3px 10px", borderRadius:5 }}>Shared · Live</span>
          <div style={{ display:"flex", background:"rgba(14,165,233,0.05)", borderRadius:8, padding:3, border:`1px solid ${T.border}` }}>
            {[["snapshot","AI Snapshot"],["cxo","CXO View"],["pm","PM View"]].map(([key,label])=>(
              <button key={key} onClick={()=>setPersona(key)} style={{ padding:"7px 18px", borderRadius:6, border:"none", cursor:"pointer", background:persona===key?"rgba(56,189,248,0.18)":"transparent", color:persona===key?T.primary:T.textMuted, fontWeight:700, fontSize:14, transition:"all 0.2s", fontFamily:SANS, outline:persona===key?`1px solid ${T.primary}`:"none", boxShadow:persona===key?glow(T.primary,5):"none" }}>{label}</button>
            ))}
          </div>
        </div>
      </header>

      {/* Status bar */}
      <div style={{ padding:"7px 28px", borderBottom:`1px solid rgba(14,165,233,0.07)`, display:"flex", gap:22, alignItems:"center", background:"rgba(2,8,23,0.9)", flexWrap:"wrap" }}>
        {Object.entries(STATUS_CONFIG).map(([key,cfg])=>{
          const count=caps.filter(c=>c.status===key).length;
          return (
            <div key={key} style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:7, height:7, borderRadius:2, background:cfg.color, boxShadow:glow(cfg.color,5) }}/>
              <span style={{ fontSize:13, color:T.textMuted, fontFamily:SANS }}>{cfg.label}</span>
              <span style={{ fontSize:15, color:cfg.color, fontWeight:700, fontFamily:MONO }}>{count}</span>
            </div>
          );
        })}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:T.green, boxShadow:glow(T.green,6) }}/>
          <span style={{ fontSize:12, color:T.textDim, fontFamily:SANS }}>System Online</span>
        </div>
      </div>

      <main style={{ padding:"26px 28px", maxWidth:1200, margin:"0 auto" }}>
        {persona==="snapshot"
          ? <SnapshotView caps={caps} refreshedAt={refreshedAt}/>
          : persona==="cxo"
          ? <CXOView caps={caps} onSelect={setSelected} refreshedAt={refreshedAt}/>
          : <PMView caps={filtered} allCaps={caps} onSelect={setSelected} onAdd={()=>setAddingNew(true)} onEdit={setEditing} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterType={filterType} setFilterType={setFilterType} refreshedAt={refreshedAt}/>
        }
      </main>

      {selected&&<DetailPanel cap={selected} persona={persona} onClose={()=>setSelected(null)} onEdit={(cap)=>{setEditing(cap);setSelected(null);}}/>}
      {(editing||addingNew)&&<CapabilityModal cap={editing||null} onSave={handleSave} onClose={()=>{setEditing(null);setAddingNew(false);}}/>}
    </div>
  );
}