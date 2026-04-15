import React, { useState, useEffect, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import { useNavigate } from 'react-router-dom';

const API = 'https://socblast-production.up.railway.app/api';
const OB_KEY = 'socblast_lab_onboarding_v2';

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const tok = () => localStorage.getItem('token');
const api = async (path, opts = {}) => {
  const r = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
  return r.json();
};
const clock = () => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
const clsx = (...a) => a.filter(Boolean).join(' ');

/* ─── onboarding ────────────────────────────────────────────────────────────── */
const OB_STEPS = [
  { icon: '🖥️', title: 'Un ordenador comprometido real', body: 'La IA genera una máquina Windows o Linux que ha sido atacada. Tú eres el analista forense que debe descubrir qué pasó.' },
  { icon: '🔍', title: 'Abre las aplicaciones', body: 'Haz doble clic en los iconos del escritorio para abrir SIEM, Terminal, Logs, Red o el Informe. Las ventanas son arrastrables y redimensionables.' },
  { icon: '💻', title: 'Investiga sin límite de tiempo', body: 'Analiza alertas, ejecuta comandos en la terminal, correlaciona logs. Cuanto más investigues, más puntos ganas.' },
  { icon: '📝', title: 'Envía tu informe', body: 'Responde las preguntas del Incident Report y redacta tu análisis. La IA evaluará tu investigación y mejorará tus skills.' },
];

function Onboarding({ onDone }) {
  const [s, setS] = useState(0);
  const cur = OB_STEPS[s];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 44px', maxWidth: 480, width: '90%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,.5)' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>{cur.icon}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>{cur.title}</div>
        <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, marginBottom: 28 }}>{cur.body}</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          {OB_STEPS.map((_, i) => <div key={i} style={{ width: i === s ? 22 : 8, height: 8, borderRadius: 4, background: i === s ? '#0078d4' : '#e2e8f0', transition: 'all .3s' }} />)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {s > 0 && <button onClick={() => setS(s - 1)} style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>← Atrás</button>}
          <button onClick={() => s === OB_STEPS.length - 1 ? onDone() : setS(s + 1)}
            style={{ flex: 2, padding: '12px 0', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#0078d4,#106ebe)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            {s === OB_STEPS.length - 1 ? '🚀 ¡Empezar!' : 'Siguiente →'}
          </button>
        </div>
        <button onClick={onDone} style={{ marginTop: 10, background: 'none', border: 'none', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>Saltar tutorial</button>
      </div>
    </div>
  );
}

/* ─── boot screen ────────────────────────────────────────────────────────────── */
const WIN_BOOT = [
  '', '  Starting Windows...', '  Microsoft Windows [Version 10.0.19045.3803]',
  '  (c) Microsoft Corporation. All rights reserved.', '',
  '  Loading CORP domain policies.......................... [OK]',
  '  Starting Windows Defender Antivirus Service.......... [OK]',
  '  Connecting to CORP-DC01.corp.local................... [OK]',
  '  Mounting network drives.............................. [OK]',
  '  Loading SOC Analyst workstation profile..............',
  '', '  ████████████████████████████████  100%', '',
  '  Welcome, SOC Analyst.',
];

function BootScreen({ onDone }) {
  const [lines, setLines] = useState([]);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < WIN_BOOT.length) { setLines(l => [...l, WIN_BOOT[i++]]); }
      else { clearInterval(iv); setTimeout(() => { setFading(true); setTimeout(onDone, 700); }, 800); }
    }, 150);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#000080', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New', monospace", opacity: fading ? 0 : 1, transition: 'opacity .7s' }}>
      <div style={{ fontSize: 72, marginBottom: 24 }}>🪟</div>
      <div style={{ fontSize: 13, color: '#fff', lineHeight: 2.1, textAlign: 'center' }}>
        {lines.map((l, i) => <div key={i} style={{ opacity: i === lines.length - 1 ? 1 : 0.75 }}>{l || '\u00a0'}</div>)}
      </div>
    </div>
  );
}

/* ─── window manager ─────────────────────────────────────────────────────────── */
let zTop = 10;

