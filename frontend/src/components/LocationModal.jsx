import React, { useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { useLocation } from '../context/LocationContext';

const LocationModal = () => {
    const { isModalOpen, closeModal, openMap } = useLocation();
    const [manualAddress, setManualAddress] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isModalOpen) return null;

    const handleDetectLocation = async () => {
        // Check for insecure origin (HTTP) on non-localhost
        if (window.location.protocol === 'http:' &&
            window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1') {
            alert("Browser Restriction: Location detection requires HTTPS. Please use the installed Native App to test this feature.");
            return;
        }

        setLoading(true);
        try {
            const coordinates = await Geolocation.getCurrentPosition();
            const { latitude, longitude } = coordinates.coords;
            openMap({ lat: latitude, lng: longitude });
        } catch (error) {
            console.error("Geolocation error:", error);
            alert("Unable to retrieve your location. Please ensure location services are enabled.");
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualAddress.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&countrycodes=np`);
            const data = await res.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                openMap({ lat: parseFloat(lat), lng: parseFloat(lon) });
            } else {
                alert("Location not found. Please try a different search term.");
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Failed to search location.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }} onClick={closeModal}>
            <div style={{
                backgroundColor: 'white', padding: '2rem', borderRadius: '1rem',
                width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>Choose Delivery Location</h2>
                    <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={handleDetectLocation}
                        disabled={loading}
                        style={{
                            padding: '1rem', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
                            cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem', fontWeight: '500',
                            color: 'var(--primary)'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>📍</span>
                        {loading ? 'Detecting...' : 'Detect my current location'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                        <span>OR</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                    </div>

                    <form onSubmit={handleManualSubmit} className="location-form">
                        <input
                            type="text"
                            placeholder="Enter pincode or city..."
                            value={manualAddress}
                            onChange={(e) => setManualAddress(e.target.value)}
                            style={{
                                flex: 1, padding: '0.75rem', borderRadius: '0.5rem',
                                border: '1px solid #d1d5db', fontSize: '1rem'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white',
                                border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            Update
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default LocationModal;
