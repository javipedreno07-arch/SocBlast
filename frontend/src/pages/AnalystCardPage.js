import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';
const ACC = '#0a66c2';

const SKILLS = [
  { key:'analisis_logs',           abbr:'LOG', label:'Analisis de Logs',      color:'#3b82f6',
    criterios:['Identifica logs relevantes entre el ruido','Correlaciona eventos por timestamp','Lee correctamente campos clave','Detecta anomalias en patrones','Reconstruye la secuencia del ataque'] },
  { key:'deteccion_amenazas',      abbr:'DET', label:'Deteccion de Amenazas', color:'#6366f1',
    criterios:['Identifica el IOC principal correcto','Clasifica la severidad apropiadamente','Distingue falsos positivos','Reconoce el tipo de ataque','Asocia el comportamiento con TTPs'] },
  { key:'respuesta_incidentes',    abbr:'RSP', label:'Respuesta a Incidentes',color:'#f59e0b',
    criterios:['Elige la accion de contencion correcta','Prioriza contencion sobre erradicacion','No toma acciones daninas','Sigue el orden logico de respuesta','Propone remediacion adecuada'] },
  { key:'threat_hunting',          abbr:'THR', label:'Threat Hunting',        color:'#8b5cf6',
    criterios:['Busca proactivamente mas alla de alertas','Identifica movimiento lateral oculto','Formula hipotesis correctas','Usa queries SIEM efectivas','Conecta indicios no relacionados'] },
  { key:'forense_digital',         abbr:'FOR', label:'Forense Digital',       color:'#ec4899',
    criterios:['Identifica el vector de entrada','Reconstruye la cadena de compromiso','Localiza artefactos relevantes','Estima el alcance del dano','Preserva la integridad de evidencia'] },
  { key:'gestion_vulnerabilidades',abbr:'VUL', label:'Gestion de Vulns',      color:'#f97316',
    criterios:['Identifica la vulnerabilidad explotada','Prioriza por criticidad e impacto','Propone parche o mitigacion','Evalua el riesgo residual','Considera el contexto del entorno'] },
  { key:'inteligencia_amenazas',   abbr:'INT', label:'Intel. de Amenazas',    color:'#10b981',
    criterios:['Asocia el ataque con actores conocidos','Identifica TTPs con MITRE ATT&CK','Usa contexto de threat intel','Reconoce infraestructura C2','Propone indicadores de bloqueo'] },
  { key:'siem_queries',            abbr:'SIE', label:'SIEM & Queries',        color:'#0891b2',
    criterios:['Formula queries eficientes','Usa campos y operadores adecuados','Reduce el ruido con filtros','Crea correlaciones entre fuentes','Interpreta correctamente resultados'] },
];

const TIERS    = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const TIER_CLR = ['','#64748b','#0a66c2','#0891b2','#059669','#d97706','#ea580c','#dc2626','#7c3aed'];

const ARENA_COLORS = {
  bronce:   { main:'#b45309', light:'#fef3c7', border:'#fcd34d', name:'Bronce' },
  plata:    { main:'#475569', light:'#f1f5f9', border:'#cbd5e1', name:'Plata'  },
  oro:      { main:'#92400e', light:'#fffbeb', border:'#fde68a', name:'Oro'    },
  diamante: { main:'#1e40af', light:'#eff6ff', border:'#bfdbfe', name:'Diamante' },
};

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
  return Math.max(50, Math.round(vals.reduce((a,b)=>a+b,0)/vals.length));
}

const DEFAULT_AVATAR_CONFIG = {
  top:'shortFlat', hairColor:'2c1b18', accessories:'blank',
  facialHair:'blank', facialHairColor:'2c1b18', clothe:'hoodie',
  clotheColor:'262e33', skin:'edb98a', eyes:'default', eyebrow:'default', mouth:'default',
};
function buildAvatarUrl(config={}, size=120) {
  const c = {...DEFAULT_AVATAR_CONFIG,...config};
  const seed = c.top+'-'+c.hairColor+'-'+c.clothe+'-'+c.clotheColor+'-'+c.skin+'-'+c.eyes+'-'+c.eyebrow+'-'+c.mouth+'-'+c.accessories+'-'+c.facialHair+'-'+c.facialHairColor;
  return 'https://api.dicebear.com/9.x/avataaars/svg?seed='+encodeURIComponent(seed)+'&backgroundColor=dbeafe&size='+size;
}

