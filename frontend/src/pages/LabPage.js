import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LabPage() {
  const navigate = useNavigate();
  
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(150deg,#f0f4ff,#f8f9ff,#f5f0ff)', fontFamily:"'Inter',sans-serif", display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', maxWidth:'500px', padding:'40px' }}>
        <div style={{ fontSize:'52px', marginBottom:'16px' }}>🔬</div>
        <h1 style={{ fontSize:'28px', fontWeight:900, color:'#0f172a', marginBottom:'8px', letterSpacing:'-0.8px' }}>Laboratorio SOC</h1>
        <p style={{ fontSize:'14px', color:'#64748b', marginBottom:'28px', lineHeight:1.7 }}>
          Investigación forense libre y evaluada. SIEM completo, Log Explorer, Network Map y evaluación IA.
        </p>
        <div style={{ padding:'14px 18px', borderRadius:'12px', backgroundColor:'#f0fdf4', border:'1px solid #bbf7d0', marginBottom:'24px' }}>
          <p style={{ fontSize:'13px', color:'#15803d' }}>🚧 En construcción — disponible muy pronto</p>
        </div>
        <button onClick={()=>navigate('/dashboard')} style={{ padding:'12px 28px', borderRadius:'100px', background:'#4f46e5', border:'none', color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer' }}>
          ← Volver al dashboard
        </button>
      </div>
    </div>
  );
}