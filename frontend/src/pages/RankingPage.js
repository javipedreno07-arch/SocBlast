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

const BASES = [
  {id:'base1',emoji:'👤',color:'#4f46e5'},
  {id:'base2',emoji:'🧑‍💻',color:'#059669'},
  {id:'base3',emoji:'🕵️',color:'#0891b2'},
  {id:'base4',emoji:'💂',color:'#d97706'},
];
const ITEMS_MAP = {
  none:'', cap:'🧢', hood:'🪖', none2:'', badge:'🎖️', none3:'', matrix:'💻', fire:'🔥',
  crown:'👑', mask:'🎭', cyber:'🦾', skull:'💀', galaxy:'🌌', neon:'🏙️',
};

const MiniAvatar = ({avatarData, size=36}) => {
  const av = avatarData || {base:'base1',hat:'none',acc:'none2',bg:'none3'};
  const base = BASES.find(b=>b.id===av.base) || BASES[0];
  const hat  = ITEMS_MAP[av.hat] || '';
  const acc2 = ITEMS_MAP[av.acc] || '';
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:`radial-gradient(circle at 40% 35%,${base.color}30,${base.color}08)`,border:`1.5px solid ${base.color}40`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',flexShrink:0}}>
      <span style={{fontSize:size*0.42,lineHeight:1}}>{base.emoji}</span>
      {hat && <span style={{position:'absolute',top:-3,left:'50%',transform:'translateX(-50%)',fontSize:size*0.28,lineHeight:1}}>{hat}</span>}
      {acc2 && <span style={{position:'absolute',bottom:1,right:1,fontSize:size*0.22,lineHeight:1}}>{acc2}</span>}
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
  const [myAvatar,   setMyAvatar]   = useState({base:'base1',hat:'none',acc:'none2',bg:'none3'});

  useEffect(() => {
    fetchRanking();
    try { const s = localStorage.getItem(LS_AVATAR); if(s) setMyAvatar(JSON.parse(s)); } catch {}
  }, []);

  const fetchRanking = async () => {
    try {
      const r = await axios.get(`${API}/api/ranking`, { headers:{ Authorization:`Bearer ${token}` } });
      setJugadores(r.data.jugadores);
      setMiPosicion(r.data.mi_posicion);
    } catch {}
    setLoading(false);
  };

  const filtros = ['Todos','Bronce','Plata','Oro','Diamante'];
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
        <nav style={{position:'sticky',top:0,zIndex:50,height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px',backgroundColor:'rgba(255,255,255,0.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 12px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={()=>navigate('/')}>
            <img src="/logosoc.png" alt="SocBlast" style={{height:'28px'}}/>
            <span style={{fontSize:'15px',fontWeight:800,color:'#0f172a'}}>Soc<span style={{color:ACC}}>Blast</span></span>
          </div>
          <div style={{display:'flex',gap:'2px'}}>
            {[{label:'← Dashboard',path:'/dashboard'},{label:'Training',path:'/training'},{label:'Perfil',path:'/perfil'},{label:'Certificado',path:'/certificado'}].map((item,i)=>(
              <button key={i} className="nav-btn" onClick={()=>navigate(item.path)} style={{padding:'5px 14px',borderRadius:'7px',background:'none',border:'none',color:'#64748b',fontSize:'13px',cursor:'pointer'}}>{item.label}</button>
            ))}
          </div>
          <span style={{fontSize:'12px',color:'#94a3b8'}}>{jugadores.length} analistas</span>
        </nav>

        <div style={{maxWidth:'860px',margin:'0 auto',padding:'32px 40px 60px'}}>
          <div style={{marginBottom:'28px'}}>
            <h1 style={{fontSize:'24px',fontWeight:800,color:'#0f172a',marginBottom:'4px',letterSpacing:'-0.5px'}}>Ranking Global</h1>
            <p style={{fontSize:'13px',color:'#94a3b8'}}>Clasificación por copas · Actualizado en tiempo real</p>
          </div>

          {/* Mi posición */}
          {miPosicion && (
            <div className="fade-up" style={{padding:'20px 24px',borderRadius:'14px',backgroundColor:'#fff',border:`2px solid ${ACC}20`,marginBottom:'20px',boxShadow:`0 4px 20px ${ACC}10`}}>
              <div style={{height:'3px',background:`linear-gradient(90deg,${ACC},#818cf8)`,borderRadius:'4px',marginBottom:'18px'}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                  <div style={{textAlign:'center',minWidth:'52px'}}>
                    <div style={{fontSize:'10px',color:ACC,fontWeight:700,letterSpacing:'1.5px',marginBottom:'4px'}}>TU POSICIÓN</div>
                    <span style={{fontSize:'32px',fontWeight:900,color:ACC,letterSpacing:'-1px'}}>#{miPosicion.posicion}</span>
                  </div>
                  <div style={{width:'1px',height:'40px',backgroundColor:'#e2e8f0'}}/>
                  <MiniAvatar avatarData={myAvatar} size={48}/>
                  <div>
                    <p style={{fontSize:'15px',color:'#0f172a',fontWeight:700,marginBottom:'3px'}}>{miPosicion.nombre}</p>
                    <p style={{fontSize:'12px',color:'#94a3b8'}}>{TIERS[miPosicion.tier-1]} · {miPosicion.arena}</p>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{fontSize:'22px',fontWeight:900,color:getArenaColor(miPosicion.arena),marginBottom:'3px',letterSpacing:'-0.5px'}}>{miPosicion.copas?.toLocaleString()}</p>
                  <p style={{fontSize:'11px',color:'#94a3b8'}}>copas totales</p>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div style={{display:'flex',gap:'6px',marginBottom:'20px',flexWrap:'wrap'}}>
            {filtros.map(f => {
              const active = filtro===f;
              const color  = f==='Todos'?ACC:getArenaColor(`${f} I`);
              return (
                <button key={f} className="filter-btn" onClick={()=>setFiltro(f)}
                  style={{padding:'6px 16px',borderRadius:'8px',fontSize:'12px',fontWeight:600,cursor:'pointer',backgroundColor:active?`${color}10`:'#fff',color:active?color:'#64748b',border:active?`1.5px solid ${color}30`:'1px solid #e2e8f0',boxShadow:active?`0 2px 8px ${color}15`:'none'}}>
                  {f}
                </button>
              );
            })}
          </div>

          {/* Header */}
          <div style={{display:'grid',gridTemplateColumns:'56px 44px 1fr 140px 120px',padding:'8px 16px',marginBottom:'6px'}}>
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
            <div style={{textAlign:'center',padding:'60px',color:'#94a3b8',fontSize:'13px'}}>No hay analistas con estos filtros todavía.</div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
              {filtrados.map((j,i)=>{
                const color  = getArenaColor(j.arena);
                const esTop3 = i<3;
                const posColors = ['#f59e0b','#94a3b8','#d97706'];
                const esMio  = j.nombre===miPosicion?.nombre;
                // Avatar: solo el propio, los demás usan avatar genérico basado en posición
                const avatarData = esMio ? myAvatar : {base: BASES[i % BASES.length]?.id || 'base1', hat:'none', acc:'none2', bg:'none3'};
                return (
                  <div key={i} className="row"
                    style={{display:'grid',gridTemplateColumns:'56px 44px 1fr 140px 120px',alignItems:'center',padding:'12px 16px',borderRadius:'12px',backgroundColor:esMio?`${ACC}06`:'#fff',border:esMio?`1.5px solid ${ACC}20`:'1px solid #e8eaf0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',position:'relative',overflow:'hidden'}}>
                    {esMio && <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',background:`linear-gradient(180deg,${ACC},#818cf8)`}}/>}
                    <div>
                      {esTop3
                        ? <span style={{fontSize:'18px'}}>{['🥇','🥈','🥉'][i]}</span>
                        : <span style={{fontSize:'12px',color:'#94a3b8',fontWeight:700}}>#{i+1}</span>
                      }
                    </div>
                    <div><MiniAvatar avatarData={avatarData} size={32}/></div>
                    <div>
                      <p style={{fontSize:'13px',color:esMio?ACC:'#0f172a',fontWeight:esMio?700:500,marginBottom:'2px'}}>
                        {j.nombre}
                        {esMio && <span style={{fontSize:'9px',color:'#fff',marginLeft:'8px',padding:'2px 6px',borderRadius:'4px',backgroundColor:ACC,fontWeight:700}}>TÚ</span>}
                      </p>
                      <p style={{fontSize:'11px',color:'#94a3b8'}}>{TIERS[j.tier-1]}</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <span style={{fontSize:'11px',fontWeight:700,color,padding:'3px 8px',borderRadius:'5px',backgroundColor:`${color}10`,border:`1px solid ${color}20`}}>{j.arena}</span>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <span style={{fontSize:'15px',fontWeight:900,color:esTop3?posColors[i]:'#0f172a'}}>{j.copas?.toLocaleString()}</span>
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
