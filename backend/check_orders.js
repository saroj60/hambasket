
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/OrderModel.js'; // Assuming Order model exists, need to verify filename
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const checkOrders = async () => {
    try {
        const uri = 'mongodb://127.0.0.1:27017/quick-commerce';
        console.log(`Connecting to DB: ${uri}`);
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const orders = await Order.find({});
        console.log(`Found ${orders.length} orders.`);
        if (orders.length > 0) {
            console.log('Sample Order:', JSON.stringify(orders[0], null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

checkOrders();
