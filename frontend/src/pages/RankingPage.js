import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TIERS = ['SOC Rookie', 'SOC Analyst', 'SOC Specialist', 'SOC Expert', 'SOC Sentinel', 'SOC Architect', 'SOC Master', 'SOC Legend'];
const ARENAS_DATA = {
  Bronce: { color: '#CD7F32', colorRgb: '205,127,50' },
  Plata: { color: '#94A3B8', colorRgb: '148,163,184' },
  Oro: { color: '#F59E0B', colorRgb: '245,158,11' },
  Elite: { color: '#A78BFA', colorRgb: '167,139,250' },
};

const BG   = '#03030A';
const CARD = 'rgba(14,26,46,0.9)';
const CARD_SOLID = '#0E1A2E';
const BD   = '#1A3050';
const T1   = '#FFFFFF';
const T2   = '#C8D8F0';
const T3   = '#5A7898';
const ACC  = '#2564F1';

const RankingPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroArena, setFiltroArena] = useState('Todos');
  const [miPosicion, setMiPosicion] = useState(null);

  useEffect(() => { fetchRanking(); }, []);

  const fetchRanking = async () => {
    try {
      const res = await axios.get('https://socblast-production.up.railway.app/api/ranking', { headers: { Authorization: `Bearer ${token}` } });
      setJugadores(res.data.jugadores);
      setMiPosicion(res.data.mi_posicion);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const jugadoresFiltrados = filtroArena === 'Todos' ? jugadores : jugadores.filter(j => j.arena === filtroArena);

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    .fade-up{animation:fadeUp 0.3s ease forwards;}
    .row:hover{border-color:rgba(37,100,241,0.3) !important;background:rgba(14,26,46,0.95) !important;transform:translateX(2px);}
    .nav-btn:hover{color:${T1} !important;background:rgba(37,100,241,0.08) !important;}
    .filter-btn:hover{border-color:rgba(37,100,241,0.4) !important;color:${ACC} !important;}
    *{transition:transform 0.15s ease,border-color 0.15s ease,background 0.15s ease,color 0.15s ease;}
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: "'Inter',-apple-system,sans-serif", color: T1 }}>

        <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: 'rgba(14,26,46,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BD}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{ height: '30px' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.4px', color: T1 }}>Soc<span style={{ color: ACC }}>Blast</span></span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[
              { label: '← Dashboard', path: '/dashboard' },
              { label: 'Training', path: '/training' },
              { label: 'Perfil', path: '/perfil' },
              { label: 'Certificado', path: '/certificado' },
            ].map((item, i) => (
              <button key={i} className="nav-btn" onClick={() => navigate(item.path)} style={{ padding: '5px 14px', borderRadius: '6px', background: 'none', border: 'none', color: T2, fontSize: '13px', cursor: 'pointer' }}>
                {item.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '12px', color: T3, fontFamily: 'monospace' }}>{jugadores.length} analistas</span>
        </nav>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 40px 60px' }}>

          {/* HEADER */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: T1, marginBottom: '4px', letterSpacing: '-0.5px' }}>Ranking Global</h1>
            <p style={{ fontSize: '12px', color: T3, fontFamily: 'monospace' }}>Clasificación por copas · Actualizado en tiempo real</p>
          </div>

          {/* MI POSICIÓN */}
          {miPosicion && (
            <div className="fade-up" style={{ padding: '20px 24px', borderRadius: '12px', backgroundColor: CARD, border: `1px solid rgba(37,100,241,0.3)`, marginBottom: '20px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)', boxShadow: `0 4px 24px rgba(0,0,0,0.4)` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'center', minWidth: '48px' }}>
                    <div style={{ fontSize: '9px', color: ACC, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', marginBottom: '4px' }}>TU POSICIÓN</div>
                    <span style={{ fontSize: '32px', fontWeight: 900, color: ACC, fontFamily: 'monospace', letterSpacing: '-1px' }}>#{miPosicion.posicion}</span>
                  </div>
                  <div style={{ width: '1px', height: '40px', backgroundColor: BD }} />
                  <div>
                    <p style={{ fontSize: '15px', color: T1, fontWeight: 700, marginBottom: '3px' }}>{miPosicion.nombre}</p>
                    <p style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>{TIERS[miPosicion.tier - 1]} · Arena {miPosicion.arena}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: ARENAS_DATA[miPosicion.arena]?.color || T1, marginBottom: '3px', letterSpacing: '-0.5px' }}>{miPosicion.copas.toLocaleString()}</p>
                  <p style={{ fontSize: '10px', color: T3, fontFamily: 'monospace' }}>copas totales</p>
                </div>
              </div>
            </div>
          )}

          {/* FILTROS */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['Todos', 'Bronce', 'Plata', 'Oro', 'Elite'].map(arena => {
              const color = ARENAS_DATA[arena]?.color || ACC;
              const active = filtroArena === arena;
              return (
                <button key={arena} className="filter-btn" onClick={() => setFiltroArena(arena)}
                  style={{ padding: '6px 16px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: active ? `${color}15` : 'transparent', color: active ? color : T3, border: active ? `1px solid ${color}40` : `1px solid ${BD}`, fontFamily: 'monospace' }}>
                  {arena}
                </button>
              );
            })}
          </div>

          {/* TABLA HEADER */}
          <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 130px 120px', padding: '8px 16px', marginBottom: '6px' }}>
            {['POS', 'ANALISTA', 'ARENA', 'COPAS'].map((h, i) => (
              <span key={i} style={{ fontSize: '9px', color: T3, fontWeight: 700, letterSpacing: '2px', fontFamily: 'monospace', textAlign: i > 1 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>

          {/* LISTA */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <style>{`@keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
              <img src="/logosoc.png" style={{ width: '40px', height: '40px', animation: 'spinLogo 1s linear infinite' }} />
            </div>
          ) : jugadoresFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: T3, fontFamily: 'monospace', fontSize: '13px' }}>
              No hay analistas en esta arena todavía.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {jugadoresFiltrados.map((jugador, i) => {
                const arena = ARENAS_DATA[jugador.arena] || ARENAS_DATA.Bronce;
                const esTop3 = i < 3;
                const posColors = ['#F59E0B', '#94A3B8', '#CD7F32'];
                const esMio = jugador.nombre === miPosicion?.nombre;
                return (
                  <div key={i} className="row"
                    style={{ display: 'grid', gridTemplateColumns: '56px 1fr 130px 120px', alignItems: 'center', padding: '14px 16px', borderRadius: '10px', backgroundColor: esMio ? 'rgba(37,100,241,0.06)' : CARD, border: esMio ? `1px solid rgba(37,100,241,0.25)` : `1px solid ${BD}`, position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                    {esMio && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: `linear-gradient(180deg,transparent,${ACC},transparent)` }} />}

                    {/* Posición */}
                    <div style={{ fontFamily: 'monospace' }}>
                      {esTop3
                        ? <span style={{ fontSize: '18px' }}>{['🥇','🥈','🥉'][i]}</span>
                        : <span style={{ fontSize: '12px', color: T3, fontWeight: 700 }}>#{i + 1}</span>
                      }
                    </div>

                    {/* Analista */}
                    <div>
                      <p style={{ fontSize: '13px', color: esMio ? ACC : T1, fontWeight: esMio ? 700 : 500, marginBottom: '2px' }}>
                        {jugador.nombre}
                        {esMio && <span style={{ fontSize: '8px', color: ACC, marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', backgroundColor: `${ACC}15`, fontFamily: 'monospace', fontWeight: 700 }}>TÚ</span>}
                      </p>
                      <p style={{ fontSize: '10px', color: T3, fontFamily: 'monospace' }}>{TIERS[jugador.tier - 1]}</p>
                    </div>

                    {/* Arena */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: arena.color, fontFamily: 'monospace', padding: '3px 8px', borderRadius: '4px', backgroundColor: `rgba(${arena.colorRgb},0.1)`, border: `1px solid rgba(${arena.colorRgb},0.2)` }}>{jugador.arena}</span>
                    </div>

                    {/* Copas */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: esTop3 ? posColors[i] : T1, fontFamily: 'monospace' }}>{jugador.copas.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RankingPage;
