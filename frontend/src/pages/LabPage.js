import React, { useState, useEffect, useRef, useCallback } from 'react';
import Draggable from 'react-draggable';
import { useNavigate } from 'react-router-dom';

const API = 'https://socblast-production.up.railway.app/api';
function getToken() { return localStorage.getItem('token'); }
async function apiFetch(path, opts = {}) {
  const r = await fetch(`${API}${path}`, {
    headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...(opts.headers||{}) },
    ...opts,
  });
  if (!r.ok) throw new Error((await r.json().catch(()=>({}))).detail || r.statusText);
  return r.json();
}

const ONBOARDING_KEY = 'socblast_lab_onboarding_done';
const ONBOARDING_STEPS = [
  { icon:'🖥️', titulo:'Bienvenido al Laboratorio SOC', desc:'Aquí practicas análisis forense real. La IA genera una máquina comprometida y tú debes investigar qué pasó, cómo entró el atacante y cómo remediarlo. Sin límite de tiempo.' },
  { icon:'💻', titulo:'Un ordenador de verdad', desc:'Verás un escritorio real (Windows o Linux según el escenario). Abre las aplicaciones haciendo doble clic en los iconos: SIEM, Terminal, Explorador de logs, Monitor de red e Informe.' },
  { icon:'🔍', titulo:'Investiga libremente', desc:'Usa la Terminal para ejecutar comandos, filtra logs, analiza conexiones de red. Cuantas más herramientas uses, más puntos consigues. Tú decides dónde mirar.' },
  { icon:'📝', titulo:'Responde y envía tu informe', desc:'Abre "Incident Report", responde las preguntas de investigación y redacta tu análisis. La IA evaluará tu trabajo y recibirás XP y mejoras de habilidades.' },
];