function AvatarCircle({name='', avatarConfig=null, size=96, foto='', color=ACC}) {
  const [loaded, setLoaded] = useState(false);
  const key = avatarConfig ? JSON.stringify(avatarConfig) : '';
  if (foto) return (
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',border:'4px solid #fff',boxShadow:'0 0 0 2px #e2e8f0'}}>
      <img src={foto} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    </div>
  );
  if (avatarConfig) return (
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',border:'4px solid #fff',boxShadow:'0 0 0 2px #e2e8f0',background:'#dbeafe',position:'relative'}}>
      {!loaded && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:size*.28,height:size*.28,border:'2px solid '+color+'30',borderTop:'2px solid '+color,borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>}
      <img key={key} src={buildAvatarUrl(avatarConfig,size*2)} alt={name} width={size} height={size}
        onLoad={()=>setLoaded(true)} onError={()=>setLoaded(true)}
        style={{width:'100%',height:'100%',objectFit:'cover',opacity:loaded?1:0,transition:'opacity .3s'}}/>
    </div>
  );
  const initials = name.trim().split(' ').map(w=>w[0]?.toUpperCase()||'').slice(0,2).join('');
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:'linear-gradient(135deg,'+color+','+color+'cc)',display:'flex',alignItems:'center',justifyContent:'center',border:'4px solid #fff',boxShadow:'0 0 0 2px #e2e8f0'}}>
      <span style={{fontSize:size*.34,fontWeight:700,color:'#fff'}}>{initials||'?'}</span>
    </div>
  );
}

