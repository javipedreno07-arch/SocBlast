import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';
const ACC = '#0a66c2';

const SKILL_ABBR = [
  { key:'analisis_logs',           abbr:'LOG', label:'Analisis de Logs'     },
  { key:'deteccion_amenazas',      abbr:'DET', label:'Deteccion Amenazas'   },
  { key:'respuesta_incidentes',    abbr:'RSP', label:'Respuesta Incidentes' },
  { key:'threat_hunting',          abbr:'THR', label:'Threat Hunting'       },
  { key:'forense_digital',         abbr:'FOR', label:'Forense Digital'      },
  { key:'gestion_vulnerabilidades',abbr:'VUL', label:'Gestion de Vulns'     },
  { key:'inteligencia_amenazas',   abbr:'INT', label:'Intel. Amenazas'      },
  { key:'siem_queries',            abbr:'SIE', label:'SIEM & Queries'       },
];

const ARENA_COLORS = {
  bronce:   { main:'#b45309', light:'#fef3c7', border:'#fcd34d' },
  plata:    { main:'#475569', light:'#f1f5f9', border:'#cbd5e1' },
  oro:      { main:'#92400e', light:'#fffbeb', border:'#fde68a' },
  diamante: { main:'#1e40af', light:'#eff6ff', border:'#bfdbfe' },
};

const TIERS    = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const TIER_CLR = ['','#64748b','#0a66c2','#0891b2','#059669','#d97706','#ea580c','#dc2626','#7c3aed'];

const ARENAS_CONFIG = [
  {id:'bronce3', name:'Bronce III', tier:'bronce', min:0,    max:299  },
  {id:'bronce2', name:'Bronce II',  tier:'bronce', min:300,  max:599  },
  {id:'bronce1', name:'Bronce I',   tier:'bronce', min:600,  max:899  },
  {id:'plata3',  name:'Plata III',  tier:'plata',  min:900,  max:1199 },
  {id:'plata2',  name:'Plata II',   tier:'plata',  min:1200, max:1499 },
  {id:'plata1',  name:'Plata I',    tier:'plata',  min:1500, max:1799 },
  {id:'oro3',    name:'Oro III',    tier:'oro',    min:1800, max:2099 },
  {id:'oro2',    name:'Oro II',     tier:'oro',    min:2100, max:2399 },
  {id:'oro1',    name:'Oro I',      tier:'oro',    min:2400, max:2699 },
  {id:'diamante3',name:'Diamante III',tier:'diamante',min:2700,max:2999},
  {id:'diamante2',name:'Diamante II', tier:'diamante',min:3000,max:3299},
  {id:'diamante1',name:'Diamante I',  tier:'diamante',min:3300,max:99999},
];

const getArenaFromCopas = c => ARENAS_CONFIG.find(a => c >= a.min && c <= a.max) || ARENAS_CONFIG[0];
function getArenaGroup(arena) {
  if (!arena) return 'bronce';
  const a = arena.toLowerCase();
  if (a.includes('diamante')) return 'diamante';
  if (a.includes('oro'))      return 'oro';
  if (a.includes('plata'))    return 'plata';
  return 'bronce';
}
function calcOVR(skills) {
  const vals = SKILL_ABBR.map(s => Math.round((skills?.[s.key] || 0) * 10));
  return Math.max(50, Math.round(vals.reduce((a,b)=>a+b,0)/vals.length));
}

const DEFAULT_AVATAR_CONFIG = {
  top:'shortFlat', hairColor:'2c1b18', accessories:'blank',
  facialHair:'blank', facialHairColor:'2c1b18', clothe:'hoodie',
  clotheColor:'262e33', skin:'edb98a', eyes:'default', eyebrow:'default', mouth:'default',
};
function buildAvatarUrl(config, size) {
  var cfg = size || 120;
  var c = Object.assign({}, DEFAULT_AVATAR_CONFIG, config || {});
  var seed = c.top+'-'+c.hairColor+'-'+c.clothe+'-'+c.clotheColor+'-'+c.skin+'-'+c.eyes+'-'+c.eyebrow+'-'+c.mouth+'-'+c.accessories+'-'+c.facialHair+'-'+c.facialHairColor;
  return 'https://api.dicebear.com/9.x/avataaars/svg?seed='+encodeURIComponent(seed)+'&backgroundColor=dbeafe&size='+cfg;
}

