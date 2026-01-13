
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';
import { CATEGORY_HIERARCHY } from '../data/CategoryStructure';

const CategoryProducts = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { products, fetchProducts } = useProducts();
    const { addToCart } = useContext(CartContext);

    // State
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeSubCategory, setActiveSubCategory] = useState("All");

    // Derived values
    const currentCategory = categoryId ? decodeURIComponent(categoryId) : "All";
    // Now returns an array of objects { name, image }
    const subCategories = CATEGORY_HIERARCHY[currentCategory] || [{ name: "All", image: "" }];

    useEffect(() => {
        if (products.length === 0) {
            fetchProducts();
        }
    }, [products.length, fetchProducts]);

    useEffect(() => {
        // Reset subcategory when main category changes
        setActiveSubCategory("All");
    }, [categoryId]);

    useEffect(() => {
        // Filter products based on Category and SubCategory
        let result = products;

        // 1. Filter by Main Category
        if (currentCategory !== "All") {
            result = result.filter(p => p.category === currentCategory);
        }

        // 2. Filter by SubCategory (if not "All")
        if (activeSubCategory !== "All") {
            result = result.filter(p => p.subCategory === activeSubCategory);
        }

        setFilteredProducts(result);
    }, [currentCategory, activeSubCategory, products]);

    return (
        <div className="container" style={{ padding: '0', maxWidth: '100%' }}>
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>

                {/* SIDEBAR - SUB-CATEGORIES */}
                <div style={{
                    minWidth: '75px',
                    width: '75px',
                    flexShrink: 0,
                    borderRight: '1px solid #e5e7eb',
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'sticky',
                    top: '60px',
                    height: 'calc(100vh - 60px)',
                    overflowY: 'auto'
                }} className="mobile-sidebar md:desktop-sidebar">
                    <style>{`
                        @media (min-width: 768px) {
                            .mobile-sidebar { min-width: 240px !important; width: 240px !important; }
                            .sidebar-item { flex-direction: row !important; text-align: left !important; padding: 0.75rem 1rem !important; height: auto !important; }
                            .sidebar-icon { margin-right: 0.75rem !important; margin-bottom: 0 !important; width: 20px !important; height: 20px !important; font-size: 1.2rem !important; }
                            .sidebar-text { font-size: 0.95rem !important; white-space: normal !important; }
                        }
                        /* Add responsive padding for main content */
                        .product-grid-container { padding: 0.5rem !important; }
                        @media (min-width: 768px) {
                            .product-grid-container { padding: 1.5rem !important; }
                        }
                    `}</style>

                    {/* "All" Option */}
                    <div
                        onClick={() => setActiveSubCategory("All")}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem 0.25rem',
                            cursor: 'pointer',
                            backgroundColor: activeSubCategory === "All" ? '#f0fdf4' : 'transparent',
                            position: 'relative',
                            borderBottom: '1px solid #f3f4f6',
                            height: '90px'
                        }}
                        className="sidebar-item"
                    >
                        {/* Highlight Bar */}
                        {activeSubCategory === "All" && (
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '4px',
                                backgroundColor: '#0c831f',
                                borderTopRightRadius: '4px',
                                borderBottomRightRadius: '4px'
                            }} />
                        )}
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem', lineHeight: '1' }} className="sidebar-icon">🧺</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: activeSubCategory === "All" ? '#0c831f' : '#4b5563', textAlign: 'center', lineHeight: '1.1' }} className="sidebar-text">All</div>
                    </div>

                    {subCategories.filter(s => s.name !== "All").map((sub, index) => (
                        <div
                            key={sub.name}
                            onClick={() => setActiveSubCategory(sub.name)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1rem 0.25rem',
                                cursor: 'pointer',
                                backgroundColor: activeSubCategory === sub.name ? '#f0fdf4' : 'transparent',
                                position: 'relative',
                                borderBottom: '1px solid #f3f4f6',
                                height: '90px'
                            }}
                            className="sidebar-item"
                        >
                            {/* Highlight Bar */}
                            {activeSubCategory === sub.name && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: '4px',
                                    backgroundColor: '#0c831f',
                                    borderTopRightRadius: '4px',
                                    borderBottomRightRadius: '4px'
                                }} />
                            )}

                            {/* Icon / Image */}
                            <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="sidebar-icon">
                                {sub.image ? (
                                    <img src={sub.image} alt={sub.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                ) : (
                                    <span>{['🥦', '🍎', '🥕', '🥔', '🥬', '🥗', '🌽'][index % 7]}</span>
                                )}
                            </div>

                            <div style={{
                                fontSize: '0.7rem',
                                fontWeight: activeSubCategory === sub.name ? '700' : '500',
                                color: activeSubCategory === sub.name ? '#0c831f' : '#4b5563',
                                textAlign: 'center',
                                lineHeight: '1.1',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                            }} className="sidebar-text">
                                {sub.name}
                            </div>
                        </div>
                    ))}
                </div>

                {/* MAIN CONTENT */}
                <div style={{ flex: 1, backgroundColor: '#f9fafb' }}>

                    {/* Header for Mobile/Desktop */}
                    <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: '60px', zIndex: 10 }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0.25rem'
                            }}
                        >
                            ←
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.2rem', fontWeight: '800', textTransform: 'capitalize' }}>
                                {activeSubCategory !== 'All' ? activeSubCategory : currentCategory}
                            </h1>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                {filteredProducts.length} Products
                            </div>
                        </div>

                        {/* Mobile Filter Tabs (Optional backup if sidebar is hidden) */}
                        <div className="md:hidden" style={{ marginLeft: 'auto', overflowX: 'auto', maxWidth: '50%', whiteSpace: 'nowrap' }}>
                            {/* Simple dropdown or scroll could go here for mobile subcategories */}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div style={{ padding: '0.5rem' }} className="product-grid-container">
                        {filteredProducts.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                                gap: '0.5rem',
                                width: '100%'
                            }}>
                                {filteredProducts.map((product) => (
                                    <div key={product._id} style={{ height: 'auto', minHeight: '260px' }}>
                                        <ProductCard
                                            product={product}
                                            onClick={(p) => console.log('Clicked', p)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🍃</span>
                                <p>No products found in this category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CSS Helper */}
            <style>{`
                @media (max-width: 768px) {
                    .hidden { display: none !important; }
                    .md\\:flex { display: flex !important; }
                    .md\\:hidden { display: block !important; }
                }
            `}</style>
        </div>
    );
};

export default CategoryProducts;
