import fetch from 'node-fetch';

const API_URL = "https://hambasket-rho.vercel.app/api"; // Guessing the prod URL based on "hambasket-git-main" or similar. 
// Actually, let's use the one from the logs: hambasket-2ew85g9oz-saroj60s-projects.vercel.app
// Or simpler: ask the user's local setup which URL it's hitting? No, that's in frontend config.
// I'll try the known working backend URL from the logs.

const BACKEND_URL = "https://hambasket-rho.vercel.app/api";
// Note: "hambasket-rho.vercel.app" is a common alias if "hambasket" is the project name. 
// But the logs showed: hambasket-2ew85g9oz-saroj60s-projects.vercel.app as the working one.
// Let's use that one.

const TARGET_URL = "https://hambasket-git-main-saroj60s-projects.vercel.app/api";

async function checkProducts() {
    try {
        console.log(`Fetching products from ${TARGET_URL}/products...`);
        const res = await fetch(`${TARGET_URL}/products`);
        if (!res.ok) {
            console.error("Failed to fetch:", res.status, res.statusText);
            const text = await res.text();
            console.error("Response:", text);
            return;
        }

        const products = await res.json();
        console.log(`Found ${products.length} products.`);

        products.forEach(p => {
            console.log(`- Name: ${p.name}`);
            console.log(`  Image: ${p.image}`);
            console.log(`  ID: ${p._id}`);
            console.log("---");
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkProducts();
