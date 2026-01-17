import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import ProductDetails from '../components/ProductDetails';
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
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Derived values
    const currentCategory = categoryId ? decodeURIComponent(categoryId) : "All";
    const subCategories = CATEGORY_HIERARCHY[currentCategory] || [{ name: "All", image: "" }];

    useEffect(() => {
        if (products.length === 0) {
            fetchProducts();
        }
    }, [products.length, fetchProducts]);

    useEffect(() => {
        setActiveSubCategory("All");
    }, [categoryId]);

    useEffect(() => {
        let result = products;
        if (currentCategory !== "All") {
            result = result.filter(p => p.category === currentCategory);
        }
        if (activeSubCategory !== "All") {
            result = result.filter(p => p.subCategory === activeSubCategory);
        }
        setFilteredProducts(result);
    }, [currentCategory, activeSubCategory, products]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-0">
            <div className="flex flex-1 container mx-auto max-w-[1600px] px-0" style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 60px)' }}>

                {/* ZEPTO-STYLE SIDEBAR (Left Navigation Rail) */}
                <div
                    className="flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto custom-scrollbar hide-scrollbar"
                    style={{
                        width: '85px',
                        minWidth: '85px',
                        height: '100%',
                        paddingBottom: '80px', /* Space for bottom nav */
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    {subCategories.map((sub, index) => {
                        const isActive = activeSubCategory === sub.name;
                        return (
                            <div
                                key={sub.name}
                                onClick={() => setActiveSubCategory(sub.name)}
                                className={`
                                    cursor-pointer transition-all relative w-full
                                    flex flex-col items-center justify-center
                                    py-4 px-1
                                `}
                                style={{
                                    borderLeft: isActive ? '4px solid #7c3aed' : '4px solid transparent', /* Active Indicator */
                                    backgroundColor: isActive ? '#f3e8ff' : 'transparent',
                                    opacity: (activeSubCategory !== 'All' && !isActive) ? 0.7 : 1
                                }}
                            >
                                {/* Icon Container (Circle/Rounded) */}
                                <div style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '50%',
                                    backgroundColor: isActive ? 'white' : '#f9fafb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '6px',
                                    boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                    border: isActive ? '1px solid #e9d5ff' : '1px solid transparent'
                                }}>
                                    {sub.image ? (
                                        <img
                                            src={sub.image}
                                            alt={sub.name}
                                            style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <span className="text-xl">{['🥦', '🍎', '🥕', '🥔', '🥬', '🥗', '🌽'][index % 7]}</span>
                                    )}
                                </div>

                                {/* Label */}
                                <div style={{
                                    fontSize: '11px', /* Slightly larger than before (10px -> 11px/xs) */
                                    lineHeight: '1.2',
                                    textAlign: 'center',
                                    fontWeight: isActive ? '700' : '500',
                                    color: isActive ? '#5b21b6' : '#6b7280',
                                    padding: '0 2px',
                                    maxWidth: '100%'
                                }}>
                                    {sub.name}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 bg-gray-50 h-full flex flex-col overflow-hidden">
                    {/* Scrollable Product Grid - Header Removed */}
                    <div className="flex-1 overflow-y-auto p-3 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {/* Optional: Small Title if needed, otherwise clean grid */}
                        <div className="mb-2 px-1">
                            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-800">
                                {activeSubCategory !== 'All' ? activeSubCategory : currentCategory}
                                <span className="text-[10px] font-normal text-gray-500 ml-1">({filteredProducts.length})</span>
                            </h2>
                        </div>
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        onClick={(p) => setSelectedProduct(p)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[60%] text-gray-400">
                                <span className="text-5xl mb-3 grayscale opacity-50">🍃</span>
                                <p className="text-sm font-medium">No products found here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Details Modal */}
            {selectedProduct && (
                <ProductDetails
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAdd={(item) => {
                        addToCart(item, item.quantity);
                        setSelectedProduct(null);
                    }}
                />
            )}
        </div>
    );
};

export default CategoryProducts;
