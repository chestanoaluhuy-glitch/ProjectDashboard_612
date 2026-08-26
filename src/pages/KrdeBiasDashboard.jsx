import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';

// Format Tanggal Display
const formatDate = (val) => {
  if (!val || val === '-' || val === '') return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Helper pencari key fleksibel
const getPropValue = (obj, targetKeys) => {
  if (!obj || typeof obj !== 'object') return '-';
  const keys = Object.keys(obj);
  
  for (const tKey of targetKeys) {
    const cleanTarget = tKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget);
    if (foundKey && obj[foundKey] !== undefined && obj[foundKey] !== null && obj[foundKey] !== '') {
      return String(obj[foundKey]).trim();
    }
  }
  return '-';
};

// Fetcher Data VRB KRDE BIAS (Langsung tembak Web App Apps Script tanpa error 404 Vercel)
const fetchKrdeBiasData = async () => {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxado9djZnL2RDF_gSa4PdK3Am3MDqxCyuwA3vU5H2ypDhnOLJIzMEV7VM1lriSCVihtQ/exec';
  const res = await fetch(`${APPS_SCRIPT_URL}?sheet=VRB&targetSheet=VRB&action=getData`);
  
  if (!res.ok) throw new Error('Gagal mengambil data VRB KRDE BIAS');
  
  const json = await res.json();
  const rawRows = Array.isArray(json) ? json : (json.data || json.result || []);

  return rawRows.map((row, index) => {
    if (Array.isArray(row)) {
      return {
        no: row[0] || String(index + 1),
        ts: row[1] || '-',
        noKereta: row[2] || '-',
        openDate: row[3] || '-',
        closeDate: row[4] || '-',
        permasalahan: row[6] || row[5] || '-',
        solusi: row[7] || row[6] || '-',
        statusTl: row[9] || row[7] || '-'
      };
    }

    return {
      no: getPropValue(row, ['No', 'NO', 'NO.']) !== '-' ? getPropValue(row, ['No', 'NO', 'NO.']) : String(index + 1),
      ts: getPropValue(row, ['TS', 'TRAINSET', 'TRAIN SET']),
      noKereta: getPropValue(row, ['No Kereta', 'NO KERETA', 'KERETA']),
      openDate: getPropValue(row, ['Tanggal Open', 'TANGGAL OPEN', 'OPEN']),
      closeDate: getPropValue(row, ['Tanggal Close', 'TANGGAL CLOSE', 'CLOSE']),
      permasalahan: getPropValue(row, ['Permasalahan', 'PERMASALAHAN', 'RINCIAN KEJADIAN/GANGGUAN', 'GANGGUAN']),
      solusi: getPropValue(row, ['Solusi', 'SOLUSI', 'SOLUSI / TINDAK LANJUT', 'TINDAK LANJUT']),
      statusTl: getPropValue(row, ['STATUS TL', 'Status TL', 'STATUS', 'STATE'])
    };
  });
};

