import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  guestInfo: {
    name: String,
    email: String,
    phone: String
  },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  tax: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true }, // This is grandTotal

  shippingAddress: { type: String, required: true },
  deliveryLocation: {
    lat: Number,
    lng: Number
  },
  deliveryTime: { type: String, default: "Instant (15-30 mins)" },
  paymentMethod: { type: String, default: "Cash on Delivery" },
  paymentDetails: {
    transactionId: String,
    isPaid: { type: Boolean, default: false },
    paidAt: Date
  },
  tip: { type: Number, default: 0 },
  isSubscription: { type: Boolean, default: false },
  driver: {
    name: { type: String },
    phone: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  trackingHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  }],
  status: { type: String, enum: ["Pending", "Processing", "Out for Delivery", "Delivered", "Cancelled"], default: "Pending" },
  refundStatus: { type: String, enum: ["None", "Pending", "Approved", "Rejected"], default: "None" },
  refundReason: { type: String }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
