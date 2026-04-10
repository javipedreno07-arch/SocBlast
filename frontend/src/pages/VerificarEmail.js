import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const BG  = '#03030A';
const ACC = '#2564F1';
const T1  = '#FFFFFF';
const T3  = '#5A7898';
const BD  = '#1A3050';

export default function VerificarEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('verificando'); // verificando | ok | error
  const token = params.get('token');

  useEffect(() => {
    if (!token) { setEstado('error'); return; }
    axios.get(`https://socblast-production.up.railway.app/api/verificar-email?token=${token}`)
      .then(() => setEstado('ok'))
      .catch(() => setEstado('error'));
  }, []);

  return (
    <div style={{ minHeight:'100vh', backgroundColor:BG, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ maxWidth:'440px', width:'100%', padding:'44px', borderRadius:'16px', backgroundColor:'rgba(14,26,46,0.9)', border:`1px solid ${BD}`, textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${ACC},transparent)` }}/>

        {estado === 'verificando' && (
          <>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>⏳</div>
            <h2 style={{ fontSize:'22px', fontWeight:800, color:T1, marginBottom:'8px' }}>Verificando...</h2>
            <p style={{ fontSize:'14px', color:T3 }}>Comprobando tu enlace de verificación</p>
          </>
        )}

        {estado === 'ok' && (
          <>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>✅</div>
            <h2 style={{ fontSize:'22px', fontWeight:800, color:T1, marginBottom:'8px' }}>¡Email verificado!</h2>
            <p style={{ fontSize:'14px', color:T3, marginBottom:'28px' }}>Tu cuenta está activa. Ya puedes iniciar sesión.</p>
            <button onClick={() => navigate('/login')}
              style={{ width:'100%', padding:'14px', borderRadius:'10px', backgroundColor:ACC, border:'none', color:T1, fontWeight:700, fontSize:'15px', cursor:'pointer' }}>
              Ir al login →
            </button>
          </>
        )}

        {estado === 'error' && (
          <>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>❌</div>
            <h2 style={{ fontSize:'22px', fontWeight:800, color:T1, marginBottom:'8px' }}>Enlace inválido</h2>
            <p style={{ fontSize:'14px', color:T3, marginBottom:'28px' }}>El enlace expiró o ya fue usado. Regístrate de nuevo.</p>
            <button onClick={() => navigate('/register')}
              style={{ width:'100%', padding:'14px', borderRadius:'10px', backgroundColor:ACC, border:'none', color:T1, fontWeight:700, fontSize:'15px', cursor:'pointer' }}>
              Registrarse
            </button>
          </>
        )}
      </div>
    </div>
  );
}
