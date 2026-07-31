import React from 'react';

export default function FilterPanel({ data, filters, setFilters }) {
  // Helper untuk mengambil nilai unik dari Google Sheets
  const getUniqueOptions = (...keys) => {
    if (!Array.isArray(data)) return [];
    const set = new Set();
    data.forEach(item => {
      for (const key of keys) {
        if (item && item[key] !== undefined && item[key] !== null && item[key] !== '' && item[key] !== '-') {
          set.add(item[key].toString().trim());
          break;
        }
      }
    });
    return Array.from(set).sort();
  };

  const trainsetOptions = getUniqueOptions('trainset', 'TRAINSET', 'Trainset');
  const noKaOptions = getUniqueOptions('no_ka', 'NO KA', 'noKa', 'No KA');
  const klasKomponenOptions = getUniqueOptions('klasifikasi_komponen_l1', 'KLASIFIKASI KOMPONEN', 'klasifikasiKomponen');
  const klasSystemOptions = getUniqueOptions('klasifikasi_system', 'KLASIFIKASI SYSTEM', 'klasifikasiSystem', 'system');
  const lruOptions = getUniqueOptions('lru', 'LRU', 'Lru');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      trainset: '',
      noKa: '',
      klasKomponen: '',
      klasSystem: '',
      lru: ''
    });
  };

  return (
    <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col gap-2 w-full select-none">
      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          🔍 Filter Data FRACAS
        </span>
        <button
          onClick={handleReset}
          className="text-[10px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition-all"
        >
          Reset Filter
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-[11px]">
        {/* Trainset */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-500 uppercase text-[9px]">Trainset</label>
          <select
            name="trainset"
            value={filters.trainset}
            onChange={handleChange}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700 outline-none focus:border-red-400"
          >
            <option value="">Semua Trainset</option>
            {trainsetOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* No KA */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-500 uppercase text-[9px]">No KA</label>
          <select
            name="noKa"
            value={filters.noKa}
            onChange={handleChange}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700 outline-none focus:border-red-400"
          >
            <option value="">Semua No KA</option>
            {noKaOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Klasifikasi Komponen */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-500 uppercase text-[9px]">Klasifikasi Komponen</label>
          <select
            name="klasKomponen"
            value={filters.klasKomponen}
            onChange={handleChange}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700 outline-none focus:border-red-400"
          >
            <option value="">Semua Komponen</option>
            {klasKomponenOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Klasifikasi System */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-500 uppercase text-[9px]">Klasifikasi System</label>
          <select
            name="klasSystem"
            value={filters.klasSystem}
            onChange={handleChange}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700 outline-none focus:border-red-400"
          >
            <option value="">Semua System</option>
            {klasSystemOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* LRU */}
        <div className="flex flex-col gap-1">
          <label className="font-bold text-slate-500 uppercase text-[9px]">LRU</label>
          <select
            name="lru"
            value={filters.lru}
            onChange={handleChange}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700 outline-none focus:border-red-400"
          >
            <option value="">Semua LRU</option>
            {lruOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}