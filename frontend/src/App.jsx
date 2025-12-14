import { useState, useEffect, useContext } from "react";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from "./components/Layout";
import HeroSection from "./components/HeroSection";
import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import AdminPanel from "./components/AdminPanel";
import AuthForms from "./components/AuthForms";
import Profile from "./components/Profile";
import ProductDetails from "./components/ProductDetails";
import OrderTracking from "./components/OrderTracking";
import About from "./components/About";
import Contact from "./components/Contact";
import FAQ from "./components/FAQ";
import Terms from "./components/Terms";

import VendorDashboard from "./components/Vendor/VendorDashboard";
import CategoryShowcase from "./components/CategoryShowcase";
import FlashSaleSection from "./components/FlashSaleSection";
import BottomNavigation from "./components/BottomNavigation";
import StoreList from "./components/StoreList";
import StoreDetails from "./components/StoreDetails";
import VerifyEmail from "./components/VerifyEmail";
import ResetPassword from "./components/ResetPassword";
import NearbyOffers from "./components/NearbyOffers";
import OfferBanners from "./components/OfferBanners";
import { ProductProvider, useProducts } from "./context/ProductContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { LocationProvider } from "./context/LocationContext";
import { CartProvider, CartContext } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";
import ErrorBoundary from "./components/ErrorBoundary";

const CATEGORIES = ["All", "Vegetables", "Fruits", "Dairy", "Bakery", "Beverages", "Snacks", "Frozen", "Pharmacy", "Other"];

function ShopContent() {
  const { products, fetchProducts } = useProducts();
  const { user, logout } = useAuth();
  const { cartItems, addToCart, removeFromCart, clearCart } = useContext(CartContext);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [filters, setFilters] = useState({ category: "All", search: "" });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Close auth modal when user logs in
  useEffect(() => {
    if (user) {
      setShowAuthModal(false);
    }
    // Reset admin mode if user is not admin
    if (!user || user.role !== 'admin') {
      setIsAdminMode(false);
    }
  }, [user]);

  const handleCheckout = () => {
    clearCart();
  };

  return (
    <Layout
      cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)}
      onOpenCart={() => setIsCartOpen(true)}
      searchTerm={filters.search}
      onSearch={(val) => handleFilterChange({ search: val })}
      suggestions={products}
      bottomNav={
        <div className="mobile-bottom-nav">
          <BottomNavigation
            cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenProfile={() => {
              if (user) {
                setIsProfileOpen(true);
              } else {
                setShowAuthModal(true);
              }
            }}
            isAdminMode={isAdminMode}
            setIsAdminMode={setIsAdminMode}
          />
        </div>
      }
    >
      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ×
            </button>
            <AuthForms />
          </div>
        </div>
      )}

      {/* Profile Sidebar */}
      {isProfileOpen && (
        <Profile
          onClose={() => setIsProfileOpen(false)}
          onTrackOrder={(order) => {
            setIsProfileOpen(false);
            setTrackingOrder(order);
          }}
        />
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={(p) => addToCart(p, 1)}
        />
      )}

      {/* Order Tracking Modal */}
      {trackingOrder && (
        <OrderTracking
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}

      {/* Main Routes */}
      <Routes>
        <Route path="/" element={
          <>
            <div className="user-actions-bar">
              <div>
                {user ? (
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontWeight: '600' }}>Hi, {user.name || 'User'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="btn btn-outline"
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>


              {user?.role === 'admin' && (
                <button
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className="btn"
                  style={{
                    backgroundColor: isAdminMode ? 'var(--primary)' : 'white',
                    color: isAdminMode ? 'white' : 'var(--border)'
                  }}
                >
                  {isAdminMode ? 'Exit Admin' : 'Admin Panel'}
                </button>
              )}

              {user?.role === 'vendor' && (
                <button
                  onClick={() => window.location.href = '/vendor/dashboard'}
                  className="btn"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary)'
                  }}
                >
                  Vendor Dashboard
                </button>
              )}
            </div>

            {isAdminMode && user?.role === 'admin' ? (
              <AdminPanel />
            ) : (
              <>
                {/* Hero / Banner */}
                <HeroSection onShopNow={() => {
                  const grid = document.getElementById('product-grid');
                  if (grid) {
                    grid.scrollIntoView({ behavior: 'smooth' });
                  }
                }} />

                {/* Promotional Offers */}
                <OfferBanners />

                {/* Nearby Offers */}
                <NearbyOffers />

                {/* Category Filter */}
                <CategoryShowcase
                  activeCategory={filters.category}
                  onSelectCategory={(cat) => handleFilterChange({ category: cat })}
                />

                <FlashSaleSection
                  products={products}
                  onAdd={(p) => addToCart(p, 1)}
                  onClick={setSelectedProduct}
                />

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }} id="product-grid">
                  {/* Sidebar Removed */}

                  {/* Product Grid */}
                  <div className="grid grid-cols-4" style={{ flex: 1 }}>
                    {products.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onClick={setSelectedProduct}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        } />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/stores" element={<StoreList />} />
        <Route path="/stores/:id" element={<StoreDetails />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        onLoginRequired={() => {
          setIsCartOpen(false);
          setShowAuthModal(true);
        }}
      />
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LocationProvider>
          <ProductProvider>
            <CartProvider>
              <SocketProvider>
                <NotificationProvider>
                  <Router>
                    <ShopContent />
                  </Router>
                </NotificationProvider>
              </SocketProvider>
            </CartProvider>
          </ProductProvider>
        </LocationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
