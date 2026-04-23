import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';
const ACC = '#4f46e5';

const BEBAS_FONT = `
  @font-face {
    font-family: 'Bebas Neue';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('https://fonts.gstatic.com/s/bebasneuepro/v7/cn-0JQpLcfrYpW_8EHjZB57HmOFJSlRDgJe8nA.woff2') format('woff2'),
         url('https://fonts.gstatic.com/s/bebasneuepro/v7/cn-0JQpLcfrYpW_8EHjZB57HmOFJSlRDgJe8.woff') format('woff');
  }
`;

const SKILL_ABBR = [
  { key:'analisis_logs',           abbr:'LOG', color:'#3b82f6' },
  { key:'deteccion_amenazas',      abbr:'DET', color:'#6366f1' },
  { key:'respuesta_incidentes',    abbr:'RSP', color:'#f59e0b' },
  { key:'threat_hunting',          abbr:'THR', color:'#8b5cf6' },
  { key:'forense_digital',         abbr:'FOR', color:'#ec4899' },
  { key:'gestion_vulnerabilidades',abbr:'VUL', color:'#f97316' },
  { key:'inteligencia_amenazas',   abbr:'INT', color:'#10b981' },
  { key:'siem_queries',            abbr:'SIE', color:'#0891b2' },
];

const ARENA_THEMES = {
  bronce:   { main:'#d97706', accent:'#fbbf24', light:'#fef3c7', bg:'linear-gradient(160deg,#3d1a00 0%,#7c3000 30%,#b85a00 60%,#7c3000 80%,#2a1000 100%)', shine:'rgba(255,200,100,0.12)' },
  plata:    { main:'#94a3b8', accent:'#e2e8f0', light:'#f1f5f9', bg:'linear-gradient(160deg,#0f172a 0%,#1e293b 35%,#334155 60%,#1e293b 80%,#0f172a 100%)', shine:'rgba(200,220,240,0.1)' },
  oro:      { main:'#f59e0b', accent:'#fde68a', light:'#fffbeb', bg:'linear-gradient(160deg,#1a1200 0%,#4a3500 25%,#8a6200 55%,#c49000 75%,#4a3500 90%,#1a1200 100%)', shine:'rgba(255,230,100,0.18)' },
  diamante: { main:'#3b82f6', accent:'#93c5fd', light:'#dbeafe', bg:'linear-gradient(160deg,#020817 0%,#0c1f4a 30%,#1a3a8a 60%,#0c1f4a 80%,#020817 100%)', shine:'rgba(147,197,253,0.15)' },
};

const TIERS    = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const TIER_CLR = ['','#64748b','#3b82f6','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444','#8b5cf6'];

const ARENAS_CONFIG = [
  { id:'bronce3',  name:'Bronce III',  tier:'bronce',   min:0,    max:299   },
  { id:'bronce2',  name:'Bronce II',   tier:'bronce',   min:300,  max:599   },
  { id:'bronce1',  name:'Bronce I',    tier:'bronce',   min:600,  max:899   },
  { id:'plata3',   name:'Plata III',   tier:'plata',    min:900,  max:1199  },
  { id:'plata2',   name:'Plata II',    tier:'plata',    min:1200, max:1499  },
  { id:'plata1',   name:'Plata I',     tier:'plata',    min:1500, max:1799  },
  { id:'oro3',     name:'Oro III',     tier:'oro',      min:1800, max:2099  },
  { id:'oro2',     name:'Oro II',      tier:'oro',      min:2100, max:2399  },
  { id:'oro1',     name:'Oro I',       tier:'oro',      min:2400, max:2699  },
  { id:'diamante3',name:'Diamante III',tier:'diamante', min:2700, max:2999  },
  { id:'diamante2',name:'Diamante II', tier:'diamante', min:3000, max:3299  },
  { id:'diamante1',name:'Diamante I',  tier:'diamante', min:3300, max:99999 },
];

const getArenaFromCopas = c => ARENAS_CONFIG.find(a => c >= a.min && c <= a.max) || ARENAS_CONFIG[0];

function getArenaGroup(arena) {
  if (!arena) return 'bronce';
  const a = arena.toLowerCase();
  if (a.includes('diamante')) return 'diamante';
  if (a.includes('oro'))      return 'oro';
  if (a.includes('plata'))    return 'plata';
  return 'bronce';
}

function calcOVR(skills) {
  const vals = SKILL_ABBR.map(s => Math.round((skills?.[s.key] || 0) * 10));
  const avg  = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  return Math.max(50, avg);
}

