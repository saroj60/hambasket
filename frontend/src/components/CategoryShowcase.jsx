import React from 'react';

const CATEGORIES_DATA = [
    { id: 'Fruits & Vegetables', label: 'Fruits & Vegetables', img: 'https://cdn-icons-png.flaticon.com/512/3194/3194766.png' },
    { id: 'Dairy, Bread & Eggs', label: 'Dairy, Bread & Eggs', img: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png' },
    { id: 'Atta, Rice, Oil & Dals', label: 'Atta, Rice, Oil & Dals', img: 'https://cdn-icons-png.flaticon.com/512/2674/2674486.png' },
    { id: 'Meat, Fish & Eggs', label: 'Meat, Fish & Eggs', img: 'https://cdn-icons-png.flaticon.com/512/1046/1046774.png' },
    { id: 'Masala & Dry Fruits', label: 'Masala & Dry Fruits', img: 'https://cdn-icons-png.flaticon.com/512/2515/2515126.png' },
    { id: 'Breakfast & Sauces', label: 'Breakfast & Sauces', img: 'https://cdn-icons-png.flaticon.com/512/883/883760.png' },
    { id: 'Packaged Food', label: 'Packaged Food', img: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png' },
    { id: 'Tea, Coffee & More', label: 'Tea, Coffee & More', img: 'https://cdn-icons-png.flaticon.com/512/924/924514.png' },
    { id: 'Ice Creams & Frozen', label: 'Ice Creams & Frozen', img: 'https://cdn-icons-png.flaticon.com/512/938/938063.png' },
    { id: 'Pharmacy', label: 'Pharmacy', img: 'https://cdn-icons-png.flaticon.com/512/883/883407.png' },
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
