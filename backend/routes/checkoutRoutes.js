import express from "express";
import Cart from "../models/Cart.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Checkout = clear cart for authenticated user
router.post("/", protect, async (req, res) => {
  try {
    // Assuming 'Cart' model stores individual items (based on cartRoutes.js analysis)
    // We delete all items belonging to this user
    await Cart.deleteMany({ userId: req.user._id });
    res.json({ message: "Checkout successful, cart cleared ✅" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
});

export default router;
