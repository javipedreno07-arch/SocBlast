import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API  = 'https://socblast-production.up.railway.app';
const ACC  = '#4f46e5';

// Pantalla activa — oscura (consola SOC)
const DARK_BG   = '#03030A';
const DARK_CARD = 'rgba(14,26,46,0.92)';
const DARK_BD   = '#1A3050';
const DARK_T1   = '#FFFFFF';
const DARK_T2   = '#C8D8F0';
const DARK_T3   = '#5A7898';

const SEV = { CRITICA:'#ef4444', ALTA:'#f97316', MEDIA:'#f59e0b', BAJA:'#3b82f6' };

const ACCIONES = [
  { id:'aislar',      label:'Aislar host de la red',      icon:'🔌' },
  { id:'bloquear',    label:'Bloquear IP en firewall',    icon:'🛡️' },
  { id:'resetear',    label:'Resetear credenciales',      icon:'🔑' },
  { id:'escalar',     label:'Escalar a Tier 2',           icon:'📡' },
  { id:'forense',     label:'Preservar evidencias',       icon:'🔬' },
  { id:'notificar',   label:'Notificar al CISO',          icon:'📢' },
  { id:'playbook',    label:'Activar playbook IR',        icon:'📋' },
  { id:'monitorizar', label:'Monitorizar sin intervenir', icon:'👁️' },
];

