import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Product from "./models/product.js";
import User from "./models/user.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
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

    await User.create({
      name: "Admin User",
      email: "sarojbhagat666@gmail.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true
    });
    console.log("✅ Admin user created: admin@hambasket.com / admin123");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    mongoose.disconnect();
  }
};

seedData();
