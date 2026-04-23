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
  bronce:   { main:'#d97706', accent:'#fbbf24', light:'#fef3c7', bg:'linear-gradient(160deg,#3d1a00 0%,#7c3000 30%,#b85a00 60%,#7c3000 80%,#2a1000 100%)', label:'Bronce', shine:'rgba(255,200,100,0.12)' },
  plata:    { main:'#94a3b8', accent:'#e2e8f0', light:'#f1f5f9', bg:'linear-gradient(160deg,#0f172a 0%,#1e293b 35%,#334155 60%,#1e293b 80%,#0f172a 100%)', label:'Plata',  shine:'rgba(200,220,240,0.1)' },
  oro:      { main:'#f59e0b', accent:'#fde68a', light:'#fffbeb', bg:'linear-gradient(160deg,#1a1200 0%,#4a3500 25%,#8a6200 55%,#c49000 75%,#4a3500 90%,#1a1200 100%)', label:'Oro', shine:'rgba(255,230,100,0.18)' },
  diamante: { main:'#3b82f6', accent:'#93c5fd', light:'#dbeafe', bg:'linear-gradient(160deg,#020817 0%,#0c1f4a 30%,#1a3a8a 60%,#0c1f4a 80%,#020817 100%)', label:'Diamante', shine:'rgba(147,197,253,0.15)' },
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

