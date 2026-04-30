import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { SBNav, AvatarCircle, buildAvatarUrl, Icon, ACC, BG, BASE_CSS, SBSpinner, TIERS, TIER_CLR, getArenaGroup } from './SBLayout';

const API = 'https://socblast-production.up.railway.app';

// ── Opciones de avatar (mismas keys que buildAvatarUrl) ──
const AVATAR_OPTS = {
  top: [
    {id:'shortFlat',    label:'Corto liso'},    {id:'shortRound',   label:'Corto redondo'},
    {id:'shortWaved',   label:'Corto ondulado'},{id:'dreads01',     label:'Dreadlocks'},
    {id:'straight01',   label:'Largo liso'},    {id:'curly',        label:'Largo rizado'},
    {id:'bun',          label:'Moño'},          {id:'bob',          label:'Bob'},
    {id:'fro',          label:'Afro largo'},    {id:'frizzle',      label:'Afro corto'},
    {id:'hat',          label:'Gorro'},         {id:'hijab',        label:'Hijab'},
    {id:'turban',       label:'Turbante'},      {id:'winterHat1',   label:'Gorro invierno'},
    {id:'shaggy',       label:'Despeinado'},
  ],
  hairColor: [
    {id:'2c1b18',hex:'#2c1b18',label:'Negro'},       {id:'4a312c',hex:'#4a312c',label:'Castaño'},
    {id:'724133',hex:'#724133',label:'Castaño claro'},{id:'a55728',hex:'#a55728',label:'Rojizo'},
    {id:'b58143',hex:'#b58143',label:'Rubio oscuro'}, {id:'d6b370',hex:'#d6b370',label:'Rubio'},
    {id:'ecdcbf',hex:'#ecdcbf',label:'Rubio claro'},  {id:'c93305',hex:'#c93305',label:'Rojo fuego'},
    {id:'e8e1e1',hex:'#e8e1e1',label:'Gris'},         {id:'f59797',hex:'#f59797',label:'Rosa'},
  ],
  accessories: [
    {id:'blank',label:'Ninguno'},{id:'prescription01',label:'Gafas graduadas'},
    {id:'prescription02',label:'Gafas redondas'},{id:'round',label:'Gafas ovaladas'},
    {id:'sunglasses',label:'Gafas de sol'},{id:'wayfarers',label:'Wayfarer'},
    {id:'kurt',label:'Kurt'},
  ],
  facialHair: [
    {id:'blank',label:'Sin vello'},{id:'beardMedium',label:'Barba media'},
    {id:'beardLight',label:'Barba corta'},{id:'beardMajestic',label:'Barba larga'},
    {id:'moustacheFancy',label:'Bigote fancy'},{id:'moustacheMagnum',label:'Bigote magnum'},
  ],
  facialHairColor: [
    {id:'2c1b18',hex:'#2c1b18',label:'Negro'},{id:'4a312c',hex:'#4a312c',label:'Castaño'},
    {id:'a55728',hex:'#a55728',label:'Rojizo'},{id:'b58143',hex:'#b58143',label:'Rubio'},
    {id:'e8e1e1',hex:'#e8e1e1',label:'Gris'}, {id:'c93305',hex:'#c93305',label:'Rojo'},
  ],
  clothe: [
    {id:'blazerAndShirt',label:'Blazer + camisa'},{id:'blazerAndSweater',label:'Blazer + jersey'},
    {id:'collarAndSweater',label:'Jersey cuello'},{id:'graphicShirt',label:'Camiseta gráfica'},
    {id:'hoodie',label:'Hoodie'},{id:'overall',label:'Mono'},
    {id:'shirtCrewNeck',label:'Camiseta'},{id:'shirtVNeck',label:'Camiseta V'},
  ],
  clotheColor: [
    {id:'262e33',hex:'#262e33',label:'Negro'},      {id:'3c4f5c',hex:'#3c4f5c',label:'Gris oscuro'},
    {id:'65c9ff',hex:'#65c9ff',label:'Azul claro'}, {id:'5199e4',hex:'#5199e4',label:'Azul'},
    {id:'25557c',hex:'#25557c',label:'Azul marino'},{id:'e6e6e6',hex:'#e6e6e6',label:'Gris claro'},
    {id:'a7ffc4',hex:'#a7ffc4',label:'Verde menta'},{id:'ff5c5c',hex:'#ff5c5c',label:'Rojo'},
    {id:'ff488e',hex:'#ff488e',label:'Rosa'},        {id:'ffffff',hex:'#ffffff',label:'Blanco'},
  ],
  skin: [
    {id:'f8d25c',hex:'#F8D25C',label:'Amarillo'}, {id:'fd9841',hex:'#FD9841',label:'Bronceado'},
    {id:'ffdbb4',hex:'#FFDBB4',label:'Pálido'},   {id:'edb98a',hex:'#EDB98A',label:'Claro'},
    {id:'d08b5b',hex:'#D08B5B',label:'Moreno'},   {id:'ae5d29',hex:'#AE5D29',label:'Oscuro'},
    {id:'614335',hex:'#614335',label:'Negro'},
  ],
  eyes: [
    {id:'default',label:'Normal'},{id:'happy',label:'Feliz'},{id:'wink',label:'Guiño'},
    {id:'closed',label:'Cerrados'},{id:'surprised',label:'Sorprendido'},{id:'squint',label:'Entornados'},
    {id:'side',label:'Lateral'},{id:'hearts',label:'Corazones'},{id:'eyeRoll',label:'En blanco'},
    {id:'xDizzy',label:'KO'},{id:'winkWacky',label:'Guiño loco'},{id:'cry',label:'Llorando'},
  ],
  eyebrow: [
    {id:'default',label:'Normal'},{id:'defaultNatural',label:'Natural'},
    {id:'flatNatural',label:'Planas'},{id:'raisedExcited',label:'Levantadas'},
    {id:'raisedExcitedNatural',label:'Levantadas natural'},{id:'sadConcerned',label:'Triste'},
    {id:'sadConcernedNatural',label:'Triste natural'},{id:'unibrowNatural',label:'Moneja'},
    {id:'upDown',label:'Arriba-abajo'},{id:'angry',label:'Enfadado'},
  ],
  mouth: [
    {id:'default',label:'Normal'},{id:'smile',label:'Sonrisa'},{id:'serious',label:'Serio'},
    {id:'sad',label:'Triste'},{id:'twinkle',label:'Coqueto'},{id:'tongue',label:'Lengua'},
    {id:'grimace',label:'Mueca'},{id:'screamOpen',label:'Gritando'},{id:'eating',label:'Comiendo'},
    {id:'disbelief',label:'Incredulidad'},{id:'concerned',label:'Preocupado'},
  ],
};

