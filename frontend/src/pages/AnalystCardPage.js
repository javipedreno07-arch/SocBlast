import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { SBNav, AvatarCircle, Icon, ACC, BG, BASE_CSS, SBSpinner, ARENA_COLORS, TIERS, TIER_CLR, getArenaGroup } from './SBLayout';

const API = 'https://socblast-production.up.railway.app';

const SKILLS = [
  { key:'analisis_logs',           abbr:'LOG', label:'Análisis de Logs',      color:'#3b82f6',  criterios:['Identifica logs relevantes entre el ruido','Correlaciona eventos por timestamp','Lee correctamente campos clave','Detecta anomalías en patrones','Reconstruye la secuencia del ataque'] },
  { key:'deteccion_amenazas',      abbr:'DET', label:'Detección de Amenazas', color:'#6366f1',  criterios:['Identifica el IOC principal correcto','Clasifica la severidad apropiadamente','Distingue falsos positivos','Reconoce el tipo de ataque','Asocia el comportamiento con TTPs'] },
  { key:'respuesta_incidentes',    abbr:'RSP', label:'Respuesta a Incidentes',color:'#f59e0b',  criterios:['Elige la acción de contención correcta','Prioriza contención sobre erradicación','No toma acciones dañinas','Sigue el orden lógico de respuesta','Propone remediación adecuada'] },
  { key:'threat_hunting',          abbr:'THR', label:'Threat Hunting',        color:'#8b5cf6',  criterios:['Busca proactivamente más allá de alertas','Identifica movimiento lateral oculto','Formula hipótesis correctas','Usa queries SIEM efectivas','Conecta indicios no relacionados'] },
  { key:'forense_digital',         abbr:'FOR', label:'Forense Digital',       color:'#ec4899',  criterios:['Identifica el vector de entrada','Reconstruye la cadena de compromiso','Localiza artefactos relevantes','Estima el alcance del daño','Preserva la integridad de evidencia'] },
  { key:'gestion_vulnerabilidades',abbr:'VUL', label:'Gestión de Vulns',      color:'#f97316',  criterios:['Identifica la vulnerabilidad explotada','Prioriza por criticidad e impacto','Propone parche o mitigación','Evalúa el riesgo residual','Considera el contexto del entorno'] },
  { key:'inteligencia_amenazas',   abbr:'INT', label:'Intel. de Amenazas',    color:'#10b981',  criterios:['Asocia el ataque con actores conocidos','Identifica TTPs con MITRE ATT&CK','Usa contexto de threat intel','Reconoce infraestructura C2','Propone indicadores de bloqueo'] },
  { key:'siem_queries',            abbr:'SIE', label:'SIEM & Queries',        color:'#0891b2',  criterios:['Formula queries eficientes','Usa campos y operadores adecuados','Reduce el ruido con filtros','Crea correlaciones entre fuentes','Interpreta correctamente resultados'] },
];

function calcOVR(skills) {
  const vals = SKILLS.map(s => Math.round((skills?.[s.key]||0)*10));
  return Math.max(50, Math.round(vals.reduce((a,b)=>a+b,0)/vals.length));
}

