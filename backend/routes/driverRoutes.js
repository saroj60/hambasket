import express from "express";
import Driver from "../models/driver.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        if (decoded.role !== "admin") return res.status(403).json({ message: "Access denied" });
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Get All Drivers
router.get("/", isAdmin, async (req, res) => {
    try {
        const drivers = await Driver.find().populate('user', 'name email phone');
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching drivers", error: error.message });
    }
});

// Add New Driver
router.post("/", isAdmin, async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;

        // 1. Create User account for Driver
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User with this email already exists" });

        user = await User.create({
            name,
            email,
            phone,
            password, // In real app, hash this!
            role: 'rider'
        });

        // 2. Create Driver Profile
        const driver = await Driver.create({
            user: user._id,
            status: 'Offline',
            currentLocation: { lat: 27.7172, lng: 85.3240 } // Default Kathmandu
        });

        res.status(201).json(driver);
    } catch (error) {
        res.status(500).json({ message: "Error adding driver", error: error.message });
    }
});

// Update Driver Status/Location
router.put("/:id", isAdmin, async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: "Error updating driver", error: error.message });
    }
});

export default router;
