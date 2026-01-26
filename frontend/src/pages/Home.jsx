import React, { useEffect, useState, useContext } from "react";
import ProductCard from "../components/ProductCard";
import ProductDetails from "../components/ProductDetails";
import { getProducts, getPopularProducts, getActiveOccasions } from "../services/api";
import { CartContext } from "../context/CartContext";
import { useLocation } from "react-router-dom";

import HomeBanner from "../components/HomeBanner";
import CategoryShowcase from "../components/CategoryShowcase";
import TopPicks from "../components/TopPicks";
import CategorySection from "../components/CategorySection";
import OccasionSection from "../components/OccasionSection";
import { MAIN_CATEGORIES } from "../data/CategoryStructure";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useContext(CartContext);

  const [activeOccasions, setActiveOccasions] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.toString();
  const searchTerm = searchParams.get('search');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [productsData, popularData, occasionsData] = await Promise.all([
          getProducts(searchQuery),
          getPopularProducts(),
          getActiveOccasions()
        ]);

        setProducts(productsData || []);
        setPopularProducts(popularData || []);
        setActiveOccasions(occasionsData || []);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [location.search]);

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

              {/* Category Showcase - Shop by Category */}
              <CategoryShowcase />

              {/* Top Picks Section */}
              <TopPicks />

              {/* Popular Products Section (Optional: Keeping it as it was requested before or similar to Top Picks) */}
              {popularProducts.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span>🔥</span> Popular Right Now
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {popularProducts.map((product) => (
                      <ProductCard
                        key={`pop-${product._id || product.id}`}
                        product={product}
                        onClick={setSelectedProduct}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Category Wise Products */}
              <div className="mt-8">
                {MAIN_CATEGORIES.map((category) => (
                  <CategorySection key={category} category={category} title={category} onProductClick={setSelectedProduct} />
                ))}
              </div>
            </>
          )}

          {/* Product Details Modal */}
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
        </>
      )}
    </div>
  );
};

export default Home;
