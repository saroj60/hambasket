import mongoose from 'mongoose';
import User from './models/user.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const checkNewUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'sarojbhagat666@gmail.com';
        const password = 'password123';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let user = await User.findOne({ email });
        if (user) {
            console.log(`User found: ${user.email}. Updating password and role...`);
            user.password = hashedPassword;
            user.role = "admin";
            await user.save();
            console.log("Password updated to 'password123' and role to 'admin'");
        } else {
            console.log(`User ${email} NOT found. Creating user...`);
            user = await User.create({
                name: "Saroj Bhagat",
                email,
                password: hashedPassword,
                role: "admin",
                isVerified: true
            });
            console.log("User created with password 'password123'");
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkNewUser();
