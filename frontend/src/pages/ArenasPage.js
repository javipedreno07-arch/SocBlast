import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ARENAS = [
  { nombre: "Bronce 3", grupo: "Bronce", min: 0,    max: 299,   color: "#92400e", light: "#fef3c7", grad: ["#f59e0b","#d97706"], planet: "bronce", dificultad: "Básica", tiempo: 20, desc: "Amenazas básicas. Brute force, phishing simple. Ideal para empezar." },
  { nombre: "Bronce 2", grupo: "Bronce", min: 300,  max: 599,   color: "#92400e", light: "#fef3c7", grad: ["#f59e0b","#b45309"], planet: "bronce", dificultad: "Básica", tiempo: 20, desc: "Malware básico y análisis de logs simples." },
  { nombre: "Bronce 1", grupo: "Bronce", min: 600,  max: 899,   color: "#92400e", light: "#fef3c7", grad: ["#d97706","#92400e"], planet: "bronce", dificultad: "Básica+", tiempo: 18, desc: "Correlación simple de eventos. Preparación para Plata." },
  { nombre: "Plata 3",  grupo: "Plata",  min: 900,  max: 1199,  color: "#475569", light: "#f1f5f9", grad: ["#94a3b8","#64748b"], planet: "plata",  dificultad: "Intermedia", tiempo: 15, desc: "Movimiento lateral y escalada de privilegios." },
  { nombre: "Plata 2",  grupo: "Plata",  min: 1200, max: 1499,  color: "#475569", light: "#f1f5f9", grad: ["#64748b","#475569"], planet: "plata",  dificultad: "Intermedia", tiempo: 15, desc: "C2 y persistencia. Análisis de comportamiento." },
  { nombre: "Plata 1",  grupo: "Plata",  min: 1500, max: 1799,  color: "#334155", light: "#f1f5f9", grad: ["#475569","#334155"], planet: "plata",  dificultad: "Intermedia+", tiempo: 13, desc: "Detección avanzada. Preparación para Oro." },
  { nombre: "Oro 3",    grupo: "Oro",    min: 1800, max: 2099,  color: "#78350f", light: "#fffbeb", grad: ["#fbbf24","#f59e0b"], planet: "oro",    dificultad: "Avanzada", tiempo: 10, desc: "Ransomware y exfiltración de datos. Múltiples vectores." },
  { nombre: "Oro 2",    grupo: "Oro",    min: 2100, max: 2399,  color: "#78350f", light: "#fffbeb", grad: ["#f59e0b","#d97706"], planet: "oro",    dificultad: "Avanzada", tiempo: 10, desc: "APT inicial. Logs SIEM/EDR en profundidad." },
  { nombre: "Oro 1",    grupo: "Oro",    min: 2400, max: 2699,  color: "#713f12", light: "#fffbeb", grad: ["#d97706","#92400e"], planet: "oro",    dificultad: "Avanzada+", tiempo: 8,  desc: "Threat hunting activo. Preparación para Diamante." },
  { nombre: "Diamante 3","grupo":"Diamante",min:2700,max:2999,  color: "#1e1b4b", light: "#ede9fe", grad: ["#8b5cf6","#6d28d9"], planet: "diamante", dificultad: "Experta", tiempo: 7, desc: "APT multi-fase. Zero-day simulado. Máxima presión." },
  { nombre: "Diamante 2","grupo":"Diamante",min:3000,max:3299,  color: "#1e1b4b", light: "#ede9fe", grad: ["#7c3aed","#5b21b6"], planet: "diamante", dificultad: "Experta", tiempo: 6, desc: "Supply chain attacks. Inteligencia de amenazas avanzada." },
  { nombre: "Diamante 1","grupo":"Diamante",min:3300,max:99999, color: "#1e1b4b", light: "#ede9fe", grad: ["#6d28d9","#4c1d95"], planet: "diamante", dificultad: "Élite", tiempo: 5, desc: "El nivel más alto. Solo los mejores analistas llegan aquí." },
];

