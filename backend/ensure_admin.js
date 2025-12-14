import mongoose from 'mongoose';
import User from './models/user.js';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb://127.0.0.1:27017/quick-commerce';

const fixAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const email = "admin@gmail.com";
        const phone = "9811111111";
        let user = await User.findOne({ email });

        if (user) {
            console.log("Admin found. Resetting password...");
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash("password", salt);
            user.role = "admin"; // Ensure role is admin
            await user.save();
            console.log("✅ Admin updated: admin@gmail.com / password");
        } else {
            console.log("Admin NOT found. Creating new admin...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("password", salt);
            user = await User.create({
                name: "Super Admin",
                email: email,
                phone: phone,
                password: hashedPassword,
                role: "admin",
                isVerified: true
            });
            console.log("✅ Admin created: admin@gmail.com / password");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

fixAdmin();
