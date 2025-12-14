import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ["fixed", "percent"], required: true },
    value: { type: Number, required: true },
    minOrder: { type: Number, default: 0 },
    influencerName: { type: String }, // For tracking influencer campaigns
    usageCount: { type: Number, default: 0 },
    maxUsage: { type: Number }, // Optional limit
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;
