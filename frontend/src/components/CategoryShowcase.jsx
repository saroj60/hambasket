import React from 'react';

const CATEGORIES_DATA = [
    { id: 'Fruits & Vegetables', label: 'Fresh produce', img: '/assets/categories/fruits_veg.png' },
    { id: 'Dairy, Bread & Eggs', label: 'Dairy & eggs', img: '/assets/categories/dairy_bread.png' },
    { id: 'Atta, Rice, Oil & Dals', label: 'Rice dal and atta', img: '/assets/categories/staples.png' },
    { id: 'Bakery and Biscuits', label: 'Bakery & Biscuits', img: '/assets/categories/bakery_biscuits.png' },
    { id: 'Snacks & Beverages', label: 'Snacks & beverages', img: '/assets/categories/snacks_beverages.jpg' },
    { id: 'Tea and coffee', label: 'Tea & Coffee', img: '/assets/categories/tea_coffee.png' },
    { id: 'Organic and Dry Fruits', label: 'Organic and Dry Fruits', img: '/assets/categories/organic_dryfruits.png' },
    { id: 'Breakfast and sauce', label: 'Breakfast & Sauces', img: '/assets/categories/breakfast_sauces.jpg' },
    { id: 'Household & Personal Care', label: 'Cleaning Essential', img: '/assets/categories/household_care.png' },
    { id: 'Baby Care', label: 'Baby Care', img: '/assets/categories/baby_care.png' },
    { id: 'Beauty & Self-Care', label: 'Beauty & Self-Care', img: '/assets/categories/beauty_selfcare.png' },
    { id: 'Liquors', label: 'Liquors', img: '/assets/categories/liquors.png' },
    { id: 'Cooking Oil, Masala and more', label: 'Cooking Oil, Masala and more', img: '/assets/categories/cooking_oil.png' },
    { id: 'Chocolate and Ice Cream', label: 'Chocolate & Ice Cream', img: '/assets/categories/chocolate_icecream_new.jpg' },
    { id: 'Candies & Gums', label: 'Candies & Gums', img: '/assets/categories/candies_gums.png' }, // Added category
    { id: 'Water & Gas', label: 'Water & Gas', img: '/assets/categories/water_gas.png' }, // Combined category icon
];

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
    return (
        <div className="container" style={{ padding: '1rem 0' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Shop by category</h2>
            <div className="category-grid">
                {CATEGORIES_DATA.map((cat, index) => (
                    <div
                        key={index}
                        className={`category-card ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => {
                            // Navigate to dedicated category page
                            window.location.hash = `#/category/${encodeURIComponent(cat.id)}`;
                        }}
                        style={{ backgroundColor: getPastelColor(index) }}
                    >
                        <div className="category-image-container">
                            <img src={cat.img} alt={cat.label} loading="lazy" />
                        </div>
                        <span className="category-card-label">{cat.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryShowcase;