/* ── ANALYST CARD FIFA ── */
function FifaCard({ nombre, tier, skills, copas, arena, size='lg', onClick }) {
  const group     = getArenaGroup(arena);
  const theme     = ARENA_THEMES[group];
  const skillVals = SKILL_ABBR.map(s => ({ ...s, val: Math.max(50, Math.round((skills?.[s.key] || 0) * 10)) }));
  const ovr       = calcOVR(skills);
  const initials  = nombre ? nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SO';
  const W = size === 'lg' ? 240 : size === 'md' ? 190 : 150;
  const H = Math.round(W * 1.56);
  const F = `'Bebas Neue','Impact','Arial Narrow',sans-serif`;

  return (
    <div onClick={onClick} style={{
      width:W, height:H, borderRadius:W*0.07, position:'relative', overflow:'hidden',
      boxShadow:`0 24px 56px ${theme.main}55, 0 4px 16px rgba(0,0,0,0.5)`,
      flexShrink:0, cursor:onClick?'pointer':'default',
    }}>
      <div style={{ position:'absolute', inset:0, background:theme.bg }}/>
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-40%', right:'-15%', width:'55%', height:'200%', background:'rgba(255,255,255,0.022)', transform:'rotate(18deg)' }}/>
        <div style={{ position:'absolute', top:'-40%', right:'15%',  width:'18%', height:'200%', background:'rgba(255,255,255,0.012)', transform:'rotate(18deg)' }}/>
      </div>
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${theme.shine} 0%,transparent 55%,rgba(0,0,0,0.18) 100%)`, pointerEvents:'none' }}/>
      <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', padding:`${W*0.06}px ${W*0.07}px` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:W*0.005 }}>
          <div>
            <div style={{ fontFamily:F, fontSize:W*0.25, lineHeight:1, color:theme.accent, letterSpacing:-1, textShadow:`0 0 40px ${theme.accent}50` }}>{ovr}</div>
            <div style={{ fontFamily:F, fontSize:W*0.075, color:theme.accent, letterSpacing:4, opacity:.85, marginTop:-W*0.01 }}>ANALYST</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:W*0.036, fontWeight:800, color:theme.accent, letterSpacing:1, marginTop:W*0.02,
              padding:`2px ${W*0.03}px`, borderRadius:20, background:`${theme.main}22`, border:`1px solid ${theme.main}40`, display:'inline-block' }}>
              {arena ? arena.toUpperCase() : 'BRONCE III'}
            </div>
          </div>
          <div style={{ textAlign:'right', paddingTop:2 }}>
            <div style={{ fontFamily:F, fontSize:W*0.052, letterSpacing:3, color:`${theme.accent}40` }}>SOCBLAST</div>
            <div style={{ width:W*0.13, height:W*0.13, borderRadius:W*0.03, background:`${theme.accent}10`, border:`1px solid ${theme.accent}22`, display:'flex', alignItems:'center', justifyContent:'center', marginLeft:'auto', marginTop:3 }}>
              <svg width={W*0.07} height={W*0.07} viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <svg width={W*0.55} height={W*0.55} viewBox="0 0 100 100" style={{ position:'absolute' }}>
            <polygon points="50,3 94,27 94,73 50,97 6,73 6,27" fill={`${theme.accent}07`} stroke={theme.accent} strokeWidth="1.8" strokeOpacity="0.3"/>
            <polygon points="50,12 86,32 86,68 50,88 14,68 14,32" fill={`${theme.accent}04`} stroke={theme.accent} strokeWidth="0.6" strokeOpacity="0.15"/>
          </svg>
          <div style={{ fontFamily:F, fontSize:W*0.18, color:theme.accent, letterSpacing:3, zIndex:1, textShadow:`0 2px 16px ${theme.accent}90` }}>{initials}</div>
        </div>
        <div style={{ textAlign:'center', marginBottom:W*0.018 }}>
          <div style={{ fontFamily:F, fontSize:W*0.135, letterSpacing:3, color:theme.light, textTransform:'uppercase', lineHeight:1, textShadow:'0 1px 8px rgba(0,0,0,0.6)' }}>
            {nombre?.split(' ')[0] || 'ANALYST'}
          </div>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:W*0.036, fontWeight:700, color:theme.accent, letterSpacing:2, textTransform:'uppercase', marginTop:3, opacity:.7 }}>
            {TIERS[tier]||'SOC ROOKIE'}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:W*0.022 }}>
          <div style={{ flex:1, height:1, background:theme.accent, opacity:.18 }}/>
          <div style={{ width:5, height:5, background:theme.accent, opacity:.5, transform:'rotate(45deg)', flexShrink:0 }}/>
          <div style={{ flex:1, height:1, background:theme.accent, opacity:.18 }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1px 1fr', gap:0, marginBottom:W*0.012 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:W*0.013 }}>
            {skillVals.slice(0,4).map(s=>(
              <div key={s.key} style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:W*0.036, fontWeight:800, letterSpacing:1.5, color:theme.light, opacity:.6 }}>{s.abbr}</span>
                <span style={{ fontFamily:F, fontSize:W*0.092, color:theme.accent, letterSpacing:1, lineHeight:1 }}>{s.val}</span>
              </div>
            ))}
          </div>
          <div style={{ background:theme.accent, opacity:.14, margin:`0 ${W*0.042}px` }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:W*0.013 }}>
            {skillVals.slice(4).map(s=>(
              <div key={s.key} style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:W*0.036, fontWeight:800, letterSpacing:1.5, color:theme.light, opacity:.6 }}>{s.abbr}</span>
                <span style={{ fontFamily:F, fontSize:W*0.092, color:theme.accent, letterSpacing:1, lineHeight:1 }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ flex:1, height:1, background:theme.accent, opacity:.12 }}/>
          <span style={{ fontFamily:F, fontSize:W*0.036, letterSpacing:2, color:theme.accent, opacity:.4 }}>{copas.toLocaleString()} COPAS</span>
          <div style={{ flex:1, height:1, background:theme.accent, opacity:.12 }}/>
        </div>
      </div>
    </div>
  );
}

/* ── PARTICLES ── */
const ParticleCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const pts = Array.from({length:40},()=>({ x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3, r:Math.random()*1.6+.6, o:Math.random()*.1+.03 }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      pts.forEach(n=>{ n.x+=n.vx; n.y+=n.vy; if(n.x<0||n.x>w)n.vx*=-1; if(n.y<0||n.y>h)n.vy*=-1; ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=`rgba(79,70,229,${n.o})`; ctx.fill(); });
      raf=requestAnimationFrame(draw);
    };
    draw();
    const resize=()=>{ w=c.width=window.innerWidth; h=c.height=window.innerHeight; };
    window.addEventListener('resize',resize);
    return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  },[]);
  return <canvas ref={ref} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>;
};

const ActivityHeatmap = ({ historial }) => {
  const days=90, today=new Date();
  const cells=Array.from({length:days},(_,i)=>{ const d=new Date(today); d.setDate(today.getDate()-(days-1-i)); const ds=d.toISOString().split('T')[0]; return { date:d, count:historial.filter(s=>new Date(s.inicio*1000).toISOString().split('T')[0]===ds).length }; });
  const weeks=[]; for(let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7));
  const gc=c=>c===0?'rgba(79,70,229,0.07)':c===1?'rgba(79,70,229,0.3)':c===2?'rgba(79,70,229,0.55)':'rgba(79,70,229,0.85)';
  return (
    <div style={{display:'flex',gap:'3px'}}>
      {weeks.map((wk,wi)=>(
        <div key={wi} style={{display:'flex',flexDirection:'column',gap:'3px'}}>
          {wk.map((d,di)=>(
            <div key={di} title={`${d.date.toLocaleDateString('es-ES')} · ${d.count}`}
              style={{width:'10px',height:'10px',borderRadius:'2px',backgroundColor:gc(d.count),cursor:'default'}}
              onMouseEnter={e=>e.target.style.transform='scale(1.4)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
          ))}
        </div>
      ))}
    </div>
  );
};

const calcStreak = hist => {
  if (!hist.length) return 0;
  const dates=[...new Set(hist.map(s=>new Date(s.inicio*1000).toISOString().split('T')[0]))].sort().reverse();
  let streak=0, cur=new Date();
  for(const d of dates){ const diff=Math.floor((cur-new Date(d))/86400000); if(diff<=1){streak++;cur=new Date(d);}else break; }
  return streak;
};

const IC = {
  cup:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  flask:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>,
  bolt:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  shield: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  target: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  trend:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  book:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  award:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  user:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  users:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chart:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  planet: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="7"/><path d="M3 12c0 0 5-8 18 0"/><path d="M3 12c0 0 5 8 18 0"/></svg>,
  fire:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  clock:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};
const Icon = ({name,size=15,color='currentColor'}) => (
  <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',color,width:size,height:size,flexShrink:0}}>
    {React.cloneElement(IC[name]||IC.target,{width:size,height:size})}
  </span>
);

function ComingSoon({ title, desc, icon, color='#4f46e5' }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'64px 32px',textAlign:'center',background:'#fafafa',borderRadius:16,border:'2px dashed #e2e8f0',minHeight:280 }}>
      <div style={{ width:64,height:64,borderRadius:20,background:`${color}10`,border:`1px solid ${color}25`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}>
        <Icon name={icon} size={28} color={color}/>
      </div>
      <div style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'4px 14px',borderRadius:100,background:`${color}10`,border:`1px solid ${color}25`,marginBottom:16 }}>
        <Icon name="clock" size={11} color={color}/>
        <span style={{ fontSize:11,fontWeight:700,color:color,letterSpacing:'1px' }}>PRÓXIMAMENTE</span>
      </div>
      <h3 style={{ fontSize:18,fontWeight:800,color:'#0f172a',marginBottom:8 }}>{title}</h3>
      <p style={{ fontSize:13,color:'#64748b',lineHeight:1.7,maxWidth:360 }}>{desc}</p>
    </div>
  );
}

export default function DashboardAnalista() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData,    setUserData]    = useState(null);
  const [historial,   setHistorial]   = useState([]);
  const [empleoTab,   setEmpleoTab]   = useState('ofertas');
  const [ranking,     setRanking]     = useState([]);
  const [carruselIdx, setCarruselIdx] = useState(0);

  useEffect(() => { fetchUser(); }, []);

  const fetchUser = async () => {
    try {
      const r = await axios.get(`${API}/api/me`, { headers:{ Authorization:`Bearer ${token}` } });
      setUserData(r.data);
      try { const h = await axios.get(`${API}/api/sesiones/historial`, { headers:{ Authorization:`Bearer ${token}` } }); setHistorial(h.data||[]); } catch {}
      try { const rk = await axios.get(`${API}/api/ranking`, { headers:{ Authorization:`Bearer ${token}` } }); setRanking((rk.data?.jugadores||[]).slice(0,3)); } catch {}
    } catch { logout(); navigate('/login'); }
  };

  const copas     = userData?.copas || 0;
  const xp        = userData?.xp || 0;
  const tier      = userData?.tier || 1;
  const sesiones  = userData?.sesiones_completadas || 0;
  const skills    = userData?.skills || {};
  const arena     = userData?.arena || 'Bronce 3';
  const arenaObj  = getArenaFromCopas(copas);
  const group     = getArenaGroup(arena);
  const theme     = ARENA_THEMES[group];
  const XP_MAX    = [0,500,1500,3000,5000,8000,12000,18000,99999];
  const xpMin     = XP_MAX[tier-1]||0;
  const xpMax     = XP_MAX[tier]||99999;
  const pctXP     = Math.min(((xp-xpMin)/(xpMax-xpMin))*100,100);
  const tierColor = TIER_CLR[tier]||'#64748b';
  const streak    = calcStreak(historial);
  const ovr       = calcOVR(skills);
  const skillVals = SKILL_ABBR.map(s=>({...s,val:Math.max(50,Math.round((skills?.[s.key]||0)*10))}));
  const weakSkills= [...skillVals].sort((a,b)=>a.val-b.val).slice(0,3);
  const siguienteArena = ARENAS_CONFIG[ARENAS_CONFIG.findIndex(a=>a.id===arenaObj.id)+1];

  const css = `
    ${BEBAS_FONT}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes cardFloat{0%,100%{transform:translateY(0) rotate(-1deg);}50%{transform:translateY(-10px) rotate(1deg);}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp .4s ease forwards;}
    .card-float{animation:cardFloat 6s ease-in-out infinite;}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    .play-btn:hover{filter:brightness(1.1);transform:translateY(-2px)!important;}
    .quick-btn:hover{background:#f0f4ff!important;border-color:#c7d2fe!important;}
    .hist-row:hover{background:#f8fafc!important;}
    .empleo-tab:hover{background:rgba(79,70,229,0.06)!important;}
    .skill-bar-fill{transition:width 1.2s cubic-bezier(.4,0,.2,1);}
    *{transition:transform .2s ease,box-shadow .2s ease,border-color .15s,background .15s,filter .15s;}
  `;

  if (!userData) return (
    <div style={{minHeight:'100vh',background:'#f0f4ff',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:40,height:40,border:'3px solid #e2e8f0',borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{position:'fixed',inset:0,background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',zIndex:-1}}/>
      <ParticleCanvas/>
      <div style={{position:'relative',zIndex:1,minHeight:'100vh',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0f172a'}}>

        {/* NAVBAR */}
        <nav style={{position:'sticky',top:0,zIndex:50,height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',backgroundColor:'rgba(255,255,255,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 12px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:'28px'}}/>
            <span style={{fontSize:'15px',fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',gap:'2px',alignItems:'center'}}>
            {[{label:'Training',icon:'book',path:'/training'},{label:'Ranking',icon:'chart',path:'/ranking'},{label:'Certificado',icon:'award',path:'/certificado'},{label:'Perfil',icon:'user',path:'/perfil'},{label:'Empleo',icon:'users',path:'#empleo'}].map((item,i)=>(
              <button key={i} className="nav-btn"
                onClick={()=>item.path==='#empleo'?document.getElementById('empleo-section')?.scrollIntoView({behavior:'smooth'}):navigate(item.path)}
                style={{padding:'5px 12px',borderRadius:'7px',background:'none',border:'none',color:'#64748b',fontSize:'13px',fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                <Icon name={item.icon} size={13} color="#64748b"/> {item.label}
              </button>
            ))}
            <button className="nav-btn" onClick={()=>navigate('/sesion')} style={{padding:'5px 12px',borderRadius:'7px',background:'rgba(37,99,235,0.07)',border:'1px solid rgba(37,99,235,0.18)',color:'#2563eb',fontSize:'13px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
              <Icon name="cup" size={13} color="#2563eb"/> Sesiones
            </button>
            <button className="nav-btn" onClick={()=>navigate('/lab')} style={{padding:'5px 12px',borderRadius:'7px',background:'rgba(5,150,105,0.07)',border:'1px solid rgba(5,150,105,0.18)',color:'#059669',fontSize:'13px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
              <Icon name="flask" size={13} color="#059669"/> Labs
            </button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#22c55e',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:'13px',color:'#374151',fontWeight:500}}>{user?.nombre}</span>
              <span style={{fontSize:'11px',fontWeight:700,color:theme.main,background:theme.light,padding:'2px 8px',borderRadius:'5px'}}>{arenaObj.name}</span>
            </div>
            {streak>0&&(
              <div style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'8px',background:'linear-gradient(135deg,#fef3c7,#fffbeb)',border:'1px solid #fcd34d'}}>
                <Icon name="fire" size={13} color="#92400e"/>
                <span style={{fontSize:'12px',fontWeight:700,color:'#92400e'}}>{streak}</span>
              </div>
            )}
            <button onClick={()=>{logout();navigate('/');}} style={{background:'none',border:'1px solid #e2e8f0',color:'#94a3b8',padding:'5px 12px',borderRadius:'7px',fontSize:'12px',cursor:'pointer'}}>Salir</button>
          </div>
        </nav>

        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'32px 40px 72px'}}>

          {/* ── HERO ── */}
          <div className="fade-up" style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:44,alignItems:'center',marginBottom:32,padding:'36px 40px',borderRadius:24,background:'linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.75))',border:'1px solid rgba(255,255,255,0.85)',boxShadow:'0 8px 40px rgba(0,0,0,0.07)',backdropFilter:'blur(20px)'}}>
            <div className="card-float" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
              <FifaCard nombre={user?.nombre} tier={tier} skills={skills} copas={copas} arena={arena} size="lg" onClick={()=>navigate('/analyst-card')}/>
              <span style={{fontSize:11,color:'#94a3b8',cursor:'pointer'}} onClick={()=>navigate('/analyst-card')}>ver detalle completo →</span>
            </div>
            <div>
              <h1 style={{fontSize:30,fontWeight:900,color:'#0f172a',letterSpacing:'-1px',marginBottom:4}}>
                Hola, <span style={{color:ACC}}>{user?.nombre}</span>
              </h1>
              <p style={{fontSize:13,color:'#94a3b8',fontFamily:'monospace',marginBottom:22}}>
                {arenaObj.name} · {TIERS[tier]} · {sesiones} sesiones completadas
              </p>
              <div style={{display:'flex',gap:12,marginBottom:20}}>
                {[
                  {val:ovr, label:'OVR', color:theme.main, bg:`${theme.main}10`, border:`${theme.main}25`},
                  {val:copas.toLocaleString(), label:'COPAS', color:'#f59e0b', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.2)'},
                  {val:sesiones, label:'SESIONES', color:ACC, bg:`${ACC}08`, border:`${ACC}18`},
                ].map((s,i)=>(
                  <div key={i} style={{padding:'14px 20px',borderRadius:14,background:s.bg,border:`1px solid ${s.border}`,textAlign:'center',minWidth:85}}>
                    <div style={{fontFamily:"'Bebas Neue','Impact','Arial Narrow',sans-serif",fontSize:42,lineHeight:1,color:s.color,letterSpacing:-1}}>{s.val}</div>
                    <div style={{fontSize:9,fontWeight:800,color:'#94a3b8',letterSpacing:2,textTransform:'uppercase',marginTop:2}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#94a3b8',marginBottom:5}}>
                  <span style={{fontWeight:700,color:tierColor}}>{TIERS[tier]}</span>
                  {tier<8&&<span>→ {TIERS[tier+1]}</span>}
                  <span style={{fontFamily:'monospace'}}>{xp.toLocaleString()} XP</span>
                </div>
                <div style={{height:8,borderRadius:4,backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                  <div className="skill-bar-fill" style={{width:`${pctXP}%`,height:'100%',borderRadius:4,background:`linear-gradient(90deg,${tierColor}80,${tierColor})`}}/>
                </div>
              </div>
              {siguienteArena&&(
                <div style={{marginBottom:18,padding:'10px 14px',borderRadius:10,background:`${theme.main}08`,border:`1px solid ${theme.main}18`,display:'flex',alignItems:'center',gap:10}}>
                  <Icon name="target" size={14} color={theme.main}/>
                  <span style={{fontSize:12,color:'#374151'}}><strong style={{color:theme.main}}>{(siguienteArena.min-copas).toLocaleString()} copas</strong> para {siguienteArena.name}</span>
                  <div style={{flex:1,height:4,borderRadius:2,background:'rgba(0,0,0,0.06)',overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:2,width:`${Math.min(((copas-arenaObj.min)/300)*100,100)}%`,background:theme.main}}/>
                  </div>
                </div>
              )}
              <div style={{display:'flex',gap:10}}>
                <button className="play-btn" onClick={()=>navigate('/sesion')}
                  style={{flex:1,padding:'14px',borderRadius:12,background:'linear-gradient(135deg,#1d4ed8,#3b82f6)',border:'none',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 4px 20px rgba(37,99,235,0.4)'}}>
                  <Icon name="bolt" size={15} color="#fff"/> Jugar sesión
                </button>
                <button className="play-btn" onClick={()=>navigate('/lab')}
                  style={{flex:1,padding:'14px',borderRadius:12,background:'linear-gradient(135deg,#047857,#10b981)',border:'none',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 4px 20px rgba(5,150,105,0.4)'}}>
                  <Icon name="flask" size={15} color="#fff"/> Entrar al lab
                </button>
              </div>
            </div>
          </div>

          {/* ── CARRUSEL ── */}
          <div style={{marginBottom:28}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:'2px'}}>MODOS DE JUEGO</p>
                <p style={{fontSize:'12px',color:'#64748b'}}>Sesiones competitivas o laboratorio de investigación</p>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>setCarruselIdx(0)} style={{padding:'6px 14px',borderRadius:'8px',border:`1px solid ${carruselIdx===0?'#2563eb':'#e2e8f0'}`,backgroundColor:carruselIdx===0?'#2563eb':'#fff',color:carruselIdx===0?'#fff':'#64748b',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                  <Icon name="cup" size={12} color={carruselIdx===0?'#fff':'#64748b'}/> Sesiones
                </button>
                <button onClick={()=>setCarruselIdx(1)} style={{padding:'6px 14px',borderRadius:'8px',border:`1px solid ${carruselIdx===1?'#059669':'#e2e8f0'}`,backgroundColor:carruselIdx===1?'#059669':'#fff',color:carruselIdx===1?'#fff':'#64748b',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                  <Icon name="flask" size={12} color={carruselIdx===1?'#fff':'#64748b'}/> Labs
                </button>
              </div>
            </div>
            <div style={{overflow:'hidden',borderRadius:'20px'}}>
              <div style={{display:'flex',transition:'transform .45s cubic-bezier(.4,0,.2,1)',transform:`translateX(-${carruselIdx*100}%)`}}>
                <div style={{minWidth:'100%',borderRadius:'20px',overflow:'hidden',border:'1px solid rgba(37,99,235,0.25)',boxShadow:'0 8px 32px rgba(37,99,235,0.12)'}}>
                  <div style={{padding:'36px 44px',background:'linear-gradient(135deg,#1e1b4b 0%,#1e3a8a 50%,#1d4ed8 100%)',position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',top:'-80px',right:'-60px',width:'320px',height:'320px',borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.2),transparent)',pointerEvents:'none'}}/>
                    <div style={{position:'relative',zIndex:1,maxWidth:520}}>
                      <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'5px 13px',borderRadius:'100px',border:'1px solid rgba(147,197,253,0.3)',backgroundColor:'rgba(37,99,235,0.25)',marginBottom:'16px'}}>
                        <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#93c5fd',animation:'pulse 2s infinite'}}/>
                        <span style={{fontSize:'10px',color:'#93c5fd',fontWeight:700,letterSpacing:'2px'}}>SESIONES COMPETITIVAS</span>
                      </div>
                      <h2 style={{fontSize:'26px',fontWeight:900,color:'#fff',letterSpacing:'-0.8px',marginBottom:'10px',lineHeight:1.1}}>Demuestra tu nivel.<br/><span style={{color:'#93c5fd'}}>Gana copas. Mejora tu carta.</span></h2>
                      <p style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',lineHeight:1.75,marginBottom:'20px'}}>La IA genera escenarios únicos y evalúa cada decisión. Tu OVR sube con cada buena sesión.</p>
                      <button className="play-btn" onClick={()=>navigate('/sesion')}
                        style={{padding:'13px 32px',borderRadius:'100px',background:'linear-gradient(135deg,#2563eb,#3b82f6)',border:'none',color:'#fff',fontSize:'14px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(37,99,235,0.5)',display:'inline-flex',alignItems:'center',gap:'8px'}}>
                        <Icon name="bolt" size={15} color="#fff"/> Jugar ahora →
                      </button>
                    </div>
                  </div>
                  <div style={{backgroundColor:'rgba(248,250,252,0.95)',padding:'12px',display:'flex',justifyContent:'center',gap:'8px',borderTop:'1px solid #e8eaf0'}}>
                    {[0,1].map(i=><div key={i} onClick={()=>setCarruselIdx(i)} style={{width:carruselIdx===i?'24px':'8px',height:'8px',borderRadius:'4px',backgroundColor:carruselIdx===i?'#2563eb':'#cbd5e1',cursor:'pointer',transition:'all .35s'}}/>)}
                  </div>
                </div>
                <div style={{minWidth:'100%',borderRadius:'20px',overflow:'hidden',border:'1px solid rgba(52,211,153,0.3)',boxShadow:'0 8px 32px rgba(16,185,129,0.12)'}}>
                  <div style={{padding:'36px 44px',background:'linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)',position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',top:'-80px',right:'-60px',width:'320px',height:'320px',borderRadius:'50%',background:'radial-gradient(circle,rgba(52,211,153,0.18),transparent)',pointerEvents:'none'}}/>
                    <div style={{position:'relative',zIndex:1,maxWidth:520}}>
                      <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'5px 13px',borderRadius:'100px',border:'1px solid rgba(110,231,183,0.25)',backgroundColor:'rgba(16,185,129,0.2)',marginBottom:'16px'}}>
                        <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#6ee7b7',animation:'pulse 2s infinite'}}/>
                        <span style={{fontSize:'10px',color:'#6ee7b7',fontWeight:700,letterSpacing:'2px'}}>LABORATORIO SOC — BETA</span>
                      </div>
                      <h2 style={{fontSize:'26px',fontWeight:900,color:'#fff',letterSpacing:'-0.8px',marginBottom:'10px',lineHeight:1.1}}>Investiga sin límite.<br/><span style={{color:'#6ee7b7'}}>Profundidad real. Mejora tu carta.</span></h2>
                      <p style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',lineHeight:1.75,marginBottom:'20px'}}>SIEM, Log Explorer, Network Map y evaluación IA. Cada lab sube skills específicas de tu carta.</p>
                      <button className="play-btn" onClick={()=>navigate('/lab')}
                        style={{padding:'13px 32px',borderRadius:'100px',background:'linear-gradient(135deg,#10b981,#059669)',border:'none',color:'#fff',fontSize:'14px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(16,185,129,0.5)',display:'inline-flex',alignItems:'center',gap:'8px'}}>
                        <Icon name="flask" size={15} color="#fff"/> Entrar al Lab →
                      </button>
                    </div>
                  </div>
                  <div style={{backgroundColor:'rgba(248,250,252,0.95)',padding:'12px',display:'flex',justifyContent:'center',gap:'8px',borderTop:'1px solid #e8eaf0'}}>
                    {[0,1].map(i=><div key={i} onClick={()=>setCarruselIdx(i)} style={{width:carruselIdx===i?'24px':'8px',height:'8px',borderRadius:'4px',backgroundColor:carruselIdx===i?'#10b981':'#cbd5e1',cursor:'pointer',transition:'all .35s'}}/>)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── ACTIVIDAD + RANKING ── */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div style={{padding:'20px 22px',borderRadius:16,backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>ACTIVIDAD — 90 DÍAS</p>
                <div style={{display:'flex',gap:'4px',alignItems:'center'}}>
                  {[0.07,0.3,0.55,0.85].map((o,i)=><div key={i} style={{width:'8px',height:'8px',borderRadius:'2px',backgroundColor:`rgba(79,70,229,${o})`}}/>)}
                </div>
              </div>
              <div style={{overflowX:'auto',marginBottom:14}}><ActivityHeatmap historial={historial}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {[{value:sesiones,label:'sesiones',color:ACC},{value:streak,label:'racha',color:'#f59e0b'},{value:historial.filter(s=>s.resultado?.copas_ganadas>0).length,label:'victorias',color:'#059669'}].map((s,i)=>(
                  <div key={i} style={{textAlign:'center',padding:'10px',borderRadius:10,backgroundColor:'#f8fafc',border:'1px solid #f1f5f9'}}>
                    <div style={{fontSize:'20px',fontWeight:900,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:'10px',color:'#94a3b8',marginTop:2}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{padding:'18px 20px',borderRadius:16,backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)',flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>TOP RANKING</p>
                  <button onClick={()=>navigate('/ranking')} style={{fontSize:'10px',color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Ver todo →</button>
                </div>
                {ranking.length===0?<p style={{fontSize:'12px',color:'#94a3b8',textAlign:'center',padding:'10px 0'}}>Cargando...</p>:ranking.map((j,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<ranking.length-1?'1px solid #f1f5f9':'none'}}>
                    <div style={{width:24,height:24,borderRadius:6,backgroundColor:i===0?'#fef3c7':i===1?'#f1f5f9':'#fdf4ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>
                      {i===0?'🥇':i===1?'🥈':'🥉'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.nombre}</div>
                      <div style={{fontSize:10,color:'#94a3b8',fontFamily:'monospace'}}>{j.arena}</div>
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:'#d97706',fontFamily:'monospace',display:'flex',alignItems:'center',gap:3}}>
                      {j.copas?.toLocaleString()} <Icon name="cup" size={10} color="#d97706"/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{padding:'16px 18px',borderRadius:16,background:'linear-gradient(135deg,#fef2f2,#fff1f2)',border:'1px solid #fecaca'}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                  <Icon name="target" size={14} color="#ef4444"/>
                  <span style={{fontSize:'10px',color:'#ef4444',fontWeight:700,letterSpacing:'1.5px',fontFamily:'monospace'}}>SKILL A MEJORAR EN TU CARTA</span>
                </div>
                <p style={{fontSize:13,color:'#7f1d1d',fontWeight:700,marginBottom:4}}>{weakSkills[0]?.label}</p>
                <p style={{fontSize:11,color:'#991b1b',lineHeight:1.5,marginBottom:10}}>Actualmente {weakSkills[0]?.val}/100 en tu carta</p>
                <button onClick={()=>navigate('/sesion')} style={{width:'100%',padding:'9px',borderRadius:9,background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <Icon name="bolt" size={12} color="#fff"/> Entrenar ahora →
                </button>
              </div>
            </div>
          </div>

          {/* ── HISTORIAL + ACCESOS ── */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:28}}>
            <div style={{padding:'20px 22px',borderRadius:16,backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>ÚLTIMAS SESIONES</p>
                <button onClick={()=>navigate('/sesion')} style={{fontSize:'10px',color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Nueva →</button>
              </div>
              {historial.length===0?(
                <div style={{textAlign:'center',padding:'20px 0'}}>
                  <Icon name="target" size={28} color="#cbd5e1"/>
                  <p style={{fontSize:12,color:'#94a3b8',marginTop:8}}>Sin sesiones aún</p>
                  <button onClick={()=>navigate('/sesion')} style={{marginTop:10,padding:'8px 16px',borderRadius:8,backgroundColor:ACC,border:'none',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>Empezar</button>
                </div>
              ):historial.slice(0,5).map((s,i)=>{
                const res=s.resultado,copasGan=res?.copas_ganadas||0,media=res?.media_puntuacion||0,pos=copasGan>=0;
                return (
                  <div key={i} className="hist-row" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 11px',borderRadius:10,backgroundColor:'#f8fafc',border:'1px solid #f1f5f9',marginBottom:6}}>
                    <div style={{width:30,height:30,borderRadius:8,backgroundColor:pos?'#ecfdf5':'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Icon name="trend" size={14} color={pos?'#059669':'#ef4444'}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:11,color:'#0f172a',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.titulo||'Sesión SOC'}</p>
                      <p style={{fontSize:10,color:'#94a3b8',fontFamily:'monospace'}}>{media}/20 pts</p>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:pos?'#059669':'#ef4444',fontFamily:'monospace',flexShrink:0}}>{pos?'+':''}{copasGan}</span>
                  </div>
                );
              })}
            </div>
            <div style={{padding:'20px 22px',borderRadius:16,backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)'}}>
              <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:16,fontFamily:'monospace'}}>ACCESOS RÁPIDOS</p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[
                  {label:'Mi Analyst Card', desc:'OVR · Skills · Carta FIFA',  path:'/analyst-card', color:theme.main, light:theme.light, icon:'award'},
                  {label:'Laboratorio SOC', desc:'SIEM · Forense · XP',        path:'/lab',          color:'#059669', light:'#ecfdf5',   icon:'flask'},
                  {label:'Training SOC',   desc:'Módulos · Cursos',            path:'/training',     color:'#7c3aed', light:'#f5f3ff',   icon:'book'},
                  {label:'Ranking Global', desc:'Tu posición actual',          path:'/ranking',      color:'#d97706', light:'#fffbeb',   icon:'chart'},
                  {label:'Mi Certificado', desc:'QR verificable',              path:'/certificado',  color:'#059669', light:'#ecfdf5',   icon:'award'},
                  {label:'Perfil & Tiers', desc:'Stats y progresión',          path:'/perfil',       color:'#2563eb', light:'#eff6ff',   icon:'user'},
                ].map((item,i)=>(
                  <div key={i} className="quick-btn" onClick={()=>navigate(item.path)}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'10px 13px',borderRadius:11,backgroundColor:'#f8fafc',border:'1px solid #e8eaf0',cursor:'pointer'}}>
                    <div style={{width:32,height:32,borderRadius:9,backgroundColor:item.light,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${item.color}15`}}>
                      <Icon name={item.icon} size={15} color={item.color}/>
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontSize:12,color:'#0f172a',fontWeight:600}}>{item.label}</span>
                      <span style={{fontSize:10,color:'#94a3b8',marginLeft:6}}>{item.desc}</span>
                    </div>
                    <Icon name="trend" size={9} color="#cbd5e1"/>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── EMPLEO ── */}
          <div id="empleo-section">
            <div style={{position:'relative',borderRadius:'20px',overflow:'hidden',marginBottom:'20px',padding:'36px 48px',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)'}}>
              <div style={{position:'absolute',top:'-60px',right:'-60px',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(79,70,229,0.2),transparent)',pointerEvents:'none'}}/>
              <div style={{position:'relative',zIndex:1,display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:'32px'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                    <span style={{fontSize:'10px',color:'#818cf8',letterSpacing:'3px',fontWeight:700,fontFamily:'monospace'}}>SOCBLAST CAREERS</span>
                    <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,rgba(129,140,248,0.4),transparent)'}}/>
                  </div>
                  <h2 style={{fontSize:'28px',fontWeight:900,color:'#fff',letterSpacing:'-1px',marginBottom:'10px',lineHeight:1.1}}>Tu próximo paso<br/><span style={{color:'#818cf8'}}>en ciberseguridad.</span></h2>
                  <p style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',lineHeight:1.7}}>Tu Analyst Card es tu CV. Las empresas verán tu OVR, skills y arena directamente.</p>
                </div>
                <div style={{padding:'14px 20px',borderRadius:'12px',background:'rgba(79,70,229,0.15)',border:'1px solid rgba(99,102,241,0.25)',textAlign:'center',flexShrink:0}}>
                  <div style={{fontSize:'13px',fontWeight:700,color:'#a5b4fc',marginBottom:4}}>🚀 En desarrollo</div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>Muy pronto</div>
                </div>
              </div>
              <div style={{position:'relative',zIndex:1,display:'flex',gap:'6px',marginTop:'24px'}}>
                {[{id:'ofertas',label:'Ofertas'},{id:'certs',label:'Certificaciones'},{id:'bootcamps',label:'Bootcamps'},{id:'retos',label:'Retos gratuitos'}].map(tab=>(
                  <button key={tab.id} onClick={()=>setEmpleoTab(tab.id)}
                    style={{padding:'8px 18px',borderRadius:'9px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,background:empleoTab===tab.id?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.06)',color:empleoTab===tab.id?'#c7d2fe':'rgba(255,255,255,0.45)',borderBottom:empleoTab===tab.id?'2px solid #818cf8':'2px solid transparent'}}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {empleoTab==='ofertas'&&<ComingSoon title="Ofertas de empleo SOC" desc="Empresas buscarán analistas por su Analyst Card. Tu OVR y skills hablarán por ti." icon="users" color="#4f46e5"/>}
            {empleoTab==='certs'&&<ComingSoon title="Certificaciones recomendadas" desc="Recomendaciones según tu Analyst Card actual." icon="award" color="#7c3aed"/>}
            {empleoTab==='bootcamps'&&<ComingSoon title="Bootcamps y cursos SOC" desc="Selección curada ordenada por relevancia para tu perfil." icon="book" color="#0891b2"/>}
            {empleoTab==='retos'&&<ComingSoon title="Retos y plataformas externas" desc="TryHackMe, Blue Team Labs, CyberDefenders integrados con tu perfil." icon="shield" color="#059669"/>}
          </div>

        </div>
      </div>
    </>
  );
}