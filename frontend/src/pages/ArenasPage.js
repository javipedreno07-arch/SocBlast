import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SBNav, Icon, ACC, BG, BASE_CSS, SBSpinner, ARENA_COLORS } from './SBLayout';

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

const GRUPOS      = ["Bronce","Plata","Oro","Diamante"];
const GRUPO_CLR   = { Bronce:"#d97706", Plata:"#64748b", Oro:"#b45309", Diamante:"#6d28d9" };
const GRUPO_LIGHT = { Bronce:"#fffbeb", Plata:"#f8fafc", Oro:"#fefce8", Diamante:"#f5f3ff" };
const GRUPO_DESC  = { Bronce:"Amenazas básicas · Ideal para analistas en formación", Plata:"Ataques multi-fase · Correlación y movimiento lateral", Oro:"APTs y ransomware · Threat hunting avanzado", Diamante:"Élite absoluta · Zero-days y operaciones APT complejas" };

const PlanetSVG = ({ tipo, size=52 }) => {
  const id = `${tipo}${size}`;
  if (tipo==='bronce') return (<svg width={size} height={size} viewBox="0 0 100 100"><defs><radialGradient id={id} cx="35%" cy="30%"><stop offset="0%" stopColor="#fcd34d"/><stop offset="50%" stopColor="#d97706"/><stop offset="100%" stopColor="#78350f"/></radialGradient></defs><circle cx="50" cy="50" r="44" fill={`url(#${id})`}/><ellipse cx="38" cy="36" rx="14" ry="5" fill="rgba(120,53,15,0.35)" transform="rotate(-15,38,36)"/><ellipse cx="58" cy="58" rx="16" ry="4" fill="rgba(120,53,15,0.3)" transform="rotate(8,58,58)"/></svg>);
  if (tipo==='plata') return (<svg width={size} height={size} viewBox="0 0 120 100"><defs><radialGradient id={id} cx="35%" cy="30%"><stop offset="0%" stopColor="#e2e8f0"/><stop offset="50%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#334155"/></radialGradient><linearGradient id={id+'r'} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="50%" stopColor="rgba(148,163,184,0.5)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient></defs><ellipse cx="60" cy="63" rx="56" ry="7" fill={`url(#${id}r)`} opacity="0.7"/><circle cx="60" cy="50" r="40" fill={`url(#${id})`}/></svg>);
  if (tipo==='oro') return (<svg width={size} height={size} viewBox="0 0 100 100"><defs><radialGradient id={id} cx="35%" cy="30%"><stop offset="0%" stopColor="#fde68a"/><stop offset="40%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#78350f"/></radialGradient></defs><circle cx="50" cy="50" r="46" fill={`url(#${id})`}/><ellipse cx="50" cy="38" rx="40" ry="6" fill="rgba(120,53,15,0.2)" transform="rotate(-3,50,38)"/><ellipse cx="50" cy="52" rx="42" ry="5" fill="rgba(120,53,15,0.15)" transform="rotate(2,50,52)"/></svg>);
  return (<svg width={size} height={size} viewBox="0 0 100 100"><defs><radialGradient id={id} cx="35%" cy="30%"><stop offset="0%" stopColor="#ddd6fe"/><stop offset="30%" stopColor="#8b5cf6"/><stop offset="70%" stopColor="#5b21b6"/><stop offset="100%" stopColor="#1e1b4b"/></radialGradient></defs><circle cx="50" cy="50" r="42" fill={`url(#${id})`}/><circle cx="36" cy="38" r="3" fill="rgba(221,214,254,0.7)"/><circle cx="62" cy="44" r="2" fill="rgba(221,214,254,0.5)"/><circle cx="48" cy="30" r="1.5" fill="rgba(221,214,254,0.6)"/></svg>);
};

export default function ArenasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [grupoActivo, setGrupoActivo] = useState('Bronce');
  const [showModal,   setShowModal]   = useState(false);

  const avatarConfig  = user?.avatar_config || null;
  const foto          = user?.foto_perfil || '';
  const puntosUsuario = user?.copas || 0;
  const arenaUsuario  = user?.arena || 'Bronce 3';
  const arenasFiltradas = ARENAS.filter(a => a.grupo===grupoActivo);

  const handleJugar = () => {
    if (user?.isGuest) { setShowModal(true); return; }
    navigate('/sesion');
  };

  return (
    <div style={{minHeight:'100vh',background:BG,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",color:'#0f172a'}}>
      <style>{BASE_CSS + `.arena-card{transition:transform .2s ease,box-shadow .2s ease;}.arena-card:hover{transform:translateY(-5px);box-shadow:0 20px 48px rgba(0,0,0,0.12)!important;}.gtab:hover{opacity:.85;}.pb:hover{opacity:.88;transform:translateY(-1px);}`}</style>

      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.6)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(4px)'}}>
          <div style={{background:'#fff',borderRadius:24,padding:44,maxWidth:420,width:'100%',textAlign:'center',boxShadow:'0 32px 80px rgba(0,0,0,0.2)'}}>
            <div style={{fontSize:52,marginBottom:16}}>🔒</div>
            <h2 style={{fontSize:22,fontWeight:800,color:'#0f172a',marginBottom:8}}>Función exclusiva</h2>
            <p style={{fontSize:14,color:'#64748b',lineHeight:1.7,marginBottom:28}}>Crea una cuenta gratis para competir en las arenas.</p>
            <div style={{display:'flex',gap:10}}>
              <button className="sb-btn-primary" onClick={()=>navigate('/register')} style={{flex:1,padding:'13px',fontSize:14}}>Crear cuenta gratis</button>
              <button onClick={()=>setShowModal(false)} style={{padding:'13px 18px',borderRadius:100,background:'#f1f5f9',border:'none',color:'#64748b',fontWeight:600,fontSize:14,cursor:'pointer'}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <SBNav user={user} avatarConfig={avatarConfig} foto={foto} activePage="/arenas" navigate={navigate}
        extra={<button className="sb-btn-primary" onClick={handleJugar} style={{padding:'8px 18px',fontSize:13,marginLeft:8}}>Jugar ahora →</button>}/>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 32px 80px'}}>

        {/* HEADER */}
        <div className="fu" style={{marginBottom:36}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 14px',borderRadius:100,background:'#eef2ff',border:'1px solid #c7d2fe',marginBottom:14}}>
            <Icon name="target" size={11} color={ACC}/>
            <span style={{fontSize:11,fontWeight:700,color:ACC,letterSpacing:'1.5px'}}>SISTEMA DE ARENAS</span>
          </div>
          <h1 style={{fontSize:32,fontWeight:900,color:'#0f172a',letterSpacing:'-0.8px',marginBottom:8,lineHeight:1.1}}>Las 12 divisiones</h1>
          <p style={{fontSize:15,color:'#64748b',lineHeight:1.6}}>300 puntos por división · 4 grupos · Un solo objetivo: llegar a Diamante 1.</p>
        </div>

        {/* POSICION ACTUAL */}
        {user && (
          <div className="s1" style={{padding:'20px 28px',borderRadius:20,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 4px 24px rgba(79,70,229,0.08)',marginBottom:32,display:'flex',alignItems:'center',gap:20}}>
            <div style={{width:56,height:56,borderRadius:16,background:GRUPO_LIGHT[arenaUsuario.split(' ')[0]]||'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #e8eaf0',flexShrink:0}}>
              <PlanetSVG tipo={(arenaUsuario.split(' ')[0]||'bronce').toLowerCase()} size={40}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:4}}>TU POSICIÓN ACTUAL</div>
              <div style={{fontSize:20,fontWeight:800,color:'#0f172a',letterSpacing:'-0.3px'}}>{arenaUsuario}</div>
            </div>
            <div style={{textAlign:'right',paddingRight:24,borderRight:'1px solid #e8eaf0'}}>
              <div style={{fontSize:28,fontWeight:900,color:ACC,letterSpacing:'-1px'}}>{puntosUsuario.toLocaleString()}</div>
              <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>puntos totales</div>
            </div>
            <button className="sb-btn-primary pb" onClick={handleJugar} style={{padding:'12px 24px',fontSize:13,flexShrink:0}}>Jugar ahora →</button>
          </div>
        )}

        {/* TABS GRUPOS */}
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {GRUPOS.map(g => {
            const active = grupoActivo===g;
            const c = GRUPO_CLR[g];
            return (
              <button key={g} className="gtab" onClick={()=>setGrupoActivo(g)}
                style={{padding:'9px 24px',borderRadius:100,border:`2px solid ${active?c:'#e8eaf0'}`,background:active?c:'#fff',color:active?'#fff':'#64748b',fontWeight:700,fontSize:13,cursor:'pointer',transition:'all .15s',boxShadow:active?`0 4px 16px ${c}30`:'none'}}>
                {g}
              </button>
            );
          })}
        </div>

        {/* DESCRIPCION GRUPO */}
        <div style={{marginBottom:20,padding:'14px 20px',borderRadius:14,background:GRUPO_LIGHT[grupoActivo],border:`1px solid ${GRUPO_CLR[grupoActivo]}20`,display:'flex',alignItems:'center',gap:14}}>
          <PlanetSVG tipo={grupoActivo.toLowerCase()} size={36}/>
          <div>
            <span style={{fontSize:14,fontWeight:700,color:GRUPO_CLR[grupoActivo]}}>División {grupoActivo}</span>
            <span style={{fontSize:13,color:'#64748b',marginLeft:10}}>{GRUPO_DESC[grupoActivo]}</span>
          </div>
        </div>

        {/* CARDS */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,marginBottom:40}}>
          {arenasFiltradas.map((arena,i) => {
            const esActual  = arena.nombre===arenaUsuario;
            const superada  = puntosUsuario>arena.max;
            const bloqueada = puntosUsuario<arena.min;
            const gc        = GRUPO_CLR[arena.grupo];
            return (
              <div key={i} className="arena-card" style={{borderRadius:20,overflow:'hidden',border:`2px solid ${esActual?gc:'#e8eaf0'}`,background:'#fff',boxShadow:esActual?`0 16px 48px ${gc}25`:'0 2px 12px rgba(0,0,0,0.05)',position:'relative'}}>
                {esActual && <div style={{position:'absolute',top:14,right:14,zIndex:2,background:gc,color:'#fff',fontSize:9,fontWeight:800,padding:'4px 11px',borderRadius:100,letterSpacing:'1.5px',boxShadow:`0 4px 12px ${gc}60`}}>TÚ AQUÍ</div>}
                <div style={{background:`linear-gradient(135deg,${arena.grad[0]},${arena.grad[1]})`,padding:'24px 20px',display:'flex',alignItems:'center',gap:16,position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:'-30px',right:'-30px',width:'100px',height:'100px',borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}/>
                  <PlanetSVG tipo={arena.planet} size={56}/>
                  <div>
                    <div style={{fontSize:20,fontWeight:900,color:'#fff',letterSpacing:'-0.3px',lineHeight:1}}>{arena.nombre}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.65)',fontFamily:'monospace',marginTop:5}}>
                      {arena.min.toLocaleString()} — {arena.max===99999?'∞':arena.max.toLocaleString()} pts
                    </div>
                  </div>
                </div>
                <div style={{padding:'18px 20px'}}>
                  <p style={{fontSize:13,color:'#475569',lineHeight:1.65,marginBottom:14}}>{arena.desc}</p>
                  <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:esActual?16:0}}>
                    <span style={{fontSize:11,padding:'4px 11px',borderRadius:100,background:arena.light,color:arena.color,fontWeight:700,border:`1px solid ${arena.color}20`}}>{arena.dificultad}</span>
                    <span style={{fontSize:11,padding:'4px 11px',borderRadius:100,background:'#f8fafc',color:'#64748b',fontWeight:600,border:'1px solid #e8eaf0'}}>⏱ {arena.tiempo} min</span>
                    {superada  && <span style={{fontSize:11,padding:'4px 11px',borderRadius:100,background:'#ecfdf5',color:'#059669',fontWeight:700,border:'1px solid #bbf7d0'}}>✓ Superada</span>}
                    {bloqueada && <span style={{fontSize:11,padding:'4px 11px',borderRadius:100,background:'#fef2f2',color:'#dc2626',fontWeight:700,border:'1px solid #fecaca'}}>🔒 Bloqueada</span>}
                  </div>
                  {esActual && (
                    <button className="pb" onClick={handleJugar} style={{width:'100%',padding:'12px',borderRadius:12,background:`linear-gradient(135deg,${gc},${gc}dd)`,border:'none',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:`0 4px 16px ${gc}40`,transition:'all .2s'}}>
                      Jugar en {arena.nombre} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* PROGRESO GLOBAL */}
        <div style={{padding:'24px 28px',borderRadius:20,background:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 12px rgba(79,70,229,0.05)'}}>
          <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:16}}>PROGRESO GLOBAL — 12 DIVISIONES</div>
          <div style={{display:'flex',gap:3,marginBottom:10}}>
            {ARENAS.map((a,i) => {
              const completada = puntosUsuario>a.max;
              const actual = a.nombre===arenaUsuario;
              return <div key={i} style={{flex:1,height:10,borderRadius:4,background:completada?GRUPO_CLR[a.grupo]:actual?`${GRUPO_CLR[a.grupo]}60`:'#e8eaf0',transition:'background .3s',position:'relative'}}>
                {actual && <div style={{position:'absolute',top:-3,left:'50%',transform:'translateX(-50%)',width:4,height:4,borderRadius:'50%',background:GRUPO_CLR[a.grupo],boxShadow:`0 0 6px ${GRUPO_CLR[a.grupo]}`}}/>}
              </div>;
            })}
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:11,color:'#94a3b8'}}>Bronce 3 — 0 pts</span>
            <span style={{fontSize:11,color:'#94a3b8'}}>Diamante 1 — 3.300+ pts</span>
          </div>
        </div>

      </div>
    </div>
  );
}