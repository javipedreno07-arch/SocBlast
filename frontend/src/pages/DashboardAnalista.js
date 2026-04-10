import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Planet = ({ type, size = 100 }) => {
  const planets = {
    bronce: (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="db1" cx="35%" cy="35%"><stop offset="0%" stopColor="#E8A050"/><stop offset="40%" stopColor="#CD7F32"/><stop offset="100%" stopColor="#5C3010"/></radialGradient><radialGradient id="db2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.5)"/></radialGradient></defs><circle cx="60" cy="60" r="52" fill="url(#db1)"/><ellipse cx="45" cy="40" rx="18" ry="8" fill="rgba(180,100,30,0.4)" transform="rotate(-20,45,40)"/><ellipse cx="70" cy="65" rx="22" ry="6" fill="rgba(100,50,10,0.35)" transform="rotate(10,70,65)"/><circle cx="38" cy="45" r="4" fill="rgba(80,35,5,0.5)"/><circle cx="72" cy="55" r="3" fill="rgba(80,35,5,0.4)"/><circle cx="60" cy="60" r="52" fill="url(#db2)"/></svg>),
    plata: (<svg width={size} height={size} viewBox="0 0 140 120"><defs><radialGradient id="dp1" cx="35%" cy="35%"><stop offset="0%" stopColor="#E2E8F0"/><stop offset="50%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#2D3748"/></radialGradient><radialGradient id="dp2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.45)"/></radialGradient><linearGradient id="dring1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="30%" stopColor="rgba(148,163,184,0.6)"/><stop offset="70%" stopColor="rgba(148,163,184,0.6)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient></defs><ellipse cx="70" cy="72" rx="68" ry="8" fill="url(#dring1)" opacity="0.5"/><ellipse cx="70" cy="68" rx="62" ry="6" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="3"/><circle cx="70" cy="60" r="48" fill="url(#dp1)"/><ellipse cx="55" cy="45" rx="16" ry="5" fill="rgba(200,210,225,0.3)" transform="rotate(-15,55,45)"/><ellipse cx="75" cy="68" rx="20" ry="5" fill="rgba(60,80,110,0.3)" transform="rotate(8,75,68)"/><circle cx="70" cy="60" r="48" fill="url(#dp2)"/></svg>),
    oro: (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="do1" cx="35%" cy="35%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="40%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#78350F"/></radialGradient><radialGradient id="do2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.4)"/></radialGradient></defs><circle cx="60" cy="60" r="54" fill="url(#do1)"/><ellipse cx="60" cy="45" rx="48" ry="7" fill="rgba(245,210,50,0.25)" transform="rotate(-5,60,45)"/><ellipse cx="60" cy="58" rx="50" ry="6" fill="rgba(180,80,10,0.3)" transform="rotate(3,60,58)"/><ellipse cx="60" cy="70" rx="46" ry="5" fill="rgba(245,200,50,0.2)" transform="rotate(-2,60,70)"/><circle cx="35" cy="50" r="8" fill="rgba(240,160,20,0.4)"/><circle cx="82" cy="42" r="6" fill="rgba(240,160,20,0.35)"/><circle cx="60" cy="60" r="54" fill="url(#do2)"/></svg>),
    elite: (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="de1" cx="35%" cy="35%"><stop offset="0%" stopColor="#DDD6FE"/><stop offset="40%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#1E0A3C"/></radialGradient><radialGradient id="de2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.5)"/></radialGradient><radialGradient id="daura" cx="50%" cy="50%"><stop offset="60%" stopColor="rgba(167,139,250,0)"/><stop offset="100%" stopColor="rgba(124,58,237,0.25)"/></radialGradient></defs><circle cx="60" cy="60" r="58" fill="url(#daura)"/><circle cx="60" cy="60" r="50" fill="url(#de1)"/><ellipse cx="48" cy="42" rx="14" ry="4" fill="rgba(200,180,255,0.2)" transform="rotate(-20,48,42)"/><ellipse cx="65" cy="58" rx="18" ry="4" fill="rgba(50,10,100,0.4)" transform="rotate(10,65,58)"/><circle cx="42" cy="48" r="3" fill="rgba(220,200,255,0.6)"/><circle cx="75" cy="52" r="2" fill="rgba(220,200,255,0.5)"/><circle cx="60" cy="60" r="50" fill="url(#de2)"/><circle cx="60" cy="60" r="58" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="1"/></svg>),
  };
  return planets[type] || null;
};

const Stars = () => {
  const stars = useRef(Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.8 + 0.4,
    opacity: Math.random() * 0.5 + 0.15,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 8,
  }))).current;

  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {stars.map(s => (
        <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size} fill="white"
          style={{ opacity: s.opacity, animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite` }} />
      ))}
    </svg>
  );
};

const ARENAS = [
  { name: 'Bronce', planet: 'bronce', min: 0, max: 999, color: '#CD7F32', colorRgb: '205,127,50', next: 'Plata' },
  { name: 'Plata', planet: 'plata', min: 1000, max: 1999, color: '#94A3B8', colorRgb: '148,163,184', next: 'Oro' },
  { name: 'Oro', planet: 'oro', min: 2000, max: 2999, color: '#F59E0B', colorRgb: '245,158,11', next: 'Elite' },
  { name: 'Elite', planet: 'elite', min: 3000, max: 99999, color: '#A78BFA', colorRgb: '167,139,250', next: null },
];

const TIERS = ['', 'SOC Rookie', 'SOC Analyst', 'SOC Specialist', 'SOC Expert', 'SOC Sentinel', 'SOC Architect', 'SOC Master', 'SOC Legend'];
const TIER_COLORS = ['', '#6B7280', '#4A7FD4', '#06B6D4', '#10B981', '#F59E0B', '#F97316', '#EF4444', '#A78BFA'];

const SKILLS = [
  { key: 'analisis_logs', label: 'Análisis de Logs' },
  { key: 'deteccion_amenazas', label: 'Detección de Amenazas' },
  { key: 'respuesta_incidentes', label: 'Respuesta a Incidentes' },
  { key: 'threat_hunting', label: 'Threat Hunting' },
  { key: 'forense_digital', label: 'Forense Digital' },
  { key: 'gestion_vulnerabilidades', label: 'Gestión de Vulns' },
  { key: 'inteligencia_amenazas', label: 'Intel. de Amenazas' },
];

const CARD  = 'rgba(14,26,46,0.85)';
const CARD2 = 'rgba(8,21,37,0.9)';
const BD    = '#1A3050';
const T1    = '#FFFFFF';
const T2    = '#C8D8F0';
const T3    = '#5A7898';
const ACC   = '#2564F1';

const DashboardAnalista = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [arenaIdx, setArenaIdx] = useState(0);
  const [terminalLines, setTerminalLines] = useState([]);
  const sliderRef = useRef(null);
  const startX = useRef(null);

  const TERMINAL_DEMO = [
    { text: '$ iniciando sesión SOC...', color: T3, delay: 0 },
    { text: '⚠  ALERT   Brute force detected', color: '#F87171', delay: 400 },
    { text: '   →  src: 185.220.101.45   rate: 94/min', color: T2, delay: 800 },
    { text: '   →  target: CORP-DC01   port: 445/SMB', color: T2, delay: 1200 },
    { text: '$ correlating SIEM events...', color: T3, delay: 1600 },
    { text: '   →  T1078 Valid Accounts detected', color: '#F87171', delay: 2000 },
    { text: '$ awaiting analyst action...', color: ACC, delay: 2400 },
    { text: '▌', color: ACC, delay: 2800 },
  ];

  useEffect(() => { fetchUser(); }, []);
  useEffect(() => {
    setTerminalLines([]);
    TERMINAL_DEMO.forEach(line => {
      setTimeout(() => {
        setTerminalLines(prev => [...prev.filter(l => l.text !== '▌'), line]);
      }, line.delay);
    });
  }, []);
  useEffect(() => {
    if (userData) {
      const idx = ARENAS.findIndex(a => userData.arena === a.name);
      setArenaIdx(idx >= 0 ? idx : 0);
    }
  }, [userData]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('https://socblast-production.up.railway.app/api/me', { headers: { Authorization: `Bearer ${token}` } });
      setUserData(res.data);
    } catch { logout(); navigate('/login'); }
  };

  const handleTouchStart = e => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd = e => {
    if (!startX.current) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && arenaIdx < ARENAS.length - 1) setArenaIdx(i => i + 1);
      if (diff < 0 && arenaIdx > 0) setArenaIdx(i => i - 1);
    }
    startX.current = null;
  };

  const copas = userData?.copas || 0;
  const xp = userData?.xp || 0;
  const tier = userData?.tier || 1;
  const sesiones = userData?.sesiones_completadas || 0;
  const arena = ARENAS[arenaIdx];
  const arenaActual = ARENAS.find(a => a.name === userData?.arena) || ARENAS[0];
  const progresoCopas = arenaActual.max === 99999 ? 100 : ((copas - arenaActual.min) / (arenaActual.max - arenaActual.min)) * 100;
  const XP_MAX = [0, 500, 1500, 3000, 5000, 8000, 12000, 18000, 99999];
  const xpMin = XP_MAX[tier - 1] || 0;
  const xpMax = XP_MAX[tier] || 99999;
  const progresoXP = ((xp - xpMin) / (xpMax - xpMin)) * 100;
  const skills = userData?.skills || {};
  const tierColor = TIER_COLORS[tier] || '#6B7280';

  const css = `
    @keyframes slideIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes floatPlanet{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
    @keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes twinkle{0%,100%{opacity:0.15;}50%{opacity:0.9;}}
    @keyframes nebula1{0%,100%{transform:translate(0px,0px);}50%{transform:translate(50px,-30px);}}
    @keyframes nebula2{0%,100%{transform:translate(0px,0px);}50%{transform:translate(-40px,50px);}}
    @keyframes nebula3{0%,100%{transform:translate(0px,0px);}50%{transform:translate(25px,40px);}}
    .arena-slide{animation:slideIn 0.3s ease forwards;}
    .planet-anim{animation:floatPlanet 5s ease-in-out infinite;}
    .session-btn:hover{filter:brightness(1.1);transform:translateY(-2px) !important;}
    .nav-btn:hover{color:${T1} !important;background:rgba(255,255,255,0.06) !important;}
    .stat-card:hover{border-color:${ACC}70 !important;transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,0.6) !important;}
    .quick-btn:hover{border-color:${ACC}50 !important;background:rgba(14,26,46,0.98) !important;}
    .skill-card:hover{border-color:${ACC}40 !important;}
    .cursor{animation:blink 1s infinite;}
    *{transition:transform 0.2s ease,box-shadow 0.25s ease,border-color 0.2s ease,color 0.15s ease,background 0.15s ease,filter 0.2s ease;}
  `;

  if (!userData) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#03030A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
      <img src="/logosoc.png" style={{ width: '48px', height: '48px', animation: 'spinLogo 1s linear infinite' }} />
    </div>
  );

  return (
    <>
      <style>{css}</style>

      {/* FONDO ESPACIAL — nebulosas MUY lentas */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundColor: '#03030A', overflow: 'hidden' }}>
        <Stars />
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle at center, rgba(37,100,241,0.2) 0%, rgba(37,100,241,0.07) 45%, transparent 70%)', filter: 'blur(90px)', animation: 'nebula1 90s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle at center, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)', filter: 'blur(100px)', animation: 'nebula2 120s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', left: '35%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle at center, rgba(6,182,212,0.09) 0%, rgba(6,182,212,0.03) 45%, transparent 70%)', filter: 'blur(80px)', animation: 'nebula3 80s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 35%, rgba(3,3,10,0.65) 100%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif", color: T1 }}>

        {/* NAVBAR */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: 'rgba(8,21,37,0.8)', backdropFilter: 'blur(24px)', borderBottom: `1px solid rgba(26,48,80,0.8)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{ height: '30px' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.4px', color: T1 }}>Soc<span style={{ color: ACC }}>Blast</span></span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[
              { label: 'Training', path: '/training' },
              { label: 'Sesiones', path: '/sesion' },
              { label: 'Ranking', path: '/ranking' },
              { label: 'Certificado', path: '/certificado' },
              { label: 'Perfil', path: '/perfil' },
            ].map((item, i) => (
              <button key={i} className="nav-btn" onClick={() => navigate(item.path)} style={{ padding: '5px 14px', borderRadius: '6px', background: 'none', border: 'none', color: T2, fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                {item.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(8,21,37,0.8)', border: `1px solid ${BD}` }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
              <span style={{ fontSize: '12px', color: T2 }}>{user?.nombre}</span>
              <span style={{ fontSize: '10px', color: arenaActual.color, fontWeight: 700 }}>{arenaActual.name}</span>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', border: `1px solid ${BD}`, color: T3, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Salir</button>
          </div>
        </nav>

        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '32px 40px 72px' }}>

          {/* ARENA + SESIÓN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: '14px', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {ARENAS.map((a, i) => (
                  <button key={i} onClick={() => setArenaIdx(i)} style={{ width: i === arenaIdx ? '18px' : '6px', height: '5px', borderRadius: '3px', backgroundColor: i === arenaIdx ? a.color : BD, border: 'none', cursor: 'pointer', padding: 0 }} />
                ))}
              </div>

              <div ref={sliderRef} className="arena-slide" key={arenaIdx}
                onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
                style={{
                  borderRadius: '14px', padding: '36px 44px',
                  background: `linear-gradient(135deg, rgba(${arena.colorRgb},0.45) 0%, rgba(${arena.colorRgb},0.18) 40%, rgba(8,21,37,0.88) 100%)`,
                  border: `1px solid rgba(${arena.colorRgb},0.5)`,
                  position: 'relative', overflow: 'hidden',
                  boxShadow: `0 0 80px rgba(${arena.colorRgb},0.18), 0 4px 32px rgba(0,0,0,0.7)`,
                  backdropFilter: 'blur(16px)',
                }}>
                <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '360px', height: '360px', borderRadius: '50%', background: `radial-gradient(circle,rgba(${arena.colorRgb},0.3),transparent 65%)`, pointerEvents: 'none', filter: 'blur(20px)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '40px', position: 'relative', zIndex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: arena.name === userData?.arena ? '#4ADE80' : BD, boxShadow: arena.name === userData?.arena ? '0 0 6px #4ADE80' : 'none' }} />
                      <span style={{ fontSize: '9px', color: `rgba(${arena.colorRgb},0.8)`, letterSpacing: '3px', fontWeight: 700, fontFamily: 'monospace' }}>
                        {arena.name === userData?.arena ? 'ARENA ACTIVA' : 'ARENA ' + (arenaIdx + 1)}
                      </span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(44px,5vw,68px)', fontWeight: 900, color: arena.color, letterSpacing: '-2.5px', lineHeight: 1, marginBottom: '6px', textShadow: `0 0 40px rgba(${arena.colorRgb},0.7)` }}>
                      {arena.name}
                    </h1>
                    <p style={{ fontSize: '11px', color: `rgba(${arena.colorRgb},0.55)`, fontFamily: 'monospace', marginBottom: '22px' }}>
                      {arena.min === 0 ? '0' : arena.min.toLocaleString()} — {arena.max === 99999 ? '∞' : arena.max.toLocaleString()} copas
                    </p>
                    {arena.name === userData?.arena ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '40px', fontWeight: 900, color: T1, letterSpacing: '-1.5px' }}>{copas.toLocaleString()}</span>
                          <span style={{ fontSize: '12px', color: T2 }}>copas</span>
                          {arena.next && (
                            <span style={{ fontSize: '10px', color: T2, marginLeft: '6px', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.35)', border: `1px solid rgba(${arena.colorRgb},0.3)`, fontFamily: 'monospace' }}>
                              {(arenaActual.max - copas + 1).toLocaleString()} → {arena.next}
                            </span>
                          )}
                        </div>
                        <div style={{ height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.4)', marginBottom: '6px', maxWidth: '280px' }}>
                          <div style={{ width: `${Math.min(progresoCopas, 100)}%`, height: '100%', borderRadius: '2px', backgroundColor: arena.color, boxShadow: `0 0 12px rgba(${arena.colorRgb},0.8)` }} />
                        </div>
                        <p style={{ fontSize: '10px', color: `rgba(${arena.colorRgb},0.6)`, fontFamily: 'monospace' }}>{Math.round(progresoCopas)}% completado</p>
                      </>
                    ) : (
                      <p style={{ fontSize: '12px', color: T2 }}>
                        {arena.min > copas ? `Faltan ${(arena.min - copas).toLocaleString()} copas` : '✓ Arena superada'}
                      </p>
                    )}
                  </div>
                  <div className="planet-anim" style={{ flexShrink: 0, filter: `drop-shadow(0 0 40px rgba(${arena.colorRgb},0.8)) drop-shadow(0 0 15px rgba(${arena.colorRgb},0.5))` }}>
                    <Planet type={arena.planet} size={165} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', position: 'relative', zIndex: 1 }}>
                  <button onClick={() => arenaIdx > 0 && setArenaIdx(i => i - 1)} style={{ background: 'none', border: 'none', color: arenaIdx > 0 ? `rgba(${arena.colorRgb},0.5)` : 'transparent', cursor: arenaIdx > 0 ? 'pointer' : 'default', fontSize: '11px', fontFamily: 'monospace' }}>
                    ← {arenaIdx > 0 ? ARENAS[arenaIdx - 1].name : ''}
                  </button>
                  <button onClick={() => arenaIdx < ARENAS.length - 1 && setArenaIdx(i => i + 1)} style={{ background: 'none', border: 'none', color: arenaIdx < ARENAS.length - 1 ? `rgba(${arena.colorRgb},0.5)` : 'transparent', cursor: arenaIdx < ARENAS.length - 1 ? 'pointer' : 'default', fontSize: '11px', fontFamily: 'monospace' }}>
                    {arenaIdx < ARENAS.length - 1 ? ARENAS[arenaIdx + 1].name : ''} →
                  </button>
                </div>
              </div>
            </div>

            {/* SESIÓN + TERMINAL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="session-btn" onClick={() => navigate('/sesion')}
                style={{
                  width: '100%', padding: '22px 20px', borderRadius: '12px',
                  backgroundColor: ACC, border: 'none', color: T1, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left',
                  boxShadow: `0 4px 32px rgba(37,100,241,0.5)`, position: 'relative', overflow: 'hidden',
                }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)' }} />
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.3px', marginBottom: '4px' }}>INICIAR SESIÓN SOC</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>
                    {userData?.arena} · {userData?.arena === 'Bronce' ? '20' : userData?.arena === 'Plata' ? '15' : userData?.arena === 'Oro' ? '10' : '7'} min
                  </div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${BD}`, backdropFilter: 'blur(16px)' }}>
                <div style={{ backgroundColor: 'rgba(14,26,46,0.9)', padding: '8px 12px', borderBottom: `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF5F57' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FEBC2E' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#28C840' }} />
                  <span style={{ color: T3, fontSize: '9px', fontFamily: 'monospace', marginLeft: '8px' }}>soc-terminal</span>
                </div>
                <div style={{ backgroundColor: 'rgba(3,3,10,0.92)', padding: '12px 14px', fontFamily: "'Fira Code',monospace", fontSize: '10px', lineHeight: 2.0, minHeight: '168px' }}>
                  {terminalLines.map((line, i) => (
                    <p key={i} style={{ color: line.color, margin: 0, animation: 'fadeIn 0.25s ease' }}>
                      {line.text === '▌' ? <span className="cursor">{line.text}</span> : line.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STATS — estilo cards empresa */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '12px' }}>
            {[
              { label: 'COPAS', value: copas.toLocaleString(), sub: arenaActual.name, color: arenaActual.color, colorRgb: arenaActual.colorRgb },
              { label: 'XP TOTAL', value: xp.toLocaleString(), sub: `${Math.round(progresoXP)}% al siguiente`, color: ACC, colorRgb: '37,100,241' },
              { label: 'SESIONES', value: sesiones.toString(), sub: 'completadas', color: '#4ADE80', colorRgb: '74,222,128' },
              { label: 'TIER', value: String(tier), sub: TIERS[tier], color: tierColor, colorRgb: '37,100,241', clickable: true },
            ].map((s, i) => (
              <div key={i} className="stat-card" onClick={s.clickable ? () => navigate('/perfil') : undefined}
                style={{
                  padding: '22px 22px',
                  borderRadius: '12px',
                  backgroundColor: CARD,
                  border: `1px solid ${BD}`,
                  cursor: s.clickable ? 'pointer' : 'default',
                  position: 'relative', overflow: 'hidden',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }}>
                {/* Accent top line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent,${s.color}60,transparent)` }} />
                {/* Icon */}
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', backgroundColor: `rgba(${s.colorRgb},0.1)`, border: `1px solid rgba(${s.colorRgb},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                </div>
                <div style={{ fontSize: '9px', color: T3, fontWeight: 700, letterSpacing: '2px', marginBottom: '6px', fontFamily: 'monospace' }}>{s.label}</div>
                <div style={{ fontSize: i === 3 ? '24px' : '32px', fontWeight: 900, color: s.color, letterSpacing: '-0.8px', lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: T2 }}>{s.sub}</div>
                {s.clickable && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', color: ACC, fontSize: '11px', fontWeight: 600 }}>
                    <span>Ver tiers</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* XP */}
          <div style={{ padding: '18px 22px', borderRadius: '12px', backgroundColor: CARD, border: `1px solid ${BD}`, marginBottom: '12px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent,${tierColor}50,transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: tierColor }}>{TIERS[tier]}</span>
                <span style={{ fontSize: '9px', color: T3, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(8,21,37,0.8)', border: `1px solid ${BD}`, fontFamily: 'monospace' }}>T{tier}</span>
                {tier < 8 && <span style={{ fontSize: '11px', color: T3 }}>→ {TIERS[tier + 1]}</span>}
              </div>
              <span style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>
                {xp.toLocaleString()} / {xpMax === 99999 ? '∞' : xpMax.toLocaleString()} XP
                {tier < 8 && <span> · {(xpMax - xp).toLocaleString()} restantes</span>}
              </span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'rgba(8,21,37,0.8)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(progresoXP, 100)}%`, height: '100%', borderRadius: '3px', background: `linear-gradient(90deg,${tierColor}80,${tierColor})`, boxShadow: `0 0 10px ${tierColor}60` }} />
            </div>
          </div>

          {/* SKILLS + ACCESOS — estilo empresa */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

            {/* SKILLS */}
            <div style={{ padding: '22px 24px', borderRadius: '12px', backgroundColor: CARD, border: `1px solid ${BD}`, backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent,${ACC}40,transparent)` }} />
              <p style={{ fontSize: '9px', color: T3, fontWeight: 700, letterSpacing: '2px', marginBottom: '16px', fontFamily: 'monospace' }}>HABILIDADES CERTIFICADAS</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {SKILLS.map((s, i) => {
                  const val = skills?.[s.key] || 1;
                  return (
                    <div key={i} className="skill-card" style={{ padding: '11px 13px', borderRadius: '9px', backgroundColor: CARD2, border: `1px solid ${BD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                      <span style={{ fontSize: '11px', color: T2 }}>{s.label}</span>
                      <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                        {[...Array(6)].map((_, j) => (
                          <div key={j} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: j < Math.ceil(val / 2) ? ACC : BD, boxShadow: j < Math.ceil(val / 2) ? `0 0 4px ${ACC}80` : 'none' }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACCESOS RÁPIDOS */}
            <div style={{ padding: '22px 24px', borderRadius: '12px', backgroundColor: CARD, border: `1px solid ${BD}`, backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent,${ACC}40,transparent)` }} />
              <p style={{ fontSize: '9px', color: T3, fontWeight: 700, letterSpacing: '2px', marginBottom: '16px', fontFamily: 'monospace' }}>ACCESOS RÁPIDOS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Training', desc: '8 módulos SOC', path: '/training', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
                  { label: 'Ranking Global', desc: 'Tu posición', path: '/ranking', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
                  { label: 'Mi Certificado', desc: 'QR verificable', path: '/certificado', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> },
                  { label: 'Perfil & Tiers', desc: 'Stats y progression', path: '/perfil', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                ].map((item, i) => (
                  <div key={i} className="quick-btn" onClick={() => navigate(item.path)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '9px', backgroundColor: CARD2, border: `1px solid ${BD}`, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${ACC}12`, border: `1px solid ${ACC}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: ACC }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', color: T1, fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: '10px', color: T3, marginLeft: '8px' }}>{item.desc}</span>
                    </div>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardAnalista;
