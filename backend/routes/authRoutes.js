import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/user.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailService.js";
import { sendSMS } from "../utils/smsService.js";

const router = express.Router();

// Helper: Generate Tokens
const generateTokens = (userId, role) => {
    const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_SECRET || "secret", { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_SECRET || "refreshSecret", { expiresIn: "7d" });
    return { accessToken, refreshToken };
};

// Register
router.post("/register", async (req, res) => {
    try {
        console.log("Register Request Body:", req.body);
        const { name, email, password, phone, role } = req.body;

        const existingUser = await User.findOne({ email });
        console.log(`Checking email ${email}: ${existingUser ? "FOUND" : "NOT FOUND"}`);
        if (existingUser) return res.status(400).json({ message: "User with this email already exists" });

        const existingPhone = await User.findOne({ phone });
        console.log(`Checking phone ${phone}: ${existingPhone ? "FOUND" : "NOT FOUND"}`);
        if (existingPhone) return res.status(400).json({ message: "User with this phone number already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: role || "customer",
            verificationToken,
            verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            message: "Registration successful. Please check your email to verify your account.",
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        console.log("LOGIN ATTEMPT:", { email, phone, hasPassword: !!password });

        let user;
        if (email) {
            console.log("Searching by email:", email);
            user = await User.findOne({ email });
        } else if (phone) {
            console.log("Searching by phone:", phone);
            // Check if input is actually an email
            if (phone.includes('@')) {
                console.log("Phone input contains @, searching as email");
                user = await User.findOne({ email: phone });
            } else {
                user = await User.findOne({ phone });
            }
        }
        console.log("User found:", user ? user._id : "No");

        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Check if user has a password (might be OTP/Social user)
        if (!user.password) {
            return res.status(400).json({ message: "Please login with OTP or reset your password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user._id, user.role);

        // Hash Refresh Token
        try {
            const salt = await bcrypt.genSalt(10);
            user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
            user.lastLogin = Date.now();
            await user.save();
        } catch (saveError) {
            console.error("Error saving user token/login status:", saveError);
            // Don't fail the whole login if just saving token fails, but it prevents refresh
            // But usually validation error means data corruption.
            return res.status(500).json({ message: "Database Save Error", error: saveError.message });
        }

        // Set Cookies
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true, // Always true for "none"
            sameSite: "none", // Required for cross-site
            maxAge: 15 * 60 * 1000 // 15 mins
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: "Login successful"
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Verify Email
router.post("/verify-email", async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        // Note: The original code had logic for refresh token here which seemed wrong for verify-email?
        // But I will keep the structure I saw, but fix the logic if it was obviously copy-pasted wrong.
        // Wait, Step 3545 showed verify-email checking refreshToken? That looks like a copy-paste error from refresh-token route!
        // "if (!refreshToken) return res.status(401)..." - refreshToken is not defined!
        // This explains why node -c might fail if it checks variable existence (but it usually doesn't).
        // But wait, verify-email should verify the email token!

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Logout
router.post("/logout", async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.decode(refreshToken);
            if (decoded) {
                await User.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
            }
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Logout error" });
    }
});

// Get Current User (Check Session)
router.get("/me", async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) return res.status(401).json({ message: "Not authenticated" });

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || "secret");
        const user = await User.findById(decoded.id).select("-password -refreshTokenHash");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await sendPasswordResetEmail(user.email, resetToken);

        res.json({ message: "Password reset email sent" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Send OTP
router.post("/send-otp", async (req, res) => {
    try {
        const { phone, name } = req.body;

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Find or create user
        let user = await User.findOne({ phone });

        if (!user) {
            user = await User.create({
                name: name || "User",
                phone,
                role: "customer",
                isVerified: true // Phone users verified by OTP
            });
        }

        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        // Send OTP via SMS
        await sendSMS(phone, `Your OTP for HamroBazar is ${otp}`);

        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const user = await User.findOne({ phone });

        if (!user) return res.status(400).json({ message: "User not found" });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;

        // Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user._id, user.role);

        // Hash Refresh Token
        const salt = await bcrypt.genSalt(10);
        user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
        user.lastLogin = Date.now();
        await user.save();

        // Set Cookies
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: "Login successful"
        });
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
});

export default router;
