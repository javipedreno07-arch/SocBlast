import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SBNav, AvatarCircle, Icon, ACC, BG, BASE_CSS, SBSpinner, ARENA_COLORS, TIERS, TIER_CLR, ARENAS_CONFIG, getArenaGroup, getArenaFromPuntos } from './SBLayout';

const API = 'https://socblast-production.up.railway.app';

const SKILL_ABBR = [
  { key:'analisis_logs',           abbr:'LOG', label:'Analisis de Logs'     },
  { key:'deteccion_amenazas',      abbr:'DET', label:'Deteccion Amenazas'   },
  { key:'respuesta_incidentes',    abbr:'RSP', label:'Respuesta Incidentes' },
  { key:'threat_hunting',          abbr:'THR', label:'Threat Hunting'       },
  { key:'forense_digital',         abbr:'FOR', label:'Forense Digital'      },
  { key:'gestion_vulnerabilidades',abbr:'VUL', label:'Gestion de Vulns'     },
  { key:'inteligencia_amenazas',   abbr:'INT', label:'Intel. Amenazas'      },
  { key:'siem_queries',            abbr:'SIE', label:'SIEM & Queries'       },
];

const LAB_TIPOS = [
  { id:'forense',           label:'Forense',           color:'#0891b2' },
  { id:'threat_hunt',       label:'Threat Hunt',       color:'#7c3aed' },
  { id:'incident_response', label:'Incident Response', color:'#ef4444' },
  { id:'malware',           label:'Malware',           color:'#dc2626' },
  { id:'osint',             label:'OSINT',              color:'#059669' },
];

const LAB_MODOS = [
  { id:'investigacion', label:'Investigación', color:'#059669', bg:'linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)', accent:'#6ee7b7', desc:'Sin timer · Solo XP', icon:'🔬' },
  { id:'certificacion', label:'Certificación', color:'#d97706', bg:'linear-gradient(135deg,#78350f 0%,#92400e 50%,#b45309 100%)', accent:'#fcd34d', desc:'45 min · Copas x0.5',   icon:'🏅' },
  { id:'arena',         label:'Arena',         color:'#4f46e5', bg:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#3730a3 100%)', accent:'#a5b4fc', desc:'20 min · Copas',       icon:'⚡' },
];

function calcOVR(skills) {
  const vals = SKILL_ABBR.map(s => Math.round((skills?.[s.key]||0)*10));
  return Math.max(50, Math.round(vals.reduce((a,b)=>a+b,0)/vals.length));
}

const calcStreak = hist => {
  if (!hist.length) return 0;
  const dates = [...new Set(hist.map(s=>new Date(s.inicio*1000).toISOString().split('T')[0]))].sort().reverse();
  let streak=0, cur=new Date();
  for (const d of dates) { const diff=Math.floor((cur-new Date(d))/86400000); if(diff<=1){streak++;cur=new Date(d);}else break; }
  return streak;
};

function ActivityHeatmap({historial}) {
  const days=90, today=new Date();
  const cells=Array.from({length:days},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-(days-1-i));const ds=d.toISOString().split('T')[0];return{date:d,count:historial.filter(s=>new Date(s.inicio*1000).toISOString().split('T')[0]===ds).length};});
  const weeks=[]; for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));
  const gc=c=>c===0?'#e8eaf0':c===1?'#c7d2fe':c===2?'#818cf8':ACC;
  return(
    <div style={{display:'flex',gap:'3px'}}>
      {weeks.map((wk,wi)=>(
        <div key={wi} style={{display:'flex',flexDirection:'column',gap:'3px'}}>
          {wk.map((d,di)=>(
            <div key={di} title={`${d.date.toLocaleDateString('es-ES')} · ${d.count} labs`}
              style={{width:'10px',height:'10px',borderRadius:'2px',backgroundColor:gc(d.count),cursor:'default',transition:'transform .1s'}}
              onMouseEnter={e=>e.target.style.transform='scale(1.5)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
          ))}
        </div>
      ))}
    </div>
  );
}

