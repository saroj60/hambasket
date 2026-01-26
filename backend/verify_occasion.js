
import mongoose from "mongoose";
import Occasion from "./models/occasion.js";
import dotenv from "dotenv";

dotenv.config();

const LOCAL_URI = 'mongodb://127.0.0.1:27017/quick-commerce';
const uri = process.env.MONGO_URI || LOCAL_URI;

mongoose.connect(uri)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.error(err));

async function verify() {
    try {
        console.log("Creating test occasion...");
        const occasion = await Occasion.create({
            name: "test_occasion_cli",
            title: "Test Occasion",
            description: "This is a test",
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000), // Tomorrow
            isActive: true
        });
        console.log("Created:", occasion._id);

        console.log("Fetching active occasions...");
        // Mock the logic used in route
        const activeOccasions = await Occasion.find({
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        if (activeOccasions.some(o => o.name === "test_occasion_cli")) {
            console.log("SUCCESS: Test occasion found in active list.");
        } else {
            console.error("FAILURE: Test occasion NOT found in active list.");
        }

        console.log("Cleaning up...");
        await Occasion.findByIdAndDelete(occasion._id);
        console.log("Deleted test occasion.");

    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        mongoose.connection.close();
    }
}

verify();
