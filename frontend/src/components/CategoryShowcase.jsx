import React from 'react';

const CATEGORIES_DATA = [
    { id: 'Fruits & Vegetables', label: 'Fresh produce', img: '/assets/categories/fruits_veg.png' },
    { id: 'Dairy, Bread & Eggs', label: 'Dairy & eggs', img: '/assets/categories/dairy_bread.png' },
    { id: 'Atta, Rice, Oil & Dals', label: 'Staples & pantry items', img: '/assets/categories/staples.png' },
    { id: 'Snacks & Beverages', label: 'Snacks & beverages', img: '/assets/categories/snacks_beverages.png' },
    { id: 'Household & Personal Care', label: 'Household & personal care', img: '/assets/categories/household_care.png' },
    { id: 'Pharmacy', label: 'Pharmacy', img: '/assets/categories/pharmacy.png' },
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
