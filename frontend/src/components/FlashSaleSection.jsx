import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const FlashSaleSection = ({ products, onAdd, onClick }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [activeSaleProducts, setActiveSaleProducts] = useState([]);

    useEffect(() => {
        // Filter active flash sale products
        const now = new Date();
        const saleProducts = products.filter(p =>
            p.flashSale?.active && new Date(p.flashSale.endTime) > now
        );
        setActiveSaleProducts(saleProducts);

        if (saleProducts.length > 0) {
            // Find the earliest ending sale to show timer
            const earliestEndTime = saleProducts.reduce((min, p) => {
                const end = new Date(p.flashSale.endTime);
                return end < min ? end : min;
            }, new Date(saleProducts[0].flashSale.endTime));

            const timer = setInterval(() => {
                const now = new Date();
                const diff = earliestEndTime - now;

                if (diff <= 0) {
                    clearInterval(timer);
                    setTimeLeft('Ended');
                } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [products]);

    if (activeSaleProducts.length === 0) return null;

    return (
        <div className="flash-sale-section" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#b45309' }}>⚡ Flash Sale</h2>
                    <div style={{
                        backgroundColor: '#fee2e2', color: '#ef4444',
                        padding: '0.25rem 0.75rem', borderRadius: '999px',
                        fontWeight: '700', fontSize: '0.9rem'
                    }}>
                        Ends in: {timeLeft}
                    </div>
                </div>
                <button className="btn btn-outline" style={{ fontSize: '0.9rem' }}>View All</button>
            </div>

            <div className="grid grid-cols-4">
                {activeSaleProducts.map(product => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        onAdd={onAdd}
                        onClick={onClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default FlashSaleSection;
