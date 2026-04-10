import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TIERS_DATA = [
  { tier: 1, name: 'SOC Rookie', xp: '0', xpMax: '500', color: '#64748B', desc: 'Primeros pasos en el mundo SOC.', skills: ['Conceptos básicos', 'Navegación SIEM'] },
  { tier: 2, name: 'SOC Analyst', xp: '500', xpMax: '1.500', color: '#3B82F6', desc: 'Identifica amenazas básicas con soltura.', skills: ['Análisis de logs', 'Clasificación alertas'] },
  { tier: 3, name: 'SOC Specialist', xp: '1.500', xpMax: '3.000', color: '#06B6D4', desc: 'Correlaciona eventos y detecta patrones.', skills: ['Correlación SIEM', 'IOCs y TTPs'] },
  { tier: 4, name: 'SOC Expert', xp: '3.000', xpMax: '5.000', color: '#10B981', desc: 'Respuesta a incidentes con soltura.', skills: ['IR playbooks', 'MITRE ATT&CK'] },
  { tier: 5, name: 'SOC Sentinel', xp: '5.000', xpMax: '8.000', color: '#F59E0B', desc: 'Threat hunting proactivo y forense.', skills: ['Threat Hunting', 'Análisis forense'] },
  { tier: 6, name: 'SOC Architect', xp: '8.000', xpMax: '12.000', color: '#F97316', desc: 'Diseña estrategias de defensa complejas.', skills: ['Arquitectura defensiva', 'Red team awareness'] },
  { tier: 7, name: 'SOC Master', xp: '12.000', xpMax: '18.000', color: '#EF4444', desc: 'APTs, zero-days y respuesta avanzada.', skills: ['APT hunting', 'Zero-day response'] },
  { tier: 8, name: 'SOC Legend', xp: '18.000', xpMax: '∞', color: '#A78BFA', desc: 'El nivel más alto. Élite absoluta.', skills: ['Élite operacional', 'Liderazgo SOC'] },
];

const SKILLS_NOMBRES = {
  analisis_logs: { label: 'Análisis de Logs', color: '#3B82F6' },
  deteccion_amenazas: { label: 'Detección de Amenazas', color: '#2564F1' },
  respuesta_incidentes: { label: 'Respuesta a Incidentes', color: '#F59E0B' },
  threat_hunting: { label: 'Threat Hunting', color: '#A78BFA' },
  forense_digital: { label: 'Forense Digital', color: '#F472B6' },
  gestion_vulnerabilidades: { label: 'Gestión de Vulns', color: '#FB923C' },
  inteligencia_amenazas: { label: 'Intel. de Amenazas', color: '#34D399' },
};

