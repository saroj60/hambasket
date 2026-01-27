import React, { useEffect, useState, useContext } from "react";
import ProductCard from "../components/ProductCard";
import ProductDetails from "../components/ProductDetails";
import { getProducts, getPopularProducts, getActiveOccasions, getAllCategories } from "../services/api";
import { CartContext } from "../context/CartContext";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';

import HomeBanner from "../components/HomeBanner";
import CategoryShowcase from "../components/CategoryShowcase";
import TopPicks from "../components/TopPicks";
import CategorySection from "../components/CategorySection";
import OccasionSection from "../components/OccasionSection";
// import { MAIN_CATEGORIES } from "../data/CategoryStructure"; // Removing static import

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useContext(CartContext);

  const [activeOccasions, setActiveOccasions] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  // Dynamic Categories Control
  const [categories, setCategories] = useState([]);
  const [visibleCategories, setVisibleCategories] = useState(5); // Start with 5 loaded
  const [moreLoading, setMoreLoading] = useState(false);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.toString();
  const searchTerm = searchParams.get('search');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [productsData, popularData, occasionsData, categoriesData] = await Promise.all([
          getProducts(searchQuery),
          getPopularProducts(),
          getActiveOccasions(),
          getAllCategories()
        ]);

        setProducts(productsData || []);
        setPopularProducts(popularData || []);
        setActiveOccasions(occasionsData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [location.search]);

  const categorySections = categories.slice(0, visibleCategories);

  return (
    <div className="px-3 py-6 md:px-6 md:py-10">
      {/* Promotional Banner - Always visible */}
      <HomeBanner />

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-600 text-lg">
          Loading products...
        </div>
      ) : error ? (
        // Error State
        <div className="flex justify-center items-center h-64 text-red-500 text-lg">
          {error}
        </div>
      ) : (
        // Main Content
        <>
          {/* Search Results View */}
          {searchTerm ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Search Results for "{searchTerm}"
              </h2>
              {products.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      onClick={setSelectedProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-10">
                  No products found.
                </div>
              )}
            </>
          ) : (
            /* Default Home View */
            <>
              {/* Occasion Sections */}
              {activeOccasions.map((occasion) => (
                <OccasionSection
                  key={occasion._id}
                  occasion={occasion}
                  onProductClick={setSelectedProduct}
                />
              ))}

              {/* Categories Grid */}
              <CategoryShowcase categories={categories} />

              {/* Top Picks Section */}
              <TopPicks />

              {/* Dynamic Lazy Loaded Category Sections */}
              <div className="space-y-4">
                {categorySections.map((category) => (
                  <CategorySection
                    key={category._id}
                    title={category.name}
                    products={products.filter(p => p.category === category.name)}
                    onProductClick={setSelectedProduct}
                  />
                ))}
              </div>

              {/* Load More Button (Optional) */}
              {!allCategoriesLoaded && categories.length > 5 && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={loadMoreCategories}
                    disabled={moreLoading}
                    className="px-6 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {moreLoading ? 'Loading...' : 'Show More Categories'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAdd={(item) => {
              addToCart(item, item.quantity);
            }}
            onProductSelect={setSelectedProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
};



export default Home;
