import React, { useState, useEffect } from 'react';

export default function Header({ type = 'KRDE_MAKPAR' }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) + ' WIB';
  };

  const getHeaderConfig = () => {
    const normalizedType = String(type).toUpperCase().trim();

    switch (normalizedType) {
      case 'BIAS':
      case 'KRDE_BIAS':
      case 'LOGBOOK_BIAS':
        return {
          title: 'VRB KRDE BIAS',
          subtitle: 'Vehicle Record Book & Operational Failure Reporting System',
          badge: 'VRB MONITORING',
          titleColor: 'text-amber-600',
          dotColor: 'bg-amber-600',
          badgeBg: 'bg-amber-600'
        };

      case 'MAKPAR':
      case 'KRDE_MAKPAR':
      case 'LOGBOOK_MAKPAR':
      case 'LOGBOOK':
      default:
        return {
          title: 'LOGBOOK KRDE MAKPAR',
          subtitle: 'Logbook Kejadian & Gangguan Kereta Makassar - Parepare',
          badge: 'LOGBOOK MONITORING',
          titleColor: 'text-sky-600',
          dotColor: 'bg-sky-600',
          badgeBg: 'bg-sky-600'
        };
    }
  };

  const config = getHeaderConfig();

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 w-full select-none">
      
      {/* 1. LOGO BRANDING */}
      <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-md border border-slate-100 w-full lg:w-auto justify-center">
        <img 
          src="/logo-inka.png" 
          alt="Logo PT INKA" 
          className="h-8 w-auto object-contain"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="h-7 w-[1px] bg-slate-300 mx-1" />
        <img 
          src="/logo-danantara.png" 
          alt="Logo Danantara" 
          className="h-20 sm:h-22 w-auto object-contain" 
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* 2. JUDUL MODUL */}
      <div className="flex flex-col items-center justify-center text-center flex-1 w-full">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${config.dotColor} animate-pulse`}></span>
          <h1 className={`${config.titleColor} font-black text-xl sm:text-2xl md:text-3xl tracking-wider sm:tracking-widest leading-none drop-shadow-sm`}>
            {config.title}
          </h1>
          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${config.dotColor} animate-pulse`}></span>
        </div>
        <p className="text-[9px] sm:text-[10px] text-slate-500 font-extrabold uppercase tracking-wider sm:tracking-widest mt-1.5 max-w-md leading-normal px-2">
          {config.subtitle}
        </p>
        <div className="mt-1.5 flex gap-1.5 justify-center">
          <span className={`${config.badgeBg} text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm`}>
            KERETA API
          </span>
          <span className="bg-slate-800 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
            {config.badge}
          </span>
        </div>
      </div>

      {/* 3. JAM / LIVE STATUS */}
      <div className="flex items-center gap-3 bg-slate-800 text-slate-200 px-3 py-2 rounded-md shadow-inner text-center lg:text-right w-full lg:w-auto justify-center">
        <div className="flex flex-col font-mono">
          <div className="flex items-center gap-1.5 justify-center lg:justify-end text-[9px] font-bold text-slate-400 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
            System Live Connection
          </div>
          <span className="text-[11px] text-green-400 font-bold mt-0.5 tracking-tight">
            {formatDateTime(currentTime)}
          </span>
        </div>
      </div>

    </div>
  );
}