import React from 'react';
import { Link } from 'react-router-dom';

const HomeBanner = () => {
    return (
        <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl my-6" style={{ minHeight: '260px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {/* Inline Styles for Animations */}
            <style>
                {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
          .animate-float { animation: float 5s ease-in-out infinite; }
        `}
            </style>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-white opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-black opacity-10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center justify-between px-8 py-10 md:flex-row md:px-16 md:py-14 h-full">
                {/* Text Content */}
                <div className="mb-6 text-center md:mb-0 md:text-left max-w-lg">

                    <h2 className="mb-3 text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl drop-shadow-md">
                        Get <span className="text-yellow-300">20% OFF</span>
                    </h2>

                    <p className="mb-6 text-lg font-medium text-purple-50 md:text-xl leading-relaxed opacity-95">
                        Shop your daily essentials in low price <br className="hidden md:block" />
                        <span className="font-bold text-white tracking-wide">FREE DELIVERY</span> on all orders!
                    </p>

                    <Link
                        to="/categories"
                        className="inline-block rounded-full bg-yellow-400 px-10 py-3 text-lg font-bold text-gray-900 shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-yellow-300 hover:shadow-xl active:scale-95"
                    >
                        Shop Now
                    </Link>
                </div>

                {/* Decorative 3D-style Elements */}
                <div className="relative hidden md:block w-56 h-56">
                    <div className="absolute top-0 right-8 w-16 h-16 bg-yellow-400 rounded-2xl transform rotate-12 shadow-xl animate-float opacity-90 border border-white/20"></div>
                    <div className="absolute bottom-8 right-0 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/30"></div>
                    <div className="absolute top-16 left-0 w-12 h-12 bg-pink-400 rounded-lg transform -rotate-12 shadow-lg animate-float border border-white/20"></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-7xl filter drop-shadow-xl">🛍️</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeBanner;
