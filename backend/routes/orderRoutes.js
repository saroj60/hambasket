import express from "express";
import Driver from "../models/driver.js";
import Order from "../models/Order.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";
import jwt from "jsonwebtoken";

// Helper: Calculate Distance (Haversine Formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        if (decoded.role !== "admin") return res.status(403).json({ message: "Access denied" });
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Middleware to check if user is authenticated
const isAuth = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Create Order
router.post("/", async (req, res) => {
    try {
        const {
            user, guestInfo, items,
            subtotal, deliveryFee, tax, discount, totalAmount,
            shippingAddress, deliveryLocation, deliveryTime,
            paymentMethod, paymentDetails, tip
        } = req.body;

        let orderData = {
            user,
            guestInfo,
            items,
            subtotal,
            deliveryFee,
            tax,
            discount,
            totalAmount,
            shippingAddress,
            deliveryLocation,
            deliveryTime,
            paymentMethod,
            paymentDetails,
            tip
        };

        // Auto-Assign Driver Logic
        if (deliveryLocation && deliveryLocation.lat && deliveryLocation.lng) {
            const availableDrivers = await Driver.find({ status: 'Available' }).populate('user');

            if (availableDrivers.length > 0) {
                let nearestDriver = null;
                let minDistance = Infinity;

                availableDrivers.forEach(driver => {
                    if (driver.currentLocation && driver.currentLocation.lat) {
                        const dist = calculateDistance(
                            deliveryLocation.lat, deliveryLocation.lng,
                            driver.currentLocation.lat, driver.currentLocation.lng
                        );
                        if (dist < minDistance) {
                            minDistance = dist;
                            nearestDriver = driver;
                        }
                    }
                });

                if (nearestDriver && minDistance < 10) { // Only assign if within 10km
                    orderData.driver = {
                        name: nearestDriver.user.name,
                        phone: nearestDriver.user.phone,
                        location: nearestDriver.currentLocation
                    };
                    orderData.status = "Processing"; // Auto-accept if driver found? Or keep Pending. Let's keep Pending but assigned.

                    // Update Driver
                    nearestDriver.status = 'Busy';
                    nearestDriver.assignedOrders.push(new mongoose.Types.ObjectId()); // Placeholder, will update after save
                }
            }
        }

        const order = await Order.create(orderData);

        // If driver was assigned, update the driver with the actual order ID
        if (orderData.driver && orderData.driver.name) {
            const driverUser = await User.findOne({ name: orderData.driver.name }); // Inefficient, better to keep reference
            // Re-find the driver to update correctly
            const assignedDriver = await Driver.findOne({ 'user': driverUser._id });
            if (assignedDriver) {
                assignedDriver.assignedOrders.push(order._id);
                await assignedDriver.save();
            }
        }

        // Notify Admins
        const admins = await User.find({ role: 'admin' });
        if (admins.length > 0) {
            let userName = 'Guest';
            if (user) {
                const u = await User.findById(user);
                if (u) userName = u.name;
            } else if (guestInfo?.name) {
                userName = guestInfo.name;
            }

            const notifications = admins.map(admin => ({
                user: admin._id,
                type: 'order',
                message: `New Order #${order._id.toString().slice(-6)} placed by ${userName}`,
                relatedId: order._id
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
});

// Analytics (Admin)
router.get("/analytics", isAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'customer' });

        const salesData = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
        ]);
        const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name');

        res.json({
            totalOrders,
            totalUsers,
            totalSales,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching analytics", error: error.message });
    }
});

// Get My Orders
router.get("/my-orders", isAuth, async (req, res) => {
    try {
        console.log("Fetching orders for user:", req.user.id);
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product')
            .sort({ createdAt: -1 });
        console.log("Found orders:", orders.length);
        res.json(orders);
    } catch (error) {
        console.error("Error in my-orders:", error);
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
});

// Get All Orders (Admin)
router.get("/", isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name phone').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
});

// Update Order Status (Admin)
router.put("/:id", isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();

        // Emit Socket Event
        const io = req.app.get('io');
        if (io) {
            io.to(order._id.toString()).emit('orderUpdate', updatedOrder);
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: "Error updating order", error: error.message });
    }
});

// Request Refund
router.post("/:id/refund", isAuth, async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.user.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });
        if (order.status !== "Delivered") return res.status(400).json({ message: "Only delivered orders can be refunded" });
        if (order.refundStatus !== "None") return res.status(400).json({ message: "Refund already requested" });

        order.refundStatus = "Pending";
        order.refundReason = reason;
        await order.save();

        res.json({ message: "Refund request submitted", order });
    } catch (error) {
        res.status(500).json({ message: "Error requesting refund", error: error.message });
    }
});

export default router;
