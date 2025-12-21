import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies
    if (req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
            req.user = await User.findById(decoded.id).select("-password -refreshTokenHash");
            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }
            return next();
        } catch (error) {
            console.error("Token verification failed:", error.message);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

export { protect };