function AvatarCircle(props) {
  var name = props.name || '';
  var avatarConfig = props.avatarConfig || null;
  var size = props.size || 72;
  var foto = props.foto || '';
  var color = props.color || ACC;
  var loaded = useState(false);
  var setLoaded = loaded[1];
  loaded = loaded[0];
  var key = avatarConfig ? JSON.stringify(avatarConfig) : '';
  if (foto) return React.createElement('div', {style:{width:size,height:size,borderRadius:'50%',overflow:'hidden',border:'3px solid #fff',boxShadow:'0 0 0 2px #e2e8f0'}},
    React.createElement('img', {src:foto,alt:name,style:{width:'100%',height:'100%',objectFit:'cover'}})
  );
  if (avatarConfig) return React.createElement('div', {style:{width:size,height:size,borderRadius:'50%',overflow:'hidden',border:'3px solid #fff',boxShadow:'0 0 0 2px #e2e8f0',background:'#dbeafe',position:'relative'}},
    !loaded && React.createElement('div', {style:{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#dbeafe'}},
      React.createElement('div', {style:{width:size*.28,height:size*.28,border:'2px solid '+color+'30',borderTop:'2px solid '+color,borderRadius:'50%',animation:'spin .8s linear infinite'}})
    ),
    React.createElement('img', {key:key,src:buildAvatarUrl(avatarConfig,size*2),alt:name,width:size,height:size,onLoad:function(){setLoaded(true);},onError:function(){setLoaded(true);},style:{width:'100%',height:'100%',objectFit:'cover',opacity:loaded?1:0,transition:'opacity .3s'}})
  );
  var initials = name.trim().split(' ').map(function(w){return w[0]?w[0].toUpperCase():'';}).slice(0,2).join('');
  return React.createElement('div', {style:{width:size,height:size,borderRadius:'50%',background:'linear-gradient(135deg,'+color+','+color+'cc)',display:'flex',alignItems:'center',justifyContent:'center',border:'3px solid #fff',boxShadow:'0 0 0 2px #e2e8f0'}},
    React.createElement('span', {style:{fontSize:size*.34,fontWeight:700,color:'#fff'}}, initials||'?')
  );
}

const calcStreak = function(hist) {
  if (!hist.length) return 0;
  var dates = Array.from(new Set(hist.map(function(s){return new Date(s.inicio*1000).toISOString().split('T')[0];}))).sort().reverse();
  var streak = 0, cur = new Date();
  for (var i=0; i<dates.length; i++) {
    var diff = Math.floor((cur - new Date(dates[i]))/86400000);
    if (diff<=1) { streak++; cur=new Date(dates[i]); } else break;
  }
  return streak;
};

function ActivityHeatmap(props) {
  var historial = props.historial;
  var days=90, today=new Date();
  var cells=Array.from({length:days},function(_,i){var d=new Date(today);d.setDate(today.getDate()-(days-1-i));var ds=d.toISOString().split('T')[0];return{date:d,count:historial.filter(function(s){return new Date(s.inicio*1000).toISOString().split('T')[0]===ds;}).length};});
  var weeks=[]; for(var i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));
  var gc=function(c){return c===0?'#e2e8f0':c===1?'#bfdbfe':c===2?'#60a5fa':'#0a66c2';};
  return React.createElement('div',{style:{display:'flex',gap:'3px'}},
    weeks.map(function(wk,wi){
      return React.createElement('div',{key:wi,style:{display:'flex',flexDirection:'column',gap:'3px'}},
        wk.map(function(d,di){
          return React.createElement('div',{key:di,title:d.date.toLocaleDateString('es-ES')+' '+d.count,style:{width:'10px',height:'10px',borderRadius:'2px',backgroundColor:gc(d.count),cursor:'default'},
            onMouseEnter:function(e){e.target.style.transform='scale(1.4)';},
            onMouseLeave:function(e){e.target.style.transform='scale(1)';}
          });
        })
      );
    })
  );
}

function Icon(props) {
  var name = props.name;
  var size = props.size || 15;
  var color = props.color || 'currentColor';
  var icons = {
    bolt: 'M13 2 3 14 12 14 11 22 21 10 12 10z',
    flask: 'M6 18h8M3 22h18M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2z',
    cup: 'M18 2H6v7a6 6 0 0 0 12 0V2Z',
    award: 'M12 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12z',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
    chart: 'M18 20V10M12 20V4M6 20v-6',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    target: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    trend: 'M23 6 13.5 15.5 8.5 10.5 1 18',
    fire: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    arrowRight: 'M5 12h14m-7-7 7 7-7 7',
    check: 'M20 6 9 17 4 12',
    brain: 'M9.5 2A2.5 2.5 0 0 1 12 4.5v15',
    planet: 'M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z',
  };
  return React.createElement('span', {style:{display:'inline-flex',alignItems:'center',justifyContent:'center',color:color,width:size,height:size,flexShrink:0}},
    React.createElement('svg', {width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:color,strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},
      React.createElement('path', {d: icons[name] || icons.target})
    )
  );
}

function ComingSoon(props) {
  var title=props.title, desc=props.desc, icon=props.icon, color=props.color||ACC;
  return React.createElement('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',textAlign:'center',background:'#f8fafc',borderRadius:10,border:'1px dashed #e2e8f0',minHeight:200}},
    React.createElement('div',{style:{width:44,height:44,borderRadius:10,background:color+'12',border:'1px solid '+color+'20',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}, React.createElement(Icon,{name:icon,size:20,color:color})),
    React.createElement('span',{style:{fontSize:11,fontWeight:600,color:color,letterSpacing:'1px',marginBottom:8}},'PROXIMAMENTE'),
    React.createElement('h3',{style:{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:5}},title),
    React.createElement('p',{style:{fontSize:12,color:'#64748b',lineHeight:1.6,maxWidth:300}},desc)
  );
}

