import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [fase, setFase] = useState('entrada'); // entrada, giro, texto, salida

  useEffect(() => {
    const t1 = setTimeout(() => setFase('giro'), 800);
    const t2 = setTimeout(() => setFase('texto'), 1600);
    const t3 = setTimeout(() => setFase('salida'), 2800);
    const t4 = setTimeout(() => onComplete(), 3600);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  const css = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.85); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes rotateLogo {
      from { transform: rotate(0deg) scale(1); }
      to { transform: rotate(180deg) scale(1.05); }
    }
    @keyframes slideLeft {
      from { transform: translateX(0) scale(1); opacity: 1; }
      to { transform: translateX(-38vw) scale(0.45); opacity: 1; }
    }
    @keyframes fadeInText {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes exitAll {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-8px); }
    }
    @keyframes bgFade {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    .logo-entrada {
      animation: fadeIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
    }
    .logo-giro {
      animation: rotateLogo 0.7s cubic-bezier(0.76,0,0.24,1) forwards;
    }
    .logo-salida {
      animation: slideLeft 0.65s cubic-bezier(0.76,0,0.24,1) forwards;
    }
    .texto-aparece {
      animation: fadeInText 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
    }
    .todo-sale {
      animation: exitAll 0.5s cubic-bezier(0.76,0,0.24,1) forwards;
    }
    .bg-fade {
      animation: bgFade 0.5s ease forwards;
    }
  `;

  const logoClass =
    fase === 'entrada' ? 'logo-entrada' :
    fase === 'giro' ? 'logo-giro' :
    fase === 'texto' ? '' :
    'logo-salida';

  const wrapperClass =
    fase === 'salida' ? 'todo-sale' : '';

  return (
    <>
      <style>{css}</style>
      <div
        className={fase === 'salida' ? 'bg-fade' : ''}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: '#060A14',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Inter',-apple-system,sans-serif",
        }}
      >
        <div
          className={wrapperClass}
          style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            position: 'relative',
          }}
        >
          {/* LOGO */}
          <div
            className={logoClass}
            style={{
              width: '80px', height: '80px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: fase === 'entrada' ? 0 : undefined,
            }}
          >
            <img
              src="/logosoc.png"
              alt="SocBlast"
              style={{ width: '80px', height: '80px', objectFit: 'contain' }}
            />
          </div>

          {/* TEXTO */}
          {(fase === 'texto' || fase === 'salida') && (
            <div
              className={fase === 'salida' ? '' : 'texto-aparece'}
              style={{ opacity: 0 }}
            >
              <div style={{
                fontSize: '36px',
                fontWeight: 900,
                letterSpacing: '-1.5px',
                color: '#F1F5F9',
                lineHeight: 1,
              }}>
                Soc<span style={{ color: '#3B82F6' }}>Blast</span>
              </div>
              <div style={{
                fontSize: '11px',
                color: '#334155',
                letterSpacing: '3px',
                marginTop: '4px',
                fontWeight: 500,
              }}>
                SOC PLATFORM
              </div>
            </div>
          )}
        </div>

        {/* Línea sutil debajo */}
        {fase === 'texto' && (
          <div style={{
            position: 'absolute', bottom: '40px',
            display: 'flex', alignItems: 'center', gap: '8px',
            animation: 'fadeInText 0.6s ease forwards',
            opacity: 0,
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3B82F6', opacity: 0.5 }} />
            <span style={{ fontSize: '11px', color: '#1E293B', letterSpacing: '2px' }}>POWERED BY ZORION</span>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3B82F6', opacity: 0.5 }} />
          </div>
        )}
      </div>
    </>
  );
};

export default SplashScreen;
