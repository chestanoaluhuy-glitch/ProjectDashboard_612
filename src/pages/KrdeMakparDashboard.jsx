import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';

// URL Web App Apps Script
const APPS_SCRIPT_DIRECT = 'https://script.google.com/macros/s/AKfycbz46G1P7cyf1j4reQs11ck3o44WEKAWqizTSdDJAxgrhidA05FthG83hRQFWHDJrNoc/exec';

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

// Helper pencari key (Mengabaikan spasi, garis miring, dan kapitalisasi)
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

// Fetcher Data
const fetchKrdeData = async () => {
  const res = await fetch(`${APPS_SCRIPT_DIRECT}?sheet=Logbook`);
  if (!res.ok) throw new Error('Gagal mengambil data dari Google Apps Script');
  
  const json = await res.json();
  const rawRows = Array.isArray(json) ? json : (json.data || []);

  return rawRows.map((row, index) => {
    if (Array.isArray(row)) {
      return {
        no: row[0] || String(index + 1),
        openDate: row[1] || '-',
        closeDate: row[2] || '-',
        ts: row[3] || '-',
        noKereta: row[4] || '-',
        kereta: row[5] || '-',
        rincian: row[6] || '-',
        indikasi: row[7] || '-',
        tindakLanjut: row[8] || '-',
        klasifikasiGangguan: row[9] || '-',
        klasifikasiPenyebab: row[10] || '-',
        komponenTerganggu: row[11] || '-',
        frekuensi: row[12] || '-',
        status: row[13] || '-',
        beritaAcara: row[14] || '-'
      };
    }

    return {
      no: getPropValue(row, ['NO']) !== '-' ? getPropValue(row, ['NO']) : String(index + 1),
      openDate: getPropValue(row, ['TANGGAL OPEN', 'TANGGALOPEN', 'OPEN']),
      closeDate: getPropValue(row, ['TANGGAL CLOSE', 'TANGGALCLOSE', 'CLOSE']),
      ts: getPropValue(row, ['TS', 'TRAINSET']),
      noKereta: getPropValue(row, ['NO KERETA', 'NOKERETA', 'KERETA']),
      kereta: getPropValue(row, ['KERETA']),
      rincian: getPropValue(row, ['RINCIAN KEJADIAN/GANGGUAN', 'RINCIAN KEJADIAN', 'GANGGUAN', 'RINCIAN']),
      indikasi: getPropValue(row, ['INDIKASI/KETERANGAN', 'INDIKASI', 'KETERANGAN']),
      tindakLanjut: getPropValue(row, ['TINDAK LANJUT', 'TINDAKLANJUT']),
      klasifikasiGangguan: getPropValue(row, ['KLASIFIKASI GANGGUAN']),
      klasifikasiPenyebab: getPropValue(row, ['KLASIFIKASI PENYEBAB']),
      komponenTerganggu: getPropValue(row, ['KOMPONEN TERGANGGU']),
      frekuensi: getPropValue(row, ['FREKUENSI']),
      status: getPropValue(row, ['STATUS', 'STATE']),
      beritaAcara: getPropValue(row, ['Berita Acara', 'BERITA ACARA'])
    };
  });
};

