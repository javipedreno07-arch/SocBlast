import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TIERS = ['', 'SOC Rookie', 'SOC Analyst', 'SOC Specialist', 'SOC Expert', 'SOC Sentinel', 'SOC Architect', 'SOC Master', 'SOC Legend'];
const ARENAS_DATA = {
  Bronce: { color: '#CD7F32', colorRgb: '205,127,50' },
  Plata:  { color: '#94A3B8', colorRgb: '148,163,184' },
  Oro:    { color: '#F59E0B', colorRgb: '245,158,11' },
  Elite:  { color: '#A78BFA', colorRgb: '167,139,250' },
};
const SKILLS_NOMBRES = {
  analisis_logs: 'Análisis de Logs',
  deteccion_amenazas: 'Detección de Amenazas',
  respuesta_incidentes: 'Respuesta a Incidentes',
  threat_hunting: 'Threat Hunting',
  forense_digital: 'Forense Digital',
  gestion_vulnerabilidades: 'Gestión de Vulns',
  inteligencia_amenazas: 'Intel. de Amenazas',
};

const BG   = '#03030A';
const CARD = 'rgba(14,26,46,0.9)';
const CARD_SOLID = '#0E1A2E';
const BD   = '#1A3050';
const T1   = '#FFFFFF';
const T2   = '#C8D8F0';
const T3   = '#5A7898';
const ACC  = '#2564F1';

const TalentPoolPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [analistas, setAnalistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState([]);
  const [comparar, setComparar] = useState([]);
  const [filtros, setFiltros] = useState({ arena: 'Todos', busqueda: '' });
  const [perfilVisto, setPerfilVisto] = useState(null);
  const [vistaFavoritos, setVistaFavoritos] = useState(false);

  useEffect(() => { fetchAnalistas(); }, []);

  const fetchAnalistas = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/talent-pool', { headers: { Authorization: `Bearer ${token}` } });
      setAnalistas(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const toggleFavorito = (id) => setFavoritos(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  const toggleComparar = (a) => {
    if (comparar.find(c => c._id === a._id)) setComparar(prev => prev.filter(c => c._id !== a._id));
    else if (comparar.length < 3) setComparar(prev => [...prev, a]);
  };

  const analistasFiltrados = analistas.filter(a => {
    if (filtros.arena !== 'Todos' && a.arena !== filtros.arena) return false;
    if (filtros.busqueda && !a.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())) return false;
    return true;
  });

  const listaVisible = vistaFavoritos ? analistasFiltrados.filter(a => favoritos.includes(a._id)) : analistasFiltrados;

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    .fade-up{animation:fadeUp 0.3s ease forwards;}
    .analista-card:hover{border-color:rgba(37,100,241,0.35) !important;transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.5) !important;}
    .nav-btn:hover{color:${T1} !important;background:rgba(37,100,241,0.08) !important;}
    .filter-btn:hover{border-color:rgba(37,100,241,0.3) !important;color:${ACC} !important;}
    .fav-btn:hover{transform:scale(1.2);}
    .input-search:focus{border-color:${ACC} !important;outline:none;}
    *{transition:transform 0.2s ease,box-shadow 0.2s ease,border-color 0.2s ease,color 0.15s ease,background 0.15s ease;}
  `;

  // PERFIL DETALLADO
  if (perfilVisto) {
    const arena = ARENAS_DATA[perfilVisto.arena] || ARENAS_DATA.Bronce;
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: "'Inter',-apple-system,sans-serif", color: T1 }}>
          <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: 'rgba(14,26,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BD}` }}>
            <button className="nav-btn" onClick={() => setPerfilVisto(null)} style={{ background: 'none', border: 'none', color: T2, fontSize: '13px', cursor: 'pointer', padding: '5px 0' }}>← Volver al pool</button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: T2 }}>Perfil de Analista</span>
            <button onClick={() => toggleFavorito(perfilVisto._id)} className="fav-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
              {favoritos.includes(perfilVisto._id) ? '❤️' : '🤍'}
            </button>
          </nav>

          <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 40px 60px' }}>

            {/* Header analista */}
            <div style={{ padding: '28px', borderRadius: '14px', backgroundColor: CARD, border: `1px solid rgba(${arena.colorRgb},0.3)`, marginBottom: '16px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)', boxShadow: `0 0 40px rgba(${arena.colorRgb},0.08)` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${arena.color}80,transparent)` }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '14px', backgroundColor: `rgba(${arena.colorRgb},0.15)`, border: `1px solid rgba(${arena.colorRgb},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 900, color: arena.color, flexShrink: 0 }}>
                  {perfilVisto.nombre?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: T1, letterSpacing: '-0.3px' }}>{perfilVisto.nombre}</h2>
                    <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '4px', backgroundColor: `rgba(${arena.colorRgb},0.12)`, color: arena.color, fontWeight: 700, border: `1px solid rgba(${arena.colorRgb},0.25)`, fontFamily: 'monospace' }}>{perfilVisto.arena}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: T3, fontFamily: 'monospace' }}>{TIERS[perfilVisto.tier]} · T{perfilVisto.tier}/8</p>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                {[
                  { label: 'COPAS', value: (perfilVisto.copas || 0).toLocaleString(), color: arena.color },
                  { label: 'XP TOTAL', value: (perfilVisto.xp || 0).toLocaleString(), color: ACC },
                  { label: 'SESIONES', value: perfilVisto.sesiones_completadas || 0, color: T1 },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: '10px', backgroundColor: 'rgba(8,21,37,0.8)', border: `1px solid ${BD}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: T3, fontWeight: 700, letterSpacing: '2px', marginBottom: '6px', fontFamily: 'monospace' }}>{s.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div style={{ padding: '22px', borderRadius: '12px', backgroundColor: CARD, border: `1px solid ${BD}`, marginBottom: '16px', backdropFilter: 'blur(10px)' }}>
              <p style={{ fontSize: '9px', color: T3, fontWeight: 700, letterSpacing: '2px', marginBottom: '16px', fontFamily: 'monospace' }}>HABILIDADES CERTIFICADAS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(SKILLS_NOMBRES).map(([key, nombre]) => {
                  const val = perfilVisto.skills?.[key] || 0;
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: T2, width: '160px', flexShrink: 0 }}>{nombre}</span>
                      <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: BG }}>
                        <div style={{ width: `${val * 10}%`, height: '100%', borderRadius: '2px', backgroundColor: ACC, boxShadow: `0 0 6px ${ACC}50` }} />
                      </div>
                      <span style={{ fontSize: '10px', color: ACC, fontWeight: 700, width: '28px', textAlign: 'right', fontFamily: 'monospace' }}>{val}/10</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button style={{ padding: '13px', borderRadius: '9px', backgroundColor: ACC, border: 'none', color: T1, fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: `0 4px 16px rgba(37,100,241,0.4)` }}>
                💬 Contactar analista
              </button>
              <button onClick={() => toggleComparar(perfilVisto)} style={{ padding: '13px', borderRadius: '9px', backgroundColor: comparar.find(a => a._id === perfilVisto._id) ? `${ACC}20` : 'transparent', border: `1px solid ${comparar.find(a => a._id === perfilVisto._id) ? ACC : BD}`, color: comparar.find(a => a._id === perfilVisto._id) ? ACC : T2, fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                {comparar.find(a => a._id === perfilVisto._id) ? '✓ En comparación' : '+ Comparar'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // VISTA COMPARAR
  if (comparar.length > 1) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: "'Inter',-apple-system,sans-serif", color: T1 }}>
          <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: 'rgba(14,26,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BD}` }}>
            <button className="nav-btn" onClick={() => setComparar([])} style={{ background: 'none', border: 'none', color: T2, fontSize: '13px', cursor: 'pointer' }}>← Volver</button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: T2 }}>Comparación de Analistas</span>
            <span style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>{comparar.length} seleccionados</span>
          </nav>
          <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparar.length},1fr)`, gap: '14px' }}>
              {comparar.map((a, i) => {
                const arena = ARENAS_DATA[a.arena] || ARENAS_DATA.Bronce;
                return (
                  <div key={i} style={{ padding: '24px', borderRadius: '12px', backgroundColor: CARD, border: `1px solid rgba(${arena.colorRgb},0.3)`, backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${arena.color},transparent)` }} />
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: `rgba(${arena.colorRgb},0.15)`, border: `1px solid rgba(${arena.colorRgb},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, color: arena.color, margin: '0 auto 10px' }}>
                        {a.nombre?.charAt(0)}
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: T1, marginBottom: '3px' }}>{a.nombre}</p>
                      <p style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>{TIERS[a.tier]}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {[
                        { label: 'Arena', value: a.arena, color: arena.color },
                        { label: 'Copas', value: (a.copas || 0).toLocaleString(), color: T1 },
                        { label: 'XP', value: (a.xp || 0).toLocaleString(), color: ACC },
                        { label: 'Sesiones', value: a.sesiones_completadas || 0, color: T1 },
                      ].map((s, j) => (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '6px', backgroundColor: 'rgba(8,21,37,0.7)', border: `1px solid ${BD}` }}>
                          <span style={{ fontSize: '11px', color: T3 }}>{s.label}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                    <button style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: ACC, border: 'none', color: T1, fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                      Contactar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  // VISTA PRINCIPAL
  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: "'Inter',-apple-system,sans-serif", color: T1 }}>
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: 'rgba(14,26,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BD}` }}>
          <button className="nav-btn" onClick={() => navigate('/company')} style={{ background: 'none', border: 'none', color: T2, fontSize: '13px', cursor: 'pointer', padding: '5px 0' }}>← Dashboard</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logosoc.png" style={{ height: '24px' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: T1 }}>Talent Pool</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {comparar.length > 1 && (
              <button onClick={() => setComparar(c => [...c])} style={{ padding: '5px 12px', borderRadius: '6px', backgroundColor: `${ACC}20`, border: `1px solid ${ACC}40`, color: ACC, fontSize: '11px', cursor: 'pointer', fontWeight: 700, fontFamily: 'monospace' }}>
                COMPARAR ({comparar.length})
              </button>
            )}
            <button onClick={() => setVistaFavoritos(!vistaFavoritos)} style={{ padding: '5px 12px', borderRadius: '6px', backgroundColor: vistaFavoritos ? 'rgba(239,68,68,0.1)' : 'transparent', border: `1px solid ${vistaFavoritos ? 'rgba(239,68,68,0.3)' : BD}`, color: vistaFavoritos ? '#EF4444' : T3, fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>
              ❤️ {favoritos.length} favoritos
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 40px 60px' }}>

          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: T1, marginBottom: '4px', letterSpacing: '-0.5px' }}>Talent Pool</h1>
            <p style={{ fontSize: '12px', color: T3, fontFamily: 'monospace' }}>{analistas.length} analistas verificados · Filtra por arena, tier y habilidades</p>
          </div>

          {/* FILTROS */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <input className="input-search" type="text" placeholder="Buscar por nombre..." value={filtros.busqueda} onChange={e => setFiltros(p => ({ ...p, busqueda: e.target.value }))}
              style={{ flex: 1, minWidth: '200px', padding: '9px 14px', borderRadius: '8px', backgroundColor: 'rgba(14,26,46,0.8)', border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontFamily: "'Inter',sans-serif" }} />
            {['Todos', 'Bronce', 'Plata', 'Oro', 'Elite'].map(arena => {
              const color = ARENAS_DATA[arena]?.color || ACC;
              const active = filtros.arena === arena;
              return (
                <button key={arena} className="filter-btn" onClick={() => setFiltros(p => ({ ...p, arena }))}
                  style={{ padding: '8px 16px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', backgroundColor: active ? `${color}15` : 'transparent', color: active ? color : T3, border: active ? `1px solid ${color}35` : `1px solid ${BD}`, fontFamily: 'monospace' }}>
                  {arena}
                </button>
              );
            })}
          </div>

          {/* LISTA */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <style>{`@keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
              <img src="/logosoc.png" style={{ width: '40px', height: '40px', animation: 'spinLogo 1s linear infinite' }} />
            </div>
          ) : listaVisible.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: T3, fontFamily: 'monospace' }}>
              {vistaFavoritos ? 'No tienes favoritos todavía.' : 'No hay analistas con estos filtros.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
              {listaVisible.map((analista, i) => {
                const arena = ARENAS_DATA[analista.arena] || ARENAS_DATA.Bronce;
                const esFav = favoritos.includes(analista._id);
                const enComparar = !!comparar.find(a => a._id === analista._id);
                return (
                  <div key={i} className="analista-card"
                    style={{ padding: '20px 22px', borderRadius: '12px', backgroundColor: CARD, border: `1px solid ${enComparar ? ACC + '50' : BD}`, backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>

                    {enComparar && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />}

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: `rgba(${arena.colorRgb},0.15)`, border: `1px solid rgba(${arena.colorRgb},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, color: arena.color, flexShrink: 0 }}>
                          {analista.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', color: T1, fontWeight: 700, marginBottom: '2px' }}>{analista.nombre}</p>
                          <p style={{ fontSize: '10px', color: T3, fontFamily: 'monospace' }}>{TIERS[analista.tier]}</p>
                        </div>
                      </div>
                      <button className="fav-btn" onClick={() => toggleFavorito(analista._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '2px' }}>
                        {esFav ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '5px', backgroundColor: `rgba(${arena.colorRgb},0.12)`, color: arena.color, fontWeight: 700, border: `1px solid rgba(${arena.colorRgb},0.25)`, fontFamily: 'monospace' }}>{analista.arena}</span>
                      <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '5px', backgroundColor: 'rgba(14,26,46,0.8)', color: T3, border: `1px solid ${BD}`, fontFamily: 'monospace' }}>{(analista.copas || 0).toLocaleString()} copas</span>
                      <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '5px', backgroundColor: 'rgba(14,26,46,0.8)', color: T3, border: `1px solid ${BD}`, fontFamily: 'monospace' }}>{analista.sesiones_completadas || 0} sesiones</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setPerfilVisto(analista)} style={{ flex: 1, padding: '9px', borderRadius: '8px', backgroundColor: ACC, border: 'none', color: T1, fontWeight: 700, fontSize: '12px', cursor: 'pointer', boxShadow: `0 2px 10px rgba(37,100,241,0.3)` }}>
                        Ver perfil
                      </button>
                      <button onClick={() => toggleComparar(analista)} style={{ padding: '9px 12px', borderRadius: '8px', backgroundColor: enComparar ? `${ACC}20` : 'transparent', border: `1px solid ${enComparar ? ACC : BD}`, color: enComparar ? ACC : T3, fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                        {enComparar ? '✓' : '+'}
                      </button>
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

export default TalentPoolPage;