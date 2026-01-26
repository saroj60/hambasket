import React from 'react';
import ProductCard from './ProductCard';

// Helper to format date
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const OccasionSection = ({ occasion, onProductClick }) => {
    if (!occasion || !occasion.products || occasion.products.length === 0) return null;

    return (
        <div className="mb-12 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-pink-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    {occasion.image && (
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                            <img src={occasion.image} alt={occasion.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            {occasion.title}
                        </h2>
                        {occasion.description && (
                            <p className="text-gray-600 text-sm mt-1 max-w-lg">
                                {occasion.description}
                            </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs font-bold text-purple-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full w-fit shadow-sm border border-purple-100">
                            ✨ Limited Time: {formatDate(occasion.startDate)} - {formatDate(occasion.endDate)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="relative z-10">
                <div className="flex overflow-x-auto gap-4 pb-4 px-1 -mx-1 scrollbar-hide snap-x">
                    {occasion.products.map((product) => (
                        <div key={product._id} className="min-w-[160px] w-[180px] md:min-w-[200px] md:w-[220px] snap-start flex-shrink-0">
                            <ProductCard product={product} onClick={onProductClick} />
                        </div>
                    ))}
                    {/* View All Card (Optional, or just slide end) */}
                    {occasion.products.length > 4 && (
                        <div className="min-w-[100px] flex items-center justify-center">
                            {/* Can add a generic 'See All' button if navigating to a dedicated page */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OccasionSection;
