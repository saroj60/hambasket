import React from 'react';
import { CATEGORY_HIERARCHY } from '../data/CategoryStructure';

// Map of category images and custom labels (optional)
// If a category isn't here, we'll try to find a fallback or just show the name
const CATEGORY_METADATA = {
    "Fresh Produce": { label: "Fresh Produce", img: "/images/fresh-produce/fresh_produce.png" }, // Updated
    "Dairy, Bread & Eggs": { label: "Dairy & Eggs", img: "/images/dairy/all.png" },
    "Atta, Rice, Oil & Dals": { label: "Rice, Dal & Atta", img: "/assets/categories/staples.png" },
    "Bakery and Biscuits": { label: "Bakery & Biscuits", img: "/images/bakery/all.png" },
    "Snacks & Beverages": { label: "Snacks & Beverages", img: "/assets/categories/snacks_beverages.jpg" },
    "Tea and coffee": { label: "Tea & Coffee", img: "/images/beverages/all.png" },
    "Organic and Dry Fruits": { label: "Organic & Dry Fruits", img: "/images/organic/all.png" },
    "Breakfast and sauce": { label: "Breakfast & Sauces", img: "/images/breakfast/all.jpg" },
    "Household & Personal Care": { label: "Cleaning Essential", img: "/images/household/cleaning.jpg" },
    "Baby Care": { label: "Baby Care", img: "/images/baby_care/all.png" },
    "Beauty & Self-Care": { label: "Beauty & Self-Care", img: "/images/beauty/all.png" },
    "Liquors": { label: "Liquors", img: "/images/liquor/all.png" },
    "Cooking Oil, Masala and more": { label: "Cooking Oil & Masala", img: "/images/cooking/all.png" },
    "Chocolate and Ice Cream": { label: "Chocolates & Ice Cream", img: "/assets/categories/chocolate_icecream_new.jpg" },
    "Water & Gas": { label: "Water & Gas", img: "/images/water_gas/all.png" }
};

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

const CategoryShowcase = ({ activeCategory, onSelectCategory }) => {
    // Filter out "All" and any system categories if needed
    const categories = Object.keys(CATEGORY_HIERARCHY).filter(k => k !== "All");

    return (
        <div className="container" style={{ padding: '1rem 0' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Shop by category</h2>
            <div className="category-grid">
                {categories.map((catKey, index) => {
                    const metadata = CATEGORY_METADATA[catKey] || { label: catKey, img: '/assets/categories/default.png' };

                    return (
                        <div
                            key={catKey}
                            className={`category-card ${activeCategory === catKey ? 'active' : ''}`}
                            onClick={() => {
                                // Navigate to dedicated category page
                                window.location.hash = `#/category/${encodeURIComponent(catKey)}`;
                            }}
                            style={{ backgroundColor: getPastelColor(index) }}
                        >
                            <div className="category-image-container">
                                <img
                                    src={metadata.img}
                                    alt={metadata.label}
                                    loading="lazy"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Category'; }}
                                />
                            </div>
                            <span className="category-card-label">{metadata.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryShowcase;
