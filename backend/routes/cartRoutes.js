import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/product.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET cart items - Protected
router.get("/", protect, async (req, res) => {
  try {
    const items = await Cart.find({ userId: req.user._id });

    // Hydrate items with fresh product info (specifically image)
    // Because Cart stores a snapshot, the image link might be outdated or missing
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId).select('image emoji');
      return {
        ...item.toObject(),
        image: product ? product.image : item.image,
        emoji: product ? product.emoji : item.emoji
      };
    }));

    res.json(enrichedItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
});

// POST add to cart - Protected
router.post("/", protect, async (req, res) => {
  const { productId, name, price, qty, image, variant } = req.body;

  try {
    let query = { productId, userId: req.user._id };

    // If variant exists, include it in the query to separate items
    if (variant && variant.weight) {
      query["variant.weight"] = variant.weight;
    } else {
      // Ensure we don't accidentally match a variant item if adding a non-variant item
      // query["variant"] = { $exists: false }; // This might be too strict if variant is null in db
      // Instead, we can filter in code or trust that non-variant items won't have the field.
      // Better approach:
    }

    // Since query construction with nested objects can be tricky if fields are missing, 
    // let's fetch matches and filter in memory or use exact match if simple.
    // However, Mongoose "findOne" with nested object match query works.

    // Improved Query Logic:
    let existing;
    if (variant && variant.weight) {
      existing = await Cart.findOne({
        productId,
        userId: req.user._id,
        "variant.weight": variant.weight
      });
    } else {
      existing = await Cart.findOne({
        productId,
        userId: req.user._id,
        $or: [{ variant: { $exists: false } }, { variant: null }]
      });
    }

    if (existing) {
      existing.qty += qty;
      // Update price just in case it changed? No, respect cart snapshot usually.
      await existing.save();
      res.json(existing);
    } else {
      const item = new Cart({
        productId,
        name,
        price,
        qty,
        image,
        variant,
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
    // We now expect :id to be the Cart Item's _id (unique per variant line item)
    // Legacy support: If the ID looks like a product ID (check logic?), or just trust the client 
    // to send the correct ID.
    // Previously: findOneAndDelete({ productId: req.params.id, userId: ... })
    // New: findOneAndDelete({ _id: req.params.id, userId: ... })

    // Let's try to delete by _id first.
    let deleted = await Cart.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    // Fallback? If the client sends a productId (old code), we might delete ALL variants of that product?
    // Better to migrate frontend to send _id.
    // But for safety during transition, if not found by _id, maybe check productId?
    // No, that's dangerous. Let's enforce _id.

    if (!deleted) {
      // It might be a product ID from an old cached frontend?
      // Let's NOT support removing by product ID anymore to avoid deleting wrong variant.
      return res.status(404).json({ message: "Item not found in your cart" });
    }
    res.json({ message: "Item removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing from cart", error: error.message });
  }
});

export default router;
