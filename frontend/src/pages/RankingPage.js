import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';
const ACC = '#4f46e5';

const TIERS    = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const TIER_CLR = ['','#64748b','#4f46e5','#0891b2','#059669','#d97706','#ea580c','#dc2626','#8b5cf6'];

const ARENA_COLORS = {
  bronce:   { main:'#d97706', light:'#fef3c7', border:'#fcd34d' },
  plata:    { main:'#64748b', light:'#f1f5f9', border:'#cbd5e1' },
  oro:      { main:'#b45309', light:'#fffbeb', border:'#fde68a' },
  diamante: { main:'#2563eb', light:'#eff6ff', border:'#bfdbfe' },
};

function getArenaGroup(arena) {
  if (!arena) return 'bronce';
  const a = arena.toLowerCase();
  if (a.includes('diamante')) return 'diamante';
  if (a.includes('oro'))      return 'oro';
  if (a.includes('plata'))    return 'plata';
  return 'bronce';
}

const DEFAULT_AVATAR_CONFIG = {
  top:'shortFlat', hairColor:'2c1b18', accessories:'blank',
  facialHair:'blank', facialHairColor:'2c1b18', clothe:'hoodie',
  clotheColor:'262e33', skin:'edb98a', eyes:'default', eyebrow:'default', mouth:'default',
};
function buildAvatarUrl(config={}, size=80) {
  const c = {...DEFAULT_AVATAR_CONFIG,...config};
  const seed = `${c.top}-${c.hairColor}-${c.clothe}-${c.clotheColor}-${c.skin}-${c.eyes}-${c.eyebrow}-${c.mouth}-${c.accessories}-${c.facialHair}-${c.facialHairColor}`;
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4&size=${size}`;
}

function MiniAvatar({ name='', avatarConfig=null, size=36 }) {
  const [loaded, setLoaded] = useState(false);
  if (avatarConfig) return (
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',border:'2px solid #fff',boxShadow:'0 0 0 1px #e2e8f0',background:'#b6e3f4',position:'relative',flexShrink:0}}>
      {!loaded && <div style={{position:'absolute',inset:0,background:'#b6e3f4'}}/>}
      <img src={buildAvatarUrl(avatarConfig,size*2)} alt={name} width={size} height={size}
        onLoad={()=>setLoaded(true)} onError={()=>setLoaded(true)}
        style={{width:'100%',height:'100%',objectFit:'cover',opacity:loaded?1:0,transition:'opacity .2s'}}/>
    </div>
  );
  const initials = name.trim().split(' ').map(w=>w[0]?.toUpperCase()||'').slice(0,2).join('');
  const colors = ['#4f46e5','#0891b2','#059669','#d97706','#ea580c','#8b5cf6','#ec4899','#0284c7'];
  const color = colors[name.charCodeAt(0)%colors.length] || ACC;
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:`linear-gradient(135deg,${color},${color}cc)`,display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #fff',boxShadow:'0 0 0 1px #e2e8f0',flexShrink:0}}>
      <span style={{fontSize:size*.34,fontWeight:700,color:'#fff'}}>{initials||'?'}</span>
    </div>
  );
}

const IC = {
  bolt:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  award: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  user:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  chart: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  shield:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  flask: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>,
  home:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  trend: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  book:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  fire:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
};
const Icon = ({name,size=15,color='currentColor'}) => (
  <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',color,width:size,height:size,flexShrink:0}}>
    {React.cloneElement(IC[name]||IC.award,{width:size,height:size})}
  </span>
);

export default function RankingPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [jugadores,  setJugadores]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filtro,     setFiltro]     = useState('Todos');
  const [miPosicion, setMiPosicion] = useState(null);

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

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes shimmer{0%{transform:translateX(-100%);}100%{transform:translateX(100%);}}
    .fu{animation:fadeUp .35s ease forwards;}
    .s1{animation:fadeUp .35s ease .06s both;}
    .s2{animation:fadeUp .35s ease .12s both;}
    .nb:hover{background:rgba(79,70,229,0.06)!important;color:#4f46e5!important;}
    .row:hover{transform:translateX(4px);box-shadow:0 4px 20px rgba(79,70,229,0.1)!important;border-color:#c7d2fe!important;}
    .ftab:hover{border-color:#a5b4fc!important;background:#f5f3ff!important;}
  `;

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",color:'#0f172a'}}>
      <style>{css}</style>

      {/* NAVBAR */}
      <nav style={{position:'sticky',top:0,zIndex:50,height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',background:'rgba(255,255,255,0.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaf0',boxShadow:'0 1px 16px rgba(79,70,229,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={()=>navigate('/')}>
          <img src="/logosoc.png" alt="SocBlast" style={{height:28}}/>
          <span style={{fontSize:16,fontWeight:800,color:'#0f172a',letterSpacing:'-0.3px'}}>Soc<span style={{color:ACC}}>Blast</span></span>
        </div>
        <div style={{display:'flex',gap:2}}>
          {[{l:'Inicio',i:'home',p:'/dashboard'},{l:'Sesiones',i:'bolt',p:'/sesion'},{l:'Labs',i:'flask',p:'/lab'},{l:'Training',i:'book',p:'/training'},{l:'Certificado',i:'award',p:'/certificado'},{l:'Perfil',i:'user',p:'/perfil'}].map((item,i)=>(
            <button key={i} className="nb" onClick={()=>navigate(item.p)}
              style={{padding:'6px 12px',borderRadius:8,background:'none',border:'none',color:'#64748b',fontSize:12,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',gap:5,transition:'all .15s'}}>
              <Icon name={item.i} size={14} color="#64748b"/>{item.l}
            </button>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {user && <MiniAvatar name={user.nombre} size={32}/>}
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
            <span style={{fontSize:12,fontWeight:600,color:'#0f172a'}}>{user?.nombre}</span>
            <span style={{fontSize:10,color:'#94a3b8'}}>{jugadores.length} analistas</span>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:900,margin:'0 auto',padding:'32px 24px 60px'}}>

        {/* HEADER */}
        <div className="fu" style={{marginBottom:28}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:100,background:'#eef2ff',border:'1px solid #c7d2fe',marginBottom:12}}>
            <Icon name="chart" size={11} color={ACC}/>
            <span style={{fontSize:11,fontWeight:700,color:ACC,letterSpacing:'1px'}}>RANKING GLOBAL</span>
          </div>
          <h1 style={{fontSize:30,fontWeight:900,color:'#0f172a',letterSpacing:'-0.8px',marginBottom:6,lineHeight:1.1}}>Clasificación de analistas</h1>
          <p style={{fontSize:14,color:'#64748b'}}>Ordenado por puntos competitivos · Actualizado en tiempo real</p>
        </div>

        {/* MI POSICIÓN */}
        {miPosicion && (
          <div className="s1" style={{marginBottom:20,borderRadius:16,overflow:'hidden',boxShadow:`0 8px 32px rgba(79,70,229,0.12)`,position:'relative'}}>
            <div style={{padding:'20px 24px',background:'linear-gradient(135deg,#1e1b4b,#3730a3)',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',borderRadius:'50%',background:'radial-gradient(circle,rgba(129,140,248,0.2),transparent)',pointerEvents:'none'}}/>
              <div style={{display:'flex',alignItems:'center',gap:16,position:'relative',zIndex:1}}>
                <div style={{padding:'8px 16px',borderRadius:10,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',textAlign:'center'}}>
                  <div style={{fontSize:28,fontWeight:900,color:'#fff',lineHeight:1,letterSpacing:'-1px'}}>#{miPosicion.posicion}</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.6)',fontWeight:700,letterSpacing:'1.5px',marginTop:2}}>TU POSICIÓN</div>
                </div>
                <MiniAvatar name={miPosicion.nombre} size={52}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:17,fontWeight:800,color:'#fff',marginBottom:3}}>{miPosicion.nombre}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.6)'}}>{TIERS[miPosicion.tier]||'SOC Rookie'} · {miPosicion.arena}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:28,fontWeight:900,color:'#fbbf24',letterSpacing:'-1px',lineHeight:1}}>{miPosicion.copas?.toLocaleString()}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:2}}>puntos totales</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FILTROS */}
        <div className="s1" style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
          {filtros.map(f => {
            const active = filtro===f;
            const ac2 = f==='Todos' ? ACC : (ARENA_COLORS[f.toLowerCase()]?.main||ACC);
            return (
              <button key={f} className="ftab" onClick={()=>setFiltro(f)}
                style={{padding:'7px 18px',borderRadius:100,fontSize:12,fontWeight:600,cursor:'pointer',background:active?`${ac2}12`:'#fff',color:active?ac2:'#64748b',border:`1.5px solid ${active?ac2:'#e2e8f0'}`,transition:'all .15s',boxShadow:active?`0 2px 10px ${ac2}20`:'none'}}>
                {f}
              </button>
            );
          })}
        </div>

        {/* HEADER TABLA */}
        <div style={{display:'grid',gridTemplateColumns:'56px 48px 1fr 140px 120px',padding:'8px 20px',marginBottom:6,gap:8}}>
          {['POS','','ANALISTA','ARENA','PUNTOS'].map((h,i)=>(
            <span key={i} style={{fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',textAlign:i>2?'right':'left'}}>{h}</span>
          ))}
        </div>

        {/* LISTA */}
        {loading ? (
          <div style={{textAlign:'center',padding:'60px'}}>
            <div style={{width:36,height:36,border:'3px solid #e2e8f0',borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto'}}/>
          </div>
        ) : filtrados.length===0 ? (
          <div style={{textAlign:'center',padding:'48px',color:'#94a3b8',fontSize:13}}>No hay analistas en esta categoría.</div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {filtrados.map((j,i) => {
              const esMio   = j.nombre===miPosicion?.nombre;
              const esTop3  = i<3;
              const group   = getArenaGroup(j.arena);
              const ac2     = ARENA_COLORS[group];
              return (
                <div key={i} className="row"
                  style={{display:'grid',gridTemplateColumns:'56px 48px 1fr 140px 120px',alignItems:'center',padding:'13px 20px',borderRadius:14,background:esMio?'linear-gradient(135deg,rgba(79,70,229,0.04),rgba(99,102,241,0.06))':'#fff',border:esMio?'1.5px solid #c7d2fe':'1px solid #e8eaf0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',gap:8,position:'relative',overflow:'hidden',transition:'all .2s'}}>
                  {esMio && <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:'linear-gradient(180deg,#4f46e5,#818cf8)'}}/>}
                  {/* Posicion */}
                  <div style={{display:'flex',alignItems:'center',gap:4}}>
                    {esTop3
                      ? <span style={{fontSize:22}}>{['🥇','🥈','🥉'][i]}</span>
                      : <span style={{fontSize:13,color:'#94a3b8',fontWeight:700}}>#{i+1}</span>
                    }
                  </div>
                  {/* Avatar */}
                  <MiniAvatar name={j.nombre} size={34}/>
                  {/* Nombre */}
                  <div style={{minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                      <span style={{fontSize:13,fontWeight:esMio?700:500,color:esMio?ACC:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.nombre}</span>
                      {esMio && <span style={{fontSize:9,padding:'2px 7px',borderRadius:4,background:ACC,color:'#fff',fontWeight:700,flexShrink:0}}>TÚ</span>}
                    </div>
                    <span style={{fontSize:11,color:'#94a3b8'}}>{TIERS[j.tier]||'SOC Rookie'}</span>
                  </div>
                  {/* Arena */}
                  <div style={{textAlign:'right'}}>
                    <span style={{fontSize:11,fontWeight:700,color:ac2.main,padding:'3px 9px',borderRadius:6,background:ac2.light,border:`1px solid ${ac2.border}`}}>{j.arena}</span>
                  </div>
                  {/* Puntos */}
                  <div style={{textAlign:'right'}}>
                    <span style={{fontSize:15,fontWeight:900,color:esTop3?['#d97706','#64748b','#b45309'][i]:'#0f172a',letterSpacing:'-0.5px'}}>{j.copas?.toLocaleString()}</span>
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