function ComingSoon({title, desc, icon, color=ACC}) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',textAlign:'center',background:'#f8f7ff',borderRadius:14,border:`1px dashed ${color}30`,minHeight:200}}>
      <div style={{width:48,height:48,borderRadius:14,background:`${color}10`,border:`1px solid ${color}20`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
        <Icon name={icon} size={22} color={color}/>
      </div>
      <span style={{fontSize:11,fontWeight:700,color,letterSpacing:'1.5px',marginBottom:10}}>PRÓXIMAMENTE</span>
      <h3 style={{fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:6}}>{title}</h3>
      <p style={{fontSize:13,color:'#64748b',lineHeight:1.6,maxWidth:300}}>{desc}</p>
    </div>
  );
}

export default function DashboardAnalista() {
  const {user, token, logout} = useAuth();
  const navigate = useNavigate();
  const [userData,    setUserData]    = useState(user);
  const [historial,   setHistorial]   = useState([]);
  const [empleoTab,   setEmpleoTab]   = useState('ofertas');
  const [ranking,     setRanking]     = useState([]);
  const [modoIdx,     setModoIdx]     = useState(0);

  useEffect(() => { fetchUser(); }, []);

  const fetchUser = async () => {
    try {
      const r = await axios.get(`${API}/api/me`, {headers:{Authorization:`Bearer ${token}`}});
      setUserData(r.data);
      try { const h = await axios.get(`${API}/api/lab/historial`, {headers:{Authorization:`Bearer ${token}`}}); setHistorial(h.data||[]); } catch(e) {}
      try { const rk = await axios.get(`${API}/api/ranking`, {headers:{Authorization:`Bearer ${token}`}}); setRanking((rk.data?.jugadores||[]).slice(0,3)); } catch(e) {}
    } catch(err) {
      if (err?.response?.status===401) { logout(); navigate('/login'); }
      else if (user) setUserData(user);
    }
  };

  const copas      = userData?.copas||0;
  const xp         = userData?.xp||0;
  const tier       = userData?.tier||1;
  const skills     = userData?.skills||{};
  const arena      = userData?.arena||'Bronce 3';
  const arenaObj   = getArenaFromPuntos(copas);
  const group      = getArenaGroup(arena);
  const ac         = ARENA_COLORS[group];
  const streak     = calcStreak(historial);
  const ovr        = calcOVR(skills);
  const XP_MAX     = [0,500,1500,3000,5000,8000,12000,18000,99999];
  const pctXP      = Math.min(((xp-(XP_MAX[tier-1]||0))/((XP_MAX[tier]||99999)-(XP_MAX[tier-1]||0)))*100,100);
  const tierColor  = TIER_CLR[tier]||'#64748b';
  const skillVals  = SKILL_ABBR.map(s=>({...s,val:Math.max(0,Math.round((skills?.[s.key]||0)*10))}));
  const topSkills  = [...skillVals].sort((a,b)=>b.val-a.val).slice(0,4);
  const weakSkills = [...skillVals].sort((a,b)=>a.val-b.val).slice(0,1);
  const sigArena   = ARENAS_CONFIG[ARENAS_CONFIG.findIndex(a=>a.id===arenaObj.id)+1];
  const avatarConfig = userData?.avatar_config||null;
  const foto       = userData?.foto_perfil||'';
  const totalLabs  = historial.length;
  const modoActual = LAB_MODOS[modoIdx];

  if (!userData) return <SBSpinner/>;

  return (
    <div style={{minHeight:'100vh',background:BG,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",color:'#0f172a'}}>
      <style>{BASE_CSS + `
        .qb:hover{background:#f0eeff!important;border-color:#c7d2fe!important;}
        .hr:hover{background:#f8f7ff!important;}
        .pb:hover{opacity:.88;transform:translateY(-1px);}
        .tipo-btn:hover{filter:brightness(1.15);transform:translateY(-1px);}
      `}</style>

      <SBNav user={user} avatarConfig={avatarConfig} foto={foto} activePage="/dashboard" navigate={navigate}/>

      <div style={{maxWidth:1080,margin:'0 auto',padding:'24px 24px 64px',display:'grid',gridTemplateColumns:'300px 1fr',gap:18,alignItems:'start'}}>

        {/* COLUMNA IZQUIERDA */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>

          {/* Profile Card */}
          <div className="fu sb-card" style={{overflow:'hidden'}}>
            <div style={{height:90,background:'linear-gradient(135deg,#4f46e5 0%,#6366f1 60%,#818cf8 100%)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',inset:0,opacity:.08,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'24px 24px'}}/>
              <div style={{position:'absolute',top:'-30px',right:'-30px',width:'120px',height:'120px',borderRadius:'50%',background:'rgba(255,255,255,0.06)'}}/>
              <div style={{position:'absolute',top:12,right:14,display:'flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:100,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)'}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:'#4ade80',animation:'pulse 2s infinite'}}/>
                <span style={{fontSize:10,color:'#fff',fontWeight:600,letterSpacing:'.5px'}}>SocBlast Verified</span>
              </div>
            </div>
            <div style={{padding:'0 22px 22px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:-38,marginBottom:16}}>
                <div style={{position:'relative'}}>
                  <AvatarCircle name={user?.nombre} avatarConfig={avatarConfig} size={80} foto={foto}/>
                  <div style={{position:'absolute',bottom:-2,right:-2,width:26,height:26,borderRadius:'50%',background:ac.main,border:'3px solid #fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontSize:10,fontWeight:900,color:'#fff'}}>{ovr}</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:7,paddingBottom:2}}>
                  <button className="sb-btn-primary pb" onClick={()=>navigate('/analyst-card')} style={{padding:'7px 14px',fontSize:12}}>Analyst Card</button>
                  <button className="sb-btn-outline pb" onClick={()=>navigate('/perfil')} style={{padding:'7px 14px',fontSize:12}}>Editar</button>
                </div>
              </div>
              <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:3,letterSpacing:'-0.4px'}}>{user?.nombre}</h2>
              <p style={{fontSize:13,color:'#374151',marginBottom:10}}>
                <span style={{fontWeight:700,color:tierColor}}>{TIERS[tier]}</span>
                <span style={{color:'#e2e8f0',margin:'0 7px'}}>·</span>
                Cybersecurity Analyst
              </p>
              <div onClick={()=>navigate('/arenas')} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:100,background:ac.light,border:`1px solid ${ac.border}`,marginBottom:18,cursor:'pointer'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:ac.main}}/>
                <span style={{fontSize:12,fontWeight:700,color:ac.main}}>{arena}</span>
              </div>

              {/* Stats — Labs en lugar de Sesiones */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:18}}>
                {[
                  {val:ovr,                    label:'OVR Score', color:ac.main},
                  {val:copas.toLocaleString(), label:'Puntos',    color:'#d97706'},
                  {val:totalLabs,              label:'Labs',      color:'#059669'},
                  {val:xp.toLocaleString(),    label:'XP Total',  color:tierColor},
                ].map((s,i)=>(
                  <div key={i} style={{padding:'11px 13px',borderRadius:10,background:'#f8f7ff',border:'1px solid #ede9fe',textAlign:'center'}}>
                    <div style={{fontSize:21,fontWeight:800,color:s.color,lineHeight:1,letterSpacing:'-0.5px'}}>{s.val}</div>
                    <div style={{fontSize:11,fontWeight:600,color:'#374151',marginTop:3}}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,color:'#374151',letterSpacing:'.5px',marginBottom:10}}>Habilidades verificadas</div>
                {topSkills.map((s,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:9,marginBottom:7}}>
                    <span style={{fontSize:10,fontWeight:700,color:'#64748b',width:26,flexShrink:0}}>{s.abbr}</span>
                    <div style={{flex:1,height:5,borderRadius:3,background:'#ede9fe',overflow:'hidden'}}>
                      <div style={{width:`${Math.min(s.val,100)}%`,height:'100%',borderRadius:3,background:s.val>=7?`linear-gradient(90deg,${ACC},#6366f1)`:'#a5b4fc',transition:'width 1s ease'}}/>
                    </div>
                    <span style={{fontSize:10,fontWeight:800,color:s.val>=7?ACC:'#94a3b8',width:18,textAlign:'right',flexShrink:0}}>{s.val}</span>
                  </div>
                ))}
              </div>

              {/* XP Bar */}
              <div onClick={()=>navigate('/perfil')} style={{padding:'11px 13px',borderRadius:10,background:'#f8f7ff',border:'1px solid #ede9fe',cursor:'pointer'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:700,color:tierColor}}>{TIERS[tier]}</span>
                  <span style={{fontSize:10,color:'#94a3b8'}}>{xp.toLocaleString()} XP</span>
                </div>
                <div style={{height:5,borderRadius:3,background:'#ede9fe',overflow:'hidden'}}>
                  <div style={{width:`${pctXP}%`,height:'100%',borderRadius:3,background:tierColor,transition:'width 1.2s ease'}}/>
                </div>
                {tier<8 && <p style={{fontSize:10,color:'#94a3b8',marginTop:5}}>Faltan {((XP_MAX[tier]||0)-xp).toLocaleString()} XP para {TIERS[tier+1]}</p>}
              </div>
            </div>
          </div>

          {/* Siguiente arena */}
          {sigArena && (
            <div className="s1 sb-card-sm" style={{padding:'16px 18px'}}>
              <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px',marginBottom:10}}>PRÓXIMO OBJETIVO</div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                <span style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{sigArena.name}</span>
                <span style={{fontSize:12,color:ac.main,fontWeight:700}}>{Math.max(0,sigArena.min-copas).toLocaleString()} pts</span>
              </div>
              <div style={{height:5,borderRadius:3,background:'#ede9fe',overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:3,width:`${Math.min(((copas-arenaObj.min)/300)*100,100)}%`,background:`linear-gradient(90deg,${ac.main},${ac.main}cc)`,transition:'width 1s ease'}}/>
              </div>
              <p style={{fontSize:10,color:'#94a3b8',marginTop:6}}>Gana copas en modo Arena o Certificación</p>
            </div>
          )}

          {/* Tipos de lab */}
          <div className="s1 sb-card-sm" style={{padding:'16px 18px'}}>
            <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px',marginBottom:12}}>TIPO DE LAB</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {LAB_TIPOS.map((t,i)=>(
                <div key={i} className="tipo-btn qb" onClick={()=>navigate('/lab',{state:{tipo:t.id}})}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:10,cursor:'pointer',border:'1px solid transparent',transition:'all .15s'}}>
                  <div style={{width:30,height:30,borderRadius:8,background:`${t.color}12`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${t.color}20`}}>
                    <span style={{fontSize:11,fontWeight:800,color:t.color}}>{t.label.slice(0,3).toUpperCase()}</span>
                  </div>
                  <span style={{fontSize:12,color:'#0f172a',fontWeight:600,flex:1}}>{t.label}</span>
                  <Icon name="arrow" size={11} color="#c7d2fe"/>
                </div>
              ))}
              <div className="qb" onClick={()=>navigate('/lab')}
                style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:10,cursor:'pointer',border:'1px solid transparent',transition:'all .15s'}}>
                <div style={{width:30,height:30,borderRadius:8,background:'#f8f7ff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1px solid #ede9fe'}}>
                  <span style={{fontSize:14}}>🎲</span>
                </div>
                <span style={{fontSize:12,color:'#94a3b8',fontWeight:600,flex:1}}>Aleatorio</span>
                <Icon name="arrow" size={11} color="#c7d2fe"/>
              </div>
            </div>
          </div>

          {/* Accesos rapidos */}
          <div className="s1 sb-card-sm" style={{padding:'16px 18px'}}>
            <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px',marginBottom:12}}>ACCESOS RÁPIDOS</div>
            {[
              {label:'Training SOC',   desc:'Módulos · Cursos',  path:'/training',    color:'#7c3aed',icon:'book'},
              {label:'Ranking Global', desc:'Tu posición',       path:'/ranking',     color:'#d97706',icon:'chart'},
              {label:'Mi Certificado', desc:'QR verificable',    path:'/certificado', color:'#059669',icon:'award'},
            ].map((item,i)=>(
              <div key={i} className="qb" onClick={()=>navigate(item.path)}
                style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:10,cursor:'pointer',marginBottom:5,border:'1px solid transparent',transition:'all .15s'}}>
                <div style={{width:30,height:30,borderRadius:8,background:`${item.color}12`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon name={item.icon} size={14} color={item.color}/>
                </div>
                <div style={{flex:1}}>
                  <span style={{fontSize:12,color:'#0f172a',fontWeight:600}}>{item.label}</span>
                  <span style={{fontSize:10,color:'#94a3b8',marginLeft:5}}>{item.desc}</span>
                </div>
                <Icon name="arrow" size={11} color="#c7d2fe"/>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>

          {/* CTAs — 3 modos */}
          <div className="s1" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
            {LAB_MODOS.map((m,i)=>(
              <button key={i} className="pb" onClick={()=>navigate('/lab',{state:{modo:m.id}})}
                style={{padding:'13px 8px',borderRadius:14,background:m.bg,border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:5,boxShadow:'0 4px 18px rgba(0,0,0,0.18)',transition:'all .2s'}}>
                <span style={{fontSize:20}}>{m.icon}</span>
                <span>{m.label}</span>
                <span style={{fontSize:10,fontWeight:400,opacity:.7}}>{m.desc.split('·')[0].trim()}</span>
              </button>
            ))}
          </div>

          {/* Carrusel modos lab */}
          <div className="s1 sb-card" style={{overflow:'hidden'}}>
            <div style={{display:'flex',borderBottom:'1px solid #e8eaf0'}}>
              {LAB_MODOS.map((m,i)=>(
                <button key={i} onClick={()=>setModoIdx(i)}
                  style={{flex:1,padding:'13px 8px',background:'none',border:'none',cursor:'pointer',fontSize:12,fontWeight:600,color:modoIdx===i?m.color:'#94a3b8',borderBottom:modoIdx===i?`2.5px solid ${m.color}`:'2.5px solid transparent',transition:'all .2s'}}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
            <div style={{padding:'24px 28px',background:modoActual.bg,display:'grid',gridTemplateColumns:'1fr auto',gap:24,alignItems:'center'}}>
              <div>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 11px',borderRadius:100,background:'rgba(255,255,255,0.1)',marginBottom:12}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:modoActual.accent,animation:'pulse 2s infinite'}}/>
                  <span style={{fontSize:10,color:modoActual.accent,fontWeight:700,letterSpacing:'2px'}}>MODO {modoActual.label.toUpperCase()}</span>
                </div>
                <h3 style={{fontSize:18,fontWeight:900,color:'#fff',marginBottom:8,lineHeight:1.2}}>
                  {modoIdx===0&&<>Investiga sin límite.<br/><span style={{color:modoActual.accent}}>La IA evalúa profundidad.</span></>}
                  {modoIdx===1&&<>Demuestra tu nivel.<br/><span style={{color:modoActual.accent}}>45 minutos. Copas x0.5.</span></>}
                  {modoIdx===2&&<>20 minutos.<br/><span style={{color:modoActual.accent}}>Copas completas. Ranking.</span></>}
                </h3>
                <p style={{fontSize:12,color:'rgba(255,255,255,0.5)',lineHeight:1.7,marginBottom:14}}>
                  {modoIdx===0&&'Sin timer. SIEM, Log Explorer, Terminal y Artefactos. 5 tipos de lab disponibles.'}
                  {modoIdx===1&&'Timer moderado para evaluar tu nivel real. Copas a mitad de ratio. XP completo.'}
                  {modoIdx===2&&'El modo más exigente. Copas reales y posición en el ranking global. SO aleatorio.'}
                </p>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
                  {modoIdx===0&&['Sin timer','Solo XP','5 tipos','Win/Linux'].map((f,i)=><span key={i} style={{fontSize:10,padding:'3px 9px',borderRadius:6,background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.75)',fontWeight:500}}>{f}</span>)}
                  {modoIdx===1&&['45 min','Copas x0.5','XP completo','Eval. estricta'].map((f,i)=><span key={i} style={{fontSize:10,padding:'3px 9px',borderRadius:6,background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.75)',fontWeight:500}}>{f}</span>)}
                  {modoIdx===2&&['20 min','Copas ×1','Ranking','Win/Linux'].map((f,i)=><span key={i} style={{fontSize:10,padding:'3px 9px',borderRadius:6,background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.75)',fontWeight:500}}>{f}</span>)}
                </div>
                <button className="pb" onClick={()=>navigate('/lab',{state:{modo:modoActual.id}})}
                  style={{padding:'10px 24px',borderRadius:100,background:'rgba(255,255,255,0.95)',border:'none',color:modoActual.color,fontSize:13,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 16px rgba(0,0,0,0.15)',transition:'all .2s'}}>
                  {modoIdx===0?'Iniciar investigación':modoIdx===1?'Iniciar certificación':'Entrar a la Arena'} →
                </button>
              </div>
              <svg width="110" height="110" viewBox="0 0 170 170" fill="none">
                {modoIdx===0&&<>
                  <rect x="10" y="20" width="150" height="105" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(110,231,183,0.15)" strokeWidth="1"/>
                  <rect x="10" y="20" width="150" height="18" rx="8" fill="rgba(255,255,255,0.06)"/>
                  <circle cx="22" cy="29" r="4" fill="#FF5F57"/><circle cx="34" cy="29" r="4" fill="#FEBC2E"/><circle cx="46" cy="29" r="4" fill="#28C840"/>
                  <text x="20" y="54" fontFamily="monospace" fontSize="8" fill="#6ee7b7">$ grep mimikatz sysmon.log</text>
                  <text x="20" y="66" fontFamily="monospace" fontSize="8" fill="#f87171">mimikatz.exe PID:1337 ⚠</text>
                  <text x="20" y="78" fontFamily="monospace" fontSize="8" fill="#60a5fa">$ volatility memdump</text>
                  <text x="20" y="90" fontFamily="monospace" fontSize="8" fill="#6ee7b7">$ _</text>
                </>}
                {modoIdx===1&&<>
                  <circle cx="85" cy="70" r="42" fill="rgba(255,255,255,0.04)" stroke="rgba(252,211,77,0.3)" strokeWidth="2"/>
                  <text x="85" y="78" textAnchor="middle" fontFamily="monospace" fontSize="22" fontWeight="900" fill="#fcd34d">45:00</text>
                  <text x="85" y="94" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="rgba(252,211,77,0.5)">TIEMPO RESTANTE</text>
                  <path d="M85 33 A37 37 0 0 1 122 70" stroke="#fcd34d" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </>}
                {modoIdx===2&&<>
                  <rect x="15" y="25" width="140" height="88" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(165,180,252,0.2)" strokeWidth="1"/>
                  <rect x="25" y="38" width="120" height="8" rx="4" fill="rgba(239,68,68,0.5)"/>
                  <rect x="25" y="51" width="85" height="6" rx="3" fill="rgba(249,115,22,0.4)"/>
                  <rect x="25" y="62" width="100" height="6" rx="3" fill="rgba(234,179,8,0.3)"/>
                  <circle cx="142" cy="40" r="18" fill="rgba(79,70,229,0.3)" stroke="rgba(165,180,252,0.4)" strokeWidth="1.5"/>
                  <text x="142" y="46" textAnchor="middle" fontFamily="system-ui" fontSize="11" fontWeight="700" fill="#a5b4fc">SOC</text>
                </>}
              </svg>
            </div>
          </div>

          {/* Actividad + Ranking */}
          <div className="s2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div className="sb-card-sm" style={{padding:'18px'}}>
              <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px',marginBottom:14}}>ACTIVIDAD · 90 DÍAS</div>
              <div style={{overflowX:'auto',marginBottom:12}}><ActivityHeatmap historial={historial}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:7}}>
                {[
                  {value:totalLabs,                                                                     label:'labs',      color:ACC},
                  {value:streak,                                                                        label:'racha',     color:'#d97706'},
                  {value:historial.filter(l=>l.resultado?.copas_ganadas>0).length,                     label:'con copas', color:'#059669'},
                ].map((s,i)=>(
                  <div key={i} style={{textAlign:'center',padding:'9px',borderRadius:9,background:'#f8f7ff',border:'1px solid #ede9fe'}}>
                    <div style={{fontSize:18,fontWeight:800,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sb-card-sm" style={{padding:'18px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <span style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px'}}>TOP RANKING</span>
                <button onClick={()=>navigate('/ranking')} style={{fontSize:11,color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:700}}>Ver todo →</button>
              </div>
              {ranking.length===0 ? (
                <p style={{fontSize:12,color:'#94a3b8',textAlign:'center',padding:'8px 0'}}>Cargando...</p>
              ) : ranking.map((j,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 0',borderBottom:i<ranking.length-1?'1px solid #f5f3ff':'none'}}>
                  <span style={{fontSize:16,width:22}}>{i===0?'🥇':i===1?'🥈':'🥉'}</span>
                  <AvatarCircle name={j.nombre} size={28} color={TIER_CLR[j.tier]||ACC}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.nombre}</div>
                    <div style={{fontSize:10,color:'#94a3b8'}}>{j.arena}</div>
                  </div>
                  <span style={{fontSize:12,fontWeight:800,color:'#d97706'}}>{j.copas?.toLocaleString()}</span>
                </div>
              ))}
              <div style={{marginTop:12,padding:'11px 13px',borderRadius:10,background:'#fff5f5',border:'1px solid #fecaca'}}>
                <div style={{fontSize:10,color:'#ef4444',fontWeight:700,marginBottom:5}}>SKILL A MEJORAR</div>
                <div style={{fontSize:12,color:'#7f1d1d',fontWeight:700,marginBottom:8}}>{weakSkills[0]?.label}</div>
                <button onClick={()=>navigate('/lab',{state:{modo:'investigacion'}})}
                  style={{width:'100%',padding:'7px',borderRadius:8,background:'#ef4444',border:'none',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                  Entrenar con lab →
                </button>
              </div>
            </div>
          </div>

          {/* Últimos labs */}
          <div className="s2 sb-card-sm" style={{padding:'18px 20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <span style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px'}}>ÚLTIMOS LABS</span>
              <button onClick={()=>navigate('/lab')} style={{fontSize:11,color:'#059669',background:'none',border:'none',cursor:'pointer',fontWeight:700}}>Nuevo lab →</button>
            </div>
            {historial.length===0 ? (
              <div style={{textAlign:'center',padding:'16px 0'}}>
                <p style={{fontSize:12,color:'#94a3b8',marginBottom:10}}>Sin labs aún. ¡Empieza a investigar!</p>
                <button className="sb-btn-primary pb" onClick={()=>navigate('/lab')} style={{padding:'9px 22px',fontSize:12}}>Ir al Lab</button>
              </div>
            ) : historial.slice(0,5).map((lab,i)=>{
              const copasGan = lab.resultado?.copas_ganadas||0;
              const pct      = Math.round(lab.resultado?.puntuacion_normalizada||0);
              const tipo     = LAB_TIPOS.find(t=>t.id===lab.tipo)||LAB_TIPOS[0];
              const modo     = LAB_MODOS.find(m=>m.id===lab.modo)||LAB_MODOS[0];
              return (
                <div key={i} className="hr" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:10,background:'#f8f7ff',border:'1px solid #ede9fe',marginBottom:7,transition:'all .15s'}}>
                  <div style={{width:32,height:32,borderRadius:8,background:`${tipo.color}12`,border:`1px solid ${tipo.color}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:10,fontWeight:800,color:tipo.color}}>{tipo.label.slice(0,3).toUpperCase()}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,color:'#0f172a',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lab.escenario?.titulo||tipo.label}</p>
                    <p style={{fontSize:10,color:'#94a3b8'}}>{modo.icon} {modo.label} · {pct}% · {lab.so==='Linux'?'🐧':'🪟'} {lab.so||'?'}</p>
                  </div>
                  {copasGan>0
                    ? <span style={{fontSize:12,fontWeight:800,color:'#d97706'}}>+{copasGan}</span>
                    : <span style={{fontSize:11,color:'#94a3b8'}}>+XP</span>
                  }
                </div>
              );
            })}
          </div>

          {/* Empleo */}
          <div id="empleo-section" className="s3 sb-card" style={{overflow:'hidden'}}>
            <div style={{padding:'22px 28px',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#312e81 100%)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'-50px',right:'-50px',width:'200px',height:'200px',borderRadius:'50%',background:'radial-gradient(circle,rgba(79,70,229,0.2),transparent)',pointerEvents:'none'}}/>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{fontSize:10,color:'#a5b4fc',letterSpacing:'2px',fontWeight:700,marginBottom:8}}>SOCBLAST CAREERS</div>
                <h3 style={{fontSize:17,fontWeight:900,color:'#fff',marginBottom:6,lineHeight:1.25}}>Tu Analyst Card es tu CV.<br/><span style={{color:'#a5b4fc'}}>Las empresas ya pueden verte.</span></h3>
                <p style={{fontSize:12,color:'rgba(255,255,255,0.4)',lineHeight:1.6,marginBottom:14}}>OVR, skills verificadas y arena — todo en un perfil público compartible.</p>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {[{id:'ofertas',l:'Ofertas'},{id:'certs',l:'Certificaciones'},{id:'bootcamps',l:'Bootcamps'},{id:'retos',l:'Retos'}].map(tab=>(
                    <button key={tab.id} onClick={()=>setEmpleoTab(tab.id)}
                      style={{padding:'5px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:empleoTab===tab.id?'rgba(165,180,252,0.2)':'rgba(255,255,255,0.05)',color:empleoTab===tab.id?'#c7d2fe':'rgba(255,255,255,0.35)',borderBottom:empleoTab===tab.id?`2px solid #818cf8`:'2px solid transparent',transition:'all .15s'}}>
                      {tab.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{background:'#fff',padding:'20px'}}>
              {empleoTab==='ofertas'   && <ComingSoon title="Ofertas de empleo SOC"        desc="Empresas buscarán analistas por su perfil verificado."   icon="users" color={ACC}/>}
              {empleoTab==='certs'     && <ComingSoon title="Certificaciones recomendadas" desc="Recomendaciones según tu perfil actual."                 icon="award" color="#7c3aed"/>}
              {empleoTab==='bootcamps' && <ComingSoon title="Bootcamps y cursos SOC"       desc="Curados por relevancia para tu nivel y arena."           icon="book"  color="#0891b2"/>}
              {empleoTab==='retos'     && <ComingSoon title="Retos y plataformas externas" desc="TryHackMe, Blue Team Labs, CyberDefenders integrados."   icon="shield" color="#059669"/>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
