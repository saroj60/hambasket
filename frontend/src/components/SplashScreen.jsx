import React, { useState, useEffect, useRef } from 'react';
import '../styles/splash.css';

const GROCERY_ITEMS = [
    { id: 1, emoji: '🍎', name: 'Apple' },
    { id: 2, emoji: '🍌', name: 'Banana' },
    { id: 3, emoji: '🥕', name: 'Carrot' },
    { id: 4, emoji: '🥦', name: 'Broccoli' },
    { id: 5, emoji: '🥑', name: 'Avocado' },
    { id: 6, emoji: '🌽', name: 'Corn' },
    { id: 7, emoji: '🍅', name: 'Tomato' },
    { id: 8, emoji: '🍆', name: 'Eggplant' },
    { id: 9, emoji: '🍇', name: 'Grapes' },
    { id: 10, emoji: '🍞', name: 'Bread' },
    { id: 11, emoji: '🥛', name: 'Milk' },
    { id: 12, emoji: '🥚', name: 'Egg' },
];

const SplashScreen = ({ onComplete }) => {
    const [items, setItems] = useState([]);
    const [score, setScore] = useState(0);
    const [isBasketBouncing, setIsBasketBouncing] = useState(false);
    const [progress, setProgress] = useState(0);
    const basketRef = useRef(null);

    // Initialize Items with random positions
    useEffect(() => {
        // Pick 8-10 random items
        const shuffled = [...GROCERY_ITEMS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10).map((item, index) => ({
            ...item,
            x: Math.random() * 80 + 10, // 10% to 90% width
            y: Math.random() * 50 + 10, // 10% to 60% height
            delay: Math.random() * 2,
            isCollected: false,
            rotation: Math.random() * 30 - 15
        }));
        setItems(selected);
    }, []);

    // Auto-progress timer (Fallback ensures app loads)
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(onComplete, 500); // Small delay after 100%
                    return 100;
                }
                return prev + 1; // Slow auto-fill
            });
        }, 60); // ~6 seconds total

        return () => clearInterval(timer);
    }, [onComplete]);

    const handleCollect = (id, e) => {
        e.stopPropagation(); // Prevent multiple touches

        // Find basket position
        const basket = basketRef.current;
        if (!basket) return;

        const basketRect = basket.getBoundingClientRect();
        // Calculate target coordinates relative to screen, simplified for CSS translate
        // Actually, we'll just use a class state trigger for "fly" logic or direct DOM manipulation if keyframes get complex.
        // For React simplicity, we'll mark as collected and use CSS to move it.

        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, isCollected: true };
            }
            return item;
        }));

        setScore(prev => prev + 1);
        setProgress(prev => Math.min(prev + 10, 100)); // Bonus progress

        // Bounce Basket
        setIsBasketBouncing(true);
        setTimeout(() => setIsBasketBouncing(false), 400);

        // Haptic Feedback (if available in capacitor, optional)
        if (navigator.vibrate) navigator.vibrate(50);
    };

    return (
        <div className="splash-container">
            <div className="splash-bg-pattern"></div>

            <div className="instruction-text">
                Tap to Pack! 🛒
            </div>

            {/* Flying Items */}
            {items.map(item => (
                <div
                    key={item.id}
                    className={`grocery-item ${!item.isCollected ? 'animate-float' : ''}`}
                    style={{
                        left: item.isCollected ? '50%' : `${item.x}%`,
                        top: item.isCollected ? '85%' : `${item.y}%`,
                        transform: item.isCollected
                            ? 'translate(-50%, 0) scale(0.2)'
                            : `rotate(${item.rotation}deg) scale(1)`,
                        opacity: item.isCollected ? 0 : 1,
                        transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        animationDelay: `${item.delay}s`
                    }}
                    onPointerDown={(e) => !item.isCollected && handleCollect(item.id, e)}
                >
                    {item.emoji}
                </div>
            ))}

            {/* Basket */}
            <div className="basket-container" ref={basketRef}>
                <div className={`basket-emoji ${isBasketBouncing ? 'basket-bounce' : ''}`}>
                    🧺
                </div>
                {/* Score Bubble */}
                {score > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '10px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        border: '2px solid white'
                    }}>
                        {score}
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="loading-bar-container">
                <div className="loading-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div style={{ position: 'absolute', bottom: '10px', fontSize: '0.8rem', color: '#065f46', opacity: 0.8 }}>
                Loading fresh items...
            </div>
        </div>
    );
};

export default SplashScreen;
