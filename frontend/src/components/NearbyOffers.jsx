import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { API_URL } from '../config';

const NearbyOffers = () => {
    const { location } = useLocation();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location?.coordinates) {
            fetchOffers(location.coordinates);
        }
    }, [location]);

    const fetchOffers = async (coords) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/offers/nearby?lat=${coords.lat}&lng=${coords.lng}`);
            const data = await res.json();
            if (res.ok) {
                setOffers(data);
            }
        } catch (error) {
            console.error("Error fetching offers:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!location?.coordinates || offers.length === 0) return null;

    return (
        <div className="container" style={{ margin: '2rem auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📍 Offers Near You
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {offers.map(offer => (
                    <div key={offer._id} className="card animate-fade-in" style={{ padding: '1.5rem', border: '1px solid #fcd34d', backgroundColor: '#fffbeb', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', transform: 'rotate(15deg)', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {offer.discountPercentage}% OFF
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#b45309' }}>{offer.title}</h3>
                        <p style={{ color: '#92400e', marginBottom: '1rem' }}>{offer.description}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px dashed #f59e0b' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Code:</span>
                            <span style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '1px', color: '#d97706' }}>{offer.discountCode}</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(offer.discountCode);
                                    alert("Code copied!");
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.9rem' }}
                            >
                                Copy
                            </button>
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#b45309', textAlign: 'right' }}>
                            Expires: {new Date(offer.expiry).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NearbyOffers;
