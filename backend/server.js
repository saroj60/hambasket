import express from "express"; // Force Vercel Update
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import setupRoutes from "./routes/setupRoutes.js";
import occasionRoutes from "./routes/occasionRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from "http";
import { Server } from "socket.io";

import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

// ... existing imports ...

dotenv.config();
const app = express();
app.set('trust proxy', 1); // Enable proxy trust for Render/Vercel

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. Compression (Gzip)
app.use(compression());

// 3. Rate Limiting (Basic DDoS Protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes"
});
// Apply rate limiting to all requests
app.use(limiter);

app.use(cors({
  origin: (origin, callback) => {
    // ... same cors logic ...
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'https://aonekirana.com',
      'https://www.aonekirana.com',
      'http://localhost:5173',
      'http://192.168.1.62:5173', // Local Dev Phone
      'http://192.168.16.105:5173', // New Local Dev Phone
      'https://hambasket-frontend.vercel.app'
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || true) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes

app.use(cookieParser());

// Logging Middleware (After parsing)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
// Optimized MongoDB Connection for Vercel
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering to fail fast if no connection
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log("Connecting to MongoDB...");
    // Force local connection for debugging/stability - MODIFIED TO PREFER ENV
    const LOCAL_URI = 'mongodb://127.0.0.1:27017/quick-commerce';
    const uri = process.env.MONGO_URI || LOCAL_URI;

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log(`✅ MongoDB New Connection Established to ${uri}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", e);
    throw e;
  }

  return cached.conn;
}


// Root Endpoint - Moved above DB middleware for Health Checks
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Middleware to ensure connection on every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("🔥 Database connection failed:", error);
    res.status(500).json({
      message: "Database connection failed",
      error: error.message
    });
  }
});



app.use("/api/setup", setupRoutes);

// Serve Uploads

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/offers", offerRoutes);
app.use('/api/occasions', occasionRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/api/location", locationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});



const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://aonekirana.com',
      'https://www.aonekirana.com',
      'http://localhost:5173',
      'https://hambasket-frontend.vercel.app'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io Connection Handler
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("joinOrder", (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined order room: ${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Make io accessible globally (or export it if needed, but app.set is easier for routes)
app.set("io", io);

// Start server
// Export app for Vercel
export default app;

// Start server only if not in Vercel environment
// Start server if not running as a Vercel serverless function
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Health check available at http://0.0.0.0:${PORT}/`);
  });
}
