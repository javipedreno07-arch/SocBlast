import React, { useState, useEffect, useRef } from 'react';
import { SBNav } from './SBLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import QRCode from 'qrcode';

const ACC = '#4f46e5';

const TIERS = ['','SOC Rookie','SOC Analyst','SOC Specialist','SOC Expert','SOC Sentinel','SOC Architect','SOC Master','SOC Legend'];

const SKILLS_NOMBRES = {
  analisis_logs:           'Análisis de Logs',
  deteccion_amenazas:      'Detección de Amenazas',
  respuesta_incidentes:    'Respuesta a Incidentes',
  threat_hunting:          'Threat Hunting',
  forense_digital:         'Forense Digital',
  gestion_vulnerabilidades:'Gestión de Vulnerabilidades',
  inteligencia_amenazas:   'Inteligencia de Amenazas',
};

const ARENAS_COLORS = {
  'Bronce 3':'#fbbf24','Bronce 2':'#f59e0b','Bronce 1':'#d97706',
  'Plata 3':'#cbd5e1', 'Plata 2':'#94a3b8', 'Plata 1':'#64748b',
  'Oro 3':'#fbbf24',   'Oro 2':'#f59e0b',   'Oro 1':'#d97706',
  'Diamante 3':'#3b82f6','Diamante 2':'#2563eb','Diamante 1':'#1e40af',
  // compatibilidad con formato antiguo
  'Bronce I':'#d97706','Bronce II':'#f59e0b','Bronce III':'#fbbf24',
  'Plata I':'#64748b', 'Plata II':'#94a3b8', 'Plata III':'#cbd5e1',
  'Oro I':'#d97706',   'Oro II':'#f59e0b',   'Oro III':'#fbbf24',
  'Diamante I':'#1e40af','Diamante II':'#2563eb','Diamante III':'#3b82f6',
};
const getArenaColor = a => ARENAS_COLORS[a] || ACC;

