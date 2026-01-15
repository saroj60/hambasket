import React from 'react';
import { Link } from 'react-router-dom';

const HomeBanner = () => {
    return (
        <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-2xl my-6" style={{ minHeight: '300px', background: 'linear-gradient(to right, #7c3aed, #4f46e5)' }}>
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white opacity-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-white opacity-10 blur-2xl"></div>

            <div className="relative z-10 flex flex-col items-center justify-between px-6 py-10 md:flex-row md:px-12 md:py-16">
                {/* Text Content */}
                <div className="mb-8 text-center md:mb-0 md:text-left">
                    <span className="mb-2 inline-block rounded-full bg-yellow-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-gray-900 shadow-md">
                        Limited Time Offer
                    </span>
                    <h2 className="mb-2 text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
                        Get <span className="text-yellow-300">20% OFF</span>
                        <br />
                        Your First Order
                    </h2>
                    <p className="mb-6 text-lg font-medium text-indigo-100 md:text-xl">
                        Plus enjoy <span className="font-bold text-white">FREE DELIVERY</span> on all orders!
                    </p>

                    <Link
                        to="/categories"
                        className="inline-flex transform items-center rounded-full bg-white px-8 py-3 text-lg font-bold text-indigo-600 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-yellow-50 hover:text-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-indigo-600"
                    >
                        Shop Now
                        <svg
                            className="ml-2 -mr-1 h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Link>
                </div>

                {/* Decorative Element / Illustration Placeholder */}
                {/* Using a generic SVG illustration-style layout or we could use an image if user provided one. 
            For now, creating a stylish abstract graphic with CSS. */}
                <div className="relative hidden md:block">
                    <div className="grid grid-cols-2 gap-4 opacity-90">
                        <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-sm animate-pulse"></div>
                        <div className="h-24 w-24 rounded-2xl bg-yellow-400/20 backdrop-blur-sm mt-8"></div>
                        <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-sm -mt-8"></div>
                        <div className="h-24 w-24 rounded-2xl bg-yellow-400/20 backdrop-blur-sm"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeBanner;
