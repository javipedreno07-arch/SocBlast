import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Planet = ({ type, size = 100 }) => {
  const planets = {
    bronce: (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="db1" cx="35%" cy="35%"><stop offset="0%" stopColor="#E8A050"/><stop offset="40%" stopColor="#CD7F32"/><stop offset="100%" stopColor="#5C3010"/></radialGradient><radialGradient id="db2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.5)"/></radialGradient></defs><circle cx="60" cy="60" r="52" fill="url(#db1)"/><ellipse cx="45" cy="40" rx="18" ry="8" fill="rgba(180,100,30,0.4)" transform="rotate(-20,45,40)"/><ellipse cx="70" cy="65" rx="22" ry="6" fill="rgba(100,50,10,0.35)" transform="rotate(10,70,65)"/><circle cx="38" cy="45" r="4" fill="rgba(80,35,5,0.5)"/><circle cx="72" cy="55" r="3" fill="rgba(80,35,5,0.4)"/><circle cx="60" cy="60" r="52" fill="url(#db2)"/></svg>),
    plata: (<svg width={size} height={size} viewBox="0 0 140 120"><defs><radialGradient id="dp1" cx="35%" cy="35%"><stop offset="0%" stopColor="#E2E8F0"/><stop offset="50%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#2D3748"/></radialGradient><radialGradient id="dp2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.45)"/></radialGradient><linearGradient id="dring1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="30%" stopColor="rgba(148,163,184,0.6)"/><stop offset="70%" stopColor="rgba(148,163,184,0.6)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient></defs><ellipse cx="70" cy="72" rx="68" ry="8" fill="url(#dring1)" opacity="0.5"/><circle cx="70" cy="60" r="48" fill="url(#dp1)"/><circle cx="70" cy="60" r="48" fill="url(#dp2)"/></svg>),
    oro: (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="do1" cx="35%" cy="35%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="40%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#78350F"/></radialGradient><radialGradient id="do2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.4)"/></radialGradient></defs><circle cx="60" cy="60" r="54" fill="url(#do1)"/><circle cx="60" cy="60" r="54" fill="url(#do2)"/></svg>),
    elite: (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="de1" cx="35%" cy="35%"><stop offset="0%" stopColor="#DDD6FE"/><stop offset="40%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#1E0A3C"/></radialGradient><radialGradient id="de2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.5)"/></radialGradient></defs><circle cx="60" cy="60" r="50" fill="url(#de1)"/><circle cx="60" cy="60" r="50" fill="url(#de2)"/></svg>),
  };
  return planets[type] || null;
};

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const nodes = Array.from({ length: 80 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.15,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      nodes.forEach(n => {
        n.vx *= 0.99; n.vy *= 0.99;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,250,${n.opacity})`;
        ctx.fill();
      });
      nodes.forEach((a, i) => nodes.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 140) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(99,120,220,${(1 - d / 140) * 0.2})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
};

const ARENAS = [
  { name: 'Bronce', planet: 'bronce', min: 0, max: 999, color: '#F59E4A', colorRgb: '245,158,74', next: 'Plata' },
  { name: 'Plata', planet: 'plata', min: 1000, max: 1999, color: '#CBD5E1', colorRgb: '203,213,225', next: 'Oro' },
  { name: 'Oro', planet: 'oro', min: 2000, max: 2999, color: '#FBBF24', colorRgb: '251,191,36', next: 'Elite' },
  { name: 'Elite', planet: 'elite', min: 3000, max: 99999, color: '#C084FC', colorRgb: '192,132,252', next: null },
];

const TIERS = ['', 'SOC Rookie', 'SOC Analyst', 'SOC Specialist', 'SOC Expert', 'SOC Sentinel', 'SOC Architect', 'SOC Master', 'SOC Legend'];
const TIER_COLORS = ['', '#94a3b8', '#60a5fa', '#22d3ee', '#34d399', '#fbbf24', '#fb923c', '#f87171', '#c084fc'];

const SKILLS = [
  { key: 'analisis_logs', label: 'Análisis de Logs' },
  { key: 'deteccion_amenazas', label: 'Detección Amenazas' },
  { key: 'respuesta_incidentes', label: 'Respuesta Incidentes' },
  { key: 'threat_hunting', label: 'Threat Hunting' },
  { key: 'forense_digital', label: 'Forense Digital' },
  { key: 'gestion_vulnerabilidades', label: 'Gestión Vulns' },
  { key: 'inteligencia_amenazas', label: 'Intel. Amenazas' },
];

const BG = '#0d1424';
const CARD = 'rgba(255,255,255,0.06)';
const CARD2 = 'rgba(255,255,255,0.04)';
const BD = 'rgba(255,255,255,0.1)';
const T1 = '#f1f5f9';
const T2 = '#94a3b8';
const T3 = '#475569';
const ACC = '#6366f1';

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
    { text: '⚠  ALERT   Brute force detected', color: '#f87171', delay: 400 },
    { text: '   →  src: 185.220.101.45   rate: 94/min', color: T2, delay: 800 },
    { text: '   →  target: CORP-DC01   port: 445/SMB', color: T2, delay: 1200 },
    { text: '$ correlating SIEM events...', color: T3, delay: 1600 },
    { text: '   →  T1078 Valid Accounts detected', color: '#fb923c', delay: 2000 },
    { text: '$ awaiting analyst action...', color: ACC, delay: 2400 },
    { text: '▌', color: ACC, delay: 2800 },
  ];

  useEffect(() => { fetchUser(); }, []);
  useEffect(() => {
    setTerminalLines([]);
    TERMINAL_DEMO.forEach(line => {
      setTimeout(() => setTerminalLines(prev => [...prev.filter(l => l.text !== '▌'), line]), line.delay);
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
  const tierColor = TIER_COLORS[tier] || '#94a3b8';

  const css = `
    @keyframes slideIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes floatPlanet{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .arena-slide{animation:slideIn 0.3s ease forwards;}
    .planet-anim{animation:floatPlanet 5s ease-in-out infinite;}
    .session-btn:hover{filter:brightness(1.15);transform:translateY(-2px) !important;}
    .nav-btn:hover{color:${T1} !important;background:rgba(255,255,255,0.08) !important;}
    .stat-card:hover{border-color:rgba(255,255,255,0.2) !important;transform:translateY(-2px);background:rgba(255,255,255,0.09) !important;}
    .quick-btn:hover{border-color:rgba(255,255,255,0.2) !important;background:rgba(255,255,255,0.08) !important;}
    .skill-card:hover{border-color:rgba(255,255,255,0.15) !important;}
    .cursor{animation:blink 1s infinite;}
    *{transition:transform 0.2s ease,box-shadow 0.2s ease,border-color 0.15s ease,background 0.15s ease,filter 0.15s ease;}
  `;

  if (!userData) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTop: `3px solid ${ACC}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ position: 'fixed', inset: 0, background: `linear-gradient(135deg, #0d1424 0%, #111827 50%, #0f1729 100%)`, zIndex: -1 }} />
      <ParticleCanvas />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif", color: T1 }}>

        {/* NAVBAR */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: 'rgba(13,20,36,0.85)', backdropFilter: 'blur(24px)', borderBottom: `1px solid ${BD}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{ height: '28px' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: T1 }}>Soc<span style={{ color: '#818cf8' }}>Blast</span></span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[{ label: 'Training', path: '/training' }, { label: 'Sesiones', path: '/sesion' }, { label: 'Ranking', path: '/ranking' }, { label: 'Certificado', path: '/certificado' }, { label: 'Perfil', path: '/perfil' }].map((item, i) => (
              <button key={i} className="nav-btn" onClick={() => navigate(item.path)} style={{ padding: '5px 14px', borderRadius: '7px', background: 'none', border: 'none', color: T2, fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{item.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${BD}` }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
              <span style={{ fontSize: '13px', color: T1, fontWeight: 500 }}>{user?.nombre}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: arenaActual.color, background: `rgba(${arenaActual.colorRgb},0.15)`, padding: '1px 6px', borderRadius: '4px' }}>{arenaActual.name}</span>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', border: `1px solid ${BD}`, color: T3, padding: '5px 12px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>Salir</button>
          </div>
        </nav>

        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '28px 40px 72px' }}>

          {/* ARENA + SESIÓN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: '14px', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                {ARENAS.map((a, i) => (
                  <button key={i} onClick={() => setArenaIdx(i)} style={{ width: i === arenaIdx ? '20px' : '6px', height: '5px', borderRadius: '3px', backgroundColor: i === arenaIdx ? a.color : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: 0 }} />
                ))}
              </div>
              <div ref={sliderRef} className="arena-slide" key={arenaIdx}
                onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
                style={{
                  borderRadius: '16px', padding: '32px 40px',
                  background: `linear-gradient(135deg, rgba(${arena.colorRgb},0.22) 0%, rgba(${arena.colorRgb},0.08) 50%, rgba(255,255,255,0.04) 100%)`,
                  border: `1px solid rgba(${arena.colorRgb},0.4)`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 0 60px rgba(${arena.colorRgb},0.15), 0 4px 24px rgba(0,0,0,0.4)`,
                  position: 'relative', overflow: 'hidden',
                }}>
                <div style={{ position: 'absolute', top: '-60px', right: '-30px', width: '300px', height: '300px', borderRadius: '50%', background: `radial-gradient(circle,rgba(${arena.colorRgb},0.25),transparent 65%)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '36px', position: 'relative', zIndex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: arena.name === userData?.arena ? '#4ade80' : 'rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: '10px', color: arena.color, letterSpacing: '2.5px', fontWeight: 700, fontFamily: 'monospace', opacity: 0.9 }}>
                        {arena.name === userData?.arena ? 'ARENA ACTIVA' : 'ARENA ' + (arenaIdx + 1)}
                      </span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(44px,5vw,68px)', fontWeight: 900, color: arena.color, letterSpacing: '-2px', lineHeight: 1, marginBottom: '4px', textShadow: `0 0 30px rgba(${arena.colorRgb},0.5)` }}>
                      {arena.name}
                    </h1>
                    <p style={{ fontSize: '11px', color: `rgba(${arena.colorRgb},0.6)`, fontFamily: 'monospace', marginBottom: '20px' }}>
                      {arena.min === 0 ? '0' : arena.min.toLocaleString()} — {arena.max === 99999 ? '∞' : arena.max.toLocaleString()} copas
                    </p>
                    {arena.name === userData?.arena ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '38px', fontWeight: 900, color: T1, letterSpacing: '-1px' }}>{copas.toLocaleString()}</span>
                          <span style={{ fontSize: '13px', color: T2 }}>copas</span>
                          {arena.next && (
                            <span style={{ fontSize: '10px', color: T2, padding: '2px 8px', borderRadius: '5px', background: 'rgba(255,255,255,0.08)', border: `1px solid rgba(${arena.colorRgb},0.25)`, fontFamily: 'monospace' }}>
                              {(arenaActual.max - copas + 1).toLocaleString()} → {arena.next}
                            </span>
                          )}
                        </div>
                        <div style={{ height: '5px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '6px', maxWidth: '280px' }}>
                          <div style={{ width: `${Math.min(progresoCopas, 100)}%`, height: '100%', borderRadius: '3px', backgroundColor: arena.color, boxShadow: `0 0 10px rgba(${arena.colorRgb},0.6)` }} />
                        </div>
                        <p style={{ fontSize: '10px', color: T3, fontFamily: 'monospace' }}>{Math.round(progresoCopas)}% completado</p>
                      </>
                    ) : (
                      <p style={{ fontSize: '13px', color: T2 }}>
                        {arena.min > copas ? `Faltan ${(arena.min - copas).toLocaleString()} copas` : '✓ Arena superada'}
                      </p>
                    )}
                  </div>
                  <div className="planet-anim" style={{ flexShrink: 0, filter: `drop-shadow(0 0 30px rgba(${arena.colorRgb},0.6))` }}>
                    <Planet type={arena.planet} size={155} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', position: 'relative', zIndex: 1 }}>
                  <button onClick={() => arenaIdx > 0 && setArenaIdx(i => i - 1)} style={{ background: 'none', border: 'none', color: arenaIdx > 0 ? T3 : 'transparent', cursor: arenaIdx > 0 ? 'pointer' : 'default', fontSize: '11px', fontFamily: 'monospace' }}>← {arenaIdx > 0 ? ARENAS[arenaIdx - 1].name : ''}</button>
                  <button onClick={() => arenaIdx < ARENAS.length - 1 && setArenaIdx(i => i + 1)} style={{ background: 'none', border: 'none', color: arenaIdx < ARENAS.length - 1 ? T3 : 'transparent', cursor: arenaIdx < ARENAS.length - 1 ? 'pointer' : 'default', fontSize: '11px', fontFamily: 'monospace' }}>{arenaIdx < ARENAS.length - 1 ? ARENAS[arenaIdx + 1].name : ''} →</button>
                </div>
              </div>
            </div>

            {/* SESIÓN + TERMINAL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="session-btn" onClick={() => navigate('/sesion')}
                style={{ width: '100%', padding: '20px', borderRadius: '14px', background: `linear-gradient(135deg, #4f46e5, #6366f1)`, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left', boxShadow: '0 4px 24px rgba(99,102,241,0.4)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '3px' }}>INICIAR SESIÓN SOC</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>
                    {userData?.arena} · {userData?.arena === 'Bronce' ? '20' : userData?.arena === 'Plata' ? '15' : userData?.arena === 'Oro' ? '10' : '7'} min
                  </div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <div style={{ flex: 1, borderRadius: '14px', overflow: 'hidden', border: `1px solid ${BD}`, backdropFilter: 'blur(20px)' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '8px 14px', borderBottom: `1px solid ${BD}`, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#FF5F57' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#FEBC2E' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#28C840' }} />
                  <span style={{ color: T3, fontSize: '10px', fontFamily: 'monospace', marginLeft: '8px' }}>soc-terminal</span>
                </div>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '14px 16px', fontFamily: "'Fira Code',monospace", fontSize: '11px', lineHeight: 2.0, minHeight: '168px' }}>
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
              { label: 'COPAS', value: copas.toLocaleString(), sub: arenaActual.name, color: arenaActual.color, colorRgb: arenaActual.colorRgb },
              { label: 'XP TOTAL', value: xp.toLocaleString(), sub: `${Math.round(progresoXP)}% al siguiente`, color: '#818cf8', colorRgb: '129,140,248' },
              { label: 'SESIONES', value: sesiones.toString(), sub: 'completadas', color: '#4ade80', colorRgb: '74,222,128' },
              { label: 'TIER', value: String(tier), sub: TIERS[tier], color: tierColor, colorRgb: '148,163,184', clickable: true },
            ].map((s, i) => (
              <div key={i} className="stat-card" onClick={s.clickable ? () => navigate('/perfil') : undefined}
                style={{ padding: '20px', borderRadius: '14px', backgroundColor: CARD, border: `1px solid ${BD}`, backdropFilter: 'blur(20px)', cursor: s.clickable ? 'pointer' : 'default', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${s.color},transparent)` }} />
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: `rgba(${s.colorRgb},0.15)`, border: `1px solid rgba(${s.colorRgb},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                </div>
                <div style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '1.5px', marginBottom: '6px', fontFamily: 'monospace' }}>{s.label}</div>
                <div style={{ fontSize: '30px', fontWeight: 900, color: s.color, letterSpacing: '-0.8px', lineHeight: 1, marginBottom: '6px', textShadow: `0 0 20px rgba(${s.colorRgb},0.4)` }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: T2 }}>{s.sub}</div>
                {s.clickable && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', color: '#818cf8', fontSize: '11px', fontWeight: 600 }}>
                    <span>Ver tiers</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* XP BAR */}
          <div style={{ padding: '16px 20px', borderRadius: '14px', backgroundColor: CARD, border: `1px solid ${BD}`, marginBottom: '12px', backdropFilter: 'blur(20px)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: tierColor }}>{TIERS[tier]}</span>
                <span style={{ fontSize: '10px', color: T3, padding: '2px 7px', borderRadius: '5px', backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${BD}`, fontFamily: 'monospace' }}>T{tier}</span>
                {tier < 8 && <span style={{ fontSize: '12px', color: T3 }}>→ {TIERS[tier + 1]}</span>}
              </div>
              <span style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>
                {xp.toLocaleString()} / {xpMax === 99999 ? '∞' : xpMax.toLocaleString()} XP
                {tier < 8 && <span> · {(xpMax - xp).toLocaleString()} restantes</span>}
              </span>
            </div>
            <div style={{ height: '7px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(progresoXP, 100)}%`, height: '100%', borderRadius: '4px', backgroundColor: tierColor, boxShadow: `0 0 8px ${tierColor}80` }} />
            </div>
          </div>

          {/* SKILLS + ACCESOS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '20px 22px', borderRadius: '14px', backgroundColor: CARD, border: `1px solid ${BD}`, backdropFilter: 'blur(20px)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
              <p style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '2px', marginBottom: '14px', fontFamily: 'monospace' }}>HABILIDADES CERTIFICADAS</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {SKILLS.map((s, i) => {
                  const val = skills?.[s.key] || 1;
                  return (
                    <div key={i} className="skill-card" style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: CARD2, border: `1px solid ${BD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: T2 }}>{s.label}</span>
                      <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                        {[...Array(6)].map((_, j) => (
                          <div key={j} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: j < Math.ceil(val / 2) ? '#6366f1' : 'rgba(255,255,255,0.1)', boxShadow: j < Math.ceil(val / 2) ? '0 0 4px rgba(99,102,241,0.6)' : 'none' }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '20px 22px', borderRadius: '14px', backgroundColor: CARD, border: `1px solid ${BD}`, backdropFilter: 'blur(20px)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
              <p style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '2px', marginBottom: '14px', fontFamily: 'monospace' }}>ACCESOS RÁPIDOS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Training', desc: '8 módulos SOC', path: '/training', color: '#a78bfa' },
                  { label: 'Ranking Global', desc: 'Tu posición', path: '/ranking', color: '#fbbf24' },
                  { label: 'Mi Certificado', desc: 'QR verificable', path: '/certificado', color: '#34d399' },
                  { label: 'Perfil & Tiers', desc: 'Stats y progression', path: '/perfil', color: '#60a5fa' },
                ].map((item, i) => (
                  <div key={i} className="quick-btn" onClick={() => navigate(item.path)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', backgroundColor: CARD2, border: `1px solid ${BD}`, cursor: 'pointer' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}`, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', color: T1, fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: '11px', color: T3, marginLeft: '8px' }}>{item.desc}</span>
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
