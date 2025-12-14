import mongoose from 'mongoose';
import User from './models/user.js';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb://127.0.0.1:27017/quick-commerce';

const fixUser = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const email = "sarojbhagat666@gmail.com";
        const phone = "9800000000"; // Fallback phone
        let user = await User.findOne({ email });

        if (user) {
            console.log("User found. Resetting password...");
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash("password", salt);
            user.isVerified = true;
            await user.save();
            console.log("✅ Password updated to: password");
        } else {
            console.log("User NOT found. Creating new user...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("password", salt);
            user = await User.create({
                name: "Saroj Bhagat",
                email: email,
                phone: phone,
                password: hashedPassword,
                role: "customer",
                isVerified: true
            });
            console.log("✅ User created with password: password");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

fixUser();
