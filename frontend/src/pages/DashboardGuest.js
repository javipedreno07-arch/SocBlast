import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ACC = '#4f46e5';

const DEMO_USER = {
  nombre: 'Analista Demo',
  arena: 'Plata II',
  tier: 3,
  copas: 1340,
  xp: 2100,
  sesiones_completadas: 7,
  skills: {
    analisis_logs: 6,
    deteccion_amenazas: 5,
    respuesta_incidentes: 4,
    threat_hunting: 3,
    forense_digital: 3,
    gestion_vulnerabilidades: 4,
    inteligencia_amenazas: 3,
  }
};

const DEMO_HISTORIAL = [
  { titulo:'Brute Force en DC',      copas:+18, puntuacion:14 },
  { titulo:'Phishing con RAT',       copas:+22, puntuacion:16 },
  { titulo:'DNS Tunneling',          copas:-8,  puntuacion:6  },
  { titulo:'Ransomware WannaCry',    copas:+15, puntuacion:12 },
  { titulo:'Lateral Movement APT',   copas:+20, puntuacion:15 },
];

const TIERS    = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const TIER_CLR = ['','#64748b','#3b82f6','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444','#8b5cf6'];

const SKILLS = [
  {key:'analisis_logs',          label:'Análisis de Logs'},
  {key:'deteccion_amenazas',     label:'Detección Amenazas'},
  {key:'respuesta_incidentes',   label:'Respuesta Incidentes'},
  {key:'threat_hunting',         label:'Threat Hunting'},
  {key:'forense_digital',        label:'Forense Digital'},
  {key:'gestion_vulnerabilidades',label:'Gestión Vulns'},
  {key:'inteligencia_amenazas',  label:'Intel. Amenazas'},
];

const ARENAS = [
  {id:'bronce3',name:'Bronce III',tier:'bronce',min:0,   max:299 },
  {id:'bronce2',name:'Bronce II', tier:'bronce',min:300, max:599 },
  {id:'bronce1',name:'Bronce I',  tier:'bronce',min:600, max:899 },
  {id:'plata3', name:'Plata III', tier:'plata', min:900, max:1199},
  {id:'plata2', name:'Plata II',  tier:'plata', min:1200,max:1499},
  {id:'plata1', name:'Plata I',   tier:'plata', min:1500,max:1799},
  {id:'oro3',   name:'Oro III',   tier:'oro',   min:1800,max:2099},
  {id:'oro2',   name:'Oro II',    tier:'oro',   min:2100,max:2399},
  {id:'oro1',   name:'Oro I',     tier:'oro',   min:2400,max:2699},
  {id:'diamante3',name:'Diamante III',tier:'diamante',min:2700,max:2999},
  {id:'diamante2',name:'Diamante II', tier:'diamante',min:3000,max:3299},
  {id:'diamante1',name:'Diamante I',  tier:'diamante',min:3300,max:99999},
];

const TIER_COLORS = {bronce:'#d97706',plata:'#94a3b8',oro:'#f59e0b',diamante:'#3b82f6'};
const getArena = copas => ARENAS.find(a => copas >= a.min && copas <= a.max) || ARENAS[0];

const ParticleCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d');
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const pts = Array.from({length:40},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.5+.5,o:Math.random()*.1+.03}));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      pts.forEach(n=>{ n.x+=n.vx; n.y+=n.vy; if(n.x<0||n.x>w)n.vx*=-1; if(n.y<0||n.y>h)n.vy*=-1; ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=`rgba(79,70,229,${n.o})`; ctx.fill(); });
      pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{ const d=Math.hypot(a.x-b.x,a.y-b.y); if(d<130){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=`rgba(79,70,229,${(1-d/130)*.04})`; ctx.lineWidth=.4; ctx.stroke(); }}));
      raf=requestAnimationFrame(draw);
    };
    draw();
    const resize=()=>{w=c.width=window.innerWidth;h=c.height=window.innerHeight;};
    window.addEventListener('resize',resize);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};
  },[]);
  return <canvas ref={ref} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>;
};

