import Product from "../models/product.js";
import Notification from "../models/notification.js";
import User from "../models/user.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { search, category, subCategory, brand, minPrice, maxPrice, dietary, store } = req.query;
    let query = {};

    // Smart Search using text index
    if (search) {
      query.$text = { $search: search };
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
      // Handle both comma-separated string and array
      const dietaryList = Array.isArray(dietary) ? dietary : dietary.split(',');
      query.dietaryPreferences = { $in: dietaryList };
    }

    let products;
    if (search) {
      // If searching, sort by score
      products = await Product.find(query, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .populate("store", "name");
    } else {
      products = await Product.find(query).populate("store", "name");
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Popular Products (Top Selling)
export const getPopularProducts = async (req, res) => {
  try {
    // Aggregation to find most ordered products
    // Note: This assumes we have an Order model and it has items with product IDs
    const Order = (await import("../models/OrderModel.js")).default;

    const popular = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", count: { $sum: "$items.quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $replaceRoot: { newRoot: "$product" } }
    ]);

    // If no orders yet, return random products to keep it interesting
    if (!popular || popular.length === 0) {
      const defaultPopular = await Product.aggregate([{ $sample: { size: 10 } }]);
      return res.json(defaultPopular);
    }

    res.json(popular);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Similar Products
export const getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find products in same category/subCategory, excluding current product
    const similar = await Product.find({
      category: product.category,
      _id: { $ne: id }
    }).limit(6);

    res.json(similar);
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
