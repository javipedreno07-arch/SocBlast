import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegistroExitoso() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#08082A', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:'440px', width:'100%', padding:'44px', borderRadius:'16px', backgroundColor:'rgba(14,26,46,0.9)', border:'1px solid #1A3050', textAlign:'center' }}>
        <div style={{ fontSize:'52px', marginBottom:'16px' }}>📬</div>
        <h2 style={{ color:'#fff', fontSize:'22px', fontWeight:800, marginBottom:'10px' }}>¡Revisa tu email!</h2>
        <p style={{ color:'#5A7898', fontSize:'14px', lineHeight:1.7, marginBottom:'28px' }}>
          Te hemos enviado un enlace de verificación.<br/>
          Haz clic en él para activar tu cuenta.
        </p>
        <button onClick={() => navigate('/login')}
          style={{ width:'100%', padding:'13px', borderRadius:'9px', backgroundColor:'#2564F1', border:'none', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
          Ir al login
        </button>
      </div>
    </div>
  );
}
