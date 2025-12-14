import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Available", "Busy", "Offline"], default: "Offline" },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
}, { timestamps: true });

const Driver = mongoose.models.Driver || mongoose.model("Driver", driverSchema);
export default Driver;
