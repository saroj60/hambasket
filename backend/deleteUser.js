import mongoose from 'mongoose';
import User from './models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const deleteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'sarojbhagat667@gmail.com';
        const result = await User.deleteOne({ email });

        if (result.deletedCount > 0) {
            console.log(`Successfully deleted user: ${email}`);
        } else {
            console.log(`User ${email} not found.`);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

deleteUser();
