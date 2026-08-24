import React, { useState, Suspense, lazy } from 'react';
import { supabase } from './lib/supabaseClient';

// --- IMPORT STATIC PAGES ---
import Login from './pages/Login';
import Register from './pages/Register';
import Portal from './pages/Portal';

// --- DYNAMIC IMPORTS / LAZY LOADING ---
const KrdeBiasDashboard = lazy(() => import('./pages/KrdeBiasDashboard.jsx'));
const KrdeMakparDashboard = lazy(() => import('./pages/KrdeMakparDashboard.jsx'));

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [currentPage, setCurrentPage] = useState('portal');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentPage('portal');
  };

  // Jika belum login, tampilkan Login atau Register dari file pages/
  if (!isLoggedIn) {
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return (
      <Login 
        onLoginSuccess={() => setIsLoggedIn(true)} 
        onSwitchToRegister={() => setAuthView('register')} 
      />
    );
  }

  // Jika sudah login, tampilkan Portal / Dashboard
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[#090d16] text-red-500 flex flex-col items-center justify-center font-black text-xs tracking-widest uppercase gap-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span>MEMUAT MODUL DASHBOARD...</span>
        </div>
      }
    >
      {(() => {
        switch (currentPage) {
          case 'portal':
            return (
              <Portal
                onSelectMenu={(menu) => setCurrentPage(menu)}
                onLogout={handleLogout}
              />
            );
          
          case 'krde_bias':
            return <KrdeBiasDashboard onBackToPortal={() => setCurrentPage('portal')} />;

          case 'krde_makpar':
            return <KrdeMakparDashboard onBackToPortal={() => setCurrentPage('portal')} />;

          default:
            return (
              <Portal 
                onSelectMenu={(menu) => setCurrentPage(menu)} 
                onLogout={handleLogout} 
              />
            );
        }
      })()}
    </Suspense>
  );
}