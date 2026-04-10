import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Planet = ({ type, size = 120 }) => {
  const planets = {
    bronce: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <radialGradient id="b1" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#E8A050"/>
            <stop offset="40%" stopColor="#CD7F32"/>
            <stop offset="100%" stopColor="#5C3010"/>
          </radialGradient>
          <radialGradient id="b2" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.5)"/>
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="52" fill="url(#b1)"/>
        <ellipse cx="45" cy="40" rx="18" ry="8" fill="rgba(180,100,30,0.4)" transform="rotate(-20,45,40)"/>
        <ellipse cx="70" cy="65" rx="22" ry="6" fill="rgba(100,50,10,0.35)" transform="rotate(10,70,65)"/>
        <ellipse cx="50" cy="78" rx="14" ry="5" fill="rgba(160,80,20,0.3)" transform="rotate(-5,50,78)"/>
        <circle cx="38" cy="45" r="4" fill="rgba(80,35,5,0.5)"/>
        <circle cx="72" cy="55" r="3" fill="rgba(80,35,5,0.4)"/>
        <circle cx="55" cy="72" r="5" fill="rgba(80,35,5,0.45)"/>
        <circle cx="60" cy="60" r="52" fill="url(#b2)"/>
      </svg>
    ),
    plata: (
      <svg width={size} height={size} viewBox="0 0 140 120">
        <defs>
          <radialGradient id="p1" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#E2E8F0"/>
            <stop offset="50%" stopColor="#94A3B8"/>
            <stop offset="100%" stopColor="#2D3748"/>
          </radialGradient>
          <radialGradient id="p2" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.45)"/>
          </radialGradient>
          <linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(148,163,184,0)"/>
            <stop offset="30%" stopColor="rgba(148,163,184,0.6)"/>
            <stop offset="70%" stopColor="rgba(148,163,184,0.6)"/>
            <stop offset="100%" stopColor="rgba(148,163,184,0)"/>
          </linearGradient>
        </defs>
        <ellipse cx="70" cy="72" rx="68" ry="8" fill="url(#ring1)" opacity="0.5"/>
        <ellipse cx="70" cy="68" rx="62" ry="6" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="3"/>
        <circle cx="70" cy="60" r="48" fill="url(#p1)"/>
        <ellipse cx="55" cy="45" rx="16" ry="5" fill="rgba(200,210,225,0.3)" transform="rotate(-15,55,45)"/>
        <ellipse cx="75" cy="68" rx="20" ry="5" fill="rgba(60,80,110,0.3)" transform="rotate(8,75,68)"/>
        <circle cx="70" cy="60" r="48" fill="url(#p2)"/>
      </svg>
    ),
    oro: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <radialGradient id="o1" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#FDE68A"/>
            <stop offset="40%" stopColor="#F59E0B"/>
            <stop offset="100%" stopColor="#78350F"/>
          </radialGradient>
          <radialGradient id="o2" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.4)"/>
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="url(#o1)"/>
        <ellipse cx="60" cy="45" rx="48" ry="7" fill="rgba(245,210,50,0.25)" transform="rotate(-5,60,45)"/>
        <ellipse cx="60" cy="58" rx="50" ry="6" fill="rgba(180,80,10,0.3)" transform="rotate(3,60,58)"/>
        <ellipse cx="60" cy="70" rx="46" ry="5" fill="rgba(245,200,50,0.2)" transform="rotate(-2,60,70)"/>
        <circle cx="35" cy="50" r="8" fill="rgba(240,160,20,0.4)"/>
        <circle cx="82" cy="42" r="6" fill="rgba(240,160,20,0.35)"/>
        <circle cx="60" cy="60" r="54" fill="url(#o2)"/>
      </svg>
    ),
    elite: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <radialGradient id="e1" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#DDD6FE"/>
            <stop offset="40%" stopColor="#7C3AED"/>
            <stop offset="100%" stopColor="#1E0A3C"/>
          </radialGradient>
          <radialGradient id="e2" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.5)"/>
          </radialGradient>
          <radialGradient id="aura" cx="50%" cy="50%">
            <stop offset="60%" stopColor="rgba(167,139,250,0)"/>
            <stop offset="100%" stopColor="rgba(124,58,237,0.25)"/>
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#aura)"/>
        <circle cx="60" cy="60" r="50" fill="url(#e1)"/>
        <ellipse cx="48" cy="42" rx="14" ry="4" fill="rgba(200,180,255,0.2)" transform="rotate(-20,48,42)"/>
        <ellipse cx="65" cy="58" rx="18" ry="4" fill="rgba(50,10,100,0.4)" transform="rotate(10,65,58)"/>
        <ellipse cx="52" cy="72" rx="16" ry="4" fill="rgba(150,100,255,0.2)" transform="rotate(-5,52,72)"/>
        <circle cx="42" cy="48" r="3" fill="rgba(220,200,255,0.6)"/>
        <circle cx="75" cy="52" r="2" fill="rgba(220,200,255,0.5)"/>
        <circle cx="60" cy="60" r="50" fill="url(#e2)"/>
        <circle cx="60" cy="60" r="58" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="1"/>
      </svg>
    ),
  };
  return planets[type] || null;
};

const LandingPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [lang, setLang] = useState('es');
  const es = lang === 'es';

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const nodes = Array.from({ length: 120 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
      r: Math.random() * 3 + 1.5,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    let mouse = { x: w / 2, y: h / 2 };
    const onMouse = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMouse);
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      nodes.forEach(n => {
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250) { n.vx += dx / dist * 0.03; n.vy += dy / dist * 0.03; }
        n.vx *= 0.98; n.vy *= 0.98;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${n.opacity})`;
        ctx.fill();
      });
      nodes.forEach((a, i) => nodes.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 160) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(59,130,246,${(1 - d / 160) * 0.25})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMouse); };
  }, []);

  const css = `
    @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
    @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
    .fade-up { animation: fadeUp 0.7s ease forwards; }
    .planet-float { animation: float 6s ease-in-out infinite; }
    .btn-primary:hover { transform:translateY(-2px); box-shadow:0 0 60px rgba(79,70,229,0.5) !important; }
    .btn-secondary:hover { background:rgba(255,255,255,0.08) !important; }
    .card-hover:hover { transform:translateY(-6px); }
    .nav-link:hover { color:#E2E8F0 !important; }
    .arena-card-land:hover { transform:translateY(-8px); }
    .tier-row:hover { background:rgba(255,255,255,0.04) !important; }
    * { transition:transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, color 0.2s ease; }
  `;

  const arenas = [
    { name: 'Bronce', planet: 'bronce', color: '#CD7F32', colorRgb: '205,127,50', cups: '0 — 999', diff: es ? 'Básico' : 'Basic', time: '20 min', desc: es ? 'Alertas simples. Amenazas identificables. Ideal para comenzar.' : 'Simple alerts. Identifiable threats. Ideal to start.', pct: 25 },
    { name: 'Plata', planet: 'plata', color: '#94A3B8', colorRgb: '148,163,184', cups: '1K — 2K', diff: es ? 'Intermedio' : 'Intermediate', time: '15 min', desc: es ? 'Correlación de eventos. Señuelos y falsas alertas.' : 'Event correlation. Decoys and false alerts.', pct: 50 },
    { name: 'Oro', planet: 'oro', color: '#F59E0B', colorRgb: '245,158,11', cups: '2K — 3K', diff: es ? 'Avanzado' : 'Advanced', time: '10 min', desc: es ? 'Múltiples vectores. Logs SIEM/EDR en profundidad.' : 'Multiple vectors. In-depth SIEM/EDR logs.', pct: 75 },
    { name: 'Elite', planet: 'elite', color: '#A78BFA', colorRgb: '167,139,250', cups: '3K+', diff: 'Elite', time: '7 min', desc: es ? 'APT multi-fase. Terminal de comandos. Máxima presión.' : 'Multi-phase APT. Command terminal. Maximum pressure.', pct: 100 },
  ];

  const tiers = [
    { tier: 1, name: 'SOC Rookie', xp: '0 — 500', color: '#64748B' },
    { tier: 2, name: 'SOC Analyst', xp: '500 — 1.500', color: '#3B82F6' },
    { tier: 3, name: 'SOC Specialist', xp: '1.500 — 3.000', color: '#06B6D4' },
    { tier: 4, name: 'SOC Expert', xp: '3.000 — 5.000', color: '#10B981' },
    { tier: 5, name: 'SOC Sentinel', xp: '5.000 — 8.000', color: '#F59E0B' },
    { tier: 6, name: 'SOC Architect', xp: '8.000 — 12.000', color: '#F97316' },
    { tier: 7, name: 'SOC Master', xp: '12.000 — 18.000', color: '#EF4444' },
    { tier: 8, name: 'SOC Legend', xp: '18.000+', color: '#A78BFA' },
  ];

  return (
    <>
      <style>{css}</style>
      <div style={{ backgroundColor: '#060A14', fontFamily: "'Inter',-apple-system,sans-serif", overflowX: 'hidden', color: '#fff' }}>

        {/* NAVBAR — logo + SocBlast */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px', backgroundColor: 'rgba(6,10,20,0.82)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{ height: '38px', width: 'auto' }} />
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#F1F5F9' }}>
              Soc<span style={{ color: '#3B82F6' }}>Blast</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            {[
              { label: es ? 'Plataforma' : 'Platform', action: () => navigate('/dashboard') },
              { label: es ? 'Training' : 'Training', action: () => navigate('/training') },
              { label: es ? 'Ranking' : 'Ranking', action: () => navigate('/ranking') },
              { label: es ? 'Empresas' : 'Enterprise', action: () => navigate('/company') },
            ].map((item, i) => (
              <span key={i} className="nav-link" onClick={item.action} style={{ fontSize: '14px', color: '#64748B', cursor: 'pointer', fontWeight: 500 }}>{item.label}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setLang(es ? 'en' : 'es')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#64748B', padding: '5px 11px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>{es ? 'EN' : 'ES'}</button>
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#CBD5E1', padding: '7px 18px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>{es ? 'Iniciar sesión' : 'Sign in'}</button>
            <button className="btn-primary" onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg,#2563EB,#4F46E5)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '100px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 0 24px rgba(79,70,229,0.35)' }}>{es ? 'Empezar gratis' : 'Get Started'}</button>
          </div>
        </nav>

        {/* HERO — centrado */}
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '64px 24px 0', overflow: 'hidden' }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 80% at 50% 45%,rgba(37,99,235,0.05) 0%,rgba(6,10,20,0.4) 55%,#060A14 90%)', zIndex: 1 }} />
          <div className="fade-up" style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/logozorion.png" alt="Zorion" style={{ height: '18px', width: 'auto', opacity: 0.45 }} />
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 500, letterSpacing: '1.5px' }}>POWERED BY ZORION</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(96,165,250,0.22)', backgroundColor: 'rgba(96,165,250,0.07)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#60A5FA', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '11px', color: '#93C5FD', fontWeight: 600, letterSpacing: '2px' }}>SOC PLATFORM — ONLINE</span>
              </div>
            </div>
            <h1 style={{ fontSize: 'clamp(44px,7.5vw,88px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-3.5px', marginBottom: '22px', color: '#F8FAFC' }}>
              {es ? 'Entrena como un' : 'Train like a real'}
              <br />
              <span style={{ background: 'linear-gradient(135deg,#60A5FA 0%,#818CF8 45%,#C084FC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {es ? 'Analista SOC Real.' : 'SOC Analyst.'}
              </span>
            </h1>
            <p style={{ fontSize: '18px', color: '#64748B', maxWidth: '560px', margin: '0 auto 44px', lineHeight: 1.7 }}>
              {es ? 'Simulaciones de ciberseguridad del mundo real. Investiga alertas, analiza logs y demuestra tu nivel con un certificado verificable.' : 'Real-world cybersecurity simulations. Investigate alerts, analyze logs and prove your level with a verifiable certificate.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '72px' }}>
              <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '14px 30px', borderRadius: '100px', background: 'linear-gradient(135deg,#2563EB,#4F46E5)', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 36px rgba(79,70,229,0.3)' }}>
                {es ? 'Iniciar Training →' : 'Start Training →'}
              </button>
              <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ padding: '14px 30px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', fontSize: '15px', cursor: 'pointer', fontWeight: 500 }}>
                {es ? 'Ver plataforma' : 'View Platform'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '56px', justifyContent: 'center' }}>
              {[{ v: '2.400+', l: es ? 'Analistas activos' : 'Active analysts' }, { v: '98%', l: es ? 'Satisfacción' : 'Satisfaction' }, { v: 'Fortune 500', l: es ? 'Empresas confían' : 'Companies trust us' }].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.8px' }}>{s.v}</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '180px', background: 'linear-gradient(to bottom,transparent,#060A14)', zIndex: 2 }} />
        </div>

        {/* SESSIONS — texto pegado borde izquierdo, terminal derecha */}
        <div style={{ padding: '130px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '0' }}>
            <div style={{ paddingLeft: '8vw', paddingRight: '60px' }}>
              <p style={{ fontSize: '11px', color: '#3B82F6', letterSpacing: '3px', fontWeight: 700, marginBottom: '16px' }}>SESSIONS</p>
              <h2 style={{ fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#F1F5F9', lineHeight: 1.1, marginBottom: '18px' }}>
                {es ? 'Sesiones SOC que\nse sienten reales.' : 'SOC sessions that\nfeel real.'}
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.8, marginBottom: '28px' }}>
                {es ? 'Cada sesión genera un escenario único. Alertas SIEM/EDR en tiempo real, logs reales y ataques progresivos. La IA evalúa cada decisión.' : 'Each session generates a unique scenario. Real-time SIEM/EDR alerts, real logs and progressive attacks. AI evaluates every decision.'}
              </p>
              {(es ? ['Escenarios únicos generados por IA', 'Alertas SIEM/EDR en tiempo real', 'Evaluación automática de cada decisión', 'Sistema de copas y arenas competitivo'] : ['Unique AI-generated scenarios', 'Real-time SIEM/EDR alerts', 'Automatic evaluation of every decision', 'Competitive cups and arena system']).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'rgba(37,99,235,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                  </div>
                  <span style={{ fontSize: '14px', color: '#94A3B8' }}>{item}</span>
                </div>
              ))}
            </div>
            {/* Terminal pegada al borde derecho */}
            <div style={{ borderRadius: '18px 0 0 18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', borderRight: 'none', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>
              <div style={{ backgroundColor: '#0D1420', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FF5F57' }} />
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#FEBC2E' }} />
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#28C840', boxShadow: '0 0 5px rgba(40,200,64,0.6)' }} />
                <span style={{ color: '#1E293B', fontSize: '11px', fontFamily: "'Fira Code',monospace", marginLeft: '10px' }}>socblast — session active</span>
              </div>
              <div style={{ backgroundColor: '#060C18', padding: '36px', fontFamily: "'Fira Code','JetBrains Mono',monospace", fontSize: '13px', lineHeight: 2.4 }}>
                <p style={{ color: '#F87171' }}>⚠  CRITICAL   Brute force on Active Directory</p>
                <p style={{ color: '#FB923C' }}>   →  src_ip: 185.220.101.45   rate: 94/min</p>
                <p style={{ color: '#60A5FA' }}>   →  target: CORP-DC01   port: 445/SMB</p>
                <p style={{ color: '#34D399' }}>   →  account: administrator   LOCKED</p>
                <p style={{ color: '#1E293B' }}>   $  correlating SIEM events...</p>
                <p style={{ color: '#FB923C' }}>   →  lateral movement   host: WKS-012</p>
                <p style={{ color: '#818CF8' }}>   →  T1078 Valid Accounts detected</p>
                <p style={{ color: '#1E293B' }}>   $  awaiting analyst response...</p>
                <p style={{ color: '#60A5FA' }}>   ▌</p>
              </div>
            </div>
          </div>
        </div>

        {/* TRAINING — mockup pegado borde izquierdo, texto derecha */}
        <div style={{ backgroundColor: '#080D18', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '130px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '0' }}>
            {/* Mockup pegado al borde izquierdo */}
            <div style={{ borderRadius: '0 18px 18px 0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', borderLeft: 'none', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
              <div style={{ backgroundColor: '#0D1420', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#8B5CF6', letterSpacing: '2px', fontWeight: 700 }}>MÓDULO 3 — Detección de Amenazas</span>
                <span style={{ fontSize: '11px', color: '#334155' }}>50%</span>
              </div>
              <div style={{ backgroundColor: '#060C18', padding: '28px' }}>
                {[
                  { title: es ? 'Indicadores de compromiso IOC' : 'Indicators of Compromise', done: true, xp: 50 },
                  { title: 'MITRE ATT&CK Framework', done: true, xp: 70 },
                  { title: es ? 'Detección de movimiento lateral' : 'Lateral movement detection', done: false, xp: 70, active: true },
                  { title: es ? 'Gestión de falsas alertas' : 'False alerts management', done: false, xp: 60 },
                ].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', backgroundColor: l.active ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)', border: l.active ? '1px solid rgba(59,130,246,0.18)' : '1px solid rgba(255,255,255,0.03)', marginBottom: '7px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: l.done ? 'rgba(52,211,153,0.1)' : l.active ? 'rgba(59,130,246,0.1)' : 'transparent', border: `1px solid ${l.done ? 'rgba(52,211,153,0.4)' : l.active ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', color: l.done ? '#34D399' : l.active ? '#60A5FA' : '#1E293B' }}>
                      {l.done ? '✓' : l.active ? '▶' : '○'}
                    </div>
                    <span style={{ fontSize: '13px', color: l.done ? '#475569' : l.active ? '#E2E8F0' : '#1E293B', flex: 1, fontWeight: l.active ? 500 : 400 }}>{l.title}</span>
                    <span style={{ fontSize: '11px', color: l.done ? '#34D399' : '#1E293B', fontWeight: 600 }}>+{l.xp} XP</span>
                  </div>
                ))}
                <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#334155' }}>{es ? 'Progreso' : 'Progress'}</span>
                    <span style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 600 }}>50%</span>
                  </div>
                  <div style={{ height: '3px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '50%', height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg,#2563EB,#7C3AED)' }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ paddingLeft: '60px', paddingRight: '8vw' }}>
              <p style={{ fontSize: '11px', color: '#8B5CF6', letterSpacing: '3px', fontWeight: 700, marginBottom: '16px' }}>TRAINING</p>
              <h2 style={{ fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#F1F5F9', lineHeight: 1.1, marginBottom: '18px' }}>
                {es ? 'Un curso SOC completo\ny estructurado.' : 'A complete, structured\nSOC course.'}
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.8, marginBottom: '32px' }}>
                {es ? '8 módulos progresivos desde fundamentos hasta inteligencia de amenazas avanzada. Con teoría, ejercicios prácticos y XP real.' : '8 progressive modules from fundamentals to advanced threat intelligence. With theory, practical exercises and real XP.'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {[{ v: '8', l: es ? 'Módulos' : 'Modules' }, { v: '28', l: es ? 'Lecciones' : 'Lessons' }, { v: '2.580', l: 'XP Total' }].map((s, i) => (
                  <div key={i} style={{ padding: '18px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#F1F5F9', letterSpacing: '-1px' }}>{s.v}</div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TIERS/XP — texto pegado borde izquierdo, visual derecha */}
        <div style={{ padding: '130px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '0' }}>
            <div style={{ paddingLeft: '8vw', paddingRight: '60px' }}>
              <p style={{ fontSize: '11px', color: '#10B981', letterSpacing: '3px', fontWeight: 700, marginBottom: '16px' }}>XP & TIERS</p>
              <h2 style={{ fontSize: 'clamp(28px,3.5vw,48px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#F1F5F9', lineHeight: 1.1, marginBottom: '18px' }}>
                {es ? 'Tu progreso.\nTu identidad.' : 'Your progress.\nYour identity.'}
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.8, marginBottom: '32px' }}>
                {es ? 'Cada sesión y lección te da XP. El XP sube tu Tier. Desde SOC Rookie hasta SOC Legend, tu tier refleja tu expertise real en ciberseguridad.' : 'Every session and lesson gives you XP. XP raises your Tier. From SOC Rookie to SOC Legend, your tier reflects your real cybersecurity expertise.'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: es ? 'Sesión completada' : 'Session completed', xp: '+50–400 XP', color: '#3B82F6' },
                  { label: es ? 'Lección de training' : 'Training lesson', xp: '+30–70 XP', color: '#8B5CF6' },
                  { label: es ? 'Sin usar pistas' : 'No hints used', xp: '+bonus XP', color: '#10B981' },
                  { label: es ? 'Arena Elite' : 'Elite arena', xp: '+400 XP max', color: '#A78BFA' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: item.color }}>{item.xp}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Tier list pegada al borde derecho */}
            <div style={{ borderRadius: '18px 0 0 18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', borderRight: 'none', backgroundColor: '#080D18', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#10B981', letterSpacing: '2px', fontWeight: 700 }}>TIER SYSTEM</span>
                <span style={{ fontSize: '11px', color: '#334155' }}>8 niveles</span>
              </div>
              <div style={{ padding: '8px' }}>
                {tiers.map((t, i) => (
                  <div key={i} className="tier-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '10px', backgroundColor: 'transparent', marginBottom: '2px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: `${t.color}18`, border: `1px solid ${t.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: t.color }}>{t.tier}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0' }}>{t.name}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#334155', fontFamily: 'monospace' }}>{t.xp} XP</div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: t.color, flexShrink: 0, boxShadow: `0 0 6px ${t.color}` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOR EVERYONE */}
        <div style={{ backgroundColor: '#080D18', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '130px 60px' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ marginBottom: '56px' }}>
              <p style={{ fontSize: '11px', color: '#3B82F6', letterSpacing: '3px', fontWeight: 700, marginBottom: '16px' }}>FOR EVERYONE</p>
              <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-1.8px', color: '#F1F5F9', marginBottom: '14px', maxWidth: '600px' }}>
                {es ? '¿Para quién es SocBlast?' : 'Who is SocBlast for?'}
              </h2>
              <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '440px' }}>
                {es ? 'Para analistas que quieren crecer y para empresas que buscan el mejor talento.' : 'For analysts who want to grow and companies looking for top talent.'}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
              <div className="card-hover" style={{ padding: '56px', borderRadius: '24px', background: 'linear-gradient(145deg,rgba(37,99,235,0.08) 0%,rgba(6,10,20,0) 100%)', border: '1px solid rgba(37,99,235,0.16)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.08),transparent)', pointerEvents: 'none' }} />
                <p style={{ fontSize: '11px', color: '#60A5FA', letterSpacing: '3px', fontWeight: 700, marginBottom: '16px' }}>FOR ANALYSTS</p>
                <h3 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', color: '#F1F5F9', marginBottom: '14px' }}>{es ? 'Analistas SOC' : 'SOC Analysts'}</h3>
                <p style={{ color: '#64748B', fontSize: '15px', lineHeight: 1.8, marginBottom: '28px', maxWidth: '480px' }}>
                  {es ? 'Entrena con escenarios reales generados por IA, sube desde Bronce hasta Elite y obtén un certificado verificable que las empresas buscan al contratar.' : 'Train with AI-generated real scenarios, climb from Bronze to Elite and get a verifiable certificate that companies look for when hiring.'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '36px' }}>
                  {(es ? ['Sesiones SOC únicas con IA', 'Arenas Bronce → Elite', 'Certificado con QR verificable', 'Ranking global', 'Training en 8 módulos', 'XP y skills certificadas'] : ['Unique AI SOC sessions', 'Bronze → Elite arenas', 'QR-verifiable certificate', 'Global ranking', '8-module training', 'XP and certified skills']).map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94A3B8' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#3B82F6', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '12px 28px', borderRadius: '100px', background: 'linear-gradient(135deg,#2563EB,#4F46E5)', border: 'none', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 0 24px rgba(79,70,229,0.3)' }}>
                  {es ? 'Iniciar Training →' : 'Start Training →'}
                </button>
              </div>
              <div className="card-hover" style={{ padding: '48px', borderRadius: '24px', background: 'linear-gradient(145deg,rgba(124,58,237,0.08) 0%,rgba(6,10,20,0) 100%)', border: '1px solid rgba(124,58,237,0.16)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.08),transparent)', pointerEvents: 'none' }} />
                <div>
                  <p style={{ fontSize: '11px', color: '#A78BFA', letterSpacing: '3px', fontWeight: 700, marginBottom: '16px' }}>FOR COMPANIES</p>
                  <h3 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', color: '#F1F5F9', marginBottom: '12px' }}>{es ? 'Empresas' : 'Companies'}</h3>
                  <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.8, marginBottom: '24px' }}>
                    {es ? 'Accede al Talent Pool, crea simulaciones personalizadas y publica ofertas de trabajo.' : 'Access the Talent Pool, create custom simulations and post job offers.'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                    {(es ? ['Talent Pool con filtros', 'Simulaciones a medida', 'Publicación de ofertas', 'Comparativa de candidatos'] : ['Filtered Talent Pool', 'Custom simulations', 'Job posting', 'Candidate comparison']).map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94A3B8' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#7C3AED', flexShrink: 0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '11px 24px', borderRadius: '100px', background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', border: 'none', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
                  {es ? 'Empezar →' : 'Get started →'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ARENAS — PLANETAS */}
        <div style={{ padding: '130px 60px' }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
            <div style={{ marginBottom: '72px' }}>
              <p style={{ fontSize: '11px', color: '#F59E0B', letterSpacing: '3px', fontWeight: 700, marginBottom: '16px' }}>ARENA SYSTEM</p>
              <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-1.8px', color: '#F1F5F9', marginBottom: '14px' }}>
                {es ? '¿En qué arena estás?' : 'Which arena are you in?'}
              </h2>
              <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '440px' }}>
                {es ? 'Cuatro planetas. Cuatro niveles. Un solo objetivo.' : 'Four planets. Four levels. One goal.'}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
              {arenas.map((a, i) => (
                <div key={i} className="arena-card-land" style={{ padding: '32px 24px', borderRadius: '20px', backgroundColor: `rgba(${a.colorRgb},0.04)`, border: `1px solid ${a.color}20`, textAlign: 'center', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                  <div className="planet-float" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', animationDelay: `${i * 0.8}s` }}>
                    <Planet type={a.planet} size={110} />
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: a.color, marginBottom: '6px', letterSpacing: '-0.5px' }}>{a.name}</div>
                  <div style={{ fontSize: '11px', color: '#334155', fontFamily: 'monospace', marginBottom: '12px' }}>{a.cups}</div>
                  <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>{a.desc}</p>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#334155', fontWeight: 600 }}>{a.diff}</span>
                      <span style={{ fontSize: '10px', color: a.color, fontWeight: 600 }}>{a.pct}%</span>
                    </div>
                    <div style={{ height: '3px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <div style={{ width: `${a.pct}%`, height: '100%', borderRadius: '2px', backgroundColor: a.color }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    <span style={{ color: a.color }}>⏱</span> {a.time} {es ? 'por sesión' : 'per session'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA FINAL */}
        <div style={{ backgroundColor: '#080D18', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '130px 60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%,rgba(37,99,235,0.07) 0%,transparent 70%)' }} />
          <div style={{ maxWidth: '1140px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ borderRadius: '28px', padding: '80px', background: 'linear-gradient(145deg,rgba(37,99,235,0.08) 0%,rgba(124,58,237,0.06) 100%)', border: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '60px', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-100px', right: '200px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.06),transparent)', pointerEvents: 'none' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <img src="/logosoc.png" alt="SocBlast" style={{ height: '40px', width: 'auto' }} />
                  <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', color: '#F1F5F9' }}>
                    Soc<span style={{ color: '#3B82F6' }}>Blast</span>
                  </span>
                </div>
                <h2 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, letterSpacing: '-2px', color: '#F1F5F9', lineHeight: 1.05, marginBottom: '16px' }}>
                  {es ? 'Listo para demostrar\ntu nivel.' : 'Ready to prove\nyour level.'}
                </h2>
                <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.6 }}>
                  {es ? 'Únete gratis hoy. Sin tarjeta de crédito. Empieza en menos de 2 minutos.' : 'Join free today. No credit card. Get started in under 2 minutes.'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
                <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '16px 40px', borderRadius: '100px', background: 'linear-gradient(135deg,#2563EB,#4F46E5)', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 48px rgba(79,70,229,0.28)', whiteSpace: 'nowrap' }}>
                  {es ? 'Crear cuenta gratis →' : 'Create free account →'}
                </button>
                <button className="btn-secondary" onClick={() => navigate('/login')} style={{ padding: '14px 32px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', fontSize: '15px', fontWeight: 500, cursor: 'pointer', textAlign: 'center' }}>
                  {es ? 'Ya tengo cuenta' : 'I have an account'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ backgroundColor: '#080D18', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logosoc.png" alt="SocBlast" style={{ height: '40px', width: 'auto' }} />
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#F1F5F9' }}>
              Soc<span style={{ color: '#3B82F6' }}>Blast</span>
            </span>
            <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: '8px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '8px' }}>
              <img src="/logozorion.png" alt="Zorion" style={{ height: '0.6px', width: 'auto', opacity: 0.4 }} />
              <span style={{ fontSize: '9px', color: '#1E293B', letterSpacing: '1.5px' }}>POWERED BY ZORION</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[es ? 'Términos' : 'Terms', es ? 'Privacidad' : 'Privacy', es ? 'Contacto' : 'Contact'].map((l, i) => (
              <span key={i} style={{ color: '#334155', fontSize: '13px', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
          <button onClick={() => setLang(es ? 'en' : 'es')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.07)', color: '#475569', padding: '5px 13px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
            {es ? 'EN' : 'ES'}
          </button>
        </div>
      </div>
    </>
  );
};

export default LandingPage;