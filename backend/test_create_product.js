import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.js';

dotenv.config();

const testCreateProduct = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const productData = {
            name: "milk_test_repro",
            price: "120",        // String from FormData
            category: "Dairy",
            countInStock: "100", // String, and mismatched field name (Schema has 'stock')
            description: "fresh cow milk",
            subCategory: "",     // Empty string
            // image is missing
        };

        console.log("Attempting to create product with data:", productData);

        const product = await Product.create(productData);
        console.log("Product created successfully:", product);

        // Cleanup
        await Product.findByIdAndDelete(product._id);
        console.log("Test product deleted.");

    } catch (error) {
        console.error("FATAL ERROR CREATING PRODUCT:", error);
    } finally {
        await mongoose.disconnect();
    }
};

testCreateProduct();
