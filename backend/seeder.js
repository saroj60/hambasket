import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.js";

dotenv.config();

const products = [
  {
    name: "Laptop",
    price: 55000,
    description: "High performance laptop for work and gaming.",
    image: "/assets/laptop.jpg",
  },
  {
    name: "Smartphone",
    price: 25000,
    description: "Latest model smartphone with amazing camera.",
    image: "/assets/phone.jpg",
  },
  {
    name: "Headphones",
    price: 3000,
    description: "Noise-cancelling over-ear headphones.",
    image: "/assets/headphones.jpg",
  },
  {
    name: "Camera",
    price: 40000,
    description: "DSLR camera for photography enthusiasts.",
    image: "/assets/camera.jpg",
  },
  {
    name: "Tablet",
    price: 18000,
    description: "Lightweight tablet perfect for work and play.",
    image: "/assets/tablet.jpg",
  },
];

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("MongoDB connected");

    // Clear existing products
    await Product.deleteMany();

    // Insert sample products
    await Product.insertMany(products);
    console.log("Sample products added");

    mongoose.disconnect();
  })
  .catch((err) => console.log(err));
