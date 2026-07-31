import React, { useState, useEffect, useRef } from 'react';

export default function FilterGrid({ activeFilters, onFilterChange, data = [] }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Tutup dropdown kalau klik di luar area filter
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper presisi tinggi untuk mengambil data dari opsi array kunci yang kamu kirim
  const getUniqueOptions = (primaryKey, secondaryKey, fallbackKey) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    const setOptions = new Set();
    
    data.forEach(item => {
      if (!item) return;

      // Ambil nilai berdasarkan prioritas kunci
      const val = item[primaryKey] ?? item[secondaryKey] ?? item[fallbackKey];

      if (val !== undefined && val !== null) {
        const cleanVal = String(val).trim();
        if (cleanVal && cleanVal !== '-' && cleanVal !== 'null' && cleanVal !== 'undefined') {
          setOptions.add(cleanVal);
        }
      }
    });

    return Array.from(setOptions).sort((a, b) => 
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  };

  // 🎯 OPSI PRESISI SESUAI LIST ARRAY HEADER KAMU (Index 8, 6, 39, 40, 41 / 51, 52, 53, 54, 55)
  const optionsTrainset = getUniqueOptions('Trainset', 'trainset', 'TS');
  const optionsNoKa = getUniqueOptions('No. KA', 'no_ka', 'No KA');
  const optionsL1 = getUniqueOptions('Klasifikasi Komponen (L1)', 'klasifikasi_komponen_l1', '6 L1');
  const optionsL2 = getUniqueOptions('Klasifikasi System/ Subsystem (L2)', 'klasifikasi_system_subsystem_l2', 'Subsystem');
  const optionsL3 = getUniqueOptions('LRU (L3)', 'lru_l3', 'Kode LRU (L3)');

  const filterConfigs = [
    { key: 'trainset', label: 'Trainset', options: optionsTrainset, defaultLabel: 'Trainset (Semua)' },
    { key: 'noKa', label: 'No. KA', options: optionsNoKa, defaultLabel: 'No. KA (Semua)' },
    { key: 'l1', label: 'Klasifikasi Komponen (L1)', options: optionsL1, defaultLabel: 'Klasifikasi Komponen (L1) (Semua)' },
    { key: 'l2', label: 'Klasifikasi System/ Subsystem (L2)', options: optionsL2, defaultLabel: 'Klasifikasi System/ Subsystem (L2) (Semua)' },
    { key: 'l3', label: 'LRU (L3)', options: optionsL3, defaultLabel: 'LRU (L3) (Semua)' },
  ];

  const handleSelect = (key, value) => {
    onFilterChange(key, value);
    setOpenDropdown(null);
  };

  return (
    <div ref={dropdownRef} className="grid grid-cols-1 md:grid-cols-5 gap-2 w-full text-[11px] font-medium">
      {filterConfigs.map((cfg) => {
        const isOpen = openDropdown === cfg.key;
        const selectedValue = activeFilters[cfg.key] || '';

        return (
          <div key={cfg.key} className="relative w-full">
            {/* TOMBOL DROPDOWN */}
            <button
              type="button"
              onClick={() => setOpenDropdown(isOpen ? null : cfg.key)}
              className={`w-full bg-slate-50 hover:bg-slate-100 border ${
                selectedValue ? 'border-red-500 text-slate-900 font-bold bg-red-50/40' : 'border-slate-300 text-slate-700'
              } rounded px-2.5 py-1.5 flex justify-between items-center transition-all shadow-sm focus:outline-none`}
            >
              <span className="truncate text-left pr-1">
                {selectedValue || cfg.label}
              </span>
              <svg
                className={`h-3 w-3 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* LIST OPSINYA */}
            {isOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                <button
                  type="button"
                  onClick={() => handleSelect(cfg.key, '')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 transition-colors font-bold ${
                    !selectedValue ? 'text-red-600 bg-red-50/50' : 'text-slate-600'
                  }`}
                >
                  {cfg.defaultLabel}
                </button>

                {cfg.options.length > 0 ? (
                  cfg.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(cfg.key, opt)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 transition-colors truncate ${
                        selectedValue === opt ? 'text-red-600 font-bold bg-red-50/50' : 'text-slate-700'
                      }`}
                      title={opt}
                    >
                      {opt}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-slate-400 italic text-[10px] text-center">
                    Tidak ada opsi terdeteksi
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}