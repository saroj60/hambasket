import React, { useState, useEffect } from 'react';

const HeroSection = ({ onShopNow }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 1,
            title: "Fresh Vegetables & Fruits",
            subtitle: "Farm fresh at your doorstep in minutes",
            bg: "#E8F5E9",
            image: "https://cdn-icons-png.flaticon.com/512/2909/2909787.png", // Placeholder
            accent: "#4CAF50"
        },
        {
            id: 2,
            title: "Daily Essentials",
            subtitle: "Milk, Bread, Eggs & more in minutes!",
            bg: "#E3F2FD",
            image: "https://cdn-icons-png.flaticon.com/512/3082/3082060.png", // Placeholder
            accent: "#2196F3"
        },
        {
            id: 3,
            title: "Snacks & Munchies",
            subtitle: "Late night cravings? We got you covered.",
            bg: "#FFF3E0",
            image: "https://cdn-icons-png.flaticon.com/512/2553/2553691.png", // Placeholder
            accent: "#FF9800"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="container" style={{ marginTop: '1rem' }}>
            <div
                className="hero-banner"
                style={{
                    backgroundColor: slides[currentSlide].bg,
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background-color 0.5s ease',
                    minHeight: '200px' // Ensure minimum height
                }}
            >
                {/* Text Content */}
                <div style={{ flex: 1, zIndex: 2, padding: '2rem' }}>
                    <div
                        className="animate-fade-in"
                        key={currentSlide}
                    >
                        <span
                            style={{
                                display: 'inline-block',
                                padding: '0.5rem 1rem',
                                backgroundColor: 'white',
                                color: slides[currentSlide].accent,
                                borderRadius: 'var(--radius-full)',
                                fontWeight: '700',
                                fontSize: '0.875rem',
                                marginBottom: '1rem',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                        >
                            🚀 Delivery in Minutes
                        </span>
                        <h1
                            className="hero-title"
                            style={{
                                fontWeight: '800',
                                color: '#1F2937',
                                marginBottom: '0.5rem',
                                lineHeight: 1.1
                            }}
                        >
                            {slides[currentSlide].title}
                        </h1>
                        <p
                            className="hero-text"
                            style={{
                                color: '#4B5563',
                                marginBottom: '1.5rem',
                                maxWidth: '500px'
                            }}
                        >
                            {slides[currentSlide].subtitle}
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={onShopNow}
                            style={{
                                padding: '0.8rem 2rem',
                                fontSize: '1rem',
                                backgroundColor: slides[currentSlide].accent,
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            Shop Now
                        </button>
                    </div>
                </div>

                {/* Image Removed as per user request */}

                {/* Dots */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '1rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '0.5rem',
                        zIndex: 3
                    }}
                >
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: currentSlide === idx ? slides[currentSlide].accent : 'rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: currentSlide === idx ? 'scale(1.2)' : 'scale(1)'
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
