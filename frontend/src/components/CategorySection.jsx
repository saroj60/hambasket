import React, { useState, useEffect, useContext } from 'react';
import ProductCard from './ProductCard';
import { getProducts } from '../services/api';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CategorySection = ({ title, category }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProducts = async () => {
            // Fetch all products or filter by category if API supports it directly
            // Based on API signature: getProducts(query) -> /products?query
            // So we pass 'category=Candies%20%26%20Gums'
            try {
                const query = `category=${encodeURIComponent(category)}`;
                console.log('Fetching', category, query);
                const data = await getProducts(query);
                console.log('Got data for', category, data ? data.length : 'null');
                if (Array.isArray(data)) {
                    setProducts(data);
                }
            } catch (err) {
                console.error("Failed to load category products for", category, err);
            } finally {
                setLoading(false);
            }
        };

        if (category) {
            loadProducts();
        }
    }, [category]);

    if (loading || products.length === 0) return null;

    const handleSeeAll = () => {
        // Navigate to category page
        // Assuming /category/:categoryId route exists (verified in App.jsx)
        navigate(`/category/${encodeURIComponent(category)}`);
    };

    return (
        <div className="category-section" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937' }}>{title || category}</h2>
                <button
                    onClick={handleSeeAll}
                    style={{
                        color: '#0c831f',
                        fontWeight: '600',
                        fontSize: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    see all
                </button>
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    overflowX: 'auto',
                    paddingBottom: '1rem',
                    scrollbarWidth: 'none', /* Firefox */
                    msOverflowStyle: 'none',  /* IE 10+ */
                }}
                className="hide-scrollbar"
            >
                <style>
                    {`
                        .hide-scrollbar::-webkit-scrollbar { 
                            display: none; 
                        }
                    `}
                </style>
                {products.map(product => (
                    <div key={product._id} style={{ minWidth: '180px', maxWidth: '180px' }}>
                        <ProductCard
                            product={product}
                            onClick={() => { }} // Handle click if needed, maybe open details
                        // ProductCard handles add to cart internally via context, 
                        // but implementation in ProductCard.jsx uses onClick for the card itself.
                        // We should probably pass a do-nothing or open-details handler.
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySection;
