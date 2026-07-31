import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // 1. Panggil Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Supabase Login Error:', error.message);
      setErrorMsg('KREDENSIAL OTORISASI SALAH. AKSES DITOLAK!');
      setLoading(false);
    } else {
      console.log('Login Berhasil:', data);
      setLoading(false);
      navigate('/portal');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111827] border border-gray-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
            • SECURE QUALITY PORTAL
          </span>
          <h2 className="text-2xl font-bold text-white mt-4 tracking-wider">
            SIGN IN ACCOUNT
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            PT INKA (Persero) × Danantara Indonesia
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-xs font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              IDENTITY USER MANAGER
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full bg-[#0b0f19] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              SECURE GUARD PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#0b0f19] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-sm tracking-wider transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'PROCESSING...' : 'LOGIN TO SYSTEM →'}
          </button>
        </form>
      </div>
    </div>
  );
}