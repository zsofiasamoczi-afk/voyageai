"use client";
import { useState, useRef, useEffect } from "react";

/* ── constants ─────────────────────────────────────────────────────────────── */
const STEPS = [
  { id: "destination",   label: "Úti cél",    icon: "🌍" },
  { id: "transport",     label: "Közlekedés", icon: "✈️" },
  { id: "dates",         label: "Dátumok",    icon: "📅" },
  { id: "accommodation", label: "Szállás",    icon: "🏨" },
  { id: "style",         label: "Jelleg",     icon: "🎭" },
  { id: "budget",        label: "Büdzsé",     icon: "💰" },
];
const TRANSPORT = [
  { id:"plane", label:"Repülő", icon:"✈️" },
  { id:"car",   label:"Autó",   icon:"🚗" },
  { id:"train", label:"Vonat",  icon:"🚂" },
  { id:"bus",   label:"Busz",   icon:"🚌" },
  { id:"ship",  label:"Hajó",   icon:"🚢" },
];
const ACCOMM = [
  { id:"hotel",     label:"Hotel",    icon:"🏨" },
  { id:"apartment", label:"Apartman", icon:"🏠" },
  { id:"airbnb",    label:"Airbnb",   icon:"🔑" },
  { id:"hostel",    label:"Hostel",   icon:"🛏️" },
  { id:"resort",    label:"Resort",   icon:"🌴" },
  { id:"villa",     label:"Villa",    icon:"🏡" },
];
const STYLES = [
  { id:"sightseeing", label:"Városnézés",    icon:"🏛️" },
  { id:"museum",      label:"Múzeum",        icon:"🖼️" },
  { id:"beach",       label:"Strand",        icon:"🏖️" },
  { id:"spa",         label:"Spa/Wellness",  icon:"💆" },
  { id:"work",        label:"Munkaút",       icon:"💼" },
  { id:"adventure",   label:"Kaland",        icon:"🏔️" },
  { id:"food",        label:"Gasztronómia",  icon:"🍽️" },
  { id:"shopping",    label:"Bevásárlás",    icon:"🛍️" },
  { id:"nightlife",   label:"Éjszakai élet", icon:"🎉" },
  { id:"family",      label:"Családi",       icon:"👨‍👩‍👧" },
];
const DEP_TIMES = [
  { id:"early_morning", label:"Kora reggel (5–8h)" },
  { id:"morning",       label:"Reggel (8–12h)" },
  { id:"afternoon",     label:"Délután (12–17h)" },
  { id:"evening",       label:"Este (17–22h)" },
  { id:"night",         label:"Éjjel (22–5h)" },
  { id:"any",           label:"Bármelyik" },
];
const RET_TIMES = [
  { id:"morning",   label:"Reggel (8–12h)" },
  { id:"afternoon", label:"Délután (12–17h)" },
  { id:"evening",   label:"Este (17–22h)" },
  { id:"night",     label:"Éjjel (22–5h)" },
  { id:"any",       label:"Bármelyik" },
];

/* ── shared styles ─────────────────────────────────────────────────────────── */
const IS = {
  width:"100%", padding:"13px 16px", borderRadius:"10px",
  border:"2px solid #2e2e4a", background:"#1a1a28", color:"#e8d5b0",
  fontSize:"15px", fontFamily:"'DM Sans',sans-serif", outline:"none",
};
const LS = { display:"block", color:"#c5c5d8", fontSize:"14px", fontWeight:600, marginBottom:"10px" };
const chip = (a) => ({
  padding:"9px 15px", borderRadius:"30px", cursor:"pointer",
  fontFamily:"'DM Sans',sans-serif", fontSize:"13px", transition:"all .2s",
  border: a ? "2px solid #e8a045" : "2px solid #2a2a3a",
  background: a ? "linear-gradient(135deg,#e8a045,#c96a1a)" : "#1a1a28",
  color: a ? "#fff" : "#aaa", fontWeight: a ? 700 : 400,
});

