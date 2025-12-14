import React, { createContext, useContext, useEffect, useState } from 'react';
import { BASE_URL } from '../config';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        // Connect only if user is logged in (optional, but good for auth-based rooms)
        // For now, we connect everyone to receive public updates or specific order updates
        const newSocket = io(BASE_URL || 'http://localhost:5000', {
            withCredentials: true,
            autoConnect: true
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log("✅ Connected to WebSocket server");
        });

        newSocket.on('disconnect', () => {
            console.log("❌ Disconnected from WebSocket server");
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
