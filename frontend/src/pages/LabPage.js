import React, { useState, useEffect, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import { useNavigate } from 'react-router-dom';

const API = 'https://socblast-production.up.railway.app/api';
const OB_KEY       = 'socblast_lab_onboarding_v3';
const DRAFT_KEY    = 'socblast_lab_draft';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const tok = () => localStorage.getItem('token');
const apiFetch = async (path, opts = {}) => {
  const r = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
  return r.json();
};
const clock = () => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

/* ─── onboarding ──────────────────────────────────────────────────────────── */
const OB_STEPS = [
  { icon: '🖥️', title: 'Un ordenador comprometido real', body: 'La IA genera una máquina Windows que ha sido atacada. Tú eres el analista forense que debe reconstruir qué ocurrió.' },
  { icon: '🔍', title: 'Abre las aplicaciones', body: 'Doble clic en los iconos del escritorio para abrir SIEM, Terminal, Log Explorer, Network Monitor o el Informe. Puedes arrastrar y redimensionar las ventanas.' },
  { icon: '💻', title: 'Investiga sin límite de tiempo', body: 'Analiza alertas, ejecuta comandos reales en la terminal (help para ver todos), filtra logs y correlaciona eventos. Más herramientas usadas = más puntos.' },
  { icon: '📝', title: 'Envía tu informe', body: 'Abre Incident Report, responde las preguntas de investigación y redacta tu análisis. La IA evaluará todo y mejorará tus habilidades SOC.' },
];
function Onboarding({ onDone }) {
  const [s, setS] = useState(0);
  const cur = OB_STEPS[s];
  return (
    <div style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,.85)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Segoe UI,sans-serif' }}>
      <div style={{ background:'#fff',borderRadius:16,padding:'40px 44px',maxWidth:480,width:'90%',textAlign:'center',boxShadow:'0 32px 80px rgba(0,0,0,.5)' }}>
        <div style={{ fontSize:52,marginBottom:16 }}>{cur.icon}</div>
        <div style={{ fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:10 }}>{cur.title}</div>
        <div style={{ fontSize:14,color:'#475569',lineHeight:1.8,marginBottom:28 }}>{cur.body}</div>
        <div style={{ display:'flex',gap:6,justifyContent:'center',marginBottom:24 }}>
          {OB_STEPS.map((_,i)=><div key={i} style={{ width:i===s?22:8,height:8,borderRadius:4,background:i===s?'#0078d4':'#e2e8f0',transition:'all .3s' }}/>)}
        </div>
        <div style={{ display:'flex',gap:8 }}>
          {s>0&&<button onClick={()=>setS(s-1)} style={{ flex:1,padding:'11px 0',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',fontWeight:600,cursor:'pointer',fontSize:13 }}>← Atrás</button>}
          <button onClick={()=>s===OB_STEPS.length-1?onDone():setS(s+1)} style={{ flex:2,padding:'12px 0',borderRadius:8,border:'none',background:'linear-gradient(135deg,#0078d4,#106ebe)',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:14 }}>
            {s===OB_STEPS.length-1?'🚀 ¡Empezar!':'Siguiente →'}
          </button>
        </div>
        <button onClick={onDone} style={{ marginTop:10,background:'none',border:'none',color:'#94a3b8',fontSize:12,cursor:'pointer' }}>Saltar tutorial</button>
      </div>
    </div>
  );
}

/* ─── boot screen ─────────────────────────────────────────────────────────── */
const WIN_BOOT = [
  '','  Starting Windows...','  Microsoft Windows [Version 10.0.19045.3803]',
  '  (c) Microsoft Corporation. All rights reserved.','',
  '  Loading CORP domain policies.......................... [OK]',
  '  Starting Windows Defender Antivirus Service.......... [OK]',
  '  Connecting to CORP-DC01.corp.local................... [OK]',
  '  Mounting network drives (\\\\CORP-FS01\\shared)......... [OK]',
  '  Loading Splunk Universal Forwarder................... [OK]',
  '  Loading SOC Analyst workstation profile..............',
  '','  ████████████████████████████████  100%','',
  '  Welcome, SOC Analyst. Stay alert.',
];
function BootScreen({ onDone }) {
  const [lines, setLines] = useState([]);
  const [fading, setFading] = useState(false);
  useEffect(()=>{
    let i=0;
    const iv=setInterval(()=>{
      if(i<WIN_BOOT.length){setLines(l=>[...l,WIN_BOOT[i++]]);}
      else{clearInterval(iv);setTimeout(()=>{setFading(true);setTimeout(onDone,700);},900);}
    },130);
    return()=>clearInterval(iv);
  },[]);
  return (
    <div style={{ position:'fixed',inset:0,zIndex:1000,background:'#000080',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:"'Courier New',monospace",opacity:fading?0:1,transition:'opacity .7s' }}>
      <div style={{ fontSize:68,marginBottom:20 }}>🪟</div>
      <div style={{ fontSize:13,color:'#fff',lineHeight:2.1,textAlign:'center' }}>
        {lines.map((l,i)=><div key={i} style={{ opacity:i===lines.length-1?1:0.75 }}>{l||'\u00a0'}</div>)}
      </div>
    </div>
  );
}

/* ─── window manager ──────────────────────────────────────────────────────── */
let zTop = 20;
function AppWindow({ title, icon, children, onClose, onMinimize, focused, onFocus, defaultX, defaultY, defaultW, defaultH, minW=380, minH=280 }) {
  const nodeRef = useRef(null);
  const [max, setMax]   = useState(false);
  const [size, setSize] = useState({ w: defaultW||700, h: defaultH||480 });
  const [zIdx, setZ]    = useState(zTop++);
  const resRef          = useRef(null);

  const bringTop = () => { const z=zTop++; setZ(z); onFocus(); };

  const startResize = (e) => {
    e.stopPropagation(); e.preventDefault();
    resRef.current = { sx:e.clientX, sy:e.clientY, sw:size.w, sh:size.h };
    const mv = ev => {
      if(!resRef.current) return;
      setSize({ w:Math.max(minW, resRef.current.sw+(ev.clientX-resRef.current.sx)), h:Math.max(minH, resRef.current.sh+(ev.clientY-resRef.current.sy)) });
    };
    const up = () => { resRef.current=null; window.removeEventListener('mousemove',mv); window.removeEventListener('mouseup',up); };
    window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
  };

  return (
    <Draggable nodeRef={nodeRef} handle=".wdrag" disabled={max}
      defaultPosition={{ x:defaultX||80, y:defaultY||40 }}
      onStart={bringTop} bounds="parent">
      <div ref={nodeRef} onMouseDown={bringTop} style={{
        position:'absolute', zIndex:zIdx,
        width:max?'100%':size.w, height:max?'100%':size.h,
        ...(max?{top:0,left:0}:{}),
        background:'#fff', borderRadius:max?0:6,
        border:focused?'1px solid #0078d4':'1px solid rgba(255,255,255,.12)',
        boxShadow:focused?'0 20px 60px rgba(0,0,0,.6)':'0 4px 20px rgba(0,0,0,.4)',
        display:'flex',flexDirection:'column',overflow:'hidden',
        fontFamily:"'Segoe UI','Inter',sans-serif",
        userSelect:'none',
      }}>
        {/* titlebar */}
        <div className="wdrag" style={{ height:32,background:focused?'#1e293b':'#334155',display:'flex',alignItems:'center',padding:'0 0 0 10px',gap:8,cursor:'move',flexShrink:0 }}>
          <span style={{ fontSize:13 }}>{icon}</span>
          <span style={{ flex:1,fontSize:12,color:'#e2e8f0',fontWeight:600,userSelect:'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{title}</span>
          <WinCtrl label="─" onClick={e=>{e.stopPropagation();onMinimize();}}/>
          <WinCtrl label={max?'❐':'□'} onClick={e=>{e.stopPropagation();setMax(m=>!m);}}/>
          <WinCtrl label="✕" red onClick={e=>{e.stopPropagation();onClose();}}/>
        </div>
        <div style={{ flex:1,overflow:'hidden',display:'flex',flexDirection:'column' }}>{children}</div>
        {!max&&<div onMouseDown={startResize} style={{ position:'absolute',bottom:0,right:0,width:14,height:14,cursor:'nwse-resize',zIndex:99 }}>
          <svg width="14" height="14"><path d="M2 12 L12 2 M6 12 L12 6 M10 12 L12 10" stroke="rgba(148,163,184,.5)" strokeWidth="1.5"/></svg>
        </div>}
      </div>
    </Draggable>
  );
}
function WinCtrl({ label, onClick, red }) {
  const [h,setH]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ width:46,height:32,display:'flex',alignItems:'center',justifyContent:'center',background:h?(red?'#c42b1c':'rgba(255,255,255,.15)'):'transparent',cursor:'pointer',color:'#e2e8f0',fontSize:red?11:12,transition:'background .1s' }}>
      {label}
    </div>
  );
}

/* ─── desktop icon ────────────────────────────────────────────────────────── */
function DIcon({ icon, label, onClick, badge }) {
  const [h,setH]=useState(false);
  return (
    <div onDoubleClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:5,padding:'8px 6px',borderRadius:6,background:h?'rgba(255,255,255,.2)':'transparent',cursor:'pointer',transition:'background .15s',width:76,userSelect:'none',position:'relative' }}>
      <div style={{ fontSize:32,filter:'drop-shadow(0 2px 4px rgba(0,0,0,.5))' }}>{icon}</div>
      <div style={{ fontSize:11,color:'#fff',textAlign:'center',lineHeight:1.3,textShadow:'0 1px 4px rgba(0,0,0,.9)',fontWeight:500 }}>{label}</div>
      {badge&&<div style={{ position:'absolute',top:4,right:8,width:8,height:8,borderRadius:'50%',background:'#ef4444',border:'2px solid rgba(30,58,138,.8)' }}/>}
    </div>
  );
}

