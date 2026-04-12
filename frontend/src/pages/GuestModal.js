import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function GuestModal({ onClose, mensaje }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Función exclusiva</h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 28 }}>
          {mensaje || 'Crea una cuenta gratis para acceder a esta función y competir en las arenas SOC.'}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/register')} style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#4f46e5', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Crear cuenta gratis
          </button>
          <button onClick={() => navigate('/login')} style={{ padding: '12px 16px', borderRadius: 10, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Iniciar sesión
          </button>
        </div>
        <button onClick={onClose} style={{ marginTop: 12, background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Seguir explorando</button>
      </div>
    </div>
  );
}