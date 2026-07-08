import React from 'react';

export default function FailureTable({ data }) {
  
  // Fungsi Helper Ganda: Menghilangkan sisa-sisa whitespace atau string 'null' yang tidak valid
  const bersihkanTeks = (str) => {
    if (!str || str === '-' || str === 'null' || str === 'undefined') return '-';
    return str.toString().trim();
  };

  // 1. Fungsi Helper: Memformat Tanggal atau menjaga teks Nomor Tiket/Dokumen PT INKA
  const formatTanggalRapih = (dateString) => {
    const teksBersih = bersihkanTeks(dateString);
    if (teksBersih === '-') return '-';
    
    // Jika string berisi format nomor registrasi dokumen (contoh: KA/MID/193/2025)
    if (teksBersih.includes('/') && teksBersih.split('/').length > 2) {
      return teksBersih; 
    }
    
    try {
      const date = new Date(teksBersih);
      if (isNaN(date.getTime())) return teksBersih; 

      const opsi = { day: 'numeric', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('id-ID', opsi); 
    } catch (e) {
      return teksBersih;
    }
  };

  // 2. Fungsi Helper: Memastikan format waktu tampil bersih (HH:MM)
  const formatWaktuRapih = (timeString) => {
    const teksBersih = bersihkanTeks(timeString);
    if (teksBersih === '-') return '-';
    
    if (teksBersih.includes('GMT') || teksBersih.length > 15) {
      try {
        const date = new Date(teksBersih);
        if (!isNaN(date.getTime())) {
          const jam = String(date.getHours()).padStart(2, '0');
          const menit = String(date.getMinutes()).padStart(2, '0');
          return `${jam}:${menit}`;
        }
      } catch (e) {}
    }
    return teksBersih;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-[290px] w-full overflow-hidden text-slate-800">
      
      {/* ================= HEADER TABEL UTAMA ================= */}
      <div className="bg-[#e15243] text-white text-[10px] font-bold uppercase tracking-wider p-2.5 grid grid-cols-12 gap-3 items-center flex-shrink-0 select-none">
        <div className="col-span-1 text-center">No</div>
        <div className="col-span-2 text-center">Tgl Kejadian</div>
        <div className="col-span-1 text-center">Waktu</div>
        <div className="col-span-3 text-left">Temuan</div>
        <div className="col-span-2 text-left">Detail Temuan</div>
        <div className="col-span-1 text-center">Tgl Mulai</div>
        <div className="col-span-2 text-left">Solusi / Penanganan Selesai</div>
      </div>

      {/* ================= BODY ISI DATA TABEL ================= */}
      <div className="overflow-y-auto flex-1 divide-y divide-slate-100 bg-white text-[11px]">
        {!data || data.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-semibold flex flex-col items-center justify-center h-full gap-2">
            <span>Tidak ada record data temuan yang cocok.</span>
          </div>
        ) : (
          data.map((item, index) => {
            const statusUpper = item.status ? item.status.toString().toUpperCase() : 'OPEN';
            
            return (
              <div 
                key={index} 
                className="grid grid-cols-12 gap-3 p-2.5 items-start hover:bg-slate-50 transition-colors font-medium border-b border-slate-100 last:border-b-0"
              >
                {/* 1. Nomor Urut */}
                <div className="col-span-1 text-center text-slate-400 font-mono font-bold pt-0.5">
                  {index + 1}.
                </div>

                {/* 2. Tanggal Kejadian / Nomor Registrasi Dokumen */}
                <div className="col-span-2 text-center text-slate-600 font-semibold pt-0.5 break-words font-mono tracking-tight">
                  {formatTanggalRapih(item.tglKejadian || item.tgl_kejadian)}
                </div>

                {/* 3. Waktu */}
                <div className="col-span-1 text-center text-slate-500 font-mono pt-0.5">
                  {formatWaktuRapih(item.waktuKejadian || item.waktu)}
                </div>

                {/* 4. Deskripsi Temuan */}
                <div className="col-span-3 text-left text-slate-800 font-bold whitespace-pre-line leading-relaxed break-words">
                  {bersihkanTeks(item.temuan)}
                </div>

                {/* 5. Detail Temuan */}
                <div className="col-span-2 text-left text-slate-500 pt-0.5 break-words leading-relaxed">
                  {bersihkanTeks(item.detailTemuan || item.detail || item.klasifikasi || 'Operasional')}
                </div>

                {/* 6. Tanggal Mulai TDL */}
                <div className="col-span-1 text-center text-slate-500 pt-0.5 break-words font-mono">
                  {formatTanggalRapih(item.tglMulaiTdl || item.tglMulai)}
                </div>

                {/* 7. Solusi / Penanganan Selesai + Status Badge */}
                <div className="col-span-2 text-left flex flex-col gap-1.5 min-w-0">
                  <span className="text-slate-600 font-semibold whitespace-pre-line leading-relaxed break-words">
                    {bersihkanTeks(item.solusi || item.penanganan)}
                  </span>
                  
                  {/* Badge Indikator Status */}
                  <div className="flex items-center mt-0.5">
                    {statusUpper === 'CLOSE' ? (
                      <span className="inline-block bg-green-50 text-green-600 border border-green-200 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded font-mono select-none shadow-sm">
                        CLOSE
                      </span>
                    ) : (
                      <span className="inline-block bg-red-50 text-red-600 border border-red-200 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded font-mono select-none shadow-sm">
                        OPEN
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}