import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

// 📌 IMPORT KOMPONEN HEADER REUSABLE
import Header from '../components/Header';

// 📌 IMPORT KOMPONEN CHART REUSABLE
import LineChartCustom from '../components/LineChartCustom';
import BarChartHorizontal from '../components/BarChartHorizontal';

// 🌐 BASE URL API BACKEND
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://project-dashboard-612.vercel.app';

// Helper Fetcher Function untuk TanStack Query
const fetchVrbData = async () => {
  const axiosConfig = {
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  };

  const [resData, resFilters] = await Promise.all([
    axios.get(`${API_BASE_URL}/api/sheets-data?targetSheet=VRB`, axiosConfig),
    axios.get(`${API_BASE_URL}/api/filters?targetSheet=VRB`, axiosConfig)
  ]);

  let mappedRecords = [];
  if (resData.data && resData.data.success) {
    const raw = resData.data.data || [];
    
    // Helper Mapper Kolom VRB
    mappedRecords = raw.map(item => {
      const getVal = (...keys) => {
        for (let k of keys) {
          if (item[k] !== undefined && item[k] !== null && item[k] !== '') return item[k];
        }
        return '-';
      };

      return {
        ts: getVal('TS', 'Train Set', 'Trainset', 'ts'),
        noKa: getVal('No. KA', 'No KA', 'no_ka'),
        part: getVal('Part', 'part'),
        part1: getVal('Part 1', 'Part1', 'part_1'),
        part2: getVal('Part 2', 'Part2', 'part_2'),
        part3: getVal('Part 3', 'Part3', 'part_3'),
        part4: getVal('Part 4', 'Part4', 'part_4'),
        brand: getVal('Brand', 'brand'),
        tgl: getVal('Tanggal', 'Tgl', 'Release Date', 'tgl')
      };
    });
  }

  return {
    vrbRecords: mappedRecords,
    options: resFilters.data?.success ? (resFilters.data.data || {}) : { ts: [], noKa: [], part: [], brand: [] }
  };
};

