import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BG   = '#03030A';
const CARD = 'rgba(14,26,46,0.92)';
const BD   = '#1A3050';
const T1   = '#FFFFFF';
const T2   = '#C8D8F0';
const T3   = '#5A7898';
const ACC  = '#2564F1';

const SEV  = { CRITICA:'#EF4444', ALTA:'#F97316', MEDIA:'#F59E0B', BAJA:'#3B82F6' };

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
  'Brute Force / Password Spray',
  'Phishing con payload',
  'Ransomware activo',
  'Movimiento lateral interno',
  'Exfiltración de datos',
  'Insider Threat',
  'Falso positivo — actividad legítima',
  'DNS Tunneling / C2',
  'Escalada de privilegios',
  'Supply Chain Attack',
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
  const arena     = userData?.arena || 'Bronce';
  const ARENA_COLOR = { Bronce:'#CD7F32', Plata:'#94A3B8', Oro:'#F59E0B', Elite:'#A78BFA' };
  const ac        = ARENA_COLOR[arena] || ACC;

  useEffect(() => {
    axios.get('https://socblast-production.up.railway.app/api/me', { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setUserData(r.data)).catch(()=>{});
  }, []);

  useEffect(() => {
    if (fase !== 'activa') return;
    inicioRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - inicioRef.current) / 1000);
      const lim = TIEMPOS[sesion?.arena || 'Bronce'];
      const rest = lim - elapsed;
      setTiempoRestante(rest);
      setTiempoUsado(elapsed);
      if (rest <= 0) { clearInterval(timerRef.current); enviar(true); }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [fase]);

  const incidente = sesion?.incidentes?.[incIdx];

  useEffect(() => {
    if (!incidente) return;
    const correcto = incidente.solucion_correcta?.tipo_ataque || 'Ataque desconocido';
    const falsosPool = DIAG_POOL.filter(d => d !== correcto);
    const falsos = falsosPool.sort(() => Math.random() - 0.5).slice(0, 3);
    const fallback = ['Falso positivo — actividad legítima', 'Insider Threat', 'DNS Tunneling / C2', 'Supply Chain Attack'];
    while (falsos.length < 3) {
      const f = fallback.find(x => !falsos.includes(x) && x !== correcto);
      if (f) falsos.push(f); else break;
    }
    const opts = [...falsos, correcto].sort(() => Math.random() - 0.5);
    opcionesDiagRef.current = opts;
  }, [incIdx, sesion]);

  const fmt = s => `${Math.floor(Math.abs(s)/60)}:${(Math.abs(s)%60).toString().padStart(2,'0')}`;

  const resetEtapas = () => {
    setEtapa('triaje'); setTriaje({}); setLogsEleg([]); setDiagEleg(null);
    setAccionesEl([]); setJustif(''); setPistas(0); setPista(false);
  };

  const generar = async () => {
    setFase('cargando');
    try {
      const r = await axios.post('https://socblast-production.up.railway.app/api/sesiones/generar', {}, { headers:{ Authorization:`Bearer ${token}` } });
      setSesion(r.data);
      setTiempoRestante(TIEMPOS[r.data.arena || 'Bronce']);
      setFase('briefing');
    } catch { alert('Error generando sesión'); setFase('intro'); }
  };

  const enviar = async (timeout = false) => {
    setFase('evaluando');
    clearInterval(timerRef.current);
    const txt = `TRIAJE:${JSON.stringify(triaje)}|LOGS:${logsEleg.join(',')}|DIAG:${diagEleg}|ACCIONES:${accionesEl.join(',')}|JUST:${justif||'Sin justificación'}`;
    try {
      const r = await axios.post(
        `https://socblast-production.up.railway.app/api/sesiones/${sesion._id}/responder`, null,
        { params:{ incidente_id: incIdx+1, respuesta: txt, tiempo_usado: tiempoUsado, pistas_usadas: pistas }, headers:{ Authorization:`Bearer ${token}` } }
      );
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
      const r = await axios.post(`https://socblast-production.up.railway.app/api/sesiones/${sesion._id}/finalizar`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      setResultado(r.data); setFase('finalizada');
    } catch { alert('Error finalizando'); }
  };

  const toggleLog    = i  => setLogsEleg(p => p.includes(i) ? p.filter(x=>x!==i) : p.length<4 ? [...p,i] : p);
  const toggleAccion = id => setAccionesEl(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);

  const ETAPAS = ['triaje','logs','diagnostico','acciones','justificacion'];
  const etapaIdx = ETAPAS.indexOf(etapa);

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(37,100,241,.3);}50%{box-shadow:0 0 40px rgba(37,100,241,.55);}}
    @keyframes timerWarn{0%,100%{background:rgba(239,68,68,.12);}50%{background:rgba(239,68,68,.22);}}
    .fade-up{animation:fadeUp .35s ease forwards;}
    .fade-in{animation:fadeIn .25s ease forwards;}
    .glow-btn{animation:glow 3s ease-in-out infinite;}
    .glow-btn:hover{filter:brightness(1.12);transform:translateY(-2px)!important;}
    .card-hover:hover{border-color:rgba(37,100,241,.45)!important;transform:translateY(-2px);box-shadow:0 10px 32px rgba(0,0,0,.5)!important;}
    .log-hover:hover{border-color:rgba(37,100,241,.4)!important;}
    .accion-hover:hover{border-color:rgba(37,100,241,.5)!important;background:rgba(37,100,241,.08)!important;}
    .nav-back:hover{color:#fff!important;}
    *{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .15s ease,color .15s ease;}
  `;

  // ─── INTRO ───────────────────────────────────────────────────────────────
  if (fase === 'intro') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',backgroundColor:BG,fontFamily:"'Inter',-apple-system,sans-serif",color:T1}}>
        <nav style={{height:'58px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 36px',backgroundColor:'rgba(14,26,46,.85)',backdropFilter:'blur(20px)',borderBottom:`1px solid ${BD}`}}>
          <img src="/logosoc.png" style={{height:'30px',cursor:'pointer'}} onClick={()=>navigate('/dashboard')}/>
          <button className="nav-back" onClick={()=>navigate('/dashboard')} style={{background:'none',border:`1px solid ${BD}`,color:T3,padding:'7px 16px',borderRadius:'8px',fontSize:'13px',cursor:'pointer'}}>← Dashboard</button>
        </nav>
        <div style={{maxWidth:'680px',margin:'0 auto',padding:'52px 28px'}}>
          <div className="fade-up">
            <div style={{textAlign:'center',marginBottom:'36px'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'6px 16px',borderRadius:'100px',border:`1px solid ${ac}40`,backgroundColor:`${ac}10`,marginBottom:'22px'}}>
                <div style={{width:'7px',height:'7px',borderRadius:'50%',backgroundColor:ac,animation:'pulse 2s infinite'}}/>
                <span style={{fontSize:'11px',color:ac,fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>ARENA {arena.toUpperCase()} · SOC PLATFORM</span>
              </div>
              <h1 style={{fontSize:'46px',fontWeight:900,letterSpacing:'-2px',color:T1,marginBottom:'12px',lineHeight:1}}>Sesión SOC</h1>
              <p style={{fontSize:'16px',color:T3,lineHeight:1.7}}>La IA generará un escenario real de seguridad.<br/>Investiga, decide y actúa como analista profesional.</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'28px'}}>
              {[
                {label:'Arena',    value:arena,                                                             color:ac},
                {label:'Tiempo',   value:{Bronce:'20 min',Plata:'15 min',Oro:'10 min',Elite:'7 min'}[arena],color:'#4ADE80'},
                {label:'Incidentes',value:{Bronce:'3',Plata:'3',Oro:'4',Elite:'5'}[arena],                 color:T1},
                {label:'XP máx',   value:{Bronce:'50',Plata:'100',Oro:'200',Elite:'400'}[arena],           color:ACC},
              ].map((c,i)=>(
                <div key={i} style={{padding:'18px 14px',borderRadius:'12px',backgroundColor:CARD,border:`1px solid ${BD}`,textAlign:'center',backdropFilter:'blur(10px)'}}>
                  <div style={{fontSize:'20px',fontWeight:800,color:c.color,marginBottom:'5px'}}>{c.value}</div>
                  <div style={{fontSize:'12px',color:T3,fontFamily:'monospace'}}>{c.label}</div>
                </div>
              ))}
            </div>
            <div style={{padding:'22px 24px',borderRadius:'14px',backgroundColor:CARD,border:`1px solid ${BD}`,marginBottom:'28px',backdropFilter:'blur(10px)'}}>
              <p style={{fontSize:'10px',color:T3,fontWeight:700,letterSpacing:'2px',marginBottom:'16px',fontFamily:'monospace'}}>MECÁNICA — CADA INCIDENTE</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {[
                  {n:'01',t:'Triaje',     d:'Clasifica la severidad de cada alerta recibida',    c:'#EF4444'},
                  {n:'02',t:'Logs',       d:'Selecciona los logs más relevantes (máx 4)',          c:'#F97316'},
                  {n:'03',t:'Diagnóstico',d:'Identifica el tipo de ataque entre 4 opciones',      c:'#F59E0B'},
                  {n:'04',t:'Respuesta',  d:'Elige las acciones de contención que tomarías',      c:'#4ADE80'},
                  {n:'05',t:'Justifica',  d:'Explica tu razonamiento — aquí está el mayor peso',  c:ACC},
                ].map((m,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'14px',padding:'12px 14px',borderRadius:'10px',backgroundColor:'rgba(8,21,37,.7)',border:`1px solid ${BD}`}}>
                    <div style={{width:'32px',height:'32px',borderRadius:'8px',backgroundColor:`${m.c}15`,border:`1px solid ${m.c}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:'11px',fontWeight:900,color:m.c,fontFamily:'monospace'}}>{m.n}</span>
                    </div>
                    <div>
                      <p style={{fontSize:'14px',fontWeight:700,color:T1,marginBottom:'2px'}}>{m.t}</p>
                      <p style={{fontSize:'12px',color:T3}}>{m.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="glow-btn" onClick={generar}
              style={{width:'100%',padding:'20px',borderRadius:'14px',backgroundColor:ACC,border:'none',color:T1,fontSize:'17px',fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Generar y comenzar sesión SOC
            </button>
          </div>
        </div>
      </div>
    </>
  );
  // ─── CARGANDO ────────────────────────────────────────────────────────────
  if (fase === 'cargando') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',backgroundColor:BG,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',-apple-system,sans-serif"}}>
        <div style={{textAlign:'center'}}>
          <img src="/logosoc.png" style={{width:'52px',height:'52px',animation:'spin 1s linear infinite',marginBottom:'20px'}}/>
          <p style={{color:ACC,fontFamily:'monospace',fontSize:'15px',marginBottom:'8px'}}>Generando escenario SOC...</p>
          <p style={{color:T3,fontFamily:'monospace',fontSize:'12px'}}>IA construyendo amenazas · Arena {arena}</p>
        </div>
      </div>
    </>
  );

  // ─── BRIEFING ────────────────────────────────────────────────────────────
  if (fase === 'briefing') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',backgroundColor:BG,fontFamily:"'Inter',-apple-system,sans-serif",display:'flex',flexDirection:'column'}}>
        <nav style={{height:'58px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 36px',backgroundColor:'rgba(14,26,46,.85)',backdropFilter:'blur(20px)',borderBottom:`1px solid ${BD}`}}>
          <img src="/logosoc.png" style={{height:'28px'}}/>
          <button onClick={()=>setFase('intro')} style={{background:'none',border:`1px solid ${BD}`,color:T3,padding:'6px 14px',borderRadius:'8px',fontSize:'13px',cursor:'pointer'}}>✕ Cancelar</button>
        </nav>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'32px 24px'}}>
          <div className="fade-up" style={{maxWidth:'600px',width:'100%'}}>
            <div style={{padding:'36px',borderRadius:'16px',backgroundColor:CARD,border:`1px solid ${BD}`,backdropFilter:'blur(10px)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,transparent,${ACC},transparent)`}}/>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'22px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',backgroundColor:'#EF4444',animation:'pulse 1s infinite'}}/>
                <span style={{color:T3,fontFamily:'monospace',fontSize:'11px',letterSpacing:'2px'}}>NUEVA MISIÓN ASIGNADA</span>
              </div>
              <h1 style={{fontSize:'24px',fontWeight:800,color:T1,marginBottom:'18px',letterSpacing:'-0.5px',lineHeight:1.3}}>{sesion?.titulo}</h1>
              <div style={{padding:'16px 18px',borderRadius:'10px',backgroundColor:'rgba(74,222,128,.05)',border:'1px solid rgba(74,222,128,.15)',marginBottom:'22px'}}>
                <p style={{fontSize:'11px',color:T3,fontFamily:'monospace',marginBottom:'7px'}}>CONTEXTO DEL ENTORNO:</p>
                <p style={{fontSize:'14px',color:'#4ADE80',fontFamily:'monospace',lineHeight:1.75}}>{sesion?.contexto}</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'26px'}}>
                {[
                  {label:'Incidentes',value:sesion?.incidentes?.length},
                  {label:'Arena',     value:sesion?.arena},
                  {label:'Tiempo',    value:fmt(tiempoRestante)},
                ].map((s,i)=>(
                  <div key={i} style={{padding:'16px',borderRadius:'10px',backgroundColor:'rgba(8,21,37,.8)',border:`1px solid ${BD}`,textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:800,color:T1,marginBottom:'4px'}}>{s.value}</div>
                    <div style={{fontSize:'12px',color:T3,fontFamily:'monospace'}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{resetEtapas();setFase('activa');}}
                style={{width:'100%',padding:'16px',borderRadius:'11px',backgroundColor:ACC,border:'none',color:T1,fontSize:'16px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 24px rgba(37,100,241,.45)`,display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                INICIAR SESIÓN SOC
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ─── EVALUANDO ────────────────────────────────────────────────────────────
  if (fase === 'evaluando') return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',backgroundColor:BG,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',-apple-system,sans-serif"}}>
        <div style={{textAlign:'center'}}>
          <img src="/logosoc.png" style={{width:'48px',height:'48px',animation:'spin 1s linear infinite',marginBottom:'18px'}}/>
          <p style={{color:ACC,fontFamily:'monospace',fontSize:'15px',marginBottom:'8px'}}>IA evaluando tu respuesta...</p>
          <p style={{color:T3,fontFamily:'monospace',fontSize:'12px'}}>Analizando decisiones · Calculando puntuación</p>
        </div>
      </div>
    </>
  );

  // ─── FEEDBACK ────────────────────────────────────────────────────────────
  if (fase === 'feedback' && evaluacion) {
    const scoreColor = evaluacion.total>=14?'#4ADE80':evaluacion.total>=8?'#F59E0B':'#EF4444';
    return (
      <>
        <style>{css}</style>
        <div style={{minHeight:'100vh',backgroundColor:BG,fontFamily:"'Inter',-apple-system,sans-serif"}}>
          <nav style={{height:'58px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 36px',backgroundColor:'rgba(14,26,46,.85)',backdropFilter:'blur(20px)',borderBottom:`1px solid ${BD}`}}>
            <img src="/logosoc.png" style={{height:'28px'}}/>
            <span style={{fontSize:'13px',color:T3,fontFamily:'monospace'}}>Incidente {incIdx+1} / {sesion?.incidentes?.length}</span>
            <span/>
          </nav>
          <div style={{maxWidth:'700px',margin:'0 auto',padding:'36px 28px'}}>
            <div className="fade-up">
              <div style={{padding:'32px',borderRadius:'16px',backgroundColor:CARD,border:`1px solid ${scoreColor}35`,backdropFilter:'blur(10px)',marginBottom:'16px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,transparent,${scoreColor},transparent)`}}/>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'24px'}}>
                  <div>
                    <h2 style={{fontSize:'20px',fontWeight:800,color:T1,marginBottom:'5px'}}>Resultado — Incidente {incIdx+1}</h2>
                    <p style={{fontSize:'13px',color:T3,fontFamily:'monospace'}}>
                      {evaluacion.total>=14?'🟢 Excelente análisis':evaluacion.total>=8?'🟡 Buen trabajo':'🔴 Necesita mejorar'}
                    </p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'48px',fontWeight:900,color:scoreColor,letterSpacing:'-2px',lineHeight:1}}>{evaluacion.total}</div>
                    <div style={{fontSize:'13px',color:T3,fontFamily:'monospace'}}>/ 20 pts</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
                  {[
                    {label:'Calidad análisis', value:`${evaluacion.puntuacion_calidad}/12`, color:'#4ADE80'},
                    {label:'Velocidad',         value:`${evaluacion.puntuacion_velocidad}/5`, color:'#F59E0B'},
                    {label:'Sin pistas',        value:`${evaluacion.puntuacion_pistas}/3`,   color:ACC},
                  ].map((s,i)=>(
                    <div key={i} style={{padding:'16px',borderRadius:'10px',backgroundColor:'rgba(8,21,37,.8)',border:`1px solid ${BD}`,textAlign:'center'}}>
                      <div style={{fontSize:'24px',fontWeight:900,color:s.color,marginBottom:'5px'}}>{s.value}</div>
                      <div style={{fontSize:'12px',color:T3}}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:'16px 18px',borderRadius:'10px',backgroundColor:`${ACC}08`,border:`1px solid ${ACC}20`,marginBottom:'12px'}}>
                  <p style={{fontSize:'10px',color:T3,fontWeight:700,letterSpacing:'1.5px',marginBottom:'10px',fontFamily:'monospace'}}>FEEDBACK IA</p>
                  <p style={{fontSize:'15px',color:T2,lineHeight:1.75}}>{evaluacion.feedback}</p>
                </div>
                <div style={{padding:'16px 18px',borderRadius:'10px',backgroundColor:'rgba(74,222,128,.05)',border:'1px solid rgba(74,222,128,.2)'}}>
                  <p style={{fontSize:'10px',color:T3,fontWeight:700,letterSpacing:'1.5px',marginBottom:'10px',fontFamily:'monospace'}}>SOLUCIÓN CORRECTA</p>
                  <p style={{fontSize:'15px',color:'#4ADE80',lineHeight:1.75}}>{evaluacion.solucion_explicada}</p>
                </div>
              </div>
              <button onClick={siguiente}
                style={{width:'100%',padding:'16px',borderRadius:'11px',backgroundColor:ACC,border:'none',color:T1,fontSize:'16px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 24px rgba(37,100,241,.45)`}}>
                {incIdx+1 < sesion.incidentes.length ? '→ Siguiente incidente' : '🏁 Finalizar sesión'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── FINALIZADA ──────────────────────────────────────────────────────────
  if (fase === 'finalizada' && resultado) return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',backgroundColor:BG,display:'flex',alignItems:'center',justifyContent:'center',padding:'28px',fontFamily:"'Inter',-apple-system,sans-serif"}}>
        <div className="fade-up" style={{maxWidth:'500px',width:'100%',padding:'44px',borderRadius:'18px',backgroundColor:CARD,border:`1px solid ${BD}`,textAlign:'center',backdropFilter:'blur(10px)',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,transparent,${ACC},transparent)`}}/>
          <div style={{fontSize:'52px',marginBottom:'16px'}}>🏆</div>
          <h1 style={{fontSize:'30px',fontWeight:900,color:T1,marginBottom:'8px',letterSpacing:'-1px'}}>Sesión Completada</h1>
          <p style={{fontSize:'14px',color:T3,marginBottom:'30px',fontFamily:'monospace'}}>Has investigado todos los incidentes</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'30px'}}>
            {[
              {label:'Copas',    value:`${resultado.copas_ganadas>0?'+':''}${resultado.copas_ganadas}`, color:'#F59E0B'},
              {label:'XP',       value:`+${resultado.xp_ganada}`,                                        color:'#4ADE80'},
              {label:'Media',    value:`${resultado.media_puntuacion}/20`,                                color:ACC},
              {label:'Arena',    value:resultado.arena,                                                   color:{Bronce:'#CD7F32',Plata:'#94A3B8',Oro:'#F59E0B',Elite:'#A78BFA'}[resultado.arena]||T1},
            ].map((s,i)=>(
              <div key={i} style={{padding:'18px',borderRadius:'12px',backgroundColor:'rgba(8,21,37,.8)',border:`1px solid ${BD}`}}>
                <div style={{fontSize:'26px',fontWeight:900,color:s.color,marginBottom:'4px',letterSpacing:'-0.5px'}}>{s.value}</div>
                <div style={{fontSize:'12px',color:T3,fontFamily:'monospace'}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'12px'}}>
            <button onClick={()=>navigate('/dashboard')} style={{flex:1,padding:'14px',borderRadius:'10px',background:'none',border:`1px solid ${BD}`,color:T2,fontSize:'14px',fontWeight:500,cursor:'pointer'}}>← Dashboard</button>
            <button onClick={()=>{setSesion(null);setIncIdx(0);resetEtapas();setFase('intro');}} style={{flex:1,padding:'14px',borderRadius:'10px',backgroundColor:ACC,border:'none',color:T1,fontSize:'14px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 18px rgba(37,100,241,.4)`}}>Nueva ⚡</button>
          </div>
        </div>
      </div>
    </>
  );

  // ─── ACTIVA ──────────────────────────────────────────────────────────────
  if (fase !== 'activa' || !incidente) return null;

  const triajeCompleto  = Object.keys(triaje).length >= (incidente.alertas?.length||0);
  const diagOpts        = opcionesDiagRef.current;

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',backgroundColor:BG,fontFamily:"'Inter',-apple-system,sans-serif",color:T1,display:'flex',flexDirection:'column'}}>
        <div style={{height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',backgroundColor:'rgba(8,21,37,.95)',backdropFilter:'blur(20px)',borderBottom:`1px solid ${BD}`,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <img src="/logosoc.png" style={{height:'26px',cursor:'pointer'}} onClick={()=>{
              if (window.confirm('⚠️ Si abandonas la sesión perderás 20 copas. ¿Seguro que quieres salir?')) {
                axios.put('https://socblast-production.up.railway.app/api/me/copas', null,
                  { params: { copas_delta: -20 }, headers: { Authorization: `Bearer ${token}` } }
                ).finally(() => navigate('/dashboard'));
              }
            }}/>
            <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
              {ETAPAS.map((e,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'4px'}}>
                  <div style={{
                    width: i===etapaIdx?'28px':'10px',
                    height:'6px',borderRadius:'3px',
                    backgroundColor: i<etapaIdx?'#4ADE80':i===etapaIdx?ACC:BD,
                    boxShadow: i===etapaIdx?`0 0 8px ${ACC}`:'none',
                  }}/>
                </div>
              ))}
            </div>
            <span style={{fontSize:'11px',color:T3,fontFamily:'monospace',letterSpacing:'1px'}}>
              {{triaje:'TRIAJE',logs:'LOGS',diagnostico:'DIAGNÓSTICO',acciones:'RESPUESTA',justificacion:'JUSTIFICACIÓN'}[etapa]}
            </span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <span style={{fontSize:'12px',color:T3,fontFamily:'monospace'}}>INC {incIdx+1}/{sesion?.incidentes?.length}</span>
            <div style={{
              padding:'5px 14px',borderRadius:'7px',
              backgroundColor: tiempoRestante<60?undefined:'rgba(74,222,128,.08)',
              border:`1px solid ${tiempoRestante<60?'rgba(239,68,68,.4)':'rgba(74,222,128,.2)'}`,
              animation: tiempoRestante<60?'timerWarn 1s infinite':undefined,
            }}>
              <span style={{fontFamily:'monospace',fontSize:'15px',fontWeight:700,color:tiempoRestante<60?'#EF4444':'#4ADE80'}}>
                ⏱ {fmt(tiempoRestante)}
              </span>
            </div>
          </div>
        </div>

        <div style={{flex:1,maxWidth:'900px',margin:'0 auto',width:'100%',padding:'32px 28px 48px'}}>
          <div style={{padding:'14px 18px',borderRadius:'10px',backgroundColor:`${ACC}08`,border:`1px solid ${ACC}25`,marginBottom:'28px'}}>
            <p style={{fontSize:'11px',color:ACC,fontFamily:'monospace',marginBottom:'5px',letterSpacing:'1px'}}>INCIDENTE ACTIVO · {incidente?.titulo}</p>
            <p style={{fontSize:'15px',color:T2,lineHeight:1.7}}>{incidente?.descripcion}</p>
          </div>

          {etapa==='triaje' && (
            <div className="fade-up">
              <div style={{marginBottom:'22px'}}>
                <h2 style={{fontSize:'22px',fontWeight:800,color:T1,marginBottom:'6px'}}>🚨 Etapa 1 — Triaje de Alertas</h2>
                <p style={{fontSize:'14px',color:T3}}>Clasifica la severidad de cada alerta. Tu criterio será evaluado por la IA.</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'28px'}}>
                {incidente.alertas?.map((alerta,i)=>(
                  <div key={i} style={{padding:'20px 22px',borderRadius:'12px',backgroundColor:CARD,border:`1px solid ${triaje[alerta.id]?SEV[triaje[alerta.id]]+'45':BD}`,backdropFilter:'blur(10px)',position:'relative',overflow:'hidden'}}>
                    {triaje[alerta.id] && <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',backgroundColor:SEV[triaje[alerta.id]]}}/>}
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'16px'}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
                          <span style={{fontSize:'11px',color:T3,fontFamily:'monospace',backgroundColor:'rgba(8,21,37,.8)',padding:'2px 8px',borderRadius:'4px',border:`1px solid ${BD}`}}>{alerta.id}</span>
                          <span style={{fontSize:'15px',fontWeight:700,color:T1}}>{alerta.sistema}</span>
                        </div>
                        <p style={{fontSize:'14px',color:T2,lineHeight:1.6,marginBottom:'6px'}}>{alerta.descripcion}</p>
                        <p style={{fontSize:'12px',color:T3,fontFamily:'monospace'}}>{alerta.timestamp}</p>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:'6px',flexShrink:0}}>
                        {['CRITICA','ALTA','MEDIA','BAJA'].map(sev=>(
                          <button key={sev} onClick={()=>setTriaje(p=>({...p,[alerta.id]:sev}))}
                            style={{padding:'7px 12px',borderRadius:'7px',fontSize:'11px',fontWeight:700,fontFamily:'monospace',cursor:'pointer',minWidth:'72px',backgroundColor:triaje[alerta.id]===sev?SEV[sev]+'25':'rgba(8,21,37,.8)',border:`1px solid ${triaje[alerta.id]===sev?SEV[sev]:BD}`,color:triaje[alerta.id]===sev?SEV[sev]:T3}}>
                            {sev}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setEtapa('logs')} disabled={!triajeCompleto}
                style={{width:'100%',padding:'16px',borderRadius:'11px',backgroundColor:triajeCompleto?ACC:BD,border:'none',color:T1,fontWeight:700,fontSize:'16px',cursor:triajeCompleto?'pointer':'not-allowed',opacity:triajeCompleto?1:.5,boxShadow:triajeCompleto?`0 4px 20px rgba(37,100,241,.4)`:'none'}}>
                Confirmar triaje → Investigar logs ({Object.keys(triaje).length}/{incidente.alertas?.length})
              </button>
            </div>
          )}

          {etapa==='logs' && (
            <div className="fade-up">
              <div style={{marginBottom:'22px'}}>
                <h2 style={{fontSize:'22px',fontWeight:800,color:T1,marginBottom:'6px'}}>🔍 Etapa 2 — Investigación de Logs</h2>
                <p style={{fontSize:'14px',color:T3}}>Selecciona hasta <strong style={{color:T1}}>4 logs</strong> que consideres relevantes para la investigación.</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
                {incidente.logs?.map((log,i)=>{
                  const sel = logsEleg.includes(i);
                  const locked = !sel && logsEleg.length>=4;
                  return (
                    <div key={i} className={locked?'':'log-hover'} onClick={()=>!locked&&toggleLog(i)}
                      style={{padding:'14px 16px',borderRadius:'11px',backgroundColor:sel?`${ACC}12`:'rgba(8,21,37,.7)',border:`1px solid ${sel?ACC+'55':BD}`,cursor:locked?'not-allowed':'pointer',opacity:locked?.35:1,position:'relative',overflow:'hidden'}}>
                      {sel && <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,transparent,${ACC},transparent)`}}/>}
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                        <span style={{fontSize:'11px',fontWeight:700,fontFamily:'monospace',color:log.nivel==='ERROR'?'#EF4444':log.nivel==='WARNING'?'#F97316':T3}}>{log.nivel}</span>
                        <span style={{fontSize:'11px',color:T3,fontFamily:'monospace'}}>{log.timestamp}</span>
                      </div>
                      <p style={{fontSize:'13px',color:sel?T2:T3,lineHeight:1.55}}>{log.mensaje}</p>
                      {sel && <div style={{display:'flex',alignItems:'center',gap:'4px',marginTop:'8px'}}><div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:ACC}}/><span style={{fontSize:'11px',color:ACC,fontFamily:'monospace'}}>Seleccionado</span></div>}
                    </div>
                  );
                })}
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
                <span style={{fontSize:'13px',color:T3,fontFamily:'monospace'}}>{logsEleg.length}/4 logs seleccionados</span>
                {logsEleg.length>0 && <button onClick={()=>setLogsEleg([])} style={{background:'none',border:'none',color:T3,fontSize:'12px',cursor:'pointer',fontFamily:'monospace'}}>Limpiar selección</button>}
              </div>
              <button onClick={()=>setEtapa('diagnostico')} disabled={logsEleg.length===0}
                style={{width:'100%',padding:'16px',borderRadius:'11px',backgroundColor:logsEleg.length>0?ACC:BD,border:'none',color:T1,fontWeight:700,fontSize:'16px',cursor:logsEleg.length>0?'pointer':'not-allowed',opacity:logsEleg.length>0?1:.5,boxShadow:logsEleg.length>0?`0 4px 20px rgba(37,100,241,.4)`:'none'}}>
                Confirmar selección → Diagnóstico
              </button>
            </div>
          )}

          {etapa==='diagnostico' && (
            <div className="fade-up">
              <div style={{marginBottom:'22px'}}>
                <h2 style={{fontSize:'22px',fontWeight:800,color:T1,marginBottom:'6px'}}>🎯 Etapa 3 — Diagnóstico</h2>
                <p style={{fontSize:'14px',color:T3}}>Basándote en alertas y logs, ¿qué tipo de amenaza estás viendo?</p>
              </div>
              <div style={{padding:'14px 16px',borderRadius:'10px',backgroundColor:'rgba(8,21,37,.8)',border:`1px solid ${BD}`,marginBottom:'22px'}}>
                <p style={{fontSize:'11px',color:T3,fontFamily:'monospace',marginBottom:'10px',letterSpacing:'1px'}}>ALERTAS CRÍTICAS Y ALTAS EN TU TRIAJE:</p>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  {Object.entries(triaje).filter(([,v])=>v==='CRITICA'||v==='ALTA').map(([id,sev])=>(
                    <span key={id} style={{fontSize:'12px',padding:'4px 10px',borderRadius:'6px',backgroundColor:SEV[sev]+'15',color:SEV[sev],border:`1px solid ${SEV[sev]}35`,fontFamily:'monospace',fontWeight:700}}>{id} · {sev}</span>
                  ))}
                  {Object.entries(triaje).filter(([,v])=>v==='CRITICA'||v==='ALTA').length===0 &&
                    <span style={{fontSize:'13px',color:T3}}>Ninguna alerta marcada como crítica o alta</span>
                  }
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'22px'}}>
                {diagOpts.map((op,i)=>(
                  <button key={i} onClick={()=>setDiagEleg(op)}
                    style={{padding:'20px 18px',borderRadius:'12px',backgroundColor:diagEleg===op?`${ACC}15`:'rgba(8,21,37,.8)',border:`1px solid ${diagEleg===op?ACC:BD}`,color:diagEleg===op?T1:T2,fontSize:'14px',fontWeight:600,cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:'12px',boxShadow:diagEleg===op?`0 4px 20px rgba(37,100,241,.25)`:'none'}}>
                    <div style={{width:'22px',height:'22px',borderRadius:'50%',border:`2px solid ${diagEleg===op?ACC:BD}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {diagEleg===op && <div style={{width:'10px',height:'10px',borderRadius:'50%',backgroundColor:ACC}}/>}
                    </div>
                    <span style={{lineHeight:1.4}}>{op}</span>
                  </button>
                ))}
              </div>
              {pista && (
                <div style={{padding:'14px 16px',borderRadius:'10px',backgroundColor:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.2)',marginBottom:'16px'}}>
                  <p style={{fontSize:'14px',color:'#F59E0B',lineHeight:1.6}}>💡 <strong>Pista:</strong> Busca patrones de {incidente?.solucion_correcta?.tipo_ataque?.split(' ')[0]} en las alertas de mayor severidad.</p>
                </div>
              )}
              <div style={{display:'flex',gap:'10px'}}>
                {!pista && (
                  <button onClick={()=>{setPistas(p=>p+1);setPista(true);}}
                    style={{padding:'14px 18px',borderRadius:'11px',backgroundColor:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.25)',color:'#F59E0B',fontSize:'14px',fontWeight:600,cursor:'pointer',flexShrink:0}}>
                    💡 Pista
                  </button>
                )}
                <button onClick={()=>setEtapa('acciones')} disabled={!diagEleg}
                  style={{flex:1,padding:'14px',borderRadius:'11px',backgroundColor:diagEleg?ACC:BD,border:'none',color:T1,fontWeight:700,fontSize:'16px',cursor:diagEleg?'pointer':'not-allowed',opacity:diagEleg?1:.5,boxShadow:diagEleg?`0 4px 20px rgba(37,100,241,.4)`:'none'}}>
                  Confirmar diagnóstico → Respuesta
                </button>
              </div>
            </div>
          )}

          {etapa==='acciones' && (
            <div className="fade-up">
              <div style={{marginBottom:'22px'}}>
                <h2 style={{fontSize:'22px',fontWeight:800,color:T1,marginBottom:'6px'}}>⚡ Etapa 4 — Plan de Respuesta</h2>
                <p style={{fontSize:'14px',color:T3}}>Selecciona todas las acciones que tomarías. El <strong style={{color:T1}}>orden importa</strong>.</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'24px'}}>
                {ACCIONES.map(({id,label,icon})=>{
                  const sel = accionesEl.includes(id);
                  const orden = accionesEl.indexOf(id)+1;
                  return (
                    <button key={id} className="accion-hover" onClick={()=>toggleAccion(id)}
                      style={{padding:'16px 18px',borderRadius:'12px',backgroundColor:sel?`${ACC}12`:'rgba(8,21,37,.8)',border:`1px solid ${sel?ACC+'55':BD}`,color:sel?T1:T2,fontSize:'14px',fontWeight:sel?600:400,cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:'12px',boxShadow:sel?`0 4px 16px rgba(37,100,241,.2)`:'none'}}>
                      <div style={{width:'36px',height:'36px',borderRadius:'9px',backgroundColor:sel?ACC:'rgba(26,48,80,.8)',border:`1px solid ${sel?ACC:BD}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:sel?'13px':'18px',fontWeight:800,color:T1,fontFamily:'monospace'}}>
                        {sel ? orden : icon}
                      </div>
                      <span style={{lineHeight:1.4}}>{label}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                <span style={{fontSize:'13px',color:T3,fontFamily:'monospace'}}>{accionesEl.length} acciones seleccionadas</span>
                {accionesEl.length>0 && <button onClick={()=>setAccionesEl([])} style={{background:'none',border:'none',color:T3,fontSize:'12px',cursor:'pointer',fontFamily:'monospace'}}>Limpiar</button>}
              </div>
              <button onClick={()=>setEtapa('justificacion')} disabled={accionesEl.length===0}
                style={{width:'100%',padding:'16px',borderRadius:'11px',backgroundColor:accionesEl.length>0?ACC:BD,border:'none',color:T1,fontWeight:700,fontSize:'16px',cursor:accionesEl.length>0?'pointer':'not-allowed',opacity:accionesEl.length>0?1:.5,boxShadow:accionesEl.length>0?`0 4px 20px rgba(37,100,241,.4)`:'none'}}>
                Confirmar acciones → Justificación final
              </button>
            </div>
          )}

          {etapa==='justificacion' && (
            <div className="fade-up">
              <div style={{marginBottom:'22px'}}>
                <h2 style={{fontSize:'22px',fontWeight:800,color:T1,marginBottom:'6px'}}>📝 Etapa 5 — Justificación Final</h2>
                <p style={{fontSize:'14px',color:T3}}>Explica tu razonamiento en 2-4 frases. <strong style={{color:T1}}>Este campo tiene el mayor peso en la puntuación.</strong></p>
              </div>
              <div style={{padding:'18px 20px',borderRadius:'12px',backgroundColor:CARD,border:`1px solid ${BD}`,backdropFilter:'blur(10px)',marginBottom:'18px'}}>
                <p style={{fontSize:'10px',color:T3,fontFamily:'monospace',marginBottom:'14px',letterSpacing:'1px'}}>RESUMEN DE TUS DECISIONES</p>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:'12px'}}>
                    <span style={{fontSize:'11px',color:T3,fontFamily:'monospace',width:'90px',flexShrink:0,paddingTop:'2px'}}>DIAGNÓSTICO</span>
                    <span style={{fontSize:'14px',color:ACC,fontWeight:700}}>{diagEleg}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'flex-start',gap:'12px'}}>
                    <span style={{fontSize:'11px',color:T3,fontFamily:'monospace',width:'90px',flexShrink:0,paddingTop:'4px'}}>ACCIONES</span>
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                      {accionesEl.map((id,i)=>{
                        const a = ACCIONES.find(x=>x.id===id);
                        return <span key={id} style={{fontSize:'12px',padding:'3px 10px',borderRadius:'6px',backgroundColor:`${ACC}15`,color:T2,border:`1px solid ${BD}`,fontFamily:'monospace'}}>{i+1}. {a?.icon} {a?.label}</span>;
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <textarea value={justif} onChange={e=>setJustif(e.target.value)}
                placeholder={`Escribe aquí tu análisis:\n• ¿Por qué ese diagnóstico?\n• ¿Por qué esas acciones en ese orden?\n• ¿Escalarías? ¿A quién?`}
                style={{width:'100%',height:'160px',padding:'16px',borderRadius:'12px',fontFamily:'monospace',fontSize:'14px',color:T2,backgroundColor:'rgba(8,21,37,.8)',border:`1px solid ${justif.trim()?ACC+'50':BD}`,resize:'none',outline:'none',lineHeight:1.75,marginBottom:'16px'}}/>
              <button onClick={()=>enviar()} disabled={!justif.trim()}
                style={{width:'100%',padding:'18px',borderRadius:'12px',backgroundColor:justif.trim()?ACC:BD,border:'none',color:T1,fontWeight:800,fontSize:'17px',cursor:justif.trim()?'pointer':'not-allowed',opacity:justif.trim()?1:.5,boxShadow:justif.trim()?`0 4px 24px rgba(37,100,241,.45)`:'none',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
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