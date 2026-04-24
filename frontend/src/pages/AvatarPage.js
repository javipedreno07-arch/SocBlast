import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { AVATAR_OPTIONS, DEFAULT_AVATAR, generateAvatarUrl, randomAvatarConfig, totalCombinations } from '../utils/generateAvatar';

const API = 'https://socblast-production.up.railway.app';

const SECTIONS = [
  { key:'top',             label:'Pelo / Sombrero' },
  { key:'hairColor',       label:'Color de pelo',      type:'color' },
  { key:'skin',            label:'Tono de piel',       type:'color' },
  { key:'eyes',            label:'Ojos' },
  { key:'eyebrow',         label:'Cejas' },
  { key:'mouth',           label:'Boca' },
  { key:'accessories',     label:'Accesorios' },
  { key:'facialHair',      label:'Vello facial' },
  { key:'facialHairColor', label:'Color vello facial', type:'color' },
  { key:'clothe',          label:'Ropa' },
  { key:'clotheColor',     label:'Color de ropa',      type:'color' },
];

export default function AvatarPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig]     = useState(DEFAULT_AVATAR);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.data.avatar) setConfig({ ...DEFAULT_AVATAR, ...r.data.avatar }); })
      .catch(() => {});
  }, []);

  const update = (key, val) => setConfig(c => ({ ...c, [key]: val }));

  const saveAvatar = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/api/me/avatar`, { avatar: config }, { headers: { Authorization: `Bearer ${token}` } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const randomize = () => setConfig(randomAvatarConfig());

  const avatarUrl = generateAvatarUrl(config, 280);
  const currentSection = SECTIONS.find(s => s.key === activeSection);
  const currentOptions = AVATAR_OPTIONS[activeSection] || [];
  const COMBOS = totalCombinations().toLocaleString('es-ES');

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp .3s ease forwards;}
    .opt-btn{transition:all .15s ease;cursor:pointer;}
    .opt-btn:hover{transform:translateY(-1px);}
    .section-tab:hover{background:#f1f5f9!important;}
    .save-btn:hover{filter:brightness(1.08);transform:translateY(-1px)!important;}
    .rand-btn:hover{background:#f1f5f9!important;}
    *{transition:background .12s,border-color .12s,transform .15s,box-shadow .15s;}
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)', fontFamily:"'Inter',sans-serif", color:'#0f172a' }}>

        {/* navbar */}
        <nav style={{ height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderBottom:'1px solid #e8eaf0', boxShadow:'0 1px 12px rgba(0,0,0,0.06)', position:'sticky', top:0, zIndex:50 }}>
          <button onClick={() => navigate('/dashboard')}
            style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'1px solid #e2e8f0', color:'#64748b', padding:'6px 14px', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:500 }}>
            ← Dashboard
          </button>
          <span style={{ fontSize:13, fontWeight:700, color:'#0f172a', letterSpacing:'.04em' }}>PERSONALIZAR AVATAR</span>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:13, color:'#374151', fontWeight:500 }}>{user?.nombre}</span>
          </div>
        </nav>

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'36px 40px' }}>
          <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:32, alignItems:'start' }}>

            {/* columna izquierda — preview */}
            <div style={{ position:'sticky', top:76 }}>
              <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e8eaf0', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.07)', padding:'28px 24px', textAlign:'center' }}>

                {/* avatar preview */}
                <div style={{ width:200, height:200, margin:'0 auto 16px', borderRadius:'50%', background:'linear-gradient(135deg,#f0f4ff,#e8eaf0)', border:'3px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
                  {imgLoading && (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.8)' }}>
                      <div style={{ width:24, height:24, border:'3px solid #e2e8f0', borderTop:'3px solid #4f46e5', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
                    </div>
                  )}
                  <img
                    src={avatarUrl}
                    alt="Tu avatar"
                    width={200}
                    height={200}
                    onLoadStart={() => setImgLoading(true)}
                    onLoad={() => setImgLoading(false)}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  />
                </div>

                <div style={{ fontSize:16, fontWeight:700, color:'#0f172a', marginBottom:4 }}>{user?.nombre}</div>
                <div style={{ fontSize:12, color:'#94a3b8', marginBottom:20 }}>{COMBOS} combinaciones posibles</div>

                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <button className="save-btn" onClick={saveAvatar} disabled={saving}
                    style={{ width:'100%', padding:'13px 0', borderRadius:10, border:'none', background:saved?'linear-gradient(135deg,#059669,#10b981)':'linear-gradient(135deg,#4f46e5,#6366f1)', color:'#fff', fontSize:14, fontWeight:700, cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:saved?'0 4px 16px rgba(5,150,105,0.4)':'0 4px 16px rgba(79,70,229,0.35)' }}>
                    {saving ? (
                      <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>Guardando...</>
                    ) : saved ? '✓ Guardado' : 'Guardar avatar'}
                  </button>

                  <button className="rand-btn" onClick={randomize}
                    style={{ width:'100%', padding:'11px 0', borderRadius:10, border:'1px solid #e2e8f0', background:'#fff', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
                    Aleatorio
                  </button>

                  <button onClick={() => setConfig(DEFAULT_AVATAR)}
                    style={{ width:'100%', padding:'9px 0', borderRadius:10, border:'1px solid #e2e8f0', background:'#fff', color:'#94a3b8', fontSize:12, fontWeight:500, cursor:'pointer' }}>
                    Resetear
                  </button>
                </div>
              </div>

              {/* tip */}
              <div style={{ marginTop:16, padding:'12px 16px', borderRadius:12, background:'#fff', border:'1px solid #e8eaf0', display:'flex', gap:10, alignItems:'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <p style={{ fontSize:12, color:'#64748b', lineHeight:1.6, margin:0 }}>Tu avatar aparecerá en tu Analyst Card y en el ranking. Puedes cambiarlo cuando quieras.</p>
              </div>
            </div>

            {/* columna derecha — opciones */}
            <div>
              <div style={{ marginBottom:20 }}>
                <h2 style={{ fontSize:22, fontWeight:900, color:'#0f172a', letterSpacing:'-0.5px', marginBottom:4 }}>Crea tu personaje</h2>
                <p style={{ fontSize:13, color:'#64748b', margin:0 }}>Personaliza cada detalle de tu analista SOC</p>
              </div>

              {/* tabs de sección */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
                {SECTIONS.map(s => (
                  <button key={s.key} className="section-tab"
                    onClick={() => setActiveSection(s.key)}
                    style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${activeSection===s.key?'#4f46e5':'#e2e8f0'}`, background:activeSection===s.key?'#4f46e5':'#fff', color:activeSection===s.key?'#fff':'#64748b', fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* opciones de la sección activa */}
              <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e8eaf0', padding:'20px 22px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', minHeight:200 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:2, textTransform:'uppercase', marginBottom:16 }}>
                  {currentSection?.label} — {currentOptions.length} opciones
                </p>

                {currentSection?.type === 'color' ? (
                  /* grid de colores */
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                    {currentOptions.map(opt => {
                      const isSelected = config[activeSection] === opt.id;
                      return (
                        <div key={opt.id} className="opt-btn"
                          onClick={() => update(activeSection, opt.id)}
                          title={opt.label}
                          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'8px 10px', borderRadius:10, border:`2px solid ${isSelected?'#4f46e5':'#e2e8f0'}`, background:isSelected?'#f0f4ff':'#fafafa', minWidth:60 }}>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:opt.hex, border:'2px solid rgba(0,0,0,0.08)', boxShadow:isSelected?`0 0 0 3px #4f46e540`:'' }}/>
                          <span style={{ fontSize:10, color:isSelected?'#4f46e5':'#64748b', fontWeight:isSelected?700:400, whiteSpace:'nowrap' }}>{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* grid de opciones de texto */
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:8 }}>
                    {currentOptions.map(opt => {
                      const isSelected = config[activeSection] === opt.id;
                      return (
                        <div key={opt.id} className="opt-btn"
                          onClick={() => update(activeSection, opt.id)}
                          style={{ padding:'10px 14px', borderRadius:10, border:`2px solid ${isSelected?'#4f46e5':'#e2e8f0'}`, background:isSelected?'#f0f4ff':'#fafafa', textAlign:'center', userSelect:'none' }}>
                          <span style={{ fontSize:12, color:isSelected?'#4f46e5':'#374151', fontWeight:isSelected?700:500 }}>{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* resumen de selección actual */}
              <div style={{ marginTop:16, padding:'14px 18px', borderRadius:12, background:'#fff', border:'1px solid #e8eaf0' }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Configuración actual</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {SECTIONS.map(s => {
                    const opts = AVATAR_OPTIONS[s.key] || [];
                    const selectedOpt = opts.find(o => o.id === config[s.key]);
                    return (
                      <div key={s.key}
                        onClick={() => setActiveSection(s.key)}
                        style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:7, background:activeSection===s.key?'#f0f4ff':'#f8fafc', border:`1px solid ${activeSection===s.key?'#c7d2fe':'#e2e8f0'}`, cursor:'pointer' }}>
                        {selectedOpt?.hex && <div style={{ width:8, height:8, borderRadius:'50%', background:selectedOpt.hex, flexShrink:0 }}/>}
                        <span style={{ fontSize:10, color:'#94a3b8' }}>{s.label}:</span>
                        <span style={{ fontSize:10, fontWeight:600, color:'#374151' }}>{selectedOpt?.label || '—'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}