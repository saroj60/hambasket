import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { getSimilarProducts } from '../services/api';
import ProductCard from './ProductCard';

const ProductDetails = ({ product, onClose, onAdd, onProductSelect }) => {
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(product.variants && product.variants.length > 0 ? product.variants[0] : null);

    // Similar Products State
    const [similarProducts, setSimilarProducts] = useState([]);

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                const data = await getSimilarProducts(product._id || product.id);
                setSimilarProducts(data || []);
            } catch (err) {
                console.error("Failed to load similar products", err);
            }
        };
        if (product) fetchSimilar();
    }, [product]);

    // Subscription State
    const [isSubscription, setIsSubscription] = useState(false);
    const [frequency, setFrequency] = useState('weekly');
    const [address, setAddress] = useState(user?.address || '');

    if (!product) return null;

    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
    const currentWeight = selectedVariant ? selectedVariant.weight : `${product.weight} ${product.unit || ''}`;

    const handleAdd = () => {
        const itemToAdd = {
            ...product,
            price: currentPrice,
            weight: currentWeight,
            variant: selectedVariant,
            quantity
        };
        onAdd(itemToAdd);
        onClose();
    };

    const handleSubscribe = async () => {
        if (!user) {
            alert("Please login to subscribe (Regular Delivery)!");
            return;
        }
        if (!address.trim()) {
            alert("Please enter a delivery address for your subscription.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/subscriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    items: [{ product: product._id, quantity }],
                    frequency,
                    address
                })
            });

            if (res.ok) {
                alert("Subscription created successfully! 📅");
                onClose();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to create subscription");
            }
        } catch (error) {
            console.error("Subscription error:", error);
            alert("An error occurred. Please try again.");
        }
    };

    const isOutOfStock = currentStock <= 0;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center' // Mobile: align to bottom
        }}>
            <div className="modal-content animate-fade-in product-details-content" onClick={e => e.stopPropagation()} style={{
                backgroundColor: 'white',
                borderRadius: '24px 24px 0 0', // Rounded top only for mobile sheet look
                width: '100%',
                maxWidth: '600px',
                zIndex: 2001,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
                maxHeight: '85vh',
                overflowY: 'auto',
                position: 'relative' // relative for absolute close button
            }}>

                {/* Close Button (Absolute Top Right) */}
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#f3f4f6',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                }}>✕</button>

                {/* Image Section */}
                <div className="product-details-image" style={{ height: '250px', backgroundColor: '#fff', padding: '1rem' }}>
                    {product.image ? (
                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        product.emoji
                    )}
                </div>

                {/* Details Section */}
                <div className="product-details-info" style={{ padding: '1.5rem' }}>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: '1.2', color: '#1f2937', marginBottom: '0.25rem' }}>{product.name}</h2>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>{currentWeight}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1f2937' }}>
                            Rs. {currentPrice}
                        </div>
                        {product.oldPrice && (
                            <div style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.9rem' }}>Rs. {product.oldPrice}</div>
                        )}
                    </div>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        /* ... kept variant logic ... */
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>Select Unit</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {product.variants.map((variant, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedVariant(variant)}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '8px',
                                            border: '1px solid',
                                            borderColor: selectedVariant === variant ? '#0c831f' : '#e5e7eb',
                                            backgroundColor: selectedVariant === variant ? '#f0fdf4' : 'white',
                                            color: selectedVariant === variant ? '#0c831f' : '#374151',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {variant.weight} - Rs. {variant.price}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}


                    <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
                        {/* Quantity Counter */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #0c831f',
                            borderRadius: '8px',
                            backgroundColor: '#f0fdf4',
                            height: '48px',
                            overflow: 'hidden'
                        }}>
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                style={{ padding: '0 1rem', height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#0c831f', fontWeight: '700' }}
                            >-</button>
                            <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '700', color: '#0c831f' }}>{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                style={{ padding: '0 1rem', height: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#0c831f', fontWeight: '700' }}
                            >+</button>
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handleAdd}
                            style={{
                                flex: 1,
                                height: '48px',
                                backgroundColor: isOutOfStock ? '#f3f4f6' : '#0c831f',
                                color: isOutOfStock ? '#9ca3af' : 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isOutOfStock}
                        >
                            {isOutOfStock ? 'Out of Stock' : `Add Item - Rs. ${currentPrice * quantity}`}
                        </button>
                    </div>

                    {/* Similar Products */}
                    {similarProducts.length > 0 && (
                        <div style={{ marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>You Might Also Like</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: '1rem'
                            }}>
                                {similarProducts.map(similar => (
                                    <div key={similar._id} style={{ height: 'auto' }}>
                                        <ProductCard
                                            product={similar}
                                            onClick={onProductSelect || (() => { })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ProductDetails;
