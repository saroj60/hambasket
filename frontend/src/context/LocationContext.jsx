import React, { createContext, useContext, useState, useEffect } from 'react';

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

    const updateLocation = (address, coordinates = null) => {
        setLocation({ address, coordinates });
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
