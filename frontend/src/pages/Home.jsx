import React, { useEffect, useState, useContext } from "react";
import ProductCard from "../components/ProductCard";
import ProductDetails from "../components/ProductDetails";
import { getProducts, getPopularProducts } from "../services/api";
import { CartContext } from "../context/CartContext";
import { useLocation } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useContext(CartContext);

  const [popularProducts, setPopularProducts] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.toString();

        const [productsData, popularData] = await Promise.all([
          getProducts(searchQuery),
          getPopularProducts()
        ]);

        setProducts(productsData || []);
        setPopularProducts(popularData || []);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome to Our Store 🛍️
        </h1>
        <p className="text-gray-600">
          Discover top deals and best-selling products
        </p>
      </div>

      {/* Popular Products Section */}
      {!new URLSearchParams(location.search).toString() && popularProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>🔥</span> Popular Right Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {/* Product Grid */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {new URLSearchParams(location.search).get('search') ? `Search Results for "${new URLSearchParams(location.search).get('search')}"` : 'All Products'}
      </h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          No products available at the moment.
        </div>
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
    </div>
  );
};

export default Home;
