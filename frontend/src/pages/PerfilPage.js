import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';
const ACC = '#4f46e5';
const LS_AVATAR = 'socblast_avatar';

const TIERS_DATA = [
  { tier:1, name:'SOC Rookie',    xp:'0',      xpMax:'500',    color:'#64748b', desc:'Primeros pasos en el mundo SOC.',         skills:['Conceptos básicos','Navegación SIEM'] },
  { tier:2, name:'SOC Analyst',   xp:'500',    xpMax:'1.500',  color:'#3b82f6', desc:'Identifica amenazas básicas con soltura.', skills:['Análisis de logs','Clasificación alertas'] },
  { tier:3, name:'SOC Specialist',xp:'1.500',  xpMax:'3.000',  color:'#06b6d4', desc:'Correlaciona eventos y detecta patrones.',  skills:['Correlación SIEM','IOCs y TTPs'] },
  { tier:4, name:'SOC Expert',    xp:'3.000',  xpMax:'5.000',  color:'#10b981', desc:'Respuesta a incidentes con soltura.',       skills:['IR playbooks','MITRE ATT&CK'] },
  { tier:5, name:'SOC Sentinel',  xp:'5.000',  xpMax:'8.000',  color:'#f59e0b', desc:'Threat hunting proactivo y forense.',       skills:['Threat Hunting','Análisis forense'] },
  { tier:6, name:'SOC Architect', xp:'8.000',  xpMax:'12.000', color:'#f97316', desc:'Diseña estrategias de defensa complejas.',  skills:['Arquitectura defensiva','Red team awareness'] },
  { tier:7, name:'SOC Master',    xp:'12.000', xpMax:'18.000', color:'#ef4444', desc:'APTs, zero-days y respuesta avanzada.',     skills:['APT hunting','Zero-day response'] },
  { tier:8, name:'SOC Legend',    xp:'18.000', xpMax:'∞',      color:'#8b5cf6', desc:'El nivel más alto. Élite absoluta.',        skills:['Élite operacional','Liderazgo SOC'] },
];

const SKILLS_FULL = [
  {key:'analisis_logs',           label:'Análisis de Logs',      color:'#3b82f6', desc:'Lectura e interpretación de logs del sistema y red'},
  {key:'deteccion_amenazas',      label:'Detección de Amenazas', color:'#4f46e5', desc:'Identificación de IOCs, TTPs y patrones maliciosos'},
  {key:'respuesta_incidentes',    label:'Respuesta Incidentes',  color:'#f59e0b', desc:'Contención, erradicación y recuperación de incidentes'},
  {key:'threat_hunting',          label:'Threat Hunting',        color:'#8b5cf6', desc:'Búsqueda proactiva de amenazas ocultas en la red'},
  {key:'forense_digital',         label:'Forense Digital',       color:'#ec4899', desc:'Análisis de evidencias, artefactos y líneas de tiempo'},
  {key:'gestion_vulnerabilidades',label:'Gestión de Vulns',      color:'#f97316', desc:'Evaluación, CVSS y priorización de vulnerabilidades'},
  {key:'inteligencia_amenazas',   label:'Intel. de Amenazas',    color:'#10b981', desc:'CTI, OSINT, TTPs y fuentes de inteligencia'},
  {key:'siem_queries',            label:'SIEM & Queries',        color:'#0891b2', desc:'Splunk, Elastic, QRadar — reglas de correlación avanzadas'},
];

// ── AVATAR SYSTEM — gradiente + iniciales ─────────────────────
const GRADIENTS = [
  ['#4f46e5','#818cf8'], // indigo
  ['#059669','#34d399'], // green
  ['#0891b2','#22d3ee'], // cyan
  ['#7c3aed','#a78bfa'], // purple
  ['#dc2626','#f87171'], // red
  ['#d97706','#fbbf24'], // amber
  ['#db2777','#f472b6'], // pink
  ['#0369a1','#38bdf8'], // blue
  ['#65a30d','#a3e635'], // lime
  ['#9333ea','#c084fc'], // violet
];

const BORDER_STYLES = [
  {id:'none',    label:'Sin borde'},
  {id:'solid',   label:'Sólido'},
  {id:'glow',    label:'Glow'},
  {id:'double',  label:'Doble'},
];

