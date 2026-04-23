import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';

const SKILL_ABBR = [
  { key:'analisis_logs',           abbr:'LOG', label:'Análisis de Logs',      color:'#3b82f6' },
  { key:'deteccion_amenazas',      abbr:'DET', label:'Detección de Amenazas', color:'#6366f1' },
  { key:'respuesta_incidentes',    abbr:'RSP', label:'Respuesta Incidentes',  color:'#f59e0b' },
  { key:'threat_hunting',          abbr:'THR', label:'Threat Hunting',        color:'#8b5cf6' },
  { key:'forense_digital',         abbr:'FOR', label:'Forense Digital',       color:'#ec4899' },
  { key:'gestion_vulnerabilidades',abbr:'VUL', label:'Gestión de Vulns',      color:'#f97316' },
  { key:'inteligencia_amenazas',   abbr:'INT', label:'Intel. Amenazas',       color:'#10b981' },
  { key:'siem_queries',            abbr:'SIE', label:'SIEM & Queries',        color:'#0891b2' },
];

const ARENA_THEMES = {
  bronce:   { main:'#d97706', accent:'#fbbf24', light:'#fef3c7', bg:'linear-gradient(160deg,#3d1a00 0%,#7c3000 30%,#b85a00 60%,#7c3000 80%,#2a1000 100%)', shine:'rgba(255,200,100,0.12)', label:'Bronce' },
  plata:    { main:'#94a3b8', accent:'#e2e8f0', light:'#f1f5f9', bg:'linear-gradient(160deg,#0f172a 0%,#1e293b 35%,#334155 60%,#1e293b 80%,#0f172a 100%)', shine:'rgba(200,220,240,0.1)', label:'Plata' },
  oro:      { main:'#f59e0b', accent:'#fde68a', light:'#fffbeb', bg:'linear-gradient(160deg,#1a1200 0%,#4a3500 25%,#8a6200 55%,#c49000 75%,#4a3500 90%,#1a1200 100%)', shine:'rgba(255,230,100,0.18)', label:'Oro' },
  diamante: { main:'#3b82f6', accent:'#93c5fd', light:'#dbeafe', bg:'linear-gradient(160deg,#020817 0%,#0c1f4a 30%,#1a3a8a 60%,#0c1f4a 80%,#020817 100%)', shine:'rgba(147,197,253,0.15)', label:'Diamante' },
};

const TIERS = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];

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
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  return Math.max(50, avg);
}

