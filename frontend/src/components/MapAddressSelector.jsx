import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map movements and update center
const MapController = ({ onMoveEnd, initialCenter }) => {
    const map = useMap();
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (initialCenter && isFirstLoad.current) {
            map.setView(initialCenter, 16);
            isFirstLoad.current = false;
        }
    }, [initialCenter, map]);

    useMapEvents({
        moveend: () => {
            const center = map.getCenter();
            onMoveEnd(center);
        },
    });

    return null;
};

const MapAddressSelector = ({ onConfirm, onCancel, initialLocation }) => {
    // Default to Kathmandu if no initial location
    const defaultCenter = initialLocation || { lat: 27.7172, lng: 85.3240 };

    const [center, setCenter] = useState(defaultCenter);
    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Ref to access map instance for manual flying
    const mapRef = useRef(null);

    // Initial address fetch
    useEffect(() => {
        fetchAddress(center.lat, center.lng);
    }, []);

    const fetchAddress = async (lat, lng) => {
        setLoading(true);
        try {
            // Using OpenStreetMap Nominatim for Reverse Geocoding
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
                setAddress(data.display_name);
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            setAddress("Address not found");
        } finally {
            setLoading(false);
        }
    };

    const handleMapMoveEnd = (newCenter) => {
        setCenter(newCenter);
        fetchAddress(newCenter.lat, newCenter.lng);
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=np`);
            const data = await res.json();
            setSuggestions(data);
        } catch (error) {
            console.error("Error searching address:", error);
        }
    };

    const handleSelectSuggestion = (item) => {
        const newPos = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
        setCenter(newPos);
        setAddress(item.display_name);
        setSearchQuery(item.display_name);
        setSuggestions([]);

        // Fly to new location
        if (mapRef.current) {
            mapRef.current.setView(newPos, 16);
        }
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCenter(newPos);
                if (mapRef.current) {
                    mapRef.current.setView(newPos, 16);
                }
                // Address fetch will be triggered by moveend if map moves, 
                // but we can also trigger it manually to be sure
                fetchAddress(newPos.lat, newPos.lng);
            },
            (err) => {
                console.error("Geolocation error:", err);
                alert("Unable to retrieve your location.");
                setLoading(false);
            }
        );
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '600px', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', position: 'relative' }}>

                {/* Header / Search */}
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'white', zIndex: 1001 }}>
                    <h3 style={{ marginBottom: '0.5rem', fontWeight: '700' }}>Select Delivery Location</h3>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search for a place..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                        />
                        {suggestions.length > 0 && (
                            <ul style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                backgroundColor: 'white', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)', maxHeight: '200px', overflowY: 'auto',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', listStyle: 'none', padding: 0, margin: 0, zIndex: 2000
                            }}>
                                {suggestions.map((item, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => handleSelectSuggestion(item)}
                                        style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                                    >
                                        {item.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Map */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <MapContainer
                        center={center}
                        zoom={16}
                        style={{ height: '100%', width: '100%' }}
                        whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapController onMoveEnd={handleMapMoveEnd} initialCenter={initialLocation} />
                    </MapContainer>

                    {/* Fixed Center Pin */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -100%)', // Center the bottom tip of the pin
                        zIndex: 1000,
                        pointerEvents: 'none', // Allow clicks to pass through to map
                        fontSize: '3rem',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                        marginTop: '-10px' // Slight adjustment for visual center
                    }}>
                        📍
                    </div>

                    {/* "Move map" hint */}
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}>
                        Move map to adjust location
                    </div>

                    {/* Locate Me Button */}
                    <button
                        onClick={handleLocateMe}
                        style={{
                            position: 'absolute', bottom: '20px', right: '20px',
                            backgroundColor: 'white', border: 'none', borderRadius: '50%',
                            width: '50px', height: '50px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                            cursor: 'pointer', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}
                        title="Locate Me"
                    >
                        🎯
                    </button>
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', backgroundColor: 'white' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>SELECT DELIVERY LOCATION</p>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                            {loading ? 'Fetching address...' : address}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                        <button
                            onClick={() => onConfirm({ address, coordinates: center })}
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            disabled={loading || !address}
                        >
                            Confirm Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapAddressSelector;
