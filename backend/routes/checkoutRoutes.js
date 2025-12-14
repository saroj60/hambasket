import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

// Checkout = clear cart
router.post("/", async (req, res) => {
  let cart = await Cart.findOne();
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ message: "Checkout successful ✅" });
});

export default router;
