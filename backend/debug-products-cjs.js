const https = require('https');

const TARGET_URL = "https://hambasket-git-main-saroj60s-projects.vercel.app/api/products";

console.log(`Fetching products from ${TARGET_URL}...`);

https.get(TARGET_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            if (res.statusCode !== 200) {
                console.error(`Failed: ${res.statusCode} ${res.statusMessage}`);
                console.error(data);
                return;
            }
            const products = JSON.parse(data);
            console.log(`Found ${products.length} products.`);
            products.forEach(p => {
                console.log(`- Name: ${p.name}`);
                console.log(`  Image: ${p.image}`);
                console.log(`  ID: ${p._id}`);
                console.log("---");
            });
        } catch (e) {
            console.error("Error parsing JSON:", e.message);
            console.log("Raw Data:", data.substring(0, 500));
        }
    });

}).on("error", (err) => {
    console.error("Error: " + err.message);
});
