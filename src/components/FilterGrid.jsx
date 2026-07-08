import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FilterGrid({ activeFilters, onFilterChange }) {
  // 1. Inisialisasi wadah opsi dengan array kosong agar mapping tidak crash di awal render
  const [dbOptions, setDbOptions] = useState({
    ts: [], 
    no_ka: [], 
    relasi: [], 
    komponen: [], 
    status: [], 
    l2: [], 
    l1: [], 
    l3: [], 
    dokumentasi: []
  });

  // 2. Ambil data opsi filter dari backend Node.js
  useEffect(() => {
    axios.get('http://localhost:5000/api/filters')
      .then((res) => { 
        if (res.data && res.data.success) {
          // Amankan dengan fallback jika data.data ternyata bernilai null/undefined
          setDbOptions(res.data.data || {}); 
        } 
      })
      .catch((err) => console.error("Gagal memuat opsi filter dari backend:", err));
  }, []);

  // 3. Konfigurasi Baris Pertama (5 Dropdown sesuai tampilan Looker Studio)
  const barisPertama = [
    { id: 'ts', label: 'TS: TS', dbKey: 'ts' },
    { id: 'noKa', label: 'No. KA', dbKey: 'no_ka' },
    { id: 'relasi', label: 'Relasi', dbKey: 'relasi' },
    { id: 'komponen', label: 'Komponen Rusak (TS)', dbKey: 'komponen' },
    { id: 'status', label: 'Status Gangguan', dbKey: 'status' }
  ];

  // 4. Konfigurasi Baris Kedua (4 Dropdown + 1 Kolom Kosong)
  const barisKedua = [
    { id: 'l2', label: 'Klasifikasi System/ Subsystem (L2)', dbKey: 'l2' },
    { id: 'l1', label: 'Klasifikasi Komponen (L1)', dbKey: 'l1' },
    { id: 'l3', label: 'LRU (L3)', dbKey: 'l3' },
    { id: 'dokumentasi', label: 'Dokumentasi', dbKey: 'dokumentasi' }
  ];

  // Helper untuk membersihkan tag HTML (<p>, &nbsp;, dll) agar teks di opsi dropdown rapi
  const bersihkanTeksOpsi = (str) => {
    if (!str) return '';
    return str.toString().replace(/<\/?[^>]+(>|$)/g, "").replace(/&nbsp;/g, " ").trim();
  };

  // 5. Fungsi render select yang aman dari nilai null atau bukan array
  const renderSelect = (filter) => {
    const rawOptions = dbOptions[filter.dbKey];
    // Pastikan currentOptions selalu berupa array agar fungsi .map() tidak error
    const currentOptions = Array.isArray(rawOptions) ? rawOptions : [];

    // Lakukan pembersihan teks dan filter out opsi kosong atau hanya '-'
    const opsiValid = currentOptions
      .map(opt => ({ asli: opt, bersih: bersihkanTeksOpsi(opt) }))
      .filter(item => item.bersih !== '' && item.bersih !== '-' && item.bersih !== 'null');

    return (
      <select
        key={filter.id}
        value={activeFilters[filter.id] || ''}
        onChange={(e) => onFilterChange(filter.id, e.target.value)}
        className="w-full bg-[#f8fafc] text-[11px] font-semibold p-2 rounded border border-slate-300 text-slate-700 shadow-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all cursor-pointer truncate"
      >
        <option value="">{filter.label}</option>
        {opsiValid.map((item, idx) => (
          <option key={idx} value={item.asli}>
            {item.bersih}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
      {/* Grid Baris Pertama */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full">
        {barisPertama.map((f) => renderSelect(f))}
      </div>
      
      {/* Grid Baris Kedua */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full">
        {barisKedua.map((f) => renderSelect(f))}
        {/* Kolom ke-5 sengaja dikosongkan agar sejajar simetris dengan baris pertama */}
        <div className="hidden md:block w-full"></div>
      </div>
    </div>
  );
}