function AppWindow({ id, title, icon, children, onClose, onMinimize, focused, onFocus, defaultX, defaultY, defaultW, defaultH, minW = 400, minH = 300 }) {
  const nodeRef = useRef(null);
  const [maximized, setMax] = useState(false);
  const [size, setSize] = useState({ w: defaultW || 700, h: defaultH || 480 });
  const [zIdx, setZ] = useState(zTop++);
  const [pos, setPos] = useState({ x: defaultX || 80, y: defaultY || 40 });
  const resizing = useRef(null);

  const focus = () => { const z = zTop++; setZ(z); onFocus(); };

  /* resize handle */
  const onResizeStart = (e) => {
    e.stopPropagation(); e.preventDefault();
    resizing.current = { startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h };
    const onMove = (ev) => {
      if (!resizing.current) return;
      const dw = ev.clientX - resizing.current.startX;
      const dh = ev.clientY - resizing.current.startY;
      setSize({ w: Math.max(minW, resizing.current.startW + dw), h: Math.max(minH, resizing.current.startH + dh) });
    };
    const onUp = () => { resizing.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const titleBg = focused ? '#1a1a2e' : '#2d2d3d';

  return (
    <Draggable nodeRef={nodeRef} handle=".win-drag" disabled={maximized}
      position={maximized ? { x: 0, y: 0 } : undefined}
      defaultPosition={{ x: defaultX || 80, y: defaultY || 40 }}
      onStart={focus} bounds="parent">
      <div ref={nodeRef} onMouseDown={focus} style={{
        position: 'absolute',
        width: maximized ? '100%' : size.w,
        height: maximized ? 'calc(100% )' : size.h,
        ...(maximized ? { top: 0, left: 0 } : {}),
        background: '#fff',
        border: focused ? '1px solid #0078d4' : '1px solid rgba(255,255,255,.15)',
        borderRadius: maximized ? 0 : 6,
        boxShadow: focused ? '0 16px 48px rgba(0,0,0,.55)' : '0 4px 16px rgba(0,0,0,.4)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        zIndex: zIdx,
        fontFamily: "'Segoe UI', 'Inter', sans-serif",
        transition: 'box-shadow .15s',
        userSelect: 'none',
      }}>
        {/* title bar */}
        <div className="win-drag" style={{ height: 32, background: titleBg, display: 'flex', alignItems: 'center', padding: '0 0 0 12px', gap: 8, cursor: 'move', flexShrink: 0 }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span style={{ flex: 1, fontSize: 12, color: '#e2e8f0', fontWeight: 600, letterSpacing: '.01em', userSelect: 'none' }}>{title}</span>
          {/* win buttons */}
          <WinCtrl icon="─" onClick={e => { e.stopPropagation(); onMinimize(); }} />
          <WinCtrl icon="□" onClick={e => { e.stopPropagation(); setMax(m => !m); }} />
          <WinCtrl icon="✕" red onClick={e => { e.stopPropagation(); onClose(); }} />
        </div>
        {/* content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{children}</div>
        {/* resize handle */}
        {!maximized && (
          <div onMouseDown={onResizeStart} style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, cursor: 'nwse-resize', zIndex: 9999 }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 12 L12 2 M6 12 L12 6 M10 12 L12 10" stroke="rgba(100,116,139,.5)" strokeWidth="1.5" /></svg>
          </div>
        )}
      </div>
    </Draggable>
  );
}

function WinCtrl({ icon, onClick, red }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: 46, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: h ? (red ? '#c42b1c' : 'rgba(255,255,255,.12)') : 'transparent', cursor: 'pointer', color: '#e2e8f0', fontSize: red ? 12 : 13, transition: 'background .12s' }}>
      {icon}
    </div>
  );
}

/* ─── desktop icon ──────────────────────────────────────────────────────────── */
function DesktopIcon({ icon, label, color = '#fff', onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onDoubleClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 6px', borderRadius: 6, background: h ? 'rgba(255,255,255,.18)' : 'transparent', cursor: 'pointer', transition: 'background .15s', width: 76, userSelect: 'none' }}>
      <div style={{ fontSize: 34, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.5))' }}>{icon}</div>
      <div style={{ fontSize: 11, color, textAlign: 'center', lineHeight: 1.3, textShadow: '0 1px 3px rgba(0,0,0,.9)', fontWeight: 500, fontFamily: 'Segoe UI, sans-serif' }}>{label}</div>
    </div>
  );
}

/* ─── taskbar button ─────────────────────────────────────────────────────────── */
function TaskBtn({ icon, label, active, minimized, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 4, background: active ? 'rgba(255,255,255,.22)' : h ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.06)', border: active ? '1px solid rgba(255,255,255,.3)' : '1px solid transparent', cursor: 'pointer', transition: 'all .12s', minWidth: 0, maxWidth: 160, opacity: minimized ? .7 : 1 }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Segoe UI, sans-serif' }}>{label}</span>
    </div>
  );
}

