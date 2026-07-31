import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient'; // Pastikan path client supabase-nya benar

import Portal from './pages/Portal';
import FracasDashboard from './pages/DashboardFracas.jsx';
import VrbDashboard from './pages/VrbDashboard.jsx';
import DcrDashboard from './pages/DcrDashboard.jsx';
import NcrDashboard from './pages/NcrDashboard.jsx';

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Proses Login Supabase Auth
    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (supabaseError) {
      console.error('Supabase Login Error:', supabaseError.message);
      setError('Kredensial Otorisasi Salah. Akses Ditolak!');
      setLoading(false);
    } else {
      console.log('Login Berhasil:', data);

      // 2. Catat otomatis ke tabel login_history di Supabase
      try {
        await supabase.from('login_history').insert([
          {
            user_id: data.user.id,
            user_email: data.user.email,
          }
        ]);
      } catch (err) {
        console.error('Gagal mencatat log:', err);
      }

      setLoading(false);
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-md w-full bg-[#1e293b]/60 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 font-black text-[9px] px-2.5 py-1 rounded border border-red-500/20 tracking-widest uppercase mb-3">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Secure Quality Portal
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Sign In Account</h2>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">PT INKA (Persero) × Danantara Indonesia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold p-3 rounded text-center uppercase tracking-wider">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Identity User Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full bg-[#0f172a]/90 border border-slate-800 rounded p-3 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Secure Guard Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0f172a]/90 border border-slate-800 rounded p-3 text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 font-black text-xs uppercase tracking-widest py-3 rounded shadow-lg mt-4 transition-colors"
          >
            {loading ? 'PROCESSING...' : 'LOGIN TO SYSTEM →'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('portal');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentPage('portal');
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Router Multi-Page Switch Handler
  switch (currentPage) {
    case 'portal':
      return (
        <Portal
          onSelectMenu={(menu) => setCurrentPage(menu)}
          onLogout={handleLogout}
        />
      );
    case 'fracas':
      return <FracasDashboard onBackToPortal={() => setCurrentPage('portal')} />;
    case 'vrb':
      return <VrbDashboard onBackToPortal={() => setCurrentPage('portal')} />;
    case 'dcr':
      return <DcrDashboard onBackToPortal={() => setCurrentPage('portal')} />;
    case 'ncr':
      return <NcrDashboard onBackToPortal={() => setCurrentPage('portal')} />;
    default:
      return <Portal onSelectMenu={(menu) => setCurrentPage(menu)} onLogout={handleLogout} />;
  }
}