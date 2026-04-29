import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

const API = 'https://socblast-production.up.railway.app';
const ACC  = '#4f46e5';

const AVATAR_OPTS = {
  top: [
    {id:'shortFlat',           label:'Corto liso'},
    {id:'shortRound',          label:'Corto redondo'},
    {id:'shortWaved',          label:'Corto ondulado'},
    {id:'dreads01',            label:'Dreadlocks'},
    {id:'straight01',          label:'Largo liso'},
    {id:'curly',               label:'Largo rizado'},
    {id:'bun',                 label:'Moño'},
    {id:'bob',                 label:'Bob'},
    {id:'fro',                 label:'Afro largo'},
    {id:'frizzle',             label:'Afro corto'},
    {id:'hat',                 label:'Gorro'},
    {id:'hijab',               label:'Hijab'},
    {id:'turban',              label:'Turbante'},
    {id:'winterHat1',          label:'Gorro invierno'},
    {id:'shaggy',              label:'Despeinado'},
  ],
  hairColor: [
    {id:'2c1b18', label:'Negro',        hex:'#2c1b18'},
    {id:'4a312c', label:'Castaño',      hex:'#4a312c'},
    {id:'724133', label:'Castaño claro',hex:'#724133'},
    {id:'a55728', label:'Rojizo',       hex:'#a55728'},
    {id:'b58143', label:'Rubio oscuro', hex:'#b58143'},
    {id:'d6b370', label:'Rubio',        hex:'#d6b370'},
    {id:'ecdcbf', label:'Rubio claro',  hex:'#ecdcbf'},
    {id:'c93305', label:'Rojo fuego',   hex:'#c93305'},
    {id:'e8e1e1', label:'Gris',         hex:'#e8e1e1'},
    {id:'f59797', label:'Rosa',         hex:'#f59797'},
  ],
  accessories: [
    {id:'blank',          label:'Ninguno'},
    {id:'prescription01', label:'Gafas graduadas'},
    {id:'prescription02', label:'Gafas redondas'},
    {id:'round',          label:'Gafas ovaladas'},
    {id:'sunglasses',     label:'Gafas de sol'},
    {id:'wayfarers',      label:'Wayfarer'},
    {id:'kurt',           label:'Kurt'},
  ],
  facialHair: [
    {id:'blank',          label:'Sin vello'},
    {id:'beardMedium',    label:'Barba media'},
    {id:'beardLight',     label:'Barba corta'},
    {id:'beardMajestic',  label:'Barba larga'},
    {id:'moustacheFancy', label:'Bigote fancy'},
    {id:'moustacheMagnum',label:'Bigote magnum'},
  ],
  facialHairColor: [
    {id:'2c1b18', label:'Negro',      hex:'#2c1b18'},
    {id:'4a312c', label:'Castaño',    hex:'#4a312c'},
    {id:'a55728', label:'Rojizo',     hex:'#a55728'},
    {id:'b58143', label:'Rubio',      hex:'#b58143'},
    {id:'e8e1e1', label:'Gris',       hex:'#e8e1e1'},
    {id:'c93305', label:'Rojo fuego', hex:'#c93305'},
  ],
  clothe: [
    {id:'blazerAndShirt',   label:'Blazer + camisa'},
    {id:'blazerAndSweater', label:'Blazer + jersey'},
    {id:'collarAndSweater', label:'Jersey cuello'},
    {id:'graphicShirt',     label:'Camiseta gráfica'},
    {id:'hoodie',           label:'Hoodie'},
    {id:'overall',          label:'Mono'},
    {id:'shirtCrewNeck',    label:'Camiseta'},
    {id:'shirtVNeck',       label:'Camiseta V'},
  ],
  clotheColor: [
    {id:'262e33', label:'Negro',      hex:'#262e33'},
    {id:'3c4f5c', label:'Gris oscuro',hex:'#3c4f5c'},
    {id:'65c9ff', label:'Azul claro', hex:'#65c9ff'},
    {id:'5199e4', label:'Azul',       hex:'#5199e4'},
    {id:'25557c', label:'Azul marino',hex:'#25557c'},
    {id:'e6e6e6', label:'Gris claro', hex:'#e6e6e6'},
    {id:'a7ffc4', label:'Verde menta',hex:'#a7ffc4'},
    {id:'ff5c5c', label:'Rojo',       hex:'#ff5c5c'},
    {id:'ff488e', label:'Rosa',       hex:'#ff488e'},
    {id:'ffffb1', label:'Amarillo',   hex:'#ffffb1'},
    {id:'ffffff', label:'Blanco',     hex:'#ffffff'},
  ],
  skin: [
    {id:'f8d25c', label:'Amarillo',  hex:'#F8D25C'},
    {id:'fd9841', label:'Bronceado', hex:'#FD9841'},
    {id:'ffdbb4', label:'Pálido',    hex:'#FFDBB4'},
    {id:'edb98a', label:'Claro',     hex:'#EDB98A'},
    {id:'d08b5b', label:'Moreno',    hex:'#D08B5B'},
    {id:'ae5d29', label:'Oscuro',    hex:'#AE5D29'},
    {id:'614335', label:'Negro',     hex:'#614335'},
  ],
  eyes: [
    {id:'default',   label:'Normal'},
    {id:'happy',     label:'Feliz'},
    {id:'wink',      label:'Guiño'},
    {id:'closed',    label:'Cerrados'},
    {id:'surprised', label:'Sorprendido'},
    {id:'squint',    label:'Entornados'},
    {id:'side',      label:'Lateral'},
    {id:'hearts',    label:'Corazones'},
    {id:'eyeRoll',   label:'En blanco'},
    {id:'xDizzy',    label:'KO'},
    {id:'winkWacky', label:'Guiño loco'},
    {id:'cry',       label:'Llorando'},
  ],
  eyebrow: [
    {id:'default',              label:'Normal'},
    {id:'defaultNatural',       label:'Natural'},
    {id:'flatNatural',          label:'Planas'},
    {id:'raisedExcited',        label:'Levantadas'},
    {id:'raisedExcitedNatural', label:'Levantadas natural'},
    {id:'sadConcerned',         label:'Triste'},
    {id:'sadConcernedNatural',  label:'Triste natural'},
    {id:'unibrowNatural',       label:'Moneja'},
    {id:'upDown',               label:'Arriba-abajo'},
    {id:'angry',                label:'Enfadado'},
  ],
  mouth: [
    {id:'default',    label:'Normal'},
    {id:'smile',      label:'Sonrisa'},
    {id:'serious',    label:'Serio'},
    {id:'sad',        label:'Triste'},
    {id:'twinkle',    label:'Coqueto'},
    {id:'tongue',     label:'Lengua'},
    {id:'grimace',    label:'Mueca'},
    {id:'screamOpen', label:'Gritando'},
    {id:'eating',     label:'Comiendo'},
    {id:'disbelief',  label:'Incredulidad'},
    {id:'concerned',  label:'Preocupado'},
    {id:'vomit',      label:'Vomitando'},
  ],
};

