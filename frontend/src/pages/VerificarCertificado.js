import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API = 'https://socblast-production.up.railway.app/api';
const ACC = '#4f46e5';

const TIERS = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];
const TIER_CLR = ['','#64748b','#3b82f6','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444','#8b5cf6'];

const SKILLS_NOMBRES = {
  analisis_logs:            'Análisis de Logs',
  deteccion_amenazas:       'Detección de Amenazas',
  respuesta_incidentes:     'Respuesta a Incidentes',
  threat_hunting:           'Threat Hunting',
  forense_digital:          'Forense Digital',
  gestion_vulnerabilidades: 'Gestión de Vulnerabilidades',
  inteligencia_amenazas:    'Inteligencia de Amenazas',
  siem_queries:             'SIEM & Queries',
};

const SKILLS_CLR = {
  analisis_logs:'#3b82f6', deteccion_amenazas:'#4f46e5', respuesta_incidentes:'#f59e0b',
  threat_hunting:'#8b5cf6', forense_digital:'#ec4899', gestion_vulnerabilidades:'#f97316',
  inteligencia_amenazas:'#10b981', siem_queries:'#0891b2',
};

const ARENAS_CLR = {
  'Bronce 3':'#d97706','Bronce 2':'#f59e0b','Bronce 1':'#fbbf24',
  'Plata 3':'#64748b', 'Plata 2':'#94a3b8', 'Plata 1':'#cbd5e1',
  'Oro 3':'#d97706',   'Oro 2':'#f59e0b',   'Oro 1':'#fbbf24',
  'Diamante 3':'#1e40af','Diamante 2':'#2563eb','Diamante 1':'#3b82f6',
};

