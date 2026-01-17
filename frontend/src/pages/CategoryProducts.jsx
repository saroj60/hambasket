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
        <div className="h-full bg-gray-50 flex flex-col pt-0">
            <div className="flex flex-1 container mx-auto max-w-[1600px] px-0" style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>

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
                        alignItems: 'center',
                        paddingTop: '0'
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
                                    py-3 px-1
                                `}
                                style={{
                                    borderLeft: isActive ? '4px solid #9333ea' : '4px solid transparent',
                                    backgroundColor: isActive ? '#f3e8ff' : 'transparent',
                                    opacity: 1
                                }}
                            >
                                {/* Icon Container */}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px', /* Squircle shape */
                                    backgroundColor: isActive ? 'white' : '#f9fafb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '4px',
                                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    border: isActive ? '1px solid #d8b4fe' : '1px solid transparent'
                                }}>
                                    {sub.image ? (
                                        <img
                                            src={sub.image}
                                            alt={sub.name}
                                            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <span className="text-xl">{['🥦', '🍎', '🥕', '🥔', '🥬', '🥗', '🌽'][index % 7]}</span>
                                    )}
                                </div>

                                {/* Label */}
                                <div style={{
                                    fontSize: '10px',
                                    lineHeight: '1.2',
                                    textAlign: 'center',
                                    fontWeight: isActive ? '700' : '500',
                                    color: isActive ? '#6b21a8' : '#4b5563',
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
                    {filteredProducts.length > 0 ? (
                        /* Scrollable Product Grid */
                        <div className="flex-1 overflow-y-auto p-3 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
                            <div className="mb-3 px-1 flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                    {activeSubCategory !== 'All' ? activeSubCategory : currentCategory}
                                    <span className="ml-1 text-gray-400 font-normal">({filteredProducts.length})</span>
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        onClick={(p) => setSelectedProduct(p)}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Fixed Empty State - No Scroll */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400 h-full w-full overflow-hidden">
                            <div className="bg-gray-100 p-6 rounded-full mb-4">
                                <span className="text-4xl grayscale opacity-50">🍃</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-600 mb-1">No products found</h3>
                            <p className="text-sm">Try selecting a different category or check back later.</p>
                        </div>
                    )}
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