const AVATAR_SECTIONS = [
  {key:'top',             label:'Pelo / Sombrero'},
  {key:'hairColor',       label:'Color de pelo',   type:'color'},
  {key:'skin',            label:'Tono de piel',    type:'color'},
  {key:'eyes',            label:'Ojos'},
  {key:'eyebrow',         label:'Cejas'},
  {key:'mouth',           label:'Boca'},
  {key:'accessories',     label:'Accesorios'},
  {key:'facialHair',      label:'Vello facial'},
  {key:'facialHairColor', label:'Color vello',     type:'color'},
  {key:'clothe',          label:'Ropa'},
  {key:'clotheColor',     label:'Color de ropa',   type:'color'},
];

const DEFAULT_AVATAR_CONFIG = {
  top:'shortFlat', hairColor:'2c1b18', accessories:'blank', facialHair:'blank',
  facialHairColor:'2c1b18', clothe:'hoodie', clotheColor:'262e33',
  skin:'edb98a', eyes:'default', eyebrow:'default', mouth:'default',
};

const TIERS_DATA = [
  {tier:1,name:'SOC Rookie',    xp:'0',      xpMax:'500',    color:'#64748b',desc:'Primeros pasos en el mundo SOC.',skills:['Conceptos básicos','Navegación SIEM']},
  {tier:2,name:'SOC Analyst',   xp:'500',    xpMax:'1.500',  color:'#4f46e5',desc:'Identifica amenazas básicas.',  skills:['Análisis de logs','Clasificación alertas']},
  {tier:3,name:'SOC Specialist',xp:'1.500',  xpMax:'3.000',  color:'#0891b2',desc:'Correlaciona eventos.',         skills:['Correlación SIEM','IOCs y TTPs']},
  {tier:4,name:'SOC Expert',    xp:'3.000',  xpMax:'5.000',  color:'#059669',desc:'Respuesta a incidentes.',       skills:['IR playbooks','MITRE ATT&CK']},
  {tier:5,name:'SOC Sentinel',  xp:'5.000',  xpMax:'8.000',  color:'#d97706',desc:'Threat hunting y forense.',     skills:['Threat Hunting','Análisis forense']},
  {tier:6,name:'SOC Architect', xp:'8.000',  xpMax:'12.000', color:'#ea580c',desc:'Estrategias de defensa.',       skills:['Arquitectura defensiva','Red team awareness']},
  {tier:7,name:'SOC Master',    xp:'12.000', xpMax:'18.000', color:'#dc2626',desc:'APTs y zero-days.',             skills:['APT hunting','Zero-day response']},
  {tier:8,name:'SOC Legend',    xp:'18.000', xpMax:'∞',      color:'#8b5cf6',desc:'Élite absoluta.',               skills:['Élite operacional','Liderazgo SOC']},
];

