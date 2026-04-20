import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API       = 'https://socblast-production.up.railway.app/api';
const DRAFT_KEY = 'socblast_lab_draft';

/* ─── API ─────────────────────────────────────────────────────────────────── */
const apiFetch = async (path, token, opts = {}) => {
  if (!token) throw new Error('Sin sesión activa');
  const r = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
  return r.json();
};

const clock = () => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

/* ─── HOOK ARRASTRE NATIVO (sin react-draggable) ─────────────────────────── */
function useDrag(initialPos) {
  const [pos, setPos] = useState(initialPos);
  const dragging = useRef(false);
  const offset   = useRef({ x: 0, y: 0 });
  const posRef   = useRef(pos);
  posRef.current = pos;

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    dragging.current = true;
    offset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
    e.preventDefault();

    const onMove = (ev) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(ev.clientX - offset.current.x, window.innerWidth - 120)),
        y: Math.max(0, Math.min(ev.clientY - offset.current.y, window.innerHeight - 80)),
      });
    };
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  return [pos, onMouseDown, setPos];
}

/* ─── VENTANA ─────────────────────────────────────────────────────────────── */
let ZI = 100;

function Win({ id, title, icon, children, onClose, onFocus, focused, initX, initY, initW, initH }) {
  const [pos, dragStart] = useDrag({ x: initX, y: initY });
  const [size, setSize]  = useState({ w: initW || 700, h: initH || 480 });
  const [max, setMax]    = useState(false);
  const [zi, setZi]      = useState(ZI++);
  const resRef           = useRef(null);

  const bringFront = () => { const z = ZI++; setZi(z); onFocus(id); };

  const startResize = (e) => {
    e.stopPropagation(); e.preventDefault();
    resRef.current = { sx: e.clientX, sy: e.clientY, sw: size.w, sh: size.h };
    const mv = (ev) => {
      if (!resRef.current) return;
      setSize({
        w: Math.max(340, resRef.current.sw + ev.clientX - resRef.current.sx),
        h: Math.max(260, resRef.current.sh + ev.clientY - resRef.current.sy),
      });
    };
    const up = () => { resRef.current = null; window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  };

  const titleDrag = (e) => { bringFront(); if (!max) dragStart(e); };

  return (
    <div
      onMouseDown={bringFront}
      style={{
        position: 'fixed',
        left: max ? 0 : pos.x, top: max ? 0 : pos.y,
        width: max ? '100vw' : size.w, height: max ? 'calc(100vh - 40px)' : size.h,
        zIndex: zi,
        display: 'flex', flexDirection: 'column',
        background: '#fff', borderRadius: max ? 0 : 8,
        border: focused ? '1.5px solid #0078d4' : '1px solid rgba(255,255,255,.15)',
        boxShadow: focused ? '0 24px 64px rgba(0,0,0,.6)' : '0 4px 24px rgba(0,0,0,.35)',
        overflow: 'hidden',
        fontFamily: "'Segoe UI', Inter, sans-serif",
        userSelect: 'none',
      }}
    >
      {/* barra de título */}
      <div
        onMouseDown={titleDrag}
        style={{
          height: 34, background: focused ? '#1a2744' : '#2d3a52',
          display: 'flex', alignItems: 'center', padding: '0 0 0 12px',
          cursor: 'move', flexShrink: 0, gap: 8,
        }}
      >
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 12, color: '#e2e8f0', fontWeight: 600, userSelect: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        <WinBtn label="─" onClick={(e) => { e.stopPropagation(); onClose(id, 'min'); }} />
        <WinBtn label={max ? '❐' : '□'} onClick={(e) => { e.stopPropagation(); setMax(m => !m); }} />
        <WinBtn label="✕" red onClick={(e) => { e.stopPropagation(); onClose(id, 'close'); }} />
      </div>

      {/* contenido */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {/* resize */}
      {!max && (
        <div
          onMouseDown={startResize}
          style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, cursor: 'nwse-resize', zIndex: 10 }}
        >
          <svg width="16" height="16"><path d="M3 13L13 3M7 13L13 7M11 13L13 11" stroke="rgba(148,163,184,.5)" strokeWidth="1.5" /></svg>
        </div>
      )}
    </div>
  );
}

function WinBtn({ label, onClick, red }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: 46, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: h ? (red ? '#c42b1c' : 'rgba(255,255,255,.15)') : 'transparent', cursor: 'pointer', color: '#e2e8f0', fontSize: red ? 11 : 13, transition: 'background .1s' }}
    >
      {label}
    </div>
  );
}

