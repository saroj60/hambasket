

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
    width: '100%',
    height: '100%'
};

const libraries = ['places'];

const MapAddressSelector = ({ onConfirm, onCancel, initialLocation }) => {
    const { user } = useAuth();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    const defaultCenter = useMemo(() => {
        return initialLocation || { lat: 27.7172, lng: 85.3240 };
    }, [initialLocation]);

    const [map, setMap] = useState(null);
    const [center, setCenter] = useState(defaultCenter);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('map'); // 'map' or 'details'

    // Form States
    const [receiverName, setReceiverName] = useState(user?.name || '');
    const [receiverPhone, setReceiverPhone] = useState(user?.phone || '');
    const [landmark, setLandmark] = useState('');
    const [label, setLabel] = useState('Home'); // Home, Work, Other
    const [customLabel, setCustomLabel] = useState('');

    const autocompleteRef = useRef(null);
    const mapRef = useRef(null);
    const timerRef = useRef(null); // For debouncing

    // Fetch address when map stops moving (Debounced)
    const onIdle = useCallback(() => {
        if (map && step === 'map') {
            const newCenter = map.getCenter();
            const lat = newCenter.lat();
            const lng = newCenter.lng();
            setCenter({ lat, lng });

            // Debounce fetch
            if (timerRef.current) clearTimeout(timerRef.current);
            setLoading(true);

            timerRef.current = setTimeout(() => {
                fetchAddress(lat, lng);
            }, 800); // 800ms delay to ensure user stopped panning
        }
    }, [map, step]);

    const fetchAddress = async (lat, lng) => {
        if (!window.google || !window.google.maps) {
            setAddress("Map API not loaded");
            setLoading(false);
            return;
        }

        try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    // Filter out Plus Codes if a better address exists
                    // Plus codes usually have type 'plus_code' or contain a '+' in the short name/address
                    const bestResult = results.find(r =>
                        !r.types.includes('plus_code') &&
                        !r.formatted_address.match(/^[A-Z0-9]{4}\+[A-Z0-9]{2,}/) // Regex to avoid basic plus codes
                    );

                    if (bestResult) {
                        setAddress(bestResult.formatted_address);
                    } else {
                        // Fallback to first result if only plus code exists, but maybe strip the code?
                        // Usually results[0] is best, so we default to it if no better option.
                        setAddress(results[0].formatted_address);
                    }
                } else {
                    setAddress(`Location not found`);
                }
                setLoading(false);
            });
        } catch (error) {
            setAddress(`Error: ${error.message}`);
            setLoading(false);
        }
    };

    const onLoad = useCallback(function callback(map) {
        setMap(map);
        mapRef.current = map;
        // Trigger resize to prevent gray map
        setTimeout(() => {
            window.google.maps.event.trigger(map, 'resize');
            if (defaultCenter) {
                map.panTo(defaultCenter);
            }
        }, 200);
    }, [defaultCenter]);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
        mapRef.current = null;
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
                    map.setZoom(19); // High precision zoom
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
                pos = { lat: updatedPosition.coords.latitude, lng: updatedPosition.coords.longitude };
            } else if (navigator.geolocation) {
                await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                            resolve();
                        },
                        (err) => reject(err),
                        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                    );
                });
            } else {
                throw new Error("Geolocation not supported");
            }

            if (map && pos) {
                map.panTo(pos);
                map.setZoom(19); // High precision zoom
            }
        } catch (error) {
            alert("Could not detect location. Please ensure GPS is enabled.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmLocation = () => {
        setStep('details');
        // Check if mapRef is available and resize
        if (mapRef.current) {
            // Slight timeout to allow transition
            setTimeout(() => {
                window.google.maps.event.trigger(mapRef.current, 'resize');
                mapRef.current.panTo(center);
            }, 300);
        }
    };

    const handleSaveAddress = async () => {
        if (!receiverName || !receiverPhone) {
            alert("Please enter Name and Phone Number");
            return;
        }

        setLoading(true);
        const finalLabel = label === 'Other' ? customLabel : label;
        // Construct full address string for display/older compatibility if needed
        // But mainly we send structured data now
        const displayAddress = `${landmark ? landmark + ', ' : ''}${address}`;

        const fullAddressData = {
            address: displayAddress,
            coordinates: center,
            label: finalLabel,
            receiverName,
            receiverPhone,
            isDefault: false
        };

        // If user is logged in, save to backend
        if (user) {
            try {
                await fetch(`${API_URL}/users/address`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        label: finalLabel,
                        address: displayAddress,
                        coordinates: center,
                        receiverName,
                        receiverPhone
                    })
                });
            } catch (error) {
                console.error("Failed to save address to backend", error);
            }
        }

        onConfirm(fullAddressData);
        setLoading(false);
    };

    if (!isLoaded) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Maps...</div>;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', // Align bottom used for mobile sheet feel
        }}>
            {/* Main Card */}
            <div className="card" style={{
                width: '100%', maxWidth: '600px',
                height: step === 'map' ? '90vh' : 'auto', // Adjust height based on step
                maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                padding: 0, overflow: 'hidden', position: 'relative',
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                borderTopLeftRadius: '16px', borderTopRightRadius: '16px',
                transition: 'height 0.3s ease'
            }}>

                {/* Map Section */}
                <div style={{
                    flex: step === 'map' ? 1 : 'none',
                    height: step === 'map' ? 'auto' : '150px',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                }}>
                    {/* Search Bar (Only visible in Map step) */}
                    {step === 'map' && (
                        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1001 }}>
                            <Autocomplete
                                onLoad={autocomplete => autocompleteRef.current = autocomplete}
                                onPlaceChanged={onPlaceChanged}
                            >
                                <input
                                    type="text"
                                    placeholder="Search for area, street name..."
                                    style={{
                                        width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
                                        border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </Autocomplete>
                        </div>
                    )}

                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        defaultCenter={defaultCenter}
                        zoom={17}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        onIdle={onIdle}
                        options={{
                            disableDefaultUI: true, // Clean look
                            zoomControl: false,
                            gestureHandling: step === 'map' ? 'greedy' : 'none', // Disable interaction in details step
                        }}
                    />

                    {/* Fixed Center Pin (Only in Map Step or Static in Details) */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -100%)', zIndex: 1000,
                        pointerEvents: 'none', marginTop: '-10px'
                    }}>
                        <img src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png" alt="pin" style={{ height: '40px' }} />
                    </div>

                    {/* Locate Me (Only in Map step) */}
                    {step === 'map' && (
                        <button
                            onClick={handleLocateMe}
                            style={{
                                position: 'absolute', bottom: '20px', right: '20px',
                                backgroundColor: 'white', border: 'none', borderRadius: '50%',
                                width: '45px', height: '45px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                cursor: 'pointer', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <svg viewBox="0 0 24 24" height="24" width="24" fill="#666">
                                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7-7 7z" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Details / Action Section */}
                <div style={{
                    padding: '1.5rem', backgroundColor: 'white',
                    borderTopLeftRadius: step === 'map' ? '16px' : '0',
                    borderTopRightRadius: step === 'map' ? '16px' : '0',
                    zIndex: 1002,
                    boxShadow: '0 -4px 10px rgba(0,0,0,0.05)'
                }}>

                    {/* Address Header */}
                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ marginTop: '4px' }}>📍</div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>
                                {step === 'map' ? 'Select Location' : 'Confirm Address Details'}
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.4' }}>
                                {loading ? 'Fetching address...' : address}
                            </p>
                        </div>
                        {step === 'details' && (
                            <button
                                onClick={() => setStep('map')}
                                style={{
                                    marginLeft: 'auto', color: 'var(--primary)',
                                    background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                CHANGE
                            </button>
                        )}
                    </div>

                    {step === 'map' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                onClick={handleConfirmLocation}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                                disabled={loading || !address || address.startsWith('Error')}
                            >
                                Confirm Location
                            </button>
                            <button
                                onClick={onCancel}
                                className='btn'
                                style={{ width: '100%', background: '#f3f4f6', color: '#374151' }}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        /* Address Form */
                        <div className="location-form-details" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Receiver Name"
                                    value={receiverName}
                                    onChange={(e) => setReceiverName(e.target.value)}
                                    style={{
                                        padding: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb',
                                        fontSize: '0.95rem', outline: 'none'
                                    }}
                                />
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={receiverPhone}
                                    onChange={(e) => setReceiverPhone(e.target.value)}
                                    style={{
                                        padding: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb',
                                        fontSize: '0.95rem', outline: 'none'
                                    }}
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Nearby Landmark (Optional)"
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                                style={{
                                    padding: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb',
                                    fontSize: '0.95rem', outline: 'none'
                                }}
                            />

                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>SAVE AS</p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['Home', 'Work', 'Other'].map(l => (
                                        <button
                                            key={l}
                                            onClick={() => setLabel(l)}
                                            style={{
                                                padding: '0.5rem 1rem', borderRadius: '20px',
                                                border: label === l ? '1px solid var(--primary)' : '1px solid #e5e7eb',
                                                backgroundColor: label === l ? '#f3e8ff' : 'white',
                                                color: label === l ? 'var(--primary)' : '#6b7280',
                                                fontWeight: label === l ? '600' : '500',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'
                                            }}
                                        >
                                            {l === 'Home' && '🏠'} {l === 'Work' && '🏢'} {l === 'Other' && '📍'} {l}
                                        </button>
                                    ))}
                                </div>
                                {label === 'Other' && (
                                    <input
                                        type="text"
                                        placeholder="e.g. Friend's House"
                                        value={customLabel}
                                        onChange={(e) => setCustomLabel(e.target.value)}
                                        style={{
                                            marginTop: '0.5rem', width: '100%',
                                            padding: '0.8rem', borderRadius: '8px', border: '1px solid #e5e7eb',
                                            fontSize: '0.95rem', outline: 'none'
                                        }}
                                    />
                                )}
                            </div>

                            <button
                                onClick={handleSaveAddress}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '0.5rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Saving details...' : 'Save details'}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MapAddressSelector;


