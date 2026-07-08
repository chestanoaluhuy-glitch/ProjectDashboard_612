const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware agar frontend React (Port 5173) bisa mengakses API ini tanpa diblokir browser
app.use(cors());
app.use(express.json());

// URL Google Apps Script Web App yang sudah terhubung dengan kolom spreadsheet PT INKA asli
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxXwJga2wF5LPFw8N4evX_KilbRCIT1drSnYvQMd-0xPCTySpcnMxGHWZsRA-V_qms5IQ/exec?sheet=fracas';

// 1. ENDPOINT UNTUK MENAMPILKAN OPSI DROPDOWN FILTER
app.get('/api/filters', async (req, res) => {
    try {
        // Ditambahkan maxRedirects agar axios aman mengikuti pengalihan URL dari Google Script
        const response = await axios.get(GOOGLE_SHEET_URL, { maxRedirects: 5 });
        
        // Validasi: Pastikan objek filters ada, jika tidak ada kirim objek kosong agar React tidak crash
        const filterData = response.data && response.data.filters ? response.data.filters : {};

        res.status(200).json({
            success: true,
            data: filterData
        });
    } catch (error) {
        console.error("Error pada Endpoint Filter:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Gagal mengambil data filter", 
            error: error.message,
            data: {} // Kirim objek kosong sebagai pengaman frontend
        });
    }
});

// 2. ENDPOINT UNTUK MENAMPILKAN SELURUH RAW DATA BARIS TABEL & GRAFIK
app.get('/api/fracas-data', async (req, res) => {
    try {
        const response = await axios.get(GOOGLE_SHEET_URL, { maxRedirects: 5 });
        
        // Validasi: Pastikan objek rows berbentuk array, jika tidak ada kirim array kosong []
        const rowsData = response.data && response.data.rows ? response.data.rows : [];

        res.status(200).json({
            success: true,
            data: rowsData
        });
    } catch (error) {
        console.error("Error pada Endpoint Data Utama:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Gagal mengambil data utama FRACAS", 
            error: error.message,
            data: [] // Kirim array kosong sebagai pengaman frontend agar tabel tidak blank
        });
    }
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Server Backend FRACAS Aktif Sempurna!`);
    console.log(`🔗 Akses API Data   : http://localhost:${PORT}/api/fracas-data`);
    console.log(`🔗 Akses API Filter : http://localhost:${PORT}/api/filters`);
    console.log(`==================================================`);
});