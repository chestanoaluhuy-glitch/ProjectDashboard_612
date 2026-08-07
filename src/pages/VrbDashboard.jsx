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

// Helper Fetcher Function untuk TanStack Query (PNKK & TKB)
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
    
    // Helper Mapper Kolom PNKK & TKB
    mappedRecords = raw.map(item => {
      const getVal = (...keys) => {
        for (let k of keys) {
          if (item[k] !== undefined && item[k] !== null && item[k] !== '') return item[k];
        }
        return '-';
      };

      return {
        trainset: getVal('Trainset', 'TRAINSET', 'TS', 'Train Set'),
        noLambung: getVal('No Lambung', 'No. Lambung', 'NO LAMBUNG'),
        carType: getVal('Car Type', 'CAR TYPE', 'Tipe Kereta'),
        underframe: getVal('Underframe', 'Underframe Number', 'UNDERFRAME'),
        bogieFrame: getVal('Bogie Frame Number', 'Bogie Frame Number 1', 'BOGIE FRAME NUMBER F'),
        bogieNumber: getVal('Bogie Number', 'Bogie Number 1', 'BOGIE NUMBER F'),
        wheelBrand: getVal('Wheel Brand', 'Axle Box Assembly Brand', 'Rubber Bonded Brand', 'Brand')
      };
    });
  }

  return {
    vrbRecords: mappedRecords,
    options: resFilters.data?.success ? (resFilters.data.data || {}) : { trainset: [], noLambung: [], carType: [], underframe: [] }
  };
};

