import React from 'react';

const CATEGORIES_DATA = [
    { id: 'Fruits & Vegetables', label: 'Fresh produce', img: '/assets/categories/fruits_veg.png' },
    { id: 'Dairy, Bread & Eggs', label: 'Dairy & eggs', img: '/assets/categories/dairy_bread.png' },
    { id: 'Atta, Rice, Oil & Dals', label: 'Staples & pantry items', img: '/assets/categories/staples.png' },
    { id: 'Snacks & Beverages', label: 'Snacks & beverages', img: '/assets/categories/snacks_beverages.png' },
    { id: 'Tea and coffee', label: 'Tea & Coffee', img: '/assets/categories/tea_coffee.png' },
    { id: 'Masalas & Dry fruits', label: 'Masalas & Dry Fruits', img: '/assets/categories/masala_dryfruits.png' },
    { id: 'Breakfast and sauce', label: 'Breakfast & Sauces', img: '/assets/categories/breakfast_sauces.png' },
    { id: 'Household & Personal Care', label: 'Household & personal care', img: '/assets/categories/household_care.png' },
    { id: 'Pharmacy', label: 'Pharmacy', img: '/assets/categories/pharmacy.png' },
    { id: 'Beauty & Self-Care', label: 'Beauty & Self-Care', img: '/assets/categories/beauty_selfcare.png' },
    { id: 'Water & Gas', label: 'Water & Gas', img: '/assets/categories/water_gas.png' }, // Combined category icon
];

const CategoryShowcase = ({ activeCategory, onSelectCategory }) => {
    return (
        <div className="category-showcase-container">
            {CATEGORIES_DATA.map((cat, index) => (
                <div
                    key={index}
                    className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => onSelectCategory(cat.id)}
                >
                    <div className="category-image-wrapper">
                        <img src={cat.img} alt={cat.label} />
                    </div>
                    <span className="category-label">{cat.label}</span>
                </div>
            ))}
        </div>
    );
};

export default CategoryShowcase;
