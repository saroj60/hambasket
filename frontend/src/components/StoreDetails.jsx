import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useParams } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useProducts } from '../context/ProductContext';

const StoreDetails = () => {
    const { id } = useParams();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useProducts();

    useEffect(() => {
        fetchStoreDetails();
    }, [id]);

    const fetchStoreDetails = async () => {
        try {
            const [storeRes, productsRes] = await Promise.all([
                fetch(`${API_URL}/stores/${id}`),
                fetch(`${API_URL}/products?store=${id}`)
            ]);

            if (storeRes.ok) {
                const storeData = await storeRes.json();
                setStore(storeData);
            }

            if (productsRes.ok) {
                const productsData = await productsRes.json();
                setProducts(productsData);
            }
        } catch (error) {
            console.error("Error fetching store details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Store...</div>;
    if (!store) return <div className="p-8 text-center">Store not found</div>;

    return (
        <div className="container py-8">
            {/* Store Header */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center text-4xl mb-4">
                    🏪
                </div>
                <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
                <p className="text-gray-600 max-w-2xl mx-auto mb-4">{store.description}</p>
                <div className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-600">
                    📍 {store.address}
                </div>
            </div>

            {/* Products Grid */}
            <h2 className="text-2xl font-bold mb-6">Products from {store.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        onAdd={addToCart}
                        onClick={() => { }}
                    />
                ))}
            </div>
        </div>
    );
};

export default StoreDetails;
