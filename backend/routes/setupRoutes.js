import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';

const router = express.Router();

// Imports for seeding
import Product from '../models/product.js';
import Order from '../models/Order.js';

router.get('/seed-data', async (req, res) => {
    try {
        console.log("🌱 STARTING SEED...");

        // 1. Find Admin User
        const admin = await User.findOne({ email: "admin@gmail.com" });
        if (!admin) {
            return res.status(404).json({ message: "Admin user not found. Run /seed-admin first." });
        }

        // 2. Seed Products
        console.log("🍎 Seeding Products...");
        await Product.deleteMany({}); // Clear existing products

        const products = [
            { name: "Fresh Bananas", price: 150, image: "/assets/categories/fruits_veg.png", category: "Fruits", description: "Fresh bananas", countInStock: 20 },
            { name: "Red Apples", price: 300, image: "/assets/categories/fruits_veg.png", category: "Fruits", description: "Crisp red apples", countInStock: 15 },
            { name: "Whole Milk", price: 120, image: "/assets/categories/dairy_bread.png", category: "Dairy", description: "Fresh whole milk", countInStock: 30 },
            { name: "Brown Bread", price: 250, image: "/assets/categories/dairy_bread.png", category: "Bakery", description: "Healthy brown bread", countInStock: 10 },
            { name: "Basmati Rice", price: 1500, image: "/assets/categories/staples.png", category: "Staples", description: "Premium Basmati Rice", countInStock: 50 }
        ];

        const createdProducts = await Product.insertMany(products);
        console.log(`✅ ${createdProducts.length} Products created`);

        // 3. Seed Orders
        console.log("📦 Seeding Orders...");
        await Order.deleteMany({}); // Clear existing orders

        const orders = [
            {
                user: admin._id,
                orderItems: [
                    { name: createdProducts[0].name, qty: 2, image: createdProducts[0].image, price: createdProducts[0].price, product: createdProducts[0]._id },
                    { name: createdProducts[2].name, qty: 1, image: createdProducts[2].image, price: createdProducts[2].price, product: createdProducts[2]._id }
                ],
                shippingAddress: { address: "123 Main St", city: "Kathmandu", postalCode: "44600", country: "Nepal" },
                paymentMethod: "COD",
                paymentResult: { id: "COD_ID", status: "Pending", update_time: String(Date.now()), email_address: admin.email },
                itemsPrice: 420,
                taxPrice: 0,
                shippingPrice: 50,
                totalPrice: 470,
                isPaid: false,
                isDelivered: false,
                createdAt: new Date() // Today
            },
            {
                user: admin._id,
                orderItems: [
                    { name: createdProducts[4].name, qty: 1, image: createdProducts[4].image, price: createdProducts[4].price, product: createdProducts[4]._id }
                ],
                shippingAddress: { address: "456 Side St", city: "Pokhara", postalCode: "33700", country: "Nepal" },
                paymentMethod: "Online",
                paymentResult: { id: "TXN_123", status: "COMPLETED", update_time: String(Date.now()), email_address: admin.email },
                itemsPrice: 1500,
                taxPrice: 100,
                shippingPrice: 0,
                totalPrice: 1600,
                isPaid: true,
                paidAt: new Date(Date.now() - 86400000), // Yesterday
                isDelivered: false,
                createdAt: new Date(Date.now() - 86400000)
            },
            {
                user: admin._id,
                orderItems: [
                    { name: createdProducts[1].name, qty: 5, image: createdProducts[1].image, price: createdProducts[1].price, product: createdProducts[1]._id }
                ],
                shippingAddress: { address: "789 Hill Rd", city: "Lalitpur", postalCode: "44700", country: "Nepal" },
                paymentMethod: "Online",
                paymentResult: { id: "TXN_456", status: "COMPLETED", update_time: String(Date.now()), email_address: admin.email },
                itemsPrice: 1500,
                taxPrice: 0,
                shippingPrice: 20,
                totalPrice: 1520,
                isPaid: true,
                paidAt: new Date(Date.now() - 172800000), // 2 days ago
                isDelivered: true,
                deliveredAt: new Date(Date.now() - 86400000),
                createdAt: new Date(Date.now() - 172800000)
            }
        ];

        await Order.insertMany(orders);
        console.log(`✅ ${orders.length} Orders created`);

        res.json({
            message: "Database Populated Successfully!",
            stats: {
                products: createdProducts.length,
                orders: orders.length,
                user: admin.email
            }
        });

    } catch (error) {
        console.error("❌ Seeding Error:", error);
        res.status(500).json({ message: "Error seeding data", error: error.message });
    }
});

router.get('/seed-admin', async (req, res) => {
    try {
        const email = "admin@gmail.com";
        const password = "password";

        let user = await User.findOne({ email });

        if (user) {
            // Reset password if user exists
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            user.role = "admin";
            await user.save();
            return res.json({ message: "Admin exists. Password reset to 'password'." });
        }

        // Create new admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name: "Super Admin",
            email: email,
            phone: "9800000000",
            password: hashedPassword,
            role: "admin",
            isVerified: true
        });

        res.json({ message: "Admin created successfully: admin@gmail.com / password" });
    } catch (error) {
        res.status(500).json({ message: "Error seeding admin", error: error.message });
    }
});

export default router;
