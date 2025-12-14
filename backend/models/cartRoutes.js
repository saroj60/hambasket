import express from "express";

const router = express.Router();
let cart = []; // temporary in-memory cart

// GET cart items
router.get("/", (req, res) => {
  res.json(cart);
});

// POST add to cart
router.post("/:id", (req, res) => {
  const productId = req.params.id;
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }

  res.json(cart);
});

export default router;
