
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
 
const BG   = '#03030A';
const CARD = 'rgba(14,26,46,0.95)';
const BD   = '#1A3050';
const T1   = '#FFFFFF';
const T2   = '#C8D8F0';
const T3   = '#5A7898';
const ACC  = '#2564F1';
const API  = 'https://socblast-production.up.railway.app';
 
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
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/login`, form);
      login({ nombre: res.data.nombre, rol: res.data.rol, email: form.email }, res.data.access_token);
      setLoading(false);
      navigate(res.data.rol === 'analista' ? '/dashboard' : '/company');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Debes verificar tu email antes de entrar. Revisa tu bandeja de entrada.');
      } else {
        setError(err.response?.data?.detail || 'Credenciales incorrectas');
      }
      setLoading(false);
    }
  };
 
  const handleGoogle = () => { window.location.href = `${API}/api/auth/google`; };
 
  const css = `
    @keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
    .fade-up{animation:fadeUp 0.4s ease forwards;}
    .input-field{transition:border-color 0.2s!important;}
    .input-field:focus{border-color:${ACC}!important;outline:none!important;box-shadow:0 0 0 3px rgba(37,100,241,0.1)!important;}
    .social-btn:hover{border-color:rgba(37,100,241,0.5)!important;background:rgba(37,100,241,0.08)!important;}
    .submit-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
    .submit-btn{transition:filter 0.2s,transform 0.2s!important;}
    .link-btn:hover{color:${T1}!important;}
  `;
 
  if (loading) return <LoadingSpinner />;
 
  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', backgroundColor: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Inter',-apple-system,sans-serif", position: 'relative', overflow: 'hidden' }}>
 
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: `radial-gradient(ellipse, rgba(37,100,241,0.06) 0%, transparent 70%)`, pointerEvents: 'none' }} />
 
        <div className="fade-up" style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
 
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '14px', backgroundColor: `${ACC}15`, border: `1px solid ${ACC}30`, marginBottom: '16px' }}>
              <img src="/logosoc.png" alt="SocBlast" style={{ width: '32px', height: '32px' }} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: T1, letterSpacing: '-0.5px', marginBottom: '6px' }}>
              Soc<span style={{ color: ACC }}>Blast</span>
            </h1>
            <p style={{ fontSize: '13px', color: T3 }}>Accede a tu cuenta</p>
          </div>
 
          {/* Card */}
          <div style={{ backgroundColor: CARD, border: `1px solid ${BD}`, borderRadius: '16px', padding: '32px', backdropFilter: 'blur(20px)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent,${ACC}60,transparent)` }} />
 
            {error && (
              <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', fontSize: '13px', lineHeight: 1.5 }}>
                {error}
              </div>
            )}
 
            {/* Google */}
            <button className="social-btn" onClick={handleGoogle}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${BD}`, color: T2, fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>
 
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: BD }} />
              <span style={{ fontSize: '11px', color: T3, fontFamily: 'monospace', letterSpacing: '1px' }}>O CON EMAIL</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: BD }} />
            </div>
 
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '8px' }}>EMAIL</label>
                <input className="input-field" type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="tu@email.com"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: T3, fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', marginBottom: '8px' }}>CONTRASEÑA</label>
                <input className="input-field" type="password" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${BD}`, color: T1, fontSize: '13px', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' }} />
              </div>
            </div>
 
            <button className="submit-btn" onClick={handleSubmit}
              style={{ width: '100%', padding: '13px', borderRadius: '10px', background: `linear-gradient(135deg, ${ACC}, #1a4fd6)`, border: 'none', color: T1, fontWeight: 700, fontSize: '14px', cursor: 'pointer', letterSpacing: '0.2px' }}>
              Iniciar sesión
            </button>
          </div>
 
          <p style={{ textAlign: 'center', fontSize: '13px', color: T3, marginTop: '24px' }}>
            ¿No tienes cuenta?{' '}
            <span className="link-btn" onClick={() => navigate('/register')} style={{ color: ACC, cursor: 'pointer', fontWeight: 600, transition: 'color 0.2s' }}>Regístrate gratis</span>
          </p>
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#1A3050', marginTop: '16px', fontFamily: 'monospace' }}>Powered by Zorion</p>
        </div>
      </div>
    </>
  );
};
 
export default LoginPage;
