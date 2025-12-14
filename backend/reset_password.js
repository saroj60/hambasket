import mongoose from 'mongoose';
import User from './models/user.js';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb://127.0.0.1:27017/quick-commerce';

const resetPass = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const email = "sarojbhagat666@gmail.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found!");
            process.exit(1);
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash("password", salt);
        // Clean up potential validation blockers
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();
        console.log("✅ Password reset to 'password'");
    } catch (error) {
        console.error("❌ Reset Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

resetPass();
