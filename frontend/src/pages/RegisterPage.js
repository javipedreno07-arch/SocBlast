import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'https://socblast-production.up.railway.app';

const RegisterPage = ({ onGuestLogin }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'analista' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
    if (!form.email.trim()) { setError('El email es obligatorio'); return; }
    if (!form.password.trim()) { setError('La contraseña es obligatoria'); return; }
    if (form.password.length < 6) { setError('Mínimo 6 caracteres'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/api/register`, form);
      const res = await axios.post(`${API}/api/login`, { email: form.email, password: form.password });
      login({ nombre: res.data.nombre, rol: res.data.rol, email: form.email }, res.data.access_token);
      setLoading(false);
      navigate(res.data.rol === 'analista' ? '/dashboard' : '/company');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse');
      setLoading(false);
    }
  };

  const handleGoogle = () => { window.location.href = `${API}/api/auth/google`; };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f5f0ff 100%)', display: 'flex', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.5s ease forwards}
        .inp:focus{outline:none;border-color:#4f46e5 !important;box-shadow:0 0 0 3px rgba(79,70,229,0.12) !important}
        .inp{transition:border-color 0.15s,box-shadow 0.15s}
        .gbtn:hover{background:#f8f9fa !important;border-color:#c5cdd8 !important}
        .sbtn:hover{background:#4338ca !important}
        .guestbtn:hover{background:#f5f3ff !important;border-color:#c4b5fd !important}
        .rol-card{transition:border-color 0.15s,background 0.15s;cursor:pointer}
        .rol-card:hover{border-color:#a5b4fc !important}
        .lnk:hover{text-decoration:underline}
      `}</style>

      {/* LEFT PANEL */}
      <div style={{ flex: 1, background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logosoc.png" alt="SocBlast" style={{ width: 32, height: 32 }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Soc<span style={{ color: '#a5b4fc' }}>Blast</span></span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, color: '#a5b4fc', letterSpacing: '2px', fontWeight: 600, marginBottom: 16 }}>ÚNETE GRATIS</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 16 }}>Tu carrera SOC<br/>empieza aquí.</h2>
          <p style={{ fontSize: 15, color: '#c7d2fe', lineHeight: 1.7, maxWidth: 340, marginBottom: 40 }}>12 divisiones. De Bronce 3 a Diamante 1. ¿Hasta dónde llegarás?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[{v:'2.400+',l:'Analistas activos'},{v:'12',l:'Divisiones arena'},{v:'8',l:'Módulos training'},{v:'98%',l:'Satisfacción'}].map((s,i) => (
              <div key={i} style={{ padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{s.v}</div>
                <div style={{ fontSize: 12, color: '#a5b4fc', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#6366f1' }}>Powered by Zorion</div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflowY: 'auto' }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.8px', marginBottom: 6 }}>Crea tu cuenta</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>Gratis, sin tarjeta de crédito</p>
          </div>

          {error && <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{error}</div>}

          <button className="gbtn" onClick={handleGoogle} style={{ width: '100%', padding: '11px 16px', borderRadius: 10, background: '#fff', border: '1.5px solid #e2e8f0', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar con Google
          </button>

          <button className="guestbtn" onClick={onGuestLogin} style={{ width: '100%', padding: '10px 16px', borderRadius: 10, background: '#fff', border: '1.5px solid #e2e8f0', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 18 }}>
            👁 Explorar como invitado
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>o con email</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Soy un...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { id: 'analista', label: 'Analista SOC', sub: 'Quiero entrenar', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                { id: 'empresa', label: 'Empresa', sub: 'Busco talento', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> }
              ].map(r => (
                <div key={r.id} className="rol-card" onClick={() => setForm({ ...form, rol: r.id })}
                  style={{ padding: '14px', borderRadius: 10, background: form.rol === r.id ? '#eef2ff' : '#fff', border: `1.5px solid ${form.rol === r.id ? '#4f46e5' : '#e2e8f0'}` }}>
                  <div style={{ color: form.rol === r.id ? '#4f46e5' : '#94a3b8', marginBottom: 6 }}>{r.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.rol === r.id ? '#3730a3' : '#374151' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{r.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
            {[{key:'nombre',label:'Nombre',type:'text',placeholder:'Tu nombre'},{key:'email',label:'Email',type:'email',placeholder:'tu@email.com'},{key:'password',label:'Contraseña',type:'password',placeholder:'••••••••'}].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input className="inp" type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} onKeyDown={e => f.key === 'password' && e.key === 'Enter' && handleSubmit()} placeholder={f.placeholder}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: '#fff', border: '1.5px solid #e2e8f0', color: '#0f172a', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          <button className="sbtn" onClick={handleSubmit} style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#4f46e5', border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background 0.15s' }}>
            Crear cuenta gratis
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 16 }}>
            ¿Ya tienes cuenta?{' '}
            <span className="lnk" onClick={() => navigate('/login')} style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: 600 }}>Iniciar sesión</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