/* ── helpers ───────────────────────────────────────────────────────────────── */
function MultiSelect({ options, selected, onChange }) {
  const t = id => onChange(selected.includes(id) ? selected.filter(s=>s!==id) : [...selected,id]);
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:"9px"}}>
      {options.map(o => (
        <button key={o.id} onClick={()=>t(o.id)} style={chip(selected.includes(o.id))}>
          {o.icon} {o.label}
        </button>
      ))}
    </div>
  );
}

function buildPrompt(f) {
  const tl  = f.transport.map(t=>TRANSPORT.find(o=>o.id===t)?.label).join(", ");
  const al  = f.accommodation.map(a=>ACCOMM.find(o=>o.id===a)?.label).join(", ");
  const sl  = f.tripStyle.map(s=>STYLES.find(o=>o.id===s)?.label).join(", ");
  const dep = DEP_TIMES.find(t=>t.id===f.departureTime)?.label || "Bármelyik";
  const ret = RET_TIMES.find(t=>t.id===f.returnTime)?.label   || "Bármelyik";
  return `Kérlek, készíts TELJES utazási tervet magyarul az alábbi adatok alapján!

🌍 ADATOK:
• Kiindulópont: ${f.origin||"Budapest"}
• Úti cél: ${f.destination}
• Közlekedés: ${tl}
• Indulás: ${f.startDate} (${dep})
• Visszaérkezés: ${f.endDate} (${ret})
• Időtartam: ${f.duration} nap
• Szállás: ${al}
• Jelleg: ${sl}
• Büdzsé: ${f.budget} ${f.currency} (${f.travelers} főre)
• Különleges: ${f.specialRequests||"Nincs"}

Töltsd ki az összes szekciót részletesen:

1. ✈️ REPÜLŐJEGYEK / KÖZLEKEDÉS – Skyscanner, Google Flights, Kayak, Momondo, WizzAir, Ryanair linkek; becsült árak oda-vissza; mikor érdemes foglalni; direkt vs átszálló.

2. 🏨 SZÁLLÁSLEHETŐSÉGEK – Booking.com, Airbnb, Hostelworld linkek; legjobb városrészek; budget/közepes/prémium árak; ${f.duration} éjszaka összköltség.

3. 🚖 REPÜLŐTÉRI TRANSZFER – taxi, Uber, busz, metro, shuttle + becsült árak.

4. 🚘 AUTÓBÉRLÉS – AutoEurope, Rentalcars, Sixt linkek + árak.

5. 📅 NAPI PROGRAMTERV – minden napra (${f.duration} nap): reggeli/déli/délutáni/esti program + étkezési ajánló.

6. 🏛️ TOP LÁTNIVALÓK – top 10, belépőárak, nyitvatartás, ingyenes vs fizetős.

7. 🍽️ ÉTTERMEK – budget helyek (€5–15), helyi specialitások, TripAdvisor/Google Maps linkek.

8. 🎟️ KEDVEZMÉNYEK – City Card, Tourist Pass, diák kedvezmények, ingyenes napok.

9. ☀️ IDŐJÁRÁS & ÖLTÖZÉS – várható időjárás ${f.startDate} körül, mit pakkolj.

10. 🌐 KULTURÁLIS TUDNIVALÓK – szokások, illemszabályok, biztonsági tippek, hasznos kifejezések.

11. 💰 BÜDZSÉ ÖSSZESÍTŐ – repülő+szállás+transzfer+étkezés+programok+közlekedés részletezve; összesen X ${f.currency}; megtakarítási tippek.

Ha a megadott dátumra nem találsz jó lehetőséget, javasolj alternatív időpontokat és segíts az újratervezésben!`;
}

