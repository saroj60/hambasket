import React, { useState, useEffect, useContext } from 'react';
import ProductCard from './ProductCard';
import { getProducts } from '../services/api';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CategorySection = ({ title, category, onProductClick }) => {
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
        <div className="category-section" style={{ marginBottom: '2rem', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1f2937' }}>{title || category}</h2>
            </div>

            <style>
                {`
                    .category-grid-layout {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 0.75rem;
                        width: 100%;
                    }
                    /* On very small screens, maybe 2 columns? */
                    @media (max-width: 380px) {
                        .category-grid-layout {
                            grid-template-columns: repeat(2, 1fr);
                        }
                    }
                    @media (min-width: 1024px) {
                        .category-grid-layout {
                            grid-template-columns: repeat(6, 1fr);
                        }
                    }
                `}
            </style>

            <div className="category-grid-layout">
                {products.slice(0, 6).map(product => (
                    <div key={product._id} style={{ width: '100%' }}>
                        <ProductCard
                            product={product}
                            onClick={() => onProductClick ? onProductClick(product) : navigate(`/category/${encodeURIComponent(category)}`)}
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={handleSeeAll}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginTop: '1rem',
                    backgroundColor: '#f3f4f6',
                    color: '#0c831f',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                }}
            >
                See All &#10095;
            </button>
        </div>
    );
};

export default CategorySection;