const DIAG_POOL = [
  'Brute Force / Password Spray','Phishing con payload','Ransomware activo',
  'Movimiento lateral interno','Exfiltración de datos','Insider Threat',
  'Falso positivo — actividad legítima','DNS Tunneling / C2',
  'Escalada de privilegios','Supply Chain Attack',
];

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

  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [tiempoUsado,    setTiempoUsado]    = useState(0);
  const [evaluacion,     setEvaluacion]     = useState(null);
  const [resultado,      setResultado]      = useState(null);

  const opcionesDiagRef = useRef([]);
  const timerRef  = useRef(null);
  const inicioRef = useRef(null);
  const TIEMPOS   = { Bronce:1200, Plata:900, Oro:600, Elite:420 };

  const arena    = userData?.arena || 'Bronce';
  const tierArena= arena.includes('Diamante')?'Diamante':arena.includes('Oro')?'Oro':arena.includes('Plata')?'Plata':'Bronce';
  const ARENA_COLOR = { Bronce:'#d97706', Plata:'#94a3b8', Oro:'#f59e0b', Diamante:'#3b82f6' };
  const ac = ARENA_COLOR[tierArena] || ACC;

  useEffect(() => {
    axios.get(`${API}/api/me`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setUserData(r.data)).catch(()=>{});
  }, []);

  useEffect(() => {
    if (fase !== 'activa') return;
    inicioRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - inicioRef.current) / 1000);
      const lim     = TIEMPOS[sesion?.arena?.split(' ')[0] || 'Bronce'];
      const rest    = lim - elapsed;
      setTiempoRestante(rest);
      setTiempoUsado(elapsed);
      if (rest <= 0) { clearInterval(timerRef.current); enviar(true); }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [fase]);

  const incidente = sesion?.incidentes?.[incIdx];

  useEffect(() => {
    if (!incidente) return;
    const correcto   = incidente.solucion_correcta?.tipo_ataque || 'Ataque desconocido';
    const falsos     = DIAG_POOL.filter(d => d !== correcto).sort(()=>Math.random()-.5).slice(0,3);
    opcionesDiagRef.current = [...falsos, correcto].sort(()=>Math.random()-.5);
  }, [incIdx, sesion]);

  const fmt = s => `${Math.floor(Math.abs(s)/60)}:${(Math.abs(s)%60).toString().padStart(2,'0')}`;

  const resetEtapas = () => {
    setEtapa('triaje'); setTriaje({}); setLogsEleg([]); setDiagEleg(null);
    setAccionesEl([]); setJustif(''); setPistas(0); setPista(false);
  };

  const generar = async () => {
    setFase('cargando');
    try {
      const r = await axios.post(`${API}/api/sesiones/generar`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      setSesion(r.data);
      setTiempoRestante(TIEMPOS[r.data.arena?.split(' ')[0] || 'Bronce']);
      setFase('briefing');
    } catch { alert('Error generando sesión'); setFase('intro'); }
  };

  const enviar = async (timeout = false) => {
    setFase('evaluando');
    clearInterval(timerRef.current);
    const txt = `TRIAJE:${JSON.stringify(triaje)}|LOGS:${logsEleg.join(',')}|DIAG:${diagEleg}|ACCIONES:${accionesEl.join(',')}|JUST:${justif||'Sin justificación'}`;
    try {
      const r = await axios.post(`${API}/api/sesiones/${sesion._id}/responder`, null,
        { params:{ incidente_id:incIdx+1, respuesta:txt, tiempo_usado:tiempoUsado, pistas_usadas:pistas }, headers:{ Authorization:`Bearer ${token}` } }
      );
      setEvaluacion(r.data); setFase('feedback');
    } catch { setFase('activa'); }
  };

  const siguiente = () => {
    if (incIdx+1 < sesion.incidentes.length) {
      setIncIdx(i=>i+1); setEvaluacion(null); resetEtapas();
      inicioRef.current = Date.now(); setFase('activa');
    } else { finalizar(); }
  };

  const finalizar = async () => {
    try {
      const r = await axios.post(`${API}/api/sesiones/${sesion._id}/finalizar`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      setResultado(r.data); setFase('finalizada');
    } catch { alert('Error finalizando'); }
  };

  const toggleLog    = i  => setLogsEleg(p => p.includes(i)?p.filter(x=>x!==i):p.length<4?[...p,i]:p);
  const toggleAccion = id => setAccionesEl(p => p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const ETAPAS = ['triaje','logs','diagnostico','acciones','justificacion'];
  const etapaIdx = ETAPAS.indexOf(etapa);

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px ${ACC}40;}50%{box-shadow:0 0 40px ${ACC}60;}}
    @keyframes timerWarn{0%,100%{background:rgba(239,68,68,.12);}50%{background:rgba(239,68,68,.22);}}
    .fade-up{animation:fadeUp .35s ease forwards;}
    .glow-btn{animation:glow 3s ease-in-out infinite;}
    .glow-btn:hover{filter:brightness(1.1);transform:translateY(-2px)!important;}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    .dark-log:hover{border-color:rgba(79,70,229,.4)!important;}
    .dark-accion:hover{border-color:rgba(79,70,229,.5)!important;background:rgba(79,70,229,.08)!important;}
    *{transition:transform .18s ease,box-shadow .18s ease,border-color .15s ease,background .15s ease,color .15s ease;}
  `;

  // Navbar claro (para pantallas fuera de la sesión activa)
  const NavbarClaro = ({right, center}) => (
    <nav style={{height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 36px',backgroundColor:'rgba(255,255,255,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
      <img src="/logosoc.png" style={{height:'28px',cursor:'pointer'}} onClick={()=>navigate('/dashboard')}/>
      {center && <span style={{fontSize:'13px',color:'#64748b'}}>{center}</span>}
      {right}
    </nav>
  );

  // ── INTRO ──
  if (fase==='intro') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',fontFamily:"'Inter',-apple-system,sans-serif"}}>
        <NavbarClaro right={
          <button className="nav-btn" onClick={()=>navigate('/dashboard')} style={{background:'none',border:'1px solid #e2e8f0',color:'#64748b',padding:'6px 14px',borderRadius:'8px',fontSize:'12px',cursor:'pointer'}}>← Dashboard</button>
        }/>
        <div style={{maxWidth:'680px',margin:'0 auto',padding:'52px 28px'}}>
          <div className="fade-up">
            <div style={{textAlign:'center',marginBottom:'36px'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'6px 16px',borderRadius:'100px',border:`1.5px solid ${ac}30`,backgroundColor:`${ac}08`,marginBottom:'22px'}}>
                <div style={{width:'7px',height:'7px',borderRadius:'50%',backgroundColor:ac,animation:'pulse 2s infinite'}}/>
                <span style={{fontSize:'11px',color:ac,fontWeight:700,letterSpacing:'2px'}}>{arena.toUpperCase()} · SOC PLATFORM</span>
              </div>
              <h1 style={{fontSize:'46px',fontWeight:900,letterSpacing:'-2px',color:'#0f172a',marginBottom:'12px',lineHeight:1}}>Sesión SOC</h1>
              <p style={{fontSize:'16px',color:'#64748b',lineHeight:1.7}}>La IA generará un escenario real de seguridad.<br/>Investiga, decide y actúa como analista profesional.</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'28px'}}>
              {[
                {label:'Arena',     value:arena,                                                               color:ac},
                {label:'Tiempo',    value:{Bronce:'20 min',Plata:'15 min',Oro:'10 min',Diamante:'7 min'}[tierArena]||'20 min', color:'#22c55e'},
                {label:'Incidentes',value:{Bronce:'3',Plata:'3',Oro:'4',Diamante:'5'}[tierArena]||'3',        color:'#0f172a'},
                {label:'XP máx',    value:{Bronce:'50',Plata:'100',Oro:'200',Diamante:'400'}[tierArena]||'50', color:ACC},
              ].map((c,i)=>(
                <div key={i} style={{padding:'18px 14px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',textAlign:'center'}}>
                  <div style={{fontSize:'20px',fontWeight:800,color:c.color,marginBottom:'5px'}}>{c.value}</div>
                  <div style={{fontSize:'12px',color:'#94a3b8'}}>{c.label}</div>
                </div>
              ))}
            </div>

            <div style={{padding:'22px 24px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:'28px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
              <p style={{fontSize:'11px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:'16px'}}>MECÁNICA — CADA INCIDENTE</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {[
                  {n:'01',t:'Triaje',      d:'Clasifica la severidad de cada alerta',           c:'#ef4444'},
                  {n:'02',t:'Logs',        d:'Selecciona los logs más relevantes (máx 4)',       c:'#f97316'},
                  {n:'03',t:'Diagnóstico', d:'Identifica el tipo de ataque entre 4 opciones',   c:'#f59e0b'},
                  {n:'04',t:'Respuesta',   d:'Elige las acciones de contención',                 c:'#22c55e'},
                  {n:'05',t:'Justifica',   d:'Explica tu razonamiento — mayor peso',            c:ACC},
                ].map((m,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'14px',padding:'12px 14px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0'}}>
                    <div style={{width:'32px',height:'32px',borderRadius:'8px',backgroundColor:`${m.c}10`,border:`1px solid ${m.c}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:'11px',fontWeight:900,color:m.c}}>{m.n}</span>
                    </div>
                    <div>
                      <p style={{fontSize:'14px',fontWeight:700,color:'#0f172a',marginBottom:'2px'}}>{m.t}</p>
                      <p style={{fontSize:'12px',color:'#64748b'}}>{m.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="glow-btn" onClick={generar}
              style={{width:'100%',padding:'20px',borderRadius:'14px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'17px',fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',boxShadow:`0 8px 32px ${ACC}30`}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Generar y comenzar sesión SOC
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ── CARGANDO ──
  if (fase==='cargando') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',-apple-system,sans-serif"}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:48,height:48,border:`3px solid #e2e8f0`,borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 20px'}}/>
          <p style={{color:ACC,fontSize:'15px',marginBottom:'6px',fontWeight:600}}>Generando escenario SOC...</p>
          <p style={{color:'#94a3b8',fontSize:'12px'}}>IA construyendo amenazas · {arena}</p>
        </div>
      </div>
    </>
  );

  // ── BRIEFING ──
  if (fase==='briefing') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)',fontFamily:"'Inter',-apple-system,sans-serif",display:'flex',flexDirection:'column'}}>
        <NavbarClaro right={<button onClick={()=>setFase('intro')} style={{background:'none',border:'1px solid #e2e8f0',color:'#64748b',padding:'6px 14px',borderRadius:'8px',fontSize:'12px',cursor:'pointer'}}>✕ Cancelar</button>}/>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'32px 24px'}}>
          <div className="fade-up" style={{maxWidth:'600px',width:'100%'}}>
            <div style={{padding:'36px',borderRadius:'20px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 8px 32px rgba(0,0,0,0.08)',position:'relative',overflow:'hidden'}}>
              <div style={{height:'3px',background:`linear-gradient(90deg,${ACC},#818cf8)`,borderRadius:'4px',marginBottom:'24px'}}/>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',backgroundColor:'#ef4444',animation:'pulse 1s infinite'}}/>
                <span style={{color:'#94a3b8',fontSize:'11px',letterSpacing:'2px',fontWeight:600}}>NUEVA MISIÓN ASIGNADA</span>
              </div>
              <h1 style={{fontSize:'24px',fontWeight:800,color:'#0f172a',marginBottom:'18px',letterSpacing:'-0.5px',lineHeight:1.3}}>{sesion?.titulo}</h1>
              <div style={{padding:'16px 18px',borderRadius:'12px',backgroundColor:'#f0fdf4',border:'1px solid #bbf7d0',marginBottom:'22px'}}>
                <p style={{fontSize:'11px',color:'#16a34a',fontWeight:600,marginBottom:'7px'}}>CONTEXTO DEL ENTORNO:</p>
                <p style={{fontSize:'13px',color:'#15803d',lineHeight:1.75}}>{sesion?.contexto}</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'26px'}}>
                {[
                  {label:'Incidentes',value:sesion?.incidentes?.length},
                  {label:'Arena',     value:sesion?.arena},
                  {label:'Tiempo',    value:fmt(tiempoRestante)},
                ].map((s,i)=>(
                  <div key={i} style={{padding:'16px',borderRadius:'12px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0',textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:800,color:'#0f172a',marginBottom:'4px'}}>{s.value}</div>
                    <div style={{fontSize:'12px',color:'#94a3b8'}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{resetEtapas();setFase('activa');}}
                style={{width:'100%',padding:'16px',borderRadius:'12px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'16px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 20px ${ACC}30`,display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                INICIAR SESIÓN SOC
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── EVALUANDO ──
  if (fase==='evaluando') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',-apple-system,sans-serif"}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:48,height:48,border:`3px solid #e2e8f0`,borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 18px'}}/>
          <p style={{color:ACC,fontSize:'15px',marginBottom:'6px',fontWeight:600}}>IA evaluando tu respuesta...</p>
          <p style={{color:'#94a3b8',fontSize:'12px'}}>Analizando decisiones · Calculando puntuación</p>
        </div>
      </div>
    </>
  );

  // ── FEEDBACK ──
  if (fase==='feedback' && evaluacion) {
    const scoreColor = evaluacion.total>=14?'#22c55e':evaluacion.total>=8?'#f59e0b':'#ef4444';
    const scoreBg    = evaluacion.total>=14?'#f0fdf4':evaluacion.total>=8?'#fffbeb':'#fef2f2';
    const scoreBd    = evaluacion.total>=14?'#bbf7d0':evaluacion.total>=8?'#fde68a':'#fecaca';
    return (
      <>
        <style>{css}</style>
        <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)',fontFamily:"'Inter',-apple-system,sans-serif"}}>
          <NavbarClaro center={`Incidente ${incIdx+1} / ${sesion?.incidentes?.length}`} right={<span/>}/>
          <div style={{maxWidth:'700px',margin:'0 auto',padding:'36px 28px'}}>
            <div className="fade-up">
              <div style={{padding:'32px',borderRadius:'20px',backgroundColor:'#fff',border:`1.5px solid ${scoreBd}`,boxShadow:'0 8px 32px rgba(0,0,0,0.08)',marginBottom:'16px',position:'relative',overflow:'hidden'}}>
                <div style={{height:'3px',background:`linear-gradient(90deg,${scoreColor},${scoreColor}60)`,borderRadius:'4px',marginBottom:'24px'}}/>

                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'24px'}}>
                  <div>
                    <h2 style={{fontSize:'20px',fontWeight:800,color:'#0f172a',marginBottom:'5px'}}>Resultado — Incidente {incIdx+1}</h2>
                    <p style={{fontSize:'13px',color:'#64748b'}}>{evaluacion.total>=14?'🟢 Excelente análisis':evaluacion.total>=8?'🟡 Buen trabajo':'🔴 Necesita mejorar'}</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'48px',fontWeight:900,color:scoreColor,letterSpacing:'-2px',lineHeight:1}}>{evaluacion.total}</div>
                    <div style={{fontSize:'13px',color:'#94a3b8'}}>/20 pts</div>
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
                  {[
                    {label:'Calidad análisis',value:`${evaluacion.puntuacion_calidad}/12`,color:'#22c55e'},
                    {label:'Velocidad',        value:`${evaluacion.puntuacion_velocidad}/5`, color:'#f59e0b'},
                    {label:'Sin pistas',       value:`${evaluacion.puntuacion_pistas}/3`,   color:ACC},
                  ].map((s,i)=>(
                    <div key={i} style={{padding:'16px',borderRadius:'12px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0',textAlign:'center'}}>
                      <div style={{fontSize:'24px',fontWeight:900,color:s.color,marginBottom:'5px'}}>{s.value}</div>
                      <div style={{fontSize:'12px',color:'#64748b'}}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{padding:'16px 18px',borderRadius:'12px',backgroundColor:`${ACC}06`,border:`1px solid ${ACC}15`,marginBottom:'12px'}}>
                  <p style={{fontSize:'11px',color:'#64748b',fontWeight:700,letterSpacing:'1.5px',marginBottom:'8px'}}>FEEDBACK IA</p>
                  <p style={{fontSize:'15px',color:'#0f172a',lineHeight:1.75}}>{evaluacion.feedback}</p>
                </div>

                <div style={{padding:'16px 18px',borderRadius:'12px',backgroundColor:'#f0fdf4',border:'1px solid #bbf7d0'}}>
                  <p style={{fontSize:'11px',color:'#16a34a',fontWeight:700,letterSpacing:'1.5px',marginBottom:'8px'}}>SOLUCIÓN CORRECTA</p>
                  <p style={{fontSize:'15px',color:'#15803d',lineHeight:1.75}}>{evaluacion.solucion_explicada}</p>
                </div>
              </div>

              <button onClick={siguiente}
                style={{width:'100%',padding:'16px',borderRadius:'12px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'16px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 20px ${ACC}30`}}>
                {incIdx+1 < sesion.incidentes.length ? '→ Siguiente incidente' : '🏁 Finalizar sesión'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── FINALIZADA ──
  if (fase==='finalizada' && resultado) return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)',display:'flex',alignItems:'center',justifyContent:'center',padding:'28px',fontFamily:"'Inter',-apple-system,sans-serif"}}>
        <div className="fade-up" style={{maxWidth:'500px',width:'100%',padding:'44px',borderRadius:'24px',backgroundColor:'#fff',border:'1px solid #e8eaf0',textAlign:'center',boxShadow:'0 16px 48px rgba(0,0,0,0.1)',position:'relative',overflow:'hidden'}}>
          <div style={{height:'3px',background:`linear-gradient(90deg,${ACC},#818cf8)`,borderRadius:'4px',marginBottom:'24px'}}/>
          <div style={{fontSize:'52px',marginBottom:'14px'}}>🏆</div>
          <h1 style={{fontSize:'28px',fontWeight:900,color:'#0f172a',marginBottom:'6px',letterSpacing:'-0.8px'}}>Sesión Completada</h1>
          <p style={{fontSize:'13px',color:'#94a3b8',marginBottom:'28px'}}>Has investigado todos los incidentes</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'28px'}}>
            {[
              {label:'Copas',  value:`${resultado.copas_ganadas>0?'+':''}${resultado.copas_ganadas}`, color:'#f59e0b'},
              {label:'XP',     value:`+${resultado.xp_ganada}`,                                        color:'#22c55e'},
              {label:'Media',  value:`${resultado.media_puntuacion}/20`,                               color:ACC},
              {label:'Arena',  value:resultado.arena,                                                  color:ac},
            ].map((s,i)=>(
              <div key={i} style={{padding:'18px',borderRadius:'14px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0'}}>
                <div style={{fontSize:'24px',fontWeight:900,color:s.color,marginBottom:'4px',letterSpacing:'-0.5px'}}>{s.value}</div>
                <div style={{fontSize:'12px',color:'#94a3b8'}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'12px'}}>
            <button onClick={()=>navigate('/dashboard')} style={{flex:1,padding:'14px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#475569',fontSize:'14px',fontWeight:500,cursor:'pointer'}}>← Dashboard</button>
            <button onClick={()=>{setSesion(null);setIncIdx(0);resetEtapas();setFase('intro');}} style={{flex:1,padding:'14px',borderRadius:'10px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'14px',fontWeight:700,cursor:'pointer'}}>Nueva ⚡</button>
          </div>
        </div>
      </div>
    </>
  );

  // ── ACTIVA — consola oscura (igual que antes) ──
  if (fase !== 'activa' || !incidente) return null;

  const triajeCompleto = Object.keys(triaje).length >= (incidente.alertas?.length||0);
  const diagOpts       = opcionesDiagRef.current;

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',backgroundColor:DARK_BG,fontFamily:"'Inter',-apple-system,sans-serif",color:DARK_T1,display:'flex',flexDirection:'column'}}>

        {/* Header oscuro */}
        <div style={{height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',backgroundColor:'rgba(8,21,37,.95)',backdropFilter:'blur(20px)',borderBottom:`1px solid ${DARK_BD}`,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <img src="/logosoc.png" style={{height:'26px',cursor:'pointer'}} onClick={()=>navigate('/dashboard')}/>
            <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
              {ETAPAS.map((e,i)=>(
                <div key={i} style={{width:i===etapaIdx?'28px':'10px',height:'6px',borderRadius:'3px',backgroundColor:i<etapaIdx?'#22c55e':i===etapaIdx?ACC:DARK_BD,boxShadow:i===etapaIdx?`0 0 8px ${ACC}`:'none'}}/>
              ))}
            </div>
            <span style={{fontSize:'11px',color:DARK_T3,letterSpacing:'1px'}}>
              {{triaje:'TRIAJE',logs:'LOGS',diagnostico:'DIAGNÓSTICO',acciones:'RESPUESTA',justificacion:'JUSTIFICACIÓN'}[etapa]}
            </span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <span style={{fontSize:'12px',color:DARK_T3}}>INC {incIdx+1}/{sesion?.incidentes?.length}</span>
            <div style={{padding:'5px 14px',borderRadius:'7px',backgroundColor:tiempoRestante<60?undefined:'rgba(34,197,94,.08)',border:`1px solid ${tiempoRestante<60?'rgba(239,68,68,.4)':'rgba(34,197,94,.2)'}`,animation:tiempoRestante<60?'timerWarn 1s infinite':undefined}}>
              <span style={{fontFamily:'monospace',fontSize:'15px',fontWeight:700,color:tiempoRestante<60?'#ef4444':'#22c55e'}}>⏱ {fmt(tiempoRestante)}</span>
            </div>
          </div>
        </div>

        <div style={{flex:1,maxWidth:'900px',margin:'0 auto',width:'100%',padding:'32px 28px 48px'}}>
          <div style={{padding:'14px 18px',borderRadius:'10px',backgroundColor:`${ACC}08`,border:`1px solid ${ACC}25`,marginBottom:'28px'}}>
            <p style={{fontSize:'11px',color:ACC,marginBottom:'5px',letterSpacing:'1px'}}>INCIDENTE ACTIVO · {incidente?.titulo}</p>
            <p style={{fontSize:'15px',color:DARK_T2,lineHeight:1.7}}>{incidente?.descripcion}</p>
          </div>

          {/* TRIAJE */}
          {etapa==='triaje' && (
            <div className="fade-up">
              <div style={{marginBottom:'22px'}}>
                <h2 style={{fontSize:'22px',fontWeight:800,color:DARK_T1,marginBottom:'6px'}}>🚨 Etapa 1 — Triaje de Alertas</h2>
                <p style={{fontSize:'14px',color:DARK_T3}}>Clasifica la severidad de cada alerta.</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'28px'}}>
                {incidente.alertas?.map((alerta,i)=>(
                  <div key={i} style={{padding:'20px 22px',borderRadius:'12px',backgroundColor:DARK_CARD,border:`1px solid ${triaje[alerta.id]?SEV[triaje[alerta.id]]+'45':DARK_BD}`,backdropFilter:'blur(10px)',position:'relative',overflow:'hidden'}}>
                    {triaje[alerta.id] && <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',backgroundColor:SEV[triaje[alerta.id]]}}/>}
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'16px'}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
                          <span style={{fontSize:'11px',color:DARK_T3,fontFamily:'monospace',backgroundColor:'rgba(8,21,37,.8)',padding:'2px 8px',borderRadius:'4px',border:`1px solid ${DARK_BD}`}}>{alerta.id}</span>
                          <span style={{fontSize:'15px',fontWeight:700,color:DARK_T1}}>{alerta.sistema}</span>
                        </div>
                        <p style={{fontSize:'14px',color:DARK_T2,lineHeight:1.6,marginBottom:'6px'}}>{alerta.descripcion}</p>
                        <p style={{fontSize:'12px',color:DARK_T3,fontFamily:'monospace'}}>{alerta.timestamp}</p>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:'6px',flexShrink:0}}>
                        {['CRITICA','ALTA','MEDIA','BAJA'].map(sev=>(
                          <button key={sev} onClick={()=>setTriaje(p=>({...p,[alerta.id]:sev}))}
                            style={{padding:'7px 12px',borderRadius:'7px',fontSize:'11px',fontWeight:700,fontFamily:'monospace',cursor:'pointer',minWidth:'72px',backgroundColor:triaje[alerta.id]===sev?SEV[sev]+'25':'rgba(8,21,37,.8)',border:`1px solid ${triaje[alerta.id]===sev?SEV[sev]:DARK_BD}`,color:triaje[alerta.id]===sev?SEV[sev]:DARK_T3}}>
                            {sev}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setEtapa('logs')} disabled={!triajeCompleto}
                style={{width:'100%',padding:'16px',borderRadius:'11px',backgroundColor:triajeCompleto?ACC:DARK_BD,border:'none',color:DARK_T1,fontWeight:700,fontSize:'16px',cursor:triajeCompleto?'pointer':'not-allowed',opacity:triajeCompleto?1:.5}}>
                Confirmar triaje → Investigar logs ({Object.keys(triaje).length}/{incidente.alertas?.length})
              </button>
            </div>
          )}

          {/* LOGS */}
          {etapa==='logs' && (
            <div className="fade-up">
              <div style={{marginBottom:'22px'}}>
                <h2 style={{fontSize:'22px',fontWeight:800,color:DARK_T1,marginBottom:'6px'}}>🔍 Etapa 2 — Investigación de Logs</h2>
                <p style={{fontSize:'14px',color:DARK_T3}}>Selecciona hasta <strong style={{color:DARK_T1}}>4 logs</strong> relevantes.</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
                {incidente.logs?.map((log,i)=>{
                  const sel    = logsEleg.includes(i);
                  const locked = !sel && logsEleg.length>=4;
                  return (
                    <div key={i} className={locked?'':'dark-log'} onClick={()=>!locked&&toggleLog(i)}
                      style={{padding:'14px 16px',borderRadius:'11px',backgroundColor:sel?`${ACC}12`:'rgba(8,21,37,.7)',border:`1px solid ${sel?ACC+'55':DARK_BD}`,cursor:locked?'not-allowed':'pointer',opacity:locked?.35:1,position:'relative',overflow:'hidden'}}>
                      {sel && <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,transparent,${ACC},transparent)`}}/>}
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                        <span style={{fontSize:'11px',fontWeight:700,fontFamily:'monospace',color:log.nivel==='ERROR'?'#ef4444':log.nivel==='WARNING'?'#f97316':DARK_T3}}>{log.nivel}</span>
                        <span style={{fontSize:'11px',color:DARK_T3,fontFamily:'monospace'}}>{log.timestamp}</span>
                      </div>
                      <p style={{fontSize:'13px',color:sel?DARK_T2:DARK_T3,lineHeight:1.55}}>{log.mensaje}</p>
                    </div>
                  );
                })}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'14px'}}>
                <span style={{fontSize:'13px',color:DARK_T3,fontFamily:'monospace'}}>{logsEleg.length}/4 seleccionados</span>
                {logsEleg.length>0 && <button onClick={()=>setLogsEleg([])} style={{background:'none',border:'none',color:DARK_T3,fontSize:'12px',cursor:'pointer'}}>Limpiar</button>}
              </div>
              <button onClick={()=>setEtapa('diagnostico')} disabled={logsEleg.length===0}
                style={{width:'100%',padding:'16px',borderRadius:'11px',backgroundColor:logsEleg.length>0?ACC:DARK_BD,border:'none',color:DARK_T1,fontWeight:700,fontSize:'16px',cursor:logsEleg.length>0?'pointer':'not-allowed',opacity:logsEleg.length>0?1:.5}}>
                Confirmar → Diagnóstico
              </button>
            </div>
          )}

          {/* DIAGNÓSTICO */}
          {etapa==='diagnostico' && (
            <div className="fade-up">
              <div style={{marginBottom:'22px'}}>
                <h2 style={{fontSize:'22px',fontWeight:800,color:DARK_T1,marginBottom:'6px'}}>🎯 Etapa 3 — Diagnóstico</h2>
                <p style={{fontSize:'14px',color:DARK_T3}}>¿Qué tipo de amenaza estás viendo?</p>
              </div>
              <div style={{padding:'14px 16px',borderRadius:'10px',backgroundColor:'rgba(8,21,37,.8)',border:`1px solid ${DARK_BD}`,marginBottom:'22px'}}>
                <p style={{fontSize:'11px',color:DARK_T3,marginBottom:'10px',letterSpacing:'1px'}}>ALERTAS CRÍTICAS Y ALTAS:</p>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  {Object.entries(triaje).filter(([,v])=>v==='CRITICA'||v==='ALTA').map(([id,sev])=>(
                    <span key={id} style={{fontSize:'12px',padding:'4px 10px',borderRadius:'6px',backgroundColor:SEV[sev]+'15',color:SEV[sev],border:`1px solid ${SEV[sev]}35`,fontFamily:'monospace',fontWeight:700}}>{id} · {sev}</span>
                  ))}
                  {Object.entries(triaje).filter(([,v])=>v==='CRITICA'||v==='ALTA').length===0 &&
                    <span style={{fontSize:'13px',color:DARK_T3}}>Ninguna alerta crítica o alta</span>
                  }
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'22px'}}>
                {diagOpts.map((op,i)=>(
                  <button key={i} onClick={()=>setDiagEleg(op)}
                    style={{padding:'20px 18px',borderRadius:'12px',backgroundColor:diagEleg===op?`${ACC}15`:'rgba(8,21,37,.8)',border:`1px solid ${diagEleg===op?ACC:DARK_BD}`,color:diagEleg===op?DARK_T1:DARK_T2,fontSize:'14px',fontWeight:600,cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:'12px'}}>
                    <div style={{width:'22px',height:'22px',borderRadius:'50%',border:`2px solid ${diagEleg===op?ACC:DARK_BD}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {diagEleg===op && <div style={{width:'10px',height:'10px',borderRadius:'50%',backgroundColor:ACC}}/>}
                    </div>
                    <span style={{lineHeight:1.4}}>{op}</span>
                  </button>
                ))}
              </div>
              {pista && (
                <div style={{padding:'14px 16px',borderRadius:'10px',backgroundColor:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.2)',marginBottom:'16px'}}>
                  <p style={{fontSize:'14px',color:'#f59e0b',lineHeight:1.6}}>💡 <strong>Pista:</strong> Busca patrones de {incidente?.solucion_correcta?.tipo_ataque?.split(' ')[0]} en alertas de mayor severidad.</p>
                </div>
              )}
              <div style={{display:'flex',gap:'10px'}}>
                {!pista && (
                  <button onClick={()=>{setPistas(p=>p+1);setPista(true);}}
                    style={{padding:'14px 18px',borderRadius:'11px',backgroundColor:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.25)',color:'#f59e0b',fontSize:'14px',fontWeight:600,cursor:'pointer',flexShrink:0}}>
                    💡 Pista
                  </button>
                )}
                <button onClick={()=>setEtapa('acciones')} disabled={!diagEleg}
                  style={{flex:1,padding:'14px',borderRadius:'11px',backgroundColor:diagEleg?ACC:DARK_BD,border:'none',color:DARK_T1,fontWeight:700,fontSize:'16px',cursor:diagEleg?'pointer':'not-allowed',opacity:diagEleg?1:.5}}>
                  Confirmar → Respuesta
                </button>
              </div>
            </div>
          )}

          {/* ACCIONES */}
          {etapa==='acciones' && (
            <div className="fade-up">
              <div style={{marginBottom:'22px'}}>
                <h2 style={{fontSize:'22px',fontWeight:800,color:DARK_T1,marginBottom:'6px'}}>⚡ Etapa 4 — Plan de Respuesta</h2>
                <p style={{fontSize:'14px',color:DARK_T3}}>Selecciona acciones. El <strong style={{color:DARK_T1}}>orden importa</strong>.</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'24px'}}>
                {ACCIONES.map(({id,label,icon})=>{
                  const sel   = accionesEl.includes(id);
                  const orden = accionesEl.indexOf(id)+1;
                  return (
                    <button key={id} className="dark-accion" onClick={()=>toggleAccion(id)}
                      style={{padding:'16px 18px',borderRadius:'12px',backgroundColor:sel?`${ACC}12`:'rgba(8,21,37,.8)',border:`1px solid ${sel?ACC+'55':DARK_BD}`,color:sel?DARK_T1:DARK_T2,fontSize:'14px',fontWeight:sel?600:400,cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:'12px'}}>
                      <div style={{width:'36px',height:'36px',borderRadius:'9px',backgroundColor:sel?ACC:'rgba(26,48,80,.8)',border:`1px solid ${sel?ACC:DARK_BD}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:sel?'13px':'18px',fontWeight:800,color:DARK_T1,fontFamily:'monospace'}}>
                        {sel ? orden : icon}
                      </div>
                      <span style={{lineHeight:1.4}}>{label}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'14px'}}>
                <span style={{fontSize:'13px',color:DARK_T3,fontFamily:'monospace'}}>{accionesEl.length} seleccionadas</span>
                {accionesEl.length>0 && <button onClick={()=>setAccionesEl([])} style={{background:'none',border:'none',color:DARK_T3,fontSize:'12px',cursor:'pointer'}}>Limpiar</button>}
              </div>
              <button onClick={()=>setEtapa('justificacion')} disabled={accionesEl.length===0}
                style={{width:'100%',padding:'16px',borderRadius:'11px',backgroundColor:accionesEl.length>0?ACC:DARK_BD,border:'none',color:DARK_T1,fontWeight:700,fontSize:'16px',cursor:accionesEl.length>0?'pointer':'not-allowed',opacity:accionesEl.length>0?1:.5}}>
                Confirmar → Justificación
              </button>
            </div>
          )}

          {/* JUSTIFICACIÓN */}
          {etapa==='justificacion' && (
            <div className="fade-up">
              <div style={{marginBottom:'22px'}}>
                <h2 style={{fontSize:'22px',fontWeight:800,color:DARK_T1,marginBottom:'6px'}}>📝 Etapa 5 — Justificación Final</h2>
                <p style={{fontSize:'14px',color:DARK_T3}}>Explica tu razonamiento. <strong style={{color:DARK_T1}}>Mayor peso en la puntuación.</strong></p>
              </div>
              <div style={{padding:'18px 20px',borderRadius:'12px',backgroundColor:DARK_CARD,border:`1px solid ${DARK_BD}`,backdropFilter:'blur(10px)',marginBottom:'18px'}}>
                <p style={{fontSize:'10px',color:DARK_T3,fontFamily:'monospace',marginBottom:'12px',letterSpacing:'1px'}}>TUS DECISIONES</p>
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  <div style={{display:'flex',gap:'12px'}}>
                    <span style={{fontSize:'11px',color:DARK_T3,fontFamily:'monospace',width:'90px',flexShrink:0}}>DIAGNÓSTICO</span>
                    <span style={{fontSize:'14px',color:ACC,fontWeight:700}}>{diagEleg}</span>
                  </div>
                  <div style={{display:'flex',gap:'12px'}}>
                    <span style={{fontSize:'11px',color:DARK_T3,fontFamily:'monospace',width:'90px',flexShrink:0,paddingTop:'3px'}}>ACCIONES</span>
                    <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                      {accionesEl.map((id,i)=>{
                        const a = ACCIONES.find(x=>x.id===id);
                        return <span key={id} style={{fontSize:'11px',padding:'3px 8px',borderRadius:'5px',backgroundColor:`${ACC}12`,color:DARK_T2,border:`1px solid ${DARK_BD}`}}>{i+1}. {a?.icon} {a?.label}</span>;
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <textarea value={justif} onChange={e=>setJustif(e.target.value)}
                placeholder={`Tu análisis:\n• ¿Por qué ese diagnóstico?\n• ¿Por qué esas acciones?\n• ¿Escalarías?`}
                style={{width:'100%',height:'160px',padding:'16px',borderRadius:'12px',fontFamily:'monospace',fontSize:'14px',color:DARK_T2,backgroundColor:'rgba(8,21,37,.8)',border:`1px solid ${justif.trim()?ACC+'50':DARK_BD}`,resize:'none',outline:'none',lineHeight:1.75,marginBottom:'16px'}}/>
              <button onClick={()=>enviar()} disabled={!justif.trim()}
                style={{width:'100%',padding:'18px',borderRadius:'12px',backgroundColor:justif.trim()?ACC:DARK_BD,border:'none',color:DARK_T1,fontWeight:800,fontSize:'17px',cursor:justif.trim()?'pointer':'not-allowed',opacity:justif.trim()?1:.5,display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
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