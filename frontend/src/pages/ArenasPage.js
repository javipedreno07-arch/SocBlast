import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ACC = '#4f46e5';

const ARENAS = [
  { nombre:"Bronce 3",  grupo:"Bronce",   min:0,    max:299,   color:"#92400e", light:"#fef3c7", grad:["#f59e0b","#d97706"], planet:"bronce",   dificultad:"Básica",      tiempo:20, desc:"Amenazas básicas. Brute force, phishing simple. Ideal para empezar." },
  { nombre:"Bronce 2",  grupo:"Bronce",   min:300,  max:599,   color:"#92400e", light:"#fef3c7", grad:["#f59e0b","#b45309"], planet:"bronce",   dificultad:"Básica",      tiempo:20, desc:"Malware básico y análisis de logs simples." },
  { nombre:"Bronce 1",  grupo:"Bronce",   min:600,  max:899,   color:"#92400e", light:"#fef3c7", grad:["#d97706","#92400e"], planet:"bronce",   dificultad:"Básica+",     tiempo:18, desc:"Correlación simple de eventos. Preparación para Plata." },
  { nombre:"Plata 3",   grupo:"Plata",    min:900,  max:1199,  color:"#475569", light:"#f1f5f9", grad:["#94a3b8","#64748b"], planet:"plata",    dificultad:"Intermedia",  tiempo:15, desc:"Movimiento lateral y escalada de privilegios." },
  { nombre:"Plata 2",   grupo:"Plata",    min:1200, max:1499,  color:"#475569", light:"#f1f5f9", grad:["#64748b","#475569"], planet:"plata",    dificultad:"Intermedia",  tiempo:15, desc:"C2 y persistencia. Análisis de comportamiento." },
  { nombre:"Plata 1",   grupo:"Plata",    min:1500, max:1799,  color:"#334155", light:"#f1f5f9", grad:["#475569","#334155"], planet:"plata",    dificultad:"Intermedia+", tiempo:13, desc:"Detección avanzada. Preparación para Oro." },
  { nombre:"Oro 3",     grupo:"Oro",      min:1800, max:2099,  color:"#78350f", light:"#fffbeb", grad:["#fbbf24","#f59e0b"], planet:"oro",      dificultad:"Avanzada",    tiempo:10, desc:"Ransomware y exfiltración. Múltiples vectores de ataque." },
  { nombre:"Oro 2",     grupo:"Oro",      min:2100, max:2399,  color:"#78350f", light:"#fffbeb", grad:["#f59e0b","#d97706"], planet:"oro",      dificultad:"Avanzada",    tiempo:10, desc:"APT inicial. Logs SIEM/EDR en profundidad." },
  { nombre:"Oro 1",     grupo:"Oro",      min:2400, max:2699,  color:"#713f12", light:"#fffbeb", grad:["#d97706","#92400e"], planet:"oro",      dificultad:"Avanzada+",   tiempo:8,  desc:"Threat hunting activo. Preparación para Diamante." },
  { nombre:"Diamante 3",grupo:"Diamante", min:2700, max:2999,  color:"#1e1b4b", light:"#ede9fe", grad:["#8b5cf6","#6d28d9"], planet:"diamante", dificultad:"Experta",     tiempo:7,  desc:"APT multi-fase. Zero-day simulado. Máxima presión." },
  { nombre:"Diamante 2",grupo:"Diamante", min:3000, max:3299,  color:"#1e1b4b", light:"#ede9fe", grad:["#7c3aed","#5b21b6"], planet:"diamante", dificultad:"Experta",     tiempo:6,  desc:"Supply chain attacks. Inteligencia de amenazas avanzada." },
  { nombre:"Diamante 1",grupo:"Diamante", min:3300, max:99999, color:"#1e1b4b", light:"#ede9fe", grad:["#6d28d9","#4c1d95"], planet:"diamante", dificultad:"Élite",       tiempo:5,  desc:"El nivel más alto. Solo los mejores analistas llegan aquí." },
];

const GRUPOS = ["Bronce","Plata","Oro","Diamante"];
const GRUPO_COLORS = { Bronce:"#d97706", Plata:"#64748b", Oro:"#b45309", Diamante:"#6d28d9" };
const GRUPO_LIGHT  = { Bronce:"#fffbeb", Plata:"#f8fafc", Oro:"#fefce8", Diamante:"#f5f3ff" };
const GRUPO_DESC   = {
  Bronce:   "Amenazas básicas · Ideal para analistas en formación",
  Plata:    "Ataques multi-fase · Correlación y movimiento lateral",
  Oro:      "APTs y ransomware · Threat hunting avanzado",
  Diamante: "Élite absoluta · Zero-days y operaciones APT complejas",
};

