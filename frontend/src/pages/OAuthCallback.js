import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BG = '#08082A';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const rol = params.get('rol');
    const nombre = params.get('nombre');
    if (token && rol && nombre) {
      login({ nombre, rol }, token);
      navigate(rol === 'analista' ? '/dashboard' : '/company');
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <style>{`@keyframes spinLogo{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
      <img src="/logosoc.png" alt="Cargando" style={{ width: '56px', height: '56px', animation: 'spinLogo 1s linear infinite' }} />
      <p style={{ fontSize: '12px', color: '#3A3D6A', fontFamily: 'monospace', letterSpacing: '2px' }}>CONECTANDO...</p>
    </div>
  );
};

export default OAuthCallback;
