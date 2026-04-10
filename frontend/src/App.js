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


const PrivateRoute = ({ children, rol }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#060A14', color: 'white' }}>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (rol && user.rol !== rol) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={user.rol === 'analista' ? '/dashboard' : '/company'} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={user.rol === 'analista' ? '/dashboard' : '/company'} /> : <RegisterPage />} />
      <Route path="/dashboard" element={<PrivateRoute rol="analista"><DashboardAnalista /></PrivateRoute>} />
      <Route path="/sesion" element={<PrivateRoute rol="analista"><SesionPage /></PrivateRoute>} />
      <Route path="/training" element={<PrivateRoute rol="analista"><TrainingPage /></PrivateRoute>} />
      <Route path="/ranking" element={<PrivateRoute rol="analista"><RankingPage /></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute rol="analista"><PerfilPage /></PrivateRoute>} />
      <Route path="/certificado" element={<PrivateRoute rol="analista"><CertificadoPage /></PrivateRoute>} />
      <Route path="/company" element={<PrivateRoute rol="company"><DashboardCompany /></PrivateRoute>} />
      <Route path="/talent-pool" element={<PrivateRoute rol="company"><TalentPoolPage /></PrivateRoute>} />
      <Route path="/simulacion-empresa" element={<PrivateRoute rol="company"><SimulacionPage /></PrivateRoute>} />
      <Route path="/ofertas" element={<PrivateRoute rol="company"><OfertasPage /></PrivateRoute>} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/registro-exitoso" element={<RegistroExitoso />} />
<Route path="/verificar-email" element={<VerificarEmail />} />
    </Routes>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.4s ease' }}>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;