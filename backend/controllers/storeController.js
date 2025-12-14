import Store from "../models/store.js";
import User from "../models/user.js";

// Create a new store
// Create a new store
export const createStore = async (req, res) => {
    try {
        const { name, description, address, location } = req.body;

        // Check if user already has a store (unless admin)
        if (req.user.role !== 'admin') {
            const existingStore = await Store.findOne({ owner: req.user._id });
            if (existingStore) {
                return res.status(400).json({ message: "You already have a store" });
            }
        }

        const newStore = new Store({
            owner: req.user._id,
            name,
            description,
            address,
            location,
            status: "Active"
        });

        await newStore.save();

        // Update user role to vendor if not admin
        if (req.user.role !== 'admin') {
            await User.findByIdAndUpdate(req.user._id, { role: "vendor" });
        }

        res.status(201).json(newStore);
    } catch (error) {
        res.status(500).json({ message: "Error creating store", error: error.message });
    }
};

// Get current user's store
export const getMyStore = async (req, res) => {
    try {
        const store = await Store.findOne({ owner: req.user._id });
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }
        res.json(store);
    } catch (error) {
        res.status(500).json({ message: "Error fetching store", error: error.message });
    }
};

// Get all active stores (Public)
export const getAllStores = async (req, res) => {
    try {
        const stores = await Store.find({ status: "Active" }).populate("owner", "name");
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: "Error fetching stores", error: error.message });
    }
};

// Get all stores (Admin)
export const getAdminStores = async (req, res) => {
    try {
        const stores = await Store.find({}).populate("owner", "name");
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: "Error fetching stores", error: error.message });
    }
};

// Get store by ID
export const getStoreById = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id).populate("owner", "name");
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }
        res.json(store);
    } catch (error) {
        res.status(500).json({ message: "Error fetching store", error: error.message });
    }
};

// Delete store
export const deleteStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        // Only owner or admin can delete
        if (store.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized" });
        }

        await store.deleteOne();
        res.json({ message: "Store removed" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting store", error: error.message });
    }
};
