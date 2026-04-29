import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { SBNav, AvatarCircle, Icon, ACC, BG, BASE_CSS, SBSpinner, ARENA_COLORS, TIERS, TIER_CLR, getArenaGroup } from './SBLayout';

const API = 'https://socblast-production.up.railway.app';

export default function RankingPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [jugadores,  setJugadores]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filtro,     setFiltro]     = useState('Todos');
  const [miPosicion, setMiPosicion] = useState(null);

  const avatarConfig = user?.avatar_config || null;
  const foto = user?.foto_perfil || '';

  useEffect(() => { fetchRanking(); }, []);

  const fetchRanking = async () => {
    try {
      const r = await axios.get(`${API}/api/ranking`, { headers:{ Authorization:`Bearer ${token}` } });
      setJugadores(r.data.jugadores || []);
      setMiPosicion(r.data.mi_posicion);
    } catch {}
    setLoading(false);
  };

  const filtros   = ['Todos','Bronce','Plata','Oro','Diamante'];
  const filtrados = filtro==='Todos' ? jugadores : jugadores.filter(j=>j.arena?.toLowerCase().includes(filtro.toLowerCase()));

  if (loading) return <SBSpinner/>;

  return (
    <div style={{minHeight:'100vh',background:BG,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",color:'#0f172a'}}>
      <style>{BASE_CSS + `
        .ftab:hover{border-color:#a5b4fc!important;background:#f5f3ff!important;color:${ACC}!important;}
        .rrow{transition:all .18s ease;cursor:default;}
        .rrow:hover{background:linear-gradient(135deg,rgba(79,70,229,0.04),rgba(99,102,241,0.06))!important;border-color:#c7d2fe!important;transform:translateX(4px);}
      `}</style>

      <SBNav user={user} avatarConfig={avatarConfig} foto={foto} activePage="/ranking" navigate={navigate}/>

      <div style={{maxWidth:900,margin:'0 auto',padding:'36px 32px 64px'}}>

        {/* HEADER */}
        <div className="fu" style={{marginBottom:32}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 14px',borderRadius:100,background:'#eef2ff',border:'1px solid #c7d2fe',marginBottom:14}}>
            <Icon name="chart" size={11} color={ACC}/>
            <span style={{fontSize:11,fontWeight:700,color:ACC,letterSpacing:'1.5px'}}>RANKING GLOBAL</span>
          </div>
          <h1 style={{fontSize:32,fontWeight:900,color:'#0f172a',letterSpacing:'-0.8px',marginBottom:6,lineHeight:1.1}}>Clasificación de analistas</h1>
          <p style={{fontSize:14,color:'#64748b',lineHeight:1.6}}>Ordenado por puntos competitivos · Actualizado en tiempo real · <strong style={{color:ACC}}>{jugadores.length} analistas</strong></p>
        </div>

        {/* MI POSICION */}
        {miPosicion && (
          <div className="s1" style={{marginBottom:24,borderRadius:20,overflow:'hidden',boxShadow:'0 8px 32px rgba(79,70,229,0.15)'}}>
            <div style={{padding:'22px 28px',background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'-60px',right:'-60px',width:'220px',height:'220px',borderRadius:'50%',background:'radial-gradient(circle,rgba(129,140,248,0.2),transparent)',pointerEvents:'none'}}/>
              <div style={{position:'absolute',bottom:'-40px',left:'-40px',width:'160px',height:'160px',borderRadius:'50%',background:'radial-gradient(circle,rgba(79,70,229,0.15),transparent)',pointerEvents:'none'}}/>
              <div style={{display:'flex',alignItems:'center',gap:20,position:'relative',zIndex:1}}>
                <div style={{padding:'10px 18px',borderRadius:12,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',textAlign:'center',flexShrink:0}}>
                  <div style={{fontSize:30,fontWeight:900,color:'#fff',lineHeight:1,letterSpacing:'-1px'}}>#{miPosicion.posicion}</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.55)',fontWeight:700,letterSpacing:'1.5px',marginTop:3}}>TU POSICIÓN</div>
                </div>
                <AvatarCircle name={miPosicion.nombre} size={56} color={ACC}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:18,fontWeight:800,color:'#fff',marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{miPosicion.nombre}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:12,color:'rgba(255,255,255,0.55)'}}>{TIERS[miPosicion.tier]||'SOC Rookie'}</span>
                    <span style={{fontSize:10,padding:'2px 8px',borderRadius:100,background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.7)',fontWeight:600}}>{miPosicion.arena}</span>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:30,fontWeight:900,color:'#fbbf24',letterSpacing:'-1px',lineHeight:1}}>{miPosicion.copas?.toLocaleString()}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',marginTop:3}}>puntos totales</div>
                </div>
              </div>
            </div>
            <div style={{height:4,background:`linear-gradient(90deg,${ACC},#818cf8,#a5b4fc)`}}/>
          </div>
        )}

        {/* FILTROS */}
        <div className="s1" style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
          {filtros.map(f => {
            const active = filtro===f;
            const ac2 = f==='Todos' ? ACC : (ARENA_COLORS[f.toLowerCase()]?.main||ACC);
            return (
              <button key={f} className="ftab" onClick={()=>setFiltro(f)}
                style={{padding:'8px 20px',borderRadius:100,fontSize:13,fontWeight:600,cursor:'pointer',background:active?`${ac2}10`:'#fff',color:active?ac2:'#64748b',border:`1.5px solid ${active?ac2+'50':'#e8eaf0'}`,transition:'all .15s',boxShadow:active?`0 4px 14px ${ac2}20`:'none'}}>
                {f}
              </button>
            );
          })}
        </div>

        {/* HEADER TABLA */}
        <div style={{display:'grid',gridTemplateColumns:'60px 50px 1fr 160px 130px',padding:'8px 20px',marginBottom:8,gap:8}}>
          {['POS','','ANALISTA','ARENA','PUNTOS'].map((h,i)=>(
            <span key={i} style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',textAlign:i>2?'right':'left'}}>{h}</span>
          ))}
        </div>

        {/* LISTA */}
        {filtrados.length===0 ? (
          <div style={{textAlign:'center',padding:'60px',color:'#94a3b8',fontSize:13}}>No hay analistas en esta categoría.</div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {filtrados.map((j,i) => {
              const esMio   = j.nombre===miPosicion?.nombre;
              const esTop3  = i<3;
              const group   = getArenaGroup(j.arena);
              const ac2     = ARENA_COLORS[group];
              const tierColor = TIER_CLR[j.tier] || '#64748b';
              return (
                <div key={i} className="rrow"
                  style={{display:'grid',gridTemplateColumns:'60px 50px 1fr 160px 130px',alignItems:'center',padding:'14px 20px',borderRadius:14,background:esMio?'linear-gradient(135deg,rgba(79,70,229,0.05),rgba(99,102,241,0.07))':'#fff',border:esMio?'1.5px solid #c7d2fe':'1px solid #e8eaf0',boxShadow:esMio?'0 4px 20px rgba(79,70,229,0.1)':'0 1px 4px rgba(0,0,0,0.04)',gap:8,position:'relative',overflow:'hidden'}}>
                  {esMio && <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:`linear-gradient(180deg,${ACC},#818cf8)`}}/>}
                  {/* Posicion */}
                  <div style={{display:'flex',alignItems:'center'}}>
                    {esTop3
                      ? <span style={{fontSize:24}}>{['🥇','🥈','🥉'][i]}</span>
                      : <span style={{fontSize:13,color:'#94a3b8',fontWeight:700}}>#{i+1}</span>
                    }
                  </div>
                  {/* Avatar */}
                  <AvatarCircle name={j.nombre} size={36} color={tierColor}/>
                  {/* Nombre */}
                  <div style={{minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                      <span style={{fontSize:14,fontWeight:esMio?700:500,color:esMio?ACC:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.nombre}</span>
                      {esMio && <span style={{fontSize:9,padding:'2px 8px',borderRadius:4,background:ACC,color:'#fff',fontWeight:700,flexShrink:0}}>TÚ</span>}
                    </div>
                    <span style={{fontSize:11,color:tierColor,fontWeight:600}}>{TIERS[j.tier]||'SOC Rookie'}</span>
                  </div>
                  {/* Arena */}
                  <div style={{textAlign:'right'}}>
                    <span style={{fontSize:11,fontWeight:700,color:ac2.main,padding:'4px 10px',borderRadius:7,background:ac2.light,border:`1px solid ${ac2.border}`}}>{j.arena}</span>
                  </div>
                  {/* Puntos */}
                  <div style={{textAlign:'right'}}>
                    <span style={{fontSize:16,fontWeight:900,color:esTop3?['#d97706','#64748b','#b45309'][i]:ACC,letterSpacing:'-0.5px'}}>{j.copas?.toLocaleString()}</span>
                    <span style={{fontSize:11,color:'#94a3b8',marginLeft:3}}>pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}