/* ─── taskbar button ──────────────────────────────────────────────────────── */
function TBtn({ icon, label, active, minimized, onClick }) {
  const [h,setH]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:4,background:active?'rgba(255,255,255,.22)':h?'rgba(255,255,255,.1)':'rgba(255,255,255,.05)',border:active?'1px solid rgba(255,255,255,.3)':'1px solid transparent',cursor:'pointer',transition:'all .12s',maxWidth:150,opacity:minimized?.65:1 }}>
      <span style={{ fontSize:14,flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:11,color:'#e2e8f0',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{label}</span>
      {active&&<div style={{ width:4,height:4,borderRadius:'50%',background:'#38bdf8',marginLeft:'auto',flexShrink:0 }}/>}
    </div>
  );
}

/* ─── APP: SIEM ───────────────────────────────────────────────────────────── */
function SIEMApp({ alertas, onQuery }) {
  const [sel, setSel] = useState(null);
  const [flt, setFlt] = useState('TODAS');
  const [view, setView] = useState('lista'); // lista | timeline
  const SEV = { CRITICA:'#dc2626', ALTA:'#ea580c', MEDIA:'#d97706', BAJA:'#16a34a' };
  const filtered = flt==='TODAS' ? alertas : alertas.filter(a=>a.severidad===flt);
  const sorted   = [...filtered].sort((a,b)=>a.timestamp?.localeCompare(b.timestamp||'')||0);

  return (
    <div style={{ display:'flex',height:'100%',fontSize:12,background:'#f8fafc' }}>
      {/* sidebar */}
      <div style={{ width:310,borderRight:'1px solid #e2e8f0',display:'flex',flexDirection:'column',background:'#fff' }}>
        <div style={{ padding:'8px 10px',borderBottom:'1px solid #e8eaf0',display:'flex',gap:4,alignItems:'center',background:'#f8fafc',flexWrap:'wrap',flexShrink:0 }}>
          {['TODAS','CRITICA','ALTA','MEDIA','BAJA'].map(s=>(
            <button key={s} onClick={()=>setFlt(s)} style={{ fontSize:10,padding:'2px 8px',borderRadius:4,cursor:'pointer',fontWeight:700,border:`1px solid ${s==='TODAS'?'#e2e8f0':SEV[s]||'#e2e8f0'}`,background:flt===s?(SEV[s]||'#4f46e5')+'22':'transparent',color:flt===s?(SEV[s]||'#4f46e5'):'#64748b' }}>{s}</button>
          ))}
          <button onClick={()=>setView(v=>v==='lista'?'timeline':'lista')} style={{ marginLeft:'auto',fontSize:10,padding:'2px 8px',borderRadius:4,cursor:'pointer',border:'1px solid #e2e8f0',background:view==='timeline'?'#0078d422':'transparent',color:view==='timeline'?'#0078d4':'#64748b',fontWeight:600 }}>
            {view==='lista'?'⏱ Timeline':'≡ Lista'}
          </button>
        </div>
        <div style={{ flex:1,overflowY:'auto' }}>
          {view==='lista' ? filtered.map(a=>(
            <div key={a.id} onClick={()=>{setSel(a);onQuery(`SIEM:${a.id}`);}}
              style={{ padding:'10px 12px',borderBottom:'1px solid #f1f5f9',cursor:'pointer',borderLeft:`3px solid ${sel?.id===a.id?SEV[a.severidad]||'#4f46e5':'transparent'}`,background:sel?.id===a.id?(SEV[a.severidad]||'#4f46e5')+'08':'transparent',transition:'all .12s' }}>
              <div style={{ display:'flex',gap:6,alignItems:'center',marginBottom:3 }}>
                <span style={{ fontSize:9,fontWeight:800,padding:'1px 6px',borderRadius:3,background:(SEV[a.severidad]||'#666')+'18',color:SEV[a.severidad]||'#666',border:`1px solid ${SEV[a.severidad]||'#666'}30` }}>{a.severidad}</span>
                <span style={{ fontSize:10,color:'#94a3b8',marginLeft:'auto' }}>{a.timestamp?.slice(11,19)}</span>
              </div>
              <div style={{ fontSize:12,fontWeight:600,color:'#0f172a',lineHeight:1.3,marginBottom:2 }}>{a.titulo}</div>
              <div style={{ fontSize:11,color:'#64748b' }}>{a.sistema} · {a.id}</div>
            </div>
          )) : (
            <div style={{ padding:'10px 8px' }}>
              {sorted.map((a,i)=>(
                <div key={a.id} onClick={()=>{setSel(a);onQuery(`SIEM:${a.id}`);}} style={{ display:'flex',gap:8,marginBottom:8,cursor:'pointer' }}>
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0 }}>
                    <div style={{ width:10,height:10,borderRadius:'50%',background:SEV[a.severidad]||'#64748b',flexShrink:0,marginTop:2 }}/>
                    {i<sorted.length-1&&<div style={{ width:2,flex:1,background:'#e2e8f0',margin:'2px 0' }}/>}
                  </div>
                  <div style={{ flex:1,padding:'2px 0 8px' }}>
                    <div style={{ fontSize:10,color:'#94a3b8',marginBottom:2,fontFamily:'monospace' }}>{a.timestamp?.slice(11,19)}</div>
                    <div style={{ fontSize:11,fontWeight:600,color:sel?.id===a.id?'#0078d4':'#0f172a' }}>{a.titulo}</div>
                    <div style={{ fontSize:10,color:'#64748b' }}>{a.sistema}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filtered.length===0&&<div style={{ padding:20,color:'#94a3b8',textAlign:'center' }}>Sin alertas para este filtro</div>}
        </div>
        <div style={{ padding:'4px 10px',borderTop:'1px solid #e2e8f0',fontSize:10,color:'#94a3b8',background:'#f8fafc',flexShrink:0 }}>
          {filtered.length} alertas · {alertas.filter(a=>a.severidad==='CRITICA').length} críticas
        </div>
      </div>
      {/* detail */}
      <div style={{ flex:1,overflowY:'auto',padding:20 }}>
        {sel ? (
          <>
            <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:12 }}>
              <span style={{ fontSize:10,fontWeight:800,padding:'3px 10px',borderRadius:4,background:(SEV[sel.severidad]||'#666')+'18',color:SEV[sel.severidad]||'#666',border:`1px solid ${SEV[sel.severidad]||'#666'}30` }}>{sel.severidad}</span>
              <span style={{ fontSize:10,color:'#64748b',fontFamily:'monospace' }}>{sel.timestamp}</span>
              <span style={{ fontSize:10,color:'#94a3b8',marginLeft:'auto',fontFamily:'monospace' }}>{sel.id}</span>
            </div>
            <h3 style={{ fontSize:15,fontWeight:700,color:'#0f172a',marginBottom:8,lineHeight:1.3 }}>{sel.titulo}</h3>
            <p style={{ fontSize:12,color:'#475569',lineHeight:1.7,marginBottom:16 }}>{sel.descripcion}</p>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px',background:'#f8fafc',borderRadius:8,padding:14 }}>
              {[['Sistema',sel.sistema],['Categoría',sel.categoria],['IP Origen',sel.ip_origen],['IP Destino',sel.ip_destino],['Usuario',sel.usuario],['Proceso',sel.proceso],['Regla SIEM',sel.regla_disparada]].filter(([,v])=>v).map(([k,v])=>(
                <div key={k}><div style={{ fontSize:10,color:'#94a3b8',marginBottom:2 }}>{k}</div><div style={{ fontSize:11,fontWeight:600,color:'#1d4ed8',fontFamily:'monospace',wordBreak:'break-all' }}>{v}</div></div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:12,color:'#94a3b8' }}>
            <div style={{ fontSize:48 }}>🖥️</div>
            <div style={{ fontSize:13 }}>Selecciona una alerta para ver el detalle</div>
            <div style={{ fontSize:11,color:'#cbd5e1',textAlign:'center',maxWidth:240 }}>Usa el filtro por severidad o cambia a vista Timeline</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── APP: TERMINAL ───────────────────────────────────────────────────────── */
function TerminalApp({ escenario, onQuery }) {
  const [hist, setHist]   = useState([{ t:'sys', v:'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n\nEscribe "help" para ver todos los comandos disponibles.' }]);
  const [inp, setInp]     = useState('');
  const [cmds, setCmds]   = useState([]);
  const [ci, setCi]       = useState(-1);
  const bot    = useRef(null);
  const inpRef = useRef(null);
  const prompt = 'C:\\Users\\analyst>';

  const iocs    = escenario?.iocs || {};
  const logs    = escenario?.logs || [];
  const hosts   = escenario?.red?.hosts || [];
  const conns   = escenario?.red?.conexiones || [];
  const alertas = escenario?.alertas_siem || [];

  const CMDS = {
    help: () =>
`╔══════════════════════════════════════════════════════╗
║          COMANDOS DISPONIBLES — SOC Terminal         ║
╠══════════════════════════════════════════════════════╣
║  SISTEMA                                             ║
║    whoami          usuario actual                    ║
║    hostname        nombre del equipo                 ║
║    ipconfig        configuración de red              ║
║    ipconfig /all   detalles completos de red         ║
║    systeminfo      información del sistema           ║
║                                                      ║
║  PROCESOS Y RED                                      ║
║    tasklist        procesos en ejecución             ║
║    tasklist /svc   procesos con servicios            ║
║    netstat -an     todas las conexiones              ║
║    netstat -b      conexiones con proceso            ║
║    ping <ip>       comprobar conectividad            ║
║    nslookup <dom>  resolver DNS                      ║
║                                                      ║
║  ARCHIVOS Y REGISTRO                                 ║
║    dir             listar directorio actual          ║
║    dir /s          listar recursivo                  ║
║    type <archivo>  mostrar contenido                 ║
║    find <texto>    buscar en logs                    ║
║    reg query       consultar registro Windows        ║
║    wmic process    info de procesos (WMIC)           ║
║                                                      ║
║  INVESTIGACIÓN                                       ║
║    grep <patron>   buscar patrón en logs             ║
║    ioc             mostrar IOCs del escenario        ║
║    hosts           hosts de la red                   ║
║    alerts          resumen de alertas SIEM           ║
║    history         historial de comandos             ║
║    cls             limpiar pantalla                  ║
╚══════════════════════════════════════════════════════╝`,
    whoami:   () => 'CORP\\analyst',
    hostname: () => 'SOC-WORKSTATION-01',
    ipconfig: () =>
`Adaptador Ethernet Ethernet0:
   Dirección IPv4. . . . . . : 10.0.0.50
   Máscara de subred . . . . : 255.255.255.0
   Puerta de enlace predeterminada: 10.0.0.1
   Servidor DNS . . . . . . : 10.0.0.5`,
    'ipconfig /all': () =>
`Nombre de host. . . . . . . : SOC-WORKSTATION-01
Sufijo DNS principal  . . . : corp.local
Adaptador Ethernet Ethernet0:
   Dirección física. . . . . : 00-0C-29-AB-CD-EF
   DHCP habilitado . . . . . : No
   Dirección IPv4. . . . . . : 10.0.0.50
   Máscara de subred . . . . : 255.255.255.0
   Puerta de enlace. . . . . : 10.0.0.1
   Servidor DNS preferido. . : 10.0.0.5`,
    systeminfo: () =>
`Nombre de host:          SOC-WORKSTATION-01
Nombre del sistema oper: Microsoft Windows 10 Pro
Versión del sistema oper: 10.0.19045 N/D Compilación 19045
Fabricante del sistema:  VMware, Inc.
Nombre de dominio:       CORP
Servidor de inicio de se: CORP-DC01
Zona horaria:            (UTC+01:00) Madrid`,
    tasklist: () => {
      const procs = iocs.procesos_sospechosos || [];
      const base = [
        'Nombre de imagen        PID  Sesión       Uso de mem',
        '======================= ==== ============ ==========',
        'System                  4    Services     1.580 KB',
        'smss.exe                344  Services     1.104 KB',
        'csrss.exe               476  Services     5.312 KB',
        'svchost.exe             892  Services     12.340 KB',
        'svchost.exe             1024 Services     24.180 KB',
        'explorer.exe            1456 Console      48.200 KB',
        'taskhostw.exe           1788 Console      8.440 KB',
        'splunk-admon.exe        2100 Services     18.320 KB',
      ];
      procs.forEach((p,i) => base.push(`${p.slice(0,23).padEnd(23)} ${(1200+i).toString().padEnd(4)} Console      24.${300+i} KB  ← SOSPECHOSO`));
      return base.join('\n');
    },
    'tasklist /svc': () => {
      const procs = iocs.procesos_sospechosos || [];
      const base = [
        'Nombre de imagen        PID   Servicios',
        '======================= ===== =========',
        'System                  4     N/A',
        'svchost.exe             892   DcomLaunch, PlugPlay',
        'svchost.exe             1024  Dhcp, EventLog, LanmanServer',
        'splunk-admon.exe        2100  SplunkForwarder',
      ];
      procs.forEach((p,i) => base.push(`${p.slice(0,23).padEnd(23)} ${(1200+i).toString().padEnd(5)} ← SIN SERVICIO REGISTRADO`));
      return base.join('\n');
    },
    'netstat -an': () => {
      const lines = [
        'Conexiones activas',
        '',
        '  Proto  Dirección local         Dirección externo      Estado',
        '  TCP    0.0.0.0:135             0.0.0.0:0              LISTENING',
        '  TCP    0.0.0.0:445             0.0.0.0:0              LISTENING',
        '  TCP    0.0.0.0:3389            0.0.0.0:0              LISTENING',
        '  TCP    10.0.0.50:139           0.0.0.0:0              LISTENING',
      ];
      conns.forEach(c => {
        const f = hosts.find(h=>h.id===c.origen);
        const t = hosts.find(h=>h.id===c.destino);
        const estado = c.estado==='maliciosa'?'ESTABLISHED':c.estado==='sospechosa'?'ESTABLISHED':'LISTENING';
        lines.push(`  TCP    ${(f?.ip||'10.0.0.x')+':'+c.puerto}`.padEnd(26)+`${(t?.ip||'0.0.0.0')+':'+c.puerto}`.padEnd(23)+estado+(c.estado==='maliciosa'?' ← SOSPECHOSO':''));
      });
      return lines.join('\n');
    },
    'netstat -b': () => {
      const lines = ['Conexiones activas (con proceso)',''];
      const procs = iocs.procesos_sospechosos || [];
      conns.forEach((c,i) => {
        const t = hosts.find(h=>h.id===c.destino);
        const proc = procs[i] || 'svchost.exe';
        lines.push(`  TCP    10.0.0.50:${49000+i}     ${t?.ip||'0.0.0.0'}:${c.puerto}    ${c.estado==='maliciosa'?'ESTABLISHED ← SOSPECHOSO':'ESTABLISHED'}`);
        lines.push(`  [${proc}]`);
      });
      return lines.join('\n');
    },
    dir: () => {
      const files = logs.slice(0,6).map(l => `${l.timestamp?.slice(0,10).replace(/-/g,'/')}  <archivo>     ${l.sistema}.log`);
      return `Directorio de C:\\Users\\analyst\n\n${['29/02/2024  10:00    <DIR>          .','29/02/2024  10:00    <DIR>          ..','15/03/2024  02:05    <DIR>          Desktop','15/03/2024  02:05    <DIR>          Downloads','15/03/2024  02:05    <DIR>          logs',...files].join('\n')}\n\n               ${logs.length} archivos`;
    },
    'dir /s': () => `Buscando en subdirectorios...\n${logs.map(l=>`C:\\Users\\analyst\\logs\\${l.sistema}.log`).join('\n') || '(vacío)'}\n\n${logs.length} archivos encontrados.`,
    'reg query': () => {
      const keys = iocs.regkeys_persistencia || [];
      if (!keys.length) return 'No hay entradas de registro sospechosas identificadas.\nUsa: reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run';
      return keys.map(k=>`${k}\n    (Predeterminado)    REG_SZ    C:\\Windows\\Temp\\svc_update.exe ← SOSPECHOSO`).join('\n\n');
    },
    'wmic process': () => {
      const procs = iocs.procesos_sospechosos || [];
      return ['Caption                  ProcessId  CommandLine','======================== =========  ===========','System                   4          N/A','svchost.exe              892        C:\\Windows\\System32\\svchost.exe -k netsvcs','explorer.exe             1456       C:\\Windows\\explorer.exe',
        ...procs.map((p,i)=>`${p.slice(0,24).padEnd(24)} ${(1200+i).toString().padEnd(10)} C:\\Windows\\Temp\\${p} ← SOSPECHOSO`)
      ].join('\n');
    },
    ioc: () => {
      const parts = ['═══ IOCs del escenario ═══'];
      if (iocs.ips_maliciosas?.length)       parts.push(`IPs maliciosas:\n  ${iocs.ips_maliciosas.join('\n  ')}`);
      if (iocs.hashes_maliciosos?.length)    parts.push(`Hashes:\n  ${iocs.hashes_maliciosos.join('\n  ')}`);
      if (iocs.dominios_maliciosos?.length)  parts.push(`Dominios C2:\n  ${iocs.dominios_maliciosos.join('\n  ')}`);
      if (iocs.procesos_sospechosos?.length) parts.push(`Procesos sospechosos:\n  ${iocs.procesos_sospechosos.join('\n  ')}`);
      if (iocs.usuarios_comprometidos?.length) parts.push(`Usuarios comprometidos:\n  ${iocs.usuarios_comprometidos.join('\n  ')}`);
      if (iocs.regkeys_persistencia?.length) parts.push(`Claves de registro (persistencia):\n  ${iocs.regkeys_persistencia.join('\n  ')}`);
      return parts.length>1 ? parts.join('\n\n') : 'No hay IOCs definidos para este escenario.';
    },
    hosts: () => hosts.length
      ? ['HOST                 IP               ESTADO       TIPO','===================  ===============  ===========  ====',
          ...hosts.map(h=>`${h.nombre.padEnd(20)} ${h.ip.padEnd(15)}  ${h.estado?.toUpperCase().padEnd(12)} ${h.tipo}`)
        ].join('\n')
      : '(sin hosts en el escenario)',
    alerts: () => alertas.length
      ? alertas.map(a=>`[${a.severidad.padEnd(8)}] ${a.timestamp?.slice(11,19)||'--:--:--'} ${a.titulo} — ${a.sistema}`).join('\n')
      : '(sin alertas SIEM)',
    cls: () => null,
  };

  const run = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    onQuery(`CMD:${cmd}`);
    setCmds(p=>[cmd,...p]); setCi(-1);
    let out = '';
    const lc = cmd.toLowerCase();

    if (lc==='cls')          { setHist([]); setInp(''); return; }
    else if (lc==='history') { out = cmds.length ? cmds.map((c,i)=>`  ${(cmds.length-i).toString().padStart(3)}  ${c}`).join('\n') : '(historial vacío)'; }
    else if (lc.startsWith('ping ')) {
      const ip = lc.slice(5).trim();
      const known = hosts.find(h=>h.ip===ip||h.nombre.toLowerCase()===ip);
      if (known) out = `Haciendo ping a ${known.nombre} [${known.ip}] con 32 bytes de datos:\nRespuesta desde ${known.ip}: bytes=32 tiempo=1ms TTL=128\nRespuesta desde ${known.ip}: bytes=32 tiempo=1ms TTL=128\nRespuesta desde ${known.ip}: bytes=32 tiempo<1ms TTL=128\n\nEstadísticas de ping para ${known.ip}:\n    Paquetes: enviados = 3, recibidos = 3, perdidos = 0 (0% perdidos)`;
      else if (iocs.ips_maliciosas?.includes(ip)) out = `Haciendo ping a ${ip} con 32 bytes de datos:\nRespuesta desde ${ip}: bytes=32 tiempo=124ms TTL=52  ← IP EXTERNA SOSPECHOSA\nRespuesta desde ${ip}: bytes=32 tiempo=119ms TTL=52\n\nEstadísticas de ping para ${ip}:\n    Paquetes: enviados = 3, recibidos = 3, perdidos = 0 (0% perdidos)`;
      else out = `Haciendo ping a ${ip} con 32 bytes de datos:\nTiempo de espera agotado para esta solicitud.\nTiempo de espera agotado para esta solicitud.\n\nEstadísticas de ping para ${ip}:\n    Paquetes: enviados = 3, recibidos = 0, perdidos = 3 (100% perdidos)`;
    }
    else if (lc.startsWith('nslookup ')) {
      const dom = lc.slice(9).trim();
      const known = iocs.dominios_maliciosos?.includes(dom);
      out = `Servidor: CORP-DC01.corp.local\nAddress: 10.0.0.5\n\n${known?`Nombre: ${dom}\nAddress: ${iocs.ips_maliciosas?.[0]||'185.220.101.47'}  ← DOMINIO MALICIOSO`:`Nombre: ${dom}\n*** CORP-DC01.corp.local no puede encontrar ${dom}: Non-existent domain`}`;
    }
    else if (lc.startsWith('find ')) {
      const pat = lc.slice(5).trim().replace(/["']/g,'');
      const m = logs.filter(l=>l.mensaje.toLowerCase().includes(pat));
      out = m.length ? `---------- RESULTADOS PARA "${pat}" ----------\n${m.map(l=>`[${l.sistema}] ${l.timestamp?.slice(11,19)} ${l.mensaje}`).join('\n')}\n\n${m.length} resultado(s) encontrado(s).` : `find: "${pat}" — sin coincidencias en los logs`;
    }
    else if (lc.startsWith('grep ')) {
      const pat = lc.slice(5).trim();
      const m = logs.filter(l=>l.mensaje.toLowerCase().includes(pat));
      out = m.length ? m.map(l=>`[${l.sistema}] ${l.mensaje}`).join('\n') : `grep: "${pat}" — sin coincidencias`;
    }
    else if (lc.startsWith('type ')) {
      const f = lc.slice(5).trim();
      const l = logs.find(l=>l.sistema.toLowerCase().includes(f)||l.id?.toLowerCase()===f);
      out = l ? `--- ${l.sistema} (${l.fuente}) ---\n${l.timestamp}  EventID:${l.event_id||'?'}  [${l.nivel}]\n\n${l.mensaje}` : `type: No se puede encontrar el archivo especificado: "${f}"`;
    }
    else if (CMDS[lc]) { out=CMDS[lc](); if(out===null){setHist([]);setInp('');return;} }
    else out = `'${cmd}' no se reconoce como un comando interno o externo,\nun programa o un archivo por lotes ejecutable.\n\nEscribe "help" para ver los comandos disponibles.`;

    setHist(h=>[...h,{t:'in',v:`${prompt}${cmd}`},{t:'out',v:out}]);
    setInp('');
  };

  useEffect(()=>{ bot.current?.scrollIntoView({behavior:'smooth'}); },[hist]);

  return (
    <div onClick={()=>inpRef.current?.focus()} style={{ flex:1,background:'#0c0c0c',color:'#cccccc',fontFamily:"'Cascadia Code','Consolas','Courier New',monospace",fontSize:12,display:'flex',flexDirection:'column',cursor:'text' }}>
      <div style={{ padding:'5px 10px',background:'#1a1a1a',borderBottom:'1px solid #2a2a2a',fontSize:11,color:'#666',flexShrink:0,display:'flex',alignItems:'center',gap:10 }}>
        <span>Símbolo del sistema — CORP\analyst@SOC-WORKSTATION-01</span>
        <span style={{ marginLeft:'auto',color:'#444',fontSize:10 }}>admin: NO · {hosts.length} hosts · {logs.length} logs</span>
      </div>
      <div style={{ flex:1,overflowY:'auto',padding:'8px 12px' }}>
        {hist.map((h,i)=>(
          <pre key={i} style={{ margin:0,marginBottom:4,whiteSpace:'pre-wrap',lineHeight:1.65,color:h.t==='in'?'#ffffff':h.t==='sys'?'#888':'#cccccc',fontFamily:'inherit' }}>{h.v}</pre>
        ))}
        <div ref={bot}/>
      </div>
      <div style={{ display:'flex',alignItems:'center',padding:'6px 12px',borderTop:'1px solid #2a2a2a',flexShrink:0 }}>
        <span style={{ color:'#ccc',marginRight:6,whiteSpace:'nowrap',fontSize:12 }}>{prompt}</span>
        <input ref={inpRef} autoFocus value={inp} onChange={e=>setInp(e.target.value)}
          onKeyDown={e=>{
            if(e.key==='Enter') run(inp);
            else if(e.key==='ArrowUp'){const ni=Math.min(ci+1,cmds.length-1);setCi(ni);setInp(cmds[ni]||'');}
            else if(e.key==='ArrowDown'){const ni=Math.max(ci-1,-1);setCi(ni);setInp(ni===-1?'':cmds[ni]||'');}
          }}
          style={{ flex:1,background:'transparent',border:'none',outline:'none',color:'#ffffff',fontSize:12,fontFamily:'inherit' }}
          placeholder="escribe un comando (help para ver todos)..."/>
      </div>
    </div>
  );
}

/* ─── APP: LOG EXPLORER ───────────────────────────────────────────────────── */
function LogApp({ logs, onQuery }) {
  const [search, setSearch] = useState('');
  const [nivel,  setNivel]  = useState('TODOS');
  const [onlyRel,setRel]    = useState(false);
  const [selLog, setSelLog] = useState(null);
  const NVC = { ERROR:'#dc2626', WARNING:'#d97706', INFO:'#64748b' };

  const filtered = logs.filter(l => {
    if (nivel!=='TODOS' && l.nivel!==nivel) return false;
    if (onlyRel && !l.relevante) return false;
    if (search && !JSON.stringify(l).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const hs = v => { setSearch(v); if(v.length>2) onQuery(`SEARCH:${v}`); };

  // highlight helper
  const hl = (text, term) => {
    if (!term || term.length < 2) return text;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0,idx)}<mark style={{ background:'#fef08a',color:'#0f172a',borderRadius:2 }}>{text.slice(idx,idx+term.length)}</mark>{text.slice(idx+term.length)}</>;
  };

  return (
    <div style={{ display:'flex',height:'100%',background:'#fff',fontSize:12 }}>
      {/* list */}
      <div style={{ display:'flex',flexDirection:'column',flex:1,borderRight:selLog?'1px solid #e2e8f0':'none' }}>
        <div style={{ padding:'8px 10px',borderBottom:'1px solid #e2e8f0',display:'flex',gap:6,alignItems:'center',flexWrap:'wrap',background:'#f8fafc',flexShrink:0 }}>
          <input value={search} onChange={e=>hs(e.target.value)} placeholder="Filtrar: IP, proceso, Event ID, usuario, hash..."
            style={{ flex:1,minWidth:140,padding:'6px 10px',borderRadius:6,border:'1px solid #e2e8f0',background:'#fff',fontSize:11,outline:'none',fontFamily:'monospace' }}/>
          {['TODOS','ERROR','WARNING','INFO'].map(n=>(
            <button key={n} onClick={()=>setNivel(n)} style={{ fontSize:10,padding:'3px 8px',borderRadius:4,cursor:'pointer',fontWeight:700,border:`1px solid ${NVC[n]||'#e2e8f0'}`,background:nivel===n?(NVC[n]||'#4f46e5')+'22':'transparent',color:nivel===n?NVC[n]||'#4f46e5':'#64748b' }}>{n}</button>
          ))}
          <label style={{ fontSize:11,color:'#64748b',display:'flex',gap:4,alignItems:'center',cursor:'pointer',whiteSpace:'nowrap' }}>
            <input type="checkbox" checked={onlyRel} onChange={e=>setRel(e.target.checked)} style={{ accentColor:'#0078d4' }}/> Solo relevantes
          </label>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:6 }}>
          {filtered.map(l=>(
            <div key={l.id} onClick={()=>{setSelLog(selLog?.id===l.id?null:l);onQuery(`LOG:${l.id}`);}}
              style={{ padding:'7px 10px',borderRadius:5,marginBottom:3,fontFamily:'Consolas,monospace',background:selLog?.id===l.id?'#eff6ff':l.relevante?'#fff':'#fafafa',border:`1px solid ${selLog?.id===l.id?'#0078d4':l.relevante?'#e2e8f0':'#f1f5f9'}`,opacity:l.relevante?1:.55,cursor:'pointer',transition:'all .12s' }}>
              <div style={{ display:'flex',gap:6,alignItems:'center',marginBottom:2,flexWrap:'wrap' }}>
                <span style={{ fontSize:10,color:'#64748b',fontFamily:'monospace' }}>{l.timestamp?.slice(11,19)}</span>
                <span style={{ fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:3,color:NVC[l.nivel]||'#64748b',background:(NVC[l.nivel]||'#64748b')+'18',border:`1px solid ${NVC[l.nivel]||'#64748b'}30` }}>{l.nivel}</span>
                <span style={{ fontSize:10,color:'#1d4ed8',fontWeight:600 }}>{l.sistema}</span>
                <span style={{ fontSize:10,color:'#64748b' }}>{l.fuente}</span>
                {l.event_id&&<span style={{ fontSize:9,color:'#64748b',border:'1px solid #e2e8f0',padding:'0 4px',borderRadius:3 }}>EID:{l.event_id}</span>}
                {!l.relevante&&<span style={{ fontSize:9,color:'#94a3b8',marginLeft:'auto' }}>ruido</span>}
              </div>
              <div style={{ fontSize:11,color:l.relevante?'#0f172a':'#94a3b8',lineHeight:1.5,wordBreak:'break-all' }}>
                {hl(l.mensaje, search)}
              </div>
            </div>
          ))}
          {filtered.length===0&&<div style={{ padding:30,textAlign:'center',color:'#94a3b8' }}>{search?`Sin resultados para "${search}"`:'Sin logs para este filtro'}</div>}
        </div>
        <div style={{ padding:'4px 10px',borderTop:'1px solid #e2e8f0',fontSize:10,color:'#94a3b8',background:'#f8fafc',flexShrink:0 }}>
          {filtered.length}/{logs.length} entradas · {logs.filter(l=>l.relevante).length} relevantes
        </div>
      </div>
      {/* log detail panel */}
      {selLog&&(
        <div style={{ width:300,overflowY:'auto',padding:14,background:'#f8fafc',flexShrink:0 }}>
          <div style={{ fontSize:10,fontWeight:800,color:'#94a3b8',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:10 }}>Detalle del log</div>
          {[['ID',selLog.id],['Timestamp',selLog.timestamp],['Sistema',selLog.sistema],['Fuente',selLog.fuente],['Nivel',selLog.nivel],['Event ID',selLog.event_id],['Relevante',selLog.relevante?'Sí':'No (ruido)']].filter(([,v])=>v!==undefined&&v!=='').map(([k,v])=>(
            <div key={k} style={{ marginBottom:8 }}>
              <div style={{ fontSize:10,color:'#94a3b8',marginBottom:2 }}>{k}</div>
              <div style={{ fontSize:11,fontWeight:600,color:'#0f172a',fontFamily:'monospace',wordBreak:'break-all' }}>{String(v)}</div>
            </div>
          ))}
          <div style={{ marginTop:10 }}>
            <div style={{ fontSize:10,color:'#94a3b8',marginBottom:4 }}>Mensaje completo</div>
            <div style={{ fontSize:11,color:'#374151',lineHeight:1.6,background:'#fff',padding:'8px 10px',borderRadius:6,border:'1px solid #e2e8f0',fontFamily:'monospace',wordBreak:'break-all' }}>{selLog.mensaje}</div>
          </div>
          <button onClick={()=>setSelLog(null)} style={{ marginTop:10,width:'100%',padding:'6px 0',borderRadius:6,border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',fontSize:11,cursor:'pointer' }}>Cerrar ✕</button>
        </div>
      )}
    </div>
  );
}

/* ─── APP: NETWORK MONITOR ────────────────────────────────────────────────── */
function NetworkApp({ red }) {
  const [sel, setSel]   = useState(null);
  const [view, setView] = useState('lista'); // lista | mapa
  const hosts = red?.hosts || [];
  const conns = red?.conexiones || [];
  const EC = { comprometido:'#dc2626', sospechoso:'#d97706', limpio:'#16a34a', maliciosa:'#dc2626', sospechosa:'#d97706', legitima:'#16a34a' };

  // posiciones para el mapa SVG
  const getPos = (idx, total) => {
    if (total === 1) return { x:250, y:150 };
    const angle = (idx/total)*Math.PI*2 - Math.PI/2;
    return { x:250+Math.cos(angle)*130, y:150+Math.sin(angle)*100 };
  };
  const positions = hosts.reduce((acc,h,i)=>({ ...acc,[h.id]:getPos(i,hosts.length) }),{});

  return (
    <div style={{ display:'flex',height:'100%',fontSize:12,background:'#fff' }}>
      {/* sidebar */}
      <div style={{ width:240,borderRight:'1px solid #e2e8f0',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'8px 10px',borderBottom:'1px solid #e2e8f0',display:'flex',gap:4,background:'#f8fafc',flexShrink:0 }}>
          <button onClick={()=>setView('lista')} style={{ flex:1,fontSize:10,padding:'3px 0',borderRadius:4,cursor:'pointer',fontWeight:700,border:`1px solid ${view==='lista'?'#0078d4':'#e2e8f0'}`,background:view==='lista'?'#0078d422':'transparent',color:view==='lista'?'#0078d4':'#64748b' }}>≡ Lista</button>
          <button onClick={()=>setView('mapa')} style={{ flex:1,fontSize:10,padding:'3px 0',borderRadius:4,cursor:'pointer',fontWeight:700,border:`1px solid ${view==='mapa'?'#0078d4':'#e2e8f0'}`,background:view==='mapa'?'#0078d422':'transparent',color:view==='mapa'?'#0078d4':'#64748b' }}>🌐 Mapa</button>
        </div>
        {view==='lista' ? (
          <div style={{ flex:1,overflowY:'auto' }}>
            <div style={{ padding:'6px 10px',fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.06em',background:'#f8fafc',borderBottom:'1px solid #e2e8f0' }}>Hosts ({hosts.length})</div>
            {hosts.map(h=>(
              <div key={h.id} onClick={()=>setSel(h)} style={{ padding:'10px 12px',borderBottom:'1px solid #f1f5f9',cursor:'pointer',display:'flex',alignItems:'center',gap:8,background:sel?.id===h.id?(EC[h.estado]||'#0078d4')+'08':'transparent',transition:'background .12s' }}>
                <div style={{ width:9,height:9,borderRadius:'50%',background:EC[h.estado]||'#94a3b8',flexShrink:0 }}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{h.nombre}</div>
                  <div style={{ fontSize:10,color:'#94a3b8',fontFamily:'monospace' }}>{h.ip}</div>
                </div>
                <span style={{ fontSize:9,padding:'1px 5px',borderRadius:8,background:(EC[h.estado]||'#94a3b8')+'18',color:EC[h.estado]||'#94a3b8',fontWeight:700,flexShrink:0 }}>{h.estado?.toUpperCase()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex:1,overflow:'hidden',padding:8,display:'flex',flexDirection:'column' }}>
            <svg width="100%" viewBox="0 0 500 300" style={{ flex:1 }}>
              {/* conexiones */}
              {conns.map((c,i)=>{
                const from=positions[c.origen]; const to=positions[c.destino];
                if(!from||!to) return null;
                return (
                  <g key={i}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={EC[c.estado]||'#94a3b8'} strokeWidth={c.estado==='maliciosa'?2:1}
                      strokeDasharray={c.estado==='maliciosa'?'5,3':c.estado==='sospechosa'?'3,2':'none'}
                      opacity={c.estado==='maliciosa'?.9:.5}/>
                    <text x={(from.x+to.x)/2} y={(from.y+to.y)/2-4} fontSize="8" fill={EC[c.estado]||'#94a3b8'} textAnchor="middle">{c.protocolo}:{c.puerto}</text>
                  </g>
                );
              })}
              {/* hosts */}
              {hosts.map(h=>{
                const pos=positions[h.id]; if(!pos) return null;
                const isSel=sel?.id===h.id;
                return (
                  <g key={h.id} onClick={()=>setSel(h)} style={{ cursor:'pointer' }}>
                    <circle cx={pos.x} cy={pos.y} r={isSel?20:16} fill="#fff" stroke={EC[h.estado]||'#94a3b8'} strokeWidth={isSel?2.5:1.5}/>
                    <text x={pos.x} y={pos.y+1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={EC[h.estado]||'#64748b'} fontWeight="700">
                      {h.tipo?.includes('Controller')?'DC':h.tipo?.includes('Server')||h.tipo?.includes('Web')?'SRV':'WS'}
                    </text>
                    <text x={pos.x} y={pos.y+28} textAnchor="middle" fontSize="8" fill="#374151">{h.nombre?.length>12?h.nombre.slice(0,12)+'…':h.nombre}</text>
                    <text x={pos.x} y={pos.y+38} textAnchor="middle" fontSize="7.5" fill="#94a3b8">{h.ip}</text>
                  </g>
                );
              })}
            </svg>
            {/* leyenda */}
            <div style={{ display:'flex',gap:10,padding:'4px 0',justifyContent:'center',flexShrink:0 }}>
              {[['comprometido','#dc2626'],['sospechoso','#d97706'],['limpio','#16a34a']].map(([l,c])=>(
                <div key={l} style={{ display:'flex',alignItems:'center',gap:4 }}>
                  <div style={{ width:7,height:7,borderRadius:'50%',background:c }}/>
                  <span style={{ fontSize:9,color:'#64748b' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* detail */}
      <div style={{ flex:1,overflowY:'auto',padding:20 }}>
        {sel ? (
          <>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14 }}>
              <div style={{ width:11,height:11,borderRadius:'50%',background:EC[sel.estado]||'#94a3b8' }}/>
              <span style={{ fontSize:15,fontWeight:800,color:'#0f172a' }}>{sel.nombre}</span>
              <span style={{ fontSize:10,padding:'2px 8px',borderRadius:8,background:(EC[sel.estado]||'#94a3b8')+'18',color:EC[sel.estado]||'#94a3b8',fontWeight:700 }}>{sel.estado?.toUpperCase()}</span>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 16px',background:'#f8fafc',borderRadius:8,padding:12,marginBottom:12 }}>
              {[['IP',sel.ip],['Tipo',sel.tipo],['OS',sel.os]].filter(([,v])=>v).map(([k,v])=>(
                <div key={k}><div style={{ fontSize:10,color:'#94a3b8' }}>{k}</div><div style={{ fontSize:11,fontWeight:600,color:'#1d4ed8',fontFamily:'monospace' }}>{v}</div></div>
              ))}
            </div>
            {sel.servicios?.length>0&&(
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10,color:'#94a3b8',marginBottom:5 }}>SERVICIOS EXPUESTOS:</div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                  {sel.servicios.map(s=><span key={s} style={{ fontSize:10,padding:'2px 8px',borderRadius:4,background:'#f1f5f9',color:'#0f172a',fontFamily:'monospace',border:'1px solid #e2e8f0' }}>{s}</span>)}
                </div>
              </div>
            )}
            {sel.notas&&<div style={{ padding:10,background:'#fffbeb',borderRadius:8,border:'1px solid #fde68a',fontSize:11,color:'#92400e',lineHeight:1.5,marginBottom:12 }}>⚠ {sel.notas}</div>}
            <div style={{ fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8 }}>Conexiones activas</div>
            {conns.filter(c=>c.origen===sel.id||c.destino===sel.id).length===0
              ? <div style={{ fontSize:11,color:'#94a3b8' }}>Sin conexiones registradas</div>
              : conns.filter(c=>c.origen===sel.id||c.destino===sel.id).map((c,i)=>{
                const other = c.origen===sel.id ? hosts.find(h=>h.id===c.destino) : hosts.find(h=>h.id===c.origen);
                return (
                  <div key={i} style={{ padding:'8px 12px',borderRadius:6,marginBottom:4,background:'#f8fafc',border:`1px solid ${EC[c.estado]||'#e2e8f0'}44`,display:'flex',alignItems:'center',gap:10 }}>
                    <div style={{ width:7,height:7,borderRadius:'50%',background:EC[c.estado]||'#94a3b8',flexShrink:0 }}/>
                    <span style={{ fontFamily:'monospace',fontSize:11,color:'#0f172a' }}>{c.origen===sel.id?'→':'←'} {other?.nombre||'externo'} ({other?.ip||'?'})</span>
                    <span style={{ fontSize:10,color:'#64748b' }}>{c.protocolo}:{c.puerto}</span>
                    {c.descripcion&&<span style={{ fontSize:10,color:'#64748b',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{c.descripcion}</span>}
                    <span style={{ fontSize:9,fontWeight:700,color:EC[c.estado]||'#94a3b8',flexShrink:0 }}>{c.estado?.toUpperCase()}</span>
                  </div>
                );
              })
            }
          </>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:12,color:'#94a3b8' }}>
            <div style={{ fontSize:48 }}>🌐</div>
            <div style={{ fontSize:13 }}>Selecciona un host para ver detalles</div>
            <div style={{ fontSize:11,color:'#cbd5e1',textAlign:'center',maxWidth:200 }}>Cambia a vista Mapa para ver las conexiones visualmente</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── APP: INCIDENT REPORT ────────────────────────────────────────────────── */
function ReportApp({ preguntas, labId, onSubmit, submitting, queriesCount }) {
  // Cargar borrador guardado
  const loadDraft = () => {
    try { const d=JSON.parse(localStorage.getItem(`${DRAFT_KEY}:${labId}`)||'{}'); return { resp:d.resp||{}, inf:d.inf||'' }; }
    catch { return { resp:{}, inf:'' }; }
  };
  const init = loadDraft();
  const [resp, setResp] = useState(init.resp);
  const [inf,  setInf]  = useState(init.inf);
  const [tab,  setTab]  = useState('preguntas');
  const [saved,setSaved]= useState(false);
  const acc = '#0078d4';
  const respondidas = preguntas.filter(p=>resp[String(p.id)]?.trim()).length;

  // Auto-guardar borrador cada vez que cambia
  useEffect(()=>{
    if(!labId) return;
    localStorage.setItem(`${DRAFT_KEY}:${labId}`, JSON.stringify({ resp, inf }));
    setSaved(true);
    const t=setTimeout(()=>setSaved(false),1500);
    return ()=>clearTimeout(t);
  },[resp, inf, labId]);

  const handleSubmit = () => {
    onSubmit({ respuestas:resp, informe_libre:inf });
    localStorage.removeItem(`${DRAFT_KEY}:${labId}`);
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',background:'#fff',fontSize:13,fontFamily:'Segoe UI,sans-serif' }}>
      <div style={{ display:'flex',borderBottom:'1px solid #e2e8f0',flexShrink:0,background:'#f8fafc',alignItems:'center' }}>
        {['preguntas','informe'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'10px 18px',border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:tab===t?'#fff':'transparent',color:tab===t?acc:'#64748b',borderBottom:tab===t?`2px solid ${acc}`:'2px solid transparent',transition:'all .15s' }}>
            {t==='preguntas'?`📋 Preguntas (${respondidas}/${preguntas.length})`:'📝 Informe libre'}
          </button>
        ))}
        {saved&&<span style={{ marginLeft:'auto',marginRight:12,fontSize:10,color:'#10b981',display:'flex',alignItems:'center',gap:4 }}>✓ Borrador guardado</span>}
      </div>
      <div style={{ flex:1,overflowY:'auto',padding:14 }}>
        {tab==='preguntas' ? (
          <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
            {preguntas.map(p=>(
              <div key={p.id} style={{ border:`1px solid ${resp[String(p.id)]?acc+'44':'#e2e8f0'}`,borderRadius:10,padding:'13px 15px',background:resp[String(p.id)]?'#f0f9ff':'#fafafa',transition:'all .2s' }}>
                <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:7 }}>
                  <div style={{ width:22,height:22,borderRadius:'50%',flexShrink:0,background:resp[String(p.id)]?'#10b98122':'#f1f5f9',border:`1px solid ${resp[String(p.id)]?'#10b981':'#e2e8f0'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:resp[String(p.id)]?'#10b981':'#94a3b8' }}>
                    {resp[String(p.id)]?'✓':p.id}
                  </div>
                  <span style={{ fontSize:10,fontWeight:700,color:acc,textTransform:'uppercase',letterSpacing:'.04em' }}>{p.categoria}</span>
                </div>
                {/* PREGUNTA SIEMPRE VISIBLE ENCIMA */}
                <div style={{ fontSize:13,fontWeight:600,color:'#0f172a',lineHeight:1.6,marginBottom:9 }}>{p.pregunta}</div>
                <input value={resp[String(p.id)]||''} onChange={e=>setResp(r=>({...r,[String(p.id)]:e.target.value}))}
                  placeholder={p.placeholder||'Escribe tu respuesta aquí...'}
                  style={{ width:'100%',padding:'8px 11px',borderRadius:6,border:`1px solid ${resp[String(p.id)]?acc+'66':'#e2e8f0'}`,background:'#fff',color:'#0f172a',fontSize:12,outline:'none',boxSizing:'border-box',fontFamily:'inherit',transition:'border-color .2s' }}
                  onFocus={e=>e.target.style.borderColor=acc} onBlur={e=>e.target.style.borderColor=resp[String(p.id)]?acc+'66':'#e2e8f0'}/>
                {/* PISTA SIEMPRE VISIBLE DEBAJO */}
                <div style={{ display:'flex',gap:5,alignItems:'flex-start',marginTop:7,padding:'5px 9px',borderRadius:5,background:'#fffbeb',border:'1px solid #fde68a' }}>
                  <span style={{ flexShrink:0 }}>💡</span>
                  <span style={{ fontSize:11,color:'#92400e',lineHeight:1.5 }}>{p.pista}</span>
                </div>
              </div>
            ))}
            <div>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b',marginBottom:5 }}><span>Progreso del análisis</span><span>{respondidas}/{preguntas.length} preguntas respondidas</span></div>
              <div style={{ height:5,background:'#f1f5f9',borderRadius:3 }}>
                <div style={{ height:'100%',borderRadius:3,width:`${preguntas.length>0?(respondidas/preguntas.length)*100:0}%`,background:`linear-gradient(90deg,${acc},#106ebe)`,transition:'width .4s' }}/>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            <div style={{ fontSize:12,color:'#475569',lineHeight:1.7,padding:'8px 10px',background:'#f8fafc',borderRadius:7,border:'1px solid #e2e8f0' }}>
              Describe la cadena completa del ataque: vector de entrada, técnicas MITRE usadas, sistemas afectados, movimiento lateral o persistencia identificada, y acciones de remediación. Un análisis detallado puede sumar hasta <strong>+10 puntos extra</strong>.
            </div>
            <textarea value={inf} onChange={e=>setInf(e.target.value)} placeholder="Escribe aquí tu análisis técnico completo del incidente..."
              style={{ minHeight:200,padding:'12px 14px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',color:'#0f172a',fontSize:12,lineHeight:1.7,outline:'none',resize:'vertical',fontFamily:'inherit' }}
              onFocus={e=>e.target.style.borderColor=acc} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
            <div style={{ fontSize:11,color:'#94a3b8' }}>Mínimo recomendado: 150 palabras · Actual: {inf.trim().split(/\s+/).filter(Boolean).length} palabras</div>
          </div>
        )}
      </div>
      <div style={{ padding:'10px 14px',borderTop:'1px solid #e2e8f0',flexShrink:0,background:'#f8fafc' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:11,color:'#64748b' }}>
          <span>🔍 <strong style={{ color:acc }}>{queriesCount}</strong> herramientas usadas</span>
          <span>✅ <strong style={{ color:respondidas===preguntas.length?'#10b981':acc }}>{respondidas}/{preguntas.length}</strong> preguntas</span>
        </div>
        <button onClick={handleSubmit} disabled={submitting||respondidas===0}
          style={{ width:'100%',padding:'13px 0',borderRadius:8,border:'none',background:submitting||respondidas===0?'#e2e8f0':'linear-gradient(135deg,#10b981,#059669)',color:submitting||respondidas===0?'#94a3b8':'#fff',fontSize:13,fontWeight:700,cursor:submitting||respondidas===0?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s' }}>
          {submitting?'⏳ La IA está evaluando tu análisis...':'📤 Enviar análisis para evaluación'}
        </button>
        {respondidas===0&&<div style={{ fontSize:10,color:'#94a3b8',textAlign:'center',marginTop:5 }}>Responde al menos una pregunta para poder enviar</div>}
      </div>
    </div>
  );
}

/* ─── pantalla resultado ──────────────────────────────────────────────────── */
function Resultados({ resultado, escenario, onNew, onDash }) {
  const [tab, setTab] = useState('resumen');
  const pct   = Math.round(resultado.puntuacion_normalizada||0);
  const color = pct>=80?'#10b981':pct>=50?'#f59e0b':'#ef4444';
  const emoji = pct>=80?'🏆':pct>=50?'👍':'📚';
  const SL    = { siem_queries:'SIEM & Queries',forense_digital:'Forense Digital',threat_hunting:'Threat Hunting',analisis_logs:'Análisis de Logs',inteligencia_amenazas:'Intel. Amenazas' };

  return (
    <div style={{ minHeight:'100vh',background:'#f0f4ff',fontFamily:'Segoe UI,Inter,sans-serif',padding:32,color:'#0f172a' }}>
      <div style={{ maxWidth:860,margin:'0 auto' }}>
        {/* header */}
        <div style={{ background:'#fff',borderRadius:16,padding:'28px 32px',marginBottom:20,boxShadow:'0 2px 12px rgba(0,0,0,.06)',border:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:12,color:'#64748b',fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em' }}>Laboratorio completado {emoji}</div>
            <div style={{ fontSize:22,fontWeight:800,letterSpacing:'-.5px' }}>{escenario?.titulo||'Lab SOC'}</div>
            <div style={{ fontSize:12,color:'#64748b',marginTop:4 }}>{escenario?.nivel} · Sin límite de tiempo</div>
          </div>
          <div style={{ textAlign:'right' }}><div style={{ fontSize:56,fontWeight:900,color,lineHeight:1 }}>{pct}</div><div style={{ fontSize:12,color:'#64748b' }}>/100 puntos</div></div>
        </div>
        {/* stats */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20 }}>
          {[['⚡ XP Ganada',`+${resultado.xp_ganada||0}`,'#4f46e5'],['🔗 Cadena',`${resultado.cadena_ataque_descubierta||0}%`,color],['🔍 Queries',`+${resultado.puntuacion_queries||0} pts`,'#10b981'],['📋 Informe',`+${resultado.puntuacion_informe||0} pts`,'#f59e0b']].map(([l,v,c])=>(
            <div key={l} style={{ background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'16px 18px' }}>
              <div style={{ fontSize:11,color:'#64748b',marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:22,fontWeight:800,color:c }}>{v}</div>
            </div>
          ))}
        </div>
        {/* tabs */}
        <div style={{ display:'flex',gap:6,marginBottom:14 }}>
          {['resumen','preguntas','skills','solucion'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 18px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:700,border:`1px solid ${tab===t?'#0078d4':'#e2e8f0'}`,background:tab===t?'#0078d408':'#fff',color:tab===t?'#0078d4':'#64748b',transition:'all .15s' }}>
              {t==='resumen'?'📊 Resumen':t==='preguntas'?'❓ Preguntas':t==='skills'?'📈 Skills':'🔓 Solución'}
            </button>
          ))}
        </div>
        <div style={{ background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:24,marginBottom:20,minHeight:200 }}>
          {tab==='resumen'&&<p style={{ fontSize:14,color:'#374151',lineHeight:1.8 }}>{resultado.feedback_general}</p>}
          {tab==='preguntas'&&(resultado.feedback_preguntas||[]).map(fp=>(
            <div key={fp.id} style={{ padding:'13px 15px',borderRadius:10,background:fp.correcto?'#f0fdf4':'#fef2f2',border:`1px solid ${fp.correcto?'#bbf7d0':'#fecaca'}`,marginBottom:10 }}>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
                <span style={{ fontSize:18 }}>{fp.correcto?'✅':'❌'}</span>
                <span style={{ fontSize:13,fontWeight:700 }}>Pregunta {fp.id}</span>
                <span style={{ fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:6,background:fp.correcto?'#bbf7d0':'#fecaca',color:fp.correcto?'#15803d':'#dc2626' }}>{fp.puntos}/10 pts</span>
              </div>
              <div style={{ fontSize:12,color:'#64748b',marginBottom:4 }}>Respuesta correcta: <span style={{ color:'#1d4ed8',fontWeight:600,fontFamily:'monospace' }}>{fp.respuesta_correcta}</span></div>
              <div style={{ fontSize:12,color:'#374151',lineHeight:1.6 }}>{fp.feedback}</div>
            </div>
          ))}
          {tab==='skills'&&<div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {Object.entries(resultado.skills_mejoradas||{}).map(([sk,d])=>{
              const delta=typeof d==='object'?d.delta:d;
              return (
                <div key={sk} style={{ display:'flex',alignItems:'center',gap:14 }}>
                  <div style={{ width:164,fontSize:13,color:'#374151',fontWeight:600 }}>{SL[sk]||sk}</div>
                  <div style={{ flex:1,height:8,background:'#e2e8f0',borderRadius:4 }}>
                    <div style={{ height:'100%',borderRadius:4,width:`${(delta/0.3)*100}%`,background:delta>=0.2?'#10b981':delta>0?'#f59e0b':'#e2e8f0',transition:'width .8s ease' }}/>
                  </div>
                  <div style={{ width:52,fontSize:13,color:delta>0?'#10b981':'#94a3b8',textAlign:'right',fontWeight:700 }}>{delta>0?`+${delta.toFixed(2)}`:'—'}</div>
                </div>
              );
            })}
          </div>}
          {tab==='solucion'&&resultado.solucion_completa&&(
            <div>
              <p style={{ fontSize:13,color:'#374151',lineHeight:1.8,marginBottom:16 }}>{resultado.solucion_completa.resumen}</p>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11,fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10 }}>Cadena del ataque:</div>
                {(resultado.solucion_completa.cadena_ataque||[]).map((p,i)=>(
                  <div key={i} style={{ display:'flex',gap:12,marginBottom:8 }}>
                    <div style={{ width:24,height:24,borderRadius:'50%',flexShrink:0,background:'#0078d408',border:'1px solid #0078d4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'#0078d4' }}>{i+1}</div>
                    <div style={{ fontSize:12,color:'#374151',lineHeight:1.6,paddingTop:3 }}>{p}</div>
                  </div>
                ))}
              </div>
              {resultado.solucion_completa.tecnicas_mitre?.length>0&&(
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11,fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8 }}>TTPs MITRE ATT&CK:</div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
                    {resultado.solucion_completa.tecnicas_mitre.map(t=><span key={t} style={{ fontSize:11,padding:'3px 10px',borderRadius:6,background:'#ede9fe',color:'#7c3aed',fontWeight:700 }}>{t}</span>)}
                  </div>
                </div>
              )}
              {resultado.solucion_completa.lecciones&&(
                <div style={{ padding:14,background:'#fffbeb',borderRadius:10,border:'1px solid #fde68a' }}>
                  <div style={{ fontSize:11,fontWeight:800,color:'#92400e',marginBottom:4 }}>💡 LECCIONES APRENDIDAS</div>
                  <div style={{ fontSize:12,color:'#78350f',lineHeight:1.7 }}>{resultado.solucion_completa.lecciones}</div>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ display:'flex',gap:12 }}>
          <button onClick={onNew} style={{ flex:1,padding:'14px 0',borderRadius:10,border:'none',background:'linear-gradient(135deg,#0078d4,#106ebe)',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer' }}>🔬 Nuevo laboratorio</button>
          <button onClick={onDash} style={{ flex:1,padding:'14px 0',borderRadius:10,background:'#fff',border:'1px solid #e2e8f0',color:'#374151',fontSize:14,fontWeight:700,cursor:'pointer' }}>← Dashboard</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ────────────────────────────────────────────────────────────────── */
const APPS_DEF = [
  { id:'siem',    label:'SIEM Alerts',     icon:'🖥️', dX:60,  dY:40,  dW:740, dH:520 },
  { id:'logs',    label:'Log Explorer',    icon:'📋', dX:120, dY:80,  dW:700, dH:500 },
  { id:'network', label:'Network Monitor', icon:'🌐', dX:180, dY:120, dW:680, dH:480 },
  { id:'terminal',label:'Terminal',        icon:'💻', dX:240, dY:160, dW:660, dH:420 },
  { id:'report',  label:'Incident Report', icon:'📝', dX:300, dY:80,  dW:600, dH:580 },
];

export default function LabPage() {
  const navigate = useNavigate();
  const [fase,       setFase]       = useState('intro');
  const [escenario,  setEscenario]  = useState(null);
  const [resultado,  setResultado]  = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [queries,    setQueries]    = useState([]);
  const [showOB,     setShowOB]     = useState(false);
  const [tickTime,   setTickTime]   = useState(clock());
  const [focused,    setFocused]    = useState(null);
  const [reportBadge,setRB]         = useState(false); // notificación en icono Report
  const idleRef = useRef(null);

  const initWins = () => APPS_DEF.reduce((a,app)=>({...a,[app.id]:{open:false,minimized:false}}),{});
  const [wins, setWins] = useState(initWins);

  useEffect(()=>{ const iv=setInterval(()=>setTickTime(clock()),15000); return()=>clearInterval(iv); },[]);
  useEffect(()=>{ if(!localStorage.getItem(OB_KEY)) setShowOB(true); },[]);

  // Badge en report si lleva 8+ min sin abrirlo y hay alertas cargadas
  useEffect(()=>{
    if(fase!=='lab'||!escenario) return;
    idleRef.current = setTimeout(()=>{ if(!wins.report?.open) setRB(true); }, 8*60*1000);
    return()=>clearTimeout(idleRef.current);
  },[fase,escenario]);

  // Atajos de teclado
  useEffect(()=>{
    if(fase!=='lab') return;
    const handler = e => {
      if(e.ctrlKey) {
        const map = {'1':'siem','2':'logs','3':'network','4':'terminal','5':'report'};
        if(map[e.key]) { e.preventDefault(); openApp(map[e.key]); }
        if(e.key==='t'||e.key==='T') { e.preventDefault(); openApp('terminal'); }
      }
    };
    window.addEventListener('keydown',handler);
    return()=>window.removeEventListener('keydown',handler);
  },[fase,wins]);

  const onQuery = useCallback(q=>setQueries(p=>p.includes(q)?p:[...p,q]),[]);
  const openApp  = id => { setWins(w=>({...w,[id]:{open:true,minimized:false}})); setFocused(id); onQuery(`OPEN:${id}`); if(id==='report') setRB(false); };
  const closeApp = id => setWins(w=>({...w,[id]:{...w[id],open:false}}));
  const minApp   = id => setWins(w=>({...w,[id]:{...w[id],minimized:true}}));
  const taskClick = id => {
    const w=wins[id]; if(!w?.open) return;
    if(w.minimized){ setWins(ww=>({...ww,[id]:{...ww[id],minimized:false}})); setFocused(id); }
    else if(focused===id) minApp(id);
    else setFocused(id);
  };

  const iniciarLab = async () => {
    setLoading(true); setError('');
    try {
      const d = await apiFetch('/lab/generar',{method:'POST'});
      setEscenario(d); setQueries([]); setFase('boot');
    } catch(e){ setError(e.message||'Error generando el laboratorio'); }
    finally{ setLoading(false); }
  };

  const enviar = async ({respuestas,informe_libre}) => {
    setSubmitting(true); setError('');
    try {
      const d = await apiFetch('/lab/evaluar',{method:'POST',body:JSON.stringify({lab_id:escenario.lab_id,respuestas,informe_libre,queries_usadas:queries})});
      setResultado(d); setFase('resultado');
    } catch(e){ setError(e.message||'Error evaluando'); }
    finally{ setSubmitting(false); }
  };

  const nuevoLab = () => { setEscenario(null);setResultado(null);setFase('intro');setWins(initWins());setQueries([]);setRB(false); };

  /* ── intro ── */
  if(fase==='intro') return (
    <div style={{ minHeight:'100vh',background:'#f0f4ff',fontFamily:'Segoe UI,Inter,sans-serif',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
      {showOB&&<Onboarding onDone={()=>{localStorage.setItem(OB_KEY,'1');setShowOB(false);}}/>}
      <div style={{ maxWidth:560,width:'90%',animation:'fadeUp .4s ease' }}>
        <div style={{ textAlign:'center',marginBottom:28 }}>
          <div style={{ fontSize:52,marginBottom:12 }}>🔬</div>
          <h1 style={{ fontSize:28,fontWeight:900,color:'#0f172a',margin:'0 0 8px',letterSpacing:'-.8px' }}>Laboratorio SOC</h1>
          <p style={{ fontSize:15,color:'#64748b',lineHeight:1.7,margin:0 }}>Accede a una máquina comprometida. Investiga con las herramientas del SOC. Redacta tu informe forense.</p>
        </div>
        <div style={{ background:'#fff',borderRadius:16,padding:'28px 32px',boxShadow:'0 4px 20px rgba(0,0,0,.06)',border:'1px solid #e2e8f0',marginBottom:16 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:22 }}>
            {[['🖥️','SIEM Alerts','Alertas con severidad y detalle'],['📋','Log Explorer','Logs filtrables con búsqueda y highlight'],['🌐','Network Monitor','Hosts, mapa SVG y conexiones'],['💻','Terminal Windows','20+ comandos reales (help para verlos)'],['📝','Incident Report','Preguntas + informe evaluado por IA'],['⏱','Sin límite de tiempo','Investiga todo lo que necesites']].map(([icon,title,desc])=>(
              <div key={title} style={{ display:'flex',gap:10,padding:'10px 12px',borderRadius:10,background:'#f8fafc',border:'1px solid #e2e8f0' }}>
                <span style={{ fontSize:20,flexShrink:0 }}>{icon}</span>
                <div><div style={{ fontSize:12,fontWeight:700,color:'#0f172a',marginBottom:2 }}>{title}</div><div style={{ fontSize:11,color:'#64748b' }}>{desc}</div></div>
              </div>
            ))}
          </div>
          <div style={{ padding:'8px 12px',background:'#f0f9ff',borderRadius:8,border:'1px solid #bae6fd',marginBottom:14,fontSize:11,color:'#0c4a6e' }}>
            ⌨️ <strong>Atajos:</strong> Ctrl+1 SIEM · Ctrl+2 Logs · Ctrl+3 Red · Ctrl+4 Terminal · Ctrl+5 Informe
          </div>
          <button onClick={iniciarLab} disabled={loading} style={{ width:'100%',padding:'15px 0',borderRadius:10,border:'none',background:loading?'#e2e8f0':'linear-gradient(135deg,#0078d4,#106ebe)',color:loading?'#94a3b8':'#fff',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,boxShadow:loading?'none':'0 4px 14px rgba(0,120,212,.35)',transition:'all .2s' }}>
            {loading?'⏳ Generando escenario con IA (puede tardar ~20s)...':'⚡ Iniciar Laboratorio'}
          </button>
          {error&&<div style={{ marginTop:10,padding:'10px 14px',borderRadius:8,background:'#fef2f2',border:'1px solid #fecaca',fontSize:12,color:'#dc2626' }}>⚠ {error}</div>}
        </div>
        <div style={{ textAlign:'center',fontSize:12,color:'#94a3b8' }}>El escenario se adapta a tu arena · Solo XP y habilidades, sin copas</div>
      </div>
    </div>
  );

  if(fase==='boot') return <BootScreen onDone={()=>setFase('lab')}/>;
  if(fase==='resultado') return <Resultados resultado={resultado} escenario={escenario} onNew={nuevoLab} onDash={()=>navigate('/dashboard')}/>;

  /* ── lab ── */
  const taskApps = APPS_DEF.filter(a=>wins[a.id]?.open);
  return (
    <div style={{ width:'100vw',height:'100vh',overflow:'hidden',fontFamily:'Segoe UI,sans-serif',userSelect:'none' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#f1f5f9}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:#94a3b8}
      `}</style>

      {/* escritorio */}
      <div style={{ position:'relative',width:'100%',height:'calc(100vh - 40px)',background:'linear-gradient(160deg,#1e3a8a 0%,#1d4ed8 45%,#2563eb 75%,#1e40af 100%)',overflow:'hidden' }}>
        {/* wallpaper dots */}
        <div style={{ position:'absolute',inset:0,opacity:.05,backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none' }}/>

        {/* objetivo banner */}
        <div style={{ position:'absolute',top:0,left:0,right:0,padding:'5px 14px',background:'rgba(0,0,0,.6)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',gap:10,zIndex:5,borderBottom:'1px solid rgba(255,255,255,.1)' }}>
          <span style={{ fontSize:10,fontWeight:800,color:'#fbbf24',letterSpacing:'.06em',flexShrink:0 }}>🎯 OBJETIVO:</span>
          <span style={{ fontSize:11,color:'rgba(255,255,255,.8)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1 }}>{escenario?.objetivo||escenario?.descripcion}</span>
          <div style={{ display:'flex',gap:8,alignItems:'center',flexShrink:0 }}>
            <span style={{ fontSize:10,color:'rgba(255,255,255,.5)' }}>🔍 <span style={{ color:'#7dd3fc' }}>{queries.length}</span></span>
            <span style={{ fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:'monospace' }}>{escenario?.nivel}</span>
            <button onClick={()=>navigate('/dashboard')} style={{ fontSize:10,padding:'3px 10px',borderRadius:5,background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',color:'rgba(255,255,255,.7)',cursor:'pointer' }}>← Dashboard</button>
          </div>
        </div>

        {/* iconos escritorio */}
        <div style={{ position:'absolute',top:34,left:14,display:'flex',flexDirection:'column',gap:6,zIndex:4 }}>
          {APPS_DEF.map(a=>(
            <DIcon key={a.id} icon={a.icon} label={a.label} badge={a.id==='report'&&reportBadge} onClick={()=>openApp(a.id)}/>
          ))}
        </div>

        {/* ventanas */}
        {APPS_DEF.map(app=>wins[app.id]?.open&&!wins[app.id]?.minimized?(
          <AppWindow key={app.id} title={app.label} icon={app.icon}
            onClose={()=>closeApp(app.id)} onMinimize={()=>minApp(app.id)}
            onFocus={()=>setFocused(app.id)} focused={focused===app.id}
            defaultX={app.dX} defaultY={app.dY+28} defaultW={app.dW} defaultH={app.dH}>
            {app.id==='siem'    &&<SIEMApp    alertas={escenario?.alertas_siem||[]} onQuery={onQuery}/>}
            {app.id==='logs'    &&<LogApp     logs={escenario?.logs||[]}            onQuery={onQuery}/>}
            {app.id==='network' &&<NetworkApp red={escenario?.red}/>}
            {app.id==='terminal'&&<TerminalApp escenario={escenario}                onQuery={onQuery}/>}
            {app.id==='report'  &&<ReportApp  preguntas={escenario?.preguntas||[]} labId={escenario?.lab_id} onSubmit={enviar} submitting={submitting} queriesCount={queries.length}/>}
          </AppWindow>
        ):null)}

        {error&&<div style={{ position:'absolute',bottom:60,left:'50%',transform:'translateX(-50%)',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 20px',color:'#dc2626',fontSize:12,zIndex:9999 }}>{error}</div>}
      </div>

      {/* taskbar */}
      <div style={{ position:'fixed',bottom:0,left:0,right:0,height:40,background:'rgba(8,12,22,.97)',backdropFilter:'blur(16px)',borderTop:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',padding:'0 6px',gap:3,zIndex:200 }}>
        <div style={{ width:34,height:32,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,cursor:'pointer',flexShrink:0 }}>🪟</div>
        <div style={{ width:1,height:22,background:'rgba(255,255,255,.1)',margin:'0 4px' }}/>
        {taskApps.map(a=>(
          <TBtn key={a.id} icon={a.icon} label={a.label}
            active={focused===a.id&&!wins[a.id]?.minimized}
            minimized={wins[a.id]?.minimized}
            onClick={()=>taskClick(a.id)}/>
        ))}
        <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:12,paddingRight:10 }}>
          <span style={{ fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:'monospace' }}>Ctrl+1-5 para abrir apps</span>
          <span style={{ fontSize:12,color:'rgba(255,255,255,.65)',fontFamily:'Segoe UI' }}>{tickTime}</span>
        </div>
      </div>
    </div>
  );
}