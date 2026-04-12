import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';

// ─── SISTEMA DE ARENAS (12 divisiones, 300 copas cada una) ───────────────────
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

// ─── PLANETAS SVG ─────────────────────────────────────────────────────────────
const Planet = ({ tier, size = 110 }) => {
  const p = {
    bronce: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <radialGradient id="pb1" cx="35%" cy="30%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="40%" stopColor="#D97706"/><stop offset="100%" stopColor="#5C2E00"/></radialGradient>
          <radialGradient id="pb2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.45)"/></radialGradient>
        </defs>
        <circle cx="60" cy="60" r="52" fill="url(#pb1)"/>
        <ellipse cx="42" cy="38" rx="20" ry="7" fill="rgba(180,90,20,0.35)" transform="rotate(-25,42,38)"/>
        <ellipse cx="72" cy="68" rx="24" ry="6" fill="rgba(90,40,5,0.3)" transform="rotate(12,72,68)"/>
        <ellipse cx="55" cy="80" rx="14" ry="4" fill="rgba(200,110,30,0.25)" transform="rotate(-5,55,80)"/>
        <circle cx="60" cy="60" r="52" fill="url(#pb2)"/>
        <ellipse cx="38" cy="35" rx="8" ry="4" fill="rgba(255,220,120,0.2)" transform="rotate(-30,38,35)"/>
      </svg>
    ),
    plata: (
      <svg width={size} height={size} viewBox="0 0 150 120">
        <defs>
          <radialGradient id="pp1" cx="35%" cy="30%"><stop offset="0%" stopColor="#F1F5F9"/><stop offset="45%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#1E293B"/></radialGradient>
          <radialGradient id="pp2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.4)"/></radialGradient>
          <linearGradient id="pr1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="30%" stopColor="rgba(148,163,184,0.6)"/><stop offset="70%" stopColor="rgba(203,213,225,0.5)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient>
          <linearGradient id="pr2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(100,116,139,0)"/><stop offset="50%" stopColor="rgba(100,116,139,0.35)"/><stop offset="100%" stopColor="rgba(100,116,139,0)"/></linearGradient>
        </defs>
        <ellipse cx="75" cy="75" rx="73" ry="8" fill="url(#pr2)" opacity="0.5"/>
        <ellipse cx="75" cy="72" rx="70" ry="6" fill="url(#pr1)" opacity="0.7"/>
        <circle cx="75" cy="60" r="48" fill="url(#pp1)"/>
        <circle cx="75" cy="60" r="48" fill="url(#pp2)"/>
        <ellipse cx="58" cy="48" rx="10" ry="4" fill="rgba(226,232,240,0.3)" transform="rotate(-20,58,48)"/>
      </svg>
    ),
    oro: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <radialGradient id="po1" cx="35%" cy="30%"><stop offset="0%" stopColor="#FEF08A"/><stop offset="35%" stopColor="#F59E0B"/><stop offset="70%" stopColor="#D97706"/><stop offset="100%" stopColor="#78350F"/></radialGradient>
          <radialGradient id="po2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.38)"/></radialGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="url(#po1)"/>
        <ellipse cx="45" cy="42" rx="22" ry="9" fill="rgba(251,191,36,0.3)" transform="rotate(-15,45,42)"/>
        <ellipse cx="72" cy="55" rx="18" ry="6" fill="rgba(120,53,15,0.25)" transform="rotate(8,72,55)"/>
        <ellipse cx="50" cy="72" rx="26" ry="7" fill="rgba(217,119,6,0.2)" transform="rotate(-10,50,72)"/>
        <circle cx="60" cy="60" r="54" fill="url(#po2)"/>
        <ellipse cx="40" cy="38" rx="10" ry="5" fill="rgba(255,240,150,0.25)" transform="rotate(-25,40,38)"/>
      </svg>
    ),
    diamante: (
      <svg width={size} height={size} viewBox="0 0 130 120">
        <defs>
          <radialGradient id="pd1" cx="35%" cy="30%"><stop offset="0%" stopColor="#DBEAFE"/><stop offset="30%" stopColor="#93C5FD"/><stop offset="60%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1E3A8A"/></radialGradient>
          <radialGradient id="pd2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.4)"/></radialGradient>
          <linearGradient id="pdr" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(147,197,253,0)"/><stop offset="40%" stopColor="rgba(147,197,253,0.55)"/><stop offset="75%" stopColor="rgba(96,165,250,0.4)"/><stop offset="100%" stopColor="rgba(147,197,253,0)"/></linearGradient>
        </defs>
        <ellipse cx="65" cy="74" rx="64" ry="7" fill="url(#pdr)" opacity="0.6"/>
        <circle cx="65" cy="60" r="52" fill="url(#pd1)"/>
        <circle cx="65" cy="60" r="52" fill="url(#pd2)"/>
        <ellipse cx="48" cy="44" rx="14" ry="5" fill="rgba(219,234,254,0.35)" transform="rotate(-20,48,44)"/>
        <ellipse cx="72" cy="62" rx="18" ry="5" fill="rgba(30,58,138,0.2)" transform="rotate(10,72,62)"/>
        <ellipse cx="55" cy="75" rx="12" ry="3" fill="rgba(147,197,253,0.2)" transform="rotate(-5,55,75)"/>
        <circle cx="44" cy="40" rx="4" fill="rgba(255,255,255,0.4)"/>
      </svg>
    ),
  };
  return p[tier] || null;
};