// COMPONENT CUSTOM DROPDOWN (PASTIKAN SELALU BUKA KE BAWAH)
function CustomSelect({ label, value, options, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs flex justify-between items-center focus:outline-none focus:border-amber-500 cursor-pointer"
      >
        <span className="truncate">{value === 'ALL' ? placeholder : value}</span>
        <span className="text-[10px] text-slate-400 ml-2">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* POPUP DIPAKSA TEPAT DI BAWAH BUTTON (top: 100%) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded shadow-2xl max-h-48 overflow-y-auto z-[9999]">
          <div
            onClick={() => { onChange('ALL'); setIsOpen(false); }}
            className={`p-2 text-xs cursor-pointer hover:bg-amber-600 hover:text-white ${value === 'ALL' ? 'bg-slate-700 text-amber-400 font-bold' : 'text-slate-300'}`}
          >
            {placeholder}
          </div>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`p-2 text-xs cursor-pointer hover:bg-amber-600 hover:text-white ${value === opt ? 'bg-slate-700 text-amber-400 font-bold' : 'text-slate-300'}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KrdebiasDashboard({ onBackToPortal }) {
  // State Slide Sidebar (Default tertutup di HP agar rapi, terbuka di PC)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedTs, setSelectedTs] = useState('ALL');
  const [selectedNoKereta, setSelectedNoKereta] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: rows = [], isLoading, isError } = useQuery({
    queryKey: ['vrb-krde-bias'],
    queryFn: fetchKrdeBiasData,
    refetchInterval: 10000,
  });

  const filterOptions = useMemo(() => {
    const tsSet = new Set();
    const noKeretaSet = new Set();
    const statusSet = new Set();

    rows.forEach((item) => {
      if (item.ts && item.ts !== '-') tsSet.add(item.ts);
      if (item.noKereta && item.noKereta !== '-') noKeretaSet.add(item.noKereta);
      if (item.statusTl && item.statusTl !== '-') statusSet.add(item.statusTl);
    });

    return {
      tsList: Array.from(tsSet).sort(),
      noKeretaList: Array.from(noKeretaSet).sort(),
      statusList: Array.from(statusSet).sort(),
    };
  }, [rows]);

  const filteredRows = rows.filter((item) => {
    const matchTs = selectedTs === 'ALL' || String(item.ts).toLowerCase() === selectedTs.toLowerCase();
    const matchNoKereta = selectedNoKereta === 'ALL' || String(item.noKereta).toLowerCase() === selectedNoKereta.toLowerCase();
    const matchStatus = selectedStatus === 'ALL' || String(item.statusTl).toLowerCase() === selectedStatus.toLowerCase();
    
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = query === '' || Object.values(item).some(val => 
      String(val).toLowerCase().includes(query)
    );

    return matchTs && matchNoKereta && matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 font-sans flex select-none md:border-[12px] border-amber-600 relative overflow-x-hidden">
      
      {/* TOMBOL TOGGLE SLIDE SIDEBAR */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed md:absolute top-3 md:top-4 left-0 z-50 bg-slate-900 hover:bg-slate-800 text-amber-400 p-2.5 rounded-r-md border-y border-r border-slate-700 shadow-2xl transition-all duration-300 cursor-pointer flex items-center justify-center"
        title={isSidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>

      {/* SIDEBAR FILTER */}
      <aside 
        className={`bg-slate-900 text-white flex flex-col border-r border-slate-700 shrink-0 h-full fixed md:relative z-40 transition-all duration-300 ease-in-out overflow-y-auto ${
          isSidebarOpen ? 'w-full md:w-64 opacity-100 p-5' : 'w-0 opacity-0 p-0 overflow-hidden pointer-events-none'
        }`}
      >
        <div className="w-full md:w-52 shrink-0">
          <button
            onClick={onBackToPortal}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black text-xs py-2.5 px-4 rounded shadow uppercase tracking-wider mb-6 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            ← EXIT TO PORTAL
          </button>

          <h2 className="text-lg font-black tracking-wider text-amber-400 uppercase">VRB BIAS FILTER</h2>
          <p className="text-[10px] text-slate-400 font-semibold mb-6">VRB 4 TS KRDE BIAS</p>

          <div className="space-y-4 text-xs font-bold">
            {/* SEARCH INPUT */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Pencarian</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari permasalahan, komponen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 pr-7 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white font-bold text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* CUSTOM DROPDOWNS */}
            <CustomSelect
              label="Trainset"
              value={selectedTs}
              options={filterOptions.tsList}
              onChange={setSelectedTs}
              placeholder="Semua Trainset"
            />

            <CustomSelect
              label="No. Kereta"
              value={selectedNoKereta}
              options={filterOptions.noKeretaList}
              onChange={setSelectedNoKereta}
              placeholder="Semua No. Kereta"
            />

            <CustomSelect
              label="Status TL"
              value={selectedStatus}
              options={filterOptions.statusList}
              onChange={setSelectedStatus}
              placeholder="Semua Status TL"
            />
          </div>
        </div>

        {/* BUTTON RESET */}
        <div className="pt-6 pb-20 w-full md:w-52 shrink-0 mt-auto">
          <button
            onClick={() => {
              setSelectedTs('ALL');
              setSelectedNoKereta('ALL');
              setSelectedStatus('ALL');
              setSearchQuery('');
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] py-2 rounded uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
          >
            RESET FILTER
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-3 sm:p-5 flex flex-col justify-between gap-4 bg-slate-50 transition-all duration-300 w-full overflow-x-hidden pl-12 md:pl-5">
        <Header type="KRDE_BIAS" />

        {/* TOP SEARCH & INFO BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-3 rounded border border-slate-300 shadow-sm">
          <div className="w-full sm:w-80 relative">
            <input
              type="text"
              placeholder="🔍 Cari permasalahan, komponen, solusi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500 self-end sm:self-center">
            Menampilkan <span className="text-amber-600 font-black">{filteredRows.length}</span> dari <span className="text-slate-700">{rows.length}</span> data VRB
          </div>
        </div>

        {/* TABEL DATA VRB */}
        <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-amber-600 text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="p-3 border-r border-amber-500 text-center w-12">NO</th>
                  <th className="p-3 border-r border-amber-500 text-center">TS</th>
                  <th className="p-3 border-r border-amber-500">NO KERETA</th>
                  <th className="p-3 border-r border-amber-500">TANGGAL OPEN</th>
                  <th className="p-3 border-r border-amber-500">TANGGAL CLOSE</th>
                  <th className="p-3 border-r border-amber-500">PERMASALAHAN</th>
                  <th className="p-3 border-r border-amber-500">SOLUSI / TINDAK LANJUT</th>
                  <th className="p-3 text-center">STATUS TL</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 font-bold text-amber-600 animate-pulse">
                      MEMUAT DATA VRB KRDE BIAS...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 font-bold text-red-500">
                      GAGAL MENGAMBIL DATA. PASTIKAN GOOGLE SPREADSHEET TERHUBUNG.
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-slate-400 font-bold">
                      TIDAK ADA DATA VRB {searchQuery && `UNTUK KATA KUNCI "${searchQuery.toUpperCase()}"`}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((item, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-400 border-r border-slate-200">{item.no}</td>
                      <td className="p-3 border-r border-slate-200 text-center font-bold">{item.ts}</td>
                      <td className="p-3 border-r border-slate-200 font-mono whitespace-nowrap">{item.noKereta}</td>
                      <td className="p-3 border-r border-slate-200 whitespace-nowrap">{formatDate(item.openDate)}</td>
                      <td className="p-3 border-r border-slate-200 whitespace-nowrap">{formatDate(item.closeDate)}</td>
                      <td className="p-3 border-r border-slate-200">{item.permasalahan}</td>
                      <td className="p-3 border-r border-slate-200">{item.solusi}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-black rounded uppercase ${
                          String(item.statusTl).toUpperCase() === 'CLOSED' || String(item.statusTl).toUpperCase() === 'CLOSE'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : 'bg-amber-100 text-amber-700 border border-amber-300'
                        }`}>
                          {item.statusTl}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}