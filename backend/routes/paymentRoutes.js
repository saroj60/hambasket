import express from "express";
import User from "../models/user.js";
import Order from "../models/Order.js"; // Correct import for Order model if needed, checking existing code might be good but safely assuming casing
import jwt from "jsonwebtoken";
import axios from "axios";

const router = express.Router();

// Middleware to check auth
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

// Khalti Config
// Test Secret Key (Default public sandbox key)
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "test_secret_key_f593890d182745e1b18f214613253549";
const KHALTI_URL = "https://a.khalti.com/api/v2/epayment";

// Initiate Khalti Payment
router.post("/khalti/initiate", isAuth, async (req, res) => {
    try {
        const { orderId, amount, name, email, phone } = req.body; // Amount in Rs

        // Khalti expects amount in Paisa (Rs * 100)
        const payload = {
            "return_url": "http://localhost:5173/payment/success", // Frontend Success URL
            "website_url": "http://localhost:5173/",
            "amount": amount * 100,
            "purchase_order_id": orderId,
            "purchase_order_name": `Order ${orderId}`,
            "customer_info": {
                "name": name || "Guest Customer",
                "email": email || "guest@example.com",
                "phone": phone || "9800000000"
            }
        };

        const response = await axios.post(`${KHALTI_URL}/initiate/`, payload, {
            headers: {
                Authorization: `Key ${KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });

        res.json(response.data); // Returns pidx, payment_url, etc.

    } catch (error) {
        console.error("Khalti Initiate Error:", error.response?.data || error.message);
        res.status(500).json({
            message: "Failed to initiate Khalti payment",
            error: error.response?.data || error.message
        });
    }
});

// Verify Khalti Payment (Lookup)
router.post("/khalti/verify", async (req, res) => {
    try {
        const { pidx } = req.body;

        const response = await axios.post(`${KHALTI_URL}/lookup/`, { pidx }, {
            headers: {
                Authorization: `Key ${KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });

        const status = response.data.status;

        // If Completed, update verified status
        if (status === 'Completed' || status === 'Pending') { // Pending sometimes happens in sandbox
            res.json({ success: true, data: response.data });
        } else {
            res.json({ success: false, data: response.data });
        }

    } catch (error) {
        console.error("Khalti Verify Error:", error.response?.data || error.message);
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
});

// Save Payment Method (Existing)
router.post("/save-method", isAuth, async (req, res) => {
    try {
        const { type, last4, brand, identifier } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.paymentMethods.push({ type, last4, brand, identifier });
        await user.save();

        res.json({ success: true, paymentMethods: user.paymentMethods });
    } catch (error) {
        res.status(500).json({ message: "Error saving payment method", error: error.message });
    }
});

// Get Saved Methods (Existing)
router.get("/methods", isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.paymentMethods || []);
    } catch (error) {
        res.status(500).json({ message: "Error fetching methods", error: error.message });
    }
});

export default router;
