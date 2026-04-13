import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CARD  = '#ffffff';
const BD    = '#e8eaf0';
const T1    = '#0f172a';
const T2    = '#374151';
const T3    = '#64748b';
const T4    = '#94a3b8';
const ACC   = '#4f46e5';
const BG    = '#f0f4ff';

const Planet = ({ type, size = 120 }) => {
  const planets = {
    bronce: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <radialGradient id="b1" cx="35%" cy="35%"><stop offset="0%" stopColor="#E8A050"/><stop offset="40%" stopColor="#CD7F32"/><stop offset="100%" stopColor="#5C3010"/></radialGradient>
          <radialGradient id="b2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.5)"/></radialGradient>
        </defs>
        <circle cx="60" cy="60" r="52" fill="url(#b1)"/>
        <ellipse cx="45" cy="40" rx="18" ry="8" fill="rgba(180,100,30,0.4)" transform="rotate(-20,45,40)"/>
        <ellipse cx="70" cy="65" rx="22" ry="6" fill="rgba(100,50,10,0.35)" transform="rotate(10,70,65)"/>
        <circle cx="60" cy="60" r="52" fill="url(#b2)"/>
      </svg>
    ),
    plata: (
      <svg width={size} height={size} viewBox="0 0 140 120">
        <defs>
          <radialGradient id="p1" cx="35%" cy="35%"><stop offset="0%" stopColor="#E2E8F0"/><stop offset="50%" stopColor="#94A3B8"/><stop offset="100%" stopColor="#2D3748"/></radialGradient>
          <radialGradient id="p2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.45)"/></radialGradient>
          <linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(148,163,184,0)"/><stop offset="50%" stopColor="rgba(148,163,184,0.6)"/><stop offset="100%" stopColor="rgba(148,163,184,0)"/></linearGradient>
        </defs>
        <ellipse cx="70" cy="72" rx="68" ry="8" fill="url(#ring1)" opacity="0.5"/>
        <circle cx="70" cy="60" r="48" fill="url(#p1)"/>
        <circle cx="70" cy="60" r="48" fill="url(#p2)"/>
      </svg>
    ),
    oro: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <radialGradient id="o1" cx="35%" cy="35%"><stop offset="0%" stopColor="#FDE68A"/><stop offset="40%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#78350F"/></radialGradient>
          <radialGradient id="o2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.4)"/></radialGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="url(#o1)"/>
        <ellipse cx="60" cy="45" rx="48" ry="7" fill="rgba(245,210,50,0.25)" transform="rotate(-5,60,45)"/>
        <circle cx="60" cy="60" r="54" fill="url(#o2)"/>
      </svg>
    ),
    elite: (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <radialGradient id="e1" cx="35%" cy="35%"><stop offset="0%" stopColor="#DDD6FE"/><stop offset="40%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#1E0A3C"/></radialGradient>
          <radialGradient id="e2" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(0,0,0,0)"/><stop offset="100%" stopColor="rgba(0,0,0,0.5)"/></radialGradient>
          <radialGradient id="aura" cx="50%" cy="50%"><stop offset="60%" stopColor="rgba(167,139,250,0)"/><stop offset="100%" stopColor="rgba(124,58,237,0.25)"/></radialGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#aura)"/>
        <circle cx="60" cy="60" r="50" fill="url(#e1)"/>
        <circle cx="60" cy="60" r="50" fill="url(#e2)"/>
      </svg>
    ),
  };
  return planets[type] || null;
};

