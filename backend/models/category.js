import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: {
        type: String
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    subCategories: [{
        name: { type: String, required: true },
        image: { type: String } // Optional: image for subcategory if needed eventually
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Performance Indexes
categorySchema.index({ displayOrder: 1 }); // For sorting
categorySchema.index({ isActive: 1 }); // For filtering hidden categories

const Category = mongoose.model('Category', categorySchema);
export default Category;
