import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/user.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// Use the Production MongoDB URI from .env
const uri = process.env.MONGO_URI;

console.log("Connecting to Production DB...");

const createAdmin = async () => {
    try {
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB Atlas");

        const email = "admin@gmail.com";
        const password = "admin123";

        // Check if admin exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log("⚠️ Admin user already exists. Updating password...");
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash(password, salt);
            existingAdmin.role = "admin";
            existingAdmin.isVerified = true;
            await existingAdmin.save();
            console.log("✅ Admin password updated to: " + password);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                name: "Admin User",
                email: email,
                password: hashedPassword,
                role: "admin",
                isVerified: true
            });
            console.log("✅ Admin user created successfully!");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        mongoose.disconnect();
    }
};

createAdmin();