function FifaCard({ nombre, tier, skills, copas, arena, size = 'lg' }) {
  const group     = getArenaGroup(arena);
  const theme     = ARENA_THEMES[group];
  const skillVals = SKILL_ABBR.map(s => ({ ...s, val: Math.max(50, Math.round((skills?.[s.key] || 0) * 10)) }));
  const ovr       = calcOVR(skills);
  const initials  = nombre ? nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SO';
  const W = size === 'lg' ? 260 : size === 'md' ? 200 : 155;
  const H = Math.round(W * 1.56);
  const F = `'Bebas Neue','Impact','Arial Narrow',sans-serif`;

  return (
    <div style={{
      width:W, height:H, borderRadius:W*0.07, position:'relative', overflow:'hidden',
      boxShadow:`0 24px 56px ${theme.main}55, 0 4px 16px rgba(0,0,0,0.5)`,
      flexShrink:0,
    }}>
      <div style={{ position:'absolute', inset:0, background:theme.bg }}/>
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-40%', right:'-15%', width:'55%', height:'200%', background:'rgba(255,255,255,0.022)', transform:'rotate(18deg)' }}/>
        <div style={{ position:'absolute', top:'-40%', right:'15%',  width:'18%', height:'200%', background:'rgba(255,255,255,0.012)', transform:'rotate(18deg)' }}/>
      </div>
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${theme.shine} 0%,transparent 55%,rgba(0,0,0,0.18) 100%)`, pointerEvents:'none' }}/>
      <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', padding:`${W*0.06}px ${W*0.07}px` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:W*0.005 }}>
          <div>
            <div style={{ fontFamily:F, fontSize:W*0.25, lineHeight:1, color:theme.accent, letterSpacing:-1, textShadow:`0 0 40px ${theme.accent}50` }}>{ovr}</div>
            <div style={{ fontFamily:F, fontSize:W*0.075, color:theme.accent, letterSpacing:4, opacity:.85, marginTop:-W*0.01 }}>ANALYST</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:W*0.036, fontWeight:800, color:theme.accent, letterSpacing:1, marginTop:W*0.02,
              padding:`2px ${W*0.03}px`, borderRadius:20, background:`${theme.main}22`, border:`1px solid ${theme.main}40`, display:'inline-block' }}>
              {arena ? arena.toUpperCase() : 'BRONCE III'}
            </div>
          </div>
          <div style={{ textAlign:'right', paddingTop:2 }}>
            <div style={{ fontFamily:F, fontSize:W*0.052, letterSpacing:3, color:`${theme.accent}40` }}>SOCBLAST</div>
            <div style={{ width:W*0.13, height:W*0.13, borderRadius:W*0.03, background:`${theme.accent}10`, border:`1px solid ${theme.accent}22`, display:'flex', alignItems:'center', justifyContent:'center', marginLeft:'auto', marginTop:3 }}>
              <svg width={W*0.07} height={W*0.07} viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <svg width={W*0.55} height={W*0.55} viewBox="0 0 100 100" style={{ position:'absolute' }}>
            <polygon points="50,3 94,27 94,73 50,97 6,73 6,27" fill={`${theme.accent}07`} stroke={theme.accent} strokeWidth="1.8" strokeOpacity="0.3"/>
            <polygon points="50,12 86,32 86,68 50,88 14,68 14,32" fill={`${theme.accent}04`} stroke={theme.accent} strokeWidth="0.6" strokeOpacity="0.15"/>
          </svg>
          <div style={{ fontFamily:F, fontSize:W*0.18, color:theme.accent, letterSpacing:3, zIndex:1, textShadow:`0 2px 16px ${theme.accent}90` }}>{initials}</div>
        </div>
        <div style={{ textAlign:'center', marginBottom:W*0.018 }}>
          <div style={{ fontFamily:F, fontSize:W*0.135, letterSpacing:3, color:theme.light, textTransform:'uppercase', lineHeight:1, textShadow:'0 1px 8px rgba(0,0,0,0.6)' }}>
            {nombre?.split(' ')[0] || 'ANALYST'}
          </div>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:W*0.036, fontWeight:700, color:theme.accent, letterSpacing:2, textTransform:'uppercase', marginTop:3, opacity:.7 }}>
            {TIERS[tier]||'SOC ROOKIE'}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:W*0.022 }}>
          <div style={{ flex:1, height:1, background:theme.accent, opacity:.18 }}/>
          <div style={{ width:5, height:5, background:theme.accent, opacity:.5, transform:'rotate(45deg)', flexShrink:0 }}/>
          <div style={{ flex:1, height:1, background:theme.accent, opacity:.18 }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1px 1fr', gap:0, marginBottom:W*0.012 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:W*0.013 }}>
            {skillVals.slice(0,4).map(s=>(
              <div key={s.key} style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:W*0.036, fontWeight:800, letterSpacing:1.5, color:theme.light, opacity:.6 }}>{s.abbr}</span>
                <span style={{ fontFamily:F, fontSize:W*0.092, color:theme.accent, letterSpacing:1, lineHeight:1 }}>{s.val}</span>
              </div>
            ))}
          </div>
          <div style={{ background:theme.accent, opacity:.14, margin:`0 ${W*0.042}px` }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:W*0.013 }}>
            {skillVals.slice(4).map(s=>(
              <div key={s.key} style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:W*0.036, fontWeight:800, letterSpacing:1.5, color:theme.light, opacity:.6 }}>{s.abbr}</span>
                <span style={{ fontFamily:F, fontSize:W*0.092, color:theme.accent, letterSpacing:1, lineHeight:1 }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ flex:1, height:1, background:theme.accent, opacity:.12 }}/>
          <span style={{ fontFamily:F, fontSize:W*0.036, letterSpacing:2, color:theme.accent, opacity:.4 }}>{copas.toLocaleString()} COPAS</span>
          <div style={{ flex:1, height:1, background:theme.accent, opacity:.12 }}/>
        </div>
      </div>
    </div>
  );
}

export default function AnalystCardPage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [ranking,  setRanking]  = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/me`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setUserData(r.data))
      .catch(() => { logout(); navigate('/login'); });
    axios.get(`${API}/api/ranking`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setRanking(r.data?.jugadores || []))
      .catch(() => {});
  }, []);

  if (!userData) return (
    <div style={{ minHeight:'100vh', background:'#f0f4ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:40, height:40, border:'3px solid #e2e8f0', borderTop:'3px solid #4f46e5', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
    </div>
  );

  const skills    = userData.skills || {};
  const copas     = userData.copas || 0;
  const tier      = userData.tier || 1;
  const arena     = userData.arena || 'Bronce 3';
  const group     = getArenaGroup(arena);
  const theme     = ARENA_THEMES[group];
  const skillVals = SKILL_ABBR.map(s => ({ ...s, val: Math.max(50, Math.round((skills[s.key] || 0) * 10)) }));
  const ovr       = calcOVR(skills);
  const weakest   = [...skillVals].sort((a,b) => a.val - b.val).slice(0,3);
  const strongest = [...skillVals].sort((a,b) => b.val - a.val).slice(0,3);

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes cardFloat{0%,100%{transform:translateY(0) rotate(-1deg);}50%{transform:translateY(-10px) rotate(1deg);}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp .4s ease forwards;}
    .card-float{animation:cardFloat 6s ease-in-out infinite;}
    .back-btn:hover{background:#f1f5f9!important;}
    .skill-row:hover{background:#f8faff!important;}
    .skill-bar-fill{transition:width 1.2s cubic-bezier(.4,0,.2,1);}
    *{transition:transform .18s ease,box-shadow .18s ease,background .15s ease;}
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', fontFamily:"'Inter',sans-serif", color:'#0f172a' }}>

        {/* navbar */}
        <nav style={{ height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderBottom:'1px solid #e8eaf0', boxShadow:'0 1px 12px rgba(0,0,0,0.06)', position:'sticky', top:0, zIndex:50 }}>
          <button className="back-btn" onClick={()=>navigate('/dashboard')}
            style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'1px solid #e2e8f0', color:'#64748b', padding:'6px 14px', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:500 }}>
            ← Dashboard
          </button>
          <span style={{ fontSize:13, fontWeight:700, color:'#0f172a', letterSpacing:'.04em' }}>ANALYST CARD</span>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:13, color:'#374151', fontWeight:500 }}>{user?.nombre}</span>
          </div>
        </nav>

        {/* hero — carta + info */}
        <div className="fade-up" style={{ maxWidth:1100, margin:'0 auto', padding:'48px 40px 0', display:'flex', gap:60, alignItems:'center' }}>

          {/* carta flotando */}
          <div className="card-float" style={{ flexShrink:0 }}>
            <FifaCard nombre={user?.nombre} tier={tier} skills={skills} copas={copas} arena={arena} size="lg"/>
          </div>

          {/* info */}
          <div style={{ flex:1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 14px', borderRadius:20, background:`${theme.main}12`, border:`1px solid ${theme.main}25`, marginBottom:20 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:theme.main, animation:'pulse 2s infinite' }}/>
              <span style={{ fontSize:10, fontWeight:800, color:theme.main, letterSpacing:2, textTransform:'uppercase' }}>Tu Analyst Card · {arena}</span>
            </div>

            <div style={{ fontSize:36, fontWeight:900, color:'#0f172a', letterSpacing:'-1.5px', lineHeight:1.1, marginBottom:6 }}>
              {user?.nombre}
            </div>
            <div style={{ fontSize:14, color:'#64748b', fontWeight:600, letterSpacing:1, textTransform:'uppercase', marginBottom:28 }}>
              {TIERS[tier]} · Tier {tier} · {arena}
            </div>

            {/* stats */}
            <div style={{ display:'flex', gap:14, marginBottom:28 }}>
              {[
                { val:ovr,  label:'OVR',      color:theme.main,  bg:`${theme.main}10`,  border:`${theme.main}20` },
                { val:copas.toLocaleString(), label:'COPAS', color:'#f59e0b', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.18)' },
                { val:userData.sesiones_completadas||0, label:'SESIONES', color:'#4f46e5', bg:'rgba(79,70,229,0.06)', border:'rgba(79,70,229,0.14)' },
              ].map((s,i)=>(
                <div key={i} style={{ padding:'16px 22px', borderRadius:14, background:s.bg, border:`1px solid ${s.border}`, textAlign:'center', minWidth:90 }}>
                  <div style={{ fontFamily:"'Bebas Neue','Impact','Arial Narrow',sans-serif", fontSize:44, lineHeight:1, color:s.color, letterSpacing:-1 }}>{s.val}</div>
                  <div style={{ fontSize:9, fontWeight:800, color:'#94a3b8', letterSpacing:2, textTransform:'uppercase', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* descripción nivel */}
            <div style={{ padding:'16px 20px', borderRadius:12, background:'#fff', border:`1px solid ${theme.main}18`, maxWidth:500, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize:13, color:'#475569', lineHeight:1.7, margin:0 }}>
                {group==='bronce'  && 'Estás comenzando. La IA mide tus habilidades en cada sesión — cada decisión cuenta. Completa sesiones para subir tu OVR y llegar a Plata.'}
                {group==='plata'   && 'Buen nivel. Estás demostrando habilidades reales como analista. Trabaja en correlación de eventos y respuesta para alcanzar Oro.'}
                {group==='oro'     && 'Analista avanzado. Tu carta refleja expertise real en SOC. Los analistas de Oro son los más buscados por empresas de ciberseguridad.'}
                {group==='diamante'&& 'Élite. Tu Analyst Card está en el top de SocBlast. Muy pocos analistas alcanzan este nivel.'}
              </p>
            </div>
          </div>
        </div>

        {/* skill breakdown */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 40px 0' }}>
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:10, color:'#94a3b8', fontWeight:700, letterSpacing:2, fontFamily:'monospace', marginBottom:4 }}>SKILL BREAKDOWN — 8 HABILIDADES</p>
            <p style={{ fontSize:13, color:'#64748b' }}>La IA actualiza tus skills automáticamente en cada sesión y laboratorio</p>
          </div>
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e8eaf0', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', marginBottom:24 }}>
            {skillVals.sort((a,b)=>b.val-a.val).map((s,i)=>(
              <div key={s.key} className="skill-row"
                style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 20px', borderBottom:i<skillVals.length-1?'1px solid #f1f5f9':'none' }}>
                <div style={{ width:28, fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:18, color:theme.main, flexShrink:0, textAlign:'center', opacity:.5 }}>{i+1}</div>
                <div style={{ width:36, fontSize:10, fontWeight:800, color:'#64748b', letterSpacing:1, fontFamily:'monospace', flexShrink:0 }}>{s.abbr}</div>
                <div style={{ flex:1, fontSize:13, fontWeight:600, color:'#0f172a' }}>{s.label}</div>
                <div style={{ width:220, height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden', flexShrink:0 }}>
                  <div className="skill-bar-fill" style={{ height:'100%', borderRadius:3, width:`${s.val}%`, background: s.val>=70?theme.main:s.val>=60?'#f59e0b':'#ef4444' }}/>
                </div>
                <div style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:22, color:s.val>=70?theme.main:s.val>=60?'#f59e0b':'#ef4444', width:40, textAlign:'right', flexShrink:0 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* fortalezas y debilidades */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:40 }}>
            <div style={{ padding:'20px 22px', borderRadius:14, background:'#fff', border:'1px solid #e8eaf0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize:10, color:'#059669', fontWeight:800, letterSpacing:2, fontFamily:'monospace', marginBottom:14 }}>TOP SKILLS</p>
              {strongest.map((s,i)=>(
                <div key={s.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:16, color:'#059669', width:16 }}>{i+1}</span>
                    <span style={{ fontSize:13, color:'#475569' }}>{s.label}</span>
                  </div>
                  <span style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:20, color:'#059669' }}>{s.val}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:'20px 22px', borderRadius:14, background:'#fff', border:'1px solid #e8eaf0', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize:10, color:'#ef4444', fontWeight:800, letterSpacing:2, fontFamily:'monospace', marginBottom:14 }}>A MEJORAR</p>
              {weakest.map((s,i)=>(
                <div key={s.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <span style={{ fontSize:13, color:'#475569' }}>{s.label}</span>
                  <span style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:20, color:'#ef4444' }}>{s.val}</span>
                </div>
              ))}
              <button onClick={()=>navigate('/sesion')}
                style={{ width:'100%', marginTop:8, padding:'9px', borderRadius:8, background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', letterSpacing:1 }}>
                ENTRENAR AHORA →
              </button>
            </div>
          </div>

          {/* comparativa ranking */}
          {ranking.length > 0 && (
            <div style={{ marginBottom:56 }}>
              <p style={{ fontSize:10, color:'#94a3b8', fontWeight:700, letterSpacing:2, fontFamily:'monospace', marginBottom:16 }}>COMPARATIVA — TOP RANKING</p>
              <div style={{ display:'flex', gap:20, overflowX:'auto', paddingBottom:8 }}>
                <div style={{ flexShrink:0, textAlign:'center' }}>
                  <div style={{ border:`2px solid ${theme.main}`, borderRadius:14, display:'inline-block', padding:2 }}>
                    <FifaCard nombre={user?.nombre} tier={tier} skills={skills} copas={copas} arena={arena} size="sm"/>
                  </div>
                  <div style={{ fontSize:10, color:theme.main, fontWeight:700, marginTop:6, letterSpacing:1 }}>TÚ</div>
                </div>
                {ranking.slice(0,5).filter(j=>j.nombre!==user?.nombre).map((j,i)=>(
                  <div key={i} style={{ flexShrink:0, textAlign:'center', opacity:.65 }}>
                    <FifaCard nombre={j.nombre} tier={j.tier||1} skills={j.skills||{}} copas={j.copas||0} arena={j.arena||'Bronce 3'} size="sm"/>
                    <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, marginTop:6 }}>#{i+2}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
