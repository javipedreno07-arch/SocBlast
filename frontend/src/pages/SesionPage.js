import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API  = 'https://socblast-production.up.railway.app';
const ACC  = '#4f46e5';
const BG   = '#f8fafc';
const CARD = '#ffffff';
const BD   = '#e2e8f0';
const T1   = '#0f172a';
const T2   = '#374151';
const T3   = '#64748b';
const T4   = '#94a3b8';

const SEV    = { CRITICA:'#ef4444', ALTA:'#f97316', MEDIA:'#f59e0b', BAJA:'#3b82f6' };
const SEV_BG = { CRITICA:'rgba(239,68,68,0.08)', ALTA:'rgba(249,115,22,0.08)', MEDIA:'rgba(245,158,11,0.08)', BAJA:'rgba(59,130,246,0.08)' };

const ACCIONES = [
  { id:'aislar',      label:'Aislar host de la red',      icon:'🔌', desc:'Corta conectividad' },
  { id:'bloquear',    label:'Bloquear IP en firewall',    icon:'🛡️', desc:'Regla de denegación' },
  { id:'resetear',    label:'Resetear credenciales',      icon:'🔑', desc:'Invalida tokens y passwords' },
  { id:'escalar',     label:'Escalar a Tier 2',           icon:'📡', desc:'Alerta a analista senior' },
  { id:'forense',     label:'Preservar evidencias',       icon:'🔬', desc:'Snapshot y cadena de custodia' },
  { id:'notificar',   label:'Notificar al CISO',          icon:'📢', desc:'Comunicación ejecutiva' },
  { id:'playbook',    label:'Activar playbook IR',        icon:'📋', desc:'Protocolo de respuesta formal' },
  { id:'monitorizar', label:'Monitorizar sin intervenir', icon:'👁️', desc:'Observar sin alertar al atacante' },
];

const DIAG_POOL = [
  'Brute Force / Password Spray','Phishing con payload','Ransomware activo',
  'Movimiento lateral interno','Exfiltración de datos','Insider Threat',
  'Falso positivo — actividad legítima','DNS Tunneling / C2',
  'Escalada de privilegios','Supply Chain Attack',
];

const TIPS = {
  triaje: [
    '💡 Fíjate en la hora de los eventos — los ataques nocturnos son más frecuentes.',
    '💡 Una IP externa atacando un Domain Controller es siempre CRÍTICO.',
    '💡 Múltiples alertas del mismo origen en segundos = ataque automatizado.',
    '💡 El sistema afectado importa más que el tipo de alerta.',
    '💡 Un DC comprometido equivale a toda la empresa comprometida.',
  ],
  logs: [
    '💡 PowerShell lanzado por un proceso padre inusual es siempre sospechoso.',
    '💡 El puerto 4444 es el favorito de Metasploit para reverse shells.',
    '💡 Busca patrones de tiempo — los ataques dejan huellas en secuencia.',
    '💡 Los logs de DNS revelan comunicaciones C2 ocultas en consultas.',
    '💡 Un proceso creando otro proceso es la firma del malware en cadena.',
  ],
  diagnostico: [
    '💡 MITRE ATT&CK T1110 = Brute Force. T1059 = Command & Scripting.',
    '💡 Correlaciona: muchos logins fallidos + 1 exitoso = credenciales comprometidas.',
    '💡 DNS Tunneling tiene subdominios muy largos codificados en Base64.',
    '💡 Movimiento lateral = mismo usuario en múltiples hosts en poco tiempo.',
    '💡 El diagnóstico correcto suma 5 puntos. Vale la pena pensar bien.',
  ],
  acciones: [
    '💡 Aislar primero, investigar después — contén el daño antes que nada.',
    '💡 Preservar evidencias ANTES de resetear — no pierdas el contexto forense.',
    '💡 El orden de acciones puede hacer la diferencia en la puntuación.',
    '💡 En un DC comprometido: aislar + notificar CISO + escalar a Tier 2.',
    '💡 Monitorizar sin intervenir es válido si necesitas más contexto.',
  ],
  justificacion: [
    '💡 Menciona el tipo de ataque, el vector de entrada y las evidencias.',
    '💡 Cuanto más técnica y específica sea tu justificación, mayor puntuación.',
    '💡 La justificación tiene el mayor peso — 4 puntos de los 12 de calidad.',
    '💡 Menciona los IOCs concretos: IPs, procesos, puertos que observaste.',
    '💡 Un buen analista explica el "por qué" de cada decisión que tomó.',
  ],
};

const SKILL_LABELS = {
  analisis_logs:'Análisis de Logs', deteccion_amenazas:'Detección de Amenazas',
  respuesta_incidentes:'Respuesta a Incidentes', threat_hunting:'Threat Hunting',
  forense_digital:'Forense Digital', gestion_vulnerabilidades:'Gestión de Vulnerabilidades',
  inteligencia_amenazas:'Inteligencia de Amenazas',
};

// ── PARTÍCULAS FONDO CLARO ────────────────────────────────────────────────────
const ParticlesBg = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const pts = Array.from({length:38},()=>({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      r:Math.random()*1.6+.6, o:Math.random()*.12+.03
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      pts.forEach(n=>{
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0||n.x>w) n.vx*=-1;
        if(n.y<0||n.y>h) n.vy*=-1;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(79,70,229,${n.o})`; ctx.fill();
      });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<140){
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(79,70,229,${(1-d/140)*.04})`;
          ctx.lineWidth=.4; ctx.stroke();
        }
      }));
      raf=requestAnimationFrame(draw);
    };
    draw();
    const resize=()=>{ w=c.width=window.innerWidth; h=c.height=window.innerHeight; };
    window.addEventListener('resize',resize);
    return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  },[]);
  return <canvas ref={ref} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}/>;
};

// ── LOGO SPINNER ──────────────────────────────────────────────────────────────
const LogoSpinner = ({ text, subtext, countdown }) => (
  <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", position:'relative' }}>
    <ParticlesBg/>
    <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
      <img src="/logosoc.png" alt="Cargando" style={{ width:'64px', height:'64px', animation:'spinLogo 1s linear infinite', marginBottom:'24px' }}/>
      <p style={{ color:ACC, fontSize:'15px', fontWeight:700, letterSpacing:'2px', marginBottom:'8px', fontFamily:'monospace' }}>{text}</p>
      <p style={{ color:T3, fontSize:'13px', marginBottom:countdown?'16px':0 }}>{subtext}</p>
      {countdown!==undefined && countdown>0 && (
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 16px', borderRadius:'20px', backgroundColor:CARD, border:`1px solid ${BD}`, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor:'#22c55e', animation:'pulse 1s infinite' }}/>
          <span style={{ fontSize:'12px', color:T2, fontFamily:'monospace', fontWeight:600 }}>~{countdown}s restantes</span>
        </div>
      )}
    </div>
  </div>
);

