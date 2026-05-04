import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CARD  = '#ffffff';
const BD    = '#e2e8f0';
const T1    = '#0f172a';
const T2    = '#374151';
const T3    = '#64748b';
const T4    = '#94a3b8';
const ACC   = '#4f46e5';
const BG    = '#f0f4ff';

const Icon = ({ d, size=16, color='currentColor', viewBox='0 0 24 24', stroke=true }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={stroke?'none':'currentColor'} stroke={stroke?color:'none'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path,i) => <path key={i} d={path}/>) : <path d={d}/>}
  </svg>
);

const IconShield   = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconBolt     = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconTarget   = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconTrend    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconUsers    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconBook     = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconAward    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IconNetwork  = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v4M8.5 17.5l3.5-6.5M15.5 17.5 12 11"/></svg>;
const IconCpu      = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
const IconSearch   = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconCheck    = ({size=14,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconArrow    = ({size=14,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconMicro    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>;
const IconChart    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconGlobe    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

const Planet = ({ type, size = 120 }) => {
  const planets = {
    bronce: (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="b1" cx="35%" cy="35%"><stop offset="0%" stopColor="#E8A050"/><stop offset="40%" stopColor="#CD7F32"/><stop offset="100%" stopColor="#5C3010"/></radialGradient><radialGradient id="b2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.5)"/></radialGradient></defs><circle cx="60" cy="60" r="52" fill="url(#b1)"/><ellipse cx="45" cy="40" rx="18" ry="8" fill="rgba(180,100,30,0.4)" transform="rotate(-20,45,40)"/><ellipse cx="70" cy="65" rx="22" ry="6" fill="rgba(100,50,10,0.35)" transform="rotate(10,70,65)"/><circle cx="60" cy="60" r="52" fill="url(#b2)"/></svg>),
    plata:  (<svg width={size} height={size} viewBox="0 0 140 120"><defs><radialGradient id="p1" cx="35%" cy="35%"><stop offset="0%" stopColor="#E2E8F0"/><stop offset="50%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#2D3748"/></radialGradient><radialGradient id="p2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.45)"/></radialGradient><linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="50%" stopColor="rgba(148,163,184,0.6)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient></defs><ellipse cx="70" cy="72" rx="68" ry="8" fill="url(#ring1)" opacity="0.5"/><circle cx="70" cy="60" r="48" fill="url(#p1)"/><circle cx="70" cy="60" r="48" fill="url(#p2)"/></svg>),
    oro:    (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="o1" cx="35%" cy="35%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="40%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#78350F"/></radialGradient><radialGradient id="o2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.4)"/></radialGradient></defs><circle cx="60" cy="60" r="54" fill="url(#o1)"/><ellipse cx="60" cy="45" rx="48" ry="7" fill="rgba(245,210,50,0.25)" transform="rotate(-5,60,45)"/><circle cx="60" cy="60" r="54" fill="url(#o2)"/></svg>),
    elite:  (<svg width={size} height={size} viewBox="0 0 120 120"><defs><radialGradient id="e1" cx="35%" cy="35%"><stop offset="0%" stopColor="#DDD6FE"/><stop offset="40%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#1E0A3C"/></radialGradient><radialGradient id="e2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.5)"/></radialGradient><radialGradient id="aura" cx="50%" cy="50%"><stop offset="60%" stopColor="rgba(167,139,250,0)"/><stop offset="100%" stopColor="rgba(124,58,237,0.25)"/></radialGradient></defs><circle cx="60" cy="60" r="58" fill="url(#aura)"/><circle cx="60" cy="60" r="50" fill="url(#e1)"/><circle cx="60" cy="60" r="50" fill="url(#e2)"/></svg>),
  };
  return planets[type] || null;
};

const ParticlesBg = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const pts = Array.from({length:80},()=>({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-.5)*.7, vy:(Math.random()-.5)*.7,
      r:Math.random()*2.5+1, o:Math.random()*.30+.12
    }));
    let raf;
    const draw=()=>{
      ctx.clearRect(0,0,w,h);
      pts.forEach(n=>{
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0||n.x>w)n.vx*=-1;
        if(n.y<0||n.y>h)n.vy*=-1;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(99,102,241,${n.o})`; ctx.fill();
      });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<130){
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(99,102,241,${(1-d/130)*.18})`;
          ctx.lineWidth=.5; ctx.stroke();
        }
      }));
      raf=requestAnimationFrame(draw);
    };
    draw();
    const resize=()=>{w=c.width=window.innerWidth;h=c.height=window.innerHeight;};
    window.addEventListener('resize',resize);
    return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  },[]);
  return <canvas ref={ref} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>;
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('es');
  const es = lang==='es';

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
    .fade-up{animation:fadeUp .7s ease forwards;}
    .planet-float{animation:float 6s ease-in-out infinite;}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 40px rgba(79,70,229,0.4)!important;}
    .btn-sec:hover{background:rgba(79,70,229,0.04)!important;border-color:#c7d2fe!important;}
    .card-hover:hover{transform:translateY(-5px);box-shadow:0 20px 48px rgba(0,0,0,0.1)!important;}
    .nav-link:hover{color:${ACC}!important;}
    .arena-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(0,0,0,0.1)!important;}
    .tier-row:hover{background:#f0f4ff!important;}
    .feature-card:hover{border-color:${ACC}30!important;transform:translateY(-3px);box-shadow:0 12px 32px rgba(79,70,229,0.08)!important;}
    *{box-sizing:border-box;transition:transform .25s ease,box-shadow .25s ease,border-color .2s ease,color .2s ease,background .2s ease;}
  `;

  const arenas = [
    {name:'Bronce',   planet:'bronce', color:'#CD7F32', colorLight:'#fef3c7', cups:'0 — 899',    diff:es?'Básico':'Basic',       time:'20 min', desc:es?'Alertas simples. Amenazas identificables. Ideal para comenzar.':'Simple alerts. Identifiable threats. Ideal to start.',pct:25},
    {name:'Plata',    planet:'plata',  color:'#64748b', colorLight:'#f1f5f9', cups:'900 — 1.799', diff:es?'Intermedio':'Intermediate',time:'15 min',desc:es?'Correlación de eventos. Señuelos y falsas alertas.':'Event correlation. Decoys and false alerts.',pct:50},
    {name:'Oro',      planet:'oro',    color:'#F59E0B', colorLight:'#fffbeb', cups:'1.800 — 2.699',diff:es?'Avanzado':'Advanced',   time:'10 min', desc:es?'Múltiples vectores. Logs SIEM/EDR en profundidad.':'Multiple vectors. In-depth SIEM/EDR logs.',pct:75},
    {name:'Diamante', planet:'elite',  color:'#3b82f6', colorLight:'#eff6ff', cups:'2.700+',       diff:'Elite',                    time:'7 min',  desc:es?'APT multi-fase. Terminal de comandos. Máxima presión.':'Multi-phase APT. Command terminal. Maximum pressure.',pct:100},
  ];

  const tiers=[
    {tier:1,name:'SOC Rookie',    xp:'0 — 500',         color:'#64748B'},
    {tier:2,name:'SOC Analyst',   xp:'500 — 1.500',     color:'#3B82F6'},
    {tier:3,name:'SOC Specialist',xp:'1.500 — 3.000',   color:'#06B6D4'},
    {tier:4,name:'SOC Expert',    xp:'3.000 — 5.000',   color:'#10B981'},
    {tier:5,name:'SOC Sentinel',  xp:'5.000 — 8.000',   color:'#F59E0B'},
    {tier:6,name:'SOC Architect', xp:'8.000 — 12.000',  color:'#F97316'},
    {tier:7,name:'SOC Master',    xp:'12.000 — 18.000', color:'#EF4444'},
    {tier:8,name:'SOC Legend',    xp:'18.000+',          color:'#A78BFA'},
  ];

  const CheckItem = ({ label }) => (
    <div style={{display:'flex',alignItems:'center',gap:'9px',marginBottom:'9px'}}>
      <div style={{width:'18px',height:'18px',borderRadius:'50%',backgroundColor:`${ACC}10`,border:`1px solid ${ACC}28`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <IconCheck size={10} color={ACC}/>
      </div>
      <span style={{fontSize:'13px',color:T2}}>{label}</span>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{backgroundColor:BG,fontFamily:"'Inter',-apple-system,sans-serif",overflowX:'hidden',color:T1,position:'relative'}}>
        <ParticlesBg/>

        {/* NAVBAR */}
        <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 60px',backgroundColor:'rgba(240,244,255,0.94)',backdropFilter:'blur(24px)',borderBottom:`1px solid ${BD}`}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:'34px'}}/>
            <span style={{fontSize:'18px',fontWeight:800,letterSpacing:'-0.5px',color:T1}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',gap:'28px',alignItems:'center'}}>
            {[
              {label:es?'Plataforma':'Platform', action:()=>navigate('/dashboard')},
              {label:'Training',                  action:()=>navigate('/training')},
              {label:'Ranking',                   action:()=>navigate('/ranking')},
              {label:es?'Empresas':'Enterprise',  action:()=>navigate('/company')},
            ].map((item,i)=>(
              <span key={i} className="nav-link" onClick={item.action} style={{fontSize:'14px',color:T3,cursor:'pointer',fontWeight:500}}>{item.label}</span>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <button onClick={()=>setLang(es?'en':'es')} style={{background:'none',border:`1px solid ${BD}`,color:T3,padding:'5px 11px',borderRadius:'7px',fontSize:'12px',cursor:'pointer',fontWeight:600}}>{es?'EN':'ES'}</button>
            <button onClick={()=>navigate('/login')} style={{background:'none',border:`1px solid ${BD}`,color:T2,padding:'7px 18px',borderRadius:'100px',fontSize:'13px',cursor:'pointer',fontWeight:500}}>{es?'Iniciar sesión':'Sign in'}</button>
            <button className="btn-primary" onClick={()=>navigate('/register')} style={{background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',padding:'8px 20px',borderRadius:'100px',fontSize:'13px',cursor:'pointer',fontWeight:600,boxShadow:`0 4px 20px rgba(79,70,229,0.3)`}}>{es?'Empezar gratis':'Get Started'}</button>
          </div>
        </nav>

        {/* HERO */}
        <div style={{position:'relative',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'64px 24px 0',overflow:'hidden',zIndex:1}}>
          <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 80% 70% at 50% 40%,rgba(79,70,229,0.08) 0%,transparent 70%)',pointerEvents:'none'}}/>
          <div className="fade-up" style={{position:'relative',zIndex:2,maxWidth:'820px'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'10px',marginBottom:'28px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <img src="/logozorion.png" alt="Zorion" style={{height:'14px',opacity:.45}}/>
                <span style={{fontSize:'11px',color:T4,fontWeight:600,letterSpacing:'1.5px'}}>POWERED BY ZORION</span>
              </div>
              <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'5px 14px',borderRadius:'100px',border:`1.5px solid ${ACC}25`,backgroundColor:`${ACC}06`}}>
                <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:ACC,animation:'pulse 2s infinite'}}/>
                <span style={{fontSize:'11px',color:ACC,fontWeight:700,letterSpacing:'2px'}}>SOC PLATFORM — ONLINE</span>
              </div>
            </div>
            <h1 style={{fontSize:'clamp(44px,7.5vw,86px)',fontWeight:900,lineHeight:1.0,letterSpacing:'-3.5px',marginBottom:'22px',color:T1}}>
              {es?'Entrena como un':'Train like a real'}<br/>
              <span style={{background:`linear-gradient(135deg,${ACC} 0%,#818cf8 50%,#c084fc 100%)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                {es?'Analista SOC Real.':'SOC Analyst.'}
              </span>
            </h1>
            <p style={{fontSize:'18px',color:T3,maxWidth:'560px',margin:'0 auto 44px',lineHeight:1.7}}>
              {es?'Laboratorios de ciberseguridad reales. Investiga alertas, analiza logs y demuestra tu nivel con un certificado verificable.':'Real cybersecurity labs. Investigate alerts, analyze logs and prove your level with a verifiable certificate.'}
            </p>
            <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap',marginBottom:'72px'}}>
              <button className="btn-primary" onClick={()=>navigate('/register')} style={{padding:'14px 30px',borderRadius:'100px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'15px',fontWeight:600,cursor:'pointer',boxShadow:`0 4px 28px rgba(79,70,229,0.3)`,display:'flex',alignItems:'center',gap:'8px'}}>
                {es?'Iniciar Training':'Start Training'} <IconArrow size={14} color="#fff"/>
              </button>
              <button className="btn-sec" onClick={()=>navigate('/dashboard')} style={{padding:'14px 30px',borderRadius:'100px',background:CARD,border:`1.5px solid ${BD}`,color:T2,fontSize:'15px',cursor:'pointer',fontWeight:500}}>
                {es?'Ver plataforma':'View Platform'}
              </button>
            </div>
            <div style={{display:'flex',gap:'56px',justifyContent:'center'}}>
              {[{v:'2.400+',l:es?'Analistas activos':'Active analysts'},{v:'98%',l:es?'Satisfacción':'Satisfaction'},{v:'Fortune 500',l:es?'Empresas confían':'Companies trust'}].map((s,i)=>(
                <div key={i}>
                  <div style={{fontSize:'24px',fontWeight:800,color:T1,letterSpacing:'-0.8px'}}>{s.v}</div>
                  <div style={{fontSize:'12px',color:T4,marginTop:'3px'}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'160px',background:`linear-gradient(to bottom,transparent,${BG})`,zIndex:2,pointerEvents:'none'}}/>
        </div>

        {/* ── LABS — 3 MODOS ── */}
        <div style={{position:'relative',zIndex:1,borderTop:`1px solid ${BD}`,backgroundColor:'rgba(240,244,255,0.82)',backdropFilter:'blur(12px)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',minHeight:'500px'}}>
            <div style={{padding:'100px 60px 100px 80px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <p style={{fontSize:'11px',color:ACC,letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>LABS</p>
              <h2 style={{fontSize:'clamp(26px,3vw,40px)',fontWeight:800,letterSpacing:'-1.2px',color:T1,lineHeight:1.1,marginBottom:'18px'}}>
                {es?'Tres modos. Un solo lab.\nResultados reales.':'Three modes. One lab.\nReal results.'}
              </h2>
              <p style={{fontSize:'15px',color:T3,lineHeight:1.8,marginBottom:'28px',maxWidth:'440px'}}>
                {es?'Tres modos en un solo producto: Investigación libre, Certificación con timer y Arena competitivo. Windows o Linux aleatorio. La IA genera un escenario único cada vez.':'Three modes in one product: free Investigation, timed Certification and competitive Arena. Random Windows or Linux. AI generates a unique scenario every time.'}
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                {(es?[
                  'Modo Investigación — sin timer, solo XP',
                  'Modo Certificación — timer 45min, copas x0.5',
                  'Modo Arena — timer 20min, copas completas',
                  'Windows o Linux aleatorio en cada lab',
                ]:[
                  'Investigation mode — no timer, XP only',
                  'Certification mode — 45min timer, x0.5 pts',
                  'Arena mode — 20min timer, full points',
                  'Random Windows or Linux on every lab',
                ]).map((item,i)=>(
                  <CheckItem key={i} label={item}/>
                ))}
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',padding:'60px 0px 60px 40px'}}>
              <div style={{borderRadius:'16px 0 0 16px',overflow:'hidden',border:`1px solid ${BD}`,borderRight:'none',boxShadow:'-8px 0 40px rgba(79,70,229,0.08)',width:'100%'}}>
                <div style={{backgroundColor:'#f8fafc',padding:'11px 16px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',gap:'6px'}}>
                  {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{width:'9px',height:'9px',borderRadius:'50%',backgroundColor:c}}/>)}
                  <span style={{color:T4,fontSize:'11px',fontFamily:'monospace',marginLeft:'10px'}}>socblast — lab · investigación</span>
                </div>
                <div style={{backgroundColor:'#0f172a',padding:'20px',fontFamily:"'Fira Code',monospace",fontSize:'12px',lineHeight:2}}>
                  {/* Modo selector */}
                  <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
                    {[
                      {l:'🔬 Investigación',a:'#6ee7b7',bg:'rgba(110,231,183,0.15)'},
                      {l:'🏅 Certificación',a:'#fcd34d',bg:'rgba(252,211,77,0.08)'},
                      {l:'⚡ Arena',         a:'#a5b4fc',bg:'rgba(165,180,252,0.08)'},
                    ].map((m,i)=>(
                      <div key={i} style={{padding:'4px 10px',borderRadius:'6px',background:i===0?m.bg:'transparent',border:`1px solid ${i===0?m.a+'40':'rgba(255,255,255,0.06)'}`,fontSize:'10px',color:i===0?m.a:'rgba(255,255,255,0.25)',fontFamily:'system-ui',cursor:'pointer'}}>{m.l}</div>
                    ))}
                  </div>
                  <p style={{color:'#f87171'}}>⚠  CRITICAL   Brute force on Active Directory</p>
                  <p style={{color:'#fb923c'}}>   →  src_ip: 185.220.101.45   rate: 94/min</p>
                  <p style={{color:'#818cf8'}}>   →  target: CORP-DC01   port: 445/SMB</p>
                  <p style={{color:'#34d399'}}>   →  account: administrator   LOCKED</p>
                  <p style={{color:'#475569'}}>   $  correlating SIEM events...</p>
                  <p style={{color:'#fb923c'}}>   →  lateral movement   host: WKS-012</p>
                  <p style={{color:'#a5b4fc'}}>   →  T1078 Valid Accounts detected</p>
                  <p style={{color:'#475569'}}>   $  awaiting analyst response...</p>
                  <p style={{color:ACC}}>   ▌</p>
                </div>
                {/* OS badge */}
                <div style={{backgroundColor:'#1e293b',padding:'8px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                  <div style={{display:'flex',gap:'12px'}}>
                    <span style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontFamily:'monospace'}}>SO asignado:</span>
                    <span style={{fontSize:'11px',color:'#89b4fa',fontFamily:'monospace',fontWeight:700}}>🪟 Windows Server 2019</span>
                  </div>
                  <span style={{fontSize:'10px',color:'rgba(255,255,255,0.2)',fontFamily:'monospace'}}>aleatorio cada partida</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── LABS FORENSE (antes LABS section) ── */}
        <div style={{position:'relative',zIndex:1,borderTop:`1px solid ${BD}`,backgroundColor:'rgba(248,250,252,0.88)',backdropFilter:'blur(12px)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',minHeight:'500px'}}>
            <div style={{display:'flex',alignItems:'center',padding:'60px 40px 60px 0px'}}>
              <div style={{borderRadius:'0 16px 16px 0',overflow:'hidden',border:`1px solid ${BD}`,borderLeft:'none',boxShadow:'8px 0 40px rgba(16,185,129,0.08)',width:'100%'}}>
                <div style={{backgroundColor:'#f8fafc',padding:'11px 16px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',gap:'5px'}}>
                    {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{width:'9px',height:'9px',borderRadius:'50%',backgroundColor:c}}/>)}
                  </div>
                  <span style={{fontSize:'11px',color:'#10b981',letterSpacing:'1.5px',fontWeight:700}}>SIEM — Operación NightHawk</span>
                  <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                    <IconMicro size={12} color={T4}/>
                    <span style={{fontSize:'11px',color:T4}}>FORENSE</span>
                  </div>
                </div>
                <div style={{backgroundColor:'#0f172a',padding:'28px',fontFamily:"'Fira Code',monospace",fontSize:'12px',lineHeight:1.9}}>
                  <p style={{color:'#475569',marginBottom:'4px'}}>siem&gt; index=windows EventID=4688</p>
                  <div style={{backgroundColor:'rgba(255,255,255,0.03)',borderRadius:'8px',padding:'14px',marginBottom:'12px',border:'1px solid rgba(255,255,255,0.05)'}}>
                    <p style={{color:'#94a3b8',marginBottom:'4px'}}>02:32:01 host=SRV-DC01 process=<span style={{color:'#fb923c'}}>powershell.exe</span></p>
                    <p style={{color:'#f87171',fontWeight:700}}>02:32:15 host=SRV-DC01 process=<span style={{color:'#f87171'}}>mimikatz.exe</span> ⚠</p>
                  </div>
                  <p style={{color:'#475569',marginBottom:'4px'}}>siem&gt; index=dns</p>
                  <div style={{backgroundColor:'rgba(255,255,255,0.03)',borderRadius:'8px',padding:'14px',border:'1px solid rgba(255,255,255,0.05)'}}>
                    <p style={{color:'#f87171'}}>c2.nighthawk-ops.ru → 185.220.101.45 ⚠</p>
                    <p style={{color:'#f87171',marginTop:'4px'}}>exfil.nighthawk-ops.ru → 185.220.101.45 ⚠</p>
                  </div>
                  <div style={{marginTop:'14px',padding:'10px 12px',borderRadius:'8px',backgroundColor:'rgba(16,185,129,0.07)',border:'1px solid rgba(16,185,129,0.15)'}}>
                    <p style={{color:'#34d399',fontSize:'11px'}}>IOC detectado: mimikatz + C2 activo</p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{padding:'100px 80px 100px 60px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <p style={{fontSize:'11px',color:'#10b981',letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>5 TIPOS DE LAB</p>
              <h2 style={{fontSize:'clamp(26px,3vw,40px)',fontWeight:800,letterSpacing:'-1.2px',color:T1,lineHeight:1.1,marginBottom:'18px'}}>
                {es?'Forense, Threat Hunt,\nIR, Malware, OSINT.':'Forensics, Threat Hunt,\nIR, Malware, OSINT.'}
              </h2>
              <p style={{fontSize:'15px',color:T3,lineHeight:1.8,marginBottom:'22px',maxWidth:'440px'}}>
                {es?'Cada tipo genera escenarios completamente distintos. Con artefactos específicos, herramientas distintas y preguntas adaptadas. Sin repetición.':'Each type generates completely different scenarios. With specific artifacts, distinct tools and adapted questions. No repetition.'}
              </p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'26px'}}>
                {[
                  {color:'#0891b2', l:'🔬 Forense Post-Mortem'},
                  {color:'#7c3aed', l:'🎯 Threat Hunting'},
                  {color:'#ef4444', l:'🚨 Incident Response'},
                  {color:'#dc2626', l:'🦠 Malware Analysis'},
                  {color:'#059669', l:'🌐 OSINT & Threat Intel'},
                  {color:'#64748b', l:es?'🎲 Aleatorio':'🎲 Random'},
                ].map((f,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'9px',padding:'10px 14px',borderRadius:'10px',backgroundColor:CARD,border:`1px solid ${f.color}20`,borderLeft:`3px solid ${f.color}`}}>
                    <span style={{fontSize:'13px',color:T2,fontWeight:500}}>{f.l}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={()=>navigate('/register')} style={{padding:'12px 28px',borderRadius:'100px',background:'linear-gradient(135deg,#059669,#10b981)',border:'none',color:'#fff',fontWeight:600,fontSize:'14px',cursor:'pointer',boxShadow:'0 4px 16px rgba(16,185,129,0.28)',alignSelf:'flex-start',display:'flex',alignItems:'center',gap:'7px'}}>
                {es?'Acceder al laboratorio':'Access the lab'} <IconArrow size={13} color="#fff"/>
              </button>
            </div>
          </div>
        </div>

        {/* ── TRAINING ── */}
        <div style={{position:'relative',zIndex:1,borderTop:`1px solid ${BD}`,backgroundColor:'rgba(240,244,255,0.82)',backdropFilter:'blur(12px)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',minHeight:'500px'}}>
            <div style={{padding:'100px 60px 100px 80px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <p style={{fontSize:'11px',color:'#818cf8',letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>TRAINING</p>
              <h2 style={{fontSize:'clamp(26px,3vw,40px)',fontWeight:800,letterSpacing:'-1.2px',color:T1,lineHeight:1.1,marginBottom:'18px'}}>
                {es?'Un curso SOC completo\ny estructurado.':'A complete, structured\nSOC course.'}
              </h2>
              <p style={{fontSize:'15px',color:T3,lineHeight:1.8,marginBottom:'32px',maxWidth:'440px'}}>
                {es?'9 módulos progresivos divididos en 3 cursos. Con teoría visual, casos prácticos y XP real que sube tu tier.':'9 progressive modules in 3 courses. Visual theory, practical cases and real XP that raises your tier.'}
              </p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
                {[
                  {v:'3',    l:es?'Cursos':'Courses',  icon:<IconBook size={16} color={ACC}/>},
                  {v:'9',    l:es?'Módulos':'Modules', icon:<IconTarget size={16} color={ACC}/>},
                  {v:'2.650',l:'XP Total',              icon:<IconBolt size={16} color={ACC}/>},
                ].map((s,i)=>(
                  <div key={i} style={{padding:'18px 16px',borderRadius:'14px',backgroundColor:CARD,border:`1px solid ${BD}`,textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                    <div style={{display:'flex',justifyContent:'center',marginBottom:'8px'}}>{s.icon}</div>
                    <div style={{fontSize:'24px',fontWeight:800,color:T1,letterSpacing:'-1px'}}>{s.v}</div>
                    <div style={{fontSize:'11px',color:T4,marginTop:'4px'}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',padding:'60px 0px 60px 40px'}}>
              <div style={{borderRadius:'16px 0 0 16px',overflow:'hidden',border:`1px solid ${BD}`,borderRight:'none',boxShadow:'-8px 0 40px rgba(129,140,248,0.08)',width:'100%'}}>
                <div style={{backgroundColor:'#f8fafc',padding:'13px 18px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:'11px',color:'#818cf8',letterSpacing:'2px',fontWeight:700}}>MÓDULO 3 — Detección de Amenazas</span>
                  <span style={{fontSize:'11px',color:T4}}>50%</span>
                </div>
                <div style={{backgroundColor:CARD,padding:'24px'}}>
                  {[
                    {title:es?'Indicadores de compromiso IOC':'Indicators of Compromise',done:true,xp:50},
                    {title:'MITRE ATT&CK Framework',done:true,xp:70},
                    {title:es?'Detección de movimiento lateral':'Lateral movement detection',done:false,xp:70,active:true},
                    {title:es?'Gestión de falsas alertas':'False alerts management',done:false,xp:60},
                  ].map((l,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderRadius:'10px',backgroundColor:l.active?`${ACC}05`:'#f8fafc',border:l.active?`1px solid ${ACC}18`:`1px solid ${BD}`,marginBottom:'8px'}}>
                      <div style={{width:'22px',height:'22px',borderRadius:'50%',backgroundColor:l.done?'rgba(34,197,94,0.1)':l.active?`${ACC}10`:'#f1f5f9',border:`1px solid ${l.done?'rgba(34,197,94,0.35)':l.active?ACC+'35':BD}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {l.done ? <IconCheck size={10} color="#22c55e"/> : l.active ? <IconArrow size={10} color={ACC}/> : <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:BD}}/>}
                      </div>
                      <span style={{fontSize:'13px',color:l.done?T4:l.active?T1:T3,flex:1,fontWeight:l.active?600:400}}>{l.title}</span>
                      <span style={{fontSize:'11px',color:l.done?'#22c55e':T4,fontWeight:600,fontFamily:'monospace'}}>+{l.xp} XP</span>
                    </div>
                  ))}
                  <div style={{marginTop:'16px',padding:'12px 14px',borderRadius:'10px',backgroundColor:'#f8fafc',border:`1px solid ${BD}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                      <span style={{fontSize:'11px',color:T4}}>{es?'Progreso':'Progress'}</span>
                      <span style={{fontSize:'11px',color:ACC,fontWeight:600}}>50%</span>
                    </div>
                    <div style={{height:'4px',borderRadius:'2px',backgroundColor:'#e2e8f0'}}>
                      <div style={{width:'50%',height:'100%',borderRadius:'2px',background:`linear-gradient(90deg,${ACC},#818cf8)`}}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TIERS ── */}
        <div style={{position:'relative',zIndex:1,borderTop:`1px solid ${BD}`,backgroundColor:'rgba(248,250,252,0.88)',backdropFilter:'blur(12px)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',minHeight:'500px'}}>
            <div style={{display:'flex',alignItems:'center',padding:'60px 40px 60px 0px'}}>
              <div style={{borderRadius:'0 16px 16px 0',overflow:'hidden',border:`1px solid ${BD}`,borderLeft:'none',boxShadow:'8px 0 40px rgba(16,185,129,0.06)',width:'100%',backgroundColor:CARD}}>
                <div style={{padding:'14px 18px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                    <IconAward size={13} color="#10B981"/>
                    <span style={{fontSize:'11px',color:'#10B981',letterSpacing:'2px',fontWeight:700}}>TIER SYSTEM</span>
                  </div>
                  <span style={{fontSize:'11px',color:T4}}>8 {es?'niveles':'levels'}</span>
                </div>
                <div style={{padding:'10px 12px'}}>
                  {tiers.map((t,i)=>(
                    <div key={i} className="tier-row" style={{display:'flex',alignItems:'center',gap:'12px',padding:'11px 14px',borderRadius:'9px',marginBottom:'2px',cursor:'default'}}>
                      <div style={{width:'30px',height:'30px',borderRadius:'9px',backgroundColor:`${t.color}10`,border:`1px solid ${t.color}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <span style={{fontSize:'12px',fontWeight:800,color:t.color}}>{t.tier}</span>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'13px',fontWeight:600,color:T1}}>{t.name}</div>
                      </div>
                      <div style={{fontSize:'11px',color:T4,fontFamily:'monospace'}}>{t.xp} XP</div>
                      <div style={{width:'7px',height:'7px',borderRadius:'50%',backgroundColor:t.color,flexShrink:0}}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{padding:'100px 80px 100px 60px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <p style={{fontSize:'11px',color:'#10B981',letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>XP & TIERS</p>
              <h2 style={{fontSize:'clamp(26px,3vw,40px)',fontWeight:800,letterSpacing:'-1.2px',color:T1,lineHeight:1.1,marginBottom:'18px'}}>
                {es?'Tu progreso.\nTu identidad.':'Your progress.\nYour identity.'}
              </h2>
              <p style={{fontSize:'15px',color:T3,lineHeight:1.8,marginBottom:'32px',maxWidth:'440px'}}>
                {es?'Cada lab y lección te da XP. El XP sube tu Tier. Desde SOC Rookie hasta SOC Legend.':'Every lab and lesson gives you XP. XP raises your Tier. From SOC Rookie to SOC Legend.'}
              </p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                {[
                  {label:es?'Lab completado':'Lab completed',     xp:'+50–220 XP',  color:ACC,     icon:<IconTarget size={14} color={ACC}/>},
                  {label:es?'Lección de training':'Training lesson',xp:'+30–70 XP',  color:'#818cf8',icon:<IconBook size={14} color="#818cf8"/>},
                  {label:es?'Modo Arena':'Arena mode',             xp:'Copas completas',color:'#10b981',icon:<IconShield size={14} color="#10b981"/>},
                  {label:es?'Arena Diamante':'Diamond arena',      xp:'+220 XP max', color:'#3b82f6',icon:<IconBolt size={14} color="#3b82f6"/>},
                ].map((item,i)=>(
                  <div key={i} style={{padding:'16px',borderRadius:'12px',backgroundColor:CARD,border:`1px solid ${BD}`,boxShadow:'0 2px 8px rgba(0,0,0,0.04)',display:'flex',flexDirection:'column',gap:'8px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                      {item.icon}
                      <span style={{fontSize:'12px',color:T3}}>{item.label}</span>
                    </div>
                    <div style={{fontSize:'16px',fontWeight:700,color:item.color,fontFamily:'monospace'}}>{item.xp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── FOR EVERYONE ── */}
        <div style={{position:'relative',zIndex:1,borderTop:`1px solid ${BD}`,backgroundColor:'rgba(240,244,255,0.82)',backdropFilter:'blur(12px)',padding:'100px 80px'}}>
          <div style={{maxWidth:'1140px',margin:'0 auto'}}>
            <div style={{marginBottom:'56px'}}>
              <p style={{fontSize:'11px',color:ACC,letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>FOR EVERYONE</p>
              <h2 style={{fontSize:'clamp(26px,3.5vw,46px)',fontWeight:800,letterSpacing:'-1.5px',color:T1,marginBottom:'14px',maxWidth:'600px'}}>
                {es?'¿Para quién es SocBlast?':'Who is SocBlast for?'}
              </h2>
              <p style={{fontSize:'16px',color:T3,maxWidth:'440px'}}>
                {es?'Para analistas que quieren crecer y para empresas que buscan el mejor talento.':'For analysts who want to grow and companies looking for top talent.'}
              </p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:'20px'}}>
              <div className="card-hover" style={{padding:'48px',borderRadius:'22px',background:`linear-gradient(145deg,${ACC}05 0%,transparent 100%)`,border:`1px solid ${ACC}14`,position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(79,70,229,0.05)'}}>
                <div style={{position:'absolute',top:'-30px',right:'-30px',width:'160px',height:'160px',borderRadius:'50%',background:`radial-gradient(circle,${ACC}06,transparent)`,pointerEvents:'none'}}/>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
                  <div style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:`${ACC}10`,border:`1px solid ${ACC}20`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <IconShield size={17} color={ACC}/>
                  </div>
                  <p style={{fontSize:'11px',color:ACC,letterSpacing:'2.5px',fontWeight:700}}>FOR ANALYSTS</p>
                </div>
                <h3 style={{fontSize:'28px',fontWeight:800,letterSpacing:'-1px',color:T1,marginBottom:'12px'}}>{es?'Analistas SOC':'SOC Analysts'}</h3>
                <p style={{color:T3,fontSize:'15px',lineHeight:1.8,marginBottom:'24px',maxWidth:'480px'}}>
                  {es?'Entrena con escenarios reales, sube desde Bronce hasta Diamante y obtén un certificado verificable que las empresas buscan.':'Train with real AI scenarios, climb from Bronze to Diamond and get a verifiable certificate companies look for.'}
                </p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 20px',marginBottom:'28px'}}>
                  {(es?[
                    'Labs con 3 modos: Investigación, Certificación y Arena',
                    'Windows o Linux aleatorio en cada lab',
                    'Certificado con QR verificable',
                    'Ranking global por copas',
                    'Training en 9 módulos · 3 cursos',
                    'XP y skills certificadas',
                  ]:[
                    'Labs with 3 modes: Investigation, Certification and Arena',
                    'Random Windows or Linux on every lab',
                    'QR-verifiable certificate',
                    'Global ranking by points',
                    '9-module training · 3 courses',
                    'XP and certified skills',
                  ]).map((item,j)=>(
                    <CheckItem key={j} label={item}/>
                  ))}
                </div>
                <button className="btn-primary" onClick={()=>navigate('/register')} style={{padding:'12px 28px',borderRadius:'100px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontWeight:600,fontSize:'14px',cursor:'pointer',boxShadow:`0 4px 20px rgba(79,70,229,0.22)`,display:'inline-flex',alignItems:'center',gap:'7px'}}>
                  {es?'Iniciar Training':'Start Training'} <IconArrow size={13} color="#fff"/>
                </button>
              </div>
              <div className="card-hover" style={{padding:'40px',borderRadius:'22px',background:'linear-gradient(145deg,rgba(124,58,237,0.04) 0%,transparent 100%)',border:'1px solid rgba(124,58,237,0.12)',display:'flex',flexDirection:'column',justifyContent:'space-between',boxShadow:'0 4px 20px rgba(124,58,237,0.04)'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'10px',backgroundColor:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.18)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <IconUsers size={17} color="#7C3AED"/>
                    </div>
                    <p style={{fontSize:'11px',color:'#7C3AED',letterSpacing:'2.5px',fontWeight:700}}>FOR COMPANIES</p>
                  </div>
                  <h3 style={{fontSize:'24px',fontWeight:800,letterSpacing:'-0.8px',color:T1,marginBottom:'12px'}}>{es?'Empresas':'Companies'}</h3>
                  <p style={{color:T3,fontSize:'14px',lineHeight:1.8,marginBottom:'24px'}}>
                    {es?'Accede al Talent Pool, crea simulaciones personalizadas y publica ofertas de trabajo.':'Access the Talent Pool, create custom simulations and post job offers.'}
                  </p>
                  <div style={{display:'flex',flexDirection:'column',gap:'2px',marginBottom:'28px'}}>
                    {(es?['Talent Pool con filtros avanzados','Simulaciones a medida','Publicación de ofertas','Comparativa de candidatos']:['Filtered Talent Pool','Custom simulations','Job posting','Candidate comparison']).map((item,j)=>(
                      <CheckItem key={j} label={item}/>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={()=>navigate('/company')} style={{padding:'11px 24px',borderRadius:'100px',background:'linear-gradient(135deg,#6D28D9,#7C3AED)',border:'none',color:'#fff',fontWeight:600,fontSize:'14px',cursor:'pointer',boxShadow:'0 4px 16px rgba(124,58,237,0.22)',display:'inline-flex',alignItems:'center',gap:'7px',alignSelf:'flex-start'}}>
                  {es?'Empezar':'Get started'} <IconArrow size={13} color="#fff"/>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── ARENAS ── */}
        <div style={{position:'relative',zIndex:1,borderTop:`1px solid ${BD}`,backgroundColor:'rgba(248,250,252,0.88)',backdropFilter:'blur(12px)',padding:'100px 80px'}}>
          <div style={{maxWidth:'1140px',margin:'0 auto'}}>
            <div style={{marginBottom:'56px'}}>
              <p style={{fontSize:'11px',color:'#F59E0B',letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>ARENA SYSTEM</p>
              <h2 style={{fontSize:'clamp(26px,3.5vw,46px)',fontWeight:800,letterSpacing:'-1.5px',color:T1,marginBottom:'14px'}}>
                {es?'¿En qué arena estás?':'Which arena are you in?'}
              </h2>
              <p style={{fontSize:'16px',color:T3,maxWidth:'440px'}}>
                {es?'Cuatro planetas. Doce divisiones. Un solo objetivo.':'Four planets. Twelve divisions. One goal.'}
              </p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'20px'}}>
              {arenas.map((a,i)=>(
                <div key={i} className="arena-card" style={{padding:'32px 22px',borderRadius:'20px',backgroundColor:CARD,border:`1px solid ${a.color}20`,textAlign:'center',cursor:'pointer',boxShadow:'0 4px 20px rgba(0,0,0,0.05)',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:`linear-gradient(90deg,transparent,${a.color}80,transparent)`}}/>
                  <div className="planet-float" style={{display:'flex',justifyContent:'center',marginBottom:'20px',animationDelay:`${i*.8}s`}}>
                    <Planet type={a.planet} size={96}/>
                  </div>
                  <div style={{fontSize:'18px',fontWeight:800,color:a.color,marginBottom:'4px',letterSpacing:'-0.3px'}}>{a.name}</div>
                  <div style={{fontSize:'10px',color:T4,fontFamily:'monospace',marginBottom:'10px',letterSpacing:'0.5px'}}>{a.cups} pts</div>
                  <p style={{fontSize:'12px',color:T3,lineHeight:1.65,marginBottom:'16px'}}>{a.desc}</p>
                  <div style={{padding:'10px 12px',borderRadius:'9px',backgroundColor:`${a.color}06`,border:`1px solid ${a.color}18`,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                    <span style={{fontSize:'11px',color:a.color,fontWeight:600}}>{a.diff}</span>
                    <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                      <IconBolt size={11} color={a.color}/>
                      <span style={{fontSize:'11px',color:T4}}>{a.time}</span>
                    </div>
                  </div>
                  <div style={{height:'3px',borderRadius:'2px',backgroundColor:'#e2e8f0'}}>
                    <div style={{width:`${a.pct}%`,height:'100%',borderRadius:'2px',backgroundColor:a.color}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA FINAL */}
        <div style={{position:'relative',zIndex:1,borderTop:`1px solid ${BD}`,backgroundColor:'rgba(240,244,255,0.82)',backdropFilter:'blur(12px)',padding:'100px 80px'}}>
          <div style={{maxWidth:'1140px',margin:'0 auto'}}>
            <div style={{borderRadius:'28px',padding:'72px',background:`linear-gradient(145deg,${ACC}07 0%,rgba(124,58,237,0.04) 100%)`,border:`1px solid ${ACC}14`,display:'grid',gridTemplateColumns:'1fr auto',gap:'60px',alignItems:'center',position:'relative',overflow:'hidden',boxShadow:`0 8px 40px rgba(79,70,229,0.07)`}}>
              <div style={{position:'absolute',top:'-100px',right:'200px',width:'400px',height:'400px',borderRadius:'50%',background:`radial-gradient(circle,${ACC}05,transparent)`,pointerEvents:'none'}}/>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
                  <img src="/logosoc.png" alt="SocBlast" style={{height:'36px'}}/>
                  <span style={{fontSize:'20px',fontWeight:800,letterSpacing:'-0.5px',color:T1}}>Soc<span style={{color:ACC}}>Blast</span></span>
                </div>
                <h2 style={{fontSize:'clamp(26px,3.5vw,50px)',fontWeight:800,letterSpacing:'-2px',color:T1,lineHeight:1.05,marginBottom:'16px'}}>
                  {es?'Listo para demostrar\ntu nivel.':'Ready to prove\nyour level.'}
                </h2>
                <p style={{fontSize:'16px',color:T3,lineHeight:1.6}}>
                  {es?'Únete gratis hoy. Sin tarjeta de crédito. Empieza en menos de 2 minutos.':'Join free today. No credit card. Get started in under 2 minutes.'}
                </p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'12px',flexShrink:0}}>
                <button className="btn-primary" onClick={()=>navigate('/register')} style={{padding:'16px 40px',borderRadius:'100px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'16px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 32px rgba(79,70,229,0.25)`,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'8px'}}>
                  {es?'Crear cuenta gratis':'Create free account'} <IconArrow size={14} color="#fff"/>
                </button>
                <button className="btn-sec" onClick={()=>navigate('/login')} style={{padding:'14px 32px',borderRadius:'100px',background:CARD,border:`1.5px solid ${BD}`,color:T2,fontSize:'15px',fontWeight:500,cursor:'pointer',textAlign:'center'}}>
                  {es?'Ya tengo cuenta':'I have an account'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{position:'relative',zIndex:1,backgroundColor:'rgba(248,250,252,0.97)',borderTop:`1px solid ${BD}`,padding:'36px 80px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'16px',backdropFilter:'blur(12px)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:'32px'}}/>
            <span style={{fontSize:'16px',fontWeight:800,letterSpacing:'-0.5px',color:T1}}>Soc<span style={{color:ACC}}>Blast</span></span>
            <div style={{width:'1px',height:'20px',backgroundColor:BD,marginLeft:'8px'}}/>
            <div style={{display:'flex',alignItems:'center',gap:'6px',marginLeft:'8px'}}>
              <img src="/logozorion.png" alt="Zorion" style={{height:'14px',opacity:.4}}/>
              <span style={{fontSize:'10px',color:T4,letterSpacing:'1.5px'}}>POWERED BY ZORION</span>
            </div>
          </div>
          <div style={{display:'flex',gap:'24px'}}>
            {[es?'Términos':'Terms',es?'Privacidad':'Privacy',es?'Contacto':'Contact'].map((l,i)=>(
              <span key={i} style={{color:T3,fontSize:'13px',cursor:'pointer'}}>{l}</span>
            ))}
          </div>
          <button onClick={()=>setLang(es?'en':'es')} style={{background:'none',border:`1px solid ${BD}`,color:T3,padding:'5px 13px',borderRadius:'6px',fontSize:'12px',cursor:'pointer'}}>
            {es?'EN':'ES'}
          </button>
        </div>
      </div>
    </>
  );
};

export default LandingPage;