import mongoose from 'mongoose';
import User from './models/user.js';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb://127.0.0.1:27017/quick-commerce';

const testLogin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const phone = "sarojbhagat666@gmail.com";
        const password = "password";

        let user;
        if (phone.includes('@')) {
            console.log("Searching by email (from phone field):", phone);
            user = await User.findOne({ email: phone });
        } else {
            console.log("Searching by phone:", phone);
            user = await User.findOne({ phone });
        }

        if (!user) {
            console.log("User not found");
            process.exit(0);
        }

        console.log("User found:", user._id);
        console.log("User password hash:", user.password);

        if (!user.password) {
            console.log("User has no password");
            process.exit(0);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);

        if (isMatch) {
            console.log("Attempting to save user...");
            user.lastLogin = Date.now();
            await user.save();
            console.log("User saved successfully!");
        }

    } catch (error) {
        console.error("CRASHED:", error);
    } finally {
        await mongoose.disconnect();
    }
};

testLogin();
