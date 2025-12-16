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
                items: [
                    { name: createdProducts[0].name, quantity: 2, price: createdProducts[0].price, product: createdProducts[0]._id },
                    { name: createdProducts[2].name, quantity: 1, price: createdProducts[2].price, product: createdProducts[2]._id }
                ],
                shippingAddress: "123 Main St, Kathmandu, Nepal",
                paymentMethod: "Cash on Delivery",
                paymentDetails: { isPaid: false },
                subtotal: 420,
                tax: 0,
                deliveryFee: 50,
                totalAmount: 470,
                status: "Pending",
                createdAt: new Date() // Today
            },
            {
                user: admin._id,
                items: [
                    { name: createdProducts[4].name, quantity: 1, price: createdProducts[4].price, product: createdProducts[4]._id }
                ],
                shippingAddress: "456 Side St, Pokhara, Nepal",
                paymentMethod: "Khalti",
                paymentDetails: { transactionId: "TXN_123", isPaid: true, paidAt: new Date(Date.now() - 86400000) },
                subtotal: 1500,
                tax: 100,
                deliveryFee: 0,
                totalAmount: 1600,
                status: "Processing",
                createdAt: new Date(Date.now() - 86400000) // Yesterday
            },
            {
                user: admin._id,
                items: [
                    { name: createdProducts[1].name, quantity: 5, price: createdProducts[1].price, product: createdProducts[1]._id }
                ],
                shippingAddress: "789 Hill Rd, Lalitpur, Nepal",
                paymentMethod: "Esewa",
                paymentDetails: { transactionId: "TXN_456", isPaid: true, paidAt: new Date(Date.now() - 172800000) },
                subtotal: 1500,
                tax: 0,
                deliveryFee: 20,
                totalAmount: 1520,
                status: "Delivered",
                createdAt: new Date(Date.now() - 172800000) // 2 days ago
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