const GRUPOS = ["Bronce", "Plata", "Oro", "Diamante"];
const GRUPO_COLORS = { Bronce: "#f59e0b", Plata: "#94a3b8", Oro: "#fbbf24", Diamante: "#8b5cf6" };
const GRUPO_LIGHT = { Bronce: "#fffbeb", Plata: "#f8fafc", Oro: "#fefce8", Diamante: "#f5f3ff" };

const PlanetSVG = ({ tipo, size = 60 }) => {
  if (tipo === 'bronce') return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="pb" cx="35%" cy="30%"><stop offset="0%" stopColor="#fcd34d"/><stop offset="50%" stopColor="#d97706"/><stop offset="100%" stopColor="#78350f"/></radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#pb)"/>
      <ellipse cx="38" cy="36" rx="14" ry="5" fill="rgba(120,53,15,0.35)" transform="rotate(-15,38,36)"/>
      <ellipse cx="58" cy="58" rx="16" ry="4" fill="rgba(120,53,15,0.3)" transform="rotate(8,58,58)"/>
    </svg>
  );
  if (tipo === 'plata') return (
    <svg width={size} height={size} viewBox="0 0 120 100">
      <defs>
        <radialGradient id="pp" cx="35%" cy="30%"><stop offset="0%" stopColor="#e2e8f0"/><stop offset="50%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#334155"/></radialGradient>
        <linearGradient id="pr" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="50%" stopColor="rgba(148,163,184,0.5)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient>
      </defs>
      <ellipse cx="60" cy="63" rx="56" ry="7" fill="url(#pr)" opacity="0.7"/>
      <circle cx="60" cy="50" r="40" fill="url(#pp)"/>
    </svg>
  );
  if (tipo === 'oro') return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="po" cx="35%" cy="30%"><stop offset="0%" stopColor="#fde68a"/><stop offset="40%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#78350f"/></radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#po)"/>
      <ellipse cx="50" cy="38" rx="40" ry="6" fill="rgba(120,53,15,0.2)" transform="rotate(-3,50,38)"/>
      <ellipse cx="50" cy="52" rx="42" ry="5" fill="rgba(120,53,15,0.15)" transform="rotate(2,50,52)"/>
      <ellipse cx="50" cy="64" rx="38" ry="4" fill="rgba(120,53,15,0.12)"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="pd" cx="35%" cy="30%"><stop offset="0%" stopColor="#ddd6fe"/><stop offset="30%" stopColor="#8b5cf6"/><stop offset="70%" stopColor="#5b21b6"/><stop offset="100%" stopColor="#1e1b4b"/></radialGradient>
        <radialGradient id="pd2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(167,139,250,0)"/><stop offset="100%" stopColor="rgba(109,40,217,0.3)"/></radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#pd2)"/>
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(150deg, #f0f4ff 0%, #f8f9ff 40%, #f5f0ff 100%)', fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* GUEST MODAL */}
      {showGuestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Función exclusiva</h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 28 }}>Crea una cuenta gratis para acceder a las sesiones SOC y competir en las arenas.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('/register')} style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#4f46e5', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Crear cuenta gratis</button>
              <button onClick={() => setShowGuestModal(false)} style={{ padding: '12px 16px', borderRadius: 10, background: '#f1f5f9', border: 'none', color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8eaf0', boxShadow: '0 1px 12px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logosoc.png" alt="SocBlast" style={{ height: 28 }} />
          <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Soc<span style={{ color: '#4f46e5' }}>Blast</span></span>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '5px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>← Dashboard</button>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 40px 80px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: '#4f46e5', letterSpacing: '2px', fontWeight: 700, marginBottom: 10, fontFamily: 'monospace' }}>SISTEMA DE ARENAS</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', marginBottom: 10 }}>Las 12 divisiones</h1>
          <p style={{ fontSize: 15, color: '#64748b' }}>300 copas por división. 4 grupos. Un solo objetivo: llegar a Diamante 1.</p>
        </div>

        {/* TU POSICIÓN */}
        {user && (
          <div style={{ padding: '20px 24px', borderRadius: 14, background: '#fff', border: '1px solid #e8eaf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlanetSVG tipo={arenaUsuario.toLowerCase().split(' ')[0]} size={36} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '1.5px', marginBottom: 4 }}>TU POSICIÓN ACTUAL</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{arenaUsuario}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#4f46e5' }}>{copasUsuario.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>copas totales</div>
            </div>
            <button onClick={handleAccion} style={{ padding: '10px 20px', borderRadius: 10, background: '#4f46e5', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Jugar ahora →</button>
          </div>
        )}

        {/* TABS GRUPOS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {GRUPOS.map(g => (
            <button key={g} onClick={() => setGrupoActivo(g)}
              style={{ padding: '8px 20px', borderRadius: 100, border: '1.5px solid', borderColor: grupoActivo === g ? GRUPO_COLORS[g] : '#e2e8f0', background: grupoActivo === g ? GRUPO_COLORS[g] : '#fff', color: grupoActivo === g ? '#fff' : '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
              {g}
            </button>
          ))}
        </div>

        {/* ARENAS DEL GRUPO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {arenasFiltradas.map((arena, i) => {
            const esActual = arena.nombre === arenaUsuario;
            const superada = copasUsuario > arena.max;
            const bloqueada = copasUsuario < arena.min;
            return (
              <div key={i} style={{
                borderRadius: 16, overflow: 'hidden', border: `1.5px solid ${esActual ? GRUPO_COLORS[arena.grupo] : '#e8eaf0'}`,
                background: '#fff', boxShadow: esActual ? `0 8px 32px rgba(0,0,0,0.12)` : '0 2px 8px rgba(0,0,0,0.05)',
                position: 'relative', transform: esActual ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.2s'
              }}>
                {esActual && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: GRUPO_COLORS[arena.grupo], color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 100, letterSpacing: '1px' }}>TÚ AQUÍ</div>
                )}
                {/* HEADER COLOREADO */}
                <div style={{ background: `linear-gradient(135deg, ${arena.grad[0]}, ${arena.grad[1]})`, padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <PlanetSVG tipo={arena.planet} size={56} />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{arena.nombre}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: 'monospace', marginTop: 2 }}>{arena.min.toLocaleString()} — {arena.max === 99999 ? '∞' : arena.max.toLocaleString()} copas</div>
                  </div>
                </div>
                {/* CONTENIDO */}
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 14 }}>{arena.desc}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: arena.light, color: arena.color, fontWeight: 600 }}>{arena.dificultad}</span>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: '#f8fafc', color: '#64748b', fontWeight: 600 }}>⏱ {arena.tiempo} min</span>
                    {superada && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: '#ecfdf5', color: '#059669', fontWeight: 600 }}>✓ Superada</span>}
                    {bloqueada && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: '#fef2f2', color: '#dc2626', fontWeight: 600 }}>🔒 Bloqueada</span>}
                  </div>
                  {esActual && (
                    <button onClick={handleAccion} style={{ width: '100%', padding: '10px', borderRadius: 9, background: GRUPO_COLORS[arena.grupo], border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      Jugar en {arena.nombre} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* RESUMEN PROGRESO */}
        <div style={{ marginTop: 40, padding: '24px', borderRadius: 16, background: '#fff', border: '1px solid #e8eaf0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: 16 }}>PROGRESO TOTAL</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {ARENAS.map((a, i) => {
              const completada = copasUsuario > a.max;
              const actual = a.nombre === arenaUsuario;
              return (
                <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: completada ? GRUPO_COLORS[a.grupo] : actual ? `${GRUPO_COLORS[a.grupo]}60` : '#e8eaf0', transition: 'background 0.3s' }} />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Bronce 3</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Diamante 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}