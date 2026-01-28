import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // MRP or Price before discount
  unit: { type: String, default: 'pcs' }, // kg, liter, pcs, etc.
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
  isTopPick: { type: Boolean, default: false },
  occasions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Occasion" }],
}, { timestamps: true });

// Indexes for performance
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text', subCategory: 'text' });
productSchema.index({ store: 1 });
productSchema.index({ isTopPick: 1 });
productSchema.index({ "flashSale.active": 1 });
productSchema.index({ occasions: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
