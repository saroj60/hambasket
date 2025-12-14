import express from "express";
import Offer from "../models/offer.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to check auth
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
            req.user = { _id: decoded.id, role: decoded.role };
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

// Middleware to check admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as admin" });
    }
};

// Create Offer (Admin)
router.post("/", protect, isAdmin, async (req, res) => {
    try {
        const { title, description, discountCode, discountPercentage, location, radius, expiry } = req.body;
        const offer = new Offer({
            title,
            description,
            discountCode,
            discountPercentage,
            location,
            radius,
            expiry
        });
        await offer.save();
        res.status(201).json(offer);
    } catch (error) {
        res.status(500).json({ message: "Error creating offer", error: error.message });
    }
});

// Get Nearby Offers
router.get("/nearby", async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitude and Longitude required" });
        }

        // Note: MongoDB $near requires legacy coordinate pairs [lng, lat]
        // But since we used 'location.lat' and 'location.lng' in schema as subdocuments, 
        // we might need to adjust how we query or how we store.
        // The schema I created: location: { lat: Number, lng: Number }
        // This is NOT a GeoJSON Point. 
        // To use $near with 2dsphere, we need GeoJSON format: { type: "Point", coordinates: [lng, lat] }

        // Let's fix the query to use simple distance calculation or update schema.
        // For simplicity with the current schema structure (lat/lng fields), we can't use $near with 2dsphere easily unless we stored it as GeoJSON.
        // I will use a simple bounding box or Haversine formula in JS if dataset is small, 
        // OR I should have defined the schema as GeoJSON.

        // Let's stick to the schema I defined: lat/lng numbers.
        // I'll fetch all active offers and filter in JS for this MVP.

        const offers = await Offer.find({ active: true, expiry: { $gt: new Date() } });

        const nearbyOffers = offers.filter(offer => {
            const distance = getDistanceFromLatLonInKm(lat, lng, offer.location.lat, offer.location.lng) * 1000; // in meters
            return distance <= offer.radius;
        });

        res.json(nearbyOffers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching offers", error: error.message });
    }
});

// Helper function for distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

export default router;
