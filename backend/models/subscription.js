import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 }
    }],
    frequency: { type: String, enum: ["daily", "weekly", "monthly"], default: "weekly" },
    nextDelivery: { type: Date, required: true },
    status: { type: String, enum: ["active", "cancelled", "paused"], default: "active" },
    address: { type: String, required: true }
}, { timestamps: true });

const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
