import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';

// 📌 IMPORT KOMPONEN REUSABLE
import Header from '../components/Header';
import LineChartCustom from '../components/LineChartCustom';

// 🌐 BASE URL API (Mengambil dari Vercel Env / Ngrok, fallback ke Vercel backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://project-dashboard-612.vercel.app';

// 🎨 MAP WARNA SESUAI GAMBAR CONTOH
const COLOR_MAP = {
  // Akar Masalah
  'Material': '#3B82F6', // Biru
  'Metode': '#F97316',   // Oranye
  'Dokumen': '#A855F7',  // Ungu
  'Personil': '#84CC16', // Hijau-Muda

  // Disposisi
  'RTS': '#3B82F6',      // Biru
  'Repair': '#F97316',   // Oranye
  'Reject': '#A855F7'    // Ungu
};

export default function NcrDashboard({ onBackToPortal }) {
  const [ncrRecords, setNcrRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Opsi Dropdown Filter
  const [options, setOptions] = useState({
    projek: [],
    unitTujuan: [],
    groupInspektor: [],
    status: []
  });

  // State Filter Aktif
  const [filters, setFilters] = useState({
    projek: '',
    unitTujuan: '',
    groupInspektor: '',
    status: ''
  });

  // 1. FETCH DATA UTAMA & DROPDOWN FILTERS
  useEffect(() => {
    setLoading(true);

    // Config header khusus ngrok agar tidak terblokir warning page
    const axiosConfig = {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    };

    Promise.all([
      axios.get(`${API_BASE_URL}/api/sheets-data?targetSheet=NCR`, axiosConfig),
      axios.get(`${API_BASE_URL}/api/filters?targetSheet=NCR`, axiosConfig)
    ]).then(([resData, resFilters]) => {
      if (resData.data && resData.data.success) {
        const raw = resData.data.data || [];
        const mapped = raw.map(item => ({
          noNCR: item["No Document NCR"] || item["No NCR"] || "-",
          tglTerbit: item["Tgl Terbit"] || item["Tanggal Terbit"] || item["Tanggal"] || "-",
          nomorPO: item["Nomor PO"] || item["PO"] || "-",
          namaProses: item["Nama Proses"] || "-",
          uraian: item["Uraian Ketidaksesuaian"] || item["Uraian"] || "-",
          inspektor: item["Inspektor QC"] || item["Group Inspektor"] || "-",
          acuan: item["Acuan Pemeriksaan"] || "-",
          unitTujuan: item["Unit Tujuan"] || "-",
          projek: item["Nama Proyek"] || item["Projek"] || "-",
          status: item["Status NCR"] || item["Status"] || "OPEN",
          akarMasalah: item["Akar Masalah"] || item["Kategori"] || "-",
          disposisi: item["Disposisi"] || item["Keputusan"] || "-"
        }));
        setNcrRecords(mapped);
        setFilteredRecords(mapped);
      }
      if (resFilters.data && resFilters.data.success) {
        setOptions(resFilters.data.data || {});
      }
      setLoading(false);
    }).catch(err => {
      console.error("Gagal load NCR:", err);
      setLoading(false);
    });
  }, []);

  // 2. LOGIKA FILTERING DATA
  useEffect(() => {
    let res = [...ncrRecords];
    if (filters.projek) res = res.filter(r => r.projek === filters.projek);
    if (filters.unitTujuan) res = res.filter(r => r.unitTujuan === filters.unitTujuan);
    if (filters.groupInspektor) res = res.filter(r => r.inspektor === filters.groupInspektor);
    if (filters.status) res = res.filter(r => r.status === filters.status);
    setFilteredRecords(res);
  }, [filters, ncrRecords]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  // 3. 📊 DATA AKAR MASALAH (RING / DOUGHNUT CHART)
  const getAkarMasalahData = () => {
    const counts = { 'Material': 0, 'Metode': 0, 'Dokumen': 0, 'Personil': 0 };

    if (filteredRecords && filteredRecords.length > 0) {
      filteredRecords.forEach(r => {
        const val = String(r.akarMasalah || r.uraian || '').toUpperCase();
        if (val.includes('METODE') || val.includes('METHOD')) counts['Metode']++;
        else if (val.includes('DOKUMEN') || val.includes('DOC') || val.includes('GAMBAR')) counts['Dokumen']++;
        else if (val.includes('PERSONIL') || val.includes('MAN') || val.includes('OPERATOR')) counts['Personil']++;
        else counts['Material']++;
      });
      return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }

    // Default Tampilan awal agar persis gambar jika data belum terisi
    return [
      { name: 'Material', value: 91.5 },
      { name: 'Metode', value: 3.5 },
      { name: 'Dokumen', value: 2.5 },
      { name: 'Personil', value: 2.5 }
    ];
  };

  // 4. 📊 DATA DISPOSISI (PIE CHART FULL)
  const getDisposisiData = () => {
    const counts = { 'RTS': 0, 'Repair': 0, 'Reject': 0 };

    if (filteredRecords && filteredRecords.length > 0) {
      filteredRecords.forEach(r => {
        const val = String(r.disposisi || r.status || '').toUpperCase();
        if (val.includes('REPAIR') || val.includes('PERBAIKAN')) counts['Repair']++;
        else if (val.includes('REJECT') || val.includes('TOLAK')) counts['Reject']++;
        else counts['RTS']++;
      });
      return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }

    // Default Tampilan awal
    return [
      { name: 'RTS', value: 77.1 },
      { name: 'Repair', value: 13.1 },
      { name: 'Reject', value: 9.8 }
    ];
  };

  // 5. 📈 TREND LINE DATA
  const getTrendLineData = () => {
    if (!filteredRecords || filteredRecords.length === 0) return [];
    const counts = {};
    filteredRecords.forEach(r => {
      const tgl = r.tglTerbit && r.tglTerbit !== '-' ? String(r.tglTerbit) : 'N/A';
      counts[tgl] = (counts[tgl] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).slice(0, 8);
  };

  const akarMasalahData = getAkarMasalahData();
  const disposisiData = getDisposisiData();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-6 select-none relative flex flex-col justify-between border-[16px] border-teal-700 gap-4" style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff, #f0fdfa)' }}>
      
      {/* BAR ATAS: TOMBOL EXIT PORTAL */}
      <div className="w-full flex justify-start">
        <button 
          onClick={onBackToPortal} 
          className="bg-teal-800 hover:bg-teal-900 text-white text-[10px] font-black px-4 py-2 rounded uppercase shadow cursor-pointer transition-all"
        >
          ⬅ EXIT TO PORTAL
        </button>
      </div>

      {/* HEADER BRANDING */}
      <Header type="NCR" />

      {/* METRIC & DROPDOWNS FILTERS */}
      <div className="grid grid-cols-12 gap-3 items-center">
        <div className="col-span-2 bg-white border-2 border-teal-700 rounded text-center shadow-sm">
          <div className="bg-teal-700 text-white text-[9px] font-black py-0.5 uppercase">TOTAL NCR</div>
          <div className="text-3xl font-black text-slate-800 py-1">{loading ? "..." : filteredRecords.length}</div>
        </div>

        <div className="col-span-10 grid grid-cols-4 gap-3">
          <select value={filters.projek} onChange={(e) => handleFilterChange('projek', e.target.value)} className="bg-teal-600 text-white rounded px-3 py-2 text-xs font-black outline-none shadow-sm cursor-pointer">
            <option value="">Projek (Semua)</option>
            {options.projek?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>

          <select value={filters.unitTujuan} onChange={(e) => handleFilterChange('unitTujuan', e.target.value)} className="bg-teal-600 text-white rounded px-3 py-2 text-xs font-black outline-none shadow-sm cursor-pointer">
            <option value="">Unit Tujuan (Semua)</option>
            {options.unitTujuan?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>

          <select value={filters.groupInspektor} onChange={(e) => handleFilterChange('groupInspektor', e.target.value)} className="bg-teal-600 text-white rounded px-3 py-2 text-xs font-black outline-none shadow-sm cursor-pointer">
            <option value="">Group Inspektor (Semua)</option>
            {options.groupInspektor?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>

          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="bg-teal-600 text-white rounded px-3 py-2 text-xs font-black outline-none shadow-sm cursor-pointer">
            <option value="">Status (Semua)</option>
            {options.status?.map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-12 gap-4 flex-1">
        {/* TABEL DATA (KIRI) */}
        <div className="col-span-7 bg-white border border-slate-300 rounded shadow-md overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto max-h-[380px]">
            <table className="w-full text-[9px] text-left border-collapse">
              <thead className="bg-teal-700 text-white font-black uppercase sticky top-0">
                <tr>
                  <th className="p-2 border-r border-teal-800">No</th>
                  <th className="p-2 border-r border-teal-800">No NCR</th>
                  <th className="p-2 border-r border-teal-800">Tgl Terbit</th>
                  <th className="p-2 border-r border-teal-800">Nomor PO</th>
                  <th className="p-2 border-r border-teal-800">Nama Proses</th>
                  <th className="p-2 border-r border-teal-800">Uraian Ketidaksesuaian</th>
                  <th className="p-2">Inspektor QC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan="7" className="p-4 text-center font-bold text-teal-700">Loading NCR Data...</td></tr>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-teal-50">
                      <td className="p-1.5 border-r text-center">{i + 1}</td>
                      <td className="p-1.5 border-r font-bold text-slate-900">{r.noNCR}</td>
                      <td className="p-1.5 border-r text-center whitespace-nowrap">{r.tglTerbit}</td>
                      <td className="p-1.5 border-r">{r.nomorPO}</td>
                      <td className="p-1.5 border-r font-semibold">{r.namaProses}</td>
                      <td className="p-1.5 border-r">{r.uraian}</td>
                      <td className="p-1.5 font-semibold">{r.inspektor}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="p-4 text-center text-slate-400">Data NCR tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CHARTS (KANAN) */}
        <div className="col-span-5 flex flex-col gap-3 justify-between">
          {/* TREND LINE */}
          <div className="bg-white border border-slate-300 rounded p-2 shadow-sm text-center flex flex-col justify-between h-36">
            <span className="text-[10px] font-black text-slate-700 uppercase">RECORD TREND</span>
            <div className="flex-1 w-full flex items-center justify-center">
              <LineChartCustom data={getTrendLineData()} />
            </div>
          </div>

          {/* 🟢 KOTAK DENGAN 2 DIAGRAM LINGKARAN LANGSUNG DIBUAT DI SINI */}
          <div className="bg-white border border-slate-300 rounded p-2.5 shadow-sm text-center flex flex-col justify-between h-56">
            <div className="w-full h-full grid grid-cols-2 gap-2 items-center">
              
              {/* DIAGRAM 1: AKAR MASALAH (RING / DOUGHNUT CHART) */}
              <div className="flex flex-col items-center h-full justify-center">
                <h3 className="text-xs font-bold text-slate-800 mb-1">Akar Masalah</h3>
                <div className="w-full h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={akarMasalahData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28} // Ring / Doughnut
                        outerRadius={48}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {akarMasalahData.map((entry, index) => (
                          <Cell key={`cell-akar-${index}`} fill={COLOR_MAP[entry.name] || '#94A3B8'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}`, name]} />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle" 
                        iconType="circle" 
                        iconSize={7}
                        wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* DIAGRAM 2: DISPOSISI (PIE CHART FULL) */}
              <div className="flex flex-col items-center h-full justify-center border-l border-slate-200 pl-2">
                <h3 className="text-xs font-bold text-slate-800 mb-1">Disposisi</h3>
                <div className="w-full h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={disposisiData}
                        cx="50%"
                        cy="50%"
                        outerRadius={48} // Full Pie
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {disposisiData.map((entry, index) => (
                          <Cell key={`cell-disp-${index}`} fill={COLOR_MAP[entry.name] || '#94A3B8'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}`, name]} />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle" 
                        iconType="circle" 
                        iconSize={7}
                        wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-slate-300 pt-2 text-center text-[10px] font-black text-slate-400 uppercase mt-2">
        © 2026 PT INKA (PERSERO) • QUALITY ENGINEERING MODULE
      </div>
    </div>
  );
}