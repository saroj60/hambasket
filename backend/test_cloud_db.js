import mongoose from 'mongoose';

const uri = "mongodb+srv://saroj666:SSaarroojj%4011@saroj.zxk80.mongodb.net/?appName=saroj";

console.log("Testing connection to MongoDB Atlas...");

mongoose.connect(uri)
    .then(() => {
        console.log("✅ Successfully connected to MongoDB Atlas!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Connection failed:", err.message);
        process.exit(1);
    });
