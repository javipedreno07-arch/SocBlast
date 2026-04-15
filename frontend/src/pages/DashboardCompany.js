import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';
const ACC = '#4f46e5';

// ── ICON SYSTEM (same as analyst dashboard) ───────────────────────────────────
const IC = {
  users:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  user:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  star:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  briefcase:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  chart:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  shield:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  cup:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  trend:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  bolt:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  search:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  filter:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  plus:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  eye:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  mail:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  target:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  award:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  brain:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  check:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  clock:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  map:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  network: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="6" height="6"/><rect x="16" y="2" width="6" height="6"/><rect x="9" y="16" width="6" height="6"/><path d="M5 8v4h14V8"/><path d="M12 12v4"/></svg>,
  planet:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="7"/><path d="M3 12c0 0 5-8 18 0"/><path d="M3 12c0 0 5 8 18 0"/></svg>,
  logout:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const Icon = ({ name, size = 15, color = 'currentColor' }) => (
  <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', color, width:size, height:size, flexShrink:0 }}>
    {React.cloneElement(IC[name] || IC.target, { width:size, height:size })}
  </span>
);

// ── PARTICLE CANVAS (same as analyst) ─────────────────────────────────────────
const ParticleCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const pts = Array.from({length:35},()=>({ x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3, r:Math.random()*1.6+.6, o:Math.random()*.12+.03 }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      pts.forEach(n=>{ n.x+=n.vx; n.y+=n.vy; if(n.x<0||n.x>w)n.vx*=-1; if(n.y<0||n.y>h)n.vy*=-1; ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=`rgba(79,70,229,${n.o})`; ctx.fill(); });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{ const d=Math.hypot(a.x-b.x,a.y-b.y); if(d<140){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=`rgba(79,70,229,${(1-d/140)*.05})`; ctx.lineWidth=.4; ctx.stroke(); }}));
      raf=requestAnimationFrame(draw);
    };
    draw();
    const resize=()=>{ w=c.width=window.innerWidth; h=c.height=window.innerHeight; };
    window.addEventListener('resize',resize);
    return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  },[]);
  return <canvas ref={ref} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>;
};

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const TALENT_MOCK = [
  { nombre:'Alejandro Ruiz',  arena:'Oro II',      tier:5, copas:2180, skills:{ deteccion:8.4, logs:7.9, respuesta:8.1 }, ubicacion:'Madrid',    disponible:true,  xp:6200 },
  { nombre:'María González',  arena:'Plata I',     tier:4, copas:1620, skills:{ deteccion:7.1, logs:8.2, respuesta:6.8 }, ubicacion:'Barcelona', disponible:true,  xp:4100 },
  { nombre:'Carlos Méndez',   arena:'Oro III',     tier:4, copas:1910, skills:{ deteccion:7.8, logs:7.2, respuesta:7.5 }, ubicacion:'Remoto',    disponible:false, xp:4800 },
  { nombre:'Laura Fernández', arena:'Diamante III',tier:6, copas:2720, skills:{ deteccion:9.1, logs:8.7, respuesta:9.3 }, ubicacion:'Valencia',  disponible:true,  xp:9100 },
  { nombre:'Iván Torres',     arena:'Plata III',   tier:3, copas:980,  skills:{ deteccion:6.2, logs:6.8, respuesta:5.9 }, ubicacion:'Sevilla',   disponible:true,  xp:2300 },
  { nombre:'Ana Martínez',    arena:'Oro I',       tier:5, copas:2450, skills:{ deteccion:8.9, logs:8.1, respuesta:8.6 }, ubicacion:'Bilbao',    disponible:false, xp:7200 },
];

const OFERTAS_MOCK = [
  { id:1, rol:'Analista SOC L1', candidatos:12, activa:true,  dias:3,  arena:'Bronce I+', color:'#059669' },
  { id:2, rol:'Threat Hunter',   candidatos:4,  activa:true,  dias:8,  arena:'Oro I+',    color:'#f59e0b' },
  { id:3, rol:'SIEM Engineer',   candidatos:7,  activa:false, dias:15, arena:'Plata II+', color:'#3b82f6' },
];

const SIMULACIONES_MOCK = [
  { nombre:'Evaluación SOC L1 Q1', candidatos:8, completadas:5, avgScore:13.4, color:'#4f46e5' },
  { nombre:'Threat Hunting Test',  candidatos:3, completadas:3, avgScore:15.8, color:'#059669' },
];

const ARENA_COLOR = { Bronce:'#d97706', Plata:'#94a3b8', Oro:'#f59e0b', Diamante:'#3b82f6' };
const getTierArenaColor = (arena) => {
  if (arena.includes('Diamante')) return '#3b82f6';
  if (arena.includes('Oro'))      return '#f59e0b';
  if (arena.includes('Plata'))    return '#94a3b8';
  return '#d97706';
};

const TIERS = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const TIER_CLR = ['','#64748b','#3b82f6','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444','#8b5cf6'];

