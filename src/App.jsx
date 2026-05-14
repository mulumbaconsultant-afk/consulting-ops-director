import { useState, useRef, useEffect } from "react";

// ── palette & tokens ────────────────────────────────────────────────────────
const C = {
  bg: "#f7f5f0",
  surface: "#ffffff",
  border: "#e8e3d8",
  borderDark: "#d4cdc0",
  ink: "#1a1814",
  inkMid: "#6b6560",
  inkLight: "#a8a39c",
  gold: "#b8860b",
  goldLight: "#f0e6c0",
  goldMid: "#d4a820",
  green: "#2d6a4f",
  greenLight: "#e8f5ee",
  red: "#8b2020",
  redLight: "#fdeaea",
  amber: "#7a5c00",
  amberLight: "#fef5d4",
  blue: "#1a3a5c",
  blueLight: "#e8f0f8",
};

// ── nav sections ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "dashboard",  label: "Command Center", icon: "◈" },
  { id: "tasks",      label: "Daily Operations", icon: "▣" },
  { id: "team",       label: "Team & HR",        icon: "◉" },
  { id: "finance",    label: "Finance",           icon: "◆" },
  { id: "clients",    label: "Client Pipeline",  icon: "◎" },
  { id: "strategy",   label: "Strategy",         icon: "▲" },
  { id: "advisor",    label: "AI Advisor",        icon: "✦" },
];

// ── seed data ────────────────────────────────────────────────────────────────
const TASKS = [
  { id:1, text:"Prepare proposal for Meridian Group",     priority:"high",   done:false, due:"Today",      cat:"BD" },
  { id:2, text:"Weekly client status call — Apex Venture",priority:"high",   done:false, due:"Today",      cat:"Client" },
  { id:3, text:"Update SOW for Phase 2 — Crestline Co.",  priority:"high",   done:true,  due:"Yesterday",  cat:"Delivery" },
  { id:4, text:"Log billable hours for Q2 engagements",   priority:"medium", done:false, due:"Fri",        cat:"Admin" },
  { id:5, text:"Review contractor NDA — Parker Consult.", priority:"medium", done:false, due:"Fri",        cat:"Legal" },
  { id:6, text:"Draft case study — Solaris transformation",priority:"low",   done:false, due:"Next week",  cat:"Marketing" },
  { id:7, text:"Renew PI insurance policy",                priority:"low",   done:false, due:"Jun 1",      cat:"Admin" },
];

const TEAM = [
  { name:"Alexandra P.", role:"Senior Consultant",    util:87, status:"active",  eng:"Apex Venture" },
  { name:"Daniel K.",    role:"Strategy Associate",   util:72, status:"active",  eng:"Meridian Group" },
  { name:"Fatima N.",    role:"Project Manager",      util:95, status:"busy",    eng:"Crestline Co." },
  { name:"Rowan S.",     role:"Research Analyst",     util:60, status:"active",  eng:"Internal" },
  { name:"Camille T.",   role:"Finance Specialist",   util:80, status:"active",  eng:"Solaris Inc." },
];

