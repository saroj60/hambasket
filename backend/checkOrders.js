import mongoose from 'mongoose';
import Order from './models/order.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const count = await Order.countDocuments();
        console.log(`Total Orders in DB: ${count}`);

        const orders = await Order.find().limit(5);
        const output = `Total Orders: ${count}\n\nRecent Orders:\n${JSON.stringify(orders, null, 2)}`;
        console.log(output);
        fs.writeFileSync('orders_result.txt', output);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkOrders();
