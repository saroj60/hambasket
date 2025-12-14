import Product from "../models/product.js";
import Notification from "../models/notification.js";
import User from "../models/user.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { search, category, subCategory, brand, minPrice, maxPrice, dietary, store } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (subCategory) query.subCategory = subCategory;
    if (brand) query.brand = brand;
    if (store) query.store = store;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (dietary) {
      const dietaryList = dietary.split(',');
      query.dietaryPreferences = { $in: dietaryList };
    }

    const products = await Product.find(query).populate("store", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new product
export const addProduct = async (req, res) => {
  try {
    const productData = req.body;

    // If user is a vendor, associate product with their store
    if (req.user && req.user.role === 'vendor') {
      const Store = (await import("../models/store.js")).default;
      const store = await Store.findOne({ owner: req.user._id });
      if (store) {
        productData.store = store._id;
      }
    }

    const newProduct = new Product(productData);
    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Check for Stock Update (Back in Stock)
    if (oldProduct && oldProduct.stock === 0 && updatedProduct.stock > 0) {
      // Find users subscribed to this product
      const users = await User.find({ subscribedProducts: updatedProduct._id });

      if (users.length > 0) {
        const notifications = users.map(u => ({
          user: u._id,
          type: "stock",
          message: `${updatedProduct.name} is back in stock! Hurry before it runs out.`,
          relatedId: updatedProduct._id
        }));

        await Notification.insertMany(notifications);

        // Optional: Clear subscriptions after notifying
        // await User.updateMany(
        //   { subscribedProducts: updatedProduct._id },
        //   { $pull: { subscribedProducts: updatedProduct._id } }
        // );
      }
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
