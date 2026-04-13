import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email.trim()) { setError('El email es obligatorio'); return; }
    if (!form.password.trim()) { setError('La contraseña es obligatoria'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/api/login`, form);
      login({ nombre: res.data.nombre, rol: res.data.rol, email: form.email }, res.data.access_token);
      setLoading(false);
      navigate(res.data.rol === 'analista' ? '/dashboard' : '/company');
    } catch (err) {
      setLoading(false);
      setError(err.response?.status === 403 ? 'Debes verificar tu email antes de entrar.' : 'Email o contraseña incorrectos');
    }
  };

  const handleGoogle = () => { window.location.href = `${API}/api/auth/google`; };

  const css = `
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp 0.5s ease forwards}
    .inp:focus{outline:none;border-color:#4f46e5!important;box-shadow:0 0 0 3px rgba(79,70,229,0.12)!important}
    .inp{transition:border-color .15s,box-shadow .15s}
    .gbtn:hover{background:#f8f9fa!important;border-color:#c5cdd8!important}
    .sbtn:hover{opacity:.92!important;transform:translateY(-1px)!important}
    .guestbtn:hover{background:#f5f3ff!important;border-color:#c4b5fd!important;color:#4f46e5!important}
    .lnk:hover{text-decoration:underline}
    .stat-card{transition:transform .2s ease,box-shadow .2s ease}
    .stat-card:hover{transform:translateY(-3px)}
    *{box-sizing:border-box}
  `;

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f8f9fc', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:40, height:40, border:'3px solid #e2e8f0', borderTop:'3px solid #4f46e5', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <style>{css}</style>

      {/* ── PANEL IZQUIERDO ── */}
      <div style={{ flex:'0 0 52%', background:'linear-gradient(160deg,#0f0c29 0%,#1e1b4b 35%,#24006a 70%,#1e3a8a 100%)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px 52px', minHeight:'100vh', position:'relative', overflow:'hidden' }}>

        {/* Esferas decorativas */}
        <div style={{ position:'absolute', top:'-120px', right:'-80px', width:'420px', height:'420px', borderRadius:'50%', background:'radial-gradient(circle,rgba(129,140,248,0.12) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-100px', left:'-80px', width:'360px', height:'360px', borderRadius:'50%', background:'radial-gradient(circle,rgba(79,70,229,0.1) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'35%', left:'-60px', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 70%)', pointerEvents:'none' }}/>

        {/* Grid de puntos decorativos */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }}/>

        {/* Logo */}
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <img src="/logosoc.png" alt="SocBlast" style={{ width:'34px', height:'34px' }}/>
            <span style={{ fontSize:'19px', fontWeight:800, color:'#fff', letterSpacing:'-0.4px' }}>Soc<span style={{ color:'#a5b4fc' }}>Blast</span></span>
          </div>
        </div>

        {/* Contenido central */}
        <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'40px 0' }}>

          {/* Badge online */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'5px 13px', borderRadius:'100px', border:'1px solid rgba(165,180,252,0.25)', backgroundColor:'rgba(79,70,229,0.15)', marginBottom:'28px', width:'fit-content' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor:'#a5b4fc', animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:'11px', color:'#a5b4fc', fontWeight:700, letterSpacing:'2px' }}>SOC PLATFORM — ONLINE</span>
          </div>

          <h2 style={{ fontSize:'clamp(32px,3.5vw,46px)', fontWeight:900, color:'#fff', lineHeight:1.05, letterSpacing:'-1.5px', marginBottom:'16px' }}>
            Entrena como un<br/>
            <span style={{ background:'linear-gradient(135deg,#a5b4fc 0%,#c084fc 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              analista real.
            </span>
          </h2>
          <p style={{ fontSize:'15px', color:'#c7d2fe', lineHeight:1.75, maxWidth:'360px', marginBottom:'36px' }}>
            12 divisiones competitivas. Sesiones SOC generadas por IA. Certificado verificable con QR.
          </p>

          {/* Stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', maxWidth:'380px', marginBottom:'36px' }}>
            {[
              {v:'2.400+', l:'Analistas activos',   icon:'👥'},
              {v:'12',     l:'Divisiones de arena', icon:'🏆'},
              {v:'98%',    l:'Satisfacción',         icon:'⭐'},
              {v:'QR',     l:'Cert. verificable',   icon:'🛡️'},
            ].map((s,i)=>(
              <div key={i} className="stat-card" style={{ padding:'16px', borderRadius:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(8px)' }}>
                <div style={{ fontSize:'18px', marginBottom:'6px' }}>{s.icon}</div>
                <div style={{ fontSize:'20px', fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>{s.v}</div>
                <div style={{ fontSize:'11px', color:'#a5b4fc', marginTop:'2px' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {[
              'Escenarios únicos generados por IA en cada sesión',
              'Sistema de copas y arenas competitivo (Bronce → Diamante)',
              'Certificado profesional con código QR verificable',
            ].map((item,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'18px', height:'18px', borderRadius:'50%', backgroundColor:'rgba(165,180,252,0.15)', border:'1px solid rgba(165,180,252,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', backgroundColor:'#a5b4fc' }}/>
                </div>
                <span style={{ fontSize:'13px', color:'#c7d2fe', lineHeight:1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer izquierdo — Powered by Zorion centrado */}
        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'100%', height:'1px', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)', marginBottom:'16px' }}/>
          <img src="/logozorion.png" alt="Zorion" style={{ height:'20px', opacity:0.5 }}/>
          <span style={{ fontSize:'11px', color:'rgba(165,180,252,0.5)', letterSpacing:'2px', fontWeight:600 }}>POWERED BY ZORION</span>
        </div>
      </div>

      {/* ── PANEL DERECHO ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 40px', background:'linear-gradient(150deg,#f0f4ff 0%,#f8f9ff 50%,#f5f0ff 100%)' }}>
        <div className="fade-up" style={{ width:'100%', maxWidth:'400px' }}>

          {/* Header */}
          <div style={{ marginBottom:'28px' }}>
            <h1 style={{ fontSize:'28px', fontWeight:800, color:'#0f172a', letterSpacing:'-0.8px', marginBottom:'6px' }}>Bienvenido de nuevo</h1>
            <p style={{ fontSize:'14px', color:'#64748b' }}>Inicia sesión en tu cuenta SocBlast</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom:'18px', padding:'12px 16px', borderRadius:'10px', background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontSize:'13px', display:'flex', alignItems:'center', gap:'8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Google */}
          <button className="gbtn" onClick={handleGoogle}
            style={{ width:'100%', padding:'11px 16px', borderRadius:'10px', background:'#fff', border:'1.5px solid #e2e8f0', color:'#374151', fontSize:'14px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'10px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Invitado */}
          <button className="guestbtn" onClick={() => navigate('/guest')}
            style={{ width:'100%', padding:'10px 16px', borderRadius:'10px', background:'#fff', border:'1.5px solid #e2e8f0', color:'#64748b', fontSize:'13px', fontWeight:600, cursor:'pointer', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
            <span>👁️</span> Explorar como invitado
          </button>

          {/* Divisor */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px' }}>
            <div style={{ flex:1, height:'1px', background:'#e2e8f0' }}/>
            <span style={{ fontSize:'12px', color:'#94a3b8', fontWeight:500 }}>o con email</span>
            <div style={{ flex:1, height:'1px', background:'#e2e8f0' }}/>
          </div>

          {/* Inputs */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'18px' }}>
            {[
              {key:'email',    label:'Email',       type:'email',    placeholder:'tu@email.com'},
              {key:'password', label:'Contraseña',  type:'password', placeholder:'••••••••'},
            ].map(f=>(
              <div key={f.key}>
                <label style={{ fontSize:'13px', fontWeight:600, color:'#374151', display:'block', marginBottom:'6px' }}>{f.label}</label>
                <input className="inp" type={f.type} value={form[f.key]}
                  onChange={e=>setForm({...form,[f.key]:e.target.value})}
                  onKeyDown={e=>f.key==='password'&&e.key==='Enter'&&handleSubmit()}
                  placeholder={f.placeholder}
                  style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', background:'#fff', border:'1.5px solid #e2e8f0', color:'#0f172a', fontSize:'14px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}/>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button className="sbtn" onClick={handleSubmit}
            style={{ width:'100%', padding:'12px', borderRadius:'10px', background:'linear-gradient(135deg,#4f46e5,#6366f1)', border:'none', color:'#fff', fontWeight:700, fontSize:'15px', cursor:'pointer', boxShadow:'0 4px 16px rgba(79,70,229,0.35)', transition:'all .15s' }}>
            Iniciar sesión
          </button>

          <p style={{ textAlign:'center', fontSize:'13px', color:'#64748b', marginTop:'20px' }}>
            ¿No tienes cuenta?{' '}
            <span className="lnk" onClick={()=>navigate('/register')} style={{ color:'#4f46e5', cursor:'pointer', fontWeight:600 }}>
              Regístrate gratis
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;