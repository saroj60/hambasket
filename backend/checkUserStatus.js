import mongoose from 'mongoose';
import User from './models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUserStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'sarojbhagat667@gmail.com';
        const phone = '9815769008';

        const allUsers = await User.find({}, 'email phone');
        console.log("ALL USERS IN DB:");
        allUsers.forEach(u => console.log(`- ${u.email} / ${u.phone}`));

        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
            console.log(`[EXISTING] User found by EMAIL: ${userByEmail.email}`);
            console.log(`           ID: ${userByEmail._id}`);
        } else {
            console.log(`[AVAILABLE] Email ${email} is NOT in the database.`);
        }

        const userByPhone = await User.findOne({ phone });
        if (userByPhone) {
            console.log(`[EXISTING] User found by PHONE: ${userByPhone.phone}`);
            console.log(`           Email associated: ${userByPhone.email}`);
        } else {
            console.log(`[AVAILABLE] Phone ${phone} is NOT in the database.`);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUserStatus();