const AVATAR_SECTIONS = [
  {key:'top',            label:'Pelo / Sombrero'},
  {key:'hairColor',      label:'Color de pelo',        type:'color'},
  {key:'skin',           label:'Tono de piel',          type:'color'},
  {key:'eyes',           label:'Ojos'},
  {key:'eyebrow',        label:'Cejas'},
  {key:'mouth',          label:'Boca'},
  {key:'accessories',    label:'Accesorios'},
  {key:'facialHair',     label:'Vello facial'},
  {key:'facialHairColor',label:'Color vello',           type:'color'},
  {key:'clothe',         label:'Ropa'},
  {key:'clotheColor',    label:'Color de ropa',         type:'color'},
];

const DEFAULT_AVATAR_CONFIG = {
  top:'shortFlat', hairColor:'2c1b18', accessories:'blank',
  facialHair:'blank', facialHairColor:'2c1b18', clothe:'hoodie',
  clotheColor:'262e33', skin:'edb98a', eyes:'default', eyebrow:'default', mouth:'default',
};

/**
 * Construye la URL del proxy con los nombres de parámetro correctos para DiceBear v9:
 *   clothe       → clothing
 *   clotheColor  → clothingColor
 *   eyebrow      → eyebrows
 */
function buildAvatarUrl(config = {}, size = 200) {
  const c = { ...DEFAULT_AVATAR_CONFIG, ...config };
  const opts = {
    top:             [c.top],
    hairColor:       [c.hairColor],
    clothing:        [c.clothe],
    clothesColor:    [c.clotheColor],
    skinColor:       [c.skin],
    eyes:            [c.eyes],
    eyebrows:        [c.eyebrow],
    mouth:           [c.mouth],
    backgroundColor: ['b6e3f4'],
    size,
  };
  if (c.accessories !== 'blank') opts.accessories      = [c.accessories];
  if (c.facialHair  !== 'blank') {
    opts.facialHair      = [c.facialHair];
    opts.facialHairColor = [c.facialHairColor];
  }
  const avatar = createAvatar(avataaars, opts);
  return `data:image/svg+xml;utf8,${encodeURIComponent(avatar.toString())}`;
}

function randomAvatarConfig() {
  const r = {};
  Object.entries(AVATAR_OPTS).forEach(([k, opts]) => {
    r[k] = opts[Math.floor(Math.random() * opts.length)].id;
  });
  return r;
}

function totalCombinations() {
  return Object.values(AVATAR_OPTS).reduce((a, opts) => a * opts.length, 1).toLocaleString('es-ES');
}

