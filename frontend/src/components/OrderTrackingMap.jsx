import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const OrderTrackingMap = ({ driverLocation, deliveryLocation }) => {
    if (!driverLocation || !deliveryLocation) return <div style={{ height: '300px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>;

    const center = [
        (driverLocation.lat + deliveryLocation.lat) / 2,
        (driverLocation.lng + deliveryLocation.lng) / 2
    ];

    return (
        <MapContainer center={center} zoom={13} style={{ height: '300px', width: '100%', borderRadius: '0.5rem' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[driverLocation.lat, driverLocation.lng]}>
                <Popup>
                    Driver is here
                </Popup>
            </Marker>
            <Marker position={[deliveryLocation.lat, deliveryLocation.lng]}>
                <Popup>
                    Delivery Location
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default OrderTrackingMap;