/* ── message renderer ──────────────────────────────────────────────────────── */
function Msg({ m }) {
  const isU = m.role === "user";
  const lines = (m.content || "").split("\n");
  const rndr = t => {
    const parts = t.split(/(https?:\/\/\S+|\*\*[^*]+\*\*)/g);
    return parts.map((p,i) => {
      if (!p) return null;
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={i} style={{color:"#e8d5b0"}}>{p.slice(2,-2)}</strong>;
      if (p.startsWith("http"))
        return <a key={i} href={p} target="_blank" rel="noopener noreferrer"
          style={{color:"#e8a045",wordBreak:"break-all",textDecoration:"underline"}}>{p}</a>;
      return p;
    });
  };
  return (
    <div style={{display:"flex",justifyContent:isU?"flex-end":"flex-start",marginBottom:"14px",animation:"fi .3s ease"}}>
      {!isU && (
        <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#e8a045,#c96a1a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,marginRight:8,marginTop:3}}>🌍</div>
      )}
      <div style={{maxWidth:"86%",background:isU?"linear-gradient(135deg,#e8a045,#c96a1a)":"#1e1e35",color:isU?"#fff":"#c5c5d8",borderRadius:isU?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"11px 15px",fontSize:13,lineHeight:1.75,border:isU?"none":"1px solid #2e2e4a"}}>
        {lines.map((line,i) => {
          if (line.startsWith("# "))  return <div key={i} style={{fontWeight:800,color:"#e8a045",fontSize:16,margin:"10px 0 5px",fontFamily:"'Playfair Display',serif"}}>{rndr(line.slice(2))}</div>;
          if (line.startsWith("## ")) return <div key={i} style={{fontWeight:700,color:"#e8d5b0",fontSize:14,margin:"8px 0 3px"}}>{rndr(line.slice(3))}</div>;
          if (line.startsWith("### ")) return <div key={i} style={{fontWeight:600,color:"#c8b080",fontSize:13,margin:"6px 0 2px"}}>{rndr(line.slice(4))}</div>;
          if (line.match(/^[-•]\s/)) return <div key={i} style={{paddingLeft:10,marginBottom:1}}>· {rndr(line.slice(2))}</div>;
          if (line.match(/^\d+\.\s/)) return <div key={i} style={{paddingLeft:10,marginBottom:3,fontWeight:600,color:"#e8d5b0"}}>{rndr(line)}</div>;
          if (!line.trim()) return <div key={i} style={{height:5}}/>;
          return <div key={i}>{rndr(line)}</div>;
        })}
      </div>
    </div>
  );
}