const CLIENTS = [
  { name:"Apex Venture",    stage:"Active",    type:"Retainer",  mrr:"$18,500", health:"Healthy",  since:"Jan 2025", contact:"CEO" },
  { name:"Meridian Group",  stage:"Proposal",  type:"Project",   mrr:"$42,000", health:"Warm",     since:"—",        contact:"COO" },
  { name:"Crestline Co.",   stage:"Active",    type:"Project",   mrr:"$11,200", health:"At Risk",  since:"Mar 2025", contact:"VP Ops" },
  { name:"Solaris Inc.",    stage:"Active",    type:"Retainer",  mrr:"$9,800",  health:"Healthy",  since:"Sep 2024", contact:"CFO" },
  { name:"Nova Partners",   stage:"Qualified", type:"Advisory",  mrr:"$6,000",  health:"Warm",     since:"—",        contact:"Partner" },
  { name:"Fortis Capital",  stage:"Cold",      type:"Project",   mrr:"$25,000", health:"Cold",     since:"—",        contact:"MD" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May"];
const FINANCE = [
  { month:"Jan", revenue:68000,  expenses:34000, billable:580 },
  { month:"Feb", revenue:74000,  expenses:36000, billable:610 },
  { month:"Mar", revenue:81000,  expenses:38500, billable:640 },
  { month:"Apr", revenue:88000,  expenses:39000, billable:670 },
  { month:"May", revenue:93500,  expenses:41200, billable:695 },
];

const OKRS = [
  { goal:"Grow retainer base to $40k MRR",          progress:97, q:"Q2" },
  { goal:"Achieve 80% avg team utilisation",         progress:79, q:"Q2" },
  { goal:"Close 2 new enterprise engagements",       progress:50, q:"Q3" },
  { goal:"Launch thought-leadership content series", progress:20, q:"Q3" },
  { goal:"Reduce proposal-to-close time to 21 days", progress:60, q:"Q2" },
];

const KPI = [
  { label:"Active Retainer MRR", value:"$28,300",  delta:"+14%",  up:true  },
  { label:"Pipeline Value",      value:"$73,000",  delta:"+$31k", up:true  },
  { label:"Avg Utilisation",     value:"78.8%",    delta:"-1.2%", up:false },
  { label:"Proposals Sent",      value:"4",        delta:"↑2 MTD",up:true  },
];

// ── helpers ──────────────────────────────────────────────────────────────────
async function callClaude(messages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
              "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01",
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1000,
      system,
      messages,
    }),
  });
  const d = await res.json();
  return d.content?.map(b => b.text||"").join("") || "No response.";
}

const SYSTEM = `You are a seasoned Virtual Operations Director for a professional services consulting firm.
You have deep expertise in: consulting business development, client engagement management, team utilisation optimisation, proposal writing, retainer strategy, project delivery, and financial management for professional services.
Business snapshot:
- 5-person consulting team
- $28,300 active retainer MRR + $73k pipeline
- 78.8% avg team utilisation (target 80%)
- 4 active engagements (mix of retainers and projects)
- 2 hot proposals in play (Meridian Group $42k, Nova Partners $6k)
Be direct, strategic, and specific. Use bullet points for lists. Sound like a COO who has run consulting firms — practical, commercial, and outcome-oriented.`;

const CHIPS = [
  "What should I prioritise this week?",
  "How do I improve utilisation rates?",
  "Tips to close the Meridian proposal?",
  "How do I protect Crestline from churning?",
  "Draft a retainer upsell strategy",
];

// ── pill component ───────────────────────────────────────────────────────────
function Pill({ label }) {
  const map = {
    high:     { bg:"#fdeaea", color:"#8b2020", border:"#f5c0c0" },
    medium:   { bg:"#fef5d4", color:"#7a5c00", border:"#f0d878" },
    low:      { bg:"#e8f5ee", color:"#2d6a4f", border:"#a8d8bc" },
    Healthy:  { bg:"#e8f5ee", color:"#2d6a4f", border:"#a8d8bc" },
    "At Risk":{ bg:"#fef5d4", color:"#7a5c00", border:"#f0d878" },
    Cold:     { bg:"#f0ece6", color:"#a8a39c", border:"#d4cdc0" },
    Warm:     { bg:"#fef0d4", color:"#8a5e00", border:"#e8c878" },
    Active:   { bg:"#e8f0f8", color:"#1a3a5c", border:"#a8c0d8" },
    Proposal: { bg:"#f0e8f8", color:"#4a2a6a", border:"#c8a8e8" },
    Qualified:{ bg:"#fef5d4", color:"#7a5c00", border:"#f0d878" },
    Retainer: { bg:"#e8f5ee", color:"#2d6a4f", border:"#a8d8bc" },
    Project:  { bg:"#e8f0f8", color:"#1a3a5c", border:"#a8c0d8" },
    Advisory: { bg:"#f0e8f8", color:"#4a2a6a", border:"#c8a8e8" },
    BD:       { bg:"#fef0d4", color:"#8a5e00", border:"#e8c878" },
    Client:   { bg:"#e8f0f8", color:"#1a3a5c", border:"#a8c0d8" },
    Delivery: { bg:"#e8f5ee", color:"#2d6a4f", border:"#a8d8bc" },
    Admin:    { bg:"#f0ece6", color:"#a8a39c", border:"#d4cdc0" },
    Legal:    { bg:"#fdeaea", color:"#8b2020", border:"#f5c0c0" },
    Marketing:{ bg:"#f0e8f8", color:"#4a2a6a", border:"#c8a8e8" },
  };
  const s = map[label] || map.low;
  return (
    <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:3, fontSize:10,
      fontFamily:"'IBM Plex Mono', monospace", letterSpacing:"0.04em",
      background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
      {label}
    </span>
  );
}

