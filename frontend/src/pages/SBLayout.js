// ═══════════════════════════════════════════════════════════
// SBLayout.js — Componentes compartidos SocBlast
// ═══════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { useNavigate } from 'react-router-dom';

export const ACC      = '#4f46e5';
export const BG       = 'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)';
export const CARD     = '#ffffff';
export const BORDER   = '1px solid #e8eaf0';
export const SHADOW   = '0 2px 16px rgba(79,70,229,0.07)';

export const ARENA_COLORS = {
  bronce:   { main:'#d97706', light:'#fef3c7', border:'#fcd34d', glow:'rgba(217,119,6,0.15)'   },
  plata:    { main:'#64748b', light:'#f1f5f9', border:'#cbd5e1', glow:'rgba(100,116,139,0.1)'  },
  oro:      { main:'#b45309', light:'#fffbeb', border:'#fde68a', glow:'rgba(180,83,9,0.15)'    },
  diamante: { main:'#4f46e5', light:'#eff6ff', border:'#c7d2fe', glow:'rgba(79,70,229,0.15)'   },
};

export const TIERS    = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
export const TIER_CLR = ['','#64748b','#4f46e5','#0891b2','#059669','#d97706','#ea580c','#dc2626','#8b5cf6'];

export const ARENAS_CONFIG = [
  {id:'bronce3',  name:'Bronce III',  tier:'bronce',   min:0,    max:299  },
  {id:'bronce2',  name:'Bronce II',   tier:'bronce',   min:300,  max:599  },
  {id:'bronce1',  name:'Bronce I',    tier:'bronce',   min:600,  max:899  },
  {id:'plata3',   name:'Plata III',   tier:'plata',    min:900,  max:1199 },
  {id:'plata2',   name:'Plata II',    tier:'plata',    min:1200, max:1499 },
  {id:'plata1',   name:'Plata I',     tier:'plata',    min:1500, max:1799 },
  {id:'oro3',     name:'Oro III',     tier:'oro',      min:1800, max:2099 },
  {id:'oro2',     name:'Oro II',      tier:'oro',      min:2100, max:2399 },
  {id:'oro1',     name:'Oro I',       tier:'oro',      min:2400, max:2699 },
  {id:'diamante3',name:'Diamante III',tier:'diamante', min:2700, max:2999 },
  {id:'diamante2',name:'Diamante II', tier:'diamante', min:3000, max:3299 },
  {id:'diamante1',name:'Diamante I',  tier:'diamante', min:3300, max:99999},
];

export function getArenaFromPuntos(p) {
  return ARENAS_CONFIG.find(a => p >= a.min && p <= a.max) || ARENAS_CONFIG[0];
}
export function getArenaGroup(arena) {
  if (!arena) return 'bronce';
  const a = arena.toLowerCase();
  if (a.includes('diamante')) return 'diamante';
  if (a.includes('oro'))      return 'oro';
  if (a.includes('plata'))    return 'plata';
  return 'bronce';
}

// ── Avatar ────────────────────────────────────────────────
const DEFAULT_AVATAR_CONFIG = {
  top:'shortFlat', hairColor:'2c1b18', accessories:'blank', accessoriesColor:'262e33',
  facialHair:'blank', facialHairColor:'2c1b18', clothe:'hoodie', clotheColor:'262e33',
  skin:'edb98a', eyes:'default', eyebrow:'default', mouth:'default', hatColor:'262e33',
};
// ── Avatar con @dicebear/core v9 ─────────────────────────────────────────────
// Keys correctas según schema real de avataaars v9
const TOP_MAP = {
  shortFlat:'shortFlat', shortRound:'shortRound', shortWaved:'shortWaved',
  dreads01:'dreads01', straight01:'straight01', curly:'curly',
  bun:'bun', bob:'bob', fro:'fro', frizzle:'frizzle',
  hat:'hat', hijab:'hijab', turban:'turban',
  winterHat1:'winterHat1', shaggy:'shaggy',
};

