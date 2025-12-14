import express from "express";

const router = express.Router();
let cart = []; // use same in-memory cart for simplicity

router.post("/", (req, res) => {
  cart = []; // clear cart
  res.json({ message: "Checkout successful!" });
});

export default router;
