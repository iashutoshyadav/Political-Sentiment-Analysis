import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Reports from './pages/Reports';
import Home from './pages/Home';

function Layout({ children, onOpenAuth }) {
  return (
    <div className="min-h-screen bg-chalk-50 selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden relative flex flex-col">
      {/* Global Aesthetic Overlays */}
      <div className="fixed inset-0 pointer-events-none z-[100] border-[12px] border-white/40" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 blueprint-grid" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.4] mix-blend-overlay z-50" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar onOpenAuth={onOpenAuth} />
        <main className="flex-grow pt-4">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' });

  const handleOpenAuth = (type = 'login') => {
    setAuthModal({ isOpen: true, type });
  };

  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
      }} />
      
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))} 
        initialType={authModal.type} 
      />

      <Routes>
        <Route path="/" element={<Layout onOpenAuth={handleOpenAuth}><Home onOpenAuth={handleOpenAuth} /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Layout onOpenAuth={handleOpenAuth}><Dashboard /></Layout></ProtectedRoute>
        } />
        <Route path="/analysis" element={
          <ProtectedRoute><Layout onOpenAuth={handleOpenAuth}><Analysis /></Layout></ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute><Layout onOpenAuth={handleOpenAuth}><Reports /></Layout></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
