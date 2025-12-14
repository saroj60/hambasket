import express from "express";
import { createStore, getMyStore, getAllStores, getStoreById, getAdminStores, deleteStore } from "../controllers/storeController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to check auth
const protect = async (req, res, next) => {
    let token;
    if (req.cookies.accessToken) {
        token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
            req.user = { _id: decoded.id, role: decoded.role }; // Ensure role is passed
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

router.post("/", protect, createStore);
router.get("/my-store", protect, getMyStore);
router.get("/", getAllStores);
router.get("/admin", protect, isAdmin, getAdminStores);
router.get("/:id", getStoreById);
router.delete("/:id", protect, deleteStore);

export default router;
