const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrdsHVGkRiZGXuOtxSCwlK3BgRurY-hk_5AaoEtDWcy05R9pVoFHexR518bOiD7B9R1Q/exec';

const cleanStr = (val) => (val !== undefined && val !== null ? String(val).trim() : '');

// Root Endpoint untuk Cek Kesehatan Server
app.get('/', (req, res) => {
    res.send('🚀 Backend Multi-Dashboard PT INKA jalan dengan lancar di Vercel!');
});

// 1. ENDPOINT DATA UTAMA
app.get('/api/sheets-data', async (req, res) => {
    const targetSheet = req.query.targetSheet ? req.query.targetSheet.toUpperCase() : 'FRACAS';
    
    try {
        const response = await axios.get(`${GOOGLE_SCRIPT_URL}?targetSheet=${targetSheet}`, { 
            maxRedirects: 5,
            headers: { 'Accept': 'application/json' }
        });
        
        const rawRows = response.data && response.data.success ? response.data.data : [];

        res.status(200).json({
            success: true,
            nama_tab: targetSheet,
            total: rawRows.length,
            data: rawRows
        });
    } catch (error) {
        console.error(`Error pada Endpoint Data (${targetSheet}):`, error.message);
        res.status(500).json({ success: false, data: [] });
    }
});

// 2. ENDPOINT DROPDOWN FILTERS UNTUK SEMUA TAB
app.get('/api/filters', async (req, res) => {
    const targetSheet = req.query.targetSheet ? req.query.targetSheet.toUpperCase() : 'DCR';

    try {
        const response = await axios.get(`${GOOGLE_SCRIPT_URL}?targetSheet=${targetSheet}`, { 
            maxRedirects: 5,
            headers: { 'Accept': 'application/json' }
        });
        
        const rawRows = response.data && response.data.success ? response.data.data : [];

        // Penampung nilai unik tiap tab
        const sets = {};

        if (targetSheet === 'DCR') {
            sets.namaProyek = new Set();
            sets.pengirim = new Set();
            sets.penerima = new Set();
            sets.statusDcr = new Set();

            rawRows.forEach(item => {
                const pr = cleanStr(item["Nama Proyek"] || item["Proyek"]);
                const pg = cleanStr(item["Pengirim"]);
                const pn = cleanStr(item["Penerima"]);
                const st = cleanStr(item["Status DCR"] || item["Status"]);
                if (pr) sets.namaProyek.add(pr);
                if (pg) sets.pengirim.add(pg);
                if (pn) sets.penerima.add(pn);
                if (st) sets.statusDcr.add(st);
            });
        } else if (targetSheet === 'NCR') {
            sets.projek = new Set();
            sets.unitTujuan = new Set();
            sets.groupInspektor = new Set();
            sets.status = new Set();

            rawRows.forEach(item => {
                const pr = cleanStr(item["Nama Proyek"] || item["Projek"] || item["Proyek"]);
                const ut = cleanStr(item["Unit Tujuan"] || item["Seksi/Unit"]);
                const gi = cleanStr(item["Group Inspektor"] || item["Inspektor QC"]);
                const st = cleanStr(item["Status NCR"] || item["Status"]);
                if (pr) sets.projek.add(pr);
                if (ut) sets.unitTujuan.add(ut);
                if (gi) sets.groupInspektor.add(gi);
                if (st) sets.status.add(st);
            });
        } else if (targetSheet === 'VRB') {
            sets.ts = new Set();
            sets.noKa = new Set();
            sets.part = new Set();
            sets.brand = new Set();

            rawRows.forEach(item => {
                const getVal = (...keys) => {
                    for (let k of keys) {
                        if (item[k] !== undefined && item[k] !== null && item[k] !== '') return item[k];
                    }
                    return '';
                };

                const t = String(getVal('TS', 'Train Set', 'Trainset', 'ts')).trim();
                const nk = String(getVal('No. KA', 'No KA', 'no_ka')).trim();
                const pt = String(getVal('Part', 'part')).trim();
                const br = String(getVal('Brand', 'brand')).trim();

                if (t) sets.ts.add(t);
                if (nk) sets.noKa.add(nk);
                if (pt) sets.part.add(pt);
                if (br) sets.brand.add(br);
            });
        }

        const resultObj = {};
        Object.keys(sets).forEach(k => {
            resultObj[k] = Array.from(sets[k]).sort();
        });

        res.status(200).json({ success: true, data: resultObj });
    } catch (error) {
        console.error("Error Filter:", error.message);
        res.status(500).json({ success: false, data: {} });
    }
});

// Khusus Local Machine (Laptop)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server Multi-Dashboard PT INKA Aktif di Port ${PORT}`));
}

// WAJIB UNTUK VERCEL DEPLOYMENT
module.exports = app;