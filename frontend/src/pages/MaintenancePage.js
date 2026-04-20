import React, { useState, useEffect } from 'react';

const ACC = '#4f46e5';

// ── CONFIGURA AQUÍ EL MENSAJE Y TIEMPO ESTIMADO ──────────────────────────────
export const MAINTENANCE_CONFIG = {
  titulo:    'SoCBlast está en mantenimiento',
  subtitulo: 'Estamos mejorando la plataforma para ofrecerte una mejor experiencia.',
  estimado:  '30 minutos',          // tiempo estimado de vuelta — pon null para no mostrarlo
  mostrar_countdown: false,          // true = muestra contador regresivo (necesita fecha_fin)
  fecha_fin: null,                   // ej: '2025-03-20T18:00:00' — solo si mostrar_countdown=true
  redes: {
    twitter: '',                     // ej: 'https://twitter.com/socblast'
    discord: '',                     // ej: 'https://discord.gg/socblast'
  }
};

export default function MaintenancePage() {
  const [tiempo, setTiempo] = useState('');
  const [dots,   setDots]   = useState('');

  // Animación de puntos
  useEffect(() => {
    const iv = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 600);
    return () => clearInterval(iv);
  }, []);

  // Countdown si está configurado
  useEffect(() => {
    if (!MAINTENANCE_CONFIG.mostrar_countdown || !MAINTENANCE_CONFIG.fecha_fin) return;
    const calc = () => {
      const diff = new Date(MAINTENANCE_CONFIG.fecha_fin) - new Date();
      if (diff <= 0) { setTiempo('¡Pronto!'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTiempo(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, []);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    @keyframes fadeUp   { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
    @keyframes float    { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-10px) } }
    @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:.4 } }
    @keyframes spin     { to { transform:rotate(360deg) } }
    @keyframes shimmer  { 0% { background-position:-200% 0 } 100% { background-position:200% 0 } }
    * { box-sizing:border-box; margin:0; padding:0; }
  `;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <style>{css}</style>

      {/* Fondo decorativo */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60%', height:'60%', borderRadius:'50%', background:'radial-gradient(circle, rgba(79,70,229,.12) 0%, transparent 70%)' }}/>
        <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'60%', height:'60%', borderRadius:'50%', background:'radial-gradient(circle, rgba(129,140,248,.08) 0%, transparent 70%)' }}/>
        {/* Grid pattern */}
        <div style={{ position:'absolute', inset:0, opacity:.04, backgroundImage:'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize:'40px 40px' }}/>
      </div>

      {/* Card principal */}
      <div style={{
        maxWidth: 520, width: '100%', textAlign: 'center',
        animation: 'fadeUp .5s ease',
        position: 'relative', zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 32, animation: 'float 3s ease-in-out infinite' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'10px 20px', borderRadius:100, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)' }}>
            <img src="/logosoc.png" alt="SoCBlast" style={{ height:32 }} onError={e => e.target.style.display='none'}/>
            <span style={{ fontSize:22, fontWeight:900, color:'#f1f5f9', letterSpacing:'-.5px' }}>
              Soc<span style={{ color:ACC }}>Blast</span>
            </span>
          </div>
        </div>

        {/* Icono mantenimiento */}
        <div style={{ fontSize:72, marginBottom:24, filter:'drop-shadow(0 0 30px rgba(79,70,229,.4))' }}>🔧</div>

        {/* Badge estado */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:100, background:'rgba(251,191,36,.1)', border:'1px solid rgba(251,191,36,.3)', marginBottom:20 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#fbbf24', animation:'pulse 1.5s infinite' }}/>
          <span style={{ fontSize:12, color:'#fbbf24', fontWeight:700, letterSpacing:'.06em' }}>MANTENIMIENTO EN CURSO</span>
        </div>

        {/* Título */}
        <h1 style={{ fontSize:28, fontWeight:900, color:'#f1f5f9', marginBottom:12, lineHeight:1.2, letterSpacing:'-.5px' }}>
          {MAINTENANCE_CONFIG.titulo}
        </h1>

        <p style={{ fontSize:15, color:'#94a3b8', lineHeight:1.7, marginBottom:32, maxWidth:400, margin:'0 auto 32px' }}>
          {MAINTENANCE_CONFIG.subtitulo}
        </p>

        {/* Tiempo estimado */}
        {MAINTENANCE_CONFIG.estimado && !MAINTENANCE_CONFIG.mostrar_countdown && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'12px 24px', borderRadius:12, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', marginBottom:32 }}>
            <span style={{ fontSize:18 }}>⏱</span>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:10, color:'#64748b', fontWeight:600, letterSpacing:'.08em' }}>TIEMPO ESTIMADO</div>
              <div style={{ fontSize:16, fontWeight:800, color:'#e2e8f0' }}>{MAINTENANCE_CONFIG.estimado}</div>
            </div>
          </div>
        )}

        {/* Countdown */}
        {MAINTENANCE_CONFIG.mostrar_countdown && tiempo && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'12px 24px', borderRadius:12, background:'rgba(79,70,229,.1)', border:'1px solid rgba(79,70,229,.3)', marginBottom:32 }}>
            <span style={{ fontSize:18 }}>⏳</span>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:10, color:'#818cf8', fontWeight:600, letterSpacing:'.08em' }}>VOLVEMOS EN</div>
              <div style={{ fontSize:20, fontWeight:900, color:'#a5b4fc', fontFamily:'monospace' }}>{tiempo}</div>
            </div>
          </div>
        )}

        {/* Spinner + estado */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:36, color:'#64748b', fontSize:13 }}>
          <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.1)', borderTop:`2px solid ${ACC}`, borderRadius:'50%', animation:'spin .8s linear infinite', flexShrink:0 }}/>
          <span>Trabajando en ello{dots}</span>
        </div>

        {/* Qué está pasando */}
        <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'20px 24px', marginBottom:28, textAlign:'left' }}>
          <div style={{ fontSize:11, color:'#64748b', fontWeight:700, letterSpacing:'.08em', marginBottom:14 }}>¿QUÉ ESTÁ PASANDO?</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { icon:'⚡', text:'Actualizando el sistema de laboratorios SOC' },
              { icon:'🛡️', text:'Mejoras de rendimiento y seguridad' },
              { icon:'🔬', text:'Nuevas funcionalidades en camino' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
                <span style={{ fontSize:13, color:'#94a3b8' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Redes sociales si están configuradas */}
        {(MAINTENANCE_CONFIG.redes.twitter || MAINTENANCE_CONFIG.redes.discord) && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:12, color:'#475569', marginBottom:12 }}>Síguenos para actualizaciones en tiempo real</div>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              {MAINTENANCE_CONFIG.redes.twitter && (
                <a href={MAINTENANCE_CONFIG.redes.twitter} target="_blank" rel="noreferrer"
                  style={{ padding:'8px 18px', borderRadius:8, background:'rgba(29,155,240,.1)', border:'1px solid rgba(29,155,240,.3)', color:'#38bdf8', fontSize:13, fontWeight:600, textDecoration:'none' }}>
                  𝕏 Twitter
                </a>
              )}
              {MAINTENANCE_CONFIG.redes.discord && (
                <a href={MAINTENANCE_CONFIG.redes.discord} target="_blank" rel="noreferrer"
                  style={{ padding:'8px 18px', borderRadius:8, background:'rgba(88,101,242,.1)', border:'1px solid rgba(88,101,242,.3)', color:'#818cf8', fontSize:13, fontWeight:600, textDecoration:'none' }}>
                  Discord
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ fontSize:11, color:'#334155' }}>
          Powered by Zorion · SoCBlast Platform · socblast.com
        </p>
      </div>
    </div>
  );
}