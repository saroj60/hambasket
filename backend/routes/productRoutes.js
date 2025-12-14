import express from "express";
import Product from "../models/product.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to check if user is admin
// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    if (decoded.role !== "admin") return res.status(403).json({ message: "Access denied" });
    req.user = decoded; // Set req.user
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to check if user is vendor or admin
const isVendorOrAdmin = (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    if (decoded.role !== "admin" && decoded.role !== "vendor") return res.status(403).json({ message: "Access denied" });
    req.user = decoded; // Set req.user
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

import { getProducts, addProduct, updateProduct, deleteProduct } from "../controllers/productController.js";

// Get All Products (with Search & Filters)
router.get("/", getProducts);

// Get Low Stock Products (Admin)
router.get("/low-stock", isAdmin, async (req, res) => {
  try {
    const products = await Product.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching low stock products", error: error.message });
  }
});

// Get Single Product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
});

import upload from "../config/multerConfig.js";

// Add Product (Admin or Vendor)
router.post("/", isVendorOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const productData = req.body;
    if (req.file) {
      productData.image = req.file.path;
    }
    if (productData.flashSale) {
      try {
        productData.flashSale = JSON.parse(productData.flashSale);
      } catch (e) {
        console.error("Error parsing flashSale:", e);
      }
    }
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error: error.message });
  }
});

// Update Product (Admin or Vendor)
router.put("/:id", isVendorOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const productData = req.body;
    if (req.file) {
      productData.image = req.file.path;
    }
    if (productData.flashSale) {
      try {
        productData.flashSale = JSON.parse(productData.flashSale);
      } catch (e) {
        console.error("Error parsing flashSale:", e);
      }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
});

// Delete Product (Admin or Vendor)
router.delete("/:id", isVendorOrAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});

export default router;
