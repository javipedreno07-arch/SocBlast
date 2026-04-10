import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TIERS = ['', 'SOC Rookie', 'SOC Analyst', 'SOC Specialist', 'SOC Expert', 'SOC Sentinel', 'SOC Architect', 'SOC Master', 'SOC Legend'];
const SKILLS_NOMBRES = {
  analisis_logs: 'Análisis de Logs',
  deteccion_amenazas: 'Detección de Amenazas',
  respuesta_incidentes: 'Respuesta a Incidentes',
  threat_hunting: 'Threat Hunting',
  forense_digital: 'Forense Digital',
  gestion_vulnerabilidades: 'Gestión de Vulnerabilidades',
  inteligencia_amenazas: 'Inteligencia de Amenazas'
};

const CertificadoPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const certRef = useRef(null);

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDescargar = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0F1E' }}>
      <p className="text-gray-500 animate-pulse">Generando certificado...</p>
    </div>
  );

  const tierNombre = TIERS[userData?.tier] || 'SOC Rookie';
  const skills = userData?.skills || {};
  const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const qrId = userData?._id?.slice(-8).toUpperCase() || 'XXXXXXXX';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <nav className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-50 print:hidden" style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(10,15,30,0.95)' }}>
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white text-sm transition">← Dashboard</button>
        <span className="text-xl font-bold text-white">SoC<span style={{ color: '#3B82F6' }}>Blast</span> Certificado</span>
        <button onClick={handleDescargar} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:scale-105" style={{ backgroundColor: '#3B82F6' }}>
          📥 Descargar PDF
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div ref={certRef} className="p-8 rounded-2xl border relative overflow-hidden" style={{ backgroundColor: '#050A14', borderColor: 'rgba(59,130,246,0.4)', boxShadow: '0 0 60px rgba(59,130,246,0.1)' }}>
          <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 20% 20%, #3B82F6, transparent), radial-gradient(circle at 80% 80%, #7C3AED, transparent)' }}></div>

          <div className="relative text-center mb-8">
            <p className="text-gray-500 text-xs font-mono tracking-widest mb-2">POWERED BY ZORION</p>
            <h1 className="text-4xl font-black text-white mb-1">SoC<span style={{ color: '#3B82F6' }}>Blast</span></h1>
            <p className="text-gray-400 text-sm tracking-widest">CERTIFICADO DE ANALISTA SOC</p>
            <div className="w-24 h-0.5 mx-auto mt-3" style={{ backgroundColor: '#3B82F6' }}></div>
          </div>

          <div className="relative text-center mb-8">
            <p className="text-gray-500 text-sm mb-2">Certifica que</p>
            <h2 className="text-3xl font-black text-white mb-1">{userData?.nombre}</h2>
            <p className="text-gray-400 text-sm">ha demostrado competencias profesionales en ciberseguridad SOC</p>
          </div>

          <div className="relative grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-gray-500 text-xs mb-1">NIVEL</p>
              <p className="text-white font-bold">{tierNombre}</p>
              <p className="text-gray-400 text-xs">{userData?.xp || 0} XP acumulada</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-gray-500 text-xs mb-1">ARENA</p>
              <p className="text-white font-bold">{userData?.arena || 'Bronce'}</p>
              <p className="text-gray-400 text-xs">{userData?.copas || 0} copas</p>
            </div>
          </div>

          <div className="relative mb-8">
            <p className="text-gray-500 text-xs text-center mb-4 tracking-widest">HABILIDADES CERTIFICADAS</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(SKILLS_NOMBRES).map(([key, nombre]) => {
                const xpSkill = skills[key] || 0;
                const nivel = xpSkill > 0 ? Math.min(Math.floor(xpSkill / 10) + 1, 10) : 0;
                return (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-gray-400 text-xs">{nombre}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: i < Math.ceil(nivel / 2) ? '#3B82F6' : 'rgba(255,255,255,0.1)' }}></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Sesiones completadas', value: userData?.sesiones_completadas || 0 },
              { label: 'Copas totales', value: userData?.copas || 0 },
              { label: 'XP total', value: userData?.xp || 0 },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-gray-600 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="relative flex items-end justify-between pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div>
              <p className="text-gray-600 text-xs">Fecha de emisión</p>
              <p className="text-gray-400 text-sm">{fecha}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <div className="text-center">
                  <p className="text-blue-400 font-mono text-xs font-bold">{qrId}</p>
                  <p className="text-gray-600 text-xs">QR ID</p>
                </div>
              </div>
              <p className="text-gray-600 text-xs">Verificable en</p>
              <p className="text-gray-500 text-xs">socblast.com/verify</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 text-xs">Emitido por</p>
              <p className="text-gray-400 text-sm">SoCBlast Platform</p>
              <p className="text-gray-600 text-xs">Powered by Zorion</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button onClick={handleDescargar} className="flex-1 py-3 rounded-xl font-semibold text-white transition hover:scale-105" style={{ backgroundColor: '#3B82F6' }}>
            📥 Descargar PDF
          </button>
          <button onClick={() => navigate('/perfil')} className="flex-1 py-3 rounded-xl font-semibold transition hover:scale-105" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }}>
            Ver perfil completo
          </button>
        </div>
      </div>
      <p className="text-center text-gray-700 text-xs pb-4">Powered by Zorion</p>
    </div>
  );
};

export default CertificadoPage;