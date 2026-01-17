import React from 'react';

const OfferBanners = () => {
    return (
        <div className="w-full px-4 mb-6">
            <div className="rounded-2xl overflow-hidden shadow-sm">
                <img
                    src="/images/banners/category_promo.jpg"
                    alt="Special Offer"
                    className="w-full h-auto object-cover max-h-40 sm:max-h-60"
                />
            </div>
        </div>
    );
};

export default OfferBanners;
