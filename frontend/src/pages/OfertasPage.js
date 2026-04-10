import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const OfertasPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    arena_minima: 'Bronce',
    tier_minimo: 1,
    ubicacion: '',
    tipo_contrato: 'Indefinido',
    salario: ''
  });
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.titulo || !form.descripcion || !form.ubicacion) {
      alert('Rellena los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/ofertas', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnviado(true);
    } catch (err) {
      alert('Error publicando oferta');
    }
    setLoading(false);
  };

  if (enviado) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0F1E' }}>
      <div className="text-center p-8 rounded-2xl border max-w-md" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(124,58,237,0.3)' }}>
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-black text-white mb-2">¡Oferta publicada!</h2>
        <p className="text-gray-400 mb-6">Los analistas ya pueden ver tu oferta en la plataforma</p>
        <div className="flex gap-3">
          <button onClick={() => { setEnviado(false); setForm({ titulo: '', descripcion: '', arena_minima: 'Bronce', tier_minimo: 1, ubicacion: '', tipo_contrato: 'Indefinido', salario: '' }); }} className="flex-1 py-3 rounded-xl font-semibold text-white" style={{ backgroundColor: '#7C3AED' }}>
            Nueva oferta
          </button>
          <button onClick={() => navigate('/company')} className="flex-1 py-3 rounded-xl font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <nav className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-50" style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(10,15,30,0.95)' }}>
        <button onClick={() => navigate('/company')} className="text-gray-400 hover:text-white text-sm">← Dashboard</button>
        <span className="text-xl font-bold text-white">SoC<span style={{ color: '#7C3AED' }}>Blast</span> Publicar Oferta</span>
        <span></span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Título del puesto *</label>
            <input type="text" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Analista SOC Tier 2" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Descripción *</label>
            <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Describe el puesto, responsabilidades y requisitos..." rows={4} className="w-full px-4 py-3 rounded-xl text-white outline-none resize-none" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Arena mínima</label>
              <select value={form.arena_minima} onChange={e => setForm(p => ({ ...p, arena_minima: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {['Bronce', 'Plata', 'Oro', 'Elite'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Tier mínimo</label>
              <select value={form.tier_minimo} onChange={e => setForm(p => ({ ...p, tier_minimo: parseInt(e.target.value) }))} className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {[1,2,3,4,5,6,7,8].map(t => <option key={t} value={t}>Tier {t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Ubicación *</label>
              <input type="text" value={form.ubicacion} onChange={e => setForm(p => ({ ...p, ubicacion: e.target.value }))} placeholder="Madrid, España" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Tipo de contrato</label>
              <select value={form.tipo_contrato} onChange={e => setForm(p => ({ ...p, tipo_contrato: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {['Indefinido', 'Temporal', 'Freelance', 'Prácticas'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Salario (opcional)</label>
            <input type="text" value={form.salario} onChange={e => setForm(p => ({ ...p, salario: e.target.value }))} placeholder="30.000 - 40.000 €/año" className="w-full px-4 py-3 rounded-xl text-white outline-none" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full py-4 rounded-xl font-bold text-white transition hover:scale-105" style={{ backgroundColor: '#7C3AED', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
            {loading ? 'Publicando...' : '🚀 Publicar oferta'}
          </button>
        </div>
      </div>
      <p className="text-center text-gray-700 text-xs pb-4">Powered by Zorion</p>
    </div>
  );
};

export default OfertasPage;