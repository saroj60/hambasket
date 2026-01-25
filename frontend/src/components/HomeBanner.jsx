import React, { useState, useEffect } from 'react';

const BANNERS = [
    {
        id: 1,
        title: "Get",
        highlight: "20% OFF",
        subtitle: "Shop your daily essentials in low price",
        footer: "FREE DELIVERY on all orders!",
        gradient: "linear-gradient(135deg, #42e695 0%, #3bb2b8 100%)", // Green/Teal
        image: "/banners/bag.png",
        accentColor: "text-yellow-300",
        decor: {
            bg1: "bg-white",
            bg2: "bg-black",
            shape1: "bg-yellow-400",
            shape2: "bg-pink-400"
        }
    },
    {
        id: 2,
        title: "Quality",
        highlight: "Groceries",
        subtitle: "Rice, Dal, Oil & daily needs",
        footer: "FREE DELIVERY on all orders!",
        gradient: "linear-gradient(135deg, #84cc16 0%, #10b981 100%)", // Lime/Green
        image: "/banners/grocery.png",
        accentColor: "text-white",
        decor: {
            bg1: "bg-yellow-100",
            bg2: "bg-green-900",
            shape1: "bg-orange-400",
            shape2: "bg-lime-200"
        }
    },
    {
        id: 3,
        title: "Hot &",
        highlight: "Bakes",
        subtitle: "Best bakery items in town right now",
        footer: "FREE DELIVERY on all orders!",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)", // Orange/Amber
        image: "/banners/bakery.png",
        accentColor: "text-yellow-100",
        decor: {
            bg1: "bg-orange-100",
            bg2: "bg-red-900",
            shape1: "bg-yellow-200",
            shape2: "bg-amber-700"
        }
    },
    {
        id: 4,
        title: "Express",
        highlight: "Delivery",
        subtitle: "Delivery in minutes to your doorstep",
        footer: "FREE DELIVERY on all orders!",
        gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", // Indigo/Purple
        image: "/banners/delivery.png",
        accentColor: "text-cyan-300",
        decor: {
            bg1: "bg-blue-100",
            bg2: "bg-purple-900",
            shape1: "bg-pink-400",
            shape2: "bg-indigo-300"
        }
    }
];

const HomeBanner = ({ onShopNow }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-play
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
        }, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full overflow-hidden rounded-2xl shadow-xl my-4 group">
            {/* Inline Styles for Animations */}
            <style>
                {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .animate-float { animation: float 5s ease-in-out infinite; }
        `}
            </style>

            {/* Carousel Container */}
            <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {BANNERS.map((banner) => (
                    <div
                        key={banner.id}
                        className="min-w-full relative overflow-hidden h-full"
                        style={{ background: banner.gradient }}
                    >
                        {/* Decorative Background Elements */}
                        <div className={`absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full ${banner.decor.bg1} opacity-10 blur-3xl pointer-events-none`}></div>
                        <div className={`absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full ${banner.decor.bg2} opacity-10 blur-3xl pointer-events-none`}></div>

                        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-6 md:flex-row md:justify-between md:px-12 md:py-8 min-h-[180px] md:min-h-[220px]">
                            {/* Text Content */}
                            <div className="text-center md:text-left max-w-lg z-20">
                                <h2 className="mb-1 text-2xl font-black leading-tight text-white md:text-4xl lg:text-5xl drop-shadow-md">
                                    {banner.title} <span className={banner.accentColor}>{banner.highlight}</span>
                                </h2>
                                <div className="mb-4 text-sm font-medium text-white/90 md:text-lg leading-relaxed opacity-95">
                                    <p>{banner.subtitle}</p>
                                    <p className="mt-1 font-bold tracking-wide text-white text-xs md:text-sm uppercase bg-white/20 inline-block px-2 py-1 rounded-sm backdrop-blur-sm">{banner.footer}</p>
                                </div>
                            </div>

                            {/* Decorative 3D-style Elements */}
                            <div className="relative hidden md:block w-40 h-40 pointer-events-none">
                                <div className={`absolute top-0 right-8 w-12 h-12 rounded-xl transform rotate-12 shadow-xl animate-float opacity-90 border border-white/20 ${banner.decor.shape1}`}></div>
                                <div className="absolute bottom-8 right-0 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/30"></div>
                                <div className={`absolute top-16 left-0 w-10 h-10 rounded-lg transform -rotate-12 shadow-lg animate-float border border-white/20 ${banner.decor.shape2}`}></div>

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                        src={banner.image}
                                        alt={banner.title}
                                        className="w-48 h-48 object-contain drop-shadow-2xl animate-float"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                {BANNERS.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Arrow Nav (Optional - nice for desktop) */}
            <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full hidden md:flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                onClick={() => setCurrentSlide(prev => (prev === 0 ? BANNERS.length - 1 : prev - 1))}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full hidden md:flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                onClick={() => setCurrentSlide(prev => (prev + 1) % BANNERS.length)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        </div>
    );
};

export default HomeBanner;
