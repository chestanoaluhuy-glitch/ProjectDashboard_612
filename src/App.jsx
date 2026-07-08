import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import FilterGrid from './components/FilterGrid';
import AnalyticsGrid from './components/AnalyticsGrid';
import FailureTable from './components/FailureTable';
import LineChartFailure from './components/LineChartFailure';

export default function App() {
  const [activeFilters, setActiveFilters] = useState({
    ts: '', 
    noKa: '', 
    relasi: '', 
    komponen: '', 
    status: '', 
    l2: '', 
    l1: '', 
    l3: '', 
    dokumentasi: ''
  });
  
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/fracas-data')
      .then((response) => {
        if (response.data && response.data.success) {
          const responseData = response.data.data || [];
          setAllData(responseData);
          setFilteredData(responseData);
        }
      })
      .catch((error) => console.error("Gagal mengambil data dari backend:", error));
  }, []);

  const handleFilterChange = (filterId, value) => {
    setActiveFilters((prev) => ({ ...prev, [filterId]: value }));
  };

  useEffect(() => {
    if (!allData || allData.length === 0) {
      setFilteredData([]);
      return;
    }

    let result = [...allData];

    if (activeFilters.ts) result = result.filter(item => item && item.ts === activeFilters.ts);
    if (activeFilters.noKa) result = result.filter(item => item && item.no_ka === activeFilters.noKa);
    if (activeFilters.relasi) result = result.filter(item => item && item.relasi === activeFilters.relasi);
    if (activeFilters.komponen) result = result.filter(item => item && item.komponenRusak === activeFilters.komponen);
    if (activeFilters.status) result = result.filter(item => item && item.status === activeFilters.status);

    if (activeFilters.l2) result = result.filter(item => item && item.l2 === activeFilters.l2);
    if (activeFilters.l1) result = result.filter(item => item && item.l1 === activeFilters.l1);
    if (activeFilters.l3) result = result.filter(item => item && item.l3 === activeFilters.l3);
    if (activeFilters.dokumentasi) result = result.filter(item => item && item.dokumentasi === activeFilters.dokumentasi);

    setFilteredData(result);
  }, [activeFilters, allData]);

  // ================= AGREGASI URUTAN DATA MURNI DARI KOLOM AY (DITAMPILKAN SEBAGAI 6 L1) =================
  const dapatkanDataL1 = () => {
    if (!filteredData || filteredData.length === 0) return [];

    const grupL1 = {};
    filteredData.forEach(item => {
      // Tetap membaca variabel komponenEshar hasil dari kolom AY spreadsheet kamu
      let namaL1 = '';
      
      if (item.komponenEshar) namaL1 = item.komponenEshar;
      else if (item.komponen_eshar) namaL1 = item.komponen_eshar;
      else if (item["Komponen Eshar"]) namaL1 = item["Komponen Eshar"];
      else if (item.eshar) namaL1 = item.eshar;
      else if (item.ay) namaL1 = item.ay; 

      namaL1 = namaL1 ? namaL1.toString().replace(/[\u00A0\s]+/g, ' ').trim() : '';
      
      if (!namaL1 || namaL1 === '-' || namaL1 === '0' || namaL1 === 'null' || namaL1 === 'Komponen Eshar') return;

      if (!grupL1[namaL1]) {
        grupL1[namaL1] = { count: 0, items: new Set() };
      }
      grupL1[namaL1].count += 1;

      const komponenSub = item.l2 || item.komponenRusak;
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
    const st = item.status ? item.status.toString().toUpperCase() : '';
    return st !== 'CLOSE';
  }).length : 0;

  const totalCloseTabel = filteredData ? filteredData.filter(item => {
    const st = item.status ? item.status.toString().toUpperCase() : '';
    return st === 'CLOSE';
  }).length : 0;

  return (
    <div className="min-h-screen bg-[#f4f4f6] p-4 font-sans flex flex-col gap-4 max-w-[1600px] mx-auto text-slate-800">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
        <div className="lg:col-span-3">
          <FilterGrid activeFilters={activeFilters} onFilterChange={handleFilterChange} />
        </div>
        <div className="lg:col-span-1">
          <KpiCard data={filteredData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-4 shadow-sm h-[290px] flex flex-col">
          <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide text-center">FAILURE TREND</h4>
          <div className="flex-1 min-h-0 w-full">
            <LineChartFailure data={filteredData} />
          </div>
        </div>

        <div className="lg:col-span-7 w-full">
          <AnalyticsGrid data={filteredData} />
        </div>
      </div>

      {/* ================= TABEL DATA 6 L1 STREAM (BISA SCROLL V) ================= */}
      <div className="w-full bg-white rounded border border-slate-200 shadow-sm flex flex-col overflow-hidden max-h-[290px] h-[290px]">
        <div className="bg-slate-100 border-b border-slate-200 p-2.5 flex justify-between items-center flex-shrink-0 select-none">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            TABEL 6 L1 (KOMPONEN SISTEM)
          </h4>
          <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-200 px-1.5 py-0.5 rounded">
            6 L1 Stream Data
          </span>
        </div>

        <div className="bg-slate-50 text-[10px] font-bold text-slate-500 p-2.5 grid grid-cols-12 border-b border-slate-200 uppercase tracking-wider flex-shrink-0 select-none">
          <div className="col-span-1 text-center">No</div>
          <div className="col-span-8 pl-2">Komponen Sistem (6 L1)</div>
          <div className="col-span-3 text-right pr-6">Record Count</div>
        </div>

        {/* List Data */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white text-[11px]">
          {dataL1Fixed.length === 0 ? (
            <div className="p-6 text-center text-slate-400 font-medium">
              Tidak ada data Komponen Sistem 6 L1 yang terdeteksi.
            </div>
          ) : (
            dataL1Fixed.map((row, index) => {
              const lebarPersen = (row.value / nilaiMaksimum) * 100;
              
              return (
                <div 
                  key={index} 
                  className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50 transition-colors relative group min-h-[44px]"
                >
                  <div className="col-span-1 text-center text-slate-400 font-mono font-bold relative z-10">
                    {index + 1}.
                  </div>

                  <div className="col-span-8 pl-2 relative min-w-0 h-full flex flex-col justify-center">
                    <div 
                      className="absolute left-1 top-1 bottom-1 bg-[#e15243]/10 rounded-sm transition-all duration-300" 
                      style={{ width: `calc(${lebarPersen}% - 4px)` }}
                    />
                    <div className="relative z-10 flex flex-col justify-center">
                      <span className="font-bold text-slate-700 truncate" title={row.name}>
                        {row.name}
                      </span>
                      {row.items && row.items.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5" title={row.items.join(', ')}>
                          Sub: {row.items.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-3 text-right pr-6 font-mono font-bold relative z-10 text-slate-900">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] border border-slate-200 font-black shadow-sm">
                      {row.value}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-2 px-3 flex justify-between items-center text-[10px] font-bold text-slate-600 flex-shrink-0 select-none">
          <div className="flex gap-3">
            <span>Total: <span className="font-mono text-slate-900 font-black">{totalBarisKomponen}</span></span>
            <span className="text-red-600 bg-red-50 px-1 rounded border border-red-100">
              OPEN: <span className="font-mono font-extrabold">{totalOpenTabel}</span>
            </span>
            <span className="text-green-600 bg-green-50 px-1 rounded border border-green-100">
              CLOSE: <span className="font-mono font-extrabold">{totalCloseTabel}</span>
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-normal uppercase tracking-wider">Summary</span>
        </div>
      </div>

      <div className="w-full">
        <FailureTable data={filteredData} />
      </div>
    </div>
  );
}