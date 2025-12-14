import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema({
    name: { type: String, required: true },
    coordinates: [{
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    }], // Polygon points
    assignedDrivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Driver" }]
}, { timestamps: true });

const Zone = mongoose.models.Zone || mongoose.model("Zone", zoneSchema);
export default Zone;
