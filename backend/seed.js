import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Product from "./models/product.js";
import User from "./models/user.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// Use the same fallback URI as server.js to avoid "bad auth" with stale .env vars
const LOCAL_URI = 'mongodb://127.0.0.1:27017/quick-commerce';
// FORCE local URI because the env var is invalid/broken
const uri = LOCAL_URI;

console.log("Connecting to:", uri);

mongoose.connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const products = [
  { name: "Fresh Bananas", price: 150, emoji: "🍌", category: "Fruits", time: "10 mins", weight: "1 bunch (6pcs)" },
  { name: "Red Apples", price: 300, emoji: "🍎", category: "Fruits", time: "12 mins", weight: "1 kg" },
  { name: "Avocado", price: 450, emoji: "🥑", category: "Fruits", time: "15 mins", weight: "2 pcs" },
  { name: "Whole Milk", price: 120, emoji: "🥛", category: "Dairy", time: "8 mins", weight: "1 L" },
  { name: "Cheddar Cheese", price: 600, emoji: "🧀", category: "Dairy", time: "10 mins", weight: "200g" },
  { name: "Sourdough Bread", price: 250, emoji: "🍞", category: "Bakery", time: "20 mins", weight: "1 loaf" },
  { name: "Croissant", price: 180, emoji: "🥐", category: "Bakery", time: "18 mins", weight: "2 pcs" },
  { name: "Orange Juice", price: 350, emoji: "🧃", category: "Beverages", time: "10 mins", weight: "1 L" },
  { name: "Potato Chips", price: 50, emoji: "🥔", category: "Snacks", time: "5 mins", weight: "150g" },
  { name: "Chocolate Bar", price: 100, emoji: "🍫", category: "Snacks", time: "5 mins", weight: "100g" },
  { name: "Ice Cream", price: 400, emoji: "🍦", category: "Frozen", time: "15 mins", weight: "500ml" },
  { name: "Pizza", price: 850, emoji: "🍕", category: "Frozen", time: "25 mins", weight: "1 box" },
  { name: "Premium Tea", price: 450, emoji: "☕", category: "Tea and coffee", time: "10 mins", weight: "500g" },
  { name: "Instant Coffee", price: 600, emoji: "☕", category: "Tea and coffee", time: "10 mins", weight: "100g" },
  { name: "Mixed Dry Fruits", price: 1200, emoji: "🥜", category: "Masalas & Dry fruits", time: "20 mins", weight: "500g" },
  { name: "Garam Masala", price: 200, emoji: "🌶️", category: "Masalas & Dry fruits", time: "10 mins", weight: "100g" },
  { name: "Oats", price: 350, emoji: "🥣", category: "Breakfast and sauce", time: "15 mins", weight: "1kg" },
  { name: "Tomato Sauce", price: 180, emoji: "🥫", category: "Breakfast and sauce", time: "10 mins", weight: "500g" },
];

const seedData = async () => {
  try {
    // Seed Products
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log("✅ Products seeded!");

    // Seed Admin User
    await User.deleteMany();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true
    });
    console.log("✅ Admin user created: admin@gmail.com / admin123");

    // Seed Dummy Orders
    await Order.deleteMany();
    const orders = [
      {
        user: adminUser._id,
        items: [
          { product: products[0], quantity: 2, price: 150 },
          { product: products[1], quantity: 1, price: 300 }
        ],
        totalAmount: 600,
        status: "Delivered",
        paymentStatus: "Paid",
        paymentMethod: "COD",
        createdAt: new Date(Date.now() - 86400000) // Yesterday
      },
      {
        user: adminUser._id,
        items: [
          { product: products[3], quantity: 1, price: 120 }
        ],
        totalAmount: 120,
        status: "Pending",
        paymentStatus: "Pending",
        paymentMethod: "Online",
        createdAt: new Date() // Today
      },
      {
        user: adminUser._id,
        items: [
          { product: products[4], quantity: 2, price: 600 }
        ],
        totalAmount: 1200,
        status: "Processing",
        paymentStatus: "Paid",
        paymentMethod: "Online",
        createdAt: new Date(Date.now() - 172800000) // 2 days ago
      }
    ];
    // Need to re-fetch products to get IDs if real IDs are needed, 
    // but for simple string/embedded docs in some schemas this might pass.
    // However, Order schema likely references Product by ID.
    // Let's assume Order schema uses embedded product details or we need real IDs.
    // To be safe, we should fetch the inserted products first.

    // Actually, let's keep it simple. If we rely on valid ObjectIDs, we need to fetch them.
    // But since we are deleting/inserting products above, we can just grab them.
    const createdProducts = await Product.find();

    const finalOrders = orders.map((order, index) => {
      // Map dummy product indices to real DB products
      order.items.forEach(item => {
        const p = createdProducts.find(cp => cp.name === item.product.name);
        if (p) {
          item.product = p._id; // Replace full object with ID if schema requires ID
          // Or item.product could be the object. Let's assume ID for "product" field.
        }
      });
      return order;
    });

    await Order.insertMany(finalOrders);
    console.log("✅ Sample Orders seeded!");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    mongoose.disconnect();
  }
};

seedData();
