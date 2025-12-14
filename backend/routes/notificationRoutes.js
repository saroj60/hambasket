import express from "express";
import Notification from "../models/notification.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware
const isAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Get Notifications
router.get("/", isAuth, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications" });
    }
});

// Mark as Read
router.put("/:id/read", isAuth, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Error updating notification" });
    }
});

// Subscribe to Stock
router.post("/subscribe", isAuth, async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user.subscribedProducts.includes(productId)) {
            user.subscribedProducts.push(productId);
            await user.save();
        }
        res.json({ success: true, message: "Subscribed to stock alerts" });
    } catch (error) {
        res.status(500).json({ message: "Error subscribing" });
    }
});

// Admin: Send Promo (Broadcast)
router.post("/promo", isAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin only" });

        const { message } = req.body;
        const users = await User.find({});

        const notifications = users.map(u => ({
            user: u._id,
            type: "promo",
            message
        }));

        await Notification.insertMany(notifications);
        res.json({ success: true, count: users.length });
    } catch (error) {
        res.status(500).json({ message: "Error sending promo" });
    }
});

export default router;
