import React from 'react';
import { BASE_URL } from '../config';

// 1. Static Local Image Map (Fallback for missing backend images)
const CATEGORY_IMAGE_MAP = {
    "Fresh Produce": "/assets/categories/fruits_veg.png",
    "Dairy, Bread & Eggs": "/assets/categories/dairy_bread.png",
    "Atta, Rice, Oil & Dals": "/assets/categories/staples.png",
    "Bakery and Biscuits": "/assets/categories/bakery_biscuits.png",
    "Snacks & Beverages": "/assets/categories/snack_beverage.png",
    "Tea and coffee": "/assets/categories/tea_coffee.png",
    "Organic and Dry Fruits": "/assets/categories/organic_dryfruits.png",
    "Breakfast and sauce": "/assets/categories/breakfast_sauces.png",
    "Household & Personal Care": "/assets/categories/household_care.png",
    "Baby Care": "/assets/categories/baby_care.png",
    "Beauty & Self-Care": "/assets/categories/beauty_selfcare.png",
    "Liquors": "/assets/categories/liquors.png",
    "Water & Gas": "/assets/categories/water_gas.png",
    "Meat, Fish & Eggs": "/assets/categories/meat_fish.png",
    "Meat & Fish": "/assets/categories/meat_fish.png",
    "Chicken, Meat & Fish": "/assets/categories/meat_fish.png",
    "Cooking Oil, Masala and more": "/assets/categories/cooking_oil.png",
    "Chocolate and Ice Cream": "/assets/categories/chocolate_icecream.png",
    "Pharmacy": "/assets/categories/pharmacy.png"
};

// Create a normalized map for case-insensitive lookup
const NORMALIZED_MAP = Object.keys(CATEGORY_IMAGE_MAP).reduce((acc, key) => {
    acc[key.trim().toLowerCase()] = CATEGORY_IMAGE_MAP[key];
    return acc;
}, {});

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
                    // RESOLVE IMAGE URL:
                    // 1. Check Local Map first (Most reliable)
                    // 2. Check Normalized Map (Case insensitive)
                    // 3. Then check backend URL
                    // 4. Fallback to default
                    let imgUrl = CATEGORY_IMAGE_MAP[cat.name] ||
                        NORMALIZED_MAP[cat.name?.trim().toLowerCase()] ||
                        cat.image;

                    if (!imgUrl) {
                        imgUrl = '/assets/categories/default.png';
                    } else if (imgUrl.startsWith('http') || imgUrl.startsWith('/assets') || imgUrl.startsWith('/images')) {
                        // Already full URL or local path
                    } else {
                        // Needs Base URL (backend upload)
                        imgUrl = `${BASE_URL}${imgUrl}`;
                    }

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
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent loop
                                        e.target.src = 'https://via.placeholder.com/100?text=' + encodeURIComponent(cat.name);
                                    }}
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
