import React, { useState, useEffect } from 'react';

const FilterSidebar = ({ onFilter, activeCategory }) => {
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        brand: '',
        dietary: []
    });

    const dietaryOptions = ["Vegan", "Gluten-Free", "Organic", "Dairy-Free"];
    const brands = ["FarmFresh", "DailyDairy", "OrganicLife", "BevCo", "SnackTime"]; // Mock brands

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDietaryChange = (option) => {
        setFilters(prev => {
            const newDietary = prev.dietary.includes(option)
                ? prev.dietary.filter(item => item !== option)
                : [...prev.dietary, option];
            return { ...prev, dietary: newDietary };
        });
    };

    const applyFilters = () => {
        onFilter({ ...filters, category: activeCategory });
    };

    const clearFilters = () => {
        setFilters({ minPrice: '', maxPrice: '', brand: '', dietary: [] });
        onFilter({ category: activeCategory });
    };

    return (
        <div className="filter-sidebar" style={{
            width: '250px',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            height: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Filters</h3>

            {/* Price Range */}
            <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Price Range</h4>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        type="number"
                        name="minPrice"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                    <span>-</span>
                    <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                </div>
            </div>

            {/* Brand */}
            <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Brand</h4>
                <select
                    name="brand"
                    value={filters.brand}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                >
                    <option value="">All Brands</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </div>

            {/* Dietary Preferences */}
            <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>Dietary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {dietaryOptions.map(option => (
                        <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={filters.dietary.includes(option)}
                                onChange={() => handleDietaryChange(option)}
                            />
                            {option}
                        </label>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button onClick={applyFilters} className="btn btn-primary" style={{ width: '100%' }}>Apply Filters</button>
                <button onClick={clearFilters} className="btn btn-outline" style={{ width: '100%' }}>Clear</button>
            </div>
        </div>
    );
};

export default FilterSidebar;
