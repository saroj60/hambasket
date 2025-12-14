import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    logo: { type: String }, // URL to logo image
    address: { type: String, required: true },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    status: {
        type: String,
        enum: ["Pending", "Active", "Suspended"],
        default: "Pending"
    },
    createdAt: { type: Date, default: Date.now }
});

const Store = mongoose.models.Store || mongoose.model("Store", storeSchema);
export default Store;
