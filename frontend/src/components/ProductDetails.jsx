import React, { useState } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const ProductDetails = ({ product, onClose, onAdd }) => {
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(product.variants && product.variants.length > 0 ? product.variants[0] : null);

    // Subscription State
    const [isSubscription, setIsSubscription] = useState(false);
    const [frequency, setFrequency] = useState('weekly');
    const [address, setAddress] = useState(user?.address || '');

    if (!product) return null;

    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
    const currentWeight = selectedVariant ? selectedVariant.weight : product.weight;

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
            alert("Please login to subscribe!");
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
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 105, backdropFilter: 'blur(2px)'
        }}>
            <div className="modal-content animate-fade-in product-details-content" onClick={e => e.stopPropagation()} style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                backgroundColor: 'white', borderRadius: 'var(--radius-lg)',
                width: '90%', maxWidth: '800px', zIndex: 106,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>

                {/* Image Section */}
                <div className="product-details-image">
                    {product.image ? (
                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        product.emoji
                    )}
                </div>

                {/* Details Section */}
                <div className="product-details-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {product.category}
                            </span>
                            <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0' }}>{product.name}</h2>
                            {product.brand && <span style={{ color: 'var(--text-light)' }}>Brand: {product.brand}</span>}
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)' }}>×</button>
                    </div>

                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '1rem' }}>
                        Rs. {currentPrice} <span style={{ fontSize: '1rem', color: 'var(--text-light)', fontWeight: '400' }}>/ {currentWeight}</span>
                    </div>

                    <p style={{ color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        {product.description || "Fresh and high-quality product sourced directly from local farmers and trusted suppliers."}
                    </p>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Select Size/Weight:</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {product.variants.map((variant, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedVariant(variant)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid',
                                            borderColor: selectedVariant === variant ? 'var(--primary)' : 'var(--border)',
                                            backgroundColor: selectedVariant === variant ? 'var(--primary)' : 'white',
                                            color: selectedVariant === variant ? 'white' : 'var(--text-main)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {variant.weight} - Rs. {variant.price}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dietary Info */}
                    {product.dietaryPreferences && product.dietaryPreferences.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {product.dietaryPreferences.map(tag => (
                                <span key={tag} style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '500' }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Subscription Option */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer', marginBottom: isSubscription ? '1rem' : '0' }}>
                            <input
                                type="checkbox"
                                checked={isSubscription}
                                onChange={(e) => setIsSubscription(e.target.checked)}
                                style={{ width: '1.2rem', height: '1.2rem' }}
                            />
                            Subscribe & Save (Regular Delivery)
                        </label>

                        {isSubscription && (
                            <div className="animate-fade-in">
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Frequency:</label>
                                    <select
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Delivery Address:</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Enter delivery address"
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                            >-</button>
                            <span style={{ padding: '0 1rem', fontWeight: '600' }}>{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                            >+</button>
                        </div>

                        {isSubscription ? (
                            <button
                                onClick={handleSubscribe}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', backgroundColor: '#0ea5e9' }}
                            >
                                Subscribe Now
                            </button>
                        ) : (
                            <button
                                onClick={handleAdd}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '1rem', fontSize: '1.1rem', opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                                disabled={isOutOfStock}
                            >
                                {isOutOfStock ? 'Out of Stock' : `Add to Cart - Rs. ${currentPrice * quantity}`}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
