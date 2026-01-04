import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
    width: '100%',
    height: '100%'
};

const libraries = ['places'];

const MapAddressSelector = ({ onConfirm, onCancel, initialLocation }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    // Stabilize defaultCenter to prevent map resets on re-renders
    const defaultCenter = useMemo(() => {
        return initialLocation || { lat: 27.7172, lng: 85.3240 };
    }, [initialLocation]);

    const [map, setMap] = useState(null);
    // We strictly use internal center state to track where the user has moved the map,
    // but we DO NOT pass this back to the GoogleMap 'center' prop to avoid fighting with the map's internal state.
    const [center, setCenter] = useState(defaultCenter);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const autocompleteRef = useRef(null);
    // Ref to track if we are programmatically moving the map to avoid loops
    const isProgrammaticMove = useRef(false);

    // Fetch address when map stops moving
    const onIdle = useCallback(() => {
        if (map) {
            const newCenter = map.getCenter();
            const lat = newCenter.lat();
            const lng = newCenter.lng();

            // Update internal state without forcing a map re-center via props
            setCenter({ lat, lng });
            fetchAddress(lat, lng);
        }
    }, [map]);

    const fetchAddress = async (lat, lng) => {
        setLoading(true);
        try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    setAddress(results[0].formatted_address);
                } else {
                    console.error("Geocoding failed: " + status);
                    setAddress(`Error: ${status}`);
                }
                setLoading(false);
            });
        } catch (error) {
            console.error("Geocoding error:", error);
            setAddress(`Error: ${error.message}`);
            setLoading(false);
        }
    };

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const newPos = { lat, lng };

                if (map) {
                    map.panTo(newPos);
                    map.setZoom(17);
                }
            }
        }
    };

    const handleLocateMe = async () => {
        setLoading(true);
        try {
            let pos;
            if (Capacitor.isNativePlatform()) {
                const updatedPosition = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 10000
                });
                pos = {
                    lat: updatedPosition.coords.latitude,
                    lng: updatedPosition.coords.longitude
                };
            } else if (navigator.geolocation) {
                // Fallback for web
                await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            };
                            resolve();
                        },
                        (err) => reject(err),
                        { timeout: 10000 }
                    );
                });
            } else {
                throw new Error("Geolocation not supported");
            }

            if (map && pos) {
                map.panTo(pos);
                map.setZoom(17);
            }
        } catch (error) {
            console.error("Locate me error:", error);
            alert("Could not detect location. Please ensure GPS is enabled.");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Maps...</div>;

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

                    <Autocomplete
                        onLoad={autocomplete => autocompleteRef.current = autocomplete}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <input
                            type="text"
                            placeholder="Search for a place..."
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        />
                    </Autocomplete>
                </div>

                {/* Map */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', padding: 5, fontSize: 10 }}>
                        {loading ? 'Fetching address...' : ''} {address && address.substring(0, 30)}...
                    </div>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={defaultCenter}
                        zoom={16}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        onIdle={onIdle}
                        options={{
                            disableDefaultUI: false,
                            zoomControl: true,
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: false,
                        }}
                    >
                    </GoogleMap>

                    {/* Fixed Center Pin */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -100%)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        fontSize: '3rem',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                        marginTop: '-10px'
                    }}>
                        📍
                    </div>

                    {/* Locate Me Button */}
                    <button
                        onClick={handleLocateMe}
                        style={{
                            position: 'absolute', bottom: '130px', right: '10px',
                            backgroundColor: 'white', border: 'none', borderRadius: '2px',
                            width: '40px', height: '40px', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 4px -1px',
                            cursor: 'pointer', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem'
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
                            disabled={loading || !address || address.startsWith('Error')}
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
