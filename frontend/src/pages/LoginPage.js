import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BG   = '#08082A';
const CARD = '#101346';
const BD   = '#1A1D50';
const T1   = '#FFFFFF';
const T2   = '#8B9BB4';
const T3   = '#3A3D6A';
const ACC  = '#2564F1';

const LoadingSpinner = () => (
  <div style={{ position: 'fixed', inset: 0, backgroundColor: BG, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
    <style>{`@keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
    <img src="/logosoc.png" alt="Cargando" style={{ width: '56px', height: '56px', animation: 'spinLogo 1s linear infinite' }} />
    <p style={{ fontSize: '12px', color: T3, fontFamily: 'monospace', letterSpacing: '2px' }}>CARGANDO...</p>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('https://socblast-production.up.railway.app/api/login', form);
      login({ nombre: res.data.nombre, rol: res.data.rol, email: form.email }, res.data.access_token);
      setLoading(false);
      navigate(res.data.rol === 'analista' ? '/dashboard' : '/company');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
      setLoading(false);
      // En el catch del handleSubmit:
if (err.response?.status === 403) {
  setError('Debes verificar tu email antes de entrar. Revisa tu bandeja de entrada.');
} else {
  setError('Credenciales incorrectas');
}
    }
  };

  const handleGoogle = () => {
    window.location.href = 'https://socblast-production.up.railway.app/api/auth/google';
  };

  const handleApple = () => {
    setError('Apple OAuth próximamente disponible');
  };

  const css = `
    @keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    .input-field:focus{border-color:${ACC} !important;outline:none;}
    .social-btn:hover{border-color:rgba(37,100,241,0.4) !important;background:rgba(37,100,241,0.08) !important;}
    .submit-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
    *{transition:filter 0.2s,transform 0.2s,border-color 0.2s,background 0.2s;}
  `;

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', backgroundColor: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Inter',-apple-system,sans-serif" }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img src="/logosoc.png" alt="SocBlast" style={{ width: '52px', height: '52px', marginBottom: '12px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: T1, letterSpacing: '-0.5px', marginBottom: '6px' }}>
              Soc<span style={{ color: ACC }}>Blast</span>
            </h1>
            <p style={{ fontSize: '13px', color: T2 }}>Inicia sesión en tu cuenta</p>
          </div>

          <div style={{ backgroundColor: CARD, border: `1px solid ${BD}`, borderRadius: '14px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${ACC}80,transparent)` }} />

            {error && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: '12px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <button className="social-btn" onClick={handleGoogle}
                style={{ width: '100%', padding: '11px', borderRadius: '8px', backgroundColor: BG, border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>

              <button className="social-btn" onClick={handleApple}
                style={{ width: '100%', padding: '11px', borderRadius: '8px', backgroundColor: BG, border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={T1}>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continuar con Apple
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: BD }} />
              <span style={{ fontSize: '11px', color: T3, fontFamily: 'monospace' }}>o con email</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: BD }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '6px' }}>EMAIL</label>
                <input className="input-field" type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                  placeholder="tu@email.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: BG, border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontFamily: "'Inter',sans-serif" }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '6px' }}>CONTRASEÑA</label>
                <input className="input-field" type="password" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: BG, border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontFamily: "'Inter',sans-serif" }} />
              </div>
            </div>

            <button className="submit-btn" onClick={handleSubmit}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: ACC, border: 'none', color: T1, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              Iniciar sesión
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: T3, marginTop: '20px' }}>
            ¿No tienes cuenta?{' '}
            <span onClick={() => navigate('/register')} style={{ color: ACC, cursor: 'pointer', fontWeight: 600 }}>Regístrate gratis</span>
          </p>
          <p style={{ textAlign: 'center', fontSize: '11px', color: T3, marginTop: '24px', fontFamily: 'monospace' }}>Powered by Zorion</p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
