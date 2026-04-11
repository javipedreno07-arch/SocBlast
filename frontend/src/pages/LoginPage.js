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
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/login`, form);
      login({ nombre: res.data.nombre, rol: res.data.rol, email: form.email }, res.data.access_token);
      setLoading(false);
      navigate(res.data.rol === 'analista' ? '/dashboard' : '/company');
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 403) {
        setError('Debes verificar tu email antes de entrar.');
      } else {
        setError('Email o contraseña incorrectos');
      }
    }
  };

  const handleGoogle = () => { window.location.href = `${API}/api/auth/google`; };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f0f7ff 100%)', display: 'flex', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.5s ease forwards}
        .inp:focus{outline:none;border-color:#2563eb !important;box-shadow:0 0 0 3px rgba(37,99,235,0.12) !important}
        .inp{transition:border-color 0.15s,box-shadow 0.15s}
        .gbtn:hover{background:#f8f9fa !important;border-color:#c5cdd8 !important}
        .sbtn:hover{background:#1d4ed8 !important}
        .lnk:hover{text-decoration:underline}
      `}</style>

      {/* LEFT PANEL */}
      <div style={{ flex: 1, background: '#1e40af', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logosoc.png" alt="SocBlast" style={{ width: 32, height: 32 }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Soc<span style={{ color: '#93c5fd' }}>Blast</span></span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, color: '#93c5fd', letterSpacing: '2px', fontWeight: 600, marginBottom: 16 }}>SOC PLATFORM</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 16 }}>Entrena como un<br/>analista real.</h2>
          <p style={{ fontSize: 15, color: '#bfdbfe', lineHeight: 1.7, maxWidth: 340 }}>Simulaciones de ciberseguridad del mundo real. Demuestra tu nivel con certificados verificables.</p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Escenarios SOC generados por IA', 'Sistema de arenas competitivo', 'Certificado con QR verificable'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="2,5 4,7 8,3" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <span style={{ fontSize: 13, color: '#bfdbfe' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', fontSize: 12, color: '#60a5fa' }}>Powered by Zorion</div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.8px', marginBottom: 8 }}>Bienvenido de nuevo</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>Inicia sesión en tu cuenta SocBlast</p>
          </div>

          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button className="gbtn" onClick={handleGoogle} style={{ width: '100%', padding: '11px 16px', borderRadius: 10, background: '#fff', border: '1.5px solid #e2e8f0', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>o con email</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {[{ key: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com' }, { key: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••' }].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input className="inp" type={f.type} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  onKeyDown={e => f.key === 'password' && e.key === 'Enter' && handleSubmit()}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: '#fff', border: '1.5px solid #e2e8f0', color: '#0f172a', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          <button className="sbtn" onClick={handleSubmit} style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#2563eb', border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'background 0.15s' }}>
            Iniciar sesión
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 24 }}>
            ¿No tienes cuenta?{' '}
            <span className="lnk" onClick={() => navigate('/register')} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>Regístrate gratis</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;