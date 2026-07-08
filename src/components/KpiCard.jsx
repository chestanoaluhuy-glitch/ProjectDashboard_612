import React from 'react';

export default function KpiCard({ data }) {
  // 1. Hitung Total Temuan secara dinamis
  const totalTemuan = data ? data.length : 0;

  // Helper untuk membersihkan tag HTML jika ada string pengganggu terbawa ke area KPI
  const bersihkanTeks = (str) => {
    if (!str) return '';
    return str.toString().replace(/<\/?[^>]+(>|$)/g, "").replace(/&nbsp;/g, " ").trim();
  };

  // 2. Cari Tanggal/Kode Temuan Terbaru secara otomatis dari baris paling akhir
  const getTanggalTerbaru = () => {
    if (!data || data.length === 0) return '-';
    
    // Mengecek properti tanggal kejadian secara fleksibel
    const validDates = data
      .map(item => item.tglKejadian || item.tgl_kejadian || '')
      .filter(date => date && date !== '-');

    if (validDates.length === 0) return '-';

    const rawTerbaru = validDates[validDates.length - 1];
    const bersihTerbaru = bersihkanTeks(rawTerbaru);

    // Jika data terbaru berupa format kode tiket registrasi seperti KA/MID/193/2025
    if (bersihTerbaru.includes('/')) {
      return bersihTerbaru; // Langsung tampilkan nomor registrasi kasus terbaru secara rapi
    }

    return bersihTerbaru;
  };

  return (
    <div className="bg-white rounded border border-slate-200 p-3 shadow-sm flex flex-col justify-between h-[92px] w-full text-slate-800">
      
      {/* Bagian Atas: Label Judul KPI */}
      <div className="flex justify-between items-center w-full">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Total Temuan
        </span>
        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-mono tracking-tight animate-pulse">
          Live
        </span>
      </div>

      {/* Bagian Tengah: Angka Utama Besar */}
      <div className="text-2xl font-black text-slate-800 tracking-tight leading-none my-1 flex items-baseline gap-1">
        {totalTemuan}
        <span className="text-[10px] font-normal text-slate-400 uppercase tracking-wide">
          kasus
        </span>
      </div>

      {/* Bagian Bawah: Indikator Kasus / Tanggal Terbaru */}
      <div className="text-[9px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between items-center w-full min-w-0">
        <span className="flex-shrink-0">Terbaru:</span>
        <span 
          className="font-bold text-slate-600 truncate pl-2 font-mono" 
          title={getTanggalTerbaru()}
        >
          {getTanggalTerbaru()}
        </span>
      </div>

    </div>
  );
}