export default function DashboardCompany() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [filterArena, setFilterArena] = useState('all');
  const [filterDisp, setFilterDisp]   = useState('all');
  const [searchQ, setSearchQ]         = useState('');
  const [selectedAnalista, setSelectedAnalista] = useState(null);
  const [showOfertaForm, setShowOfertaForm] = useState(false);
  const [ofertaForm, setOfertaForm] = useState({ rol:'', arena:'Bronce I+', ubicacion:'', salario:'' });
  const [ofertaEnviada, setOfertaEnviada] = useState(false);

  const filteredTalent = TALENT_MOCK.filter(t => {
    const matchArena = filterArena === 'all' || t.arena.toLowerCase().includes(filterArena);
    const matchDisp  = filterDisp === 'all'  || (filterDisp === 'yes' ? t.disponible : !t.disponible);
    const matchQ     = !searchQ || t.nombre.toLowerCase().includes(searchQ.toLowerCase()) || t.ubicacion.toLowerCase().includes(searchQ.toLowerCase());
    return matchArena && matchDisp && matchQ;
  });

  const stats = {
    talentTotal: TALENT_MOCK.length,
    disponibles: TALENT_MOCK.filter(t => t.disponible).length,
    ofertasActivas: OFERTAS_MOCK.filter(o => o.activa).length,
    candidatosTotal: OFERTAS_MOCK.reduce((acc, o) => acc + o.candidatos, 0),
    avgCopas: Math.round(TALENT_MOCK.reduce((acc, t) => acc + t.copas, 0) / TALENT_MOCK.length),
    topTier: Math.max(...TALENT_MOCK.map(t => t.tier)),
  };

  const enviarOferta = () => {
    if (!ofertaForm.rol.trim()) return;
    setTimeout(() => { setOfertaEnviada(true); setShowOfertaForm(false); setOfertaForm({ rol:'', arena:'Bronce I+', ubicacion:'', salario:'' }); setTimeout(()=>setOfertaEnviada(false), 3000); }, 600);
  };

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes toastIn{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    .fade-up{animation:fadeUp .4s ease forwards;}
    .stat-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.1)!important;}
    .talent-row:hover{background:#f8faff!important;border-color:#c7d2fe!important;}
    .nav-tab:hover{color:#0f172a!important;}
    .action-btn:hover{filter:brightness(1.08);transform:translateY(-1px);}
    .menu-card:hover{border-color:#c7d2fe!important;transform:translateY(-3px);box-shadow:0 12px 32px rgba(79,70,229,0.1)!important;}
    .tag-btn:hover{border-color:#a5b4fc!important;background:#eef2ff!important;}
    *{transition:transform .2s ease,box-shadow .2s ease,border-color .15s ease,background .15s ease,filter .15s ease;}
  `;

  const TABS = [
    { id:'overview',    label:'Resumen',       icon:'chart'     },
    { id:'talent',      label:'Talent Pool',   icon:'users'     },
    { id:'ofertas',     label:'Mis Ofertas',   icon:'briefcase' },
    { id:'simulacion',  label:'Simulaciones',  icon:'brain'     },
  ];

  return (
    <>
      <style>{css}</style>
      <div style={{position:'fixed',inset:0,background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',zIndex:-1}}/>
      <ParticleCanvas/>

      {/* TOAST */}
      {ofertaEnviada && (
        <div style={{position:'fixed',bottom:'28px',left:'50%',transform:'translateX(-50%)',zIndex:9999,padding:'14px 24px',borderRadius:'12px',background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',fontSize:'14px',fontWeight:700,boxShadow:'0 8px 32px rgba(5,150,105,0.35)',display:'flex',alignItems:'center',gap:'10px',animation:'toastIn .4s ease'}}>
          <Icon name="check" size={16} color="#fff"/> Oferta publicada correctamente
        </div>
      )}

      {/* MODAL ANALISTA */}
      {selectedAnalista && (
        <div style={{position:'fixed',inset:0,zIndex:500,backgroundColor:'rgba(10,14,26,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}} onClick={()=>setSelectedAnalista(null)}>
          <div style={{backgroundColor:'#fff',borderRadius:'20px',padding:'36px',maxWidth:'480px',width:'100%',boxShadow:'0 24px 64px rgba(0,0,0,0.18)',position:'relative',animation:'slideDown .3s ease'}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setSelectedAnalista(null)} style={{position:'absolute',top:'16px',right:'16px',background:'none',border:'1px solid #e2e8f0',borderRadius:'8px',color:'#94a3b8',padding:'5px 10px',cursor:'pointer',fontSize:'12px'}}>✕ Cerrar</button>
            <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'24px'}}>
              <div style={{width:'56px',height:'56px',borderRadius:'14px',background:`linear-gradient(135deg,${getTierArenaColor(selectedAnalista.arena)}20,${getTierArenaColor(selectedAnalista.arena)}10)`,border:`1px solid ${getTierArenaColor(selectedAnalista.arena)}30`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:'22px',fontWeight:900,color:getTierArenaColor(selectedAnalista.arena)}}>{selectedAnalista.nombre[0]}</span>
              </div>
              <div>
                <h3 style={{fontSize:'18px',fontWeight:800,color:'#0f172a',marginBottom:'3px'}}>{selectedAnalista.nombre}</h3>
                <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                  <span style={{fontSize:'11px',fontWeight:700,color:getTierArenaColor(selectedAnalista.arena),padding:'2px 8px',borderRadius:'5px',background:`${getTierArenaColor(selectedAnalista.arena)}12`}}>{selectedAnalista.arena}</span>
                  <span style={{fontSize:'11px',color:'#94a3b8',fontFamily:'monospace'}}>{TIERS[selectedAnalista.tier]}</span>
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginBottom:'20px'}}>
              {[{l:'Copas',v:selectedAnalista.copas.toLocaleString(),c:'#f59e0b'},{l:'XP Total',v:selectedAnalista.xp.toLocaleString(),c:ACC},{l:'Tier',v:`T${selectedAnalista.tier}`,c:TIER_CLR[selectedAnalista.tier]}].map((s,i)=>(
                <div key={i} style={{textAlign:'center',padding:'14px',borderRadius:'12px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0'}}>
                  <div style={{fontSize:'18px',fontWeight:900,color:s.c,marginBottom:'3px'}}>{s.v}</div>
                  <div style={{fontSize:'10px',color:'#94a3b8',fontFamily:'monospace'}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:'20px'}}>
              <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:'12px',fontFamily:'monospace'}}>TOP SKILLS</p>
              {Object.entries(selectedAnalista.skills).map(([k,v],i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                  <span style={{fontSize:'11px',color:'#475569',width:'130px',flexShrink:0}}>{k==='deteccion'?'Detección amenazas':k==='logs'?'Análisis de logs':'Respuesta incidentes'}</span>
                  <div style={{flex:1,height:'6px',borderRadius:'3px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                    <div style={{width:`${v*10}%`,height:'100%',borderRadius:'3px',background:`linear-gradient(90deg,${ACC}80,${ACC})`}}/>
                  </div>
                  <span style={{fontSize:'11px',fontWeight:700,color:ACC,fontFamily:'monospace'}}>{v}/10</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px',padding:'10px 14px',borderRadius:'10px',backgroundColor:selectedAnalista.disponible?'#ecfdf5':'#fef2f2',border:`1px solid ${selectedAnalista.disponible?'#bbf7d0':'#fecaca'}`}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:selectedAnalista.disponible?'#22c55e':'#ef4444',animation:selectedAnalista.disponible?'pulse 2s infinite':'none'}}/>
              <span style={{fontSize:'12px',fontWeight:600,color:selectedAnalista.disponible?'#15803d':'#dc2626'}}>{selectedAnalista.disponible?'Disponible para ofertas':'No disponible actualmente'}</span>
              <span style={{fontSize:'11px',color:'#94a3b8',marginLeft:'4px'}}>· {selectedAnalista.ubicacion}</span>
            </div>
            {selectedAnalista.disponible && (
              <button className="action-btn" onClick={()=>setSelectedAnalista(null)}
                style={{width:'100%',padding:'13px',borderRadius:'11px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'14px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:`0 4px 20px ${ACC}30`}}>
                <Icon name="mail" size={15} color="#fff"/> Contactar analista
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL OFERTA */}
      {showOfertaForm && (
        <div style={{position:'fixed',inset:0,zIndex:500,backgroundColor:'rgba(10,14,26,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}} onClick={()=>setShowOfertaForm(false)}>
          <div style={{backgroundColor:'#fff',borderRadius:'20px',padding:'36px',maxWidth:'460px',width:'100%',boxShadow:'0 24px 64px rgba(0,0,0,0.18)',animation:'slideDown .3s ease'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}}>
              <h3 style={{fontSize:'18px',fontWeight:800,color:'#0f172a'}}>Publicar oferta de trabajo</h3>
              <button onClick={()=>setShowOfertaForm(false)} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:'8px',color:'#94a3b8',padding:'5px 10px',cursor:'pointer',fontSize:'12px'}}>✕</button>
            </div>
            {[
              {label:'Rol / Posición',  key:'rol',       placeholder:'Ej: Analista SOC L2',         type:'text'},
              {label:'Arena mínima',    key:'arena',     placeholder:'',                             type:'select', opts:['Bronce I+','Bronce II+','Plata I+','Plata II+','Oro I+','Diamante I+']},
              {label:'Ubicación',       key:'ubicacion', placeholder:'Madrid, Remoto, Híbrido...',   type:'text'},
              {label:'Rango salarial',  key:'salario',   placeholder:'Ej: 28K–36K',                 type:'text'},
            ].map((f,i)=>(
              <div key={i} style={{marginBottom:'14px'}}>
                <label style={{fontSize:'11px',color:'#64748b',fontWeight:700,letterSpacing:'1px',display:'block',marginBottom:'6px',fontFamily:'monospace'}}>{f.label.toUpperCase()}</label>
                {f.type==='select' ? (
                  <select value={ofertaForm[f.key]} onChange={e=>setOfertaForm(p=>({...p,[f.key]:e.target.value}))}
                    style={{width:'100%',padding:'10px 14px',borderRadius:'9px',border:'1px solid #e2e8f0',fontSize:'13px',color:'#0f172a',backgroundColor:'#f8fafc',outline:'none',cursor:'pointer'}}>
                    {f.opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="text" value={ofertaForm[f.key]} onChange={e=>setOfertaForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                    style={{width:'100%',padding:'10px 14px',borderRadius:'9px',border:'1px solid #e2e8f0',fontSize:'13px',color:'#0f172a',backgroundColor:'#f8fafc',outline:'none'}}/>
                )}
              </div>
            ))}
            <button className="action-btn" onClick={enviarOferta} disabled={!ofertaForm.rol.trim()}
              style={{width:'100%',padding:'14px',borderRadius:'11px',background:ofertaForm.rol.trim()?`linear-gradient(135deg,${ACC},#818cf8)`:'#e2e8f0',border:'none',color:ofertaForm.rol.trim()?'#fff':'#94a3b8',fontSize:'14px',fontWeight:700,cursor:ofertaForm.rol.trim()?'pointer':'not-allowed',marginTop:'8px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              <Icon name="plus" size={15} color={ofertaForm.rol.trim()?'#fff':'#94a3b8'}/> Publicar oferta
            </button>
          </div>
        </div>
      )}

      <div style={{position:'relative',zIndex:1,minHeight:'100vh',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0f172a'}}>

        {/* NAVBAR */}
        <nav style={{position:'sticky',top:0,zIndex:50,height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',backgroundColor:'rgba(255,255,255,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 12px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}} onClick={()=>navigate('/')}>
              <img src="/logosoc.png" alt="SocBlast" style={{height:'28px'}}/>
              <span style={{fontSize:'15px',fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
            </div>
            <div style={{height:'16px',width:'1px',backgroundColor:'#e2e8f0'}}/>
            <span style={{fontSize:'11px',fontWeight:700,color:ACC,padding:'3px 10px',borderRadius:'6px',backgroundColor:`${ACC}10`,border:`1px solid ${ACC}20`,fontFamily:'monospace',letterSpacing:'0.5px'}}>EMPRESA</span>
          </div>

          {/* TABS */}
          <div style={{display:'flex',gap:'2px'}}>
            {TABS.map(tab=>(
              <button key={tab.id} className="nav-tab" onClick={()=>setActiveTab(tab.id)}
                style={{padding:'6px 14px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:activeTab===tab.id?700:500,
                  backgroundColor:activeTab===tab.id?`${ACC}10`:'transparent',
                  color:activeTab===tab.id?ACC:'#64748b',
                  display:'flex',alignItems:'center',gap:'5px',
                  borderBottom:activeTab===tab.id?`2px solid ${ACC}`:'2px solid transparent',
                }}>
                <Icon name={tab.icon} size={13} color={activeTab===tab.id?ACC:'#64748b'}/>{tab.label}
              </button>
            ))}
          </div>

          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#22c55e',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:'13px',color:'#374151',fontWeight:500}}>{user?.nombre}</span>
            </div>
            <button onClick={()=>{logout();navigate('/');}} style={{background:'none',border:'1px solid #e2e8f0',color:'#94a3b8',padding:'5px 10px',borderRadius:'7px',fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
              <Icon name="logout" size={12} color="#94a3b8"/> Salir
            </button>
          </div>
        </nav>

        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'28px 40px 72px'}}>

          {/* HEADER */}
          <div className="fade-up" style={{marginBottom:'28px',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div>
              <h1 style={{fontSize:'22px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',marginBottom:'3px'}}>
                Panel de Empresa · <span style={{color:ACC}}>{user?.nombre}</span>
              </h1>
              <p style={{fontSize:'13px',color:'#94a3b8',fontFamily:'monospace'}}>
                {stats.disponibles} analistas disponibles · {stats.ofertasActivas} ofertas activas · {stats.candidatosTotal} candidatos totales
              </p>
            </div>
            <button className="action-btn" onClick={()=>setShowOfertaForm(true)}
              style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'10px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 20px ${ACC}30`}}>
              <Icon name="plus" size={14} color="#fff"/> Publicar oferta
            </button>
          </div>

          {/* ══════════════════════════════════════════
              TAB: OVERVIEW
          ══════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="fade-up">

              {/* STAT CARDS */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'20px'}}>
                {[
                  {label:'TALENT POOL',    value:stats.talentTotal,              sub:'analistas indexados',   color:'#4f46e5', light:'#eef2ff', icon:'users'},
                  {label:'DISPONIBLES',    value:stats.disponibles,              sub:'listos para contratar', color:'#059669', light:'#ecfdf5', icon:'check'},
                  {label:'OFERTAS ACTIVAS',value:stats.ofertasActivas,           sub:'publicaciones abiertas',color:'#f59e0b', light:'#fffbeb', icon:'briefcase'},
                  {label:'CANDIDATOS',     value:stats.candidatosTotal,          sub:'en proceso total',      color:'#0891b2', light:'#ecfeff', icon:'target'},
                ].map((s,i)=>(
                  <div key={i} className="stat-card"
                    style={{padding:'22px 20px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)',position:'relative',overflow:'hidden',cursor:'default'}}>
                    <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:`linear-gradient(90deg,${s.color},${s.color}80)`,borderRadius:'16px 16px 0 0'}}/>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'14px'}}>
                      <div style={{width:'40px',height:'40px',borderRadius:'12px',backgroundColor:s.light,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${s.color}15`}}>
                        <Icon name={s.icon} size={18} color={s.color}/>
                      </div>
                    </div>
                    <div style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:'5px',fontFamily:'monospace'}}>{s.label}</div>
                    <div style={{fontSize:'28px',fontWeight:900,color:s.color,letterSpacing:'-0.8px',lineHeight:1,marginBottom:'4px'}}>{s.value}</div>
                    <div style={{fontSize:'12px',color:'#64748b'}}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* FILA: TOP TALENT + QUICK ACTIONS */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'14px',marginBottom:'14px'}}>

                {/* TOP TALENT */}
                <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)',overflow:'hidden'}}>
                  <div style={{padding:'18px 22px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:'2px'}}>TOP TALENT DISPONIBLE</p>
                      <p style={{fontSize:'13px',color:'#0f172a',fontWeight:700}}>Los analistas con mejor rendimiento</p>
                    </div>
                    <button onClick={()=>setActiveTab('talent')} style={{fontSize:'11px',color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600,display:'flex',alignItems:'center',gap:'4px'}}>
                      Ver todos <Icon name="trend" size={11} color={ACC}/>
                    </button>
                  </div>
                  <div>
                    {TALENT_MOCK.filter(t=>t.disponible).sort((a,b)=>b.copas-a.copas).slice(0,4).map((t,i)=>(
                      <div key={i} className="talent-row" onClick={()=>setSelectedAnalista(t)}
                        style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 22px',borderBottom:i<3?'1px solid #f8fafc':'none',cursor:'pointer'}}>
                        <div style={{width:'38px',height:'38px',borderRadius:'10px',background:`linear-gradient(135deg,${getTierArenaColor(t.arena)}20,${getTierArenaColor(t.arena)}08)`,border:`1px solid ${getTierArenaColor(t.arena)}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{fontSize:'15px',fontWeight:900,color:getTierArenaColor(t.arena)}}>{t.nombre[0]}</span>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'3px'}}>
                            <span style={{fontSize:'13px',fontWeight:700,color:'#0f172a'}}>{t.nombre}</span>
                            <span style={{fontSize:'10px',fontWeight:700,color:getTierArenaColor(t.arena),padding:'1px 6px',borderRadius:'4px',background:`${getTierArenaColor(t.arena)}12`}}>{t.arena}</span>
                          </div>
                          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                            <span style={{fontSize:'11px',color:'#94a3b8',fontFamily:'monospace'}}>{t.copas.toLocaleString()} copas</span>
                            <span style={{fontSize:'11px',color:'#94a3b8'}}>· {t.ubicacion}</span>
                          </div>
                        </div>
                        <div style={{textAlign:'right',flexShrink:0}}>
                          <div style={{fontSize:'12px',fontWeight:700,color:TIER_CLR[t.tier],marginBottom:'2px'}}>{TIERS[t.tier]}</div>
                          <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#22c55e',marginLeft:'auto',animation:'pulse 2s infinite'}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QUICK ACTIONS + OFERTAS */}
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>

                  {/* Arena breakdown */}
                  <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)',padding:'18px 20px'}}>
                    <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:'14px'}}>DISTRIBUCIÓN POR ARENA</p>
                    {['Diamante','Oro','Plata','Bronce'].map(tier=>{
                      const count = TALENT_MOCK.filter(t=>t.arena.includes(tier)).length;
                      const pct   = Math.round(count/TALENT_MOCK.length*100);
                      const color = ARENA_COLOR[tier];
                      return (
                        <div key={tier} style={{marginBottom:'10px'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
                            <span style={{fontSize:'12px',color:'#475569',fontWeight:500}}>{tier}</span>
                            <span style={{fontSize:'11px',color:color,fontWeight:700,fontFamily:'monospace'}}>{count} · {pct}%</span>
                          </div>
                          <div style={{height:'6px',borderRadius:'3px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                            <div style={{width:`${pct}%`,height:'100%',borderRadius:'3px',background:`linear-gradient(90deg,${color}70,${color})`}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Acciones rápidas */}
                  <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)',padding:'18px 20px'}}>
                    <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:'12px'}}>ACCIONES RÁPIDAS</p>
                    <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                      {[
                        {label:'Buscar analistas',     icon:'search',    action:()=>setActiveTab('talent'),      color:'#4f46e5', light:'#eef2ff'},
                        {label:'Publicar oferta',       icon:'briefcase', action:()=>setShowOfertaForm(true),     color:'#f59e0b', light:'#fffbeb'},
                        {label:'Nueva simulación',      icon:'brain',     action:()=>setActiveTab('simulacion'),  color:'#059669', light:'#ecfdf5'},
                        {label:'Ver mis ofertas',       icon:'eye',       action:()=>setActiveTab('ofertas'),     color:'#0891b2', light:'#ecfeff'},
                      ].map((item,i)=>(
                        <div key={i} className="menu-card" onClick={item.action}
                          style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0',cursor:'pointer'}}>
                          <div style={{width:'30px',height:'30px',borderRadius:'8px',backgroundColor:item.light,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${item.color}15`}}>
                            <Icon name={item.icon} size={14} color={item.color}/>
                          </div>
                          <span style={{fontSize:'12px',color:'#0f172a',fontWeight:600,flex:1}}>{item.label}</span>
                          <Icon name="trend" size={9} color="#cbd5e1"/>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* OFERTAS ACTIVAS RESUMEN */}
              <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)',overflow:'hidden',marginBottom:'14px'}}>
                <div style={{padding:'18px 22px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:'2px'}}>MIS OFERTAS</p>
                    <p style={{fontSize:'13px',color:'#0f172a',fontWeight:700}}>{stats.ofertasActivas} activas · {stats.candidatosTotal} candidatos en total</p>
                  </div>
                  <button onClick={()=>setActiveTab('ofertas')} style={{fontSize:'11px',color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Ver todas →</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
                  {OFERTAS_MOCK.map((o,i)=>(
                    <div key={i} style={{padding:'20px 22px',borderRight:i<2?'1px solid #f1f5f9':'none',position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',backgroundColor:o.activa?o.color:'#e2e8f0'}}/>
                      <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'10px'}}>
                        <span style={{fontSize:'10px',fontWeight:700,padding:'2px 7px',borderRadius:'4px',backgroundColor:o.activa?'#ecfdf5':'#f1f5f9',color:o.activa?'#059669':'#94a3b8',border:`1px solid ${o.activa?'#bbf7d0':'#e2e8f0'}`}}>{o.activa?'ACTIVA':'CERRADA'}</span>
                        <span style={{fontSize:'10px',color:'#94a3b8',fontFamily:'monospace'}}>Hace {o.dias} días</span>
                      </div>
                      <div style={{fontSize:'14px',fontWeight:800,color:'#0f172a',marginBottom:'6px'}}>{o.rol}</div>
                      <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                        <span style={{fontSize:'11px',color:'#64748b',display:'flex',alignItems:'center',gap:'4px'}}><Icon name="users" size={11} color="#94a3b8"/>{o.candidatos} candidatos</span>
                        <span style={{fontSize:'10px',fontWeight:700,color:o.color,padding:'2px 6px',borderRadius:'4px',background:`${o.color}12`}}>Req: {o.arena}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIMULACIONES RESUMEN */}
              <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)',overflow:'hidden'}}>
                <div style={{padding:'18px 22px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:'2px'}}>SIMULACIONES EMPRESA</p>
                    <p style={{fontSize:'13px',color:'#0f172a',fontWeight:700}}>Evaluaciones personalizadas para candidatos</p>
                  </div>
                  <button onClick={()=>setActiveTab('simulacion')} style={{fontSize:'11px',color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Gestionar →</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
                  {SIMULACIONES_MOCK.map((s,i)=>(
                    <div key={i} style={{padding:'20px 22px',borderRight:i===0?'1px solid #f1f5f9':'none',position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',backgroundColor:s.color}}/>
                      <div style={{fontSize:'13px',fontWeight:700,color:'#0f172a',marginBottom:'12px'}}>{s.nombre}</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
                        {[{l:'Invitados',v:s.candidatos},{l:'Completadas',v:s.completadas},{l:'Media',v:`${s.avgScore}/20`}].map((m,j)=>(
                          <div key={j} style={{textAlign:'center',padding:'8px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #f1f5f9'}}>
                            <div style={{fontSize:'14px',fontWeight:800,color:s.color,marginBottom:'2px'}}>{m.v}</div>
                            <div style={{fontSize:'9px',color:'#94a3b8',fontFamily:'monospace'}}>{m.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: TALENT POOL
          ══════════════════════════════════════════ */}
          {activeTab === 'talent' && (
            <div className="fade-up">

              {/* Filtros */}
              <div style={{display:'flex',gap:'10px',marginBottom:'20px',alignItems:'center',flexWrap:'wrap'}}>
                <div style={{position:'relative',flex:1,minWidth:'200px'}}>
                  <div style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)'}}>
                    <Icon name="search" size={14} color="#94a3b8"/>
                  </div>
                  <input
                    type="text" placeholder="Buscar por nombre o ciudad..."
                    value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                    style={{width:'100%',padding:'10px 14px 10px 36px',borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'13px',backgroundColor:'#fff',outline:'none',color:'#0f172a'}}
                  />
                </div>
                <div style={{display:'flex',gap:'6px'}}>
                  {[{id:'all',label:'Todas arenas'},{id:'bronce',label:'Bronce'},{id:'plata',label:'Plata'},{id:'oro',label:'Oro'},{id:'diamante',label:'Diamante'}].map(f=>(
                    <button key={f.id} className="tag-btn" onClick={()=>setFilterArena(f.id)}
                      style={{padding:'8px 14px',borderRadius:'8px',border:`1px solid ${filterArena===f.id?ACC:'#e2e8f0'}`,backgroundColor:filterArena===f.id?`${ACC}10`:'#fff',color:filterArena===f.id?ACC:'#64748b',fontSize:'12px',fontWeight:filterArena===f.id?700:500,cursor:'pointer',whiteSpace:'nowrap'}}>
                      {f.label}
                    </button>
                  ))}
                </div>
                <button className="tag-btn" onClick={()=>setFilterDisp(filterDisp==='yes'?'all':'yes')}
                  style={{padding:'8px 14px',borderRadius:'8px',border:`1px solid ${filterDisp==='yes'?'#059669':'#e2e8f0'}`,backgroundColor:filterDisp==='yes'?'#ecfdf5':'#fff',color:filterDisp==='yes'?'#059669':'#64748b',fontSize:'12px',fontWeight:filterDisp==='yes'?700:500,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                  <Icon name="check" size={12} color={filterDisp==='yes'?'#059669':'#64748b'}/> Solo disponibles
                </button>
              </div>

              <p style={{fontSize:'12px',color:'#94a3b8',marginBottom:'12px',fontFamily:'monospace'}}>{filteredTalent.length} analistas encontrados</p>

              {/* Grid de talento */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
                {filteredTalent.map((t,i)=>{
                  const ac = getTierArenaColor(t.arena);
                  const avgSkill = Math.round(Object.values(t.skills).reduce((a,b)=>a+b,0)/Object.values(t.skills).length*10)/10;
                  return (
                    <div key={i} className="menu-card" onClick={()=>setSelectedAnalista(t)}
                      style={{padding:'22px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)',cursor:'pointer',position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,${ac},${ac}60)`}}/>

                      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'16px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                          <div style={{width:'42px',height:'42px',borderRadius:'12px',background:`linear-gradient(135deg,${ac}20,${ac}08)`,border:`1px solid ${ac}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <span style={{fontSize:'17px',fontWeight:900,color:ac}}>{t.nombre[0]}</span>
                          </div>
                          <div>
                            <div style={{fontSize:'13px',fontWeight:700,color:'#0f172a',marginBottom:'3px'}}>{t.nombre}</div>
                            <div style={{fontSize:'11px',color:TIER_CLR[t.tier],fontWeight:600}}>{TIERS[t.tier]}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:'6px',backgroundColor:t.disponible?'#ecfdf5':'#f1f5f9',border:`1px solid ${t.disponible?'#bbf7d0':'#e2e8f0'}`}}>
                          <div style={{width:'5px',height:'5px',borderRadius:'50%',backgroundColor:t.disponible?'#22c55e':'#cbd5e1',animation:t.disponible?'pulse 2s infinite':'none'}}/>
                          <span style={{fontSize:'9px',fontWeight:700,color:t.disponible?'#059669':'#94a3b8'}}>{t.disponible?'DISPONIBLE':'OCUPADO'}</span>
                        </div>
                      </div>

                      <div style={{display:'flex',gap:'6px',marginBottom:'14px',flexWrap:'wrap'}}>
                        <span style={{fontSize:'10px',fontWeight:700,color:ac,padding:'2px 8px',borderRadius:'5px',background:`${ac}12`,border:`1px solid ${ac}20`}}>{t.arena}</span>
                        <span style={{fontSize:'10px',color:'#64748b',padding:'2px 8px',borderRadius:'5px',background:'#f8fafc',border:'1px solid #e8eaf0',display:'flex',alignItems:'center',gap:'3px'}}>
                          <Icon name="map" size={10} color="#94a3b8"/>{t.ubicacion}
                        </span>
                      </div>

                      <div style={{marginBottom:'14px'}}>
                        {Object.entries(t.skills).slice(0,2).map(([k,v],j)=>(
                          <div key={j} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'5px'}}>
                            <span style={{fontSize:'10px',color:'#64748b',width:'120px',flexShrink:0}}>{k==='deteccion'?'Detección':k==='logs'?'Análisis logs':'Respuesta'}</span>
                            <div style={{flex:1,height:'4px',borderRadius:'2px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                              <div style={{width:`${v*10}%`,height:'100%',borderRadius:'2px',background:`linear-gradient(90deg,${ACC}60,${ACC})`}}/>
                            </div>
                            <span style={{fontSize:'10px',fontWeight:700,color:ACC,fontFamily:'monospace'}}>{v}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'12px',borderTop:'1px solid #f8fafc'}}>
                        <div style={{display:'flex',gap:'12px'}}>
                          <div style={{textAlign:'center'}}>
                            <div style={{fontSize:'14px',fontWeight:900,color:'#f59e0b',lineHeight:1}}>{t.copas.toLocaleString()}</div>
                            <div style={{fontSize:'9px',color:'#94a3b8',fontFamily:'monospace'}}>copas</div>
                          </div>
                          <div style={{textAlign:'center'}}>
                            <div style={{fontSize:'14px',fontWeight:900,color:ACC,lineHeight:1}}>{avgSkill}</div>
                            <div style={{fontSize:'9px',color:'#94a3b8',fontFamily:'monospace'}}>avg skill</div>
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'11px',color:ACC,fontWeight:600}}>
                          Ver perfil <Icon name="trend" size={10} color={ACC}/>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: OFERTAS
          ══════════════════════════════════════════ */}
          {activeTab === 'ofertas' && (
            <div className="fade-up">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <div>
                  <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:'3px'}}>MIS OFERTAS DE TRABAJO</p>
                  <p style={{fontSize:'13px',color:'#64748b'}}>{OFERTAS_MOCK.length} publicaciones · {stats.candidatosTotal} candidatos en total</p>
                </div>
                <button className="action-btn" onClick={()=>setShowOfertaForm(true)}
                  style={{display:'flex',alignItems:'center',gap:'7px',padding:'10px 18px',borderRadius:'10px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 16px ${ACC}30`}}>
                  <Icon name="plus" size={14} color="#fff"/> Nueva oferta
                </button>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'28px'}}>
                {OFERTAS_MOCK.map((o,i)=>(
                  <div key={i} style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)',overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:'20px',padding:'22px 26px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                        <div style={{width:'48px',height:'48px',borderRadius:'13px',background:`${o.color}12`,border:`1px solid ${o.color}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <Icon name="briefcase" size={20} color={o.color}/>
                        </div>
                        <div>
                          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'5px'}}>
                            <span style={{fontSize:'16px',fontWeight:800,color:'#0f172a'}}>{o.rol}</span>
                            <span style={{fontSize:'10px',fontWeight:700,padding:'2px 8px',borderRadius:'5px',backgroundColor:o.activa?'#ecfdf5':'#f1f5f9',color:o.activa?'#059669':'#94a3b8',border:`1px solid ${o.activa?'#bbf7d0':'#e2e8f0'}`}}>{o.activa?'ACTIVA':'CERRADA'}</span>
                          </div>
                          <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                            <span style={{fontSize:'12px',color:'#64748b',display:'flex',alignItems:'center',gap:'4px'}}><Icon name="clock" size={11} color="#94a3b8"/> Publicada hace {o.dias} días</span>
                            <span style={{fontSize:'11px',fontWeight:700,color:o.color,padding:'2px 7px',borderRadius:'5px',background:`${o.color}10`}}>Req: {o.arena}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:'28px',alignItems:'center'}}>
                        <div style={{textAlign:'center'}}>
                          <div style={{fontSize:'24px',fontWeight:900,color:ACC,letterSpacing:'-0.5px',lineHeight:1}}>{o.candidatos}</div>
                          <div style={{fontSize:'10px',color:'#94a3b8',fontFamily:'monospace'}}>candidatos</div>
                        </div>
                        <div style={{display:'flex',gap:'8px'}}>
                          <button style={{padding:'8px 14px',borderRadius:'9px',background:'#f0f4ff',border:'1px solid #c7d2fe',color:ACC,fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                            <Icon name="eye" size={12} color={ACC}/> Ver candidatos
                          </button>
                          {o.activa && (
                            <button style={{padding:'8px 14px',borderRadius:'9px',background:'#fef2f2',border:'1px solid #fecaca',color:'#ef4444',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                              Cerrar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barra de candidatos */}
                    {o.activa && (
                      <div style={{padding:'12px 26px',backgroundColor:'#f8fafc',borderTop:'1px solid #f1f5f9',display:'flex',alignItems:'center',gap:'16px'}}>
                        <span style={{fontSize:'11px',color:'#94a3b8',fontFamily:'monospace',flexShrink:0}}>Progreso candidatos:</span>
                        <div style={{flex:1,height:'5px',borderRadius:'3px',backgroundColor:'#e2e8f0',overflow:'hidden'}}>
                          <div style={{width:`${(o.candidatos/15)*100}%`,height:'100%',borderRadius:'3px',background:`linear-gradient(90deg,${o.color}70,${o.color})`}}/>
                        </div>
                        <span style={{fontSize:'11px',color:o.color,fontWeight:700,fontFamily:'monospace',flexShrink:0}}>{o.candidatos}/15 objetivo</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Info banner */}
              <div style={{padding:'20px 24px',borderRadius:'14px',background:'linear-gradient(135deg,#eef2ff,#f5f3ff)',border:'1px solid #c7d2fe',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'10px',backgroundColor:`${ACC}20`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon name="award" size={18} color={ACC}/>
                  </div>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:700,color:'#3730a3',marginBottom:'2px'}}>Consejo: añade arena mínima requerida</div>
                    <div style={{fontSize:'12px',color:'#6366f1'}}>Las ofertas con requisito de arena reciben candidatos un 60% más cualificados</div>
                  </div>
                </div>
                <button onClick={()=>setShowOfertaForm(true)} style={{padding:'9px 18px',borderRadius:'9px',background:ACC,border:'none',color:'#fff',fontSize:'12px',fontWeight:700,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}>
                  <Icon name="plus" size={12} color="#fff"/> Nueva oferta
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB: SIMULACIONES
          ══════════════════════════════════════════ */}
          {activeTab === 'simulacion' && (
            <div className="fade-up">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <div>
                  <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:'3px'}}>SIMULACIONES PERSONALIZADAS</p>
                  <p style={{fontSize:'13px',color:'#64748b'}}>Evalúa candidatos con escenarios SOC a tu medida</p>
                </div>
                <button className="action-btn" style={{display:'flex',alignItems:'center',gap:'7px',padding:'10px 18px',borderRadius:'10px',background:`linear-gradient(135deg,#059669,#10b981)`,border:'none',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 16px rgba(5,150,105,0.3)`}}>
                  <Icon name="plus" size={14} color="#fff"/> Nueva simulación
                </button>
              </div>

              {/* Cómo funciona */}
              <div style={{padding:'28px',borderRadius:'16px',background:'linear-gradient(135deg,#f0fdf4,#ecfdf5)',border:'1px solid #bbf7d0',marginBottom:'20px'}}>
                <p style={{fontSize:'10px',color:'#059669',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:'16px'}}>CÓMO FUNCIONA</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px'}}>
                  {[
                    {n:'01',t:'Diseña el escenario',d:'Define la dificultad, arena y tipo de amenaza',icon:'star'},
                    {n:'02',t:'Invita candidatos',d:'Envía el enlace a los analistas del talent pool',icon:'mail'},
                    {n:'03',t:'Ellos juegan',d:'Completan la sesión SOC en tiempo real',icon:'bolt'},
                    {n:'04',t:'Ves resultados',d:'Puntuaciones, skills y comparativa automática',icon:'chart'},
                  ].map((s,i)=>(
                    <div key={i} style={{textAlign:'center'}}>
                      <div style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(5,150,105,0.12)',border:'1px solid rgba(5,150,105,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px',fontSize:'12px',fontWeight:900,color:'#059669',fontFamily:'monospace'}}>{s.n}</div>
                      <div style={{fontSize:'12px',fontWeight:700,color:'#065f46',marginBottom:'4px'}}>{s.t}</div>
                      <div style={{fontSize:'11px',color:'#6ee7b7',lineHeight:1.5}}>{s.d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulaciones existentes */}
              <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'20px'}}>
                {SIMULACIONES_MOCK.map((s,i)=>(
                  <div key={i} style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)',overflow:'hidden'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:'24px',padding:'22px 26px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                        <div style={{width:'48px',height:'48px',borderRadius:'13px',background:`${s.color}12`,border:`1px solid ${s.color}20`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <Icon name="brain" size={20} color={s.color}/>
                        </div>
                        <div>
                          <div style={{fontSize:'15px',fontWeight:800,color:'#0f172a',marginBottom:'6px'}}>{s.nombre}</div>
                          <div style={{display:'flex',gap:'14px'}}>
                            <span style={{fontSize:'12px',color:'#64748b',display:'flex',alignItems:'center',gap:'4px'}}><Icon name="users" size={11} color="#94a3b8"/> {s.candidatos} invitados</span>
                            <span style={{fontSize:'12px',color:'#64748b',display:'flex',alignItems:'center',gap:'4px'}}><Icon name="check" size={11} color="#94a3b8"/> {s.completadas} completadas</span>
                          </div>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:'20px',alignItems:'center'}}>
                        <div style={{textAlign:'center'}}>
                          <div style={{fontSize:'26px',fontWeight:900,color:s.color,letterSpacing:'-0.5px',lineHeight:1}}>{s.avgScore}</div>
                          <div style={{fontSize:'10px',color:'#94a3b8',fontFamily:'monospace'}}>media /20</div>
                        </div>
                        <div style={{display:'flex',gap:'8px'}}>
                          <button style={{padding:'8px 14px',borderRadius:'9px',background:'#f0f4ff',border:'1px solid #c7d2fe',color:ACC,fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                            <Icon name="chart" size={12} color={ACC}/> Resultados
                          </button>
                          <button style={{padding:'8px 14px',borderRadius:'9px',background:'#f8fafc',border:'1px solid #e2e8f0',color:'#64748b',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                            <Icon name="mail" size={12} color="#64748b"/> Invitar
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{padding:'12px 26px',backgroundColor:'#f8fafc',borderTop:'1px solid #f1f5f9',display:'flex',alignItems:'center',gap:'16px'}}>
                      <span style={{fontSize:'11px',color:'#94a3b8',fontFamily:'monospace'}}>Completación:</span>
                      <div style={{flex:1,height:'5px',borderRadius:'3px',backgroundColor:'#e2e8f0',overflow:'hidden'}}>
                        <div style={{width:`${(s.completadas/s.candidatos)*100}%`,height:'100%',borderRadius:'3px',background:`linear-gradient(90deg,${s.color}70,${s.color})`}}/>
                      </div>
                      <span style={{fontSize:'11px',fontWeight:700,color:s.color,fontFamily:'monospace'}}>{Math.round((s.completadas/s.candidatos)*100)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tipos de escenario disponibles */}
              <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e8eaf0',overflow:'hidden',boxShadow:'0 2px 10px rgba(0,0,0,.05)'}}>
                <div style={{padding:'18px 22px',borderBottom:'1px solid #f1f5f9'}}>
                  <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>TIPOS DE ESCENARIO DISPONIBLES</p>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
                  {[
                    {t:'SOC L1 Básico',  d:'Brute force, phishing básico. Arena Bronce.', color:'#d97706', icon:'shield'},
                    {t:'Correlación SIEM',d:'Movimiento lateral, escalada. Arena Plata.',  color:'#94a3b8', icon:'network'},
                    {t:'APT Avanzado',   d:'Multi-fase, evasión activa. Arena Oro+.',     color:'#f59e0b', icon:'brain'},
                  ].map((c,i)=>(
                    <div key={i} style={{padding:'20px',borderRight:i<2?'1px solid #f1f5f9':'none',position:'relative',overflow:'hidden'}}>
                      <div style={{width:'36px',height:'36px',borderRadius:'10px',background:`${c.color}12`,border:`1px solid ${c.color}20`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'12px'}}>
                        <Icon name={c.icon} size={16} color={c.color}/>
                      </div>
                      <div style={{fontSize:'13px',fontWeight:700,color:'#0f172a',marginBottom:'5px'}}>{c.t}</div>
                      <div style={{fontSize:'12px',color:'#64748b',lineHeight:1.55,marginBottom:'12px'}}>{c.d}</div>
                      <button style={{padding:'7px 14px',borderRadius:'8px',background:`${c.color}12`,border:`1px solid ${c.color}25`,color:c.color,fontSize:'12px',fontWeight:700,cursor:'pointer'}}>Seleccionar →</button>
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
