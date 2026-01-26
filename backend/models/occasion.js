import mongoose from "mongoose";

const occasionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true }, // Localized display title
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Curated list of products
}, { timestamps: true });

// Check if occasion is currently active based on dates and flag
occasionSchema.methods.checkActive = function () {
    const now = new Date();
    return this.isActive && this.startDate <= now && this.endDate >= now;
};

const Occasion = mongoose.models.Occasion || mongoose.model("Occasion", occasionSchema);

export default Occasion;