export default function VrbDashboard({ onBackToPortal }) {
  // State Filter Aktif
  const [filters, setFilters] = useState({
    trainset: '',
    noLambung: '',
    carType: '',
    underframe: ''
  });

  // 🚀 TANSTACK QUERY: Mengelola Caching & Fetching Otomatis
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vrbData'],      // Unique Key untuk cache VRB / PNKK-TKB
    queryFn: fetchVrbData,      // Fungsi pengambil data
  });

  const vrbRecords = data?.vrbRecords || [];
  const options = data?.options || { trainset: [], noLambung: [], carType: [], underframe: [] };

  // 1. LOGIKA FILTERING DATA (Optimasi dengan useMemo)
  const filteredRecords = useMemo(() => {
    let res = [...vrbRecords];
    if (filters.trainset) res = res.filter(r => String(r.trainset).trim() === String(filters.trainset).trim());
    if (filters.noLambung) res = res.filter(r => String(r.noLambung).trim() === String(filters.noLambung).trim());
    if (filters.carType) res = res.filter(r => String(r.carType).trim() === String(filters.carType).trim());
    if (filters.underframe) res = res.filter(r => String(r.underframe).trim() === String(filters.underframe).trim());
    return res;
  }, [filters, vrbRecords]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  // 2. 📈 AGREGASI UNTUK LINE CHART (Distribusi Kereta per Trainset)
  const lineData = useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) return [];
    
    const counts = {};
    filteredRecords.forEach(r => {
      let key = r.trainset && r.trainset !== '-' ? String(r.trainset).trim() : 'Lainnya';
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).slice(0, 15);
  }, [filteredRecords]);

  // 3. 📊 AGREGASI UNTUK BAR CHART HORIZONTAL (Distribusi Brand Komponen)
  const brandBarData = useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) return [];
    const counts = {};
    filteredRecords.forEach(r => {
      const br = r.wheelBrand !== '-' ? String(r.wheelBrand) : 'Lainnya';
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

      {/* DROPDOWN FILTERS (PNKK & TKB) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Filter Kiri: Trainset & No. Lambung */}
        <div className="col-span-6 grid grid-cols-2 gap-3">
          <select value={filters.trainset} onChange={(e) => handleFilterChange('trainset', e.target.value)} className="bg-amber-500 text-white rounded px-3 py-1.5 text-xs font-bold outline-none shadow-sm cursor-pointer">
            <option value="">Trainset (Semua)</option>
            {options.trainset?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>

          <select value={filters.noLambung} onChange={(e) => handleFilterChange('noLambung', e.target.value)} className="bg-amber-500 text-white rounded px-3 py-1.5 text-xs font-bold outline-none shadow-sm cursor-pointer">
            <option value="">No. Lambung (Semua)</option>
            {options.noLambung?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Filter Kanan: Car Type & Underframe */}
        <div className="col-span-6 grid grid-cols-2 gap-3">
          <select value={filters.carType} onChange={(e) => handleFilterChange('carType', e.target.value)} className="bg-amber-500 text-white rounded px-3 py-1.5 text-xs font-bold outline-none shadow-sm cursor-pointer">
            <option value="">Car Type (Semua)</option>
            {options.carType?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>

          <select value={filters.underframe} onChange={(e) => handleFilterChange('underframe', e.target.value)} className="bg-amber-500 text-white rounded px-3 py-1.5 text-xs font-bold outline-none shadow-sm cursor-pointer">
            <option value="">Underframe (Semua)</option>
            {options.underframe?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-12 gap-4 flex-1 items-stretch">
        
        {/* TABEL PEMERIKSAAN KOMPONEN (KANAN KIRI 6 COLS - KIRI) */}
        <div className="col-span-6 bg-white border border-slate-300 rounded shadow-md overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto max-h-[380px]">
            <table className="w-full text-[10px] text-left border-collapse">
              <thead className="bg-amber-600 text-white font-black uppercase sticky top-0">
                <tr>
                  <th className="p-2 border-r border-amber-700 text-center">No</th>
                  <th className="p-2 border-r border-amber-700">Trainset</th>
                  <th className="p-2 border-r border-amber-700">No Lambung</th>
                  <th className="p-2 border-r border-amber-700">Car Type</th>
                  <th className="p-2 border-r border-amber-700">Underframe No.</th>
                  <th className="p-2 border-r border-amber-700">Bogie Frame</th>
                  <th className="p-2">Bogie No.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr><td colSpan="7" className="p-4 text-center font-bold text-amber-600">Memuat Data PNKK & TKB...</td></tr>
                ) : isError ? (
                  <tr><td colSpan="7" className="p-4 text-center font-bold text-red-500">Gagal memuat data komponen. Silakan refresh.</td></tr>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-amber-50">
                      <td className="p-2 border-r text-center">{i + 1}.</td>
                      <td className="p-2 border-r font-bold text-amber-700">{r.trainset}</td>
                      <td className="p-2 border-r font-bold text-slate-800">{r.noLambung}</td>
                      <td className="p-2 border-r text-slate-600">{r.carType}</td>
                      <td className="p-2 border-r text-slate-600">{r.underframe}</td>
                      <td className="p-2 border-r text-slate-600">{r.bogieFrame}</td>
                      <td className="p-2 text-slate-600">{r.bogieNumber}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="p-4 text-center text-slate-400">Data nomor komponen tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-100 p-2 text-right text-[10px] text-slate-500 font-bold border-t border-slate-200">
            Total Component Record: {filteredRecords.length}
          </div>
        </div>

        {/* CHARTS (KANAN 6 COLS - KANAN) */}
        <div className="col-span-6 flex flex-col gap-3">
          {/* TREND LINE CHART */}
          <div className="bg-white border border-slate-300 rounded p-2 shadow-sm text-center flex flex-col justify-between h-44">
            <span className="text-[10px] font-black text-slate-700 uppercase">TRAINSET COMPONENT DISTRIBUTION</span>
            <div className="flex-1 w-full flex items-center justify-center">
              <LineChartCustom data={lineData} />
            </div>
          </div>

          {/* HORIZONTAL BAR CHART BRAND */}
          <div className="bg-white border border-slate-300 rounded p-2 shadow-sm text-center flex flex-col justify-between h-44">
            <span className="text-[10px] font-black text-slate-700 uppercase">COMPONENT BRAND DISTRIBUTION</span>
            <div className="flex-1 w-full flex items-center justify-center">
              <BarChartHorizontal data={brandBarData} />
            </div>
          </div>
        </div>

      </div>

      <div className="w-full border-t border-slate-300 pt-2 text-center text-[10px] font-black text-slate-400 uppercase mt-2">
        © 2026 PT INKA (PERSERO) • PORTAL PEMERIKSAAN NOMOR KOMPONEN (PNKK & TKB)
      </div>
    </div>
  );
}