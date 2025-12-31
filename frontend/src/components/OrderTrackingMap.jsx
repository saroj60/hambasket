import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '0.5rem'
};

const OrderTrackingMap = ({ driverLocation, deliveryLocation }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script-tracking',
        googleMapsApiKey: VITE_GOOGLE_MAPS_API_KEY
    });

    if (!isLoaded) return <div style={{ height: '300px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>;
    if (!driverLocation || !deliveryLocation) return <div style={{ height: '300px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Waiting for location data...</div>;

    const center = {
        lat: (driverLocation.lat + deliveryLocation.lat) / 2,
        lng: (driverLocation.lng + deliveryLocation.lng) / 2
    };

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
            }}
        >
            <Marker
                position={driverLocation}
                title="Driver"
                label="🚗"
            />
            <Marker
                position={deliveryLocation}
                title="Delivery Location"
                label="📍"
            />
        </GoogleMap>
    );
};

export default OrderTrackingMap;