/* ─── SIEM ────────────────────────────────────────────────────────────────── */
function SIEMApp({ alertas, onQuery }) {
  const [sel, setSel] = useState(null);
  const [flt, setFlt] = useState('TODAS');
  const [view, setView] = useState('lista');
  const SEV = { CRITICA: '#dc2626', ALTA: '#ea580c', MEDIA: '#d97706', BAJA: '#16a34a' };
  const filtered = flt === 'TODAS' ? alertas : alertas.filter(a => a.severidad === flt);
  const sorted = [...alertas].sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));

  return (
    <div style={{ display: 'flex', height: '100%', fontSize: 12 }}>
      {/* sidebar */}
      <div style={{ width: 320, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {/* filtros */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 4, flexWrap: 'wrap', background: '#f8fafc', flexShrink: 0 }}>
          {['TODAS', 'CRITICA', 'ALTA', 'MEDIA', 'BAJA'].map(s => (
            <button key={s} onClick={() => setFlt(s)}
              style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, border: `1px solid ${s === 'TODAS' ? '#e2e8f0' : SEV[s] || '#e2e8f0'}`, background: flt === s ? (SEV[s] || '#4f46e5') + '22' : 'transparent', color: flt === s ? (SEV[s] || '#4f46e5') : '#64748b' }}>
              {s}
            </button>
          ))}
          <button onClick={() => setView(v => v === 'lista' ? 'timeline' : 'lista')}
            style={{ marginLeft: 'auto', fontSize: 10, padding: '3px 8px', borderRadius: 4, cursor: 'pointer', border: '1px solid #e2e8f0', background: view === 'timeline' ? '#0078d422' : 'transparent', color: view === 'timeline' ? '#0078d4' : '#64748b', fontWeight: 600 }}>
            {view === 'lista' ? '⏱ Timeline' : '≡ Lista'}
          </button>
        </div>

        {/* lista / timeline */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {view === 'lista' ? filtered.map(a => (
            <div key={a.id} onClick={() => { setSel(a); onQuery(`SIEM:${a.id}`); }}
              style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', borderLeft: `3px solid ${sel?.id === a.id ? SEV[a.severidad] || '#4f46e5' : 'transparent'}`, background: sel?.id === a.id ? (SEV[a.severidad] || '#4f46e5') + '08' : 'transparent' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 3, background: (SEV[a.severidad] || '#666') + '18', color: SEV[a.severidad] || '#666', border: `1px solid ${SEV[a.severidad] || '#666'}30` }}>{a.severidad}</span>
                <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 'auto' }}>{a.timestamp?.slice(11, 19)}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', lineHeight: 1.3, marginBottom: 2 }}>{a.titulo}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{a.sistema} · {a.id}</div>
            </div>
          )) : (
            <div style={{ padding: '10px 8px' }}>
              {sorted.map((a, i) => (
                <div key={a.id} onClick={() => { setSel(a); onQuery(`SIEM:${a.id}`); }} style={{ display: 'flex', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: SEV[a.severidad] || '#64748b', marginTop: 2 }} />
                    {i < sorted.length - 1 && <div style={{ width: 2, flex: 1, background: '#e2e8f0', margin: '2px 0' }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 8 }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', marginBottom: 2 }}>{a.timestamp?.slice(11, 19)}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: sel?.id === a.id ? '#0078d4' : '#0f172a' }}>{a.titulo}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{a.sistema}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filtered.length === 0 && <div style={{ padding: 20, color: '#94a3b8', textAlign: 'center' }}>Sin alertas para este filtro</div>}
        </div>
        <div style={{ padding: '4px 10px', borderTop: '1px solid #e2e8f0', fontSize: 10, color: '#94a3b8', background: '#f8fafc', flexShrink: 0 }}>
          {filtered.length} alertas · {alertas.filter(a => a.severidad === 'CRITICA').length} críticas
        </div>
      </div>

      {/* detalle */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: '#fff' }}>
        {sel ? (
          <>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 4, background: (SEV[sel.severidad] || '#666') + '18', color: SEV[sel.severidad] || '#666', border: `1px solid ${SEV[sel.severidad] || '#666'}30` }}>{sel.severidad}</span>
              <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{sel.timestamp}</span>
              <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 'auto', fontFamily: 'monospace' }}>{sel.id}</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8, lineHeight: 1.3 }}>{sel.titulo}</h3>
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>{sel.descripcion}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', background: '#f8fafc', borderRadius: 8, padding: 14 }}>
              {[['Sistema', sel.sistema], ['Categoría', sel.categoria], ['IP Origen', sel.ip_origen], ['IP Destino', sel.ip_destino], ['Usuario', sel.usuario], ['Proceso', sel.proceso], ['Regla SIEM', sel.regla_disparada]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>{k}</div><div style={{ fontSize: 11, fontWeight: 600, color: '#1d4ed8', fontFamily: 'monospace', wordBreak: 'break-all' }}>{v}</div></div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#94a3b8' }}>
            <div style={{ fontSize: 48 }}>🖥️</div>
            <div style={{ fontSize: 13 }}>Haz clic en una alerta para ver el detalle</div>
            <div style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', maxWidth: 220 }}>Filtra por severidad o cambia a vista Timeline para ver la cronología</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── TERMINAL ────────────────────────────────────────────────────────────── */
function TerminalApp({ escenario, onQuery }) {
  const [hist, setHist] = useState([{ t: 'sys', v: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n\nEscribe "help" para ver todos los comandos.' }]);
  const [inp, setInp]   = useState('');
  const [cmds, setCmds] = useState([]);
  const [ci, setCi]     = useState(-1);
  const bot    = useRef(null);
  const inpRef = useRef(null);

  const iocs    = escenario?.iocs || {};
  const logs    = escenario?.logs || [];
  const hosts   = escenario?.red?.hosts || [];
  const conns   = escenario?.red?.conexiones || [];
  const alertas = escenario?.alertas_siem || [];

  const run = useCallback((raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    onQuery(`CMD:${cmd}`);
    setCmds(p => [cmd, ...p]);
    setCi(-1);

    const lc = cmd.toLowerCase();
    let out = '';

    if (lc === 'cls') { setHist([]); setInp(''); return; }
    if (lc === 'history') { out = cmds.length ? cmds.map((c, i) => `  ${(cmds.length - i).toString().padStart(3)}  ${c}`).join('\n') : '(historial vacío)'; }
    else if (lc === 'help') {
      out = `╔══════════════════════════════════════════════════════════════╗
║              COMANDOS DISPONIBLES — SOC Terminal             ║
╠══════════════════════════════════════════════════════════════╣
║  SISTEMA                                                     ║
║    whoami            usuario actual                          ║
║    hostname          nombre del equipo                       ║
║    ipconfig          configuración de red                    ║
║    ipconfig /all     detalles completos                      ║
║    systeminfo        información del sistema                 ║
║                                                              ║
║  PROCESOS Y RED                                              ║
║    tasklist          procesos en ejecución                   ║
║    tasklist /svc     procesos con servicios                  ║
║    netstat -an       todas las conexiones                    ║
║    netstat -b        conexiones con proceso                  ║
║    ping <ip>         comprobar conectividad                  ║
║    nslookup <dom>    resolver DNS                            ║
║                                                              ║
║  ARCHIVOS Y REGISTRO                                         ║
║    dir               listar directorio                       ║
║    dir /s            listar recursivo                        ║
║    type <archivo>    mostrar contenido                       ║
║    find <texto>      buscar en logs                          ║
║    grep <patron>     buscar patrón en logs                   ║
║    reg query         consultar registro Windows              ║
║    wmic process      info procesos (WMIC)                    ║
║                                                              ║
║  INVESTIGACIÓN                                               ║
║    ioc               IOCs del escenario                      ║
║    hosts             hosts de la red                         ║
║    alerts            resumen alertas SIEM                    ║
║    connections       conexiones activas                      ║
║    history           historial de comandos                   ║
║    cls               limpiar pantalla                        ║
╚══════════════════════════════════════════════════════════════╝`;
    }
    else if (lc === 'whoami')   out = 'CORP\\analyst';
    else if (lc === 'hostname') out = 'SOC-WORKSTATION-01';
    else if (lc === 'ipconfig') out = `Adaptador Ethernet:\n   IPv4: 10.0.0.50\n   Máscara: 255.255.255.0\n   Gateway: 10.0.0.1\n   DNS: 10.0.0.5`;
    else if (lc === 'ipconfig /all') out = `Host: SOC-WORKSTATION-01\nDominio: corp.local\nMAC: 00-0C-29-AB-CD-EF\nIPv4: 10.0.0.50\nMáscara: 255.255.255.0\nGateway: 10.0.0.1\nDNS: 10.0.0.5`;
    else if (lc === 'systeminfo') out = `Hostname:    SOC-WORKSTATION-01\nOS:          Windows 10 Pro 19045\nDominio:     CORP\nDC:          CORP-DC01\nZona horaria: UTC+01:00 Madrid`;
    else if (lc === 'tasklist') {
      const procs = iocs.procesos_sospechosos || [];
      const base = ['Imagen                   PID  Sesión       Mem', '======================== ==== ============ ========', 'System                   4    Services     1.580K', 'svchost.exe              892  Services     12.340K', 'explorer.exe             1456 Console      48.200K', 'splunk-admon.exe         2100 Services     18.320K'];
      procs.forEach((p, i) => base.push(`${p.slice(0, 24).padEnd(24)} ${(1200 + i).toString().padEnd(4)} Console      24.${300 + i}K  ← SOSPECHOSO`));
      out = base.join('\n');
    }
    else if (lc === 'tasklist /svc') {
      const procs = iocs.procesos_sospechosos || [];
      const base = ['Imagen                   PID   Servicios', '======================== ===== =========', 'System                   4     N/A', 'svchost.exe              892   DcomLaunch, PlugPlay', 'splunk-admon.exe         2100  SplunkForwarder'];
      procs.forEach((p, i) => base.push(`${p.slice(0, 24).padEnd(24)} ${(1200 + i).toString().padEnd(5)} ← SIN SERVICIO REGISTRADO`));
      out = base.join('\n');
    }
    else if (lc === 'netstat -an') {
      const lines = ['Conexiones activas\n', '  Proto  Local                  Externo                Estado', '  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING', '  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING', '  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING'];
      conns.forEach(c => { const f = hosts.find(h => h.id === c.origen); const t = hosts.find(h => h.id === c.destino); lines.push(`  TCP    ${(f?.ip || '10.0.0.x') + ':' + c.puerto}`.padEnd(27) + `${(t?.ip || '0.0.0.0') + ':' + c.puerto}`.padEnd(23) + (c.estado === 'maliciosa' ? 'ESTABLISHED ← SOSPECHOSO' : 'ESTABLISHED')); });
      out = lines.join('\n');
    }
    else if (lc === 'netstat -b') {
      const lines = ['Conexiones activas (con proceso)\n']; const procs = iocs.procesos_sospechosos || [];
      conns.forEach((c, i) => { const t = hosts.find(h => h.id === c.destino); lines.push(`  TCP    10.0.0.50:${49000 + i}     ${t?.ip || '0.0.0.0'}:${c.puerto}    ${c.estado === 'maliciosa' ? 'ESTABLISHED ← SOSPECHOSO' : 'ESTABLISHED'}`); lines.push(`  [${procs[i] || 'svchost.exe'}]`); });
      out = lines.join('\n');
    }
    else if (lc === 'connections') {
      out = conns.length ? ['CONEXIONES ACTIVAS:', '─'.repeat(60), ...conns.map(c => { const f = hosts.find(h => h.id === c.origen); const t = hosts.find(h => h.id === c.destino); return `${f?.nombre || 'externo'} (${f?.ip || '?'}) → ${t?.nombre || 'externo'} (${t?.ip || '?'}) :${c.puerto} ${c.protocolo} [${c.estado?.toUpperCase()}]`; })].join('\n') : '(sin conexiones registradas)';
    }
    else if (lc === 'dir') {
      const files = logs.slice(0, 6).map(l => `${l.timestamp?.slice(0, 10).replace(/-/g, '/')}  ${l.sistema}.log`);
      out = `Directorio de C:\\Users\\analyst\n\n${['<DIR>  Desktop', '<DIR>  Downloads', '<DIR>  logs', ...files].join('\n')}\n\n${logs.length} archivos de log`;
    }
    else if (lc === 'dir /s') out = logs.map(l => `C:\\Users\\analyst\\logs\\${l.sistema}.log`).join('\n') || '(vacío)';
    else if (lc === 'reg query') {
      const keys = iocs.regkeys_persistencia || [];
      out = keys.length ? keys.map(k => `${k}\n    REG_SZ    C:\\Windows\\Temp\\svc_update.exe ← SOSPECHOSO`).join('\n\n') : 'Sin entradas sospechosas.\nUsa: reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run';
    }
    else if (lc === 'wmic process') {
      const procs = iocs.procesos_sospechosos || [];
      out = ['Caption                  ProcessId  CommandLine', 'System                   4          N/A', 'svchost.exe              892        C:\\Windows\\System32\\svchost.exe', 'explorer.exe             1456       C:\\Windows\\explorer.exe', ...procs.map((p, i) => `${p.slice(0, 24).padEnd(24)} ${(1200 + i).toString().padEnd(10)} C:\\Windows\\Temp\\${p} ← SOSPECHOSO`)].join('\n');
    }
    else if (lc === 'ioc') {
      const parts = ['═══ IOCs del escenario ═══'];
      if (iocs.ips_maliciosas?.length)       parts.push(`IPs maliciosas:\n  ${iocs.ips_maliciosas.join('\n  ')}`);
      if (iocs.hashes_maliciosos?.length)    parts.push(`Hashes:\n  ${iocs.hashes_maliciosos.join('\n  ')}`);
      if (iocs.dominios_maliciosos?.length)  parts.push(`Dominios C2:\n  ${iocs.dominios_maliciosos.join('\n  ')}`);
      if (iocs.procesos_sospechosos?.length) parts.push(`Procesos sospechosos:\n  ${iocs.procesos_sospechosos.join('\n  ')}`);
      if (iocs.usuarios_comprometidos?.length) parts.push(`Usuarios comprometidos:\n  ${iocs.usuarios_comprometidos.join('\n  ')}`);
      if (iocs.regkeys_persistencia?.length) parts.push(`Registry persistence:\n  ${iocs.regkeys_persistencia.join('\n  ')}`);
      out = parts.join('\n\n');
    }
    else if (lc === 'hosts') {
      out = hosts.length
        ? ['HOST                 IP               ESTADO        TIPO', '='.repeat(65), ...hosts.map(h => `${h.nombre.padEnd(20)} ${h.ip.padEnd(15)}  ${(h.estado || '').toUpperCase().padEnd(12)} ${h.tipo}`)].join('\n')
        : '(sin hosts)';
    }
    else if (lc === 'alerts') {
      out = alertas.length
        ? alertas.map(a => `[${(a.severidad || '').padEnd(8)}] ${a.timestamp?.slice(11, 19) || '--:--:--'} ${a.titulo} — ${a.sistema}`).join('\n')
        : '(sin alertas SIEM)';
    }
    else if (lc.startsWith('ping ')) {
      const ip = lc.slice(5).trim();
      const known = hosts.find(h => h.ip === ip || h.nombre.toLowerCase() === ip);
      if (known) out = `Haciendo ping a ${known.nombre} [${known.ip}]:\nRespuesta: tiempo=1ms TTL=128\nRespuesta: tiempo<1ms TTL=128\n\nPaquetes: enviados=3, recibidos=3, perdidos=0`;
      else if (iocs.ips_maliciosas?.includes(ip)) out = `Haciendo ping a ${ip}:\nRespuesta: tiempo=124ms TTL=52  ← IP EXTERNA SOSPECHOSA\n\nPaquetes: enviados=3, recibidos=3, perdidos=0`;
      else out = `Haciendo ping a ${ip}:\nTiempo de espera agotado.\n\nPaquetes: enviados=3, recibidos=0, perdidos=3 (100%)`;
    }
    else if (lc.startsWith('nslookup ')) {
      const dom = lc.slice(9).trim();
      const mal = iocs.dominios_maliciosos?.includes(dom);
      out = `Servidor: CORP-DC01.corp.local\nAddress: 10.0.0.5\n\n${mal ? `Nombre: ${dom}\nAddress: ${iocs.ips_maliciosas?.[0] || '185.220.101.47'}  ← DOMINIO MALICIOSO` : `*** No se puede encontrar ${dom}: Non-existent domain`}`;
    }
    else if (lc.startsWith('find ')) {
      const pat = lc.slice(5).trim().replace(/["']/g, '');
      const m = logs.filter(l => l.mensaje?.toLowerCase().includes(pat.toLowerCase()));
      out = m.length ? `Resultados para "${pat}":\n${'─'.repeat(50)}\n${m.map(l => `[${l.sistema}] ${l.timestamp?.slice(11, 19)} ${l.mensaje}`).join('\n')}\n\n${m.length} resultado(s)` : `find: "${pat}" — sin coincidencias`;
    }
    else if (lc.startsWith('grep ')) {
      const pat = lc.slice(5).trim();
      const m = logs.filter(l => l.mensaje?.toLowerCase().includes(pat.toLowerCase()));
      out = m.length ? m.map(l => `[${l.sistema}] ${l.mensaje}`).join('\n') : `grep: "${pat}" — sin coincidencias`;
    }
    else if (lc.startsWith('type ')) {
      const f = lc.slice(5).trim();
      const l = logs.find(l => l.sistema?.toLowerCase().includes(f) || l.id?.toLowerCase() === f);
      out = l ? `--- ${l.sistema} (${l.fuente}) ---\n${l.timestamp}  EventID:${l.event_id || '?'}  [${l.nivel}]\n\n${l.mensaje}` : `type: No se encuentra: "${f}"`;
    }
    else out = `'${cmd}' no se reconoce. Escribe "help" para ver los comandos.`;

    setHist(h => [...h, { t: 'in', v: `C:\\Users\\analyst>${cmd}` }, { t: 'out', v: out }]);
    setInp('');
  }, [cmds, logs, hosts, conns, alertas, iocs, onQuery]);

  useEffect(() => { bot.current?.scrollIntoView({ behavior: 'smooth' }); }, [hist]);

  return (
    <div onClick={() => inpRef.current?.focus()} style={{ flex: 1, background: '#0c0c0c', color: '#ccc', fontFamily: "'Cascadia Code','Consolas',monospace", fontSize: 12, display: 'flex', flexDirection: 'column', cursor: 'text' }}>
      <div style={{ padding: '5px 10px', background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', fontSize: 11, color: '#555', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Símbolo del sistema — CORP\analyst@SOC-WORKSTATION-01</span>
        <span style={{ fontSize: 10, color: '#333' }}>{hosts.length} hosts · {logs.length} logs</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {hist.map((h, i) => (
          <pre key={i} style={{ margin: 0, marginBottom: 4, whiteSpace: 'pre-wrap', lineHeight: 1.65, color: h.t === 'in' ? '#fff' : h.t === 'sys' ? '#888' : '#ccc', fontFamily: 'inherit' }}>{h.v}</pre>
        ))}
        <div ref={bot} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderTop: '1px solid #2a2a2a', flexShrink: 0 }}>
        <span style={{ color: '#ccc', marginRight: 6, whiteSpace: 'nowrap' }}>C:\Users\analyst&gt;</span>
        <input
          ref={inpRef} autoFocus value={inp}
          onChange={e => setInp(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') run(inp);
            else if (e.key === 'ArrowUp') { const ni = Math.min(ci + 1, cmds.length - 1); setCi(ni); setInp(cmds[ni] || ''); }
            else if (e.key === 'ArrowDown') { const ni = Math.max(ci - 1, -1); setCi(ni); setInp(ni === -1 ? '' : cmds[ni] || ''); }
          }}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 12, fontFamily: 'inherit' }}
          placeholder="escribe un comando..." />
      </div>
    </div>
  );
}

/* ─── LOG EXPLORER ────────────────────────────────────────────────────────── */
function LogApp({ logs, onQuery }) {
  const [search, setSearch] = useState('');
  const [nivel,  setNivel]  = useState('TODOS');
  const [onlyRel, setRel]   = useState(false);
  const [sel, setSel]       = useState(null);
  const NVC = { ERROR: '#dc2626', WARNING: '#d97706', INFO: '#64748b' };

  const filtered = logs.filter(l => {
    if (nivel !== 'TODOS' && l.nivel !== nivel) return false;
    if (onlyRel && !l.relevante) return false;
    if (search && !JSON.stringify(l).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const hs = v => { setSearch(v); if (v.length > 2) onQuery(`SEARCH:${v}`); };

  const hl = (text, term) => {
    if (!term || term.length < 2 || !text) return text;
    const idx = (text || '').toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<mark style={{ background: '#fef08a', color: '#0f172a', borderRadius: 2 }}>{text.slice(idx, idx + term.length)}</mark>{text.slice(idx + term.length)}</>;
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#fff', fontSize: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, borderRight: sel ? '1px solid #e2e8f0' : 'none' }}>
        {/* toolbar */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', flexShrink: 0 }}>
          <input value={search} onChange={e => hs(e.target.value)} placeholder="Filtrar: IP, proceso, Event ID, usuario, hash..."
            style={{ flex: 1, minWidth: 140, padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11, outline: 'none', fontFamily: 'monospace' }} />
          {['TODOS', 'ERROR', 'WARNING', 'INFO'].map(n => (
            <button key={n} onClick={() => setNivel(n)}
              style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, border: `1px solid ${NVC[n] || '#e2e8f0'}`, background: nivel === n ? (NVC[n] || '#4f46e5') + '22' : 'transparent', color: nivel === n ? NVC[n] || '#4f46e5' : '#64748b' }}>
              {n}
            </button>
          ))}
          <label style={{ fontSize: 11, color: '#64748b', display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={onlyRel} onChange={e => setRel(e.target.checked)} style={{ accentColor: '#0078d4' }} /> Solo relevantes
          </label>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
          {filtered.map(l => (
            <div key={l.id} onClick={() => { setSel(sel?.id === l.id ? null : l); onQuery(`LOG:${l.id}`); }}
              style={{ padding: '7px 10px', borderRadius: 5, marginBottom: 3, fontFamily: 'Consolas,monospace', background: sel?.id === l.id ? '#eff6ff' : l.relevante ? '#fff' : '#fafafa', border: `1px solid ${sel?.id === l.id ? '#0078d4' : l.relevante ? '#e2e8f0' : '#f1f5f9'}`, opacity: l.relevante ? 1 : .55, cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{l.timestamp?.slice(11, 19)}</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, color: NVC[l.nivel] || '#64748b', background: (NVC[l.nivel] || '#64748b') + '18', border: `1px solid ${NVC[l.nivel] || '#64748b'}30` }}>{l.nivel}</span>
                <span style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 600 }}>{l.sistema}</span>
                <span style={{ fontSize: 10, color: '#64748b' }}>{l.fuente}</span>
                {l.event_id && <span style={{ fontSize: 9, color: '#64748b', border: '1px solid #e2e8f0', padding: '0 4px', borderRadius: 3 }}>EID:{l.event_id}</span>}
                {!l.relevante && <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 'auto' }}>ruido</span>}
              </div>
              <div style={{ fontSize: 11, color: l.relevante ? '#0f172a' : '#94a3b8', lineHeight: 1.5, wordBreak: 'break-all' }}>{hl(l.mensaje, search)}</div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>{search ? `Sin resultados para "${search}"` : 'Sin logs'}</div>}
        </div>

        <div style={{ padding: '4px 10px', borderTop: '1px solid #e2e8f0', fontSize: 10, color: '#94a3b8', background: '#f8fafc', flexShrink: 0 }}>
          {filtered.length}/{logs.length} · {logs.filter(l => l.relevante).length} relevantes
        </div>
      </div>

      {/* panel detalle */}
      {sel && (
        <div style={{ width: 280, overflowY: 'auto', padding: 14, background: '#f8fafc', flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Detalle del log</div>
          {[['ID', sel.id], ['Timestamp', sel.timestamp], ['Sistema', sel.sistema], ['Fuente', sel.fuente], ['Nivel', sel.nivel], ['Event ID', sel.event_id], ['Relevante', sel.relevante ? 'Sí' : 'No (ruido)']].filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', fontFamily: 'monospace', wordBreak: 'break-all' }}>{String(v)}</div>
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>Mensaje completo</div>
            <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, background: '#fff', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all' }}>{sel.mensaje}</div>
          </div>
          <button onClick={() => setSel(null)} style={{ marginTop: 10, width: '100%', padding: '6px 0', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 11, cursor: 'pointer' }}>Cerrar ✕</button>
        </div>
      )}
    </div>
  );
}

/* ─── NETWORK MONITOR ─────────────────────────────────────────────────────── */
function NetworkApp({ red }) {
  const [sel, setSel]   = useState(null);
  const [view, setView] = useState('lista');
  const hosts = red?.hosts || [];
  const conns = red?.conexiones || [];
  const EC = { comprometido: '#dc2626', sospechoso: '#d97706', limpio: '#16a34a', maliciosa: '#dc2626', sospechosa: '#d97706', legitima: '#16a34a' };

  const getPos = (idx, total) => {
    if (total === 1) return { x: 250, y: 150 };
    const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
    return { x: 250 + Math.cos(angle) * 130, y: 150 + Math.sin(angle) * 100 };
  };
  const positions = hosts.reduce((acc, h, i) => ({ ...acc, [h.id]: getPos(i, hosts.length) }), {});

  return (
    <div style={{ display: 'flex', height: '100%', fontSize: 12, background: '#fff' }}>
      {/* sidebar */}
      <div style={{ width: 240, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 4, background: '#f8fafc', flexShrink: 0 }}>
          <button onClick={() => setView('lista')} style={{ flex: 1, fontSize: 10, padding: '3px 0', borderRadius: 4, cursor: 'pointer', fontWeight: 700, border: `1px solid ${view === 'lista' ? '#0078d4' : '#e2e8f0'}`, background: view === 'lista' ? '#0078d422' : 'transparent', color: view === 'lista' ? '#0078d4' : '#64748b' }}>≡ Lista</button>
          <button onClick={() => setView('mapa')} style={{ flex: 1, fontSize: 10, padding: '3px 0', borderRadius: 4, cursor: 'pointer', fontWeight: 700, border: `1px solid ${view === 'mapa' ? '#0078d4' : '#e2e8f0'}`, background: view === 'mapa' ? '#0078d422' : 'transparent', color: view === 'mapa' ? '#0078d4' : '#64748b' }}>🌐 Mapa</button>
        </div>

        {view === 'lista' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>Hosts ({hosts.length})</div>
            {hosts.map(h => (
              <div key={h.id} onClick={() => setSel(h)}
                style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: sel?.id === h.id ? (EC[h.estado] || '#0078d4') + '08' : 'transparent' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: EC[h.estado] || '#94a3b8', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.nombre}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{h.ip}</div>
                </div>
                <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 8, background: (EC[h.estado] || '#94a3b8') + '18', color: EC[h.estado] || '#94a3b8', fontWeight: 700, flexShrink: 0 }}>{h.estado?.toUpperCase()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'hidden', padding: 8, display: 'flex', flexDirection: 'column' }}>
            <svg width="100%" viewBox="0 0 500 300" style={{ flex: 1 }}>
              {conns.map((c, i) => {
                const from = positions[c.origen]; const to = positions[c.destino];
                if (!from || !to) return null;
                return (
                  <g key={i}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={EC[c.estado] || '#94a3b8'} strokeWidth={c.estado === 'maliciosa' ? 2 : 1} strokeDasharray={c.estado === 'maliciosa' ? '5,3' : 'none'} opacity={c.estado === 'maliciosa' ? .9 : .5} />
                    <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 4} fontSize="8" fill={EC[c.estado] || '#94a3b8'} textAnchor="middle">{c.protocolo}:{c.puerto}</text>
                  </g>
                );
              })}
              {hosts.map(h => {
                const pos = positions[h.id]; if (!pos) return null;
                const isSel = sel?.id === h.id;
                return (
                  <g key={h.id} onClick={() => setSel(h)} style={{ cursor: 'pointer' }}>
                    <circle cx={pos.x} cy={pos.y} r={isSel ? 20 : 16} fill="#fff" stroke={EC[h.estado] || '#94a3b8'} strokeWidth={isSel ? 2.5 : 1.5} />
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={EC[h.estado] || '#64748b'} fontWeight="700">{h.tipo?.includes('Controller') ? 'DC' : h.tipo?.includes('Server') ? 'SRV' : 'WS'}</text>
                    <text x={pos.x} y={pos.y + 28} textAnchor="middle" fontSize="8" fill="#374151">{h.nombre?.length > 12 ? h.nombre.slice(0, 12) + '…' : h.nombre}</text>
                    <text x={pos.x} y={pos.y + 38} textAnchor="middle" fontSize="7.5" fill="#94a3b8">{h.ip}</text>
                  </g>
                );
              })}
            </svg>
            <div style={{ display: 'flex', gap: 10, padding: '4px 0', justifyContent: 'center', flexShrink: 0 }}>
              {[['comprometido', '#dc2626'], ['sospechoso', '#d97706'], ['limpio', '#16a34a']].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} /><span style={{ fontSize: 9, color: '#64748b' }}>{l}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* detalle host */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {sel ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: EC[sel.estado] || '#94a3b8' }} />
              <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{sel.nombre}</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: (EC[sel.estado] || '#94a3b8') + '18', color: EC[sel.estado] || '#94a3b8', fontWeight: 700 }}>{sel.estado?.toUpperCase()}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              {[['IP', sel.ip], ['Tipo', sel.tipo], ['OS', sel.os]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 10, color: '#94a3b8' }}>{k}</div><div style={{ fontSize: 11, fontWeight: 600, color: '#1d4ed8', fontFamily: 'monospace' }}>{v}</div></div>
              ))}
            </div>
            {sel.servicios?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 5 }}>SERVICIOS:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {sel.servicios.map(s => <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#f1f5f9', color: '#0f172a', fontFamily: 'monospace', border: '1px solid #e2e8f0' }}>{s}</span>)}
                </div>
              </div>
            )}
            {sel.notas && <div style={{ padding: 10, background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', fontSize: 11, color: '#92400e', lineHeight: 1.5, marginBottom: 12 }}>⚠ {sel.notas}</div>}
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Conexiones</div>
            {(red?.conexiones || []).filter(c => c.origen === sel.id || c.destino === sel.id).length === 0
              ? <div style={{ fontSize: 11, color: '#94a3b8' }}>Sin conexiones registradas</div>
              : (red?.conexiones || []).filter(c => c.origen === sel.id || c.destino === sel.id).map((c, i) => {
                const other = c.origen === sel.id ? hosts.find(h => h.id === c.destino) : hosts.find(h => h.id === c.origen);
                const EC2 = { comprometido: '#dc2626', sospechoso: '#d97706', limpio: '#16a34a', maliciosa: '#dc2626', sospechosa: '#d97706', legitima: '#16a34a' };
                return (
                  <div key={i} style={{ padding: '8px 12px', borderRadius: 6, marginBottom: 4, background: '#f8fafc', border: `1px solid ${EC2[c.estado] || '#e2e8f0'}44`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: EC2[c.estado] || '#94a3b8', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#0f172a' }}>{c.origen === sel.id ? '→' : '←'} {other?.nombre || 'externo'} ({other?.ip || '?'})</span>
                    <span style={{ fontSize: 10, color: '#64748b' }}>{c.protocolo}:{c.puerto}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: EC2[c.estado] || '#94a3b8', flexShrink: 0 }}>{c.estado?.toUpperCase()}</span>
                  </div>
                );
              })
            }
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#94a3b8' }}>
            <div style={{ fontSize: 48 }}>🌐</div>
            <div style={{ fontSize: 13 }}>Haz clic en un host para ver detalles</div>
            <div style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', maxWidth: 200 }}>Usa la vista Mapa para ver las conexiones visualmente</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── INCIDENT REPORT ─────────────────────────────────────────────────────── */
function ReportApp({ preguntas, labId, onSubmit, submitting, queriesCount }) {
  const loadDraft = () => { try { const d = JSON.parse(localStorage.getItem(`${DRAFT_KEY}:${labId}`) || '{}'); return { resp: d.resp || {}, inf: d.inf || '' }; } catch { return { resp: {}, inf: '' }; } };
  const init = loadDraft();
  const [resp, setResp] = useState(init.resp);
  const [inf,  setInf]  = useState(init.inf);
  const [tab,  setTab]  = useState('preguntas');
  const [saved, setSaved] = useState(false);
  const acc = '#0078d4';
  const respondidas = preguntas.filter(p => resp[String(p.id)]?.trim()).length;

  useEffect(() => {
    if (!labId) return;
    localStorage.setItem(`${DRAFT_KEY}:${labId}`, JSON.stringify({ resp, inf }));
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(t);
  }, [resp, inf, labId]);

  const handleSubmit = () => { onSubmit({ respuestas: resp, informe_libre: inf }); localStorage.removeItem(`${DRAFT_KEY}:${labId}`); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontSize: 13 }}>
      {/* tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', flexShrink: 0, background: '#f8fafc', alignItems: 'center' }}>
        {['preguntas', 'informe'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === t ? '#fff' : 'transparent', color: tab === t ? acc : '#64748b', borderBottom: tab === t ? `2px solid ${acc}` : '2px solid transparent' }}>
            {t === 'preguntas' ? `📋 Preguntas (${respondidas}/${preguntas.length})` : '📝 Informe libre'}
          </button>
        ))}
        {saved && <span style={{ marginLeft: 'auto', marginRight: 12, fontSize: 10, color: '#10b981' }}>✓ Guardado</span>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {tab === 'preguntas' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {preguntas.map(p => (
              <div key={p.id} style={{ border: `1px solid ${resp[String(p.id)] ? acc + '44' : '#e2e8f0'}`, borderRadius: 10, padding: '13px 15px', background: resp[String(p.id)] ? '#f0f9ff' : '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: resp[String(p.id)] ? '#10b98122' : '#f1f5f9', border: `1px solid ${resp[String(p.id)] ? '#10b981' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: resp[String(p.id)] ? '#10b981' : '#94a3b8' }}>
                    {resp[String(p.id)] ? '✓' : p.id}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: acc, textTransform: 'uppercase', letterSpacing: '.04em' }}>{p.categoria}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.6, marginBottom: 9 }}>{p.pregunta}</div>
                <input value={resp[String(p.id)] || ''} onChange={e => setResp(r => ({ ...r, [String(p.id)]: e.target.value }))}
                  placeholder={p.placeholder || 'Escribe tu respuesta aquí...'}
                  style={{ width: '100%', padding: '8px 11px', borderRadius: 6, border: `1px solid ${resp[String(p.id)] ? acc + '66' : '#e2e8f0'}`, background: '#fff', color: '#0f172a', fontSize: 12, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start', marginTop: 7, padding: '5px 9px', borderRadius: 5, background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <span>💡</span>
                  <span style={{ fontSize: 11, color: '#92400e', lineHeight: 1.5 }}>{p.pista}</span>
                </div>
              </div>
            ))}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 5 }}><span>Progreso</span><span>{respondidas}/{preguntas.length}</span></div>
              <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3 }}><div style={{ height: '100%', borderRadius: 3, width: `${preguntas.length > 0 ? (respondidas / preguntas.length) * 100 : 0}%`, background: `linear-gradient(90deg,${acc},#106ebe)` }} /></div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.7, padding: '8px 10px', background: '#f8fafc', borderRadius: 7, border: '1px solid #e2e8f0' }}>
              Describe la cadena del ataque: vector de entrada, técnicas MITRE, sistemas afectados, movimiento lateral y remediación. Un buen análisis suma hasta <strong>+10 puntos extra</strong>.
            </div>
            <textarea value={inf} onChange={e => setInf(e.target.value)} placeholder="Escribe tu análisis técnico completo del incidente..."
              style={{ minHeight: 200, padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontSize: 12, lineHeight: 1.7, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Palabras: {inf.trim().split(/\s+/).filter(Boolean).length}</div>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 14px', borderTop: '1px solid #e2e8f0', flexShrink: 0, background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: '#64748b' }}>
          <span>🔍 <strong style={{ color: acc }}>{queriesCount}</strong> herramientas usadas</span>
          <span>✅ <strong style={{ color: respondidas === preguntas.length ? '#10b981' : acc }}>{respondidas}/{preguntas.length}</strong></span>
        </div>
        <button onClick={handleSubmit} disabled={submitting || respondidas === 0}
          style={{ width: '100%', padding: '13px 0', borderRadius: 8, border: 'none', background: submitting || respondidas === 0 ? '#e2e8f0' : 'linear-gradient(135deg,#10b981,#059669)', color: submitting || respondidas === 0 ? '#94a3b8' : '#fff', fontSize: 13, fontWeight: 700, cursor: submitting || respondidas === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {submitting ? '⏳ Evaluando con IA...' : '📤 Enviar análisis'}
        </button>
        {respondidas === 0 && <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 5 }}>Responde al menos una pregunta para enviar</div>}
      </div>
    </div>
  );
}

/* ─── PANTALLA RESULTADOS ─────────────────────────────────────────────────── */
function Resultados({ resultado, escenario, onNew, onDash }) {
  const [tab, setTab] = useState('resumen');
  const pct   = Math.round(resultado.puntuacion_normalizada || 0);
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const SL    = { siem_queries: 'SIEM & Queries', forense_digital: 'Forense Digital', threat_hunting: 'Threat Hunting', analisis_logs: 'Análisis de Logs', inteligencia_amenazas: 'Intel. Amenazas' };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: 'Inter,Segoe UI,sans-serif', padding: 32, color: '#0f172a' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,.06)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Laboratorio completado</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.5px' }}>{escenario?.titulo || 'Lab SOC'}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{escenario?.nivel}</div>
          </div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 56, fontWeight: 900, color, lineHeight: 1 }}>{pct}</div><div style={{ fontSize: 12, color: '#64748b' }}>/100</div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[['⚡ XP', `+${resultado.xp_ganada || 0}`, '#4f46e5'], ['🔗 Cadena', `${resultado.cadena_ataque_descubierta || 0}%`, color], ['🔍 Queries', `+${resultado.puntuacion_queries || 0}pts`, '#10b981'], ['📋 Informe', `+${resultado.puntuacion_informe || 0}pts`, '#f59e0b']].map(([l, v, c]) => (
            <div key={l} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px' }}><div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{l}</div><div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div></div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {['resumen', 'preguntas', 'skills', 'solucion'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, border: `1px solid ${tab === t ? '#0078d4' : '#e2e8f0'}`, background: tab === t ? '#0078d408' : '#fff', color: tab === t ? '#0078d4' : '#64748b' }}>
              {t === 'resumen' ? '📊 Resumen' : t === 'preguntas' ? '❓ Preguntas' : t === 'skills' ? '📈 Skills' : '🔓 Solución'}
            </button>
          ))}
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, marginBottom: 20, minHeight: 200 }}>
          {tab === 'resumen' && <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>{resultado.feedback_general}</p>}
          {tab === 'preguntas' && (resultado.feedback_preguntas || []).map(fp => (
            <div key={fp.id} style={{ padding: '13px 15px', borderRadius: 10, background: fp.correcto ? '#f0fdf4' : '#fef2f2', border: `1px solid ${fp.correcto ? '#bbf7d0' : '#fecaca'}`, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><span style={{ fontSize: 18 }}>{fp.correcto ? '✅' : '❌'}</span><span style={{ fontSize: 13, fontWeight: 700 }}>Pregunta {fp.id}</span><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: fp.correcto ? '#bbf7d0' : '#fecaca', color: fp.correcto ? '#15803d' : '#dc2626' }}>{fp.puntos}/10</span></div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Correcta: <span style={{ color: '#1d4ed8', fontWeight: 600, fontFamily: 'monospace' }}>{fp.respuesta_correcta}</span></div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{fp.feedback}</div>
            </div>
          ))}
          {tab === 'skills' && <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(resultado.skills_mejoradas || {}).map(([sk, d]) => {
              const delta = typeof d === 'object' ? d.delta : d;
              return (
                <div key={sk} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 164, fontSize: 13, color: '#374151', fontWeight: 600 }}>{SL[sk] || sk}</div>
                  <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4 }}><div style={{ height: '100%', borderRadius: 4, width: `${(delta / 0.3) * 100}%`, background: delta >= 0.2 ? '#10b981' : delta > 0 ? '#f59e0b' : '#e2e8f0' }} /></div>
                  <div style={{ width: 52, fontSize: 13, color: delta > 0 ? '#10b981' : '#94a3b8', textAlign: 'right', fontWeight: 700 }}>{delta > 0 ? `+${delta.toFixed(2)}` : '—'}</div>
                </div>
              );
            })}
          </div>}
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
                <div style={{ marginTop: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>TTPs MITRE ATT&CK:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {resultado.solucion_completa.tecnicas_mitre.map(t => <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#ede9fe', color: '#7c3aed', fontWeight: 700 }}>{t}</span>)}
                  </div>
                </div>
              )}
              {resultado.solucion_completa.lecciones && (
                <div style={{ padding: 14, background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
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

/* ─── MODAL CONFIRMACIÓN SALIDA ───────────────────────────────────────────── */
function ModalSalir({ onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px 40px', maxWidth: 420, width: '90%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,.4)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>¿Abandonar el laboratorio?</h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 28 }}>Tu progreso se perderá. Las respuestas del Incident Report están guardadas localmente, pero el escenario no se podrá recuperar.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '13px 0', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Seguir investigando</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '13px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Sí, salir</button>
        </div>
      </div>
    </div>
  );
}

/* ─── BOOT SCREEN ─────────────────────────────────────────────────────────── */
const BOOT_LINES = [
  '', '  Starting Windows...', '  Microsoft Windows [Version 10.0.19045.3803]',
  '  (c) Microsoft Corporation. All rights reserved.', '',
  '  Loading CORP domain policies.......................... [OK]',
  '  Starting Windows Defender Antivirus Service.......... [OK]',
  '  Connecting to CORP-DC01.corp.local................... [OK]',
  '  Loading Splunk Universal Forwarder................... [OK]',
  '  Loading SOC Analyst workstation profile..............',
  '', '  ████████████████████████████████  100%', '',
  '  Welcome, SOC Analyst. Stay alert.',
];

function BootScreen({ onDone }) {
  const [lines, setLines] = useState([]);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < BOOT_LINES.length) { setLines(l => [...l, BOOT_LINES[i++]]); }
      else { clearInterval(iv); setTimeout(() => { setFading(true); setTimeout(onDone, 700); }, 900); }
    }, 120);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000080', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New',monospace", zIndex: 9000, opacity: fading ? 0 : 1, transition: 'opacity .7s' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🪟</div>
      <div style={{ fontSize: 13, color: '#fff', lineHeight: 2.1, textAlign: 'center' }}>
        {lines.map((l, i) => <div key={i} style={{ opacity: i === lines.length - 1 ? 1 : 0.7 }}>{l || '\u00a0'}</div>)}
      </div>
    </div>
  );
}

