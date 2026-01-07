
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const checkUser = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.log("No MONGO_URI found in .env");
            return;
        }
        // Mask password for logging
        const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
        console.log(`Connecting to DB: ${maskedUri}`);
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const email = 'bhagatgrouppv@gmail.com';
        const user = await User.findOne({ email: email });

        if (user) {
            console.log('User FOUND:', user);
            console.log('ID:', user._id);
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Created At:', user.createdAt);
        } else {
            console.log('User NOT FOUND');
        }

        // Also check case-insensitive
        const regexUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (regexUser) {
            console.log('User FOUND (Case Insensitive Match):', regexUser.email);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

checkUser();
