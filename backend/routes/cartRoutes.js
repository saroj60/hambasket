import express from "express";
import Cart from "../models/Cart.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET cart items - Protected
router.get("/", protect, async (req, res) => {
  try {
    const items = await Cart.find({ userId: req.user._id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
});

// POST add to cart - Protected
router.post("/", protect, async (req, res) => {
  const { productId, name, price, qty, image } = req.body;

  try {
    const existing = await Cart.findOne({ productId, userId: req.user._id });
    if (existing) {
      existing.qty += qty;
      await existing.save();
      res.json(existing);
    } else {
      const item = new Cart({
        productId,
        name,
        price,
        qty,
        image,
        userId: req.user._id
      });
      await item.save();
      res.json(item);
    }
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
});

// DELETE remove from cart - Protected
router.delete("/:id", protect, async (req, res) => {
  try {
    // Only delete if it belongs to user (using userId filter or checking doc)
    // Using findOneAndDelete effectively checks ownership if we include userId
    const deleted = await Cart.findOneAndDelete({ productId: req.params.id, userId: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: "Item not found in your cart" });
    }
    res.json({ message: "Item removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing from cart", error: error.message });
  }
});

export default router;
