import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.js";

dotenv.config();

const seedProducts = [
    "Fresh Bananas", "Red Apples", "Avocado", "Whole Milk", "Cheddar Cheese",
    "Sourdough Bread", "Croissant", "Orange Juice", "Potato Chips", "Chocolate Bar",
    "Ice Cream", "Pizza",
    "Laptop", "Smartphone", "Headphones", "Camera", "Tablet"
];

const removeSeedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");

        const result = await Product.deleteMany({ name: { $in: seedProducts } });
        console.log(`✅ Removed ${result.deletedCount} seed products.`);

    } catch (error) {
        console.error("❌ Error removing seed data:", error);
    } finally {
        mongoose.disconnect();
    }
};

removeSeedData();
