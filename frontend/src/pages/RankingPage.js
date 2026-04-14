import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';
const ACC = '#4f46e5';
const LS_AVATAR = 'socblast_avatar';

const TIERS = ['SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const ARENAS_COLORS = {
  'Bronce I':'#d97706','Bronce II':'#f59e0b','Bronce III':'#fbbf24',
  'Plata I':'#64748b','Plata II':'#94a3b8','Plata III':'#cbd5e1',
  'Oro I':'#d97706','Oro II':'#f59e0b','Oro III':'#fbbf24',
  'Diamante I':'#1e40af','Diamante II':'#2563eb','Diamante III':'#3b82f6',
};
const getArenaColor = a => ARENAS_COLORS[a] || '#4f46e5';

const GRADIENTS = [
  ['#4f46e5','#818cf8'],
  ['#059669','#34d399'],
  ['#0891b2','#22d3ee'],
  ['#7c3aed','#a78bfa'],
  ['#dc2626','#f87171'],
  ['#d97706','#fbbf24'],
  ['#db2777','#f472b6'],
  ['#0369a1','#38bdf8'],
  ['#65a30d','#a3e635'],
  ['#9333ea','#c084fc'],
];

const defaultAvatar = { gradientIdx: null, borderStyle: 'solid', iconOverlay: 'none' };

const ICON_OVERLAYS = [
  {id:'none',   symbol:''},
  {id:'shield', symbol:'⬡'},
  {id:'star',   symbol:'★'},
  {id:'bolt',   symbol:'⚡'},
  {id:'crown',  symbol:'♛'},
  {id:'skull',  symbol:'☠'},
  {id:'dragon', symbol:'◈'},
  {id:'legend', symbol:'∞'},
];

function getInitials(name = '') {
  return name.trim().split(' ').map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('');
}

function getGradientFromName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % GRADIENTS.length;
}

