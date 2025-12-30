
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const products = await mongoose.connection.db.collection('products').find({}).limit(5).toArray();
        console.log('--- Current Products in DB (First 5) ---');
        products.forEach(p => {
            console.log(`Name: ${p.name}, Price: ${p.price}`);
        });
        console.log('----------------------------------------');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