function FifaCard({ nombre, tier, skills, copas, arena, size = 'lg' }) {
  const group = getArenaGroup(arena);
  const theme = ARENA_THEMES[group];
  const skillVals = SKILL_ABBR.map(s => ({ ...s, val: Math.round((skills?.[s.key] || 0) * 10) }));
  const ovr = Math.round(skillVals.reduce((a, s) => a + s.val, 0) / skillVals.length);
  const initials = nombre ? nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SO';

  const W = size === 'lg' ? 260 : size === 'md' ? 200 : 160;
  const H = Math.round(W * 1.54);

  return (
    <div style={{
      width: W, height: H, borderRadius: W * 0.07,
      position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
      boxShadow: `0 24px 60px ${theme.main}55`,
      flexShrink: 0,
    }}>
      {/* fondo */}
      <div style={{ position:'absolute', inset:0, background: theme.bg }} />
      {/* brillo */}
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${theme.shine} 0%,transparent 50%,rgba(0,0,0,0.1) 100%)`, pointerEvents:'none' }} />

      {/* contenido */}
      <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', padding: `${W*0.06}px ${W*0.07}px` }}>

        {/* top row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: W*0.02 }}>
          <div>
            <div style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize: W*0.22, lineHeight:1, color: theme.accent, letterSpacing:1 }}>{ovr}</div>
            <div style={{ fontSize: W*0.055, fontWeight:800, color: theme.accent, letterSpacing:2, textTransform:'uppercase', marginTop:1 }}>ANALYST</div>
            <div style={{ fontSize: W*0.042, fontWeight:800, color: theme.accent, letterSpacing:1.5, textTransform:'uppercase', marginTop: W*0.02, padding:`2px ${W*0.035}px`, borderRadius:20, background:`${theme.main}22`, border:`1px solid ${theme.main}40`, display:'inline-block' }}>
              {arena}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize: W*0.038, fontWeight:800, letterSpacing:2, color:`${theme.accent}55`, textTransform:'uppercase', marginBottom:4 }}>SOCBLAST</div>
            <div style={{ width: W*0.15, height: W*0.15, borderRadius: W*0.04, background:`${theme.accent}12`, border:`1px solid ${theme.accent}28`, display:'flex', alignItems:'center', justifyContent:'center', marginLeft:'auto' }}>
              <svg width={W*0.08} height={W*0.08} viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>
        </div>

        {/* avatar */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{
            width: W*0.38, height: W*0.38, borderRadius:'50%',
            background: `${theme.accent}12`,
            border: `2px solid ${theme.accent}40`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:"'Bebas Neue','Impact',sans-serif",
            fontSize: W*0.14, color: theme.accent, letterSpacing:1,
          }}>{initials}</div>
        </div>

        {/* nombre */}
        <div style={{ textAlign:'center', marginBottom: W*0.025 }}>
          <div style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize: W*0.115, letterSpacing:2, color: theme.light, textTransform:'uppercase', lineHeight:1 }}>{nombre?.split(' ')[0] || 'Analyst'}</div>
          <div style={{ fontSize: W*0.042, fontWeight:700, color: theme.accent, letterSpacing:1.5, textTransform:'uppercase', marginTop:2, opacity:.8 }}>{TIERS[tier] || 'SOC Rookie'}</div>
        </div>

        {/* separador */}
        <div style={{ height:1, background: theme.accent, opacity:.2, marginBottom: W*0.03 }} />

        {/* stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1px 1fr', gap:0, marginBottom: W*0.02 }}>
          <div style={{ display:'flex', flexDirection:'column', gap: W*0.02 }}>
            {skillVals.slice(0,4).map(s => (
              <div key={s.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize: W*0.042, fontWeight:800, letterSpacing:1, color: theme.light, opacity:.65 }}>{s.abbr}</span>
                <span style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize: W*0.082, color: theme.accent, letterSpacing:1, lineHeight:1 }}>{s.val}</span>
              </div>
            ))}
          </div>
          <div style={{ background: theme.accent, opacity:.2, margin:`0 ${W*0.045}px` }} />
          <div style={{ display:'flex', flexDirection:'column', gap: W*0.02 }}>
            {skillVals.slice(4).map(s => (
              <div key={s.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize: W*0.042, fontWeight:800, letterSpacing:1, color: theme.light, opacity:.65 }}>{s.abbr}</span>
                <span style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize: W*0.082, color: theme.accent, letterSpacing:1, lineHeight:1 }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{ textAlign:'center', fontSize: W*0.036, fontWeight:700, letterSpacing:2, color: theme.accent, textTransform:'uppercase', opacity:.45 }}>
          {copas.toLocaleString()} copas
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
    <div style={{ minHeight:'100vh', background:'#060a14', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:40, height:40, border:'3px solid #1e293b', borderTop:'3px solid #4f46e5', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const skills      = userData.skills || {};
  const copas       = userData.copas || 0;
  const tier        = userData.tier || 1;
  const arena       = userData.arena || 'Bronce 3';
  const group       = getArenaGroup(arena);
  const theme       = ARENA_THEMES[group];
  const skillVals   = SKILL_ABBR.map(s => ({ ...s, val: Math.round((skills[s.key] || 0) * 10) }));
  const ovr         = Math.round(skillVals.reduce((a, s) => a + s.val, 0) / skillVals.length);
  const weakest     = [...skillVals].sort((a,b) => a.val - b.val).slice(0,3);
  const strongest   = [...skillVals].sort((a,b) => b.val - a.val).slice(0,3);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;700;800;900&display=swap');
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes cardFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
    .fade-up{animation:fadeUp .4s ease forwards;}
    .card-float{animation:cardFloat 5s ease-in-out infinite;}
    .back-btn:hover{background:rgba(255,255,255,.08)!important;}
    .skill-row-hover:hover{background:rgba(255,255,255,.04)!important;}
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', background:'#060a14', fontFamily:"'Inter',sans-serif", color:'#f1f5f9' }}>

        {/* navbar */}
        <nav style={{ height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', borderBottom:'1px solid rgba(255,255,255,.06)', background:'rgba(6,10,20,.9)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:50 }}>
          <button className="back-btn" onClick={()=>navigate('/dashboard')}
            style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'1px solid rgba(255,255,255,.08)', color:'#94a3b8', padding:'6px 14px', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:500 }}>
            ← Dashboard
          </button>
          <span style={{ fontSize:13, color:'#475569', fontWeight:600, letterSpacing:'.04em' }}>ANALYST CARD</span>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:13, color:'#94a3b8', fontWeight:500 }}>{user?.nombre}</span>
          </div>
        </nav>

        {/* hero */}
        <div style={{ background:`linear-gradient(180deg,${theme.main}15 0%,transparent 100%)`, borderBottom:'1px solid rgba(255,255,255,.04)', padding:'48px 40px 40px' }}>
          <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', gap:60, alignItems:'center' }}>

            {/* carta grande flotando */}
            <div className="card-float fade-up" style={{ flexShrink:0 }}>
              <FifaCard nombre={user?.nombre} tier={tier} skills={skills} copas={copas} arena={arena} size="lg"/>
            </div>

            {/* info derecha */}
            <div className="fade-up" style={{ flex:1 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 14px', borderRadius:20, background:`${theme.main}18`, border:`1px solid ${theme.main}30`, marginBottom:20 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:theme.main, animation:'pulse 2s infinite' }}/>
                <span style={{ fontSize:10, fontWeight:800, color:theme.main, letterSpacing:2, textTransform:'uppercase' }}>Tu Analyst Card · {arena}</span>
              </div>

              <div style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:72, lineHeight:1, letterSpacing:-2, color:'#f1f5f9', marginBottom:4 }}>
                {user?.nombre?.toUpperCase() || 'ANALISTA'}
              </div>
              <div style={{ fontSize:16, color:'#64748b', fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginBottom:28 }}>
                {TIERS[tier]} · Tier {tier} · {arena}
              </div>

              {/* OVR grande */}
              <div style={{ display:'flex', gap:24, alignItems:'center', marginBottom:28 }}>
                <div style={{ textAlign:'center', padding:'16px 24px', borderRadius:12, background:'rgba(255,255,255,.03)', border:`1px solid ${theme.main}25` }}>
                  <div style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:56, lineHeight:1, color:theme.accent, letterSpacing:-1 }}>{ovr}</div>
                  <div style={{ fontSize:11, fontWeight:800, color:'#475569', letterSpacing:2, textTransform:'uppercase', marginTop:2 }}>OVR GLOBAL</div>
                </div>
                <div style={{ textAlign:'center', padding:'16px 24px', borderRadius:12, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:56, lineHeight:1, color:'#fbbf24', letterSpacing:-1 }}>{copas.toLocaleString()}</div>
                  <div style={{ fontSize:11, fontWeight:800, color:'#475569', letterSpacing:2, textTransform:'uppercase', marginTop:2 }}>COPAS</div>
                </div>
                <div style={{ textAlign:'center', padding:'16px 24px', borderRadius:12, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:56, lineHeight:1, color:'#10b981', letterSpacing:-1 }}>{userData.sesiones_completadas || 0}</div>
                  <div style={{ fontSize:11, fontWeight:800, color:'#475569', letterSpacing:2, textTransform:'uppercase', marginTop:2 }}>SESIONES</div>
                </div>
              </div>

              {/* descripción nivel */}
              <div style={{ padding:'16px 20px', borderRadius:12, background:'rgba(255,255,255,.03)', border:`1px solid ${theme.main}20`, maxWidth:500 }}>
                <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.7, margin:0 }}>
                  {group === 'bronce' && 'Estás empezando tu camino como analista SOC. La IA ya mide tus habilidades — cada sesión actualiza tu carta. Sube a Plata completando más sesiones y mejorando tu análisis.'}
                  {group === 'plata'  && 'Buen nivel. Estás demostrando habilidades reales como analista. Empieza a destacar en correlación de eventos y respuesta a incidentes para escalar a Oro.'}
                  {group === 'oro'    && 'Analista avanzado. Tu carta refleja expertise real en el ámbito SOC. Los analistas de Oro son los más buscados por empresas de ciberseguridad.'}
                  {group === 'diamante' && 'Élite. Tu Analyst Card está en el top de SocBlast. Muy pocos analistas alcanzan este nivel — tu perfil habla por sí solo.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* skills detalladas */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'40px 40px 0' }}>
          <div style={{ marginBottom:24 }}>
            <p style={{ fontSize:10, color:'#475569', fontWeight:700, letterSpacing:2, fontFamily:'monospace', marginBottom:4 }}>SKILL BREAKDOWN — 8 HABILIDADES</p>
            <p style={{ fontSize:13, color:'#64748b' }}>Actualizado automáticamente por la IA en cada sesión y laboratorio completado</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:40 }}>
            {skillVals.sort((a,b) => b.val - a.val).map((s, i) => (
              <div key={s.key} className="skill-row-hover"
                style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 16px', borderRadius:10, background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.04)' }}>
                <div style={{ width:28, fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:18, color:theme.accent, flexShrink:0, textAlign:'center' }}>{i+1}</div>
                <div style={{ width:36, fontSize:10, fontWeight:800, color:'#64748b', letterSpacing:1, fontFamily:'monospace', flexShrink:0 }}>{s.abbr}</div>
                <div style={{ flex:1, fontSize:13, fontWeight:600, color:'#e2e8f0' }}>{s.label}</div>
                <div style={{ width:200, height:6, background:'rgba(255,255,255,.06)', borderRadius:3, overflow:'hidden', flexShrink:0 }}>
                  <div style={{ height:'100%', borderRadius:3, width:`${s.val}%`, background: s.val >= 70 ? theme.main : s.val >= 40 ? '#f59e0b' : '#ef4444', transition:'width 1s ease' }}/>
                </div>
                <div style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:22, color: s.val >= 70 ? theme.accent : s.val >= 40 ? '#f59e0b' : '#ef4444', width:40, textAlign:'right', flexShrink:0 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* fortalezas y debilidades */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:40 }}>
            <div style={{ padding:'20px 22px', borderRadius:14, background:'rgba(16,185,129,.04)', border:'1px solid rgba(16,185,129,.12)' }}>
              <p style={{ fontSize:10, color:'#10b981', fontWeight:800, letterSpacing:2, fontFamily:'monospace', marginBottom:14 }}>TOP SKILLS</p>
              {strongest.map((s,i) => (
                <div key={s.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:16, color:'#10b981' }}>{i+1}</span>
                    <span style={{ fontSize:13, color:'#94a3b8' }}>{s.label}</span>
                  </div>
                  <span style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:20, color:'#10b981' }}>{s.val}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:'20px 22px', borderRadius:14, background:'rgba(239,68,68,.04)', border:'1px solid rgba(239,68,68,.12)' }}>
              <p style={{ fontSize:10, color:'#ef4444', fontWeight:800, letterSpacing:2, fontFamily:'monospace', marginBottom:14 }}>A MEJORAR</p>
              {weakest.map((s,i) => (
                <div key={s.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:13, color:'#94a3b8' }}>{s.label}</span>
                  </div>
                  <span style={{ fontFamily:"'Bebas Neue','Impact',sans-serif", fontSize:20, color:'#ef4444' }}>{s.val}</span>
                </div>
              ))}
              <button onClick={()=>navigate('/sesion')}
                style={{ width:'100%', marginTop:10, padding:'9px', borderRadius:8, background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.25)', color:'#ef4444', fontSize:12, fontWeight:700, cursor:'pointer', letterSpacing:1 }}>
                ENTRENAR AHORA →
              </button>
            </div>
          </div>

          {/* comparativa ranking */}
          {ranking.length > 0 && (
            <div style={{ marginBottom:48 }}>
              <p style={{ fontSize:10, color:'#475569', fontWeight:700, letterSpacing:2, fontFamily:'monospace', marginBottom:16 }}>COMPARATIVA — TOP RANKING</p>
              <div style={{ display:'flex', gap:20, overflowX:'auto', paddingBottom:8 }}>
                {/* tu carta mini */}
                <div style={{ flexShrink:0, textAlign:'center' }}>
                  <div style={{ border:`2px solid ${theme.main}`, borderRadius:14, display:'inline-block', padding:2 }}>
                    <FifaCard nombre={user?.nombre} tier={tier} skills={skills} copas={copas} arena={arena} size="sm"/>
                  </div>
                  <div style={{ fontSize:10, color:theme.main, fontWeight:700, marginTop:6, letterSpacing:1 }}>TÚ</div>
                </div>
                {ranking.slice(0,5).filter(j => j.nombre !== user?.nombre).map((j, i) => (
                  <div key={i} style={{ flexShrink:0, textAlign:'center', opacity:.7 }}>
                    <FifaCard nombre={j.nombre} tier={j.tier||1} skills={j.skills||{}} copas={j.copas||0} arena={j.arena||'Bronce 3'} size="sm"/>
                    <div style={{ fontSize:10, color:'#475569', fontWeight:600, marginTop:6 }}>#{i+2}</div>
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
