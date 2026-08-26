const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 📌 MAPPING URL APPS SCRIPT (KRDE BIAS & KRDE MAKPAR)
const APPS_SCRIPT_URLS = {
    'BIAS': 'https://script.google.com/macros/s/AKfycbxado9djZnL2RDF_gSa4PdK3Am3MDqxCyuwA3vU5H2ypDhnOLJIzMEV7VM1lriSCVihtQ/exec',
    'MAKPAR': 'https://script.google.com/macros/s/AKfycbxiaLkhugrXPNd8u16d1pJdj59dhHZdB0OChkizrpu4peaC9YTCoK_wqyPNLU2AhCgUeA/exec'
};

// Helper menentukan URL Apps Script berdasarkan target sheet / modul
const getScriptUrl = (targetSheet) => {
    const sheetUpper = (targetSheet || '').toUpperCase();
    if (sheetUpper.includes('MAKPAR')) {
        return APPS_SCRIPT_URLS['MAKPAR'];
    }
    return APPS_SCRIPT_URLS['BIAS']; // Default ke BIAS
};

const cleanStr = (val) => (val !== undefined && val !== null ? String(val).trim() : '');

// Helper ekstraksi data dari berbagai format respon Apps Script
const extractRows = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.value)) return data.value;
    if (Array.isArray(data.result)) return data.result;
    if (data.status === "success" && Array.isArray(data.data)) return data.data;
    return [];
};

app.get('/', (req, res) => {
    res.send('🚀 Backend Multi-Dashboard PT INKA (KRDE BIAS & MAKPAR) Aktif!');
});

// 1. ENDPOINT DATA UTAMA
app.get('/api/sheets-data', async (req, res) => {
    const rawTarget = req.query.targetSheet || req.query.sheet || 'VRB';
    const targetUrl = getScriptUrl(rawTarget);
    
    try {
        const response = await axios.get(targetUrl, { 
            params: {
                sheet: rawTarget,
                targetSheet: rawTarget,
                action: 'getData'
            },
            maxRedirects: 10,
            timeout: 20000, // Timeout dinaikkan ke 20d agar aman saat Cold Start Apps Script
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json'
            }
        });

        console.log(`[SUCCESS] Fetching Data Target: ${rawTarget}`);
        
        const rawRows = extractRows(response.data);

        return res.status(200).json({
            success: true,
            nama_tab: rawTarget,
            total: rawRows.length,
            data: rawRows
        });
    } catch (error) {
        console.error(`[ERROR] (${rawTarget}):`, error.message);
        return res.status(200).json({ 
            success: false, 
            message: "Gagal mengambil data dari Apps Script", 
            error: error.message,
            data: [] 
        });
    }
});

// 2. ENDPOINT DROPDOWN FILTERS
app.get('/api/filters', async (req, res) => {
    const rawTarget = req.query.targetSheet || req.query.sheet || 'VRB';
    const targetUrl = getScriptUrl(rawTarget);

    try {
        const response = await axios.get(targetUrl, { 
            params: {
                sheet: rawTarget,
                targetSheet: rawTarget,
                action: 'getData'
            },
            maxRedirects: 10,
            timeout: 20000,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json'
            }
        });
        
        const rawRows = extractRows(response.data);

        const sets = {
            trainset: new Set(),
            noKereta: new Set(),
            status: new Set()
        };

        rawRows.forEach((item) => {
            if (Array.isArray(item)) {
                if (item[1]) sets.trainset.add(cleanStr(item[1]));
                if (item[2]) sets.noKereta.add(cleanStr(item[2]));
                if (item[9] || item[7]) sets.status.add(cleanStr(item[9] || item[7]));
            } else if (typeof item === 'object' && item !== null) {
                const ts = cleanStr(item["TS"] || item["Trainset"] || item["TRAINSET"] || item["TS/TRAINSET"]);
                const nk = cleanStr(item["NO KERETA"] || item["No Kereta"] || item["KERETA"]);
                const st = cleanStr(item["STATUS TL"] || item["Status TL"] || item["STATUS"] || item["Status"]);

                if (ts && ts !== '-') sets.trainset.add(ts);
                if (nk && nk !== '-') sets.noKereta.add(nk);
                if (st && st !== '-') sets.status.add(st);
            }
        });

        const resultObj = {};
        Object.keys(sets).forEach(k => {
            resultObj[k] = Array.from(sets[k]).sort();
        });

        return res.status(200).json({ success: true, data: resultObj });
    } catch (error) {
        console.error("[ERROR Filter]:", error.message);
        return res.status(200).json({ success: false, data: { trainset: [], noKereta: [], status: [] } });
    }
});

app.listen(PORT, () => console.log(`🚀 Server Aktif di Port ${PORT}`));

module.exports = app;