export default function AnalystCardPage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData,      setUserData]      = useState(null);
  const [ranking,       setRanking]       = useState([]);
  const [expandedSkill, setExpandedSkill] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/me`, {headers:{Authorization:`Bearer ${token}`}})
      .then(r=>setUserData(r.data)).catch(()=>{logout();navigate('/login');});
    axios.get(`${API}/api/ranking`, {headers:{Authorization:`Bearer ${token}`}})
      .then(r=>setRanking(r.data?.jugadores||[])).catch(()=>{});
  }, []);

  if (!userData) return <SBSpinner/>;

  const skills      = userData.skills||{};
  const copas       = userData.copas||0;
  const tier        = userData.tier||1;
  const arena       = userData.arena||'Bronce 3';
  const group       = getArenaGroup(arena);
  const ac          = ARENA_COLORS[group];
  const tierColor   = TIER_CLR[tier]||'#64748b';
  const ovr         = calcOVR(skills);
  const avatarConfig = userData.avatar_config||null;
  const foto        = userData.foto_perfil||'';
  const skillVals   = SKILLS.map(s=>({...s,val:Math.max(0,Math.round((skills[s.key]||0)*10))}));
  const sorted      = [...skillVals].sort((a,b)=>b.val-a.val);
  const strongest   = sorted.slice(0,3);
  const weakest     = [...skillVals].sort((a,b)=>a.val-b.val).slice(0,3);
  const avgSkill    = Math.round(skillVals.reduce((a,s)=>a+s.val,0)/skillVals.length);

  return (
    <div style={{minHeight:'100vh',background:BG,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",color:'#0f172a'}}>
      <style>{BASE_CSS + `
        .skill-row{cursor:pointer;transition:background .15s;}
        .skill-row:hover{background:#f8f7ff!important;}
        .pb:hover{opacity:.88;transform:translateY(-1px);}
      `}</style>

      <SBNav user={user} avatarConfig={avatarConfig} foto={foto} activePage="/analyst-card" navigate={navigate}/>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'32px 24px 64px'}}>

        {/* PERFIL HEADER */}
        <div className="fu sb-card" style={{overflow:'hidden',marginBottom:16}}>
          {/* Banner */}
          <div style={{height:130,background:'linear-gradient(135deg,#4f46e5 0%,#6366f1 50%,#818cf8 100%)',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,opacity:.07,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'24px 24px'}}/>
            <div style={{position:'absolute',top:'-50px',right:'-50px',width:'200px',height:'200px',borderRadius:'50%',background:'rgba(255,255,255,0.06)'}}/>
            {/* OVR en banner */}
            <div style={{position:'absolute',top:18,right:24,padding:'10px 22px',borderRadius:14,background:'rgba(255,255,255,0.15)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.25)',textAlign:'center'}}>
              <div style={{fontSize:36,fontWeight:900,color:'#fff',lineHeight:1,letterSpacing:'-1.5px'}}>{ovr}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.75)',fontWeight:700,letterSpacing:'2px',marginTop:3}}>OVR SCORE</div>
            </div>
            <div style={{position:'absolute',bottom:14,left:24,display:'flex',alignItems:'center',gap:6,padding:'4px 11px',borderRadius:100,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#4ade80',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:11,color:'#fff',fontWeight:600}}>SocBlast Verified Analyst</span>
            </div>
          </div>

          <div style={{padding:'0 28px 24px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:-48,marginBottom:18}}>
              <AvatarCircle name={user?.nombre} avatarConfig={avatarConfig} size={96} foto={foto}/>
              <div style={{display:'flex',gap:9,paddingBottom:4}}>
                <button className="sb-btn-primary pb" onClick={()=>navigate('/sesion')} style={{padding:'9px 20px',fontSize:13}}>Jugar sesión</button>
                <button className="sb-btn-outline pb" onClick={()=>navigate('/perfil')} style={{padding:'9px 20px',fontSize:13}}>Editar perfil</button>
              </div>
            </div>

            <h1 style={{fontSize:26,fontWeight:900,color:'#0f172a',marginBottom:5,letterSpacing:'-0.5px'}}>{user?.nombre}</h1>
            <p style={{fontSize:14,color:'#374151',marginBottom:10}}>
              <span style={{fontWeight:700,color:tierColor}}>{TIERS[tier]||'SOC Rookie'}</span>
              <span style={{color:'#e2e8f0',margin:'0 9px'}}>·</span>
              Cybersecurity Analyst
              <span style={{color:'#e2e8f0',margin:'0 9px'}}>·</span>
              <span style={{color:'#64748b'}}>SocBlast Platform</span>
            </p>
            <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
              <div onClick={()=>navigate('/arenas')} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 13px',borderRadius:100,background:ac.light,border:`1px solid ${ac.border}`,cursor:'pointer'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:ac.main}}/>
                <span style={{fontSize:12,fontWeight:700,color:ac.main}}>{arena}</span>
              </div>
              <span style={{fontSize:13,color:'#64748b'}}>{userData.sesiones_completadas||0} sesiones completadas</span>
              <span style={{fontSize:13,color:'#64748b'}}>{copas.toLocaleString()} puntos</span>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:'1px solid #e8eaf0'}}>
            {[
              {val:ovr,                              label:'OVR Score',  sub:'Overall Rating',     color:ac.main},
              {val:copas.toLocaleString(),           label:'Puntos',     sub:'Puntos competitivos', color:'#d97706'},
              {val:userData.sesiones_completadas||0, label:'Sesiones',   sub:'Completadas',         color:'#059669'},
              {val:(userData.xp||0).toLocaleString(),label:'XP Total',   sub:'Experiencia',         color:tierColor},
            ].map((s,i)=>(
              <div key={i} style={{padding:'18px 16px',textAlign:'center',borderLeft:i>0?'1px solid #e8eaf0':'none',background:i===0?`${ac.main}06`:'transparent'}}>
                <div style={{fontSize:28,fontWeight:900,color:s.color,lineHeight:1,letterSpacing:'-0.5px'}}>{s.val}</div>
                <div style={{fontSize:12,fontWeight:700,color:'#374151',marginTop:4}}>{s.label}</div>
                <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SKILLS */}
        <div className="s1 sb-card" style={{overflow:'hidden',marginBottom:16}}>
          <div style={{padding:'22px 28px',borderBottom:'1px solid #e8eaf0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:3}}>Skills verificadas</h2>
              <p style={{fontSize:13,color:'#64748b'}}>Evaluadas por IA en cada sesión · Promedio: <strong style={{color:ACC}}>{avgSkill}/100</strong></p>
            </div>
            <div style={{padding:'6px 14px',borderRadius:9,background:'#eef2ff',border:'1px solid #c7d2fe'}}>
              <span style={{fontSize:12,fontWeight:700,color:ACC}}>8 skills activas</span>
            </div>
          </div>

          {sorted.map((s,i)=>{
            const isExpanded = expandedSkill===s.key;
            const isStrong   = s.val>=70;
            const isWeak     = s.val<40;
            return (
              <div key={s.key}>
                <div className="skill-row" onClick={()=>setExpandedSkill(isExpanded?null:s.key)}
                  style={{display:'flex',alignItems:'center',gap:16,padding:'15px 28px',borderBottom:'1px solid #f5f3ff',background:isExpanded?'#f8f7ff':'transparent'}}>
                  <div style={{width:42,height:42,borderRadius:12,background:isStrong?`${s.color}12`:isWeak?'#fef2f2':'#f8f7ff',border:`1px solid ${isStrong?s.color+'25':isWeak?'#fecaca':'#ede9fe'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:11,fontWeight:800,color:isStrong?s.color:isWeak?'#ef4444':'#a5b4fc',letterSpacing:.5}}>{s.abbr}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{s.label}</span>
                      <div style={{display:'flex',alignItems:'center',gap:9}}>
                        {isStrong && <span style={{fontSize:10,padding:'2px 9px',borderRadius:100,background:`${s.color}12`,color:s.color,fontWeight:700}}>Verificada ✓</span>}
                        {isWeak   && <span style={{fontSize:10,padding:'2px 9px',borderRadius:100,background:'#fef2f2',color:'#ef4444',fontWeight:700}}>A mejorar</span>}
                        <span style={{fontSize:17,fontWeight:900,color:isStrong?s.color:isWeak?'#ef4444':'#374151',fontFamily:'monospace',minWidth:30,textAlign:'right'}}>{s.val}</span>
                      </div>
                    </div>
                    <div style={{height:6,borderRadius:3,background:'#ede9fe',overflow:'hidden'}}>
                      <div style={{width:`${Math.min(s.val,100)}%`,height:'100%',borderRadius:3,background:isWeak?'linear-gradient(90deg,#fca5a5,#ef4444)':isStrong?`linear-gradient(90deg,${s.color}70,${s.color})`:`linear-gradient(90deg,#a5b4fc,#6366f1)`,transition:'width 1.2s ease'}}/>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:'#a5b4fc',transform:isExpanded?'rotate(180deg)':'none',transition:'transform .2s',flexShrink:0}}>▼</div>
                </div>
                {isExpanded && (
                  <div style={{padding:'16px 28px 20px 90px',background:'#f8f7ff',borderBottom:'1px solid #ede9fe',animation:'slideDown .2s ease'}}>
                    <p style={{fontSize:10,fontWeight:700,color:s.color,letterSpacing:'1.5px',marginBottom:12}}>SUBCRITERIOS EVALUADOS POR IA</p>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {s.criterios.map((c,ci)=>(
                        <div key={ci} style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:22,height:22,borderRadius:7,background:`${s.color}12`,border:`1px solid ${s.color}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <span style={{fontSize:10,fontWeight:700,color:s.color}}>{ci+1}</span>
                          </div>
                          <span style={{fontSize:12,color:'#475569',lineHeight:1.5}}>{c}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:12,padding:'9px 13px',borderRadius:9,background:'#fff',border:`1px solid ${s.color}18`}}>
                      <p style={{fontSize:11,color:'#94a3b8',margin:0}}>Cada subcriterio se puntúa 0-2 en cada sesión. La media acumulada define tu valor.</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FORTALEZAS Y DEBILIDADES */}
        <div className="s2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
          <div className="sb-card" style={{overflow:'hidden'}}>
            <div style={{padding:'18px 22px',borderBottom:'1px solid #e8eaf0',display:'flex',alignItems:'center',gap:9}}>
              <div style={{width:9,height:9,borderRadius:'50%',background:'#059669'}}/>
              <h3 style={{fontSize:16,fontWeight:700,color:'#0f172a'}}>Puntos fuertes</h3>
            </div>
            <div style={{padding:'18px 22px'}}>
              {strongest.map((s,i)=>(
                <div key={s.key} style={{display:'flex',alignItems:'center',gap:12,marginBottom:i<2?14:0}}>
                  <div style={{width:34,height:34,borderRadius:9,background:`${s.color}10`,border:`1px solid ${s.color}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:10,fontWeight:800,color:s.color}}>{s.abbr}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:600,color:'#374151'}}>{s.label}</span>
                      <span style={{fontSize:15,fontWeight:900,color:s.color}}>{s.val}</span>
                    </div>
                    <div style={{height:4,borderRadius:2,background:'#e8eaf0',overflow:'hidden'}}>
                      <div style={{width:`${s.val}%`,height:'100%',borderRadius:2,background:`linear-gradient(90deg,${s.color}60,${s.color})`,transition:'width 1s ease'}}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="sb-card" style={{overflow:'hidden'}}>
            <div style={{padding:'18px 22px',borderBottom:'1px solid #e8eaf0',display:'flex',alignItems:'center',gap:9}}>
              <div style={{width:9,height:9,borderRadius:'50%',background:'#ef4444'}}/>
              <h3 style={{fontSize:16,fontWeight:700,color:'#0f172a'}}>Áreas de mejora</h3>
            </div>
            <div style={{padding:'18px 22px'}}>
              {weakest.map((s,i)=>(
                <div key={s.key} style={{display:'flex',alignItems:'center',gap:12,marginBottom:i<2?14:0}}>
                  <div style={{width:34,height:34,borderRadius:9,background:'#fef2f2',border:'1px solid #fecaca',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:10,fontWeight:800,color:'#ef4444'}}>{s.abbr}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:600,color:'#374151'}}>{s.label}</span>
                      <span style={{fontSize:15,fontWeight:900,color:'#ef4444'}}>{s.val}</span>
                    </div>
                    <div style={{height:4,borderRadius:2,background:'#e8eaf0',overflow:'hidden'}}>
                      <div style={{width:`${s.val}%`,height:'100%',borderRadius:2,background:'linear-gradient(90deg,#fca5a5,#ef4444)',transition:'width 1s ease'}}/>
                    </div>
                  </div>
                </div>
              ))}
              <button className="sb-btn-primary pb" onClick={()=>navigate('/sesion')} style={{width:'100%',marginTop:16,padding:'11px',fontSize:13}}>
                Entrenar ahora →
              </button>
            </div>
          </div>
        </div>

        {/* COMPARATIVA */}
        {ranking.length>0 && (
          <div className="s2 sb-card" style={{overflow:'hidden'}}>
            <div style={{padding:'18px 22px',borderBottom:'1px solid #e8eaf0'}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#0f172a',marginBottom:3}}>Comparativa con el ranking</h3>
              <p style={{fontSize:12,color:'#64748b'}}>Cómo se compara tu OVR con los mejores analistas</p>
            </div>
            <div style={{padding:'18px 22px'}}>
              {[{nombre:user?.nombre,ovr,arena,tier,isMe:true},...ranking.slice(0,4).filter(j=>j.nombre!==user?.nombre).map(j=>({...j,ovr:calcOVR(j.skills||{}),isMe:false}))].map((j,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 12px',borderRadius:10,background:j.isMe?'#f8f7ff':'transparent',border:j.isMe?`1.5px solid #c7d2fe`:'1.5px solid transparent',marginBottom:7}}>
                  <span style={{fontSize:13,width:22,color:'#94a3b8',fontWeight:600}}>#{i+1}</span>
                  <AvatarCircle name={j.nombre} size={34} color={j.isMe?ACC:TIER_CLR[j.tier]||'#64748b'}/>
                  <div style={{flex:1,minWidth:0}}>
                    <span style={{fontSize:13,fontWeight:j.isMe?700:500,color:j.isMe?ACC:'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block'}}>{j.nombre}{j.isMe?' (tú)':''}</span>
                    <div style={{fontSize:11,color:'#94a3b8'}}>{j.arena}</div>
                  </div>
                  <div style={{width:150,height:5,borderRadius:3,background:'#ede9fe',overflow:'hidden'}}>
                    <div style={{width:`${(j.ovr||50)}%`,height:'100%',borderRadius:3,background:j.isMe?`linear-gradient(90deg,${ACC},#6366f1)`:'#a5b4fc',transition:'width 1s ease'}}/>
                  </div>
                  <span style={{fontSize:16,fontWeight:900,color:j.isMe?ACC:'#374151',minWidth:30,textAlign:'right'}}>{j.ovr||50}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