export function buildAvatarUrl(config={}, size=120) {
  const c       = {...DEFAULT_AVATAR_CONFIG,...config};
  const top     = TOP_MAP[c.top] || c.top;
  const skinHex = c.skin.replace('#','');
  const hairHex = c.hairColor.replace('#','');
  const clthHex = c.clotheColor.replace('#','');
  const fhHex   = (c.facialHairColor||'2c1b18').replace('#','');
  const hasFH   = c.facialHair && c.facialHair !== 'blank';
  const hasAcc  = c.accessories && c.accessories !== 'blank';
  try {
    const hatHex = (c.hatColor||'262e33').replace('#','');
    const accHex = (c.accessoriesColor||'262e33').replace('#','');
    const opts = {
      size,
      seed:                    [top,hairHex,skinHex,c.eyes,c.eyebrow,c.mouth,c.clothe,clthHex,hatHex,accHex].join('-'),
      backgroundColor:         ['b6e3f4'],
      top:                     [top],
      hairColor:               [hairHex],
      skinColor:               [skinHex],
      eyes:                    [c.eyes],
      eyebrows:                [c.eyebrow],
      mouth:                   [c.mouth],
      clothing:                [c.clothe],
      clothesColor:            [clthHex],
      hatColor:                [hatHex],
      facialHairProbability:   hasFH ? 100 : 0,
      accessoriesProbability:  hasAcc ? 100 : 0,
    };
    if (hasFH)  { opts.facialHair = [c.facialHair]; opts.facialHairColor = [fhHex]; }
    if (hasAcc) { opts.accessories = [c.accessories]; opts.accessoriesColor = [accHex]; }
    const avatar = createAvatar(avataaars, opts);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(avatar.toString());
  } catch(e) {
    console.error('Avatar error:', e.message);
    return null;
  }
}


