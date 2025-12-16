const fs = require('fs');
try {
    let raw;
    // Try reading as UTF-16LE first (PowerShell/CMD redirection default)
    try {
        raw = fs.readFileSync('temp_products.json', 'utf16le');
        // Check if it looks like JSON
        if (!raw.trim().startsWith('[')) {
            throw new Error('Not UTF16');
        }
    } catch (e) {
        // Fallback to UTF8
        raw = fs.readFileSync('temp_products.json', 'utf8');
    }

    const products = JSON.parse(raw);
    const mongo = products.find(p => p.name.toLowerCase().includes('mango'));

    if (mongo) {
        console.log("FOUND MANGO:");
        console.log(JSON.stringify(mongo, null, 2));
    } else {
        console.log("Mango not found in data.");
    }

} catch (e) { console.log("Error:", e.message); }