export default function CertificadoPage() {
  const { token }  = useAuth();
  const navigate   = useNavigate();
  const certRef    = useRef(null);

  const [userData,  setUserData]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      const r = await axios.get('https://socblast-production.up.railway.app/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(r.data);
    } catch {}
    setLoading(false);
  };

  // Generar QR apuntando a socblast.com/verificar/
  useEffect(() => {
    if (!userData) return;
    const certId    = userData._id?.slice(-12).toUpperCase() || 'CERT000000';
    const verifyUrl = `https://socblast.com/verificar/${certId}`;
    QRCode.toDataURL(verifyUrl, {
      width: 160,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    }).then(url => setQrDataUrl(url)).catch(() => {});
  }, [userData]);

  const handleDescargar = () => window.print();

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp .4s ease forwards;}
    .nav-btn:hover{background:#f1f5f9!important;color:#0f172a!important;}
    .action-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(79,70,229,0.25)!important;}
    @media print {
      .no-print{display:none!important;}
      body{background:#fff!important;}
      .cert-wrapper{box-shadow:none!important;border:1px solid #e2e8f0!important;}
    }
  `;

  if (loading) return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36,height:36,border:`3px solid #e2e8f0`,borderTop:`3px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 16px' }}/>
        <p style={{ color:'#64748b',fontSize:'14px' }}>Generando certificado...</p>
      </div>
    </div>
  );

  const tierNombre = TIERS[userData?.tier] || 'SOC Rookie';
  const arenaColor = getArenaColor(userData?.arena);
  const skills     = userData?.skills || {};
  const fecha      = new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
  const certId     = userData?._id?.slice(-12).toUpperCase() || 'CERT000000';

  // ── URL CORRECTA ── apunta siempre a socblast.com/verificar/
  const verifyUrl  = `https://socblast.com/verificar/${certId}`;

  return (
    <>
      <style>{css}</style>

      {/* Navbar compartido */}
      <SBNav user={user} avatarConfig={null} foto="" activePage="/certificado" navigate={navigate}
        extra={<button onClick={handleDescargar} style={{padding:'7px 16px',borderRadius:100,background:ACC,border:'none',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',marginLeft:8}}>📥 PDF</button>}/>

      <div style={{ minHeight:'100vh',background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 40%,#f5f0ff 100%)',fontFamily:"'Inter',sans-serif",padding:'32px 24px 72px' }}>
        <div style={{ maxWidth:'800px',margin:'0 auto' }}>

          {/* CERTIFICADO */}
          <div className="fade-up cert-wrapper" ref={certRef}
            style={{ backgroundColor:'#fff',borderRadius:'20px',border:'1px solid #e2e8f0',boxShadow:'0 16px 56px rgba(79,70,229,0.1)',overflow:'hidden',marginBottom:'20px',position:'relative' }}>

            <div style={{ height:'6px',background:`linear-gradient(90deg,${ACC},#818cf8,${arenaColor})` }}/>

            <div style={{ position:'absolute',top:'-60px',right:'-60px',width:'220px',height:'220px',borderRadius:'50%',background:`radial-gradient(${ACC}12,transparent)`,pointerEvents:'none' }}/>
            <div style={{ position:'absolute',bottom:'-80px',left:'-60px',width:'260px',height:'260px',borderRadius:'50%',background:`radial-gradient(#818cf812,transparent)`,pointerEvents:'none' }}/>

            <div style={{ padding:'44px 52px' }}>

              {/* Header */}
              <div style={{ textAlign:'center',marginBottom:'36px' }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'12px' }}>
                  <img src="/logosoc.png" alt="SocBlast" style={{ height:'36px' }}/>
                  <span style={{ fontSize:'26px',fontWeight:900,color:'#0f172a',letterSpacing:'-0.8px' }}>Soc<span style={{ color:ACC }}>Blast</span></span>
                </div>
                <p style={{ fontSize:'11px',color:'#94a3b8',letterSpacing:'4px',fontWeight:700,marginBottom:'18px' }}>CERTIFICADO DE ANALISTA SOC</p>
                <div style={{ display:'flex',alignItems:'center',gap:'12px',justifyContent:'center' }}>
                  <div style={{ flex:1,height:'1px',background:'linear-gradient(90deg,transparent,#e2e8f0)' }}/>
                  <div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:ACC }}/>
                  <div style={{ flex:1,height:'1px',background:'linear-gradient(90deg,#e2e8f0,transparent)' }}/>
                </div>
              </div>

              {/* Nombre */}
              <div style={{ textAlign:'center',marginBottom:'36px' }}>
                <p style={{ fontSize:'13px',color:'#94a3b8',marginBottom:'10px' }}>Certifica que</p>
                <h2 style={{ fontSize:'36px',fontWeight:900,color:'#0f172a',letterSpacing:'-1px',marginBottom:'8px',lineHeight:1 }}>{userData?.nombre}</h2>
                <p style={{ fontSize:'13px',color:'#64748b',maxWidth:'420px',margin:'0 auto',lineHeight:1.7 }}>
                  ha demostrado competencias profesionales en ciberseguridad SOC mediante simulaciones reales en la plataforma SocBlast
                </p>
              </div>

              {/* Stats */}
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'32px' }}>
                {[
                  { label:'NIVEL',    value:tierNombre,                         color:ACC },
                  { label:'ARENA',    value:userData?.arena||'Bronce 3',        color:arenaColor },
                  { label:'XP TOTAL', value:(userData?.xp||0).toLocaleString(), color:'#7c3aed' },
                  { label:'SESIONES', value:userData?.sesiones_completadas||0,  color:'#059669' },
                ].map((s,i) => (
                  <div key={i} style={{ padding:'16px',borderRadius:'12px',backgroundColor:`${s.color}06`,border:`1px solid ${s.color}18`,textAlign:'center' }}>
                    <p style={{ fontSize:'9px',color:'#94a3b8',fontWeight:700,letterSpacing:'1.5px',marginBottom:'7px' }}>{s.label}</p>
                    <p style={{ fontSize:'15px',fontWeight:800,color:s.color,lineHeight:1.2 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div style={{ marginBottom:'32px' }}>
                <p style={{ fontSize:'10px',color:'#94a3b8',fontWeight:700,letterSpacing:'2px',textAlign:'center',marginBottom:'16px' }}>HABILIDADES CERTIFICADAS</p>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px' }}>
                  {Object.entries(SKILLS_NOMBRES).map(([key,nombre]) => {
                    const val   = skills[key] || 0;
                    const pct   = Math.min((val/10)*100, 100);
                    const color = {
                      analisis_logs:'#3b82f6', deteccion_amenazas:ACC,
                      respuesta_incidentes:'#f59e0b', threat_hunting:'#8b5cf6',
                      forense_digital:'#ec4899', gestion_vulnerabilidades:'#f97316',
                      inteligencia_amenazas:'#10b981',
                    }[key] || ACC;
                    return (
                      <div key={key} style={{ display:'flex',alignItems:'center',gap:'10px',padding:'10px 13px',borderRadius:'9px',backgroundColor:'#f8fafc',border:'1px solid #e8eaf0' }}>
                        <div style={{ width:'7px',height:'7px',borderRadius:'50%',backgroundColor:color,flexShrink:0 }}/>
                        <span style={{ fontSize:'12px',color:'#475569',flex:1 }}>{nombre}</span>
                        <div style={{ width:'60px',height:'4px',borderRadius:'2px',backgroundColor:'#e2e8f0',overflow:'hidden',flexShrink:0 }}>
                          <div style={{ width:`${pct}%`,height:'100%',borderRadius:'2px',backgroundColor:color }}/>
                        </div>
                        <span style={{ fontSize:'11px',color:color,fontWeight:700,width:'28px',textAlign:'right',flexShrink:0 }}>{val}/10</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',paddingTop:'24px',borderTop:'1px solid #e8eaf0' }}>

                <div>
                  <p style={{ fontSize:'10px',color:'#94a3b8',fontWeight:600,letterSpacing:'1px',marginBottom:'4px' }}>FECHA DE EMISIÓN</p>
                  <p style={{ fontSize:'14px',color:'#0f172a',fontWeight:600 }}>{fecha}</p>
                  <p style={{ fontSize:'11px',color:'#94a3b8',marginTop:'2px' }}>Cert. ID: {certId}</p>
                </div>

                <div style={{ textAlign:'center' }}>
                  {qrDataUrl ? (
                    <div style={{ padding:'8px',borderRadius:'12px',backgroundColor:'#fff',border:'2px solid #e2e8f0',display:'inline-block',boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                      <img src={qrDataUrl} alt="QR verificación" style={{ width:'100px',height:'100px',display:'block',borderRadius:'6px' }}/>
                    </div>
                  ) : (
                    <div style={{ width:'116px',height:'116px',borderRadius:'12px',backgroundColor:'#f8fafc',border:'2px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <div style={{ width:24,height:24,border:`2px solid #e2e8f0`,borderTop:`2px solid ${ACC}`,borderRadius:'50%',animation:'spin .8s linear infinite' }}/>
                    </div>
                  )}
                  <p style={{ fontSize:'10px',color:'#94a3b8',marginTop:'6px' }}>Escanea para verificar</p>
                </div>

                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:'10px',color:'#94a3b8',fontWeight:600,letterSpacing:'1px',marginBottom:'4px' }}>EMITIDO POR</p>
                  <p style={{ fontSize:'14px',color:'#0f172a',fontWeight:700 }}>SocBlast Platform</p>
                  <p style={{ fontSize:'11px',color:'#94a3b8',marginTop:'2px' }}>Powered by Zorion</p>
                  <div style={{ marginTop:'8px',padding:'3px 10px',borderRadius:'5px',backgroundColor:`${ACC}08`,border:`1px solid ${ACC}18`,display:'inline-block' }}>
                    <span style={{ fontSize:'10px',color:ACC,fontWeight:700 }}>✓ VERIFICABLE</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height:'4px',background:`linear-gradient(90deg,${arenaColor},${ACC},#818cf8)` }}/>
          </div>

          {/* Botones */}
          <div className="no-print" style={{ display:'flex',gap:'12px' }}>
            <button className="action-btn" onClick={handleDescargar}
              style={{ flex:1,padding:'14px',borderRadius:'12px',background:`linear-gradient(135deg,${ACC},#818cf8)`,border:'none',color:'#fff',fontWeight:700,fontSize:'14px',cursor:'pointer',boxShadow:`0 4px 16px ${ACC}25`,transition:'all .2s' }}>
              📥 Descargar PDF
            </button>
            <button className="action-btn"
              onClick={() => navigator.clipboard?.writeText(verifyUrl).then(() => alert('✓ URL copiada al portapapeles'))}
              style={{ flex:1,padding:'14px',borderRadius:'12px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#475569',fontWeight:600,fontSize:'14px',cursor:'pointer',transition:'all .2s' }}>
              🔗 Copiar URL verificación
            </button>
            <button className="action-btn" onClick={() => navigate('/perfil')}
              style={{ padding:'14px 20px',borderRadius:'12px',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',color:'#475569',fontWeight:600,fontSize:'14px',cursor:'pointer',transition:'all .2s' }}>
              Ver perfil
            </button>
          </div>

          <p style={{ textAlign:'center',color:'#cbd5e1',fontSize:'11px',marginTop:'20px' }}>
            Powered by Zorion · SocBlast Platform
          </p>
        </div>
      </div>
    </>
  );
}