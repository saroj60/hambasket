import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  emoji: { type: String },
  category: { type: String },
  subCategory: { type: String },
  brand: { type: String },
  dietaryPreferences: [{ type: String }], // e.g., "Vegan", "Gluten-Free"
  time: { type: String },
  weight: { type: String },
  stock: { type: Number, default: 100 },
  lowStockThreshold: { type: Number, default: 10 },
  variants: [{
    size: String,
    weight: String,
    price: Number,
    stock: Number
  }],
  flashSale: {
    active: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    endTime: { type: Date }
  },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
