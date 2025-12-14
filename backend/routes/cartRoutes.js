import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

// GET cart items
router.get("/", async (req, res) => {
  const items = await Cart.find();
  res.json(items);
});

// POST add to cart
router.post("/", async (req, res) => {
  const { productId, name, price, qty, image } = req.body;
  const existing = await Cart.findOne({ productId });
  if (existing) {
    existing.qty += qty;
    await existing.save();
    res.json(existing);
  } else {
    const item = new Cart({ productId, name, price, qty, image });
    await item.save();
    res.json(item);
  }
});

// DELETE remove from cart
router.delete("/:id", async (req, res) => {
  await Cart.findByIdAndDelete(req.params.id);
  res.json({ message: "Item removed" });
});

export default router;