// ── Datos de tiers ──────────────────────────────────────────────────────────
const TIERS_DATA = [
  {tier:1,name:'SOC Rookie',    xp:'0',      xpMax:'500',    color:'#64748b',desc:'Primeros pasos en el mundo SOC.',          skills:['Conceptos básicos','Navegación SIEM']},
  {tier:2,name:'SOC Analyst',   xp:'500',    xpMax:'1.500',  color:'#3b82f6',desc:'Identifica amenazas básicas con soltura.',  skills:['Análisis de logs','Clasificación alertas']},
  {tier:3,name:'SOC Specialist',xp:'1.500',  xpMax:'3.000',  color:'#06b6d4',desc:'Correlaciona eventos y detecta patrones.',  skills:['Correlación SIEM','IOCs y TTPs']},
  {tier:4,name:'SOC Expert',    xp:'3.000',  xpMax:'5.000',  color:'#10b981',desc:'Respuesta a incidentes con soltura.',        skills:['IR playbooks','MITRE ATT&CK']},
  {tier:5,name:'SOC Sentinel',  xp:'5.000',  xpMax:'8.000',  color:'#f59e0b',desc:'Threat hunting proactivo y forense.',        skills:['Threat Hunting','Análisis forense']},
  {tier:6,name:'SOC Architect', xp:'8.000',  xpMax:'12.000', color:'#f97316',desc:'Diseña estrategias de defensa complejas.',   skills:['Arquitectura defensiva','Red team awareness']},
  {tier:7,name:'SOC Master',    xp:'12.000', xpMax:'18.000', color:'#ef4444',desc:'APTs, zero-days y respuesta avanzada.',      skills:['APT hunting','Zero-day response']},
  {tier:8,name:'SOC Legend',    xp:'18.000', xpMax:'∞',      color:'#8b5cf6',desc:'El nivel más alto. Élite absoluta.',         skills:['Élite operacional','Liderazgo SOC']},
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

const getArenaColor = (arena = '') => {
  if (arena.includes('Diamante')) return '#3b82f6';
  if (arena.includes('Oro'))      return '#f59e0b';
  if (arena.includes('Plata'))    return '#94a3b8';
  return '#d97706';
};

// ── Componente Avatar ────────────────────────────────────────────────────────
function Avatar({ name = '', avatarConfig = null, size = 80, foto = '' }) {
  const [loaded, setLoaded] = useState(false);
  const prevKey = useRef('');
  const key = avatarConfig ? JSON.stringify(avatarConfig) : '';

  useEffect(() => {
    if (key !== prevKey.current) { setLoaded(false); prevKey.current = key; }
  }, [key]);

  if (foto) return (
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',flexShrink:0,border:'2px solid rgba(79,70,229,0.2)'}}>
      <img src={foto} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    </div>
  );

  if (avatarConfig) return (
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',flexShrink:0,border:'2px solid rgba(79,70,229,0.15)',background:'#b6e3f4',position:'relative'}}>
      {!loaded && (
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#b6e3f4'}}>
          <div style={{width:Math.max(10,size*.25),height:Math.max(10,size*.25),border:'2px solid rgba(79,70,229,0.2)',borderTop:`2px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
        </div>
      )}
      <img
        key={key}
        src={buildAvatarUrl(avatarConfig, size * 2)}
        alt={name}
        width={size} height={size}
        onLoad={()=>setLoaded(true)}
        onError={()=>setLoaded(true)}
        style={{width:'100%',height:'100%',objectFit:'cover',opacity:loaded?1:0,transition:'opacity .3s'}}
      />
    </div>
  );

  const initials = name.trim().split(' ').map(w=>w[0]?.toUpperCase()||'').slice(0,2).join('');
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:'linear-gradient(135deg,#4f46e5,#818cf8)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:'2px solid rgba(79,70,229,0.2)'}}>
      <span style={{fontSize:size*.34,fontWeight:800,color:'#fff',fontFamily:"'Inter',sans-serif"}}>{initials||'?'}</span>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function PerfilPage() {
  const { token }  = useAuth();
  const navigate   = useNavigate();
  const fileRef    = useRef(null);

  const [userData,     setUserData]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savedAvatar,  setSavedAvatar]  = useState(false);
  const [vista,        setVista]        = useState('perfil');
  const [avatarSection,setAvatarSection]= useState('top');
  const [avatarConfig, setAvatarConfig] = useState(DEFAULT_AVATAR_CONFIG);
  const [imgLoading,   setImgLoading]   = useState(false);

  const [editForm, setEditForm] = useState({
    nombre_completo:'', edad:'', ubicacion:'', preferencias:[], perfil_publico:true,
  });
  const [fotoPreview, setFotoPreview] = useState('');
  const [fotoBase64,  setFotoBase64]  = useState('');

  useEffect(() => { fetchPerfil(); }, []);

  const fetchPerfil = async () => {
    try {
      const r = await axios.get(`${API}/api/me`, { headers:{ Authorization:`Bearer ${token}` } });
      setUserData(r.data);
      setEditForm({
        nombre_completo: r.data.nombre_completo || '',
        edad:            r.data.edad || '',
        ubicacion:       r.data.ubicacion || '',
        preferencias:    r.data.preferencias || [],
        perfil_publico:  r.data.perfil_publico !== false,
      });
      if (r.data.foto_perfil)   { setFotoPreview(r.data.foto_perfil); setFotoBase64(r.data.foto_perfil); }
      if (r.data.avatar_config) setAvatarConfig({ ...DEFAULT_AVATAR_CONFIG, ...r.data.avatar_config });
    } catch {}
    setLoading(false);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2_000_000) { alert('La imagen es demasiado grande (máx 2MB)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setFotoPreview(ev.target.result); setFotoBase64(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const togglePreferencia = (pref) => {
    setEditForm(p => ({
      ...p,
      preferencias: p.preferencias.includes(pref)
        ? p.preferencias.filter(x => x !== pref)
        : p.preferencias.length < 6 ? [...p.preferencias, pref] : p.preferencias,
    }));
  };

  const guardarPerfil = async () => {
    setSaving(true);
    try {
      const payload = { ...editForm };
      if (editForm.edad !== '') payload.edad = parseInt(editForm.edad) || null;
      else payload.edad = null;
      if (fotoBase64) payload.foto_perfil = fotoBase64;
      const r = await axios.put(`${API}/api/me/perfil`, payload, { headers:{ Authorization:`Bearer ${token}` } });
      setUserData(r.data);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (err) { alert(err.response?.data?.detail || 'Error al guardar'); }
    setSaving(false);
  };

  const guardarAvatar = async () => {
    setSavingAvatar(true);
    try {
      await axios.post(`${API}/api/me/avatar`, { avatar_config: avatarConfig }, { headers:{ Authorization:`Bearer ${token}` } });
      setSavedAvatar(true); setTimeout(() => setSavedAvatar(false), 2500);
    } catch (err) { console.error(err); }
    setSavingAvatar(false);
  };

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    @keyframes toastIn{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    .fade-up{animation:fadeUp .3s ease forwards;}
    .stat-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(79,70,229,0.1)!important;}
    .tier-node:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.08)!important;}
    .tab-btn:hover{color:#1e1b4b!important;}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    .skill-row:hover{background:#f8faff!important;}
    .pref-tag:hover{border-color:#a5b4fc!important;}
    .avatar-float{animation:float 3s ease-in-out infinite;}
    .opt-btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.08)!important;}
    .inp-edit:focus{outline:none;border-color:#4f46e5!important;box-shadow:0 0 0 3px rgba(79,70,229,0.1)!important;}
    *{transition:transform .2s ease,box-shadow .2s ease,border-color .15s ease,background .15s ease,color .15s ease;}
  `;

  if (loading) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:36,height:36,border:'3px solid #e2e8f0',borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div>
  );

  const tierActual  = userData?.tier || 1;
  const xp          = userData?.xp || 0;
  const XP_MAX      = [0,500,1500,3000,5000,8000,12000,18000,99999];
  const xpMin       = XP_MAX[tierActual-1] || 0;
  const xpMaxTier   = XP_MAX[tierActual] || 99999;
  const progresoXP  = Math.min(((xp - xpMin) / (xpMaxTier - xpMin)) * 100, 100);
  const tierData    = TIERS_DATA[tierActual - 1];
  const arenaColor  = getArenaColor(userData?.arena);
  const skills      = userData?.skills || {};
  const skillEntries= SKILLS_FULL.map(s => ({ ...s, val: skills?.[s.key] || 0 }));
  const avgSkill    = Math.round(skillEntries.reduce((a,s) => a+s.val, 0) / skillEntries.length * 10) / 10;
  const nombre      = userData?.nombre || '';

  const TABS = [
    {id:'perfil', label:'Mi Perfil'},
    {id:'editar', label:'Editar perfil'},
    {id:'avatar', label:'Avatar'},
    {id:'tiers',  label:'Progression'},
  ];

  const currentAvatarSection = AVATAR_SECTIONS.find(s => s.key === avatarSection);
  const currentAvatarOpts    = AVATAR_OPTS[avatarSection] || [];

  return (
    <>
      <style>{css}</style>

      {saved && (
        <div style={{position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',zIndex:9999,padding:'12px 24px',borderRadius:12,background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',fontSize:14,fontWeight:700,boxShadow:'0 8px 32px rgba(5,150,105,0.35)',animation:'toastIn .3s ease',display:'flex',alignItems:'center',gap:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Perfil guardado correctamente
        </div>
      )}
      {savedAvatar && (
        <div style={{position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',zIndex:9999,padding:'12px 24px',borderRadius:12,background:`linear-gradient(135deg,${ACC},#6366f1)`,color:'#fff',fontSize:14,fontWeight:700,boxShadow:'0 8px 32px rgba(79,70,229,0.35)',animation:'toastIn .3s ease',display:'flex',alignItems:'center',gap:8}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Avatar guardado
        </div>
      )}

      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0f172a'}}>

        {/* NAV */}
        <nav style={{position:'sticky',top:0,zIndex:50,height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',backgroundColor:'rgba(255,255,255,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 12px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:28}}/>
            <span style={{fontSize:15,fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',gap:2}}>
            {[{label:'← Dashboard',path:'/dashboard'},{label:'Training',path:'/training'},{label:'Ranking',path:'/ranking'},{label:'Certificado',path:'/certificado'}].map((item,i)=>(
              <button key={i} className="nav-btn" onClick={()=>navigate(item.path)} style={{padding:'5px 14px',borderRadius:7,background:'none',border:'none',color:'#64748b',fontSize:13,cursor:'pointer'}}>{item.label}</button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{cursor:'pointer'}} onClick={()=>setVista('avatar')}>
              <Avatar name={nombre} avatarConfig={avatarConfig} size={34} foto={fotoPreview}/>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:8,backgroundColor:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <div style={{width:6,height:6,borderRadius:'50%',backgroundColor:'#22c55e',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:13,color:'#374151',fontWeight:500}}>{nombre}</span>
              <span style={{fontSize:11,fontWeight:700,color:arenaColor,background:`${arenaColor}15`,padding:'2px 8px',borderRadius:5}}>{userData?.arena}</span>
            </div>
          </div>
        </nav>

        <div style={{maxWidth:960,margin:'0 auto',padding:'32px 40px 60px'}}>

          {/* TABS */}
          <div style={{display:'flex',marginBottom:28,borderBottom:'1px solid #e8eaf0',gap:2}}>
            {TABS.map(tab=>(
              <button key={tab.id} className="tab-btn" onClick={()=>setVista(tab.id)}
                style={{padding:'10px 20px',background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:600,color:vista===tab.id?'#0f172a':'#94a3b8',borderBottom:vista===tab.id?`2px solid ${ACC}`:'2px solid transparent',marginBottom:-1,display:'flex',alignItems:'center',gap:8}}>
                {tab.id==='avatar'&&<Avatar name={nombre} avatarConfig={avatarConfig} size={18} foto={fotoPreview}/>}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── PERFIL ── */}
          {vista==='perfil' && (
            <div className="fade-up">
              <div style={{padding:'24px 28px',borderRadius:16,backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:14,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{height:3,background:`linear-gradient(90deg,${arenaColor},${ACC})`,borderRadius:4,marginBottom:20}}/>
                <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:20}}>
                  <div style={{position:'relative'}}>
                    <Avatar name={nombre} avatarConfig={avatarConfig} size={88} foto={fotoPreview}/>
                    <button onClick={()=>setVista('avatar')} style={{position:'absolute',bottom:-2,right:-2,width:24,height:24,borderRadius:'50%',backgroundColor:ACC,border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:11}}>✏️</button>
                  </div>
                  <div style={{flex:1}}>
                    <h1 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:2,letterSpacing:'-0.4px'}}>{editForm.nombre_completo||nombre}</h1>
                    {editForm.nombre_completo&&editForm.nombre_completo!==nombre&&<p style={{fontSize:12,color:'#94a3b8',marginBottom:2}}>@{nombre}</p>}
                    <p style={{fontSize:12,color:'#94a3b8',marginBottom:10}}>{userData?.email}</p>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      <span style={{fontSize:11,padding:'3px 9px',borderRadius:6,backgroundColor:`${tierData?.color}12`,color:tierData?.color,fontWeight:700,border:`1px solid ${tierData?.color}25`}}>{tierData?.name}</span>
                      <span style={{fontSize:11,padding:'3px 9px',borderRadius:6,backgroundColor:`${arenaColor}10`,color:arenaColor,fontWeight:700,border:`1px solid ${arenaColor}20`}}>{userData?.arena}</span>
                      <span style={{fontSize:11,padding:'3px 9px',borderRadius:6,backgroundColor:'#f8fafc',color:'#64748b',border:'1px solid #e2e8f0'}}>T{tierActual}/8</span>
                      {editForm.ubicacion&&<span style={{fontSize:11,padding:'3px 9px',borderRadius:6,backgroundColor:'#f0fdf4',color:'#059669',border:'1px solid #bbf7d0'}}>📍 {editForm.ubicacion}</span>}
                    </div>
                  </div>
                </div>
                {editForm.preferencias.length>0&&(
                  <div>
                    <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:8,fontFamily:'monospace'}}>ÁREAS DE INTERÉS</p>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {editForm.preferencias.map((p,i)=><span key={i} style={{fontSize:11,padding:'3px 10px',borderRadius:100,backgroundColor:`${ACC}08`,color:ACC,border:`1px solid ${ACC}20`,fontWeight:600}}>{p}</span>)}
                    </div>
                  </div>
                )}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
                {[
                  {label:'PUNTOS',    val:(userData?.copas||0).toLocaleString(), color:arenaColor},
                  {label:'XP TOTAL', val:(userData?.xp||0).toLocaleString(),    color:ACC},
                  {label:'SESIONES', val:userData?.sesiones_completadas||0,     color:'#059669'},
                  {label:'TIER',     val:tierActual,                            color:tierData?.color},
                ].map((s,i)=>(
                  <div key={i} className="stat-card" style={{padding:'18px 20px',borderRadius:14,backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                    <div style={{height:3,background:`linear-gradient(90deg,${s.color},${s.color}60)`,borderRadius:4,marginBottom:12}}/>
                    <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:8}}>{s.label}</div>
                    <div style={{fontSize:28,fontWeight:900,color:s.color,letterSpacing:'-0.8px',lineHeight:1}}>{s.val}</div>
                  </div>
                ))}
              </div>

              <div style={{padding:'18px 20px',borderRadius:14,backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:tierData?.color}}>{tierData?.name}</span>
                    {tierActual<8&&<span style={{fontSize:12,color:'#94a3b8'}}>→ {TIERS_DATA[tierActual]?.name}</span>}
                  </div>
                  <span style={{fontSize:11,color:'#94a3b8'}}>{xp.toLocaleString()} / {xpMaxTier===99999?'∞':xpMaxTier.toLocaleString()} XP</span>
                </div>
                <div style={{height:8,borderRadius:4,backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                  <div style={{width:`${progresoXP}%`,height:'100%',borderRadius:4,background:`linear-gradient(90deg,${tierData?.color}80,${tierData?.color})`}}/>
                </div>
                {tierActual<8&&<p style={{fontSize:11,color:'#94a3b8',marginTop:6}}>Faltan {(xpMaxTier-xp).toLocaleString()} XP para {TIERS_DATA[tierActual]?.name}</p>}
              </div>

              <div style={{backgroundColor:'#fff',borderRadius:16,border:'1px solid #e8eaf0',overflow:'hidden',boxShadow:'0 2px 10px rgba(0,0,0,.05)',marginBottom:14}}>
                <div style={{padding:'16px 20px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between'}}>
                  <p style={{fontSize:12,fontWeight:700,color:'#0f172a'}}>Skill Matrix</p>
                  <span style={{fontSize:11,color:ACC,fontWeight:700}}>Media: {avgSkill}/10</span>
                </div>
                <div style={{padding:'6px 0'}}>
                  {skillEntries.map((s,i)=>{
                    const pct=Math.min((s.val/10)*100,100);const isWeak=s.val<4;const isTop=s.val>=7;
                    return (
                      <div key={i} className="skill-row" style={{display:'flex',alignItems:'center',gap:14,padding:'11px 20px',borderBottom:i<skillEntries.length-1?'1px solid #f8fafc':'none'}}>
                        <div style={{width:32,height:32,borderRadius:9,backgroundColor:isWeak?'#fef2f2':isTop?'#f0fdf4':`${s.color}10`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${isWeak?'#fecaca':isTop?'#bbf7d0':`${s.color}20`}`,fontSize:13}}>
                          {isWeak?'⚠️':isTop?'✅':'📊'}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                            <span style={{fontSize:12,color:isWeak?'#ef4444':isTop?'#059669':'#374151',fontWeight:600}}>{s.label}</span>
                            <span style={{fontSize:12,fontWeight:800,color:isWeak?'#ef4444':isTop?'#059669':s.color,fontFamily:'monospace'}}>{s.val}/10</span>
                          </div>
                          <div style={{height:6,borderRadius:3,backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                            <div style={{width:`${pct}%`,height:'100%',borderRadius:3,background:isWeak?'linear-gradient(90deg,#fca5a5,#ef4444)':isTop?'linear-gradient(90deg,#86efac,#059669)':`linear-gradient(90deg,${s.color}60,${s.color})`}}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <button onClick={()=>navigate('/sesion')} style={{padding:13,borderRadius:10,background:'linear-gradient(135deg,#2563eb,#3b82f6)',border:'none',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 4px 16px rgba(37,99,235,0.3)'}}>Nueva sesión SOC</button>
                <button onClick={()=>setVista('editar')} style={{padding:13,borderRadius:10,backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#475569',fontSize:13,cursor:'pointer',fontWeight:600}}>Editar perfil</button>
              </div>
            </div>
          )}

          {/* ── EDITAR ── */}
          {vista==='editar' && (
            <div className="fade-up">
              <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:20,alignItems:'start'}}>
                <div style={{padding:'24px',borderRadius:16,backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',textAlign:'center',position:'sticky',top:80}}>
                  <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:16,fontFamily:'monospace'}}>FOTO DE PERFIL</p>
                  <div className="avatar-float" style={{display:'flex',justifyContent:'center',marginBottom:14}}>
                    <Avatar name={nombre} avatarConfig={avatarConfig} size={96} foto={fotoPreview}/>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFotoChange}/>
                  <button onClick={()=>fileRef.current?.click()} style={{width:'100%',padding:10,borderRadius:9,background:`${ACC}10`,border:`1px solid ${ACC}25`,color:ACC,fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:8}}>Subir foto</button>
                  {fotoPreview&&<button onClick={()=>{setFotoPreview('');setFotoBase64('');}} style={{width:'100%',padding:8,borderRadius:9,background:'#fef2f2',border:'1px solid #fecaca',color:'#ef4444',fontSize:12,fontWeight:600,cursor:'pointer',marginBottom:8}}>Eliminar foto</button>}
                  <p style={{fontSize:10,color:'#94a3b8',lineHeight:1.5}}>Máx 2MB · JPG, PNG o WebP</p>
                  <div style={{marginTop:16,padding:12,borderRadius:10,backgroundColor:editForm.perfil_publico?'#ecfdf5':'#f1f5f9',border:`1px solid ${editForm.perfil_publico?'#bbf7d0':'#e2e8f0'}`}}>
                    <p style={{fontSize:11,fontWeight:700,color:editForm.perfil_publico?'#059669':'#64748b',marginBottom:8}}>{editForm.perfil_publico?'Perfil visible para empresas':'Perfil privado'}</p>
                    <button onClick={()=>setEditForm(p=>({...p,perfil_publico:!p.perfil_publico}))} style={{width:'100%',padding:7,borderRadius:7,background:editForm.perfil_publico?'#dcfce7':'#f1f5f9',border:`1px solid ${editForm.perfil_publico?'#86efac':'#e2e8f0'}`,color:editForm.perfil_publico?'#15803d':'#64748b',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                      {editForm.perfil_publico?'Hacer privado':'Hacer público'}
                    </button>
                  </div>
                </div>
                <div style={{padding:'24px',borderRadius:16,backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                  <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:20,fontFamily:'monospace'}}>INFORMACIÓN PERSONAL</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                    <div>
                      <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:6}}>NOMBRE DE USUARIO</label>
                      <input value={nombre} disabled style={{width:'100%',padding:'10px 14px',borderRadius:9,border:'1px solid #e2e8f0',fontSize:13,color:'#94a3b8',backgroundColor:'#f8fafc',cursor:'not-allowed'}}/>
                    </div>
                    <div>
                      <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:6}}>NOMBRE COMPLETO</label>
                      <input className="inp-edit" value={editForm.nombre_completo} onChange={e=>setEditForm(p=>({...p,nombre_completo:e.target.value}))} placeholder="Tu nombre y apellidos" style={{width:'100%',padding:'10px 14px',borderRadius:9,border:'1px solid #e2e8f0',fontSize:13,color:'#0f172a',backgroundColor:'#fff'}}/>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                    <div>
                      <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:6}}>EDAD</label>
                      <input className="inp-edit" type="number" min="14" max="99" value={editForm.edad} onChange={e=>setEditForm(p=>({...p,edad:e.target.value}))} placeholder="Tu edad" style={{width:'100%',padding:'10px 14px',borderRadius:9,border:'1px solid #e2e8f0',fontSize:13,color:'#0f172a',backgroundColor:'#fff'}}/>
                    </div>
                    <div>
                      <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:6}}>UBICACIÓN</label>
                      <input className="inp-edit" value={editForm.ubicacion} onChange={e=>setEditForm(p=>({...p,ubicacion:e.target.value}))} placeholder="Ej: Madrid, España" style={{width:'100%',padding:'10px 14px',borderRadius:9,border:'1px solid #e2e8f0',fontSize:13,color:'#0f172a',backgroundColor:'#fff'}}/>
                    </div>
                  </div>
                  <div style={{marginBottom:20}}>
                    <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:6}}>ÁREAS DE INTERÉS <span style={{color:'#94a3b8',fontWeight:500}}>({editForm.preferencias.length}/6)</span></label>
                    <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                      {PREFERENCIAS_OPTS.map(pref=>{const sel=editForm.preferencias.includes(pref);return(
                        <button key={pref} className="pref-tag" onClick={()=>togglePreferencia(pref)} style={{padding:'5px 12px',borderRadius:100,border:`1px solid ${sel?ACC:'#e2e8f0'}`,backgroundColor:sel?`${ACC}10`:'#fff',color:sel?ACC:'#64748b',fontSize:11,fontWeight:sel?700:500,cursor:'pointer'}}>{pref}</button>
                      );})}
                    </div>
                  </div>
                  <button onClick={guardarPerfil} disabled={saving} style={{width:'100%',padding:14,borderRadius:10,background:saving?'#e2e8f0':`linear-gradient(135deg,${ACC},#6366f1)`,border:'none',color:saving?'#94a3b8':'#fff',fontWeight:700,fontSize:14,cursor:saving?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                    {saving?<><div style={{width:16,height:16,border:'2px solid rgba(0,0,0,0.15)',borderTop:'2px solid #94a3b8',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>Guardando...</>:'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── AVATAR ── */}
          {vista==='avatar' && (
            <div className="fade-up">
              <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:24,alignItems:'start'}}>

                {/* Sidebar preview */}
                <div style={{padding:'28px 24px',borderRadius:20,backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 4px 20px rgba(0,0,0,0.07)',textAlign:'center',position:'sticky',top:80}}>
                  <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:20,fontFamily:'monospace'}}>PREVIEW</p>
                  <div className="avatar-float" style={{display:'flex',justifyContent:'center',marginBottom:16}}>
                    <div style={{width:160,height:160,borderRadius:'50%',overflow:'hidden',border:'3px solid rgba(79,70,229,0.15)',background:'#b6e3f4',position:'relative'}}>
                      {imgLoading&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(182,227,244,0.8)'}}><div style={{width:24,height:24,border:'2px solid rgba(79,70,229,0.2)',borderTop:`2px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>}
                      <img
                        key={JSON.stringify(avatarConfig)}
                        src={buildAvatarUrl(avatarConfig, 200)}
                        alt="avatar preview"
                        width={160} height={160}
                        onLoadStart={()=>setImgLoading(true)}
                        onLoad={()=>setImgLoading(false)}
                        onError={()=>setImgLoading(false)}
                        style={{width:'100%',height:'100%',objectFit:'cover'}}
                      />
                    </div>
                  </div>
                  <p style={{fontSize:15,fontWeight:800,color:'#0f172a',marginBottom:2}}>{nombre}</p>
                  <p style={{fontSize:11,color:'#94a3b8',marginBottom:6}}>{tierData?.name} · {userData?.arena}</p>
                  <p style={{fontSize:10,color:'#94a3b8',marginBottom:16}}>{totalCombinations()} combinaciones posibles</p>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <button onClick={guardarAvatar} disabled={savingAvatar}
                      style={{width:'100%',padding:'12px 0',borderRadius:10,border:'none',background:savedAvatar?'linear-gradient(135deg,#059669,#10b981)':`linear-gradient(135deg,${ACC},#6366f1)`,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 4px 16px ${ACC}30`}}>
                      {savingAvatar?<><div style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.4)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>Guardando...</>:savedAvatar?'✓ Guardado':'Guardar avatar'}
                    </button>
                    <button onClick={()=>setAvatarConfig(randomAvatarConfig())}
                      style={{width:'100%',padding:'10px 0',borderRadius:10,border:'1px solid #e2e8f0',background:'#fff',color:'#374151',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
                      Aleatorio
                    </button>
                    <button onClick={()=>setAvatarConfig(DEFAULT_AVATAR_CONFIG)}
                      style={{width:'100%',padding:'8px 0',borderRadius:10,border:'1px solid #e2e8f0',background:'#fff',color:'#94a3b8',fontSize:12,fontWeight:500,cursor:'pointer'}}>
                      Resetear
                    </button>
                  </div>

                  {/* Mini ranking preview */}
                  <div style={{marginTop:16,padding:12,borderRadius:12,backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',textAlign:'left'}}>
                    <p style={{fontSize:9,color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:8,textAlign:'center'}}>EN EL RANKING</p>
                    <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:8,backgroundColor:'#fff',border:'1px solid #e8eaf0'}}>
                      <Avatar name={nombre} avatarConfig={avatarConfig} size={32} foto={fotoPreview}/>
                      <div style={{flex:1}}>
                        <p style={{fontSize:12,fontWeight:700,color:'#0f172a',marginBottom:1}}>{nombre}</p>
                        <p style={{fontSize:10,color:'#94a3b8'}}>{userData?.arena}</p>
                      </div>
                      <span style={{fontSize:12,fontWeight:800,color:'#d97706'}}>{userData?.copas}</span>
                    </div>
                  </div>
                </div>

                {/* Editor */}
                <div>
                  <div style={{marginBottom:16}}>
                    <h2 style={{fontSize:20,fontWeight:900,color:'#0f172a',letterSpacing:'-0.5px',marginBottom:4}}>Personaliza tu avatar</h2>
                    <p style={{fontSize:13,color:'#64748b',margin:0}}>Más de {totalCombinations()} combinaciones — aparece en tu carta y en el ranking</p>
                  </div>

                  {/* Sección tabs */}
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
                    {AVATAR_SECTIONS.map(s=>(
                      <button key={s.key} onClick={()=>setAvatarSection(s.key)}
                        style={{padding:'6px 13px',borderRadius:8,border:`1px solid ${avatarSection===s.key?ACC:'#e2e8f0'}`,background:avatarSection===s.key?ACC:'#fff',color:avatarSection===s.key?'#fff':'#64748b',fontSize:11,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Opciones */}
                  <div style={{background:'#fff',borderRadius:16,border:'1px solid #e8eaf0',padding:'18px 20px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',minHeight:180}}>
                    <p style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:2,textTransform:'uppercase',marginBottom:14}}>
                      {currentAvatarSection?.label} — {currentAvatarOpts.length} opciones
                    </p>
                    {currentAvatarSection?.type === 'color' ? (
                      <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                        {currentAvatarOpts.map(opt=>{
                          const isSel = avatarConfig[avatarSection] === opt.id;
                          return (
                            <div key={opt.id} className="opt-btn" onClick={()=>setAvatarConfig(c=>({...c,[avatarSection]:opt.id}))}
                              style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,padding:'8px 10px',borderRadius:10,border:`2px solid ${isSel?ACC:'#e2e8f0'}`,background:isSel?'#f0f4ff':'#fafafa',cursor:'pointer',minWidth:58}}>
                              <div style={{width:26,height:26,borderRadius:'50%',background:opt.hex,border:'2px solid rgba(0,0,0,0.08)',boxShadow:isSel?`0 0 0 3px ${ACC}40`:''}}/>
                              <span style={{fontSize:10,color:isSel?ACC:'#64748b',fontWeight:isSel?700:400,whiteSpace:'nowrap'}}>{opt.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:8}}>
                        {currentAvatarOpts.map(opt=>{
                          const isSel = avatarConfig[avatarSection] === opt.id;
                          return (
                            <div key={opt.id} className="opt-btn" onClick={()=>setAvatarConfig(c=>({...c,[avatarSection]:opt.id}))}
                              style={{padding:'10px 12px',borderRadius:10,border:`2px solid ${isSel?ACC:'#e2e8f0'}`,background:isSel?'#f0f4ff':'#fafafa',textAlign:'center',cursor:'pointer',userSelect:'none'}}>
                              <span style={{fontSize:12,color:isSel?ACC:'#374151',fontWeight:isSel?700:500}}>{opt.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Config actual */}
                  <div style={{marginTop:12,padding:'12px 16px',borderRadius:12,background:'#fff',border:'1px solid #e8eaf0'}}>
                    <p style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>Configuración actual</p>
                    <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                      {AVATAR_SECTIONS.map(s=>{
                        const opts   = AVATAR_OPTS[s.key] || [];
                        const selOpt = opts.find(o => o.id === avatarConfig[s.key]);
                        return (
                          <div key={s.key} onClick={()=>setAvatarSection(s.key)}
                            style={{display:'flex',alignItems:'center',gap:5,padding:'3px 9px',borderRadius:7,background:avatarSection===s.key?'#f0f4ff':'#f8fafc',border:`1px solid ${avatarSection===s.key?'#c7d2fe':'#e2e8f0'}`,cursor:'pointer'}}>
                            {selOpt?.hex&&<div style={{width:7,height:7,borderRadius:'50%',background:selOpt.hex,flexShrink:0}}/>}
                            <span style={{fontSize:10,color:'#94a3b8'}}>{s.label}:</span>
                            <span style={{fontSize:10,fontWeight:600,color:'#374151'}}>{selOpt?.label||'—'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TIERS ── */}
          {vista==='tiers' && (
            <div className="fade-up">
              <div style={{marginBottom:20}}>
                <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:4,letterSpacing:'-0.5px'}}>Progression Map</h2>
                <p style={{fontSize:12,color:'#94a3b8'}}>{tierActual}/8 tiers desbloqueados</p>
              </div>
              <div style={{padding:'16px 20px',borderRadius:12,backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontSize:12,color:'#94a3b8'}}>Progreso global</span>
                  <span style={{fontSize:12,color:ACC,fontWeight:700}}>{Math.round(((tierActual-1)/7)*100)}%</span>
                </div>
                <div style={{display:'flex',gap:3}}>
                  {TIERS_DATA.map((t,i)=><div key={i} style={{flex:1,height:6,borderRadius:2,backgroundColor:i<tierActual?t.color:'#e2e8f0'}}/>)}
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {TIERS_DATA.map((t,i)=>{
                  const esActual=t.tier===tierActual;const desbloqueado=t.tier<=tierActual;const completado=t.tier<tierActual;
                  return (
                    <div key={i} className="tier-node" style={{padding:'18px 20px',borderRadius:12,backgroundColor:esActual?`${t.color}06`:'#fff',border:esActual?`2px solid ${t.color}30`:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.05)',opacity:!desbloqueado?.4:1}}>
                      {esActual&&<div style={{height:2,background:`linear-gradient(90deg,${t.color},${t.color}40)`,borderRadius:4,marginBottom:12}}/>}
                      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                        <div style={{width:36,height:36,borderRadius:9,backgroundColor:completado?'#ecfdf5':esActual?`${t.color}12`:'#f8fafc',border:`1px solid ${completado?'#86efac30':esActual?t.color+'25':'#e2e8f0'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          {completado?<span style={{color:'#22c55e',fontSize:14}}>✓</span>:<span style={{fontSize:13,fontWeight:900,color:desbloqueado?t.color:'#cbd5e1'}}>{t.tier}</span>}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                            <span style={{fontSize:14,fontWeight:700,color:desbloqueado?t.color:'#cbd5e1'}}>{t.name}</span>
                            {esActual&&<span style={{fontSize:9,padding:'2px 7px',borderRadius:4,backgroundColor:`${t.color}12`,color:t.color,fontWeight:700}}>ACTUAL</span>}
                          </div>
                          <span style={{fontSize:11,color:'#94a3b8'}}>{t.xp} — {t.xpMax} XP</span>
                        </div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:4,justifyContent:'flex-end'}}>
                          {t.skills.map((sk,j)=><span key={j} style={{fontSize:10,padding:'2px 7px',borderRadius:4,backgroundColor:desbloqueado?`${t.color}08`:'#f8fafc',color:desbloqueado?t.color:'#cbd5e1',border:`1px solid ${desbloqueado?t.color+'15':'#e2e8f0'}`}}>{sk}</span>)}
                        </div>
                      </div>
                      <p style={{fontSize:12,color:desbloqueado?'#64748b':'#cbd5e1',lineHeight:1.6,marginBottom:esActual?10:0}}>{t.desc}</p>
                      {esActual&&(
                        <div>
                          <div style={{height:4,borderRadius:2,backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                            <div style={{width:`${progresoXP}%`,height:'100%',borderRadius:2,backgroundColor:t.color}}/>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
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
    </>
  );
}