function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const s = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',sans-serif" }}>
      <div style={{ background:'#fff',borderRadius:16,padding:'40px 44px',maxWidth:480,width:'90%',boxShadow:'0 24px 64px rgba(0,0,0,0.4)',textAlign:'center' }}>
        <div style={{ fontSize:52,marginBottom:16 }}>{s.icon}</div>
        <div style={{ fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:12 }}>{s.titulo}</div>
        <div style={{ fontSize:14,color:'#475569',lineHeight:1.8,marginBottom:32 }}>{s.desc}</div>
        <div style={{ display:'flex',gap:6,justifyContent:'center',marginBottom:28 }}>
          {ONBOARDING_STEPS.map((_,i)=>(<div key={i} style={{ width:i===step?20:8,height:8,borderRadius:4,background:i===step?'#4f46e5':'#e2e8f0',transition:'all 0.3s' }}/>))}
        </div>
        <div style={{ display:'flex',gap:10 }}>
          {step>0&&(<button onClick={()=>setStep(s=>s-1)} style={{ flex:1,padding:'12px 0',borderRadius:10,border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',fontSize:14,fontWeight:600,cursor:'pointer' }}>← Anterior</button>)}
          <button onClick={()=>isLast?onFinish():setStep(s=>s+1)} style={{ flex:2,padding:'12px 0',borderRadius:10,border:'none',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer' }}>
            {isLast?'¡Empezar laboratorio! 🚀':'Siguiente →'}
          </button>
        </div>
        <button onClick={onFinish} style={{ marginTop:12,background:'none',border:'none',color:'#94a3b8',fontSize:12,cursor:'pointer' }}>Saltar tutorial</button>
      </div>
    </div>
  );
}

function BootScreen({ so, onDone }) {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);
  const WIN_LINES = ['','  Starting Windows...','  Microsoft Windows [Version 10.0.19045.3803]','  (c) Microsoft Corporation. All rights reserved.','','  Loading CORP domain policies...','  Applying security baseline......................... [DONE]','  Starting Windows Defender Antivirus.............. [DONE]','  Connecting to CORP-DC01.corp.local............... [DONE]','  Mounting network drives.......................... [DONE]','  Loading SOC workstation profile.................','','  ██████████████████████████████  100%','','  Welcome, SOC Analyst.'];
  const LIN_LINES = ['[ 0.000000] Linux version 5.15.0-soc (gcc 11.3.0)','[ 0.001234] BIOS-provided physical RAM map','[ 0.423100] Loading initial ramdisk ...','[ 1.204500] systemd[1]: Starting SOC Workstation v2.4...','[ 1.890200] [  OK  ] Started Network Manager','[ 2.103400] [  OK  ] Started OpenSSH Server Daemon','[ 2.450100] [  OK  ] Started Splunk Universal Forwarder','[ 2.901200] [  OK  ] Started Elastic Agent','[ 3.104500] [  OK  ] Reached target Multi-User System','','Ubuntu 22.04.3 LTS soc-workstation tty1','','soc-analyst login: analyst','Password: ••••••••','','Last login: Today from CORP-DC01','Welcome to SoCBlast Forensic Environment.'];
  const bootLines = so==='linux' ? LIN_LINES : WIN_LINES;
  useEffect(()=>{
    let i=0;
    const iv=setInterval(()=>{ if(i<bootLines.length){setLines(l=>[...l,bootLines[i]]);i++;}else{clearInterval(iv);setTimeout(()=>{setDone(true);setTimeout(onDone,500);},700);} },so==='linux'?110:160);
    return()=>clearInterval(iv);
  },[]);
  return (
    <div style={{ position:'fixed',inset:0,zIndex:1000,background:so==='windows'?'#000080':'#0d1117',display:'flex',alignItems:'center',justifyContent:'center',transition:'opacity 0.5s',opacity:done?0:1,fontFamily:"'Courier New',monospace" }}>
      {so==='windows'?(
        <div style={{ textAlign:'center',color:'#fff' }}>
          <div style={{ fontSize:56,marginBottom:20 }}>🪟</div>
          <div style={{ fontSize:13,lineHeight:2.1 }}>{lines.map((l,i)=>(<div key={i} style={{ opacity:i===lines.length-1?1:0.7 }}>{l}</div>))}</div>
        </div>
      ):(
        <div style={{ width:'100%',maxWidth:680,padding:'0 40px',color:'#00ff41',fontSize:12,lineHeight:1.8 }}>
          {lines.map((l,i)=>(<div key={i} style={{ color:l.includes('OK')?'#10b981':l.includes('login')||l.includes('Password')?'#f59e0b':'#00ff41',opacity:i===lines.length-1?1:0.8 }}>{l}</div>))}
        </div>
      )}
    </div>
  );
}

function WinBtn({ label, onClick, red }) {
  const [h,setH]=useState(false);
  return (<div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',background:h?(red?'#ef4444':'rgba(255,255,255,0.15)'):'transparent',borderRadius:3,cursor:'pointer',color:'#fff',fontSize:11,transition:'background 0.15s' }}>{label}</div>);
}

function AppWindow({ app, so, children, onClose, onMinimize, onFocus, isFocused, isMinimized, defaultPos, defaultSize }) {
  const nodeRef=useRef(null);
  const [maximized,setMax]=useState(false);
  if(isMinimized) return null;
  const isLinux=so==='linux';
  const titleBg=isFocused?(isLinux?'#11111b':'#1e293b'):(isLinux?'#1a1a2a':'#374151');
  const winBg=isLinux?'#1e1e2e':'#ffffff';
  const borderC=isFocused?(isLinux?'#7c3aed':'#3b82f6'):'rgba(255,255,255,0.1)';
  const sz=defaultSize||{w:700,h:480};
  return (
    <Draggable nodeRef={nodeRef} handle=".win-tb" defaultPosition={defaultPos||{x:60,y:30}} onStart={onFocus} bounds="parent">
      <div ref={nodeRef} onClick={onFocus} style={{ position:'absolute',zIndex:isFocused?50:10,width:maximized?'100%':sz.w,height:maximized?'calc(100% - 0px)':sz.h,top:maximized?0:undefined,left:maximized?0:undefined,background:winBg,border:`1px solid ${borderC}`,borderRadius:maximized?0:(isLinux?10:6),boxShadow:isFocused?'0 20px 60px rgba(0,0,0,0.5)':'0 4px 20px rgba(0,0,0,0.3)',display:'flex',flexDirection:'column',overflow:'hidden',transition:'box-shadow 0.2s',fontFamily:isLinux?"'Ubuntu Mono','Fira Code',monospace":"'Segoe UI','Inter',sans-serif" }}>
        <div className="win-tb" style={{ height:34,background:titleBg,display:'flex',alignItems:'center',padding:'0 10px',gap:8,cursor:'move',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,0.1)',userSelect:'none' }}>
          {isLinux&&(<div style={{ display:'flex',gap:6,marginRight:4 }}><div onClick={e=>{e.stopPropagation();onClose();}} style={{ width:12,height:12,borderRadius:'50%',background:'#ef4444',cursor:'pointer' }}/><div onClick={e=>{e.stopPropagation();onMinimize();}} style={{ width:12,height:12,borderRadius:'50%',background:'#f59e0b',cursor:'pointer' }}/><div onClick={e=>{e.stopPropagation();setMax(m=>!m);}} style={{ width:12,height:12,borderRadius:'50%',background:'#10b981',cursor:'pointer' }}/></div>)}
          <span style={{ fontSize:13 }}>{app.icon}</span>
          <span style={{ fontSize:12,color:'#fff',fontWeight:600,flex:1 }}>{app.label}</span>
          {!isLinux&&(<div style={{ display:'flex',gap:1 }}><WinBtn label="─" onClick={e=>{e.stopPropagation();onMinimize();}}/><WinBtn label="⛶" onClick={e=>{e.stopPropagation();setMax(m=>!m);}}/><WinBtn label="✕" onClick={e=>{e.stopPropagation();onClose();}} red/></div>)}
        </div>
        <div style={{ flex:1,overflow:'hidden',display:'flex',flexDirection:'column' }}>{children}</div>
      </div>
    </Draggable>
  );
}

function DesktopIcon({ app, onOpen, so }) {
  const [h,setH]=useState(false);
  if(so==='linux') return (<div onDoubleClick={onOpen} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} title={app.label} style={{ width:52,height:52,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',background:h?'rgba(255,255,255,0.18)':'rgba(255,255,255,0.08)',cursor:'pointer',transition:'all 0.2s',transform:h?'scale(1.1)':'scale(1)',fontSize:24 }}>{app.icon}</div>);
  return (<div onDoubleClick={onOpen} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 6px',borderRadius:6,cursor:'pointer',background:h?'rgba(255,255,255,0.22)':'transparent',transition:'background 0.15s',width:76 }}><div style={{ fontSize:34 }}>{app.icon}</div><div style={{ fontSize:11,color:'#fff',textAlign:'center',lineHeight:1.2,textShadow:'0 1px 3px rgba(0,0,0,0.9)',fontWeight:500 }}>{app.label}</div></div>);
}

function WinDesktop({ children, apps, openApp, taskbarApps, focusedApp, minimizedApps, onTaskbarClick }) {
  return (
    <div style={{ width:'100%',height:'100%',position:'relative',background:'linear-gradient(160deg,#1e3a8a,#1d4ed8)',overflow:'hidden',fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ position:'absolute',inset:0,opacity:0.03,backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',backgroundSize:'32px 32px' }}/>
      <div style={{ position:'absolute',top:20,left:20,display:'flex',flexDirection:'column',gap:16 }}>
        {apps.map(a=>(<DesktopIcon key={a.id} app={a} onOpen={()=>openApp(a.id)} so="windows"/>))}
      </div>
      <div style={{ position:'absolute',inset:0,bottom:40 }}>{children}</div>
      <div style={{ position:'absolute',bottom:0,left:0,right:0,height:40,background:'rgba(10,15,30,0.96)',backdropFilter:'blur(10px)',borderTop:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',padding:'0 8px',gap:4,zIndex:200 }}>
        <div style={{ width:32,height:32,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>🪟</div>
        <div style={{ width:1,height:24,background:'rgba(255,255,255,0.15)',margin:'0 4px' }}/>
        {taskbarApps.map(a=>(<div key={a.id} onClick={()=>onTaskbarClick(a.id)} style={{ padding:'4px 12px',borderRadius:4,cursor:'pointer',fontSize:11,background:focusedApp===a.id?'rgba(255,255,255,0.2)':minimizedApps.includes(a.id)?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.1)',color:'#fff',display:'flex',alignItems:'center',gap:6,border:focusedApp===a.id?'1px solid rgba(255,255,255,0.3)':'1px solid transparent',transition:'all 0.15s' }}><span>{a.icon}</span><span style={{ fontWeight:500 }}>{a.label}</span></div>))}
        <div style={{ marginLeft:'auto',color:'rgba(255,255,255,0.7)',fontSize:11,padding:'0 12px' }}>{new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</div>
      </div>
    </div>
  );
}

function LinuxDesktop({ children, apps, openApp, taskbarApps, focusedApp, onTaskbarClick }) {
  return (
    <div style={{ width:'100%',height:'100%',position:'relative',background:'linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)',overflow:'hidden',fontFamily:"'Ubuntu','Inter',sans-serif" }}>
      <div style={{ position:'absolute',top:0,left:0,right:0,height:28,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',padding:'0 14px',gap:20,zIndex:200,borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontSize:12,fontWeight:800,color:'#e2e8f0' }}>SoCBlast OS</span>
        <span style={{ fontSize:11,color:'rgba(255,255,255,0.4)' }}>Forensic Workstation</span>
        <div style={{ marginLeft:'auto',display:'flex',gap:16,alignItems:'center' }}>
          {taskbarApps.map(a=>(<div key={a.id} onClick={()=>onTaskbarClick(a.id)} style={{ fontSize:11,color:focusedApp===a.id?'#fff':'rgba(255,255,255,0.55)',cursor:'pointer',fontWeight:focusedApp===a.id?700:400 }}>{a.icon} {a.label}</div>))}
          <span style={{ fontSize:11,color:'rgba(255,255,255,0.4)' }}>{new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</span>
        </div>
      </div>
      <div style={{ position:'absolute',left:0,top:28,bottom:0,width:66,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)',borderRight:'1px solid rgba(255,255,255,0.07)',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:14,gap:8,zIndex:200 }}>
        {apps.map(a=>(<DesktopIcon key={a.id} app={a} onOpen={()=>openApp(a.id)} so="linux"/>))}
      </div>
      <div style={{ position:'absolute',top:28,left:66,right:0,bottom:0 }}>{children}</div>
    </div>
  );
}

function SIEMApp({ alertas, so }) {
  const [sel,setSel]=useState(null);
  const [filter,setFilter]=useState('TODAS');
  const dk=so==='linux';
  const bg=dk?'#1e1e2e':'#f8fafc', bg2=dk?'#13131f':'#fff', tc1=dk?'#e2e8f0':'#0f172a', tc2=dk?'#94a3b8':'#475569', bc=dk?'#2a2a3d':'#e2e8f0';
  const SC={CRITICA:'#ef4444',ALTA:'#f97316',MEDIA:'#f59e0b',BAJA:'#10b981'};
  const filtered=filter==='TODAS'?alertas:alertas.filter(a=>a.severidad===filter);
  return (
    <div style={{ display:'flex',height:'100%',background:bg,fontSize:12,color:tc1 }}>
      <div style={{ width:310,borderRight:`1px solid ${bc}`,display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'8px 10px',borderBottom:`1px solid ${bc}`,display:'flex',gap:4,flexWrap:'wrap',flexShrink:0 }}>
          {['TODAS','CRITICA','ALTA','MEDIA','BAJA'].map(s=>(<button key={s} onClick={()=>setFilter(s)} style={{ fontSize:10,padding:'3px 8px',borderRadius:4,cursor:'pointer',fontWeight:700,border:`1px solid ${s==='TODAS'?bc:SC[s]||bc}`,background:filter===s?(SC[s]||'#4f46e5')+'22':'transparent',color:filter===s?(SC[s]||'#4f46e5'):tc2 }}>{s}</button>))}
        </div>
        <div style={{ flex:1,overflow:'auto' }}>
          {filtered.map(a=>(<div key={a.id} onClick={()=>setSel(a)} style={{ padding:'10px 12px',borderBottom:`1px solid ${bc}`,cursor:'pointer',background:sel?.id===a.id?(SC[a.severidad]||'#4f46e5')+'11':'transparent',borderLeft:`3px solid ${sel?.id===a.id?SC[a.severidad]||'#4f46e5':'transparent'}`,transition:'all 0.15s' }}>
            <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:3 }}><span style={{ fontSize:9,fontWeight:800,padding:'1px 6px',borderRadius:3,background:(SC[a.severidad]||'#666')+'22',color:SC[a.severidad]||'#666',border:`1px solid ${SC[a.severidad]||'#666'}44` }}>{a.severidad}</span><span style={{ fontSize:10,color:tc2,marginLeft:'auto' }}>{a.timestamp?.slice(11,19)}</span></div>
            <div style={{ fontSize:12,fontWeight:600,color:tc1,lineHeight:1.3,marginBottom:2 }}>{a.titulo}</div>
            <div style={{ fontSize:11,color:tc2 }}>{a.sistema} · {a.categoria}</div>
          </div>))}
        </div>
      </div>
      <div style={{ flex:1,padding:16,overflow:'auto',background:bg2 }}>
        {sel?(<>
          <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:12 }}><span style={{ fontSize:10,fontWeight:800,padding:'3px 10px',borderRadius:4,background:(SC[sel.severidad]||'#666')+'22',color:SC[sel.severidad]||'#666',border:`1px solid ${SC[sel.severidad]||'#666'}44` }}>{sel.severidad}</span><span style={{ fontSize:11,color:tc2 }}>{sel.timestamp}</span></div>
          <div style={{ fontSize:15,fontWeight:700,color:tc1,marginBottom:8 }}>{sel.titulo}</div>
          <div style={{ fontSize:12,color:tc2,lineHeight:1.7,marginBottom:14 }}>{sel.descripcion}</div>
          <div style={{ background:dk?'#13131f':'#f1f5f9',borderRadius:8,padding:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 16px' }}>
            {[['Sistema',sel.sistema],['Categoría',sel.categoria],['IP Origen',sel.ip_origen],['IP Destino',sel.ip_destino],['Usuario',sel.usuario],['Proceso',sel.proceso],['Regla SIEM',sel.regla_disparada]].filter(([,v])=>v).map(([k,v])=>(<div key={k}><div style={{ fontSize:10,color:tc2,marginBottom:1 }}>{k}</div><div style={{ fontSize:11,fontWeight:600,color:dk?'#7dd3fc':'#1d4ed8',fontFamily:'monospace' }}>{v}</div></div>))}
          </div>
        </>):(<div style={{ color:tc2,textAlign:'center',paddingTop:60,fontSize:13 }}>Selecciona una alerta para ver el detalle</div>)}
      </div>
    </div>
  );
}

function LogApp({ logs, so, onQuery }) {
  const [search,setSearch]=useState('');
  const [nivel,setNivel]=useState('TODOS');
  const [onlyRel,setRel]=useState(false);
  const dk=so==='linux';
  const bg=dk?'#1e1e2e':'#fff', tc1=dk?'#e2e8f0':'#0f172a', tc2=dk?'#94a3b8':'#64748b', bc=dk?'#2a2a3d':'#e2e8f0';
  const NC={ERROR:'#ef4444',WARNING:'#f59e0b',INFO:dk?'#94a3b8':'#64748b'};
  const filtered=logs.filter(l=>{ if(nivel!=='TODOS'&&l.nivel!==nivel)return false; if(onlyRel&&!l.relevante)return false; if(search&&!JSON.stringify(l).toLowerCase().includes(search.toLowerCase()))return false; return true; });
  const hs=v=>{ setSearch(v); if(v.length>2)onQuery(`SEARCH:${v}`); };
  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',background:bg,color:tc1,fontSize:12 }}>
      <div style={{ padding:'8px 12px',borderBottom:`1px solid ${bc}`,display:'flex',gap:8,alignItems:'center',flexShrink:0,flexWrap:'wrap' }}>
        <input value={search} onChange={e=>hs(e.target.value)} placeholder="Filtrar: IP, proceso, usuario, Event ID..." style={{ flex:1,minWidth:160,padding:'6px 10px',borderRadius:6,border:`1px solid ${bc}`,background:dk?'#13131f':'#f8fafc',color:tc1,fontSize:11,outline:'none',fontFamily:'monospace' }}/>
        {['TODOS','ERROR','WARNING','INFO'].map(n=>(<button key={n} onClick={()=>setNivel(n)} style={{ fontSize:10,padding:'4px 8px',borderRadius:4,cursor:'pointer',fontWeight:700,border:`1px solid ${NC[n]||bc}`,background:nivel===n?(NC[n]||'#4f46e5')+'22':'transparent',color:nivel===n?NC[n]||'#4f46e5':tc2 }}>{n}</button>))}
        <label style={{ fontSize:11,color:tc2,display:'flex',gap:4,alignItems:'center',cursor:'pointer',whiteSpace:'nowrap' }}><input type="checkbox" checked={onlyRel} onChange={e=>setRel(e.target.checked)} style={{ accentColor:'#4f46e5' }}/>Solo relevantes</label>
      </div>
      <div style={{ flex:1,overflow:'auto',padding:8 }}>
        {filtered.map(l=>(<div key={l.id} style={{ padding:'6px 10px',borderRadius:5,marginBottom:3,fontFamily:'monospace',background:dk?(l.relevante?'#13131f':'#0d0d1a'):(l.relevante?'#f8fafc':'#fafafa'),border:`1px solid ${l.relevante?bc:dk?'#1a1a2a':'#f1f5f9'}`,opacity:l.relevante?1:0.55 }}>
          <div style={{ display:'flex',gap:8,alignItems:'center',marginBottom:2,flexWrap:'wrap' }}>
            <span style={{ fontSize:10,color:tc2 }}>{l.timestamp?.slice(11,19)}</span>
            <span style={{ fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:3,color:NC[l.nivel]||tc2,background:(NC[l.nivel]||tc2)+'18',border:`1px solid ${NC[l.nivel]||tc2}33` }}>{l.nivel}</span>
            <span style={{ fontSize:10,color:dk?'#7dd3fc':'#2563eb',fontWeight:600 }}>{l.sistema}</span>
            <span style={{ fontSize:10,color:tc2 }}>{l.fuente}</span>
            {l.event_id&&<span style={{ fontSize:9,color:tc2,border:`1px solid ${bc}`,padding:'0 4px',borderRadius:3 }}>EID:{l.event_id}</span>}
            {!l.relevante&&<span style={{ fontSize:9,color:tc2,marginLeft:'auto' }}>ruido</span>}
          </div>
          <div style={{ fontSize:11,color:l.relevante?tc1:tc2,lineHeight:1.5,wordBreak:'break-all' }}>{l.mensaje}</div>
        </div>))}
        {filtered.length===0&&<div style={{ textAlign:'center',color:tc2,paddingTop:40 }}>{search?`Sin resultados para "${search}"`:'Sin logs'}</div>}
      </div>
      <div style={{ padding:'4px 12px',borderTop:`1px solid ${bc}`,fontSize:10,color:tc2 }}>{filtered.length} de {logs.length} entradas · {logs.filter(l=>l.relevante).length} relevantes</div>
    </div>
  );
}

function TerminalApp({ escenario, so, onQuery }) {
  const [history,setHistory]=useState([{ type:'out',text:so==='windows'?'Microsoft Windows [Version 10.0.19045]\nEscriba "help" para ver los comandos disponibles.\n':'analyst@soc-workstation:~$ _\nEscriba "help" para ver los comandos disponibles.\n' }]);
  const [input,setInput]=useState('');
  const [cmdHist,setCmdHist]=useState([]);
  const [histIdx,setHistIdx]=useState(-1);
  const bottomRef=useRef(null);
  const prompt=so==='windows'?'C:\\Users\\analyst> ':'analyst@soc:~$ ';
  const iocs=escenario?.iocs||{};
  const alertas=escenario?.alertas_siem||[];
  const logs=escenario?.logs||[];
  const hosts=escenario?.red?.hosts||[];
  const conns=escenario?.red?.conexiones||[];
  const EC={comprometido:'#ef4444',sospechoso:'#f59e0b',limpio:'#10b981',maliciosa:'#ef4444',legitima:'#10b981',sospechosa:'#f59e0b'};

  const CMDS = {
    help:()=>`Comandos disponibles:\n  whoami          usuario actual\n  ifconfig        configuración de red\n  netstat -an     conexiones activas\n  ps aux          procesos en ejecución\n  ls / dir        listar archivos\n  cat <archivo>   contenido de archivo\n  grep <patron>   buscar en logs\n  ioc             IOCs del escenario\n  hosts           hosts de la red\n  alerts          resumen alertas SIEM\n  clear           limpiar terminal`,
    whoami:()=>so==='windows'?'CORP\\analyst':'analyst (uid=1000, grupos: sudo,soc-analysts)',
    ifconfig:()=>`eth0: inet 10.0.0.50  netmask 255.255.255.0  broadcast 10.0.0.255\n      ether 00:0c:29:ab:cd:ef\nlo:   inet 127.0.0.1  netmask 255.0.0.0`,
    ipconfig:()=>`Adaptador Ethernet:\n   Dirección IPv4: 10.0.0.50\n   Máscara de subred: 255.255.255.0\n   Puerta de enlace: 10.0.0.1`,
    'netstat -an':()=>{const l=['Proto  Local               Externo             Estado'];conns.forEach(c=>{const f=hosts.find(h=>h.id===c.origen);const t=hosts.find(h=>h.id===c.destino);l.push(`TCP    ${f?.ip||'10.0.0.x'}:${c.puerto||445}     ${t?.ip||'0.0.0.0'}:${c.puerto||445}  ${c.estado==='maliciosa'?'ESTABLISHED':'LISTEN'}`);});if(!conns.length)l.push('(sin conexiones activas)');return l.join('\n');},
    'ps aux':()=>{const p=iocs.procesos_sospechosos||[];const b=['PID   USER    STAT  COMMAND','1     root    Ss    /sbin/init','234   root    S     sshd','891   analyst S     bash'];p.forEach((pr,i)=>b.push(`${1200+i}   SYSTEM  R     ${pr}  ← SOSPECHOSO`));return b.join('\n');},
    tasklist:()=>{const p=iocs.procesos_sospechosos||[];const b=['Imagen                   PID  Sesión   Mem','======================== ==== ======== =======','System                   4    Services 1.580 KB','svchost.exe              892  Services 12.340 KB'];p.forEach((pr,i)=>b.push(`${pr.slice(0,25).padEnd(25)}${1200+i}  Console  48.${200+i} KB  ← SOSPECHOSO`));return b.join('\n');},
    ls:()=>`Desktop/  Documents/  Downloads/  logs/  evidence/\n\nlogs/:\n${logs.slice(0,6).map(l=>`${l.timestamp?.slice(0,10)}_${l.sistema}.log`).join('\n')||'(vacío)'}`,
    dir:()=>`Directorio C:\\Users\\analyst\n\n${logs.slice(0,6).map(l=>`${l.timestamp?.slice(0,10)}  ${l.sistema}.log`).join('\n')||'(vacío)'}\n  ${logs.length} archivos`,
    ioc:()=>{const l=['═══ IOCs del escenario ═══'];if(iocs.ips_maliciosas?.length)l.push(`IPs maliciosas:\n  ${iocs.ips_maliciosas.join('\n  ')}`);if(iocs.hashes_maliciosos?.length)l.push(`Hashes:\n  ${iocs.hashes_maliciosos.join('\n  ')}`);if(iocs.dominios_maliciosos?.length)l.push(`Dominios C2:\n  ${iocs.dominios_maliciosos.join('\n  ')}`);if(iocs.procesos_sospechosos?.length)l.push(`Procesos sospechosos:\n  ${iocs.procesos_sospechosos.join('\n  ')}`);if(iocs.usuarios_comprometidos?.length)l.push(`Usuarios comprometidos:\n  ${iocs.usuarios_comprometidos.join('\n  ')}`);return l.join('\n\n');},
    hosts:()=>hosts.length?hosts.map(h=>`[${h.estado?.toUpperCase()}] ${h.nombre.padEnd(20)} ${h.ip.padEnd(16)} ${h.tipo}`).join('\n'):'(sin hosts)',
    alerts:()=>alertas.length?alertas.map(a=>`[${a.severidad}] ${a.timestamp?.slice(11,19)} ${a.titulo} (${a.sistema})`).join('\n'):'(sin alertas)',
    clear:()=>null,
  };

  const run=(cmd)=>{
    const t=cmd.trim();
    if(!t)return;
    onQuery(`CMD:${t}`);
    setCmdHist(h=>[cmd,...h]);
    setHistIdx(-1);
    let out='';
    const tl=t.toLowerCase();
    if(tl==='clear'){setHistory([{type:'out',text:''}]);return;}
    else if(tl.startsWith('grep ')){
      const pat=tl.slice(5).trim();
      if(!pat){out='Uso: grep <patrón>';}else{const m=logs.filter(l=>l.mensaje.toLowerCase().includes(pat));out=m.length?m.map(l=>`[${l.sistema}] ${l.mensaje}`).join('\n'):`Sin coincidencias para "${pat}"`;}
    }else if(tl.startsWith('cat ')){
      const f=tl.slice(4).trim();
      const l=logs.find(l=>l.sistema.toLowerCase().includes(f)||l.id?.toLowerCase()===f);
      out=l?`--- ${l.sistema} ---\n${l.timestamp} [${l.nivel}] ${l.mensaje}`:`cat: ${f}: No existe el archivo`;
    }else if(CMDS[tl]){out=CMDS[tl]();if(out===null){setHistory([{type:'out',text:''}]);return;}}
    else{out=`${so==='linux'?'-bash: ':''}${cmd}: comando no reconocido. Escribe "help".`;}
    setHistory(h=>[...h,{type:'in',text:`${prompt}${cmd}`},{type:'out',text:out}]);
    setInput('');
  };

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[history]);

  return (
    <div style={{ flex:1,background:'#0d1117',color:'#c9d1d9',fontFamily:"'Fira Code','JetBrains Mono','Courier New',monospace",fontSize:12,display:'flex',flexDirection:'column' }}>
      <div style={{ flex:1,overflow:'auto',padding:'10px 14px' }}>
        {history.map((h,i)=>(<div key={i} style={{ marginBottom:2,whiteSpace:'pre-wrap',lineHeight:1.6,color:h.type==='in'?'#58a6ff':h.type==='sys'?'#7ee787':'#c9d1d9' }}>{h.text}</div>))}
        <div ref={bottomRef}/>
      </div>
      <div style={{ display:'flex',alignItems:'center',borderTop:'1px solid #21262d',padding:'8px 14px',flexShrink:0 }}>
        <span style={{ color:'#7ee787',marginRight:6,fontSize:12,whiteSpace:'nowrap' }}>{prompt}</span>
        <input autoFocus value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter')run(input); else if(e.key==='ArrowUp'){const i=Math.min(histIdx+1,cmdHist.length-1);setHistIdx(i);setInput(cmdHist[i]||'');} else if(e.key==='ArrowDown'){const i=Math.max(histIdx-1,-1);setHistIdx(i);setInput(i===-1?'':cmdHist[i]||'');} }}
          style={{ flex:1,background:'transparent',border:'none',outline:'none',color:'#58a6ff',fontSize:12,fontFamily:'inherit' }}
          placeholder="escribe un comando..."
        />
      </div>
    </div>
  );
}

function NetworkApp({ red, so }) {
  const [sel,setSel]=useState(null);
  const dk=so==='linux';
  const bg=dk?'#1e1e2e':'#fff', tc1=dk?'#e2e8f0':'#0f172a', tc2=dk?'#94a3b8':'#64748b', bc=dk?'#2a2a3d':'#e2e8f0';
  const hosts=red?.hosts||[];
  const conns=red?.conexiones||[];
  const EC={comprometido:'#ef4444',sospechoso:'#f59e0b',limpio:'#10b981',maliciosa:'#ef4444',sospechosa:'#f59e0b',legitima:'#10b981'};
  return (
    <div style={{ display:'flex',height:'100%',background:bg,color:tc1,fontSize:12 }}>
      <div style={{ width:260,borderRight:`1px solid ${bc}`,overflow:'auto' }}>
        <div style={{ padding:'8px 12px',borderBottom:`1px solid ${bc}`,fontSize:11,fontWeight:700,color:tc2,textTransform:'uppercase',letterSpacing:'0.05em' }}>Hosts ({hosts.length})</div>
        {hosts.map(h=>(<div key={h.id} onClick={()=>setSel(h)} style={{ padding:'10px 12px',borderBottom:`1px solid ${bc}`,cursor:'pointer',background:sel?.id===h.id?(EC[h.estado]||'#4f46e5')+'11':'transparent',display:'flex',alignItems:'center',gap:10,transition:'background 0.15s' }}>
          <div style={{ width:10,height:10,borderRadius:'50%',background:EC[h.estado]||tc2,flexShrink:0 }}/>
          <div style={{ flex:1 }}><div style={{ fontWeight:600,fontSize:12,color:tc1 }}>{h.nombre}</div><div style={{ fontSize:10,color:tc2,fontFamily:'monospace' }}>{h.ip}</div></div>
          <span style={{ fontSize:9,padding:'1px 6px',borderRadius:10,background:(EC[h.estado]||tc2)+'22',color:EC[h.estado]||tc2,fontWeight:700 }}>{h.estado?.toUpperCase()}</span>
        </div>))}
      </div>
      <div style={{ flex:1,overflow:'auto',padding:16 }}>
        {sel?(<>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
            <div style={{ width:12,height:12,borderRadius:'50%',background:EC[sel.estado]||tc2 }}/>
            <span style={{ fontSize:16,fontWeight:800,color:tc1 }}>{sel.nombre}</span>
            <span style={{ fontSize:10,padding:'2px 8px',borderRadius:10,background:(EC[sel.estado]||tc2)+'22',color:EC[sel.estado]||tc2,fontWeight:700 }}>{sel.estado?.toUpperCase()}</span>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 20px',background:dk?'#13131f':'#f8fafc',borderRadius:8,padding:12,marginBottom:12 }}>
            {[['IP',sel.ip],['Tipo',sel.tipo],['OS',sel.os]].filter(([,v])=>v).map(([k,v])=>(<div key={k}><div style={{ fontSize:10,color:tc2 }}>{k}</div><div style={{ fontSize:12,fontWeight:600,color:dk?'#7dd3fc':'#1d4ed8',fontFamily:'monospace' }}>{v}</div></div>))}
          </div>
          {sel.servicios?.length>0&&(<div style={{ marginBottom:12 }}><div style={{ fontSize:10,color:tc2,marginBottom:6 }}>SERVICIOS:</div><div style={{ display:'flex',flexWrap:'wrap',gap:4 }}>{sel.servicios.map(s=>(<span key={s} style={{ fontSize:10,padding:'2px 8px',borderRadius:4,background:dk?'#2a2a3d':'#e2e8f0',color:tc1,fontFamily:'monospace' }}>{s}</span>))}</div></div>)}
          {sel.notas&&(<div style={{ marginBottom:12,padding:10,background:dk?'#1a1a2e':'#fef3c7',borderRadius:8,border:`1px solid ${dk?'#2a2a3d':'#fde68a'}`,fontSize:11,color:dk?'#fde68a':'#92400e',lineHeight:1.5 }}>⚠ {sel.notas}</div>)}
          <div style={{ fontSize:11,fontWeight:700,color:tc2,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8 }}>Conexiones</div>
          {conns.filter(c=>c.origen===sel.id||c.destino===sel.id).map((c,i)=>{
            const ot=c.origen===sel.id?hosts.find(h=>h.id===c.destino):hosts.find(h=>h.id===c.origen);
            return (<div key={i} style={{ padding:'8px 12px',borderRadius:6,marginBottom:4,background:dk?'#13131f':'#f8fafc',border:`1px solid ${EC[c.estado]||bc}44`,display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:EC[c.estado]||tc2,flexShrink:0 }}/>
              <span style={{ fontFamily:'monospace',fontSize:11,color:tc1 }}>{c.origen===sel.id?'→':'←'} {ot?.nombre||'externo'} ({ot?.ip||'?'})</span>
              <span style={{ fontSize:10,color:tc2 }}>{c.protocolo}:{c.puerto}</span>
              <span style={{ marginLeft:'auto',fontSize:9,fontWeight:700,color:EC[c.estado]||tc2 }}>{c.estado?.toUpperCase()}</span>
            </div>);
          })}
          {conns.filter(c=>c.origen===sel.id||c.destino===sel.id).length===0&&<div style={{ fontSize:11,color:tc2 }}>Sin conexiones para este host</div>}
        </>):(<div style={{ color:tc2,textAlign:'center',paddingTop:60,fontSize:13 }}>Selecciona un host para ver detalles y conexiones</div>)}
      </div>
    </div>
  );
}

function ReportApp({ preguntas, so, onSubmit, submitting, queriesCount }) {
  const [resp,setResp]=useState({});
  const [inf,setInf]=useState('');
  const [tab,setTab]=useState('preguntas');
  const dk=so==='linux';
  const bg=dk?'#1e1e2e':'#fff', tc1=dk?'#e2e8f0':'#0f172a', tc2=dk?'#94a3b8':'#64748b', bc=dk?'#2a2a3d':'#e2e8f0', acc='#4f46e5';
  const respondidas=preguntas.filter(p=>resp[String(p.id)]?.trim()).length;
  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',background:bg,color:tc1,fontSize:13,fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <div style={{ display:'flex',borderBottom:`1px solid ${bc}`,flexShrink:0 }}>
        {['preguntas','informe'].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{ padding:'10px 20px',border:'none',cursor:'pointer',fontSize:12,fontWeight:700,background:tab===t?(dk?'#13131f':'#f8fafc'):'transparent',color:tab===t?acc:tc2,borderBottom:tab===t?`2px solid ${acc}`:'2px solid transparent',transition:'all 0.15s' }}>
          {t==='preguntas'?`📋 Preguntas (${respondidas}/${preguntas.length})`:'📝 Informe libre'}
        </button>))}
      </div>
      <div style={{ flex:1,overflow:'auto',padding:16 }}>
        {tab==='preguntas'?(
          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
            {preguntas.map(p=>(
              <div key={p.id} style={{ border:`1px solid ${resp[String(p.id)]?acc+'44':bc}`,borderRadius:10,padding:'14px 16px',background:dk?'#13131f':'#f8fafc',transition:'border-color 0.2s' }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                  <div style={{ width:24,height:24,borderRadius:'50%',flexShrink:0,background:resp[String(p.id)]?'#10b98122':(dk?'#2a2a3d':'#e2e8f0'),border:`1px solid ${resp[String(p.id)]?'#10b981':bc}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:resp[String(p.id)]?'#10b981':tc2 }}>
                    {resp[String(p.id)]?'✓':p.id}
                  </div>
                  <span style={{ fontSize:11,fontWeight:700,color:acc }}>{p.categoria}</span>
                </div>
                {/* PREGUNTA SIEMPRE VISIBLE ENCIMA DEL INPUT */}
                <div style={{ fontSize:13,fontWeight:600,color:tc1,lineHeight:1.6,marginBottom:10 }}>{p.pregunta}</div>
                <input
                  value={resp[String(p.id)]||''} onChange={e=>setResp(r=>({...r,[String(p.id)]:e.target.value}))}
                  placeholder={p.placeholder||'Escribe tu respuesta aquí...'}
                  style={{ width:'100%',padding:'9px 12px',borderRadius:7,border:`1px solid ${bc}`,background:dk?'#1e1e2e':'#fff',color:tc1,fontSize:12,outline:'none',boxSizing:'border-box',transition:'border-color 0.2s',fontFamily:'inherit' }}
                  onFocus={e=>e.target.style.borderColor=acc} onBlur={e=>e.target.style.borderColor=bc}
                />
                {/* PISTA SIEMPRE VISIBLE DEBAJO DEL INPUT */}
                <div style={{ display:'flex',gap:6,alignItems:'flex-start',marginTop:8,padding:'6px 10px',borderRadius:6,background:dk?'#1a1a2e':'#fffbeb',border:`1px solid ${dk?'#2a2a3d':'#fde68a'}` }}>
                  <span>💡</span>
                  <span style={{ fontSize:11,color:dk?'#fde68a':'#92400e',lineHeight:1.5 }}>{p.pista}</span>
                </div>
              </div>
            ))}
            <div style={{ padding:'8px 0' }}>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:tc2,marginBottom:6 }}><span>Progreso</span><span>{respondidas}/{preguntas.length}</span></div>
              <div style={{ height:6,background:bc,borderRadius:3 }}><div style={{ height:'100%',borderRadius:3,width:`${preguntas.length>0?(respondidas/preguntas.length)*100:0}%`,background:`linear-gradient(90deg,${acc},#7c3aed)`,transition:'width 0.4s ease' }}/></div>
            </div>
          </div>
        ):(
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            <div style={{ fontSize:12,color:tc2,lineHeight:1.7 }}>Describe la cadena completa del ataque: vector de entrada, técnicas usadas, sistemas afectados, movimiento lateral, persistencia y acciones de remediación. Un buen informe suma hasta +10 puntos extra.</div>
            <textarea value={inf} onChange={e=>setInf(e.target.value)} placeholder="Escribe aquí tu análisis técnico completo del incidente..." style={{ minHeight:240,padding:'12px 14px',borderRadius:8,border:`1px solid ${bc}`,background:dk?'#13131f':'#f8fafc',color:tc1,fontSize:12,lineHeight:1.7,outline:'none',resize:'vertical',fontFamily:'inherit' }} onFocus={e=>e.target.style.borderColor=acc} onBlur={e=>e.target.style.borderColor=bc}/>
          </div>
        )}
      </div>
      <div style={{ padding:'12px 16px',borderTop:`1px solid ${bc}`,flexShrink:0,background:dk?'#13131f':'#f8fafc' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:11,color:tc2 }}>
          <span>Herramientas usadas: <strong style={{ color:acc }}>{queriesCount}</strong> interacciones</span>
          <span>Preguntas: <strong style={{ color:respondidas===preguntas.length?'#10b981':acc }}>{respondidas}/{preguntas.length}</strong></span>
        </div>
        <button onClick={()=>onSubmit({respuestas:resp,informe_libre:inf})} disabled={submitting||respondidas===0} style={{ width:'100%',padding:'13px 0',borderRadius:8,border:'none',background:submitting||respondidas===0?(dk?'#2a2a3d':'#e2e8f0'):'linear-gradient(135deg,#10b981,#059669)',color:submitting||respondidas===0?tc2:'#fff',fontSize:13,fontWeight:700,cursor:submitting||respondidas===0?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all 0.2s' }}>
          {submitting?'⏳ Evaluando con IA...':'📤 Enviar análisis para evaluación'}
        </button>
      </div>
    </div>
  );
}

function ResultadosScreen({ resultado, escenario, onNuevoLab, onDashboard }) {
  const [tab,setTab]=useState('resumen');
  const pct=Math.round(resultado.puntuacion_normalizada||0);
  const color=pct>=80?'#10b981':pct>=50?'#f59e0b':'#ef4444';
  const SL={siem_queries:'SIEM & Queries',forense_digital:'Forense Digital',threat_hunting:'Threat Hunting',analisis_logs:'Análisis de Logs',inteligencia_amenazas:'Intel. Amenazas'};
  return (
    <div style={{ minHeight:'100vh',background:'#f0f4ff',fontFamily:"'Inter','Segoe UI',sans-serif",padding:32,color:'#0f172a' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
      <div style={{ maxWidth:860,margin:'0 auto',animation:'fadeUp 0.4s ease' }}>
        <div style={{ background:'#fff',borderRadius:16,padding:'28px 32px',marginBottom:20,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div><div style={{ fontSize:12,color:'#64748b',fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.06em' }}>Laboratorio completado</div><div style={{ fontSize:22,fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px' }}>{escenario?.titulo||'Lab SOC'}</div></div>
          <div style={{ textAlign:'right' }}><div style={{ fontSize:52,fontWeight:900,color,lineHeight:1 }}>{pct}</div><div style={{ fontSize:12,color:'#64748b' }}>/ 100 puntos</div></div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20 }}>
          {[['⚡ XP Ganada',`+${resultado.xp_ganada||0}`,'#4f46e5'],['🔗 Cadena descubierta',`${resultado.cadena_ataque_descubierta||0}%`,color],['🔍 Bonus queries',`+${resultado.puntuacion_queries||0} pts`,'#10b981'],['📋 Bonus informe',`+${resultado.puntuacion_informe||0} pts`,'#f59e0b']].map(([l,v,c])=>(<div key={l} style={{ background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'16px 18px' }}><div style={{ fontSize:11,color:'#64748b',marginBottom:4 }}>{l}</div><div style={{ fontSize:22,fontWeight:800,color:c }}>{v}</div></div>))}
        </div>
        <div style={{ display:'flex',gap:6,marginBottom:14 }}>
          {['resumen','preguntas','skills','solucion'].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 18px',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:700,border:`1px solid ${tab===t?'#4f46e5':'#e2e8f0'}`,background:tab===t?'#4f46e511':'#fff',color:tab===t?'#4f46e5':'#64748b',transition:'all 0.15s' }}>{t==='resumen'?'📊 Resumen':t==='preguntas'?'❓ Preguntas':t==='skills'?'📈 Skills':'🔓 Solución'}</button>))}
        </div>
        <div style={{ background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:24,marginBottom:20 }}>
          {tab==='resumen'&&<p style={{ fontSize:14,color:'#374151',lineHeight:1.8 }}>{resultado.feedback_general}</p>}
          {tab==='preguntas'&&(
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {(resultado.feedback_preguntas||[]).map(fp=>(<div key={fp.id} style={{ padding:'14px 16px',borderRadius:10,background:fp.correcto?'#f0fdf4':'#fef2f2',border:`1px solid ${fp.correcto?'#bbf7d0':'#fecaca'}` }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}><span style={{ fontSize:18 }}>{fp.correcto?'✅':'❌'}</span><span style={{ fontSize:13,fontWeight:700 }}>Pregunta {fp.id}</span><span style={{ fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:6,background:fp.correcto?'#bbf7d0':'#fecaca',color:fp.correcto?'#15803d':'#dc2626' }}>{fp.puntos}/10 pts</span></div>
                <div style={{ fontSize:12,color:'#64748b',marginBottom:4 }}>Respuesta correcta: <span style={{ color:'#1d4ed8',fontWeight:600,fontFamily:'monospace' }}>{fp.respuesta_correcta}</span></div>
                <div style={{ fontSize:12,color:'#374151',lineHeight:1.6 }}>{fp.feedback}</div>
              </div>))}
            </div>
          )}
          {tab==='skills'&&(
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              {Object.entries(resultado.skills_mejoradas||{}).map(([sk,d])=>{ const delta=typeof d==='object'?d.delta:d; return (<div key={sk} style={{ display:'flex',alignItems:'center',gap:14 }}><div style={{ width:160,fontSize:13,color:'#374151',fontWeight:600 }}>{SL[sk]||sk}</div><div style={{ flex:1,height:8,background:'#e2e8f0',borderRadius:4 }}><div style={{ height:'100%',borderRadius:4,width:`${(delta/0.3)*100}%`,background:delta>=0.2?'#10b981':delta>0?'#f59e0b':'#e2e8f0',transition:'width 0.7s ease' }}/></div><div style={{ width:52,fontSize:13,color:delta>0?'#10b981':'#94a3b8',textAlign:'right',fontWeight:700 }}>{delta>0?`+${delta.toFixed(2)}`:'—'}</div></div>); })}
            </div>
          )}
          {tab==='solucion'&&resultado.solucion_completa&&(
            <div>
              <p style={{ fontSize:13,color:'#374151',lineHeight:1.8,marginBottom:16 }}>{resultado.solucion_completa.resumen}</p>
              <div style={{ marginBottom:16 }}><div style={{ fontSize:11,fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10 }}>Cadena del ataque:</div>
              {(resultado.solucion_completa.cadena_ataque||[]).map((p,i)=>(<div key={i} style={{ display:'flex',gap:12,marginBottom:8 }}><div style={{ width:24,height:24,borderRadius:'50%',flexShrink:0,background:'#4f46e511',border:'1px solid #4f46e5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#4f46e5' }}>{i+1}</div><div style={{ fontSize:12,color:'#374151',lineHeight:1.6,paddingTop:3 }}>{p}</div></div>))}</div>
              {resultado.solucion_completa.tecnicas_mitre?.length>0&&(<div style={{ marginBottom:14 }}><div style={{ fontSize:11,fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>TTPs MITRE ATT&CK:</div><div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>{resultado.solucion_completa.tecnicas_mitre.map(t=>(<span key={t} style={{ fontSize:11,padding:'3px 10px',borderRadius:6,background:'#ede9fe',color:'#7c3aed',fontWeight:700 }}>{t}</span>))}</div></div>)}
              <div style={{ padding:14,background:'#fffbeb',borderRadius:10,border:'1px solid #fde68a' }}><div style={{ fontSize:11,fontWeight:800,color:'#92400e',marginBottom:4 }}>💡 LECCIONES APRENDIDAS</div><div style={{ fontSize:12,color:'#78350f',lineHeight:1.7 }}>{resultado.solucion_completa.lecciones}</div></div>
            </div>
          )}
        </div>
        <div style={{ display:'flex',gap:12 }}>
          <button onClick={onNuevoLab} style={{ flex:1,padding:'14px 0',borderRadius:10,border:'none',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer' }}>🔬 Nuevo laboratorio</button>
          <button onClick={onDashboard} style={{ flex:1,padding:'14px 0',borderRadius:10,background:'#fff',border:'1px solid #e2e8f0',color:'#374151',fontSize:14,fontWeight:700,cursor:'pointer' }}>← Dashboard</button>
        </div>
      </div>
    </div>
  );
}

export default function LabPage() {
  const navigate=useNavigate();
  const [fase,setFase]=useState('intro');
  const [escenario,setEscenario]=useState(null);
  const [resultado,setResultado]=useState(null);
  const [loading,setLoading]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState('');
  const [showBoot,setShowBoot]=useState(false);
  const [queriesLog,setQueriesLog]=useState([]);
  const [showOnboarding,setShowOnboarding]=useState(false);

  const APPS=[
    {id:'siem',label:'SIEM Alerts',icon:'🖥️'},
    {id:'logs',label:'Log Explorer',icon:'📋'},
    {id:'network',label:'Network Monitor',icon:'🌐'},
    {id:'terminal',label:'Terminal',icon:'💻'},
    {id:'report',label:'Incident Report',icon:'📝'},
  ];
  const DPOS={siem:{x:20,y:10},logs:{x:360,y:10},network:{x:20,y:300},terminal:{x:360,y:290},report:{x:160,y:60}};
  const DSZ={siem:{w:320,h:420},logs:{w:350,h:420},network:{w:330,h:360},terminal:{w:370,h:310},report:{w:480,h:540}};

  const [wins,setWins]=useState(APPS.reduce((a,app)=>({...a,[app.id]:{open:false,minimized:false}}),{}));
  const [focused,setFocused]=useState(null);

  const so=escenario?.so||(escenario?.titulo?.toLowerCase().includes('linux')?'linux':'windows');

  useEffect(()=>{ if(!localStorage.getItem(ONBOARDING_KEY))setShowOnboarding(true); },[]);

  const onQuery=useCallback((q)=>{ setQueriesLog(p=>p.includes(q)?p:[...p,q]); },[]);

  const openApp=id=>{ setWins(w=>({...w,[id]:{open:true,minimized:false}})); setFocused(id); onQuery(`OPEN:${id}`); };
  const closeApp=id=>setWins(w=>({...w,[id]:{...w[id],open:false}}));
  const minApp=id=>setWins(w=>({...w,[id]:{...w[id],minimized:true}}));
  const focusApp=id=>setFocused(id);
  const taskbarClick=id=>{ const w=wins[id]; if(!w?.open)return; if(w.minimized){setWins(ww=>({...ww,[id]:{...ww[id],minimized:false}}));setFocused(id);} else if(focused===id)minApp(id); else focusApp(id); };

  const iniciarLab=async()=>{ setLoading(true);setError(''); try{ const d=await apiFetch('/lab/generar',{method:'POST'}); setEscenario(d); setQueriesLog([]); setShowBoot(true); }catch(e){setError(e.message||'Error generando el lab');} finally{setLoading(false);} };

  const enviarAnalisis=async({respuestas,informe_libre})=>{ setSubmitting(true);setError(''); try{ const d=await apiFetch('/lab/evaluar',{method:'POST',body:JSON.stringify({lab_id:escenario.lab_id,respuestas,informe_libre,queries_usadas:queriesLog})}); setResultado(d); setFase('resultado'); }catch(e){setError(e.message||'Error evaluando');} finally{setSubmitting(false);} };

  const nuevoLab=()=>{ setEscenario(null);setResultado(null);setFase('intro'); setWins(APPS.reduce((a,app)=>({...a,[app.id]:{open:false,minimized:false}}),{})); };

  if(fase==='intro') return (
    <div style={{ minHeight:'100vh',background:'#f0f4ff',fontFamily:"'Inter','Segoe UI',sans-serif",display:'flex',alignItems:'center',justifyContent:'center' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
      {showOnboarding&&<Onboarding onFinish={()=>{localStorage.setItem(ONBOARDING_KEY,'1');setShowOnboarding(false);}}/>}
      <div style={{ maxWidth:580,width:'90%',animation:'fadeUp 0.4s ease' }}>
        <div style={{ textAlign:'center',marginBottom:32 }}>
          <div style={{ fontSize:52,marginBottom:12 }}>🔬</div>
          <h1 style={{ fontSize:28,fontWeight:900,color:'#0f172a',margin:'0 0 8px',letterSpacing:'-0.8px' }}>Laboratorio SOC</h1>
          <p style={{ fontSize:15,color:'#64748b',lineHeight:1.7,margin:0 }}>Accede a una máquina comprometida. Investiga el incidente con las herramientas del SOC y redacta tu informe forense.</p>
        </div>
        <div style={{ background:'#fff',borderRadius:16,padding:'28px 32px',boxShadow:'0 4px 20px rgba(0,0,0,0.06)',border:'1px solid #e2e8f0',marginBottom:20 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24 }}>
            {[['🖥️','SIEM Alerts','Alertas del sistema'],['📋','Log Explorer','Logs filtrables'],['🌐','Network Monitor','Hosts y conexiones'],['💻','Terminal','Comandos reales'],['📝','Incident Report','Preguntas + informe IA'],['⏱','Sin límite de tiempo','Investiga a fondo']].map(([icon,title,desc])=>(<div key={title} style={{ display:'flex',gap:10,padding:'10px 12px',borderRadius:10,background:'#f8fafc',border:'1px solid #e2e8f0' }}><span style={{ fontSize:20,flexShrink:0 }}>{icon}</span><div><div style={{ fontSize:12,fontWeight:700,color:'#0f172a',marginBottom:2 }}>{title}</div><div style={{ fontSize:11,color:'#64748b' }}>{desc}</div></div></div>))}
          </div>
          <button onClick={iniciarLab} disabled={loading} style={{ width:'100%',padding:'15px 0',borderRadius:10,border:'none',background:loading?'#e2e8f0':'linear-gradient(135deg,#4f46e5,#7c3aed)',color:loading?'#94a3b8':'#fff',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,boxShadow:loading?'none':'0 4px 14px rgba(79,70,229,0.3)',transition:'opacity 0.2s' }}>
            {loading?'⏳ Generando escenario con IA...':'⚡ Iniciar Laboratorio'}
          </button>
          {error&&<div style={{ marginTop:12,padding:'10px 14px',borderRadius:8,background:'#fef2f2',border:'1px solid #fecaca',fontSize:12,color:'#dc2626' }}>⚠ {error}</div>}
        </div>
        <div style={{ textAlign:'center',fontSize:12,color:'#94a3b8' }}>El escenario se adapta a tu arena · Solo XP y habilidades, sin copas</div>
      </div>
    </div>
  );

  if(fase==='resultado') return <ResultadosScreen resultado={resultado} escenario={escenario} onNuevoLab={nuevoLab} onDashboard={()=>navigate('/dashboard')}/>;

  const taskbarApps=APPS.filter(a=>wins[a.id]?.open);
  const windows_render=APPS.map(app=>wins[app.id]?.open?(
    <AppWindow key={app.id} app={app} so={so} onClose={()=>closeApp(app.id)} onMinimize={()=>minApp(app.id)} onFocus={()=>focusApp(app.id)} isFocused={focused===app.id} isMinimized={wins[app.id]?.minimized} defaultPos={DPOS[app.id]} defaultSize={DSZ[app.id]}>
      {app.id==='siem'&&<SIEMApp alertas={escenario?.alertas_siem||[]} so={so}/>}
      {app.id==='logs'&&<LogApp logs={escenario?.logs||[]} so={so} onQuery={onQuery}/>}
      {app.id==='network'&&<NetworkApp red={escenario?.red} so={so}/>}
      {app.id==='terminal'&&<TerminalApp escenario={escenario} so={so} onQuery={onQuery}/>}
      {app.id==='report'&&<ReportApp preguntas={escenario?.preguntas||[]} so={so} onSubmit={enviarAnalisis} submitting={submitting} queriesCount={queriesLog.length}/>}
    </AppWindow>
  ):null);

  return (
    <div style={{ width:'100vw',height:'100vh',overflow:'hidden',position:'relative' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Fira+Code:wght@400;600&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(128,128,128,0.3);border-radius:3px}`}</style>
      {showBoot&&<BootScreen so={so} onDone={()=>{setShowBoot(false);setFase('lab');}}/>}
      {fase==='lab'&&(so==='linux'
        ?<LinuxDesktop apps={APPS} openApp={openApp} taskbarApps={taskbarApps} focusedApp={focused} onTaskbarClick={taskbarClick}>{windows_render}</LinuxDesktop>
        :<WinDesktop apps={APPS} openApp={openApp} taskbarApps={taskbarApps} focusedApp={focused} minimizedApps={APPS.filter(a=>wins[a.id]?.minimized).map(a=>a.id)} onTaskbarClick={taskbarClick}>{windows_render}</WinDesktop>
      )}
      {error&&fase==='lab'&&<div style={{ position:'fixed',bottom:60,left:'50%',transform:'translateX(-50%)',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 20px',color:'#dc2626',fontSize:12,zIndex:300 }}>{error}</div>}
    </div>
  );
}
