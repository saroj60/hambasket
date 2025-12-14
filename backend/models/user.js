import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, default: "User" },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    phone: { type: String, unique: true, sparse: true },
    otp: { type: String },
    otpExpires: { type: Date },
    addresses: [{
        label: String,
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        },
        isDefault: { type: Boolean, default: false }
    }],
    paymentMethods: [{
        type: { type: String, enum: ["card", "wallet"] },
        last4: String,
        brand: String, // Visa, MasterCard, Khalti, eSewa
        identifier: String // Masked phone or card number
    }],
    subscribedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    role: { type: String, enum: ["customer", "admin", "vendor", "rider"], default: "customer" },

    // Auth & Security
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshTokenHash: String,

    // MFA
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: String,

    lastLogin: Date,
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