const ParticlesBg = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const pts = Array.from({length:90},()=>({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-.5)*1.0, vy:(Math.random()-.5)*1.0,
      r:Math.random()*2.5+1, o:Math.random()*.25+.08
    }));
    let mouse={x:w/2,y:h/2};
    const onMouse=e=>{mouse.x=e.clientX;mouse.y=e.clientY;};
    window.addEventListener('mousemove',onMouse);
    let raf;
    const draw=()=>{
      ctx.clearRect(0,0,w,h);
      pts.forEach(n=>{
        const dx=mouse.x-n.x,dy=mouse.y-n.y,dist=Math.hypot(dx,dy);
        if(dist<200){n.vx+=dx/dist*.025;n.vy+=dy/dist*.025;}
        n.vx*=.98;n.vy*=.98;
        n.x+=n.vx;n.y+=n.vy;
        if(n.x<0||n.x>w)n.vx*=-1;
        if(n.y<0||n.y>h)n.vy*=-1;
        ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(99,102,241,${n.o})`;ctx.fill();
      });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<150){
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(99,102,241,${(1-d/150)*.12})`;
          ctx.lineWidth=.6;ctx.stroke();
        }
      }));
      raf=requestAnimationFrame(draw);
    };
    draw();
    const resize=()=>{w=c.width=window.innerWidth;h=c.height=window.innerHeight;};
    window.addEventListener('resize',resize);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('mousemove',onMouse);};
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
    .btn-sec:hover{background:rgba(79,70,229,0.06)!important;border-color:#c7d2fe!important;}
    .card-hover:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,0.12)!important;}
    .nav-link:hover{color:${ACC}!important;}
    .arena-card:hover{transform:translateY(-8px);box-shadow:0 20px 48px rgba(0,0,0,0.12)!important;}
    .tier-row:hover{background:#f0f4ff!important;}
    *{box-sizing:border-box;transition:transform .25s ease,box-shadow .25s ease,border-color .2s ease,color .2s ease;}
  `;

  const arenas = [
    {name:'Bronce',planet:'bronce',color:'#CD7F32',colorLight:'#fef3c7',cups:'0 — 999', diff:es?'Básico':'Basic',        time:'20 min',desc:es?'Alertas simples. Amenazas identificables. Ideal para comenzar.':'Simple alerts. Identifiable threats. Ideal to start.',pct:25},
    {name:'Plata', planet:'plata', color:'#64748b',colorLight:'#f1f5f9',cups:'1K — 2K', diff:es?'Intermedio':'Intermediate',time:'15 min',desc:es?'Correlación de eventos. Señuelos y falsas alertas.':'Event correlation. Decoys and false alerts.',pct:50},
    {name:'Oro',   planet:'oro',   color:'#F59E0B',colorLight:'#fffbeb',cups:'2K — 3K', diff:es?'Avanzado':'Advanced',    time:'10 min',desc:es?'Múltiples vectores. Logs SIEM/EDR en profundidad.':'Multiple vectors. In-depth SIEM/EDR logs.',pct:75},
    {name:'Elite', planet:'elite', color:'#7C3AED',colorLight:'#f5f3ff',cups:'3K+',     diff:'Elite',                      time:'7 min', desc:es?'APT multi-fase. Terminal de comandos. Máxima presión.':'Multi-phase APT. Command terminal. Maximum pressure.',pct:100},
  ];

  const tiers=[
    {tier:1,name:'SOC Rookie',    xp:'0 — 500',        color:'#64748B'},
    {tier:2,name:'SOC Analyst',   xp:'500 — 1.500',    color:'#3B82F6'},
    {tier:3,name:'SOC Specialist',xp:'1.500 — 3.000',  color:'#06B6D4'},
    {tier:4,name:'SOC Expert',    xp:'3.000 — 5.000',  color:'#10B981'},
    {tier:5,name:'SOC Sentinel',  xp:'5.000 — 8.000',  color:'#F59E0B'},
    {tier:6,name:'SOC Architect', xp:'8.000 — 12.000', color:'#F97316'},
    {tier:7,name:'SOC Master',    xp:'12.000 — 18.000',color:'#EF4444'},
    {tier:8,name:'SOC Legend',    xp:'18.000+',         color:'#A78BFA'},
  ];

  const Section = ({children, alt}) => (
    <div style={{backgroundColor:alt?'rgba(248,250,252,0.8)':'transparent', borderTop:`1px solid ${BD}`, borderBottom:`1px solid ${BD}`, padding:'110px 60px', backdropFilter:'blur(8px)'}}>
      <div style={{maxWidth:'1140px',margin:'0 auto'}}>{children}</div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{backgroundColor:BG,fontFamily:"'Inter',-apple-system,sans-serif",overflowX:'hidden',color:T1,position:'relative'}}>
        <ParticlesBg/>

        {/* NAVBAR */}
        <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 60px',backgroundColor:'rgba(240,244,255,0.92)',backdropFilter:'blur(24px)',borderBottom:`1px solid ${BD}`}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:'34px'}}/>
            <span style={{fontSize:'18px',fontWeight:800,letterSpacing:'-0.5px',color:T1}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',gap:'28px'}}>
            {[
              {label:es?'Plataforma':'Platform',action:()=>navigate('/dashboard')},
              {label:'Training',action:()=>navigate('/training')},
              {label:'Ranking',action:()=>navigate('/ranking')},
              {label:es?'Empresas':'Enterprise',action:()=>navigate('/company')},
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
                <img src="/logozorion.png" alt="Zorion" style={{height:'14px',opacity:.4}}/>
                <span style={{fontSize:'11px',color:T4,fontWeight:500,letterSpacing:'1.5px'}}>POWERED BY ZORION</span>
              </div>
              <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'5px 14px',borderRadius:'100px',border:`1px solid ${ACC}25`,backgroundColor:`${ACC}06`}}>
                <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:ACC,animation:'pulse 2s infinite'}}/>
                <span style={{fontSize:'11px',color:ACC,fontWeight:600,letterSpacing:'2px'}}>SOC PLATFORM — ONLINE</span>
              </div>
            </div>
            <h1 style={{fontSize:'clamp(44px,7.5vw,86px)',fontWeight:900,lineHeight:1.0,letterSpacing:'-3.5px',marginBottom:'22px',color:T1}}>
              {es?'Entrena como un':'Train like a real'}<br/>
              <span style={{background:`linear-gradient(135deg,${ACC} 0%,#818cf8 50%,#c084fc 100%)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                {es?'Analista SOC Real.':'SOC Analyst.'}
              </span>
            </h1>
            <p style={{fontSize:'18px',color:T3,maxWidth:'560px',margin:'0 auto 44px',lineHeight:1.7}}>
              {es?'Simulaciones de ciberseguridad del mundo real. Investiga alertas, analiza logs y demuestra tu nivel con un certificado verificable.':'Real-world cybersecurity simulations. Investigate alerts, analyze logs and prove your level with a verifiable certificate.'}
            </p>
            <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap',marginBottom:'72px'}}>
              <button className="btn-primary" onClick={()=>navigate('/register')} style={{padding:'14px 30px',borderRadius:'100px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'15px',fontWeight:600,cursor:'pointer',boxShadow:`0 4px 28px rgba(79,70,229,0.3)`}}>
                {es?'Iniciar Training →':'Start Training →'}
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

        {/* SESSIONS */}
        <div style={{position:'relative',zIndex:1,padding:'110px 60px',backdropFilter:'blur(8px)'}}>
          <div style={{maxWidth:'1140px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',alignItems:'center',gap:'80px'}}>
            <div>
              <p style={{fontSize:'11px',color:ACC,letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>SESSIONS</p>
              <h2 style={{fontSize:'clamp(26px,3.2vw,42px)',fontWeight:800,letterSpacing:'-1.2px',color:T1,lineHeight:1.1,marginBottom:'18px'}}>
                {es?'Sesiones SOC que\nse sienten reales.':'SOC sessions that\nfeel real.'}
              </h2>
              <p style={{fontSize:'15px',color:T3,lineHeight:1.8,marginBottom:'28px'}}>
                {es?'Cada sesión genera un escenario único. Alertas SIEM/EDR en tiempo real, logs reales y ataques progresivos. La IA evalúa cada decisión.':'Each session generates a unique scenario. Real-time SIEM/EDR alerts, real logs and progressive attacks. AI evaluates every decision.'}
              </p>
              {(es?['Escenarios únicos generados por IA','Alertas SIEM/EDR en tiempo real','Evaluación automática de cada decisión','Sistema de copas y arenas competitivo']:['Unique AI-generated scenarios','Real-time SIEM/EDR alerts','Automatic evaluation of every decision','Competitive cups and arena system']).map((item,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
                  <div style={{width:'18px',height:'18px',borderRadius:'50%',backgroundColor:`${ACC}12`,border:`1px solid ${ACC}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <div style={{width:'5px',height:'5px',borderRadius:'50%',backgroundColor:ACC}}/>
                  </div>
                  <span style={{fontSize:'14px',color:T2}}>{item}</span>
                </div>
              ))}
            </div>
            {/* Terminal clara */}
            <div style={{borderRadius:'16px',overflow:'hidden',border:`1px solid ${BD}`,boxShadow:'0 16px 48px rgba(79,70,229,0.1)'}}>
              <div style={{backgroundColor:'#f8fafc',padding:'11px 16px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',gap:'6px'}}>
                {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{width:'10px',height:'10px',borderRadius:'50%',backgroundColor:c}}/>)}
                <span style={{color:T4,fontSize:'11px',fontFamily:'monospace',marginLeft:'10px'}}>socblast — session active</span>
              </div>
              <div style={{backgroundColor:'#0f172a',padding:'28px',fontFamily:"'Fira Code',monospace",fontSize:'12px',lineHeight:2.2}}>
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
            </div>
          </div>
        </div>

        {/* LABS — sección nueva */}
        <div style={{position:'relative',zIndex:1,padding:'110px 60px',backgroundColor:'rgba(248,250,252,0.85)',borderTop:`1px solid ${BD}`,borderBottom:`1px solid ${BD}`,backdropFilter:'blur(8px)'}}>
          <div style={{maxWidth:'1140px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',alignItems:'center',gap:'80px'}}>
            {/* Mockup SIEM */}
            <div style={{borderRadius:'16px',overflow:'hidden',border:`1px solid ${BD}`,boxShadow:'0 16px 48px rgba(16,185,129,0.1)'}}>
              <div style={{backgroundColor:'#f8fafc',padding:'11px 16px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',gap:'5px'}}>
                  {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{width:'9px',height:'9px',borderRadius:'50%',backgroundColor:c}}/>)}
                </div>
                <span style={{fontSize:'11px',color:'#10b981',letterSpacing:'1.5px',fontWeight:700}}>SIEM — Operación NightHawk</span>
                <span style={{fontSize:'11px',color:T4}}>🔬 LAB</span>
              </div>
              <div style={{backgroundColor:'#0f172a',padding:'22px',fontFamily:"'Fira Code',monospace",fontSize:'12px',lineHeight:1.9}}>
                <p style={{color:'#475569',marginBottom:'4px'}}>siem&gt; index=windows EventID=4688</p>
                <div style={{backgroundColor:'rgba(255,255,255,0.03)',borderRadius:'8px',padding:'12px',marginBottom:'12px',border:'1px solid rgba(255,255,255,0.05)'}}>
                  <p style={{color:'#94a3b8',marginBottom:'4px'}}>02:32:01 host=SRV-DC01 process=<span style={{color:'#fb923c'}}>powershell.exe</span></p>
                  <p style={{color:'#f87171',fontWeight:700}}>02:32:15 host=SRV-DC01 process=<span style={{color:'#f87171'}}>mimikatz.exe</span> ⚠</p>
                </div>
                <p style={{color:'#475569',marginBottom:'4px'}}>siem&gt; index=dns</p>
                <div style={{backgroundColor:'rgba(255,255,255,0.03)',borderRadius:'8px',padding:'12px',border:'1px solid rgba(255,255,255,0.05)'}}>
                  <p style={{color:'#f87171'}}>c2.nighthawk-ops.ru → 185.220.101.45 ⚠</p>
                </div>
                <div style={{marginTop:'12px',padding:'10px 12px',borderRadius:'8px',backgroundColor:'rgba(16,185,129,0.07)',border:'1px solid rgba(16,185,129,0.15)'}}>
                  <p style={{color:'#34d399',fontSize:'11px'}}>📝 IOC detectado: mimikatz + C2 activo</p>
                </div>
              </div>
            </div>
            <div>
              <p style={{fontSize:'11px',color:'#10b981',letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>LABS</p>
              <h2 style={{fontSize:'clamp(26px,3.2vw,42px)',fontWeight:800,letterSpacing:'-1.2px',color:T1,lineHeight:1.1,marginBottom:'18px'}}>
                {es?'Investigación forense libre y evaluada.':'Free forensic investigation. Evaluated.'}
              </h2>
              <p style={{fontSize:'15px',color:T3,lineHeight:1.8,marginBottom:'28px'}}>
                {es?'Sin tiempo límite. Explora el SIEM, investiga logs, mapea la red y entrega tu informe. La IA evalúa la profundidad de tu análisis, no la velocidad.':'No time limit. Explore the SIEM, investigate logs, map the network and submit your report. AI evaluates depth, not speed.'}
              </p>
              <div style={{padding:'14px 18px',borderRadius:'12px',backgroundColor:'#f0fdf4',border:'1px solid #bbf7d0',marginBottom:'24px'}}>
                <p style={{fontSize:'13px',color:'#15803d',lineHeight:1.6}}>
                  💡 <strong>{es?'Diferencia clave:':'Key difference:'}</strong> {es?'Las sesiones puntúan velocidad. Los labs puntúan profundidad.':'Sessions score speed. Labs score depth.'}
                </p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'24px'}}>
                {[{icon:'🖥️',l:es?'SIEM con queries':'SIEM queries'},{icon:'📋',l:'Log Explorer'},{icon:'🌐',l:es?'Mapa de red':'Network Map'},{icon:'🤖',l:es?'Evaluación IA':'AI Evaluation'}].map((f,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 14px',borderRadius:'10px',backgroundColor:CARD,border:`1px solid ${BD}`}}>
                    <span style={{fontSize:'16px'}}>{f.icon}</span>
                    <span style={{fontSize:'13px',color:T2,fontWeight:500}}>{f.l}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={()=>navigate('/register')} style={{padding:'12px 28px',borderRadius:'100px',background:'linear-gradient(135deg,#059669,#10b981)',border:'none',color:'#fff',fontWeight:600,fontSize:'14px',cursor:'pointer',boxShadow:'0 4px 16px rgba(16,185,129,0.3)'}}>
                {es?'Acceder al laboratorio →':'Access the lab →'}
              </button>
            </div>
          </div>
        </div>

        {/* TRAINING */}
        <div style={{position:'relative',zIndex:1,padding:'110px 60px',backdropFilter:'blur(8px)'}}>
          <div style={{maxWidth:'1140px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',alignItems:'center',gap:'80px'}}>
            <div>
              <p style={{fontSize:'11px',color:'#818cf8',letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>TRAINING</p>
              <h2 style={{fontSize:'clamp(26px,3.2vw,42px)',fontWeight:800,letterSpacing:'-1.2px',color:T1,lineHeight:1.1,marginBottom:'18px'}}>
                {es?'Un curso SOC completo\ny estructurado.':'A complete, structured\nSOC course.'}
              </h2>
              <p style={{fontSize:'15px',color:T3,lineHeight:1.8,marginBottom:'32px'}}>
                {es?'12 módulos progresivos divididos en 3 cursos. Con teoría visual, casos prácticos y XP real que sube tu tier.':'12 progressive modules in 3 courses. Visual theory, practical cases and real XP that raises your tier.'}
              </p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
                {[{v:'3',l:es?'Cursos':'Courses'},{v:'12',l:es?'Módulos':'Modules'},{v:'2.580',l:'XP Total'}].map((s,i)=>(
                  <div key={i} style={{padding:'18px 16px',borderRadius:'12px',backgroundColor:CARD,border:`1px solid ${BD}`,textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                    <div style={{fontSize:'24px',fontWeight:800,color:T1,letterSpacing:'-1px'}}>{s.v}</div>
                    <div style={{fontSize:'11px',color:T4,marginTop:'4px'}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mockup training */}
            <div style={{borderRadius:'16px',overflow:'hidden',border:`1px solid ${BD}`,boxShadow:'0 16px 48px rgba(0,0,0,0.07)'}}>
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
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'11px 14px',borderRadius:'10px',backgroundColor:l.active?`${ACC}06`:'#f8fafc',border:l.active?`1px solid ${ACC}20`:`1px solid ${BD}`,marginBottom:'7px'}}>
                    <div style={{width:'22px',height:'22px',borderRadius:'50%',backgroundColor:l.done?'rgba(34,197,94,0.1)':l.active?`${ACC}12`:'#f1f5f9',border:`1px solid ${l.done?'rgba(34,197,94,0.4)':l.active?ACC+'40':BD}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'10px',color:l.done?'#22c55e':l.active?ACC:T4}}>
                      {l.done?'✓':l.active?'▶':'○'}
                    </div>
                    <span style={{fontSize:'13px',color:l.done?T4:l.active?T1:T3,flex:1,fontWeight:l.active?600:400}}>{l.title}</span>
                    <span style={{fontSize:'11px',color:l.done?'#22c55e':T4,fontWeight:600}}>+{l.xp} XP</span>
                  </div>
                ))}
                <div style={{marginTop:'14px',padding:'12px 14px',borderRadius:'10px',backgroundColor:'#f8fafc',border:`1px solid ${BD}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                    <span style={{fontSize:'11px',color:T4}}>{es?'Progreso':'Progress'}</span>
                    <span style={{fontSize:'11px',color:ACC,fontWeight:600}}>50%</span>
                  </div>
                  <div style={{height:'3px',borderRadius:'2px',backgroundColor:'#e2e8f0'}}>
                    <div style={{width:'50%',height:'100%',borderRadius:'2px',background:`linear-gradient(90deg,${ACC},#818cf8)`}}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TIERS */}
        <div style={{position:'relative',zIndex:1,padding:'110px 60px',backgroundColor:'rgba(248,250,252,0.85)',borderTop:`1px solid ${BD}`,backdropFilter:'blur(8px)'}}>
          <div style={{maxWidth:'1140px',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',alignItems:'center',gap:'80px'}}>
            <div>
              <p style={{fontSize:'11px',color:'#10B981',letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>XP & TIERS</p>
              <h2 style={{fontSize:'clamp(26px,3.2vw,42px)',fontWeight:800,letterSpacing:'-1.2px',color:T1,lineHeight:1.1,marginBottom:'18px'}}>
                {es?'Tu progreso.\nTu identidad.':'Your progress.\nYour identity.'}
              </h2>
              <p style={{fontSize:'15px',color:T3,lineHeight:1.8,marginBottom:'32px'}}>
                {es?'Cada sesión y lección te da XP. El XP sube tu Tier. Desde SOC Rookie hasta SOC Legend.':'Every session and lesson gives you XP. XP raises your Tier. From SOC Rookie to SOC Legend.'}
              </p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                {[
                  {label:es?'Sesión completada':'Session completed',xp:'+50–400 XP',color:ACC},
                  {label:es?'Lección de training':'Training lesson',xp:'+30–70 XP',color:'#818cf8'},
                  {label:es?'Sin usar pistas':'No hints used',xp:'+bonus XP',color:'#10b981'},
                  {label:es?'Arena Elite':'Elite arena',xp:'+400 XP max',color:'#A78BFA'},
                ].map((item,i)=>(
                  <div key={i} style={{padding:'14px 16px',borderRadius:'12px',backgroundColor:CARD,border:`1px solid ${BD}`,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                    <div style={{fontSize:'13px',color:T3,marginBottom:'4px'}}>{item.label}</div>
                    <div style={{fontSize:'16px',fontWeight:700,color:item.color}}>{item.xp}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Tier list clara */}
            <div style={{borderRadius:'16px',overflow:'hidden',border:`1px solid ${BD}`,backgroundColor:CARD,boxShadow:'0 8px 32px rgba(0,0,0,0.06)'}}>
              <div style={{padding:'14px 18px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'11px',color:'#10B981',letterSpacing:'2px',fontWeight:700}}>TIER SYSTEM</span>
                <span style={{fontSize:'11px',color:T4}}>8 niveles</span>
              </div>
              <div style={{padding:'8px'}}>
                {tiers.map((t,i)=>(
                  <div key={i} className="tier-row" style={{display:'flex',alignItems:'center',gap:'14px',padding:'11px 14px',borderRadius:'9px',marginBottom:'2px',cursor:'default'}}>
                    <div style={{width:'28px',height:'28px',borderRadius:'8px',backgroundColor:`${t.color}12`,border:`1px solid ${t.color}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:'11px',fontWeight:800,color:t.color}}>{t.tier}</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'13px',fontWeight:600,color:T1}}>{t.name}</div>
                    </div>
                    <div style={{fontSize:'11px',color:T4,fontFamily:'monospace'}}>{t.xp} XP</div>
                    <div style={{width:'6px',height:'6px',borderRadius:'50%',backgroundColor:t.color,flexShrink:0,boxShadow:`0 0 6px ${t.color}`}}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOR EVERYONE */}
        <div style={{position:'relative',zIndex:1,padding:'110px 60px',backdropFilter:'blur(8px)'}}>
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
              <div className="card-hover" style={{padding:'48px',borderRadius:'22px',background:`linear-gradient(145deg,${ACC}06 0%,transparent 100%)`,border:`1px solid ${ACC}18`,position:'relative',overflow:'hidden',boxShadow:'0 4px 20px rgba(79,70,229,0.06)'}}>
                <div style={{position:'absolute',top:'-80px',right:'-80px',width:'280px',height:'280px',borderRadius:'50%',background:`radial-gradient(circle,${ACC}06,transparent)`,pointerEvents:'none'}}/>
                <p style={{fontSize:'11px',color:ACC,letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>FOR ANALYSTS</p>
                <h3 style={{fontSize:'28px',fontWeight:800,letterSpacing:'-1px',color:T1,marginBottom:'12px'}}>{es?'Analistas SOC':'SOC Analysts'}</h3>
                <p style={{color:T3,fontSize:'15px',lineHeight:1.8,marginBottom:'24px',maxWidth:'480px'}}>
                  {es?'Entrena con escenarios reales, sube desde Bronce hasta Elite y obtén un certificado verificable que las empresas buscan.':'Train with real AI scenarios, climb from Bronze to Elite and get a verifiable certificate companies look for.'}
                </p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'28px'}}>
                  {(es?['Sesiones SOC únicas con IA','Arenas Bronce → Elite','Certificado con QR verificable','Ranking global','Training en 12 módulos','XP y skills certificadas']:['Unique AI SOC sessions','Bronze → Elite arenas','QR-verifiable certificate','Global ranking','12-module training','XP and certified skills']).map((item,j)=>(
                    <div key={j} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:T2}}>
                      <div style={{width:'4px',height:'4px',borderRadius:'50%',backgroundColor:ACC,flexShrink:0}}/>
                      {item}
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={()=>navigate('/register')} style={{padding:'12px 28px',borderRadius:'100px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontWeight:600,fontSize:'14px',cursor:'pointer',boxShadow:`0 4px 20px rgba(79,70,229,0.25)`}}>
                  {es?'Iniciar Training →':'Start Training →'}
                </button>
              </div>
              <div className="card-hover" style={{padding:'40px',borderRadius:'22px',background:'linear-gradient(145deg,rgba(124,58,237,0.05) 0%,transparent 100%)',border:'1px solid rgba(124,58,237,0.15)',position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',justifyContent:'space-between',boxShadow:'0 4px 20px rgba(124,58,237,0.05)'}}>
                <div>
                  <p style={{fontSize:'11px',color:'#7C3AED',letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>FOR COMPANIES</p>
                  <h3 style={{fontSize:'24px',fontWeight:800,letterSpacing:'-0.8px',color:T1,marginBottom:'12px'}}>{es?'Empresas':'Companies'}</h3>
                  <p style={{color:T3,fontSize:'14px',lineHeight:1.8,marginBottom:'24px'}}>
                    {es?'Accede al Talent Pool, crea simulaciones personalizadas y publica ofertas de trabajo.':'Access the Talent Pool, create custom simulations and post job offers.'}
                  </p>
                  <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'28px'}}>
                    {(es?['Talent Pool con filtros','Simulaciones a medida','Publicación de ofertas','Comparativa de candidatos']:['Filtered Talent Pool','Custom simulations','Job posting','Candidate comparison']).map((item,j)=>(
                      <div key={j} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:T2}}>
                        <div style={{width:'4px',height:'4px',borderRadius:'50%',backgroundColor:'#7C3AED',flexShrink:0}}/>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={()=>navigate('/company')} style={{padding:'11px 24px',borderRadius:'100px',background:'linear-gradient(135deg,#6D28D9,#7C3AED)',border:'none',color:'#fff',fontWeight:600,fontSize:'14px',cursor:'pointer',boxShadow:'0 4px 16px rgba(124,58,237,0.25)'}}>
                  {es?'Empezar →':'Get started →'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ARENAS */}
        <div style={{position:'relative',zIndex:1,padding:'110px 60px',backgroundColor:'rgba(248,250,252,0.85)',borderTop:`1px solid ${BD}`,backdropFilter:'blur(8px)'}}>
          <div style={{maxWidth:'1140px',margin:'0 auto'}}>
            <div style={{marginBottom:'56px'}}>
              <p style={{fontSize:'11px',color:'#F59E0B',letterSpacing:'3px',fontWeight:700,marginBottom:'16px'}}>ARENA SYSTEM</p>
              <h2 style={{fontSize:'clamp(26px,3.5vw,46px)',fontWeight:800,letterSpacing:'-1.5px',color:T1,marginBottom:'14px'}}>
                {es?'¿En qué arena estás?':'Which arena are you in?'}
              </h2>
              <p style={{fontSize:'16px',color:T3,maxWidth:'440px'}}>
                {es?'Cuatro planetas. Cuatro niveles. Un solo objetivo.':'Four planets. Four levels. One goal.'}
              </p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'20px'}}>
              {arenas.map((a,i)=>(
                <div key={i} className="arena-card" style={{padding:'32px 22px',borderRadius:'20px',backgroundColor:CARD,border:`1px solid ${a.color}20`,textAlign:'center',cursor:'pointer',boxShadow:`0 4px 20px rgba(0,0,0,0.06)`,position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:'-40px',right:'-40px',width:'120px',height:'120px',borderRadius:'50%',background:`radial-gradient(circle,${a.color}08,transparent)`,pointerEvents:'none'}}/>
                  <div className="planet-float" style={{display:'flex',justifyContent:'center',marginBottom:'20px',animationDelay:`${i*.8}s`}}>
                    <Planet type={a.planet} size={100}/>
                  </div>
                  <div style={{fontSize:'18px',fontWeight:800,color:a.color,marginBottom:'5px',letterSpacing:'-0.3px'}}>{a.name}</div>
                  <div style={{fontSize:'11px',color:T4,fontFamily:'monospace',marginBottom:'10px'}}>{a.cups}</div>
                  <p style={{fontSize:'12px',color:T3,lineHeight:1.6,marginBottom:'14px'}}>{a.desc}</p>
                  <div style={{marginBottom:'10px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
                      <span style={{fontSize:'10px',color:T4,fontWeight:600}}>{a.diff}</span>
                      <span style={{fontSize:'10px',color:a.color,fontWeight:600}}>{a.pct}%</span>
                    </div>
                    <div style={{height:'3px',borderRadius:'2px',backgroundColor:'#e2e8f0'}}>
                      <div style={{width:`${a.pct}%`,height:'100%',borderRadius:'2px',backgroundColor:a.color}}/>
                    </div>
                  </div>
                  <div style={{fontSize:'11px',color:T4}}>
                    <span style={{color:a.color}}>⏱</span> {a.time} {es?'por sesión':'per session'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA FINAL */}
        <div style={{position:'relative',zIndex:1,padding:'110px 60px',backdropFilter:'blur(8px)'}}>
          <div style={{maxWidth:'1140px',margin:'0 auto'}}>
            <div style={{borderRadius:'28px',padding:'72px',background:`linear-gradient(145deg,${ACC}08 0%,rgba(124,58,237,0.05) 100%)`,border:`1px solid ${ACC}18`,display:'grid',gridTemplateColumns:'1fr auto',gap:'60px',alignItems:'center',position:'relative',overflow:'hidden',boxShadow:`0 8px 40px rgba(79,70,229,0.08)`}}>
              <div style={{position:'absolute',top:'-100px',right:'200px',width:'400px',height:'400px',borderRadius:'50%',background:`radial-gradient(circle,${ACC}06,transparent)`,pointerEvents:'none'}}/>
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
                <button className="btn-primary" onClick={()=>navigate('/register')} style={{padding:'16px 40px',borderRadius:'100px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'16px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 32px rgba(79,70,229,0.28)`,whiteSpace:'nowrap'}}>
                  {es?'Crear cuenta gratis →':'Create free account →'}
                </button>
                <button className="btn-sec" onClick={()=>navigate('/login')} style={{padding:'14px 32px',borderRadius:'100px',background:CARD,border:`1.5px solid ${BD}`,color:T2,fontSize:'15px',fontWeight:500,cursor:'pointer',textAlign:'center'}}>
                  {es?'Ya tengo cuenta':'I have an account'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{position:'relative',zIndex:1,backgroundColor:'rgba(248,250,252,0.9)',borderTop:`1px solid ${BD}`,padding:'36px 60px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'16px',backdropFilter:'blur(8px)'}}>
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