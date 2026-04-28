import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';
const ACC = '#4f46e5';
const F = `'Rajdhani','Arial Narrow','Impact',sans-serif`;

const SKILL_ABBR = [
  { key:'analisis_logs',           abbr:'LOG', label:'Análisis de Logs'     },
  { key:'deteccion_amenazas',      abbr:'DET', label:'Detección Amenazas'   },
  { key:'respuesta_incidentes',    abbr:'RSP', label:'Respuesta Incidentes' },
  { key:'threat_hunting',          abbr:'THR', label:'Threat Hunting'       },
  { key:'forense_digital',         abbr:'FOR', label:'Forense Digital'      },
  { key:'gestion_vulnerabilidades',abbr:'VUL', label:'Gestión de Vulns'     },
  { key:'inteligencia_amenazas',   abbr:'INT', label:'Intel. Amenazas'      },
  { key:'siem_queries',            abbr:'SIE', label:'SIEM & Queries'       },
];

const ARENA_COLORS = {
  bronce:   { main:'#d97706', light:'#fef3c7', mid:'#fbbf24', border:'#fcd34d' },
  plata:    { main:'#64748b', light:'#f1f5f9', mid:'#94a3b8', border:'#cbd5e1' },
  oro:      { main:'#b45309', light:'#fffbeb', mid:'#f59e0b', border:'#fcd34d' },
  diamante: { main:'#1d4ed8', light:'#eff6ff', mid:'#3b82f6', border:'#93c5fd' },
};

const TIERS    = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const TIER_CLR = ['','#64748b','#3b82f6','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444','#8b5cf6'];

const ARENAS_CONFIG = [
  { id:'bronce3',  name:'Bronce III',  tier:'bronce',   min:0,    max:299   },
  { id:'bronce2',  name:'Bronce II',   tier:'bronce',   min:300,  max:599   },
  { id:'bronce1',  name:'Bronce I',    tier:'bronce',   min:600,  max:899   },
  { id:'plata3',   name:'Plata III',   tier:'plata',    min:900,  max:1199  },
  { id:'plata2',   name:'Plata II',    tier:'plata',    min:1200, max:1499  },
  { id:'plata1',   name:'Plata I',     tier:'plata',    min:1500, max:1799  },
  { id:'oro3',     name:'Oro III',     tier:'oro',      min:1800, max:2099  },
  { id:'oro2',     name:'Oro II',      tier:'oro',      min:2100, max:2399  },
  { id:'oro1',     name:'Oro I',       tier:'oro',      min:2400, max:2699  },
  { id:'diamante3',name:'Diamante III',tier:'diamante', min:2700, max:2999  },
  { id:'diamante2',name:'Diamante II', tier:'diamante', min:3000, max:3299  },
  { id:'diamante1',name:'Diamante I',  tier:'diamante', min:3300, max:99999 },
];

const getArenaFromCopas = c => ARENAS_CONFIG.find(a => c >= a.min && c <= a.max) || ARENAS_CONFIG[0];
function getArenaGroup(arena) {
  if (!arena) return 'bronce';
  const a = arena.toLowerCase();
  if (a.includes('diamante')) return 'diamante';
  if (a.includes('oro'))      return 'oro';
  if (a.includes('plata'))    return 'plata';
  return 'bronce';
}
function calcOVR(skills) {
  const vals = SKILL_ABBR.map(s => Math.round((skills?.[s.key] || 0) * 10));
  return Math.max(50, Math.round(vals.reduce((a,b)=>a+b,0)/vals.length));
}

