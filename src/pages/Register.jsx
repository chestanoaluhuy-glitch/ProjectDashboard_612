import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    // 1. Buat User di Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMsg({ type: 'error', text: error.message.toUpperCase() });
      setLoading(false);
      return;
    }

    // 2. Simpan Data Registrasi ke Tabel Database dengan Status 'pending'
    if (data?.user) {
      const { error: dbError } = await supabase.from('login_history').insert([
        {
          user_id: data.user.id,
          user_email: email,
          status: 'pending' // Status default butuh ACC Admin
        }
      ]);

      if (dbError) {
        console.error('Error insert DB:', dbError);
      }
    }

    setLoading(false);
    setMsg({ 
      type: 'success', 
      text: 'REGISTRASI BERHASIL! PERMOHONAN AKUN TERSIMPAN DAN MENUNGGU ACC ADMIN.' 
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111827] border border-gray-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
            • ACCOUNT REGISTRATION
          </span>
          <h2 className="text-2xl font-bold text-white mt-4 tracking-wider">
            REQUEST NEW ACCOUNT
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            PT INKA (Persero) × Danantara Indonesia
          </p>
        </div>

        {msg.text && (
          <div className={`mb-4 p-3 rounded-lg text-xs font-bold text-center border ${
            msg.type === 'error' 
              ? 'bg-red-500/10 border-red-500/30 text-red-500' 
              : 'bg-green-500/10 border-green-500/30 text-green-400'
          }`}>
            {msg.type === 'error' ? '⚠️ ' : '✅ '} {msg.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              EMAIL ADDRESS
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
              PASSWORD
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
            {loading ? 'PROCESSING...' : 'SUBMIT REQUEST →'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-800 pt-4">
          <p className="text-xs text-gray-400">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-red-500 font-semibold hover:underline">
              Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}