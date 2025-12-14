// src/api.js
// src/api.js
import { API_URL } from '../config';

// Fetch Products (with fallback)
export const fetchProducts = async () => {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error("Backend not available");
    const data = await res.json();
    return { data };
  } catch (error) {
    console.warn("⚠️ Using dummy products:", error.message);
    return {
      data: [
        { _id: 1, name: "Apple", price: 10, description: "Fresh Apple", image: "https://via.placeholder.com/150?text=Apple" },
        { _id: 2, name: "Banana", price: 5, description: "Sweet Banana", image: "https://via.placeholder.com/150?text=Banana" },
      ],
    };
  }
};

// Add Product
export const addProduct = async (product) => {
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    return await res.json();
  } catch (error) {
    console.warn("⚠️ Product not saved to backend, dummy mode:", error.message);
    return { success: true, product };
  }
};

// Add To Cart
export const addToCart = async (id) => {
  try {
    const res = await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id }),
    });
    return await res.json();
  } catch (error) {
    console.warn("⚠️ Dummy add to cart:", error.message);
    return { success: true, id };
  }
};

// Get Cart (with fallback)
export const getCart = async () => {
  try {
    const res = await fetch(`${API_URL}/cart`);
    if (!res.ok) throw new Error("Backend not available");
    const data = await res.json();
    return { data };
  } catch (error) {
    console.warn("⚠️ Using dummy cart:", error.message);
    return {
      data: [
        { _id: 1, product: { name: "Apple" }, quantity: 2 },
        { _id: 2, product: { name: "Banana" }, quantity: 1 },
      ],
    };
  }
};

// Checkout Cart
export const checkoutCart = async () => {
  try {
    const res = await fetch(`${API_URL}/checkout`, { method: "POST" });
    return await res.json();
  } catch (error) {
    console.warn("⚠️ Dummy checkout:", error.message);
    return { success: true, message: "Checkout completed (dummy)" };
  }
};
