import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Define simple schema to read products
        const productSchema = new mongoose.Schema({}, { strict: false });
        const Product = mongoose.model('Product', productSchema, 'products');

        const products = await Product.find({});
        console.log(`Total Products: ${products.length}`);

        // Count categories
        const categoryCounts = {};
        products.forEach(p => {
            const cat = p.category;
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        console.log('--- Categories in DB ---');
        console.table(categoryCounts);
        console.log('------------------------');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