export default function AnalystCardPage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData,      setUserData]      = useState(null);
  const [ranking,       setRanking]       = useState([]);
  const [expandedSkill, setExpandedSkill] = useState(null);

  useEffect(() => {
    axios.get(API+'/api/me', {headers:{Authorization:'Bearer '+token}})
      .then(r => setUserData(r.data))
      .catch(() => { logout(); navigate('/login'); });
    axios.get(API+'/api/ranking', {headers:{Authorization:'Bearer '+token}})
      .then(r => setRanking(r.data?.jugadores || []))
      .catch(() => {});
  }, []);

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}
    .fu{animation:fadeUp .3s ease forwards;}
    .s1{animation:fadeUp .3s ease .06s both;}
    .s2{animation:fadeUp .3s ease .12s both;}
    .skill-row{cursor:pointer;transition:background .15s;}
    .skill-row:hover{background:#f0f7ff!important;}
    .nb:hover{background:#f3f4f6!important;}
  `;

  if (!userData) return (
    <div style={{minHeight:'100vh',background:'#f3f2ef',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:36,height:36,border:'3px solid #e2e8f0',borderTop:'3px solid '+ACC,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div>
  );

  const skills      = userData.skills || {};
  const copas       = userData.copas || 0;
  const tier        = userData.tier || 1;
  const arena       = userData.arena || 'Bronce 3';
  const group       = getArenaGroup(arena);
  const ac          = ARENA_COLORS[group];
  const tierColor   = TIER_CLR[tier] || '#64748b';
  const ovr         = calcOVR(skills);
  const avatarConfig = userData.avatar_config || null;
  const foto        = userData.foto_perfil || '';
  const skillVals   = SKILLS.map(s => ({...s, val: Math.max(0, Math.round((skills[s.key]||0)*10))}));
  const sorted      = [...skillVals].sort((a,b) => b.val-a.val);
  const strongest   = sorted.slice(0,3);
  const weakest     = [...skillVals].sort((a,b) => a.val-b.val).slice(0,3);
  const avgSkill    = Math.round(skillVals.reduce((a,s)=>a+s.val,0)/skillVals.length);

  return (
    <div style={{minHeight:'100vh',background:'#f3f2ef',fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",color:'#0f172a'}}>
      <style>{css}</style>

      {/* NAVBAR */}
      <nav style={{position:'sticky',top:0,zIndex:50,height:52,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',background:'#fff',borderBottom:'1px solid #e2e8f0',boxShadow:'0 1px 3px rgba(0,0,0,0.07)'}}>
        <button className="nb" onClick={()=>navigate('/dashboard')}
          style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'1px solid #e2e8f0',color:'#374151',padding:'5px 14px',borderRadius:7,fontSize:13,cursor:'pointer',fontWeight:500}}>
          ← Dashboard
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <img src="/logosoc.png" alt="SocBlast" style={{height:24}}/>
          <span style={{fontSize:14,fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
          <span style={{fontSize:12,color:'#94a3b8',margin:'0 4px'}}>/</span>
          <span style={{fontSize:13,fontWeight:600,color:'#374151'}}>Analyst Card</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <AvatarCircle name={user?.nombre} avatarConfig={avatarConfig} size={28} foto={foto} color={ACC}/>
          <span style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{user?.nombre}</span>
        </div>
      </nav>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'24px 16px 60px'}}>

        {/* PROFILE HEADER — LinkedIn style */}
        <div className="fu" style={{borderRadius:12,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 4px rgba(0,0,0,0.07)',overflow:'hidden',marginBottom:14}}>
          {/* Banner */}
          <div style={{height:120,background:'linear-gradient(135deg,#0a66c2 0%,#0284c7 60%,#0369a1 100%)',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,opacity:.06,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'28px 28px'}}/>
            {/* OVR badge en banner */}
            <div style={{position:'absolute',top:16,right:20,padding:'8px 20px',borderRadius:12,background:'rgba(255,255,255,0.15)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.25)',textAlign:'center'}}>
              <div style={{fontSize:32,fontWeight:900,color:'#fff',lineHeight:1,letterSpacing:'-1px'}}>{ovr}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.8)',fontWeight:700,letterSpacing:'2px',marginTop:2}}>OVR SCORE</div>
            </div>
            <div style={{position:'absolute',bottom:12,left:20,display:'flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:100,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#4ade80',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:11,color:'#fff',fontWeight:600}}>SocBlast Verified Analyst</span>
            </div>
          </div>

          <div style={{padding:'0 28px 24px'}}>
            {/* Avatar + acciones */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:-44,marginBottom:16}}>
              <AvatarCircle name={user?.nombre} avatarConfig={avatarConfig} size={96} foto={foto} color={ACC}/>
              <div style={{display:'flex',gap:8,paddingBottom:4}}>
                <button onClick={()=>navigate('/sesion')}
                  style={{padding:'8px 18px',borderRadius:100,background:ACC,border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                  Jugar sesion
                </button>
                <button onClick={()=>navigate('/perfil')}
                  style={{padding:'8px 18px',borderRadius:100,background:'#fff',border:'1px solid '+ACC,color:ACC,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                  Editar perfil
                </button>
              </div>
            </div>

            {/* Info */}
            <h1 style={{fontSize:24,fontWeight:800,color:'#0f172a',marginBottom:4,letterSpacing:'-0.5px'}}>{user?.nombre}</h1>
            <p style={{fontSize:14,color:'#374151',marginBottom:8}}>
              <span style={{fontWeight:700,color:tierColor}}>{TIERS[tier]||'SOC Rookie'}</span>
              <span style={{color:'#cbd5e1',margin:'0 8px'}}>·</span>
              <span>Cybersecurity Analyst</span>
              <span style={{color:'#cbd5e1',margin:'0 8px'}}>·</span>
              <span style={{color:'#64748b'}}>SocBlast Platform</span>
            </p>
            <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
              <div onClick={()=>navigate('/arenas')} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 12px',borderRadius:100,background:ac.light,border:'1px solid '+ac.border,cursor:'pointer'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:ac.main}}/>
                <span style={{fontSize:12,fontWeight:700,color:ac.main}}>{arena}</span>
              </div>
              <span style={{fontSize:13,color:'#64748b'}}>{userData.sesiones_completadas||0} sesiones completadas</span>
              <span style={{fontSize:13,color:'#64748b'}}>{copas.toLocaleString()} copas</span>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',borderTop:'1px solid #e2e8f0'}}>
            {[
              {val:ovr,                        label:'OVR Score',   sub:'Overall Rating',     color:ac.main},
              {val:copas.toLocaleString(),     label:'Copas',       sub:'Puntos competitivos', color:'#d97706'},
              {val:userData.sesiones_completadas||0, label:'Sesiones', sub:'Completadas',    color:'#059669'},
              {val:(userData.xp||0).toLocaleString(), label:'XP Total', sub:'Experiencia',   color:tierColor},
            ].map((s,i) => (
              <div key={i} style={{padding:'16px',textAlign:'center',borderLeft:i>0?'1px solid #e2e8f0':'none',background:i===0?ac.light+'50':'transparent'}}>
                <div style={{fontSize:26,fontWeight:800,color:s.color,lineHeight:1,letterSpacing:'-0.5px'}}>{s.val}</div>
                <div style={{fontSize:12,fontWeight:700,color:'#374151',marginTop:3}}>{s.label}</div>
                <div style={{fontSize:10,color:'#94a3b8',marginTop:1}}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SKILLS — LinkedIn endorsements style */}
        <div className="s1" style={{borderRadius:12,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',overflow:'hidden',marginBottom:14}}>
          <div style={{padding:'20px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h2 style={{fontSize:18,fontWeight:700,color:'#0f172a',marginBottom:2}}>Skills verificadas</h2>
              <p style={{fontSize:13,color:'#64748b'}}>Evaluadas por IA en cada sesion. Promedio: <strong style={{color:ACC}}>{avgSkill}/100</strong></p>
            </div>
            <div style={{padding:'6px 14px',borderRadius:8,background:ACC+'0d',border:'1px solid '+ACC+'20'}}>
              <span style={{fontSize:12,fontWeight:700,color:ACC}}>8 skills activas</span>
            </div>
          </div>

          {sorted.map((s,i) => {
            const isExpanded = expandedSkill === s.key;
            const isStrong   = s.val >= 70;
            const isWeak     = s.val < 40;
            const pct        = Math.min(s.val, 100);
            return (
              <div key={s.key}>
                <div className="skill-row" onClick={()=>setExpandedSkill(isExpanded?null:s.key)}
                  style={{display:'flex',alignItems:'center',gap:16,padding:'14px 24px',borderBottom:'1px solid #f1f5f9',background:isExpanded?'#f0f7ff':'transparent'}}>
                  {/* icono skill */}
                  <div style={{width:40,height:40,borderRadius:10,background:isStrong?s.color+'12':isWeak?'#fef2f2':'#f8fafc',border:'1px solid '+(isStrong?s.color+'25':isWeak?'#fecaca':'#e2e8f0'),display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:11,fontWeight:800,color:isStrong?s.color:isWeak?'#ef4444':'#94a3b8',letterSpacing:.5}}>{s.abbr}</span>
                  </div>
                  {/* nombre + barra */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                      <span style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{s.label}</span>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        {isStrong && <span style={{fontSize:10,padding:'2px 8px',borderRadius:100,background:s.color+'12',color:s.color,fontWeight:700}}>Verificada</span>}
                        {isWeak   && <span style={{fontSize:10,padding:'2px 8px',borderRadius:100,background:'#fef2f2',color:'#ef4444',fontWeight:700}}>A mejorar</span>}
                        <span style={{fontSize:16,fontWeight:800,color:isStrong?s.color:isWeak?'#ef4444':'#374151',fontFamily:'monospace',minWidth:28,textAlign:'right'}}>{s.val}</span>
                      </div>
                    </div>
                    <div style={{height:5,borderRadius:3,background:'#e2e8f0',overflow:'hidden'}}>
                      <div style={{width:pct+'%',height:'100%',borderRadius:3,background:isWeak?'linear-gradient(90deg,#fca5a5,#ef4444)':isStrong?'linear-gradient(90deg,'+s.color+'80,'+s.color+')':'linear-gradient(90deg,#94a3b8,#64748b)',transition:'width 1.2s ease'}}/>
                    </div>
                  </div>
                  {/* toggle */}
                  <div style={{fontSize:11,color:'#94a3b8',transform:isExpanded?'rotate(180deg)':'none',transition:'transform .2s',flexShrink:0}}>▼</div>
                </div>
                {/* criterios expandidos */}
                {isExpanded && (
                  <div style={{padding:'14px 24px 18px 80px',background:'#f8fbff',borderBottom:'1px solid #e2e8f0',animation:'slideDown .2s ease'}}>
                    <p style={{fontSize:10,fontWeight:700,color:s.color,letterSpacing:'1.5px',marginBottom:10}}>SUBCRITERIOS EVALUADOS POR IA</p>
                    <div style={{display:'flex',flexDirection:'column',gap:7}}>
                      {s.criterios.map((c,ci) => (
                        <div key={ci} style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:20,height:20,borderRadius:6,background:s.color+'12',border:'1px solid '+s.color+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <span style={{fontSize:10,fontWeight:700,color:s.color}}>{ci+1}</span>
                          </div>
                          <span style={{fontSize:12,color:'#475569',lineHeight:1.5}}>{c}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:10,padding:'8px 12px',borderRadius:7,background:'#fff',border:'1px solid '+s.color+'18'}}>
                      <p style={{fontSize:11,color:'#94a3b8',margin:0}}>Cada subcriterio se puntua 0-2 en cada sesion. La media acumulada define tu valor.</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FORTALEZAS Y DEBILIDADES */}
        <div className="s2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div style={{borderRadius:12,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 4px rgba(0,0,0,0.05)',overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#059669'}}/>
              <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a'}}>Puntos fuertes</h3>
            </div>
            <div style={{padding:'16px 20px'}}>
              {strongest.map((s,i) => (
                <div key={s.key} style={{display:'flex',alignItems:'center',gap:12,marginBottom:i<2?12:0}}>
                  <div style={{width:32,height:32,borderRadius:8,background:s.color+'10',border:'1px solid '+s.color+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:10,fontWeight:800,color:s.color}}>{s.abbr}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:600,color:'#374151'}}>{s.label}</span>
                      <span style={{fontSize:14,fontWeight:800,color:s.color}}>{s.val}</span>
                    </div>
                    <div style={{height:3,borderRadius:2,background:'#e2e8f0',overflow:'hidden'}}>
                      <div style={{width:s.val+'%',height:'100%',borderRadius:2,background:s.color,transition:'width 1s ease'}}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{borderRadius:12,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 4px rgba(0,0,0,0.05)',overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#ef4444'}}/>
              <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a'}}>Areas de mejora</h3>
            </div>
            <div style={{padding:'16px 20px'}}>
              {weakest.map((s,i) => (
                <div key={s.key} style={{display:'flex',alignItems:'center',gap:12,marginBottom:i<2?12:0}}>
                  <div style={{width:32,height:32,borderRadius:8,background:'#fef2f2',border:'1px solid #fecaca',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:10,fontWeight:800,color:'#ef4444'}}>{s.abbr}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:600,color:'#374151'}}>{s.label}</span>
                      <span style={{fontSize:14,fontWeight:800,color:'#ef4444'}}>{s.val}</span>
                    </div>
                    <div style={{height:3,borderRadius:2,background:'#e2e8f0',overflow:'hidden'}}>
                      <div style={{width:s.val+'%',height:'100%',borderRadius:2,background:'#ef4444',transition:'width 1s ease'}}/>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={()=>navigate('/sesion')}
                style={{width:'100%',marginTop:14,padding:'10px',borderRadius:100,background:ACC,border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                Entrenar ahora
              </button>
            </div>
          </div>
        </div>

        {/* COMPARATIVA RANKING */}
        {ranking.length > 0 && (
          <div className="s2" style={{borderRadius:12,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 4px rgba(0,0,0,0.05)',overflow:'hidden',marginBottom:14}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid #e2e8f0'}}>
              <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:2}}>Comparativa con el ranking</h3>
              <p style={{fontSize:12,color:'#64748b'}}>Como se compara tu OVR con los mejores analistas</p>
            </div>
            <div style={{padding:'16px 20px'}}>
              {[{nombre:user?.nombre, ovr, arena, tier, isMe:true}, ...ranking.slice(0,4).filter(j=>j.nombre!==user?.nombre).map(j=>({...j,ovr:calcOVR(j.skills||{}),isMe:false}))].map((j,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 10px',borderRadius:8,background:j.isMe?ACC+'08':'transparent',border:j.isMe?'1px solid '+ACC+'20':'1px solid transparent',marginBottom:6}}>
                  <span style={{fontSize:13,width:20,color:'#94a3b8',fontWeight:600}}>#{i+1}</span>
                  <div style={{width:32,height:32,borderRadius:'50%',background:j.isMe?ACC:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:11,fontWeight:700,color:j.isMe?'#fff':'#64748b'}}>{j.nombre?.[0]?.toUpperCase()||'?'}</span>
                  </div>
                  <div style={{flex:1}}>
                    <span style={{fontSize:13,fontWeight:j.isMe?700:500,color:j.isMe?ACC:'#374151'}}>{j.nombre}{j.isMe?' (tu)':''}</span>
                    <div style={{fontSize:11,color:'#94a3b8'}}>{j.arena}</div>
                  </div>
                  <div style={{width:140,height:4,borderRadius:2,background:'#e2e8f0',overflow:'hidden'}}>
                    <div style={{width:(j.ovr||50)+'%',height:'100%',borderRadius:2,background:j.isMe?ACC:'#94a3b8',transition:'width 1s ease'}}/>
                  </div>
                  <span style={{fontSize:15,fontWeight:800,color:j.isMe?ACC:'#374151',minWidth:28,textAlign:'right'}}>{j.ovr||50}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
