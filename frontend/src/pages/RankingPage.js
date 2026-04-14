import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';

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

const defaultAv = { seed:'felix', bg:'b6e3f4', hairColor:'0e0e0e', skinColor:'fdbcb4' };

// Seeds para avatares genéricos de otros jugadores
const GENERIC_SEEDS = ['alpha','bravo','charlie','delta','echo','foxtrot','golf','hotel','india','juliet','kilo','lima'];

const MiniAvatar = ({ avatarData, size=36, seed=null }) => {
  const av = { ...defaultAv, ...(avatarData||{}) };
  if (seed) av.seed = seed;
  const svgStr = useMemo(() => {
    try {
      return createAvatar(adventurer, {
        seed:            av.seed,
        backgroundColor: [av.bg],
        hairColor:       [av.hairColor],
        skinColor:       [av.skinColor],
        radius:          50,
        size:            128,
      }).toString();
    } catch { return ''; }
  }, [av.seed, av.bg, av.hairColor, av.skinColor]);

  if (!svgStr) return (
    <div style={{width:size,height:size,borderRadius:'50%',backgroundColor:'#eef2ff',flexShrink:0}}/>
  );
  return (
    <div
      style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',flexShrink:0}}
      dangerouslySetInnerHTML={{__html:svgStr}}
    />
  );
};

export default function RankingPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [jugadores,  setJugadores]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filtro,     setFiltro]     = useState('Todos');
  const [miPosicion, setMiPosicion] = useState(null);
  const [myAvatar,   setMyAvatar]   = useState(defaultAv);

  useEffect(() => {
    fetchRanking();
    try {
      const s = localStorage.getItem(LS_AVATAR);
      if (s) setMyAvatar({ ...defaultAv, ...JSON.parse(s) });
    } catch {}
  }, []);

  const fetchRanking = async () => {
    try {
      const r = await axios.get(`${API}/api/ranking`, { headers:{ Authorization:`Bearer ${token}` } });
      setJugadores(r.data.jugadores);
      setMiPosicion(r.data.mi_posicion);
    } catch {}
    setLoading(false);
  };

  const filtros  = ['Todos','Bronce','Plata','Oro','Diamante'];
  const filtrados = filtro==='Todos' ? jugadores : jugadores.filter(j => j.arena?.includes(filtro));

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
              {label:'← Dashboard', path:'/dashboard'},
              {label:'Training',     path:'/training'},
              {label:'Perfil',       path:'/perfil'},
              {label:'Certificado',  path:'/certificado'},
            ].map((item,i)=>(
              <button key={i} className="nav-btn" onClick={()=>navigate(item.path)}
                style={{padding:'5px 14px',borderRadius:'7px',background:'none',border:'none',color:'#64748b',fontSize:'13px',cursor:'pointer'}}>
                {item.label}
              </button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <MiniAvatar avatarData={myAvatar} size={32}/>
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
            <div className="fade-up" style={{padding:'20px 24px',borderRadius:'16px',backgroundColor:'#fff',border:`2px solid ${ACC}20`,marginBottom:'20px',boxShadow:`0 4px 20px ${ACC}10`,position:'relative',overflow:'hidden'}}>
              <div style={{height:'3px',background:`linear-gradient(90deg,${ACC},#818cf8)`,borderRadius:'4px',marginBottom:'18px'}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                  <div style={{textAlign:'center',minWidth:'52px'}}>
                    <div style={{fontSize:'10px',color:ACC,fontWeight:700,letterSpacing:'1.5px',marginBottom:'4px'}}>TU POSICIÓN</div>
                    <span style={{fontSize:'32px',fontWeight:900,color:ACC,letterSpacing:'-1px'}}>#{miPosicion.posicion}</span>
                  </div>
                  <div style={{width:'1px',height:'40px',backgroundColor:'#e2e8f0'}}/>
                  <MiniAvatar avatarData={myAvatar} size={52}/>
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
              const active = filtro===f;
              const color  = f==='Todos' ? ACC : getArenaColor(`${f} I`);
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
                // El jugador propio usa su avatar real, los demás usan seed basada en su nombre
                const genericSeed = GENERIC_SEEDS[i % GENERIC_SEEDS.length];
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
                      {esMio
                        ? <MiniAvatar avatarData={myAvatar} size={34}/>
                        : <MiniAvatar seed={genericSeed} size={34}/>
                      }
                    </div>

                    {/* Nombre + tier */}
                    <div style={{minWidth:0}}>
                      <p style={{fontSize:'13px',color:esMio?ACC:'#0f172a',fontWeight:esMio?700:500,marginBottom:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {j.nombre}
                        {esMio && (
                          <span style={{fontSize:'9px',color:'#fff',marginLeft:'8px',padding:'2px 6px',borderRadius:'4px',backgroundColor:ACC,fontWeight:700}}>TÚ</span>
                        )}
                      </p>
                      <p style={{fontSize:'11px',color:'#94a3b8'}}>{TIERS[j.tier-1]}</p>
                    </div>

                    {/* Arena badge */}
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
