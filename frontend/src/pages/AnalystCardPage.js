import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';
const F = `'Rajdhani','Arial Narrow','Impact',sans-serif`;

const SKILLS = [
  {
    key:'analisis_logs', abbr:'LOG', label:'Análisis de Logs', color:'#3b82f6',
    criterios:[
      'Identifica logs relevantes entre el ruido',
      'Correlaciona eventos por timestamp',
      'Lee correctamente campos clave (usuario, proceso, IP, puerto)',
      'Detecta anomalías en patrones de comportamiento',
      'Reconstruye la secuencia cronológica del ataque',
    ]
  },
  {
    key:'deteccion_amenazas', abbr:'DET', label:'Detección de Amenazas', color:'#6366f1',
    criterios:[
      'Identifica el IOC principal correcto',
      'Clasifica la severidad apropiadamente',
      'Distingue falsos positivos de amenazas reales',
      'Reconoce el tipo de ataque correctamente',
      'Asocia el comportamiento con TTPs conocidas',
    ]
  },
  {
    key:'respuesta_incidentes', abbr:'RSP', label:'Respuesta a Incidentes', color:'#f59e0b',
    criterios:[
      'Elige la acción de contención correcta',
      'Prioriza bien contención sobre erradicación y recuperación',
      'No toma acciones que causen daño adicional',
      'Sigue el orden lógico de respuesta al incidente',
      'Propone remediación adecuada al tipo de incidente',
    ]
  },
  {
    key:'threat_hunting', abbr:'THR', label:'Threat Hunting', color:'#8b5cf6',
    criterios:[
      'Busca proactivamente más allá de las alertas visibles',
      'Identifica movimiento lateral o persistencia oculta',
      'Formula hipótesis correctas sobre el atacante',
      'Usa queries SIEM efectivas para descubrir amenazas',
      'Conecta indicios aparentemente no relacionados',
    ]
  },
  {
    key:'forense_digital', abbr:'FOR', label:'Forense Digital', color:'#ec4899',
    criterios:[
      'Identifica el vector de entrada del ataque',
      'Reconstruye la cadena completa de compromiso',
      'Localiza artefactos forenses relevantes',
      'Estima correctamente el alcance del daño',
      'Preserva la integridad de la evidencia en sus decisiones',
    ]
  },
  {
    key:'gestion_vulnerabilidades', abbr:'VUL', label:'Gestión de Vulns', color:'#f97316',
    criterios:[
      'Identifica la vulnerabilidad explotada',
      'Prioriza correctamente por criticidad e impacto',
      'Propone parche o mitigación adecuada',
      'Evalúa el riesgo residual correctamente',
      'Considera el contexto del entorno (producción, legacy...)',
    ]
  },
  {
    key:'inteligencia_amenazas', abbr:'INT', label:'Intel. de Amenazas', color:'#10b981',
    criterios:[
      'Asocia el ataque con actores o grupos conocidos',
      'Identifica TTPs usando MITRE ATT&CK correctamente',
      'Usa contexto de threat intel para enriquecer el análisis',
      'Reconoce infraestructura C2 o patrones de campaña',
      'Propone indicadores para bloqueo proactivo',
    ]
  },
  {
    key:'siem_queries', abbr:'SIE', label:'SIEM & Queries', color:'#0891b2',
    criterios:[
      'Formula queries eficientes y correctas',
      'Usa campos y operadores adecuados',
      'Reduce el ruido con filtros precisos',
      'Crea correlaciones útiles entre fuentes de logs',
      'Interpreta correctamente los resultados del SIEM',
    ]
  },
];

const ARENA_THEMES = {
  bronce:   { main:'#d97706', accent:'#fbbf24', light:'#fef3c7', bg:'linear-gradient(160deg,#3d1a00 0%,#7c3000 30%,#b85a00 60%,#7c3000 80%,#2a1000 100%)', shine:'rgba(255,200,100,0.12)' },
  plata:    { main:'#94a3b8', accent:'#e2e8f0', light:'#f1f5f9', bg:'linear-gradient(160deg,#0f172a 0%,#1e293b 35%,#334155 60%,#1e293b 80%,#0f172a 100%)', shine:'rgba(200,220,240,0.1)' },
  oro:      { main:'#f59e0b', accent:'#fde68a', light:'#fffbeb', bg:'linear-gradient(160deg,#1a1200 0%,#4a3500 25%,#8a6200 55%,#c49000 75%,#4a3500 90%,#1a1200 100%)', shine:'rgba(255,230,100,0.18)' },
  diamante: { main:'#3b82f6', accent:'#93c5fd', light:'#dbeafe', bg:'linear-gradient(160deg,#020817 0%,#0c1f4a 30%,#1a3a8a 60%,#0c1f4a 80%,#020817 100%)', shine:'rgba(147,197,253,0.15)' },
};

