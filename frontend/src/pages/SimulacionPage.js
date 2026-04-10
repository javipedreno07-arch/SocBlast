import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BG   = '#03030A';
const CARD = 'rgba(14,26,46,0.9)';
const CARD_SOLID = '#0E1A2E';
const BD   = '#1A3050';
const T1   = '#FFFFFF';
const T2   = '#C8D8F0';
const T3   = '#5A7898';
const ACC  = '#2564F1';

const ARENAS_DATA = {
  Bronce: { color: '#CD7F32', colorRgb: '205,127,50' },
  Plata:  { color: '#94A3B8', colorRgb: '148,163,184' },
  Oro:    { color: '#F59E0B', colorRgb: '245,158,11' },
  Elite:  { color: '#A78BFA', colorRgb: '167,139,250' },
};
const TIERS = ['', 'SOC Rookie', 'SOC Analyst', 'SOC Specialist', 'SOC Expert', 'SOC Sentinel', 'SOC Architect', 'SOC Master', 'SOC Legend'];

const SimulacionPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', tipo_ataque: '', sistemas_afectados: '', objetivos: '', dificultad: 'Intermedia', tiempo_limite: 30 });
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analistas, setAnalistas] = useState([]);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null);
  const [busquedaCandidato, setBusquedaCandidato] = useState('');
  const [mostrarSelector, setMostrarSelector] = useState(false);

  useEffect(() => { fetchAnalistas(); }, []);

  const fetchAnalistas = async () => {
    try {
      const res = await axios.get('https://socblast-production.up.railway.app/api/talent-pool', { headers: { Authorization: `Bearer ${token}` } });
      setAnalistas(res.data);
    } catch {}
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.tipo_ataque || !form.objetivos) return;
    setLoading(true);
    try {
      await axios.post('https://socblast-production.up.railway.app/api/simulaciones-empresa', { ...form, candidato_id: candidatoSeleccionado?._id, candidato_nombre: candidatoSeleccionado?.nombre }, { headers: { Authorization: `Bearer ${token}` } });
      setEnviado(true);
    } catch {}
    setLoading(false);
  };

  const analistasFiltrados = analistas.filter(a => a.nombre.toLowerCase().includes(busquedaCandidato.toLowerCase()));

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    .fade-up{animation:fadeUp 0.3s ease forwards;}
    .input-field:focus{border-color:${ACC} !important;outline:none;}
    .submit-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
    .candidato-row:hover{border-color:rgba(37,100,241,0.3) !important;background:rgba(14,26,46,0.95) !important;}
    *{transition:transform 0.2s ease,border-color 0.2s ease,background 0.15s ease,filter 0.2s ease;}
  `;

  if (enviado) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', backgroundColor: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',-apple-system,sans-serif" }}>
        <div className="fade-up" style={{ textAlign: 'center', padding: '48px', borderRadius: '16px', backgroundColor: CARD, border: `1px solid rgba(37,100,241,0.3)`, maxWidth: '440px', width: '100%', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${ACC},transparent)` }} />
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: `${ACC}15`, border: `1px solid ${ACC}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>🎯</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: T1, marginBottom: '8px', letterSpacing: '-0.4px' }}>Simulación creada</h2>
          <p style={{ fontSize: '13px', color: T3, marginBottom: '8px', lineHeight: 1.6 }}>Tu escenario SOC personalizado está listo.</p>
          {candidatoSeleccionado && <p style={{ fontSize: '12px', color: ACC, marginBottom: '24px', fontFamily: 'monospace' }}>Asignada a: {candidatoSeleccionado.nombre}</p>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setEnviado(false); setForm({ nombre: '', tipo_ataque: '', sistemas_afectados: '', objetivos: '', dificultad: 'Intermedia', tiempo_limite: 30 }); setCandidatoSeleccionado(null); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: ACC, border: 'none', color: T1, fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              Nueva simulación
            </button>
            <button onClick={() => navigate('/company')} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'transparent', border: `1px solid ${BD}`, color: T2, fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: "'Inter',-apple-system,sans-serif", color: T1 }}>
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: 'rgba(14,26,46,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BD}` }}>
          <button onClick={() => navigate('/company')} style={{ background: 'none', border: 'none', color: T2, fontSize: '13px', cursor: 'pointer' }}>← Dashboard</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logosoc.png" style={{ height: '24px' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: T1 }}>Simulación Personalizada</span>
          </div>
          <span />
        </nav>

        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 40px 60px' }}>

          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: T1, marginBottom: '4px', letterSpacing: '-0.5px' }}>Crear Escenario SOC</h1>
            <p style={{ fontSize: '12px', color: T3, fontFamily: 'monospace' }}>Diseña un escenario personalizado para evaluar a tus candidatos</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Nombre */}
            <div>
              <label style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '7px' }}>NOMBRE DEL ESCENARIO *</label>
              <input className="input-field" type="text" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="p.e. Simulacro Q1 2025"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', backgroundColor: 'rgba(14,26,46,0.8)', border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontFamily: "'Inter',sans-serif" }} />
            </div>

            {/* Tipo ataque */}
            <div>
              <label style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '7px' }}>TIPO DE ATAQUE *</label>
              <input className="input-field" type="text" value={form.tipo_ataque} onChange={e => setForm(p => ({ ...p, tipo_ataque: e.target.value }))} placeholder="Ransomware, Phishing, APT..."
                style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', backgroundColor: 'rgba(14,26,46,0.8)', border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontFamily: "'Inter',sans-serif" }} />
            </div>

            {/* Sistemas */}
            <div>
              <label style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '7px' }}>SISTEMAS AFECTADOS</label>
              <input className="input-field" type="text" value={form.sistemas_afectados} onChange={e => setForm(p => ({ ...p, sistemas_afectados: e.target.value }))} placeholder="Servidores Windows, Active Directory..."
                style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', backgroundColor: 'rgba(14,26,46,0.8)', border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontFamily: "'Inter',sans-serif" }} />
            </div>

            {/* Objetivos */}
            <div>
              <label style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '7px' }}>OBJETIVOS DE LA SIMULACIÓN *</label>
              <textarea className="input-field" value={form.objetivos} onChange={e => setForm(p => ({ ...p, objetivos: e.target.value }))} placeholder="Evaluar tiempo de respuesta, detectar gaps..." rows={3}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', backgroundColor: 'rgba(14,26,46,0.8)', border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontFamily: "'Inter',sans-serif", resize: 'vertical', lineHeight: 1.6 }} />
            </div>

            {/* Dificultad + Tiempo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '7px' }}>DIFICULTAD</label>
                <select className="input-field" value={form.dificultad} onChange={e => setForm(p => ({ ...p, dificultad: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', backgroundColor: 'rgba(14,26,46,0.8)', border: `1px solid ${BD}`, color: T1, fontSize: '13px' }}>
                  {['Básica', 'Intermedia', 'Avanzada', 'Experta'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '7px' }}>TIEMPO LÍMITE (MIN)</label>
                <input className="input-field" type="number" value={form.tiempo_limite} onChange={e => setForm(p => ({ ...p, tiempo_limite: parseInt(e.target.value) }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', backgroundColor: 'rgba(14,26,46,0.8)', border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontFamily: "'Inter',sans-serif" }} />
              </div>
            </div>

            {/* SELECTOR DE CANDIDATO */}
            <div>
              <label style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '7px' }}>ASIGNAR A CANDIDATO <span style={{ color: T3, fontWeight: 400 }}>(opcional)</span></label>

              {candidatoSeleccionado ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '9px', backgroundColor: `${ACC}10`, border: `1px solid ${ACC}40` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `rgba(${ARENAS_DATA[candidatoSeleccionado.arena]?.colorRgb || '205,127,50'},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: ARENAS_DATA[candidatoSeleccionado.arena]?.color || '#CD7F32' }}>
                      {candidatoSeleccionado.nombre?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', color: T1, fontWeight: 700 }}>{candidatoSeleccionado.nombre}</p>
                      <p style={{ fontSize: '10px', color: T3, fontFamily: 'monospace' }}>{TIERS[candidatoSeleccionado.tier]} · {candidatoSeleccionado.arena}</p>
                    </div>
                  </div>
                  <button onClick={() => setCandidatoSeleccionado(null)} style={{ background: 'none', border: 'none', color: T3, cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>
              ) : (
                <div>
                  <button onClick={() => setMostrarSelector(!mostrarSelector)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '9px', backgroundColor: 'rgba(14,26,46,0.8)', border: `1px solid ${BD}`, color: T3, fontSize: '13px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Seleccionar candidato del pool...
                  </button>

                  {mostrarSelector && (
                    <div style={{ marginTop: '8px', borderRadius: '10px', backgroundColor: CARD_SOLID, border: `1px solid ${BD}`, overflow: 'hidden', maxHeight: '280px', overflowY: 'auto' }}>
                      <div style={{ padding: '10px', borderBottom: `1px solid ${BD}` }}>
                        <input type="text" placeholder="Buscar candidato..." value={busquedaCandidato} onChange={e => setBusquedaCandidato(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '7px', backgroundColor: BG, border: `1px solid ${BD}`, color: T1, fontSize: '12px', outline: 'none', fontFamily: "'Inter',sans-serif" }} />
                      </div>
                      {analistasFiltrados.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: T3, fontSize: '12px', fontFamily: 'monospace' }}>No se encontraron candidatos</div>
                      ) : (
                        analistasFiltrados.map((a, i) => {
                          const arena = ARENAS_DATA[a.arena] || ARENAS_DATA.Bronce;
                          return (
                            <div key={i} className="candidato-row" onClick={() => { setCandidatoSeleccionado(a); setMostrarSelector(false); setBusquedaCandidato(''); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderBottom: `1px solid ${BD}`, cursor: 'pointer', backgroundColor: 'transparent' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `rgba(${arena.colorRgb},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: arena.color, flexShrink: 0 }}>
                                {a.nombre?.charAt(0)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '13px', color: T1, fontWeight: 600 }}>{a.nombre}</p>
                                <p style={{ fontSize: '10px', color: T3, fontFamily: 'monospace' }}>{TIERS[a.tier]} · {a.arena} · {a.copas || 0} copas</p>
                              </div>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="submit-btn" onClick={handleSubmit} disabled={loading}
              style={{ padding: '14px', borderRadius: '10px', backgroundColor: ACC, border: 'none', color: T1, fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: `0 4px 20px rgba(37,100,241,0.4)`, marginTop: '4px' }}>
              {loading ? 'Creando escenario...' : '🎯 Crear simulación'}
            </button>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', color: T3, paddingBottom: '24px', fontFamily: 'monospace' }}>Powered by Zorion</p>
      </div>
    </>
  );
};

export default SimulacionPage;