const PlanetSVG = ({ tipo, size=52 }) => {
  if (tipo==='bronce') return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs><radialGradient id={`pb${size}`} cx="35%" cy="30%"><stop offset="0%" stopColor="#fcd34d"/><stop offset="50%" stopColor="#d97706"/><stop offset="100%" stopColor="#78350f"/></radialGradient></defs>
      <circle cx="50" cy="50" r="44" fill={`url(#pb${size})`}/>
      <ellipse cx="38" cy="36" rx="14" ry="5" fill="rgba(120,53,15,0.35)" transform="rotate(-15,38,36)"/>
      <ellipse cx="58" cy="58" rx="16" ry="4" fill="rgba(120,53,15,0.3)" transform="rotate(8,58,58)"/>
    </svg>
  );
  if (tipo==='plata') return (
    <svg width={size} height={size} viewBox="0 0 120 100">
      <defs>
        <radialGradient id={`pp${size}`} cx="35%" cy="30%"><stop offset="0%" stopColor="#e2e8f0"/><stop offset="50%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#334155"/></radialGradient>
        <linearGradient id={`pr${size}`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="50%" stopColor="rgba(148,163,184,0.5)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient>
      </defs>
      <ellipse cx="60" cy="63" rx="56" ry="7" fill={`url(#pr${size})`} opacity="0.7"/>
      <circle cx="60" cy="50" r="40" fill={`url(#pp${size})`}/>
    </svg>
  );
  if (tipo==='oro') return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs><radialGradient id={`po${size}`} cx="35%" cy="30%"><stop offset="0%" stopColor="#fde68a"/><stop offset="40%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#78350f"/></radialGradient></defs>
      <circle cx="50" cy="50" r="46" fill={`url(#po${size})`}/>
      <ellipse cx="50" cy="38" rx="40" ry="6" fill="rgba(120,53,15,0.2)" transform="rotate(-3,50,38)"/>
      <ellipse cx="50" cy="52" rx="42" ry="5" fill="rgba(120,53,15,0.15)" transform="rotate(2,50,52)"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs><radialGradient id={`pd${size}`} cx="35%" cy="30%"><stop offset="0%" stopColor="#ddd6fe"/><stop offset="30%" stopColor="#8b5cf6"/><stop offset="70%" stopColor="#5b21b6"/><stop offset="100%" stopColor="#1e1b4b"/></radialGradient></defs>
      <circle cx="50" cy="50" r="42" fill={`url(#pd${size})`}/>
      <circle cx="36" cy="38" r="3" fill="rgba(221,214,254,0.7)"/>
      <circle cx="62" cy="44" r="2" fill="rgba(221,214,254,0.5)"/>
      <circle cx="48" cy="30" r="1.5" fill="rgba(221,214,254,0.6)"/>
    </svg>
  );
};

const IC = {
  bolt:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  award: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  user:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  chart: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  flask: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>,
  home:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  book:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  target:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
};
const Icon = ({name,size=15,color='currentColor'}) => (
  <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',color,width:size,height:size,flexShrink:0}}>
    {React.cloneElement(IC[name]||IC.target,{width:size,height:size})}
  </span>
);

