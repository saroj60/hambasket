import React, { createContext, useContext, useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(() => {
        try {
            const saved = localStorage.getItem('hb_location');
            return saved ? JSON.parse(saved) : { address: 'Kathmandu, Nepal', coordinates: null };
        } catch (e) {
            console.error("Failed to parse location", e);
            return { address: 'Kathmandu, Nepal', coordinates: null };
        }
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mapState, setMapState] = useState({ isOpen: false, initialCoordinates: null });

    useEffect(() => {
        localStorage.setItem('hb_location', JSON.stringify(location));
    }, [location]);

    // Auto-detect location on mount if not already set
    useEffect(() => {
        // Check if we are using the default fallback location (meaning no user selection yet)
        const isDefault = location.address === 'Kathmandu, Nepal' && location.coordinates === null;

        if (isDefault) {
            setIsModalOpen(true);
        }
    }, []);

    const detectCurrentLocation = async () => {
        try {
            let latitude, longitude;

            if (Capacitor.isNativePlatform()) {
                const position = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            } else if ('geolocation' in navigator) {
                await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            latitude = position.coords.latitude;
                            longitude = position.coords.longitude;
                            resolve();
                        },
                        (error) => reject(error),
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                    );
                });
            } else {
                return; // Geolocation not supported
            }

            if (latitude && longitude) {
                const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                if (API_KEY) {
                    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`);
                    const data = await response.json();
                    if (data.status === 'OK' && data.results[0]) {
                        const newLocation = {
                            address: data.results[0].formatted_address,
                            coordinates: { lat: latitude, lng: longitude }
                        };
                        setLocation(newLocation);
                    }
                } else {
                    // Fallback if no key (though key should be present)
                    updateLocation("Current Location (Address lookup unavailable)", { lat: latitude, lng: longitude });
                }
            }

        } catch (error) {
            console.log("Auto-location detection failed:", error.message);
            // Do nothing, keep default or previously saved
        }
    };

    const updateLocation = (address, coordinates = null, extraData = {}) => {
        setLocation({
            address,
            coordinates,
            ...extraData
        });
        setIsModalOpen(false);
        setMapState({ isOpen: false, initialCoordinates: null });
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const openMap = (coordinates = null) => {
        setIsModalOpen(false); // Close the prompt modal
        setMapState({ isOpen: true, initialCoordinates: coordinates });
    };
    const closeMap = () => setMapState({ isOpen: false, initialCoordinates: null });

    return (
        <LocationContext.Provider value={{ location, updateLocation, isModalOpen, openModal, closeModal, mapState, openMap, closeMap }}>
            {children}
        </LocationContext.Provider>
    );
};
