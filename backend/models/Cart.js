import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  productId: String,
  name: String,
  price: Number,
  qty: Number,
  image: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