// ─── PARTÍCULAS ───────────────────────────────────────────────────────────────
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

const TIERS    = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const TIER_CLR = ['','#64748b','#3b82f6','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444','#8b5cf6'];
const SKILLS = [
  {key:'analisis_logs',      label:'Análisis de Logs'},
  {key:'deteccion_amenazas', label:'Detección Amenazas'},
  {key:'respuesta_incidentes',label:'Respuesta Incidentes'},
  {key:'threat_hunting',     label:'Threat Hunting'},
  {key:'forense_digital',    label:'Forense Digital'},
  {key:'gestion_vulnerabilidades',label:'Gestión Vulns'},
  {key:'inteligencia_amenazas',label:'Intel. Amenazas'},
];
const ACC = '#4f46e5';

export default function DashboardAnalista() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [arenaIdx, setArenaIdx]   = useState(0);
  const [termLines, setTermLines] = useState([]);
  const [historial, setHistorial] = useState([]);
  const sliderRef = useRef(null);
  const startX    = useRef(null);

  const TERM = [
    {text:'$ iniciando sesión SOC...',   color:'#94a3b8', delay:0},
    {text:'⚠  ALERT   Brute force detected', color:'#ef4444', delay:400},
    {text:'   →  src: 185.220.101.45   rate: 94/min', color:'#64748b', delay:800},
    {text:'   →  target: CORP-DC01   port: 445/SMB',  color:'#64748b', delay:1200},
    {text:'$ correlating SIEM events...',color:'#94a3b8', delay:1600},
    {text:'   →  T1078 Valid Accounts detected', color:'#f97316', delay:2000},
    {text:'$ awaiting analyst action...', color:ACC, delay:2400},
    {text:'▌', color:ACC, delay:2800},
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
      // Historial
      try {
        const h = await axios.get(`${API}/api/sesiones/historial`, { headers:{ Authorization:`Bearer ${token}` } });
        setHistorial(h.data || []);
      } catch {}
    } catch { logout(); navigate('/login'); }
  };

  const handleTouchStart = e => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd   = e => {
    if (!startX.current) return;
    const d = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) {
      if (d > 0 && arenaIdx < ARENAS.length-1) setArenaIdx(i=>i+1);
      if (d < 0 && arenaIdx > 0)               setArenaIdx(i=>i-1);
    }
    startX.current = null;
  };

  const copas   = userData?.copas || 0;
  const xp      = userData?.xp    || 0;
  const tier    = userData?.tier   || 1;
  const sesiones= userData?.sesiones_completadas || 0;
  const skills  = userData?.skills || {};
  const arena   = ARENAS[arenaIdx];
  const arenaActual = getArenaFromCopas(copas);
  const XP_MAX  = [0,500,1500,3000,5000,8000,12000,18000,99999];
  const xpMin   = XP_MAX[tier-1]||0;
  const xpMax   = XP_MAX[tier]||99999;
  const pctXP   = Math.min(((xp-xpMin)/(xpMax-xpMin))*100, 100);
  const pctCopas= arenaActual.max===99999 ? 100 : Math.min(((copas-arenaActual.min)/300)*100, 100);
  const tierColor = TIER_CLR[tier] || '#64748b';
  const siguienteArena = ARENAS[ARENAS.findIndex(a=>a.id===arenaActual.id)+1];

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
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    .stat-card:hover{transform:translateY(-3px);box-shadow:0 14px 36px rgba(0,0,0,0.1)!important;}
    .quick-btn:hover{background:#f0f4ff!important;border-color:#c7d2fe!important;}
    .skill-bar-fill{transition:width 1s ease;}
    .hist-row:hover{background:#f8fafc!important;}
    .arena-dot:hover{transform:scale(1.4);}
    *{transition:transform .2s ease,box-shadow .2s ease,border-color .15s ease,background .15s ease,filter .15s ease;}
  `;

  if (!userData) return (
    <div style={{minHeight:'100vh',background:'#f5f7fa',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:40,height:40,border:'3px solid #e2e8f0',borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div>
  );

  // Agrupar arenas por tier para los puntos de navegación
  const tierGroups = ['bronce','plata','oro','diamante'];
  const tierNames  = {bronce:'Bronce',plata:'Plata',oro:'Oro',diamante:'Diamante'};
  const tierColors = {bronce:'#d97706',plata:'#94a3b8',oro:'#f59e0b',diamante:'#3b82f6'};

  return (
    <>
      <style>{css}</style>
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
            {[{label:'Training',path:'/training'},{label:'Sesiones',path:'/sesion'},{label:'Ranking',path:'/ranking'},{label:'Certificado',path:'/certificado'},{label:'Perfil',path:'/perfil'}].map((item,i)=>(
              <button key={i} className="nav-btn" onClick={()=>navigate(item.path)} style={{padding:'5px 14px',borderRadius:'7px',background:'none',border:'none',color:'#64748b',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>{item.label}</button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#22c55e',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:'13px',color:'#374151',fontWeight:500}}>{user?.nombre}</span>
              <span onClick={()=>navigate('/arenas')} style={{fontSize:'11px',fontWeight:700,color:arenaActual.color,background:arenaActual.colorLight,padding:'2px 8px',borderRadius:'5px',cursor:'pointer'}}>{arenaActual.name}</span>
            </div>
            <button onClick={()=>{logout();navigate('/');}} style={{background:'none',border:'1px solid #e2e8f0',color:'#94a3b8',padding:'5px 12px',borderRadius:'7px',fontSize:'12px',cursor:'pointer'}}>Salir</button>
          </div>
        </nav>

        <div style={{maxWidth:'1160px',margin:'0 auto',padding:'24px 40px 72px'}}>

          {/* BIENVENIDA */}
          <div style={{marginBottom:'20px'}}>
            <h1 style={{fontSize:'22px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',marginBottom:'2px'}}>
              Bienvenido de nuevo, <span style={{color:ACC}}>{user?.nombre}</span>
            </h1>
            <p style={{fontSize:'13px',color:'#94a3b8',fontFamily:'monospace'}}>
              {arenaActual.name} · Tier {tier} — {TIERS[tier]} · {sesiones} sesiones completadas
            </p>
          </div>

          {/* FILA 1: ARENA + SESIÓN + TERMINAL */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:'14px',marginBottom:'14px'}}>

            {/* ARENA CARD */}
            <div>
              {/* Dots de navegación por tier */}
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
                <div style={{position:'absolute',bottom:'-70px',left:'-40px',width:'220px',height:'220px',borderRadius:'50%',background:'rgba(0,0,0,0.1)',pointerEvents:'none'}}/>

                <div style={{display:'flex',alignItems:'center',gap:'32px',position:'relative',zIndex:1}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                      {arena.id===arenaActual.id && <div style={{width:'5px',height:'5px',borderRadius:'50%',backgroundColor:'#fff',animation:'pulse 2s infinite'}}/>}
                      <span style={{fontSize:'10px',color:'rgba(255,255,255,0.75)',letterSpacing:'2.5px',fontWeight:700,fontFamily:'monospace'}}>
                        {arena.id===arenaActual.id?'TU ARENA ACTUAL':'ARENA'}
                      </span>
                    </div>
                    <h1 style={{fontSize:'clamp(38px,4.5vw,60px)',fontWeight:900,color:'#fff',letterSpacing:'-2px',lineHeight:1,marginBottom:'4px',textShadow:'0 2px 12px rgba(0,0,0,0.2)'}}>
                      {arena.name}
                    </h1>
                    <p style={{fontSize:'11px',color:'rgba(255,255,255,0.55)',fontFamily:'monospace',marginBottom:'18px'}}>
                      {arena.min} — {arena.max===99999?'∞':arena.max} copas · División {arena.div}
                    </p>

                    {arena.id===arenaActual.id ? (
                      <>
                        <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'10px'}}>
                          <span style={{fontSize:'36px',fontWeight:900,color:'#fff',letterSpacing:'-1px'}}>{copas.toLocaleString()}</span>
                          <span style={{fontSize:'13px',color:'rgba(255,255,255,0.65)'}}>copas</span>
                          {siguienteArena && (
                            <span style={{fontSize:'10px',color:'rgba(255,255,255,0.8)',padding:'2px 8px',borderRadius:'5px',background:'rgba(255,255,255,0.18)',fontFamily:'monospace'}}>
                              {siguienteArena.min - copas} → {siguienteArena.name}
                            </span>
                          )}
                        </div>
                        <div style={{height:'5px',borderRadius:'3px',backgroundColor:'rgba(255,255,255,0.22)',maxWidth:'300px',marginBottom:'6px'}}>
                          <div style={{width:`${pctCopas}%`,height:'100%',borderRadius:'3px',backgroundColor:'#fff',opacity:.9}}/>
                        </div>
                        <p style={{fontSize:'10px',color:'rgba(255,255,255,0.55)',fontFamily:'monospace'}}>{Math.round(pctCopas)}% hacia {siguienteArena?.name||'máximo'}</p>
                      </>
                    ) : (
                      <p style={{fontSize:'13px',color:'rgba(255,255,255,0.75)'}}>
                        {arena.min > copas ? `Faltan ${(arena.min-copas).toLocaleString()} copas` : '✓ Arena superada'}
                      </p>
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

                {/* Hint ver todas */}
                <div style={{position:'absolute',bottom:'14px',left:'50%',transform:'translateX(-50%)',fontSize:'10px',color:'rgba(255,255,255,0.45)',fontFamily:'monospace',letterSpacing:'1px'}}>CLICK PARA VER TODAS LAS ARENAS</div>
              </div>
            </div>

            {/* SESIÓN + TERMINAL */}
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <button className="session-btn" onClick={()=>navigate('/sesion')}
                style={{width:'100%',padding:'20px',borderRadius:'14px',background:'linear-gradient(135deg,#4f46e5,#6366f1)',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',gap:'14px',textAlign:'left',boxShadow:'0 4px 20px rgba(79,70,229,.35)'}}>
                <div style={{width:'44px',height:'44px',borderRadius:'12px',backgroundColor:'rgba(255,255,255,0.18)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px',fontWeight:800,marginBottom:'3px'}}>INICIAR SESIÓN SOC</div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.6)',fontFamily:'monospace'}}>{arenaActual.name} · {arenaActual.tier==='bronce'?'20':arenaActual.tier==='plata'?'15':arenaActual.tier==='oro'?'10':'7'} min</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <div style={{flex:1,borderRadius:'14px',overflow:'hidden',border:'1px solid #e2e8f0',backgroundColor:'#fff',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
                <div style={{backgroundColor:'#f8fafc',padding:'8px 14px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:'5px'}}>
                  {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{width:'9px',height:'9px',borderRadius:'50%',backgroundColor:c}}/>)}
                  <span style={{color:'#94a3b8',fontSize:'10px',fontFamily:'monospace',marginLeft:'8px'}}>soc-terminal</span>
                </div>
                <div style={{backgroundColor:'#0f172a',padding:'14px 16px',fontFamily:"'Fira Code',monospace",fontSize:'11px',lineHeight:2.0,minHeight:'170px'}}>
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
              {label:'COPAS',   value:copas.toLocaleString(), sub:arenaActual.name,    color:tierColors[arenaActual.tier]||'#d97706', light:arenaActual.colorLight, onClick:()=>navigate('/arenas')},
              {label:'XP TOTAL',value:xp.toLocaleString(),   sub:`${Math.round(pctXP)}% al siguiente`, color:'#4f46e5', light:'#eef2ff', onClick:()=>navigate('/perfil')},
              {label:'SESIONES',value:sesiones.toString(),   sub:'completadas',        color:'#059669', light:'#ecfdf5', onClick:null},
              {label:'TIER',    value:`T${tier}`,             sub:TIERS[tier],          color:tierColor,  light:'#f8fafc',  onClick:()=>navigate('/perfil')},
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
                {s.onClick&&<div style={{display:'flex',alignItems:'center',gap:'4px',marginTop:'8px',color:ACC,fontSize:'11px',fontWeight:600}}><span>Ver más</span><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></div>}
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
              <span style={{fontSize:'11px',color:'#94a3b8',fontFamily:'monospace'}}>{xp.toLocaleString()} / {xpMax===99999?'∞':xpMax.toLocaleString()} XP{tier<8&&<span style={{color:'#cbd5e1'}}> · {(xpMax-xp).toLocaleString()} restantes</span>}</span>
            </div>
            <div style={{height:'8px',borderRadius:'4px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
              <div className="skill-bar-fill" style={{width:`${pctXP}%`,height:'100%',borderRadius:'4px',background:`linear-gradient(90deg,${tierColor}80,${tierColor})`}}/>
            </div>
          </div>

          {/* FILA 3: SKILLS + ACCESOS + HISTORIAL */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>

            {/* SKILLS */}
            <div style={{padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:'16px',fontFamily:'monospace'}}>HABILIDADES</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {SKILLS.map((s,i)=>{
                  const val = skills?.[s.key]||0;
                  const pct = Math.min((val/10)*100,100);
                  return (
                    <div key={i}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                        <span style={{fontSize:'11px',color:'#475569',fontWeight:500}}>{s.label}</span>
                        <span style={{fontSize:'10px',color:'#94a3b8',fontFamily:'monospace'}}>{val}/10</span>
                      </div>
                      <div style={{height:'5px',borderRadius:'3px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                        <div className="skill-bar-fill" style={{width:`${pct}%`,height:'100%',borderRadius:'3px',background:`linear-gradient(90deg,${ACC}80,${ACC})`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACCESOS RÁPIDOS */}
            <div style={{padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:'16px',fontFamily:'monospace'}}>ACCESOS RÁPIDOS</p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {[
                  {label:'Training SOC',    desc:'12 módulos · 3 cursos',   path:'/training',     color:'#7c3aed',light:'#f5f3ff'},
                  {label:'Ranking Global',  desc:'Tu posición actual',       path:'/ranking',      color:'#d97706',light:'#fffbeb'},
                  {label:'Arenas',          desc:'Ver todas las divisiones', path:'/arenas',       color:'#0891b2',light:'#ecfeff'},
                  {label:'Mi Certificado',  desc:'QR verificable',           path:'/certificado',  color:'#059669',light:'#ecfdf5'},
                  {label:'Perfil & Tiers',  desc:'Stats y progresión',       path:'/perfil',       color:'#2563eb',light:'#eff6ff'},
                ].map((item,i)=>(
                  <div key={i} className="quick-btn" onClick={()=>navigate(item.path)}
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 13px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0',cursor:'pointer'}}>
                    <div style={{width:'30px',height:'30px',borderRadius:'8px',backgroundColor:item.light,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${item.color}18`}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:item.color}}/>
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontSize:'12px',color:'#0f172a',fontWeight:600}}>{item.label}</span>
                      <span style={{fontSize:'10px',color:'#94a3b8',marginLeft:'6px'}}>{item.desc}</span>
                    </div>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}
              </div>
            </div>

            {/* HISTORIAL */}
            <div style={{padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>ÚLTIMAS SESIONES</p>
                <button onClick={()=>navigate('/sesion')} style={{fontSize:'10px',color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Nueva →</button>
              </div>
              {historial.length === 0 ? (
                <div style={{textAlign:'center',padding:'20px 0'}}>
                  <div style={{fontSize:'28px',marginBottom:'8px'}}>🎯</div>
                  <p style={{fontSize:'12px',color:'#94a3b8'}}>Sin sesiones aún</p>
                  <button onClick={()=>navigate('/sesion')} style={{marginTop:'10px',padding:'8px 16px',borderRadius:'8px',backgroundColor:ACC,border:'none',color:'#fff',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Empezar</button>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                  {historial.slice(0,5).map((s,i)=>{
                    const res = s.resultado;
                    const copasGan = res?.copas_ganadas || 0;
                    const media    = res?.media_puntuacion || 0;
                    const positive = copasGan >= 0;
                    return (
                      <div key={i} className="hist-row" style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 11px',borderRadius:'9px',backgroundColor:'#f8fafc',border:'1px solid #f1f5f9'}}>
                        <div style={{width:'28px',height:'28px',borderRadius:'7px',backgroundColor:positive?'#ecfdf5':'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{fontSize:'13px'}}>{positive?'⬆':'⬇'}</span>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:'11px',color:'#0f172a',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.titulo||'Sesión SOC'}</p>
                          <p style={{fontSize:'10px',color:'#94a3b8',fontFamily:'monospace'}}>{media}/20 pts</p>
                        </div>
                        <span style={{fontSize:'12px',fontWeight:700,color:positive?'#059669':'#ef4444',fontFamily:'monospace',flexShrink:0}}>{positive?'+':''}{copasGan}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