const Avatar = ({ name = '', avatar = {}, size = 36 }) => {
  const av      = { ...defaultAvatar, ...avatar };
  const gradIdx = av.gradientIdx ?? getGradientFromName(name);
  const [from, to] = GRADIENTS[gradIdx] || GRADIENTS[0];
  const initials   = getInitials(name);
  const fontSize   = size * 0.34;
  const overlay    = ICON_OVERLAYS.find(i => i.id === av.iconOverlay);

  const borderStyles = {
    none:   {},
    solid:  { border: `${Math.max(2, size * 0.035)}px solid ${from}60` },
    glow:   { border: `${Math.max(2, size * 0.035)}px solid ${from}80`, boxShadow: `0 0 ${size * 0.15}px ${from}50` },
    double: { border: `${Math.max(2, size * 0.035)}px solid ${from}60`, outline: `${Math.max(1, size * 0.02)}px solid ${from}25`, outlineOffset: `${Math.max(2, size * 0.03)}px` },
  };

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg,${from},${to})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
      ...borderStyles[av.borderStyle || 'none'],
    }}>
      <span style={{
        fontSize, fontWeight: 800, color: '#fff',
        letterSpacing: '-0.5px', lineHeight: 1,
        fontFamily: "'Inter',-apple-system,sans-serif",
        textShadow: '0 1px 3px rgba(0,0,0,0.2)',
        userSelect: 'none',
      }}>
        {initials || '?'}
      </span>
      {overlay?.symbol && (
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: size * 0.32, height: size * 0.32, borderRadius: '50%',
          backgroundColor: '#fff', border: `1.5px solid ${from}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.16, lineHeight: 1,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}>
          {overlay.symbol}
        </div>
      )}
    </div>
  );
};

export default function RankingPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [jugadores,  setJugadores]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filtro,     setFiltro]     = useState('Todos');
  const [miPosicion, setMiPosicion] = useState(null);
  const [myAvatar,   setMyAvatar]   = useState(defaultAvatar);

  useEffect(() => {
    fetchRanking();
    try {
      const s = localStorage.getItem(LS_AVATAR);
      if (s) setMyAvatar({ ...defaultAvatar, ...JSON.parse(s) });
    } catch {}
  }, []);

  const fetchRanking = async () => {
    try {
      const r = await axios.get(`${API}/api/ranking`, { headers: { Authorization: `Bearer ${token}` } });
      setJugadores(r.data.jugadores);
      setMiPosicion(r.data.mi_posicion);
    } catch {}
    setLoading(false);
  };

  const filtros   = ['Todos','Bronce','Plata','Oro','Diamante'];
  const filtrados = filtro === 'Todos' ? jugadores : jugadores.filter(j => j.arena?.includes(filtro));

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
    .fade-up{animation:fadeUp .3s ease forwards;}
    .row:hover{background:#f0f4ff!important;border-color:#c7d2fe!important;transform:translateX(3px);}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    .filter-btn:hover{border-color:#a5b4fc!important;}
    *{transition:transform .15s ease,border-color .15s ease,background .15s ease,color .15s ease;}
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',fontFamily:"'Inter',-apple-system,sans-serif",color:'#0f172a'}}>

        {/* NAVBAR */}
        <nav style={{position:'sticky',top:0,zIndex:50,height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',backgroundColor:'rgba(255,255,255,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 12px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:'28px'}}/>
            <span style={{fontSize:'15px',fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',gap:'2px'}}>
            {[
              {label:'← Dashboard',path:'/dashboard'},
              {label:'Training',    path:'/training'},
              {label:'Perfil',      path:'/perfil'},
              {label:'Certificado', path:'/certificado'},
            ].map((item,i)=>(
              <button key={i} className="nav-btn" onClick={()=>navigate(item.path)}
                style={{padding:'5px 14px',borderRadius:'7px',background:'none',border:'none',color:'#64748b',fontSize:'13px',cursor:'pointer'}}>
                {item.label}
              </button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            {miPosicion && <Avatar name={miPosicion.nombre} avatar={myAvatar} size={32}/>}
            <span style={{fontSize:'12px',color:'#94a3b8'}}>{jugadores.length} analistas</span>
          </div>
        </nav>

        <div style={{maxWidth:'860px',margin:'0 auto',padding:'32px 40px 60px'}}>

          {/* Header */}
          <div style={{marginBottom:'28px'}}>
            <h1 style={{fontSize:'24px',fontWeight:800,color:'#0f172a',marginBottom:'4px',letterSpacing:'-0.5px'}}>Ranking Global</h1>
            <p style={{fontSize:'13px',color:'#94a3b8'}}>Clasificación por copas · Actualizado en tiempo real</p>
          </div>

          {/* Mi posición */}
          {miPosicion && (
            <div className="fade-up" style={{padding:'20px 24px',borderRadius:'16px',backgroundColor:'#fff',border:`2px solid ${ACC}20`,marginBottom:'20px',boxShadow:`0 4px 20px ${ACC}10`}}>
              <div style={{height:'3px',background:`linear-gradient(90deg,${ACC},#818cf8)`,borderRadius:'4px',marginBottom:'18px'}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                  <div style={{textAlign:'center',minWidth:'52px'}}>
                    <div style={{fontSize:'10px',color:ACC,fontWeight:700,letterSpacing:'1.5px',marginBottom:'4px'}}>TU POSICIÓN</div>
                    <span style={{fontSize:'32px',fontWeight:900,color:ACC,letterSpacing:'-1px'}}>#{miPosicion.posicion}</span>
                  </div>
                  <div style={{width:'1px',height:'40px',backgroundColor:'#e2e8f0'}}/>
                  <Avatar name={miPosicion.nombre} avatar={myAvatar} size={52}/>
                  <div>
                    <p style={{fontSize:'15px',color:'#0f172a',fontWeight:700,marginBottom:'3px'}}>{miPosicion.nombre}</p>
                    <p style={{fontSize:'12px',color:'#94a3b8'}}>{TIERS[miPosicion.tier-1]} · {miPosicion.arena}</p>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{fontSize:'22px',fontWeight:900,color:getArenaColor(miPosicion.arena),marginBottom:'3px',letterSpacing:'-0.5px'}}>
                    {miPosicion.copas?.toLocaleString()}
                  </p>
                  <p style={{fontSize:'11px',color:'#94a3b8'}}>copas totales</p>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div style={{display:'flex',gap:'6px',marginBottom:'20px',flexWrap:'wrap'}}>
            {filtros.map(f => {
              const active = filtro === f;
              const color  = f === 'Todos' ? ACC : getArenaColor(`${f} I`);
              return (
                <button key={f} className="filter-btn" onClick={()=>setFiltro(f)}
                  style={{padding:'6px 16px',borderRadius:'8px',fontSize:'12px',fontWeight:600,cursor:'pointer',backgroundColor:active?`${color}10`:'#fff',color:active?color:'#64748b',border:active?`1.5px solid ${color}30`:'1px solid #e2e8f0',boxShadow:active?`0 2px 8px ${color}15`:'none'}}>
                  {f}
                </button>
              );
            })}
          </div>

          {/* Header tabla */}
          <div style={{display:'grid',gridTemplateColumns:'52px 44px 1fr 140px 110px',padding:'8px 16px',marginBottom:'6px',gap:'8px'}}>
            {['POS','','ANALISTA','ARENA','COPAS'].map((h,i)=>(
              <span key={i} style={{fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',textAlign:i>2?'right':'left'}}>{h}</span>
            ))}
          </div>

          {/* Lista */}
          {loading ? (
            <div style={{textAlign:'center',padding:'60px'}}>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <div style={{width:36,height:36,border:'3px solid #e2e8f0',borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto'}}/>
            </div>
          ) : filtrados.length===0 ? (
            <div style={{textAlign:'center',padding:'60px',color:'#94a3b8',fontSize:'13px'}}>
              No hay analistas con estos filtros todavía.
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
              {filtrados.map((j,i)=>{
                const color    = getArenaColor(j.arena);
                const esTop3   = i < 3;
                const posColors= ['#f59e0b','#94a3b8','#d97706'];
                const esMio    = j.nombre === miPosicion?.nombre;
                // Avatar propio con customización, otros con gradiente basado en nombre
                const avatarData = esMio ? myAvatar : defaultAvatar;
                return (
                  <div key={i} className="row"
                    style={{display:'grid',gridTemplateColumns:'52px 44px 1fr 140px 110px',alignItems:'center',padding:'12px 16px',borderRadius:'12px',backgroundColor:esMio?`${ACC}06`:'#fff',border:esMio?`1.5px solid ${ACC}20`:'1px solid #e8eaf0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',position:'relative',overflow:'hidden',gap:'8px'}}>
                    {esMio && (
                      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',background:`linear-gradient(180deg,${ACC},#818cf8)`}}/>
                    )}
                    {/* Posición */}
                    <div>
                      {esTop3
                        ? <span style={{fontSize:'20px'}}>{['🥇','🥈','🥉'][i]}</span>
                        : <span style={{fontSize:'12px',color:'#94a3b8',fontWeight:700}}>#{i+1}</span>
                      }
                    </div>
                    {/* Avatar */}
                    <div>
                      <Avatar name={j.nombre} avatar={avatarData} size={34}/>
                    </div>
                    {/* Nombre */}
                    <div style={{minWidth:0}}>
                      <p style={{fontSize:'13px',color:esMio?ACC:'#0f172a',fontWeight:esMio?700:500,marginBottom:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {j.nombre}
                        {esMio && (
                          <span style={{fontSize:'9px',color:'#fff',marginLeft:'8px',padding:'2px 6px',borderRadius:'4px',backgroundColor:ACC,fontWeight:700}}>TÚ</span>
                        )}
                      </p>
                      <p style={{fontSize:'11px',color:'#94a3b8'}}>{TIERS[j.tier-1]}</p>
                    </div>
                    {/* Arena */}
                    <div style={{textAlign:'right'}}>
                      <span style={{fontSize:'11px',fontWeight:700,color,padding:'3px 8px',borderRadius:'6px',backgroundColor:`${color}10`,border:`1px solid ${color}20`}}>
                        {j.arena}
                      </span>
                    </div>
                    {/* Copas */}
                    <div style={{textAlign:'right'}}>
                      <span style={{fontSize:'15px',fontWeight:900,color:esTop3?posColors[i]:'#0f172a',letterSpacing:'-0.5px'}}>
                        {j.copas?.toLocaleString()}
                      </span>
                      <span style={{fontSize:'11px',color:'#94a3b8',marginLeft:'3px'}}>🏆</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
