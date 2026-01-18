
import mongoose from 'mongoose';
import User from './models/user.js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config();

const checkAdmins = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing in .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const admins = await User.find({ role: 'admin' });

        if (admins.length === 0) {
            console.log("No admin users found!");
        } else {
            console.log(`Found ${admins.length} admin user(s):`);
            admins.forEach(admin => {
                console.log(`- ${admin.email} (Verified: ${admin.isVerified})`);
            });
        }

    } catch (error) {
        console.error("Error checking admins:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkAdmins();
