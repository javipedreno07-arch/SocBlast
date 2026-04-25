import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import VerificarCertificado from './pages/VerificarCertificado';
import MaintenancePage from './pages/MaintenancePage';
import AnalystCardPage from './pages/AnalystCardPage';
import AvatarPage from './pages/AvatarPage';

const MAINTENANCE_MODE = true;

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
  skills: {
    analisis_logs: 3, deteccion_amenazas: 2, respuesta_incidentes: 2,
    threat_hunting: 1, forense_digital: 1, gestion_vulnerabilidades: 1, inteligencia_amenazas: 1,
  }
};

const safeLS = {
  get:    (k)    => { try { return localStorage.getItem(k); }    catch { return null; } },
  set:    (k, v) => { try { localStorage.setItem(k, v); }        catch {} },
  remove: (k)    => { try { localStorage.removeItem(k); }        catch {} },
};

const isEmpresa = (rol) => rol === 'empresa' || rol === 'company';

const PrivateRoute = ({ children, rol }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', backgroundColor:'#f5f7fa', color:'#0f172a' }}>
      Cargando...
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (rol === 'empresa' && !isEmpresa(user.rol)) return <Navigate to="/" />;
  if (rol && rol !== 'empresa' && user.rol !== rol) return <Navigate to="/" />;
  return children;
};

const getHome = (rol) => {
  if (!rol) return '/login';
  if (rol === 'analista') return '/dashboard';
  if (isEmpresa(rol)) return '/company';
  return '/';
};

const MaintenanceRoutes = () => (
  <Routes>
    <Route path="/verificar/:certId" element={<VerificarCertificado />} />
    <Route path="*" element={<MaintenancePage />} />
  </Routes>
);

const AppRoutes = ({ onGuestLogin }) => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage onGuestLogin={onGuestLogin} />} />
      <Route path="/login"    element={user ? <Navigate to={getHome(user.rol)} /> : <LoginPage    onGuestLogin={onGuestLogin} />} />
      <Route path="/register" element={user ? <Navigate to={getHome(user.rol)} /> : <RegisterPage onGuestLogin={onGuestLogin} />} />
      <Route path="/verificar/:certId" element={<VerificarCertificado />} />

      {/* ── Rutas analista ── */}
      <Route path="/dashboard"    element={<PrivateRoute rol="analista"><DashboardAnalista /></PrivateRoute>} />
      <Route path="/arenas"       element={<PrivateRoute rol="analista"><ArenasPage /></PrivateRoute>} />
      <Route path="/sesion"       element={<PrivateRoute rol="analista"><SesionPage /></PrivateRoute>} />
      <Route path="/training"     element={<PrivateRoute rol="analista"><TrainingPage /></PrivateRoute>} />
      <Route path="/ranking"      element={<PrivateRoute rol="analista"><RankingPage /></PrivateRoute>} />
      <Route path="/perfil"       element={<PrivateRoute rol="analista"><PerfilPage /></PrivateRoute>} />
      <Route path="/certificado"  element={<PrivateRoute rol="analista"><CertificadoPage /></PrivateRoute>} />
      <Route path="/analyst-card" element={<PrivateRoute rol="analista"><AnalystCardPage /></PrivateRoute>} />
      <Route path="/avatar"       element={<PrivateRoute rol="analista"><AvatarPage /></PrivateRoute>} />
      <Route path="/lab"          element={<LabPage />} />

      {/* ── Rutas empresa ── */}
      <Route path="/company"            element={<PrivateRoute rol="empresa"><DashboardCompany /></PrivateRoute>} />
      <Route path="/talent-pool"        element={<PrivateRoute rol="empresa"><TalentPoolPage /></PrivateRoute>} />
      <Route path="/simulacion-empresa" element={<PrivateRoute rol="empresa"><SimulacionPage /></PrivateRoute>} />
      <Route path="/ofertas"            element={<PrivateRoute rol="empresa"><OfertasPage /></PrivateRoute>} />

      {/* ── Misc ── */}
      <Route path="/oauth/callback"   element={<OAuthCallback />} />
      <Route path="/registro-exitoso" element={<RegistroExitoso />} />
      <Route path="/verificar-email"  element={<VerificarEmail />} />
      <Route path="/guest"            element={<DashboardGuest />} />
    </Routes>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleGuestLogin = () => {
    safeLS.set('token', 'guest-token');
    safeLS.set('user', JSON.stringify(GUEST_USER));
    window.location.href = '/dashboard';
  };

  if (MAINTENANCE_MODE) {
    return (
      <Router>
        <MaintenanceRoutes />
      </Router>
    );
  }

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