
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/category.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

import fs from 'fs';

const checkCategories = async () => {
    await connectDB();
    try {
        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories.`);
        fs.writeFileSync('categories.json', JSON.stringify(categories, null, 2));
        console.log("Categories saved to categories.json");
    } catch (error) {
        console.error("Error fetching categories:", error);
    } finally {
        mongoose.disconnect();
    }
};

checkCategories();
