import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Planet = ({ type, size = 100 }) => {
  const planets = {
    bronce: (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="db1" cx="35%" cy="35%"><stop offset="0%" stopColor="#E8A050"/><stop offset="40%" stopColor="#CD7F32"/><stop offset="100%" stopColor="#5C3010"/></radialGradient><radialGradient id="db2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.5)"/></radialGradient></defs><circle cx="60" cy="60" r="52" fill="url(#db1)"/><ellipse cx="45" cy="40" rx="18" ry="8" fill="rgba(180,100,30,0.4)" transform="rotate(-20,45,40)"/><ellipse cx="70" cy="65" rx="22" ry="6" fill="rgba(100,50,10,0.35)" transform="rotate(10,70,65)"/><circle cx="38" cy="45" r="4" fill="rgba(80,35,5,0.5)"/><circle cx="72" cy="55" r="3" fill="rgba(80,35,5,0.4)"/><circle cx="60" cy="60" r="52" fill="url(#db2)"/></svg>),
    plata: (<svg width={size} height={size} viewBox="0 0 140 120"><defs><radialGradient id="dp1" cx="35%" cy="35%"><stop offset="0%" stopColor="#E2E8F0"/><stop offset="50%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#2D3748"/></radialGradient><radialGradient id="dp2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.45)"/></radialGradient><linearGradient id="dring1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="30%" stopColor="rgba(148,163,184,0.6)"/><stop offset="70%" stopColor="rgba(148,163,184,0.6)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient></defs><ellipse cx="70" cy="72" rx="68" ry="8" fill="url(#dring1)" opacity="0.5"/><ellipse cx="70" cy="68" rx="62" ry="6" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="3"/><circle cx="70" cy="60" r="48" fill="url(#dp1)"/><ellipse cx="55" cy="45" rx="16" ry="5" fill="rgba(200,210,225,0.3)" transform="rotate(-15,55,45)"/><ellipse cx="75" cy="68" rx="20" ry="5" fill="rgba(60,80,110,0.3)" transform="rotate(8,75,68)"/><circle cx="70" cy="60" r="48" fill="url(#dp2)"/></svg>),
    oro: (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="do1" cx="35%" cy="35%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="40%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#78350F"/></radialGradient><radialGradient id="do2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.4)"/></radialGradient></defs><circle cx="60" cy="60" r="54" fill="url(#do1)"/><ellipse cx="60" cy="45" rx="48" ry="7" fill="rgba(245,210,50,0.25)" transform="rotate(-5,60,45)"/><ellipse cx="60" cy="58" rx="50" ry="6" fill="rgba(180,80,10,0.3)" transform="rotate(3,60,58)"/><circle cx="35" cy="50" r="8" fill="rgba(240,160,20,0.4)"/><circle cx="82" cy="42" r="6" fill="rgba(240,160,20,0.35)"/><circle cx="60" cy="60" r="54" fill="url(#do2)"/></svg>),
    elite: (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="de1" cx="35%" cy="35%"><stop offset="0%" stopColor="#DDD6FE"/><stop offset="40%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#1E0A3C"/></radialGradient><radialGradient id="de2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.5)"/></radialGradient><radialGradient id="daura" cx="50%" cy="50%"><stop offset="60%" stopColor="rgba(167,139,250,0)"/><stop offset="100%" stopColor="rgba(124,58,237,0.25)"/></radialGradient></defs><circle cx="60" cy="60" r="58" fill="url(#daura)"/><circle cx="60" cy="60" r="50" fill="url(#de1)"/><ellipse cx="48" cy="42" rx="14" ry="4" fill="rgba(200,180,255,0.2)" transform="rotate(-20,48,42)"/><ellipse cx="65" cy="58" rx="18" ry="4" fill="rgba(50,10,100,0.4)" transform="rotate(10,65,58)"/><circle cx="42" cy="48" r="3" fill="rgba(220,200,255,0.6)"/><circle cx="75" cy="52" r="2" fill="rgba(220,200,255,0.5)"/><circle cx="60" cy="60" r="50" fill="url(#de2)"/></svg>),
  };
  return planets[type] || null;
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

const ACC = '#2563eb';

const DashboardAnalista = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [arenaIdx, setArenaIdx] = useState(0);
  const [terminalLines, setTerminalLines] = useState([]);
  const sliderRef = useRef(null);
  const startX = useRef(null);

  const TERMINAL_DEMO = [
    { text: '$ iniciando sesión SOC...', color: '#64748b', delay: 0 },
    { text: '⚠  ALERT   Brute force detected', color: '#ef4444', delay: 400 },
    { text: '   →  src: 185.220.101.45   rate: 94/min', color: '#475569', delay: 800 },
    { text: '   →  target: CORP-DC01   port: 445/SMB', color: '#475569', delay: 1200 },
    { text: '$ correlating SIEM events...', color: '#64748b', delay: 1600 },
    { text: '   →  T1078 Valid Accounts detected', color: '#f97316', delay: 2000 },
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
    @keyframes floatPlanet{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .arena-slide{animation:slideIn 0.3s ease forwards;}
    .planet-anim{animation:floatPlanet 5s ease-in-out infinite;}
    .session-btn:hover{background:#1d4ed8 !important;transform:translateY(-2px) !important;}
    .nav-btn:hover{background:#f1f5f9 !important;color:#0f172a !important;}
    .stat-card:hover{box-shadow:0 8px 24px rgba(0,0,0,0.1) !important;transform:translateY(-2px);}
    .quick-btn:hover{background:#f8faff !important;border-color:#bfdbfe !important;}
    .skill-card:hover{border-color:#bfdbfe !important;}
    .cursor{animation:blink 1s infinite;}
    *{transition:transform 0.2s ease,box-shadow 0.2s ease,border-color 0.15s ease,background 0.15s ease;}
  `;

  if (!userData) return (
    <div style={{ minHeight: '100vh', background: '#f8faff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTop: `3px solid ${ACC}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f0f4ff 0%, #fafbff 40%, #f5f0ff 100%)', fontFamily: "'Inter',-apple-system,sans-serif", color: '#0f172a' }}>

        {/* NAVBAR */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{ height: '28px' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.4px', color: '#0f172a' }}>Soc<span style={{ color: ACC }}>Blast</span></span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[
              { label: 'Training', path: '/training' },
              { label: 'Sesiones', path: '/sesion' },
              { label: 'Ranking', path: '/ranking' },
              { label: 'Certificado', path: '/certificado' },
              { label: 'Perfil', path: '/perfil' },
            ].map((item, i) => (
              <button key={i} className="nav-btn" onClick={() => navigate(item.path)} style={{ padding: '5px 14px', borderRadius: '7px', background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                {item.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{user?.nombre}</span>
              <span style={{ fontSize: '11px', color: arenaActual.color, fontWeight: 700, background: `rgba(${arenaActual.colorRgb},0.1)`, padding: '1px 6px', borderRadius: '4px' }}>{arenaActual.name}</span>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', border: '1px solid #e2e8f0', color: '#94a3b8', padding: '5px 12px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Salir</button>
          </div>
        </nav>

        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '28px 40px 72px' }}>

          {/* ARENA + SESIÓN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: '16px', marginBottom: '16px' }}>

            {/* ARENA CARD */}
            <div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                {ARENAS.map((a, i) => (
                  <button key={i} onClick={() => setArenaIdx(i)} style={{ width: i === arenaIdx ? '18px' : '6px', height: '5px', borderRadius: '3px', backgroundColor: i === arenaIdx ? a.color : '#e2e8f0', border: 'none', cursor: 'pointer', padding: 0 }} />
                ))}
              </div>
              <div ref={sliderRef} className="arena-slide" key={arenaIdx}
                onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
                style={{
                  borderRadius: '16px', padding: '32px 40px',
                  background: `linear-gradient(135deg, rgba(${arena.colorRgb},0.15) 0%, rgba(${arena.colorRgb},0.05) 40%, #ffffff 100%)`,
                  border: `1.5px solid rgba(${arena.colorRgb},0.3)`,
                  position: 'relative', overflow: 'hidden',
                  boxShadow: `0 4px 32px rgba(${arena.colorRgb},0.12), 0 1px 3px rgba(0,0,0,0.06)`,
                  backgroundColor: '#fff',
                }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-20px', width: '280px', height: '280px', borderRadius: '50%', background: `radial-gradient(circle,rgba(${arena.colorRgb},0.12),transparent 65%)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '36px', position: 'relative', zIndex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: arena.name === userData?.arena ? '#22c55e' : '#e2e8f0' }} />
                      <span style={{ fontSize: '10px', color: `rgba(${arena.colorRgb},0.7)`, letterSpacing: '2.5px', fontWeight: 700, fontFamily: 'monospace' }}>
                        {arena.name === userData?.arena ? 'ARENA ACTIVA' : 'ARENA ' + (arenaIdx + 1)}
                      </span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', fontWeight: 900, color: arena.color, letterSpacing: '-2px', lineHeight: 1, marginBottom: '4px' }}>
                      {arena.name}
                    </h1>
                    <p style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace', marginBottom: '20px' }}>
                      {arena.min === 0 ? '0' : arena.min.toLocaleString()} — {arena.max === 99999 ? '∞' : arena.max.toLocaleString()} copas
                    </p>
                    {arena.name === userData?.arena ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px' }}>{copas.toLocaleString()}</span>
                          <span style={{ fontSize: '13px', color: '#94a3b8' }}>copas</span>
                          {arena.next && (
                            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px', padding: '2px 8px', borderRadius: '5px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}>
                              {(arenaActual.max - copas + 1).toLocaleString()} → {arena.next}
                            </span>
                          )}
                        </div>
                        <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#f1f5f9', marginBottom: '6px', maxWidth: '280px' }}>
                          <div style={{ width: `${Math.min(progresoCopas, 100)}%`, height: '100%', borderRadius: '3px', backgroundColor: arena.color }} />
                        </div>
                        <p style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{Math.round(progresoCopas)}% completado</p>
                      </>
                    ) : (
                      <p style={{ fontSize: '13px', color: '#64748b' }}>
                        {arena.min > copas ? `Faltan ${(arena.min - copas).toLocaleString()} copas` : '✓ Arena superada'}
                      </p>
                    )}
                  </div>
                  <div className="planet-anim" style={{ flexShrink: 0 }}>
                    <Planet type={arena.planet} size={150} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', position: 'relative', zIndex: 1 }}>
                  <button onClick={() => arenaIdx > 0 && setArenaIdx(i => i - 1)} style={{ background: 'none', border: 'none', color: arenaIdx > 0 ? '#94a3b8' : 'transparent', cursor: arenaIdx > 0 ? 'pointer' : 'default', fontSize: '11px', fontFamily: 'monospace' }}>
                    ← {arenaIdx > 0 ? ARENAS[arenaIdx - 1].name : ''}
                  </button>
                  <button onClick={() => arenaIdx < ARENAS.length - 1 && setArenaIdx(i => i + 1)} style={{ background: 'none', border: 'none', color: arenaIdx < ARENAS.length - 1 ? '#94a3b8' : 'transparent', cursor: arenaIdx < ARENAS.length - 1 ? 'pointer' : 'default', fontSize: '11px', fontFamily: 'monospace' }}>
                    {arenaIdx < ARENAS.length - 1 ? ARENAS[arenaIdx + 1].name : ''} →
                  </button>
                </div>
              </div>
            </div>

            {/* SESIÓN + TERMINAL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="session-btn" onClick={() => navigate('/sesion')}
                style={{ width: '100%', padding: '20px', borderRadius: '14px', backgroundColor: ACC, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left', boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '3px' }}>INICIAR SESIÓN SOC</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
                    {userData?.arena} · {userData?.arena === 'Bronce' ? '20' : userData?.arena === 'Plata' ? '15' : userData?.arena === 'Oro' ? '10' : '7'} min
                  </div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <div style={{ flex: 1, borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '8px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#FF5F57' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#FEBC2E' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#28C840' }} />
                  <span style={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace', marginLeft: '8px' }}>soc-terminal</span>
                </div>
                <div style={{ backgroundColor: '#0f172a', padding: '14px 16px', fontFamily: "'Fira Code',monospace", fontSize: '11px', lineHeight: 2.0, minHeight: '168px' }}>
                  {terminalLines.map((line, i) => (
                    <p key={i} style={{ color: line.color, margin: 0, animation: 'fadeIn 0.25s ease' }}>
                      {line.text === '▌' ? <span className="cursor">{line.text}</span> : line.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '12px' }}>
            {[
              { label: 'COPAS', value: copas.toLocaleString(), sub: arenaActual.name, color: arenaActual.color, bg: `rgba(${arenaActual.colorRgb},0.08)`, border: `rgba(${arenaActual.colorRgb},0.2)` },
              { label: 'XP TOTAL', value: xp.toLocaleString(), sub: `${Math.round(progresoXP)}% al siguiente`, color: ACC, bg: 'rgba(37,99,235,0.06)', border: 'rgba(37,99,235,0.15)' },
              { label: 'SESIONES', value: sesiones.toString(), sub: 'completadas', color: '#16a34a', bg: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.15)' },
              { label: 'TIER', value: String(tier), sub: TIERS[tier], color: tierColor, bg: `rgba(${tier},${tier},${tier},0.04)`, border: '#e2e8f0', clickable: true },
            ].map((s, i) => (
              <div key={i} className="stat-card" onClick={s.clickable ? () => navigate('/perfil') : undefined}
                style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#fff', border: '1px solid #e2e8f0', cursor: s.clickable ? 'pointer' : 'default', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: s.color, opacity: 0.6, borderRadius: '14px 14px 0 0' }} />
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '8px', fontFamily: 'monospace' }}>{s.label}</div>
                <div style={{ fontSize: '30px', fontWeight: 900, color: s.color, letterSpacing: '-0.8px', lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{s.sub}</div>
                {s.clickable && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: ACC, fontSize: '11px', fontWeight: 600 }}>
                    <span>Ver tiers</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* XP BAR */}
          <div style={{ padding: '16px 20px', borderRadius: '14px', backgroundColor: '#fff', border: '1px solid #e2e8f0', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: tierColor }}>{TIERS[tier]}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8', padding: '2px 7px', borderRadius: '5px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}>T{tier}</span>
                {tier < 8 && <span style={{ fontSize: '12px', color: '#94a3b8' }}>→ {TIERS[tier + 1]}</span>}
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                {xp.toLocaleString()} / {xpMax === 99999 ? '∞' : xpMax.toLocaleString()} XP
                {tier < 8 && <span style={{ color: '#cbd5e1' }}> · {(xpMax - xp).toLocaleString()} restantes</span>}
              </span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(progresoXP, 100)}%`, height: '100%', borderRadius: '4px', backgroundColor: tierColor }} />
            </div>
          </div>

          {/* SKILLS + ACCESOS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* SKILLS */}
            <div style={{ padding: '20px 22px', borderRadius: '14px', backgroundColor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, letterSpacing: '2px', marginBottom: '14px', fontFamily: 'monospace' }}>HABILIDADES CERTIFICADAS</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {SKILLS.map((s, i) => {
                  const val = skills?.[s.key] || 1;
                  return (
                    <div key={i} className="skill-card" style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#374151', fontWeight: 500 }}>{s.label}</span>
                      <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                        {[...Array(6)].map((_, j) => (
                          <div key={j} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: j < Math.ceil(val / 2) ? ACC : '#e2e8f0' }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACCESOS RÁPIDOS */}
            <div style={{ padding: '20px 22px', borderRadius: '14px', backgroundColor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, letterSpacing: '2px', marginBottom: '14px', fontFamily: 'monospace' }}>ACCESOS RÁPIDOS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Training', desc: '8 módulos SOC', path: '/training', color: '#8b5cf6', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
                  { label: 'Ranking Global', desc: 'Tu posición', path: '/ranking', color: '#f59e0b', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
                  { label: 'Mi Certificado', desc: 'QR verificable', path: '/certificado', color: '#10b981', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> },
                  { label: 'Perfil & Tiers', desc: 'Stats y progression', path: '/perfil', color: '#3b82f6', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                ].map((item, i) => (
                  <div key={i} className="quick-btn" onClick={() => navigate(item.path)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${item.color}15`, border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: item.color }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>{item.desc}</span>
                    </div>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
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
