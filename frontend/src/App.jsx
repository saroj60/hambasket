import { useState, useEffect, useContext, Suspense, lazy, useRef } from "react";
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Layout from "./components/Layout";

import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import AuthForms from "./components/AuthForms";
import ProductDetails from "./components/ProductDetails";
import OrderTracking from "./components/OrderTracking";

// Lazy Load Pages
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const Profile = lazy(() => import("./components/Profile"));
import DesktopGuard from "./components/DesktopGuard";
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const FAQ = lazy(() => import("./components/FAQ"));
const Terms = lazy(() => import("./components/Terms"));
const VendorDashboard = lazy(() => import("./components/Vendor/VendorDashboard"));
const StoreList = lazy(() => import("./components/StoreList"));
const StoreDetails = lazy(() => import("./components/StoreDetails"));
const VerifyEmail = lazy(() => import("./components/VerifyEmail"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const CategoryProducts = lazy(() => import("./pages/CategoryProducts"));

import CategoryShowcase from "./components/CategoryShowcase";
import CategorySection from "./components/CategorySection";
import FlashSaleSection from "./components/FlashSaleSection";
import BottomNavigation from "./components/BottomNavigation";
import NearbyOffers from "./components/NearbyOffers";
import OfferBanners from "./components/OfferBanners";
import { ProductProvider, useProducts } from "./context/ProductContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { LocationProvider } from "./context/LocationContext";
import { CartProvider, CartContext } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";
import ErrorBoundary from "./components/ErrorBoundary";

const CATEGORIES = ["All", "Vegetables", "Fruits", "Dairy", "Bakery and Biscuits", "Beverages", "Snacks", "Frozen", "Baby Care", "Chocolate and Ice Cream", "Cooking Oil, Masala and more", "Birthday items", "Other"];

function ShopContent() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const [shouldScrollToCategories, setShouldScrollToCategories] = useState(false);

  const categorySectionRef = useRef(null);

  useEffect(() => {
    if (shouldScrollToCategories && location.pathname === '/' && categorySectionRef.current) {
      // Find the element and scroll
      setTimeout(() => {
        if (categorySectionRef.current) {
          categorySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setShouldScrollToCategories(false);
      }, 100);
    }
  }, [location.pathname, shouldScrollToCategories]);


  const handleOpenCategories = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    setShouldScrollToCategories(true);
    // Also try immediate scroll if already on page
    if (location.pathname === '/' && categorySectionRef.current) {
      categorySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShouldScrollToCategories(false);
    }
  };

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
    } else {
      // Auto-enable admin mode if on an admin hash section
      const adminHashes = ['#dashboard', '#orders', '#products', '#customers', '#settings'];
      if (adminHashes.includes(window.location.hash)) {
        setIsAdminMode(true);
      }
    }
  }, [user]);



  const handleCheckout = () => {
    clearCart();
  };

  // Early return for Admin Mode to bypass customer Layout entirely
  if (isAdminMode && user?.role === 'admin') {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-primary font-bold text-xl">Loading Admin Panel...</div>
        </div>
      }>
        <DesktopGuard>
          <AdminPanel />
        </DesktopGuard>
      </Suspense>
    );
  }

  return (
    <Layout
      cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)}
      onOpenCart={() => setIsCartOpen(true)}
      searchTerm={filters.search}
      onSearch={(val) => handleFilterChange({ search: val })}

      suggestions={products}
      onLogin={() => setShowAuthModal(true)}
      onAdminClick={() => setIsAdminMode(true)}
      isAdminMode={isAdminMode}
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
            onOpenCategories={handleOpenCategories}
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
            <AuthForms onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

      {/* Profile Sidebar */}
      {isProfileOpen && !isAdminMode && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50"><div className="w-10 h-10 border-4 border-primary rounded-full animate-spin border-t-transparent"></div></div>}>
          <Profile
            onClose={() => setIsProfileOpen(false)}
            onTrackOrder={(order) => {
              setIsProfileOpen(false);
              setTrackingOrder(order);
            }}
          />
        </Suspense>
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

      {/* Main Routes - Wrapped in Global Suspense */}
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', color: 'var(--primary)' }}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
            <h2 className="font-bold text-xl">Loading...</h2>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={
            <>
              {/* User Actions Bar Removed - Now in Header */}

              <div className="absolute inset-0 w-full overflow-y-auto custom-scrollbar pb-40">
                {/* Hero / Banner Removed */}


                {/* Promotional Offers */}
                {!filters.search && <OfferBanners />}

                {/* Nearby Offers */}
                {!filters.search && <NearbyOffers />}

                {/* Category Filter */}
                {!filters.search && (
                  <div ref={categorySectionRef}>
                    <CategoryShowcase
                      activeCategory={filters.category}
                      onSelectCategory={(cat) => handleFilterChange({ category: cat })}
                    />
                  </div>
                )}

                {!filters.search && (
                  <FlashSaleSection
                    products={products}
                    onAdd={(p) => addToCart(p, 1)}
                    onClick={setSelectedProduct}
                  />
                )}

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', padding: '0 1rem' }} id="product-grid">
                  {/* Sidebar Removed */}

                  {/* Product Grid */}
                  <style>
                    {`
                        .responsive-product-grid {
                          display: grid;
                          grid-template-columns: repeat(3, 1fr);
                          gap: 0.5rem;
                          width: 100%;
                        }
                        @media (min-width: 640px) {
                          .responsive-product-grid {
                             grid-template-columns: repeat(3, 1fr);
                          }
                        }
                        @media (min-width: 1024px) {
                          .responsive-product-grid {
                             grid-template-columns: repeat(4, 1fr);
                          }
                        }
                      `}
                  </style>
                  <div className="responsive-product-grid" style={{ flex: 1 }}>
                    {filters.search && (
                      <h2 className="text-base font-bold mb-3 col-span-full" style={{ gridColumn: '1 / -1' }}>
                        Search Results for "{filters.search}"
                      </h2>
                    )}
                    {products.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onClick={setSelectedProduct}
                      />
                    ))}
                  </div>
                </div>
              </div>
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
          <Route path="/category/:categoryId" element={<CategoryProducts />} />
        </Routes>
      </Suspense>

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
