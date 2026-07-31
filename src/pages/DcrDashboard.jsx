import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 📌 IMPORT KOMPONEN HEADER BARU KITA
import Header from '../components/Header';

// 📌 IMPORT KOMPONEN CHART
import PieChartCustom from '../components/PieChartCustom';
import LineChartCustom from '../components/LineChartCustom';

export default function DcrDashboard({ onBackToPortal }) {
  const [dcrRecords, setDcrRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Opsi Dropdown Filter
  const [options, setOptions] = useState({
    namaProyek: [],
    pengirim: [],
    penerima: [],
    statusDcr: []
  });

  // State Filter Aktif
  const [filters, setFilters] = useState({
    namaProyek: '',
    pengirim: '',
    penerima: '',
    statusDcr: ''
  });

  // 1. FETCH DATA UTAMA & PILIHAN FILTER
  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('http://localhost:5000/api/sheets-data?targetSheet=DCR'),
      axios.get('http://localhost:5000/api/filters?targetSheet=DCR')
    ]).then(([resData, resFilters]) => {
      if (resData.data && resData.data.success) {
        const raw = resData.data.data || [];
        const mapped = raw.map(item => ({
          no: item["No"] || item["NO"] || "-",
          noDoc: item["No Document DCR"] || item["No DCR"] || item["No Doc"] || "-",
          tglRelease: item["Tanggal Release DCR"] || item["Tanggal"] || item["Tgl Release"] || "-",
          namaProyek: item["Nama Proyek"] || item["Proyek"] || "-",
          pengirim: item["Pengirim"] || "-",
          penerima: item["Penerima"] || "-",
          perubahan: item["Perubahan"] || item["Perubahan Dokumen"] || "-",
          alasan: item["Alasan"] || item["Alasan dan Saran"] || "-",
          status: item["Status DCR"] || item["Status"] || "OPEN",
          category: item["Category"] || item["Sumber"] || item["Kategori"] || "-"
        }));
        setDcrRecords(mapped);
        setFilteredRecords(mapped);
      }
      if (resFilters.data && resFilters.data.success) {
        setOptions(resFilters.data.data || {});
      }
      setLoading(false);
    }).catch(err => {
      console.error("Gagal load DCR:", err);
      setLoading(false);
    });
  }, []);

  // 2. LOGIKA FILTERING DATA
  useEffect(() => {
    let res = [...dcrRecords];
    if (filters.namaProyek) res = res.filter(r => r.namaProyek === filters.namaProyek);
    if (filters.pengirim) res = res.filter(r => r.pengirim === filters.pengirim);
    if (filters.penerima) res = res.filter(r => r.penerima === filters.penerima);
    if (filters.statusDcr) res = res.filter(r => r.status === filters.statusDcr);
    setFilteredRecords(res);
  }, [filters, dcrRecords]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 3. 📊 LINGKARAN 1: STATUS DCR (OPEN / CLOSE)
  const getStatusPieData = () => {
    if (!filteredRecords || filteredRecords.length === 0) return [];
    const counts = {};
    filteredRecords.forEach(r => {
      const st = r.status ? String(r.status).toUpperCase() : 'UNKNOWN';
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  };

  // 4. 📊 LINGKARAN 2: CATEGORY / SOURCE (INTERNAL, CUSTOMER, OTHER DIVISION, VENDOR)
  const getCategoryPieData = () => {
    if (!filteredRecords || filteredRecords.length === 0) return [];
    
    const counts = {
      'INTERNAL': 0,
      'CUSTOMER': 0,
      'OTHER DIV': 0,
      'VENDOR': 0
    };

    filteredRecords.forEach(r => {
      const cat = String(r.category || r.pengirim || '').toUpperCase();
      if (cat.includes('CUST') || cat.includes('PELANGGAN')) counts['CUSTOMER']++;
      else if (cat.includes('VEND') || cat.includes('SUPPLIER')) counts['VENDOR']++;
      else if (cat.includes('DIV') || cat.includes('DEPT') || cat.includes('SEKTO')) counts['OTHER DIV']++;
      else counts['INTERNAL']++;
    });

    return Object.keys(counts)
      .filter(key => counts[key] > 0)
      .map(key => ({ name: key, value: counts[key] }));
  };

  // 5. 📈 LOGIKA AGREGASI DATA UNTUK LINE CHART
  const getLineData = () => {
    if (!filteredRecords || filteredRecords.length === 0) return [];
    const counts = {};
    filteredRecords.forEach(r => {
      const tgl = r.tglRelease && r.tglRelease !== '-' ? String(r.tglRelease) : 'N/A';
      counts[tgl] = (counts[tgl] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-6 select-none relative flex flex-col justify-between border-[16px] border-red-600 gap-4" style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff, #f8fafc)' }}>
      
      {/* BAR ATAS: TOMBOL EXIT PORTAL */}
      <div className="w-full flex justify-start">
        <button 
          onClick={onBackToPortal} 
          className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black px-4 py-2 rounded uppercase tracking-wider transition-all shadow cursor-pointer"
        >
          ⬅ EXIT TO PORTAL
        </button>
      </div>

      {/* 🟢 HEADER BRANDING KITA */}
      <Header type="DCR" />

      {/* METRICS & DROPDOWN FILTERS */}
      <div className="grid grid-cols-12 gap-3 items-center">
        <div className="col-span-2 bg-white border-2 border-red-600 rounded text-center shadow-sm">
          <div className="bg-red-600 text-white text-[9px] font-black py-0.5 uppercase tracking-wider">TOTAL DCR</div>
          <div className="text-3xl font-black text-slate-800 py-1">{loading ? "..." : filteredRecords.length}</div>
        </div>

        <div className="col-span-10 grid grid-cols-4 gap-3">
          <select value={filters.namaProyek} onChange={(e) => handleFilterChange('namaProyek', e.target.value)} className="bg-orange-600 text-white border-2 border-orange-700 rounded px-3 py-2 text-xs font-black cursor-pointer outline-none shadow-sm">
            <option value="">Nama Proyek (Semua)</option>
            {options.namaProyek?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>

          <select value={filters.pengirim} onChange={(e) => handleFilterChange('pengirim', e.target.value)} className="bg-orange-600 text-white border-2 border-orange-700 rounded px-3 py-2 text-xs font-black cursor-pointer outline-none shadow-sm">
            <option value="">Pengirim (Semua)</option>
            {options.pengirim?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>

          <select value={filters.penerima} onChange={(e) => handleFilterChange('penerima', e.target.value)} className="bg-orange-600 text-white border-2 border-orange-700 rounded px-3 py-2 text-xs font-black cursor-pointer outline-none shadow-sm">
            <option value="">Penerima (Semua)</option>
            {options.penerima?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>

          <select value={filters.statusDcr} onChange={(e) => handleFilterChange('statusDcr', e.target.value)} className="bg-orange-600 text-white border-2 border-orange-700 rounded px-3 py-2 text-xs font-black cursor-pointer outline-none shadow-sm">
            <option value="">Status DCR (Semua)</option>
            {options.statusDcr?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      {/* CONTENT GRID: CHARTS DITUMPUK (KIRI / 5 COLS) & TABEL (KANAN / 7 COLS) */}
      <div className="grid grid-cols-12 gap-4 items-stretch flex-1">
        
        {/* CHARTS DITUMPUK ATAS-BAWAH (KIRI / 5 COLS) */}
        <div className="col-span-5 flex flex-col gap-3 justify-between">
          
          {/* 🔴 KOTAK DENGAN 2 DIAGRAM LINGKARAN (SIDE-BY-SIDE) */}
          <div className="bg-white border border-slate-300 rounded p-2.5 shadow-sm text-center flex flex-col justify-between h-48">
            <span className="text-[10px] font-black text-slate-700 uppercase">DCR STATUS & CATEGORY DISTRIBUTION</span>
            
            <div className="grid grid-cols-2 gap-2 flex-1 items-center justify-center">
              {/* LINGKARAN 1: STATUS (CLOSE / OPEN) */}
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-[8px] font-black text-slate-500 uppercase mb-1">STATUS DCR</span>
                <div className="w-full h-28 flex items-center justify-center">
                  <PieChartCustom data={getStatusPieData()} />
                </div>
              </div>

              {/* LINGKARAN 2: CATEGORY (INTERNAL, CUSTOMER, OTHER DIV, VENDOR) */}
              <div className="flex flex-col items-center justify-center h-full border-l border-slate-200 pl-1">
                <span className="text-[8px] font-black text-slate-500 uppercase mb-1">CATEGORY</span>
                <div className="w-full h-28 flex items-center justify-center">
                  <PieChartCustom data={getCategoryPieData()} />
                </div>
              </div>
            </div>
          </div>

          {/* DIAGRAM TREND LINE RELEASE (BAWAH) */}
          <div className="bg-white border border-slate-300 rounded p-2.5 shadow-sm text-center flex flex-col justify-between h-40">
            <span className="text-[10px] font-black text-slate-700 uppercase">ALASAN / TREND</span>
            <div className="flex-1 w-full flex items-center justify-center">
              <LineChartCustom data={getLineData()} />
            </div>
          </div>

          {/* INDIKATOR WORKFLOW PROCESS (PALING BAWAH) */}
          <div className="bg-white/80 border border-slate-300 rounded p-2.5 shadow-sm">
            <div className="flex justify-between items-center text-center text-[8px] font-black text-slate-600 uppercase">
              {["REQUEST", "ASSESSMENT", "REVIEW & APPROVAL", "IMPLEMENTATION", "TRACKING & REPORT"].map((st, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-red-600 flex items-center justify-center text-[10px] mb-1">⚙️</div>
                  <div className="max-w-[55px] leading-tight">{st}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* TABEL DATA DCR (KANAN / 7 COLS) */}
        <div className="col-span-7 bg-white border border-slate-300 rounded shadow-md overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-[10px] text-left border-collapse">
              <thead className="bg-red-700 text-white text-[9px] font-black uppercase text-center sticky top-0">
                <tr>
                  <th className="p-2 border-r border-red-800">No</th>
                  <th className="p-2 border-r border-red-800">No Doc</th>
                  <th className="p-2 border-r border-red-800">Tgl Release</th>
                  <th className="p-2 border-r border-red-800">Proyek</th>
                  <th className="p-2 border-r border-red-800">Pengirim</th>
                  <th className="p-2 border-r border-red-800">Penerima</th>
                  <th className="p-2 border-r border-red-800">Perubahan</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                {loading ? (
                  <tr><td colSpan="8" className="p-4 text-center font-bold text-red-600">Loading DCR Data...</td></tr>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-amber-50/50">
                      <td className="p-2 border-r text-center">{i + 1}</td>
                      <td className="p-2 border-r font-bold text-slate-900">{r.noDoc}</td>
                      <td className="p-2 border-r text-center">{r.tglRelease}</td>
                      <td className="p-2 border-r">{r.namaProyek}</td>
                      <td className="p-2 border-r">{r.pengirim}</td>
                      <td className="p-2 border-r">{r.penerima}</td>
                      <td className="p-2 border-r">{r.perubahan}</td>
                      <td className="p-2 text-center font-bold">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] ${String(r.status).toUpperCase() === 'CLOSE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="p-4 text-center text-slate-400">Data DCR tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-100 p-2 text-right text-[10px] text-slate-500 font-bold border-t border-slate-200">
            Total Displayed: {filteredRecords.length} Rows
          </div>
        </div>

      </div>

      <div className="w-full border-t border-slate-300 pt-2 text-center text-[10px] font-black text-slate-400 uppercase mt-2">
        © 2026 PT INKA (PERSERO) • CONFIGURATION MANAGEMENT APPLICATION MODULE
      </div>
    </div>
  );
}