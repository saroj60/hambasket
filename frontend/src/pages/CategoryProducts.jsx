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
        <div className="min-h-screen bg-gray-50 flex flex-col pt-[60px]">
            <div className="flex flex-1 container mx-auto max-w-[1600px] px-0" style={{ display: 'flex', flexDirection: 'row' }}>

                {/* SIDEBAR - SUB-CATEGORIES */}
                <div
                    className="w-[85px] md:w-64 flex-shrink-0 bg-white border-r border-gray-100 h-[calc(100vh-60px)] sticky top-[60px] overflow-y-auto custom-scrollbar"
                    style={{ width: '85px', minWidth: '85px', flexShrink: 0 }} // Force width
                >
                    {subCategories.map((sub, index) => (
                        <div
                            key={sub.name}
                            onClick={() => setActiveSubCategory(sub.name)}
                            className={`
                                group flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start 
                                py-3 md:py-3 px-2 md:px-4 cursor-pointer transition-all border-b border-gray-50
                                ${activeSubCategory === sub.name ? 'bg-green-50/50' : 'hover:bg-gray-50'}
                                relative
                            `}
                        >
                            {activeSubCategory === sub.name && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
                            )}

                            <div className="mb-1 md:mb-0 md:mr-3 w-8 h-8 flex items-center justify-center" style={{ width: '32px', height: '32px' }}>
                                {sub.image ? (
                                    <img
                                        src={sub.image}
                                        alt={sub.name}
                                        className="w-full h-full object-contain"
                                        style={{ width: '100%', height: '100%', maxWidth: '32px', maxHeight: '32px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <span className="text-xl">{['🥦', '🍎', '🥕', '🥔', '🥬', '🥗', '🌽'][index % 7]}</span>
                                )}
                            </div>

                            <div className={`
                                text-[10px] md:text-sm font-medium text-center md:text-left leading-tight
                                ${activeSubCategory === sub.name ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-gray-900'}
                            `}>
                                {sub.name}
                            </div>
                        </div>
                    ))}
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 bg-gray-50/50 min-h-full flex flex-col">
                    <div className="sticky top-[60px] z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center gap-4 shadow-sm">
                        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-gray-800 capitalize leading-tight">
                                {activeSubCategory !== 'All' ? activeSubCategory : currentCategory}
                            </h1>
                            <p className="text-xs text-gray-500">{filteredProducts.length} Products Found</p>
                        </div>
                    </div>

                    <div className="p-2 md:p-6 flex-1">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        onClick={(p) => setSelectedProduct(p)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
                                <span className="text-6xl mb-4">🍃</span>
                                <p className="text-lg font-medium">No products found in this category.</p>
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
