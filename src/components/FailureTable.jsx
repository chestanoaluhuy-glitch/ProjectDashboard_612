import React from 'react';

export default function FailureTable({ data = [] }) {
  
  // Helper fleksibel untuk ambil properti object
  const getVal = (item, ...keys) => {
    if (!item) return '';
    const normalizedItem = {};
    Object.keys(item).forEach(k => {
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

  // 1. FORMATTER TANGGAL LOKAL (WIB / Local Time)
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    let str = String(dateStr).trim();

    // Jika berupa ISO string dari Google Sheets (misal: 2025-10-31T17:00:00.000Z)
    if (str.includes('T') || str.includes('Z')) {
      const dateObj = new Date(str);
      if (!isNaN(dateObj.getTime())) {
        // Gunakan format Indonesia
        return dateObj.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    }

    // Jika format string YYYY-MM-DD standar
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [year, month, day] = str.split('-').map(Number);
      const bulanIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agust', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${day} ${bulanIndo[month - 1]} ${year}`;
    }

    return str;
  };

  // 2. FORMATTER JAM LOKAL (WIB / Local Time)
  const formatTime = (timeStr, rawDateStr) => {
    if (!timeStr || timeStr === '-') return '-';
    let str = String(timeStr).trim();

    // Jika timeStr mengandung tanggal ISO
    if (str.includes('T')) {
      const dateObj = new Date(str);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace('.', ':');
      }
    }

    // Jika waktu disimpan terpisah dari tanggal ISO utama
    if (rawDateStr && rawDateStr.includes('T') && /^\d{1,2}:\d{2}/.test(str)) {
      // Jika jamnya murni misal "06:00" atau "6:00", langsung tampilkan saja tanpa diolah tanggalnya
      return str.length === 4 ? `0${str}` : str;
    }

    // Jika berupa angka HH:MM:SS biasa
    if (str.length >= 4 && str.includes(':')) {
      const parts = str.split(':');
      const hh = parts[0].padStart(2, '0');
      const mm = parts[1].padStart(2, '0');
      return `${hh}:${mm}`;
    }

    return str;
  };

  return (
    <div className="w-full bg-white font-sans text-slate-800">
      <table className="w-full text-left border-collapse text-[10px]">
        {/* HEADER TABEL */}
        <thead>
          <tr className="bg-[#e15243] text-white uppercase text-[9.5px] font-bold tracking-wider divide-x divide-white/20">
            <th className="p-2 text-center w-[40px]">No</th>
            <th className="p-2 text-center w-[100px]">Tgl Kejadian</th>
            <th className="p-2 text-center w-[80px]">Waktu Kejadian</th>
            <th className="p-2 w-[230px]">Temuan</th>
            <th className="p-2 text-center w-[120px]">Detail Temuan</th>
            <th className="p-2 text-center w-[100px]">Tgl Mulai TDL</th>
            <th className="p-2 w-[250px]">Solusi / Penanganan</th>
            <th className="p-2 text-center w-[100px]">Tgl Selesai TDL</th>
          </tr>
        </thead>

        {/* BODY TABEL */}
        <tbody className="divide-y divide-slate-200">
          {data && data.length > 0 ? (
            data.map((row, index) => {
              // Extract Raw Data
              const rawTglKejadian = getVal(row, 'tgl_kejadian', 'Tgl Kejadian', 'Tanggal Kejadian', 'Tgl & waktu', 'Date');
              const rawWaktu = getVal(row, 'waktu_kejadian', 'Waktu Kejadian', 'Jam Kejadian', 'Waktu');
              
              const temuan = getVal(row, 'temuan', 'Uraian Temuan', 'Deskripsi Temuan') || '-';
              const detailTemuan = getVal(row, 'detail_temuan', 'Detail Temuan', 'Detail Deskripsi Permasalahan / Kegiatan', 'Detail') || '-';
              
              const rawTglMulaiTDL = getVal(row, 'tgl_mulai_tdl', 'Tgl Mulai TDL', 'Tanggal Mulai TDL', 'Tgl TDL', 'Tgl Mulai', 'Mulai TDL');
              const solusi = getVal(row, 'solusi_penanganan', 'Solusi/Penanganan', 'Solusi', 'Penanganan', 'Tindakan') || '-';
              const rawTglSelesaiTDL = getVal(row, 'tgl_selesai_tdl', 'Tgl Selesai TDL', 'Tanggal Selesai TDL', 'Tgl Selesai', 'Selesai TDL');

              // Format Output ke Waktu Lokal (WIB)
              const tglKejadian = formatDate(rawTglKejadian);
              const waktuKejadian = formatTime(rawWaktu, rawTglKejadian);
              const tglMulaiTDL = rawTglMulaiTDL ? formatDate(rawTglMulaiTDL) : tglKejadian;
              const tglSelesaiTDL = rawTglSelesaiTDL ? formatDate(rawTglSelesaiTDL) : tglKejadian;

              return (
                <tr key={index} className="hover:bg-slate-50 transition-colors divide-x divide-slate-100">
                  <td className="p-2 text-center font-mono font-bold text-slate-500">{index + 1}.</td>
                  <td className="p-2 text-center font-medium whitespace-nowrap">{tglKejadian}</td>
                  <td className="p-2 text-center font-mono font-bold text-slate-600">{waktuKejadian}</td>
                  <td className="p-2 font-medium leading-relaxed">{temuan}</td>
                  <td className="p-2 text-center font-medium text-slate-600">{detailTemuan}</td>
                  <td className="p-2 text-center font-medium whitespace-nowrap">{tglMulaiTDL}</td>
                  <td className="p-2 font-medium leading-relaxed">{solusi}</td>
                  <td className="p-2 text-center font-medium whitespace-nowrap">{tglSelesaiTDL}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" className="p-4 text-center text-slate-400 font-bold">
                Tidak ada data log yang tersedia.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}