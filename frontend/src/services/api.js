// frontend/src/services/api.js
import { API_URL } from '../config';

// Fetch products
export const fetchProducts = async () => {
  const res = await fetch(`${API_URL}/products`);
  return res.json();
};

// Cart API
export const getCartItems = async () => {
  const res = await fetch(`${API_URL}/cart`);
  return res.json();
};

export const addToCart = async ({ productId, name, price, image, qty }) => {
  const res = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, name, price, image, qty })
  });
  return res.json();
};

export const removeFromCart = async (productId) => {
  const res = await fetch(`${API_URL}/cart/${productId}`, {
    method: 'DELETE'
  });
  return res.json();
};
