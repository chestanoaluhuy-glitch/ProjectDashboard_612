import React from 'react';

export default function Portal({ onSelectMenu, onLogout }) {
  const modules = [
    {
      id: 'krde_bias',
      code: 'MODUL SISTEM 01',
      title: 'KRDE BIAS',
      subtitle: 'KA Bandara Adi Soemarmo',
      desc: 'Vehicle Record Book & Operational Failure Reporting System untuk monitoring kendala teknis armada Kereta Bandara Adi Soemarmo.',
      badge: 'TERINTEGRASI',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      borderHover: 'hover:border-amber-500 hover:shadow-amber-100',
      accentColor: 'bg-amber-500',
      buttonBg: 'bg-slate-900 hover:bg-amber-600 text-white',
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'krde_makpar',
      code: 'MODUL SISTEM 02',
      title: 'KRDE MAKPAR',
      subtitle: 'KA Makassar - Parepare',
      desc: 'Logbook Kejadian & Tracking Failure Analysis System untuk operasional dan pemeliharaan jalur Makassar - Parepare.',
      badge: 'TERINTEGRASI',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
      borderHover: 'hover:border-sky-500 hover:shadow-sky-100',
      accentColor: 'bg-sky-500',
      buttonBg: 'bg-slate-900 hover:bg-sky-600 text-white',
      icon: (
        <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-900 selection:text-white">
      
      {/* 1. TOP NAVBAR RESMI */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          
          {/* Logo INKA & Danantara Tanpa Box (Original & Jelas) */}
          <div className="flex items-center gap-4">
            <img 
              src="/logo-inka.png" 
              alt="PT INKA (Persero)" 
              className="h-8 w-auto object-contain" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="h-6 w-[1px] bg-slate-300" />
            <img 
              src="/logo-danantara.png" 
              alt="Danantara Indonesia" 
              className="h-23 w-auto object-contain" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Nav Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portal Monitoring</span>
              <span className="text-xs font-bold text-slate-700">PT INKA (Persero)</span>
            </div>
            
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-300 text-xs font-bold px-3.5 py-1.5 rounded transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar Sesi</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. BODY UTAMA CONTAINER */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 flex flex-col justify-center w-full">
        
        {/* Banner Selamat Datang */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg p-6 mb-6 shadow-md border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-300 uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Quality Assurance & Operational Control
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Portal Failure Reporting System
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Sistem resmi pengawasan operasional, pencatatan logbook kejadian, dan analisis kegagalan sarana kereta api.
            </p>
          </div>

          <div className="hidden md:block text-right border-l border-slate-700 pl-6">
            <p className="text-[10px] font-mono text-slate-400">STATUS SERVIS</p>
            <p className="text-xs font-bold text-emerald-400">NORMAL & ACTIVE</p>
          </div>
        </div>

        {/* CARDS MODUL (Padat & Resmi Ala Instansi) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectMenu(item.id)}
              className={`group bg-white border border-slate-200 ${item.borderHover} rounded-lg p-5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Line Aksen Warna */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${item.accentColor}`} />

              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between mb-3 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-slate-100 border border-slate-200">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider block">
                        {item.code}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors uppercase leading-tight">
                        {item.title}
                      </h2>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border tracking-wider ${item.badgeBg}`}>
                    {item.badge}
                  </span>
                </div>

                {/* Subtitle & Desc */}
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {item.subtitle}
                </p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-700">
                  Akses Modul Pengawasan
                </span>
                <button className={`px-3.5 py-1.5 rounded text-xs font-bold tracking-wider shadow-sm flex items-center gap-1.5 ${item.buttonBg}`}>
                  <span>BUKA MODUL</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </main>

      {/* 3. FOOTER RESMI INSTANSI */}
      <footer className="bg-white border-t border-slate-200 py-3 text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-slate-600">
            Hak Cipta © 2026 PT INKA (Persero) — Divisi Quality Assurance
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Sistem Informasi Operasional Terintegrasi
          </div>
        </div>
      </footer>

    </div>
  );
}