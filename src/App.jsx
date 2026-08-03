import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient';

import Portal from './pages/Portal';
import FracasDashboard from './pages/DashboardFracas.jsx';
import VrbDashboard from './pages/VrbDashboard.jsx';
import DcrDashboard from './pages/DcrDashboard.jsx';
import NcrDashboard from './pages/NcrDashboard.jsx';

// --- COMPONENT FORM REGISTER ---
function RegisterForm({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    // 1. Buat User di Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMsg({ type: 'error', text: authError.message.toUpperCase() });
      setLoading(false);
      return;
    }

    // 2. Simpan Registrasi ke login_history dengan status 'pending'
    if (data?.user) {
      const { error: dbError } = await supabase.from('login_history').insert([
        {
          user_id: data.user.id,
          user_email: email,
          status: 'pending' // Auto pending buat di ACC Admin
        }
      ]);

      if (dbError) {
        console.error('Gagal catat status:', dbError);
      }
    }

    setLoading(false);
    setMsg({
      type: 'success',
      text: 'REGISTRASI BERHASIL! MOHON TUNGGU ACC / PERSETUJUAN DARI ADMIN.'
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-[#1e293b]/60 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 font-black text-[9px] px-2.5 py-1 rounded border border-red-500/20 tracking-widest uppercase mb-3">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Account Registration
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Request New Account</h2>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">PT INKA (Persero) × Danantara Indonesia</p>
        </div>

        {msg.text && (
          <div className={`border text-[11px] font-bold p-3 rounded text-center uppercase tracking-wider mb-4 ${
            msg.type === 'error' 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {msg.type === 'error' ? '⚠️ ' : '✅ '} {msg.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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
            {loading ? 'PROCESSING...' : 'SUBMIT REGISTRATION →'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
          <p className="text-[11px] text-slate-400 font-medium">
            Sudah punya akun?{' '}
            <button 
              onClick={onSwitchToLogin} 
              className="text-red-400 font-bold hover:underline ml-1 uppercase"
            >
              Kembali ke Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENT FORM LOGIN + CEK ACC ---
function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Login via Supabase Auth
    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (supabaseError) {
      console.error('Supabase Login Error:', supabaseError.message);
      setError('KREDENSIAL OTORISASI SALAH. AKSES DITOLAK!');
      setLoading(false);
      return;
    }

    // 2. Cek Status ACC di Tabel database
    const { data: userRecords, error: statusError } = await supabase
      .from('login_history')
      .select('status')
      .eq('user_email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    // Ambil status dan bersihkan dari tanda petik jika ada
    let rawStatus = userRecords && userRecords.length > 0 ? userRecords[0].status : null;
    const currentStatus = rawStatus ? rawStatus.replace(/['"]/g, '').trim().toLowerCase() : null;

    if (statusError || !currentStatus || currentStatus === 'pending') {
      await supabase.auth.signOut();
      setError('AKUN MASIH MENUNGGU ACC / PERSETUJUAN ADMIN!');
      setLoading(false);
      return;
    }

    if (currentStatus === 'rejected') {
      await supabase.auth.signOut();
      setError('PENDAFTARAN AKUN ANDA DITOLAK OLEH ADMIN.');
      setLoading(false);
      return;
    }

    // 3. Jika status 'approved', lanjut masuk
    if (currentStatus === 'approved') {
      setLoading(false);
      onLoginSuccess();
    } else {
      await supabase.auth.signOut();
      setError('STATUS AKUN TIDAK VALID. HUBUNGI ADMIN!');
      setLoading(false);
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

        <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
          <p className="text-[11px] text-slate-400 font-medium">
            Belum punya akses akun?{' '}
            <button 
              onClick={onSwitchToRegister} 
              className="text-red-400 font-bold hover:underline ml-1 uppercase"
            >
              Daftar / Request Akun
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- MAIN APP ENTRY ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [currentPage, setCurrentPage] = useState('portal');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentPage('portal');
  };

  // Jika belum login
  if (!isLoggedIn) {
    if (authView === 'register') {
      return <RegisterForm onSwitchToLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginForm 
        onLoginSuccess={() => setIsLoggedIn(true)} 
        onSwitchToRegister={() => setAuthView('register')} 
      />
    );
  }

  // Multi-Page Router Switch
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