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

export const createProduct = async (formData) => {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  return res.json();
};

// Occasion API
export const getActiveOccasions = async () => {
  const res = await fetch(`${API_URL}/occasions`);
  return res.json();
};

export const getAllOccasions = async () => {
  const res = await fetch(`${API_URL}/occasions?admin=true`, {
    credentials: 'include'
  });
  return res.json();
};

export const createOccasion = async (formData) => {
  const res = await fetch(`${API_URL}/occasions`, {
    method: 'POST',
    body: formData, // FormData for file upload
    credentials: 'include'
  });
  return res.json();
};

export const updateOccasion = async (id, formData) => {
  const res = await fetch(`${API_URL}/occasions/${id}`, {
    method: 'PUT',
    body: formData,
    credentials: 'include'
  });
  return res.json();
};

export const deleteOccasion = async (id) => {
  const res = await fetch(`${API_URL}/occasions/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return res.json();
};
// Category API
export const getAllCategories = async (admin = false) => {
  const url = admin ? `${API_URL}/categories/admin` : `${API_URL}/categories`;
  const res = await fetch(url, { credentials: 'include' });
  return res.json();
};

export const createCategory = async (formData) => {
  const res = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  return res.json();
};

export const updateCategory = async (id, formData) => {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    body: formData,
    credentials: 'include'
  });
  return res.json();
};

export const deleteCategory = async (id) => {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return res.json();
};

export const addSubCategory = async (id, data) => {
  const res = await fetch(`${API_URL}/categories/${id}/subcategory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
  return res.json();
};

export const removeSubCategory = async (id, subName) => {
  const res = await fetch(`${API_URL}/categories/${id}/subcategory/${encodeURIComponent(subName)}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return res.json();
};

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