/* ─── DESKTOP ICON ────────────────────────────────────────────────────────── */
function DIcon({ id, icon, label, isOpen, badge, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 6px', borderRadius: 6, background: h ? 'rgba(255,255,255,.22)' : isOpen ? 'rgba(255,255,255,.1)' : 'transparent', cursor: 'pointer', width: 76, userSelect: 'none', position: 'relative', border: isOpen ? '1px solid rgba(255,255,255,.2)' : '1px solid transparent' }}
    >
      <div style={{ fontSize: 30, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.5))' }}>{icon}</div>
      <div style={{ fontSize: 11, color: '#fff', textAlign: 'center', lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,.9)', fontWeight: 500 }}>{label}</div>
      {badge && <div style={{ position: 'absolute', top: 4, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid rgba(30,58,138,.8)' }} />}
    </div>
  );
}

/* ─── TASKBAR BTN ─────────────────────────────────────────────────────────── */
function TBtn({ icon, label, active, minimized, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 4, background: active ? 'rgba(255,255,255,.22)' : h ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.05)', border: active ? '1px solid rgba(255,255,255,.3)' : '1px solid transparent', cursor: 'pointer', maxWidth: 150, opacity: minimized ? .65 : 1 }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#38bdf8', marginLeft: 'auto', flexShrink: 0 }} />}
    </div>
  );
}

