import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';

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

const SKILLS_NOMBRES = {
  analisis_logs:          { label:'Análisis de Logs',       color:'#3b82f6' },
  deteccion_amenazas:     { label:'Detección de Amenazas',  color:'#4f46e5' },
  respuesta_incidentes:   { label:'Respuesta Incidentes',   color:'#f59e0b' },
  threat_hunting:         { label:'Threat Hunting',         color:'#8b5cf6' },
  forense_digital:        { label:'Forense Digital',        color:'#ec4899' },
  gestion_vulnerabilidades:{ label:'Gestión de Vulns',      color:'#f97316' },
  inteligencia_amenazas:  { label:'Intel. de Amenazas',     color:'#10b981' },
};

const ARENAS_COLORS = {
  'Bronce I':  '#d97706', 'Bronce II': '#f59e0b', 'Bronce III':'#fbbf24',
  'Plata I':   '#64748b', 'Plata II':  '#94a3b8', 'Plata III': '#cbd5e1',
  'Oro I':     '#d97706', 'Oro II':    '#f59e0b', 'Oro III':   '#fbbf24',
  'Diamante I':'#1e40af', 'Diamante II':'#2563eb','Diamante III':'#3b82f6',
};
const getArenaColor = (arena) => ARENAS_COLORS[arena] || '#4f46e5';

const ACC = '#4f46e5';
const LS_KEY = 'socblast_cv';
const emptyCV = { certificaciones:[], formaciones:[], experiencia:[] };

