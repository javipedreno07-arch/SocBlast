import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';
const ONBOARDING_KEY = 'socblast_onboarding_done';

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    icon: '🛡️',
    tag: 'BIENVENIDO A SOCBLAST',
    title: 'Tu plataforma de entrenamiento SOC',
    desc: 'Aquí practicas ciberseguridad defensiva de verdad. Escenarios generados por IA, evaluación en tiempo real y un sistema de progresión como en los mejores juegos competitivos.',
    color: '#4f46e5',
    light: '#eef2ff',
    visual: (
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {[
          { c:'#ef4444', t:'CRITICA', m:'Brute force detected — 185.220.101.45' },
          { c:'#f97316', t:'ALTA',    m:'Mimikatz.exe spawned by svchost.exe' },
          { c:'#f59e0b', t:'MEDIA',   m:'Lateral movement to CORP-DC01' },
        ].map((a,i) => (
          <div key={i} style={{ padding:'8px 12px', borderRadius:8, background:'#0f172a', border:`1px solid ${a.c}33`, display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:4, background:a.c+'22', color:a.c, border:`1px solid ${a.c}44`, flexShrink:0 }}>{a.t}</span>
            <span style={{ fontSize:10, color:'#94a3b8', fontFamily:'monospace' }}>{a.m}</span>
          </div>
        ))}
        <div style={{ padding:'8px 12px', borderRadius:8, background:'#0f172a', border:'1px solid #10b98133', marginTop:4 }}>
          <span style={{ fontSize:10, color:'#10b981', fontFamily:'monospace' }}>$ awaiting analyst action... ▌</span>
        </div>
      </div>
    ),
  },
  {
    icon: '⚡',
    tag: 'MODO COMPETITIVO',
    title: 'Sesiones: incidentes SOC en tiempo real',
    desc: 'Cada sesión es un incidente real generado por IA. Tienes tiempo limitado para diagnosticar la amenaza, seleccionar logs y elegir acciones de respuesta. Tu velocidad y precisión determinan las copas que ganas.',
    color: '#2563eb',
    light: '#eff6ff',
    visual: (
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { label:'Copas', value:'+35', color:'#fbbf24', bg:'#78350f' },
            { label:'XP',    value:'+180', color:'#a5b4fc', bg:'#1e1b4b' },
            { label:'Arena', value:'Plata II', color:'#94a3b8', bg:'#1e293b' },
            { label:'Skill', value:'▲ 0.2', color:'#6ee7b7', bg:'#064e3b' },
          ].map((s,i) => (
            <div key={i} style={{ padding:'10px', borderRadius:8, background:s.bg, textAlign:'center' }}>
              <div style={{ fontSize:16, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)', fontFamily:'monospace' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:'10px 12px', borderRadius:8, background:'#020817', border:'1px solid #1e293b' }}>
          <div style={{ fontSize:9, color:'#64748b', fontFamily:'monospace', marginBottom:4 }}>Evaluación IA:</div>
          <div style={{ fontSize:10, color:'#10b981', fontFamily:'monospace' }}>✓ Diagnóstico correcto +5 pts</div>
          <div style={{ fontSize:10, color:'#10b981', fontFamily:'monospace' }}>✓ Velocidad 45% del tiempo +4 pts</div>
          <div style={{ fontSize:10, color:'#10b981', fontFamily:'monospace' }}>✓ Sin pistas usadas +3 pts</div>
        </div>
      </div>
    ),
  },
  {
    icon: '🔬',
    tag: 'LABORATORIO FORENSE',
    title: 'Labs: investiga sin límite de tiempo',
    desc: 'Accedes a un ordenador comprometido (Windows o Linux) con SIEM, Terminal, Log Explorer y Network Monitor. Sin prisas — investiga a fondo, redacta tu informe y la IA lo evalúa.',
    color: '#059669',
    light: '#ecfdf5',
    visual: (
      <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid #1e293b' }}>
        <div style={{ background:'#1e293b', padding:'6px 10px', display:'flex', gap:5 }}>
          {['#FF5F57','#FEBC2E','#28C840'].map((c,i) => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:c }}/>)}
          <span style={{ fontSize:9, color:'#64748b', fontFamily:'monospace', marginLeft:6 }}>soc-terminal — analyst@workstation</span>
        </div>
        <div style={{ background:'#0d1117', padding:'10px 12px', fontFamily:'monospace', fontSize:10 }}>
          <div style={{ color:'#7ee787' }}>analyst@soc:~$ grep "mimikatz" /var/log/sysmon.log</div>
          <div style={{ color:'#f87171', marginTop:2 }}>2024-03-15 02:18:33 mimikatz.exe PID:1337 CORP\jsmith</div>
          <div style={{ color:'#7ee787', marginTop:4 }}>analyst@soc:~$ netstat -an | grep ESTABLISHED</div>
          <div style={{ color:'#f87171', marginTop:2 }}>TCP 10.0.0.15:49832 → 185.220.101.47:4444 ESTABLISHED</div>
          <div style={{ color:'#58a6ff', marginTop:4 }}>analyst@soc:~$ ▌</div>
        </div>
      </div>
    ),
  },
  {
    icon: '🏆',
    tag: 'PROGRESIÓN',
    title: 'Skills, arenas y tiers reales',
    desc: '8 habilidades SOC que suben y bajan según tu rendimiento. 12 divisiones de arena competitivas. 8 tiers de analista. Tu progresión refleja tu nivel real — no hay atajos.',
    color: '#7c3aed',
    light: '#f5f3ff',
    visual: (
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {[
          { label:'SIEM & Queries',     val:7.4, color:'#0891b2' },
          { label:'Análisis de Logs',   val:6.1, color:'#3b82f6' },
          { label:'Detección Amenazas', val:4.8, color:'#4f46e5' },
          { label:'Threat Hunting',     val:3.2, color:'#8b5cf6', weak:true },
        ].map((s,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:10, color: s.weak ? '#ef4444' : '#94a3b8', width:130, flexShrink:0 }}>{s.label}</span>
            <div style={{ flex:1, height:6, background:'#1e293b', borderRadius:3 }}>
              <div style={{ width:`${s.val*10}%`, height:'100%', borderRadius:3, background: s.weak ? '#ef4444' : s.color }}/>
            </div>
            <span style={{ fontSize:10, fontWeight:700, color: s.weak ? '#ef4444' : s.color, width:28, textAlign:'right', fontFamily:'monospace' }}>{s.val}</span>
          </div>
        ))}
        <div style={{ marginTop:4, padding:'8px 12px', borderRadius:8, background:'#1e1b4b', border:'1px solid #3730a3', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:10, color:'#a5b4fc' }}>Arena actual</span>
          <span style={{ fontSize:12, fontWeight:800, color:'#818cf8' }}>Plata II · 1.320 copas</span>
        </div>
      </div>
    ),
  },
  {
    icon: '💼',
    tag: 'EMPLEO REAL',
    title: 'Conectamos talento con empresas',
    desc: 'Tu perfil SoCBlast es tu CV en ciberseguridad. Ofertas de trabajo reales, certificaciones recomendadas y bootcamps seleccionados. Las empresas pueden ver tu arena, skills y sesiones completadas.',
    color: '#d97706',
    light: '#fffbeb',
    visual: (
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {[
          { empresa:'CiberShield S.L.', rol:'Analista SOC L1', salario:'24K–30K', req:'Bronce I+', color:'#059669' },
          { empresa:'TechDefend',       rol:'SOC Analyst L2',  salario:'32K–40K', req:'Plata II+', color:'#3b82f6' },
          { empresa:'Grupo Securitas',  rol:'Threat Hunter',   salario:'40K–52K', req:'Oro I+',    color:'#ef4444' },
        ].map((o,i) => (
          <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:'#fff', border:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:10, color:'#94a3b8', marginBottom:2 }}>{o.empresa}</div>
              <div style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>{o.rol}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#059669' }}>{o.salario}</div>
              <span style={{ fontSize:9, padding:'1px 6px', borderRadius:4, background:o.color+'15', color:o.color, fontWeight:700 }}>Req: {o.req}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

function OnboardingModal({ nombre, onFinish }) {
  const [step, setStep]      = useState(0);
  const [exiting, setExit]   = useState(false);
  const [entering, setEnter] = useState(false);
  const s      = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const pct    = ((step + 1) / STEPS.length) * 100;

  const goTo = (next) => {
    setExit(true);
    setTimeout(() => { setStep(next); setExit(false); setEnter(true); setTimeout(() => setEnter(false), 300); }, 220);
  };

  return (
    <div style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(10,14,26,0.88)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter','Segoe UI',sans-serif",padding:16 }}>
      <style>{`
        @keyframes ob-in  { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:none; } }
        @keyframes ob-out { from { opacity:1; transform:none; } to { opacity:0; transform:translateY(-12px) scale(0.97); } }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        .ob-enter { animation: ob-in  0.3s ease forwards; }
        .ob-exit  { animation: ob-out 0.22s ease forwards; }
      `}</style>
      <div style={{ background:'#fff',borderRadius:20,width:'100%',maxWidth:740,boxShadow:'0 32px 80px rgba(0,0,0,0.45)',overflow:'hidden',display:'flex',flexDirection:'column' }}>
        <div style={{ height:4,background:'#f1f5f9' }}>
          <div style={{ height:'100%',background:`linear-gradient(90deg,${s.color}80,${s.color})`,width:`${pct}%`,transition:'width 0.4s ease, background 0.4s ease',borderRadius:4 }}/>
        </div>
        <div style={{ padding:'16px 28px 0',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ padding:'3px 10px',borderRadius:100,background:s.light,border:`1px solid ${s.color}33` }}>
            <span style={{ fontSize:10,fontWeight:800,color:s.color,letterSpacing:'0.08em' }}>{s.tag}</span>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:12,color:'#94a3b8' }}>{step + 1} / {STEPS.length}</span>
            <button onClick={onFinish} style={{ background:'none',border:'1px solid #e2e8f0',color:'#94a3b8',fontSize:11,padding:'3px 10px',borderRadius:6,cursor:'pointer' }}>Saltar →</button>
          </div>
        </div>
        <div className={exiting ? 'ob-exit' : entering ? 'ob-enter' : ''} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:0 }}>
          <div style={{ padding:'28px 28px 24px' }}>
            <div style={{ fontSize:40,marginBottom:14 }}>{s.icon}</div>
            <h2 style={{ fontSize:22,fontWeight:900,color:'#0f172a',letterSpacing:'-0.6px',lineHeight:1.25,marginBottom:12 }}>
              {step === 0 ? <>Hola, <span style={{ color:s.color }}>{nombre}</span> 👋<br/>{s.title}</> : s.title}
            </h2>
            <p style={{ fontSize:13,color:'#475569',lineHeight:1.85,marginBottom:24 }}>{s.desc}</p>
            <div style={{ display:'flex',gap:6,marginBottom:24 }}>
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => i !== step && goTo(i)} style={{ width:i===step?24:8,height:8,borderRadius:4,border:'none',cursor:'pointer',background:i===step?s.color:i<step?s.color+'55':'#e2e8f0',transition:'all 0.35s ease',padding:0 }}/>
              ))}
            </div>
            <div style={{ display:'flex',gap:8 }}>
              {step > 0 && (
                <button onClick={() => goTo(step - 1)} style={{ padding:'11px 20px',borderRadius:10,border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',fontSize:13,fontWeight:600,cursor:'pointer' }}>← Anterior</button>
              )}
              <button onClick={() => isLast ? onFinish() : goTo(step + 1)} style={{ flex:1,padding:'12px 20px',borderRadius:10,border:'none',background:`linear-gradient(135deg,${s.color},${s.color}cc)`,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:`0 4px 16px ${s.color}44`,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                {isLast ? '🚀 ¡Empezar!' : 'Siguiente →'}
              </button>
            </div>
          </div>
          <div style={{ background:step===0?'#0f172a':step===1?'#020817':step===2?'#020817':step===3?'#0f172a':'#f8fafc',padding:'28px 24px',display:'flex',flexDirection:'column',justifyContent:'center',borderLeft:`1px solid ${step>=4?'#e2e8f0':'#1e293b'}` }}>
            {s.visual}
          </div>
        </div>
        <div style={{ padding:'10px 28px 14px',borderTop:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',gap:6 }}>
            {['Sesiones','Labs','Skills','Progresión','Empleo'].map((l, i) => (
              <span key={i} style={{ fontSize:10,padding:'2px 8px',borderRadius:5,background:i===step?s.light:'#f8fafc',color:i===step?s.color:'#94a3b8',fontWeight:i===step?700:400,border:`1px solid ${i===step?s.color+'33':'#f1f5f9'}`,cursor:'pointer' }} onClick={() => goTo(i)}>{l}</span>
            ))}
          </div>
          <span style={{ fontSize:11,color:'#cbd5e1' }}>SoCBlast · v2.0</span>
        </div>
      </div>
    </div>
  );
}

// ─── ARENAS ───────────────────────────────────────────────────────────────────
const ARENAS = [
  { id:'bronce3',  name:'Bronce III',  tier:'bronce',   div:3, min:0,    max:299,   color:'#92400e', colorLight:'#fef3c7', gradFrom:'#d97706', gradTo:'#92400e',  colorRgb:'180,83,9'   },
  { id:'bronce2',  name:'Bronce II',   tier:'bronce',   div:2, min:300,  max:599,   color:'#92400e', colorLight:'#fef3c7', gradFrom:'#f59e0b', gradTo:'#b45309',  colorRgb:'180,83,9'   },
  { id:'bronce1',  name:'Bronce I',    tier:'bronce',   div:1, min:600,  max:899,   color:'#92400e', colorLight:'#fef3c7', gradFrom:'#fbbf24', gradTo:'#d97706',  colorRgb:'180,83,9'   },
  { id:'plata3',   name:'Plata III',   tier:'plata',    div:3, min:900,  max:1199,  color:'#475569', colorLight:'#f1f5f9', gradFrom:'#64748b', gradTo:'#334155',  colorRgb:'71,85,105'  },
  { id:'plata2',   name:'Plata II',    tier:'plata',    div:2, min:1200, max:1499,  color:'#475569', colorLight:'#f1f5f9', gradFrom:'#94a3b8', gradTo:'#475569',  colorRgb:'71,85,105'  },
  { id:'plata1',   name:'Plata I',     tier:'plata',    div:1, min:1500, max:1799,  color:'#334155', colorLight:'#f1f5f9', gradFrom:'#cbd5e1', gradTo:'#64748b',  colorRgb:'71,85,105'  },
  { id:'oro3',     name:'Oro III',     tier:'oro',      div:3, min:1800, max:2099,  color:'#92400e', colorLight:'#fffbeb', gradFrom:'#d97706', gradTo:'#92400e',  colorRgb:'146,64,14'  },
  { id:'oro2',     name:'Oro II',      tier:'oro',      div:2, min:2100, max:2399,  color:'#78350f', colorLight:'#fffbeb', gradFrom:'#f59e0b', gradTo:'#b45309',  colorRgb:'146,64,14'  },
  { id:'oro1',     name:'Oro I',       tier:'oro',      div:1, min:2400, max:2699,  color:'#78350f', colorLight:'#fffbeb', gradFrom:'#fbbf24', gradTo:'#d97706',  colorRgb:'146,64,14'  },
  { id:'diamante3',name:'Diamante III',tier:'diamante', div:3, min:2700, max:2999,  color:'#1e40af', colorLight:'#eff6ff', gradFrom:'#3b82f6', gradTo:'#1e40af',  colorRgb:'59,130,246' },
  { id:'diamante2',name:'Diamante II', tier:'diamante', div:2, min:3000, max:3299,  color:'#1d4ed8', colorLight:'#eff6ff', gradFrom:'#60a5fa', gradTo:'#2563eb',  colorRgb:'59,130,246' },
  { id:'diamante1',name:'Diamante I',  tier:'diamante', div:1, min:3300, max:99999, color:'#1e3a8a', colorLight:'#eff6ff', gradFrom:'#93c5fd', gradTo:'#3b82f6',  colorRgb:'59,130,246' },
];

const getArenaFromCopas = (copas) => ARENAS.find(a => copas >= a.min && copas <= a.max) || ARENAS[0];

const Planet = ({ tier, size = 110 }) => {
  const p = {
    bronce:   (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="pb1" cx="35%" cy="30%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="40%" stopColor="#D97706"/><stop offset="100%" stopColor="#5C2E00"/></radialGradient><radialGradient id="pb2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.45)"/></radialGradient></defs><circle cx="60" cy="60" r="52" fill="url(#pb1)"/><ellipse cx="42" cy="38" rx="20" ry="7" fill="rgba(180,90,20,0.35)" transform="rotate(-25,42,38)"/><ellipse cx="72" cy="68" rx="24" ry="6" fill="rgba(90,40,5,0.3)" transform="rotate(12,72,68)"/><circle cx="60" cy="60" r="52" fill="url(#pb2)"/></svg>),
    plata:    (<svg width={size} height={size} viewBox="0 0 150 120"><defs><radialGradient id="pp1" cx="35%" cy="30%"><stop offset="0%" stopColor="#F1F5F9"/><stop offset="45%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#1E293B"/></radialGradient><radialGradient id="pp2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.4)"/></radialGradient><linearGradient id="pr1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="50%" stopColor="rgba(148,163,184,0.6)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient></defs><ellipse cx="75" cy="72" rx="70" ry="6" fill="url(#pr1)" opacity="0.7"/><circle cx="75" cy="60" r="48" fill="url(#pp1)"/><circle cx="75" cy="60" r="48" fill="url(#pp2)"/></svg>),
    oro:      (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="po1" cx="35%" cy="30%"><stop offset="0%" stopColor="#FEF08A"/><stop offset="35%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#78350F"/></radialGradient><radialGradient id="po2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.38)"/></radialGradient></defs><circle cx="60" cy="60" r="54" fill="url(#po1)"/><ellipse cx="45" cy="42" rx="22" ry="9" fill="rgba(251,191,36,0.3)" transform="rotate(-15,45,42)"/><circle cx="60" cy="60" r="54" fill="url(#po2)"/></svg>),
    diamante: (<svg width={size} height={size} viewBox="0 0 130 120"><defs><radialGradient id="pd1" cx="35%" cy="30%"><stop offset="0%" stopColor="#DBEAFE"/><stop offset="30%" stopColor="#93C5FD"/><stop offset="60%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#1E3A8A"/></radialGradient><radialGradient id="pd2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.4)"/></radialGradient><linearGradient id="pdr" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(147,197,253,0)"/><stop offset="50%" stopColor="rgba(147,197,253,0.55)"/><stop offset="100%" stopColor="rgba(147,197,253,0)"/></linearGradient></defs><ellipse cx="65" cy="74" rx="64" ry="7" fill="url(#pdr)" opacity="0.6"/><circle cx="65" cy="60" r="52" fill="url(#pd1)"/><circle cx="65" cy="60" r="52" fill="url(#pd2)"/></svg>),
  };
  return p[tier] || null;
};

const ParticleCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const pts = Array.from({length:45},()=>({ x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35, r:Math.random()*1.8+.8, o:Math.random()*.18+.04 }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      pts.forEach(n=>{ n.x+=n.vx; n.y+=n.vy; if(n.x<0||n.x>w)n.vx*=-1; if(n.y<0||n.y>h)n.vy*=-1; ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=`rgba(79,70,229,${n.o})`; ctx.fill(); });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{ const d=Math.hypot(a.x-b.x,a.y-b.y); if(d<150){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=`rgba(79,70,229,${(1-d/150)*.06})`; ctx.lineWidth=.4; ctx.stroke(); }}));
      raf=requestAnimationFrame(draw);
    };
    draw();
    const resize=()=>{ w=c.width=window.innerWidth; h=c.height=window.innerHeight; };
    window.addEventListener('resize',resize);
    return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  },[]);
  return <canvas ref={ref} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>;
};

const ActivityHeatmap = ({ historial }) => {
  const days = 90;
  const today = new Date();
  const cells = Array.from({length: days}, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = historial.filter(s => new Date(s.inicio * 1000).toISOString().split('T')[0] === dateStr).length;
    return { date: d, count };
  });
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i+7));
  const getColor = (count) => {
    if (count === 0) return 'rgba(79,70,229,0.07)';
    if (count === 1) return 'rgba(79,70,229,0.3)';
    if (count === 2) return 'rgba(79,70,229,0.55)';
    return 'rgba(79,70,229,0.85)';
  };
  return (
    <div style={{display:'flex',gap:'3px'}}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{display:'flex',flexDirection:'column',gap:'3px'}}>
          {week.map((day, di) => (
            <div key={di} title={`${day.date.toLocaleDateString('es-ES')} · ${day.count} sesiones`}
              style={{width:'10px',height:'10px',borderRadius:'2px',backgroundColor:getColor(day.count),cursor:'default'}}
              onMouseEnter={e=>e.target.style.transform='scale(1.4)'}
              onMouseLeave={e=>e.target.style.transform='scale(1)'}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const calcStreak = (historial) => {
  if (!historial.length) return 0;
  const dates = [...new Set(historial.map(s => new Date(s.inicio * 1000).toISOString().split('T')[0]))].sort().reverse();
  let streak = 0, current = new Date();
  for (const d of dates) {
    const diff = Math.floor((current - new Date(d)) / 86400000);
    if (diff <= 1) { streak++; current = new Date(d); } else break;
  }
  return streak;
};

const IC = {
  cup:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  flask:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>,
  bolt:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  shield: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  target: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  trend:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  book:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  award:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  user:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  users:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chart:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  planet: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="7"/><path d="M3 12c0 0 5-8 18 0"/><path d="M3 12c0 0 5 8 18 0"/></svg>,
  fire:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  brain:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  eye:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  network:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="6" height="6"/><rect x="16" y="2" width="6" height="6"/><rect x="9" y="16" width="6" height="6"/><path d="M5 8v4h14V8"/><path d="M12 12v4"/></svg>,
  search: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bug:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>,
  clock:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

const Icon = ({name, size=15, color='currentColor'}) => (
  <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',color,width:size,height:size,flexShrink:0}}>
    {React.cloneElement(IC[name]||IC.target, {width:size,height:size})}
  </span>
);

const TIERS    = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const TIER_CLR = ['','#64748b','#3b82f6','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444','#8b5cf6'];
const ACC = '#4f46e5';

const SKILLS = [
  {key:'analisis_logs',           label:'Análisis de Logs',      icon:'search',  color:'#3b82f6', desc:'Lectura e interpretación de logs del sistema'},
  {key:'deteccion_amenazas',      label:'Detección de Amenazas', icon:'eye',     color:'#4f46e5', desc:'Identificación de IOCs y patrones maliciosos'},
  {key:'respuesta_incidentes',    label:'Respuesta Incidentes',  icon:'bolt',    color:'#f59e0b', desc:'Contención, erradicación y recuperación'},
  {key:'threat_hunting',          label:'Threat Hunting',        icon:'target',  color:'#8b5cf6', desc:'Búsqueda proactiva de amenazas ocultas'},
  {key:'forense_digital',         label:'Forense Digital',       icon:'bug',     color:'#ec4899', desc:'Análisis de evidencias y artefactos'},
  {key:'gestion_vulnerabilidades',label:'Gestión de Vulns',      icon:'shield',  color:'#f97316', desc:'Evaluación y priorización de vulnerabilidades'},
  {key:'inteligencia_amenazas',   label:'Intel. de Amenazas',    icon:'brain',   color:'#10b981', desc:'CTI, TTPs y fuentes de inteligencia'},
  {key:'siem_queries',            label:'SIEM & Queries',        icon:'network', color:'#0891b2', desc:'Splunk, Elastic, reglas de correlación'},
];

// ─── COMPONENTE "PRÓXIMAMENTE" ────────────────────────────────────────────────
function ComingSoon({ title, desc, icon, color = '#4f46e5' }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'64px 32px',textAlign:'center',background:'#fafafa',borderRadius:16,border:'2px dashed #e2e8f0',minHeight:280 }}>
      <div style={{ width:64,height:64,borderRadius:20,background:`${color}10`,border:`1px solid ${color}25`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}>
        <Icon name={icon} size={28} color={color}/>
      </div>
      <div style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'4px 14px',borderRadius:100,background:`${color}10`,border:`1px solid ${color}25`,marginBottom:16 }}>
        <Icon name="clock" size={11} color={color}/>
        <span style={{ fontSize:11,fontWeight:700,color:color,letterSpacing:'1px' }}>PRÓXIMAMENTE</span>
      </div>
      <h3 style={{ fontSize:18,fontWeight:800,color:'#0f172a',marginBottom:8,letterSpacing:'-.3px' }}>{title}</h3>
      <p style={{ fontSize:13,color:'#64748b',lineHeight:1.7,maxWidth:360 }}>{desc}</p>
    </div>
  );
}

export default function DashboardAnalista() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData,      setUserData]      = useState(null);
  const [arenaIdx,      setArenaIdx]      = useState(0);
  const [termLines,     setTermLines]     = useState([]);
  const [historial,     setHistorial]     = useState([]);
  const [empleoTab,     setEmpleoTab]     = useState('ofertas');
  const [ranking,       setRanking]       = useState([]);
  const [carruselIdx,   setCarruselIdx]   = useState(0);
  const [skillFocus,    setSkillFocus]    = useState(null);
  const [showOnboarding,setShowOnboarding]= useState(false);
  const sliderRef = useRef(null);
  const startX    = useRef(null);

  const TERM = [
    {text:'$ iniciando sesión SOC...',              color:'#94a3b8', delay:0},
    {text:'⚠  ALERT   Brute force detected',        color:'#ef4444', delay:400},
    {text:'   →  src: 185.220.101.45   rate: 94/min',color:'#64748b',delay:800},
    {text:'   →  target: CORP-DC01   port: 445/SMB', color:'#64748b',delay:1200},
    {text:'$ correlating SIEM events...',            color:'#94a3b8', delay:1600},
    {text:'   →  T1078 Valid Accounts detected',     color:'#f97316', delay:2000},
    {text:'$ awaiting analyst action...',            color:ACC,       delay:2400},
    {text:'▌',                                       color:ACC,       delay:2800},
  ];

  useEffect(() => { fetchUser(); }, []);
  useEffect(() => {
    setTermLines([]);
    TERM.forEach(l => setTimeout(() => setTermLines(p=>[...p.filter(x=>x.text!=='▌'),l]), l.delay));
  }, []);
  useEffect(() => {
    if (userData) {
      const idx = ARENAS.findIndex(a => userData.copas >= a.min && userData.copas <= a.max);
      setArenaIdx(idx >= 0 ? idx : 0);
      if (!localStorage.getItem(ONBOARDING_KEY)) setShowOnboarding(true);
    }
  }, [userData]);

  const fetchUser = async () => {
    try {
      const r = await axios.get(`${API}/api/me`, { headers:{ Authorization:`Bearer ${token}` } });
      setUserData(r.data);
      try { const h = await axios.get(`${API}/api/sesiones/historial`, { headers:{ Authorization:`Bearer ${token}` } }); setHistorial(h.data || []); } catch {}
      try { const rk = await axios.get(`${API}/api/ranking`, { headers:{ Authorization:`Bearer ${token}` } }); setRanking((rk.data?.jugadores || []).slice(0, 3)); } catch {}
    } catch { logout(); navigate('/login'); }
  };

  const handleTouchStart = e => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd   = e => {
    if (!startX.current) return;
    const d = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) { if (d>0&&arenaIdx<ARENAS.length-1) setArenaIdx(i=>i+1); if (d<0&&arenaIdx>0) setArenaIdx(i=>i-1); }
    startX.current = null;
  };

  const copas    = userData?.copas || 0;
  const xp       = userData?.xp || 0;
  const tier     = userData?.tier || 1;
  const sesiones = userData?.sesiones_completadas || 0;
  const skills   = userData?.skills || {};
  const arena    = ARENAS[arenaIdx];
  const arenaActual   = getArenaFromCopas(copas);
  const XP_MAX        = [0,500,1500,3000,5000,8000,12000,18000,99999];
  const xpMin         = XP_MAX[tier-1]||0;
  const xpMax         = XP_MAX[tier]||99999;
  const pctXP         = Math.min(((xp-xpMin)/(xpMax-xpMin))*100, 100);
  const pctCopas      = arenaActual.max===99999?100:Math.min(((copas-arenaActual.min)/300)*100,100);
  const tierColor     = TIER_CLR[tier]||'#64748b';
  const siguienteArena= ARENAS[ARENAS.findIndex(a=>a.id===arenaActual.id)+1];
  const streak        = calcStreak(historial);
  const tierGroups    = ['bronce','plata','oro','diamante'];
  const tierNames     = {bronce:'Bronce',plata:'Plata',oro:'Oro',diamante:'Diamante'};
  const tierColors    = {bronce:'#d97706',plata:'#94a3b8',oro:'#f59e0b',diamante:'#3b82f6'};
  const skillEntries  = SKILLS.map(s=>({...s,val:skills?.[s.key]||0}));
  const weakSkills    = [...skillEntries].sort((a,b)=>a.val-b.val).slice(0,3);
  const topSkills     = [...skillEntries].sort((a,b)=>b.val-a.val).slice(0,3);
  const avgSkill      = Math.round(skillEntries.reduce((acc,s)=>acc+s.val,0)/skillEntries.length*10)/10;

  const css = `
    @keyframes slideIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
    .arena-slide{animation:slideIn 0.3s ease forwards;}
    .planet-anim{animation:float 5s ease-in-out infinite;}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    .stat-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.1)!important;}
    .quick-btn:hover{background:#f0f4ff!important;border-color:#c7d2fe!important;}
    .skill-bar-fill{transition:width 1.2s cubic-bezier(.4,0,.2,1);}
    .skill-row:hover{background:#f8faff!important;border-color:#c7d2fe!important;}
    .hist-row:hover{background:#f8fafc!important;}
    .arena-dot:hover{transform:scale(1.4);}
    .empleo-tab:hover{background:rgba(79,70,229,0.06)!important;}
    .play-btn:hover{filter:brightness(1.08);transform:translateY(-2px)!important;}
    .action-btn:hover{filter:brightness(1.08);transform:translateY(-2px)!important;}
    *{transition:transform .2s ease,box-shadow .2s ease,border-color .15s ease,background .15s ease,filter .15s ease;}
  `;

  if (!userData) return (
    <div style={{minHeight:'100vh',background:'#f5f7fa',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:40,height:40,border:'3px solid #e2e8f0',borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div>
  );

  return (
    <>
      <style>{css}</style>

      {showOnboarding && (
        <OnboardingModal nombre={user?.nombre||'Analista'} onFinish={() => { localStorage.setItem(ONBOARDING_KEY,'1'); setShowOnboarding(false); }}/>
      )}

      <div style={{position:'fixed',inset:0,background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',zIndex:-1}}/>
      <ParticleCanvas/>
      <div style={{position:'relative',zIndex:1,minHeight:'100vh',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0f172a'}}>

        {/* NAVBAR */}
        <nav style={{position:'sticky',top:0,zIndex:50,height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',backgroundColor:'rgba(255,255,255,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 12px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:'28px'}}/>
            <span style={{fontSize:'15px',fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',gap:'2px',alignItems:'center'}}>
            {[
              {label:'Training',    icon:'book',   path:'/training'},
              {label:'Ranking',     icon:'chart',  path:'/ranking'},
              {label:'Certificado', icon:'award',  path:'/certificado'},
              {label:'Perfil',      icon:'user',   path:'/perfil'},
              {label:'Empleo',      icon:'users',  path:'#empleo'},
            ].map((item,i)=>(
              <button key={i} className="nav-btn"
                onClick={()=>item.path==='#empleo'?document.getElementById('empleo-section')?.scrollIntoView({behavior:'smooth'}):navigate(item.path)}
                style={{padding:'5px 12px',borderRadius:'7px',background:'none',border:'none',color:'#64748b',fontSize:'13px',fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                <Icon name={item.icon} size={13} color="#64748b"/> {item.label}
              </button>
            ))}
            <button className="nav-btn" onClick={()=>navigate('/sesion')}
              style={{padding:'5px 12px',borderRadius:'7px',background:'rgba(37,99,235,0.07)',border:'1px solid rgba(37,99,235,0.18)',color:'#2563eb',fontSize:'13px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
              <Icon name="cup" size={13} color="#2563eb"/> Sesiones
            </button>
            <button className="nav-btn" onClick={()=>navigate('/lab')}
              style={{padding:'5px 12px',borderRadius:'7px',background:'rgba(5,150,105,0.07)',border:'1px solid rgba(5,150,105,0.18)',color:'#059669',fontSize:'13px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
              <Icon name="flask" size={13} color="#059669"/> Labs
            </button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'8px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#22c55e',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:'13px',color:'#374151',fontWeight:500}}>{user?.nombre}</span>
              <span onClick={()=>navigate('/arenas')} style={{fontSize:'11px',fontWeight:700,color:arenaActual.color,background:arenaActual.colorLight,padding:'2px 8px',borderRadius:'5px',cursor:'pointer'}}>{arenaActual.name}</span>
            </div>
            {streak > 0 && (
              <div style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'8px',background:'linear-gradient(135deg,#fef3c7,#fffbeb)',border:'1px solid #fcd34d'}}>
                <Icon name="fire" size={13} color="#92400e"/>
                <span style={{fontSize:'12px',fontWeight:700,color:'#92400e'}}>{streak}</span>
              </div>
            )}
            <button onClick={()=>{localStorage.removeItem(ONBOARDING_KEY);setShowOnboarding(true);}} title="Ver tutorial" style={{background:'none',border:'1px solid #e2e8f0',color:'#94a3b8',padding:'5px 10px',borderRadius:'7px',fontSize:'13px',cursor:'pointer'}}>?</button>
            <button onClick={()=>{logout();navigate('/');}} style={{background:'none',border:'1px solid #e2e8f0',color:'#94a3b8',padding:'5px 12px',borderRadius:'7px',fontSize:'12px',cursor:'pointer'}}>Salir</button>
          </div>
        </nav>

        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'24px 40px 72px'}}>

          {/* BIENVENIDA */}
          <div style={{marginBottom:'24px',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div>
              <h1 style={{fontSize:'22px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',marginBottom:'2px'}}>
                Bienvenido de nuevo, <span style={{color:ACC}}>{user?.nombre}</span>
              </h1>
              <p style={{fontSize:'13px',color:'#94a3b8',fontFamily:'monospace'}}>
                {arenaActual.name} · Tier {tier} — {TIERS[tier]} · {sesiones} sesiones · Media skills: <span style={{color:ACC,fontWeight:700}}>{avgSkill}/10</span>
              </p>
            </div>
            {streak > 1 && (
              <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 18px',borderRadius:'12px',background:'linear-gradient(135deg,#fffbeb,#fef3c7)',border:'1px solid #fcd34d',boxShadow:'0 2px 8px rgba(251,191,36,0.2)'}}>
                <Icon name="fire" size={20} color="#92400e"/>
                <div>
                  <div style={{fontSize:'18px',fontWeight:900,color:'#92400e',letterSpacing:'-0.5px',lineHeight:1}}>{streak} días</div>
                  <div style={{fontSize:'11px',color:'#b45309',fontWeight:600}}>racha activa</div>
                </div>
              </div>
            )}
          </div>

          {/* FILA 1: ARENA + TERMINAL */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:'14px',marginBottom:'14px'}}>
            <div>
              <div style={{display:'flex',gap:'12px',marginBottom:'10px',alignItems:'center'}}>
                {tierGroups.map(t=>(
                  <div key={t} style={{display:'flex',alignItems:'center',gap:'4px'}}>
                    <span style={{fontSize:'10px',color:ARENAS.find(a=>a.tier===t&&a.id===arenaActual.id)?tierColors[t]:'#cbd5e1',fontFamily:'monospace',fontWeight:700,letterSpacing:'1px'}}>{tierNames[t].toUpperCase()}</span>
                    {[3,2,1].map(d=>{
                      const a = ARENAS.find(x=>x.tier===t&&x.div===d);
                      const isActive  = a?.id === ARENAS[arenaIdx]?.id;
                      const isCurrent = a?.id === arenaActual.id;
                      return <button key={d} className="arena-dot" onClick={()=>setArenaIdx(ARENAS.findIndex(x=>x.id===a.id))} style={{width:isActive?'20px':'7px',height:'7px',borderRadius:'4px',backgroundColor:isActive?tierColors[t]:isCurrent?`${tierColors[t]}60`:'#e2e8f0',border:'none',cursor:'pointer',padding:0}}/>;
                    })}
                  </div>
                ))}
              </div>
              <div style={{position:'relative'}}>
                <div style={{position:'absolute',top:'14px',right:'14px',zIndex:10,display:'flex',gap:'7px'}}>
                  <button className="action-btn" onClick={e=>{e.stopPropagation();navigate('/sesion');}}
                    style={{display:'flex',alignItems:'center',gap:'5px',padding:'7px 13px',borderRadius:'8px',background:'rgba(37,99,235,0.88)',backdropFilter:'blur(8px)',border:'1px solid rgba(147,197,253,0.3)',color:'#fff',fontSize:'12px',fontWeight:700,cursor:'pointer',boxShadow:'0 3px 14px rgba(37,99,235,0.4)'}}>
                    <Icon name="cup" size={12} color="#fff"/> Sesión
                  </button>
                </div>
                <div ref={sliderRef} className="arena-slide" key={arenaIdx}
                  onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
                  onClick={()=>navigate('/arenas')}
                  style={{borderRadius:'18px',padding:'30px 38px',background:`linear-gradient(135deg,${arena.gradFrom} 0%,${arena.gradTo} 100%)`,position:'relative',overflow:'hidden',boxShadow:`0 8px 40px rgba(${arena.colorRgb},.35)`,cursor:'pointer'}}>
                  <div style={{position:'absolute',top:'-50px',right:'-30px',width:'280px',height:'280px',borderRadius:'50%',background:'rgba(255,255,255,0.08)',pointerEvents:'none'}}/>
                  <div style={{display:'flex',alignItems:'center',gap:'32px',position:'relative',zIndex:1}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                        {arena.id===arenaActual.id && <div style={{width:'5px',height:'5px',borderRadius:'50%',backgroundColor:'#fff',animation:'pulse 2s infinite'}}/>}
                        <span style={{fontSize:'10px',color:'rgba(255,255,255,0.75)',letterSpacing:'2.5px',fontWeight:700,fontFamily:'monospace'}}>{arena.id===arenaActual.id?'TU ARENA ACTUAL':'ARENA'}</span>
                      </div>
                      <h1 style={{fontSize:'clamp(38px,4.5vw,60px)',fontWeight:900,color:'#fff',letterSpacing:'-2px',lineHeight:1,marginBottom:'4px'}}>{arena.name}</h1>
                      <p style={{fontSize:'11px',color:'rgba(255,255,255,0.55)',fontFamily:'monospace',marginBottom:'18px'}}>{arena.min} — {arena.max===99999?'∞':arena.max} copas · División {arena.div}</p>
                      {arena.id===arenaActual.id ? (
                        <>
                          <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'10px'}}>
                            <span style={{fontSize:'36px',fontWeight:900,color:'#fff',letterSpacing:'-1px'}}>{copas.toLocaleString()}</span>
                            <span style={{fontSize:'13px',color:'rgba(255,255,255,0.65)'}}>copas</span>
                            {siguienteArena && <span style={{fontSize:'10px',color:'rgba(255,255,255,0.8)',padding:'2px 8px',borderRadius:'5px',background:'rgba(255,255,255,0.18)',fontFamily:'monospace'}}>{siguienteArena.min-copas} → {siguienteArena.name}</span>}
                          </div>
                          <div style={{height:'5px',borderRadius:'3px',backgroundColor:'rgba(255,255,255,0.22)',maxWidth:'300px',marginBottom:'6px'}}>
                            <div style={{width:`${pctCopas}%`,height:'100%',borderRadius:'3px',backgroundColor:'#fff',opacity:.9}}/>
                          </div>
                          <p style={{fontSize:'10px',color:'rgba(255,255,255,0.55)',fontFamily:'monospace'}}>{Math.round(pctCopas)}% hacia {siguienteArena?.name||'máximo'}</p>
                        </>
                      ) : (
                        <p style={{fontSize:'13px',color:'rgba(255,255,255,0.75)'}}>{arena.min>copas?`Faltan ${(arena.min-copas).toLocaleString()} copas`:'✓ Arena superada'}</p>
                      )}
                    </div>
                    <div className="planet-anim" style={{flexShrink:0,filter:'drop-shadow(0 8px 24px rgba(0,0,0,0.3))'}}>
                      <Planet tier={arena.tier} size={150}/>
                    </div>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:'14px',position:'relative',zIndex:1}}>
                    <button onClick={e=>{e.stopPropagation();arenaIdx>0&&setArenaIdx(i=>i-1);}} style={{background:'none',border:'none',color:arenaIdx>0?'rgba(255,255,255,0.55)':'transparent',cursor:arenaIdx>0?'pointer':'default',fontSize:'11px',fontFamily:'monospace'}}>← {arenaIdx>0?ARENAS[arenaIdx-1].name:''}</button>
                    <button onClick={e=>{e.stopPropagation();arenaIdx<ARENAS.length-1&&setArenaIdx(i=>i+1);}} style={{background:'none',border:'none',color:arenaIdx<ARENAS.length-1?'rgba(255,255,255,0.55)':'transparent',cursor:arenaIdx<ARENAS.length-1?'pointer':'default',fontSize:'11px',fontFamily:'monospace'}}>{arenaIdx<ARENAS.length-1?ARENAS[arenaIdx+1].name:''} →</button>
                  </div>
                  <div style={{position:'absolute',bottom:'14px',left:'50%',transform:'translateX(-50%)',fontSize:'10px',color:'rgba(255,255,255,0.4)',fontFamily:'monospace',letterSpacing:'1px'}}>CLICK PARA VER TODAS LAS ARENAS</div>
                </div>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <div style={{flex:1,borderRadius:'14px',overflow:'hidden',border:'1px solid #e2e8f0',backgroundColor:'#fff',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
                <div style={{backgroundColor:'#f8fafc',padding:'7px 14px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:'5px'}}>
                  {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:c}}/>)}
                  <span style={{color:'#94a3b8',fontSize:'10px',fontFamily:'monospace',marginLeft:'8px'}}>soc-terminal</span>
                </div>
                <div style={{backgroundColor:'#0f172a',padding:'12px 16px',fontFamily:"'Fira Code',monospace",fontSize:'10px',lineHeight:1.9,minHeight:'220px'}}>
                  {termLines.map((l,i)=>(
                    <p key={i} style={{color:l.color,margin:0,animation:'fadeIn .25s ease'}}>
                      {l.text==='▌'?<span style={{animation:'blink 1s infinite',display:'inline-block'}}>{l.text}</span>:l.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'14px'}}>
            {[
              {label:'COPAS',    value:copas.toLocaleString(), sub:arenaActual.name,              color:tierColors[arenaActual.tier]||'#d97706', light:arenaActual.colorLight, icon:'cup',    onClick:()=>navigate('/arenas')},
              {label:'XP TOTAL', value:xp.toLocaleString(),    sub:`${Math.round(pctXP)}% tier`,  color:'#4f46e5', light:'#eef2ff', icon:'bolt',   onClick:()=>navigate('/perfil')},
              {label:'SESIONES', value:sesiones.toString(),    sub:'completadas',                  color:'#059669', light:'#ecfdf5', icon:'target', onClick:null},
              {label:'TIER',     value:`T${tier}`,              sub:TIERS[tier],                   color:tierColor,  light:'#f8fafc', icon:'shield', onClick:()=>navigate('/perfil')},
            ].map((s,i)=>(
              <div key={i} className="stat-card" onClick={s.onClick||undefined}
                style={{padding:'22px 20px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',cursor:s.onClick?'pointer':'default',boxShadow:'0 2px 10px rgba(0,0,0,.05)',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:`linear-gradient(90deg,${s.color},${s.color}80)`,borderRadius:'16px 16px 0 0'}}/>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'14px'}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'12px',backgroundColor:s.light,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${s.color}15`}}>
                    <Icon name={s.icon} size={18} color={s.color}/>
                  </div>
                  {s.onClick && <Icon name="trend" size={14} color="#cbd5e1"/>}
                </div>
                <div style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:'6px',fontFamily:'monospace'}}>{s.label}</div>
                <div style={{fontSize:'26px',fontWeight:900,color:s.color,letterSpacing:'-0.8px',lineHeight:1,marginBottom:'5px'}}>{s.value}</div>
                <div style={{fontSize:'12px',color:'#64748b'}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* XP BAR */}
          <div style={{padding:'16px 20px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:'20px',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'13px',fontWeight:700,color:tierColor}}>{TIERS[tier]}</span>
                <span style={{fontSize:'10px',color:'#94a3b8',padding:'2px 7px',borderRadius:'5px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',fontFamily:'monospace'}}>T{tier}</span>
                {tier<8&&<span style={{fontSize:'12px',color:'#94a3b8'}}>→ {TIERS[tier+1]}</span>}
              </div>
              <span style={{fontSize:'11px',color:'#94a3b8',fontFamily:'monospace'}}>{xp.toLocaleString()} / {xpMax===99999?'∞':xpMax.toLocaleString()} XP</span>
            </div>
            <div style={{height:'8px',borderRadius:'4px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
              <div className="skill-bar-fill" style={{width:`${pctXP}%`,height:'100%',borderRadius:'4px',background:`linear-gradient(90deg,${tierColor}80,${tierColor})`}}/>
            </div>
          </div>

          {/* CARRUSEL MODOS */}
          <div style={{marginBottom:'28px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
              <div>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:'2px'}}>MODOS DE JUEGO</p>
                <p style={{fontSize:'12px',color:'#64748b'}}>Sesiones competitivas o laboratorio de investigación</p>
              </div>
              <div style={{display:'flex',gap:'6px'}}>
                <button onClick={()=>setCarruselIdx(0)} style={{padding:'6px 14px',borderRadius:'8px',border:`1px solid ${carruselIdx===0?'#2563eb':'#e2e8f0'}`,backgroundColor:carruselIdx===0?'#2563eb':'#fff',color:carruselIdx===0?'#fff':'#64748b',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                  <Icon name="cup" size={12} color={carruselIdx===0?'#fff':'#64748b'}/> Sesiones
                </button>
                <button onClick={()=>setCarruselIdx(1)} style={{padding:'6px 14px',borderRadius:'8px',border:`1px solid ${carruselIdx===1?'#059669':'#e2e8f0'}`,backgroundColor:carruselIdx===1?'#059669':'#fff',color:carruselIdx===1?'#fff':'#64748b',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                  <Icon name="flask" size={12} color={carruselIdx===1?'#fff':'#64748b'}/> Labs
                </button>
              </div>
            </div>
            <div style={{overflow:'hidden',borderRadius:'20px'}}>
              <div style={{display:'flex',transition:'transform .45s cubic-bezier(.4,0,.2,1)',transform:`translateX(-${carruselIdx*100}%)`}}>
                {/* SESIONES */}
                <div style={{minWidth:'100%',borderRadius:'20px',overflow:'hidden',border:'1px solid rgba(37,99,235,0.25)',boxShadow:'0 8px 32px rgba(37,99,235,0.12)'}}>
                  <div style={{padding:'36px 44px',background:'linear-gradient(135deg,#1e1b4b 0%,#1e3a8a 50%,#1d4ed8 100%)',position:'relative',overflow:'hidden',display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:'40px'}}>
                    <div style={{position:'absolute',top:'-80px',right:'-60px',width:'320px',height:'320px',borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.2),transparent)',pointerEvents:'none'}}/>
                    <div style={{position:'relative',zIndex:1}}>
                      <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'5px 13px',borderRadius:'100px',border:'1px solid rgba(147,197,253,0.3)',backgroundColor:'rgba(37,99,235,0.25)',marginBottom:'16px'}}>
                        <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#93c5fd',animation:'pulse 2s infinite'}}/>
                        <span style={{fontSize:'10px',color:'#93c5fd',fontWeight:700,letterSpacing:'2px'}}>SESIONES COMPETITIVAS</span>
                      </div>
                      <h2 style={{fontSize:'28px',fontWeight:900,color:'#fff',letterSpacing:'-0.8px',marginBottom:'10px',lineHeight:1.1}}>Demuestra tu nivel.<br/><span style={{color:'#93c5fd'}}>Gana copas. Sube de arena.</span></h2>
                      <p style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',lineHeight:1.75,maxWidth:'460px',marginBottom:'20px'}}>Escenarios SOC únicos generados por IA. Tiempo limitado. Velocidad y precisión puntúan. La IA evalúa tus skills en cada decisión.</p>
                      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'26px'}}>
                        {[{n:'bolt',l:'Tiempo limitado'},{n:'cup',l:'Copas y arenas'},{n:'brain',l:'Skills evaluadas'},{n:'trend',l:'Ranking global'}].map((f,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:'5px',padding:'5px 11px',borderRadius:'7px',backgroundColor:'rgba(255,255,255,0.09)',border:'1px solid rgba(255,255,255,0.13)'}}>
                            <Icon name={f.n} size={12} color="#93c5fd"/><span style={{fontSize:'11px',color:'rgba(255,255,255,0.8)',fontWeight:500}}>{f.l}</span>
                          </div>
                        ))}
                      </div>
                      <button className="play-btn" onClick={()=>navigate('/sesion')}
                        style={{padding:'14px 36px',borderRadius:'100px',background:'linear-gradient(135deg,#2563eb,#3b82f6)',border:'none',color:'#fff',fontSize:'15px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 24px rgba(37,99,235,0.5)',display:'inline-flex',alignItems:'center',gap:'10px'}}>
                        <Icon name="bolt" size={16} color="#fff"/> Jugar ahora →
                      </button>
                    </div>
                    <div style={{flexShrink:0,position:'relative',zIndex:1}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',width:'200px'}}>
                        {[{label:'Copas',value:copas.toLocaleString(),color:'#fbbf24'},{label:'Arena',value:arenaActual.name,color:'#93c5fd'},{label:'Sesiones',value:sesiones,color:'#34d399'},{label:'Media skills',value:`${avgSkill}/10`,color:'#a78bfa'}].map((s,i)=>(
                          <div key={i} style={{padding:'12px',borderRadius:'10px',backgroundColor:'rgba(0,0,0,0.28)',border:'1px solid rgba(255,255,255,0.08)',textAlign:'center'}}>
                            <div style={{fontSize:'15px',fontWeight:800,color:s.color,lineHeight:1,marginBottom:'3px'}}>{s.value}</div>
                            <div style={{fontSize:'9px',color:'rgba(255,255,255,0.35)',fontFamily:'monospace'}}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{backgroundColor:'rgba(248,250,252,0.95)',padding:'12px',display:'flex',justifyContent:'center',gap:'8px',borderTop:'1px solid #e8eaf0'}}>
                    {[0,1].map(i=><div key={i} onClick={()=>setCarruselIdx(i)} style={{width:carruselIdx===i?'24px':'8px',height:'8px',borderRadius:'4px',backgroundColor:carruselIdx===i?'#2563eb':'#cbd5e1',cursor:'pointer',transition:'all .35s'}}/>)}
                  </div>
                </div>
                {/* LABS */}
                <div style={{minWidth:'100%',borderRadius:'20px',overflow:'hidden',border:'1px solid rgba(52,211,153,0.3)',boxShadow:'0 8px 32px rgba(16,185,129,0.12)'}}>
                  <div style={{padding:'36px 44px',background:'linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)',position:'relative',overflow:'hidden',display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:'40px'}}>
                    <div style={{position:'absolute',top:'-80px',right:'-60px',width:'320px',height:'320px',borderRadius:'50%',background:'radial-gradient(circle,rgba(52,211,153,0.18),transparent)',pointerEvents:'none'}}/>
                    <div style={{position:'relative',zIndex:1}}>
                      <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'5px 13px',borderRadius:'100px',border:'1px solid rgba(110,231,183,0.25)',backgroundColor:'rgba(16,185,129,0.2)',marginBottom:'16px'}}>
                        <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:'#6ee7b7',animation:'pulse 2s infinite'}}/>
                        <span style={{fontSize:'10px',color:'#6ee7b7',fontWeight:700,letterSpacing:'2px'}}>LABORATORIO SOC — BETA</span>
                        <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'4px',backgroundColor:'rgba(52,211,153,0.25)',color:'#6ee7b7',fontWeight:700}}>NUEVO</span>
                      </div>
                      <h2 style={{fontSize:'28px',fontWeight:900,color:'#fff',letterSpacing:'-0.8px',marginBottom:'10px',lineHeight:1.1}}>Investiga a fondo.<br/><span style={{color:'#6ee7b7'}}>Sin límite de tiempo.</span></h2>
                      <p style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',lineHeight:1.75,maxWidth:'460px',marginBottom:'20px'}}>SIEM completo, Log Explorer, Network Map y evaluación IA. La profundidad de tu análisis es lo que mejora tus skills.</p>
                      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'26px'}}>
                        {[{n:'network',l:'SIEM queries'},{n:'search',l:'Log Explorer'},{n:'planet',l:'Network Map'},{n:'brain',l:'IA evalúa skills'}].map((f,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:'5px',padding:'5px 11px',borderRadius:'7px',backgroundColor:'rgba(255,255,255,0.09)',border:'1px solid rgba(255,255,255,0.13)'}}>
                            <Icon name={f.n} size={12} color="#6ee7b7"/><span style={{fontSize:'11px',color:'rgba(255,255,255,0.8)',fontWeight:500}}>{f.l}</span>
                          </div>
                        ))}
                      </div>
                      <button className="play-btn" onClick={()=>navigate('/lab')}
                        style={{padding:'14px 36px',borderRadius:'100px',background:'linear-gradient(135deg,#10b981,#059669)',border:'none',color:'#fff',fontSize:'15px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 24px rgba(16,185,129,0.5)',display:'inline-flex',alignItems:'center',gap:'10px'}}>
                        <Icon name="flask" size={16} color="#fff"/> Entrar al Lab →
                      </button>
                    </div>
                    <div style={{flexShrink:0,position:'relative',zIndex:1}}>
                      <div style={{borderRadius:'12px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)',width:'200px'}}>
                        <div style={{backgroundColor:'#0f172a',padding:'7px 10px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',gap:'4px'}}>
                          {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:c}}/>)}
                        </div>
                        <div style={{backgroundColor:'#020817',padding:'10px',fontFamily:'monospace',fontSize:'9px',lineHeight:1.9}}>
                          <p style={{color:'#475569'}}>siem&gt; index=windows</p>
                          <p style={{color:'#f87171',fontWeight:700}}>mimikatz.exe ⚠</p>
                          <p style={{color:'#f87171'}}>c2.nighthawk.ru ⚠</p>
                          <div style={{marginTop:'6px',padding:'5px 7px',borderRadius:'5px',backgroundColor:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)'}}>
                            <p style={{color:'#34d399',fontSize:'8px'}}>IOC detectado</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{backgroundColor:'rgba(248,250,252,0.95)',padding:'12px',display:'flex',justifyContent:'center',gap:'8px',borderTop:'1px solid #e8eaf0'}}>
                    {[0,1].map(i=><div key={i} onClick={()=>setCarruselIdx(i)} style={{width:carruselIdx===i?'24px':'8px',height:'8px',borderRadius:'4px',backgroundColor:carruselIdx===i?'#10b981':'#cbd5e1',cursor:'pointer',transition:'all .35s'}}/>)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SKILLS */}
          <div style={{marginBottom:'28px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
              <div>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace',marginBottom:'3px'}}>SKILL MATRIX</p>
                <p style={{fontSize:'13px',color:'#0f172a',fontWeight:700}}>Tus habilidades como analista SOC</p>
              </div>
              <button onClick={()=>navigate('/perfil')} style={{fontSize:'12px',color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600,display:'flex',alignItems:'center',gap:'4px'}}>Ver detalle completo →</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'16px'}}>
              <div style={{padding:'16px 18px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                <div style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:'8px',fontFamily:'monospace'}}>MEDIA GLOBAL</div>
                <div style={{fontSize:'32px',fontWeight:900,color:ACC,letterSpacing:'-1px',lineHeight:1,marginBottom:'4px'}}>{avgSkill}</div>
                <div style={{fontSize:'11px',color:'#64748b'}}>/10 puntos</div>
                <div style={{marginTop:'10px',height:'4px',borderRadius:'2px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                  <div style={{width:`${avgSkill*10}%`,height:'100%',borderRadius:'2px',background:`linear-gradient(90deg,${ACC}80,${ACC})`}}/>
                </div>
              </div>
              <div style={{padding:'16px 18px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                <div style={{fontSize:'10px',color:'#ef4444',fontWeight:700,letterSpacing:'1.5px',marginBottom:'8px',fontFamily:'monospace'}}>SKILLS DÉBILES</div>
                {weakSkills.slice(0,3).map((s,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'5px'}}>
                    <span style={{fontSize:'11px',color:'#475569'}}>{s.label}</span>
                    <span style={{fontSize:'11px',fontWeight:700,color:'#ef4444'}}>{s.val}/10</span>
                  </div>
                ))}
              </div>
              <div style={{padding:'16px 18px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
                <div style={{fontSize:'10px',color:'#059669',fontWeight:700,letterSpacing:'1.5px',marginBottom:'8px',fontFamily:'monospace'}}>TOP SKILLS</div>
                {topSkills.slice(0,3).map((s,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'5px'}}>
                    <span style={{fontSize:'11px',color:'#475569'}}>{s.label}</span>
                    <span style={{fontSize:'11px',fontWeight:700,color:'#059669'}}>{s.val}/10</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e8eaf0',overflow:'hidden',boxShadow:'0 2px 10px rgba(0,0,0,.05)'}}>
              <div style={{padding:'16px 20px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <p style={{fontSize:'12px',color:'#0f172a',fontWeight:700}}>Desglose de habilidades</p>
                <span style={{fontSize:'11px',color:'#94a3b8'}}>{skillEntries.filter(s=>s.val>=7).length} skills avanzadas · {skillEntries.filter(s=>s.val<4).length} por mejorar</span>
              </div>
              <div style={{padding:'6px 0'}}>
                {skillEntries.map((s,i)=>{
                  const pct    = Math.min((s.val/10)*100,100);
                  const isWeak = s.val < 4;
                  const isTop  = s.val >= 7;
                  const isFocus= skillFocus===s.key;
                  return (
                    <div key={i} className="skill-row"
                      onMouseEnter={()=>setSkillFocus(s.key)}
                      onMouseLeave={()=>setSkillFocus(null)}
                      style={{display:'flex',alignItems:'center',gap:'14px',padding:'11px 20px',borderBottom:i<skillEntries.length-1?'1px solid #f8fafc':'none',cursor:'default',backgroundColor:isFocus?'#f8faff':'transparent'}}>
                      <div style={{width:'32px',height:'32px',borderRadius:'9px',backgroundColor:isWeak?'#fef2f2':isTop?'#f0fdf4':`${s.color}10`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${isWeak?'#fecaca':isTop?'#bbf7d0':`${s.color}20`}`}}>
                        <Icon name={s.icon} size={14} color={isWeak?'#ef4444':isTop?'#059669':s.color}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'5px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                            <span style={{fontSize:'12px',color:isWeak?'#ef4444':isTop?'#059669':'#374151',fontWeight:600}}>{s.label}</span>
                            {isWeak && <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'4px',backgroundColor:'#fef2f2',color:'#ef4444',fontWeight:700,border:'1px solid #fecaca'}}>MEJORAR</span>}
                            {isTop  && <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'4px',backgroundColor:'#f0fdf4',color:'#059669',fontWeight:700,border:'1px solid #bbf7d0'}}>DOMINADA</span>}
                          </div>
                          <span style={{fontSize:'12px',fontWeight:800,color:isWeak?'#ef4444':isTop?'#059669':s.color,fontFamily:'monospace'}}>{s.val}/10</span>
                        </div>
                        <div style={{height:'7px',borderRadius:'4px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                          <div className="skill-bar-fill" style={{width:`${pct}%`,height:'100%',borderRadius:'4px',background:isWeak?'linear-gradient(90deg,#fca5a5,#ef4444)':isTop?'linear-gradient(90deg,#86efac,#059669)':`linear-gradient(90deg,${s.color}60,${s.color})`}}/>
                        </div>
                        {isFocus && <p style={{fontSize:'10px',color:'#94a3b8',marginTop:'3px',lineHeight:1.4}}>{s.desc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{padding:'14px 20px',backgroundColor:'#f8fafc',borderTop:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <p style={{fontSize:'11px',color:'#94a3b8'}}>Las skills se mejoran automáticamente con cada sesión y laboratorio completado</p>
                <button onClick={()=>navigate('/sesion')} style={{padding:'7px 16px',borderRadius:'8px',background:ACC,border:'none',color:'#fff',fontSize:'11px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
                  <Icon name="bolt" size={11} color="#fff"/> Entrenar ahora
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVIDAD + RANKING */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
            <div style={{padding:'20px 22px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>ACTIVIDAD — 90 DÍAS</p>
                <div style={{display:'flex',gap:'4px',alignItems:'center'}}>
                  {[0.07,0.3,0.55,0.85].map((o,i)=><div key={i} style={{width:'8px',height:'8px',borderRadius:'2px',backgroundColor:`rgba(79,70,229,${o})`}}/>)}
                </div>
              </div>
              <div style={{overflowX:'auto',marginBottom:'14px'}}><ActivityHeatmap historial={historial}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
                {[
                  {value:sesiones, label:'sesiones', color:ACC},
                  {value:streak,   label:'racha',    color:'#f59e0b'},
                  {value:historial.filter(s=>s.resultado?.copas_ganadas>0).length, label:'victorias', color:'#059669'},
                ].map((s,i)=>(
                  <div key={i} style={{textAlign:'center',padding:'10px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #f1f5f9'}}>
                    <div style={{fontSize:'20px',fontWeight:900,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:'10px',color:'#94a3b8',marginTop:'2px'}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div style={{padding:'18px 20px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)',flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                  <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>TOP RANKING</p>
                  <button onClick={()=>navigate('/ranking')} style={{fontSize:'10px',color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Ver todo →</button>
                </div>
                {ranking.length===0 ? <p style={{fontSize:'12px',color:'#94a3b8',textAlign:'center',padding:'10px 0'}}>Cargando...</p> : ranking.map((j,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:i<ranking.length-1?'1px solid #f1f5f9':'none'}}>
                    <div style={{width:'24px',height:'24px',borderRadius:'6px',backgroundColor:i===0?'#fef3c7':i===1?'#f1f5f9':'#fdf4ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',flexShrink:0}}>
                      {i===0?'🥇':i===1?'🥈':'🥉'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'12px',fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.nombre}</div>
                      <div style={{fontSize:'10px',color:'#94a3b8',fontFamily:'monospace'}}>{j.arena}</div>
                    </div>
                    <div style={{fontSize:'12px',fontWeight:700,color:'#d97706',fontFamily:'monospace',display:'flex',alignItems:'center',gap:'3px'}}>
                      {j.copas?.toLocaleString()} <Icon name="cup" size={10} color="#d97706"/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{padding:'16px 18px',borderRadius:'16px',background:'linear-gradient(135deg,#fef2f2,#fff1f2)',border:'1px solid #fecaca',boxShadow:'0 2px 10px rgba(239,68,68,.06)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'8px'}}>
                  <Icon name="target" size={14} color="#ef4444"/>
                  <span style={{fontSize:'10px',color:'#ef4444',fontWeight:700,letterSpacing:'1.5px',fontFamily:'monospace'}}>SKILL A MEJORAR</span>
                </div>
                <p style={{fontSize:'13px',color:'#7f1d1d',fontWeight:700,marginBottom:'4px'}}>{weakSkills[0]?.label}</p>
                <p style={{fontSize:'11px',color:'#991b1b',lineHeight:1.5,marginBottom:'10px'}}>Actualmente {weakSkills[0]?.val}/10 — practica en {arenaActual.name}</p>
                <button onClick={()=>navigate('/sesion')} style={{width:'100%',padding:'9px',borderRadius:'9px',background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',color:'#fff',fontSize:'12px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                  <Icon name="bolt" size={12} color="#fff"/> Entrenar ahora →
                </button>
              </div>
            </div>
          </div>

          {/* HISTORIAL + ACCESOS */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'28px'}}>
            <div style={{padding:'20px 22px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',fontFamily:'monospace'}}>ÚLTIMAS SESIONES</p>
                <button onClick={()=>navigate('/sesion')} style={{fontSize:'10px',color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Nueva →</button>
              </div>
              {historial.length===0 ? (
                <div style={{textAlign:'center',padding:'20px 0'}}>
                  <Icon name="target" size={28} color="#cbd5e1"/>
                  <p style={{fontSize:'12px',color:'#94a3b8',marginTop:'8px'}}>Sin sesiones aún</p>
                  <button onClick={()=>navigate('/sesion')} style={{marginTop:'10px',padding:'8px 16px',borderRadius:'8px',backgroundColor:ACC,border:'none',color:'#fff',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Empezar</button>
                </div>
              ) : historial.slice(0,5).map((s,i)=>{
                const res=s.resultado, copasGan=res?.copas_ganadas||0, media=res?.media_puntuacion||0, positive=copasGan>=0;
                return (
                  <div key={i} className="hist-row" style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 11px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #f1f5f9',marginBottom:'6px'}}>
                    <div style={{width:'30px',height:'30px',borderRadius:'8px',backgroundColor:positive?'#ecfdf5':'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Icon name="trend" size={14} color={positive?'#059669':'#ef4444'}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:'11px',color:'#0f172a',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.titulo||'Sesión SOC'}</p>
                      <p style={{fontSize:'10px',color:'#94a3b8',fontFamily:'monospace'}}>{media}/20 pts</p>
                    </div>
                    <span style={{fontSize:'12px',fontWeight:700,color:positive?'#059669':'#ef4444',fontFamily:'monospace',flexShrink:0}}>{positive?'+':''}{copasGan}</span>
                  </div>
                );
              })}
            </div>
            <div style={{padding:'20px 22px',borderRadius:'16px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 10px rgba(0,0,0,.05)'}}>
              <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:'16px',fontFamily:'monospace'}}>ACCESOS RÁPIDOS</p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {[
                  {label:'Laboratorio SOC', desc:'SIEM · Forense · XP',     path:'/lab',         color:'#059669', light:'#ecfdf5', icon:'flask'},
                  {label:'Training SOC',    desc:'12 módulos · 3 cursos',    path:'/training',    color:'#7c3aed', light:'#f5f3ff', icon:'book'},
                  {label:'Ranking Global',  desc:'Tu posición actual',       path:'/ranking',     color:'#d97706', light:'#fffbeb', icon:'chart'},
                  {label:'Arenas',          desc:'Ver todas las divisiones', path:'/arenas',      color:'#0891b2', light:'#ecfeff', icon:'planet'},
                  {label:'Mi Certificado',  desc:'QR verificable',           path:'/certificado', color:'#059669', light:'#ecfdf5', icon:'award'},
                  {label:'Perfil & Tiers',  desc:'Stats y progresión',       path:'/perfil',      color:'#2563eb', light:'#eff6ff', icon:'user'},
                ].map((item,i)=>(
                  <div key={i} className="quick-btn" onClick={()=>navigate(item.path)}
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 13px',borderRadius:'11px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0',cursor:'pointer'}}>
                    <div style={{width:'32px',height:'32px',borderRadius:'9px',backgroundColor:item.light,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${item.color}15`}}>
                      <Icon name={item.icon} size={15} color={item.color}/>
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontSize:'12px',color:'#0f172a',fontWeight:600}}>{item.label}</span>
                      <span style={{fontSize:'10px',color:'#94a3b8',marginLeft:'6px'}}>{item.desc}</span>
                    </div>
                    <Icon name="trend" size={9} color="#cbd5e1"/>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── EMPLEO ─────────────────────────────────────────────────────── */}
          <div id="empleo-section">

            {/* Header empleo */}
            <div style={{position:'relative',borderRadius:'20px',overflow:'hidden',marginBottom:'20px',padding:'36px 48px',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)'}}>
              <div style={{position:'absolute',top:'-60px',right:'-60px',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(79,70,229,0.2),transparent)',pointerEvents:'none'}}/>
              <div style={{position:'relative',zIndex:1,display:'grid',gridTemplateColumns:'1fr auto',alignItems:'center',gap:'32px'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                    <span style={{fontSize:'10px',color:'#818cf8',letterSpacing:'3px',fontWeight:700,fontFamily:'monospace'}}>SOCBLAST CAREERS</span>
                    <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,rgba(129,140,248,0.4),transparent)'}}/>
                  </div>
                  <h2 style={{fontSize:'28px',fontWeight:900,color:'#fff',letterSpacing:'-1px',marginBottom:'10px',lineHeight:1.1}}>Tu próximo paso<br/><span style={{color:'#818cf8'}}>en ciberseguridad.</span></h2>
                  <p style={{fontSize:'13px',color:'rgba(255,255,255,0.5)',lineHeight:1.7,maxWidth:'520px'}}>Ofertas reales, certificaciones recomendadas, bootcamps y retos. Próximamente disponible.</p>
                </div>
                <div style={{padding:'14px 20px',borderRadius:'12px',background:'rgba(79,70,229,0.15)',border:'1px solid rgba(99,102,241,0.25)',textAlign:'center',flexShrink:0}}>
                  <div style={{fontSize:'13px',fontWeight:700,color:'#a5b4fc',marginBottom:4}}>🚀 En desarrollo</div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>Muy pronto</div>
                </div>
              </div>
              {/* Tabs */}
              <div style={{position:'relative',zIndex:1,display:'flex',gap:'6px',marginTop:'24px'}}>
                {[
                  {id:'ofertas',    label:'Ofertas'},
                  {id:'certs',      label:'Certificaciones'},
                  {id:'bootcamps',  label:'Bootcamps'},
                  {id:'retos',      label:'Retos gratuitos'},
                ].map(tab=>(
                  <button key={tab.id} className="empleo-tab" onClick={()=>setEmpleoTab(tab.id)}
                    style={{padding:'8px 18px',borderRadius:'9px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:600,background:empleoTab===tab.id?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.06)',color:empleoTab===tab.id?'#c7d2fe':'rgba(255,255,255,0.45)',borderBottom:empleoTab===tab.id?'2px solid #818cf8':'2px solid transparent'}}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido tabs — todos muestran "próximamente" */}
            {empleoTab === 'ofertas' && (
              <ComingSoon
                title="Ofertas de empleo SOC"
                desc="Pronto podrás ver y aplicar a ofertas reales de empresas que buscan analistas SOC verificados por SoCBlast. Tu arena y skills hablarán por ti."
                icon="users"
                color="#4f46e5"
              />
            )}
            {empleoTab === 'certs' && (
              <ComingSoon
                title="Certificaciones recomendadas"
                desc="Recibirás recomendaciones personalizadas de certificaciones SOC (CompTIA, CEH, GCIH, SC-200...) según tu nivel actual de skills y arena."
                icon="award"
                color="#7c3aed"
              />
            )}
            {empleoTab === 'bootcamps' && (
              <ComingSoon
                title="Bootcamps y cursos SOC"
                desc="Una selección curada de los mejores bootcamps y cursos de ciberseguridad defensiva, ordenados por relevancia para tu perfil actual."
                icon="book"
                color="#0891b2"
              />
            )}
            {empleoTab === 'retos' && (
              <ComingSoon
                title="Retos y plataformas externas"
                desc="Links directos a TryHackMe, Blue Team Labs, CyberDefenders y más. Todo integrado con tu perfil SoCBlast para llevar el seguimiento."
                icon="shield"
                color="#059669"
              />
            )}

          </div>
          {/* ── FIN EMPLEO ── */}

        </div>
      </div>
    </>
  );
}