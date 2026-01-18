import mongoose from 'mongoose';

// The URI you set in Render
const uri = "mongodb+srv://saroj666:ssaarroojj@saroj.zxk80.mongodb.net/?appName=saroj";

console.log("---------------------------------------------------");
console.log("Testing connection to:", uri);
console.log("---------------------------------------------------");

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("✅ SUCCESS! Connected to MongoDB Atlas.");
        console.log("This means your Username/Password are CORRECT.");
        console.log("And your IP is allowed.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ CONNECTION FAILED:");
        console.error(err.message);
        console.log("---------------------------------------------------");
        if (err.message.includes('bad auth')) {
            console.log("👉 Cause: WRONG PASSWORD or USERNAME.");
        } else if (err.message.includes('querySrv')) {
            console.log("👉 Cause: NETWORK ERROR (DNS/Firewall).");
        } else {
            console.log("👉 Cause: IP BLOCKED or Other.");
        }
        process.exit(1);
    });
