import express from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to check if user is authenticated
const isAuth = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Get User Profile
router.get("/profile", isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
});

// Get Wishlist
router.get("/wishlist", isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("wishlist");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: "Error fetching wishlist", error: error.message });
    }
});

// Add to Wishlist
router.post("/wishlist/:productId", isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const productId = req.params.productId;
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: "Error adding to wishlist", error: error.message });
    }
});

// Remove from Wishlist
router.delete("/wishlist/:productId", isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const productId = req.params.productId;
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: "Error removing from wishlist", error: error.message });
    }
});

// Add Address
router.post("/address", isAuth, async (req, res) => {
    try {
        const { label, address, coordinates, isDefault } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        // If setting as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push({ label, address, coordinates, isDefault });
        await user.save();

        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: "Error adding address", error: error.message });
    }
});

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        if (decoded.role !== "admin") return res.status(403).json({ message: "Access denied" });
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Get All Users (Admin)
router.get("/", isAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
});

// Block/Unblock User (Admin)
router.put("/:id/block", isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
});

export default router;
