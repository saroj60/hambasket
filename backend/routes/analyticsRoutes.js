import express from "express";
import Order from "../models/Order.js";
import Product from "../models/product.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to check auth
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
            req.user = { _id: decoded.id, role: decoded.role };
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

// Middleware to check admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as admin" });
    }
};

// GET /api/analytics/forecast
router.get("/forecast", protect, isAdmin, async (req, res) => {
    try {
        // 1. Get orders from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const orders = await Order.find({
            createdAt: { $gte: thirtyDaysAgo },
            status: { $ne: 'Cancelled' }
        });

        // 2. Aggregate sales by product
        const productSales = {}; // { productId: totalQuantity }

        orders.forEach(order => {
            order.items.forEach(item => {
                // item.product is the ID, or item._id if populated? 
                // In Order model, items array has { product: ObjectId, quantity: Number, ... }
                // But usually we store product ID. Let's assume item.product is the ID.
                const pId = item.product.toString();
                if (!productSales[pId]) productSales[pId] = 0;
                productSales[pId] += item.quantity;
            });
        });

        // 3. Calculate daily average and forecast
        // Simple logic: Daily Avg = Total / 30. Forecast (7 days) = Daily Avg * 7.
        const forecast = [];

        for (const [productId, totalQty] of Object.entries(productSales)) {
            const dailyAvg = totalQty / 30;
            const next7Days = Math.ceil(dailyAvg * 7);

            // Fetch product details for name
            const product = await Product.findById(productId).select('name emoji');

            if (product) {
                forecast.push({
                    productId,
                    name: product.name,
                    emoji: product.emoji,
                    totalSoldLast30Days: totalQty,
                    dailyAverage: dailyAvg.toFixed(2),
                    forecastNext7Days: next7Days
                });
            }
        }

        // Sort by highest forecast
        forecast.sort((a, b) => b.forecastNext7Days - a.forecastNext7Days);

        // Return top 5
        res.json(forecast.slice(0, 5));

    } catch (error) {
        res.status(500).json({ message: "Error generating forecast", error: error.message });
    }
});

export default router;