export default function ArenasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [grupoActivo,    setGrupoActivo]    = useState('Bronce');
  const [showGuestModal, setShowGuestModal] = useState(false);

  const puntosUsuario = user?.copas || 0;
  const arenaUsuario  = user?.arena || 'Bronce 3';
  const arenasFiltradas = ARENAS.filter(a => a.grupo === grupoActivo);

  const handleAccion = () => {
    if (user?.isGuest) { setShowGuestModal(true); return; }
    navigate('/sesion');
  };

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    .fu{animation:fadeUp .3s ease forwards;}
    .s1{animation:fadeUp .3s ease .06s both;}
    .nb:hover{background:rgba(79,70,229,0.06)!important;color:#4f46e5!important;}
    .arena-card{transition:transform .2s ease,box-shadow .2s ease;}
    .arena-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.12)!important;}
    .gtab:hover{opacity:.85;}
    .play-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,0.18)!important;}
  `;

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",color:'#0f172a'}}>
      <style>{css}</style>

      {/* GUEST MODAL */}
      {showGuestModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#fff',borderRadius:20,padding:40,maxWidth:420,width:'100%',textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.15)'}}>
            <div style={{fontSize:48,marginBottom:16}}>🔒</div>
            <h2 style={{fontSize:22,fontWeight:800,color:'#0f172a',marginBottom:8}}>Función exclusiva</h2>
            <p style={{fontSize:14,color:'#64748b',lineHeight:1.7,marginBottom:28}}>Crea una cuenta gratis para competir en las arenas.</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>navigate('/register')} style={{flex:1,padding:'12px',borderRadius:10,background:ACC,border:'none',color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer'}}>Crear cuenta gratis</button>
              <button onClick={()=>setShowGuestModal(false)} style={{padding:'12px 16px',borderRadius:10,background:'#f1f5f9',border:'none',color:'#64748b',fontWeight:600,fontSize:14,cursor:'pointer'}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{position:'sticky',top:0,zIndex:50,height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',background:'rgba(255,255,255,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 16px rgba(79,70,229,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={()=>navigate('/')}>
          <img src="/logosoc.png" alt="SocBlast" style={{height:28}}/>
          <span style={{fontSize:16,fontWeight:800,color:'#0f172a',letterSpacing:'-0.3px'}}>Soc<span style={{color:ACC}}>Blast</span></span>
        </div>
        <div style={{display:'flex',gap:2}}>
          {[{l:'Inicio',i:'home',p:'/dashboard'},{l:'Sesiones',i:'bolt',p:'/sesion'},{l:'Labs',i:'flask',p:'/lab'},{l:'Ranking',i:'chart',p:'/ranking'},{l:'Perfil',i:'user',p:'/perfil'}].map((item,i)=>(
            <button key={i} className="nb" onClick={()=>navigate(item.p)}
              style={{padding:'6px 12px',borderRadius:8,background:'none',border:'none',color:'#64748b',fontSize:12,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:5,transition:'all .15s'}}>
              <Icon name={item.i} size={14} color="#64748b"/>{item.l}
            </button>
          ))}
        </div>
        <button onClick={handleAccion} style={{padding:'8px 18px',borderRadius:100,background:`linear-gradient(135deg,${ACC},#6366f1)`,border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:`0 4px 14px ${ACC}30`}}>
          Jugar ahora →
        </button>
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 32px 80px'}}>

        {/* HEADER */}
        <div className="fu" style={{marginBottom:36}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:100,background:'#eef2ff',border:'1px solid #c7d2fe',marginBottom:14}}>
            <Icon name="target" size={11} color={ACC}/>
            <span style={{fontSize:11,fontWeight:700,color:ACC,letterSpacing:'1px'}}>SISTEMA DE ARENAS</span>
          </div>
          <h1 style={{fontSize:32,fontWeight:900,color:'#0f172a',letterSpacing:'-0.8px',marginBottom:8,lineHeight:1.1}}>Las 12 divisiones</h1>
          <p style={{fontSize:15,color:'#64748b',lineHeight:1.6}}>300 puntos por división · 4 grupos · Un solo objetivo: llegar a Diamante 1.</p>
        </div>

        {/* POSICION ACTUAL */}
        {user && (
          <div className="s1" style={{padding:'20px 24px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 4px 20px rgba(79,70,229,0.08)',marginBottom:32,display:'flex',alignItems:'center',gap:20}}>
            <div style={{width:52,height:52,borderRadius:14,background:GRUPO_LIGHT[arenaUsuario.split(' ')[0]]||'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #e8eaf0',flexShrink:0}}>
              <PlanetSVG tipo={(arenaUsuario.split(' ')[0]||'bronce').toLowerCase()} size={38}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:4}}>TU POSICIÓN ACTUAL</div>
              <div style={{fontSize:18,fontWeight:800,color:'#0f172a',letterSpacing:'-0.3px'}}>{arenaUsuario}</div>
            </div>
            <div style={{textAlign:'right',paddingRight:20,borderRight:'1px solid #e8eaf0'}}>
              <div style={{fontSize:26,fontWeight:900,color:ACC,letterSpacing:'-1px'}}>{puntosUsuario.toLocaleString()}</div>
              <div style={{fontSize:11,color:'#94a3b8',fontWeight:500}}>puntos totales</div>
            </div>
            <button className="play-btn" onClick={handleAccion} style={{padding:'11px 22px',borderRadius:100,background:`linear-gradient(135deg,${ACC},#6366f1)`,border:'none',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:`0 4px 14px ${ACC}30`,transition:'all .2s'}}>
              Jugar ahora →
            </button>
          </div>
        )}

        {/* TABS GRUPOS */}
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {GRUPOS.map(g => {
            const active = grupoActivo===g;
            const c = GRUPO_COLORS[g];
            return (
              <button key={g} className="gtab" onClick={()=>setGrupoActivo(g)}
                style={{padding:'9px 22px',borderRadius:100,border:`2px solid ${active?c:'#e2e8f0'}`,background:active?c:'#fff',color:active?'#fff':'#64748b',fontWeight:700,fontSize:13,cursor:'pointer',transition:'all .15s',boxShadow:active?`0 4px 14px ${c}30`:'none'}}>
                {g}
              </button>
            );
          })}
        </div>

        {/* DESCRIPCION GRUPO */}
        <div style={{marginBottom:20,padding:'12px 18px',borderRadius:12,background:GRUPO_LIGHT[grupoActivo],border:`1px solid ${GRUPO_COLORS[grupoActivo]}25`,display:'flex',alignItems:'center',gap:12}}>
          <PlanetSVG tipo={grupoActivo.toLowerCase()} size={34}/>
          <div>
            <span style={{fontSize:13,fontWeight:700,color:GRUPO_COLORS[grupoActivo]}}>División {grupoActivo}</span>
            <span style={{fontSize:12,color:'#64748b',marginLeft:10}}>{GRUPO_DESC[grupoActivo]}</span>
          </div>
        </div>

        {/* CARDS */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:40}}>
          {arenasFiltradas.map((arena,i) => {
            const esActual  = arena.nombre===arenaUsuario;
            const superada  = puntosUsuario>arena.max;
            const bloqueada = puntosUsuario<arena.min;
            const gc        = GRUPO_COLORS[arena.grupo];
            return (
              <div key={i} className="arena-card" style={{borderRadius:16,overflow:'hidden',border:`2px solid ${esActual?gc:'#e8eaf0'}`,background:'#fff',boxShadow:esActual?`0 12px 40px ${gc}25`:'0 2px 8px rgba(0,0,0,0.05)',position:'relative'}}>
                {esActual && (
                  <div style={{position:'absolute',top:12,right:12,zIndex:2,background:gc,color:'#fff',fontSize:9,fontWeight:800,padding:'3px 10px',borderRadius:100,letterSpacing:'1.5px',boxShadow:`0 2px 8px ${gc}50`}}>TÚ AQUÍ</div>
                )}
                <div style={{background:`linear-gradient(135deg,${arena.grad[0]},${arena.grad[1]})`,padding:'22px 20px',display:'flex',alignItems:'center',gap:14,position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:'-20px',right:'-20px',width:'80px',height:'80px',borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}/>
                  <PlanetSVG tipo={arena.planet} size={52}/>
                  <div>
                    <div style={{fontSize:18,fontWeight:900,color:'#fff',letterSpacing:'-0.3px',lineHeight:1}}>{arena.nombre}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',fontFamily:'monospace',marginTop:4}}>
                      {arena.min.toLocaleString()} — {arena.max===99999?'∞':arena.max.toLocaleString()} pts
                    </div>
                  </div>
                </div>
                <div style={{padding:'16px 18px'}}>
                  <p style={{fontSize:12,color:'#475569',lineHeight:1.65,marginBottom:14}}>{arena.desc}</p>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:esActual?14:0}}>
                    <span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:arena.light,color:arena.color,fontWeight:600,border:`1px solid ${arena.color}20`}}>{arena.dificultad}</span>
                    <span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:'#f8fafc',color:'#475569',fontWeight:600,border:'1px solid #e8eaf0'}}>⏱ {arena.tiempo} min</span>
                    {superada  && <span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:'#ecfdf5',color:'#059669',fontWeight:600,border:'1px solid #bbf7d0'}}>✓ Superada</span>}
                    {bloqueada && <span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:'#fef2f2',color:'#dc2626',fontWeight:600,border:'1px solid #fecaca'}}>🔒 Bloqueada</span>}
                  </div>
                  {esActual && (
                    <button className="play-btn" onClick={handleAccion} style={{width:'100%',padding:'11px',borderRadius:10,background:`linear-gradient(135deg,${gc},${gc}dd)`,border:'none',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',transition:'all .15s',boxShadow:`0 4px 14px ${gc}40`}}>
                      Jugar en {arena.nombre} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* PROGRESO GLOBAL */}
        <div style={{padding:'22px 24px',borderRadius:16,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 12px rgba(0,0,0,0.05)'}}>
          <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:14}}>PROGRESO GLOBAL</div>
          <div style={{display:'flex',gap:3,marginBottom:8}}>
            {ARENAS.map((a,i) => {
              const completada = puntosUsuario>a.max;
              const actual = a.nombre===arenaUsuario;
              return <div key={i} style={{flex:1,height:8,borderRadius:3,background:completada?GRUPO_COLORS[a.grupo]:actual?`${GRUPO_COLORS[a.grupo]}60`:'#e8eaf0',transition:'background .3s'}}/>;
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