/* ─── APPS CONFIG ─────────────────────────────────────────────────────────── */
const APPS = [
  { id: 'siem',    label: 'SIEM Alerts',     icon: '🖥️', iX: 100, iY: 60,  iW: 740, iH: 520 },
  { id: 'logs',    label: 'Log Explorer',    icon: '📋', iX: 140, iY: 90,  iW: 700, iH: 500 },
  { id: 'network', label: 'Network Monitor', icon: '🌐', iX: 180, iY: 120, iW: 680, iH: 480 },
  { id: 'terminal',label: 'Terminal',        icon: '💻', iX: 220, iY: 150, iW: 660, iH: 420 },
  { id: 'report',  label: 'Incident Report', icon: '📝', iX: 260, iY: 90,  iW: 600, iH: 580 },
];

/* ─── MAIN ────────────────────────────────────────────────────────────────── */
export default function LabPage() {
  const navigate       = useNavigate();
  const { token }      = useAuth();
  const [fase, setFase]           = useState('intro');
  const [escenario, setEscenario] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [queries, setQueries]     = useState([]);
  const [tickTime, setTickTime]   = useState(clock());
  const [focused, setFocused]     = useState(null);
  const [reportBadge, setRB]      = useState(false);
  const [showBoot, setShowBoot]   = useState(false);
  const [modalSalir, setModalSalir] = useState(false);
  const idleRef = useRef(null);

  // estado ventanas: { open, minimized }
  const initWins = () => APPS.reduce((a, app) => ({ ...a, [app.id]: { open: false, minimized: false } }), {});
  const [wins, setWins] = useState(initWins);

  useEffect(() => { const iv = setInterval(() => setTickTime(clock()), 15000); return () => clearInterval(iv); }, []);

  // badge report si lleva 8 min sin abrirlo
  useEffect(() => {
    if (fase !== 'lab' || !escenario) return;
    idleRef.current = setTimeout(() => { if (!wins.report?.open) setRB(true); }, 8 * 60 * 1000);
    return () => clearTimeout(idleRef.current);
  }, [fase, escenario]);

  // atajos teclado
  useEffect(() => {
    if (fase !== 'lab') return;
    const map = { '1': 'siem', '2': 'logs', '3': 'network', '4': 'terminal', '5': 'report' };
    const h = (e) => { if (e.ctrlKey && map[e.key]) { e.preventDefault(); openApp(map[e.key]); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [fase, wins]);

  const onQuery = useCallback(q => setQueries(p => p.includes(q) ? p : [...p, q]), []);

  const openApp = (id) => {
    setWins(w => ({ ...w, [id]: { open: true, minimized: false } }));
    setFocused(id);
    onQuery(`OPEN:${id}`);
    if (id === 'report') setRB(false);
  };
  const closeApp = (id, action) => {
    if (action === 'min') setWins(w => ({ ...w, [id]: { ...w[id], minimized: true } }));
    else setWins(w => ({ ...w, [id]: { open: false, minimized: false } }));
  };
  const taskClick = (id) => {
    const w = wins[id];
    if (!w?.open) { openApp(id); return; }
    if (w.minimized) { setWins(ww => ({ ...ww, [id]: { ...ww[id], minimized: false } })); setFocused(id); }
    else if (focused === id) setWins(ww => ({ ...ww, [id]: { ...ww[id], minimized: true } }));
    else setFocused(id);
  };

  const iniciarLab = async () => {
    setLoading(true); setError('');
    try {
      const d = await apiFetch('/lab/generar', token, { method: 'POST' });
      setEscenario(d); setQueries([]); setShowBoot(true);
    } catch (e) { setError(e.message || 'Error generando el laboratorio'); }
    finally { setLoading(false); }
  };

  const enviar = async ({ respuestas, informe_libre }) => {
    setSubmitting(true); setError('');
    try {
      const d = await apiFetch('/lab/evaluar', token, { method: 'POST', body: JSON.stringify({ lab_id: escenario.lab_id, respuestas, informe_libre, queries_usadas: queries }) });
      setResultado(d); setFase('resultado');
    } catch (e) { setError(e.message || 'Error evaluando'); }
    finally { setSubmitting(false); }
  };

  const nuevoLab = () => { setEscenario(null); setResultado(null); setFase('intro'); setWins(initWins()); setQueries([]); setRB(false); };

  const intentarSalir = () => {
    if (fase === 'lab') setModalSalir(true);
    else navigate('/dashboard');
  };

  /* ── boot screen ── */
  if (showBoot) return <BootScreen onDone={() => { setShowBoot(false); setFase('lab'); }} />;

  /* ── intro ── */
  if (fase === 'intro') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', fontFamily: "'Inter','Segoe UI',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      <div style={{ maxWidth: 560, width: '100%', animation: 'fadeUp .4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(0,120,212,.15)', border: '1px solid rgba(0,120,212,.3)', marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0078d4', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 700, letterSpacing: '.08em' }}>LABORATORIO SOC — FORENSICS</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f1f5f9', margin: '0 0 12px', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Investiga una máquina<br /><span style={{ color: '#0078d4' }}>comprometida</span>
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, margin: 0, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
            La IA genera un incidente real adaptado a tu nivel. Usa las herramientas del SOC para reconstruir el ataque.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(10px)', borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[
              { icon: '🖥️', label: 'SIEM Alerts',      desc: 'Alertas con filtros y timeline',      color: '#3b82f6' },
              { icon: '📋', label: 'Log Explorer',     desc: 'Logs filtrables con highlight',        color: '#8b5cf6' },
              { icon: '🌐', label: 'Network Monitor',  desc: 'Mapa de red y conexiones',             color: '#10b981' },
              { icon: '💻', label: 'Terminal',          desc: '20+ comandos Windows reales',          color: '#f59e0b' },
              { icon: '📝', label: 'Incident Report',  desc: 'Preguntas evaluadas por IA',           color: '#ef4444' },
              { icon: '⏱', label: 'Sin límite',        desc: 'Investiga a tu ritmo',                 color: '#64748b' },
            ].map(({ icon, label, desc, color }, i) => (
              <div key={label} style={{ padding: '16px 18px', borderBottom: i < 4 ? '1px solid rgba(255,255,255,.06)' : 'none', borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,.06)' : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
                <div><div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{label}</div><div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{desc}</div></div>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,.06)', background: 'rgba(0,0,0,.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>ATAJOS:</span>
            {['Ctrl+1', 'Ctrl+2', 'Ctrl+3', 'Ctrl+4', 'Ctrl+5'].map(k => (
              <span key={k} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,.06)', color: '#64748b', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,.08)' }}>{k}</span>
            ))}
          </div>
        </div>

        {!token && (
          <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', fontSize: 13, color: '#f87171', textAlign: 'center' }}>
            ⚠ No hay sesión activa — <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#7dd3fc', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>inicia sesión</button>
          </div>
        )}

        <button onClick={iniciarLab} disabled={loading || !token}
          style={{ width: '100%', padding: '16px 0', borderRadius: 12, border: 'none', background: loading || !token ? 'rgba(255,255,255,.05)' : 'linear-gradient(135deg,#0078d4,#106ebe)', color: loading || !token ? '#475569' : '#fff', fontSize: 15, fontWeight: 700, cursor: loading || !token ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: loading || !token ? 'none' : '0 4px 20px rgba(0,120,212,.4)' }}>
          {loading ? '⏳ Generando escenario con IA (~20s)...' : '⚡ Iniciar Laboratorio'}
        </button>

        {error && <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(220,38,38,.1)', border: '1px solid rgba(220,38,38,.3)', fontSize: 12, color: '#f87171' }}>⚠ {error}</div>}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 14 }}>Solo XP y habilidades · Sin copas · Escenario adaptado a tu arena</div>
      </div>
    </div>
  );

  /* ── resultado ── */
  if (fase === 'resultado') return <Resultados resultado={resultado} escenario={escenario} onNew={nuevoLab} onDash={() => navigate('/dashboard')} />;

  /* ── lab ── */
  const openApps = APPS.filter(a => wins[a.id]?.open);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: "'Segoe UI',sans-serif", userSelect: 'none', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#f1f5f9}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:#94a3b8}
        input, textarea { user-select: text !important; }
      `}</style>

      {modalSalir && <ModalSalir onConfirm={() => navigate('/dashboard')} onCancel={() => setModalSalir(false)} />}

      {/* escritorio */}
      <div style={{ position: 'absolute', inset: 0, bottom: 40, background: 'linear-gradient(160deg,#1e3a8a 0%,#1d4ed8 45%,#2563eb 75%,#1e40af 100%)' }}>
        {/* patrón de fondo */}
        <div style={{ position: 'absolute', inset: 0, opacity: .04, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        {/* banner objetivo */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '5px 14px', background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 10, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', letterSpacing: '.06em', flexShrink: 0 }}>🎯 OBJETIVO:</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{escenario?.objetivo || escenario?.descripcion}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>🔍 <span style={{ color: '#7dd3fc' }}>{queries.length}</span></span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: 'monospace' }}>{escenario?.nivel}</span>
            <button onClick={intentarSalir} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 5, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: 'rgba(255,255,255,.7)', cursor: 'pointer' }}>← Dashboard</button>
          </div>
        </div>

        {/* iconos escritorio — columna izquierda */}
        <div style={{ position: 'absolute', top: 36, left: 14, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 5 }}>
          {APPS.map(a => (
            <DIcon
              key={a.id} id={a.id} icon={a.icon} label={a.label}
              isOpen={wins[a.id]?.open && !wins[a.id]?.minimized}
              badge={a.id === 'report' && reportBadge}
              onClick={() => {
                if (wins[a.id]?.open && !wins[a.id]?.minimized) {
                  // si ya está abierta y visible, minimizar
                  setWins(w => ({ ...w, [a.id]: { ...w[a.id], minimized: true } }));
                } else {
                  openApp(a.id);
                }
              }}
            />
          ))}
        </div>

        {/* ventanas */}
        {APPS.map(app => {
          if (!wins[app.id]?.open || wins[app.id]?.minimized) return null;
          return (
            <Win
              key={app.id}
              id={app.id}
              title={app.label}
              icon={app.icon}
              onClose={closeApp}
              onFocus={setFocused}
              focused={focused === app.id}
              initX={app.iX}
              initY={app.iY + 32}
              initW={app.iW}
              initH={app.iH}
            >
              {app.id === 'siem'     && <SIEMApp    alertas={escenario?.alertas_siem || []} onQuery={onQuery} />}
              {app.id === 'logs'     && <LogApp     logs={escenario?.logs || []}            onQuery={onQuery} />}
              {app.id === 'network'  && <NetworkApp red={escenario?.red} />}
              {app.id === 'terminal' && <TerminalApp escenario={escenario}                  onQuery={onQuery} />}
              {app.id === 'report'   && <ReportApp  preguntas={escenario?.preguntas || []} labId={escenario?.lab_id} onSubmit={enviar} submitting={submitting} queriesCount={queries.length} />}
            </Win>
          );
        })}

        {error && <div style={{ position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 20px', color: '#dc2626', fontSize: 12, zIndex: 9998 }}>{error}</div>}
      </div>

      {/* taskbar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 40, background: 'rgba(8,12,22,.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', padding: '0 6px', gap: 3, zIndex: 200 }}>
        <div style={{ width: 32, height: 32, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>🪟</div>
        <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,.1)', margin: '0 4px' }} />
        {openApps.map(a => (
          <TBtn
            key={a.id} icon={a.icon} label={a.label}
            active={focused === a.id && !wins[a.id]?.minimized}
            minimized={wins[a.id]?.minimized}
            onClick={() => taskClick(a.id)}
          />
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, paddingRight: 10 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace' }}>Ctrl+1-5</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>{tickTime}</span>
        </div>
      </div>
    </div>
  );
}