import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'https://socblast-production.up.railway.app/api';

// ── PALETA ────────────────────────────────────────────────────────────────────
const C = {
  bg:      '#0a0e1a',
  panel:   '#0f1524',
  border:  '#1e2a3d',
  border2: '#2a3a54',
  t1:      '#e2e8f0',
  t2:      '#94a3b8',
  t3:      '#4a5a72',
  acc:     '#00d4ff',
  acc2:    '#7c3aed',
  green:   '#10b981',
  yellow:  '#f59e0b',
  red:     '#ef4444',
  orange:  '#f97316',
};

const SEV_COLOR = { CRITICA: C.red, ALTA: C.orange, MEDIA: C.yellow, BAJA: C.green };
const SEV_BG    = { CRITICA: '#2d0a0a', ALTA: '#2d1a0a', MEDIA: '#2d250a', BAJA: '#0a2d1a' };
const EST_COLOR = { comprometido: C.red, sospechoso: C.yellow, limpio: C.green, maliciosa: C.red, legitima: C.green, sospechosa: C.yellow };

// ── UTILS ────────────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('token'); }

async function apiFetch(path, opts = {}) {
  const r = await fetch(`${API}${path}`, {
    headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
  return r.json();
}

// ── COMPONENTES BASE ──────────────────────────────────────────────────────────
function Panel({ title, icon, children, style = {}, headerRight }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', ...style
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        background: '#0c1220', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.t2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</span>
        </div>
        {headerRight}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {children}
      </div>
    </div>
  );
}

function Badge({ label, color = C.acc, bg }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
      padding: '2px 7px', borderRadius: 4,
      color, background: bg || color + '22',
      border: `1px solid ${color}44`,
    }}>{label}</span>
  );
}

function Spinner({ size = 20, color = C.acc }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid ${color}33`,
      borderTopColor: color, borderRadius: '50%',
      animation: 'spin 0.8s linear infinite', flexShrink: 0,
    }} />
  );
}

// ── PANTALLA: INTRO ───────────────────────────────────────────────────────────
function LabIntro({ onStart, loading }) {
  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius:3px; }
      `}</style>

      <div style={{ textAlign: 'center', maxWidth: 560, padding: 40, animation: 'fadeUp 0.5s ease' }}>
        {/* Terminal header */}
        <div style={{
          background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: '32px 40px', marginBottom: 32,
        }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 24, justifyContent: 'flex-start' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
          </div>

          <div style={{ textAlign: 'left', marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 4 }}>soc-analyst@socblast:~$</div>
            <div style={{ fontSize: 11, color: C.green, marginBottom: 2 }}>{'>'} Iniciando entorno de laboratorio SOC...</div>
            <div style={{ fontSize: 11, color: C.t2, marginBottom: 2 }}>{'>'} Herramientas disponibles: SIEM · Log Explorer · Network Map · Ticket</div>
            <div style={{ fontSize: 11, color: C.t2, marginBottom: 2 }}>{'>'} Evaluación: IA en tiempo real</div>
            <div style={{ fontSize: 11, color: C.yellow }}>{'>'} Sin límite de tiempo. Investiga a fondo.<span style={{ animation: 'blink 1s infinite', display: 'inline-block' }}>_</span></div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.t1, marginBottom: 8, letterSpacing: '-0.5px' }}>
              🔬 Laboratorio SOC
            </div>
            <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.7, margin: '0 0 24px' }}>
              La IA generará un escenario de incidente real adaptado a tu nivel.
              Investiga libremente con todas las herramientas, responde las preguntas
              y redacta tu informe de análisis.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24, textAlign: 'left' }}>
              {[
                ['🖥', 'SIEM Dashboard', 'Alertas con severidad y contexto'],
                ['📋', 'Log Explorer', 'Logs filtrables por sistema o nivel'],
                ['🌐', 'Network Map', 'Hosts, IPs y conexiones activas'],
                ['🎫', 'Ticket de Análisis', 'Preguntas directas + informe libre'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{
                  background: '#070b14', border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '10px 12px',
                }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.t1, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 10, color: C.t3 }}>{desc}</div>
                </div>
              ))}
            </div>

            <button
              onClick={onStart}
              disabled={loading}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 8,
                background: loading ? C.border : `linear-gradient(135deg, ${C.acc2}, ${C.acc})`,
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? <><Spinner size={16} color="#fff" /> Generando escenario...</> : '⚡ Iniciar Laboratorio'}
            </button>
          </div>
        </div>

        <div style={{ fontSize: 11, color: C.t3 }}>
          El escenario se adapta a tu arena actual · Solo XP y habilidades, sin copas
        </div>
      </div>
    </div>
  );
}

