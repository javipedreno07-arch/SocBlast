import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GuestModal from '../components/GuestModal';

const API = 'https://socblast-production.up.railway.app';

const ARENAS = [
  { id:'bronce3', name:'Bronce III', tier:'bronce', div:3, min:0,    max:299,  color:'#92400e', colorLight:'#fef3c7', gradFrom:'#d97706', gradTo:'#92400e', colorRgb:'180,83,9'   },
  { id:'bronce2', name:'Bronce II',  tier:'bronce', div:2, min:300,  max:599,  color:'#92400e', colorLight:'#fef3c7', gradFrom:'#f59e0b', gradTo:'#b45309', colorRgb:'180,83,9'   },
  { id:'bronce1', name:'Bronce I',   tier:'bronce', div:1, min:600,  max:899,  color:'#92400e', colorLight:'#fef3c7', gradFrom:'#fbbf24', gradTo:'#d97706', colorRgb:'180,83,9'   },
  { id:'plata3',  name:'Plata III',  tier:'plata',  div:3, min:900,  max:1199, color:'#475569', colorLight:'#f1f5f9', gradFrom:'#64748b', gradTo:'#334155', colorRgb:'71,85,105'  },
  { id:'plata2',  name:'Plata II',   tier:'plata',  div:2, min:1200, max:1499, color:'#475569', colorLight:'#f1f5f9', gradFrom:'#94a3b8', gradTo:'#475569', colorRgb:'71,85,105'  },
  { id:'plata1',  name:'Plata I',    tier:'plata',  div:1, min:1500, max:1799, color:'#334155', colorLight:'#f1f5f9', gradFrom:'#cbd5e1', gradTo:'#64748b', colorRgb:'71,85,105'  },
  { id:'oro3',    name:'Oro III',    tier:'oro',    div:3, min:1800, max:2099, color:'#92400e', colorLight:'#fffbeb', gradFrom:'#d97706', gradTo:'#92400e', colorRgb:'146,64,14'  },
  { id:'oro2',    name:'Oro II',     tier:'oro',    div:2, min:2100, max:2399, color:'#78350f', colorLight:'#fffbeb', gradFrom:'#f59e0b', gradTo:'#b45309', colorRgb:'146,64,14'  },
  { id:'oro1',    name:'Oro I',      tier:'oro',    div:1, min:2400, max:2699, color:'#78350f', colorLight:'#fffbeb', gradFrom:'#fbbf24', gradTo:'#d97706', colorRgb:'146,64,14'  },
  { id:'diamante3',name:'Diamante III',tier:'diamante',div:3,min:2700,max:2999,color:'#1e40af', colorLight:'#eff6ff', gradFrom:'#3b82f6', gradTo:'#1e40af', colorRgb:'59,130,246' },
  { id:'diamante2',name:'Diamante II', tier:'diamante',div:2,min:3000,max:3299,color:'#1d4ed8', colorLight:'#eff6ff', gradFrom:'#60a5fa', gradTo:'#2563eb', colorRgb:'59,130,246' },
  { id:'diamante1',name:'Diamante I',  tier:'diamante',div:1,min:3300,max:99999,color:'#1e3a8a',colorLight:'#eff6ff', gradFrom:'#93c5fd', gradTo:'#3b82f6', colorRgb:'59,130,246' },
];

const getArenaFromCopas = (copas) => ARENAS.find(a => copas >= a.min && copas <= a.max) || ARENAS[0];