export default function KrdeMakparDashboard({ onBackToPortal }) {
  // State Slide Sidebar (Default tertutup di HP agar tidak langsung menutupi layar, terbuka di PC)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State Filter & Search
  const [selectedTs, setSelectedTs] = useState('ALL');
  const [selectedNoKereta, setSelectedNoKereta] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: rows = [], isLoading, isError } = useQuery({
    queryKey: ['krde-logbook'],
    queryFn: fetchKrdeData,
    refetchInterval: 10000,
  });

  const filterOptions = useMemo(() => {
    const tsSet = new Set();
    const noKeretaSet = new Set();
    const statusSet = new Set();

    rows.forEach((item) => {
      if (item.ts && item.ts !== '-') tsSet.add(item.ts);
      if (item.noKereta && item.noKereta !== '-') noKeretaSet.add(item.noKereta);
      if (item.status && item.status !== '-') statusSet.add(item.status);
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
    const matchStatus = selectedStatus === 'ALL' || String(item.status).toLowerCase() === selectedStatus.toLowerCase();
    
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = query === '' || Object.values(item).some(val => 
      String(val).toLowerCase().includes(query)
    );

    return matchTs && matchNoKereta && matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-800 font-sans flex select-none md:border-[12px] border-sky-600 relative overflow-x-hidden">
      
      {/* TOMBOL TOGGLE SLIDE SIDEBAR */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed md:absolute top-3 md:top-4 left-0 z-50 bg-slate-900 hover:bg-slate-800 text-sky-400 p-2.5 rounded-r-md border-y border-r border-slate-700 shadow-2xl transition-all duration-300 cursor-pointer flex items-center justify-center"
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
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black text-xs py-2.5 px-4 rounded shadow uppercase tracking-wider mb-6 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            ← EXIT TO PORTAL
          </button>

          <h2 className="text-lg font-black tracking-wider text-sky-400 uppercase">KRDE MAKPAR FILTER</h2>
          <p className="text-[10px] text-slate-400 font-semibold mb-6">Logbook KRDE Makassar - Parepare</p>

          <div className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Pencarian</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari kata kunci..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 pr-7 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
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

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Trainset</label>
              <select
                value={selectedTs}
                onChange={(e) => setSelectedTs(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="ALL">Semua Trainset</option>
                {filterOptions.tsList.map((ts) => (
                  <option key={ts} value={ts}>{ts}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">No. Kereta</label>
              <select
                value={selectedNoKereta}
                onChange={(e) => setSelectedNoKereta(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="ALL">Semua No. Kereta</option>
                {filterOptions.noKeretaList.map((nk) => (
                  <option key={nk} value={nk}>{nk}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                {filterOptions.statusList.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
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
        <Header type="LOGBOOK" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-3 rounded border border-slate-300 shadow-sm">
          <div className="w-full sm:w-80 relative">
            <input
              type="text"
              placeholder="🔍 Cari kejadian, kereta, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
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
            Menampilkan <span className="text-sky-600 font-black">{filteredRows.length}</span> dari <span className="text-slate-700">{rows.length}</span> data logbook
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-sky-600 text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="p-3 border-r border-sky-500 text-center w-12">NO</th>
                  <th className="p-3 border-r border-sky-500">TANGGAL OPEN</th>
                  <th className="p-3 border-r border-sky-500">TANGGAL CLOSE</th>
                  <th className="p-3 border-r border-sky-500 text-center">TS</th>
                  <th className="p-3 border-r border-sky-500">NO KERETA</th>
                  <th className="p-3 border-r border-sky-500">RINCIAN KEJADIAN/GANGGUAN</th>
                  <th className="p-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 font-bold text-sky-600 animate-pulse">
                      MEMUAT DATA LOGBOOK SPREADSHEET...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 font-bold text-red-500">
                      GAGAL MENGAMBIL DATA. PASTIKAN GOOGLE SPREADSHEET TERHUBUNG.
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-slate-400 font-bold">
                      TIDAK ADA DATA LOGBOOK {searchQuery && `UNTUK KATA KUNCI "${searchQuery.toUpperCase()}"`}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((item, idx) => (
                    <tr key={idx} className="hover:bg-sky-50/50 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-400 border-r border-slate-200">{item.no}</td>
                      <td className="p-3 border-r border-slate-200">{formatDate(item.openDate)}</td>
                      <td className="p-3 border-r border-slate-200">{formatDate(item.closeDate)}</td>
                      <td className="p-3 border-r border-slate-200 text-center font-bold">{item.ts}</td>
                      <td className="p-3 border-r border-slate-200 font-mono">{item.noKereta}</td>
                      <td className="p-3 border-r border-slate-200">{item.rincian}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-black rounded uppercase ${
                          String(item.status).toUpperCase() === 'CLOSED' || String(item.status).toUpperCase() === 'CLOSE'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : 'bg-amber-100 text-amber-700 border border-amber-300'
                        }`}>
                          {item.status}
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