const ICON_OVERLAYS = [
  {id:'none',   label:'Ninguno',  symbol:''},
  {id:'shield', label:'Escudo',   symbol:'⬡'},
  {id:'star',   label:'Estrella', symbol:'★'},
  {id:'bolt',   label:'Rayo',     symbol:'⚡'},
  {id:'crown',  label:'Corona',   requireTier:5, symbol:'♛'},
  {id:'skull',  label:'Skull',    requireTier:6, symbol:'☠'},
  {id:'dragon', label:'Dragón',   requireTier:7, symbol:'◈'},
  {id:'legend', label:'∞',        requireTier:8, symbol:'∞'},
];

const defaultAvatar = { gradientIdx:0, borderStyle:'solid', iconOverlay:'none' };

function getInitials(name='') {
  return name.trim().split(' ').map(w=>w[0]?.toUpperCase()||'').slice(0,2).join('');
}

function getGradientFromName(name='') {
  let hash = 0;
  for (let i=0; i<name.length; i++) hash = name.charCodeAt(i) + ((hash<<5)-hash);
  return Math.abs(hash) % GRADIENTS.length;
}

const Avatar = ({ name='', avatar={}, size=80, tierColor='#4f46e5' }) => {
  const av       = { ...defaultAvatar, ...avatar };
  const gradIdx  = av.gradientIdx ?? getGradientFromName(name);
  const [from, to] = GRADIENTS[gradIdx] || GRADIENTS[0];
  const initials = getInitials(name);
  const fontSize = size * 0.34;
  const overlay  = ICON_OVERLAYS.find(i=>i.id===av.iconOverlay);

  const borderStyles = {
    none:   {},
    solid:  { border:`${Math.max(2,size*0.035)}px solid ${from}60` },
    glow:   { border:`${Math.max(2,size*0.035)}px solid ${from}80`, boxShadow:`0 0 ${size*0.15}px ${from}50` },
    double: { border:`${Math.max(2,size*0.035)}px solid ${from}60`, outline:`${Math.max(1,size*0.02)}px solid ${from}25`, outlineOffset:`${Math.max(2,size*0.03)}px` },
  };

  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background:`linear-gradient(135deg,${from},${to})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      position:'relative', flexShrink:0,
      ...borderStyles[av.borderStyle||'none'],
    }}>
      <span style={{
        fontSize, fontWeight:800, color:'#fff',
        letterSpacing:'-0.5px', lineHeight:1,
        fontFamily:"'Inter',-apple-system,sans-serif",
        textShadow:'0 1px 3px rgba(0,0,0,0.2)',
        userSelect:'none',
      }}>
        {initials || '?'}
      </span>
      {overlay?.symbol && (
        <div style={{
          position:'absolute', bottom:-2, right:-2,
          width:size*0.32, height:size*0.32, borderRadius:'50%',
          backgroundColor:'#fff', border:`1.5px solid ${from}40`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:size*0.16, lineHeight:1,
          boxShadow:'0 2px 6px rgba(0,0,0,0.15)',
        }}>
          {overlay.symbol}
        </div>
      )}
    </div>
  );
};

const ARENAS_COLORS = {
  'Bronce I':'#d97706','Bronce II':'#f59e0b','Bronce III':'#fbbf24',
  'Plata I':'#64748b','Plata II':'#94a3b8','Plata III':'#cbd5e1',
  'Oro I':'#d97706','Oro II':'#f59e0b','Oro III':'#fbbf24',
  'Diamante I':'#1e40af','Diamante II':'#2563eb','Diamante III':'#3b82f6',
};
const getArenaColor = (arena) => ARENAS_COLORS[arena] || '#4f46e5';

export default function PerfilPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [userData,  setUserData]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [vista,     setVista]     = useState('perfil');
  const [avatar,    setAvatar]    = useState(defaultAvatar);
  const [avatarTab, setAvatarTab] = useState('gradient');

  useEffect(() => {
    fetchPerfil();
    try {
      const s = localStorage.getItem(LS_AVATAR);
      if (s) setAvatar({ ...defaultAvatar, ...JSON.parse(s) });
    } catch {}
  }, []);

  const saveAvatar = (newAv) => {
    setAvatar(newAv);
    localStorage.setItem(LS_AVATAR, JSON.stringify(newAv));
  };

  const fetchPerfil = async () => {
    try {
      const r = await axios.get(`${API}/api/me`, { headers:{ Authorization:`Bearer ${token}` } });
      setUserData(r.data);
    } catch {}
    setLoading(false);
  };

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    .fade-up{animation:fadeUp .3s ease forwards;}
    .stat-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(79,70,229,0.12)!important;}
    .tier-node:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.08)!important;}
    .tab-btn:hover{color:#1e1b4b!important;}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    .item-card:hover{border-color:#a5b4fc!important;transform:translateY(-3px);box-shadow:0 8px 20px rgba(79,70,229,0.12);}
    .skill-row:hover{background:#f8faff!important;}
    .avatar-float{animation:float 3s ease-in-out infinite;}
    *{transition:transform .2s ease,box-shadow .2s ease,border-color .15s ease,background .15s ease,color .15s ease,opacity .15s ease;}
  `;

  if (loading) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:36,height:36,border:'3px solid #e2e8f0',borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div>
  );

  const tierActual = userData?.tier || 1;
  const xp         = userData?.xp   || 0;
  const XP_MAX     = [0,500,1500,3000,5000,8000,12000,18000,99999];
  const xpMin      = XP_MAX[tierActual-1]||0;
  const xpMaxTier  = XP_MAX[tierActual]||99999;
  const progresoXP = Math.min(((xp-xpMin)/(xpMaxTier-xpMin))*100, 100);
  const tierData   = TIERS_DATA[tierActual-1];
  const arenaColor = getArenaColor(userData?.arena);
  const skills     = userData?.skills || {};
  const skillEntries = SKILLS_FULL.map(s => ({...s, val: skills?.[s.key]||0}));
  const avgSkill   = Math.round(skillEntries.reduce((a,s)=>a+s.val,0)/skillEntries.length*10)/10;
  const canUnlock  = (item) => !item.requireTier || tierActual >= item.requireTier;
  const nombre     = userData?.nombre || '';

  const TABS = [
    {id:'perfil', label:'Mi Perfil'},
    {id:'avatar', label:'Avatar'},
    {id:'tiers',  label:'Progression'},
  ];

  const AvatarEditor = () => {
    return (
      <div className="fade-up">
        <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:'24px',alignItems:'start'}}>

          {/* Preview */}
          <div style={{padding:'28px 24px',borderRadius:'20px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 4px 20px rgba(0,0,0,0.07)',textAlign:'center',position:'sticky',top:'80px'}}>
            <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:'20px',fontFamily:'monospace'}}>PREVIEW</p>
            <div className="avatar-float" style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>
              <Avatar name={nombre} avatar={avatar} size={100} tierColor={tierData?.color}/>
            </div>
            <p style={{fontSize:'15px',fontWeight:800,color:'#0f172a',marginBottom:'3px'}}>{nombre}</p>
            <p style={{fontSize:'11px',color:'#94a3b8',marginBottom:'20px'}}>{tierData?.name} · {userData?.arena}</p>
            <div style={{padding:'12px',borderRadius:'12px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',textAlign:'left'}}>
              <p style={{fontSize:'9px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:'8px',textAlign:'center'}}>EN EL RANKING</p>
              <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',borderRadius:'8px',backgroundColor:'#fff',border:'1px solid #e8eaf0'}}>
                <Avatar name={nombre} avatar={avatar} size={36}/>
                <div style={{flex:1,textAlign:'left'}}>
                  <p style={{fontSize:'12px',fontWeight:700,color:'#0f172a',marginBottom:'1px'}}>{nombre}</p>
                  <p style={{fontSize:'10px',color:'#94a3b8'}}>{userData?.arena}</p>
                </div>
                <div style={{fontSize:'12px',fontWeight:800,color:'#d97706'}}>{userData?.copas}🏆</div>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div style={{padding:'24px',borderRadius:'20px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 4px 20px rgba(0,0,0,0.07)'}}>
            <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:'16px',fontFamily:'monospace'}}>PERSONALIZAR</p>

            {/* Tabs */}
            <div style={{display:'flex',gap:'6px',marginBottom:'20px'}}>
              {[
                {id:'gradient', label:'Color'},
                {id:'border',   label:'Borde'},
                {id:'icon',     label:'Icono'},
              ].map(t=>(
                <button key={t.id} onClick={()=>setAvatarTab(t.id)}
                  style={{padding:'7px 16px',borderRadius:'9px',border:`1px solid ${avatarTab===t.id?ACC:'#e2e8f0'}`,backgroundColor:avatarTab===t.id?ACC:'#fff',color:avatarTab===t.id?'#fff':'#64748b',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Gradientes */}
            {avatarTab==='gradient' && (
              <div>
                <p style={{fontSize:'11px',color:'#64748b',marginBottom:'12px'}}>Elige el color de tu avatar. Cada combinación es única.</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'10px'}}>
                  {GRADIENTS.map(([from,to],i)=>{
                    const isSelected = (avatar.gradientIdx??getGradientFromName(nombre)) === i;
                    return (
                      <div key={i} className="item-card"
                        onClick={()=>saveAvatar({...avatar, gradientIdx:i})}
                        style={{borderRadius:'12px',border:`2px solid ${isSelected?ACC:'#f1f5f9'}`,padding:'4px',cursor:'pointer',position:'relative',backgroundColor:isSelected?`${ACC}06`:'#fff'}}>
                        {isSelected && (
                          <div style={{position:'absolute',top:6,right:6,width:'16px',height:'16px',borderRadius:'50%',backgroundColor:ACC,display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}>
                            <span style={{fontSize:'8px',color:'#fff',fontWeight:700}}>✓</span>
                          </div>
                        )}
                        <div style={{height:'52px',borderRadius:'8px',background:`linear-gradient(135deg,${from},${to})`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <span style={{fontSize:'18px',fontWeight:800,color:'#fff',textShadow:'0 1px 3px rgba(0,0,0,0.2)'}}>
                            {getInitials(nombre)||'AB'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bordes */}
            {avatarTab==='border' && (
              <div>
                <p style={{fontSize:'11px',color:'#64748b',marginBottom:'12px'}}>Estilo del borde de tu avatar.</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}}>
                  {BORDER_STYLES.map((b)=>{
                    const isSelected = (avatar.borderStyle||'solid') === b.id;
                    const [from] = GRADIENTS[avatar.gradientIdx??getGradientFromName(nombre)] || GRADIENTS[0];
                    return (
                      <div key={b.id} className="item-card"
                        onClick={()=>saveAvatar({...avatar, borderStyle:b.id})}
                        style={{padding:'16px',borderRadius:'12px',border:`2px solid ${isSelected?ACC:'#f1f5f9'}`,cursor:'pointer',display:'flex',alignItems:'center',gap:'14px',backgroundColor:isSelected?`${ACC}06`:'#fff'}}>
                        {isSelected && <span style={{fontSize:'11px',color:ACC,fontWeight:700}}>✓</span>}
                        <Avatar name={nombre} avatar={{...avatar,borderStyle:b.id}} size={44}/>
                        <span style={{fontSize:'12px',color:isSelected?ACC:'#374151',fontWeight:isSelected?700:500}}>{b.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Iconos */}
            {avatarTab==='icon' && (
              <div>
                <p style={{fontSize:'11px',color:'#64748b',marginBottom:'12px'}}>Icono decorativo en la esquina. Algunos requieren tier alto.</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
                  {ICON_OVERLAYS.map((ic)=>{
                    const isSelected = (avatar.iconOverlay||'none') === ic.id;
                    const locked     = !canUnlock(ic);
                    return (
                      <div key={ic.id}
                        className={locked?'':'item-card'}
                        onClick={()=>{ if (!locked) saveAvatar({...avatar, iconOverlay:ic.id}); }}
                        style={{padding:'14px 10px',borderRadius:'12px',border:`2px solid ${isSelected?ACC:'#f1f5f9'}`,cursor:locked?'not-allowed':'pointer',textAlign:'center',opacity:locked?0.4:1,position:'relative',backgroundColor:isSelected?`${ACC}06`:'#fff'}}>
                        {isSelected && (
                          <div style={{position:'absolute',top:6,left:6,width:'14px',height:'14px',borderRadius:'50%',backgroundColor:ACC,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <span style={{fontSize:'7px',color:'#fff',fontWeight:700}}>✓</span>
                          </div>
                        )}
                        {locked && <div style={{position:'absolute',top:6,right:6,fontSize:'11px'}}>🔒</div>}
                        <div style={{display:'flex',justifyContent:'center',marginBottom:'8px'}}>
                          <Avatar name={nombre} avatar={{...avatar, iconOverlay:ic.id}} size={44}/>
                        </div>
                        <p style={{fontSize:'11px',color:isSelected?ACC:'#374151',fontWeight:isSelected?700:500,margin:0}}>{ic.label}</p>
                        {ic.requireTier && (
                          <p style={{fontSize:'9px',color:locked?'#cbd5e1':'#f59e0b',fontWeight:600,marginTop:'3px',margin:'3px 0 0'}}>
                            {locked?`T${ic.requireTier} requerido`:`T${ic.requireTier}+`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{marginTop:'16px',padding:'12px 16px',borderRadius:'12px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',display:'flex',gap:'10px',alignItems:'center'}}>
              <span style={{fontSize:'14px',flexShrink:0}}>💡</span>
              <p style={{fontSize:'11px',color:'#64748b',lineHeight:1.5,margin:0}}>
                Tu avatar usa tus iniciales con el color que elijas. Los iconos de tier alto se desbloquean jugando sesiones SOC.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0f172a'}}>

        {/* NAVBAR */}
        <nav style={{position:'sticky',top:0,zIndex:50,height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',backgroundColor:'rgba(255,255,255,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 12px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:'28px'}}/>
            <span style={{fontSize:'15px',fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',gap:'2px'}}>
            {[{label:'← Dashboard',path:'/dashboard'},{label:'Training',path:'/training'},{label:'Ranking',path:'/ranking'},{label:'Certificado',path:'/certificado'}].map((item,i)=>(
              <button key={i} className="nav-btn" onClick={()=>navigate(item.path)}
                style={{padding:'5px 14px',borderRadius:'7px',background:'none',border:'none',color:'#64748b',fontSize:'13px',cursor:'pointer'}}>
                {item.label}
              </button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{cursor:'pointer'}} onClick={()=>setVista('avatar')}>
              <Avatar name={nombre} avatar={avatar} size={34}/>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#22c55e',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:'13px',color:'#374151',fontWeight:500}}>{nombre}</span>
              <span style={{fontSize:'11px',fontWeight:700,color:arenaColor,background:`${arenaColor}15`,padding:'2px 8px',borderRadius:'5px'}}>{userData?.arena}</span>
            </div>
          </div>
        </nav>

        <div style={{maxWidth:'960px',margin:'0 auto',padding:'32px 40px 60px'}}>

          {/* Tabs */}
          <div style={{display:'flex',marginBottom:'28px',borderBottom:'1px solid #e8eaf0'}}>
            {TABS.map(tab=>(
              <button key={tab.id} className="tab-btn" onClick={()=>setVista(tab.id)}
                style={{padding:'10px 22px',background:'none',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,color:vista===tab.id?'#0f172a':'#94a3b8',borderBottom:vista===tab.id?`2px solid ${ACC}`:'2px solid transparent',marginBottom:'-1px',display:'flex',alignItems:'center',gap:'8px'}}>
                {tab.id==='avatar' && <Avatar name={nombre} avatar={avatar} size={20}/>}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── PERFIL ── */}
          {vista==='perfil' && (
            <div className="fade-up">
              <div style={{padding:'24px 28px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:'14px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{height:'3px',background:`linear-gradient(90deg,${arenaColor},${ACC})`,borderRadius:'4px',marginBottom:'20px'}}/>
                <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
                  <div style={{position:'relative'}}>
                    <Avatar name={nombre} avatar={avatar} size={80}/>
                    <button onClick={()=>setVista('avatar')}
                      style={{position:'absolute',bottom:-2,right:-2,width:'24px',height:'24px',borderRadius:'50%',backgroundColor:ACC,border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'11px'}}>
                      ✏️
                    </button>
                  </div>
                  <div style={{flex:1}}>
                    <h1 style={{fontSize:'20px',fontWeight:800,color:'#0f172a',marginBottom:'3px',letterSpacing:'-0.4px'}}>{nombre}</h1>
                    <p style={{fontSize:'12px',color:'#94a3b8',marginBottom:'10px'}}>{userData?.email}</p>
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                      <span style={{fontSize:'11px',padding:'3px 9px',borderRadius:'6px',backgroundColor:`${tierData?.color}12`,color:tierData?.color,fontWeight:700,border:`1px solid ${tierData?.color}25`}}>{tierData?.name}</span>
                      <span style={{fontSize:'11px',padding:'3px 9px',borderRadius:'6px',backgroundColor:`${arenaColor}10`,color:arenaColor,fontWeight:700,border:`1px solid ${arenaColor}20`}}>{userData?.arena}</span>
                      <span style={{fontSize:'11px',padding:'3px 9px',borderRadius:'6px',backgroundColor:'#f8fafc',color:'#64748b',border:'1px solid #e2e8f0'}}>T{tierActual}/8</span>
                      <span style={{fontSize:'11px',padding:'3px 9px',borderRadius:'6px',backgroundColor:`${ACC}08`,color:ACC,border:`1px solid ${ACC}15`}}>Media skills: {avgSkill}/10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'14px'}}>
                {[
                  {label:'COPAS',    value:(userData?.copas||0).toLocaleString(), color:arenaColor},
                  {label:'XP TOTAL', value:(userData?.xp||0).toLocaleString(),    color:ACC},
                  {label:'SESIONES', value:userData?.sesiones_completadas||0,      color:'#059669'},
                  {label:'TIER',     value:tierActual,                             color:tierData?.color},
                ].map((s,i)=>(
                  <div key={i} className="stat-card" style={{padding:'18px 20px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',position:'relative',overflow:'hidden'}}>
                    <div style={{height:'3px',background:`linear-gradient(90deg,${s.color},${s.color}60)`,borderRadius:'4px',marginBottom:'12px'}}/>
                    <div style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:'8px'}}>{s.label}</div>
                    <div style={{fontSize:'28px',fontWeight:900,color:s.color,letterSpacing:'-0.8px',lineHeight:1}}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* XP bar */}
              <div style={{padding:'18px 20px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:'14px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{fontSize:'13px',fontWeight:700,color:tierData?.color}}>{tierData?.name}</span>
                    {tierActual<8 && <span style={{fontSize:'12px',color:'#94a3b8'}}>→ {TIERS_DATA[tierActual]?.name}</span>}
                  </div>
                  <span style={{fontSize:'11px',color:'#94a3b8'}}>{xp.toLocaleString()} / {xpMaxTier===99999?'∞':xpMaxTier.toLocaleString()} XP</span>
                </div>
                <div style={{height:'8px',borderRadius:'4px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                  <div style={{width:`${progresoXP}%`,height:'100%',borderRadius:'4px',background:`linear-gradient(90deg,${tierData?.color}80,${tierData?.color})`}}/>
                </div>
                {tierActual<8 && <p style={{fontSize:'11px',color:'#94a3b8',marginTop:'6px'}}>Faltan {(xpMaxTier-xp).toLocaleString()} XP para {TIERS_DATA[tierActual]?.name}</p>}
              </div>

              {/* Skills */}
              <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e8eaf0',overflow:'hidden',boxShadow:'0 2px 10px rgba(0,0,0,.05)',marginBottom:'14px'}}>
                <div style={{padding:'16px 20px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <p style={{fontSize:'12px',fontWeight:700,color:'#0f172a'}}>Skill Matrix — {SKILLS_FULL.length} habilidades SOC</p>
                  <span style={{fontSize:'11px',color:ACC,fontWeight:700}}>Media: {avgSkill}/10</span>
                </div>
                <div style={{padding:'6px 0'}}>
                  {skillEntries.map((s,i)=>{
                    const pct    = Math.min((s.val/10)*100,100);
                    const isWeak = s.val < 4;
                    const isTop  = s.val >= 7;
                    return (
                      <div key={i} className="skill-row"
                        style={{display:'flex',alignItems:'center',gap:'14px',padding:'12px 20px',borderBottom:i<skillEntries.length-1?'1px solid #f8fafc':'none'}}>
                        <div style={{width:'34px',height:'34px',borderRadius:'9px',backgroundColor:isWeak?'#fef2f2':isTop?'#f0fdf4':`${s.color}10`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${isWeak?'#fecaca':isTop?'#bbf7d0':`${s.color}20`}`}}>
                          <span style={{fontSize:'14px'}}>{isWeak?'⚠️':isTop?'✅':'📊'}</span>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'5px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                              <span style={{fontSize:'12px',color:isWeak?'#ef4444':isTop?'#059669':'#374151',fontWeight:600}}>{s.label}</span>
                              {isWeak && <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'4px',backgroundColor:'#fef2f2',color:'#ef4444',fontWeight:700}}>MEJORAR</span>}
                              {isTop  && <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'4px',backgroundColor:'#f0fdf4',color:'#059669',fontWeight:700}}>DOMINADA</span>}
                            </div>
                            <span style={{fontSize:'12px',fontWeight:800,color:isWeak?'#ef4444':isTop?'#059669':s.color,fontFamily:'monospace'}}>{s.val}/10</span>
                          </div>
                          <div style={{height:'7px',borderRadius:'4px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                            <div style={{width:`${pct}%`,height:'100%',borderRadius:'4px',transition:'width 1s ease',background:isWeak?`linear-gradient(90deg,#fca5a5,#ef4444)`:isTop?`linear-gradient(90deg,#86efac,#059669)`:`linear-gradient(90deg,${s.color}60,${s.color})`}}/>
                          </div>
                          <p style={{fontSize:'10px',color:'#94a3b8',marginTop:'3px'}}>{s.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{padding:'14px 20px',backgroundColor:'#f8fafc',borderTop:'1px solid #f1f5f9'}}>
                  <p style={{fontSize:'11px',color:'#94a3b8'}}>Las skills se actualizan automáticamente tras cada sesión SOC o laboratorio completado</p>
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                <button onClick={()=>navigate('/sesion')} style={{padding:'13px',borderRadius:'10px',background:'linear-gradient(135deg,#2563eb,#3b82f6)',border:'none',color:'#fff',fontWeight:700,fontSize:'13px',cursor:'pointer',boxShadow:'0 4px 16px rgba(37,99,235,0.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                  🏆 Nueva sesión SOC
                </button>
                <button onClick={()=>setVista('avatar')} style={{padding:'13px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#475569',fontSize:'13px',cursor:'pointer',fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                  <Avatar name={nombre} avatar={avatar} size={20}/> Editar avatar
                </button>
              </div>
            </div>
          )}

          {/* ── AVATAR ── */}
          {vista==='avatar' && <AvatarEditor/>}

          {/* ── TIERS ── */}
          {vista==='tiers' && (
            <div className="fade-up">
              <div style={{marginBottom:'24px'}}>
                <h2 style={{fontSize:'20px',fontWeight:800,color:'#0f172a',marginBottom:'4px',letterSpacing:'-0.5px'}}>Progression Map</h2>
                <p style={{fontSize:'12px',color:'#94a3b8'}}>{tierActual}/8 tiers desbloqueados</p>
              </div>
              <div style={{padding:'16px 20px',borderRadius:'12px',backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                  <span style={{fontSize:'12px',color:'#94a3b8'}}>Progreso global</span>
                  <span style={{fontSize:'12px',color:ACC,fontWeight:700}}>{Math.round(((tierActual-1)/7)*100)}%</span>
                </div>
                <div style={{display:'flex',gap:'3px'}}>
                  {TIERS_DATA.map((t,i)=>(
                    <div key={i} style={{flex:1,height:'6px',borderRadius:'2px',backgroundColor:i<tierActual?t.color:'#e2e8f0'}}/>
                  ))}
                </div>
              </div>
              <div style={{position:'relative'}}>
                {TIERS_DATA.map((t,i)=>{
                  const esActual     = t.tier===tierActual;
                  const desbloqueado = t.tier<=tierActual;
                  const completado   = t.tier<tierActual;
                  const isLeft       = i%2===0;
                  return (
                    <div key={i} style={{display:'flex',alignItems:'flex-start',marginBottom:i<7?'8px':0,flexDirection:isLeft?'row':'row-reverse'}}>
                      <div className="tier-node" style={{width:'56%',padding:'18px 20px',borderRadius:'12px',backgroundColor:esActual?`${t.color}06`:'#fff',border:esActual?`2px solid ${t.color}30`:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',opacity:!desbloqueado?.4:1}}>
                        {esActual && <div style={{height:'2px',background:`linear-gradient(90deg,${t.color},${t.color}40)`,borderRadius:'4px',marginBottom:'12px'}}/>}
                        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
                          <div style={{width:'36px',height:'36px',borderRadius:'9px',backgroundColor:completado?'#ecfdf5':esActual?`${t.color}12`:'#f8fafc',border:`1px solid ${completado?'#86efac30':esActual?t.color+'25':'#e2e8f0'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            {completado?<span style={{color:'#22c55e',fontSize:'14px'}}>✓</span>:<span style={{fontSize:'13px',fontWeight:900,color:desbloqueado?t.color:'#cbd5e1'}}>{t.tier}</span>}
                          </div>
                          <div>
                            <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'2px'}}>
                              <span style={{fontSize:'14px',fontWeight:700,color:desbloqueado?t.color:'#cbd5e1'}}>{t.name}</span>
                              {esActual && <span style={{fontSize:'9px',padding:'2px 7px',borderRadius:'4px',backgroundColor:`${t.color}12`,color:t.color,fontWeight:700}}>ACTUAL</span>}
                              {!desbloqueado && <span style={{fontSize:'9px',padding:'2px 7px',borderRadius:'4px',backgroundColor:'#f1f5f9',color:'#cbd5e1'}}>LOCKED</span>}
                            </div>
                            <span style={{fontSize:'11px',color:'#94a3b8'}}>{t.xp} — {t.xpMax} XP</span>
                          </div>
                        </div>
                        <p style={{fontSize:'12px',color:desbloqueado?'#64748b':'#cbd5e1',marginBottom:'10px',lineHeight:1.6}}>{t.desc}</p>
                        <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>
                          {t.skills.map((sk,j)=>(
                            <span key={j} style={{fontSize:'11px',padding:'2px 8px',borderRadius:'5px',backgroundColor:desbloqueado?`${t.color}08`:'#f8fafc',color:desbloqueado?t.color:'#cbd5e1',border:`1px solid ${desbloqueado?t.color+'18':'#e2e8f0'}`}}>{sk}</span>
                          ))}
                        </div>
                        {esActual && (
                          <div style={{marginTop:'12px'}}>
                            <div style={{height:'4px',borderRadius:'2px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                              <div style={{width:`${progresoXP}%`,height:'100%',borderRadius:'2px',backgroundColor:t.color}}/>
                            </div>
                            <div style={{display:'flex',justifyContent:'space-between',marginTop:'4px'}}>
                              <span style={{fontSize:'10px',color:'#94a3b8'}}>{xp.toLocaleString()} XP</span>
                              <span style={{fontSize:'10px',color:t.color,fontWeight:600}}>{Math.round(progresoXP)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{width:'44%',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 12px',paddingTop:'28px'}}>
                        {i<7 && <div style={{width:'1px',height:'20px',backgroundColor:'#e2e8f0'}}/>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:'24px',padding:'20px 22px',borderRadius:'12px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <p style={{fontSize:'11px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:'14px'}}>FUENTES DE XP</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
                  {[
                    {label:'Sesión Bronce',xp:'+50 XP',color:'#d97706'},{label:'Sesión Plata',xp:'+100 XP',color:'#94a3b8'},
                    {label:'Sesión Oro',xp:'+200 XP',color:'#f59e0b'},{label:'Sesión Diamante',xp:'+400 XP',color:'#3b82f6'},
                    {label:'Lección training',xp:'+30–70 XP',color:ACC},{label:'Sin usar pistas',xp:'+bonus XP',color:'#22c55e'},
                  ].map((item,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0'}}>
                      <span style={{fontSize:'11px',color:'#64748b'}}>{item.label}</span>
                      <span style={{fontSize:'11px',fontWeight:700,color:item.color}}>{item.xp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
