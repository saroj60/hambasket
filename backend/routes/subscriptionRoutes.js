import express from "express";
import Subscription from "../models/subscription.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to check authentication
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

// Create Subscription
router.post("/", isAuth, async (req, res) => {
    try {
        const { items, frequency, address } = req.body;

        // Calculate next delivery date
        const nextDelivery = new Date();
        if (frequency === 'daily') nextDelivery.setDate(nextDelivery.getDate() + 1);
        if (frequency === 'weekly') nextDelivery.setDate(nextDelivery.getDate() + 7);
        if (frequency === 'monthly') nextDelivery.setMonth(nextDelivery.getMonth() + 1);

        const subscription = await Subscription.create({
            user: req.user.id,
            items,
            frequency,
            address,
            nextDelivery
        });

        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ message: "Error creating subscription", error: error.message });
    }
});

// Get User Subscriptions
router.get("/", isAuth, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user.id })
            .populate("items.product")
            .sort({ createdAt: -1 });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subscriptions", error: error.message });
    }
});

// Cancel Subscription
router.put("/:id/cancel", isAuth, async (req, res) => {
    try {
        const subscription = await Subscription.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { status: "cancelled" },
            { new: true }
        );
        if (!subscription) return res.status(404).json({ message: "Subscription not found" });
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ message: "Error cancelling subscription", error: error.message });
    }
});

export default router;
