import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const { user } = useAuth();

    // Fetch products from API on load
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.category && filters.category !== 'All') params.append('category', filters.category);
            if (filters.subCategory) params.append('subCategory', filters.subCategory);
            if (filters.brand) params.append('brand', filters.brand);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.dietary && filters.dietary.length > 0) params.append('dietary', filters.dietary.join(','));

            const url = `${API_URL}/products?${params.toString()}`;
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                console.error("API returned non-array for products:", data);
                setProducts([]);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            setProducts([]);
        }
    };

    const addProduct = async (product) => {
        try {
            let token = user?.token;
            if (!token) {
                try {
                    const stored = localStorage.getItem('user');
                    if (stored) token = JSON.parse(stored)?.token;
                } catch (e) { console.error("Error parsing stored user", e); }
            }

            const isFormData = product instanceof FormData;
            const headers = { 'Authorization': `Bearer ${token}` };
            if (!isFormData) {
                headers['Content-Type'] = 'application/json';
            }

            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: headers,
                body: isFormData ? product : JSON.stringify(product),
                credentials: 'include' // Send cookies
            });
            if (!res.ok) throw new Error('Failed to add product');
            const newProduct = await res.json();
            setProducts(prev => [...prev, newProduct]);
        } catch (err) {
            console.error("Error adding product:", err);
            alert("Failed to add product: " + err.message);
        }
    };

    const updateProduct = async (id, updatedProduct) => {
        try {
            let token = user?.token;
            if (!token) {
                try {
                    const stored = localStorage.getItem('user');
                    if (stored) token = JSON.parse(stored)?.token;
                } catch (e) { console.error("Error parsing stored user", e); }
            }

            const isFormData = updatedProduct instanceof FormData;
            const headers = { 'Authorization': `Bearer ${token}` };
            if (!isFormData) {
                headers['Content-Type'] = 'application/json';
            }

            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: headers,
                body: isFormData ? updatedProduct : JSON.stringify(updatedProduct),
                credentials: 'include' // Send cookies
            });
            if (!res.ok) throw new Error('Failed to update product');
            const data = await res.json();
            setProducts(prev => prev.map(p => p._id === id ? data : p));
        } catch (err) {
            console.error("Error updating product:", err);
            alert("Failed to update product: " + err.message);
        }
    };

    const deleteProduct = async (id) => {
        try {
            let token = user?.token;
            // ... (token logic is redundant if using cookies, but harmless)
            if (!token) {
                try {
                    const stored = localStorage.getItem('user');
                    if (stored) token = JSON.parse(stored)?.token;
                } catch (e) { console.error("Error parsing stored user", e); }
            }
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include' // Send cookies
            });
            if (!res.ok) throw new Error('Failed to delete product');
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, fetchProducts }}>
            {children}
        </ProductContext.Provider>
    );
};
