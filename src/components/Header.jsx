import React from 'react';

export default function Header() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between border-b-2 border-red-500 pb-4 mb-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
      
      {/* BAGIAN KIRI: Tempat Logo PNG (Diberi lebar fix md:w-48 agar judul tengah bisa simetris) */}
      <div className="flex items-center gap-3 mb-4 md:mb-0 md:w-48 justify-center md:justify-start flex-shrink-0">
        {/* Gambar Logo INKA */}
        <img 
          src="/src/assets/logo-inka.png"
          alt="Logo INKA" 
          className="h-8 w-auto object-contain" 
          onError={(e) => {
            // Sembunyikan icon gambar rusak bawaan browser jika file belum ada
            e.target.style.display = 'none';
          }}
        />
        
        {/* Garis Pembatas Vertikal */}
        <div className="h-8 w-[1.5px] bg-slate-300 hidden md:block"></div>
        
        {/* Gambar Logo Danantara */}
        <img 
          src="/src/assets/logo-danantara.png" 
          alt="Logo Danantara" 
          className="h-20 w-auto object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* BAGIAN TENGAH: Judul Dashboard FRACAS */}
      <div className="text-center flex-1">
        <h1 className="text-3xl font-black text-red-600 tracking-wider m-0 p-0 leading-none">
          FRACAS
        </h1>
        <p className="text-[10px] font-bold text-slate-600 tracking-wide uppercase mt-1">
          Failure Reporting, Analysis, and Corrective Action System
        </p>
        <div className="mt-1.5 flex justify-center">
          <span className="bg-red-600 text-white text-[9px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-widest font-mono">
            KERETA API
          </span>
        </div>
      </div>
      
      {/* BAGIAN KANAN: Penyeimbang Flexbox Layout agar teks tengah tidak miring */}
      <div className="w-0 md:w-48 hidden md:block flex-shrink-0"></div>
    </div>
  );
}