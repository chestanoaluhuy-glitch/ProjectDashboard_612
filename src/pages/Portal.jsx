import React from 'react';

export default function Portal({ onSelectMenu, onLogout }) {
  // Data menu portal modular sesuai pipeline industri
  const menuList = [
    {
      id: 'fracas',
      title: 'FRACAS System',
      desc: 'Failure Reporting, Analysis, and Corrective Action System',
      color: 'border-l-red-500 text-red-400 bg-red-500/5',
      badge: 'Active & Integrated',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20'
    },
    {
      id: 'vrb',
      title: 'VRB Portal',
      desc: 'Vendor Remedy Board - Stream Data & Evaluation Monitoring',
      color: 'border-l-amber-500 text-amber-400 bg-amber-500/5',
      badge: 'Active & Integrated',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      id: 'dcr',
      title: 'DCR System',
      desc: 'Document Change Request - Configuration Management',
      color: 'border-l-blue-500 text-blue-400 bg-blue-500/5',
      badge: 'Active & Integrated',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      id: 'ncr',
      title: 'NCR Report',
      desc: 'Non-Conformance Report - Quality Assurance Control Log',
      color: 'border-l-slate-500 text-slate-400 bg-slate-500/5',
      badge: 'Active & Integrated',
      badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans p-6 md:p-12 select-none relative overflow-hidden flex flex-col justify-between">
      {/* Background Glow Ambient */}
      <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* TOP BAR / HEADER PORTAL */}
      <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">System Operational Control</span>
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white uppercase">
            Portal DMTP
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            PT INKA (Persero) Enterprise Application Module Dashboard
          </p>
        </div>

        {/* LOGOUT ACTUATOR */}
        <button 
          onClick={onLogout}
          className="bg-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-950/60 text-slate-300 text-[10px] font-black px-4 py-2 rounded border border-slate-700 uppercase tracking-widest transition-all shadow active:scale-[0.98]"
        >
          🔒 Exit Session
        </button>
      </div>

      {/* MAIN GRID MODULE SELECTOR */}
      <div className="w-full max-w-6xl mx-auto my-auto py-12 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {menuList.map((menu) => (
          <div 
            key={menu.id}
            onClick={() => onSelectMenu(menu.id)}
            className={`group border border-slate-800 border-l-4 ${menu.color} rounded-xl p-6 shadow-xl cursor-pointer transition-all duration-300 hover:border-slate-600 hover:bg-slate-800/40 hover:-translate-y-1 relative`}
          >
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 text-[9px] font-black uppercase px-2 py-0.5 rounded border ${menu.badgeColor}`}>
              {menu.badge}
            </div>

            {/* Content */}
            <h3 className="text-lg font-black text-white uppercase tracking-wide mb-1 group-hover:text-red-400 transition-colors">
              {menu.title}
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[85%]">
              {menu.desc}
            </p>

            {/* Action Indicator */}
            <div className="mt-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
              Launch Module <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER METRICS */}
      <div className="w-full max-w-6xl mx-auto border-t border-slate-900 pt-6 flex flex-col sm:flex-row justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest relative z-10">
        <div>Authorized personnel only • Core Data Sync v2.0</div>
        <div className="mt-1 sm:mt-0">© 2026 PT INKA (Persero) • Quality Assurance</div>
      </div>
    </div>
  );
}