const Planet = ({ tier, size = 110 }) => {
  const p = {
    bronce: (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="pb1" cx="35%" cy="30%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="40%" stopColor="#D97706"/><stop offset="100%" stopColor="#5C2E00"/></radialGradient><radialGradient id="pb2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.45)"/></radialGradient></defs><circle cx="60" cy="60" r="52" fill="url(#pb1)"/><ellipse cx="42" cy="38" rx="20" ry="7" fill="rgba(180,90,20,0.35)" transform="rotate(-25,42,38)"/><ellipse cx="72" cy="68" rx="24" ry="6" fill="rgba(90,40,5,0.3)" transform="rotate(12,72,68)"/><circle cx="60" cy="60" r="52" fill="url(#pb2)"/></svg>),
    plata:  (<svg width={size} height={size} viewBox="0 0 150 120"><defs><radialGradient id="pp1" cx="35%" cy="30%"><stop offset="0%" stopColor="#F1F5F9"/><stop offset="45%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#1E293B"/></radialGradient><radialGradient id="pp2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.4)"/></radialGradient><linearGradient id="pr1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="50%" stopColor="rgba(148,163,184,0.6)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient></defs><ellipse cx="75" cy="72" rx="70" ry="6" fill="url(#pr1)" opacity="0.7"/><circle cx="75" cy="60" r="48" fill="url(#pp1)"/><circle cx="75" cy="60" r="48" fill="url(#pp2)"/></svg>),
    oro:    (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="po1" cx="35%" cy="30%"><stop offset="0%" stopColor="#FEF08A"/><stop offset="35%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#78350F"/></radialGradient><radialGradient id="po2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.38)"/></radialGradient></defs><circle cx="60" cy="60" r="54" fill="url(#po1)"/><ellipse cx="45" cy="42" rx="22" ry="9" fill="rgba(251,191,36,0.3)" transform="rotate(-15,45,42)"/><circle cx="60" cy="60" r="54" fill="url(#po2)"/></svg>),
    diamante:(<svg width={size} height={size} viewBox="0 0 130 120"><defs><radialGradient id="pd1" cx="35%" cy="30%"><stop offset="0%" stopColor="#DBEAFE"/><stop offset="30%" stopColor="#93C5FD"/><stop offset="60%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1E3A8A"/></radialGradient><radialGradient id="pd2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.4)"/></radialGradient><linearGradient id="pdr" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(147,197,253,0)"/><stop offset="50%" stopColor="rgba(147,197,253,0.55)"/><stop offset="100%" stopColor="rgba(147,197,253,0)"/></linearGradient></defs><ellipse cx="65" cy="74" rx="64" ry="7" fill="url(#pdr)" opacity="0.6"/><circle cx="65" cy="60" r="52" fill="url(#pd1)"/><circle cx="65" cy="60" r="52" fill="url(#pd2)"/></svg>),
  };
  return p[tier] || null;
};

const ParticleCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const pts = Array.from({length:45},()=>({ x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35, r:Math.random()*1.8+.8, o:Math.random()*.18+.04 }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      pts.forEach(n=>{ n.x+=n.vx; n.y+=n.vy; if(n.x<0||n.x>w)n.vx*=-1; if(n.y<0||n.y>h)n.vy*=-1; ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=`rgba(79,70,229,${n.o})`; ctx.fill(); });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{ const d=Math.hypot(a.x-b.x,a.y-b.y); if(d<150){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=`rgba(79,70,229,${(1-d/150)*.06})`; ctx.lineWidth=.4; ctx.stroke(); }}));
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
  const days = 90;
  const today = new Date();
  const cells = Array.from({length: days}, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = historial.filter(s => {
      const sDate = new Date(s.inicio * 1000).toISOString().split('T')[0];
      return sDate === dateStr;
    }).length;
    return { date: d, count };
  });
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i+7));
  const getColor = (count) => {
    if (count === 0) return 'rgba(79,70,229,0.07)';
    if (count === 1) return 'rgba(79,70,229,0.3)';
    if (count === 2) return 'rgba(79,70,229,0.55)';
    return 'rgba(79,70,229,0.85)';
  };
  return (
    <div style={{display:'flex',gap:'3px'}}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{display:'flex',flexDirection:'column',gap:'3px'}}>
          {week.map((day, di) => (
            <div key={di} title={`${day.date.toLocaleDateString('es-ES')} · ${day.count} sesiones`}
              style={{width:'10px',height:'10px',borderRadius:'2px',backgroundColor:getColor(day.count),cursor:'default',transition:'transform .15s'}}
              onMouseEnter={e=>e.target.style.transform='scale(1.4)'}
              onMouseLeave={e=>e.target.style.transform='scale(1)'}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const calcStreak = (historial) => {
  if (!historial.length) return 0;
  const dates = [...new Set(historial.map(s => new Date(s.inicio * 1000).toISOString().split('T')[0]))].sort().reverse();
  let streak = 0;
  let current = new Date();
  for (const d of dates) {
    const diff = Math.floor((current - new Date(d)) / 86400000);
    if (diff <= 1) { streak++; current = new Date(d); }
    else break;
  }
  return streak;
};

const TIERS    = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const TIER_CLR = ['','#64748b','#3b82f6','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444','#8b5cf6'];
const SKILLS = [
  {key:'analisis_logs',label:'Análisis de Logs'},{key:'deteccion_amenazas',label:'Detección Amenazas'},
  {key:'respuesta_incidentes',label:'Respuesta Incidentes'},{key:'threat_hunting',label:'Threat Hunting'},
  {key:'forense_digital',label:'Forense Digital'},{key:'gestion_vulnerabilidades',label:'Gestión Vulns'},
  {key:'inteligencia_amenazas',label:'Intel. Amenazas'},
];
const ACC = '#4f46e5';

const OFERTAS_MOCK = [
  { empresa:'CiberShield S.L.', rol:'Analista SOC L1', ubicacion:'Madrid · Híbrido', salario:'24K–30K', arena:'Bronce I+', badge:'nueva', color:'#059669' },
  { empresa:'TechDefend', rol:'SOC Analyst L2', ubicacion:'Remoto', salario:'32K–40K', arena:'Plata II+', badge:'', color:'#3b82f6' },
  { empresa:'Grupo Securitas', rol:'Threat Hunter', ubicacion:'Barcelona · Onsite', salario:'40K–52K', arena:'Oro I+', badge:'urgente', color:'#ef4444' },
];
const CERTS_MOCK = [
  { nombre:'CompTIA Security+', nivel:'Entrada', precio:'~380€', relevancia:95, url:'https://www.comptia.org/certifications/security', color:'#e11d48' },
  { nombre:'CEH — Certified Ethical Hacker', nivel:'Intermedio', precio:'~1.200€', relevancia:88, url:'https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/', color:'#7c3aed' },
  { nombre:'GCIH — GIAC Incident Handler', nivel:'Avanzado', precio:'~2.500€', relevancia:82, url:'https://www.giac.org/certifications/certified-incident-handler-gcih/', color:'#0891b2' },
  { nombre:'SC-200 Microsoft Sentinel', nivel:'Intermedio', precio:'~165€', relevancia:90, url:'https://learn.microsoft.com/certifications/exams/sc-200/', color:'#0078d4' },
];
const BOOTCAMPS_MOCK = [
  { nombre:'Hack4U — SOC completo', tipo:'Bootcamp', duracion:'6 meses', precio:'Desde 297€', stars:4.9 },
  { nombre:'OpenWebinars — Blue Team', tipo:'Curso', duracion:'40h', precio:'Suscripción', stars:4.7 },
  { nombre:'TCM Security Practical SOC', tipo:'Bootcamp EN', duracion:'30h', precio:'~29€', stars:4.8 },
];
const RETOS_MOCK = [
  { nombre:'TryHackMe — SOC Level 1', tipo:'Plataforma', gratis:true, url:'https://tryhackme.com/path/outline/soclevel1' },
  { nombre:'Blue Team Labs Online', tipo:'Retos', gratis:true, url:'https://blueteamlabs.online/' },
  { nombre:'CyberDefenders', tipo:'Challenges', gratis:true, url:'https://cyberdefenders.org/' },
  { nombre:'LetsDefend', tipo:'SOC Simulator', gratis:false, url:'https://letsdefend.io/' },
];

export default function DashboardAnalista() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [arenaIdx, setArenaIdx] = useState(0);
  const [termLines, setTermLines] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [empleoTab, setEmpleoTab] = useState('ofertas');
  const [ranking, setRanking] = useState([]);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestMsg, setGuestMsg] = useState('');
  const sliderRef = useRef(null);
  const startX = useRef(null);

  const TERM = [
    {text:'$ iniciando sesión SOC...',color:'#94a3b8',delay:0},
    {text:'⚠  ALERT   Brute force detected',color:'#ef4444',delay:400},
    {text:'   →  src: 185.220.101.45   rate: 94/min',color:'#64748b',delay:800},
    {text:'   →  target: CORP-DC01   port: 445/SMB',color:'#64748b',delay:1200},
    {text:'$ correlating SIEM events...',color:'#94a3b8',delay:1600},
    {text:'   →  T1078 Valid Accounts detected',color:'#f97316',delay:2000},
    {text:'$ awaiting analyst action...',color:ACC,delay:2400},
    {text:'▌',color:ACC,delay:2800},
  ];

  useEffect(() => { fetchUser(); }, []);
  useEffect(() => {
    setTermLines([]);
    TERM.forEach(l => setTimeout(() => setTermLines(p=>[...p.filter(x=>x.text!=='▌'),l]), l.delay));
  }, []);
  useEffect(() => {
    if (userData) {
      const idx = ARENAS.findIndex(a => userData.copas >= a.min && userData.copas <= a.max);
      setArenaIdx(idx >= 0 ? idx : 0);
    }
  }, [userData]);

  const fetchUser = async () => {
    try {
      const r = await axios.get(`${API}/api/me`, { headers:{ Authorization:`Bearer ${token}` } });
      setUserData(r.data);
      try {
        const h = await axios.get(`${API}/api/sesiones/historial`, { headers:{ Authorization:`Bearer ${token}` } });
        setHistorial(h.data || []);
      } catch {}
      try {
        const rk = await axios.get(`${API}/api/ranking`, { headers:{ Authorization:`Bearer ${token}` } });
        setRanking((rk.data?.jugadores || []).slice(0, 3));
      } catch {}
    } catch { logout(); navigate('/login'); }
  };

  const handleGuestAction = (msg) => {
    if (user?.isGuest) { setGuestMsg(msg); setShowGuestModal(true); return true; }
    return false;
  };

  const handleTouchStart = e => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd = e => {
    if (!startX.current) return;
    const d = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) {
      if (d > 0 && arenaIdx < ARENAS.length-1) setArenaIdx(i=>i+1);
      if (d < 0 && arenaIdx > 0) setArenaIdx(i=>i-1);
    }
    startX.current = null;
  };

  const copas = userData?.copas || 0;
  const xp = userData?.xp || 0;
  const tier = userData?.tier || 1;
  const sesiones = userData?.sesiones_completadas || 0;
  const skills = userData?.skills || {};
  const arena = ARENAS[arenaIdx];
  const arenaActual = getArenaFromCopas(copas);
  const XP_MAX = [0,500,1500,3000,5000,8000,12000,18000,99999];
  const xpMin = XP_MAX[tier-1]||0;
  const xpMax = XP_MAX[tier]||99999;
  const pctXP = Math.min(((xp-xpMin)/(xpMax-xpMin))*100, 100);
  const pctCopas = arenaActual.max===99999 ? 100 : Math.min(((copas-arenaActual.min)/300)*100, 100);
  const tierColor = TIER_CLR[tier] || '#64748b';
  const siguienteArena = ARENAS[ARENAS.findIndex(a=>a.id===arenaActual.id)+1];
  const streak = calcStreak(historial);
  const tierGroups = ['bronce','plata','oro','diamante'];
  const tierNames = {bronce:'Bronce',plata:'Plata',oro:'Oro',diamante:'Diamante'};
  const tierColors = {bronce:'#d97706',plata:'#94a3b8',oro:'#f59e0b',diamante:'#3b82f6'};
  const skillEntries = SKILLS.map(s => ({...s, val: skills?.[s.key]||0}));
  const weakestSkill = [...skillEntries].sort((a,b)=>a.val-b.val)[0];

  const css = `
    @keyframes slideIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
    .arena-slide{animation:slideIn 0.3s ease forwards;}
    .planet-anim{animation:float 5s ease-in-out infinite;}
    .session-btn:hover{filter:brightness(1.1);transform:translateY(-2px)!important;box-shadow:0 10px 36px rgba(79,70,229,0.45)!important;}
    .lab-btn:hover{filter:brightness(1.1);transform:translateY(-2px)!important;box-shadow:0 10px 36px rgba(5,150,105,0.4)!important;}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    .stat-card:hover{transform:translateY(-3px);box-shadow:0 14px 36px rgba(0,0,0,0.1)!important;}
    .quick-btn:hover{background:#f0f4ff!important;border-color:#c7d2fe!important;}
    .skill-bar-fill{transition:width 1s ease;}
    .hist-row:hover{background:#f8fafc!important;}
    .arena-dot:hover{transform:scale(1.4);}
    .empleo-tab:hover{background:rgba(79,70,229,0.06)!important;}
    .oferta-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.1)!important;border-color:#c7d2fe!important;}
    .cert-row:hover{background:#f8faff!important;}
    .reto-row:hover{background:#f0fdf4!important;}
    .bootcamp-row:hover{background:#faf5ff!important;}
    *{transition:transform .2s ease,box-shadow .2s ease,border-color .15s ease,background .15s ease,filter .15s ease;}
  `;

  if (!userData) return (
    <div style={{minHeight:'100vh',background:'#f5f7fa',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:40,height:40,border:'3px solid #e2e8f0',borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      {showGuestModal && <GuestModal onClose={()=>setShowGuestModal(false)} mensaje={guestMsg}/>}
      <div style={{position:'fixed',inset:0,background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',zIndex:-1}}/>
      <ParticleCanvas/>

      <div style={{position:'relative',zIndex:1,minHeight:'100vh',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0f172a'}}>

        {/* NAVBAR */}
        <nav style={{position:'sticky',top:0,zIndex:50,height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',backgroundColor:'rgba(255,255,255,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 12px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:'28px'}}/>
            <span style={{fontSize:'15px',fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',gap:'2px'}}>
            {[
              {label:'Training',path:'/training'},
              {label:'Sesiones',path:'/sesion'},
              {label:'Labs',path:'/lab'},
              {label:'Ranking',path:'/ranking'},
              {label:'Certificado',path:'/certificado'},
              {label:'Perfil',path:'/perfil'},
              {label:'Empleo',path:'#empleo'},
            ].map((item,i)=>(
              <button key={i} className="nav-btn"
                onClick={()=>{
                  if(item.path==='#empleo') document.getElementById('empleo-section')?.scrollIntoView({behavior:'smooth'});
                  else if(item.path==='/lab'&&handleGuestAction('El laboratorio SOC requiere cuenta. ¡Es gratis!')) return;
                  else if(item.path==='/sesion'&&handleGuestAction('Las sesiones competitivas requieren cuenta.')) return;
                  else navigate(item.path);
                }}
                style={{padding:'5px 14px',borderRadius:'7px',background:'none',border:'none',color:item.path==='/lab'?'#059669':'#64748b',fontSize:'13px',fontWeight:item.path==='/lab'?700:500,cursor:'pointer'}}>
                {item.path==='/lab'?'🔬 Labs':item.label}
              </button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#22c55e',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:'13px',color:'#374151',fontWeight:500}}>{user?.nombre}</span>
              {user?.isGuest && <span style={{fontSize:'10px',color:'#64748b',padding:'1px 6px',borderRadius:'4px',background:'#f1f5f9'}}>invitado</span>}
              <span onClick={()=>navigate('/arenas')} style={{fontSize:'11px',fontWeight:700,color:arenaActual.color,background:arenaActual.colorLight,padding:'2px 8px',borderRadius:'5px',cursor:'pointer'}}>{arenaActual.name}</span>
            </div>
            {streak > 0 && !user?.isGuest && (
              <div style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'8px',background:'linear-gradient(135deg,#fef3c7,#fffbeb)',border:'1px solid #fcd34d'}}>
                <span style={{fontSize:'14px'}}>🔥</span>
                <span style={{fontSize:'12px',fontWeight:700,color:'#92400e'}}>{streak}</span>
              </div>
            )}
            {user?.isGuest ? (
              <button onClick={()=>navigate('/register')} style={{background:'linear-gradient(135deg,#4f46e5,#6366f1)',border:'none',color:'#fff',padding:'5px 12px',borderRadius:'7px',fontSize:'12px',cursor:'pointer',fontWeight:600}}>Crear cuenta →</button>
            ) : (
              <button onClick={()=>{logout();navigate('/');}} style={{background:'none',border:'1px solid #e2e8f0',color:'#94a3b8',padding:'5px 12px',borderRadius:'7px',fontSize:'12px',cursor:'pointer'}}>Salir</button>
            )}
          </div>
        </nav>

        <div style={{maxWidth:'1160px',margin:'0 auto',padding:'24px 40px 72px'}}>

          {/* BANNER INVITADO */}
          {user?.isGuest && (
            <div style={{marginBottom:'20px',padding:'14px 20px',borderRadius:'12px',background:'linear-gradient(135deg,#eef2ff,#f5f3ff)',border:'1px solid #c7d2fe',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <span style={{fontSize:'20px'}}>👁</span>
                <div>
                  <div style={{fontSize:'13px',fontWeight:700,color:'#3730a3'}}>Estás explorando como invitado</div>
                  <div style={{fontSize:'12px',color:'#6366f1'}}>Los datos son de ejemplo. Crea una cuenta gratis para competir de verdad.</div>
                </div>
              </div>
              <button onClick={()=>navigate('/register')} style={{padding:'9px 18px',borderRadius:'9px',background:'#4f46e5',border:'none',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',flexShrink:0}}>
                Crear cuenta gratis →
              </button>
            </div>
          )}

          {/* BIENVENIDA */}
          <div style={{marginBottom:'20px',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div>
              <h1 style={{fontSize:'22px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',marginBottom:'2px'}}>
                Bienvenido{user?.isGuest?'':', '}<span style={{color:ACC}}>{user?.isGuest?' al modo invitado':user?.nombre}</span>
              </h1>
              <p style={{fontSize:'13px',color:'#94a3b8',fontFamily:'monospace'}}>
                {arenaActual.name} · Tier {tier} — {TIERS[tier]} · {sesiones} sesiones completadas
              </p>
            </div>
            {streak > 1 && !user?.isGuest && (
              <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 18px',borderRadius:'12px',background:'linear-gradient(135deg,#fffbeb,#fef3c7)',border:'1px solid #fcd34d',boxShadow:'0 2px 8px rgba(251,191,36,0.2)'}}>
                <span style={{fontSize:'24px'}}>🔥</span>
                <div>
                  <div style={{fontSize:'18px',fontWeight:900,color:'#92400e',letterSpacing:'-0.5px',lineHeight:1}}>{streak} días</div>
                  <div style={{fontSize:'11px',color:'#b45309',fontWeight:600}}>racha activa</div>
                </div>
              </div>
            )}
          </div>

          {/* FILA 1: ARENA + SESIÓN + LAB + TERMINAL */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:'14px',marginBottom:'14px'}}>

            {/* ARENA CARD */}
            <div>
              <div style={{display:'flex',gap:'12px',marginBottom:'10px',alignItems:'center'}}>
                {tierGroups.map(t=>(
                  <div key={t} style={{display:'flex',alignItems:'center',gap:'4px'}}>
                    <span style={{fontSize:'10px',color:ARENAS.find(a=>a.tier===t&&a.id===arenaActual.id)?tierColors[t]:'#cbd5e1',fontFamily:'monospace',fontWeight:700,letterSpacing:'1px'}}>{tierNames[t].toUpperCase()}</span>
                    {[3,2,1].map(d=>{
                      const a = ARENAS.find(x=>x.tier===t&&x.div===d);
                      const isActive = a?.id === ARENAS[arenaIdx]?.id;
                      const isCurrent = a?.id === arenaActual.id;
                      return <button key={d} className="arena-dot" onClick={()=>setArenaIdx(ARENAS.findIndex(x=>x.id===a.id))} style={{width:isActive?'20px':'7px',height:'7px',borderRadius:'4px',backgroundColor:isActive?tierColors[t]:isCurrent?`${tierColors[t]}60`:'#e2e8f0',border:'none',cursor:'pointer',padding:0}}/>;
                    })}
                  </div>
                ))}
              </div>

              <div ref={sliderRef} className="arena-slide" key={arenaIdx}
                onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
                onClick={()=>navigate('/arenas')}
                style={{borderRadius:'18px',padding:'30px 38px',background:`linear-gradient(135deg,${arena.gradFrom} 0%,${arena.gradTo} 100%)`,position:'relative',overflow:'hidden',boxShadow:`0 8px 40px rgba(${arena.colorRgb},.35)`,cursor:'pointer'}}>
                <div style={{position:'absolute',top:'-50px',right:'-30px',width:'280px',height:'280px',borderRadius:'50%',background:'rgba(255,255,255,0.08)',pointerEvents:'none'}}/>
                <div style={{display:'flex',alignItems:'center',gap:'32px',position:'relative',zIndex:1}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                      {arena.id===arenaActual.id && <div style={{width:'5px',height:'5px',borderRadius:'50%',backgroundColor:'#fff',animation:'pulse 2s infinite'}}/>}
                      <span style={{fontSize:'10px',color:'rgba(255,255,255,0.75)',letterSpacing:'2.5px',fontWeight:700,fontFamily:'monospace'}}>
                        {arena.id===arenaActual.id?'TU ARENA ACTUAL':'ARENA'}
                      </span>
                    </div>
                    <h1 style={{fontSize:'clamp(38px,4.5vw,60px)',fontWeight:900,color:'#fff',letterSpacing:'-2px',lineHeight:1,marginBottom:'4px',textShadow:'0 2px 12px rgba(0,0,0,0.2)'}}>{arena.name}</h1>
                    <p style={{fontSize:'11px',color:'rgba(255,255,255,0.55)',fontFamily:'monospace',marginBottom:'18px'}}>{arena.min} — {arena.max===99999?'∞':arena.max} copas · División {arena.div}</p>
                    {arena.id===arenaActual.id ? (
                      <>
                        <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'10px'}}>
                          <span style={{fontSize:'36px',fontWeight:900,color:'#fff',letterSpacing:'-1px'}}>{copas.toLocaleString()}</span>
                          <span style={{fontSize:'13px',color:'rgba(255,255,255,0.65)'}}>copas</span>
                          {siguienteArena && <span style={{fontSize:'10px',color:'rgba(255,255,255,0.8)',padding:'2px 8px',borderRadius:'5px',background:'rgba(255,255,255,0.18)',fontFamily:'monospace'}}>{siguienteArena.min - copas} → {siguienteArena.name}</span>}
                        </div>
                        <div style={{height:'5px',borderRadius:'3px',backgroundColor:'rgba(255,255,255,0.22)',maxWidth:'300px',marginBottom:'6px'}}>
                          <div style={{width:`${pctCopas}%`,height:'100%',borderRadius:'3px',backgroundColor:'#fff',opacity:.9}}/>
                        </div>
                        <p style={{fontSize:'10px',color:'rgba(255,255,255,0.55)',fontFamily:'monospace'}}>{Math.round(pctCopas)}% hacia {siguienteArena?.name||'máximo'}</p>
                      </>
                    ) : (
                      <p style={{fontSize:'13px',color:'rgba(255,255,255,0.75)'}}>{arena.min > copas ? `Faltan ${(arena.min-copas).toLocaleString()} copas` : '✓ Arena superada'}</p>
                    )}
                  </div>
                  <div className="planet-anim" style={{flexShrink:0,filter:'drop-shadow(0 8px 24px rgba(0,0,0,0.3))'}}>
                    <Planet tier={arena.tier} size={150}/>
                  </div>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:'14px',position:'relative',zIndex:1}}>
                  <button onClick={e=>{e.stopPropagation();arenaIdx>0&&setArenaIdx(i=>i-1);}} style={{background:'none',border:'none',color:arenaIdx>0?'rgba(255,255,255,0.55)':'transparent',cursor:arenaIdx>0?'pointer':'default',fontSize:'11px',fontFamily:'monospace'}}>← {arenaIdx>0?ARENAS[arenaIdx-1].name:''}</button>
                  <button onClick={e=>{e.stopPropagation();arenaIdx<ARENAS.length-1&&setArenaIdx(i=>i+1);}} style={{background:'none',border:'none',color:arenaIdx<ARENAS.length-1?'rgba(255,255,255,0.55)':'transparent',cursor:arenaIdx<ARENAS.length-1?'pointer':'default',fontSize:'11px',fontFamily:'monospace'}}>{arenaIdx<ARENAS.length-1?ARENAS[arenaIdx+1].name:''} →</button>
                </div>
                <div style={{position:'absolute',bottom:'14px',left:'50%',transform:'translateX(-50%)',fontSize:'10px',color:'rgba(255,255,255,0.4)',fontFamily:'monospace',letterSpacing:'1px'}}>CLICK PARA VER TODAS LAS ARENAS</div>
              </div>
            </div>

            {/* COLUMNA DERECHA: SESIÓN + LAB + TERMINAL */}
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <button className="session-btn" onClick={()=>{ if(handleGuestAction('Las sesiones competitivas requieren cuenta gratis.'))return; navigate('/sesion'); }}
                style={{width:'100%',padding:'16px 20px',borderRadius:'14px',background:'linear-gradient(135deg,#4f46e5,#6366f1)',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',gap:'12px',textAlign:'left',boxShadow:'0 4px 20px rgba(79,70,229,.35)'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'11px',backgroundColor:'rgba(255,255,255,0.18)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',fontWeight:800,marginBottom:'2px'}}>INICIAR SESIÓN SOC</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,0.6)',fontFamily:'monospace'}}>{arenaActual.name} · {arenaActual.tier==='bronce'?'20':arenaActual.tier==='plata'?'15':arenaActual.tier==='oro'?'10':'7'} min</div>
                </div>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <button className="lab-btn" onClick={()=>{ if(handleGuestAction('El laboratorio SOC requiere una cuenta gratis.'))return; navigate('/lab'); }}
                style={{width:'100%',padding:'16px 20px',borderRadius:'14px',background:'linear-gradient(135deg,#065f46,#059669)',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',gap:'12px',textAlign:'left',boxShadow:'0 4px 20px rgba(5,150,105,.3)'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'11px',backgroundColor:'rgba(255,255,255,0.18)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'18px'}}>🔬</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',fontWeight:800,marginBottom:'2px'}}>LABORATORIO SOC</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,0.6)',fontFamily:'monospace'}}>Investigación libre · Sin límite de tiempo</div>
                </div>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <div style={{flex:1,borderRadius:'14px',overflow:'hidden',border:'1px solid #e2e8f0',backgroundColor:'#fff',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
                <div style={{backgroundColor:'#f8fafc',padding:'7px 14px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:'5px'}}>
                  {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:c}}/>)}
                  <span style={{color:'#94a3b8',fontSize:'10px',fontFamily:'monospace',marginLeft:'8px'}}>soc-terminal</span>
                </div>
                <div style={{backgroundColor:'#0f172a',padding:'12px 16px',fontFamily:"'Fira Code',monospace",fontSize:'10px',lineHeight:1.9,minHeight:'140px'}}>
                  {termLines.map((l,i)=>(
                    <p key={i} style={{color:l.color,margin:0,animation:'fadeIn .25s ease'}}>
                      {l.text==='▌'?<span style={{animation:'blink 1s infinite',display:'inline-block'}}>{l.text}</span>:l.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FILA 2: STATS */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'14px'}}>
            {[
              {label:'COPAS',value:copas.toLocaleString(),sub:arenaActual.name,color:tierColors[arenaActual.tier]||'#d97706',light:arenaActual.colorLight,onClick:()=>navigate('/arenas')},
              {label:'XP TOTAL',value:xp.toLocaleString(),sub:`${Math.round(pctXP)}% al siguiente`,color:'#4f46e5',light:'#eef2ff',onClick:()=>{ if(!handleGuestAction('Ver tu perfil completo requiere cuenta.')) navigate('/perfil'); }},
              {label:'SESIONES',value:sesiones.toString(),sub:'completadas',color:'#059669',light:'#ecfdf5',onClick:null},
              {label:'TIER',value:`T${tier}`,sub:TIERS[tier],color:tierColor,light:'#f8fafc',onClick:()=>{ if(!handleGuestAction('Ver tiers requiere cuenta.')) navigate('/perfil'); }},
            ].map((s,i)=>(
              <div key={i} className="stat-card" onClick={s.onClick||undefined}
                style={{padding:'20px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',cursor:s.onClick?'pointer':'default',boxShadow:'0 2px 8px rgba(0,0,0,.05)',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',backgroundColor:s.color,borderRadius:'14px 14px 0 0'}}/>
                <div style={{width:'38px',height:'38px',borderRadius:'10px',backgroundColor:s.light,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'12px',border:`1px solid ${s.color}20`}}>
                  <div style={{width:'10px',height:'10px',borderRadius:'50%',backgroundColor:s.color}}/>
                </div>
                <div style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:'5px',fontFamily:'monospace'}}>{s.label}</div>
                <div style={{fontSize:'28px',fontWeight:900,color:s.color,letterSpacing:'-0.8px',lineHeight:1,marginBottom:'4px'}}>{s.value}</div>
                <div style={{fontSize:'12px',color:'#64748b'}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* XP BAR */}
          <div style={{padding:'16px 20px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:'14px',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'13px',fontWeight:700,color:tierColor}}>{TIERS[tier]}</span>
                <span style={{fontSize:'10px',color:'#94a3b8',padding:'2px 7px',borderRadius:'5px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',fontFamily:'monospace'}}>T{tier}</span>
                {tier<8&&<span style={{fontSize:'12px',color:'#94a3b8'}}>→ {TIERS[tier+1]}</span>}
              </div>
              <span style={{fontSize:'11px',color:'#94a3b8',fontFamily:'monospace'}}>{xp.toLocaleString()} / {xpMax===99999?'∞':xpMax.toLocaleString()} XP</span>
            </div>
            <div style={{height:'8px',borderRadius:'4px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
              <div className="skill-bar-fill" style={{width:`${pctXP}%`,height:'100%',borderRadius:'4px',background:`linear-gradient(90deg,${tierColor}80,${tierColor})`}}/>
            </div>
          </div>

          {/* SECCIÓN LABORATORIO */}
          <div style={{marginBottom:'28px',borderRadius:'20px',overflow:'hidden',border:'1px solid #a7f3d0',boxShadow:'0 4px 20px rgba(16,185,129,0.1)'}}>
            <div style={{padding:'32px 40px',background:'linear-gradient(135deg,#064e3b 0%,#065f46 40%,#047857 100%)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'-60px',right:'-40px',width:'280px',height:'280px',borderRadius:'50%',background:'radial-gradient(circle,rgba(52,211,153,0.15),transparent)',pointerEvents:'none'}}/>
              <div style={{position:'relative',zIndex:1,display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:'32px'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                    <span style={{fontSize:'10px',color:'#6ee7b7',letterSpacing:'3px',fontWeight:700,fontFamily:'monospace'}}>SOCBLAST LABS — BETA</span>
                    <span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'5px',backgroundColor:'rgba(52,211,153,0.2)',color:'#6ee7b7',border:'1px solid rgba(52,211,153,0.3)',fontWeight:700}}>NUEVO</span>
                  </div>
                  <h2 style={{fontSize:'26px',fontWeight:900,color:'#fff',letterSpacing:'-1px',marginBottom:'10px',lineHeight:1.1}}>
                    Investiga. Analiza.<br/><span style={{color:'#6ee7b7'}}>A tu propio ritmo.</span>
                  </h2>
                  <p style={{fontSize:'13px',color:'rgba(255,255,255,0.55)',lineHeight:1.7,maxWidth:'500px',marginBottom:'18px'}}>
                    Acceso completo al SIEM, logs, tráfico de red y eventos de un escenario comprometido. La IA evalúa la profundidad de tu análisis.
                  </p>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'20px'}}>
                    {[{icon:'🖥️',label:'SIEM con queries'},{icon:'📋',label:'Log Explorer'},{icon:'🌐',label:'Network Map'},{icon:'📝',label:'Ticket system'},{icon:'🤖',label:'Evaluación IA'}].map((f,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:'5px',padding:'5px 10px',borderRadius:'7px',backgroundColor:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)'}}>
                        <span style={{fontSize:'12px'}}>{f.icon}</span>
                        <span style={{fontSize:'11px',color:'rgba(255,255,255,0.8)',fontWeight:500}}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>{ if(handleGuestAction('El laboratorio SOC requiere una cuenta gratis.'))return; navigate('/lab'); }}
                    style={{padding:'12px 28px',borderRadius:'100px',background:'linear-gradient(135deg,#10b981,#059669)',border:'none',color:'#fff',fontSize:'14px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(16,185,129,0.4)'}}>
                    🔬 Entrar al Laboratorio →
                  </button>
                </div>
                {/* Mini SIEM mockup */}
                <div style={{width:'280px',flexShrink:0}}>
                  <div style={{borderRadius:'12px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 16px 40px rgba(0,0,0,0.4)'}}>
                    <div style={{backgroundColor:'#0f172a',padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:'4px'}}>
                      {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{width:'7px',height:'7px',borderRadius:'50%',backgroundColor:c}}/>)}
                      <span style={{fontSize:'9px',color:'#475569',fontFamily:'monospace',marginLeft:'6px'}}>siem — nighthawk</span>
                    </div>
                    <div style={{backgroundColor:'#020817',padding:'14px',fontFamily:'monospace',fontSize:'10px',lineHeight:1.9}}>
                      <p style={{color:'#334155'}}>siem&gt; index=windows EventID=4688</p>
                      <p style={{color:'#94a3b8'}}>02:32:01 <span style={{color:'#fb923c'}}>powershell.exe</span></p>
                      <p style={{color:'#f87171',fontWeight:700}}>02:32:15 <span>mimikatz.exe</span> ⚠</p>
                      <p style={{color:'#334155',marginTop:'6px'}}>siem&gt; index=dns</p>
                      <p style={{color:'#f87171'}}>c2.nighthawk-ops.ru ⚠</p>
                      <div style={{marginTop:'8px',padding:'6px 8px',borderRadius:'6px',backgroundColor:'rgba(16,185,129,0.07)',border:'1px solid rgba(16,185,129,0.15)'}}>
                        <p style={{color:'#34d399',fontSize:'9px'}}>📝 IOC: mimikatz + C2 detectados</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FILA 3: SKILLS + ACTIVIDAD + MINI RANKING */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'14px'}}>
            {/* SKILLS */}
            <div style={{padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>HABILIDADES</p>
                <span style={{fontSize:'10px',color:ACC,fontWeight:600,padding:'2px 8px',background:'#eef2ff',borderRadius:'5px'}}>{weakestSkill.label} ↓</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {skillEntries.map((s,i)=>{
                  const pct = Math.min((s.val/10)*100,100);
                  const isWeak = s.key === weakestSkill.key;
                  return (
                    <div key={i}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                        <span style={{fontSize:'11px',color:isWeak?ACC:'#475569',fontWeight:isWeak?600:500}}>{s.label}</span>
                        <span style={{fontSize:'10px',color:'#94a3b8',fontFamily:'monospace'}}>{s.val}/10</span>
                      </div>
                      <div style={{height:'5px',borderRadius:'3px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                        <div className="skill-bar-fill" style={{width:`${pct}%`,height:'100%',borderRadius:'3px',background:isWeak?`linear-gradient(90deg,#ef444480,#ef4444)`:`linear-gradient(90deg,${ACC}80,${ACC})`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTIVIDAD */}
            <div style={{padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>ACTIVIDAD — 90 DÍAS</p>
                <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                  {[0.07,0.3,0.55,0.85].map((o,i)=><div key={i} style={{width:'8px',height:'8px',borderRadius:'2px',backgroundColor:`rgba(79,70,229,${o})`}}/>)}
                </div>
              </div>
              <div style={{overflowX:'auto'}}><ActivityHeatmap historial={historial}/></div>
              <div style={{marginTop:'14px',padding:'10px 12px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #f1f5f9'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <div style={{textAlign:'center'}}><div style={{fontSize:'16px',fontWeight:800,color:ACC}}>{sesiones}</div><div style={{fontSize:'10px',color:'#94a3b8'}}>sesiones</div></div>
                  <div style={{textAlign:'center'}}><div style={{fontSize:'16px',fontWeight:800,color:'#f59e0b'}}>{streak}</div><div style={{fontSize:'10px',color:'#94a3b8'}}>racha</div></div>
                  <div style={{textAlign:'center'}}><div style={{fontSize:'16px',fontWeight:800,color:'#059669'}}>{historial.filter(s=>s.resultado?.copas_ganadas>0).length}</div><div style={{fontSize:'10px',color:'#94a3b8'}}>victorias</div></div>
                </div>
              </div>
            </div>

            {/* MINI RANKING + RECOMENDACIÓN */}
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div style={{padding:'18px 20px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)',flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                  <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>TOP RANKING</p>
                  <button onClick={()=>{ if(!handleGuestAction('El ranking completo requiere cuenta.')) navigate('/ranking'); }} style={{fontSize:'10px',color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Ver todo →</button>
                </div>
                {ranking.length === 0 ? (
                  <p style={{fontSize:'12px',color:'#94a3b8',textAlign:'center',padding:'10px 0'}}>Sin datos</p>
                ) : ranking.map((j,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:i<ranking.length-1?'1px solid #f1f5f9':'none'}}>
                    <div style={{width:'22px',height:'22px',borderRadius:'6px',backgroundColor:i===0?'#fef3c7':i===1?'#f1f5f9':'#fdf4ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:800,color:i===0?'#d97706':i===1?'#475569':'#7c3aed',flexShrink:0}}>{i===0?'🥇':i===1?'🥈':'🥉'}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'12px',fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.nombre}</div>
                      <div style={{fontSize:'10px',color:'#94a3b8',fontFamily:'monospace'}}>{j.arena}</div>
                    </div>
                    <div style={{fontSize:'12px',fontWeight:700,color:'#d97706',fontFamily:'monospace'}}>{j.copas?.toLocaleString()}🏆</div>
                  </div>
                ))}
              </div>
              <div style={{padding:'16px 18px',borderRadius:'14px',background:'linear-gradient(135deg,#eef2ff,#f5f3ff)',border:'1px solid #c7d2fe',boxShadow:'0 2px 8px rgba(79,70,229,.08)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'8px'}}>
                  <span style={{fontSize:'14px'}}>🎯</span>
                  <span style={{fontSize:'10px',color:ACC,fontWeight:700,letterSpacing:'1.5px',fontFamily:'monospace'}}>SIGUIENTE MISIÓN</span>
                </div>
                <p style={{fontSize:'12px',color:'#3730a3',fontWeight:600,marginBottom:'4px',lineHeight:1.4}}>Skill débil: <strong>{weakestSkill.label}</strong></p>
                <p style={{fontSize:'11px',color:'#6366f1',lineHeight:1.5,marginBottom:'10px'}}>Completa sesiones en {arenaActual.name} para subirla.</p>
                <button onClick={()=>{ if(handleGuestAction('Las sesiones requieren cuenta gratis.'))return; navigate('/sesion'); }} style={{width:'100%',padding:'8px',borderRadius:'8px',background:ACC,border:'none',color:'#fff',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>
                  Entrenar ahora →
                </button>
              </div>
            </div>
          </div>

          {/* FILA 4: HISTORIAL + ACCESOS */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'28px'}}>
            <div style={{padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>ÚLTIMAS SESIONES</p>
                <button onClick={()=>{ if(handleGuestAction('Las sesiones requieren cuenta.'))return; navigate('/sesion'); }} style={{fontSize:'10px',color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Nueva →</button>
              </div>
              {historial.length === 0 ? (
                <div style={{textAlign:'center',padding:'20px 0'}}>
                  <div style={{fontSize:'28px',marginBottom:'8px'}}>🎯</div>
                  <p style={{fontSize:'12px',color:'#94a3b8'}}>{user?.isGuest?'Crea una cuenta para ver tu historial':'Sin sesiones aún'}</p>
                  <button onClick={()=>{ if(handleGuestAction('Las sesiones requieren cuenta.'))return; navigate('/sesion'); }} style={{marginTop:'10px',padding:'8px 16px',borderRadius:'8px',backgroundColor:ACC,border:'none',color:'#fff',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                    {user?.isGuest?'Crear cuenta':'Empezar'}
                  </button>
                </div>
              ) : historial.slice(0,5).map((s,i)=>{
                const res = s.resultado;
                const copasGan = res?.copas_ganadas || 0;
                const media = res?.media_puntuacion || 0;
                const positive = copasGan >= 0;
                return (
                  <div key={i} className="hist-row" style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 11px',borderRadius:'9px',backgroundColor:'#f8fafc',border:'1px solid #f1f5f9',marginBottom:'6px'}}>
                    <div style={{width:'28px',height:'28px',borderRadius:'7px',backgroundColor:positive?'#ecfdf5':'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontSize:'13px'}}>{positive?'⬆':'⬇'}</span></div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:'11px',color:'#0f172a',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.titulo||'Sesión SOC'}</p>
                      <p style={{fontSize:'10px',color:'#94a3b8',fontFamily:'monospace'}}>{media}/20 pts</p>
                    </div>
                    <span style={{fontSize:'12px',fontWeight:700,color:positive?'#059669':'#ef4444',fontFamily:'monospace',flexShrink:0}}>{positive?'+':''}{copasGan}</span>
                  </div>
                );
              })}
            </div>

            <div style={{padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:'16px',fontFamily:'monospace'}}>ACCESOS RÁPIDOS</p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {[
                  {label:'Laboratorio SOC', desc:'SIEM · Forense · Evaluado', path:'/lab', color:'#059669', light:'#ecfdf5', guest:true},
                  {label:'Training SOC', desc:'12 módulos · 3 cursos', path:'/training', color:'#7c3aed', light:'#f5f3ff', guest:false},
                  {label:'Ranking Global', desc:'Tu posición actual', path:'/ranking', color:'#d97706', light:'#fffbeb', guest:true},
                  {label:'Arenas', desc:'Ver todas las divisiones', path:'/arenas', color:'#0891b2', light:'#ecfeff', guest:false},
                  {label:'Mi Certificado', desc:'QR verificable', path:'/certificado', color:'#059669', light:'#ecfdf5', guest:true},
                  {label:'Perfil & Tiers', desc:'Stats y progresión', path:'/perfil', color:'#2563eb', light:'#eff6ff', guest:true},
                ].map((item,i)=>(
                  <div key={i} className="quick-btn" onClick={()=>{ if(item.guest&&handleGuestAction(`${item.label} requiere cuenta gratis.`))return; navigate(item.path); }}
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 13px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0',cursor:'pointer'}}>
                    <div style={{width:'30px',height:'30px',borderRadius:'8px',backgroundColor:item.light,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${item.color}18`}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:item.color}}/>
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontSize:'12px',color:'#0f172a',fontWeight:600}}>{item.label}</span>
                      <span style={{fontSize:'10px',color:'#94a3b8',marginLeft:'6px'}}>{item.desc}</span>
                    </div>
                    {item.guest&&user?.isGuest?<span style={{fontSize:'10px',color:'#94a3b8'}}>🔒</span>:<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECCIÓN EMPLEO */}
          {!user?.isGuest && (
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
                  <p style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',lineHeight:1.7,maxWidth:'520px'}}>Ofertas reales, certificaciones recomendadas, bootcamps y retos gratuitos.</p>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'8px',flexShrink:0}}>
                  <div style={{padding:'14px 20px',borderRadius:'12px',background:'rgba(79,70,229,0.15)',border:'1px solid rgba(99,102,241,0.25)',textAlign:'center'}}>
                    <div style={{fontSize:'24px',fontWeight:900,color:'#a5b4fc'}}>{OFERTAS_MOCK.length}</div>
                    <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>ofertas activas</div>
                  </div>
                </div>
              </div>
              <div style={{position:'relative',zIndex:1,display:'flex',gap:'6px',marginTop:'24px'}}>
                {[{id:'ofertas',label:'💼 Ofertas'},{id:'certs',label:'🎓 Certificaciones'},{id:'bootcamps',label:'🚀 Bootcamps'},{id:'retos',label:'⚔️ Retos gratuitos'}].map(tab=>(
                  <button key={tab.id} className="empleo-tab" onClick={()=>setEmpleoTab(tab.id)}
                    style={{padding:'8px 18px',borderRadius:'9px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,background:empleoTab===tab.id?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.06)',color:empleoTab===tab.id?'#c7d2fe':'rgba(255,255,255,0.45)',borderBottom:empleoTab===tab.id?'2px solid #818cf8':'2px solid transparent'}}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {empleoTab==='ofertas' && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'16px'}}>
                  {OFERTAS_MOCK.map((o,i)=>(
                    <div key={i} className="oferta-card" style={{padding:'24px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)',position:'relative',overflow:'hidden',cursor:'pointer'}}>
                      <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',backgroundColor:o.color}}/>
                      {o.badge&&<span style={{position:'absolute',top:'14px',right:'14px',fontSize:'10px',fontWeight:700,padding:'3px 8px',borderRadius:'5px',background:o.badge==='nueva'?'#ecfdf5':'#fef2f2',color:o.badge==='nueva'?'#059669':'#ef4444',border:`1px solid ${o.badge==='nueva'?'#a7f3d0':'#fecaca'}`}}>{o.badge.toUpperCase()}</span>}
                      <div style={{width:'40px',height:'40px',borderRadius:'10px',background:`${o.color}15`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'14px'}}><span style={{fontSize:'18px'}}>🏢</span></div>
                      <div style={{fontSize:'11px',color:'#94a3b8',marginBottom:'4px'}}>{o.empresa}</div>
                      <div style={{fontSize:'16px',fontWeight:800,color:'#0f172a',marginBottom:'8px',lineHeight:1.2}}>{o.rol}</div>
                      <div style={{display:'flex',flexDirection:'column',gap:'4px',marginBottom:'16px'}}>
                        <div style={{fontSize:'12px',color:'#64748b'}}>📍 {o.ubicacion}</div>
                        <div style={{fontSize:'12px',color:'#64748b'}}>💰 {o.salario}</div>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{fontSize:'10px',fontWeight:700,color:o.color,padding:'3px 8px',borderRadius:'5px',background:`${o.color}12`}}>Req: {o.arena}</span>
                        <button style={{padding:'7px 14px',borderRadius:'8px',background:o.color,border:'none',color:'#fff',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>Aplicar →</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{padding:'16px 20px',borderRadius:'12px',background:'linear-gradient(135deg,#eef2ff,#f5f3ff)',border:'1px solid #c7d2fe',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:700,color:'#3730a3',marginBottom:'2px'}}>¿Eres empresa? Publica tus ofertas aquí</div>
                    <div style={{fontSize:'12px',color:'#6366f1'}}>Accede al talent pool de analistas verificados</div>
                  </div>
                  <button onClick={()=>navigate('/company')} style={{padding:'10px 20px',borderRadius:'9px',background:ACC,border:'none',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',flexShrink:0}}>Acceso empresas →</button>
                </div>
              </div>
            )}

            {empleoTab==='certs' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                {CERTS_MOCK.map((c,i)=>(
                  <div key={i} className="cert-row" onClick={()=>window.open(c.url,'_blank')}
                    style={{display:'flex',alignItems:'center',gap:'16px',padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)',cursor:'pointer',position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',backgroundColor:c.color}}/>
                    <div style={{width:'44px',height:'44px',borderRadius:'12px',background:`${c.color}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontSize:'20px'}}>🎓</span></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'14px',fontWeight:700,color:'#0f172a',marginBottom:'3px'}}>{c.nombre}</div>
                      <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                        <span style={{fontSize:'11px',color:'#64748b',padding:'2px 7px',borderRadius:'4px',background:'#f8fafc',border:'1px solid #e2e8f0'}}>{c.nivel}</span>
                        <span style={{fontSize:'11px',color:'#94a3b8'}}>{c.precio}</span>
                      </div>
                    </div>
                    <div style={{textAlign:'center',flexShrink:0}}>
                      <div style={{fontSize:'18px',fontWeight:900,color:c.color}}>{c.relevancia}%</div>
                      <div style={{fontSize:'10px',color:'#94a3b8'}}>relevancia</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {empleoTab==='bootcamps' && (
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {BOOTCAMPS_MOCK.map((b,i)=>(
                  <div key={i} className="bootcamp-row" style={{display:'flex',alignItems:'center',gap:'16px',padding:'18px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)',cursor:'pointer'}}>
                    <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'linear-gradient(135deg,#f5f3ff,#ede9fe)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontSize:'20px'}}>🚀</span></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'14px',fontWeight:700,color:'#0f172a',marginBottom:'4px'}}>{b.nombre}</div>
                      <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                        <span style={{fontSize:'11px',color:'#7c3aed',padding:'2px 7px',borderRadius:'4px',background:'#f5f3ff'}}>{b.tipo}</span>
                        <span style={{fontSize:'11px',color:'#64748b'}}>⏱ {b.duracion}</span>
                        <span style={{fontSize:'11px',color:'#059669',fontWeight:600}}>💰 {b.precio}</span>
                      </div>
                    </div>
                    <span style={{fontSize:'13px',fontWeight:700,color:'#f59e0b'}}>{b.stars} ⭐</span>
                    <button style={{padding:'8px 16px',borderRadius:'8px',background:'#f5f3ff',border:'1px solid #ddd6fe',color:'#7c3aed',fontSize:'12px',fontWeight:700,cursor:'pointer',flexShrink:0}}>Ver →</button>
                  </div>
                ))}
              </div>
            )}

            {empleoTab==='retos' && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px'}}>
                {RETOS_MOCK.map((r,i)=>(
                  <div key={i} className="reto-row" onClick={()=>window.open(r.url,'_blank')}
                    style={{display:'flex',alignItems:'center',gap:'14px',padding:'18px 20px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)',cursor:'pointer'}}>
                    <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'linear-gradient(135deg,#ecfdf5,#d1fae5)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontSize:'18px'}}>⚔️</span></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'13px',fontWeight:700,color:'#0f172a',marginBottom:'4px'}}>{r.nombre}</div>
                      <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                        <span style={{fontSize:'10px',color:'#059669',padding:'2px 6px',borderRadius:'4px',background:'#ecfdf5'}}>{r.tipo}</span>
                        {r.gratis&&<span style={{fontSize:'10px',color:'#059669',fontWeight:700}}>✓ GRATIS</span>}
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

        </div>
      </div>
    </>
  );
}