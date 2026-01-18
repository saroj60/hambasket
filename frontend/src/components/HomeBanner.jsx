import React from 'react';


const HomeBanner = ({ onShopNow }) => {
    return (
        <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl my-6 transition-all duration-300 hover:shadow-purple-500/20" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
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
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-black opacity-10 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8 md:flex-row md:justify-between md:px-16 md:py-16 md:min-h-[280px]">
                {/* Text Content */}
                <div className="text-center md:text-left max-w-lg z-20">

                    <h2 className="mb-2 text-3xl font-black leading-tight text-white md:text-5xl lg:text-6xl drop-shadow-md">
                        Get <span className="text-yellow-300">20% OFF</span>
                    </h2>

                    <div className="mb-6 text-base font-medium text-purple-50 md:text-xl leading-relaxed opacity-95">
                        <p>Shop your daily essentials in low price</p>
                        <p className="mt-1 font-bold text-white tracking-wide">FREE DELIVERY on all orders!</p>
                    </div>

                    <button
                        onClick={onShopNow}
                        className="inline-block rounded-full bg-yellow-400 px-8 py-3 text-lg font-bold text-gray-900 shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-yellow-300 hover:shadow-2xl active:scale-95 cursor-pointer"
                    >
                        Shop Now
                    </button>
                </div>

                {/* Decorative 3D-style Elements */}
                <div className="relative hidden md:block w-56 h-56 pointer-events-none">
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