export default function DashboardAnalista() {
  const {user, token, logout} = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(user);
  const [historial, setHistorial] = useState([]);
  const [empleoTab, setEmpleoTab] = useState('ofertas');
  const [ranking, setRanking] = useState([]);
  const [carruselIdx, setCarruselIdx] = useState(0);

  useEffect(() => { fetchUser(); }, []);

  const fetchUser = async () => {
    try {
      const r = await axios.get(API+'/api/me', {headers:{Authorization:'Bearer '+token}});
      setUserData(r.data);
      try { const h = await axios.get(API+'/api/sesiones/historial', {headers:{Authorization:'Bearer '+token}}); setHistorial(h.data||[]); } catch(e) {}
      try { const rk = await axios.get(API+'/api/ranking', {headers:{Authorization:'Bearer '+token}}); setRanking((rk.data?.jugadores||[]).slice(0,3)); } catch(e) {}
    } catch(err) {
      if (err?.response?.status === 401) { logout(); navigate('/login'); }
      else if (user) { setUserData(user); }
    }
  };

  const copas    = userData?.copas || 0;
  const xp       = userData?.xp || 0;
  const tier     = userData?.tier || 1;
  const sesiones = userData?.sesiones_completadas || 0;
  const skills   = userData?.skills || {};
  const arena    = userData?.arena || 'Bronce 3';
  const arenaObj = getArenaFromCopas(copas);
  const group    = getArenaGroup(arena);
  const ac       = ARENA_COLORS[group];
  const streak   = calcStreak(historial);
  const ovr      = calcOVR(skills);
  const XP_MAX   = [0,500,1500,3000,5000,8000,12000,18000,99999];
  const xpMin    = XP_MAX[tier-1]||0;
  const xpMax    = XP_MAX[tier]||99999;
  const pctXP    = Math.min(((xp-xpMin)/(xpMax-xpMin))*100, 100);
  const tierColor = TIER_CLR[tier] || '#64748b';
  const skillVals = SKILL_ABBR.map(s => ({...s, val: Math.max(0, Math.round((skills?.[s.key]||0)*10))}));
  const topSkills = [...skillVals].sort((a,b) => b.val-a.val).slice(0,6);
  const weakSkills = [...skillVals].sort((a,b) => a.val-b.val).slice(0,1);
  const siguienteArena = ARENAS_CONFIG[ARENAS_CONFIG.findIndex(a => a.id===arenaObj.id)+1];
  const avatarConfig = userData?.avatar_config || null;
  const foto = userData?.foto_perfil || '';

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fu{animation:fadeUp .3s ease forwards;}
    .s1{animation:fadeUp .3s ease .08s both;}
    .s2{animation:fadeUp .3s ease .16s both;}
    .s3{animation:fadeUp .3s ease .24s both;}
    .nb:hover{background:#f3f4f6!important;}
    .pb:hover{opacity:.88;}
    .qb:hover{background:#eff6ff!important;border-color:#bfdbfe!important;}
    .hr:hover{background:#f8fafc!important;}
  `;

  if (!userData) return (
    <div style={{minHeight:'100vh',background:'#f3f2ef',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:36,height:36,border:'3px solid #e2e8f0',borderTop:'3px solid '+ACC,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#f3f2ef',fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",color:'#0f172a'}}>
      <style>{css}</style>

      {/* NAVBAR */}
      <nav style={{position:'sticky',top:0,zIndex:50,height:52,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',background:'#fff',borderBottom:'1px solid #e2e8f0',boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={()=>navigate('/')}>
          <img src="/logosoc.png" alt="SocBlast" style={{height:26}}/>
          <span style={{fontSize:16,fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
        </div>
        <div style={{display:'flex',gap:0,alignItems:'center'}}>
          {[{label:'Training',icon:'book',path:'/training'},{label:'Ranking',icon:'chart',path:'/ranking'},{label:'Certificado',icon:'award',path:'/certificado'},{label:'Perfil',icon:'user',path:'/perfil'},{label:'Empleo',icon:'users',path:'#empleo'}].map((item,i) => (
            <button key={i} className="nb" onClick={()=>item.path==='#empleo'?document.getElementById('empleo-section')?.scrollIntoView({behavior:'smooth'}):navigate(item.path)}
              style={{padding:'6px 14px',borderRadius:6,background:'none',border:'none',color:'#374151',fontSize:12,fontWeight:500,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <Icon name={item.icon} size={18} color="#374151"/>
              <span style={{fontSize:10}}>{item.label}</span>
            </button>
          ))}
          <div style={{width:1,height:28,background:'#e2e8f0',margin:'0 4px'}}/>
          <button className="nb" onClick={()=>navigate('/sesion')} style={{padding:'6px 14px',borderRadius:6,background:'none',border:'none',color:ACC,fontSize:12,fontWeight:600,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <Icon name="bolt" size={18} color={ACC}/>
            <span style={{fontSize:10}}>Sesiones</span>
          </button>
          <button className="nb" onClick={()=>navigate('/lab')} style={{padding:'6px 14px',borderRadius:6,background:'none',border:'none',color:'#059669',fontSize:12,fontWeight:600,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <Icon name="flask" size={18} color="#059669"/>
            <span style={{fontSize:10,color:'#059669'}}>Labs</span>
          </button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div onClick={()=>navigate('/arenas')} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 10px',borderRadius:8,background:'#f8fafc',border:'1px solid #e2e8f0',cursor:'pointer'}}>
            <span style={{fontSize:11,fontWeight:700,color:ac.main}}>{arenaObj.name}</span>
            {streak>0 && <><div style={{width:1,height:12,background:'#e2e8f0'}}/><span style={{fontSize:11,fontWeight:700,color:'#d97706'}}>{streak}</span></>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={()=>navigate('/perfil')}>
            <AvatarCircle name={user?.nombre} avatarConfig={avatarConfig} size={32} foto={foto} color={ACC}/>
            <div style={{display:'flex',flexDirection:'column'}}>
              <span style={{fontSize:12,fontWeight:600,color:'#0f172a',lineHeight:1.2}}>{user?.nombre}</span>
              <span style={{fontSize:10,color:'#64748b'}}>{TIERS[tier]}</span>
            </div>
          </div>
          <button onClick={()=>{logout();navigate('/');}} style={{background:'none',border:'1px solid #e2e8f0',color:'#94a3b8',padding:'5px 10px',borderRadius:6,fontSize:11,cursor:'pointer'}}>Salir</button>
        </div>
      </nav>

      <div style={{maxWidth:1080,margin:'0 auto',padding:'20px 16px 60px',display:'grid',gridTemplateColumns:'300px 1fr',gap:16,alignItems:'start'}}>

        {/* COLUMNA IZQUIERDA */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>

          {/* Profile Card */}
          <div className="fu" style={{borderRadius:12,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 3px rgba(0,0,0,0.07)',overflow:'hidden'}}>
            {/* Banner */}
            <div style={{height:88,background:'linear-gradient(135deg,#0a66c2,#0284c7)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',inset:0,opacity:.07,backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)',backgroundSize:'30px 30px'}}/>
              <div style={{position:'absolute',top:10,right:12,display:'flex',alignItems:'center',gap:5,padding:'3px 9px',borderRadius:100,background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)'}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:'#4ade80',animation:'pulse 2s infinite'}}/>
                <span style={{fontSize:10,color:'#fff',fontWeight:600}}>Verified</span>
              </div>
            </div>
            <div style={{padding:'0 20px 20px'}}>
              {/* Avatar */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:-36,marginBottom:14}}>
                <div style={{position:'relative'}}>
                  <AvatarCircle name={user?.nombre} avatarConfig={avatarConfig} size={80} foto={foto} color={ACC}/>
                  <div style={{position:'absolute',bottom:-2,right:-2,width:24,height:24,borderRadius:'50%',background:ac.main,border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontSize:9,fontWeight:800,color:'#fff'}}>{ovr}</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:6,paddingBottom:2}}>
                  <button className="pb" onClick={()=>navigate('/analyst-card')} style={{padding:'6px 14px',borderRadius:100,background:ACC,border:'none',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>Card</button>
                  <button className="pb" onClick={()=>navigate('/perfil')} style={{padding:'6px 14px',borderRadius:100,background:'#fff',border:'1px solid '+ACC,color:ACC,fontSize:12,fontWeight:600,cursor:'pointer'}}>Editar</button>
                </div>
              </div>
              {/* Info */}
              <h2 style={{fontSize:18,fontWeight:700,color:'#0f172a',marginBottom:2,letterSpacing:'-0.3px'}}>{user?.nombre}</h2>
              <p style={{fontSize:13,color:'#374151',marginBottom:8}}>
                <span style={{fontWeight:600,color:tierColor}}>{TIERS[tier]}</span>
                <span style={{color:'#cbd5e1',margin:'0 6px'}}>·</span>
                <span>Cybersecurity Analyst</span>
              </p>
              <div style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:100,background:ac.light,border:'1px solid '+ac.border,marginBottom:16}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:ac.main}}/>
                <span style={{fontSize:11,fontWeight:600,color:ac.main}}>{arena}</span>
              </div>
              {/* Stats */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
                {[
                  {val:ovr,                     label:'OVR',     color:ac.main},
                  {val:copas.toLocaleString(),  label:'Copas',   color:'#d97706'},
                  {val:sesiones,                label:'Sesiones',color:'#059669'},
                  {val:xp.toLocaleString(),     label:'XP',      color:tierColor},
                ].map((s,i) => (
                  <div key={i} style={{padding:'10px 12px',borderRadius:8,background:'#f8fafc',border:'1px solid #e8eaf0',textAlign:'center'}}>
                    <div style={{fontSize:20,fontWeight:700,color:s.color,lineHeight:1,letterSpacing:'-0.5px'}}>{s.val}</div>
                    <div style={{fontSize:10,fontWeight:600,color:'#64748b',marginTop:2}}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Top skills */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px',marginBottom:8}}>TOP SKILLS</div>
                {topSkills.slice(0,4).map((s,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <span style={{fontSize:9,fontWeight:700,color:'#94a3b8',width:22,flexShrink:0}}>{s.abbr}</span>
                    <div style={{flex:1,height:4,borderRadius:2,background:'#e2e8f0',overflow:'hidden'}}>
                      <div style={{width:Math.min(s.val,100)+'%',height:'100%',borderRadius:2,background:s.val>=7?ACC:'#94a3b8',transition:'width 1s ease'}}/>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:s.val>=7?ACC:'#64748b',width:16,textAlign:'right',flexShrink:0}}>{s.val}</span>
                  </div>
                ))}
              </div>
              {/* XP bar */}
              <div style={{padding:'10px 12px',borderRadius:8,background:'#f8fafc',border:'1px solid #e8eaf0'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:11,fontWeight:600,color:tierColor}}>{TIERS[tier]}</span>
                  <span style={{fontSize:10,color:'#94a3b8'}}>{xp.toLocaleString()} XP</span>
                </div>
                <div style={{height:5,borderRadius:3,background:'#e2e8f0',overflow:'hidden'}}>
                  <div style={{width:pctXP+'%',height:'100%',borderRadius:3,background:tierColor,transition:'width 1.2s ease'}}/>
                </div>
                {tier<8 && <p style={{fontSize:10,color:'#94a3b8',marginTop:4}}>Faltan {(XP_MAX[tier]-xp).toLocaleString()} XP para {TIERS[tier+1]}</p>}
              </div>
            </div>
          </div>

          {/* Siguiente arena */}
          {siguienteArena && (
            <div className="s1" style={{padding:'14px 16px',borderRadius:10,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px',marginBottom:8}}>PROXIMO OBJETIVO</div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:12,fontWeight:600,color:'#374151'}}>{siguienteArena.name}</span>
                <span style={{fontSize:11,color:ac.main,fontWeight:700}}>{(siguienteArena.min-copas).toLocaleString()} copas</span>
              </div>
              <div style={{height:4,borderRadius:2,background:'#e2e8f0',overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:2,width:Math.min(((copas-arenaObj.min)/300)*100,100)+'%',background:ac.main,transition:'width 1s ease'}}/>
              </div>
            </div>
          )}

          {/* Accesos rapidos */}
          <div className="s1" style={{padding:'16px',borderRadius:10,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px',marginBottom:10}}>ACCESOS RAPIDOS</div>
            {[
              {label:'Laboratorio SOC',desc:'SIEM · Forense',   path:'/lab',         color:'#059669',icon:'flask'},
              {label:'Training SOC',   desc:'Modulos · Cursos', path:'/training',    color:'#7c3aed',icon:'book'},
              {label:'Ranking Global', desc:'Tu posicion',      path:'/ranking',     color:'#d97706',icon:'chart'},
              {label:'Mi Certificado', desc:'QR verificable',   path:'/certificado', color:'#059669',icon:'award'},
            ].map((item,i) => (
              <div key={i} className="qb" onClick={()=>navigate(item.path)} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:7,cursor:'pointer',marginBottom:4,border:'1px solid transparent'}}>
                <div style={{width:26,height:26,borderRadius:6,background:item.color+'12',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon name={item.icon} size={13} color={item.color}/>
                </div>
                <div style={{flex:1}}>
                  <span style={{fontSize:12,color:'#374151',fontWeight:600}}>{item.label}</span>
                  <span style={{fontSize:10,color:'#94a3b8',marginLeft:4}}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>

          {/* CTAs */}
          <div className="s1" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <button className="pb" onClick={()=>navigate('/sesion')} style={{padding:'13px',borderRadius:10,background:'linear-gradient(135deg,#0a66c2,#0284c7)',border:'none',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 2px 8px rgba(10,102,194,0.25)'}}>
              <Icon name="bolt" size={15} color="#fff"/> Jugar sesion
            </button>
            <button className="pb" onClick={()=>navigate('/lab')} style={{padding:'13px',borderRadius:10,background:'linear-gradient(135deg,#047857,#059669)',border:'none',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 2px 8px rgba(5,150,105,0.25)'}}>
              <Icon name="flask" size={15} color="#fff"/> Entrar al lab
            </button>
          </div>

          {/* Modos */}
          <div className="s1" style={{borderRadius:12,overflow:'hidden',background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{display:'flex',borderBottom:'1px solid #e2e8f0'}}>
              {[{i:0,l:'Sesiones competitivas',c:'#0a66c2'},{i:1,l:'Laboratorio SOC',c:'#059669'}].map(t => (
                <button key={t.i} onClick={()=>setCarruselIdx(t.i)} style={{flex:1,padding:'11px',background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:600,color:carruselIdx===t.i?t.c:'#94a3b8',borderBottom:carruselIdx===t.i?'2px solid '+t.c:'2px solid transparent'}}>
                  {t.l}
                </button>
              ))}
            </div>
            {carruselIdx===0 ? (
              <div style={{padding:'20px 24px',background:'linear-gradient(135deg,#1e3a8a,#1d4ed8)',display:'grid',gridTemplateColumns:'1fr auto',gap:20,alignItems:'center'}}>
                <div>
                  <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 10px',borderRadius:100,background:'rgba(255,255,255,0.1)',marginBottom:10}}>
                    <div style={{width:5,height:5,borderRadius:'50%',background:'#93c5fd',animation:'pulse 2s infinite'}}/>
                    <span style={{fontSize:10,color:'#93c5fd',fontWeight:700,letterSpacing:'2px'}}>COMPETITIVO</span>
                  </div>
                  <h3 style={{fontSize:17,fontWeight:800,color:'#fff',marginBottom:7,lineHeight:1.25}}>Demuestra tu nivel.<br/><span style={{color:'#93c5fd'}}>Gana copas.</span></h3>
                  <p style={{fontSize:12,color:'rgba(255,255,255,0.55)',lineHeight:1.65,marginBottom:12}}>La IA genera escenarios unicos. Tu OVR sube con cada buena sesion.</p>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:12}}>
                    {['Timer activo','Copas y arenas','Skills evaluadas','Ranking'].map((f,i) => (
                      <span key={i} style={{fontSize:10,padding:'3px 8px',borderRadius:5,background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.8)'}}>{f}</span>
                    ))}
                  </div>
                  <button className="pb" onClick={()=>navigate('/sesion')} style={{padding:'8px 20px',borderRadius:100,background:'#fff',border:'none',color:'#1d4ed8',fontSize:12,fontWeight:700,cursor:'pointer'}}>Jugar ahora</button>
                </div>
                <svg width="110" height="110" viewBox="0 0 170 170" fill="none">
                  <rect x="15" y="25" width="140" height="88" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(147,197,253,0.2)" strokeWidth="1"/>
                  <rect x="25" y="38" width="120" height="8" rx="4" fill="rgba(239,68,68,0.5)"/>
                  <rect x="25" y="51" width="85" height="6" rx="3" fill="rgba(249,115,22,0.4)"/>
                  <rect x="25" y="62" width="100" height="6" rx="3" fill="rgba(234,179,8,0.3)"/>
                  <circle cx="142" cy="40" r="18" fill="rgba(37,99,235,0.3)" stroke="rgba(147,197,253,0.4)" strokeWidth="1.5"/>
                  <text x="142" y="46" textAnchor="middle" fontFamily="system-ui" fontSize="11" fontWeight="700" fill="#93c5fd">SOC</text>
                </svg>
              </div>
            ) : (
              <div style={{padding:'20px 24px',background:'linear-gradient(135deg,#064e3b,#047857)',display:'grid',gridTemplateColumns:'1fr auto',gap:20,alignItems:'center'}}>
                <div>
                  <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 10px',borderRadius:100,background:'rgba(255,255,255,0.1)',marginBottom:10}}>
                    <div style={{width:5,height:5,borderRadius:'50%',background:'#6ee7b7',animation:'pulse 2s infinite'}}/>
                    <span style={{fontSize:10,color:'#6ee7b7',fontWeight:700,letterSpacing:'2px'}}>LAB BETA</span>
                  </div>
                  <h3 style={{fontSize:17,fontWeight:800,color:'#fff',marginBottom:7,lineHeight:1.25}}>Investiga sin limite.<br/><span style={{color:'#6ee7b7'}}>Profundidad real.</span></h3>
                  <p style={{fontSize:12,color:'rgba(255,255,255,0.55)',lineHeight:1.65,marginBottom:12}}>SIEM, Log Explorer, Network Map y evaluacion IA.</p>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:12}}>
                    {['SIEM queries','Log Explorer','Network Map','IA evalua'].map((f,i) => (
                      <span key={i} style={{fontSize:10,padding:'3px 8px',borderRadius:5,background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.8)'}}>{f}</span>
                    ))}
                  </div>
                  <button className="pb" onClick={()=>navigate('/lab')} style={{padding:'8px 20px',borderRadius:100,background:'#fff',border:'none',color:'#047857',fontSize:12,fontWeight:700,cursor:'pointer'}}>Entrar al Lab</button>
                </div>
                <svg width="110" height="110" viewBox="0 0 170 170" fill="none">
                  <rect x="10" y="20" width="150" height="105" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(110,231,183,0.15)" strokeWidth="1"/>
                  <rect x="10" y="20" width="150" height="18" rx="8" fill="rgba(255,255,255,0.06)"/>
                  <circle cx="22" cy="29" r="4" fill="#FF5F57"/>
                  <circle cx="34" cy="29" r="4" fill="#FEBC2E"/>
                  <circle cx="46" cy="29" r="4" fill="#28C840"/>
                  <text x="20" y="54" fontFamily="monospace" fontSize="8" fill="#6ee7b7">$ grep mimikatz sysmon.log</text>
                  <text x="20" y="66" fontFamily="monospace" fontSize="8" fill="#f87171">mimikatz.exe PID:1337</text>
                  <text x="20" y="78" fontFamily="monospace" fontSize="8" fill="#58a6ff">$ _</text>
                </svg>
              </div>
            )}
          </div>

          {/* Actividad + Ranking */}
          <div className="s2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div style={{padding:'16px',borderRadius:10,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
              <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px',marginBottom:12}}>ACTIVIDAD 90 DIAS</div>
              <div style={{overflowX:'auto',marginBottom:10}}><ActivityHeatmap historial={historial}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                {[{value:sesiones,label:'sesiones',color:ACC},{value:streak,label:'racha',color:'#d97706'},{value:historial.filter(s=>s.resultado?.copas_ganadas>0).length,label:'victorias',color:'#059669'}].map((s,i) => (
                  <div key={i} style={{textAlign:'center',padding:'8px',borderRadius:7,background:'#f8fafc',border:'1px solid #f1f5f9'}}>
                    <div style={{fontSize:17,fontWeight:700,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:10,color:'#94a3b8',marginTop:1}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:'16px',borderRadius:10,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <span style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px'}}>TOP RANKING</span>
                <button onClick={()=>navigate('/ranking')} style={{fontSize:11,color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Ver todo</button>
              </div>
              {ranking.length===0 ? <p style={{fontSize:12,color:'#94a3b8',textAlign:'center',padding:'8px 0'}}>Cargando...</p> : ranking.map((j,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:i<ranking.length-1?'1px solid #f8fafc':'none'}}>
                  <span style={{fontSize:13,width:18}}>{i===0?'🥇':i===1?'🥈':'🥉'}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.nombre}</div>
                    <div style={{fontSize:10,color:'#94a3b8'}}>{j.arena}</div>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:'#d97706'}}>{j.copas?.toLocaleString()}</span>
                </div>
              ))}
              <div style={{marginTop:10,padding:'10px',borderRadius:8,background:'#fef2f2',border:'1px solid #fecaca'}}>
                <div style={{fontSize:10,color:'#ef4444',fontWeight:700,marginBottom:4}}>SKILL A MEJORAR</div>
                <div style={{fontSize:12,color:'#7f1d1d',fontWeight:600,marginBottom:6}}>{weakSkills[0]?.label}</div>
                <button onClick={()=>navigate('/sesion')} style={{width:'100%',padding:'6px',borderRadius:6,background:'#ef4444',border:'none',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>Entrenar</button>
              </div>
            </div>
          </div>

          {/* Historial */}
          <div className="s2" style={{padding:'16px 18px',borderRadius:10,background:'#fff',border:'1px solid #e2e8f0',boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <span style={{fontSize:10,fontWeight:700,color:'#94a3b8',letterSpacing:'1.5px'}}>ULTIMAS SESIONES</span>
              <button onClick={()=>navigate('/sesion')} style={{fontSize:11,color:ACC,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Nueva</button>
            </div>
            {historial.length===0 ? (
              <div style={{textAlign:'center',padding:'14px 0'}}>
                <p style={{fontSize:12,color:'#94a3b8',marginBottom:8}}>Sin sesiones aun. Empieza a construir tu perfil.</p>
                <button onClick={()=>navigate('/sesion')} style={{padding:'7px 18px',borderRadius:100,background:ACC,border:'none',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>Empezar ahora</button>
              </div>
            ) : historial.slice(0,5).map((s,i) => {
              const res=s.resultado, copasGan=res?.copas_ganadas||0, media=res?.media_puntuacion||0, pos=copasGan>=0;
              return (
                <div key={i} className="hr" style={{display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:7,background:'#f8fafc',border:'1px solid #f1f5f9',marginBottom:5}}>
                  <div style={{width:26,height:26,borderRadius:6,background:pos?'#ecfdf5':'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon name="trend" size={11} color={pos?'#059669':'#ef4444'}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:11,color:'#0f172a',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.titulo||'Sesion SOC'}</p>
                    <p style={{fontSize:10,color:'#94a3b8'}}>{media}/20 pts</p>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:pos?'#059669':'#ef4444'}}>{pos?'+':''}{copasGan}</span>
                </div>
              );
            })}
          </div>

          {/* Empleo */}
          <div id="empleo-section" className="s3" style={{borderRadius:12,overflow:'hidden',border:'1px solid #e2e8f0',boxShadow:'0 1px 3px rgba(0,0,0,0.04)'}}>
            <div style={{padding:'20px 24px',background:'linear-gradient(135deg,#0f172a,#1e1b4b)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',borderRadius:'50%',background:'radial-gradient(circle,rgba(10,102,194,0.2),transparent)',pointerEvents:'none'}}/>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{fontSize:10,color:'#818cf8',letterSpacing:'2px',fontWeight:700,marginBottom:6}}>SOCBLAST CAREERS</div>
                <h3 style={{fontSize:16,fontWeight:800,color:'#fff',marginBottom:5,lineHeight:1.25}}>Tu Analyst Card es tu CV.<br/><span style={{color:'#818cf8'}}>Las empresas ya pueden verte.</span></h3>
                <p style={{fontSize:11,color:'rgba(255,255,255,0.45)',lineHeight:1.6,marginBottom:12}}>OVR, skills verificadas y arena — todo en un perfil publico compartible.</p>
                <div style={{display:'flex',gap:4}}>
                  {[{id:'ofertas',l:'Ofertas'},{id:'certs',l:'Certs'},{id:'bootcamps',l:'Bootcamps'},{id:'retos',l:'Retos'}].map(tab => (
                    <button key={tab.id} onClick={()=>setEmpleoTab(tab.id)} style={{padding:'4px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,background:empleoTab===tab.id?'rgba(129,140,248,0.25)':'rgba(255,255,255,0.05)',color:empleoTab===tab.id?'#c7d2fe':'rgba(255,255,255,0.4)',borderBottom:empleoTab===tab.id?'2px solid #818cf8':'2px solid transparent'}}>
                      {tab.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{background:'#fff',padding:'18px'}}>
              {empleoTab==='ofertas'    && <ComingSoon title="Ofertas de empleo SOC"        desc="Empresas buscaran analistas por su perfil verificado."   icon="users" color="#0a66c2"/>}
              {empleoTab==='certs'      && <ComingSoon title="Certificaciones recomendadas" desc="Recomendaciones segun tu perfil actual."                 icon="award" color="#7c3aed"/>}
              {empleoTab==='bootcamps'  && <ComingSoon title="Bootcamps y cursos SOC"       desc="Curados por relevancia para tu nivel y arena."           icon="book"  color="#0891b2"/>}
              {empleoTab==='retos'      && <ComingSoon title="Retos y plataformas externas" desc="TryHackMe, Blue Team Labs, CyberDefenders integrados."   icon="shield" color="#059669"/>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}