// ── PANEL: SIEM ───────────────────────────────────────────────────────────────
function SIEMPanel({ alertas, onQueryLog, queriesLog }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('TODAS');
  const sevs = ['TODAS', 'CRITICA', 'ALTA', 'MEDIA', 'BAJA'];

  const filtered = filter === 'TODAS' ? alertas : alertas.filter(a => a.severidad === filter);

  return (
    <Panel title="SIEM Dashboard" icon="🖥" headerRight={
      <div style={{ display: 'flex', gap: 4 }}>
        {sevs.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 4, cursor: 'pointer', fontWeight: 700,
            border: `1px solid ${s === 'TODAS' ? C.border2 : SEV_COLOR[s] || C.border2}`,
            background: filter === s ? (SEV_COLOR[s] || C.acc) + '33' : 'transparent',
            color: filter === s ? (SEV_COLOR[s] || C.acc) : C.t3,
          }}>{s}</button>
        ))}
      </div>
    }>
      <div style={{ display: 'flex', gap: 8, height: '100%' }}>
        {/* Lista alertas */}
        <div style={{ flex: '0 0 52%', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map(a => (
            <div key={a.id}
              onClick={() => { setSelected(a); onQueryLog(`SIEM:${a.id}`); }}
              style={{
                padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${selected?.id === a.id ? SEV_COLOR[a.severidad] || C.acc : C.border}`,
                background: selected?.id === a.id ? (SEV_COLOR[a.severidad] || C.acc) + '11' : '#070b14',
                transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <Badge label={a.severidad} color={SEV_COLOR[a.severidad] || C.t2} />
                <span style={{ fontSize: 9, color: C.t3, fontFamily: 'monospace' }}>{a.timestamp?.slice(11)}</span>
                <span style={{ fontSize: 9, color: C.t3, marginLeft: 'auto' }}>{a.id}</span>
              </div>
              <div style={{ fontSize: 11, color: C.t1, fontWeight: 600, lineHeight: 1.3 }}>{a.titulo}</div>
              <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{a.sistema} · {a.categoria}</div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ fontSize: 11, color: C.t3, textAlign: 'center', paddingTop: 20 }}>Sin alertas para este filtro</div>}
        </div>

        {/* Detalle */}
        <div style={{
          flex: 1, background: '#070b14', border: `1px solid ${C.border}`,
          borderRadius: 6, padding: 12, fontSize: 11, overflow: 'auto',
        }}>
          {selected ? (
            <>
              <div style={{ marginBottom: 10 }}>
                <Badge label={selected.severidad} color={SEV_COLOR[selected.severidad] || C.t2} />
                <span style={{ marginLeft: 6, fontSize: 10, color: C.t3 }}>{selected.timestamp}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 8 }}>{selected.titulo}</div>
              <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.6, marginBottom: 10 }}>{selected.descripcion}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                {[
                  ['Sistema', selected.sistema],
                  ['Categoría', selected.categoria],
                  ['IP Origen', selected.ip_origen],
                  ['IP Destino', selected.ip_destino],
                  ['Usuario', selected.usuario],
                  ['Proceso', selected.proceso],
                  ['Regla SIEM', selected.regla_disparada],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: C.t3, fontSize: 10 }}>{k}: </span>
                    <span style={{ color: C.acc, fontSize: 10, fontFamily: 'monospace' }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: C.t3, fontSize: 11, textAlign: 'center', paddingTop: 30 }}>
              Selecciona una alerta para ver los detalles
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

// ── PANEL: LOG EXPLORER ───────────────────────────────────────────────────────
function LogPanel({ logs, onQueryLog }) {
  const [search, setSearch]   = useState('');
  const [nivel, setNivel]     = useState('TODOS');
  const [onlyRel, setOnlyRel] = useState(false);

  const filtered = logs.filter(l => {
    if (nivel !== 'TODOS' && l.nivel !== nivel) return false;
    if (onlyRel && !l.relevante) return false;
    if (search && !JSON.stringify(l).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSearch = (v) => {
    setSearch(v);
    if (v.length > 2) onQueryLog(`SEARCH:${v}`);
  };

  return (
    <Panel title="Log Explorer" icon="📋" headerRight={
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <label style={{ fontSize: 10, color: C.t3, display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={onlyRel} onChange={e => setOnlyRel(e.target.checked)} style={{ accentColor: C.acc }} />
          Solo relevantes
        </label>
        {['TODOS', 'ERROR', 'WARNING', 'INFO'].map(n => (
          <button key={n} onClick={() => setNivel(n)} style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 4, cursor: 'pointer', fontWeight: 700,
            border: `1px solid ${C.border2}`,
            background: nivel === n ? C.acc + '22' : 'transparent',
            color: nivel === n ? C.acc : C.t3,
          }}>{n}</button>
        ))}
      </div>
    }>
      {/* Search */}
      <div style={{ marginBottom: 8 }}>
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Filtrar logs... (IP, proceso, usuario, Event ID)"
          style={{
            width: '100%', padding: '6px 10px', borderRadius: 6,
            background: '#070b14', border: `1px solid ${C.border2}`,
            color: C.t1, fontSize: 11, fontFamily: 'monospace',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Logs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {filtered.map(l => (
          <div key={l.id} style={{
            padding: '6px 10px', borderRadius: 5, fontFamily: 'monospace',
            background: l.relevante ? '#070b14' : '#050810',
            border: `1px solid ${l.relevante ? C.border : '#0f1520'}`,
            opacity: l.relevante ? 1 : 0.6,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
              <span style={{ fontSize: 9, color: C.t3 }}>{l.timestamp?.slice(11)}</span>
              <Badge
                label={l.nivel}
                color={l.nivel === 'ERROR' ? C.red : l.nivel === 'WARNING' ? C.yellow : C.t3}
              />
              <span style={{ fontSize: 9, color: C.t3 }}>{l.fuente}</span>
              <span style={{ fontSize: 9, color: C.acc2, fontWeight: 700 }}>{l.sistema}</span>
              {l.event_id && <Badge label={`EID:${l.event_id}`} color={C.t3} />}
              {!l.relevante && <Badge label="RUIDO" color={C.t3} />}
            </div>
            <div style={{ fontSize: 10, color: l.relevante ? C.t2 : C.t3, lineHeight: 1.4, wordBreak: 'break-all' }}>
              {l.mensaje}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ fontSize: 11, color: C.t3, textAlign: 'center', paddingTop: 20 }}>
            {search ? `Sin resultados para "${search}"` : 'Sin logs'}
          </div>
        )}
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: C.t3 }}>
        {filtered.length} de {logs.length} logs · {logs.filter(l => l.relevante).length} relevantes
      </div>
    </Panel>
  );
}

// ── PANEL: NETWORK MAP ────────────────────────────────────────────────────────
function NetworkPanel({ red }) {
  const canvasRef  = useRef(null);
  const [selected, setSelected] = useState(null);
  const hosts      = red?.hosts || [];
  const conexiones = red?.conexiones || [];

  // Posicionar hosts en círculo
  const getPos = useCallback((idx, total) => {
    const cx = 260, cy = 160, r = 120;
    if (total === 1) return { x: cx, y: cy };
    const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  }, []);

  const positions = hosts.reduce((acc, h, i) => {
    acc[h.id] = getPos(i, hosts.length);
    return acc;
  }, {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar conexiones
    conexiones.forEach(c => {
      const from = positions[c.origen];
      const to   = positions[c.destino];
      if (!from || !to) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = EST_COLOR[c.estado] || C.t3;
      ctx.lineWidth   = c.estado === 'maliciosa' ? 2 : 1;
      ctx.globalAlpha = c.estado === 'maliciosa' ? 0.8 : 0.3;
      if (c.estado === 'maliciosa') {
        ctx.setLineDash([6, 3]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Etiqueta puerto
      if (c.puerto) {
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        ctx.font      = '9px monospace';
        ctx.fillStyle = EST_COLOR[c.estado] || C.t3;
        ctx.fillText(`${c.protocolo}:${c.puerto}`, mx + 4, my - 3);
      }
    });
  }, [conexiones, positions]);

  return (
    <Panel title="Network Map" icon="🌐">
      <div style={{ display: 'flex', gap: 8, height: '100%' }}>
        {/* Canvas */}
        <div style={{ flex: '0 0 55%', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={520}
            height={320}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
          <svg width="100%" height="100%" viewBox="0 0 520 320" style={{ position: 'absolute', top: 0, left: 0 }}>
            {hosts.map((h, i) => {
              const pos   = getPos(i, hosts.length);
              const color = EST_COLOR[h.estado] || C.t3;
              const isSel = selected?.id === h.id;
              return (
                <g key={h.id} onClick={() => setSelected(h)} style={{ cursor: 'pointer' }}>
                  <circle cx={pos.x} cy={pos.y} r={isSel ? 20 : 16}
                    fill={C.panel} stroke={color} strokeWidth={isSel ? 2.5 : 1.5}
                  />
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fontSize={10} fill={color} fontWeight={700}>
                    {h.tipo?.includes('Controller') ? 'DC' :
                     h.tipo?.includes('Web') || h.tipo?.includes('Server') ? 'SRV' :
                     h.tipo?.includes('Workstation') || h.tipo?.includes('Laptop') ? 'WS' : 'HOST'}
                  </text>
                  <text x={pos.x} y={pos.y + 28} textAnchor="middle" fontSize={8.5} fill={C.t2}>
                    {h.nombre?.length > 12 ? h.nombre.slice(0, 12) + '…' : h.nombre}
                  </text>
                  <text x={pos.x} y={pos.y + 39} textAnchor="middle" fontSize={8} fill={C.t3}>
                    {h.ip}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detalle host */}
        <div style={{
          flex: 1, background: '#070b14', border: `1px solid ${C.border}`,
          borderRadius: 6, padding: 10, fontSize: 11, overflow: 'auto',
        }}>
          {selected ? (
            <>
              <div style={{ marginBottom: 8 }}>
                <Badge label={selected.estado?.toUpperCase()} color={EST_COLOR[selected.estado] || C.t3} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 6 }}>{selected.nombre}</div>
              {[
                ['IP', selected.ip],
                ['Tipo', selected.tipo],
                ['OS', selected.os],
              ].map(([k, v]) => v ? (
                <div key={k} style={{ marginBottom: 3 }}>
                  <span style={{ color: C.t3 }}>{k}: </span>
                  <span style={{ color: C.acc, fontFamily: 'monospace' }}>{v}</span>
                </div>
              ) : null)}
              {selected.servicios?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: C.t3, marginBottom: 4 }}>Servicios:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {selected.servicios.map(s => <Badge key={s} label={s} color={C.t2} />)}
                  </div>
                </div>
              )}
              {selected.notas && (
                <div style={{ marginTop: 8, padding: 8, background: C.panel, borderRadius: 5, fontSize: 10, color: C.t2, lineHeight: 1.5 }}>
                  {selected.notas}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: C.t3, fontSize: 11, textAlign: 'center', paddingTop: 30 }}>
              Haz clic en un host para ver sus detalles
            </div>
          )}

          {/* Leyenda */}
          <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
            {[['comprometido', 'Comprometido'], ['sospechoso', 'Sospechoso'], ['limpio', 'Limpio']].map(([k, l]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: EST_COLOR[k] }} />
                <span style={{ fontSize: 10, color: C.t3 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ── PANEL: TICKET ─────────────────────────────────────────────────────────────
function TicketPanel({ preguntas, onSubmit, submitting, queriesLog }) {
  const [respuestas, setRespuestas]     = useState({});
  const [informe, setInforme]           = useState('');
  const [activeTab, setActiveTab]       = useState('preguntas');

  const handleChange = (id, val) => setRespuestas(r => ({ ...r, [String(id)]: val }));

  const respondidas = preguntas.filter(p => respuestas[String(p.id)]?.trim()).length;

  const handleSubmit = () => {
    onSubmit({ respuestas, informe_libre: informe, queries_usadas: queriesLog });
  };

  return (
    <Panel title="Ticket de Análisis" icon="🎫" headerRight={
      <div style={{ display: 'flex', gap: 4 }}>
        {['preguntas', 'informe'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            fontSize: 10, padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontWeight: 700,
            border: `1px solid ${activeTab === t ? C.acc : C.border}`,
            background: activeTab === t ? C.acc + '22' : 'transparent',
            color: activeTab === t ? C.acc : C.t3,
          }}>{t === 'preguntas' ? `Preguntas (${respondidas}/${preguntas.length})` : 'Informe libre'}</button>
        ))}
      </div>
    }>
      {activeTab === 'preguntas' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {preguntas.map(p => (
            <div key={p.id} style={{
              background: '#070b14', border: `1px solid ${respuestas[String(p.id)] ? C.acc + '44' : C.border}`,
              borderRadius: 8, padding: '12px 14px', transition: 'border-color 0.2s',
            }}>
              {/* Cabecera siempre visible */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                  background: respuestas[String(p.id)] ? C.green + '22' : C.border,
                  border: `1px solid ${respuestas[String(p.id)] ? C.green : C.border2}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  color: respuestas[String(p.id)] ? C.green : C.t3,
                }}>
                  {respuestas[String(p.id)] ? '✓' : p.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: C.acc2, fontWeight: 700, marginBottom: 4 }}>{p.categoria}</div>
                  {/* Pregunta siempre visible encima del input */}
                  <div style={{ fontSize: 12, color: C.t1, lineHeight: 1.5, marginBottom: 8, fontWeight: 600 }}>
                    {p.pregunta}
                  </div>
                  <input
                    value={respuestas[String(p.id)] || ''}
                    onChange={e => handleChange(p.id, e.target.value)}
                    placeholder={p.placeholder || 'Escribe tu respuesta aquí...'}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: 6,
                      background: C.panel, border: `1px solid ${C.border2}`,
                      color: C.t1, fontSize: 12, fontFamily: 'monospace',
                      outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = C.acc}
                    onBlur={e => e.target.style.borderColor = C.border2}
                  />
                  {/* Pista siempre visible debajo del input */}
                  <div style={{ fontSize: 10, color: C.t3, marginTop: 6, display: 'flex', gap: 5 }}>
                    <span style={{ color: C.yellow }}>💡</span>
                    <span>{p.pista}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Barra progreso */}
          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.t3, marginBottom: 4 }}>
              <span>Progreso del análisis</span>
              <span>{respondidas}/{preguntas.length} preguntas respondidas</span>
            </div>
            <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${(respondidas / preguntas.length) * 100}%`,
                background: `linear-gradient(90deg, ${C.acc2}, ${C.acc})`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
          <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.6 }}>
            Describe la cadena completa del ataque: vector de entrada, técnicas usadas, sistemas afectados,
            movimiento lateral, persistencia, y acciones de remediación recomendadas.
          </div>
          <textarea
            value={informe}
            onChange={e => setInforme(e.target.value)}
            placeholder="Escribe aquí tu análisis completo del incidente..."
            style={{
              flex: 1, minHeight: 200, padding: '10px 12px', borderRadius: 8,
              background: '#070b14', border: `1px solid ${C.border2}`,
              color: C.t1, fontSize: 12, fontFamily: 'monospace', lineHeight: 1.6,
              outline: 'none', resize: 'vertical',
            }}
            onFocus={e => e.target.style.borderColor = C.acc}
            onBlur={e => e.target.style.borderColor = C.border2}
          />
          <div style={{ fontSize: 10, color: C.t3 }}>
            Un informe detallado puede sumar hasta +10 puntos extra en la evaluación
          </div>
        </div>
      )}

      {/* Botón enviar */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, color: C.t3, marginBottom: 8 }}>
          Queries SIEM ejecutadas: <span style={{ color: C.acc }}>{queriesLog.length}</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || respondidas === 0}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 8,
            background: submitting || respondidas === 0
              ? C.border
              : `linear-gradient(135deg, ${C.green}, ${C.acc})`,
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: submitting || respondidas === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {submitting ? <><Spinner size={14} color="#fff" /> Evaluando con IA...</> : '📤 Enviar análisis para evaluación'}
        </button>
        {respondidas === 0 && (
          <div style={{ fontSize: 10, color: C.t3, textAlign: 'center', marginTop: 6 }}>
            Responde al menos una pregunta para enviar
          </div>
        )}
      </div>
    </Panel>
  );
}

// ── PANTALLA: RESULTADOS ──────────────────────────────────────────────────────
function ResultadosPanel({ resultado, escenario, onNuevoLab, onDashboard }) {
  const [tab, setTab] = useState('resumen');
  const pct   = resultado.puntuacion_normalizada || 0;
  const color = pct >= 80 ? C.green : pct >= 50 ? C.yellow : C.red;

  const skillLabels = {
    siem_queries: 'SIEM & Queries', forense_digital: 'Forense Digital',
    threat_hunting: 'Threat Hunting', analisis_logs: 'Análisis de Logs',
    inteligencia_amenazas: 'Intel. Amenazas',
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, fontFamily: "'JetBrains Mono', monospace",
      padding: 24, color: C.t1,
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: '24px 28px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: C.t3, marginBottom: 4 }}>LABORATORIO COMPLETADO</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.t1 }}>{escenario?.titulo || 'Lab SOC'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{Math.round(pct)}</div>
            <div style={{ fontSize: 11, color: C.t3 }}>/ 100 puntos</div>
          </div>
        </div>

        {/* Stats rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            ['⚡ XP Ganada', `+${resultado.xp_ganada || 0}`, C.acc],
            ['🔗 Cadena descubierta', `${resultado.cadena_ataque_descubierta || 0}%`, color],
            ['🔍 Queries SIEM', resultado.puntuacion_queries !== undefined ? `+${resultado.puntuacion_queries} pts` : '-', C.green],
            ['📋 Informe', resultado.puntuacion_informe !== undefined ? `+${resultado.puntuacion_informe} pts` : '-', C.yellow],
          ].map(([label, val, c]) => (
            <div key={label} style={{
              background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 10, color: C.t3, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {['resumen', 'preguntas', 'skills', 'solucion'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700,
              border: `1px solid ${tab === t ? C.acc : C.border}`,
              background: tab === t ? C.acc + '22' : 'transparent',
              color: tab === t ? C.acc : C.t3,
            }}>
              {t === 'resumen' ? '📊 Resumen' : t === 'preguntas' ? '❓ Preguntas' : t === 'skills' ? '📈 Skills' : '🔓 Solución'}
            </button>
          ))}
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
          {tab === 'resumen' && (
            <div>
              <div style={{ fontSize: 13, color: C.t2, lineHeight: 1.8, marginBottom: 12 }}>
                {resultado.feedback_general}
              </div>
            </div>
          )}

          {tab === 'preguntas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(resultado.feedback_preguntas || []).map(fp => (
                <div key={fp.id} style={{
                  padding: '12px 14px', borderRadius: 8,
                  background: '#070b14',
                  border: `1px solid ${fp.correcto ? C.green + '44' : C.red + '33'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{fp.correcto ? '✅' : '❌'}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>Pregunta {fp.id}</span>
                    <Badge label={`${fp.puntos}/10`} color={fp.correcto ? C.green : C.red} />
                  </div>
                  <div style={{ fontSize: 11, color: C.t3, marginBottom: 4 }}>Respuesta correcta: <span style={{ color: C.acc, fontFamily: 'monospace' }}>{fp.respuesta_correcta}</span></div>
                  <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.5 }}>{fp.feedback}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(resultado.skills_mejoradas || {}).map(([skill, datos]) => {
                const delta = typeof datos === 'object' ? datos.delta : datos;
                return (
                  <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 140, fontSize: 11, color: C.t2, flexShrink: 0 }}>
                      {skillLabels[skill] || skill}
                    </div>
                    <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3 }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${(delta / 0.3) * 100}%`,
                        background: delta >= 0.2 ? C.green : delta > 0 ? C.yellow : C.border2,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <div style={{ width: 50, fontSize: 11, color: delta > 0 ? C.green : C.t3, textAlign: 'right', flexShrink: 0 }}>
                      {delta > 0 ? `+${delta.toFixed(2)}` : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'solucion' && resultado.solucion_completa && (
            <div>
              <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.7, marginBottom: 14 }}>
                {resultado.solucion_completa.resumen}
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.t3, marginBottom: 8, fontWeight: 700 }}>CADENA DEL ATAQUE:</div>
                {(resultado.solucion_completa.cadena_ataque || []).map((paso, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.acc2 + '33', border: `1px solid ${C.acc2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: C.acc2, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.5 }}>{paso}</div>
                  </div>
                ))}
              </div>
              {resultado.solucion_completa.tecnicas_mitre?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: C.t3, marginBottom: 6, fontWeight: 700 }}>TTPs MITRE ATT&CK:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {resultado.solucion_completa.tecnicas_mitre.map(t => (
                      <Badge key={t} label={t} color={C.acc} />
                    ))}
                  </div>
                </div>
              )}
              <div style={{ padding: 12, background: '#070b14', borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.yellow, marginBottom: 4, fontWeight: 700 }}>💡 LECCIONES APRENDIDAS</div>
                <div style={{ fontSize: 11, color: C.t2, lineHeight: 1.6 }}>{resultado.solucion_completa.lecciones}</div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onNuevoLab} style={{
            flex: 1, padding: '13px 0', borderRadius: 8,
            background: `linear-gradient(135deg, ${C.acc2}, ${C.acc})`,
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            🔬 Nuevo laboratorio
          </button>
          <button onClick={onDashboard} style={{
            flex: 1, padding: '13px 0', borderRadius: 8,
            background: 'transparent', border: `1px solid ${C.border2}`,
            color: C.t2, fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            ← Volver al dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function LabPage() {
  const navigate = useNavigate();

  const [fase, setFase]           = useState('intro');    // intro | lab | resultado
  const [escenario, setEscenario] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [queriesLog, setQueriesLog] = useState([]);

  // Registrar cada interacción como "query"
  const onQueryLog = useCallback((q) => {
    setQueriesLog(prev => {
      if (prev.includes(q)) return prev;
      return [...prev, q];
    });
  }, []);

  const iniciarLab = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/lab/generar', { method: 'POST' });
      setEscenario(data);
      setFase('lab');
      setQueriesLog([]);
    } catch (e) {
      setError(e.message || 'Error generando el laboratorio');
    } finally {
      setLoading(false);
    }
  };

  const enviarAnalisis = async ({ respuestas, informe_libre, queries_usadas }) => {
    setSubmitting(true);
    setError('');
    try {
      const data = await apiFetch('/lab/evaluar', {
        method: 'POST',
        body: JSON.stringify({
          lab_id:        escenario.lab_id,
          respuestas,
          informe_libre,
          queries_usadas,
        }),
      });
      setResultado(data);
      setFase('resultado');
    } catch (e) {
      setError(e.message || 'Error evaluando el laboratorio');
    } finally {
      setSubmitting(false);
    }
  };

  const nuevoLab = () => {
    setEscenario(null);
    setResultado(null);
    setFase('intro');
  };

  // ── RENDER: INTRO ──────────────────────────────────────────────────────────
  if (fase === 'intro') {
    return (
      <>
        <LabIntro onStart={iniciarLab} loading={loading} />
        {error && (
          <div style={{
            position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            background: C.red + '22', border: `1px solid ${C.red}`, borderRadius: 8,
            padding: '10px 20px', color: C.red, fontSize: 12,
          }}>{error}</div>
        )}
      </>
    );
  }

  // ── RENDER: RESULTADO ──────────────────────────────────────────────────────
  if (fase === 'resultado') {
    return <ResultadosPanel resultado={resultado} escenario={escenario} onNuevoLab={nuevoLab} onDashboard={() => navigate('/dashboard')} />;
  }

  // ── RENDER: LAB ────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius:3px; }
      `}</style>

      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: `1px solid ${C.border}`,
        background: C.panel, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14 }}>🔬</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{escenario?.titulo || 'Laboratorio SOC'}</span>
          <Badge label={escenario?.nivel || 'BRONCE'} color={C.acc2} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 11, color: C.t3 }}>
            🔍 <span style={{ color: C.acc }}>{queriesLog.length}</span> queries ejecutadas
          </span>
          <button onClick={() => navigate('/dashboard')} style={{
            fontSize: 11, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
            background: 'transparent', border: `1px solid ${C.border2}`, color: C.t3,
          }}>← Dashboard</button>
        </div>
      </div>

      {/* Contexto del escenario */}
      <div style={{
        padding: '10px 20px', borderBottom: `1px solid ${C.border}`,
        background: '#0b1121', flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, color: C.yellow, marginRight: 8 }}>🎯 OBJETIVO:</span>
        <span style={{ fontSize: 11, color: C.t2 }}>{escenario?.objetivo || escenario?.descripcion}</span>
      </div>

      {error && (
        <div style={{ padding: '8px 20px', background: C.red + '11', borderBottom: `1px solid ${C.red}33`, fontSize: 11, color: C.red }}>
          ⚠ {error}
        </div>
      )}

      {/* Grid 2x2 */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 10, padding: 10,
        minHeight: 0,
      }}>
        <SIEMPanel
          alertas={escenario?.alertas_siem || []}
          onQueryLog={onQueryLog}
          queriesLog={queriesLog}
        />
        <LogPanel
          logs={escenario?.logs || []}
          onQueryLog={onQueryLog}
        />
        <NetworkPanel
          red={escenario?.red}
        />
        <TicketPanel
          preguntas={escenario?.preguntas || []}
          onSubmit={enviarAnalisis}
          submitting={submitting}
          queriesLog={queriesLog}
        />
      </div>
    </div>
  );
}