/* ─── APP: SIEM ──────────────────────────────────────────────────────────────── */
function SIEMApp({ alertas, onQuery }) {
  const [sel, setSel] = useState(null);
  const [flt, setFlt] = useState('TODAS');
  const SEV = { CRITICA: '#dc2626', ALTA: '#ea580c', MEDIA: '#d97706', BAJA: '#16a34a' };
  const filtered = flt === 'TODAS' ? alertas : alertas.filter(a => a.severidad === flt);

  return (
    <div style={{ display: 'flex', height: '100%', fontSize: 12, background: '#f8fafc' }}>
      {/* sidebar */}
      <div style={{ width: 300, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {/* filter bar */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #e8eaf0', display: 'flex', gap: 4, flexWrap: 'wrap', background: '#f8fafc' }}>
          {['TODAS', 'CRITICA', 'ALTA', 'MEDIA', 'BAJA'].map(s => (
            <button key={s} onClick={() => setFlt(s)} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, border: `1px solid ${s === 'TODAS' ? '#e2e8f0' : SEV[s] || '#e2e8f0'}`, background: flt === s ? (SEV[s] || '#4f46e5') + '22' : 'transparent', color: flt === s ? (SEV[s] || '#4f46e5') : '#64748b' }}>{s}</button>
          ))}
        </div>
        {/* list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && <div style={{ padding: 20, color: '#94a3b8', textAlign: 'center', fontSize: 12 }}>Sin alertas</div>}
          {filtered.map(a => (
            <div key={a.id} onClick={() => { setSel(a); onQuery(`SIEM:${a.id}`); }}
              style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', borderLeft: `3px solid ${sel?.id === a.id ? SEV[a.severidad] || '#4f46e5' : 'transparent'}`, background: sel?.id === a.id ? (SEV[a.severidad] || '#4f46e5') + '08' : 'transparent', transition: 'all .12s' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 3, background: (SEV[a.severidad] || '#666') + '18', color: SEV[a.severidad] || '#666', border: `1px solid ${SEV[a.severidad] || '#666'}30` }}>{a.severidad}</span>
                <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 'auto' }}>{a.timestamp?.slice(11, 19)}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', lineHeight: 1.3, marginBottom: 2 }}>{a.titulo}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{a.sistema} · {a.categoria}</div>
            </div>
          ))}
        </div>
      </div>
      {/* detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {sel ? (
          <>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 4, background: (SEV[sel.severidad] || '#666') + '18', color: SEV[sel.severidad] || '#666', border: `1px solid ${SEV[sel.severidad] || '#666'}30` }}>{sel.severidad}</span>
              <span style={{ fontSize: 11, color: '#64748b' }}>{sel.timestamp}</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{sel.titulo}</h3>
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>{sel.descripcion}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', background: '#f8fafc', borderRadius: 8, padding: 14 }}>
              {[['Sistema', sel.sistema], ['Categoría', sel.categoria], ['IP Origen', sel.ip_origen], ['IP Destino', sel.ip_destino], ['Usuario', sel.usuario], ['Proceso', sel.proceso], ['Regla SIEM', sel.regla_disparada]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1d4ed8', fontFamily: 'monospace' }}>{v}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#94a3b8' }}>
            <div style={{ fontSize: 40 }}>🖥️</div>
            <div style={{ fontSize: 13 }}>Selecciona una alerta para ver el detalle</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── APP: TERMINAL ──────────────────────────────────────────────────────────── */
function TerminalApp({ escenario, onQuery }) {
  const [hist, setHist] = useState([{ t: 'sys', v: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n\nEscribe "help" para ver los comandos disponibles.' }]);
  const [inp, setInp] = useState('');
  const [cmds, setCmds] = useState([]);
  const [ci, setCi] = useState(-1);
  const bot = useRef(null);
  const inpRef = useRef(null);
  const prompt = 'C:\\Users\\analyst>';

  const iocs = escenario?.iocs || {};
  const logs = escenario?.logs || [];
  const hosts = escenario?.red?.hosts || [];
  const conns = escenario?.red?.conexiones || [];
  const alertas = escenario?.alertas_siem || [];

  const CMDS = {
    help: () => `Comandos disponibles:\n  whoami           usuario actual\n  ipconfig         configuración de red\n  netstat -an      conexiones activas\n  tasklist         procesos en ejecución\n  dir              listar archivos\n  type <archivo>   mostrar archivo\n  grep <patron>    buscar en logs\n  ioc              IOCs del escenario\n  hosts            hosts de la red\n  alerts           resumen alertas SIEM\n  cls              limpiar pantalla`,
    whoami: () => 'CORP\\analyst',
    ipconfig: () => `Adaptador Ethernet Ethernet0:\n   Dirección IPv4. . . . . . : 10.0.0.50\n   Máscara de subred . . . . : 255.255.255.0\n   Puerta de enlace predeterminada: 10.0.0.1`,
    'netstat -an': () => {
      const lines = ['  Proto  Direcc. local          Direcc. externo        Estado'];
      conns.forEach(c => {
        const f = hosts.find(h => h.id === c.origen); const t = hosts.find(h => h.id === c.destino);
        lines.push(`  TCP    ${f?.ip || '10.0.0.x'}:${c.puerto || 445}         ${t?.ip || '0.0.0.0'}:${c.puerto || 445}       ${c.estado === 'maliciosa' ? 'ESTABLISHED' : 'LISTENING'}`);
      });
      if (!conns.length) lines.push('  (sin conexiones activas)');
      return lines.join('\n');
    },
    tasklist: () => {
      const procs = iocs.procesos_sospechosos || [];
      const base = ['Nombre de imagen       PID  Nombre de sesión  Uso de mem', '====================== ==== ================  ==========', 'System                 4    Services          1.580 KB', 'svchost.exe            892  Services          12.340 KB', 'explorer.exe           1456 Console           48.200 KB'];
      procs.forEach((p, i) => base.push(`${p.slice(0, 22).padEnd(22)} ${1200 + i}  Console           24.${300 + i} KB  ← SOSPECHOSO`));
      return base.join('\n');
    },
    dir: () => {
      const files = logs.slice(0, 6).map(l => `${l.timestamp?.slice(0, 10).replace(/-/g, '/')}  ${l.sistema}.log`);
      return `Directorio de C:\\Users\\analyst\n\n${files.join('\n') || '(vacío)'}\n\n               ${logs.length} archivos`;
    },
    ioc: () => {
      const parts = ['═══ IOCs del escenario ═══'];
      if (iocs.ips_maliciosas?.length) parts.push(`IPs maliciosas:\n  ${iocs.ips_maliciosas.join('\n  ')}`);
      if (iocs.hashes_maliciosos?.length) parts.push(`Hashes:\n  ${iocs.hashes_maliciosos.join('\n  ')}`);
      if (iocs.dominios_maliciosos?.length) parts.push(`Dominios C2:\n  ${iocs.dominios_maliciosos.join('\n  ')}`);
      if (iocs.procesos_sospechosos?.length) parts.push(`Procesos sospechosos:\n  ${iocs.procesos_sospechosos.join('\n  ')}`);
      if (iocs.usuarios_comprometidos?.length) parts.push(`Usuarios comprometidos:\n  ${iocs.usuarios_comprometidos.join('\n  ')}`);
      return parts.length > 1 ? parts.join('\n\n') : '(no hay IOCs definidos)';
    },
    hosts: () => hosts.length ? hosts.map(h => `[${h.estado?.toUpperCase().padEnd(12)}] ${h.nombre.padEnd(20)} ${h.ip.padEnd(16)} ${h.tipo}`).join('\n') : '(sin hosts)',
    alerts: () => alertas.length ? alertas.map(a => `[${a.severidad.padEnd(8)}] ${a.timestamp?.slice(11, 19)} ${a.titulo} — ${a.sistema}`).join('\n') : '(sin alertas)',
    cls: () => null,
  };

  const run = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    onQuery(`CMD:${cmd}`);
    setCmds(p => [cmd, ...p]); setCi(-1);
    let out = '';
    const lc = cmd.toLowerCase();
    if (lc === 'cls') { setHist([]); setInp(''); return; }
    else if (lc.startsWith('grep ')) {
      const pat = lc.slice(5).trim();
      const m = logs.filter(l => l.mensaje.toLowerCase().includes(pat));
      out = m.length ? m.map(l => `[${l.sistema}] ${l.mensaje}`).join('\n') : `grep: "${pat}" — sin coincidencias`;
    } else if (lc.startsWith('type ')) {
      const f = lc.slice(5).trim();
      const l = logs.find(l => l.sistema.toLowerCase().includes(f) || l.id?.toLowerCase() === f);
      out = l ? `--- ${l.sistema} ---\n${l.timestamp}  [${l.nivel}] ${l.mensaje}` : `type: No se puede encontrar el archivo especificado.`;
    } else if (CMDS[lc]) { out = CMDS[lc](); if (out === null) { setHist([]); setInp(''); return; } }
    else out = `'${cmd}' no se reconoce como un comando interno o externo.\nEscribe "help" para ver los disponibles.`;
    setHist(h => [...h, { t: 'in', v: `${prompt}${cmd}` }, { t: 'out', v: out }]);
    setInp('');
  };

  useEffect(() => { bot.current?.scrollIntoView({ behavior: 'smooth' }); }, [hist]);

  return (
    <div onClick={() => inpRef.current?.focus()} style={{ flex: 1, background: '#0c0c0c', color: '#cccccc', fontFamily: "'Cascadia Code','Consolas','Courier New',monospace", fontSize: 12, display: 'flex', flexDirection: 'column', cursor: 'text' }}>
      <div style={{ padding: '6px 8px', background: '#1a1a1a', borderBottom: '1px solid #333', fontSize: 11, color: '#888', flexShrink: 0 }}>
        Símbolo del sistema — CORP\\analyst@SOC-WORKSTATION
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {hist.map((h, i) => (
          <pre key={i} style={{ margin: 0, marginBottom: 4, whiteSpace: 'pre-wrap', lineHeight: 1.6, color: h.t === 'in' ? '#cccccc' : h.t === 'sys' ? '#aaa' : '#cccccc', fontFamily: 'inherit' }}>{h.v}</pre>
        ))}
        <div ref={bot} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderTop: '1px solid #333', flexShrink: 0 }}>
        <span style={{ color: '#ccc', marginRight: 6, whiteSpace: 'nowrap', fontSize: 12 }}>{prompt}</span>
        <input ref={inpRef} autoFocus value={inp} onChange={e => setInp(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') run(inp);
            else if (e.key === 'ArrowUp') { const ni = Math.min(ci + 1, cmds.length - 1); setCi(ni); setInp(cmds[ni] || ''); }
            else if (e.key === 'ArrowDown') { const ni = Math.max(ci - 1, -1); setCi(ni); setInp(ni === -1 ? '' : cmds[ni] || ''); }
          }}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#cccccc', fontSize: 12, fontFamily: 'inherit' }}
          placeholder="escribe un comando..." />
      </div>
    </div>
  );
}

/* ─── APP: LOG EXPLORER ──────────────────────────────────────────────────────── */
function LogApp({ logs, onQuery }) {
  const [search, setSearch] = useState('');
  const [nivel, setNivel] = useState('TODOS');
  const [onlyRel, setRel] = useState(false);
  const NVC = { ERROR: '#dc2626', WARNING: '#d97706', INFO: '#64748b' };
  const filtered = logs.filter(l => {
    if (nivel !== 'TODOS' && l.nivel !== nivel) return false;
    if (onlyRel && !l.relevante) return false;
    if (search && !JSON.stringify(l).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const hs = v => { setSearch(v); if (v.length > 2) onQuery(`SEARCH:${v}`); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontSize: 12 }}>
      {/* toolbar */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', flexShrink: 0 }}>
        <input value={search} onChange={e => hs(e.target.value)} placeholder="Filtrar logs: IP, proceso, Event ID, usuario..."
          style={{ flex: 1, minWidth: 160, padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontSize: 11, outline: 'none', fontFamily: 'monospace' }} />
        {['TODOS', 'ERROR', 'WARNING', 'INFO'].map(n => (
          <button key={n} onClick={() => setNivel(n)} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, border: `1px solid ${NVC[n] || '#e2e8f0'}`, background: nivel === n ? (NVC[n] || '#4f46e5') + '22' : 'transparent', color: nivel === n ? NVC[n] || '#4f46e5' : '#64748b' }}>{n}</button>
        ))}
        <label style={{ fontSize: 11, color: '#64748b', display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={onlyRel} onChange={e => setRel(e.target.checked)} style={{ accentColor: '#0078d4' }} /> Solo relevantes
        </label>
      </div>
      {/* list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {filtered.map(l => (
          <div key={l.id} style={{ padding: '7px 10px', borderRadius: 5, marginBottom: 3, fontFamily: 'Consolas, monospace', background: l.relevante ? '#fff' : '#fafafa', border: `1px solid ${l.relevante ? '#e2e8f0' : '#f1f5f9'}`, opacity: l.relevante ? 1 : 0.55 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: '#64748b' }}>{l.timestamp?.slice(11, 19)}</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, color: NVC[l.nivel] || '#64748b', background: (NVC[l.nivel] || '#64748b') + '18', border: `1px solid ${NVC[l.nivel] || '#64748b'}30` }}>{l.nivel}</span>
              <span style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 600 }}>{l.sistema}</span>
              <span style={{ fontSize: 10, color: '#64748b' }}>{l.fuente}</span>
              {l.event_id && <span style={{ fontSize: 9, color: '#64748b', border: '1px solid #e2e8f0', padding: '0 4px', borderRadius: 3 }}>EID:{l.event_id}</span>}
              {!l.relevante && <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 'auto' }}>ruido</span>}
            </div>
            <div style={{ fontSize: 11, color: l.relevante ? '#0f172a' : '#94a3b8', lineHeight: 1.5, wordBreak: 'break-all' }}>{l.mensaje}</div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>{search ? `Sin resultados para "${search}"` : 'Sin logs'}</div>}
      </div>
      <div style={{ padding: '4px 12px', borderTop: '1px solid #e2e8f0', fontSize: 10, color: '#94a3b8', background: '#f8fafc', flexShrink: 0 }}>
        {filtered.length} / {logs.length} entradas · {logs.filter(l => l.relevante).length} relevantes
      </div>
    </div>
  );
}

/* ─── APP: NETWORK MONITOR ───────────────────────────────────────────────────── */
function NetworkApp({ red }) {
  const [sel, setSel] = useState(null);
  const hosts = red?.hosts || [];
  const conns = red?.conexiones || [];
  const EC = { comprometido: '#dc2626', sospechoso: '#d97706', limpio: '#16a34a', maliciosa: '#dc2626', sospechosa: '#d97706', legitima: '#16a34a' };

  return (
    <div style={{ display: 'flex', height: '100%', fontSize: 12, background: '#fff' }}>
      {/* host list */}
      <div style={{ width: 260, borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', background: '#f8fafc' }}>
          Hosts en red ({hosts.length})
        </div>
        {hosts.map(h => (
          <div key={h.id} onClick={() => setSel(h)} style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: sel?.id === h.id ? (EC[h.estado] || '#4f46e5') + '08' : 'transparent', transition: 'background .12s' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: EC[h.estado] || '#94a3b8', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{h.nombre}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{h.ip}</div>
            </div>
            <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 10, background: (EC[h.estado] || '#94a3b8') + '18', color: EC[h.estado] || '#94a3b8', fontWeight: 700 }}>{h.estado?.toUpperCase()}</span>
          </div>
        ))}
      </div>
      {/* detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {sel ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: EC[sel.estado] || '#94a3b8' }} />
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{sel.nombre}</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: (EC[sel.estado] || '#94a3b8') + '18', color: EC[sel.estado] || '#94a3b8', fontWeight: 700 }}>{sel.estado?.toUpperCase()}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 14 }}>
              {[['IP', sel.ip], ['Tipo', sel.tipo], ['OS', sel.os]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 10, color: '#94a3b8' }}>{k}</div><div style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8', fontFamily: 'monospace' }}>{v}</div></div>
              ))}
            </div>
            {sel.servicios?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6 }}>SERVICIOS:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {sel.servicios.map(s => <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#f1f5f9', color: '#0f172a', fontFamily: 'monospace', border: '1px solid #e2e8f0' }}>{s}</span>)}
                </div>
              </div>
            )}
            {sel.notas && <div style={{ padding: 10, background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', fontSize: 11, color: '#92400e', lineHeight: 1.5, marginBottom: 14 }}>⚠ {sel.notas}</div>}
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Conexiones</div>
            {conns.filter(c => c.origen === sel.id || c.destino === sel.id).map((c, i) => {
              const other = c.origen === sel.id ? hosts.find(h => h.id === c.destino) : hosts.find(h => h.id === c.origen);
              return (
                <div key={i} style={{ padding: '8px 12px', borderRadius: 6, marginBottom: 4, background: '#f8fafc', border: `1px solid ${EC[c.estado] || '#e2e8f0'}44`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: EC[c.estado] || '#94a3b8', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#0f172a' }}>{c.origen === sel.id ? '→' : '←'} {other?.nombre || 'externo'} ({other?.ip || '?'})</span>
                  <span style={{ fontSize: 10, color: '#64748b' }}>{c.protocolo}:{c.puerto}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: EC[c.estado] || '#94a3b8' }}>{c.estado?.toUpperCase()}</span>
                </div>
              );
            })}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#94a3b8' }}>
            <div style={{ fontSize: 40 }}>🌐</div>
            <div style={{ fontSize: 13 }}>Selecciona un host para ver detalles y conexiones</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── APP: INCIDENT REPORT ───────────────────────────────────────────────────── */
function ReportApp({ preguntas, onSubmit, submitting, queriesCount }) {
  const [resp, setResp] = useState({});
  const [inf, setInf] = useState('');
  const [tab, setTab] = useState('preguntas');
  const acc = '#0078d4';
  const respondidas = preguntas.filter(p => resp[String(p.id)]?.trim()).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontSize: 13, fontFamily: 'Segoe UI, sans-serif' }}>
      {/* tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', flexShrink: 0, background: '#f8fafc' }}>
        {['preguntas', 'informe'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === t ? '#fff' : 'transparent', color: tab === t ? acc : '#64748b', borderBottom: tab === t ? `2px solid ${acc}` : '2px solid transparent', transition: 'all .15s' }}>
            {t === 'preguntas' ? `📋 Preguntas (${respondidas}/${preguntas.length})` : '📝 Informe libre'}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 'preguntas' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {preguntas.map(p => (
              <div key={p.id} style={{ border: `1px solid ${resp[String(p.id)] ? acc + '44' : '#e2e8f0'}`, borderRadius: 10, padding: '14px 16px', background: '#fafafa', transition: 'border-color .2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: resp[String(p.id)] ? '#10b98122' : '#f1f5f9', border: `1px solid ${resp[String(p.id)] ? '#10b981' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: resp[String(p.id)] ? '#10b981' : '#94a3b8' }}>
                    {resp[String(p.id)] ? '✓' : p.id}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: acc }}>{p.categoria}</span>
                </div>
                {/* PREGUNTA SIEMPRE VISIBLE */}
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.6, marginBottom: 10 }}>{p.pregunta}</div>
                <input value={resp[String(p.id)] || ''} onChange={e => setResp(r => ({ ...r, [String(p.id)]: e.target.value }))}
                  placeholder={p.placeholder || 'Escribe tu respuesta aquí...'}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: `1px solid #e2e8f0`, background: '#fff', color: '#0f172a', fontSize: 12, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color .2s' }}
                  onFocus={e => e.target.style.borderColor = acc} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                {/* PISTA SIEMPRE VISIBLE */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: 8, padding: '6px 10px', borderRadius: 6, background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <span>💡</span>
                  <span style={{ fontSize: 11, color: '#92400e', lineHeight: 1.5 }}>{p.pista}</span>
                </div>
              </div>
            ))}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 6 }}><span>Progreso</span><span>{respondidas}/{preguntas.length}</span></div>
              <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3 }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${preguntas.length > 0 ? (respondidas / preguntas.length) * 100 : 0}%`, background: `linear-gradient(90deg,${acc},#106ebe)`, transition: 'width .4s' }} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.7 }}>Describe la cadena completa del ataque: vector de entrada, técnicas usadas, sistemas afectados, movimiento lateral, persistencia y remediación. Un buen informe suma hasta +10 puntos extra.</div>
            <textarea value={inf} onChange={e => setInf(e.target.value)} placeholder="Escribe aquí tu análisis técnico completo del incidente..."
              style={{ minHeight: 220, padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontSize: 12, lineHeight: 1.7, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = acc} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>
        )}
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', flexShrink: 0, background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 11, color: '#64748b' }}>
          <span>Herramientas usadas: <strong style={{ color: acc }}>{queriesCount}</strong></span>
          <span>Preguntas: <strong style={{ color: respondidas === preguntas.length ? '#10b981' : acc }}>{respondidas}/{preguntas.length}</strong></span>
        </div>
        <button onClick={() => onSubmit({ respuestas: resp, informe_libre: inf })} disabled={submitting || respondidas === 0}
          style={{ width: '100%', padding: '13px 0', borderRadius: 8, border: 'none', background: submitting || respondidas === 0 ? '#e2e8f0' : 'linear-gradient(135deg,#10b981,#059669)', color: submitting || respondidas === 0 ? '#94a3b8' : '#fff', fontSize: 13, fontWeight: 700, cursor: submitting || respondidas === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {submitting ? '⏳ Evaluando con IA...' : '📤 Enviar análisis para evaluación'}
        </button>
      </div>
    </div>
  );
}

/* ─── pantalla resultado ─────────────────────────────────────────────────────── */
function Resultados({ resultado, escenario, onNew, onDash }) {
  const [tab, setTab] = useState('resumen');
  const pct = Math.round(resultado.puntuacion_normalizada || 0);
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const SL = { siem_queries: 'SIEM & Queries', forense_digital: 'Forense Digital', threat_hunting: 'Threat Hunting', analisis_logs: 'Análisis de Logs', inteligencia_amenazas: 'Intel. Amenazas' };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Segoe UI, Inter, sans-serif', padding: 32, color: '#0f172a' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,.06)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Laboratorio completado</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.5px' }}>{escenario?.titulo || 'Lab SOC'}</div>
          </div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 52, fontWeight: 900, color, lineHeight: 1 }}>{pct}</div><div style={{ fontSize: 12, color: '#64748b' }}>/100 puntos</div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[['⚡ XP Ganada', `+${resultado.xp_ganada || 0}`, '#4f46e5'], ['🔗 Cadena', `${resultado.cadena_ataque_descubierta || 0}%`, color], ['🔍 Queries', `+${resultado.puntuacion_queries || 0} pts`, '#10b981'], ['📋 Informe', `+${resultado.puntuacion_informe || 0} pts`, '#f59e0b']].map(([l, v, c]) => (
            <div key={l} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {['resumen', 'preguntas', 'skills', 'solucion'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, border: `1px solid ${tab === t ? '#0078d4' : '#e2e8f0'}`, background: tab === t ? '#0078d408' : '#fff', color: tab === t ? '#0078d4' : '#64748b' }}>
              {t === 'resumen' ? '📊 Resumen' : t === 'preguntas' ? '❓ Preguntas' : t === 'skills' ? '📈 Skills' : '🔓 Solución'}
            </button>
          ))}
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, marginBottom: 20 }}>
          {tab === 'resumen' && <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>{resultado.feedback_general}</p>}
          {tab === 'preguntas' && (resultado.feedback_preguntas || []).map(fp => (
            <div key={fp.id} style={{ padding: '14px 16px', borderRadius: 10, background: fp.correcto ? '#f0fdf4' : '#fef2f2', border: `1px solid ${fp.correcto ? '#bbf7d0' : '#fecaca'}`, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{fp.correcto ? '✅' : '❌'}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Pregunta {fp.id}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: fp.correcto ? '#bbf7d0' : '#fecaca', color: fp.correcto ? '#15803d' : '#dc2626' }}>{fp.puntos}/10 pts</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Respuesta correcta: <span style={{ color: '#1d4ed8', fontWeight: 600, fontFamily: 'monospace' }}>{fp.respuesta_correcta}</span></div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{fp.feedback}</div>
            </div>
          ))}
          {tab === 'skills' && Object.entries(resultado.skills_mejoradas || {}).map(([sk, d]) => {
            const delta = typeof d === 'object' ? d.delta : d;
            return (
              <div key={sk} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{ width: 160, fontSize: 13, color: '#374151', fontWeight: 600 }}>{SL[sk] || sk}</div>
                <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4 }}>
                  <div style={{ height: '100%', borderRadius: 4, width: `${(delta / 0.3) * 100}%`, background: delta >= 0.2 ? '#10b981' : delta > 0 ? '#f59e0b' : '#e2e8f0', transition: 'width .7s' }} />
                </div>
                <div style={{ width: 52, fontSize: 13, color: delta > 0 ? '#10b981' : '#94a3b8', textAlign: 'right', fontWeight: 700 }}>{delta > 0 ? `+${delta.toFixed(2)}` : '—'}</div>
              </div>
            );
          })}
          {tab === 'solucion' && resultado.solucion_completa && (
            <div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>{resultado.solucion_completa.resumen}</p>
              {(resultado.solucion_completa.cadena_ataque || []).map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: '#0078d408', border: '1px solid #0078d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#0078d4' }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, paddingTop: 3 }}>{p}</div>
                </div>
              ))}
              {resultado.solucion_completa.tecnicas_mitre?.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>TTPs MITRE ATT&CK:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {resultado.solucion_completa.tecnicas_mitre.map(t => <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#ede9fe', color: '#7c3aed', fontWeight: 700 }}>{t}</span>)}
                  </div>
                </div>
              )}
              {resultado.solucion_completa.lecciones && (
                <div style={{ marginTop: 16, padding: 14, background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#92400e', marginBottom: 4 }}>💡 LECCIONES APRENDIDAS</div>
                  <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.7 }}>{resultado.solucion_completa.lecciones}</div>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onNew} style={{ flex: 1, padding: '14px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0078d4,#106ebe)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>🔬 Nuevo laboratorio</button>
          <button onClick={onDash} style={{ flex: 1, padding: '14px 0', borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', color: '#374151', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>← Dashboard</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────────────────── */
const APPS_DEF = [
  { id: 'siem',    label: 'SIEM Alerts',     icon: '🖥️', defaultX: 40,  defaultY: 20,  defaultW: 720, defaultH: 500 },
  { id: 'logs',    label: 'Log Explorer',    icon: '📋', defaultX: 100, defaultY: 60,  defaultW: 680, defaultH: 480 },
  { id: 'network', label: 'Network Monitor', icon: '🌐', defaultX: 160, defaultY: 100, defaultW: 660, defaultH: 460 },
  { id: 'terminal',label: 'Terminal',        icon: '💻', defaultX: 220, defaultY: 140, defaultW: 640, defaultH: 400 },
  { id: 'report',  label: 'Incident Report', icon: '📝', defaultX: 280, defaultY: 60,  defaultW: 580, defaultH: 560 },
];

export default function LabPage() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('intro');      // intro | boot | lab | resultado
  const [escenario, setEscenario] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [queriesLog, setQueriesLog] = useState([]);
  const [showOB, setShowOB] = useState(false);
  const [tickTime, setTickTime] = useState(clock());
  const [focused, setFocused] = useState(null);

  /* windows state */
  const initWins = () => APPS_DEF.reduce((a, app) => ({ ...a, [app.id]: { open: false, minimized: false } }), {});
  const [wins, setWins] = useState(initWins);

  /* clock tick */
  useEffect(() => { const iv = setInterval(() => setTickTime(clock()), 10000); return () => clearInterval(iv); }, []);

  /* onboarding */
  useEffect(() => { if (!localStorage.getItem(OB_KEY)) setShowOB(true); }, []);

  const onQuery = useCallback(q => setQueriesLog(p => p.includes(q) ? p : [...p, q]), []);

  const openApp  = id => { setWins(w => ({ ...w, [id]: { open: true, minimized: false } })); setFocused(id); onQuery(`OPEN:${id}`); };
  const closeApp = id => setWins(w => ({ ...w, [id]: { ...w[id], open: false } }));
  const minApp   = id => setWins(w => ({ ...w, [id]: { ...w[id], minimized: true } }));
  const taskClick = id => {
    const w = wins[id];
    if (!w?.open) return;
    if (w.minimized) { setWins(ww => ({ ...ww, [id]: { ...ww[id], minimized: false } })); setFocused(id); }
    else if (focused === id) minApp(id);
    else setFocused(id);
  };

  const iniciarLab = async () => {
    setLoading(true); setError('');
    try {
      const d = await api('/lab/generar', { method: 'POST' });
      setEscenario(d); setQueriesLog([]); setFase('boot');
    } catch (e) { setError(e.message || 'Error generando el laboratorio'); }
    finally { setLoading(false); }
  };

  const enviar = async ({ respuestas, informe_libre }) => {
    setSubmitting(true); setError('');
    try {
      const d = await api('/lab/evaluar', { method: 'POST', body: JSON.stringify({ lab_id: escenario.lab_id, respuestas, informe_libre, queries_usadas: queriesLog }) });
      setResultado(d); setFase('resultado');
    } catch (e) { setError(e.message || 'Error evaluando'); }
    finally { setSubmitting(false); }
  };

  const nuevoLab = () => { setEscenario(null); setResultado(null); setFase('intro'); setWins(initWins()); setQueriesLog([]); };

  /* ── intro ── */
  if (fase === 'intro') return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Segoe UI, Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
      {showOB && <Onboarding onDone={() => { localStorage.setItem(OB_KEY, '1'); setShowOB(false); }} />}
      <div style={{ maxWidth: 560, width: '90%', animation: 'fadeUp .4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🔬</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-.8px' }}>Laboratorio SOC</h1>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, margin: 0 }}>Accede a una máquina comprometida. Investiga con las herramientas del SOC. Redacta tu informe forense.</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', boxShadow: '0 4px 20px rgba(0,0,0,.06)', border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            {[['🖥️', 'SIEM Alerts', 'Alertas con detalle técnico'], ['📋', 'Log Explorer', 'Logs filtrables del sistema'], ['🌐', 'Network Monitor', 'Hosts y conexiones activas'], ['💻', 'Terminal Windows', 'Comandos reales para investigar'], ['📝', 'Incident Report', 'Preguntas + informe evaluado por IA'], ['⏱', 'Sin límite de tiempo', 'Investiga todo lo que necesites']].map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                <div><div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{title}</div><div style={{ fontSize: 11, color: '#64748b' }}>{desc}</div></div>
              </div>
            ))}
          </div>
          <button onClick={iniciarLab} disabled={loading} style={{ width: '100%', padding: '15px 0', borderRadius: 10, border: 'none', background: loading ? '#e2e8f0' : 'linear-gradient(135deg,#0078d4,#106ebe)', color: loading ? '#94a3b8' : '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: loading ? 'none' : '0 4px 14px rgba(0,120,212,.35)' }}>
            {loading ? '⏳ Generando escenario con IA...' : '⚡ Iniciar Laboratorio'}
          </button>
          {error && <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 12, color: '#dc2626' }}>⚠ {error}</div>}
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>El escenario se adapta a tu arena · Solo XP y habilidades, sin copas</div>
      </div>
    </div>
  );

  /* ── boot ── */
  if (fase === 'boot') return <BootScreen onDone={() => setFase('lab')} />;

  /* ── resultado ── */
  if (fase === 'resultado') return <Resultados resultado={resultado} escenario={escenario} onNew={nuevoLab} onDash={() => navigate('/dashboard')} />;

  /* ── lab (escritorio Windows) ── */
  const taskApps = APPS_DEF.filter(a => wins[a.id]?.open);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'Segoe UI, sans-serif', userSelect: 'none' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* ── ESCRITORIO ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 40px)',
        background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 40%, #2563eb 70%, #1e40af 100%)',
        overflow: 'hidden',
      }}>
        {/* wallpaper pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: .06, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        {/* objetivo banner */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '6px 16px', background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 10, zIndex: 5, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', letterSpacing: '.06em' }}>🎯 OBJETIVO:</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.8)' }}>{escenario?.objetivo || escenario?.descripcion}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>🔍 <span style={{ color: '#7dd3fc' }}>{queriesLog.length}</span> queries</span>
            <button onClick={() => navigate('/dashboard')} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 5, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.7)', cursor: 'pointer' }}>← Dashboard</button>
          </div>
        </div>

        {/* desktop icons — columna izq */}
        <div style={{ position: 'absolute', top: 40, left: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 4 }}>
          {APPS_DEF.map(a => <DesktopIcon key={a.id} icon={a.icon} label={a.label} onClick={() => openApp(a.id)} />)}
        </div>

        {/* VENTANAS */}
        {APPS_DEF.map(app => wins[app.id]?.open && !wins[app.id]?.minimized ? (
          <AppWindow key={app.id} id={app.id} title={app.label} icon={app.icon}
            onClose={() => closeApp(app.id)} onMinimize={() => minApp(app.id)}
            onFocus={() => setFocused(app.id)} focused={focused === app.id}
            defaultX={app.defaultX} defaultY={app.defaultY + 30}
            defaultW={app.defaultW} defaultH={app.defaultH}>
            {app.id === 'siem'     && <SIEMApp alertas={escenario?.alertas_siem || []} onQuery={onQuery} />}
            {app.id === 'logs'     && <LogApp logs={escenario?.logs || []} onQuery={onQuery} />}
            {app.id === 'network'  && <NetworkApp red={escenario?.red} />}
            {app.id === 'terminal' && <TerminalApp escenario={escenario} onQuery={onQuery} />}
            {app.id === 'report'   && <ReportApp preguntas={escenario?.preguntas || []} onSubmit={enviar} submitting={submitting} queriesCount={queriesLog.length} />}
          </AppWindow>
        ) : null)}

        {error && (
          <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 20px', color: '#dc2626', fontSize: 12, zIndex: 9999 }}>{error}</div>
        )}
      </div>

      {/* ── TASKBAR ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 40,
        background: 'rgba(10,14,26,.97)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,.08)',
        display: 'flex', alignItems: 'center', padding: '0 8px', gap: 4,
        zIndex: 200,
      }}>
        {/* start */}
        <div style={{ width: 36, height: 32, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer', flexShrink: 0 }}>🪟</div>
        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,.12)', margin: '0 4px' }} />
        {/* task buttons */}
        {taskApps.map(a => (
          <TaskBtn key={a.id} icon={a.icon} label={a.label}
            active={focused === a.id && !wins[a.id]?.minimized}
            minimized={wins[a.id]?.minimized}
            onClick={() => taskClick(a.id)} />
        ))}
        {/* right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, paddingRight: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontFamily: 'Segoe UI' }}>{tickTime}</span>
        </div>
      </div>
    </div>
  );
}