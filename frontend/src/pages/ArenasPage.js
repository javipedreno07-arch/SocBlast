import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ACC = '#4f46e5';

const ARENAS = [
  { nombre:"Bronce 3",  grupo:"Bronce",   min:0,    max:299,   color:"#92400e", light:"#fef3c7", grad:["#f59e0b","#d97706"], planet:"bronce",   dificultad:"Básica",       tiempo:20, desc:"Amenazas básicas. Brute force, phishing simple. Ideal para empezar." },
  { nombre:"Bronce 2",  grupo:"Bronce",   min:300,  max:599,   color:"#92400e", light:"#fef3c7", grad:["#f59e0b","#b45309"], planet:"bronce",   dificultad:"Básica",       tiempo:20, desc:"Malware básico y análisis de logs simples." },
  { nombre:"Bronce 1",  grupo:"Bronce",   min:600,  max:899,   color:"#92400e", light:"#fef3c7", grad:["#d97706","#92400e"], planet:"bronce",   dificultad:"Básica+",      tiempo:18, desc:"Correlación simple de eventos. Preparación para Plata." },
  { nombre:"Plata 3",   grupo:"Plata",    min:900,  max:1199,  color:"#475569", light:"#f1f5f9", grad:["#94a3b8","#64748b"], planet:"plata",    dificultad:"Intermedia",   tiempo:15, desc:"Movimiento lateral y escalada de privilegios." },
  { nombre:"Plata 2",   grupo:"Plata",    min:1200, max:1499,  color:"#475569", light:"#f1f5f9", grad:["#64748b","#475569"], planet:"plata",    dificultad:"Intermedia",   tiempo:15, desc:"C2 y persistencia. Análisis de comportamiento." },
  { nombre:"Plata 1",   grupo:"Plata",    min:1500, max:1799,  color:"#334155", light:"#f1f5f9", grad:["#475569","#334155"], planet:"plata",    dificultad:"Intermedia+",  tiempo:13, desc:"Detección avanzada. Preparación para Oro." },
  { nombre:"Oro 3",     grupo:"Oro",      min:1800, max:2099,  color:"#78350f", light:"#fffbeb", grad:["#fbbf24","#f59e0b"], planet:"oro",      dificultad:"Avanzada",     tiempo:10, desc:"Ransomware y exfiltración de datos. Múltiples vectores." },
  { nombre:"Oro 2",     grupo:"Oro",      min:2100, max:2399,  color:"#78350f", light:"#fffbeb", grad:["#f59e0b","#d97706"], planet:"oro",      dificultad:"Avanzada",     tiempo:10, desc:"APT inicial. Logs SIEM/EDR en profundidad." },
  { nombre:"Oro 1",     grupo:"Oro",      min:2400, max:2699,  color:"#713f12", light:"#fffbeb", grad:["#d97706","#92400e"], planet:"oro",      dificultad:"Avanzada+",    tiempo:8,  desc:"Threat hunting activo. Preparación para Diamante." },
  { nombre:"Diamante 3",grupo:"Diamante", min:2700, max:2999,  color:"#1e1b4b", light:"#ede9fe", grad:["#8b5cf6","#6d28d9"], planet:"diamante", dificultad:"Experta",      tiempo:7,  desc:"APT multi-fase. Zero-day simulado. Máxima presión." },
  { nombre:"Diamante 2",grupo:"Diamante", min:3000, max:3299,  color:"#1e1b4b", light:"#ede9fe", grad:["#7c3aed","#5b21b6"], planet:"diamante", dificultad:"Experta",      tiempo:6,  desc:"Supply chain attacks. Inteligencia de amenazas avanzada." },
  { nombre:"Diamante 1",grupo:"Diamante", min:3300, max:99999, color:"#1e1b4b", light:"#ede9fe", grad:["#6d28d9","#4c1d95"], planet:"diamante", dificultad:"Élite",        tiempo:5,  desc:"El nivel más alto. Solo los mejores analistas llegan aquí." },
];

