import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BG   = '#03030A';
const CARD = 'rgba(14,26,46,0.9)';
const BD   = '#1A3050';
const T1   = '#FFFFFF';
const T2   = '#C8D8F0';
const T3   = '#5A7898';
const ACC  = '#2564F1';

const DashboardCompany = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    .fade-up{animation:fadeUp 0.4s ease forwards;}
    .card-btn:hover{border-color:rgba(37,100,241,0.4) !important;transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,0.5) !important;}
    .nav-btn:hover{color:${T1} !important;}
    *{transition:transform 0.2s ease,box-shadow 0.2s ease,border-color 0.2s ease,color 0.15s ease,background 0.15s ease;}
  `;

  const MENU = [
    {
      label: 'Talent Pool',
      desc: 'Busca y filtra analistas verificados por skills, arena y tier. Accede a perfiles detallados y métricas reales.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      path: '/talent-pool', available: true,
    },
    {
      label: 'Simulación Personalizada',
      desc: 'Diseña escenarios SOC a medida para evaluar candidatos o formar a tu equipo interno.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      path: '/simulacion-empresa', available: true,
    },
    {
      label: 'Publicar Oferta',
      desc: 'Publica vacantes visibles para todos los analistas activos en la plataforma.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      path: '/ofertas', available: true,
    },
    {
      label: 'Análisis de Empresa',
      desc: 'Evalúa las habilidades y detecta gaps de cobertura en tu equipo SOC interno.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
      available: false,
    },
    {
      label: 'Liga SOC Empresarial',
      desc: 'Compite contra otras empresas para construir el mejor equipo SOC del sector.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
      ),
      available: false,
    },
  ];

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: "'Inter',-apple-system,sans-serif", color: T1 }}>

        {/* NAVBAR */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', backgroundColor: 'rgba(14,26,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BD}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{ height: '28px' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: T1 }}>Soc<span style={{ color: ACC }}>Blast</span></span>
            <span style={{ fontSize: '11px', color: T3, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(37,100,241,0.1)', border: `1px solid rgba(37,100,241,0.2)`, fontFamily: 'monospace', marginLeft: '4px' }}>EMPRESA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '13px', color: T2 }}>{user?.nombre}</span>
            <button className="nav-btn" onClick={() => { logout(); navigate('/'); }} style={{ background: 'none', border: `1px solid ${BD}`, color: T3, padding: '6px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Salir</button>
          </div>
        </nav>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 40px 80px' }}>

          {/* HEADER */}
          <div className="fade-up" style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${ACC}15`, border: `1px solid ${ACC}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: T1, letterSpacing: '-0.5px', marginBottom: '2px' }}>Panel de Empresa</h1>
                <p style={{ fontSize: '13px', color: T3, fontFamily: 'monospace' }}>Bienvenido, {user?.nombre} · Gestiona tu talento SOC</p>
              </div>
            </div>
            <div style={{ height: '1px', backgroundColor: BD, marginTop: '24px' }} />
          </div>

          {/* GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {MENU.map((item, i) => (
              <div key={i} className={item.available ? 'card-btn' : ''} onClick={() => item.available && item.path && navigate(item.path)}
                style={{
                  padding: '28px 24px',
                  borderRadius: '12px',
                  backgroundColor: CARD,
                  border: `1px solid ${item.available ? BD : 'rgba(26,48,80,0.4)'}`,
                  cursor: item.available ? 'pointer' : 'not-allowed',
                  opacity: item.available ? 1 : 0.45,
                  position: 'relative',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  animationDelay: `${i * 0.06}s`,
                }}>

                {item.available && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent,${ACC}40,transparent)` }} />}

                {!item.available && (
                  <div style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '9px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(26,48,80,0.8)', color: T3, fontFamily: 'monospace', fontWeight: 700, border: `1px solid ${BD}`, letterSpacing: '1px' }}>
                    PRÓXIMO
                  </div>
                )}

                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: item.available ? `${ACC}12` : 'rgba(26,48,80,0.5)', border: `1px solid ${item.available ? ACC + '25' : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', color: item.available ? ACC : T3 }}>
                  {item.icon}
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: 700, color: item.available ? T1 : T3, marginBottom: '8px', letterSpacing: '-0.2px' }}>{item.label}</h3>
                <p style={{ fontSize: '12px', color: T3, lineHeight: 1.7 }}>{item.desc}</p>

                {item.available && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px', color: ACC, fontSize: '11px', fontWeight: 600 }}>
                    <span>Acceder</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: T3, paddingBottom: '24px', fontFamily: 'monospace' }}>Powered by Zorion</p>
      </div>
    </>
  );
};

export default DashboardCompany;