export function AvatarCircle({name='', avatarConfig=null, size=72, foto='', color=ACC}) {
  const [loaded, setLoaded] = useState(false);
  if (foto) return (
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',border:'3px solid #fff',boxShadow:`0 0 0 2px ${color}30`}}>
      <img src={foto} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    </div>
  );
  if (avatarConfig) return (
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',border:'3px solid #fff',boxShadow:`0 0 0 2px ${color}30`,background:'#b6e3f4',position:'relative'}}>
      {!loaded && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:size*.28,height:size*.28,border:`2px solid ${color}30`,borderTop:`2px solid ${color}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>}
      <img key={JSON.stringify(avatarConfig)} src={buildAvatarUrl(avatarConfig,size*2)} alt={name} width={size} height={size}
        onLoad={()=>setLoaded(true)} onError={()=>setLoaded(true)}
        style={{width:'100%',height:'100%',objectFit:'cover',opacity:loaded?1:0,transition:'opacity .3s'}}/>
    </div>
  );
  const initials = name.trim().split(' ').map(w=>w[0]?.toUpperCase()||'').slice(0,2).join('');
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:`linear-gradient(135deg,${color},${color}cc)`,display:'flex',alignItems:'center',justifyContent:'center',border:'3px solid #fff',boxShadow:`0 0 0 2px ${color}30`}}>
      <span style={{fontSize:size*.34,fontWeight:700,color:'#fff'}}>{initials||'?'}</span>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────
const IC = {
  bolt:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  flask:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>,
  award:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  user:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  users:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chart:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  book:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  shield: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  home:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  trend:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  fire:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  target: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  check:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  clock:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  arrow:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  brain:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
};

export function Icon({name, size=15, color='currentColor'}) {
  return (
    <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',color,width:size,height:size,flexShrink:0}}>
      {React.cloneElement(IC[name]||IC.target,{width:size,height:size})}
    </span>
  );
}

// ── Navbar compartido ─────────────────────────────────────
export function SBNav({user, avatarConfig, foto, activePage='', extra=null}) {
  const navigate = useNavigate();
  const navItems = [
    {l:'Inicio',       i:'home',   p:'/dashboard'},
    {l:'Arenas',       i:'target', p:'/arenas'},
    {l:'Ranking',      i:'chart',  p:'/ranking'},
    {l:'Training',     i:'book',   p:'/training'},
    {l:'Certificado',  i:'award',  p:'/certificado'},
    {l:'Perfil',       i:'user',   p:'/perfil'},
  ];
  return (
    <nav style={{
      position:'sticky', top:0, zIndex:50,
      height:56, display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 40px',
      background:'rgba(255,255,255,0.92)',
      backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)',
      borderBottom:'1px solid #e8eaf0',
      boxShadow:'0 1px 20px rgba(79,70,229,0.08)',
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
    }}>
      {/* Logo */}
      <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',flexShrink:0}} onClick={()=>navigate('/')}>
        <img src="/logosoc.png" alt="SocBlast" style={{height:28}}/>
        <span style={{fontSize:16,fontWeight:900,color:'#0f172a',letterSpacing:'-0.4px'}}>
          Soc<span style={{color:ACC}}>Blast</span>
        </span>
      </div>

      {/* Nav links */}
      <div style={{display:'flex',gap:0,alignItems:'center'}}>
        {navItems.map((item,i) => {
          const isActive = activePage===item.p || activePage===item.l;
          return (
            <button key={i} onClick={()=>navigate(item.p)} style={{
              padding:'7px 13px', borderRadius:9,
              background: isActive ? `${ACC}0d` : 'none',
              border:'none',
              color: isActive ? ACC : '#64748b',
              fontSize:13, fontWeight: isActive ? 700 : 500,
              cursor:'pointer',
              display:'flex', alignItems:'center', gap:6,
              transition:'all .15s',
            }}
            onMouseEnter={e=>{if(!isActive){e.currentTarget.style.background=`${ACC}08`;e.currentTarget.style.color=ACC;}}}
            onMouseLeave={e=>{if(!isActive){e.currentTarget.style.background='none';e.currentTarget.style.color='#64748b';}}}>
              <Icon name={item.i} size={15} color={isActive?ACC:'#64748b'}/>
              {item.l}
            </button>
          );
        })}
        <div style={{width:1,height:26,background:'#e8eaf0',margin:'0 6px'}}/>
        <button onClick={()=>navigate('/sesion')} style={{padding:'7px 13px',borderRadius:9,background:'none',border:'none',color:ACC,fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}
          onMouseEnter={e=>{e.currentTarget.style.background=`${ACC}0d`;}}
          onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
          <Icon name="bolt" size={15} color={ACC}/>Sesiones
        </button>
        <button onClick={()=>navigate('/lab')} style={{padding:'7px 13px',borderRadius:9,background:'none',border:'none',color:'#059669',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(5,150,105,0.06)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
          <Icon name="flask" size={15} color="#059669"/>Labs
        </button>
      </div>

      {/* User */}
      <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',flexShrink:0}} onClick={()=>navigate('/perfil')}>
        <AvatarCircle name={user?.nombre} avatarConfig={avatarConfig} size={32} foto={foto}/>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:'#0f172a',lineHeight:1.2}}>{user?.nombre}</div>
          <div style={{fontSize:10,color:'#94a3b8',lineHeight:1.2}}>Mi perfil</div>
        </div>
        {extra}
      </div>
    </nav>
  );
}

// ── CSS base compartido ───────────────────────────────────
export const BASE_CSS = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:none;}}
  @keyframes toastIn{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}
  .fu{animation:fadeUp .35s ease forwards;}
  .s1{animation:fadeUp .35s ease .07s both;}
  .s2{animation:fadeUp .35s ease .14s both;}
  .s3{animation:fadeUp .35s ease .21s both;}
  .sb-card{background:#fff;border:1px solid #e8eaf0;border-radius:16px;box-shadow:0 2px 16px rgba(79,70,229,0.06);}
  .sb-card-sm{background:#fff;border:1px solid #e8eaf0;border-radius:12px;box-shadow:0 1px 8px rgba(79,70,229,0.05);}
  .sb-btn-primary{background:linear-gradient(135deg,#4f46e5,#6366f1);border:none;color:#fff;font-weight:700;cursor:pointer;border-radius:100px;transition:all .2s;}
  .sb-btn-primary:hover{opacity:.88;transform:translateY(-1px);box-shadow:0 6px 20px rgba(79,70,229,0.3);}
  .sb-btn-outline{background:#fff;border:1.5px solid #4f46e5;color:#4f46e5;font-weight:600;cursor:pointer;border-radius:100px;transition:all .15s;}
  .sb-btn-outline:hover{background:#f5f3ff;}
  .sb-hover:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(79,70,229,0.12)!important;}
  .sb-row:hover{background:#f8f7ff!important;border-color:#c7d2fe!important;}
  *{box-sizing:border-box;}
`;

// ── Spinner ───────────────────────────────────────────────
export function SBSpinner() {
  return (
    <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{textAlign:'center'}}>
        <div style={{width:40,height:40,border:'3px solid #e2e8f0',borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 16px'}}/>
        <p style={{color:'#94a3b8',fontSize:13,fontFamily:'system-ui'}}>Cargando...</p>
      </div>
    </div>
  );
}