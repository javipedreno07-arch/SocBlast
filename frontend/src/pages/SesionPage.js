import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';
const ACC = '#4f46e5';

const DARK_BG   = '#020609';
const DARK_CARD = 'rgba(10,20,35,0.95)';
const DARK_BD   = '#1a3050';
const DARK_T1   = '#e8f4ff';
const DARK_T2   = '#8ab0cc';
const DARK_T3   = '#3d6080';

const SEV = { CRITICA:'#ef4444', ALTA:'#f97316', MEDIA:'#f59e0b', BAJA:'#3b82f6' };
const SEV_BG = { CRITICA:'rgba(239,68,68,0.1)', ALTA:'rgba(249,115,22,0.1)', MEDIA:'rgba(245,158,11,0.1)', BAJA:'rgba(59,130,246,0.1)' };

const ACCIONES = [
  { id:'aislar',      label:'Aislar host de la red',      icon:'🔌', desc:'Corta conectividad de red' },
  { id:'bloquear',    label:'Bloquear IP en firewall',    icon:'🛡️', desc:'Regla de denegación inmediata' },
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

const NARRATIVAS = {
  triaje_a_logs: [
    'Los sistemas de correlación están procesando eventos. Revisa los registros con cuidado.',
    'El SOC Manager te observa. Cada segundo cuenta.',
    'Los logs están llegando en tiempo real. Filtra el ruido.',
    'Hay más de lo que parece. Busca los patrones ocultos.',
  ],
  logs_a_diag: [
    'Interesante. Los logs apuntan a algo concreto. ¿Lo ves?',
    'El atacante dejó huellas. El diagnóstico es clave.',
    'Correlaciona lo que has visto. El patrón está ahí.',
    'Un analista senior ya tiene una hipótesis. ¿Coincide con la tuya?',
  ],
  diag_a_acciones: [
    'Diagnóstico recibido. Ahora actúa. El tiempo es crítico.',
    'Cada acción tiene consecuencias. Elige con cabeza.',
    'El orden importa. Piensa en la cadena de contención.',
    'El atacante puede detectar tus movimientos. Sé preciso.',
  ],
};

// ── COMPONENTE TIMER DRAMÁTICO ────────────────────────────────────────────────
const DramaticTimer = ({ segundos, limite }) => {
  const pct     = Math.max(0, segundos / limite);
  const critico = segundos < 60;
  const warning = segundos < 180;
  const color   = critico ? '#ef4444' : warning ? '#f59e0b' : '#22c55e';
  const min     = Math.floor(segundos / 60);
  const sec     = segundos % 60;

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 16px',
      borderRadius: '10px',
      backgroundColor: critico ? 'rgba(239,68,68,0.1)' : 'rgba(10,20,35,0.8)',
      border: `1px solid ${critico ? 'rgba(239,68,68,0.5)' : 'rgba(26,48,80,0.8)'}`,
      animation: critico ? 'timerPulse 0.8s ease-in-out infinite' : 'none',
    }}>
      {/* Barra de progreso debajo */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: '2px', borderRadius: '0 0 10px 10px',
        width: `${pct * 100}%`,
        backgroundColor: color,
        transition: 'width 1s linear, background-color 0.5s',
      }}/>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <span style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: '18px',
        fontWeight: 800,
        color,
        letterSpacing: '2px',
        minWidth: '52px',
      }}>
        {min}:{sec.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

// ── LÍNEA DE TIEMPO DE REPLAY ─────────────────────────────────────────────────
const ReplayTimeline = ({ incidente, triaje, logsEleg, diagEleg, accionesEl, evaluacion }) => {
  const [paso, setPaso] = useState(0);
  const pasos = [
    {
      label: 'Alertas clasificadas',
      icon: '🚨',
      color: '#ef4444',
      content: Object.entries(triaje).map(([id, sev]) => (
        <div key={id} style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'4px'}}>
          <span style={{fontSize:'11px',fontFamily:'monospace',color:SEV[sev],backgroundColor:SEV_BG[sev],padding:'2px 6px',borderRadius:'4px',border:`1px solid ${SEV[sev]}40`}}>{sev}</span>
          <span style={{fontSize:'12px',color:DARK_T2}}>{id}</span>
        </div>
      )),
    },
    {
      label: 'Diagnóstico',
      icon: '🎯',
      color: ACC,
      content: (
        <div>
          <div style={{fontSize:'14px',fontWeight:700,color:diagEleg===incidente?.solucion_correcta?.tipo_ataque?'#22c55e':'#ef4444',marginBottom:'6px'}}>
            {diagEleg===incidente?.solucion_correcta?.tipo_ataque ? '✓ CORRECTO' : '✗ INCORRECTO'}
          </div>
          <div style={{fontSize:'13px',color:DARK_T2,marginBottom:'4px'}}>Tu diagnóstico: <span style={{color:DARK_T1,fontWeight:600}}>{diagEleg}</span></div>
          {diagEleg !== incidente?.solucion_correcta?.tipo_ataque && (
            <div style={{fontSize:'13px',color:'#22c55e'}}>Correcto: <span style={{fontWeight:600}}>{incidente?.solucion_correcta?.tipo_ataque}</span></div>
          )}
        </div>
      ),
    },
    {
      label: 'Acciones tomadas',
      icon: '⚡',
      color: '#f59e0b',
      content: (
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
          {accionesEl.map((id, i) => {
            const a = ACCIONES.find(x => x.id === id);
            const esCorrecta = incidente?.solucion_correcta?.acciones_correctas?.some(
              ac => ac.toLowerCase().includes(a?.label.toLowerCase().split(' ')[0])
            );
            return (
              <span key={id} style={{fontSize:'11px',padding:'4px 10px',borderRadius:'6px',border:`1px solid ${esCorrecta?'rgba(34,197,94,0.4)':'rgba(239,68,68,0.3)'}`,backgroundColor:esCorrecta?'rgba(34,197,94,0.08)':'rgba(239,68,68,0.07)',color:esCorrecta?'#22c55e':'#ef4444',fontWeight:600}}>
                {i+1}. {a?.icon} {a?.label}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      label: 'Puntuación final',
      icon: '📊',
      color: evaluacion?.total >= 14 ? '#22c55e' : evaluacion?.total >= 8 ? '#f59e0b' : '#ef4444',
      content: (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
          {[
            {l:'Calidad',  v:`${evaluacion?.puntuacion_calidad}/12`, c:'#22c55e'},
            {l:'Velocidad',v:`${evaluacion?.puntuacion_velocidad}/5`,  c:'#f59e0b'},
            {l:'Sin pistas',v:`${evaluacion?.puntuacion_pistas}/3`,   c:ACC},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:'center',padding:'10px',borderRadius:'8px',backgroundColor:'rgba(10,20,35,0.8)',border:'1px solid rgba(26,48,80,0.6)'}}>
              <div style={{fontSize:'18px',fontWeight:800,color:s.c,marginBottom:'3px'}}>{s.v}</div>
              <div style={{fontSize:'10px',color:DARK_T3}}>{s.l}</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div style={{marginBottom:'20px'}}>
      {/* Tabs de pasos */}
      <div style={{display:'flex',gap:'2px',marginBottom:'16px',backgroundColor:'rgba(10,20,35,0.6)',borderRadius:'10px',padding:'4px'}}>
        {pasos.map((p,i)=>(
          <button key={i} onClick={()=>setPaso(i)}
            style={{flex:1,padding:'8px 4px',borderRadius:'7px',border:'none',cursor:'pointer',fontSize:'11px',fontWeight:600,
              backgroundColor:paso===i?p.color:'transparent',
              color:paso===i?'#fff':DARK_T3,
              transition:'all .2s',
            }}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>
      <div style={{padding:'16px',borderRadius:'10px',backgroundColor:'rgba(10,20,35,0.7)',border:`1px solid ${pasos[paso].color}30`,minHeight:'80px'}}>
        {pasos[paso].content}
      </div>
    </div>
  );
};

// ── LOG CON APARICIÓN PROGRESIVA ──────────────────────────────────────────────
const LogCard = ({ log, index, visible, seleccionado, bloqueado, onClick }) => {
  if (!visible) return (
    <div style={{height:'80px',borderRadius:'11px',backgroundColor:'rgba(10,20,35,0.4)',border:'1px solid rgba(26,48,80,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'20px',height:'20px',border:`2px solid ${DARK_BD}`,borderTop:`2px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div>
  );

  const nivelColor = log.nivel==='ERROR'?'#ef4444':log.nivel==='WARNING'?'#f97316':'#3b82f6';
  return (
    <div onClick={()=>!bloqueado && onClick(index)}
      style={{
        padding:'14px 16px',
        borderRadius:'11px',
        backgroundColor:seleccionado?`${ACC}10`:'rgba(10,20,35,0.7)',
        border:`1px solid ${seleccionado?ACC+'55':DARK_BD}`,
        cursor:bloqueado&&!seleccionado?'not-allowed':'pointer',
        opacity:bloqueado&&!seleccionado?0.3:1,
        position:'relative',
        overflow:'hidden',
        animation:'fadeSlideIn 0.4s ease forwards',
        animationDelay:`${index*0.08}s`,
      }}>
      {seleccionado && <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,transparent,${ACC},transparent)`}}/>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'10px',fontWeight:800,fontFamily:'monospace',padding:'2px 6px',borderRadius:'4px',backgroundColor:`${nivelColor}15`,color:nivelColor,border:`1px solid ${nivelColor}30`}}>{log.nivel}</span>
          <span style={{fontSize:'11px',color:DARK_T3,fontFamily:'monospace'}}>{log.sistema}</span>
        </div>
        <span style={{fontSize:'10px',color:DARK_T3,fontFamily:'monospace'}}>{log.timestamp}</span>
      </div>
      <p style={{fontSize:'13px',color:seleccionado?DARK_T1:DARK_T2,lineHeight:1.55,fontFamily:"'JetBrains Mono','Fira Code',monospace"}}>{log.mensaje}</p>
      {seleccionado && (
        <div style={{position:'absolute',top:'10px',right:'12px',width:'18px',height:'18px',borderRadius:'50%',backgroundColor:ACC,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:'10px',color:'#fff',fontWeight:800}}>✓</span>
        </div>
      )}
    </div>
  );
};

// ── MICRO-FEEDBACK DE TRIAJE ──────────────────────────────────────────────────
const MicroFeedbackTriaje = ({ alertaId, clasificacion, severidadReal }) => {
  if (!clasificacion || !severidadReal) return null;
  const orden = ['BAJA','MEDIA','ALTA','CRITICA'];
  const diff  = Math.abs(orden.indexOf(clasificacion) - orden.indexOf(severidadReal));
  if (diff === 0) return <span style={{fontSize:'10px',color:'#22c55e',fontWeight:700,marginLeft:'6px'}}>✓</span>;
  if (diff === 1) return <span style={{fontSize:'10px',color:'#f59e0b',fontWeight:700,marginLeft:'6px'}}>~</span>;
  return <span style={{fontSize:'10px',color:'#ef4444',fontWeight:700,marginLeft:'6px'}}>!</span>;
};

export default function SesionPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [fase, setFase]         = useState('intro');
  const [sesion, setSesion]     = useState(null);
  const [userData, setUserData] = useState(null);
  const [incIdx, setIncIdx]     = useState(0);
  const [etapa, setEtapa]       = useState('triaje');

  const [triaje,     setTriaje]     = useState({});
  const [logsEleg,   setLogsEleg]   = useState([]);
  const [diagEleg,   setDiagEleg]   = useState(null);
  const [accionesEl, setAccionesEl] = useState([]);
  const [justif,     setJustif]     = useState('');
  const [pistas,     setPistas]     = useState(0);
  const [pista,      setPista]      = useState(false);

  // Revelación progresiva de logs
  const [logsVisibles, setLogsVisibles] = useState(0);

  // Narrativa entre etapas
  const [narrativa, setNarrativa] = useState('');
  const [mostrarNarrativa, setMostrarNarrativa] = useState(false);

  // Streak de precisión (diagnósticos correctos consecutivos)
  const [streakDiag, setStreakDiag] = useState(0);
  const [streakBonus, setStreakBonus] = useState(null);

  // Timeline de historial de evaluaciones para replay
  const [histEval, setHistEval] = useState([]);

  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [tiempoUsado,    setTiempoUsado]    = useState(0);
  const [evaluacion,     setEvaluacion]     = useState(null);
  const [resultado,      setResultado]      = useState(null);

  const opcionesDiagRef = useRef([]);
  const timerRef   = useRef(null);
  const inicioRef  = useRef(null);
  const TIEMPOS    = { Bronce:1200, Plata:900, Oro:600, Elite:420, Diamante:420 };

  const arena     = userData?.arena || 'Bronce';
  const tierArena = arena.includes('Diamante')?'Diamante':arena.includes('Oro')?'Oro':arena.includes('Plata')?'Plata':'Bronce';
  const ARENA_COLOR = { Bronce:'#d97706', Plata:'#94a3b8', Oro:'#f59e0b', Diamante:'#3b82f6' };
  const ac = ARENA_COLOR[tierArena] || ACC;
  const limiteSegundos = TIEMPOS[tierArena] || 1200;

  useEffect(() => {
    axios.get(`${API}/api/me`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setUserData(r.data)).catch(() => {});
  }, []);

  // Timer
  useEffect(() => {
    if (fase !== 'activa') return;
    inicioRef.current = Date.now();
    timerRef.current  = setInterval(() => {
      const elapsed = Math.floor((Date.now() - inicioRef.current) / 1000);
      const rest    = limiteSegundos - elapsed;
      setTiempoRestante(rest);
      setTiempoUsado(elapsed);
      if (rest <= 0) { clearInterval(timerRef.current); enviar(true); }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [fase]);

  const incidente = sesion?.incidentes?.[incIdx];

  // Preparar opciones de diagnóstico al cambiar incidente
  useEffect(() => {
    if (!incidente) return;
    const correcto = incidente.solucion_correcta?.tipo_ataque || 'Ataque desconocido';
    const falsos   = DIAG_POOL.filter(d => d !== correcto).sort(() => Math.random() - .5).slice(0, 3);
    opcionesDiagRef.current = [...falsos, correcto].sort(() => Math.random() - .5);
  }, [incIdx, sesion]);

  // Revelación progresiva de logs cuando se entra a esa etapa
  useEffect(() => {
    if (etapa !== 'logs' || !incidente?.logs) return;
    setLogsVisibles(0);
    const total = incidente.logs.length;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLogsVisibles(i);
      if (i >= total) clearInterval(interval);
    }, 350);
    return () => clearInterval(interval);
  }, [etapa, incIdx]);

  const fmt = s => `${Math.floor(Math.abs(s)/60)}:${(Math.abs(s)%60).toString().padStart(2,'0')}`;

  const resetEtapas = () => {
    setEtapa('triaje'); setTriaje({}); setLogsEleg([]); setDiagEleg(null);
    setAccionesEl([]); setJustif(''); setPistas(0); setPista(false);
    setLogsVisibles(0); setNarrativa(''); setMostrarNarrativa(false);
  };

  // Mostrar narrativa entre etapas y luego avanzar
  const avanzarConNarrativa = (siguienteEtapa, poolKey) => {
    const pool = NARRATIVAS[poolKey] || [];
    const msg  = pool[Math.floor(Math.random() * pool.length)];
    setNarrativa(msg);
    setMostrarNarrativa(true);
    setTimeout(() => {
      setMostrarNarrativa(false);
      setEtapa(siguienteEtapa);
    }, 2200);
  };

  const generar = async () => {
    setFase('cargando');
    try {
      const r = await axios.post(`${API}/api/sesiones/generar`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      setSesion(r.data);
      setTiempoRestante(TIEMPOS[r.data.arena?.split(' ')[0] || 'Bronce'] || 1200);
      setFase('briefing');
    } catch { alert('Error generando sesión'); setFase('intro'); }
  };

  const enviar = async (timeout = false) => {
    setFase('evaluando');
    clearInterval(timerRef.current);
    const txt = `TRIAJE:${JSON.stringify(triaje)}|LOGS:${logsEleg.join(',')}|DIAG:${diagEleg}|ACCIONES:${accionesEl.join(',')}|JUST:${justif || 'Sin justificación'}`;
    try {
      const r = await axios.post(`${API}/api/sesiones/${sesion._id}/responder`, null,
        { params:{ incidente_id:incIdx+1, respuesta:txt, tiempo_usado:tiempoUsado, pistas_usadas:pistas },
          headers:{ Authorization:`Bearer ${token}` } }
      );
      // Actualizar streak
      if (r.data.identifico_ataque) {
        const nuevo = streakDiag + 1;
        setStreakDiag(nuevo);
        if (nuevo >= 3) setStreakBonus(`🔥 ×${nuevo} COMBO — Diagnóstico perfecto`);
      } else {
        setStreakDiag(0);
        setStreakBonus(null);
      }
      setHistEval(prev => [...prev, { incidente, triaje:{...triaje}, logsEleg:[...logsEleg], diagEleg, accionesEl:[...accionesEl], eval:r.data }]);
      setEvaluacion(r.data);
      setFase('feedback');
    } catch { setFase('activa'); }
  };

  const siguiente = () => {
    if (incIdx + 1 < sesion.incidentes.length) {
      setIncIdx(i => i + 1);
      setEvaluacion(null);
      resetEtapas();
      inicioRef.current = Date.now();
      setFase('activa');
    } else { finalizar(); }
  };

  const finalizar = async () => {
    try {
      const r = await axios.post(`${API}/api/sesiones/${sesion._id}/finalizar`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      setResultado(r.data);
      setFase('finalizada');
    } catch { alert('Error finalizando'); }
  };

  const toggleLog    = i  => setLogsEleg(p => p.includes(i) ? p.filter(x=>x!==i) : p.length<4 ? [...p,i] : p);
  const toggleAccion = id => setAccionesEl(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);

  const ETAPAS    = ['triaje','logs','diagnostico','acciones','justificacion'];
  const etapaIdx  = ETAPAS.indexOf(etapa);
  const triajeCompleto = Object.keys(triaje).length >= (incidente?.alertas?.length || 0);

  // ── CSS GLOBAL ────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Syne:wght@700;800;900&display=swap');
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fadeSlideIn{from{opacity:0;transform:translateX(-8px);}to{opacity:1;transform:translateX(0);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes timerPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4);}50%{box-shadow:0 0 0 8px rgba(239,68,68,0);}}
    @keyframes narrativaIn{0%{opacity:0;transform:translateY(-8px) scale(0.97);}20%{opacity:1;transform:none;}80%{opacity:1;}100%{opacity:0;}}
    @keyframes streakIn{0%{opacity:0;transform:scale(0.8);}30%{opacity:1;transform:scale(1.05);}70%{opacity:1;transform:scale(1);}100%{opacity:0;transform:translateY(-20px);}}
    @keyframes scanline{0%{top:-10%;}100%{top:110%;}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px ${ACC}40;}50%{box-shadow:0 0 48px ${ACC}70;}}
    .fade-up{animation:fadeUp .4s ease forwards;}
    .glow-btn{animation:glow 3s ease-in-out infinite;}
    .glow-btn:hover{filter:brightness(1.12);transform:translateY(-2px)!important;}
    .dark-accion:hover{border-color:rgba(79,70,229,.5)!important;background:rgba(79,70,229,.08)!important;}
    .diag-opt:hover{border-color:rgba(79,70,229,.4)!important;background:rgba(79,70,229,.06)!important;}
    .nav-icon:hover{color:#e8f4ff!important;}
    *{box-sizing:border-box;}
    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-track{background:rgba(10,20,35,0.5);}
    ::-webkit-scrollbar-thumb{background:rgba(26,48,80,0.8);border-radius:4px;}
    textarea:focus{outline:none;border-color:${ACC}70!important;box-shadow:0 0 0 2px ${ACC}20!important;}
  `;

  // Fondo con scanline para la interfaz de consola
  const ScanlineOverlay = () => (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
      <div style={{
        position:'absolute',left:0,right:0,height:'3px',
        background:'linear-gradient(transparent,rgba(79,70,229,0.03),transparent)',
        animation:'scanline 6s linear infinite',
      }}/>
      {/* Grid sutil */}
      <div style={{
        position:'absolute',inset:0,opacity:0.025,
        backgroundImage:'linear-gradient(rgba(79,70,229,1) 1px,transparent 1px),linear-gradient(90deg,rgba(79,70,229,1) 1px,transparent 1px)',
        backgroundSize:'40px 40px',
      }}/>
    </div>
  );

  // Navbar para pantallas oscuras (sesión activa)
  const NavbarOscuro = () => (
    <div style={{
      height:'52px',display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'0 28px',
      backgroundColor:'rgba(2,6,9,0.95)',
      backdropFilter:'blur(20px)',
      borderBottom:`1px solid ${DARK_BD}`,
      flexShrink:0,
      position:'relative',zIndex:10,
    }}>
      {/* Logo + etapas */}
      <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
        <img src="/logosoc.png" style={{height:'24px',cursor:'pointer',opacity:0.8}} onClick={()=>navigate('/dashboard')}/>
        <div style={{display:'flex',gap:'4px',alignItems:'center'}}>
          {ETAPAS.map((e,i)=>{
            const labels = {triaje:'TRIAJE',logs:'LOGS',diagnostico:'DIAG',acciones:'RESP',justificacion:'JUST'};
            const done   = i < etapaIdx;
            const active = i === etapaIdx;
            return (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'4px'}}>
                <div style={{
                  padding:'3px 8px',borderRadius:'5px',fontSize:'9px',fontFamily:"'JetBrains Mono',monospace",fontWeight:700,letterSpacing:'1px',
                  backgroundColor:done?'rgba(34,197,94,0.1)':active?`${ACC}18`:'transparent',
                  color:done?'#22c55e':active?ACC:DARK_T3,
                  border:`1px solid ${done?'rgba(34,197,94,0.25)':active?`${ACC}35`:'transparent'}`,
                  boxShadow:active?`0 0 8px ${ACC}30`:'none',
                }}>
                  {done?'✓':''}{labels[e]}
                </div>
                {i<ETAPAS.length-1 && <div style={{width:'12px',height:'1px',backgroundColor:done?'rgba(34,197,94,0.3)':DARK_BD}}/>}
              </div>
            );
          })}
        </div>
      </div>
      {/* Centro: incidente */}
      <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',display:'flex',alignItems:'center',gap:'8px'}}>
        <span style={{fontSize:'10px',color:DARK_T3,fontFamily:'monospace'}}>INC</span>
        <div style={{display:'flex',gap:'4px'}}>
          {sesion?.incidentes?.map((_,i)=>(
            <div key={i} style={{width:'20px',height:'4px',borderRadius:'2px',
              backgroundColor:i<incIdx?'#22c55e':i===incIdx?ACC:DARK_BD,
              boxShadow:i===incIdx?`0 0 6px ${ACC}`:'none',
            }}/>
          ))}
        </div>
        <span style={{fontSize:'10px',color:DARK_T3,fontFamily:'monospace'}}>{incIdx+1}/{sesion?.incidentes?.length}</span>
      </div>
      {/* Timer */}
      <DramaticTimer segundos={tiempoRestante} limite={limiteSegundos}/>
    </div>
  );

  // Navbar claro
  const NavbarClaro = ({right, center}) => (
    <nav style={{height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 36px',backgroundColor:'rgba(255,255,255,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
      <img src="/logosoc.png" style={{height:'28px',cursor:'pointer'}} onClick={()=>navigate('/dashboard')}/>
      {center && <span style={{fontSize:'13px',color:'#64748b',fontWeight:500}}>{center}</span>}
      {right}
    </nav>
  );

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (fase === 'intro') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',fontFamily:"'Syne','Inter',sans-serif"}}>
        <NavbarClaro right={
          <button onClick={()=>navigate('/dashboard')} style={{background:'none',border:'1px solid #e2e8f0',color:'#64748b',padding:'6px 14px',borderRadius:'8px',fontSize:'12px',cursor:'pointer',fontFamily:"'JetBrains Mono',monospace"}}>← Dashboard</button>
        }/>
        <div style={{maxWidth:'700px',margin:'0 auto',padding:'52px 28px'}}>
          <div className="fade-up">
            <div style={{textAlign:'center',marginBottom:'40px'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'6px 16px',borderRadius:'100px',border:`1.5px solid ${ac}30`,backgroundColor:`${ac}08`,marginBottom:'24px'}}>
                <div style={{width:'7px',height:'7px',borderRadius:'50%',backgroundColor:ac,animation:'pulse 2s infinite'}}/>
                <span style={{fontSize:'11px',color:ac,fontWeight:700,letterSpacing:'2px',fontFamily:"'JetBrains Mono',monospace"}}>{arena.toUpperCase()} · SOC PLATFORM</span>
              </div>
              <h1 style={{fontSize:'52px',fontWeight:900,letterSpacing:'-3px',color:'#0f172a',marginBottom:'14px',lineHeight:0.95,fontFamily:"'Syne',sans-serif"}}>Sesión<br/><span style={{color:ACC}}>SOC</span></h1>
              <p style={{fontSize:'16px',color:'#64748b',lineHeight:1.75,maxWidth:'480px',margin:'0 auto'}}>
                La IA genera un escenario real de amenaza. Investiga, diagnostica y responde como analista profesional.
              </p>
            </div>

            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'28px'}}>
              {[
                {label:'Arena',      value:arena,  color:ac},
                {label:'Tiempo',     value:{Bronce:'20 min',Plata:'15 min',Oro:'10 min',Diamante:'7 min'}[tierArena]||'20 min', color:'#22c55e'},
                {label:'Incidentes', value:{Bronce:'3',Plata:'3',Oro:'4',Diamante:'5'}[tierArena]||'3', color:'#0f172a'},
                {label:'XP máx',     value:{Bronce:'50',Plata:'100',Oro:'200',Diamante:'400'}[tierArena]||'50', color:ACC},
              ].map((c,i)=>(
                <div key={i} style={{padding:'20px 14px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',textAlign:'center'}}>
                  <div style={{fontSize:'20px',fontWeight:800,color:c.color,marginBottom:'5px',fontFamily:"'Syne',sans-serif"}}>{c.value}</div>
                  <div style={{fontSize:'12px',color:'#94a3b8',fontFamily:"'JetBrains Mono',monospace"}}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Mecánica */}
            <div style={{padding:'24px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:'28px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
              <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:'18px',fontFamily:"'JetBrains Mono',monospace"}}>MECÁNICA — CADA INCIDENTE</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {[
                  {n:'01',t:'Triaje',       d:'Clasifica la severidad de cada alerta en tiempo real',    c:'#ef4444'},
                  {n:'02',t:'Logs',         d:'Los registros aparecen progresivamente — filtra el ruido', c:'#f97316'},
                  {n:'03',t:'Diagnóstico',  d:'Identifica la amenaza entre 4 opciones con señuelos reales',c:'#f59e0b'},
                  {n:'04',t:'Respuesta',    d:'Elige acciones — el orden importa en la evaluación',        c:'#22c55e'},
                  {n:'05',t:'Justificación',d:'Tu razonamiento vale más que las acciones. Sé preciso.',   c:ACC},
                ].map((m,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'14px',padding:'12px 16px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0'}}>
                    <div style={{width:'34px',height:'34px',borderRadius:'8px',backgroundColor:`${m.c}10`,border:`1px solid ${m.c}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:'12px',fontWeight:900,color:m.c,fontFamily:"'JetBrains Mono',monospace"}}>{m.n}</span>
                    </div>
                    <div>
                      <p style={{fontSize:'14px',fontWeight:700,color:'#0f172a',marginBottom:'2px',fontFamily:"'Syne',sans-serif"}}>{m.t}</p>
                      <p style={{fontSize:'12px',color:'#64748b'}}>{m.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="glow-btn" onClick={generar}
              style={{width:'100%',padding:'22px',borderRadius:'14px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'17px',fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',boxShadow:`0 8px 36px ${ACC}35`,fontFamily:"'Syne',sans-serif"}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Generar y comenzar sesión SOC
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ── CARGANDO ───────────────────────────────────────────────────────────────
  if (fase === 'cargando') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',backgroundColor:DARK_BG,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'JetBrains Mono',monospace",position:'relative'}}>
        <ScanlineOverlay/>
        <div style={{textAlign:'center',position:'relative',zIndex:1}}>
          <div style={{width:52,height:52,border:`2px solid ${DARK_BD}`,borderTop:`2px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 24px'}}/>
          <p style={{color:ACC,fontSize:'14px',marginBottom:'8px',fontWeight:700,letterSpacing:'2px'}}>GENERANDO ESCENARIO SOC...</p>
          <p style={{color:DARK_T3,fontSize:'12px',letterSpacing:'1px'}}>IA construyendo amenazas · {arena}</p>
          <div style={{marginTop:'28px',display:'flex',gap:'6px',justifyContent:'center'}}>
            {['Alertas','Logs','Señuelos','Soluciones'].map((l,i)=>(
              <div key={i} style={{fontSize:'10px',color:DARK_T3,padding:'3px 8px',borderRadius:'4px',border:'1px solid rgba(26,48,80,0.5)',animation:`pulse ${1+i*0.3}s ease-in-out infinite`,animationDelay:`${i*0.2}s`}}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ── BRIEFING ───────────────────────────────────────────────────────────────
  if (fase === 'briefing') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)',fontFamily:"'Syne','Inter',sans-serif",display:'flex',flexDirection:'column'}}>
        <NavbarClaro right={<button onClick={()=>setFase('intro')} style={{background:'none',border:'1px solid #e2e8f0',color:'#64748b',padding:'6px 14px',borderRadius:'8px',fontSize:'12px',cursor:'pointer'}}>✕ Cancelar</button>}/>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'32px 24px'}}>
          <div className="fade-up" style={{maxWidth:'620px',width:'100%'}}>
            <div style={{padding:'40px',borderRadius:'22px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 12px 48px rgba(0,0,0,0.10)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:`linear-gradient(90deg,transparent,${ACC},transparent)`}}/>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'22px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',backgroundColor:'#ef4444',animation:'pulse 1s infinite'}}/>
                <span style={{color:'#94a3b8',fontSize:'10px',letterSpacing:'2.5px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>MISIÓN ASIGNADA — CLASIFICADO</span>
              </div>
              <h1 style={{fontSize:'26px',fontWeight:900,color:'#0f172a',marginBottom:'20px',letterSpacing:'-0.5px',lineHeight:1.2}}>{sesion?.titulo}</h1>
              <div style={{padding:'18px 20px',borderRadius:'12px',backgroundColor:'#f0fdf4',border:'1px solid #bbf7d0',marginBottom:'24px'}}>
                <p style={{fontSize:'11px',color:'#16a34a',fontWeight:700,marginBottom:'8px',letterSpacing:'1.5px',fontFamily:"'JetBrains Mono',monospace"}}>CONTEXTO:</p>
                <p style={{fontSize:'14px',color:'#15803d',lineHeight:1.8}}>{sesion?.contexto}</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'28px'}}>
                {[
                  {label:'Incidentes',value:sesion?.incidentes?.length},
                  {label:'Arena',     value:sesion?.arena},
                  {label:'Tiempo',    value:fmt(tiempoRestante)},
                ].map((s,i)=>(
                  <div key={i} style={{padding:'16px',borderRadius:'12px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0',textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:900,color:'#0f172a',marginBottom:'4px'}}>{s.value}</div>
                    <div style={{fontSize:'12px',color:'#94a3b8',fontFamily:"'JetBrains Mono',monospace"}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{ resetEtapas(); setFase('activa'); }}
                style={{width:'100%',padding:'18px',borderRadius:'12px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'16px',fontWeight:800,cursor:'pointer',boxShadow:`0 4px 24px ${ACC}30`,display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',fontFamily:"'Syne',sans-serif"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                INICIAR SESIÓN SOC
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── EVALUANDO ──────────────────────────────────────────────────────────────
  if (fase === 'evaluando') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',backgroundColor:DARK_BG,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'JetBrains Mono',monospace",position:'relative'}}>
        <ScanlineOverlay/>
        <div style={{textAlign:'center',position:'relative',zIndex:1}}>
          <div style={{width:52,height:52,border:`2px solid ${DARK_BD}`,borderTop:`2px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 24px'}}/>
          <p style={{color:ACC,fontSize:'14px',marginBottom:'8px',fontWeight:700,letterSpacing:'2px'}}>IA EVALUANDO RESPUESTA...</p>
          <p style={{color:DARK_T3,fontSize:'12px',letterSpacing:'1px'}}>Analizando decisiones · Calculando puntuación</p>
        </div>
      </div>
    </>
  );

  // ── FEEDBACK ───────────────────────────────────────────────────────────────
  if (fase === 'feedback' && evaluacion) {
    const scoreColor = evaluacion.total>=14?'#22c55e':evaluacion.total>=8?'#f59e0b':'#ef4444';
    return (
      <>
        <style>{css}</style>
        <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)',fontFamily:"'Syne','Inter',sans-serif"}}>
          <NavbarClaro center={`Incidente ${incIdx+1} de ${sesion?.incidentes?.length}`} right={<span/>}/>
          <div style={{maxWidth:'780px',margin:'0 auto',padding:'36px 28px'}}>
            <div className="fade-up">

              {/* Streak bonus */}
              {streakBonus && (
                <div style={{textAlign:'center',marginBottom:'16px'}}>
                  <div style={{display:'inline-block',padding:'10px 22px',borderRadius:'100px',background:'linear-gradient(135deg,#fef3c7,#fffbeb)',border:'2px solid #fcd34d',fontSize:'14px',fontWeight:800,color:'#92400e',animation:'streakIn 2s ease forwards'}}>
                    {streakBonus}
                  </div>
                </div>
              )}

              <div style={{padding:'36px',borderRadius:'22px',backgroundColor:'#fff',border:`1.5px solid ${scoreColor}30`,boxShadow:'0 8px 40px rgba(0,0,0,0.09)',marginBottom:'16px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:`linear-gradient(90deg,${scoreColor},${scoreColor}60)`}}/>

                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'28px'}}>
                  <div>
                    <h2 style={{fontSize:'22px',fontWeight:900,color:'#0f172a',marginBottom:'5px'}}>Resultado — Incidente {incIdx+1}</h2>
                    <p style={{fontSize:'13px',color:'#64748b'}}>
                      {evaluacion.total>=14?'🟢 Análisis excelente — nivel profesional':evaluacion.total>=8?'🟡 Buen trabajo — sigue practicando':'🔴 Necesita mejorar — repasa los fundamentos'}
                    </p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'56px',fontWeight:900,color:scoreColor,letterSpacing:'-3px',lineHeight:1,fontFamily:"'Syne',sans-serif"}}>{evaluacion.total}</div>
                    <div style={{fontSize:'13px',color:'#94a3b8',fontFamily:"'JetBrains Mono',monospace"}}>/20 pts</div>
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'28px'}}>
                  {[
                    {label:'Calidad análisis',value:`${evaluacion.puntuacion_calidad}/12`,color:'#22c55e'},
                    {label:'Velocidad',        value:`${evaluacion.puntuacion_velocidad}/5`, color:'#f59e0b'},
                    {label:'Sin pistas',       value:`${evaluacion.puntuacion_pistas}/3`,   color:ACC},
                  ].map((s,i)=>(
                    <div key={i} style={{padding:'18px',borderRadius:'12px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0',textAlign:'center'}}>
                      <div style={{fontSize:'26px',fontWeight:900,color:s.color,marginBottom:'5px',fontFamily:"'Syne',sans-serif"}}>{s.value}</div>
                      <div style={{fontSize:'12px',color:'#64748b'}}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* REPLAY TIMELINE */}
                <ReplayTimeline
                  incidente={incidente}
                  triaje={triaje}
                  logsEleg={logsEleg}
                  diagEleg={diagEleg}
                  accionesEl={accionesEl}
                  evaluacion={evaluacion}
                />

                <div style={{padding:'18px 20px',borderRadius:'12px',backgroundColor:`${ACC}06`,border:`1px solid ${ACC}15`,marginBottom:'12px'}}>
                  <p style={{fontSize:'10px',color:'#64748b',fontWeight:700,letterSpacing:'1.5px',marginBottom:'8px',fontFamily:"'JetBrains Mono',monospace"}}>FEEDBACK IA</p>
                  <p style={{fontSize:'15px',color:'#0f172a',lineHeight:1.8}}>{evaluacion.feedback}</p>
                </div>

                <div style={{padding:'18px 20px',borderRadius:'12px',backgroundColor:'#f0fdf4',border:'1px solid #bbf7d0'}}>
                  <p style={{fontSize:'10px',color:'#16a34a',fontWeight:700,letterSpacing:'1.5px',marginBottom:'8px',fontFamily:"'JetBrains Mono',monospace"}}>SOLUCIÓN CORRECTA</p>
                  <p style={{fontSize:'15px',color:'#15803d',lineHeight:1.8}}>{evaluacion.solucion_explicada}</p>
                </div>
              </div>

              <button onClick={siguiente}
                style={{width:'100%',padding:'18px',borderRadius:'12px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'16px',fontWeight:800,cursor:'pointer',boxShadow:`0 4px 24px ${ACC}30`,fontFamily:"'Syne',sans-serif"}}>
                {incIdx+1 < sesion.incidentes.length ? `→ Incidente ${incIdx+2} de ${sesion.incidentes.length}` : '🏁 Finalizar sesión'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── FINALIZADA ─────────────────────────────────────────────────────────────
  if (fase === 'finalizada' && resultado) return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)',display:'flex',alignItems:'center',justifyContent:'center',padding:'28px',fontFamily:"'Syne','Inter',sans-serif"}}>
        <div className="fade-up" style={{maxWidth:'560px',width:'100%'}}>
          <div style={{padding:'48px',borderRadius:'24px',backgroundColor:'#fff',border:'1px solid #e8eaf0',textAlign:'center',boxShadow:'0 20px 64px rgba(0,0,0,0.12)',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:`linear-gradient(90deg,${ACC},#818cf8,${ACC})`}}/>
            <div style={{fontSize:'60px',marginBottom:'16px'}}>🏆</div>
            <h1 style={{fontSize:'32px',fontWeight:900,color:'#0f172a',marginBottom:'6px',letterSpacing:'-1px'}}>Sesión Completada</h1>
            <p style={{fontSize:'13px',color:'#94a3b8',marginBottom:'32px',fontFamily:"'JetBrains Mono',monospace"}}>
              {sesion?.incidentes?.length} incidentes investigados
            </p>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'32px'}}>
              {[
                {label:'Copas',  value:`${resultado.copas_ganadas>0?'+':''}${resultado.copas_ganadas}`, color:'#f59e0b'},
                {label:'XP',     value:`+${resultado.xp_ganada}`,                                        color:'#22c55e'},
                {label:'Media',  value:`${resultado.media_puntuacion}/20`,                               color:ACC},
                {label:'Arena',  value:resultado.arena,                                                  color:ac},
              ].map((s,i)=>(
                <div key={i} style={{padding:'20px',borderRadius:'14px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0'}}>
                  <div style={{fontSize:'28px',fontWeight:900,color:s.color,marginBottom:'4px',letterSpacing:'-0.5px'}}>{s.value}</div>
                  <div style={{fontSize:'12px',color:'#94a3b8',fontFamily:"'JetBrains Mono',monospace"}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Resumen de streak */}
            {streakDiag >= 2 && (
              <div style={{padding:'14px',borderRadius:'12px',background:'linear-gradient(135deg,#fef3c7,#fffbeb)',border:'1px solid #fcd34d',marginBottom:'20px'}}>
                <div style={{fontSize:'14px',fontWeight:800,color:'#92400e'}}>🔥 Racha de {streakDiag} diagnósticos perfectos</div>
                <div style={{fontSize:'12px',color:'#b45309',marginTop:'4px'}}>Bonus de XP aplicado</div>
              </div>
            )}

            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={()=>navigate('/dashboard')} style={{flex:1,padding:'14px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#475569',fontSize:'14px',fontWeight:600,cursor:'pointer',fontFamily:"'JetBrains Mono',monospace"}}>← Dashboard</button>
              <button onClick={()=>{ setSesion(null); setIncIdx(0); resetEtapas(); setFase('intro'); setHistEval([]); setStreakDiag(0); setStreakBonus(null); }}
                style={{flex:1,padding:'14px',borderRadius:'10px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'14px',fontWeight:800,cursor:'pointer',fontFamily:"'Syne',sans-serif"}}>
                Nueva ⚡
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── ACTIVA ─────────────────────────────────────────────────────────────────
  if (fase !== 'activa' || !incidente) return null;
  const diagOpts = opcionesDiagRef.current;

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',backgroundColor:DARK_BG,fontFamily:"'JetBrains Mono','Fira Code',monospace",color:DARK_T1,display:'flex',flexDirection:'column',position:'relative'}}>
        <ScanlineOverlay/>
        <NavbarOscuro/>

        {/* NARRATIVA OVERLAY */}
        {mostrarNarrativa && (
          <div style={{
            position:'fixed',top:'80px',left:'50%',transform:'translateX(-50%)',
            zIndex:100,
            padding:'14px 28px',
            borderRadius:'12px',
            backgroundColor:'rgba(10,20,35,0.96)',
            border:`1px solid ${ACC}40`,
            boxShadow:`0 0 32px ${ACC}30`,
            maxWidth:'480px',
            textAlign:'center',
            animation:'narrativaIn 2.2s ease forwards',
          }}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',justifyContent:'center'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:ACC,animation:'pulse 1s infinite'}}/>
              <span style={{fontSize:'12px',color:DARK_T2,letterSpacing:'0.5px'}}>{narrativa}</span>
            </div>
          </div>
        )}

        <div style={{flex:1,maxWidth:'960px',margin:'0 auto',width:'100%',padding:'28px 28px 56px',position:'relative',zIndex:1}}>

          {/* Descripción del incidente */}
          <div style={{padding:'16px 20px',borderRadius:'10px',backgroundColor:`${ACC}08`,border:`1px solid ${ACC}20`,marginBottom:'28px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',background:`linear-gradient(180deg,${ACC},transparent)`}}/>
            <p style={{fontSize:'10px',color:ACC,marginBottom:'6px',letterSpacing:'1.5px',fontWeight:700}}>INCIDENTE ACTIVO · {incidente?.titulo}</p>
            <p style={{fontSize:'14px',color:DARK_T2,lineHeight:1.75,fontFamily:"'JetBrains Mono',monospace"}}>{incidente?.descripcion}</p>
          </div>

          {/* ── TRIAJE ── */}
          {etapa === 'triaje' && (
            <div className="fade-up">
              <div style={{marginBottom:'24px'}}>
                <h2 style={{fontSize:'24px',fontWeight:900,color:DARK_T1,marginBottom:'6px',fontFamily:"'Syne',sans-serif",letterSpacing:'-0.5px'}}>🚨 Triaje de Alertas</h2>
                <p style={{fontSize:'13px',color:DARK_T3}}>Clasifica la severidad de cada alerta. La señal micro te indica si vas bien.</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'28px'}}>
                {incidente.alertas?.map((alerta, i) => (
                  <div key={i} style={{padding:'22px 24px',borderRadius:'14px',backgroundColor:DARK_CARD,border:`1px solid ${triaje[alerta.id]?SEV[triaje[alerta.id]]+'45':DARK_BD}`,backdropFilter:'blur(10px)',position:'relative',overflow:'hidden',transition:'border-color .2s'}}>
                    {triaje[alerta.id] && <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',backgroundColor:SEV[triaje[alerta.id]]}}/>}
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'20px'}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                          <span style={{fontSize:'10px',color:DARK_T3,fontFamily:'monospace',backgroundColor:'rgba(8,21,37,.8)',padding:'3px 8px',borderRadius:'5px',border:`1px solid ${DARK_BD}`}}>{alerta.id}</span>
                          <span style={{fontSize:'15px',fontWeight:700,color:DARK_T1,fontFamily:"'Syne',sans-serif"}}>{alerta.sistema}</span>
                          {/* MICRO-FEEDBACK */}
                          <MicroFeedbackTriaje
                            alertaId={alerta.id}
                            clasificacion={triaje[alerta.id]}
                            severidadReal={alerta.severidad}
                          />
                        </div>
                        <p style={{fontSize:'13px',color:DARK_T2,lineHeight:1.65,marginBottom:'8px'}}>{alerta.descripcion}</p>
                        {alerta.detalles && (
                          <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                            {Object.entries(alerta.detalles).slice(0,4).map(([k,v])=>(
                              <span key={k} style={{fontSize:'10px',color:DARK_T3,fontFamily:'monospace',padding:'2px 8px',borderRadius:'4px',backgroundColor:'rgba(8,21,37,.8)',border:`1px solid ${DARK_BD}`}}>{k}: {v}</span>
                            ))}
                          </div>
                        )}
                        <p style={{fontSize:'10px',color:DARK_T3,marginTop:'8px',fontFamily:'monospace'}}>{alerta.timestamp}</p>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:'6px',flexShrink:0}}>
                        {['CRITICA','ALTA','MEDIA','BAJA'].map(sev=>(
                          <button key={sev} onClick={()=>setTriaje(p=>({...p,[alerta.id]:sev}))}
                            style={{padding:'8px 14px',borderRadius:'7px',fontSize:'10px',fontWeight:700,fontFamily:'monospace',cursor:'pointer',minWidth:'80px',
                              backgroundColor:triaje[alerta.id]===sev?SEV[sev]+'20':'rgba(8,21,37,.8)',
                              border:`1px solid ${triaje[alerta.id]===sev?SEV[sev]:DARK_BD}`,
                              color:triaje[alerta.id]===sev?SEV[sev]:DARK_T3,
                              boxShadow:triaje[alerta.id]===sev?`0 0 10px ${SEV[sev]}30`:'none',
                            }}>
                            {sev}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={()=>avanzarConNarrativa('logs','triaje_a_logs')} disabled={!triajeCompleto}
                style={{width:'100%',padding:'18px',borderRadius:'12px',backgroundColor:triajeCompleto?ACC:DARK_BD,border:'none',color:DARK_T1,fontWeight:700,fontSize:'16px',cursor:triajeCompleto?'pointer':'not-allowed',opacity:triajeCompleto?1:.45,fontFamily:"'Syne',sans-serif"}}>
                Confirmar triaje → Investigar logs ({Object.keys(triaje).length}/{incidente.alertas?.length})
              </button>
            </div>
          )}

          {/* ── LOGS (revelación progresiva) ── */}
          {etapa === 'logs' && (
            <div className="fade-up">
              <div style={{marginBottom:'24px',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
                <div>
                  <h2 style={{fontSize:'24px',fontWeight:900,color:DARK_T1,marginBottom:'6px',fontFamily:"'Syne',sans-serif",letterSpacing:'-0.5px'}}>🔍 Investigación de Logs</h2>
                  <p style={{fontSize:'13px',color:DARK_T3}}>Los registros llegan en tiempo real. Selecciona hasta <span style={{color:DARK_T1,fontWeight:700}}>4</span> relevantes.</p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 14px',borderRadius:'8px',backgroundColor:'rgba(10,20,35,0.8)',border:`1px solid ${DARK_BD}`}}>
                  <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:logsVisibles<(incidente.logs?.length||0)?ACC:'#22c55e',animation:logsVisibles<(incidente.logs?.length||0)?'pulse .8s infinite':'none'}}/>
                  <span style={{fontSize:'11px',color:DARK_T2,fontFamily:'monospace'}}>{logsVisibles}/{incidente.logs?.length} recibidos</span>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
                {incidente.logs?.map((log, i) => (
                  <LogCard
                    key={i}
                    log={log}
                    index={i}
                    visible={i < logsVisibles}
                    seleccionado={logsEleg.includes(i)}
                    bloqueado={!logsEleg.includes(i) && logsEleg.length >= 4}
                    onClick={toggleLog}
                  />
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <span style={{fontSize:'12px',color:DARK_T3,fontFamily:'monospace'}}>{logsEleg.length}/4 seleccionados</span>
                {logsEleg.length>0 && <button onClick={()=>setLogsEleg([])} style={{background:'none',border:'none',color:DARK_T3,fontSize:'12px',cursor:'pointer',fontFamily:'monospace'}}>Limpiar ×</button>}
              </div>
              <button onClick={()=>avanzarConNarrativa('diagnostico','logs_a_diag')} disabled={logsEleg.length===0}
                style={{width:'100%',padding:'18px',borderRadius:'12px',backgroundColor:logsEleg.length>0?ACC:DARK_BD,border:'none',color:DARK_T1,fontWeight:700,fontSize:'16px',cursor:logsEleg.length>0?'pointer':'not-allowed',opacity:logsEleg.length>0?1:.45,fontFamily:"'Syne',sans-serif"}}>
                Confirmar → Diagnóstico
              </button>
            </div>
          )}

          {/* ── DIAGNÓSTICO ── */}
          {etapa === 'diagnostico' && (
            <div className="fade-up">
              <div style={{marginBottom:'24px'}}>
                <h2 style={{fontSize:'24px',fontWeight:900,color:DARK_T1,marginBottom:'6px',fontFamily:"'Syne',sans-serif",letterSpacing:'-0.5px'}}>🎯 Diagnóstico</h2>
                <p style={{fontSize:'13px',color:DARK_T3}}>¿Qué tipo de amenaza estás viendo? Hay señuelos reales entre las opciones.</p>
              </div>

              {/* Resumen de triaje */}
              <div style={{padding:'14px 18px',borderRadius:'10px',backgroundColor:'rgba(8,21,37,.8)',border:`1px solid ${DARK_BD}`,marginBottom:'22px'}}>
                <p style={{fontSize:'10px',color:DARK_T3,marginBottom:'10px',letterSpacing:'1px'}}>ALERTAS CLASIFICADAS:</p>
                <div style={{display:'flex',gap:'7px',flexWrap:'wrap'}}>
                  {Object.entries(triaje).map(([id,sev])=>(
                    <span key={id} style={{fontSize:'11px',padding:'4px 10px',borderRadius:'6px',backgroundColor:SEV_BG[sev],color:SEV[sev],border:`1px solid ${SEV[sev]}35`,fontFamily:'monospace',fontWeight:700}}>{id} · {sev}</span>
                  ))}
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'22px'}}>
                {diagOpts.map((op, i) => (
                  <button key={i} className="diag-opt" onClick={()=>setDiagEleg(op)}
                    style={{padding:'22px 20px',borderRadius:'12px',backgroundColor:diagEleg===op?`${ACC}14`:'rgba(10,20,35,0.7)',border:`1.5px solid ${diagEleg===op?ACC:DARK_BD}`,color:diagEleg===op?DARK_T1:DARK_T2,fontSize:'14px',fontWeight:600,cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:'14px',boxShadow:diagEleg===op?`0 0 20px ${ACC}25`:'none',fontFamily:"'JetBrains Mono',monospace"}}>
                    <div style={{width:'24px',height:'24px',borderRadius:'50%',border:`2px solid ${diagEleg===op?ACC:DARK_BD}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'border-color .2s'}}>
                      {diagEleg===op && <div style={{width:'10px',height:'10px',borderRadius:'50%',backgroundColor:ACC}}/>}
                    </div>
                    <span style={{lineHeight:1.4}}>{op}</span>
                  </button>
                ))}
              </div>

              {pista && (
                <div style={{padding:'14px 18px',borderRadius:'10px',backgroundColor:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.2)',marginBottom:'16px',animation:'fadeUp .3s ease'}}>
                  <p style={{fontSize:'13px',color:'#f59e0b',lineHeight:1.65}}>
                    💡 <span style={{fontWeight:700}}>Pista:</span> Busca patrones de {incidente?.solucion_correcta?.tipo_ataque?.split(' ')[0]} en los logs y alertas de mayor severidad.
                  </p>
                </div>
              )}

              <div style={{display:'flex',gap:'10px'}}>
                {!pista && (
                  <button onClick={()=>{ setPistas(p=>p+1); setPista(true); }}
                    style={{padding:'14px 20px',borderRadius:'11px',backgroundColor:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.25)',color:'#f59e0b',fontSize:'14px',fontWeight:600,cursor:'pointer',flexShrink:0,fontFamily:'monospace'}}>
                    💡 Pista (-1pt)
                  </button>
                )}
                <button onClick={()=>avanzarConNarrativa('acciones','diag_a_acciones')} disabled={!diagEleg}
                  style={{flex:1,padding:'14px',borderRadius:'11px',backgroundColor:diagEleg?ACC:DARK_BD,border:'none',color:DARK_T1,fontWeight:700,fontSize:'16px',cursor:diagEleg?'pointer':'not-allowed',opacity:diagEleg?1:.45,fontFamily:"'Syne',sans-serif"}}>
                  Confirmar → Plan de respuesta
                </button>
              </div>
            </div>
          )}

          {/* ── ACCIONES ── */}
          {etapa === 'acciones' && (
            <div className="fade-up">
              <div style={{marginBottom:'24px'}}>
                <h2 style={{fontSize:'24px',fontWeight:900,color:DARK_T1,marginBottom:'6px',fontFamily:"'Syne',sans-serif",letterSpacing:'-0.5px'}}>⚡ Plan de Respuesta</h2>
                <p style={{fontSize:'13px',color:DARK_T3}}>Selecciona acciones. El <span style={{color:DARK_T1,fontWeight:700}}>número indica el orden</span> — que importa.</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'24px'}}>
                {ACCIONES.map(({id,label,icon,desc})=>{
                  const sel   = accionesEl.includes(id);
                  const orden = accionesEl.indexOf(id)+1;
                  return (
                    <button key={id} className="dark-accion" onClick={()=>toggleAccion(id)}
                      style={{padding:'18px 20px',borderRadius:'12px',backgroundColor:sel?`${ACC}12`:'rgba(10,20,35,0.7)',border:`1.5px solid ${sel?ACC+'55':DARK_BD}`,color:DARK_T1,fontSize:'14px',fontWeight:sel?700:400,cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:'14px',boxShadow:sel?`0 0 16px ${ACC}20`:'none'}}>
                      <div style={{width:'38px',height:'38px',borderRadius:'10px',backgroundColor:sel?ACC:'rgba(26,48,80,.8)',border:`1px solid ${sel?ACC:DARK_BD}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:sel?'14px':'20px',fontWeight:800,color:'#fff',fontFamily:'monospace',transition:'all .2s'}}>
                        {sel ? orden : icon}
                      </div>
                      <div>
                        <div style={{fontSize:'13px',lineHeight:1.3,marginBottom:'3px',color:sel?DARK_T1:DARK_T2}}>{label}</div>
                        <div style={{fontSize:'11px',color:DARK_T3}}>{desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <span style={{fontSize:'12px',color:DARK_T3,fontFamily:'monospace'}}>{accionesEl.length} acciones seleccionadas</span>
                {accionesEl.length>0 && <button onClick={()=>setAccionesEl([])} style={{background:'none',border:'none',color:DARK_T3,fontSize:'12px',cursor:'pointer',fontFamily:'monospace'}}>Limpiar ×</button>}
              </div>
              <button onClick={()=>setEtapa('justificacion')} disabled={accionesEl.length===0}
                style={{width:'100%',padding:'18px',borderRadius:'12px',backgroundColor:accionesEl.length>0?ACC:DARK_BD,border:'none',color:DARK_T1,fontWeight:700,fontSize:'16px',cursor:accionesEl.length>0?'pointer':'not-allowed',opacity:accionesEl.length>0?1:.45,fontFamily:"'Syne',sans-serif"}}>
                Confirmar → Justificación final
              </button>
            </div>
          )}

          {/* ── JUSTIFICACIÓN ── */}
          {etapa === 'justificacion' && (
            <div className="fade-up">
              <div style={{marginBottom:'24px'}}>
                <h2 style={{fontSize:'24px',fontWeight:900,color:DARK_T1,marginBottom:'6px',fontFamily:"'Syne',sans-serif",letterSpacing:'-0.5px'}}>📝 Justificación Final</h2>
                <p style={{fontSize:'13px',color:DARK_T3}}>Tu razonamiento tiene <span style={{color:DARK_T1,fontWeight:700}}>mayor peso</span> en la puntuación que las acciones.</p>
              </div>

              {/* Resumen de decisiones */}
              <div style={{padding:'20px 22px',borderRadius:'12px',backgroundColor:DARK_CARD,border:`1px solid ${DARK_BD}`,marginBottom:'18px'}}>
                <p style={{fontSize:'10px',color:DARK_T3,fontFamily:'monospace',marginBottom:'14px',letterSpacing:'1px'}}>RESUMEN DE DECISIONES:</p>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <div style={{display:'flex',gap:'12px',alignItems:'baseline'}}>
                    <span style={{fontSize:'10px',color:DARK_T3,fontFamily:'monospace',width:'100px',flexShrink:0}}>DIAGNÓSTICO</span>
                    <span style={{fontSize:'14px',color:ACC,fontWeight:700}}>{diagEleg}</span>
                  </div>
                  <div style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                    <span style={{fontSize:'10px',color:DARK_T3,fontFamily:'monospace',width:'100px',flexShrink:0,paddingTop:'3px'}}>ACCIONES</span>
                    <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                      {accionesEl.map((id,i)=>{
                        const a = ACCIONES.find(x=>x.id===id);
                        return <span key={id} style={{fontSize:'11px',padding:'3px 8px',borderRadius:'5px',backgroundColor:`${ACC}10`,color:DARK_T2,border:`1px solid ${DARK_BD}`}}>{i+1}. {a?.icon} {a?.label}</span>;
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <textarea
                value={justif}
                onChange={e=>setJustif(e.target.value)}
                placeholder={`Justifica tu análisis:\n• ¿Por qué ese diagnóstico basándote en los logs?\n• ¿Por qué esas acciones en ese orden?\n• ¿Hay indicios de movimiento lateral o exfiltración?\n• ¿Escalarías? ¿Por qué?`}
                style={{width:'100%',height:'180px',padding:'18px',borderRadius:'12px',fontFamily:"'JetBrains Mono','Fira Code',monospace",fontSize:'13px',color:DARK_T2,backgroundColor:'rgba(8,21,37,.85)',border:`1.5px solid ${justif.trim()?ACC+'50':DARK_BD}`,resize:'vertical',lineHeight:1.8,marginBottom:'16px',display:'block'}}
              />

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <span style={{fontSize:'12px',color:justif.length>50?'#22c55e':DARK_T3,fontFamily:'monospace'}}>
                  {justif.length} caracteres {justif.length<50?`(mínimo recomendado: 50)`:'✓'}
                </span>
              </div>

              <button onClick={()=>enviar()} disabled={!justif.trim()}
                style={{width:'100%',padding:'20px',borderRadius:'12px',backgroundColor:justif.trim()?ACC:DARK_BD,border:'none',color:DARK_T1,fontWeight:800,fontSize:'17px',cursor:justif.trim()?'pointer':'not-allowed',opacity:justif.trim()?1:.45,display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',boxShadow:justif.trim()?`0 4px 24px ${ACC}35`:'none',fontFamily:"'Syne',sans-serif"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Enviar análisis completo
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}