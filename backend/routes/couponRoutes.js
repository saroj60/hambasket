import express from "express";
import Coupon from "../models/coupon.js";

const router = express.Router();

// Validate Coupon
router.post("/validate", async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ message: "Invalid coupon code" });
        }

        if (orderAmount < coupon.minOrder) {
            return res.status(400).json({ message: `Minimum order of Rs. ${coupon.minOrder} required` });
        }

        let discount = 0;
        if (coupon.discountType === "fixed") {
            discount = coupon.value;
        } else {
            discount = (orderAmount * coupon.value) / 100;
        }

        // Ensure discount doesn't exceed order amount
        discount = Math.min(discount, orderAmount);

        res.json({
            success: true,
            code: coupon.code,
            discount,
            message: "Coupon applied successfully!"
        });
    } catch (error) {
        res.status(500).json({ message: "Error validating coupon", error: error.message });
    }
});

// Create Coupon (Seed/Admin use mostly)
router.post("/", async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: "Error creating coupon", error: error.message });
    }
});

export default router;
