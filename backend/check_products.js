
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Define simple schema to read products
        const productSchema = new mongoose.Schema({}, { strict: false });
        const Product = mongoose.model('Product', productSchema, 'products'); // explicitly use 'products' collection

        const products = await Product.find({}).limit(5);
        console.log('--- Current Products in DB (First 5) ---');
        products.forEach(p => {
            console.log(`ID: ${p._id}, Name: ${p.name}, Price: ${p.price}`);
        });
        console.log('----------------------------------------');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
