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

const verifyRemoval = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Product.countDocuments({ name: { $in: seedProducts } });
        console.log(`Remaining seed products: ${count}`);
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

verifyRemoval();