export default function VrbDashboard({ onBackToPortal }) {
  // State Filter Aktif
  const [filters, setFilters] = useState({
    ts: '',
    noKa: '',
    part: '',
    brand: ''
  });

  // 🚀 TANSTACK QUERY: Mengelola Caching & Fetching Otomatis
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vrbData'],      // Unique Key untuk cache VRB
    queryFn: fetchVrbData,      // Fungsi pengambil data
  });

  const vrbRecords = data?.vrbRecords || [];
  const options = data?.options || { ts: [], noKa: [], part: [], brand: [] };

  // 1. LOGIKA FILTERING DATA (Optimasi dengan useMemo)
  const filteredRecords = useMemo(() => {
    let res = [...vrbRecords];
    if (filters.ts) res = res.filter(r => String(r.ts).trim() === String(filters.ts).trim());
    if (filters.noKa) res = res.filter(r => String(r.noKa).trim() === String(filters.noKa).trim());
    if (filters.part) res = res.filter(r => String(r.part).trim() === String(filters.part).trim());
    if (filters.brand) res = res.filter(r => String(r.brand).trim() === String(filters.brand).trim());
    return res;
  }, [filters, vrbRecords]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  // 2. 📈 AGREGASI UNTUK LINE CHART (Disimpan di Memo)
  const lineData = useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) return [];
    
    const counts = {};
    filteredRecords.forEach(r => {
      let key = r.tgl && r.tgl !== '-' ? String(r.tgl).trim() : '';
      if (!key) {
        key = r.part && r.part !== '-' ? String(r.part).trim() : 'Data';
      }
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).slice(0, 15);
  }, [filteredRecords]);

  // 3. 📊 AGREGASI UNTUK BAR CHART HORIZONTAL (Disimpan di Memo)
  const brandBarData = useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) return [];
    const counts = {};
    filteredRecords.forEach(r => {
      const br = r.brand !== '-' ? String(r.brand) : 'Lainnya';
      counts[br] = (counts[br] || 0) + 1;
    });
    return Object.keys(counts)
      .map(key => ({ name: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredRecords]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-6 select-none relative flex flex-col justify-between border-[16px] border-amber-600 gap-4" style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff, #fffbeb)' }}>
      
      {/* BAR ATAS: TOMBOL EXIT PORTAL */}
      <div className="w-full flex justify-start">
        <button 
          onClick={onBackToPortal} 
          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black px-4 py-2 rounded uppercase shadow cursor-pointer transition-all"
        >
          ⬅ EXIT TO PORTAL
        </button>
      </div>

      {/* HEADER BRANDING */}
      <Header type="VRB" />

      {/* DROPDOWN FILTERS */}
      <div className="grid grid-cols-12 gap-4">
        {/* Filter Kiri: TS & No. KA */}
        <div className="col-span-6 grid grid-cols-2 gap-3">
          <select value={filters.ts} onChange={(e) => handleFilterChange('ts', e.target.value)} className="bg-amber-500 text-white rounded px-3 py-1.5 text-xs font-bold outline-none shadow-sm cursor-pointer">
            <option value="">TS (Semua)</option>
            {options.ts?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>

          <select value={filters.noKa} onChange={(e) => handleFilterChange('noKa', e.target.value)} className="bg-amber-500 text-white rounded px-3 py-1.5 text-xs font-bold outline-none shadow-sm cursor-pointer">
            <option value="">No. KA (Semua)</option>
            {options.noKa?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Filter Kanan: Part & Brand */}
        <div className="col-span-6 grid grid-cols-2 gap-3">
          <select value={filters.part} onChange={(e) => handleFilterChange('part', e.target.value)} className="bg-amber-500 text-white rounded px-3 py-1.5 text-xs font-bold outline-none shadow-sm cursor-pointer">
            <option value="">Part (Semua)</option>
            {options.part?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>

          <select value={filters.brand} onChange={(e) => handleFilterChange('brand', e.target.value)} className="bg-amber-500 text-white rounded px-3 py-1.5 text-xs font-bold outline-none shadow-sm cursor-pointer">
            <option value="">Brand (Semua)</option>
            {options.brand?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-12 gap-4 flex-1 items-stretch">
        
        {/* TABEL PART (KANAN KIRI 6 COLS - KIRI) */}
        <div className="col-span-6 bg-white border border-slate-300 rounded shadow-md overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto max-h-[380px]">
            <table className="w-full text-[10px] text-left border-collapse">
              <thead className="bg-amber-600 text-white font-black uppercase sticky top-0">
                <tr>
                  <th className="p-2 border-r border-amber-700 text-center">No</th>
                  <th className="p-2 border-r border-amber-700">Part</th>
                  <th className="p-2 border-r border-amber-700">Part 1</th>
                  <th className="p-2 border-r border-amber-700">Part 2</th>
                  <th className="p-2 border-r border-amber-700">Part 3</th>
                  <th className="p-2">Part 4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr><td colSpan="6" className="p-4 text-center font-bold text-amber-600">Memuat Data VRB...</td></tr>
                ) : isError ? (
                  <tr><td colSpan="6" className="p-4 text-center font-bold text-red-500">Gagal memuat data VRB. Silakan refresh.</td></tr>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-amber-50">
                      <td className="p-2 border-r text-center">{i + 1}.</td>
                      <td className="p-2 border-r font-bold text-slate-800">{r.part}</td>
                      <td className="p-2 border-r text-slate-400">{r.part1}</td>
                      <td className="p-2 border-r text-slate-400">{r.part2}</td>
                      <td className="p-2 border-r text-slate-400">{r.part3}</td>
                      <td className="p-2 text-slate-400">{r.part4}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="p-4 text-center text-slate-400">Data VRB tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-100 p-2 text-right text-[10px] text-slate-500 font-bold border-t border-slate-200">
            Total Record: {filteredRecords.length}
          </div>
        </div>

        {/* CHARTS (KANAN 6 COLS - KANAN) */}
        <div className="col-span-6 flex flex-col gap-3">
          {/* TREND LINE CHART */}
          <div className="bg-white border border-slate-300 rounded p-2 shadow-sm text-center flex flex-col justify-between h-44">
            <span className="text-[10px] font-black text-slate-700 uppercase">RECORD COUNT TREND</span>
            <div className="flex-1 w-full flex items-center justify-center">
              <LineChartCustom data={lineData} />
            </div>
          </div>

          {/* HORIZONTAL BAR CHART BRAND */}
          <div className="bg-white border border-slate-300 rounded p-2 shadow-sm text-center flex flex-col justify-between h-44">
            <span className="text-[10px] font-black text-slate-700 uppercase">BRAND DISTRIBUTION</span>
            <div className="flex-1 w-full flex items-center justify-center">
              <BarChartHorizontal data={brandBarData} />
            </div>
          </div>
        </div>

      </div>

      <div className="w-full border-t border-slate-300 pt-2 text-center text-[10px] font-black text-slate-400 uppercase mt-2">
        © 2026 PT INKA (PERSERO) • VERIFICATION REVIEW BOARD MODULE
      </div>
    </div>
  );
}