// ── bar chart ────────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:120 }}>
      {data.map(d => {
        const rh = (d.revenue / max) * 110;
        const eh = (d.expenses / max) * 110;
        return (
          <div key={d.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{ display:"flex", gap:3, alignItems:"flex-end" }}>
              <div title={`Revenue $${d.revenue.toLocaleString()}`}
                style={{ width:16, height:rh, background:`linear-gradient(180deg,${C.goldMid},${C.gold})`,
                  borderRadius:"2px 2px 0 0", minHeight:4 }} />
              <div title={`Expenses $${d.expenses.toLocaleString()}`}
                style={{ width:16, height:eh, background:C.border,
                  borderRadius:"2px 2px 0 0", minHeight:4 }} />
            </div>
            <div style={{ fontSize:9, color:C.inkLight }}>{d.month}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── utilisation gauge ────────────────────────────────────────────────────────
function UtilBar({ value }) {
  const color = value >= 80 ? C.green : value >= 65 ? C.amber : C.red;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
      <div style={{ flex:1, height:4, background:C.border, borderRadius:2, overflow:"hidden" }}>
        <div style={{ width:`${value}%`, height:"100%", background:color, borderRadius:2, transition:"width 0.6s ease" }} />
      </div>
      <span style={{ fontSize:11, color, fontFamily:"'IBM Plex Mono', monospace", minWidth:36 }}>{value}%</span>
    </div>
  );
}

// ── main app ─────────────────────────────────────────────────────────────────
export default function App() {
  const [section, setSection] = useState("dashboard");
  const [tasks, setTasks]     = useState(TASKS);
  const [newTask, setNewTask] = useState("");
  const [chat, setChat]       = useState([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [chat]);

  function toggleTask(id) {
    setTasks(t => t.map(x => x.id === id ? { ...x, done:!x.done } : x));
  }
  function addTask() {
    if (!newTask.trim()) return;
    setTasks(t => [...t, { id:Date.now(), text:newTask, priority:"medium", done:false, due:"Soon", cat:"Admin" }]);
    setNewTask("");
  }

  async function send(msg) {
    const m = msg || input;
    if (!m.trim() || loading) return;
    setInput("");
    const history = [...chat, { role:"user", content:m }];
    setChat(history);
    setLoading(true);
    try {
      const reply = await callClaude(history.map(h => ({ role:h.role, content:h.content })), SYSTEM);
      setChat([...history, { role:"assistant", content:reply }]);
    } catch {
      setChat([...history, { role:"assistant", content:"Connection issue — please try again." }]);
    }
    setLoading(false);
  }

  const completedCount = tasks.filter(t => t.done).length;
  const activeClients  = CLIENTS.filter(c => c.stage === "Active").length;
  const pipelineTotal  = CLIENTS.filter(c => ["Proposal","Qualified"].includes(c.stage))
    .reduce((a,c) => a + parseInt(c.mrr.replace(/[$,]/g,"")), 0);

  return (
    <div style={{ fontFamily:"'IBM Plex Sans', Georgia, serif", background:C.bg,
      color:C.ink, minHeight:"100vh", display:"flex", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:${C.bg};}
        ::-webkit-scrollbar-thumb{background:${C.borderDark};border-radius:2px;}
        .nav-item{width:100%;display:flex;align-items:center;gap:12px;padding:10px 20px;
          background:none;border:none;cursor:pointer;transition:all 0.15s;
          font-family:'IBM Plex Sans',sans-serif;font-size:13px;color:${C.inkMid};text-align:left;}
        .nav-item:hover{background:${C.goldLight};color:${C.gold};}
        .nav-item.active{background:${C.goldLight};color:${C.gold};font-weight:600;
          border-right:2px solid ${C.gold};}
        .card{background:${C.surface};border:1px solid ${C.border};border-radius:4px;}
        .inp{background:${C.surface};border:1px solid ${C.border};color:${C.ink};
          border-radius:3px;padding:9px 13px;font-family:'IBM Plex Sans',sans-serif;
          font-size:13px;outline:none;transition:border-color 0.2s;width:100%;}
        .inp:focus{border-color:${C.gold};}
        .btn{background:${C.gold};border:none;color:#fff;padding:9px 18px;border-radius:3px;
          cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:12px;
          font-weight:600;letter-spacing:0.04em;transition:opacity 0.2s;}
        .btn:hover{opacity:0.85;}
        .btn:disabled{opacity:0.4;cursor:default;}
        .btn-outline{background:none;border:1px solid ${C.borderDark};color:${C.inkMid};
          padding:7px 14px;border-radius:3px;cursor:pointer;font-size:11px;
          font-family:'IBM Plex Mono',monospace;letter-spacing:0.06em;transition:all 0.2s;}
        .btn-outline:hover{border-color:${C.gold};color:${C.gold};}
        .task-row{display:flex;align-items:center;gap:12px;padding:11px 0;
          border-bottom:1px solid ${C.border};transition:opacity 0.2s;}
        .task-row:last-child{border-bottom:none;}
        .chip{background:${C.surface};border:1px solid ${C.border};color:${C.inkMid};
          padding:5px 12px;border-radius:20px;cursor:pointer;font-size:11px;
          font-family:'IBM Plex Mono',monospace;transition:all 0.2s;white-space:nowrap;}
        .chip:hover{border-color:${C.gold};color:${C.gold};}
        .kpi-card{background:${C.surface};border:1px solid ${C.border};border-radius:4px;
          padding:18px 20px;position:relative;overflow:hidden;}
        .kpi-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,${C.goldMid},${C.gold});}
        .prog-track{height:4px;background:${C.border};border-radius:2px;overflow:hidden;margin-top:8px;}
        .prog-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,${C.goldMid},${C.gold});transition:width 0.7s ease;}
        .bubble-user{background:${C.goldLight};border:1px solid #e0c878;border-radius:12px 12px 2px 12px;
          padding:10px 14px;max-width:78%;margin-left:auto;font-size:13px;line-height:1.55;color:${C.ink};}
        .bubble-ai{background:${C.surface};border:1px solid ${C.border};border-radius:2px 12px 12px 12px;
          padding:10px 14px;max-width:84%;font-size:13px;line-height:1.65;white-space:pre-wrap;color:${C.ink};}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        .thinking{animation:blink 1.3s infinite;}
        .sec-title{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:24px;
          letter-spacing:-0.02em;color:${C.ink};margin-bottom:2px;}
        .sec-sub{font-family:'IBM Plex Mono',monospace;font-size:10px;color:${C.inkLight};
          letter-spacing:0.12em;text-transform:uppercase;margin-bottom:24px;}
        table{width:100%;border-collapse:collapse;}
        th{padding:10px 16px;text-align:left;font-family:'IBM Plex Mono',monospace;
          font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:${C.inkLight};
          font-weight:400;border-bottom:1px solid ${C.border};}
        td{padding:12px 16px;font-size:12px;border-bottom:1px solid ${C.border};}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:#faf9f6;}
      `}</style>

      {/* ── sidebar ── */}
      <aside style={{ width:collapsed ? 52 : 220, background:C.surface,
        borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column",
        transition:"width 0.28s ease", overflow:"hidden", flexShrink:0, zIndex:10 }}>

        {/* brand */}
        <div style={{ padding:"22px 20px 18px", borderBottom:`1px solid ${C.border}`, minWidth:220 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:3, flexShrink:0,
              background:`linear-gradient(135deg,${C.gold},#7a5c00)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:14, fontWeight:700 }}>◈</div>
            {!collapsed && (
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:14,
                  color:C.ink, lineHeight:1 }}>OPS DIRECTOR</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                  color:C.inkLight, letterSpacing:"0.12em", marginTop:2 }}>CONSULTING</div>
              </div>
            )}
          </div>
        </div>

        {/* nav */}
        <nav style={{ flex:1, paddingTop:8 }}>
          {SECTIONS.map(s => (
            <button key={s.id} className={`nav-item ${section===s.id?"active":""}`}
              onClick={() => setSection(s.id)} title={collapsed ? s.label : ""}>
              <span style={{ fontSize:15, flexShrink:0 }}>{s.icon}</span>
              {!collapsed && <span>{s.label}</span>}
            </button>
          ))}
        </nav>

        {/* collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)}
          style={{ padding:"14px 20px", background:"none", border:"none",
            borderTop:`1px solid ${C.border}`, cursor:"pointer",
            color:C.inkLight, fontSize:16, display:"flex", justifyContent:collapsed?"center":"flex-end" }}>
          {collapsed ? "›" : "‹"}
        </button>
      </aside>

      {/* ── main ── */}
      <main style={{ flex:1, overflow:"auto", padding:"32px 40px" }}>

        {/* ════════════ DASHBOARD ════════════ */}
        {section === "dashboard" && (
          <div>
            <div className="sec-title">Command Center</div>
            <div className="sec-sub">Consulting Operations — May 2026</div>

            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
              {KPI.map(k => (
                <div key={k.label} className="kpi-card">
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                    color:C.inkLight, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>
                    {k.label}
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:26,
                    color:C.ink, letterSpacing:"-0.03em" }}>{k.value}</div>
                  <div style={{ fontSize:11, marginTop:6,
                    color: k.up ? C.green : C.red, fontFamily:"'IBM Plex Mono',monospace" }}>
                    {k.delta}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:16, marginBottom:16 }}>
              {/* revenue chart */}
              <div className="card" style={{ padding:22 }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.inkLight,
                  letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:18 }}>
                  Revenue vs Expenses 2026
                </div>
                <BarChart data={FINANCE} />
                <div style={{ display:"flex", gap:16, marginTop:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:C.inkMid }}>
                    <div style={{ width:10, height:10, background:C.goldMid, borderRadius:1 }} /> Revenue
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:C.inkMid }}>
                    <div style={{ width:10, height:10, background:C.border, borderRadius:1 }} /> Expenses
                  </div>
                </div>
              </div>

              {/* top tasks */}
              <div className="card" style={{ padding:22 }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.inkLight,
                  letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:14 }}>
                  Today's Priorities
                </div>
                {tasks.filter(t => !t.done && t.priority==="high").map(t => (
                  <div key={t.id} className="task-row">
                    <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)}
                      style={{ accentColor:C.gold, width:14, height:14 }} />
                    <span style={{ flex:1, fontSize:12, color:C.inkMid }}>{t.text}</span>
                    <Pill label={t.cat} />
                  </div>
                ))}
                <div style={{ marginTop:12, fontSize:11, color:C.inkLight, fontFamily:"'IBM Plex Mono',monospace" }}>
                  {completedCount}/{tasks.length} complete today
                </div>
              </div>
            </div>

            {/* team util + client health */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div className="card" style={{ padding:22 }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.inkLight,
                  letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:16 }}>
                  Team Utilisation
                </div>
                {TEAM.map(m => (
                  <div key={m.name} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                    <div style={{ fontSize:12, color:C.ink, fontWeight:500, minWidth:110 }}>{m.name.split(" ")[0]}</div>
                    <UtilBar value={m.util} />
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding:22 }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.inkLight,
                  letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:16 }}>
                  Client Snapshot
                </div>
                {CLIENTS.filter(c => c.stage==="Active").map(c => (
                  <div key={c.name} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ fontSize:12, color:C.ink }}>{c.name}</span>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11,
                        color:C.gold }}>{c.mrr}</span>
                      <Pill label={c.health} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop:12, fontSize:11, color:C.inkLight,
                  fontFamily:"'IBM Plex Mono',monospace" }}>
                  Pipeline: ${pipelineTotal.toLocaleString()} across {CLIENTS.filter(c=>["Proposal","Qualified"].includes(c.stage)).length} prospects
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ TASKS ════════════ */}
        {section === "tasks" && (
          <div>
            <div className="sec-title">Daily Operations</div>
            <div className="sec-sub">Tasks, priorities & execution</div>
            <div className="card" style={{ padding:24 }}>
              <div style={{ display:"flex", gap:10, marginBottom:24 }}>
                <input className="inp" value={newTask} onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && addTask()}
                  placeholder="Add a task… (press Enter)" />
                <button className="btn" onClick={addTask} style={{ whiteSpace:"nowrap" }}>+ Add</button>
              </div>
              {["high","medium","low"].map(pri => {
                const grp = tasks.filter(t => t.priority===pri);
                return (
                  <div key={pri} style={{ marginBottom:24 }}>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.inkLight,
                      letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:8,
                      display:"flex", alignItems:"center", gap:8 }}>
                      <Pill label={pri} /> {pri} priority
                    </div>
                    {grp.map(t => (
                      <div key={t.id} className="task-row" style={{ opacity:t.done ? 0.4 : 1 }}>
                        <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)}
                          style={{ accentColor:C.gold, width:14, height:14 }} />
                        <span style={{ flex:1, fontSize:13, color:C.inkMid,
                          textDecoration:t.done?"line-through":"none" }}>{t.text}</span>
                        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10,
                          color:C.inkLight, marginRight:8 }}>{t.due}</span>
                        <Pill label={t.cat} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:12, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:C.inkLight }}>
              {completedCount} of {tasks.length} tasks complete
            </div>
          </div>
        )}

        {/* ════════════ TEAM ════════════ */}
        {section === "team" && (
          <div>
            <div className="sec-title">Team & HR</div>
            <div className="sec-sub">Consultants, utilisation & people ops</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              {TEAM.map(m => (
                <div key={m.name} className="card" style={{ padding:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                    <div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700,
                        fontSize:16, color:C.ink }}>{m.name}</div>
                      <div style={{ fontSize:11, color:C.inkLight, marginTop:2 }}>{m.role}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10,
                      color: m.status==="busy" ? C.amber : C.green,
                      fontFamily:"'IBM Plex Mono',monospace" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%",
                        background: m.status==="busy" ? "#d4a820" : C.green }} />
                      {m.status}
                    </div>
                  </div>
                  <div style={{ fontSize:10, color:C.inkLight, marginBottom:6,
                    fontFamily:"'IBM Plex Mono',monospace" }}>UTILISATION</div>
                  <UtilBar value={m.util} />
                  <div style={{ fontSize:11, color:C.inkMid, marginTop:10 }}>
                    Engagement: <span style={{ color:C.gold }}>{m.eng}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding:22 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.inkLight,
                letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:14 }}>
                HR Actions
              </div>
              {[
                "Conduct Q2 performance reviews with all consultants (due Jun 15)",
                "Post Senior Strategy Consultant role — target close by Aug 1",
                "Renew contractor agreements for Rowan S. (expires Jun 30)",
                "Schedule team offsite for Q3 planning — confirm venue by May 30",
              ].map((a,i) => (
                <div key={i} className="task-row">
                  <span style={{ color:C.gold, fontSize:12 }}>▸</span>
                  <span style={{ fontSize:13, color:C.inkMid }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ FINANCE ════════════ */}
        {section === "finance" && (
          <div>
            <div className="sec-title">Finance & Budget</div>
            <div className="sec-sub">Revenue, margins & cash flow</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
              {[
                { label:"Retainer MRR",    value:"$28,300", note:"↑14% MoM",            color:C.green },
                { label:"Project Revenue", value:"$65,200", note:"2 active projects",    color:C.blue  },
                { label:"Gross Margin",    value:"56%",      note:"Target: 60%",          color:C.amber },
              ].map(m => (
                <div key={m.label} className="kpi-card">
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                    color:C.inkLight, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>
                    {m.label}
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700,
                    fontSize:28, color:C.ink, letterSpacing:"-0.03em" }}>{m.value}</div>
                  <div style={{ fontSize:11, marginTop:6, color:m.color,
                    fontFamily:"'IBM Plex Mono',monospace" }}>{m.note}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding:24, marginBottom:16 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.inkLight,
                letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:20 }}>
                Monthly P&L — 2026
              </div>
              <table>
                <thead><tr>
                  {["Month","Revenue","Expenses","Net Profit","Billable Hrs"].map(h => <th key={h}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {FINANCE.map(d => {
                    const net = d.revenue - d.expenses;
                    const margin = Math.round((net/d.revenue)*100);
                    return (
                      <tr key={d.month}>
                        <td style={{ fontFamily:"'IBM Plex Mono',monospace", color:C.inkMid }}>{d.month}</td>
                        <td style={{ color:C.green }}>${d.revenue.toLocaleString()}</td>
                        <td style={{ color:C.red }}>${d.expenses.toLocaleString()}</td>
                        <td>
                          <span style={{ color:C.green }}>${net.toLocaleString()}</span>
                          <span style={{ fontSize:10, color:C.inkLight,
                            fontFamily:"'IBM Plex Mono',monospace", marginLeft:6 }}>{margin}%</span>
                        </td>
                        <td style={{ fontFamily:"'IBM Plex Mono',monospace", color:C.inkMid }}>
                          {d.billable}h
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ padding:22 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.inkLight,
                letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:14 }}>
                Finance Actions
              </div>
              {[
                "Invoice Apex Venture — May retainer ($18,500) due Jun 1",
                "Chase overdue payment: Crestline Co. invoice #INV-0041 — 18 days late",
                "Review contractor costs vs project margins for Q3 planning",
              ].map((a,i) => (
                <div key={i} className="task-row">
                  <span style={{ color:C.gold, fontSize:12 }}>▸</span>
                  <span style={{ fontSize:13, color:C.inkMid }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ CLIENTS ════════════ */}
        {section === "clients" && (
          <div>
            <div className="sec-title">Client Pipeline</div>
            <div className="sec-sub">Engagements, health & BD</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {[
                { label:"Active Engagements", value:activeClients,  color:C.green },
                { label:"Proposals Out",       value:1,              color:C.amber },
                { label:"Qualified Prospects", value:2,              color:C.blue  },
                { label:"Pipeline Value",      value:"$73k",         color:C.gold  },
              ].map(k => (
                <div key={k.label} className="kpi-card" style={{ textAlign:"center", padding:"18px 14px" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700,
                    fontSize:30, color:k.color }}>{k.value}</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                    color:C.inkLight, letterSpacing:"0.1em", textTransform:"uppercase", marginTop:6 }}>
                    {k.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ overflow:"hidden" }}>
              <table>
                <thead><tr>
                  {["Client","Stage","Type","Value","Health","Contact"].map(h => <th key={h}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {CLIENTS.map(c => (
                    <tr key={c.name}>
                      <td style={{ fontFamily:"'Playfair Display',serif", fontWeight:600,
                        fontSize:13, color:C.ink }}>{c.name}</td>
                      <td><Pill label={c.stage} /></td>
                      <td><Pill label={c.type} /></td>
                      <td style={{ fontFamily:"'IBM Plex Mono',monospace", color:C.gold }}>{c.mrr}</td>
                      <td><Pill label={c.health} /></td>
                      <td style={{ fontSize:11, color:C.inkLight }}>{c.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ padding:22, marginTop:16 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.inkLight,
                letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:14 }}>
                BD Actions This Week
              </div>
              {[
                "Send revised proposal to Meridian Group — follow up with COO by Thu",
                "Book discovery call with Fortis Capital — MD expressed interest via LinkedIn",
                "Schedule QBR with Apex Venture for June",
                "Crestline at risk — schedule exec check-in to surface issues early",
              ].map((a,i) => (
                <div key={i} className="task-row">
                  <span style={{ color:C.gold, fontSize:12 }}>▸</span>
                  <span style={{ fontSize:13, color:C.inkMid }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ STRATEGY ════════════ */}
        {section === "strategy" && (
          <div>
            <div className="sec-title">Strategy & Planning</div>
            <div className="sec-sub">OKRs, roadmap & firm growth</div>
            <div className="card" style={{ padding:24, marginBottom:16 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.inkLight,
                letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:22 }}>
                Q2–Q3 2026 OKRs
              </div>
              {OKRS.map(o => (
                <div key={o.goal} style={{ marginBottom:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div style={{ fontSize:13, color:C.ink, fontWeight:500 }}>{o.goal}</div>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                        color:C.inkLight }}>{o.q} 2026</span>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12,
                        color: o.progress>=80 ? C.green : o.progress>=50 ? C.amber : C.red,
                        fontWeight:700 }}>{o.progress}%</span>
                    </div>
                  </div>
                  <div className="prog-track">
                    <div className="prog-fill" style={{ width:`${o.progress}%`,
                      background: o.progress>=80
                        ? `linear-gradient(90deg,${C.green},#3a8a60)`
                        : o.progress>=50
                          ? `linear-gradient(90deg,${C.goldMid},${C.gold})`
                          : `linear-gradient(90deg,${C.red},#b03030)` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding:24 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.inkLight,
                letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:18 }}>
                Strategic Priorities — H2 2026
              </div>
              {[
                { title:"Retainer-first model", body:"Shift mix to 60% retainer / 40% project. Reduces revenue volatility and improves forecasting." },
                { title:"Niche specialisation", body:"Double down on operational transformation for mid-market B2B. Build 2 proprietary frameworks to differentiate from generalist competitors." },
                { title:"Thought leadership", body:"Publish monthly insights. Target 3 speaking engagements per year to drive inbound leads and reduce CAC." },
                { title:"Leverage & scale", body:"Systematise delivery via playbooks and templates. Hire 1 senior hire H2 to absorb growth without burning the team." },
              ].map((s, i) => (
                <div key={i} style={{ padding:"14px 0", borderBottom: i<3 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontWeight:600, fontSize:13, color:C.ink, marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:12, color:C.inkMid, lineHeight:1.6 }}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════ ADVISOR ════════════ */}
        {section === "advisor" && (
          <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 64px)" }}>
            <div className="sec-title">AI Operations Advisor</div>
            <div className="sec-sub">Your on-call Virtual COO — consulting-grade intelligence</div>

            {chat.length === 0 && (
              <div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10,
                  color:C.inkLight, marginBottom:10 }}>Quick starts:</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
                  {CHIPS.map(p => (
                    <button key={p} className="chip" onClick={() => send(p)}>{p}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column",
              gap:14, paddingBottom:16 }}>
              {chat.length === 0 && (
                <div style={{ flex:1, display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", padding:"40px 20px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:40,
                    color:C.border, marginBottom:16 }}>✦</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700,
                    fontSize:20, color:C.borderDark, marginBottom:8 }}>
                    Ask your Operations Director
                  </div>
                  <div style={{ fontSize:12, color:C.inkLight, maxWidth:380, lineHeight:1.7 }}>
                    Strategy, client management, team utilisation, proposals, pricing, delivery — ask anything.
                  </div>
                </div>
              )}

              {chat.map((m,i) => (
                <div key={i} style={{ display:"flex", flexDirection:"column",
                  alignItems: m.role==="user" ? "flex-end" : "flex-start" }}>
                  {m.role==="assistant" && (
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                      color:C.inkLight, letterSpacing:"0.1em", marginBottom:4, marginLeft:4 }}>
                      OPS DIRECTOR
                    </div>
                  )}
                  <div className={m.role==="user" ? "bubble-user" : "bubble-ai"}>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                    color:C.inkLight, letterSpacing:"0.1em", marginBottom:4, marginLeft:4 }}>
                    OPS DIRECTOR
                  </div>
                  <div className="bubble-ai thinking" style={{ color:C.inkLight }}>
                    Analysing your consulting operations…
                  </div>
                </div>
              )}
              <div ref={chatEnd} />
            </div>

            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
              <div style={{ display:"flex", gap:10, marginBottom:10 }}>
                <input className="inp" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && send()}
                  placeholder="Ask about strategy, clients, team, finance, delivery…" />
                <button className="btn" onClick={() => send()} disabled={loading || !input.trim()}
                  style={{ whiteSpace:"nowrap" }}>
                  {loading ? "…" : "Send"}
                </button>
              </div>
              {chat.length > 0 && (
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {CHIPS.slice(0,3).map(p => (
                    <button key={p} className="chip" onClick={() => send(p)} disabled={loading}>{p}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}