export default function VerificarCertificado() {
  const { certId } = useParams();
  const navigate   = useNavigate();
  const [data,     setData]    = useState(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState('');

  useEffect(() => {
    if (!certId) { setError('ID de certificado no válido'); setLoading(false); return; }
    fetch(`${API}/certificado/${certId}`)
      .then(r => { if (!r.ok) throw new Error('Certificado no encontrado'); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [certId]);

  // ── loading ──
  if (loading) return (
    <div style={{ minHeight:'100vh',background:'#f0f4ff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40,height:40,border:`3px solid #e2e8f0`,borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 16px' }}/>
        <p style={{ color:'#64748b',fontSize:14 }}>Verificando certificado...</p>
      </div>
    </div>
  );

  // ── not found ──
  if (error || !data) return (
    <div style={{ minHeight:'100vh',background:'#f0f4ff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',sans-serif" }}>
      <div style={{ textAlign:'center',maxWidth:420,padding:40 }}>
        <div style={{ fontSize:64,marginBottom:16 }}>❌</div>
        <h2 style={{ fontSize:22,fontWeight:800,color:'#0f172a',marginBottom:8 }}>Certificado no encontrado</h2>
        <p style={{ fontSize:14,color:'#64748b',lineHeight:1.7,marginBottom:24 }}>
          El ID <code style={{ background:'#f1f5f9',padding:'2px 6px',borderRadius:4,fontSize:13 }}>{certId}</code> no corresponde a ningún certificado válido en SoCBlast.
        </p>
        <div style={{ padding:'12px 16px',background:'#fef2f2',borderRadius:10,border:'1px solid #fecaca',fontSize:13,color:'#dc2626',marginBottom:24 }}>
          ⚠ Este certificado podría ser falso o el ID podría estar incorrecto.
        </div>
        <button onClick={()=>navigate('/')} style={{ padding:'11px 24px',borderRadius:9,background:ACC,border:'none',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer' }}>
          Ir a SoCBlast →
        </button>
      </div>
    </div>
  );

  const { nombre, arena, tier, xp, sesiones_completadas, skills, fecha_registro } = data;
  const arenaColor = ARENAS_CLR[arena] || ACC;
  const tierColor  = TIER_CLR[tier] || '#64748b';
  const tierNombre = TIERS[tier] || 'SOC Rookie';
  const fecha      = new Date(fecha_registro).toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'});
  const fechaVerif = new Date().toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
  const skillsArr  = Object.entries(SKILLS_NOMBRES).map(([k,n])=>({ key:k, nombre:n, val:skills?.[k]||0, color:SKILLS_CLR[k]||ACC }));
  const avgSkill   = Math.round(skillsArr.reduce((a,s)=>a+s.val,0)/skillsArr.length*10)/10;

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',fontFamily:"'Inter',sans-serif",padding:'32px 20px 60px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth:780,margin:'0 auto' }}>

        {/* Banner verificación */}
        <div style={{ padding:'12px 20px',borderRadius:12,background:'linear-gradient(135deg,#ecfdf5,#f0fdf4)',border:'1px solid #86efac',display:'flex',alignItems:'center',gap:12,marginBottom:24,animation:'fadeUp .3s ease' }}>
          <div style={{ width:36,height:36,borderRadius:'50%',background:'#10b981',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>✓</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:800,color:'#065f46' }}>Certificado verificado y auténtico</div>
            <div style={{ fontSize:12,color:'#059669' }}>Este certificado ha sido emitido por SoCBlast y es válido. Verificado el {fechaVerif}</div>
          </div>
          <div style={{ fontSize:11,color:'#059669',fontFamily:'monospace',background:'#d1fae5',padding:'4px 10px',borderRadius:6,flexShrink:0 }}>ID: {certId}</div>
        </div>

        {/* Certificado */}
        <div style={{ background:'#fff',borderRadius:20,border:'1px solid #e2e8f0',boxShadow:'0 16px 56px rgba(79,70,229,0.1)',overflow:'hidden',marginBottom:20,animation:'fadeUp .4s ease' }}>

          {/* Banda superior */}
          <div style={{ height:6,background:`linear-gradient(90deg,${ACC},#818cf8,${arenaColor})` }}/>

          <div style={{ padding:'44px 52px' }}>

            {/* Header */}
            <div style={{ textAlign:'center',marginBottom:36 }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:12 }}>
                <img src="https://socblast.com/logosoc.png" alt="SocBlast" style={{ height:34 }} onError={e=>e.target.style.display='none'}/>
                <span style={{ fontSize:24,fontWeight:900,color:'#0f172a',letterSpacing:'-.8px' }}>Soc<span style={{ color:ACC }}>Blast</span></span>
              </div>
              <p style={{ fontSize:11,color:'#94a3b8',letterSpacing:'4px',fontWeight:700,marginBottom:18 }}>CERTIFICADO DE ANALISTA SOC</p>
              <div style={{ display:'flex',alignItems:'center',gap:12,justifyContent:'center' }}>
                <div style={{ flex:1,height:1,background:'linear-gradient(90deg,transparent,#e2e8f0)' }}/>
                <div style={{ width:8,height:8,borderRadius:'50%',background:ACC }}/>
                <div style={{ flex:1,height:1,background:'linear-gradient(90deg,#e2e8f0,transparent)' }}/>
              </div>
            </div>

            {/* Nombre */}
            <div style={{ textAlign:'center',marginBottom:36 }}>
              <p style={{ fontSize:13,color:'#94a3b8',marginBottom:10 }}>Certifica que</p>
              <h2 style={{ fontSize:38,fontWeight:900,color:'#0f172a',letterSpacing:'-1.2px',marginBottom:8,lineHeight:1 }}>{nombre}</h2>
              <p style={{ fontSize:13,color:'#64748b',maxWidth:420,margin:'0 auto',lineHeight:1.7 }}>
                ha demostrado competencias profesionales en ciberseguridad SOC mediante simulaciones reales en la plataforma SoCBlast
              </p>
            </div>

            {/* Stats */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:32 }}>
              {[
                { label:'NIVEL',    value:tierNombre,                          color:tierColor },
                { label:'ARENA',    value:arena||'Bronce 3',                   color:arenaColor },
                { label:'XP TOTAL', value:(xp||0).toLocaleString(),            color:'#7c3aed' },
                { label:'SESIONES', value:sesiones_completadas||0,             color:'#059669' },
              ].map((s,i)=>(
                <div key={i} style={{ padding:16,borderRadius:12,background:`${s.color}06`,border:`1px solid ${s.color}18`,textAlign:'center' }}>
                  <p style={{ fontSize:9,color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:7 }}>{s.label}</p>
                  <p style={{ fontSize:15,fontWeight:800,color:s.color,lineHeight:1.2 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div style={{ marginBottom:32 }}>
              <p style={{ fontSize:10,color:'#94a3b8',fontWeight:700,letterSpacing:'2px',textAlign:'center',marginBottom:16 }}>HABILIDADES CERTIFICADAS · MEDIA: {avgSkill}/10</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                {skillsArr.map(s=>{
                  const pct=Math.min((s.val/10)*100,100);
                  return (
                    <div key={s.key} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 13px',borderRadius:9,background:'#f8fafc',border:'1px solid #e8eaf0' }}>
                      <div style={{ width:7,height:7,borderRadius:'50%',background:s.color,flexShrink:0 }}/>
                      <span style={{ fontSize:12,color:'#475569',flex:1 }}>{s.nombre}</span>
                      <div style={{ width:60,height:4,borderRadius:2,background:'#e2e8f0',overflow:'hidden',flexShrink:0 }}>
                        <div style={{ width:`${pct}%`,height:'100%',borderRadius:2,background:s.color }}/>
                      </div>
                      <span style={{ fontSize:11,color:s.color,fontWeight:700,width:28,textAlign:'right',flexShrink:0 }}>{s.val}/10</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',paddingTop:24,borderTop:'1px solid #e8eaf0' }}>
              <div>
                <p style={{ fontSize:10,color:'#94a3b8',fontWeight:600,letterSpacing:'1px',marginBottom:4 }}>MIEMBRO DESDE</p>
                <p style={{ fontSize:14,color:'#0f172a',fontWeight:600 }}>{fecha}</p>
                <p style={{ fontSize:11,color:'#94a3b8',marginTop:2 }}>Cert. ID: {certId}</p>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ padding:'6px',borderRadius:10,background:'#fff',border:'2px solid #e2e8f0',display:'inline-block' }}>
                  <div style={{ width:80,height:80,background:'#f8fafc',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#94a3b8',textAlign:'center',padding:4 }}>
                    socblast.com/verificar/{certId}
                  </div>
                </div>
                <p style={{ fontSize:10,color:'#94a3b8',marginTop:6 }}>Verificado ✓</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:10,color:'#94a3b8',fontWeight:600,letterSpacing:'1px',marginBottom:4 }}>EMITIDO POR</p>
                <p style={{ fontSize:14,color:'#0f172a',fontWeight:700 }}>SoCBlast Platform</p>
                <p style={{ fontSize:11,color:'#94a3b8',marginTop:2 }}>Powered by Zorion</p>
                <div style={{ marginTop:8,padding:'3px 10px',borderRadius:5,background:`${ACC}08`,border:`1px solid ${ACC}18`,display:'inline-block' }}>
                  <span style={{ fontSize:10,color:ACC,fontWeight:700 }}>✓ VERIFICADO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banda inferior */}
          <div style={{ height:4,background:`linear-gradient(90deg,${arenaColor},${ACC},#818cf8)` }}/>
        </div>

        {/* Botones */}
        <div style={{ display:'flex',gap:12,animation:'fadeUp .5s ease' }}>
          <button onClick={()=>navigate('/')} style={{ flex:1,padding:'13px 0',borderRadius:10,background:ACC,border:'none',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer' }}>
            🛡️ Conocer SoCBlast
          </button>
          <button onClick={()=>window.print()} style={{ flex:1,padding:'13px 0',borderRadius:10,background:'#fff',border:'1px solid #e2e8f0',color:'#374151',fontSize:14,fontWeight:700,cursor:'pointer' }}>
            📥 Imprimir / Guardar PDF
          </button>
          <button onClick={()=>{ navigator.clipboard?.writeText(window.location.href); alert('✓ URL copiada'); }} style={{ padding:'13px 20px',borderRadius:10,background:'#fff',border:'1px solid #e2e8f0',color:'#374151',fontSize:14,fontWeight:700,cursor:'pointer' }}>
            🔗 Copiar URL
          </button>
        </div>

        <p style={{ textAlign:'center',color:'#94a3b8',fontSize:11,marginTop:20 }}>
          Powered by Zorion · SoCBlast Platform · socblast.com
        </p>
      </div>
    </div>
  );
}