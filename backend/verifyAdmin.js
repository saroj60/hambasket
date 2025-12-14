import mongoose from 'mongoose';
import User from './models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const verifyAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hambasket');
        console.log("Connected to MongoDB");

        const email = 'sarojbhagat666@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
        } else {
            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();
            console.log(`Successfully verified user: ${email}`);
        }
    } catch (error) {
        console.error("Error verifying user:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected");
    }
};

verifyAdmin();