const GRUPOS = ["Bronce","Plata","Oro","Diamante"];
const GRUPO_COLORS = { Bronce:"#d97706", Plata:"#64748b", Oro:"#b45309", Diamante:"#6d28d9" };
const GRUPO_BG     = { Bronce:"#fffbeb", Plata:"#f8fafc", Oro:"#fefce8", Diamante:"#f5f3ff" };

const PlanetSVG = ({ tipo, size=56 }) => {
  if (tipo==='bronce') return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs><radialGradient id="pb" cx="35%" cy="30%"><stop offset="0%" stopColor="#fcd34d"/><stop offset="50%" stopColor="#d97706"/><stop offset="100%" stopColor="#78350f"/></radialGradient></defs>
      <circle cx="50" cy="50" r="44" fill="url(#pb)"/>
      <ellipse cx="38" cy="36" rx="14" ry="5" fill="rgba(120,53,15,0.35)" transform="rotate(-15,38,36)"/>
      <ellipse cx="58" cy="58" rx="16" ry="4" fill="rgba(120,53,15,0.3)" transform="rotate(8,58,58)"/>
    </svg>
  );
  if (tipo==='plata') return (
    <svg width={size} height={size} viewBox="0 0 120 100">
      <defs>
        <radialGradient id="pp" cx="35%" cy="30%"><stop offset="0%" stopColor="#e2e8f0"/><stop offset="50%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#334155"/></radialGradient>
        <linearGradient id="pr" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="50%" stopColor="rgba(148,163,184,0.5)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient>
      </defs>
      <ellipse cx="60" cy="63" rx="56" ry="7" fill="url(#pr)" opacity="0.7"/>
      <circle cx="60" cy="50" r="40" fill="url(#pp)"/>
    </svg>
  );
  if (tipo==='oro') return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs><radialGradient id="po" cx="35%" cy="30%"><stop offset="0%" stopColor="#fde68a"/><stop offset="40%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#78350f"/></radialGradient></defs>
      <circle cx="50" cy="50" r="46" fill="url(#po)"/>
      <ellipse cx="50" cy="38" rx="40" ry="6" fill="rgba(120,53,15,0.2)" transform="rotate(-3,50,38)"/>
      <ellipse cx="50" cy="52" rx="42" ry="5" fill="rgba(120,53,15,0.15)" transform="rotate(2,50,52)"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="pd" cx="35%" cy="30%"><stop offset="0%" stopColor="#ddd6fe"/><stop offset="30%" stopColor="#8b5cf6"/><stop offset="70%" stopColor="#5b21b6"/><stop offset="100%" stopColor="#1e1b4b"/></radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="url(#pd)"/>
      <circle cx="36" cy="38" r="3" fill="rgba(221,214,254,0.7)"/>
      <circle cx="62" cy="44" r="2" fill="rgba(221,214,254,0.5)"/>
      <circle cx="48" cy="30" r="1.5" fill="rgba(221,214,254,0.6)"/>
    </svg>
  );
};