/* ── main ──────────────────────────────────────────────────────────────────── */
export default function App() {
  const [view, setView]   = useState("wizard"); // wizard | chat
  const [step, setStep]   = useState(0);
  const [fd, setFd]       = useState({
    destination:"", origin:"Budapest", transport:[],
    startDate:"", endDate:"", duration:"",
    departureTime:"any", returnTime:"any",
    accommodation:[], tripStyle:[],
    budget:"", currency:"EUR", travelers:"2", specialRequests:"",
  });
  const [msgs, setMsgs]   = useState([]);
  const [inp, setInp]     = useState("");
  const [busy, setBusy]   = useState(false);
  const endRef  = useRef(null);
  const inpRef  = useRef(null);

  const up = (k,v) => setFd(f=>({...f,[k]:v}));

  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs,busy]);

  const canGo = () => {
    switch(step){
      case 0: return fd.destination.trim().length>0;
      case 1: return fd.transport.length>0;
      case 2: return fd.startDate && fd.endDate;
      case 3: return fd.accommodation.length>0;
      case 4: return fd.tripStyle.length>0;
      case 5: return fd.budget.length>0;
      default: return true;
    }
  };

  const callAPI = async (history) => {
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMsgs(prev => [...prev, { role:"assistant", content: data.reply }]);
    } catch(e) {
      setMsgs(prev => [...prev, { role:"assistant", content:`⚠️ Hiba: ${e.message}` }]);
    }
    setBusy(false);
    setTimeout(() => inpRef.current?.focus(), 100);
  };

  const startChat = () => {
    const m = [{ role:"user", content: buildPrompt(fd) }];
    setMsgs(m);
    setView("chat");
    callAPI(m);
  };

  const send = async () => {
    const t = inp.trim();
    if (!t || busy) return;
    setInp("");
    const updated = [...msgs, { role:"user", content:t }];
    setMsgs(updated);
    await callAPI(updated);
  };

  /* step content */
  const stepContent = () => {
    switch(step){
      case 0: return (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={LS}>Honnan utazol?</label><input style={IS} placeholder="pl. Budapest" value={fd.origin} onChange={e=>up("origin",e.target.value)}/></div>
          <div><label style={LS}>Hova szeretnél utazni? *</label><input style={{...IS,fontSize:18}} placeholder="pl. Párizs, Bali, New York…" value={fd.destination} onChange={e=>up("destination",e.target.value)} autoFocus/></div>
          <div>
            <label style={LS}>Hány fő utazik?</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["1","2","3","4","5+"].map(n=><button key={n} onClick={()=>up("travelers",n)} style={chip(fd.travelers===n)}>{n} fő</button>)}
            </div>
          </div>
        </div>
      );
      case 1: return <div><label style={LS}>Közlekedési eszköz (több is) *</label><MultiSelect options={TRANSPORT} selected={fd.transport} onChange={v=>up("transport",v)}/></div>;
      case 2: return (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={LS}>Indulás dátuma *</label><input type="date" style={IS} value={fd.startDate} onChange={e=>up("startDate",e.target.value)}/></div>
          <div><label style={LS}>Visszaérkezés dátuma *</label>
            <input type="date" style={IS} value={fd.endDate} onChange={e=>{
              up("endDate",e.target.value);
              if(fd.startDate&&e.target.value){const d=Math.round((new Date(e.target.value)-new Date(fd.startDate))/86400000);up("duration",String(Math.max(0,d)));}
            }}/>
          </div>
          {fd.duration&&<div style={{background:"#1e1e35",borderRadius:10,padding:"10px 16px",border:"1px solid #e8a04540"}}><span style={{color:"#e8a045",fontWeight:700}}>⏱ {fd.duration} nap</span></div>}
          <div><label style={LS}>Mikor szeretnél indulni?</label><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{DEP_TIMES.map(t=><button key={t.id} onClick={()=>up("departureTime",t.id)} style={chip(fd.departureTime===t.id)}>{t.label}</button>)}</div></div>
          <div><label style={LS}>Mikor szeretnél visszaérkezni?</label><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{RET_TIMES.map(t=><button key={t.id} onClick={()=>up("returnTime",t.id)} style={chip(fd.returnTime===t.id)}>{t.label}</button>)}</div></div>
        </div>
      );
      case 3: return <div><label style={LS}>Szállás típusa (több is) *</label><MultiSelect options={ACCOMM} selected={fd.accommodation} onChange={v=>up("accommodation",v)}/></div>;
      case 4: return <div><label style={LS}>Utazás jellege (több is) *</label><MultiSelect options={STYLES} selected={fd.tripStyle} onChange={v=>up("tripStyle",v)}/></div>;
      case 5: return (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <label style={LS}>Teljes büdzsé ({fd.travelers} főre) *</label>
          <div style={{display:"flex",gap:10}}>
            <input style={{...IS,flex:1,fontSize:20,fontWeight:700}} type="number" placeholder="pl. 1500" value={fd.budget} onChange={e=>up("budget",e.target.value)}/>
            <select style={{...IS,width:94}} value={fd.currency} onChange={e=>up("currency",e.target.value)}>
              <option value="EUR">EUR €</option><option value="HUF">HUF Ft</option>
              <option value="USD">USD $</option><option value="GBP">GBP £</option>
            </select>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {["500","1000","1500","2000","3000","5000"].map(b=><button key={b} onClick={()=>up("budget",b)} style={chip(fd.budget===b)}>{b} {fd.currency}</button>)}
          </div>
          <div><label style={LS}>Különleges kérések (opcionális)</label>
            <textarea style={{...IS,height:72,resize:"vertical"}} placeholder="pl. vegetáriánus, gyerekbarát, akadálymentesített…" value={fd.specialRequests} onChange={e=>up("specialRequests",e.target.value)}/>
          </div>
        </div>
      );
      default: return null;
    }
  };

  const dE = encodeURIComponent(fd.destination);
  const QUICK = [
    {l:"✈️ Skyscanner", h:`https://www.skyscanner.net/transport/flights/${encodeURIComponent(fd.origin||"Budapest")}/${dE}/`},
    {l:"🏨 Booking.com", h:`https://www.booking.com/searchresults.hu.html?ss=${dE}&checkin=${fd.startDate}&checkout=${fd.endDate}`},
    {l:"🔑 Airbnb",      h:`https://www.airbnb.com/s/${dE}/homes?checkin=${fd.startDate}&checkout=${fd.endDate}`},
    {l:"🚗 AutoEurope",  h:`https://www.autoeurope.hu/car-rental/${dE}/`},
    {l:"🎟️ GetYourGuide",h:`https://www.getyourguide.com/s/?q=${dE}`},
    {l:"☀️ Időjárás",    h:`https://www.timeanddate.com/weather/${dE}`},
  ];

  const nb = (v,lbl) => (
    <button onClick={()=>setView(v)} style={{padding:"5px 10px",borderRadius:8,fontSize:11,cursor:"pointer",border:"1px solid "+(view===v?"#e8a045":"#2e2e3a"),background:view===v?"#2a1a0a":"transparent",color:view===v?"#e8a045":"#555",fontFamily:"inherit"}}>{lbl}</button>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0d0d1a"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(180deg,#0d0d1a,#1a0d00)",borderBottom:"1px solid #2a2a1a",padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:22}}>🌍</span>
          <div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:800,background:"linear-gradient(135deg,#e8d5b0,#e8a045)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>VoyageAI</h1>
            <p style={{color:"#555",fontSize:10,marginTop:-1}}>AI utazástervező</p>
          </div>
        </div>
        <div style={{display:"flex",gap:5}}>
          {nb("wizard","🔧 Varázsló")}
          {nb("chat","💬 Chat")}
        </div>
      </div>

      <div style={{maxWidth:640,margin:"0 auto",padding:"18px 14px"}}>

        {/* ── WIZARD ── */}
        {view==="wizard" && (
          <div style={{animation:"fi .35s ease"}}>
            {/* progress */}
            <div style={{marginBottom:22}}>
              <div style={{display:"flex",marginBottom:9}}>
                {STEPS.map((s,i)=>(
                  <div key={s.id} style={{flex:1,textAlign:"center"}}>
                    <div onClick={()=>{if(i<step)setStep(i);}} style={{width:32,height:32,borderRadius:"50%",margin:"0 auto 3px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:i<step?12:14,cursor:i<step?"pointer":"default",transition:"all .3s",background:i<step?"linear-gradient(135deg,#e8a045,#c96a1a)":i===step?"#1e1e35":"#14141f",border:i===step?"2px solid #e8a045":i<step?"none":"2px solid #2a2a3a"}}>{i<step?"✓":s.icon}</div>
                    <div style={{fontSize:9,color:i===step?"#e8a045":i<step?"#b89050":"#333"}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{height:3,background:"#1c1c30",borderRadius:2}}>
                <div style={{height:"100%",borderRadius:2,background:"linear-gradient(90deg,#e8a045,#c96a1a)",width:`${(step/(STEPS.length-1))*100}%`,transition:"width .4s ease"}}/>
              </div>
            </div>

            <div style={{background:"#111120",borderRadius:20,border:"1px solid #252540",padding:"24px 20px",marginBottom:18,boxShadow:"0 8px 48px #00000070"}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:21,color:"#e8d5b0",marginBottom:4}}>{STEPS[step].icon} {STEPS[step].label}</h2>
              <div style={{height:2,width:36,background:"linear-gradient(90deg,#e8a045,transparent)",marginBottom:20}}/>
              {stepContent()}
            </div>

            <div style={{display:"flex",gap:10}}>
              {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:13,borderRadius:12,border:"2px solid #252540",background:"transparent",color:"#666",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>← Vissza</button>}
              {step<STEPS.length-1
                ?<button onClick={()=>{if(canGo())setStep(s=>s+1);}} style={{flex:2,padding:13,borderRadius:12,border:"none",fontSize:15,fontWeight:700,cursor:canGo()?"pointer":"not-allowed",fontFamily:"inherit",background:canGo()?"linear-gradient(135deg,#e8a045,#c96a1a)":"#222230",color:canGo()?"#fff":"#444"}}>Következő →</button>
                :<button onClick={()=>{if(canGo())startChat();}} style={{flex:2,padding:14,borderRadius:12,border:"none",fontSize:16,fontWeight:700,cursor:canGo()?"pointer":"not-allowed",fontFamily:"'Playfair Display',serif",background:canGo()?"linear-gradient(135deg,#e8a045,#c96a1a)":"#222230",color:canGo()?"#fff":"#444"}}>🚀 Terv generálása!</button>
              }
            </div>
          </div>
        )}

        {/* ── CHAT ── */}
        {view==="chat" && (
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 90px)",animation:"fi .3s ease"}}>
            {/* chat header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",background:"#12121f",border:"1px solid #2e2e4a",borderRadius:13,marginBottom:11,flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#e8a045,#c96a1a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🌍</div>
                <div>
                  <div style={{color:"#e8d5b0",fontWeight:700,fontSize:13}}>VoyageAI Asszisztens</div>
                  <div style={{color:"#4a9a4a",fontSize:10}}>● Online</div>
                </div>
              </div>
              <button onClick={()=>{setMsgs([]);setView("wizard");setStep(0);}} style={{padding:"5px 10px",borderRadius:7,fontSize:11,border:"1px solid #2e2e4a",background:"#1a1a28",color:"#888",cursor:"pointer",fontFamily:"inherit"}}>🔄 Újratervezés</button>
            </div>

            {/* quick booking links */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,flexShrink:0}}>
              {QUICK.map(q=><a key={q.l} href={q.h} target="_blank" rel="noopener noreferrer" style={{padding:"5px 11px",borderRadius:18,fontSize:11,background:"#1e1e35",color:"#c5c5d8",fontWeight:600,textDecoration:"none",border:"1px solid #2e2e4a"}}>{q.l}</a>)}
            </div>

            {/* messages */}
            <div style={{flex:1,overflowY:"auto",paddingRight:2}}>
              {msgs.map((m,i)=><Msg key={i} m={m}/>)}
              {busy&&(
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#e8a045,#c96a1a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🌍</div>
                  <div style={{background:"#1e1e35",border:"1px solid #2e2e4a",borderRadius:"16px 16px 16px 4px",padding:"11px 16px",display:"flex",gap:5,alignItems:"center"}}>
                    {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#e8a045",animation:`dot 1.2s ease ${i*.2}s infinite`}}/>)}
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>

            {/* quick chips */}
            <div style={{display:"flex",gap:5,paddingTop:8,paddingBottom:6,flexWrap:"wrap",flexShrink:0}}>
              {["Adj olcsóbb alternatívát!","Más dátum javaslatot","Repülőjegy linkek","Szállás linkek","Büdzsé összesítő","Napi programterv"].map(q=>(
                <button key={q} onClick={()=>{setInp(q);inpRef.current?.focus();}} style={{padding:"4px 10px",borderRadius:18,fontSize:10,border:"1px solid #2e2e4a",background:"#1a1a28",color:"#888",cursor:"pointer",fontFamily:"inherit"}}>{q}</button>
              ))}
            </div>

            {/* input */}
            <div style={{display:"flex",gap:9,flexShrink:0}}>
              <textarea ref={inpRef} value={inp} onChange={e=>setInp(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                placeholder="Írj kérdést… pl. 'Más időpont?' · Shift+Enter = új sor"
                style={{flex:1,padding:"12px 14px",borderRadius:12,border:"2px solid #2e2e4a",background:"#1a1a28",color:"#e8d5b0",fontSize:13,fontFamily:"inherit",outline:"none",resize:"none",height:48,lineHeight:1.4}}/>
              <button onClick={send} disabled={!inp.trim()||busy} style={{width:48,height:48,borderRadius:12,border:"none",background:inp.trim()&&!busy?"linear-gradient(135deg,#e8a045,#c96a1a)":"#2a2a3a",color:"#fff",fontSize:19,cursor:inp.trim()&&!busy?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>↑</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
