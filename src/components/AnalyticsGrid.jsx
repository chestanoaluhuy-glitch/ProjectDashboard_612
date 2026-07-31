import React from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AnalyticsGrid({ data }) {
  const dataset = data || [];

  const totalOpenTabel = dataset.filter(item => {
    const st = item.status_gangguan || item.status || '';
    return st.toString().toUpperCase() !== 'CLOSE';
  }).length;

  const totalCloseTabel = dataset.filter(item => {
    const st = item.status_gangguan || item.status || '';
    return st.toString().toUpperCase() === 'CLOSE';
  }).length;

  const dapatkanDataStatus = () => {
    if (dataset.length === 0) return [];
    return [
      { name: 'OPEN', value: totalOpenTabel, color: '#e15243' },
      { name: 'CLOSE', value: totalCloseTabel, color: '#22c55e' }
    ];
  };

  const dapatkanDataKlasifikasi = () => {
    if (dataset.length === 0) return [];
    const hitung = {};
    const warnaWarni = ['#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#06b6d4'];

    dataset.forEach(item => {
      const kl = item.klasifikasi_komponen_l1 || item.klasifikasi || item.system || 'Lainnya';
      if (kl && kl !== '-' && kl !== '0') {
        const cleanKey = kl.toString().trim();
        hitung[cleanKey] = (hitung[cleanKey] || 0) + 1;
      }
    });

    return Object.keys(hitung).map((key, i) => ({
      name: key,
      value: hitung[key],
      color: warnaWarni[i % warnaWarni.length]
    })).slice(0, 6);
  };

  const dapatkanDataLevel = () => {
    if (dataset.length === 0) return [];
    let low = 0, med = 0, high = 0;

    dataset.forEach(item => {
      const lvl = item.levelGangguan || item.level || item.status_gangguan || 'LOW';
      const lvlStr = lvl.toString().toUpperCase();

      if (lvlStr.includes('HIGH') || lvlStr.includes('TINGGI') || lvlStr.includes('CRITICAL')) high++;
      else if (lvlStr.includes('MED') || lvlStr.includes('SEDANG')) med++;
      else low++;
    });

    return [
      { name: 'LOW', value: low, color: '#3b82f6' },
      { name: 'MED', value: med, color: '#eab308' },
      { name: 'HIGH', value: high, color: '#ef4444' }
    ];
  };

  const dataStatus = dapatkanDataStatus();
  const dataKlasifikasi = dapatkanDataKlasifikasi();
  const dataLevel = dapatkanDataLevel();

  const renderMiniDonut = (judul, chartData) => (
    <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 text-center truncate">
        {judul}
      </h5>
      
      <div className="flex-1 relative min-h-[110px] w-full flex items-center justify-center">
        {dataset.length === 0 || chartData.length === 0 ? (
          <span className="text-xs font-bold text-slate-300">No Data Available</span>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={30}  
                outerRadius={48}  
                paddingAngle={3}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip textStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-col gap-1 text-[10px] mt-1 border-t border-slate-100 pt-2 flex-shrink-0 max-h-[75px] overflow-y-auto">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between bg-slate-50 px-2 py-0.5 rounded border border-slate-100/60 w-full">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-700 font-semibold truncate" title={item.name}>
                {item.name}
              </span>
            </div>
            <span className="text-slate-500 font-extrabold font-mono ml-2 flex-shrink-0">
              ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 h-[290px] w-full">
      {renderMiniDonut("Proporsional Status Gangguan", dataStatus)}
      {renderMiniDonut("Proporsional Klasifikasi", dataKlasifikasi)}
      {renderMiniDonut("Proporsional Level Gangguan", dataLevel)}
    </div>
  );
}