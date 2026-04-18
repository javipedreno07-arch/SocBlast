import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardAnalista from './pages/DashboardAnalista';
import DashboardCompany from './pages/DashboardCompany';
import SesionPage from './pages/SesionPage';
import TrainingPage from './pages/TrainingPage';
import RankingPage from './pages/RankingPage';
import PerfilPage from './pages/PerfilPage';
import CertificadoPage from './pages/CertificadoPage';
import TalentPoolPage from './pages/TalentPoolPage';
import SimulacionPage from './pages/SimulacionPage';
import OfertasPage from './pages/OfertasPage';
import SplashScreen from './components/SplashScreen';
import OAuthCallback from './pages/OAuthCallback';
import RegistroExitoso from './pages/RegistroExitoso';
import VerificarEmail from './pages/VerificarEmail';
import ArenasPage from './pages/ArenasPage';
import DashboardGuest from './pages/DashboardGuest';
import LabPage from './pages/LabPage';

const GUEST_USER = {
  nombre: 'Invitado',
  rol: 'analista',
  email: 'guest@socblast.com',
  copas: 450,
  xp: 820,
  tier: 2,
  arena: 'Plata 3',
  sesiones_completadas: 3,
  isGuest: true,
  skills: { analisis_logs: 3, deteccion_amenazas: 2, respuesta_incidentes: 2, threat_hunting: 1, forense_digital: 1, gestion_vulnerabilidades: 1, inteligencia_amenazas: 1 }
};

const PrivateRoute = ({ children, rol }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', backgroundColor:'#f5f7fa', color:'#0f172a' }}>
      Cargando...
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (rol && user.rol !== rol) return <Navigate to="/" />;
  return children;
};

const AppRoutes = ({ onGuestLogin }) => {
  const { user } = useAuth();
  const home = user ? (user.rol === 'analista' ? '/dashboard' : '/company') : null;
  return (
    <Routes>
      <Route path="/" element={<LandingPage onGuestLogin={onGuestLogin} />} />
      <Route path="/login"    element={home ? <Navigate to={home} replace /> : <LoginPage onGuestLogin={onGuestLogin} />} />
      <Route path="/register" element={home ? <Navigate to={home} replace /> : <RegisterPage onGuestLogin={onGuestLogin} />} />
      <Route path="/dashboard"         element={<PrivateRoute rol="analista"><DashboardAnalista /></PrivateRoute>} />
      <Route path="/arenas"            element={<PrivateRoute rol="analista"><ArenasPage /></PrivateRoute>} />
      <Route path="/sesion"            element={<PrivateRoute rol="analista"><SesionPage /></PrivateRoute>} />
      <Route path="/training"          element={<PrivateRoute rol="analista"><TrainingPage /></PrivateRoute>} />
      <Route path="/ranking"           element={<PrivateRoute rol="analista"><RankingPage /></PrivateRoute>} />
      <Route path="/perfil"            element={<PrivateRoute rol="analista"><PerfilPage /></PrivateRoute>} />
      <Route path="/certificado"       element={<PrivateRoute rol="analista"><CertificadoPage /></PrivateRoute>} />
      <Route path="/company"           element={<PrivateRoute rol="company"><DashboardCompany /></PrivateRoute>} />
      <Route path="/talent-pool"       element={<PrivateRoute rol="company"><TalentPoolPage /></PrivateRoute>} />
      <Route path="/simulacion-empresa"element={<PrivateRoute rol="company"><SimulacionPage /></PrivateRoute>} />
      <Route path="/ofertas"           element={<PrivateRoute rol="company"><OfertasPage /></PrivateRoute>} />
      <Route path="/oauth/callback"    element={<OAuthCallback />} />
      <Route path="/registro-exitoso"  element={<RegistroExitoso />} />
      <Route path="/verificar-email"   element={<VerificarEmail />} />
      <Route path="/guest"             element={<DashboardGuest />} />
      <Route path="/lab"               element={<LabPage />} />
    </Routes>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleGuestLogin = () => {
    try { localStorage.setItem('token', 'guest-token'); localStorage.setItem('user', JSON.stringify(GUEST_USER)); } catch {}
    window.location.href = '/dashboard';
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.4s ease' }}>
        <AuthProvider>
          <Router>
            <AppRoutes onGuestLogin={handleGuestLogin} />
          </Router>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;