const DEFAULT_AVATAR_CONFIG = {
  top:'shortFlat', hairColor:'2c1b18', accessories:'blank',
  facialHair:'blank', facialHairColor:'2c1b18', clothe:'hoodie',
  clotheColor:'262e33', skin:'edb98a', eyes:'default', eyebrow:'default', mouth:'default',
};
function buildAvatarUrl(config={}, size=120) {
  const c = {...DEFAULT_AVATAR_CONFIG,...config};
  const seed = `${c.top}-${c.hairColor}-${c.clothe}-${c.clotheColor}-${c.skin}-${c.eyes}-${c.eyebrow}-${c.mouth}-${c.accessories}-${c.facialHair}-${c.facialHairColor}`;
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4&size=${size}`;
}

function AvatarCircle({name='',avatarConfig=null,size=72,foto='',color='#4f46e5'}) {
  const [loaded,setLoaded]=useState(false);
  const key=avatarConfig?JSON.stringify(avatarConfig):'';
  if(foto)return(<div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',border:`3px solid #fff`,boxShadow:`0 0 0 2px ${color}30`}}><img src={foto} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>);
  if(avatarConfig)return(
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',border:`3px solid #fff`,boxShadow:`0 0 0 2px ${color}30`,background:'#e0f2fe',position:'relative'}}>
      {!loaded&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#e0f2fe'}}><div style={{width:size*.28,height:size*.28,border:`2px solid ${color}30`,borderTop:`2px solid ${color}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>}
      <img key={key} src={buildAvatarUrl(avatarConfig,size*2)} alt={name} width={size} height={size} onLoad={()=>setLoaded(true)} onError={()=>setLoaded(true)} style={{width:'100%',height:'100%',objectFit:'cover',opacity:loaded?1:0,transition:'opacity .3s'}}/>
    </div>
  );
  const initials=name.trim().split(' ').map(w=>w[0]?.toUpperCase()||'').slice(0,2).join('');
  return(<div style={{width:size,height:size,borderRadius:'50%',background:`linear-gradient(135deg,${color},${color}cc)`,display:'flex',alignItems:'center',justifyContent:'center',border:`3px solid #fff`,boxShadow:`0 0 0 2px ${color}30`}}><span style={{fontSize:size*.34,fontWeight:800,color:'#fff',fontFamily:F}}>{initials||'?'}</span></div>);
}

function MiniArenas({copas,arenaActual}) {
  const grupos=[
    {label:'B',tier:'bronce',  ids:['bronce3','bronce2','bronce1'],  color:'#d97706'},
    {label:'P',tier:'plata',   ids:['plata3','plata2','plata1'],     color:'#64748b'},
    {label:'O',tier:'oro',     ids:['oro3','oro2','oro1'],           color:'#b45309'},
    {label:'D',tier:'diamante',ids:['diamante3','diamante2','diamante1'],color:'#1d4ed8'},
  ];
  const currentIdx=ARENAS_CONFIG.findIndex(a=>a.id===arenaActual.id);
  return(
    <div style={{display:'flex',alignItems:'center',gap:5}}>
      {grupos.map((g,gi)=>{
        const isCG=arenaActual.tier===g.tier;
        return(<div key={gi} style={{display:'flex',alignItems:'center',gap:2}}>
          <span style={{fontSize:9,fontWeight:700,color:isCG?g.color:'#94a3b8',letterSpacing:1,width:9}}>{g.label}</span>
          <div style={{display:'flex',gap:2}}>
            {g.ids.map(id=>{const aIdx=ARENAS_CONFIG.findIndex(a=>a.id===id);const done=aIdx<currentIdx,current=aIdx===currentIdx;return <div key={id} style={{width:current?13:6,height:6,borderRadius:3,background:done?g.color:current?g.color:`${g.color}20`,border:current?`1px solid ${g.color}`:'none',transition:'all .3s'}}/>;
            })}
          </div>
          {gi<grupos.length-1&&<div style={{width:3,height:1,background:'#e2e8f0',marginLeft:1}}/>}
        </div>);
      })}
    </div>
  );
}

const ActivityHeatmap=({historial})=>{
  const days=90,today=new Date();
  const cells=Array.from({length:days},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-(days-1-i));const ds=d.toISOString().split('T')[0];return{date:d,count:historial.filter(s=>new Date(s.inicio*1000).toISOString().split('T')[0]===ds).length};});
  const weeks=[];for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));
  const gc=c=>c===0?'#f1f5f9':c===1?'#c7d2fe':c===2?'#818cf8':'#4f46e5';
  return(<div style={{display:'flex',gap:'3px'}}>{weeks.map((wk,wi)=>(<div key={wi} style={{display:'flex',flexDirection:'column',gap:'3px'}}>{wk.map((d,di)=>(<div key={di} title={`${d.date.toLocaleDateString('es-ES')} · ${d.count}`} style={{width:'10px',height:'10px',borderRadius:'2px',backgroundColor:gc(d.count),cursor:'default',transition:'transform .15s'}} onMouseEnter={e=>e.target.style.transform='scale(1.4)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}/>))}</div>))}</div>);
};
const calcStreak=hist=>{if(!hist.length)return 0;const dates=[...new Set(hist.map(s=>new Date(s.inicio*1000).toISOString().split('T')[0]))].sort().reverse();let streak=0,cur=new Date();for(const d of dates){const diff=Math.floor((cur-new Date(d))/86400000);if(diff<=1){streak++;cur=new Date(d);}else break;}return streak;};

const IC={
  cup:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  flask:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>,
  bolt:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  shield:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  target:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  trend:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  book:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  award:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  user:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  users:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chart:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  planet:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="7"/><path d="M3 12c0 0 5-8 18 0"/><path d="M3 12c0 0 5 8 18 0"/></svg>,
  fire:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  clock:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  brain:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  arrowRight:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  checkCircle:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
};
const Icon=({name,size=15,color='currentColor'})=>(<span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',color,width:size,height:size,flexShrink:0}}>{React.cloneElement(IC[name]||IC.target,{width:size,height:size})}</span>);

function ComingSoon({title,desc,icon,color='#4f46e5'}){
  return(<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'56px 32px',textAlign:'center',background:'#fafafa',borderRadius:16,border:'1px dashed #e2e8f0',minHeight:260}}>
    <div style={{width:56,height:56,borderRadius:16,background:`${color}08`,border:`1px solid ${color}18`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}><Icon name={icon} size={24} color={color}/></div>
    <div style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 12px',borderRadius:100,background:`${color}08`,border:`1px solid ${color}20`,marginBottom:12}}><Icon name="clock" size={10} color={color}/><span style={{fontSize:10,fontWeight:700,color,letterSpacing:'1px'}}>PRÓXIMAMENTE</span></div>
    <h3 style={{fontSize:16,fontWeight:700,color:'#0f172a',marginBottom:6}}>{title}</h3>
    <p style={{fontSize:13,color:'#64748b',lineHeight:1.6,maxWidth:340}}>{desc}</p>
  </div>);
}

/* ══ ANALYST PROFILE CARD — estilo plataforma profesional ══ */
function AnalystProfileCard({nombre,tier,skills,copas,arena,xp,sesiones,avatarConfig,foto,onViewCard,onEdit}) {
  const group   = getArenaGroup(arena);
  const ac      = ARENA_COLORS[group];
  const ovr     = calcOVR(skills);
  const tierColor = TIER_CLR[tier]||'#64748b';
  const skillVals = SKILL_ABBR.map(s=>({...s,val:Math.max(0,Math.round((skills?.[s.key]||0)*10))}));
  const topSkills = [...skillVals].sort((a,b)=>b.val-a.val).slice(0,4);
  const XP_MAX  = [0,500,1500,3000,5000,8000,12000,18000,99999];
  const xpMin   = XP_MAX[tier-1]||0, xpMax=XP_MAX[tier]||99999;
  const pctXP   = Math.min(((xp-xpMin)/(xpMax-xpMin))*100,100);

  return(
    <div style={{borderRadius:20,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 4px 24px rgba(0,0,0,0.07)',overflow:'hidden'}}>
      {/* Accent bar top — color del arena */}
      <div style={{height:4,background:`linear-gradient(90deg,${ac.main},${ac.mid})`}}/>

      <div style={{padding:'28px 32px',display:'grid',gridTemplateColumns:'auto 1fr auto',gap:32,alignItems:'start'}}>

        {/* Columna izquierda: avatar + nombre */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,minWidth:120}}>
          <div style={{position:'relative'}}>
            <AvatarCircle name={nombre} avatarConfig={avatarConfig} size={88} foto={foto} color={ac.main}/>
            {/* OVR badge */}
            <div style={{position:'absolute',bottom:-4,right:-4,padding:'2px 8px',borderRadius:100,background:ac.main,border:'2px solid #fff',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>
              <span style={{fontFamily:F,fontSize:12,fontWeight:700,color:'#fff',letterSpacing:.5}}>{ovr}</span>
            </div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:15,fontWeight:800,color:'#0f172a',marginBottom:2,letterSpacing:'-0.3px'}}>{nombre?.split(' ')[0]||'Analyst'}</div>
            <div style={{fontSize:11,fontWeight:600,color:tierColor,letterSpacing:.5}}>{TIERS[tier]||'SOC Rookie'}</div>
          </div>
          {/* Arena pill */}
          <div style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 12px',borderRadius:100,background:ac.light,border:`1px solid ${ac.border}`}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:ac.main}}/>
            <span style={{fontSize:11,fontWeight:700,color:ac.main}}>{arena}</span>
          </div>
        </div>

        {/* Columna central: stats + skills + XP */}
        <div>
          {/* Stats row */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:22}}>
            {[
              {val:ovr,                       label:'OVR',      color:ac.main,   bg:ac.light,  border:ac.border},
              {val:copas.toLocaleString(),    label:'Copas',    color:'#d97706', bg:'#fef3c7', border:'#fcd34d'},
              {val:sesiones,                  label:'Sesiones', color:ACC,       bg:'#eef2ff', border:'#c7d2fe'},
              {val:xp.toLocaleString(),       label:'XP',       color:tierColor, bg:`${tierColor}10`, border:`${tierColor}25`},
            ].map((s,i)=>(
              <div key={i} style={{padding:'12px 14px',borderRadius:12,background:s.bg,border:`1px solid ${s.border}`,textAlign:'center'}}>
                <div style={{fontFamily:F,fontSize:24,fontWeight:700,color:s.color,lineHeight:1,letterSpacing:-1}}>{s.val}</div>
                <div style={{fontSize:10,fontWeight:600,color:'#94a3b8',letterSpacing:1,marginTop:3,textTransform:'uppercase'}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Top skills */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:2,marginBottom:10,textTransform:'uppercase'}}>Top Skills</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 24px'}}>
              {topSkills.map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:9,fontWeight:700,color:'#94a3b8',letterSpacing:1.5,width:24,flexShrink:0}}>{s.abbr}</span>
                  <div style={{flex:1,height:5,borderRadius:3,background:'#f1f5f9',overflow:'hidden'}}>
                    <div style={{width:`${s.val}%`,height:'100%',borderRadius:3,background:`linear-gradient(90deg,${ac.main}70,${ac.main})`,transition:'width 1.2s ease'}}/>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:'#374151',fontFamily:'monospace',width:20,textAlign:'right',flexShrink:0}}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* XP progress */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
              <span style={{fontSize:11,fontWeight:600,color:tierColor}}>{TIERS[tier]}</span>
              {tier<8&&<span style={{fontSize:11,color:'#94a3b8'}}>→ {TIERS[tier+1]}</span>}
              <span style={{fontSize:10,color:'#94a3b8',fontFamily:'monospace'}}>{xp.toLocaleString()} XP</span>
            </div>
            <div style={{height:6,borderRadius:3,background:'#f1f5f9',overflow:'hidden'}}>
              <div style={{width:`${pctXP}%`,height:'100%',borderRadius:3,background:`linear-gradient(90deg,${tierColor}80,${tierColor})`,transition:'width 1.2s ease'}}/>
            </div>
          </div>
        </div>

        {/* Columna derecha: CTAs */}
        <div style={{display:'flex',flexDirection:'column',gap:8,minWidth:160}}>
          <button onClick={onViewCard} style={{padding:'11px 16px',borderRadius:10,background:ACC,border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,boxShadow:`0 4px 14px ${ACC}30`}}>
            <Icon name="award" size={13} color="#fff"/> Analyst Card
          </button>
          <button onClick={onEdit} style={{padding:'10px 16px',borderRadius:10,background:'#f8fafc',border:'1px solid #e2e8f0',color:'#374151',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:7}}>
            <Icon name="user" size={13} color="#64748b"/> Editar perfil
          </button>
          <div style={{marginTop:4,padding:'10px 12px',borderRadius:9,background:'#f0fdf4',border:'1px solid #bbf7d0',display:'flex',alignItems:'center',gap:7}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',animation:'pulse 2s infinite',flexShrink:0}}/>
            <span style={{fontSize:11,color:'#15803d',fontWeight:600}}>Online · Activo</span>
          </div>
          <div style={{marginTop:2,padding:'10px 12px',borderRadius:9,background:'#f8fafc',border:'1px solid #e2e8f0'}}>
            <div style={{fontSize:9,fontWeight:700,color:'#94a3b8',letterSpacing:2,marginBottom:4}}>ARENA</div>
            <MiniArenas copas={copas} arenaActual={getArenaFromCopas(copas)}/>
          </div>
        </div>
      </div>
    </div>
  );
}

const SesionIllustration=()=>(<svg width="150" height="150" viewBox="0 0 170 170" fill="none"><rect x="15" y="25" width="140" height="88" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(147,197,253,0.3)" strokeWidth="1"/><rect x="25" y="38" width="120" height="8" rx="4" fill="rgba(239,68,68,0.5)"/><rect x="25" y="51" width="85" height="6" rx="3" fill="rgba(249,115,22,0.4)"/><rect x="25" y="62" width="100" height="6" rx="3" fill="rgba(234,179,8,0.3)"/><rect x="25" y="75" width="60" height="5" rx="2.5" fill="rgba(255,255,255,0.15)"/><rect x="25" y="84" width="80" height="5" rx="2.5" fill="rgba(255,255,255,0.1)"/><circle cx="142" cy="40" r="18" fill="rgba(37,99,235,0.3)" stroke="rgba(147,197,253,0.5)" strokeWidth="1.5"/><text x="142" y="46" textAnchor="middle" fontFamily="Rajdhani,sans-serif" fontSize="15" fontWeight="700" fill="#93c5fd">72</text><rect x="15" y="123" width="62" height="26" rx="7" fill="rgba(37,99,235,0.4)" stroke="rgba(147,197,253,0.4)" strokeWidth="1"/><rect x="88" y="123" width="62" height="26" rx="7" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/><text x="46" y="141" textAnchor="middle" fontFamily="Rajdhani,sans-serif" fontSize="10" fontWeight="700" fill="#93c5fd">TRIAJE</text><text x="119" y="141" textAnchor="middle" fontFamily="Rajdhani,sans-serif" fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.4)">LOGS</text></svg>);
const LabIllustration=()=>(<svg width="150" height="150" viewBox="0 0 170 170" fill="none"><rect x="10" y="20" width="150" height="105" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(110,231,183,0.2)" strokeWidth="1"/><rect x="10" y="20" width="150" height="18" rx="8" fill="rgba(255,255,255,0.08)"/><circle cx="22" cy="29" r="4" fill="#FF5F57"/><circle cx="34" cy="29" r="4" fill="#FEBC2E"/><circle cx="46" cy="29" r="4" fill="#28C840"/><text x="20" y="54" fontFamily="Courier New,monospace" fontSize="8" fill="#6ee7b7">$ grep "mimikatz" sysmon.log</text><text x="20" y="66" fontFamily="Courier New,monospace" fontSize="8" fill="#f87171">mimikatz.exe PID:1337 SYSTEM</text><text x="20" y="78" fontFamily="Courier New,monospace" fontSize="8" fill="#6ee7b7">$ netstat -an | grep EST</text><text x="20" y="90" fontFamily="Courier New,monospace" fontSize="8" fill="#f87171">10.0.0.15 185.220.101.47:4444</text><text x="20" y="106" fontFamily="Courier New,monospace" fontSize="8" fill="#58a6ff">$ _</text><rect x="10" y="135" width="68" height="22" rx="6" fill="rgba(16,185,129,0.2)" stroke="rgba(110,231,183,0.4)" strokeWidth="1"/><rect x="90" y="135" width="68" height="22" rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/><text x="44" y="150" textAnchor="middle" fontFamily="Rajdhani,sans-serif" fontSize="10" fontWeight="700" fill="#6ee7b7">SIEM</text><text x="124" y="150" textAnchor="middle" fontFamily="Rajdhani,sans-serif" fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.3)">NETWORK</text></svg>);

/* ══ MAIN ══ */
export default function DashboardAnalista() {
  const {user,token,logout}=useAuth();
  const navigate=useNavigate();
  const [userData,setUserData]=useState(null);
  const [historial,setHistorial]=useState([]);
  const [empleoTab,setEmpleoTab]=useState('ofertas');
  const [ranking,setRanking]=useState([]);
  const [carruselIdx,setCarruselIdx]=useState(0);

  useEffect(()=>{fetchUser();},[]);
  const fetchUser=async()=>{
    try{
      const r=await axios.get(`${API}/api/me`,{headers:{Authorization:`Bearer ${token}`}});
      setUserData(r.data);
      try{const h=await axios.get(`${API}/api/sesiones/historial`,{headers:{Authorization:`Bearer ${token}`}});setHistorial(h.data||[]);}catch{}
      try{const rk=await axios.get(`${API}/api/ranking`,{headers:{Authorization:`Bearer ${token}`}});setRanking((rk.data?.jugadores||[]).slice(0,3));}catch{}
    }catch{logout();navigate('/login');}
  };

  const copas=userData?.copas||0,xp=userData?.xp||0,tier=userData?.tier||1;
  const sesiones=userData?.sesiones_completadas||0,skills=userData?.skills||{};
  const arena=userData?.arena||'Bronce 3';
  const arenaObj=getArenaFromCopas(copas);
  const group=getArenaGroup(arena);
  const ac=ARENA_COLORS[group];
  const streak=calcStreak(historial);
  const skillVals=SKILL_ABBR.map(s=>({...s,val:Math.max(50,Math.round((skills?.[s.key]||0)*10))}));
  const weakSkills=[...skillVals].sort((a,b)=>a.val-b.val).slice(0,1);
  const siguienteArena=ARENAS_CONFIG[ARENAS_CONFIG.findIndex(a=>a.id===arenaObj.id)+1];
  const avatarConfig=userData?.avatar_config||null;
  const foto=userData?.foto_perfil||'';

  const css=`
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp .35s ease forwards;}
    .s1{animation:fadeUp .35s ease .08s both;}
    .s2{animation:fadeUp .35s ease .16s both;}
    .s3{animation:fadeUp .35s ease .24s both;}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    .play-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.15)!important;}
    .quick-btn:hover{background:#f5f7ff!important;border-color:#c7d2fe!important;}
    .hist-row:hover{background:#f8fafc!important;}
    .card-hover:hover{box-shadow:0 8px 32px rgba(0,0,0,0.1)!important;transform:translateY(-2px);}
    *{transition:transform .2s ease,box-shadow .2s ease,border-color .15s,background .15s;}
  `;

  if(!userData)return(<div style={{minHeight:'100vh',background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center'}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{width:40,height:40,border:'3px solid #e2e8f0',borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>);

  return(
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0f172a'}}>

        {/* NAVBAR */}
        <nav style={{position:'sticky',top:0,zIndex:50,height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',background:'#fff',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 8px rgba(0,0,0,0.05)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:28}}/>
            <span style={{fontSize:15,fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',gap:2,alignItems:'center'}}>
            {[{label:'Training',icon:'book',path:'/training'},{label:'Ranking',icon:'chart',path:'/ranking'},{label:'Certificado',icon:'award',path:'/certificado'},{label:'Perfil',icon:'user',path:'/perfil'},{label:'Empleo',icon:'users',path:'#empleo'}].map((item,i)=>(
              <button key={i} className="nav-btn" onClick={()=>item.path==='#empleo'?document.getElementById('empleo-section')?.scrollIntoView({behavior:'smooth'}):navigate(item.path)} style={{padding:'5px 12px',borderRadius:7,background:'none',border:'none',color:'#64748b',fontSize:13,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>
                <Icon name={item.icon} size={13} color="#94a3b8"/> {item.label}
              </button>
            ))}
            <button className="nav-btn" onClick={()=>navigate('/sesion')} style={{padding:'5px 12px',borderRadius:7,background:'#eff6ff',border:'1px solid #bfdbfe',color:'#1d4ed8',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>
              <Icon name="cup" size={13} color="#1d4ed8"/> Sesiones
            </button>
            <button className="nav-btn" onClick={()=>navigate('/lab')} style={{padding:'5px 12px',borderRadius:7,background:'#f0fdf4',border:'1px solid #bbf7d0',color:'#15803d',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>
              <Icon name="flask" size={13} color="#15803d"/> Labs
            </button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{padding:'5px 12px',borderRadius:8,background:'#f8fafc',border:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:8}}>
              <MiniArenas copas={copas} arenaActual={arenaObj}/>
              <div style={{width:1,height:14,background:'#e2e8f0'}}/>
              <span style={{fontSize:11,fontWeight:700,color:ac.main}}>{arenaObj.name}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:8,background:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:13,color:'#374151',fontWeight:500}}>{user?.nombre}</span>
            </div>
            {streak>0&&(<div style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:8,background:'#fef3c7',border:'1px solid #fcd34d'}}><Icon name="fire" size={13} color="#92400e"/><span style={{fontSize:12,fontWeight:700,color:'#92400e'}}>{streak}</span></div>)}
            <button onClick={()=>{logout();navigate('/');}} style={{background:'none',border:'1px solid #e2e8f0',color:'#94a3b8',padding:'5px 12px',borderRadius:7,fontSize:12,cursor:'pointer'}}>Salir</button>
          </div>
        </nav>

        <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 40px 72px'}}>

          {/* GREETING */}
          <div className="fade-up" style={{marginBottom:20}}>
            <h1 style={{fontSize:24,fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',marginBottom:2}}>
              Hola, <span style={{color:ACC}}>{user?.nombre}</span> 👋
            </h1>
            <p style={{fontSize:13,color:'#64748b'}}>
              {arenaObj.name} · {TIERS[tier]} · {sesiones} sesiones completadas
            </p>
          </div>

          {/* ANALYST PROFILE CARD */}
          <div className="fade-up" style={{marginBottom:20}}>
            <AnalystProfileCard
              nombre={user?.nombre} tier={tier} skills={skills} copas={copas}
              arena={arena} xp={xp} sesiones={sesiones}
              avatarConfig={avatarConfig} foto={foto}
              onViewCard={()=>navigate('/analyst-card')}
              onEdit={()=>navigate('/perfil')}
            />
          </div>

          {/* SIGUIENTE ARENA */}
          {siguienteArena&&(
            <div className="s1" style={{marginBottom:20,padding:'14px 20px',borderRadius:12,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:34,height:34,borderRadius:10,background:ac.light,border:`1px solid ${ac.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Icon name="target" size={15} color={ac.main}/>
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                  <span style={{fontSize:12,fontWeight:700,color:'#0f172a'}}>Próxima arena: <span style={{color:ac.main}}>{siguienteArena.name}</span></span>
                  <span style={{fontSize:11,color:ac.main,fontWeight:700,fontFamily:'monospace'}}>{(siguienteArena.min-copas).toLocaleString()} copas restantes</span>
                </div>
                <div style={{height:4,borderRadius:2,background:'#f1f5f9',overflow:'hidden'}}>
                  <div style={{height:'100%',borderRadius:2,width:`${Math.min(((copas-arenaObj.min)/300)*100,100)}%`,background:ac.main,transition:'width 1s ease'}}/>
                </div>
              </div>
            </div>
          )}

          {/* CTA JUGAR */}
          <div className="s1" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:28}}>
            <button className="play-btn" onClick={()=>navigate('/sesion')} style={{padding:'15px',borderRadius:12,background:'linear-gradient(135deg,#1d4ed8,#3b82f6)',border:'none',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 4px 16px rgba(37,99,235,0.3)'}}>
              <Icon name="bolt" size={16} color="#fff"/> Jugar sesión competitiva
            </button>
            <button className="play-btn" onClick={()=>navigate('/lab')} style={{padding:'15px',borderRadius:12,background:'linear-gradient(135deg,#047857,#10b981)',border:'none',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 4px 16px rgba(5,150,105,0.3)'}}>
              <Icon name="flask" size={16} color="#fff"/> Entrar al laboratorio SOC
            </button>
          </div>

          {/* MODOS DE JUEGO */}
          <div className="s2" style={{marginBottom:28}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div>
                <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:2}}>MODOS DE JUEGO</p>
                <p style={{fontSize:12,color:'#64748b'}}>Elige cómo quieres entrenar hoy</p>
              </div>
              <div style={{display:'flex',gap:6}}>
                {[{i:0,l:'Sesiones',ic:'cup',c:'#1d4ed8',bg:'#eff6ff',border:'#bfdbfe'},{i:1,l:'Labs',ic:'flask',c:'#15803d',bg:'#f0fdf4',border:'#bbf7d0'}].map(t=>(
                  <button key={t.i} onClick={()=>setCarruselIdx(t.i)} style={{padding:'6px 14px',borderRadius:8,border:`1px solid ${carruselIdx===t.i?t.border:'#e2e8f0'}`,backgroundColor:carruselIdx===t.i?t.bg:'#fff',color:carruselIdx===t.i?t.c:'#64748b',fontSize:12,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>
                    <Icon name={t.ic} size={12} color={carruselIdx===t.i?t.c:'#94a3b8'}/> {t.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{overflow:'hidden',borderRadius:16,boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
              <div style={{display:'flex',transition:'transform .4s cubic-bezier(.4,0,.2,1)',transform:`translateX(-${carruselIdx*100}%)`}}>
                {/* Sesiones */}
                <div style={{minWidth:'100%',borderRadius:16,overflow:'hidden',border:'1px solid rgba(37,99,235,0.2)'}}>
                  <div style={{padding:'32px 44px',background:'linear-gradient(135deg,#1e1b4b,#1e3a8a 50%,#1d4ed8)',position:'relative',overflow:'hidden',display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:32}}>
                    <div style={{position:'absolute',top:'-80px',right:'-60px',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.15),transparent)',pointerEvents:'none'}}/>
                    <div style={{position:'relative',zIndex:1}}>
                      <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'4px 12px',borderRadius:100,border:'1px solid rgba(147,197,253,0.3)',background:'rgba(37,99,235,0.2)',marginBottom:14}}>
                        <div style={{width:6,height:6,borderRadius:'50%',background:'#93c5fd',animation:'pulse 2s infinite'}}/>
                        <span style={{fontSize:10,color:'#93c5fd',fontWeight:700,letterSpacing:'2px'}}>SESIONES COMPETITIVAS</span>
                      </div>
                      <h2 style={{fontSize:24,fontWeight:900,color:'#fff',letterSpacing:'-0.5px',marginBottom:8,lineHeight:1.15}}>Demuestra tu nivel.<br/><span style={{color:'#93c5fd'}}>Gana copas. Mejora tu perfil.</span></h2>
                      <p style={{fontSize:13,color:'rgba(255,255,255,0.55)',lineHeight:1.7,marginBottom:18,maxWidth:380}}>La IA genera escenarios únicos y evalúa cada decisión. Tu OVR sube con cada buena sesión.</p>
                      <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:18}}>
                        {[{icon:'bolt',l:'Timer activo'},{icon:'cup',l:'Copas y arenas'},{icon:'shield',l:'Skills evaluadas'},{icon:'chart',l:'Ranking global'}].map((f,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:6,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)'}}>
                            <Icon name={f.icon} size={11} color="#93c5fd"/><span style={{fontSize:11,color:'rgba(255,255,255,0.8)',fontWeight:500}}>{f.l}</span>
                          </div>
                        ))}
                      </div>
                      <button className="play-btn" onClick={()=>navigate('/sesion')} style={{padding:'11px 28px',borderRadius:100,background:'linear-gradient(135deg,#2563eb,#3b82f6)',border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(37,99,235,0.5)',display:'inline-flex',alignItems:'center',gap:7}}>
                        <Icon name="bolt" size={13} color="#fff"/> Jugar ahora →
                      </button>
                    </div>
                    <div style={{flexShrink:0,opacity:.9}}><SesionIllustration/></div>
                  </div>
                  <div style={{background:'#fff',padding:'10px',display:'flex',justifyContent:'center',gap:7,borderTop:'1px solid #e8eaf0'}}>
                    {[0,1].map(i=><div key={i} onClick={()=>setCarruselIdx(i)} style={{width:carruselIdx===i?'22px':'7px',height:'7px',borderRadius:'4px',background:carruselIdx===i?'#2563eb':'#e2e8f0',cursor:'pointer',transition:'all .3s'}}/>)}
                  </div>
                </div>
                {/* Labs */}
                <div style={{minWidth:'100%',borderRadius:16,overflow:'hidden',border:'1px solid rgba(52,211,153,0.25)'}}>
                  <div style={{padding:'32px 44px',background:'linear-gradient(135deg,#064e3b,#065f46 50%,#047857)',position:'relative',overflow:'hidden',display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:32}}>
                    <div style={{position:'absolute',top:'-80px',right:'-60px',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(52,211,153,0.12),transparent)',pointerEvents:'none'}}/>
                    <div style={{position:'relative',zIndex:1}}>
                      <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'4px 12px',borderRadius:100,border:'1px solid rgba(110,231,183,0.25)',background:'rgba(16,185,129,0.18)',marginBottom:14}}>
                        <div style={{width:6,height:6,borderRadius:'50%',background:'#6ee7b7',animation:'pulse 2s infinite'}}/>
                        <span style={{fontSize:10,color:'#6ee7b7',fontWeight:700,letterSpacing:'2px'}}>LABORATORIO SOC — BETA</span>
                      </div>
                      <h2 style={{fontSize:24,fontWeight:900,color:'#fff',letterSpacing:'-0.5px',marginBottom:8,lineHeight:1.15}}>Investiga sin límite.<br/><span style={{color:'#6ee7b7'}}>Profundidad real. Mejora tu perfil.</span></h2>
                      <p style={{fontSize:13,color:'rgba(255,255,255,0.55)',lineHeight:1.7,marginBottom:18,maxWidth:380}}>SIEM, Log Explorer, Network Map y evaluación IA. Cada lab sube skills específicas de tu perfil.</p>
                      <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:18}}>
                        {[{icon:'planet',l:'SIEM queries'},{icon:'target',l:'Log Explorer'},{icon:'shield',l:'Network Map'},{icon:'brain',l:'IA evalúa'}].map((f,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:6,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)'}}>
                            <Icon name={f.icon} size={11} color="#6ee7b7"/><span style={{fontSize:11,color:'rgba(255,255,255,0.8)',fontWeight:500}}>{f.l}</span>
                          </div>
                        ))}
                      </div>
                      <button className="play-btn" onClick={()=>navigate('/lab')} style={{padding:'11px 28px',borderRadius:100,background:'linear-gradient(135deg,#10b981,#059669)',border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(16,185,129,0.5)',display:'inline-flex',alignItems:'center',gap:7}}>
                        <Icon name="flask" size={13} color="#fff"/> Entrar al Lab →
                      </button>
                    </div>
                    <div style={{flexShrink:0,opacity:.9}}><LabIllustration/></div>
                  </div>
                  <div style={{background:'#fff',padding:'10px',display:'flex',justifyContent:'center',gap:7,borderTop:'1px solid #e8eaf0'}}>
                    {[0,1].map(i=><div key={i} onClick={()=>setCarruselIdx(i)} style={{width:carruselIdx===i?'22px':'7px',height:'7px',borderRadius:'4px',background:carruselIdx===i?'#10b981':'#e2e8f0',cursor:'pointer',transition:'all .3s'}}/>)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVIDAD + RANKING */}
          <div className="s2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div style={{padding:'20px 22px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>ACTIVIDAD — 90 DÍAS</p>
                <div style={{display:'flex',gap:3,alignItems:'center'}}>
                  {['#f1f5f9','#c7d2fe','#818cf8','#4f46e5'].map((c,i)=><div key={i} style={{width:8,height:8,borderRadius:2,background:c}}/>)}
                </div>
              </div>
              <div style={{overflowX:'auto',marginBottom:14}}><ActivityHeatmap historial={historial}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {[{value:sesiones,label:'sesiones',color:ACC},{value:streak,label:'racha días',color:'#d97706'},{value:historial.filter(s=>s.resultado?.copas_ganadas>0).length,label:'victorias',color:'#059669'}].map((s,i)=>(
                  <div key={i} style={{textAlign:'center',padding:'10px',borderRadius:10,background:'#f8fafc',border:'1px solid #f1f5f9'}}>
                    <div style={{fontSize:20,fontWeight:900,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{padding:'18px 20px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>TOP RANKING</p>
                  <button onClick={()=>navigate('/ranking')} style={{fontSize:11,color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Ver todo →</button>
                </div>
                {ranking.length===0?<p style={{fontSize:12,color:'#94a3b8',textAlign:'center',padding:'10px 0'}}>Cargando...</p>:ranking.map((j,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<ranking.length-1?'1px solid #f8fafc':'none'}}>
                    <div style={{width:24,height:24,borderRadius:6,background:i===0?'#fef3c7':i===1?'#f1f5f9':'#fdf4ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>
                      {i===0?'🥇':i===1?'🥈':'🥉'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.nombre}</div>
                      <div style={{fontSize:10,color:'#94a3b8'}}>{j.arena}</div>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:'#d97706',fontFamily:'monospace'}}>{j.copas?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div style={{padding:'16px 18px',borderRadius:14,background:'#fef2f2',border:'1px solid #fecaca'}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:7}}>
                  <Icon name="target" size={13} color="#ef4444"/>
                  <span style={{fontSize:10,color:'#ef4444',fontWeight:700,letterSpacing:'1.5px'}}>SKILL A MEJORAR</span>
                </div>
                <p style={{fontSize:13,color:'#7f1d1d',fontWeight:700,marginBottom:3}}>{weakSkills[0]?.label}</p>
                <p style={{fontSize:11,color:'#991b1b',lineHeight:1.5,marginBottom:9}}>Actualmente {weakSkills[0]?.val}/100</p>
                <button onClick={()=>navigate('/sesion')} style={{width:'100%',padding:'8px',borderRadius:8,background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <Icon name="bolt" size={12} color="#fff"/> Entrenar ahora →
                </button>
              </div>
            </div>
          </div>

          {/* HISTORIAL + ACCESOS */}
          <div className="s3" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:28}}>
            <div style={{padding:'20px 22px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>ÚLTIMAS SESIONES</p>
                <button onClick={()=>navigate('/sesion')} style={{fontSize:11,color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Nueva →</button>
              </div>
              {historial.length===0?(
                <div style={{textAlign:'center',padding:'20px 0'}}>
                  <Icon name="target" size={28} color="#e2e8f0"/>
                  <p style={{fontSize:12,color:'#94a3b8',marginTop:8}}>Sin sesiones aún</p>
                  <button onClick={()=>navigate('/sesion')} style={{marginTop:10,padding:'8px 16px',borderRadius:8,background:ACC,border:'none',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>Empezar</button>
                </div>
              ):historial.slice(0,5).map((s,i)=>{
                const res=s.resultado,copasGan=res?.copas_ganadas||0,media=res?.media_puntuacion||0,pos=copasGan>=0;
                return(<div key={i} className="hist-row" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 11px',borderRadius:10,background:'#f8fafc',border:'1px solid #f1f5f9',marginBottom:6}}>
                  <div style={{width:30,height:30,borderRadius:8,background:pos?'#ecfdf5':'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon name="trend" size={13} color={pos?'#059669':'#ef4444'}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:11,color:'#0f172a',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.titulo||'Sesión SOC'}</p>
                    <p style={{fontSize:10,color:'#94a3b8',fontFamily:'monospace'}}>{media}/20 pts</p>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:pos?'#059669':'#ef4444',fontFamily:'monospace',flexShrink:0}}>{pos?'+':''}{copasGan}</span>
                </div>);
              })}
            </div>
            <div style={{padding:'20px 22px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <p style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:14,fontFamily:'monospace'}}>ACCESOS RÁPIDOS</p>
              <div style={{display:'flex',flexDirection:'column',gap:7}}>
                {[
                  {label:'Mi Analyst Card', desc:'OVR · Skills · Credencial',  path:'/analyst-card', color:ac.main,  bg:ac.light,  icon:'award'},
                  {label:'Laboratorio SOC', desc:'SIEM · Forense · XP',        path:'/lab',          color:'#059669',bg:'#ecfdf5', icon:'flask'},
                  {label:'Training SOC',   desc:'Módulos · Cursos',            path:'/training',     color:'#7c3aed',bg:'#f5f3ff', icon:'book'},
                  {label:'Ranking Global', desc:'Tu posición actual',          path:'/ranking',      color:'#d97706',bg:'#fffbeb', icon:'chart'},
                  {label:'Mi Certificado', desc:'QR verificable',              path:'/certificado',  color:'#059669',bg:'#ecfdf5', icon:'award'},
                  {label:'Perfil & Tiers', desc:'Stats y progresión',          path:'/perfil',       color:'#1d4ed8',bg:'#eff6ff', icon:'user'},
                ].map((item,i)=>(
                  <div key={i} className="quick-btn" onClick={()=>navigate(item.path)} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:10,background:'#f8fafc',border:'1px solid #e8eaf0',cursor:'pointer'}}>
                    <div style={{width:30,height:30,borderRadius:8,background:item.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Icon name={item.icon} size={14} color={item.color}/>
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontSize:12,color:'#0f172a',fontWeight:600}}>{item.label}</span>
                      <span style={{fontSize:10,color:'#94a3b8',marginLeft:6}}>{item.desc}</span>
                    </div>
                    <Icon name="arrowRight" size={10} color="#cbd5e1"/>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* EMPLEO */}
          <div id="empleo-section" className="s3">
            <div style={{borderRadius:20,overflow:'hidden',marginBottom:20,border:'1px solid #e8eaf0',boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
              <div style={{padding:'32px 44px',background:'linear-gradient(135deg,#0f172a,#1e1b4b 50%,#0f172a)',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:'-60px',right:'-60px',width:'280px',height:'280px',borderRadius:'50%',background:'radial-gradient(circle,rgba(79,70,229,0.15),transparent)',pointerEvents:'none'}}/>
                <div style={{position:'relative',zIndex:1,display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:32,marginBottom:20}}>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                      <span style={{fontSize:10,color:'#818cf8',letterSpacing:'3px',fontWeight:700,fontFamily:'monospace'}}>SOCBLAST CAREERS</span>
                      <div style={{height:1,flex:1,background:'linear-gradient(90deg,rgba(129,140,248,0.4),transparent)'}}/>
                    </div>
                    <h2 style={{fontSize:26,fontWeight:900,color:'#fff',letterSpacing:'-0.8px',marginBottom:8,lineHeight:1.15}}>Tu próximo paso<br/><span style={{color:'#818cf8'}}>en ciberseguridad.</span></h2>
                    <p style={{fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.7}}>Tu Analyst Profile es tu CV. Las empresas verán tu OVR, skills y arena directamente.</p>
                  </div>
                  <div style={{padding:'12px 18px',borderRadius:12,background:'rgba(79,70,229,0.12)',border:'1px solid rgba(99,102,241,0.22)',textAlign:'center',flexShrink:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#a5b4fc',marginBottom:3}}>🚀 En desarrollo</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>Muy pronto</div>
                  </div>
                </div>
                <div style={{position:'relative',zIndex:1,display:'flex',gap:5}}>
                  {[{id:'ofertas',l:'Ofertas'},{id:'certs',l:'Certificaciones'},{id:'bootcamps',l:'Bootcamps'},{id:'retos',l:'Retos gratuitos'}].map(tab=>(
                    <button key={tab.id} onClick={()=>setEmpleoTab(tab.id)} style={{padding:'7px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:empleoTab===tab.id?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.05)',color:empleoTab===tab.id?'#c7d2fe':'rgba(255,255,255,0.4)',borderBottom:empleoTab===tab.id?'2px solid #818cf8':'2px solid transparent'}}>
                      {tab.l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{background:'#fff',padding:'24px'}}>
                {empleoTab==='ofertas'   &&<ComingSoon title="Ofertas de empleo SOC"        desc="Empresas buscarán analistas por su Analyst Profile."      icon="users" color="#4f46e5"/>}
                {empleoTab==='certs'     &&<ComingSoon title="Certificaciones recomendadas" desc="Recomendaciones según tu perfil actual."                  icon="award" color="#7c3aed"/>}
                {empleoTab==='bootcamps' &&<ComingSoon title="Bootcamps y cursos SOC"       desc="Selección curada por relevancia para tu perfil."          icon="book"  color="#0891b2"/>}
                {empleoTab==='retos'     &&<ComingSoon title="Retos y plataformas externas" desc="TryHackMe, Blue Team Labs, CyberDefenders integrados."    icon="shield" color="#059669"/>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}