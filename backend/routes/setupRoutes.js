import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';

const router = express.Router();

router.get('/seed-admin', async (req, res) => {
    try {
        const email = "admin@gmail.com";
        const password = "password";

        let user = await User.findOne({ email });

        if (user) {
            // Reset password if user exists
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            user.role = "admin";
            await user.save();
            return res.json({ message: "Admin exists. Password reset to 'password'." });
        }

        // Create new admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name: "Super Admin",
            email: email,
            phone: "9800000000",
            password: hashedPassword,
            role: "admin",
            isVerified: true
        });

        res.json({ message: "Admin created successfully: admin@gmail.com / password" });
    } catch (error) {
        res.status(500).json({ message: "Error seeding admin", error: error.message });
    }
});

export default router;
