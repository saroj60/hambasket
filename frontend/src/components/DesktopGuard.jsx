import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DesktopGuard = ({ children }) => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsDesktop(width >= 1024);
        };

        window.addEventListener('resize', handleResize);

        // Initial check
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isDesktop) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <div className="mb-6 text-6xl">🖥️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Desktop Only</h2>
                <p className="text-gray-600 mb-6 max-w-sm">
                    The Admin Panel is optimized for desktop use. Please access this page from a larger screen (computer or laptop).
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    return children;
};

export default DesktopGuard;
