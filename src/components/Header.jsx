import React, { useState, useEffect } from 'react';

export default function Header({ type = 'FRACAS' }) {
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
    switch (type.toUpperCase()) {
      case 'DCR':
        return {
          title: 'DCR',
          subtitle: 'Document Change Request',
          badge: 'DCR DASHBOARD',
          titleColor: 'text-red-600',
          dotColor: 'bg-red-600',
          badgeBg: 'bg-red-600'
        };
      case 'NCR':
        return {
          title: 'NCR',
          subtitle: 'Non Conformance Report',
          badge: 'NCR DASHBOARD MONITORING',
          titleColor: 'text-teal-700',
          dotColor: 'bg-teal-700',
          badgeBg: 'bg-teal-700'
        };
      case 'VRB':
        return {
          title: 'VRB',
          subtitle: 'Verification Report Book',
          badge: 'VENDOR REVIEW BOARD',
          titleColor: 'text-amber-600',
          dotColor: 'bg-amber-600',
          badgeBg: 'bg-amber-600'
        };
      case 'FRACAS':
      default:
        return {
          title: 'FRACAS',
          subtitle: 'Failure Reporting, Analysis, and Corrective Action System',
          badge: 'RELIABILITY MONITORING',
          titleColor: 'text-red-800',
          dotColor: 'bg-red-800',
          badgeBg: 'bg-red-800'
        };
    }
  };

  const config = getHeaderConfig();

  return (
    <div className="bg-white p-4 py-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 w-full select-none">
      {/* 1. LOGO */}
      <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-md border border-slate-100 min-w-[260px] justify-center md:justify-start">
        <img src="/logo-inka.png" alt="Logo PT INKA" className="h-8 w-auto object-contain" />
        <div className="h-7 w-[1px] bg-slate-300 mx-1" />
        <img src="/logo-danantara.png" alt="Logo Danantara" className="h-27 w-auto object-contain" />
      </div>

      {/* 2. JUDUL MODUL */}
      <div className="flex flex-col items-center justify-center text-center max-w-xl flex-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}></span>
          <h1 className={`${config.titleColor} font-black text-3xl tracking-widest leading-none drop-shadow-sm`}>
            {config.title}
          </h1>
          <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}></span>
        </div>
        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-1.5 max-w-md leading-normal">
          {config.subtitle}
        </p>
        <div className="mt-1.5 flex gap-1.5 justify-center">
          <span className={`${config.badgeBg} text-white text-[8px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm`}>
            KERETA API
          </span>
          <span className="bg-slate-800 text-white text-[8px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
            {config.badge}
          </span>
        </div>
      </div>

      {/* 3. JAM / LIVE STATUS */}
      <div className="flex items-center gap-3 bg-slate-800 text-slate-200 px-4 py-2 rounded-md shadow-inner text-right min-w-[240px] justify-center md:justify-end">
        <div className="flex flex-col font-mono">
          <div className="flex items-center gap-1.5 justify-end text-[9px] font-bold text-slate-400 uppercase tracking-wide">
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