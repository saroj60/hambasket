import mongoose from "mongoose";
import User from "./models/user.js";
import bcrypt from "bcryptjs";

// Force local connection check
const uri = 'mongodb://127.0.0.1:27017/quick-commerce';

const checkAdmin = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Connected to Local DB");

        const email = "admin@gmail.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ Admin user NOT FOUND in local DB");
        } else {
            console.log("✅ Admin user FOUND:", user.email);
            console.log("Role:", user.role);

            const isMatch = await bcrypt.compare("admin123", user.password);
            console.log("Password 'admin123' match:", isMatch ? "YES ✅" : "NO ❌");

            if (!isMatch) {
                console.log("Resetting password to 'admin123'...");
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash("admin123", salt);
                await user.save();
                console.log("✅ Password reset successful.");
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.disconnect();
    }
};

checkAdmin();