export default function ArenasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [grupoActivo, setGrupoActivo] = useState('Bronce');
  const [showGuestModal, setShowGuestModal] = useState(false);

  const copasUsuario = user?.copas || 0;
  const arenaUsuario = user?.arena || 'Bronce 3';
  const arenasFiltradas = ARENAS.filter(a => a.grupo === grupoActivo);

  const handleAccion = () => {
    if (user?.isGuest) { setShowGuestModal(true); return; }
    navigate('/sesion');
  };

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
    .fade-up{animation:fadeUp .3s ease forwards;}
    .arena-card{transition:transform .2s ease,box-shadow .2s ease;}
    .arena-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.1)!important;}
    .group-tab{transition:all .15s ease;}
    .group-tab:hover{opacity:.85;}
    .btn-main{transition:transform .15s ease,box-shadow .15s ease;}
    .btn-main:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,0.15)!important;}
  `;

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0f172a'}}>
      <style>{css}</style>

      {/* GUEST MODAL */}
      {showGuestModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',borderRadius:20,padding:40,maxWidth:420,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.15)'}}>
            <div style={{fontSize:48,marginBottom:16}}>🔒</div>
            <h2 style={{fontSize:22,fontWeight:800,color:'#0f172a',marginBottom:8}}>Función exclusiva</h2>
            <p style={{fontSize:14,color:'#64748b',lineHeight:1.7,marginBottom:28}}>Crea una cuenta gratis para acceder a las sesiones SOC y competir en las arenas.</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>navigate('/register')} style={{flex:1,padding:'12px',borderRadius:10,background:ACC,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>Crear cuenta gratis</button>
              <button onClick={()=>setShowGuestModal(false)} style={{padding:'12px 16px',borderRadius:10,background:'#f1f5f9',border:'none',color:'#64748b',fontWeight:600,fontSize:14,cursor:'pointer'}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',background:'#fff',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 8px rgba(0,0,0,0.05)',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>navigate('/')}>
          <img src="/logosoc.png" alt="SocBlast" style={{height:28}}/>
          <span style={{fontSize:15,fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
        </div>
        <button onClick={()=>navigate('/dashboard')} style={{background:'none',border:'1px solid #e2e8f0',color:'#64748b',padding:'5px 14px',borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>← Dashboard</button>
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'44px 40px 80px'}}>

        {/* HEADER */}
        <div className="fade-up" style={{marginBottom:40}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:100,background:'#eef2ff',border:'1px solid #c7d2fe',marginBottom:14}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:ACC}}/>
            <span style={{fontSize:11,fontWeight:700,color:ACC,letterSpacing:'1.5px'}}>SISTEMA DE ARENAS</span>
          </div>
          <h1 style={{fontSize:32,fontWeight:900,color:'#0f172a',letterSpacing:'-0.8px',marginBottom:8,lineHeight:1.1}}>Las 12 divisiones</h1>
          <p style={{fontSize:15,color:'#64748b',lineHeight:1.6}}>300 copas por división · 4 grupos · Un solo objetivo: llegar a Diamante 1.</p>
        </div>

        {/* POSICIÓN ACTUAL */}
        {user && (
          <div className="fade-up" style={{padding:'20px 24px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,0.05)',marginBottom:32,display:'flex',alignItems:'center',gap:20}}>
            <div style={{width:52,height:52,borderRadius:14,background:GRUPO_BG[arenaUsuario.split(' ')[0]]||'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #e8eaf0',flexShrink:0}}>
              <PlanetSVG tipo={(arenaUsuario.split(' ')[0]||'bronce').toLowerCase()} size={38}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:4}}>TU POSICIÓN ACTUAL</div>
              <div style={{fontSize:18,fontWeight:800,color:'#0f172a',letterSpacing:'-0.3px'}}>{arenaUsuario}</div>
            </div>
            <div style={{textAlign:'right',paddingRight:20,borderRight:'1px solid #e8eaf0'}}>
              <div style={{fontSize:26,fontWeight:900,color:ACC,letterSpacing:'-1px'}}>{copasUsuario.toLocaleString()}</div>
              <div style={{fontSize:11,color:'#94a3b8',fontWeight:500}}>copas totales</div>
            </div>
            <button className="btn-main" onClick={handleAccion} style={{padding:'11px 22px',borderRadius:10,background:ACC,border:'none',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 4px 14px rgba(79,70,229,0.3)'}}>
              Jugar ahora →
            </button>
          </div>
        )}

        {/* TABS */}
        <div style={{display:'flex',gap:6,marginBottom:24}}>
          {GRUPOS.map(g => {
            const active = grupoActivo === g;
            const c = GRUPO_COLORS[g];
            return (
              <button key={g} className="group-tab" onClick={()=>setGrupoActivo(g)}
                style={{padding:'8px 22px',borderRadius:100,border:`1.5px solid ${active?c:'#e2e8f0'}`,background:active?c:'#fff',color:active?'#fff':'#64748b',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                {g}
              </button>
            );
          })}
        </div>

        {/* DESCRIPCIÓN DEL GRUPO */}
        <div style={{marginBottom:20,padding:'12px 18px',borderRadius:10,background:GRUPO_BG[grupoActivo],border:`1px solid ${GRUPO_COLORS[grupoActivo]}25`,display:'flex',alignItems:'center',gap:10}}>
          <PlanetSVG tipo={grupoActivo.toLowerCase()} size={32}/>
          <div>
            <span style={{fontSize:13,fontWeight:700,color:GRUPO_COLORS[grupoActivo]}}>División {grupoActivo}</span>
            <span style={{fontSize:12,color:'#64748b',marginLeft:10}}>
              { grupoActivo==='Bronce' && 'Amenazas básicas · Ideal para analistas en formación' }
              { grupoActivo==='Plata'  && 'Ataques multi-fase · Correlación y movimiento lateral' }
              { grupoActivo==='Oro'    && 'APTs y ransomware · Threat hunting avanzado' }
              { grupoActivo==='Diamante' && 'Élite absoluta · Zero-days y operaciones APT complejas' }
            </span>
          </div>
        </div>

        {/* CARDS */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:40}}>
          {arenasFiltradas.map((arena,i) => {
            const esActual  = arena.nombre === arenaUsuario;
            const superada  = copasUsuario > arena.max;
            const bloqueada = copasUsuario < arena.min;
            const gc        = GRUPO_COLORS[arena.grupo];
            return (
              <div key={i} className="arena-card" style={{borderRadius:16,overflow:'hidden',border:`1.5px solid ${esActual?gc:'#e8eaf0'}`,background:'#fff',boxShadow:esActual?`0 8px 32px rgba(0,0,0,0.1)`:'0 2px 8px rgba(0,0,0,0.04)',position:'relative'}}>
                {esActual && (
                  <div style={{position:'absolute',top:12,right:12,zIndex:2,background:gc,color:'#fff',fontSize:9,fontWeight:800,padding:'3px 9px',borderRadius:100,letterSpacing:'1.5px'}}>TÚ AQUÍ</div>
                )}
                {/* Header */}
                <div style={{background:`linear-gradient(135deg,${arena.grad[0]},${arena.grad[1]})`,padding:'22px 20px',display:'flex',alignItems:'center',gap:14}}>
                  <PlanetSVG tipo={arena.planet} size={52}/>
                  <div>
                    <div style={{fontSize:18,fontWeight:900,color:'#fff',letterSpacing:'-0.3px',lineHeight:1}}>{arena.nombre}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',fontFamily:'monospace',marginTop:4}}>
                      {arena.min.toLocaleString()} — {arena.max===99999?'∞':arena.max.toLocaleString()} copas
                    </div>
                  </div>
                </div>
                {/* Body */}
                <div style={{padding:'16px 18px'}}>
                  <p style={{fontSize:12,color:'#475569',lineHeight:1.65,marginBottom:14}}>{arena.desc}</p>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:esActual?14:0}}>
                    <span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:arena.light,color:arena.color,fontWeight:600,border:`1px solid ${arena.color}20`}}>{arena.dificultad}</span>
                    <span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:'#f8fafc',color:'#475569',fontWeight:600,border:'1px solid #e8eaf0'}}>⏱ {arena.tiempo} min</span>
                    {superada  && <span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:'#ecfdf5',color:'#059669',fontWeight:600,border:'1px solid #bbf7d0'}}>✓ Superada</span>}
                    {bloqueada && <span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:'#fef2f2',color:'#dc2626',fontWeight:600,border:'1px solid #fecaca'}}>🔒 Bloqueada</span>}
                  </div>
                  {esActual && (
                    <button className="btn-main" onClick={handleAccion} style={{width:'100%',padding:'10px',borderRadius:9,background:gc,border:'none',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                      Jugar en {arena.nombre} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* PROGRESO GLOBAL */}
        <div style={{padding:'22px 24px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:14}}>PROGRESO GLOBAL</div>
          <div style={{display:'flex',gap:3,marginBottom:8}}>
            {ARENAS.map((a,i) => {
              const completada = copasUsuario > a.max;
              const actual = a.nombre === arenaUsuario;
              return <div key={i} style={{flex:1,height:8,borderRadius:3,background:completada?GRUPO_COLORS[a.grupo]:actual?`${GRUPO_COLORS[a.grupo]}50`:'#e8eaf0',transition:'background .3s'}}/>;
            })}
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:11,color:'#94a3b8'}}>Bronce 3</span>
            <span style={{fontSize:11,color:'#94a3b8'}}>Diamante 1</span>
          </div>
        </div>

      </div>
    </div>
  );
}