import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    discountCode: { type: String, required: true },
    discountPercentage: { type: Number, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    radius: { type: Number, default: 5000 }, // in meters
    expiry: { type: Date, required: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

// Index for geospatial queries
offerSchema.index({ location: "2dsphere" });

const Offer = mongoose.models.Offer || mongoose.model("Offer", offerSchema);
export default Offer;
