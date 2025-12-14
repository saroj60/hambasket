import mongoose from 'mongoose';
import Product from './models/product.js';
import dotenv from 'dotenv';

dotenv.config();

const countProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Product.countDocuments();
        console.log(`Product Count: ${count}`);
    } catch (error) {
        console.error("Error connecting to DB:", error);
    } finally {
        await mongoose.disconnect();
    }
};

countProducts();