// ── CUENTA ATRÁS ──────────────────────────────────────────────────────────────
const CuentaAtras = ({ onFin }) => {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (n<=0) { onFin(); return; }
    const t = setTimeout(()=>setN(n-1), 900);
    return ()=>clearTimeout(t);
  }, [n]);
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", position:'relative' }}>
      <ParticlesBg/>
      <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ fontSize:'120px', fontWeight:900, color:n===0?'#22c55e':n===1?'#ef4444':n===2?'#f59e0b':ACC, letterSpacing:'-8px', lineHeight:1, animation:'cuentaAtras .4s ease' }}>
          {n===0?'¡YA!':n}
        </div>
        <p style={{ color:T3, fontSize:'13px', fontFamily:'monospace', marginTop:'20px', letterSpacing:'3px' }}>
          {n===3?'PREPÁRATE':n===2?'ENFÓCATE':n===1?'ATENCIÓN':'SESIÓN INICIADA'}
        </p>
      </div>
    </div>
  );
};

// ── TIMER ─────────────────────────────────────────────────────────────────────
const Timer = ({ segundos, limite }) => {
  const pct=Math.max(0,segundos/limite), critico=segundos<60, warning=segundos<180;
  const color=critico?'#ef4444':warning?'#f59e0b':'#22c55e';
  const min=Math.floor(segundos/60), sec=segundos%60;
  return (
    <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'8px', padding:'6px 14px', borderRadius:'10px', backgroundColor:critico?'rgba(239,68,68,0.06)':CARD, border:`1px solid ${critico?'rgba(239,68,68,0.35)':BD}`, animation:critico?'timerPulse .8s infinite':'none', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ position:'absolute', bottom:0, left:0, height:'2px', borderRadius:'0 0 10px 10px', width:`${pct*100}%`, backgroundColor:color, transition:'width 1s linear' }}/>
      <span style={{ fontFamily:'monospace', fontSize:'15px', fontWeight:800, color, letterSpacing:'2px', minWidth:'50px' }}>
        {min}:{sec.toString().padStart(2,'0')}
      </span>
    </div>
  );
};