const ARENAS = {
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

const LS_KEY = 'socblast_cv';
const emptyCV = { certificaciones: [], formaciones: [], experiencia: [] };

const PerfilPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('perfil');
  const [cv, setCV] = useState(emptyCV);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchPerfil();
    try { const saved = localStorage.getItem(LS_KEY); if (saved) setCV(JSON.parse(saved)); } catch {}
  }, []);

  const saveCV = (newCV) => {
    setCV(newCV);
    try { localStorage.setItem(LS_KEY, JSON.stringify(newCV)); } catch {}
  };

  const fetchPerfil = async () => {
    try {
      const res = await axios.get('https://socblast-production.up.railway.app/api/me', { headers: { Authorization: `Bearer ${token}` } });
      setUserData(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const openAdd = (section) => {
    const defaults = {
      certificaciones: { nombre: '', emisor: '', fecha: '', url: '' },
      formaciones: { titulo: '', institucion: '', fecha: '', descripcion: '' },
      experiencia: { cargo: '', empresa: '', desde: '', hasta: '', descripcion: '' },
    };
    setFormData(defaults[section]);
    setEditando({ section, index: -1 });
  };

  const openEdit = (section, index) => {
    setFormData({ ...cv[section][index] });
    setEditando({ section, index });
  };

  const saveItem = () => {
    const { section, index } = editando;
    const newSection = [...cv[section]];
    if (index === -1) newSection.push(formData);
    else newSection[index] = formData;
    saveCV({ ...cv, [section]: newSection });
    setEditando(null);
  };

  const deleteItem = (section, index) => {
    const newSection = cv[section].filter((_, i) => i !== index);
    saveCV({ ...cv, [section]: newSection });
  };

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    .fade-up{animation:fadeUp 0.35s ease forwards;}
    .tier-node:hover{transform:translateY(-3px);border-color:rgba(37,100,241,0.4) !important;box-shadow:0 8px 24px rgba(0,0,0,0.4);}
    .nav-btn:hover{color:${T1} !important;background:rgba(37,100,241,0.08) !important;}
    .stat-card:hover{border-color:rgba(37,100,241,0.35) !important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.4);}
    .cv-item:hover{border-color:rgba(37,100,241,0.25) !important;}
    .cv-item:hover .cv-actions{opacity:1 !important;}
    .add-btn:hover{border-color:rgba(37,100,241,0.4) !important;color:${ACC} !important;}
    .tab-btn:hover{color:${T2} !important;}
    *{transition:transform 0.2s ease,box-shadow 0.2s ease,border-color 0.2s ease,color 0.15s ease,background 0.15s ease,opacity 0.15s ease;}
  `;

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
      <img src="/logosoc.png" style={{ width: '44px', height: '44px', animation: 'spinLogo 1s linear infinite' }} />
    </div>
  );

  const tierActual = userData?.tier || 1;
  const xp = userData?.xp || 0;
  const XP_MAX = [0, 500, 1500, 3000, 5000, 8000, 12000, 18000, 99999];
  const xpMin = XP_MAX[tierActual - 1] || 0;
  const xpMaxTier = XP_MAX[tierActual] || 99999;
  const progresoXP = Math.min(((xp - xpMin) / (xpMaxTier - xpMin)) * 100, 100);
  const tierData = TIERS_DATA[tierActual - 1];
  const arenaData = ARENAS[userData?.arena] || ARENAS.Bronce;
  const skills = userData?.skills || {};

  const TABS = [
    { id: 'perfil', label: 'Mi Perfil' },
    { id: 'tiers', label: 'Progression' },
    { id: 'cv', label: 'CV / Experiencia' },
  ];

  const FormModal = () => {
    if (!editando) return null;
    const { section } = editando;
    const fields = {
      certificaciones: [
        { key: 'nombre', label: 'Nombre de la certificación', placeholder: 'p.e. CompTIA Security+' },
        { key: 'emisor', label: 'Organismo emisor', placeholder: 'p.e. CompTIA' },
        { key: 'fecha', label: 'Fecha de obtención', placeholder: 'p.e. Enero 2024' },
        { key: 'url', label: 'URL verificación (opcional)', placeholder: 'https://...' },
      ],
      formaciones: [
        { key: 'titulo', label: 'Título / Curso', placeholder: 'p.e. Grado en Ingeniería Informática' },
        { key: 'institucion', label: 'Institución', placeholder: 'p.e. Universidad de Murcia' },
        { key: 'fecha', label: 'Año / Período', placeholder: 'p.e. 2019 – 2023' },
        { key: 'descripcion', label: 'Descripción (opcional)', placeholder: 'Especialización en...', multiline: true },
      ],
      experiencia: [
        { key: 'cargo', label: 'Cargo', placeholder: 'p.e. Analista SOC Jr.' },
        { key: 'empresa', label: 'Empresa', placeholder: 'p.e. CiberSeguridad S.L.' },
        { key: 'desde', label: 'Desde', placeholder: 'p.e. Ene 2023' },
        { key: 'hasta', label: 'Hasta', placeholder: 'p.e. Actualidad' },
        { key: 'descripcion', label: 'Descripción', placeholder: 'Responsabilidades y logros...', multiline: true },
      ],
    };
    const titles = { certificaciones: 'Certificación', formaciones: 'Formación', experiencia: 'Experiencia' };
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
        <div style={{ backgroundColor: CARD_SOLID, border: `1px solid ${BD}`, borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '480px', position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${ACC},transparent)`, borderRadius: '14px 14px 0 0' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: T1, marginBottom: '6px' }}>{editando.index === -1 ? 'Añadir' : 'Editar'} {titles[section]}</h3>
          <p style={{ fontSize: '11px', color: T3, marginBottom: '20px', fontFamily: 'monospace' }}>Rellena los campos y guarda</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {fields[section].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '6px' }}>{f.label.toUpperCase()}</label>
                {f.multiline ? (
                  <textarea value={formData[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} rows={3}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: BG, border: `1px solid ${BD}`, color: T1, fontSize: '13px', outline: 'none', fontFamily: "'Inter',sans-serif", resize: 'vertical', lineHeight: 1.6 }} />
                ) : (
                  <input value={formData[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', backgroundColor: BG, border: `1px solid ${BD}`, color: T1, fontSize: '13px', outline: 'none', fontFamily: "'Inter',sans-serif" }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={saveItem} style={{ flex: 1, padding: '11px', borderRadius: '8px', backgroundColor: ACC, border: 'none', color: T1, fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: `0 4px 16px rgba(37,100,241,0.4)` }}>Guardar</button>
            <button onClick={() => setEditando(null)} style={{ padding: '11px 18px', borderRadius: '8px', backgroundColor: 'transparent', border: `1px solid ${BD}`, color: T2, fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  };

  const CVSection = ({ title, section, items, renderItem }) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <p style={{ fontSize: '9px', color: T3, fontWeight: 700, letterSpacing: '2px', fontFamily: 'monospace' }}>{title}</p>
        <button className="add-btn" onClick={() => openAdd(section)}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '6px', backgroundColor: 'transparent', border: `1px solid ${BD}`, color: T3, fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>
          <span style={{ fontSize: '16px', lineHeight: 1, marginTop: '-1px' }}>+</span> Añadir
        </button>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: '24px', borderRadius: '10px', backgroundColor: 'rgba(14,26,46,0.4)', border: `1px dashed ${BD}`, textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: T3, fontFamily: 'monospace' }}>Sin entradas todavía — pulsa Añadir</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map((item, i) => (
            <div key={i} className="cv-item" style={{ padding: '16px 18px', borderRadius: '10px', backgroundColor: CARD, border: `1px solid ${BD}`, position: 'relative', backdropFilter: 'blur(10px)' }}>
              {renderItem(item)}
              <div className="cv-actions" style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px', opacity: 0 }}>
                <button onClick={() => openEdit(section, i)} style={{ padding: '4px 10px', borderRadius: '5px', backgroundColor: CARD_SOLID, border: `1px solid ${BD}`, color: T2, fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}>Editar</button>
                <button onClick={() => deleteItem(section, i)} style={{ padding: '4px 10px', borderRadius: '5px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{css}</style>
      {editando && <FormModal />}
      <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: "'Inter',-apple-system,sans-serif", color: T1 }}>

        <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', backgroundColor: 'rgba(14,26,46,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BD}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{ height: '30px' }} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: T1 }}>Soc<span style={{ color: ACC }}>Blast</span></span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[{ label: '← Dashboard', path: '/dashboard' }, { label: 'Training', path: '/training' }, { label: 'Ranking', path: '/ranking' }, { label: 'Certificado', path: '/certificado' }].map((item, i) => (
              <button key={i} className="nav-btn" onClick={() => navigate(item.path)} style={{ padding: '5px 14px', borderRadius: '6px', background: 'none', border: 'none', color: T2, fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{item.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(8,21,37,0.8)', border: `1px solid ${BD}` }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
            <span style={{ fontSize: '12px', color: T2 }}>{userData?.nombre}</span>
            <span style={{ fontSize: '10px', color: arenaData.color, fontWeight: 700 }}>{userData?.arena}</span>
          </div>
        </nav>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 40px 60px' }}>

          <div style={{ display: 'flex', marginBottom: '28px', borderBottom: `1px solid ${BD}` }}>
            {TABS.map(tab => (
              <button key={tab.id} className="tab-btn" onClick={() => setVista(tab.id)}
                style={{ padding: '10px 22px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: vista === tab.id ? T1 : T3, borderBottom: vista === tab.id ? `2px solid ${ACC}` : '2px solid transparent', marginBottom: '-1px' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── PERFIL ── */}
          {vista === 'perfil' && (
            <div className="fade-up">

              {/* Header usuario */}
              <div style={{ padding: '24px 28px', borderRadius: '12px', backgroundColor: CARD, border: `1px solid ${BD}`, marginBottom: '14px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${arenaData.color}80,transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: `rgba(${arenaData.colorRgb},0.15)`, border: `1px solid rgba(${arenaData.colorRgb},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 900, color: arenaData.color, flexShrink: 0, boxShadow: `0 0 20px rgba(${arenaData.colorRgb},0.15)` }}>
                    {userData?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 800, color: T1, marginBottom: '3px', letterSpacing: '-0.4px' }}>{userData?.nombre}</h1>
                    <p style={{ fontSize: '12px', color: T3, marginBottom: '10px', fontFamily: 'monospace' }}>{userData?.email}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '5px', backgroundColor: `${tierData?.color}18`, color: tierData?.color, fontWeight: 700, border: `1px solid ${tierData?.color}30`, fontFamily: 'monospace' }}>{tierData?.name}</span>
                      <span style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '5px', backgroundColor: `rgba(${arenaData.colorRgb},0.1)`, color: arenaData.color, fontWeight: 700, border: `1px solid rgba(${arenaData.colorRgb},0.25)`, fontFamily: 'monospace' }}>Arena {userData?.arena}</span>
                      <span style={{ fontSize: '10px', padding: '3px 9px', borderRadius: '5px', backgroundColor: 'rgba(14,26,46,0.8)', color: T3, fontFamily: 'monospace', border: `1px solid ${BD}` }}>T{tierActual}/8</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '14px' }}>
                {[
                  { label: 'COPAS', value: (userData?.copas || 0).toLocaleString(), color: arenaData.color },
                  { label: 'XP TOTAL', value: (userData?.xp || 0).toLocaleString(), color: ACC },
                  { label: 'SESIONES', value: userData?.sesiones_completadas || 0, color: T1 },
                  { label: 'TIER', value: tierActual, color: tierData?.color },
                ].map((s, i) => (
                  <div key={i} className="stat-card" style={{ padding: '18px 20px', borderRadius: '10px', backgroundColor: CARD, border: `1px solid ${BD}`, position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${s.color}60,transparent)` }} />
                    <div style={{ fontSize: '9px', color: T3, fontWeight: 700, letterSpacing: '2px', marginBottom: '10px', fontFamily: 'monospace' }}>{s.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: s.color, letterSpacing: '-0.8px', marginBottom: '2px' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* XP bar */}
              <div style={{ padding: '18px 20px', borderRadius: '10px', backgroundColor: CARD, border: `1px solid ${BD}`, marginBottom: '14px', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: tierData?.color }}>{tierData?.name}</span>
                    {tierActual < 8 && <span style={{ fontSize: '11px', color: T3 }}>→ {TIERS_DATA[tierActual]?.name}</span>}
                  </div>
                  <span style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>{xp.toLocaleString()} / {xpMaxTier === 99999 ? '∞' : xpMaxTier.toLocaleString()} XP</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', backgroundColor: BG }}>
                  <div style={{ width: `${progresoXP}%`, height: '100%', borderRadius: '3px', background: `linear-gradient(90deg,${tierData?.color}70,${tierData?.color})`, boxShadow: `0 0 8px ${tierData?.color}60` }} />
                </div>
                {tierActual < 8 && <p style={{ fontSize: '10px', color: T3, marginTop: '6px', fontFamily: 'monospace' }}>Faltan {(xpMaxTier - xp).toLocaleString()} XP para {TIERS_DATA[tierActual]?.name}</p>}
              </div>

              {/* Skills */}
              <div style={{ padding: '20px 22px', borderRadius: '10px', backgroundColor: CARD, border: `1px solid ${BD}`, marginBottom: '14px', backdropFilter: 'blur(10px)' }}>
                <p style={{ fontSize: '9px', color: T3, fontWeight: 700, letterSpacing: '2px', marginBottom: '16px', fontFamily: 'monospace' }}>SKILL MATRIX</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(SKILLS_NOMBRES).map(([key, s]) => {
                    const val = skills?.[key] || 1;
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '11px', color: T2, width: '148px', flexShrink: 0 }}>{s.label}</span>
                        <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: BG }}>
                          <div style={{ width: `${val * 10}%`, height: '100%', borderRadius: '2px', backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}50` }} />
                        </div>
                        <span style={{ fontSize: '10px', color: s.color, fontWeight: 700, width: '28px', textAlign: 'right', flexShrink: 0, fontFamily: 'monospace' }}>{val}/10</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <button onClick={() => navigate('/sesion')} style={{ padding: '13px', borderRadius: '9px', backgroundColor: ACC, border: 'none', color: T1, fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: `0 4px 16px rgba(37,100,241,0.4)` }}>⚡ Nueva sesión</button>
                <button onClick={() => setVista('tiers')} style={{ padding: '13px', borderRadius: '9px', backgroundColor: 'transparent', border: `1px solid ${BD}`, color: T2, fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Progression →</button>
                <button onClick={() => setVista('cv')} style={{ padding: '13px', borderRadius: '9px', backgroundColor: 'transparent', border: `1px solid ${BD}`, color: T2, fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Mi CV →</button>
              </div>
            </div>
          )}

          {/* ── TIERS ── */}
          {vista === 'tiers' && (
            <div className="fade-up">
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: T1, marginBottom: '4px', letterSpacing: '-0.5px' }}>Progression Map</h2>
                <p style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>Tu camino desde Rookie hasta Legend · {tierActual}/8 desbloqueados</p>
              </div>

              <div style={{ padding: '16px 20px', borderRadius: '10px', backgroundColor: CARD, border: `1px solid ${BD}`, marginBottom: '24px', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>Progreso global</span>
                  <span style={{ fontSize: '11px', color: ACC, fontFamily: 'monospace', fontWeight: 700 }}>{Math.round(((tierActual - 1) / 7) * 100)}% desbloqueado</span>
                </div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {TIERS_DATA.map((t, i) => (
                    <div key={i} style={{ flex: 1, height: '6px', borderRadius: '2px', backgroundColor: i < tierActual ? t.color : BD, boxShadow: i < tierActual ? `0 0 6px ${t.color}50` : 'none' }} />
                  ))}
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                {TIERS_DATA.map((t, i) => {
                  const esActual = t.tier === tierActual;
                  const desbloqueado = t.tier <= tierActual;
                  const completado = t.tier < tierActual;
                  const isLeft = i % 2 === 0;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: i < 7 ? '8px' : '0', flexDirection: isLeft ? 'row' : 'row-reverse' }}>
                      <div className="tier-node" style={{ width: '56%', padding: '18px 20px', borderRadius: '10px', backgroundColor: esActual ? `${t.color}0D` : CARD, border: esActual ? `1px solid ${t.color}40` : `1px solid ${BD}`, position: 'relative', overflow: 'hidden', opacity: !desbloqueado ? 0.3 : 1, backdropFilter: 'blur(10px)' }}>
                        {esActual && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${t.color},transparent)` }} />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: completado ? 'rgba(74,222,128,0.1)' : esActual ? `${t.color}20` : BG, border: `1px solid ${completado ? '#4ADE8035' : esActual ? t.color + '45' : BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {completado ? <span style={{ color: '#4ADE80', fontSize: '14px' }}>✓</span> : <span style={{ fontSize: '13px', fontWeight: 900, color: desbloqueado ? t.color : T3, fontFamily: 'monospace' }}>T{t.tier}</span>}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: desbloqueado ? t.color : T3 }}>{t.name}</span>
                              {esActual && <span style={{ fontSize: '8px', padding: '2px 7px', borderRadius: '4px', backgroundColor: `${t.color}15`, color: t.color, fontWeight: 700, fontFamily: 'monospace' }}>ACTUAL</span>}
                              {!desbloqueado && <span style={{ fontSize: '8px', padding: '2px 7px', borderRadius: '4px', backgroundColor: BG, color: T3, fontFamily: 'monospace', border: `1px solid ${BD}` }}>LOCKED</span>}
                            </div>
                            <span style={{ fontSize: '10px', color: T3, fontFamily: 'monospace' }}>{t.xp} — {t.xpMax} XP</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '12px', color: desbloqueado ? T2 : T3, marginBottom: '10px', lineHeight: 1.6 }}>{t.desc}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {t.skills.map((sk, j) => (
                            <span key={j} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', backgroundColor: desbloqueado ? `${t.color}10` : BG, color: desbloqueado ? t.color : T3, border: `1px solid ${desbloqueado ? t.color + '25' : BD}`, fontFamily: 'monospace' }}>{sk}</span>
                          ))}
                        </div>
                        {esActual && (
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ height: '4px', borderRadius: '2px', backgroundColor: BG }}>
                              <div style={{ width: `${progresoXP}%`, height: '100%', borderRadius: '2px', backgroundColor: t.color, boxShadow: `0 0 8px ${t.color}60` }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                              <span style={{ fontSize: '9px', color: T3, fontFamily: 'monospace' }}>{xp.toLocaleString()} XP</span>
                              <span style={{ fontSize: '9px', color: t.color, fontFamily: 'monospace' }}>{Math.round(progresoXP)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ width: '44%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', paddingTop: '28px' }}>
                        {i < 7 && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', opacity: 0.2 }}>
                            <div style={{ width: '1px', height: '20px', backgroundColor: ACC }} />
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: ACC }} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '24px', padding: '20px 22px', borderRadius: '10px', backgroundColor: CARD, border: `1px solid ${BD}`, backdropFilter: 'blur(10px)' }}>
                <p style={{ fontSize: '9px', color: T3, fontWeight: 700, letterSpacing: '2px', marginBottom: '14px', fontFamily: 'monospace' }}>FUENTES DE XP</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Sesión Bronce', xp: '+50 XP', color: '#CD7F32' },
                    { label: 'Sesión Plata', xp: '+100 XP', color: '#94A3B8' },
                    { label: 'Sesión Oro', xp: '+200 XP', color: '#F59E0B' },
                    { label: 'Sesión Elite', xp: '+400 XP', color: '#A78BFA' },
                    { label: 'Lección training', xp: '+30–70 XP', color: ACC },
                    { label: 'Sin usar pistas', xp: '+bonus XP', color: '#4ADE80' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '7px', backgroundColor: BG, border: `1px solid ${BD}` }}>
                      <span style={{ fontSize: '11px', color: T3 }}>{item.label}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: item.color, fontFamily: 'monospace' }}>{item.xp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CV ── */}
          {vista === 'cv' && (
            <div className="fade-up">
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: T1, marginBottom: '4px', letterSpacing: '-0.5px' }}>CV / Perfil Profesional</h2>
                <p style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>Añade tus certificaciones, formación y experiencia laboral</p>
              </div>

              <CVSection title="CERTIFICACIONES" section="certificaciones" items={cv.certificaciones} renderItem={item => (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: ACC }}>{item.nombre}</span>
                    {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '4px', backgroundColor: `${ACC}15`, color: ACC, border: `1px solid ${ACC}30`, fontFamily: 'monospace', textDecoration: 'none' }}>verificar →</a>}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '11px', color: T2 }}>{item.emisor}</span>
                    <span style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>{item.fecha}</span>
                  </div>
                </div>
              )} />

              <CVSection title="FORMACIÓN ACADÉMICA" section="formaciones" items={cv.formaciones} renderItem={item => (
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: T1, display: 'block', marginBottom: '4px' }}>{item.titulo}</span>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: item.descripcion ? '6px' : '0' }}>
                    <span style={{ fontSize: '11px', color: T2 }}>{item.institucion}</span>
                    <span style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>{item.fecha}</span>
                  </div>
                  {item.descripcion && <p style={{ fontSize: '11px', color: T3, lineHeight: 1.6 }}>{item.descripcion}</p>}
                </div>
              )} />

              <CVSection title="EXPERIENCIA LABORAL" section="experiencia" items={cv.experiencia} renderItem={item => (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: T1 }}>{item.cargo}</span>
                    <span style={{ fontSize: '10px', color: T3, fontFamily: 'monospace' }}>{item.desde}{item.hasta ? ` – ${item.hasta}` : ''}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#4ADE80', display: 'block', marginBottom: item.descripcion ? '6px' : '0', fontWeight: 600 }}>{item.empresa}</span>
                  {item.descripcion && <p style={{ fontSize: '11px', color: T3, lineHeight: 1.6 }}>{item.descripcion}</p>}
                </div>
              )} />

              <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F59E0B', flexShrink: 0 }} />
                <p style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>Datos guardados localmente. Próximamente sincronización con servidor.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PerfilPage;