export default function DashboardGuest() {
  const navigate = useNavigate();

  const u         = DEMO_USER;
  const arena     = getArena(u.copas);
  const ac        = TIER_COLORS[arena.tier] || ACC;
  const tier      = u.tier;
  const tierColor = TIER_CLR[tier] || '#64748b';
  const XP_MAX    = [0,500,1500,3000,5000,8000,12000,18000,99999];
  const xpMin     = XP_MAX[tier-1]||0;
  const xpMax     = XP_MAX[tier]||99999;
  const pctXP     = Math.min(((u.xp-xpMin)/(xpMax-xpMin))*100,100);
  const pctCopas  = Math.min(((u.copas-arena.min)/300)*100,100);
  const siguiente = ARENAS[ARENAS.findIndex(a=>a.id===arena.id)+1];

  const [termLines, setTermLines] = useState([]);
  const TERM = [
    {text:'$ iniciando sesión SOC...',         color:'#94a3b8', delay:0},
    {text:'⚠  ALERT   Brute force detected',   color:'#ef4444', delay:400},
    {text:'   →  src: 185.220.101.45',          color:'#64748b', delay:800},
    {text:'   →  target: CORP-DC01   445/SMB',  color:'#64748b', delay:1200},
    {text:'$ correlating SIEM events...',       color:'#94a3b8', delay:1600},
    {text:'   →  T1078 Valid Accounts detected',color:'#f97316', delay:2000},
    {text:'$ awaiting analyst action...',       color:ACC,       delay:2400},
    {text:'▌',                                  color:ACC,       delay:2800},
  ];
  useEffect(()=>{
    setTermLines([]);
    TERM.forEach(l=>setTimeout(()=>setTermLines(p=>[...p.filter(x=>x.text!=='▌'),l]),l.delay));
  },[]);

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp .3s ease forwards;}
    .stat-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(79,70,229,0.12)!important;}
    .quick-btn:hover{background:#f0f4ff!important;border-color:#c7d2fe!important;}
    .hist-row:hover{background:#f8fafc!important;}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    *{transition:transform .2s ease,box-shadow .2s ease,border-color .15s ease,background .15s ease;}
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{position:'fixed',inset:0,background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',zIndex:-1}}/>
      <ParticleCanvas/>

      <div style={{position:'relative',zIndex:1,minHeight:'100vh',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0f172a'}}>

        {/* NAVBAR */}
        <nav style={{position:'sticky',top:0,zIndex:50,height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',backgroundColor:'rgba(255,255,255,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 12px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:'28px'}}/>
            <span style={{fontSize:'15px',fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'5px 12px',borderRadius:'8px',backgroundColor:'#fffbeb',border:'1px solid #fde68a'}}>
            <span style={{fontSize:'13px'}}>👁️</span>
            <span style={{fontSize:'12px',color:'#92400e',fontWeight:600}}>Modo Invitado — datos de demostración</span>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button className="nav-btn" onClick={()=>navigate('/login')} style={{padding:'6px 16px',borderRadius:'8px',background:'none',border:'1px solid #e2e8f0',color:'#64748b',fontSize:'13px',cursor:'pointer'}}>Iniciar sesión</button>
            <button onClick={()=>navigate('/register')} style={{padding:'6px 16px',borderRadius:'8px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',boxShadow:`0 2px 10px ${ACC}30`}}>Crear cuenta gratis</button>
          </div>
        </nav>

        {/* BANNER INVITADO */}
        <div style={{margin:'16px 40px 0',padding:'12px 20px',borderRadius:'12px',backgroundColor:'#eff6ff',border:'1px solid #bfdbfe',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{fontSize:'16px'}}>🎮</span>
            <span style={{fontSize:'13px',color:'#1e40af',fontWeight:500}}>Estás viendo una demo interactiva de SocBlast. Crea una cuenta gratis para empezar a ganar XP real.</span>
          </div>
          <button onClick={()=>navigate('/register')} style={{padding:'7px 18px',borderRadius:'8px',backgroundColor:ACC,border:'none',color:'#fff',fontSize:'12px',fontWeight:700,cursor:'pointer',flexShrink:0}}>
            Empezar gratis →
          </button>
        </div>

        <div style={{maxWidth:'1160px',margin:'0 auto',padding:'20px 40px 72px'}}>

          {/* BIENVENIDA */}
          <div style={{marginBottom:'20px'}}>
            <h1 style={{fontSize:'22px',fontWeight:800,color:'#0f172a',letterSpacing:'-0.5px',marginBottom:'2px'}}>
              Bienvenido, <span style={{color:ACC}}>Analista Demo</span>
            </h1>
            <p style={{fontSize:'13px',color:'#94a3b8'}}>
              {arena.name} · Tier {tier} — {TIERS[tier]} · {u.sesiones_completadas} sesiones completadas
            </p>
          </div>

          {/* FILA 1: ARENA + SESIÓN + TERMINAL */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:'14px',marginBottom:'14px'}}>

            {/* ARENA CARD */}
            <div style={{borderRadius:'18px',padding:'28px 34px',background:`linear-gradient(135deg,${ac} 0%,${ac}88 100%)`,position:'relative',overflow:'hidden',boxShadow:`0 8px 32px rgba(0,0,0,0.15)`}}>
              <div style={{position:'absolute',top:'-40px',right:'-20px',width:'220px',height:'220px',borderRadius:'50%',background:'rgba(255,255,255,0.08)',pointerEvents:'none'}}/>
              <div style={{display:'flex',alignItems:'center',gap:'28px',position:'relative',zIndex:1}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                    <div style={{width:'5px',height:'5px',borderRadius:'50%',backgroundColor:'#fff',animation:'pulse 2s infinite'}}/>
                    <span style={{fontSize:'10px',color:'rgba(255,255,255,0.75)',letterSpacing:'2px',fontWeight:700}}>TU ARENA ACTUAL</span>
                  </div>
                  <h1 style={{fontSize:'52px',fontWeight:900,color:'#fff',letterSpacing:'-2px',lineHeight:1,marginBottom:'4px'}}>{arena.name}</h1>
                  <p style={{fontSize:'11px',color:'rgba(255,255,255,0.55)',marginBottom:'16px'}}>{arena.min} — {arena.max} copas</p>
                  <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'10px'}}>
                    <span style={{fontSize:'34px',fontWeight:900,color:'#fff',letterSpacing:'-1px'}}>{u.copas.toLocaleString()}</span>
                    <span style={{fontSize:'13px',color:'rgba(255,255,255,0.65)'}}>copas</span>
                    {siguiente && <span style={{fontSize:'10px',color:'rgba(255,255,255,0.8)',padding:'2px 8px',borderRadius:'5px',background:'rgba(255,255,255,0.18)'}}>{siguiente.min-u.copas} → {siguiente.name}</span>}
                  </div>
                  <div style={{height:'5px',borderRadius:'3px',backgroundColor:'rgba(255,255,255,0.22)',maxWidth:'280px',marginBottom:'6px'}}>
                    <div style={{width:`${pctCopas}%`,height:'100%',borderRadius:'3px',backgroundColor:'#fff',opacity:.9}}/>
                  </div>
                  <p style={{fontSize:'10px',color:'rgba(255,255,255,0.55)'}}>{Math.round(pctCopas)}% hacia {siguiente?.name||'máximo'}</p>
                </div>
                <div style={{fontSize:'80px',opacity:.25,flexShrink:0}}>🪐</div>
              </div>
            </div>

            {/* SESIÓN + TERMINAL */}
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div style={{width:'100%',padding:'20px',borderRadius:'14px',background:'linear-gradient(135deg,#4f46e5,#6366f1)',display:'flex',alignItems:'center',gap:'14px',boxShadow:'0 4px 20px rgba(79,70,229,.35)',position:'relative',overflow:'hidden'}}>
                <div style={{width:'44px',height:'44px',borderRadius:'12px',backgroundColor:'rgba(255,255,255,0.18)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px',fontWeight:800,color:'#fff',marginBottom:'3px'}}>INICIAR SESIÓN SOC</div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.6)'}}>Solo disponible con cuenta</div>
                </div>
                {/* Overlay bloqueado */}
                <div onClick={()=>navigate('/register')} style={{position:'absolute',inset:0,backgroundColor:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',borderRadius:'14px'}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'20px',marginBottom:'4px'}}>🔒</div>
                    <span style={{fontSize:'12px',color:'#fff',fontWeight:700}}>Crear cuenta</span>
                  </div>
                </div>
              </div>

              <div style={{flex:1,borderRadius:'14px',overflow:'hidden',border:'1px solid #e2e8f0',backgroundColor:'#fff',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
                <div style={{backgroundColor:'#f8fafc',padding:'8px 14px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:'5px'}}>
                  {['#FF5F57','#FEBC2E','#28C840'].map((c,i)=><div key={i} style={{width:'9px',height:'9px',borderRadius:'50%',backgroundColor:c}}/>)}
                  <span style={{color:'#94a3b8',fontSize:'10px',marginLeft:'8px'}}>soc-terminal — demo</span>
                </div>
                <div style={{backgroundColor:'#0f172a',padding:'14px 16px',fontFamily:"'Fira Code',monospace",fontSize:'11px',lineHeight:2.0,minHeight:'170px'}}>
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
              {label:'COPAS',    value:u.copas.toLocaleString(),              sub:arena.name,          color:ac},
              {label:'XP TOTAL', value:u.xp.toLocaleString(),                 sub:`${Math.round(pctXP)}% al siguiente`, color:ACC},
              {label:'SESIONES', value:u.sesiones_completadas.toString(),      sub:'completadas',       color:'#059669'},
              {label:'TIER',     value:`T${tier}`,                             sub:TIERS[tier],         color:tierColor},
            ].map((s,i)=>(
              <div key={i} className="stat-card" style={{padding:'20px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',backgroundColor:s.color,borderRadius:'14px 14px 0 0'}}/>
                <div style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:'5px'}}>{s.label}</div>
                <div style={{fontSize:'28px',fontWeight:900,color:s.color,letterSpacing:'-0.8px',lineHeight:1,marginBottom:'4px'}}>{s.value}</div>
                <div style={{fontSize:'12px',color:'#64748b'}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* XP BAR */}
          <div style={{padding:'16px 20px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',marginBottom:'14px',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'13px',fontWeight:700,color:tierColor}}>{TIERS[tier]}</span>
                <span style={{fontSize:'10px',color:'#94a3b8',padding:'2px 7px',borderRadius:'5px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0'}}>T{tier}</span>
                {tier<8 && <span style={{fontSize:'12px',color:'#94a3b8'}}>→ {TIERS[tier+1]}</span>}
              </div>
              <span style={{fontSize:'11px',color:'#94a3b8'}}>{u.xp.toLocaleString()} / {xpMax.toLocaleString()} XP</span>
            </div>
            <div style={{height:'8px',borderRadius:'4px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
              <div style={{width:`${pctXP}%`,height:'100%',borderRadius:'4px',background:`linear-gradient(90deg,${tierColor}80,${tierColor})`}}/>
            </div>
          </div>

          {/* FILA: SKILLS + ACCESOS + HISTORIAL */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>

            {/* SKILLS */}
            <div style={{padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:'16px'}}>HABILIDADES</p>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {SKILLS.map((s,i)=>{
                  const val = u.skills[s.key]||0;
                  return (
                    <div key={i}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                        <span style={{fontSize:'11px',color:'#475569',fontWeight:500}}>{s.label}</span>
                        <span style={{fontSize:'10px',color:'#94a3b8'}}>{val}/10</span>
                      </div>
                      <div style={{height:'5px',borderRadius:'3px',backgroundColor:'#f1f5f9',overflow:'hidden'}}>
                        <div style={{width:`${val*10}%`,height:'100%',borderRadius:'3px',background:`linear-gradient(90deg,${ACC}80,${ACC})`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACCESOS RÁPIDOS */}
            <div style={{padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',marginBottom:'16px'}}>ACCESOS RÁPIDOS</p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {[
                  {label:'Training SOC',   desc:'12 módulos · 3 cursos', path:'/training',    color:'#7c3aed', locked:false},
                  {label:'Ranking Global', desc:'Ver posiciones',         path:'/ranking',     color:'#d97706', locked:false},
                  {label:'Sesiones SOC',   desc:'Requiere cuenta',        path:'/register',    color:ACC,       locked:true},
                  {label:'Mi Certificado', desc:'Requiere cuenta',        path:'/register',    color:'#059669', locked:true},
                  {label:'Crear cuenta',   desc:'Es gratis 🎉',           path:'/register',    color:ACC,       locked:false},
                ].map((item,i)=>(
                  <div key={i} className="quick-btn" onClick={()=>navigate(item.path)}
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 13px',borderRadius:'10px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0',cursor:'pointer'}}>
                    <div style={{width:'30px',height:'30px',borderRadius:'8px',backgroundColor:`${item.color}10`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:item.locked?'#cbd5e1':item.color}}/>
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontSize:'12px',color:item.locked?'#94a3b8':'#0f172a',fontWeight:600}}>{item.label}</span>
                      <span style={{fontSize:'10px',color:'#94a3b8',marginLeft:'6px'}}>{item.desc}</span>
                    </div>
                    {item.locked
                      ? <span style={{fontSize:'11px'}}>🔒</span>
                      : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* HISTORIAL DEMO */}
            <div style={{padding:'20px 22px',borderRadius:'14px',backgroundColor:'#fff',border:'1px solid #e8eaf0',boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <p style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px'}}>ÚLTIMAS SESIONES</p>
                <span style={{fontSize:'10px',color:'#94a3b8',padding:'2px 7px',borderRadius:'4px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0'}}>DEMO</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                {DEMO_HISTORIAL.map((s,i)=>{
                  const pos = s.copas >= 0;
                  return (
                    <div key={i} className="hist-row" style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 11px',borderRadius:'9px',backgroundColor:'#f8fafc',border:'1px solid #f1f5f9'}}>
                      <div style={{width:'28px',height:'28px',borderRadius:'7px',backgroundColor:pos?'#ecfdf5':'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <span style={{fontSize:'13px'}}>{pos?'⬆':'⬇'}</span>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:'11px',color:'#0f172a',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.titulo}</p>
                        <p style={{fontSize:'10px',color:'#94a3b8'}}>{s.puntuacion}/20 pts</p>
                      </div>
                      <span style={{fontSize:'12px',fontWeight:700,color:pos?'#059669':'#ef4444',flexShrink:0}}>{pos?'+':''}{s.copas}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA FINAL */}
          <div style={{marginTop:'20px',padding:'28px 32px',borderRadius:'16px',background:`linear-gradient(135deg,${ACC}08,rgba(129,140,248,0.06))`,border:`1px solid ${ACC}20`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'20px',boxShadow:`0 4px 20px ${ACC}08`}}>
            <div>
              <h3 style={{fontSize:'17px',fontWeight:800,color:'#0f172a',marginBottom:'5px',letterSpacing:'-0.4px'}}>¿Listo para jugar de verdad?</h3>
              <p style={{fontSize:'13px',color:'#64748b'}}>Crea tu cuenta gratis y empieza a ganar XP, copas y un certificado verificable.</p>
            </div>
            <div style={{display:'flex',gap:'10px',flexShrink:0}}>
              <button onClick={()=>navigate('/login')} style={{padding:'10px 20px',borderRadius:'10px',backgroundColor:'#fff',border:'1px solid #e2e8f0',color:'#475569',fontSize:'13px',cursor:'pointer',fontWeight:500}}>Iniciar sesión</button>
              <button onClick={()=>navigate('/register')} style={{padding:'10px 20px',borderRadius:'10px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 14px ${ACC}30`}}>Crear cuenta gratis →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}