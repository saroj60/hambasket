import express from "express";
import Occasion from "../models/occasion.js";
import jwt from "jsonwebtoken";
import upload from "../config/multerConfig.js";

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        if (decoded.role !== "admin") return res.status(403).json({ message: "Access denied" });
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Get all occasions (Public - Filter by active for users)
router.get("/", async (req, res) => {
    try {
        // If admin, return all. If user, return only active.
        // For simplicity, we can have a query param or separate endpoint.
        // Let's rely on query param 'admin=true' which needs admin check, otherwise return active.

        // Actually, distinct endpoints might be cleaner, but let's stick to standard REST
        const { admin } = req.query;

        if (admin === 'true') {
            // Need to verify token here if we want to secure it, or trust the middleware chain if applied globally (it's not here)
            // Let's just return all for specific admin routes or let the frontend filter?
            // Better: GET / returning active is default. GET /admin returns all (protected).
            // Let's keep it simple: GET / returns active occasions. 
            // Admin can use GET /all (protected).

            const occasions = await Occasion.find({
                isActive: true,
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            }).populate('products');
            return res.json(occasions);
        }

        const occasions = await Occasion.find({
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        }).populate('products');
        res.json(occasions);

    } catch (error) {
        res.status(500).json({ message: "Error fetching occasions", error: error.message });
    }
});

// Admin Get All (Active and Inactive)
router.get("/admin/all", isAdmin, async (req, res) => {
    try {
        const occasions = await Occasion.find({}).sort({ createdAt: -1 });
        res.json(occasions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin occasions", error: error.message });
    }
});


// Get Single Occasion
router.get("/:id", async (req, res) => {
    try {
        const occasion = await Occasion.findById(req.params.id).populate('products');
        if (!occasion) return res.status(404).json({ message: "Occasion not found" });
        res.json(occasion);
    } catch (error) {
        res.status(500).json({ message: "Error fetching occasion", error: error.message });
    }
});

// Create Occasion (Admin)
router.post("/", isAdmin, upload.single('image'), async (req, res) => {
    try {
        const occasionData = req.body;
        if (req.file) {
            occasionData.image = req.file.path;
        }
        if (occasionData.products) {
            try {
                occasionData.products = JSON.parse(occasionData.products);
            } catch (e) {
                console.error("Error parsing products:", e);
            }
        }

        const occasion = await Occasion.create(occasionData);
        res.status(201).json(occasion);
    } catch (error) {
        res.status(500).json({ message: "Error creating occasion", error: error.message });
    }
});

// Update Occasion (Admin)
router.put("/:id", isAdmin, upload.single('image'), async (req, res) => {
    try {
        const occasionData = req.body;
        if (req.file) {
            occasionData.image = req.file.path;
        }
        if (occasionData.products) {
            try {
                // Handle if it's already an array or needs parsing
                if (typeof occasionData.products === 'string') {
                    occasionData.products = JSON.parse(occasionData.products);
                }
            } catch (e) {
                console.error("Error parsing products:", e);
            }
        }

        const occasion = await Occasion.findByIdAndUpdate(req.params.id, occasionData, { new: true });
        if (!occasion) return res.status(404).json({ message: "Occasion not found" });
        res.json(occasion);
    } catch (error) {
        res.status(500).json({ message: "Error updating occasion", error: error.message });
    }
});

// Delete Occasion (Admin)
router.delete("/:id", isAdmin, async (req, res) => {
    try {
        const occasion = await Occasion.findByIdAndDelete(req.params.id);
        if (!occasion) return res.status(404).json({ message: "Occasion not found" });
        res.json({ message: "Occasion deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting occasion", error: error.message });
    }
});

export default router;