const SKILLS_FULL = [
  {key:'analisis_logs',           label:'Análisis de Logs',      color:'#3b82f6'},
  {key:'deteccion_amenazas',      label:'Detección de Amenazas', color:'#4f46e5'},
  {key:'respuesta_incidentes',    label:'Respuesta Incidentes',  color:'#f59e0b'},
  {key:'threat_hunting',          label:'Threat Hunting',        color:'#8b5cf6'},
  {key:'forense_digital',         label:'Forense Digital',       color:'#ec4899'},
  {key:'gestion_vulnerabilidades',label:'Gestión de Vulns',      color:'#f97316'},
  {key:'inteligencia_amenazas',   label:'Intel. de Amenazas',    color:'#10b981'},
  {key:'siem_queries',            label:'SIEM & Queries',        color:'#0891b2'},
];

const PREFERENCIAS_OPTS = [
  'Threat Hunting','Malware Analysis','Incident Response','Forense Digital',
  'Cloud Security','Red Team','OSINT','CTI','SIEM Engineering','Vulnerability Management',
  'Network Security','Web Security','Mobile Security','ICS/OT Security',
];

// Preview avatar — usa exactamente buildAvatarUrl de SBLayout
function AvatarPreview({ config, size=160 }) {
  const [loaded, setLoaded] = useState(false);
  const [key, setKey] = useState(0);
  const prevConfig = useRef('');

  useEffect(() => {
    const newKey = JSON.stringify(config);
    if (newKey !== prevConfig.current) {
      prevConfig.current = newKey;
      setLoaded(false);
      setKey(k => k+1);
    }
  }, [config]);

  const url = buildAvatarUrl(config, size*2);

  return (
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',border:'4px solid #fff',boxShadow:`0 0 0 3px ${ACC}30`,background:'#b6e3f4',position:'relative',flexShrink:0}}>
      {!loaded && (
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#b6e3f4',zIndex:1}}>
          <div style={{width:32,height:32,border:`3px solid ${ACC}30`,borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
        </div>
      )}
      <img key={key} src={url} alt="avatar" width={size} height={size}
        onLoad={()=>setLoaded(true)} onError={()=>setLoaded(true)}
        style={{width:'100%',height:'100%',objectFit:'cover',opacity:loaded?1:0,transition:'opacity .25s'}}/>
    </div>
  );
}

export default function PerfilPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [userData,     setUserData]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savedAvatar,  setSavedAvatar]  = useState(false);
  const [vista,        setVista]        = useState('perfil');
  const [avatarSection,setAvatarSection]= useState('top');
  const [avatarConfig, setAvatarConfig] = useState(DEFAULT_AVATAR_CONFIG);
  const [editForm,     setEditForm]     = useState({nombre_completo:'',edad:'',ubicacion:'',preferencias:[],perfil_publico:true});
  const [fotoPreview,  setFotoPreview]  = useState('');
  const [fotoBase64,   setFotoBase64]   = useState('');

  useEffect(() => { fetchPerfil(); }, []);

  const fetchPerfil = async () => {
    try {
      const r = await axios.get(`${API}/api/me`, {headers:{Authorization:`Bearer ${token}`}});
      setUserData(r.data);
      setEditForm({
        nombre_completo: r.data.nombre_completo||'',
        edad:            r.data.edad||'',
        ubicacion:       r.data.ubicacion||'',
        preferencias:    r.data.preferencias||[],
        perfil_publico:  r.data.perfil_publico!==false,
      });
      if (r.data.foto_perfil)   { setFotoPreview(r.data.foto_perfil); setFotoBase64(r.data.foto_perfil); }
      // Cargar avatar config guardado — mismas keys que buildAvatarUrl
      if (r.data.avatar_config) setAvatarConfig({...DEFAULT_AVATAR_CONFIG,...r.data.avatar_config});
    } catch {}
    setLoading(false);
  };

  const guardarPerfil = async () => {
    setSaving(true);
    try {
      const payload = {...editForm, edad: editForm.edad ? parseInt(editForm.edad)||null : null};
      if (fotoBase64) payload.foto_perfil = fotoBase64;
      const r = await axios.put(`${API}/api/me/perfil`, payload, {headers:{Authorization:`Bearer ${token}`}});
      setUserData(r.data);
      setSaved(true); setTimeout(()=>setSaved(false), 2500);
    } catch(err) { alert(err.response?.data?.detail||'Error al guardar'); }
    setSaving(false);
  };

  const guardarAvatar = async () => {
    setSavingAvatar(true);
    try {
      // Guardar con las mismas keys que usa buildAvatarUrl
      await axios.post(`${API}/api/me/avatar`, {avatar_config: avatarConfig}, {headers:{Authorization:`Bearer ${token}`}});
      setSavedAvatar(true); setTimeout(()=>setSavedAvatar(false), 2500);
    } catch {}
    setSavingAvatar(false);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size>2_000_000) { alert('Máx 2MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => { setFotoPreview(ev.target.result); setFotoBase64(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const togglePref = pref => setEditForm(p=>({...p, preferencias: p.preferencias.includes(pref)?p.preferencias.filter(x=>x!==pref):p.preferencias.length<6?[...p.preferencias,pref]:p.preferencias}));

  if (loading) return <SBSpinner/>;

  const tierActual  = userData?.tier||1;
  const xp          = userData?.xp||0;
  const XP_MAX      = [0,500,1500,3000,5000,8000,12000,18000,99999];
  const xpMin       = XP_MAX[tierActual-1]||0;
  const xpMaxTier   = XP_MAX[tierActual]||99999;
  const progresoXP  = Math.min(((xp-xpMin)/(xpMaxTier-xpMin))*100, 100);
  const tierData    = TIERS_DATA[tierActual-1];
  const arenaColor  = (() => { const g=getArenaGroup(userData?.arena); return {bronce:'#d97706',plata:'#64748b',oro:'#b45309',diamante:'#4f46e5'}[g]||ACC; })();
  const skills      = userData?.skills||{};
  const skillEntries = SKILLS_FULL.map(s=>({...s,val:skills?.[s.key]||0}));
  const nombre      = userData?.nombre||'';
  const TABS = [{id:'perfil',label:'Mi Perfil'},{id:'editar',label:'Editar perfil'},{id:'avatar',label:'Avatar'},{id:'tiers',label:'Progression'}];
  const currentSection = AVATAR_SECTIONS.find(s=>s.key===avatarSection);
  const currentOpts    = AVATAR_OPTS[avatarSection]||[];

  return (
    <div style={{minHeight:'100vh',background:BG,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",color:'#0f172a'}}>
      <style>{BASE_CSS + `
        .tab:hover{color:#0f172a!important;}
        .opt-btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(79,70,229,0.15)!important;}
        .pref:hover{border-color:#a5b4fc!important;}
        .sk:hover{background:#f8f7ff!important;}
        .inp:focus{outline:none;border-color:${ACC}!important;box-shadow:0 0 0 3px rgba(79,70,229,0.1)!important;}
        .pb:hover{opacity:.88;transform:translateY(-1px);}
      `}</style>

      {/* Toasts */}
      {saved       && <div style={{position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',zIndex:9999,padding:'12px 24px',borderRadius:12,background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',fontSize:14,fontWeight:700,boxShadow:'0 8px 32px rgba(5,150,105,0.35)',animation:'toastIn .3s ease',display:'flex',alignItems:'center',gap:8}}><Icon name="check" size={16} color="#fff"/>Perfil guardado</div>}
      {savedAvatar && <div style={{position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',zIndex:9999,padding:'12px 24px',borderRadius:12,background:`linear-gradient(135deg,${ACC},#6366f1)`,color:'#fff',fontSize:14,fontWeight:700,boxShadow:'0 8px 32px rgba(79,70,229,0.35)',animation:'toastIn .3s ease',display:'flex',alignItems:'center',gap:8}}><Icon name="check" size={16} color="#fff"/>Avatar guardado</div>}

      <SBNav user={user} avatarConfig={avatarConfig} foto={fotoPreview} activePage="/perfil" navigate={navigate}/>

      <div style={{maxWidth:960,margin:'0 auto',padding:'32px 32px 64px'}}>

        {/* TABS */}
        <div style={{display:'flex',marginBottom:28,borderBottom:'1px solid #e8eaf0',gap:2}}>
          {TABS.map(tab=>(
            <button key={tab.id} className="tab" onClick={()=>setVista(tab.id)}
              style={{padding:'11px 22px',background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:600,color:vista===tab.id?'#0f172a':'#94a3b8',borderBottom:vista===tab.id?`2.5px solid ${ACC}`:'2.5px solid transparent',marginBottom:-1,transition:'all .15s'}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PERFIL ── */}
        {vista==='perfil' && (
          <div className="fu">
            {/* Header card */}
            <div style={{borderRadius:20,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 16px rgba(79,70,229,0.06)',overflow:'hidden',marginBottom:16}}>
              <div style={{height:5,background:`linear-gradient(90deg,${arenaColor},${ACC},#818cf8)`}}/>
              <div style={{padding:'28px 32px'}}>
                <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:20}}>
                  <div style={{position:'relative'}}>
                    <AvatarCircle name={nombre} avatarConfig={avatarConfig} size={88} foto={fotoPreview}/>
                    <button onClick={()=>setVista('avatar')} style={{position:'absolute',bottom:-2,right:-2,width:26,height:26,borderRadius:'50%',background:ACC,border:'3px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:12}}>✏️</button>
                  </div>
                  <div style={{flex:1}}>
                    <h1 style={{fontSize:22,fontWeight:900,color:'#0f172a',marginBottom:4,letterSpacing:'-0.4px'}}>{editForm.nombre_completo||nombre}</h1>
                    {editForm.nombre_completo&&<p style={{fontSize:12,color:'#94a3b8',marginBottom:4}}>@{nombre}</p>}
                    <p style={{fontSize:12,color:'#94a3b8',marginBottom:10}}>{userData?.email}</p>
                    <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                      <span style={{fontSize:11,padding:'3px 10px',borderRadius:7,background:`${tierData?.color}12`,color:tierData?.color,fontWeight:700,border:`1px solid ${tierData?.color}25`}}>{tierData?.name}</span>
                      <span style={{fontSize:11,padding:'3px 10px',borderRadius:7,background:`${arenaColor}10`,color:arenaColor,fontWeight:700,border:`1px solid ${arenaColor}20`}}>{userData?.arena}</span>
                      {editForm.ubicacion&&<span style={{fontSize:11,padding:'3px 10px',borderRadius:7,background:'#f0fdf4',color:'#059669',border:'1px solid #bbf7d0'}}>📍 {editForm.ubicacion}</span>}
                    </div>
                  </div>
                </div>
                {editForm.preferencias.length>0&&(
                  <div>
                    <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:8}}>ÁREAS DE INTERÉS</p>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {editForm.preferencias.map((p,i)=><span key={i} style={{fontSize:11,padding:'3px 11px',borderRadius:100,background:`${ACC}08`,color:ACC,border:`1px solid ${ACC}20`,fontWeight:600}}>{p}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
              {[
                {label:'PUNTOS',    val:(userData?.copas||0).toLocaleString(), color:arenaColor},
                {label:'XP TOTAL',  val:(userData?.xp||0).toLocaleString(),    color:ACC},
                {label:'SESIONES',  val:userData?.sesiones_completadas||0,     color:'#059669'},
                {label:'TIER',      val:`${tierActual}/8`,                     color:tierData?.color},
              ].map((s,i)=>(
                <div key={i} style={{padding:'20px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(79,70,229,0.05)'}}>
                  <div style={{height:3,background:`linear-gradient(90deg,${s.color},${s.color}60)`,borderRadius:4,marginBottom:12}}/>
                  <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:8}}>{s.label}</div>
                  <div style={{fontSize:28,fontWeight:900,color:s.color,letterSpacing:'-0.8px',lineHeight:1}}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* XP bar */}
            <div style={{padding:'18px 22px',borderRadius:14,background:'#fff',border:'1px solid #e8eaf0',marginBottom:16,boxShadow:'0 2px 8px rgba(79,70,229,0.04)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:13,fontWeight:700,color:tierData?.color}}>{tierData?.name}</span>
                  {tierActual<8&&<span style={{fontSize:12,color:'#94a3b8'}}>→ {TIERS_DATA[tierActual]?.name}</span>}
                </div>
                <span style={{fontSize:11,color:'#94a3b8'}}>{xp.toLocaleString()} / {xpMaxTier===99999?'∞':xpMaxTier.toLocaleString()} XP</span>
              </div>
              <div style={{height:8,borderRadius:4,background:'#ede9fe',overflow:'hidden'}}>
                <div style={{width:`${progresoXP}%`,height:'100%',borderRadius:4,background:`linear-gradient(90deg,${tierData?.color}80,${tierData?.color})`}}/>
              </div>
              {tierActual<8&&<p style={{fontSize:11,color:'#94a3b8',marginTop:6}}>Faltan {(xpMaxTier-xp).toLocaleString()} XP para {TIERS_DATA[tierActual]?.name}</p>}
            </div>

            {/* Skills */}
            <div style={{borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',overflow:'hidden',boxShadow:'0 2px 10px rgba(79,70,229,0.04)'}}>
              <div style={{padding:'18px 24px',borderBottom:'1px solid #f5f3ff',display:'flex',justifyContent:'space-between'}}>
                <p style={{fontSize:14,fontWeight:700,color:'#0f172a'}}>Skill Matrix</p>
                <span style={{fontSize:11,color:ACC,fontWeight:700}}>Media: {Math.round(skillEntries.reduce((a,s)=>a+s.val,0)/skillEntries.length*10)/10}/10</span>
              </div>
              {skillEntries.map((s,i)=>{
                const pct=Math.min((s.val/10)*100,100); const isWeak=s.val<4; const isTop=s.val>=7;
                return (
                  <div key={i} className="sk" style={{display:'flex',alignItems:'center',gap:14,padding:'12px 24px',borderBottom:i<skillEntries.length-1?'1px solid #f8f7ff':'none',transition:'background .15s'}}>
                    <div style={{width:34,height:34,borderRadius:10,background:isWeak?'#fef2f2':isTop?'#f0fdf4':`${s.color}10`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${isWeak?'#fecaca':isTop?'#bbf7d0':`${s.color}20`}`}}>
                      <span style={{fontSize:13}}>{isWeak?'⚠️':isTop?'✅':'📊'}</span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                        <span style={{fontSize:12,color:isWeak?'#ef4444':isTop?'#059669':'#374151',fontWeight:600}}>{s.label}</span>
                        <span style={{fontSize:12,fontWeight:800,color:isWeak?'#ef4444':isTop?'#059669':s.color,fontFamily:'monospace'}}>{s.val}/10</span>
                      </div>
                      <div style={{height:6,borderRadius:3,background:'#ede9fe',overflow:'hidden'}}>
                        <div style={{width:`${pct}%`,height:'100%',borderRadius:3,background:isWeak?'linear-gradient(90deg,#fca5a5,#ef4444)':isTop?'linear-gradient(90deg,#86efac,#059669)':`linear-gradient(90deg,${s.color}60,${s.color})`}}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:14}}>
              <button className="sb-btn-primary pb" onClick={()=>navigate('/sesion')} style={{padding:14,fontSize:13}}>Nueva sesión SOC</button>
              <button onClick={()=>setVista('editar')} style={{padding:14,borderRadius:100,background:'#fff',border:'1px solid #e8eaf0',color:'#475569',fontSize:13,cursor:'pointer',fontWeight:600}}>Editar perfil</button>
            </div>
          </div>
        )}

        {/* ── EDITAR ── */}
        {vista==='editar' && (
          <div className="fu" style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:20,alignItems:'start'}}>
            {/* Sidebar foto */}
            <div style={{padding:'24px',borderRadius:20,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 16px rgba(79,70,229,0.06)',textAlign:'center',position:'sticky',top:80}}>
              <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:16}}>FOTO DE PERFIL</p>
              <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
                <AvatarCircle name={nombre} avatarConfig={avatarConfig} size={96} foto={fotoPreview}/>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFotoChange}/>
              <button onClick={()=>fileRef.current?.click()} style={{width:'100%',padding:10,borderRadius:100,background:`${ACC}10`,border:`1px solid ${ACC}25`,color:ACC,fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:8}}>Subir foto</button>
              {fotoPreview&&<button onClick={()=>{setFotoPreview('');setFotoBase64('');}} style={{width:'100%',padding:8,borderRadius:100,background:'#fef2f2',border:'1px solid #fecaca',color:'#ef4444',fontSize:12,fontWeight:600,cursor:'pointer',marginBottom:8}}>Eliminar foto</button>}
              <div style={{marginTop:14,padding:12,borderRadius:12,background:editForm.perfil_publico?'#ecfdf5':'#f1f5f9',border:`1px solid ${editForm.perfil_publico?'#bbf7d0':'#e2e8f0'}`}}>
                <p style={{fontSize:11,fontWeight:700,color:editForm.perfil_publico?'#059669':'#64748b',marginBottom:8}}>{editForm.perfil_publico?'Visible para empresas':'Perfil privado'}</p>
                <button onClick={()=>setEditForm(p=>({...p,perfil_publico:!p.perfil_publico}))} style={{width:'100%',padding:7,borderRadius:100,background:editForm.perfil_publico?'#dcfce7':'#f1f5f9',border:`1px solid ${editForm.perfil_publico?'#86efac':'#e2e8f0'}`,color:editForm.perfil_publico?'#15803d':'#64748b',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                  {editForm.perfil_publico?'Hacer privado':'Hacer público'}
                </button>
              </div>
            </div>
            {/* Form */}
            <div style={{padding:'28px',borderRadius:20,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 16px rgba(79,70,229,0.06)'}}>
              <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:22}}>INFORMACIÓN PERSONAL</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:6}}>USUARIO</label>
                  <input value={nombre} disabled style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #e8eaf0',fontSize:13,color:'#94a3b8',background:'#f8fafc',cursor:'not-allowed'}}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:6}}>NOMBRE COMPLETO</label>
                  <input className="inp" value={editForm.nombre_completo} onChange={e=>setEditForm(p=>({...p,nombre_completo:e.target.value}))} placeholder="Tu nombre y apellidos" style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #e8eaf0',fontSize:13,color:'#0f172a',background:'#fff'}}/>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:6}}>EDAD</label>
                  <input className="inp" type="number" min="14" max="99" value={editForm.edad} onChange={e=>setEditForm(p=>({...p,edad:e.target.value}))} placeholder="Tu edad" style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #e8eaf0',fontSize:13,color:'#0f172a',background:'#fff'}}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:6}}>UBICACIÓN</label>
                  <input className="inp" value={editForm.ubicacion} onChange={e=>setEditForm(p=>({...p,ubicacion:e.target.value}))} placeholder="Ej: Madrid, España" style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #e8eaf0',fontSize:13,color:'#0f172a',background:'#fff'}}/>
                </div>
              </div>
              <div style={{marginBottom:22}}>
                <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:8}}>ÁREAS DE INTERÉS <span style={{color:'#94a3b8',fontWeight:500}}>({editForm.preferencias.length}/6)</span></label>
                <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                  {PREFERENCIAS_OPTS.map(pref=>{const sel=editForm.preferencias.includes(pref);return(<button key={pref} className="pref" onClick={()=>togglePref(pref)} style={{padding:'5px 13px',borderRadius:100,border:`1px solid ${sel?ACC:'#e8eaf0'}`,background:sel?`${ACC}08`:'#fff',color:sel?ACC:'#64748b',fontSize:11,fontWeight:sel?700:500,cursor:'pointer'}}>{pref}</button>);})}
                </div>
              </div>
              <button onClick={guardarPerfil} disabled={saving} className="sb-btn-primary pb" style={{width:'100%',padding:14,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                {saving?<><div style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>Guardando...</>:'Guardar cambios'}
              </button>
            </div>
          </div>
        )}

        {/* ── AVATAR ── */}
        {vista==='avatar' && (
          <div className="fu" style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:24,alignItems:'start'}}>
            {/* Preview sidebar */}
            <div style={{padding:'28px 22px',borderRadius:20,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 4px 20px rgba(79,70,229,0.07)',textAlign:'center',position:'sticky',top:80}}>
              <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:20}}>PREVIEW EN VIVO</p>
              <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
                <AvatarPreview config={avatarConfig} size={150}/>
              </div>
              <p style={{fontSize:15,fontWeight:800,color:'#0f172a',marginBottom:2}}>{nombre}</p>
              <p style={{fontSize:11,color:'#94a3b8',marginBottom:18}}>{TIERS_DATA[tierActual-1]?.name} · {userData?.arena}</p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <button onClick={guardarAvatar} disabled={savingAvatar} className="sb-btn-primary pb" style={{width:'100%',padding:'12px',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
                  {savingAvatar?<><div style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>Guardando...</>:savedAvatar?'✓ Guardado':'Guardar avatar'}
                </button>
                <button onClick={()=>{ const r={}; Object.entries(AVATAR_OPTS).forEach(([k,opts])=>{r[k]=opts[Math.floor(Math.random()*opts.length)].id;}); setAvatarConfig(r); }} style={{width:'100%',padding:'10px',borderRadius:100,border:'1px solid #e8eaf0',background:'#fff',color:'#374151',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                  🎲 Aleatorio
                </button>
                <button onClick={()=>setAvatarConfig(DEFAULT_AVATAR_CONFIG)} style={{width:'100%',padding:'9px',borderRadius:100,border:'1px solid #e8eaf0',background:'#fff',color:'#94a3b8',fontSize:12,cursor:'pointer'}}>
                  Resetear
                </button>
              </div>
            </div>

            {/* Editor */}
            <div>
              <h2 style={{fontSize:20,fontWeight:900,color:'#0f172a',letterSpacing:'-0.5px',marginBottom:4}}>Personaliza tu avatar</h2>
              <p style={{fontSize:13,color:'#64748b',marginBottom:18}}>Aparece en el dashboard, ranking y tu Analyst Card</p>

              {/* Section tabs */}
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
                {AVATAR_SECTIONS.map(s=>(
                  <button key={s.key} onClick={()=>setAvatarSection(s.key)}
                    style={{padding:'6px 14px',borderRadius:9,border:`1.5px solid ${avatarSection===s.key?ACC:'#e8eaf0'}`,background:avatarSection===s.key?`${ACC}0d`:'#fff',color:avatarSection===s.key?ACC:'#64748b',fontSize:11,fontWeight:avatarSection===s.key?700:500,cursor:'pointer',whiteSpace:'nowrap',transition:'all .15s'}}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Opciones */}
              <div style={{background:'#fff',borderRadius:16,border:'1px solid #e8eaf0',padding:'20px 22px',boxShadow:'0 2px 10px rgba(79,70,229,0.04)',minHeight:180}}>
                <p style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'2px',marginBottom:14}}>{currentSection?.label?.toUpperCase()} — {currentOpts.length} OPCIONES</p>
                {currentSection?.type==='color' ? (
                  <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                    {currentOpts.map(opt=>{
                      const isSel = avatarConfig[avatarSection]===opt.id;
                      return (
                        <div key={opt.id} className="opt-btn" onClick={()=>setAvatarConfig(c=>({...c,[avatarSection]:opt.id}))}
                          style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,padding:'9px 11px',borderRadius:12,border:`2px solid ${isSel?ACC:'#e8eaf0'}`,background:isSel?`${ACC}08`:'#fafafa',cursor:'pointer',minWidth:62,transition:'all .15s'}}>
                          <div style={{width:28,height:28,borderRadius:'50%',background:opt.hex,border:'2px solid rgba(0,0,0,0.08)',boxShadow:isSel?`0 0 0 3px ${ACC}40`:''}}/>
                          <span style={{fontSize:10,color:isSel?ACC:'#64748b',fontWeight:isSel?700:400,whiteSpace:'nowrap'}}>{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:8}}>
                    {currentOpts.map(opt=>{
                      const isSel = avatarConfig[avatarSection]===opt.id;
                      return (
                        <div key={opt.id} className="opt-btn" onClick={()=>setAvatarConfig(c=>({...c,[avatarSection]:opt.id}))}
                          style={{padding:'11px 13px',borderRadius:12,border:`2px solid ${isSel?ACC:'#e8eaf0'}`,background:isSel?`${ACC}08`:'#fafafa',textAlign:'center',cursor:'pointer',transition:'all .15s'}}>
                          <span style={{fontSize:12,color:isSel?ACC:'#374151',fontWeight:isSel?700:500}}>{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TIERS ── */}
        {vista==='tiers' && (
          <div className="fu">
            <h2 style={{fontSize:22,fontWeight:900,color:'#0f172a',marginBottom:4,letterSpacing:'-0.5px'}}>Progression Map</h2>
            <p style={{fontSize:12,color:'#94a3b8',marginBottom:20}}>{tierActual}/8 tiers desbloqueados</p>
            <div style={{padding:'16px 22px',borderRadius:14,background:'#fff',border:'1px solid #e8eaf0',marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:12,color:'#94a3b8'}}>Progreso global</span>
                <span style={{fontSize:12,color:ACC,fontWeight:700}}>{Math.round(((tierActual-1)/7)*100)}%</span>
              </div>
              <div style={{display:'flex',gap:3}}>
                {TIERS_DATA.map((t,i)=><div key={i} style={{flex:1,height:7,borderRadius:2,background:i<tierActual?t.color:'#e8eaf0'}}/>)}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {TIERS_DATA.map((t,i)=>{
                const esActual=t.tier===tierActual, desbloqueado=t.tier<=tierActual, completado=t.tier<tierActual;
                return (
                  <div key={i} style={{padding:'20px 24px',borderRadius:14,background:esActual?`${t.color}05`:'#fff',border:esActual?`2px solid ${t.color}30`:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',opacity:!desbloqueado?.45:1}}>
                    {esActual&&<div style={{height:2,background:`linear-gradient(90deg,${t.color},${t.color}40)`,borderRadius:4,marginBottom:14}}/>}
                    <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:esActual?10:0}}>
                      <div style={{width:38,height:38,borderRadius:10,background:completado?'#ecfdf5':esActual?`${t.color}12`:'#f8fafc',border:`1px solid ${completado?'#bbf7d0':esActual?t.color+'25':'#e8eaf0'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {completado?<span style={{color:'#22c55e',fontSize:15}}>✓</span>:<span style={{fontSize:14,fontWeight:900,color:desbloqueado?t.color:'#cbd5e1'}}>{t.tier}</span>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                          <span style={{fontSize:14,fontWeight:700,color:desbloqueado?t.color:'#cbd5e1'}}>{t.name}</span>
                          {esActual&&<span style={{fontSize:9,padding:'2px 8px',borderRadius:5,background:`${t.color}12`,color:t.color,fontWeight:700}}>ACTUAL</span>}
                        </div>
                        <span style={{fontSize:11,color:'#94a3b8'}}>{t.xp} — {t.xpMax} XP</span>
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:4,justifyContent:'flex-end'}}>
                        {t.skills.map((sk,j)=><span key={j} style={{fontSize:10,padding:'2px 8px',borderRadius:5,background:desbloqueado?`${t.color}08`:'#f8fafc',color:desbloqueado?t.color:'#cbd5e1',border:`1px solid ${desbloqueado?t.color+'15':'#e8eaf0'}`}}>{sk}</span>)}
                      </div>
                    </div>
                    {esActual&&(
                      <div>
                        <div style={{height:5,borderRadius:3,background:'#ede9fe',overflow:'hidden'}}>
                          <div style={{width:`${progresoXP}%`,height:'100%',borderRadius:3,background:`linear-gradient(90deg,${t.color}80,${t.color})`}}/>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
                          <span style={{fontSize:10,color:'#94a3b8'}}>{xp.toLocaleString()} XP</span>
                          <span style={{fontSize:10,color:t.color,fontWeight:600}}>{Math.round(progresoXP)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}