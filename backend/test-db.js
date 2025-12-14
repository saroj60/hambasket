import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://127.0.0.1:27017/quick-commerce';

const connectDB = async () => {
    try {
        console.log("Attempting to connect to:", MONGO_URI);
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        console.log("✅ MongoDB Connection Successful!");
        process.exit(0);
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:");
        console.error("Name:", error.name);
        console.error("Message:", error.message);
        if (error.cause) console.error("Cause:", error.cause);
        process.exit(1);
    }
};

connectDB();
