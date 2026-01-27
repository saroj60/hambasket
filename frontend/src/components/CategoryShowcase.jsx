import React from 'react';
import { BASE_URL } from '../config';

const getPastelColor = (index) => {
    const colors = [
        '#ffe8e8', // Soft Red
        '#e8f4ff', // Soft Blue
        '#e8fff4', // Soft Green
        '#fff8e8', // Soft Orange
        '#f4e8ff', // Soft Purple
        '#fff0f5', // Lavender
        '#e0ffff', // Cyan
        '#f0e68c', // Khaki
    ];
    return colors[index % colors.length];
};

const CategoryShowcase = ({ categories = [], activeCategory }) => {

    if (!categories || categories.length === 0) return null;

    return (
        <div className="container" style={{ padding: '1rem 0' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Shop by category</h2>
            <div className="category-grid">
                {categories.map((cat, index) => {
                    const imgUrl = cat.image
                        ? (cat.image.startsWith('http') ? cat.image : `${BASE_URL}${cat.image}`)
                        : '/assets/categories/default.png';

                    return (
                        <div
                            key={cat._id}
                            className={`category-card ${activeCategory === cat.name ? 'active' : ''}`}
                            onClick={() => {
                                // Navigate to dedicated category page
                                window.location.hash = `#/category/${encodeURIComponent(cat.name)}`;
                            }}
                            style={{ backgroundColor: getPastelColor(index) }}
                        >
                            <div className="category-image-container">
                                <img
                                    src={imgUrl}
                                    alt={cat.name}
                                    loading="lazy"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Category'; }}
                                />
                            </div>
                            <span className="category-card-label">{cat.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryShowcase;