export default function PerfilPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [userData,  setUserData]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [vista,     setVista]     = useState('perfil');
  const [cv,        setCV]        = useState(emptyCV);
  const [editando,  setEditando]  = useState(null);
  const [formData,  setFormData]  = useState({});

  useEffect(() => {
    fetchPerfil();
    try { const s = localStorage.getItem(LS_KEY); if (s) setCV(JSON.parse(s)); } catch {}
  }, []);

  const saveCV = nCV => { setCV(nCV); try { localStorage.setItem(LS_KEY, JSON.stringify(nCV)); } catch {} };

  const fetchPerfil = async () => {
    try {
      const r = await axios.get(`${API}/api/me`, { headers:{ Authorization:`Bearer ${token}` } });
      setUserData(r.data);
    } catch {}
    setLoading(false);
  };

  const openAdd  = s => { setFormData({nombre:'',emisor:'',fecha:'',url:'',titulo:'',institucion:'',descripcion:'',cargo:'',empresa:'',desde:'',hasta:''}); setEditando({section:s,index:-1}); };
  const openEdit = (s,i) => { setFormData({...cv[s][i]}); setEditando({section:s,index:i}); };
  const saveItem = () => {
    const {section,index} = editando;
    const ns = [...cv[section]];
    if (index===-1) ns.push(formData); else ns[index]=formData;
    saveCV({...cv,[section]:ns}); setEditando(null);
  };
  const deleteItem = (s,i) => saveCV({...cv,[s]:cv[s].filter((_,j)=>j!==i)});

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
    .fade-up{animation:fadeUp .3s ease forwards;}
    .stat-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(79,70,229,0.12)!important;}
    .tier-node:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.08)!important;}
    .cv-item:hover .cv-actions{opacity:1!important;}
    .cv-item:hover{border-color:#c7d2fe!important;}
    .add-btn:hover{border-color:#a5b4fc!important;color:${ACC}!important;}
    .tab-btn:hover{color:#1e1b4b!important;}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    .lesson-btn:hover{background:#f0f4ff!important;border-color:#c7d2fe!important;}
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

  const TABS = [
    {id:'perfil',  label:'Mi Perfil'},
    {id:'tiers',   label:'Progression'},
    {id:'cv',      label:'CV / Experiencia'},
  ];

  const FormModal = () => {
    if (!editando) return null;
    const {section} = editando;
    const fields = {
      certificaciones:[
        {key:'nombre',label:'Nombre de la certificación',placeholder:'CompTIA Security+'},
        {key:'emisor',label:'Organismo emisor',placeholder:'CompTIA'},
        {key:'fecha',label:'Fecha',placeholder:'Enero 2024'},
        {key:'url',label:'URL verificación (opcional)',placeholder:'https://...'},
      ],
      formaciones:[
        {key:'titulo',label:'Título / Curso',placeholder:'Grado en Ingeniería Informática'},
        {key:'institucion',label:'Institución',placeholder:'Universidad de Murcia'},
        {key:'fecha',label:'Año / Período',placeholder:'2019 – 2023'},
        {key:'descripcion',label:'Descripción (opcional)',placeholder:'Especialización en...',multiline:true},
      ],
      experiencia:[
        {key:'cargo',label:'Cargo',placeholder:'Analista SOC Jr.'},
        {key:'empresa',label:'Empresa',placeholder:'CiberSeguridad S.L.'},
        {key:'desde',label:'Desde',placeholder:'Ene 2023'},
        {key:'hasta',label:'Hasta',placeholder:'Actualidad'},
        {key:'descripcion',label:'Descripción',placeholder:'Responsabilidades...',multiline:true},
      ],
    };
    const titles = {certificaciones:'Certificación',formaciones:'Formación',experiencia:'Experiencia'};
    return (
      <div style={{position:'fixed',inset:0,backgroundColor:'rgba(15,23,42,0.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(4px)'}}>
        <div style={{backgroundColor:'#fff',border:'1px solid #e2e8f0',borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'480px',boxShadow:'0 24px 64px rgba(0,0,0,0.12)'}}>
          <div style={{height:'3px',background:`linear-gradient(90deg,${ACC},#818cf8)`,borderRadius:'4px',marginBottom:'20px'}}/>
          <h3 style={{fontSize:'16px',fontWeight:700,color:'#0f172a',marginBottom:'6px'}}>{editando.index===-1?'Añadir':'Editar'} {titles[section]}</h3>
          <p style={{fontSize:'12px',color:'#94a3b8',marginBottom:'20px'}}>Rellena los campos y guarda</p>
          <div style={{display:'flex',flexDirection:'column',gap:'13px',marginBottom:'20px'}}>
            {fields[section].map(f => (
              <div key={f.key}>
                <label style={{fontSize:'11px',color:'#64748b',fontWeight:600,display:'block',marginBottom:'5px'}}>{f.label}</label>
                {f.multiline
                  ? <textarea value={formData[f.key]||''} onChange={e=>setFormData(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} rows={3}
                      style={{width:'100%',padding:'9px 12px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#0f172a',fontSize:'13px',outline:'none',resize:'vertical',lineHeight:1.6}}/>
                  : <input value={formData[f.key]||''} onChange={e=>setFormData(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                      style={{width:'100%',padding:'9px 12px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#0f172a',fontSize:'13px',outline:'none'}}/>
                }
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={saveItem} style={{flex:1,padding:'11px',borderRadius:'9px',backgroundColor:ACC,border:'none',color:'#fff',fontWeight:700,fontSize:'13px',cursor:'pointer'}}>Guardar</button>
            <button onClick={()=>setEditando(null)} style={{padding:'11px 18px',borderRadius:'9px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#64748b',fontSize:'13px',cursor:'pointer'}}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  };

  const CVSection = ({title,section,items,renderItem}) => (
    <div style={{marginBottom:'20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
        <p style={{fontSize:'11px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px'}}>{title}</p>
        <button className="add-btn" onClick={()=>openAdd(section)}
          style={{display:'flex',alignItems:'center',gap:'5px',padding:'5px 12px',borderRadius:'7px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#64748b',fontSize:'11px',cursor:'pointer',fontWeight:600}}>
          <span style={{fontSize:'15px',lineHeight:1}}>+</span> Añadir
        </button>
      </div>
      {items.length===0 ? (
        <div style={{padding:'24px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px dashed #e2e8f0',textAlign:'center'}}>
          <p style={{fontSize:'13px',color:'#94a3b8'}}>Sin entradas — pulsa Añadir</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
          {items.map((item,i) => (
            <div key={i} className="cv-item" style={{padding:'16px 18px',borderRadius:'10px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',position:'relative'}}>
              {renderItem(item)}
              <div className="cv-actions" style={{position:'absolute',top:'12px',right:'12px',display:'flex',gap:'4px',opacity:0}}>
                <button onClick={()=>openEdit(section,i)} style={{padding:'4px 10px',borderRadius:'6px',backgroundColor:'#f1f5f9',border:'1px solid #e2e8f0',color:'#475569',fontSize:'11px',cursor:'pointer',fontWeight:600}}>Editar</button>
                <button onClick={()=>deleteItem(section,i)} style={{padding:'4px 10px',borderRadius:'6px',backgroundColor:'#fef2f2',border:'1px solid #fecaca',color:'#ef4444',fontSize:'11px',cursor:'pointer',fontWeight:600}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{css}</style>
      {editando && <FormModal/>}
      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0f172a'}}>

        <nav style={{position:'sticky',top:0,zIndex:50,height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',backgroundColor:'rgba(255,255,255,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 12px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:'28px'}}/>
            <span style={{fontSize:'15px',fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',gap:'2px'}}>
            {[{label:'← Dashboard',path:'/dashboard'},{label:'Training',path:'/training'},{label:'Ranking',path:'/ranking'},{label:'Certificado',path:'/certificado'}].map((item,i)=>(
              <button key={i} className="nav-btn" onClick={()=>navigate(item.path)} style={{padding:'5px 14px',borderRadius:'7px',background:'none',border:'none',color:'#64748b',fontSize:'13px',cursor:'pointer'}}>{item.label}</button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0'}}>
            <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#22c55e',animation:'pulse 2s infinite'}}/>
            <span style={{fontSize:'13px',color:'#374151',fontWeight:500}}>{userData?.nombre}</span>
            <span style={{fontSize:'11px',fontWeight:700,color:arenaColor,background:`${arenaColor}15`,padding:'2px 8px',borderRadius:'5px'}}>{userData?.arena}</span>
          </div>
        </nav>

        <div style={{maxWidth:'900px',margin:'0 auto',padding:'32px 40px 60px'}}>

          {/* Tabs */}
          <div style={{display:'flex',marginBottom:'28px',borderBottom:'1px solid #e8eaf0'}}>
            {TABS.map(tab=>(
              <button key={tab.id} className="tab-btn" onClick={()=>setVista(tab.id)}
                style={{padding:'10px 22px',background:'none',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,color:vista===tab.id?'#0f172a':'#94a3b8',borderBottom:vista===tab.id?`2px solid ${ACC}`:'2px solid transparent',marginBottom:'-1px'}}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── PERFIL ── */}
          {vista==='perfil' && (
            <div className="fade-up">

              {/* Header usuario */}
              <div style={{padding:'24px 28px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:'14px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',position:'relative',overflow:'hidden'}}>
                <div style={{height:'3px',background:`linear-gradient(90deg,${arenaColor},${ACC})`,borderRadius:'4px',marginBottom:'20px'}}/>
                <div style={{display:'flex',alignItems:'center',gap:'18px'}}>
                  <div style={{width:'60px',height:'60px',borderRadius:'14px',backgroundColor:`${arenaColor}18`,border:`2px solid ${arenaColor}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',fontWeight:900,color:arenaColor,flexShrink:0}}>
                    {userData?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{flex:1}}>
                    <h1 style={{fontSize:'20px',fontWeight:800,color:'#0f172a',marginBottom:'3px',letterSpacing:'-0.4px'}}>{userData?.nombre}</h1>
                    <p style={{fontSize:'12px',color:'#94a3b8',marginBottom:'10px'}}>{userData?.email}</p>
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                      <span style={{fontSize:'11px',padding:'3px 9px',borderRadius:'6px',backgroundColor:`${tierData?.color}12`,color:tierData?.color,fontWeight:700,border:`1px solid ${tierData?.color}25`}}>{tierData?.name}</span>
                      <span style={{fontSize:'11px',padding:'3px 9px',borderRadius:'6px',backgroundColor:`${arenaColor}10`,color:arenaColor,fontWeight:700,border:`1px solid ${arenaColor}20`}}>{userData?.arena}</span>
                      <span style={{fontSize:'11px',padding:'3px 9px',borderRadius:'6px',backgroundColor:'#f8fafc',color:'#64748b',border:'1px solid #e2e8f0'}}>T{tierActual}/8</span>
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
              <div style={{padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:'14px',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <p style={{fontSize:'11px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:'16px'}}>SKILL MATRIX</p>
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  {Object.entries(SKILLS_NOMBRES).map(([key,s])=>{
                    const val = skills?.[key]||0;
                    return (
                      <div key={key} style={{display:'flex',alignItems:'center',gap:'12px'}}>
                        <span style={{fontSize:'12px',color:'#475569',width:'150px',flexShrink:0}}>{s.label}</span>
                        <div style={{flex:1,height:'6px',borderRadius:'3px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                          <div style={{width:`${val*10}%`,height:'100%',borderRadius:'3px',background:`linear-gradient(90deg,${s.color}70,${s.color})`}}/>
                        </div>
                        <span style={{fontSize:'11px',color:s.color,fontWeight:700,width:'30px',textAlign:'right'}}>{val}/10</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
                <button onClick={()=>navigate('/sesion')} style={{padding:'13px',borderRadius:'10px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontWeight:700,fontSize:'13px',cursor:'pointer',boxShadow:`0 4px 16px ${ACC}30`}}>⚡ Nueva sesión</button>
                <button onClick={()=>setVista('tiers')} className="lesson-btn" style={{padding:'13px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#475569',fontSize:'13px',cursor:'pointer',fontWeight:600}}>Progression →</button>
                <button onClick={()=>setVista('cv')} className="lesson-btn" style={{padding:'13px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#475569',fontSize:'13px',cursor:'pointer',fontWeight:600}}>Mi CV →</button>
              </div>
            </div>
          )}

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
                  const esActual    = t.tier===tierActual;
                  const desbloqueado= t.tier<=tierActual;
                  const completado  = t.tier<tierActual;
                  const isLeft      = i%2===0;
                  return (
                    <div key={i} style={{display:'flex',alignItems:'flex-start',marginBottom:i<7?'8px':0,flexDirection:isLeft?'row':'row-reverse'}}>
                      <div className="tier-node" style={{width:'56%',padding:'18px 20px',borderRadius:'12px',backgroundColor:esActual?`${t.color}06`:'#fff',border:esActual?`2px solid ${t.color}30`:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',position:'relative',overflow:'hidden',opacity:!desbloqueado?.4:1}}>
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
                    {label:'Sesión Bronce',xp:'+50 XP',color:'#d97706'},
                    {label:'Sesión Plata',xp:'+100 XP',color:'#94a3b8'},
                    {label:'Sesión Oro',xp:'+200 XP',color:'#f59e0b'},
                    {label:'Sesión Diamante',xp:'+400 XP',color:'#3b82f6'},
                    {label:'Lección training',xp:'+30–70 XP',color:ACC},
                    {label:'Sin usar pistas',xp:'+bonus XP',color:'#22c55e'},
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

          {/* ── CV ── */}
          {vista==='cv' && (
            <div className="fade-up">
              <div style={{marginBottom:'24px'}}>
                <h2 style={{fontSize:'20px',fontWeight:800,color:'#0f172a',marginBottom:'4px',letterSpacing:'-0.5px'}}>CV / Perfil Profesional</h2>
                <p style={{fontSize:'12px',color:'#94a3b8'}}>Añade tus certificaciones, formación y experiencia laboral</p>
              </div>

              <CVSection title="CERTIFICACIONES" section="certificaciones" items={cv.certificaciones} renderItem={item=>(
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                    <span style={{fontSize:'13px',fontWeight:700,color:ACC}}>{item.nombre}</span>
                    {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:'10px',padding:'2px 7px',borderRadius:'4px',backgroundColor:`${ACC}08`,color:ACC,border:`1px solid ${ACC}20`,textDecoration:'none'}}>verificar →</a>}
                  </div>
                  <div style={{display:'flex',gap:'12px'}}>
                    <span style={{fontSize:'12px',color:'#475569'}}>{item.emisor}</span>
                    <span style={{fontSize:'12px',color:'#94a3b8'}}>{item.fecha}</span>
                  </div>
                </div>
              )}/>

              <CVSection title="FORMACIÓN ACADÉMICA" section="formaciones" items={cv.formaciones} renderItem={item=>(
                <div>
                  <span style={{fontSize:'13px',fontWeight:700,color:'#0f172a',display:'block',marginBottom:'4px'}}>{item.titulo}</span>
                  <div style={{display:'flex',gap:'12px',marginBottom:item.descripcion?'6px':0}}>
                    <span style={{fontSize:'12px',color:'#475569'}}>{item.institucion}</span>
                    <span style={{fontSize:'12px',color:'#94a3b8'}}>{item.fecha}</span>
                  </div>
                  {item.descripcion && <p style={{fontSize:'12px',color:'#64748b',lineHeight:1.6}}>{item.descripcion}</p>}
                </div>
              )}/>

              <CVSection title="EXPERIENCIA LABORAL" section="experiencia" items={cv.experiencia} renderItem={item=>(
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                    <span style={{fontSize:'13px',fontWeight:700,color:'#0f172a'}}>{item.cargo}</span>
                    <span style={{fontSize:'11px',color:'#94a3b8'}}>{item.desde}{item.hasta?` – ${item.hasta}`:''}</span>
                  </div>
                  <span style={{fontSize:'12px',color:'#22c55e',display:'block',marginBottom:item.descripcion?'6px':0,fontWeight:600}}>{item.empresa}</span>
                  {item.descripcion && <p style={{fontSize:'12px',color:'#64748b',lineHeight:1.6}}>{item.descripcion}</p>}
                </div>
              )}/>

              <div style={{padding:'12px 16px',borderRadius:'8px',backgroundColor:'#fffbeb',border:'1px solid #fde68a',display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{width:'5px',height:'5px',borderRadius:'50%',backgroundColor:'#f59e0b',flexShrink:0}}/>
                <p style={{fontSize:'12px',color:'#92400e'}}>Datos guardados localmente. Próximamente sincronización con servidor.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