const TIERS = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];

function getArenaGroup(arena) {
  if (!arena) return 'bronce';
  const a = arena.toLowerCase();
  if (a.includes('diamante')) return 'diamante';
  if (a.includes('oro'))      return 'oro';
  if (a.includes('plata'))    return 'plata';
  return 'bronce';
}

function calcOVR(skills) {
  const vals = SKILLS.map(s => Math.round((skills?.[s.key] || 0) * 10));
  return Math.max(50, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
}

function FifaCard({ nombre, tier, skills, copas, arena, size='lg' }) {
  const group     = getArenaGroup(arena);
  const theme     = ARENA_THEMES[group];
  const skillVals = SKILLS.map(s => ({ ...s, val: Math.max(50, Math.round((skills?.[s.key] || 0) * 10)) }));
  const ovr       = calcOVR(skills);
  const initials  = nombre ? nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SO';
  const W = size === 'lg' ? 260 : 155;
  const H = Math.round(W * 1.56);

  return (
    <div style={{ width:W, height:H, borderRadius:W*0.07, position:'relative', overflow:'hidden', boxShadow:`0 24px 56px ${theme.main}55`, flexShrink:0 }}>
      <div style={{ position:'absolute', inset:0, background:theme.bg }}/>
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-40%', right:'-15%', width:'55%', height:'200%', background:'rgba(255,255,255,0.022)', transform:'rotate(18deg)' }}/>
      </div>
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${theme.shine} 0%,transparent 55%,rgba(0,0,0,0.18) 100%)`, pointerEvents:'none' }}/>
      <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', padding:`${W*0.06}px ${W*0.07}px` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:W*0.01 }}>
          <div>
            <div style={{ fontFamily:F, fontSize:W*0.28, lineHeight:.9, color:theme.accent, fontWeight:700, letterSpacing:-1 }}>{ovr}</div>
            <div style={{ fontFamily:F, fontSize:W*0.08, color:theme.accent, letterSpacing:3, fontWeight:700, opacity:.85 }}>ANALYST</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:W*0.036, fontWeight:800, color:theme.accent, letterSpacing:1, marginTop:W*0.02, padding:`2px ${W*0.03}px`, borderRadius:20, background:`${theme.main}22`, border:`1px solid ${theme.main}40`, display:'inline-block' }}>
              {arena ? arena.toUpperCase() : 'BRONCE III'}
            </div>
          </div>
          <div style={{ textAlign:'right', paddingTop:2 }}>
            <div style={{ fontFamily:F, fontSize:W*0.055, letterSpacing:3, color:`${theme.accent}40`, fontWeight:600 }}>SOCBLAST</div>
            <div style={{ width:W*0.13, height:W*0.13, borderRadius:W*0.03, background:`${theme.accent}10`, border:`1px solid ${theme.accent}22`, display:'flex', alignItems:'center', justifyContent:'center', marginLeft:'auto', marginTop:3 }}>
              <svg width={W*0.07} height={W*0.07} viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <svg width={W*0.55} height={W*0.55} viewBox="0 0 100 100" style={{ position:'absolute' }}>
            <polygon points="50,3 94,27 94,73 50,97 6,73 6,27" fill={`${theme.accent}07`} stroke={theme.accent} strokeWidth="1.8" strokeOpacity="0.3"/>
            <polygon points="50,12 86,32 86,68 50,88 14,68 14,32" fill={`${theme.accent}04`} stroke={theme.accent} strokeWidth="0.6" strokeOpacity="0.15"/>
          </svg>
          <div style={{ fontFamily:F, fontSize:W*0.2, color:theme.accent, fontWeight:700, letterSpacing:3, zIndex:1 }}>{initials}</div>
        </div>
        <div style={{ textAlign:'center', marginBottom:W*0.018 }}>
          <div style={{ fontFamily:F, fontSize:W*0.15, letterSpacing:2, color:theme.light, textTransform:'uppercase', lineHeight:1, fontWeight:700 }}>
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
          <div style={{ display:'flex', flexDirection:'column', gap:W*0.01 }}>
            {skillVals.slice(0,4).map(s=>(
              <div key={s.key} style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:W*0.036, fontWeight:800, letterSpacing:1.5, color:theme.light, opacity:.55 }}>{s.abbr}</span>
                <span style={{ fontFamily:F, fontSize:W*0.1, color:theme.accent, fontWeight:700, letterSpacing:1, lineHeight:1 }}>{s.val}</span>
              </div>
            ))}
          </div>
          <div style={{ background:theme.accent, opacity:.14, margin:`0 ${W*0.042}px` }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:W*0.01 }}>
            {skillVals.slice(4).map(s=>(
              <div key={s.key} style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:W*0.036, fontWeight:800, letterSpacing:1.5, color:theme.light, opacity:.55 }}>{s.abbr}</span>
                <span style={{ fontFamily:F, fontSize:W*0.1, color:theme.accent, fontWeight:700, letterSpacing:1, lineHeight:1 }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ flex:1, height:1, background:theme.accent, opacity:.12 }}/>
          <span style={{ fontFamily:F, fontSize:W*0.04, letterSpacing:2, color:theme.accent, fontWeight:600, opacity:.4 }}>{copas.toLocaleString()} COPAS</span>
          <div style={{ flex:1, height:1, background:theme.accent, opacity:.12 }}/>
        </div>
      </div>
    </div>
  );
}

export default function AnalystCardPage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData,     setUserData]     = useState(null);
  const [ranking,      setRanking]      = useState([]);
  const [expandedSkill,setExpandedSkill]= useState(null);

  useEffect(() => {
    axios.get(`${API}/api/me`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setUserData(r.data))
      .catch(() => { logout(); navigate('/login'); });
    axios.get(`${API}/api/ranking`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setRanking(r.data?.jugadores || []))
      .catch(() => {});
  }, []);

  if (!userData) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:40, height:40, border:'3px solid #e2e8f0', borderTop:'3px solid #4f46e5', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
    </div>
  );

  const skills    = userData.skills || {};
  const copas     = userData.copas || 0;
  const tier      = userData.tier || 1;
  const arena     = userData.arena || 'Bronce 3';
  const group     = getArenaGroup(arena);
  const theme     = ARENA_THEMES[group];
  const skillVals = SKILLS.map(s => ({ ...s, val: Math.max(50, Math.round((skills[s.key] || 0) * 10)) }));
  const ovr       = calcOVR(skills);
  const weakest   = [...skillVals].sort((a,b) => a.val - b.val).slice(0,3);
  const strongest = [...skillVals].sort((a,b) => b.val - a.val).slice(0,3);

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes cardFloat{0%,100%{transform:translateY(0) rotate(-1deg);}50%{transform:translateY(-10px) rotate(1deg);}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:none;}}
    .fade-up{animation:fadeUp .4s ease forwards;}
    .card-float{animation:cardFloat 6s ease-in-out infinite;}
    .back-btn:hover{background:#f1f5f9!important;}
    .skill-row:hover{background:#f8faff!important;}
    .skill-row{cursor:pointer;}
    .skill-bar-fill{transition:width 1.2s cubic-bezier(.4,0,.2,1);}
    .criterio-expanded{animation:slideDown .25s ease forwards;}
    *{transition:transform .18s ease,box-shadow .18s ease,background .15s ease;}
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', fontFamily:"'Inter',sans-serif", color:'#0f172a' }}>

        {/* navbar */}
        <nav style={{ height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderBottom:'1px solid #e8eaf0', boxShadow:'0 1px 12px rgba(0,0,0,0.06)', position:'sticky', top:0, zIndex:50 }}>
          <button className="back-btn" onClick={()=>navigate('/dashboard')}
            style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'1px solid #e2e8f0', color:'#64748b', padding:'6px 14px', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:500 }}>
            ← Dashboard
          </button>
          <span style={{ fontSize:13, fontWeight:700, color:'#0f172a', letterSpacing:'.04em' }}>ANALYST CARD</span>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:13, color:'#374151', fontWeight:500 }}>{user?.nombre}</span>
          </div>
        </nav>

        {/* hero */}
        <div className="fade-up" style={{ maxWidth:1100, margin:'0 auto', padding:'48px 40px 0', display:'flex', gap:60, alignItems:'center' }}>
          <div className="card-float" style={{ flexShrink:0 }}>
            <FifaCard nombre={user?.nombre} tier={tier} skills={skills} copas={copas} arena={arena} size="lg"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 14px', borderRadius:20, background:`${theme.main}12`, border:`1px solid ${theme.main}25`, marginBottom:20 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:theme.main, animation:'pulse 2s infinite' }}/>
              <span style={{ fontSize:10, fontWeight:800, color:theme.main, letterSpacing:2, textTransform:'uppercase' }}>Tu Analyst Card · {arena}</span>
            </div>
            <div style={{ fontFamily:F, fontSize:42, fontWeight:700, color:'#0f172a', letterSpacing:'-1px', lineHeight:1.1, marginBottom:6 }}>
              {user?.nombre?.toUpperCase()}
            </div>
            <div style={{ fontSize:14, color:'#64748b', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:28 }}>
              {TIERS[tier]} · Tier {tier} · {arena}
            </div>
            <div style={{ display:'flex', gap:14, marginBottom:28 }}>
              {[
                { val:ovr, label:'OVR', color:theme.main, bg:`${theme.main}10`, border:`${theme.main}20` },
                { val:copas.toLocaleString(), label:'COPAS', color:'#f59e0b', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.18)' },
                { val:userData.sesiones_completadas||0, label:'SESIONES', color:'#4f46e5', bg:'rgba(79,70,229,0.06)', border:'rgba(79,70,229,0.14)' },
              ].map((s,i)=>(
                <div key={i} style={{ padding:'16px 22px', borderRadius:14, background:s.bg, border:`1px solid ${s.border}`, textAlign:'center', minWidth:90 }}>
                  <div style={{ fontFamily:F, fontSize:44, lineHeight:1, color:s.color, fontWeight:700, letterSpacing:-1 }}>{s.val}</div>
                  <div style={{ fontSize:9, fontWeight:800, color:'#94a3b8', letterSpacing:2, textTransform:'uppercase', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:'16px 20px', borderRadius:12, background:'#fff', border:`1px solid ${theme.main}18`, maxWidth:500, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize:13, color:'#475569', lineHeight:1.7, margin:0 }}>
                {group==='bronce'  && 'Estás comenzando. La IA mide tus habilidades en cada sesión. Completa sesiones para subir tu OVR y llegar a Plata.'}
                {group==='plata'   && 'Buen nivel. Estás demostrando habilidades reales como analista. Trabaja en correlación de eventos y respuesta para alcanzar Oro.'}
                {group==='oro'     && 'Analista avanzado. Tu carta refleja expertise real en SOC. Los analistas de Oro son los más buscados por empresas.'}
                {group==='diamante'&& 'Élite. Tu Analyst Card está en el top de SocBlast. Muy pocos analistas alcanzan este nivel.'}
              </p>
            </div>
          </div>
        </div>

        {/* skill breakdown con subcriterios */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 40px 0' }}>
          <div style={{ marginBottom:20 }}>
            <p style={{ fontFamily:F, fontSize:16, fontWeight:700, color:'#94a3b8', letterSpacing:3, marginBottom:4, textTransform:'uppercase' }}>Skill Breakdown — 8 Habilidades</p>
            <p style={{ fontSize:13, color:'#64748b' }}>Pulsa en cada habilidad para ver los subcriterios que la componen</p>
          </div>

          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e8eaf0', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', marginBottom:24 }}>
            {skillVals.sort((a,b)=>b.val-a.val).map((s,i)=>{
              const isExpanded = expandedSkill === s.key;
              const isWeak  = s.val < 60;
              const isTop   = s.val >= 75;
              return (
                <div key={s.key}>
                  {/* fila principal */}
                  <div className="skill-row"
                    onClick={()=>setExpandedSkill(isExpanded ? null : s.key)}
                    style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 20px', borderBottom:'1px solid #f1f5f9', background:isExpanded?`${s.color}05`:'transparent' }}>
                    <div style={{ width:28, fontFamily:F, fontSize:18, fontWeight:700, color:theme.main, flexShrink:0, textAlign:'center', opacity:.45 }}>{i+1}</div>
                    <div style={{ width:38, fontSize:10, fontWeight:800, color:'#64748b', letterSpacing:1.5, fontFamily:'monospace', flexShrink:0 }}>{s.abbr}</div>
                    <div style={{ flex:1, fontSize:13, fontWeight:600, color:'#0f172a' }}>{s.label}</div>
                    <div style={{ width:220, height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden', flexShrink:0 }}>
                      <div className="skill-bar-fill" style={{ height:'100%', borderRadius:3, width:`${s.val}%`, background:isWeak?'linear-gradient(90deg,#fca5a5,#ef4444)':isTop?`linear-gradient(90deg,${s.color}80,${s.color})`:`linear-gradient(90deg,${s.color}60,${s.color})` }}/>
                    </div>
                    <div style={{ fontFamily:F, fontSize:24, fontWeight:700, color:isWeak?'#ef4444':s.color, width:44, textAlign:'right', flexShrink:0 }}>{s.val}</div>
                    <div style={{ fontSize:10, color:isWeak?'#ef4444':isTop?'#059669':'#94a3b8', fontWeight:700, width:16, textAlign:'center', flexShrink:0, transform:isExpanded?'rotate(180deg)':'none', transition:'transform .2s' }}>▼</div>
                  </div>

                  {/* subcriterios expandidos */}
                  {isExpanded && (
                    <div className="criterio-expanded" style={{ padding:'12px 20px 16px 82px', background:`${s.color}04`, borderBottom:'1px solid #f1f5f9' }}>
                      <p style={{ fontFamily:F, fontSize:12, fontWeight:700, color:s.color, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>
                        Subcriterios evaluados por la IA
                      </p>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {s.criterios.map((c, ci) => (
                          <div key={ci} style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:20, height:20, borderRadius:6, background:`${s.color}15`, border:`1px solid ${s.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <span style={{ fontFamily:F, fontSize:11, fontWeight:700, color:s.color }}>{ci+1}</span>
                            </div>
                            <span style={{ fontSize:13, color:'#475569', lineHeight:1.5 }}>{c}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop:12, padding:'10px 14px', borderRadius:8, background:'#fff', border:`1px solid ${s.color}18` }}>
                        <p style={{ fontSize:11, color:'#94a3b8', margin:0 }}>
                          Cada subcriterio se puntúa 0-2 en cada sesión. La media acumulada define tu valor en esta skill.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* top y débiles */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:40 }}>
            <div style={{ padding:'20px 22px', borderRadius:14, background:'#fff', border:'1px solid #e8eaf0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontFamily:F, fontSize:13, fontWeight:700, color:'#059669', letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>Top Skills</p>
              {strongest.map((s,i)=>(
                <div key={s.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontFamily:F, fontSize:18, fontWeight:700, color:'#059669', width:20 }}>{i+1}</span>
                    <span style={{ fontSize:13, color:'#475569' }}>{s.label}</span>
                  </div>
                  <span style={{ fontFamily:F, fontSize:22, fontWeight:700, color:'#059669' }}>{s.val}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:'20px 22px', borderRadius:14, background:'#fff', border:'1px solid #e8eaf0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontFamily:F, fontSize:13, fontWeight:700, color:'#ef4444', letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>A Mejorar</p>
              {weakest.map((s,i)=>(
                <div key={s.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <span style={{ fontSize:13, color:'#475569' }}>{s.label}</span>
                  <span style={{ fontFamily:F, fontSize:22, fontWeight:700, color:'#ef4444' }}>{s.val}</span>
                </div>
              ))}
              <button onClick={()=>navigate('/sesion')}
                style={{ width:'100%', marginTop:8, padding:'10px', borderRadius:8, background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:F, letterSpacing:1, textTransform:'uppercase' }}>
                Entrenar ahora →
              </button>
            </div>
          </div>

          {/* comparativa ranking */}
          {ranking.length > 0 && (
            <div style={{ marginBottom:56 }}>
              <p style={{ fontFamily:F, fontSize:13, fontWeight:700, color:'#94a3b8', letterSpacing:3, textTransform:'uppercase', marginBottom:16 }}>Comparativa — Top Ranking</p>
              <div style={{ display:'flex', gap:20, overflowX:'auto', paddingBottom:8 }}>
                <div style={{ flexShrink:0, textAlign:'center' }}>
                  <div style={{ border:`2px solid ${theme.main}`, borderRadius:14, display:'inline-block', padding:2 }}>
                    <FifaCard nombre={user?.nombre} tier={tier} skills={skills} copas={copas} arena={arena} size="sm"/>
                  </div>
                  <div style={{ fontFamily:F, fontSize:12, fontWeight:700, color:theme.main, marginTop:6, letterSpacing:1 }}>TÚ</div>
                </div>
                {ranking.slice(0,5).filter(j=>j.nombre!==user?.nombre).map((j,i)=>(
                  <div key={i} style={{ flexShrink:0, textAlign:'center', opacity:.65 }}>
                    <FifaCard nombre={j.nombre} tier={j.tier||1} skills={j.skills||{}} copas={j.copas||0} arena={j.arena||'Bronce 3'} size="sm"/>
                    <div style={{ fontFamily:F, fontSize:12, fontWeight:700, color:'#94a3b8', marginTop:6 }}>#{i+2}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
