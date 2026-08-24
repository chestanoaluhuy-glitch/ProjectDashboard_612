import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (supabaseError) {
      setError('KREDENSIAL OTORISASI SALAH. AKSES DITOLAK!');
      setLoading(false);
      return;
    }

    const { data: userRecords, error: statusError } = await supabase
      .from('login_history')
      .select('status')
      .eq('user_email', email)
      .order('created_at', { ascending: false })
      .limit(1);

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
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col justify-between selection:bg-red-600 selection:text-white relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER NAV RESMI */}
      <header className="relative z-10 border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur-md px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-lg shadow-md border border-slate-300 overflow-hidden">
            <img 
              src="/logo-inka.png" 
              alt="PT INKA" 
              className="h-6 w-auto object-contain brightness-100 contrast-100" 
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
            <div className="h-5 w-[1px] bg-slate-300" />
            <img 
              src="/logo-danantara.png" 
              alt="Danantara" 
              className="h-[48px] w-auto object-contain scale-125 origin-center brightness-100 contrast-100" 
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold text-slate-300 tracking-wider uppercase">AUTHENTICATION GATEWAY // V2.5</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-6 flex-1 flex flex-col justify-center">
        <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 font-black text-[10px] px-3 py-1 rounded-md border border-red-500/30 tracking-widest uppercase mb-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              SECURE ACCESS PORTAL
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">SIGN IN ACCOUNT</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">PT INKA (Persero) × Danantara Indonesia</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/15 border border-red-500/40 rounded-lg text-red-300 text-xs font-bold text-center leading-relaxed uppercase">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5">IDENTITY USER EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required className="w-full bg-[#090d16] border border-slate-700 focus:border-red-500 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono font-semibold" />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5">SECURE GUARD PASSWORD</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-[#090d16] border border-slate-700 focus:border-red-500 rounded-lg pl-3 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono font-semibold" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.959 8.959 0 013.682-.783c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.092-4.092a3 3 0 11-4.243-4.243M3 3l18 18" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-lg text-xs uppercase tracking-widest transition-all disabled:opacity-50 mt-2 shadow-lg shadow-red-600/30 cursor-pointer flex items-center justify-center gap-2">
              <span>{loading ? 'AUTHENTICATING...' : 'LOGIN TO SYSTEM'}</span>
              <span>→</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Belum punya akses akun?{' '}
              <button onClick={onSwitchToRegister} className="text-red-400 font-bold hover:underline ml-1 uppercase cursor-pointer">Daftar / Request Akun</button>
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-800 bg-[#090d16] px-6 py-3 text-slate-500 text-xs font-mono text-center">
        © 2026 PT INKA (PERSERO) • SYSTEM SECURITY AUTHORIZATION
      </footer>
    </div>
  );
}