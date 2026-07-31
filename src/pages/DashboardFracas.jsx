import React, { useState, useEffect } from 'react';
import axios from 'axios';

// JALUR IMPORT COMPONENT
import Header from '../components/Header';
import KpiCard from '../components/KpiCard';
import FilterGrid from '../components/FilterGrid';
import AnalyticsGrid from '../components/AnalyticsGrid';
import FailureTable from '../components/FailureTable';
import LineChartFailure from '../components/LineChartFailure';

// 📌 HUBUNGKAN KE BACKEND EXPRESS (NODE.JS) KITA
const BACKEND_API_URL = "http://localhost:5000/api/sheets-data?targetSheet=FRACAS";

export default function FracasDashboard({ onBackToPortal }) {
  const [activeFilters, setActiveFilters] = useState({
    trainset: '', 
    noKa: '', 
    l1: '', 
    l2: '', 
    l3: ''
  });
  
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 🚀 FETCH DATA DARI BACKEND EXPRESS LOCAL
  useEffect(() => {
    setLoading(true);
    axios.get(BACKEND_API_URL)
      .then((response) => {
        if (response.data && response.data.success) {
          const rawData = response.data.data || [];
          
          const mappedData = rawData.map(item => {
            // Helper pintar untuk cocokin nama kolom dari Google Sheets
            const getVal = (...keys) => {
              if (!item) return '';
              
              // 1. Cek dulu pencocokan nama kolom PRESISI (Case-Insensitive)
              for (let k of keys) {
                const foundKey = Object.keys(item).find(
                  key => key.trim().toLowerCase() === String(k).trim().toLowerCase()
                );
                if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null && String(item[foundKey]).trim() !== '') {
                  return String(item[foundKey]).trim();
                }
              }

              // 2. Fallback pencocokan normalized jika yang presisi tidak ketemu
              const normalizedItem = {};
              Object.keys(item || {}).forEach(k => {
                const cleanKey = String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!normalizedItem[cleanKey] && item[k] !== undefined && item[k] !== null && String(item[k]).trim() !== '') {
                  normalizedItem[cleanKey] = String(item[k]).trim();
                }
              });

              for (let k of keys) {
                const cleanTarget = String(k).toLowerCase().replace(/[^a-z0-9]/g, '');
                if (normalizedItem[cleanTarget] !== undefined) {
                  return normalizedItem[cleanTarget];
                }
              }
              return '';
            };

            return {
              ...item,
              trainset: getVal('Trainset', 'trainset', 'TS', 'Train Set', 'No Trainset'),
              no_ka: getVal('No. KA', 'no_ka', 'No KA', 'KA', 'Nomor KA'),
              
              // 🎯 PERBAIKAN: Utamakan 'Klasifikasi Komponen (L1)' DULU baru '6 L1'
              klasifikasi_komponen_l1: getVal(
                'Klasifikasi Komponen (L1)', 
                'klasifikasi_komponen_l1',
                '6 L1', 
                'Klasifikasi Komponen L1', 
                'Komponen L1', 
                'L1'
              ),
              
              klasifikasi_system_subsystem_l2: getVal(
                'Klasifikasi System/ Subsystem (L2)', 
                'klasifikasi_system_subsystem_l2',
                'Klasifikasi System Subsystem L2', 
                'Subsystem L2', 
                'L2', 
                'Sub System'
              ),
              
              lru_l3: getVal(
                'LRU (L3)', 
                'lru_l3',
                'LRU L3', 
                'L3', 
                'LRU', 
                'Komponen Rusak (TS)'
              ),
              
              status_gangguan: getVal('Status Gangguan', 'status_gangguan', 'Status (TKA)', 'Status', 'STATUS') || 'OPEN',
              tgl_kejadian: getVal('Tgl Kejadian', 'tgl_kejadian', 'Tanggal Kejadian', 'Tgl & waktu', 'Date'),
              waktu_kejadian: getVal('Waktu Kejadian', 'waktu_kejadian', 'Jam Kejadian', 'Waktu'),
              temuan: getVal('Temuan', 'temuan', 'Uraian Temuan', 'Deskripsi Temuan'),
              detail_temuan: getVal('Detail Temuan', 'detail_temuan', 'Detail Deskripsi Permasalahan / Kegiatan', 'Detail'),
              solusi_penanganan: getVal('Solusi/Penanganan', 'solusi_penanganan', 'Solusi', 'Penanganan', 'Tindakan')
            };
          });

          setAllData(mappedData);
          setFilteredData(mappedData);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil data FRACAS dari Backend:", error);
        setLoading(false);
      });
  }, []);

  // 2. 🛠️ HANDLER INPUT FILTER
  const handleFilterChange = (filterName, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // 3. 🛠️ FILTER LOGIC
  useEffect(() => {
    if (!allData || allData.length === 0) {
      setFilteredData([]);
      return;
    }

    let result = [...allData];

    if (activeFilters.trainset) {
      result = result.filter(item => item && String(item.trainset).toLowerCase() === String(activeFilters.trainset).toLowerCase().trim());
    }
    if (activeFilters.noKa) {
      result = result.filter(item => item && String(item.no_ka).toLowerCase() === String(activeFilters.noKa).toLowerCase().trim());
    }
    if (activeFilters.l1) {
      result = result.filter(item => item && String(item.klasifikasi_komponen_l1).toLowerCase() === String(activeFilters.l1).toLowerCase().trim());
    }
    if (activeFilters.l2) {
      result = result.filter(item => item && String(item.klasifikasi_system_subsystem_l2).toLowerCase() === String(activeFilters.l2).toLowerCase().trim());
    }
    if (activeFilters.l3) {
      result = result.filter(item => item && String(item.lru_l3).toLowerCase() === String(activeFilters.l3).toLowerCase().trim());
    }

    setFilteredData(result);
  }, [activeFilters, allData]);

  // 4. 🛠️ AGREGASI DATA L1
  const dapatkanDataL1 = () => {
    if (!filteredData || filteredData.length === 0) return [];

    const grupL1 = {};
    filteredData.forEach(item => {
      let namaL1 = item.klasifikasi_komponen_l1 || ''; 
      namaL1 = namaL1 ? namaL1.toString().replace(/[\u00A0\s]+/g, ' ').trim() : '';
      if (!namaL1 || namaL1 === '-' || namaL1 === '0' || namaL1 === 'null' || namaL1.toLowerCase() === 'klasifikasi komponen l1') return;

      if (!grupL1[namaL1]) {
        grupL1[namaL1] = { count: 0, items: new Set() };
      }
      grupL1[namaL1].count += 1;

      const komponenSub = item.klasifikasi_system_subsystem_l2; 
      if (komponenSub && komponenSub !== '-' && komponenSub !== 'null' && komponenSub !== '0') {
        grupL1[namaL1].items.add(komponenSub.toString().trim());
      }
    });

    return Object.keys(grupL1).map(key => ({
      name: key, 
      value: grupL1[key].count,
      items: Array.from(grupL1[key].items).slice(0, 3)
    })).sort((a, b) => b.value - a.value);
  };

  const dataL1Fixed = dapatkanDataL1();
  const nilaiMaksimum = dataL1Fixed.length > 0 && dataL1Fixed[0].value > 0 ? dataL1Fixed[0].value : 1;
  const totalBarisKomponen = filteredData ? filteredData.length : 0;
  
  const totalOpenTabel = filteredData ? filteredData.filter(item => {
    const st = (item.status_gangguan || item.status || '').toString().toUpperCase();
    return st !== 'CLOSE' && st !== 'CLOSED';
  }).length : 0;

  const totalCloseTabel = filteredData ? filteredData.filter(item => {
    const st = (item.status_gangguan || item.status || '').toString().toUpperCase();
    return st === 'CLOSE' || st === 'CLOSED';
  }).length : 0;

  return (
    <div className="w-full bg-[#f4f4f6] p-3 font-sans flex flex-col gap-2 max-w-[1600px] mx-auto text-slate-800 select-none [zoom:0.82] lg:[zoom:0.85]">
      
      {/* TOMBOL KEMBALI KE PORTAL */}
      <div className="w-full flex justify-start">
        <button 
          onClick={onBackToPortal}
          className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded shadow-sm transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
        >
          ⬅ Kembali ke Portal Menu
        </button>
      </div>

      {/* HEADER UTAMA */}
      <Header />

      {/* FILTER CONTROL PANEL */}
      <div className="bg-white rounded-lg border border-slate-200 p-2.5 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-3 items-center relative z-20">
        
        {/* SECTOR KIRI: FilterGrid */}
        <div className="lg:col-span-9 flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#e15243]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 00-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
              System Control Filter Panel
            </span>
          </div>
          <FilterGrid activeFilters={activeFilters} onFilterChange={handleFilterChange} data={allData} />
        </div>

        {/* SECTOR KANAN: KpiCard */}
        <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-2 lg:pt-0 lg:pl-3 h-full flex items-center justify-center">
          <div className="w-full h-full flex flex-col justify-center">
            <KpiCard data={filteredData} />
          </div>
        </div>

      </div>

      {/* MID SECTION: Analytics Charts */}
      <div className="w-full relative z-10">
        <AnalyticsGrid data={filteredData} />
      </div>

      {/* LAYOUT GRID (50:50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 items-stretch w-full relative z-10">
        
        {/* SETENGAH KIRI: TABEL 6 L1 */}
        <div className="w-full bg-white rounded border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[210px] max-h-[210px]">
          <div className="bg-slate-100 border-b border-slate-200 p-2 flex justify-between items-center flex-shrink-0">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              TABEL 6 L1 (KOMPONEN SISTEM)
            </h4>
            <span className="text-[9px] text-slate-500 font-mono font-bold bg-slate-200 px-1.5 py-0.5 rounded">
              6 L1 Stream Data
            </span>
          </div>

          <div className="bg-slate-50 text-[9px] font-bold text-slate-500 p-1.5 grid grid-cols-12 border-b border-slate-200 uppercase tracking-wider flex-shrink-0">
            <div className="col-span-1 text-center">No</div>
            <div className="col-span-8 pl-2">Komponen Sistem (6 L1)</div>
            <div className="col-span-3 text-right pr-4">Record Count</div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white text-[10px]">
            {loading ? (
              <div className="p-3 text-center text-slate-400 font-bold">
                Memuat Data FRACAS...
              </div>
            ) : dataL1Fixed.length === 0 ? (
              <div className="p-3 text-center text-slate-400 font-medium">
                Tidak ada data Komponen Sistem 6 L1 yang terdeteksi. Periksa kolom Google Sheets.
              </div>
            ) : (
              dataL1Fixed.map((row, index) => {
                const lebarPersen = (row.value / nilaiMaksimum) * 100;
                return (
                  <div key={index} className="grid grid-cols-12 p-1 items-center hover:bg-slate-50 transition-colors relative group min-h-[28px]">
                    <div className="col-span-1 text-center text-slate-400 font-mono font-bold relative z-10">
                      {index + 1}.
                    </div>
                    <div className="col-span-8 pl-2 relative min-w-0 h-full flex flex-col justify-center">
                      <div className="absolute left-1 top-1 bottom-1 bg-[#e15243]/10 rounded-sm transition-all duration-300" style={{ width: `calc(${lebarPersen}% - 4px)` }} />
                      <div className="relative z-10 flex flex-col justify-center">
                        <span className="font-bold text-slate-700 truncate" title={row.name}>{row.name}</span>
                      </div>
                    </div>
                    <div className="col-span-3 text-right pr-4 font-mono font-bold relative z-10 text-slate-900">
                      <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[9px] border border-slate-200 font-black shadow-sm">
                        {row.value}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="bg-slate-50 border-t border-slate-200 p-1 px-2.5 flex justify-between items-center text-[9px] font-bold text-slate-600 flex-shrink-0">
            <div className="flex gap-2">
              <span>Total: <span className="font-mono text-slate-900 font-black">{totalBarisKomponen}</span></span>
              <span className="text-red-600 bg-red-50 px-1 rounded border border-red-100">
                OPEN: <span className="font-mono font-extrabold">{totalOpenTabel}</span>
              </span>
              <span className="text-green-600 bg-green-50 px-1 rounded border border-green-100">
                CLOSE: <span className="font-mono font-extrabold">{totalCloseTabel}</span>
              </span>
            </div>
            <span className="text-[8px] text-slate-400 font-normal uppercase tracking-wider">Summary</span>
          </div>
        </div>

        {/* SETENGAH KANAN: FAILURE TREND DIAGRAM */}
        <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-sm h-[210px] max-h-[210px] flex flex-col w-full">
          <h4 className="text-[10px] font-bold text-slate-700 mb-1 uppercase tracking-wide text-center">
            📈 FAILURE TREND DIAGRAM
          </h4>
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            <LineChartFailure data={filteredData} />
          </div>
        </div>

      </div>

      {/* TABEL DETAIL LOG */}
      <div className="w-full relative z-10 max-h-[280px] overflow-y-auto rounded border border-slate-200">
        <FailureTable data={filteredData} />
      </div>
    </div>
  );
}