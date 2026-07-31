import React from 'react';

export default function Table6L1({ data }) {
  const dataset = Array.isArray(data) ? data : [];

  const hitungL1 = () => {
    const summary = {};
    
    dataset.forEach(item => {
      const l1 = item.klasifikasi_komponen_l1 || item['KLASIFIKASI KOMPONEN'] || item.klasifikasi || item.system || 'Lainnya';
      if (l1 && l1 !== '-' && l1 !== '0') {
        const cleanL1 = l1.toString().trim();
        summary[cleanL1] = (summary[cleanL1] || 0) + 1;
      }
    });

    const totalKasus = dataset.length || 1;

    return Object.keys(summary)
      .map(key => ({
        nama: key,
        jumlah: summary[key],
        persentase: ((summary[key] / totalKasus) * 100).toFixed(1)
      }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 6);
  };

  const list6L1 = hitungL1();

  return (
    <div className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden w-full select-none">
      <div className="bg-[#e15243] text-white text-[11px] font-bold py-2 px-3 flex justify-between items-center">
        <span>📊 REKAPITULASI 6 KLASIFIKASI KOMPONEN L1</span>
        <span className="text-[9px] bg-red-800 px-2 py-0.5 rounded font-mono">TOP 6</span>
      </div>

      <div className="p-2 overflow-x-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
              <th className="p-2 text-center w-12">No</th>
              <th className="p-2">Klasifikasi L1</th>
              <th className="p-2 text-center">Jumlah Gangguan</th>
              <th className="p-2 text-center">Persentase</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list6L1.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-slate-400">Tidak ada data 6 L1</td>
              </tr>
            ) : (
              list6L1.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 text-slate-700">
                  <td className="p-2 text-center font-mono font-bold text-slate-500">{idx + 1}.</td>
                  <td className="p-2 font-semibold text-slate-800">{item.nama}</td>
                  <td className="p-2 text-center font-mono font-bold text-red-600">{item.jumlah} kasus</td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-red-500 h-1.5 rounded-full" 
                          style={{ width: `${item.persentase}%` }} 
                        />
                      </div>
                      <span className="font-mono text-[10px] font-bold">{item.persentase}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}