// ── MODAL SALIR ───────────────────────────────────────────────────────────────
const ModalSalir = ({ onConfirm, onCancel }) => (
  <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(15,23,42,0.45)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", backdropFilter:'blur(4px)' }}>
    <div style={{ maxWidth:'400px', width:'90%', padding:'36px', borderRadius:'20px', backgroundColor:CARD, border:`1px solid ${BD}`, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', textAlign:'center' }}>
      <div style={{ width:'52px', height:'52px', borderRadius:'14px', backgroundColor:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', fontSize:'24px' }}>⚠️</div>
      <h2 style={{ fontSize:'20px', fontWeight:800, color:T1, marginBottom:'10px', letterSpacing:'-0.3px' }}>¿Abandonar la sesión?</h2>
      <p style={{ fontSize:'14px', color:T3, lineHeight:1.7, marginBottom:'28px' }}>
        Si sales ahora <strong style={{ color:'#ef4444' }}>perderás 10 copas</strong> por abandonar la misión en curso.
      </p>
      <div style={{ display:'flex', gap:'12px' }}>
        <button onClick={onCancel} style={{ flex:1, padding:'13px', borderRadius:'10px', backgroundColor:BG, border:`1px solid ${BD}`, color:T2, fontSize:'14px', fontWeight:600, cursor:'pointer' }}>Continuar sesión</button>
        <button onClick={onConfirm} style={{ flex:1, padding:'13px', borderRadius:'10px', backgroundColor:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.25)', color:'#dc2626', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>Sí, salir (-10 🏆)</button>
      </div>
    </div>
  </div>
);

export default function SesionPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [fase, setFase]             = useState('intro');
  const [contando, setContando]     = useState(false);
  const [sesion, setSesion]         = useState(null);
  const [userData, setUserData]     = useState(null);
  const [incIdx, setIncIdx]         = useState(0);
  const [etapa, setEtapa]           = useState('triaje');
  const [mostrarModalSalir, setMostrarModalSalir] = useState(false);
  const [cargandoCountdown, setCargandoCountdown] = useState(40);

  const [triaje,     setTriaje]     = useState({});
  const [logsEleg,   setLogsEleg]   = useState([]);
  const [diagEleg,   setDiagEleg]   = useState(null);
  const [accionesEl, setAccionesEl] = useState([]);
  const [justif,     setJustif]     = useState('');
  const [pistas,     setPistas]     = useState(0);
  const [pista,      setPista]      = useState(false);

  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [tiempoUsado,    setTiempoUsado]    = useState(0);
  const [evaluacion,     setEvaluacion]     = useState(null);
  const [resultado,      setResultado]      = useState(null);
  const [tipActual,      setTipActual]      = useState('');
  const [skillsMejoradas, setSkillsMejoradas] = useState({});

  const opcionesDiagRef = useRef([]);
  const timerRef        = useRef(null);
  const inicioRef       = useRef(null);
  const countdownRef    = useRef(null);
  const cancelRef       = useRef(false);

  const TIEMPOS = { Bronce:1200, Plata:900, Oro:600, Diamante:420 };
  const arena     = userData?.arena||'Bronce 3';
  const tierArena = arena.includes('Diamante')?'Diamante':arena.includes('Oro')?'Oro':arena.includes('Plata')?'Plata':'Bronce';
  const ARENA_COLOR = { Bronce:'#d97706', Plata:'#64748b', Oro:'#f59e0b', Diamante:'#3b82f6' };
  const ac = ARENA_COLOR[tierArena]||ACC;
  const limiteSegundos = TIEMPOS[tierArena]||1200;

  useEffect(()=>{
    axios.get(`${API}/api/me`,{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>setUserData(r.data)).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(fase!=='activa') return;
    inicioRef.current = Date.now();
    timerRef.current  = setInterval(()=>{
      const elapsed = Math.floor((Date.now()-inicioRef.current)/1000);
      const rest    = limiteSegundos-elapsed;
      setTiempoRestante(rest); setTiempoUsado(elapsed);
      if(rest<=0){ clearInterval(timerRef.current); enviar(true); }
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[fase]);

  useEffect(()=>{
    const pool=TIPS[etapa]||[];
    if(pool.length) setTipActual(pool[Math.floor(Math.random()*pool.length)]);
  },[etapa,incIdx]);

  const incidente = sesion?.incidentes?.[incIdx];

  useEffect(()=>{
    if(!incidente) return;
    const correcto = incidente.solucion_correcta?.tipo_ataque||'Ataque desconocido';
    const falsos   = DIAG_POOL.filter(d=>d!==correcto).sort(()=>Math.random()-.5).slice(0,3);
    opcionesDiagRef.current = [...falsos,correcto].sort(()=>Math.random()-.5);
  },[incIdx,sesion]);

  const fmt = s=>`${Math.floor(Math.abs(s)/60)}:${(Math.abs(s)%60).toString().padStart(2,'0')}`;
  const resetEtapas = ()=>{ setEtapa('triaje'); setTriaje({}); setLogsEleg([]); setDiagEleg(null); setAccionesEl([]); setJustif(''); setPistas(0); setPista(false); };

  const iniciarCountdown = ()=>{
    setCargandoCountdown(40);
    countdownRef.current = setInterval(()=>{
      setCargandoCountdown(p=>{ if(p<=1){clearInterval(countdownRef.current);return 0;} return p-1; });
    },1000);
  };
  const pararCountdown = ()=>{ if(countdownRef.current) clearInterval(countdownRef.current); };

  const generar = async ()=>{
    cancelRef.current=false; setFase('cargando'); iniciarCountdown();
    try {
      const r = await axios.post(`${API}/api/sesiones/generar`,{},{headers:{Authorization:`Bearer ${token}`}});
      pararCountdown();
      if(cancelRef.current) return;
      setSesion(r.data); setTiempoRestante(TIEMPOS[tierArena]||1200); setFase('briefing');
    } catch { pararCountdown(); if(!cancelRef.current) alert('Error generando sesión'); setFase('intro'); }
  };

  const cancelarCarga = ()=>{ cancelRef.current=true; pararCountdown(); setFase('intro'); };

  const intentarSalir = ()=>{
    if(fase==='activa'||fase==='feedback') setMostrarModalSalir(true);
    else navigate('/dashboard');
  };

  const confirmarSalir = async ()=>{
    setMostrarModalSalir(false); clearInterval(timerRef.current);
    try { await axios.put(`${API}/api/me/copas`,null,{params:{copas_delta:-10},headers:{Authorization:`Bearer ${token}`}}); } catch {}
    navigate('/dashboard');
  };

  const iniciarConCuentaAtras = ()=>setContando(true);

  const enviar = async (timeout=false)=>{
    setFase('evaluando'); clearInterval(timerRef.current);
    const txt=`TRIAJE:${JSON.stringify(triaje)}|LOGS:${logsEleg.join(',')}|DIAG:${diagEleg}|ACCIONES:${accionesEl.join(',')}|JUST:${justif||'Sin justificación'}`;
    try {
      const r = await axios.post(`${API}/api/sesiones/${sesion._id}/responder`,null,
        {params:{incidente_id:incIdx+1,respuesta:txt,tiempo_usado:tiempoUsado,pistas_usadas:pistas},headers:{Authorization:`Bearer ${token}`}});
      setEvaluacion(r.data);
      const filtradas = Object.fromEntries(Object.entries(r.data.skills_mejoradas||{}).filter(([,v])=>v>0));
      setSkillsMejoradas(filtradas); setFase('feedback');
    } catch { setFase('activa'); }
  };

  const siguiente = ()=>{
    if(incIdx+1<sesion.incidentes.length){ setIncIdx(i=>i+1); setEvaluacion(null); resetEtapas(); setSkillsMejoradas({}); inicioRef.current=Date.now(); setFase('activa'); }
    else finalizar();
  };

  const finalizar = async ()=>{
    try { const r=await axios.post(`${API}/api/sesiones/${sesion._id}/finalizar`,{},{headers:{Authorization:`Bearer ${token}`}}); setResultado(r.data); setFase('finalizada'); }
    catch { alert('Error finalizando'); }
  };

  const toggleLog    = i  => setLogsEleg(p=>p.includes(i)?p.filter(x=>x!==i):p.length<4?[...p,i]:p);
  const toggleAccion = id => setAccionesEl(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const ETAPAS   = ['triaje','logs','diagnostico','acciones','justificacion'];
  const etapaIdx = ETAPAS.indexOf(etapa);
  const triajeCompleto = Object.keys(triaje).length>=(incidente?.alertas?.length||0);

  const css = `
    @keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes cuentaAtras{0%{transform:scale(1.4);opacity:0;}100%{transform:scale(1);opacity:1;}}
    @keyframes timerPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.3);}50%{box-shadow:0 0 0 8px rgba(239,68,68,0);}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px ${ACC}25;}50%{box-shadow:0 0 48px ${ACC}45;}}
    @keyframes skillUp{0%{opacity:0;transform:translateX(-8px);}100%{opacity:1;transform:translateX(0);}}
    .fade-up{animation:fadeUp .35s ease forwards;}
    .glow-btn{animation:glow 3s ease-in-out infinite;}
    .glow-btn:hover{filter:brightness(1.08);transform:translateY(-2px)!important;}
    .accion-btn:hover{border-color:${ACC}55!important;background:${ACC}06!important;}
    .diag-opt:hover{border-color:${ACC}50!important;background:${ACC}04!important;}
    .log-card:hover{border-color:${ACC}40!important;box-shadow:0 4px 16px ${ACC}10!important;}
    *{box-sizing:border-box;transition:border-color .15s,background .15s,transform .15s,box-shadow .15s;}
    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-track{background:#f1f5f9;}
    ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
    textarea:focus{outline:none;}
  `;

  // Navbar reutilizable
  const Navbar = ({ center, hideBack }) => (
    <nav style={{ height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 36px', backgroundColor:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${BD}`, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', fontFamily:"'Inter',sans-serif", flexShrink:0, position:'relative', zIndex:10 }}>
      <img src="/logosoc.png" style={{ height:'28px', cursor:'pointer' }} onClick={hideBack?undefined:intentarSalir}/>
      {center && <span style={{ fontSize:'13px', color:T3, fontWeight:500 }}>{center}</span>}
      {!hideBack
        ? <button onClick={intentarSalir} style={{ background:'none', border:`1px solid ${BD}`, color:T3, padding:'6px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer', fontWeight:500 }}>
            {(fase==='activa'||fase==='feedback')?'⚠ Salir':'← Dashboard'}
          </button>
        : <span/>
      }
    </nav>
  );

  // ── CUENTA ATRÁS ──────────────────────────────────────────────────────────
  if (contando) return (
    <><style>{css}</style>
      <CuentaAtras onFin={()=>{ setContando(false); resetEtapas(); setFase('activa'); }}/>
    </>
  );

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (fase==='intro') return (
    <><style>{css}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', fontFamily:"'Inter',sans-serif", position:'relative' }}>
        <ParticlesBg/>
        <div style={{ position:'relative', zIndex:1 }}>
          <Navbar hideBack/>
          <div style={{ maxWidth:'680px', margin:'0 auto', padding:'44px 28px' }}>
            <div className="fade-up">
              <div style={{ textAlign:'center', marginBottom:'36px' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 16px', borderRadius:'100px', border:`1.5px solid ${ac}25`, backgroundColor:`${ac}06`, marginBottom:'22px' }}>
                  <div style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:ac, animation:'pulse 2s infinite' }}/>
                  <span style={{ fontSize:'11px', color:ac, fontWeight:700, letterSpacing:'2px', fontFamily:'monospace' }}>{arena.toUpperCase()} · SOC PLATFORM</span>
                </div>
                <h1 style={{ fontSize:'48px', fontWeight:900, letterSpacing:'-2.5px', color:T1, marginBottom:'12px', lineHeight:0.95 }}>Sesión<br/><span style={{ color:ACC }}>SOC</span></h1>
                <p style={{ fontSize:'15px', color:T3, lineHeight:1.75, maxWidth:'460px', margin:'0 auto' }}>
                  La IA genera un escenario real de amenaza. Investiga, diagnostica y responde como analista profesional.
                </p>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px' }}>
                {[
                  {label:'Arena',      value:arena,   color:ac},
                  {label:'Tiempo',     value:{Bronce:'20 min',Plata:'15 min',Oro:'10 min',Diamante:'7 min'}[tierArena]||'20 min', color:'#22c55e'},
                  {label:'Incidentes', value:{Bronce:'3',Plata:'3',Oro:'4',Diamante:'5'}[tierArena]||'3', color:T1},
                  {label:'XP máx',     value:{Bronce:'50',Plata:'100',Oro:'200',Diamante:'400'}[tierArena]||'50', color:ACC},
                ].map((c,i)=>(
                  <div key={i} style={{ padding:'18px 12px', borderRadius:'14px', backgroundColor:CARD, border:`1px solid ${BD}`, textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize:'17px', fontWeight:800, color:c.color, marginBottom:'5px' }}>{c.value}</div>
                    <div style={{ fontSize:'11px', color:T4, fontFamily:'monospace' }}>{c.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding:'22px 24px', borderRadius:'16px', backgroundColor:'rgba(255,255,255,0.85)', border:`1px solid ${BD}`, marginBottom:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', backdropFilter:'blur(8px)' }}>
                <p style={{ fontSize:'10px', color:T4, fontWeight:700, letterSpacing:'2px', marginBottom:'16px', fontFamily:'monospace' }}>MECÁNICA — CADA INCIDENTE</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
                  {[
                    {n:'01',t:'Triaje',        d:'Clasifica la severidad de cada alerta',              c:'#ef4444'},
                    {n:'02',t:'Logs',          d:'Selecciona los registros más relevantes (máx 4)',    c:'#f97316'},
                    {n:'03',t:'Diagnóstico',   d:'Identifica el tipo de amenaza entre 4 opciones',    c:'#f59e0b'},
                    {n:'04',t:'Respuesta',     d:'Elige acciones — el orden importa en la evaluación', c:'#22c55e'},
                    {n:'05',t:'Justificación', d:'Tu razonamiento tiene el mayor peso en puntuación', c:ACC},
                  ].map((m,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'13px', padding:'11px 14px', borderRadius:'10px', backgroundColor:BG, border:`1px solid ${BD}` }}>
                      <div style={{ width:'32px', height:'32px', borderRadius:'8px', backgroundColor:`${m.c}10`, border:`1px solid ${m.c}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontSize:'11px', fontWeight:900, color:m.c, fontFamily:'monospace' }}>{m.n}</span>
                      </div>
                      <div>
                        <p style={{ fontSize:'13px', fontWeight:700, color:T1, marginBottom:'1px' }}>{m.t}</p>
                        <p style={{ fontSize:'12px', color:T3 }}>{m.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="glow-btn" onClick={generar}
                style={{ width:'100%', padding:'20px', borderRadius:'14px', background:`linear-gradient(135deg,${ACC},#818cf8)`, border:'none', color:'#fff', fontSize:'16px', fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Generar y comenzar sesión SOC
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── CARGANDO ──────────────────────────────────────────────────────────────
  if (fase==='cargando') return (
    <><style>{css}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', display:'flex', flexDirection:'column', fontFamily:"'Inter',sans-serif", position:'relative' }}>
        <ParticlesBg/>
        <nav style={{ position:'relative', zIndex:10, height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 36px', backgroundColor:'rgba(255,255,255,0.92)', borderBottom:`1px solid ${BD}`, backdropFilter:'blur(20px)' }}>
          <img src="/logosoc.png" style={{ height:'28px' }}/>
          <button onClick={cancelarCarga} style={{ background:'none', border:`1px solid ${BD}`, color:T3, padding:'6px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>✕ Cancelar generación</button>
        </nav>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center' }}>
            <img src="/logosoc.png" alt="Cargando" style={{ width:'64px', height:'64px', animation:'spinLogo 1s linear infinite', marginBottom:'24px' }}/>
            <p style={{ color:ACC, fontSize:'15px', fontWeight:700, letterSpacing:'2px', marginBottom:'8px', fontFamily:'monospace' }}>GENERANDO ESCENARIO SOC...</p>
            <p style={{ color:T3, fontSize:'13px', marginBottom:'20px' }}>La IA construye amenazas para {arena}</p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 18px', borderRadius:'20px', backgroundColor:CARD, border:`1px solid ${BD}`, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor:'#22c55e', animation:'pulse 1s infinite' }}/>
              <span style={{ fontSize:'13px', color:T2, fontFamily:'monospace', fontWeight:600 }}>~{cargandoCountdown}s restantes</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── BRIEFING ──────────────────────────────────────────────────────────────
  if (fase==='briefing') return (
    <><style>{css}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', fontFamily:"'Inter',sans-serif", display:'flex', flexDirection:'column', position:'relative' }}>
        <ParticlesBg/>
        <nav style={{ position:'relative', zIndex:10, height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 36px', backgroundColor:'rgba(255,255,255,0.92)', borderBottom:`1px solid ${BD}`, backdropFilter:'blur(20px)', boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
          <img src="/logosoc.png" style={{ height:'28px' }}/>
          <button onClick={()=>setFase('intro')} style={{ background:'none', border:`1px solid ${BD}`, color:T3, padding:'6px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>✕ Cancelar</button>
        </nav>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 24px', position:'relative', zIndex:1 }}>
          <div className="fade-up" style={{ maxWidth:'600px', width:'100%' }}>
            <div style={{ padding:'40px', borderRadius:'22px', backgroundColor:'rgba(255,255,255,0.95)', border:`1px solid ${BD}`, boxShadow:'0 12px 48px rgba(0,0,0,0.08)', position:'relative', overflow:'hidden', backdropFilter:'blur(8px)' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg,transparent,${ACC},transparent)` }}/>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'22px' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#ef4444', animation:'pulse 1s infinite' }}/>
                <span style={{ color:T4, fontSize:'10px', letterSpacing:'2.5px', fontWeight:700, fontFamily:'monospace' }}>MISIÓN ASIGNADA</span>
              </div>
              <h1 style={{ fontSize:'24px', fontWeight:900, color:T1, marginBottom:'20px', letterSpacing:'-0.5px', lineHeight:1.3 }}>{sesion?.titulo}</h1>
              <div style={{ padding:'16px 18px', borderRadius:'12px', backgroundColor:'#f0fdf4', border:'1px solid #bbf7d0', marginBottom:'22px' }}>
                <p style={{ fontSize:'11px', color:'#16a34a', fontWeight:700, marginBottom:'7px', letterSpacing:'1.5px', fontFamily:'monospace' }}>CONTEXTO:</p>
                <p style={{ fontSize:'14px', color:'#15803d', lineHeight:1.8 }}>{sesion?.contexto}</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'26px' }}>
                {[{label:'Incidentes',value:sesion?.incidentes?.length},{label:'Arena',value:sesion?.arena},{label:'Tiempo',value:fmt(tiempoRestante)}].map((s,i)=>(
                  <div key={i} style={{ padding:'16px', borderRadius:'12px', backgroundColor:BG, border:`1px solid ${BD}`, textAlign:'center' }}>
                    <div style={{ fontSize:'20px', fontWeight:900, color:T1, marginBottom:'4px' }}>{s.value}</div>
                    <div style={{ fontSize:'11px', color:T4, fontFamily:'monospace' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={iniciarConCuentaAtras}
                style={{ width:'100%', padding:'17px', borderRadius:'12px', background:`linear-gradient(135deg,${ACC},#818cf8)`, border:'none', color:'#fff', fontSize:'16px', fontWeight:800, cursor:'pointer', boxShadow:`0 4px 24px ${ACC}25`, display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                INICIAR SESIÓN SOC
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── EVALUANDO ─────────────────────────────────────────────────────────────
  if (fase==='evaluando') return (
    <><style>{css}</style>
      <LogoSpinner text="EVALUANDO RESPUESTA..." subtext="Analizando decisiones · Calculando puntuación"/>
    </>
  );

  // ── FEEDBACK ──────────────────────────────────────────────────────────────
  if (fase==='feedback' && evaluacion) {
    const sc = evaluacion.total>=14?'#22c55e':evaluacion.total>=8?'#f59e0b':'#ef4444';
    return (
      <><style>{css}</style>
        {mostrarModalSalir && <ModalSalir onConfirm={confirmarSalir} onCancel={()=>setMostrarModalSalir(false)}/>}
        <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', fontFamily:"'Inter',sans-serif", position:'relative' }}>
          <ParticlesBg/>
          <div style={{ position:'relative', zIndex:1 }}>
            <Navbar center={`Incidente ${incIdx+1} de ${sesion?.incidentes?.length}`}/>
            <div style={{ maxWidth:'740px', margin:'0 auto', padding:'36px 28px' }}>
              <div className="fade-up">
                <div style={{ padding:'36px', borderRadius:'22px', backgroundColor:CARD, border:`1.5px solid ${sc}20`, boxShadow:'0 8px 40px rgba(0,0,0,0.07)', marginBottom:'16px', position:'relative', overflow:'hidden' }}>
                  <div style={{ height:'3px', background:`linear-gradient(90deg,${sc},${sc}50)`, borderRadius:'4px', marginBottom:'28px' }}/>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'26px' }}>
                    <div>
                      <h2 style={{ fontSize:'22px', fontWeight:900, color:T1, marginBottom:'6px' }}>Resultado — Incidente {incIdx+1}</h2>
                      <p style={{ fontSize:'13px', color:T3 }}>{evaluacion.total>=14?'🟢 Análisis excelente':evaluacion.total>=8?'🟡 Buen trabajo':'🔴 Necesita mejorar'}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'54px', fontWeight:900, color:sc, letterSpacing:'-3px', lineHeight:1 }}>{evaluacion.total}</div>
                      <div style={{ fontSize:'13px', color:T4, fontFamily:'monospace' }}>/20 pts</div>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'22px' }}>
                    {[
                      {label:'Calidad análisis',value:`${evaluacion.puntuacion_calidad}/12`,color:'#22c55e'},
                      {label:'Velocidad',        value:`${evaluacion.puntuacion_velocidad}/5`,color:'#f59e0b'},
                      {label:'Sin pistas',       value:`${evaluacion.puntuacion_pistas}/3`,  color:ACC},
                    ].map((s,i)=>(
                      <div key={i} style={{ padding:'16px', borderRadius:'12px', backgroundColor:BG, border:`1px solid ${BD}`, textAlign:'center' }}>
                        <div style={{ fontSize:'22px', fontWeight:900, color:s.color, marginBottom:'5px' }}>{s.value}</div>
                        <div style={{ fontSize:'12px', color:T3 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {Object.keys(skillsMejoradas).length>0 && (
                    <div style={{ padding:'16px 18px', borderRadius:'12px', backgroundColor:'#f0fdf4', border:'1px solid #bbf7d0', marginBottom:'14px' }}>
                      <p style={{ fontSize:'11px', color:'#16a34a', fontWeight:700, letterSpacing:'1.5px', marginBottom:'12px', fontFamily:'monospace' }}>HABILIDADES MEJORADAS</p>
                      <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                        {Object.entries(skillsMejoradas).map(([key,delta],i)=>(
                          <div key={key} style={{ display:'flex', alignItems:'center', gap:'10px', animation:`skillUp .3s ease ${i*.1}s both` }}>
                            <span style={{ fontSize:'13px', color:'#166534', flex:1 }}>{SKILL_LABELS[key]||key}</span>
                            <span style={{ fontSize:'12px', fontWeight:700, color:'#22c55e', fontFamily:'monospace' }}>+{delta}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ padding:'16px 18px', borderRadius:'12px', backgroundColor:`${ACC}05`, border:`1px solid ${ACC}12`, marginBottom:'12px' }}>
                    <p style={{ fontSize:'11px', color:T4, fontWeight:700, letterSpacing:'1.5px', marginBottom:'8px', fontFamily:'monospace' }}>FEEDBACK IA</p>
                    <p style={{ fontSize:'14px', color:T1, lineHeight:1.8 }}>{evaluacion.feedback}</p>
                  </div>
                  <div style={{ padding:'16px 18px', borderRadius:'12px', backgroundColor:'#f0fdf4', border:'1px solid #bbf7d0' }}>
                    <p style={{ fontSize:'11px', color:'#16a34a', fontWeight:700, letterSpacing:'1.5px', marginBottom:'8px', fontFamily:'monospace' }}>SOLUCIÓN CORRECTA</p>
                    <p style={{ fontSize:'14px', color:'#166534', lineHeight:1.8 }}>{evaluacion.solucion_explicada}</p>
                  </div>
                </div>
                <button onClick={siguiente}
                  style={{ width:'100%', padding:'17px', borderRadius:'12px', background:`linear-gradient(135deg,${ACC},#818cf8)`, border:'none', color:'#fff', fontSize:'16px', fontWeight:800, cursor:'pointer', boxShadow:`0 4px 24px ${ACC}25` }}>
                  {incIdx+1<sesion.incidentes.length?`→ Incidente ${incIdx+2}`:'🏁 Finalizar sesión'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── FINALIZADA ────────────────────────────────────────────────────────────
  if (fase==='finalizada' && resultado) return (
    <><style>{css}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'28px', fontFamily:"'Inter',sans-serif", position:'relative' }}>
        <ParticlesBg/>
        <div className="fade-up" style={{ maxWidth:'520px', width:'100%', position:'relative', zIndex:1 }}>
          <div style={{ padding:'48px', borderRadius:'24px', backgroundColor:CARD, border:`1px solid ${BD}`, textAlign:'center', boxShadow:'0 20px 64px rgba(0,0,0,0.09)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg,${ACC},#818cf8,${ACC})` }}/>
            <div style={{ fontSize:'56px', marginBottom:'14px' }}>🏆</div>
            <h1 style={{ fontSize:'28px', fontWeight:900, color:T1, marginBottom:'6px', letterSpacing:'-1px' }}>Sesión Completada</h1>
            <p style={{ fontSize:'13px', color:T4, marginBottom:'28px', fontFamily:'monospace' }}>{sesion?.incidentes?.length} incidentes investigados</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'28px' }}>
              {[
                {label:'Copas',value:`${resultado.copas_ganadas>0?'+':''}${resultado.copas_ganadas}`,color:'#f59e0b'},
                {label:'XP',   value:`+${resultado.xp_ganada}`,  color:'#22c55e'},
                {label:'Media',value:`${resultado.media_puntuacion}/20`,color:ACC},
                {label:'Arena',value:resultado.arena,color:ac},
              ].map((s,i)=>(
                <div key={i} style={{ padding:'18px', borderRadius:'14px', backgroundColor:BG, border:`1px solid ${BD}` }}>
                  <div style={{ fontSize:'24px', fontWeight:900, color:s.color, marginBottom:'4px', letterSpacing:'-0.5px' }}>{s.value}</div>
                  <div style={{ fontSize:'12px', color:T4, fontFamily:'monospace' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={()=>navigate('/dashboard')} style={{ flex:1, padding:'14px', borderRadius:'10px', backgroundColor:BG, border:`1px solid ${BD}`, color:T2, fontSize:'14px', cursor:'pointer', fontWeight:500 }}>← Dashboard</button>
              <button onClick={()=>{ setSesion(null); setIncIdx(0); resetEtapas(); setFase('intro'); setSkillsMejoradas({}); }}
                style={{ flex:1, padding:'14px', borderRadius:'10px', background:`linear-gradient(135deg,${ACC},#818cf8)`, border:'none', color:'#fff', fontSize:'14px', fontWeight:800, cursor:'pointer' }}>
                Nueva ⚡
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── ACTIVA ────────────────────────────────────────────────────────────────
  if (fase!=='activa'||!incidente) return null;
  const diagOpts = opcionesDiagRef.current;

  return (
    <><style>{css}</style>
      {mostrarModalSalir && <ModalSalir onConfirm={confirmarSalir} onCancel={()=>setMostrarModalSalir(false)}/>}
      <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', fontFamily:"'Inter',sans-serif", color:T1, display:'flex', flexDirection:'column', position:'relative' }}>
        <ParticlesBg/>

        {/* NAVBAR */}
        <div style={{ position:'relative', zIndex:10, height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', backgroundColor:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${BD}`, flexShrink:0, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <img src="/logosoc.png" style={{ height:'24px', cursor:'pointer' }} onClick={intentarSalir}/>
            <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
              {ETAPAS.map((e,i)=>{
                const labels={triaje:'TRIAJE',logs:'LOGS',diagnostico:'DIAG',acciones:'RESP',justificacion:'JUST'};
                const done=i<etapaIdx, active=i===etapaIdx;
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <div style={{ padding:'3px 8px', borderRadius:'5px', fontSize:'9px', fontFamily:'monospace', fontWeight:700, letterSpacing:'1px', backgroundColor:done?'rgba(34,197,94,0.1)':active?`${ACC}10`:'transparent', color:done?'#16a34a':active?ACC:T4, border:`1px solid ${done?'rgba(34,197,94,0.2)':active?`${ACC}25`:'transparent'}` }}>
                      {done?'✓':''}{labels[e]}
                    </div>
                    {i<ETAPAS.length-1&&<div style={{ width:'10px', height:'1px', backgroundColor:done?'rgba(34,197,94,0.3)':BD }}/>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'10px', color:T4, fontFamily:'monospace' }}>INC</span>
            <div style={{ display:'flex', gap:'4px' }}>
              {sesion?.incidentes?.map((_,i)=>(
                <div key={i} style={{ width:'20px', height:'4px', borderRadius:'2px', backgroundColor:i<incIdx?'#22c55e':i===incIdx?ACC:BD }}/>
              ))}
            </div>
            <span style={{ fontSize:'10px', color:T4, fontFamily:'monospace' }}>{incIdx+1}/{sesion?.incidentes?.length}</span>
          </div>
          <Timer segundos={tiempoRestante} limite={limiteSegundos}/>
        </div>

        <div style={{ flex:1, maxWidth:'960px', margin:'0 auto', width:'100%', padding:'22px 28px 48px', position:'relative', zIndex:1 }}>

          {/* Descripción incidente */}
          <div style={{ padding:'14px 18px', borderRadius:'10px', backgroundColor:'rgba(255,255,255,0.85)', border:`1px solid ${ACC}15`, marginBottom:'18px', position:'relative', overflow:'hidden', backdropFilter:'blur(8px)', boxShadow:'0 2px 8px rgba(79,70,229,0.06)' }}>
            <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px', background:`linear-gradient(180deg,${ACC},transparent)` }}/>
            <p style={{ fontSize:'10px', color:ACC, marginBottom:'5px', letterSpacing:'1.5px', fontWeight:700, fontFamily:'monospace' }}>INCIDENTE ACTIVO · {incidente?.titulo}</p>
            <p style={{ fontSize:'14px', color:T1, lineHeight:1.75 }}>{incidente?.descripcion}</p>
          </div>

          {/* TIP */}
          {tipActual && (
            <div style={{ padding:'10px 16px', borderRadius:'9px', backgroundColor:'rgba(255,251,235,0.9)', border:'1px solid #fde68a', marginBottom:'16px', display:'flex', alignItems:'center', gap:'10px', backdropFilter:'blur(8px)' }}>
              <span style={{ fontSize:'13px', color:'#92400e', flex:1 }}>{tipActual}</span>
              <button onClick={()=>{ const p=TIPS[etapa]||[]; setTipActual(p[Math.floor(Math.random()*p.length)]); }} style={{ background:'none', border:'none', color:'#d97706', fontSize:'14px', cursor:'pointer', flexShrink:0 }}>↻</button>
            </div>
          )}

          {/* ── TRIAJE ── */}
          {etapa==='triaje' && (
            <div className="fade-up">
              <div style={{ marginBottom:'20px' }}>
                <h2 style={{ fontSize:'21px', fontWeight:800, color:T1, marginBottom:'5px' }}>🚨 Triaje de Alertas</h2>
                <p style={{ fontSize:'13px', color:T3 }}>Clasifica la severidad de cada alerta. Tu criterio será evaluado por la IA.</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'24px' }}>
                {incidente.alertas?.map((alerta,i)=>(
                  <div key={i} style={{ padding:'18px 20px', borderRadius:'13px', backgroundColor:'rgba(255,255,255,0.9)', border:`1px solid ${triaje[alerta.id]?SEV[triaje[alerta.id]]+'40':BD}`, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', position:'relative', overflow:'hidden', backdropFilter:'blur(8px)' }}>
                    {triaje[alerta.id]&&<div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px', backgroundColor:SEV[triaje[alerta.id]] }}/>}
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'16px' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'7px' }}>
                          <span style={{ fontSize:'10px', color:T4, fontFamily:'monospace', backgroundColor:BG, padding:'2px 8px', borderRadius:'4px', border:`1px solid ${BD}` }}>{alerta.id}</span>
                          <span style={{ fontSize:'14px', fontWeight:700, color:T1 }}>{alerta.sistema}</span>
                        </div>
                        <p style={{ fontSize:'13px', color:T2, lineHeight:1.65, marginBottom:'8px' }}>{alerta.descripcion}</p>
                        {alerta.detalles&&(
                          <div style={{ display:'flex', gap:'7px', flexWrap:'wrap' }}>
                            {Object.entries(alerta.detalles).slice(0,4).map(([k,v])=>(
                              <span key={k} style={{ fontSize:'10px', color:T3, fontFamily:'monospace', padding:'2px 7px', borderRadius:'4px', backgroundColor:BG, border:`1px solid ${BD}` }}>{k}: {v}</span>
                            ))}
                          </div>
                        )}
                        <p style={{ fontSize:'10px', color:T4, marginTop:'7px', fontFamily:'monospace' }}>{alerta.timestamp}</p>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'5px', flexShrink:0 }}>
                        {['CRITICA','ALTA','MEDIA','BAJA'].map(sev=>(
                          <button key={sev} onClick={()=>setTriaje(p=>({...p,[alerta.id]:sev}))}
                            style={{ padding:'7px 12px', borderRadius:'7px', fontSize:'10px', fontWeight:700, fontFamily:'monospace', cursor:'pointer', minWidth:'76px', backgroundColor:triaje[alerta.id]===sev?SEV_BG[sev]:BG, border:`1px solid ${triaje[alerta.id]===sev?SEV[sev]:BD}`, color:triaje[alerta.id]===sev?SEV[sev]:T3 }}>
                            {sev}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setEtapa('logs')} disabled={!triajeCompleto}
                style={{ width:'100%', padding:'15px', borderRadius:'12px', backgroundColor:triajeCompleto?ACC:T4, border:'none', color:'#fff', fontWeight:700, fontSize:'15px', cursor:triajeCompleto?'pointer':'not-allowed', opacity:triajeCompleto?1:.5, boxShadow:triajeCompleto?`0 4px 20px ${ACC}25`:'none' }}>
                Confirmar triaje → Investigar logs ({Object.keys(triaje).length}/{incidente.alertas?.length})
              </button>
            </div>
          )}

          {/* ── LOGS ── */}
          {etapa==='logs' && (
            <div className="fade-up">
              <div style={{ marginBottom:'20px' }}>
                <h2 style={{ fontSize:'21px', fontWeight:800, color:T1, marginBottom:'5px' }}>🔍 Investigación de Logs</h2>
                <p style={{ fontSize:'13px', color:T3 }}>Selecciona hasta <strong style={{ color:T1 }}>4 logs</strong> relevantes para la investigación.</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'18px' }}>
                {incidente.logs?.map((log,i)=>{
                  const sel=logsEleg.includes(i), locked=!sel&&logsEleg.length>=4;
                  const nc=log.nivel==='ERROR'?'#ef4444':log.nivel==='WARNING'?'#f97316':'#3b82f6';
                  return (
                    <div key={i} className="log-card" onClick={()=>!locked&&toggleLog(i)}
                      style={{ padding:'13px 15px', borderRadius:'11px', backgroundColor:sel?`${ACC}06`:'rgba(255,255,255,0.9)', border:`1px solid ${sel?ACC+'40':BD}`, cursor:locked?'not-allowed':'pointer', opacity:locked?.4:1, position:'relative', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', backdropFilter:'blur(8px)' }}>
                      {sel&&<div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${ACC},transparent)` }}/>}
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                        <span style={{ fontSize:'10px', fontWeight:700, fontFamily:'monospace', padding:'2px 6px', borderRadius:'4px', backgroundColor:`${nc}10`, color:nc, border:`1px solid ${nc}20` }}>{log.nivel}</span>
                        <span style={{ fontSize:'10px', color:T4, fontFamily:'monospace' }}>{log.timestamp}</span>
                      </div>
                      <p style={{ fontSize:'12px', color:sel?T1:T2, lineHeight:1.6, fontFamily:'monospace' }}>{log.mensaje}</p>
                      {sel&&<div style={{ display:'flex', alignItems:'center', gap:'4px', marginTop:'6px' }}><div style={{ width:'5px', height:'5px', borderRadius:'50%', backgroundColor:ACC }}/><span style={{ fontSize:'10px', color:ACC, fontFamily:'monospace' }}>Seleccionado</span></div>}
                    </div>
                  );
                })}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                <span style={{ fontSize:'12px', color:T4, fontFamily:'monospace' }}>{logsEleg.length}/4 seleccionados</span>
                {logsEleg.length>0&&<button onClick={()=>setLogsEleg([])} style={{ background:'none', border:'none', color:T4, fontSize:'12px', cursor:'pointer', fontFamily:'monospace' }}>Limpiar ×</button>}
              </div>
              <button onClick={()=>setEtapa('diagnostico')} disabled={logsEleg.length===0}
                style={{ width:'100%', padding:'15px', borderRadius:'12px', backgroundColor:logsEleg.length>0?ACC:T4, border:'none', color:'#fff', fontWeight:700, fontSize:'15px', cursor:logsEleg.length>0?'pointer':'not-allowed', opacity:logsEleg.length>0?1:.5, boxShadow:logsEleg.length>0?`0 4px 20px ${ACC}25`:'none' }}>
                Confirmar selección → Diagnóstico
              </button>
            </div>
          )}

          {/* ── DIAGNÓSTICO ── */}
          {etapa==='diagnostico' && (
            <div className="fade-up">
              <div style={{ marginBottom:'20px' }}>
                <h2 style={{ fontSize:'21px', fontWeight:800, color:T1, marginBottom:'5px' }}>🎯 Diagnóstico</h2>
                <p style={{ fontSize:'13px', color:T3 }}>¿Qué tipo de amenaza estás viendo? Hay señuelos entre las opciones.</p>
              </div>
              <div style={{ padding:'13px 16px', borderRadius:'10px', backgroundColor:'rgba(255,255,255,0.85)', border:`1px solid ${BD}`, marginBottom:'18px', backdropFilter:'blur(8px)' }}>
                <p style={{ fontSize:'10px', color:T4, marginBottom:'9px', letterSpacing:'1px', fontFamily:'monospace' }}>ALERTAS CLASIFICADAS:</p>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                  {Object.entries(triaje).map(([id,sev])=>(
                    <span key={id} style={{ fontSize:'11px', padding:'3px 9px', borderRadius:'6px', backgroundColor:SEV_BG[sev], color:SEV[sev], border:`1px solid ${SEV[sev]}30`, fontFamily:'monospace', fontWeight:700 }}>{id} · {sev}</span>
                  ))}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'11px', marginBottom:'18px' }}>
                {diagOpts.map((op,i)=>(
                  <button key={i} className="diag-opt" onClick={()=>setDiagEleg(op)}
                    style={{ padding:'18px 16px', borderRadius:'12px', backgroundColor:diagEleg===op?`${ACC}08`:'rgba(255,255,255,0.9)', border:`1.5px solid ${diagEleg===op?ACC:BD}`, color:diagEleg===op?T1:T2, fontSize:'14px', fontWeight:600, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'14px', boxShadow:diagEleg===op?`0 0 16px ${ACC}15`:'0 1px 4px rgba(0,0,0,0.04)', backdropFilter:'blur(8px)' }}>
                    <div style={{ width:'20px', height:'20px', borderRadius:'50%', border:`2px solid ${diagEleg===op?ACC:BD}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {diagEleg===op&&<div style={{ width:'9px', height:'9px', borderRadius:'50%', backgroundColor:ACC }}/>}
                    </div>
                    {op}
                  </button>
                ))}
              </div>
              {pista&&(
                <div style={{ padding:'12px 16px', borderRadius:'9px', backgroundColor:'rgba(255,251,235,0.9)', border:'1px solid #fde68a', marginBottom:'12px' }}>
                  <p style={{ fontSize:'13px', color:'#92400e', lineHeight:1.65 }}>💡 <strong>Pista:</strong> Busca patrones de {incidente?.solucion_correcta?.tipo_ataque?.split(' ')[0]} en las alertas de mayor severidad.</p>
                </div>
              )}
              <div style={{ display:'flex', gap:'10px' }}>
                {!pista&&(
                  <button onClick={()=>{ setPistas(p=>p+1); setPista(true); }}
                    style={{ padding:'13px 18px', borderRadius:'11px', backgroundColor:'rgba(255,251,235,0.9)', border:'1px solid #fde68a', color:'#92400e', fontSize:'13px', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
                    💡 Pista (-1pt)
                  </button>
                )}
                <button onClick={()=>setEtapa('acciones')} disabled={!diagEleg}
                  style={{ flex:1, padding:'13px', borderRadius:'11px', backgroundColor:diagEleg?ACC:T4, border:'none', color:'#fff', fontWeight:700, fontSize:'15px', cursor:diagEleg?'pointer':'not-allowed', opacity:diagEleg?1:.5, boxShadow:diagEleg?`0 4px 20px ${ACC}25`:'none' }}>
                  Confirmar → Plan de respuesta
                </button>
              </div>
            </div>
          )}

          {/* ── ACCIONES ── */}
          {etapa==='acciones' && (
            <div className="fade-up">
              <div style={{ marginBottom:'20px' }}>
                <h2 style={{ fontSize:'21px', fontWeight:800, color:T1, marginBottom:'5px' }}>⚡ Plan de Respuesta</h2>
                <p style={{ fontSize:'13px', color:T3 }}>Selecciona las acciones. El <strong style={{ color:T1 }}>número indica el orden</strong> — importa en la evaluación.</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
                {ACCIONES.map(({id,label,icon,desc})=>{
                  const sel=accionesEl.includes(id), orden=accionesEl.indexOf(id)+1;
                  return (
                    <button key={id} className="accion-btn" onClick={()=>toggleAccion(id)}
                      style={{ padding:'15px 16px', borderRadius:'12px', backgroundColor:sel?`${ACC}06`:'rgba(255,255,255,0.9)', border:`1.5px solid ${sel?ACC+'50':BD}`, color:T1, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', backdropFilter:'blur(8px)' }}>
                      <div style={{ width:'34px', height:'34px', borderRadius:'9px', backgroundColor:sel?ACC:BG, border:`1px solid ${sel?ACC:BD}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:sel?'13px':'18px', fontWeight:800, color:sel?'#fff':T2, fontFamily:'monospace' }}>
                        {sel?orden:icon}
                      </div>
                      <div>
                        <div style={{ fontSize:'13px', fontWeight:sel?700:500, color:sel?T1:T2, marginBottom:'2px' }}>{label}</div>
                        <div style={{ fontSize:'11px', color:T4 }}>{desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                <span style={{ fontSize:'12px', color:T4, fontFamily:'monospace' }}>{accionesEl.length} acciones seleccionadas</span>
                {accionesEl.length>0&&<button onClick={()=>setAccionesEl([])} style={{ background:'none', border:'none', color:T4, fontSize:'12px', cursor:'pointer', fontFamily:'monospace' }}>Limpiar ×</button>}
              </div>
              <button onClick={()=>setEtapa('justificacion')} disabled={accionesEl.length===0}
                style={{ width:'100%', padding:'15px', borderRadius:'12px', backgroundColor:accionesEl.length>0?ACC:T4, border:'none', color:'#fff', fontWeight:700, fontSize:'15px', cursor:accionesEl.length>0?'pointer':'not-allowed', opacity:accionesEl.length>0?1:.5, boxShadow:accionesEl.length>0?`0 4px 20px ${ACC}25`:'none' }}>
                Confirmar → Justificación final
              </button>
            </div>
          )}

          {/* ── JUSTIFICACIÓN ── */}
          {etapa==='justificacion' && (
            <div className="fade-up">
              <div style={{ marginBottom:'20px' }}>
                <h2 style={{ fontSize:'21px', fontWeight:800, color:T1, marginBottom:'5px' }}>📝 Justificación Final</h2>
                <p style={{ fontSize:'13px', color:T3 }}>Tu razonamiento tiene el <strong style={{ color:T1 }}>mayor peso</strong> en la puntuación.</p>
              </div>
              <div style={{ padding:'16px 18px', borderRadius:'12px', backgroundColor:'rgba(255,255,255,0.9)', border:`1px solid ${BD}`, marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', backdropFilter:'blur(8px)' }}>
                <p style={{ fontSize:'10px', color:T4, fontFamily:'monospace', marginBottom:'11px', letterSpacing:'1px' }}>TUS DECISIONES:</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  <div style={{ display:'flex', gap:'12px' }}>
                    <span style={{ fontSize:'10px', color:T4, fontFamily:'monospace', width:'90px', flexShrink:0 }}>DIAGNÓSTICO</span>
                    <span style={{ fontSize:'13px', color:ACC, fontWeight:700 }}>{diagEleg}</span>
                  </div>
                  <div style={{ display:'flex', gap:'12px' }}>
                    <span style={{ fontSize:'10px', color:T4, fontFamily:'monospace', width:'90px', flexShrink:0, paddingTop:'3px' }}>ACCIONES</span>
                    <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                      {accionesEl.map((id,i)=>{ const a=ACCIONES.find(x=>x.id===id); return <span key={id} style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'5px', backgroundColor:`${ACC}08`, color:T2, border:`1px solid ${BD}`, fontFamily:'monospace' }}>{i+1}. {a?.icon} {a?.label}</span>; })}
                    </div>
                  </div>
                </div>
              </div>
              <textarea value={justif} onChange={e=>setJustif(e.target.value)}
                placeholder={`Tu análisis:\n• ¿Por qué ese diagnóstico basándote en los logs?\n• ¿Por qué esas acciones en ese orden?\n• ¿Hay indicios de movimiento lateral o exfiltración?\n• ¿Escalarías? ¿Por qué?`}
                style={{ width:'100%', height:'165px', padding:'15px', borderRadius:'12px', fontFamily:'monospace', fontSize:'13px', color:T1, backgroundColor:'rgba(255,255,255,0.95)', border:`1.5px solid ${justif.trim()?ACC+'40':BD}`, resize:'vertical', lineHeight:1.8, marginBottom:'10px', display:'block', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}
              />
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                <span style={{ fontSize:'11px', color:justif.length>50?'#22c55e':T4, fontFamily:'monospace' }}>
                  {justif.length} chars {justif.length<50?'(mínimo recomendado: 50)':'✓'}
                </span>
              </div>
              <button onClick={()=>enviar()} disabled={!justif.trim()}
                style={{ width:'100%', padding:'17px', borderRadius:'12px', backgroundColor:justif.trim()?ACC:T4, border:'none', color:'#fff', fontWeight:800, fontSize:'16px', cursor:justif.trim()?'pointer':'not-allowed', opacity:justif.trim()?1:.5, display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', boxShadow:justif.trim()?`0 4px 24px ${ACC}25`:'none' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Enviar análisis completo
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}