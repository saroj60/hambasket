import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const CategoryProducts = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { products, fetchProducts } = useProducts();
    const { addToCart } = useContext(CartContext);
    const [categoryProducts, setCategoryProducts] = useState([]);

    useEffect(() => {
        // Fetch if needed, or just filter existing
        if (products.length === 0) {
            fetchProducts();
        }
    }, [fetchProducts, products.length]);

    useEffect(() => {
        if (categoryId) {
            // Decode URL param if needed (though usually auto-decoded)
            const decodedCategory = decodeURIComponent(categoryId);

            // Filter logic - simple case-insensitive match or "All"
            const filtered = products.filter(p =>
                p.category?.toLowerCase() === decodedCategory.toLowerCase() ||
                decodedCategory.toLowerCase() === 'all'
            );
            setCategoryProducts(filtered);
        }
    }, [categoryId, products]);

    return (
        <div className="container" style={{ paddingBottom: '80px', paddingTop: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                >
                    ←
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', textTransform: 'capitalize' }}>
                    {decodeURIComponent(categoryId)}
                </h1>
            </div>

            {/* Product Grid */}
            {categoryProducts.length > 0 ? (
                <div className="grid grid-cols-4">
                    {categoryProducts.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onClick={(p) => console.log('Clicked', p)}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <p>No products found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryProducts;
