// frontend/src/services/api.js
import { API_URL } from '../config';

// Fetch products
export const getProducts = async (query = '') => {
  const url = query ? `${API_URL}/products?${query}` : `${API_URL}/products`;
  const res = await fetch(url);
  return res.json();
};

export const fetchProducts = getProducts; // Alias to keep compatibility if named differently elsewhere

export const getProductById = async (id) => {
  const res = await fetch(`${API_URL}/products/${id}`);
  return res.json();
};

export const getPopularProducts = async () => {
  const res = await fetch(`${API_URL}/products/popular`);
  return res.json();
};

export const getSimilarProducts = async (id) => {
  const res = await fetch(`${API_URL}/products/similar/${id}`);
  return res.json();
};

export const getTopPickedProducts = async () => {
  const res = await fetch(`${API_URL}/products/top-picks`);
  return res.json();
};

// Cart API
export const getCartItems = async () => {
  const res = await fetch(`${API_URL}/cart`, {
    credentials: 'include'
  });
  return res.json();
};

export const addToCart = async ({ productId, name, price, image, qty }) => {
  const res = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, name, price, image, qty }),
    credentials: 'include'
  });
  return res.json();
};

export const removeFromCart = async (productId) => {
  const res = await fetch(`${API_URL}/cart/${productId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return res.json();
};
