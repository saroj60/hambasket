import React, { useState } from 'react';
import { Link, useLocation as useRouteLocation, useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import LocationModal from './LocationModal';
import MapAddressSelector from './MapAddressSelector';

const Layout = ({ children, cartCount, onOpenCart, searchTerm, onSearch, suggestions = [], bottomNav, onLogin, onAdminClick, isAdminMode, onOpenProfile }) => {
  const { location, openModal, mapState, closeMap, updateLocation } = useLocation();
  const { user, logout } = useAuth();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const routeLocation = useRouteLocation();
  const navigate = useNavigate();

  // Scroll Logic
  const mainRef = React.useRef(null);
  const headerRef = React.useRef(null);
  const topRowRef = React.useRef(null);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = React.useRef(0);
  const [topRowHeight, setTopRowHeight] = useState(0);

  const isHomePage = routeLocation.pathname === '/';

  React.useLayoutEffect(() => {
    if (topRowRef.current) {
      setTopRowHeight(topRowRef.current.offsetHeight);
    }
  }, [searchTerm, user, routeLocation.pathname]);

  React.useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    // Reset header on route change
    if (!isHomePage) {
      setShowHeader(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = mainEl.scrollTop;

      // If at top, always show
      if (currentScrollY < 10) {
        setShowHeader(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Determine direction
      // Collapse when scrolling down (> 50px), Expand when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    mainEl.addEventListener('scroll', handleScroll);
    return () => mainEl.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);


  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  // ... (rest of useEffects) ...

  const placeholders = ['Search "milk"', 'Search "bread"', 'Search "potato"', 'Search "egg"', 'Search "rice"', 'Search "beer"'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)', overflow: 'hidden' }}>
      {/* Header */}
      <header
        ref={headerRef}
        className="main-header"
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'box-shadow 0.3s ease'
        }}
      >
        <div style={{ maxWidth: '100%', margin: '0 auto' }}>

          {/* Collapsible Top Row Container */}
          <div style={{
            height: isHomePage && !showHeader ? 0 : (topRowHeight ? `${topRowHeight}px` : 'auto'),
            opacity: isHomePage && !showHeader ? 0 : 1,
            overflow: 'hidden',
            transition: 'height 0.3s ease-in-out, opacity 0.3s ease-in-out'
          }}>
            {/* Row 1: Logo & Location & Profile */}
            <div
              ref={topRowRef}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 10px', flexWrap: 'nowrap' }}
            >

              {/* Logo */}
              <Link to="/" className="header-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: '6px' }}>
                <h1 style={{ fontWeight: '900', fontSize: 'clamp(1.1rem, 3.5vw, 1.6rem)', color: 'var(--brand-yellow)', letterSpacing: '-0.5px', margin: 0, lineHeight: 1, whiteSpace: 'nowrap' }}>
                  Aone <span style={{ color: '#6b21a8' }}>Kirana</span>
                </h1>
              </Link>

              {/* Right Actions: Location + Profile */}
              <div className="mobile-header-right" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 1, minWidth: 0, justifyContent: 'flex-end' }}>

                {/* Location */}
                <div onClick={openModal} style={{ textAlign: 'right', cursor: 'pointer', flexShrink: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div className="delivery-text" style={{ fontWeight: '800', fontSize: '0.65rem', color: '#1f2937', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                    Delivery in mins
                  </div>
                  <div className="location-subtext" style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', maxWidth: '100%' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                      {location?.address ? location.address.split(',')[0] : "Select"}
                    </span>
                    <span style={{ fontSize: '0.7rem', flexShrink: 0 }}>▼</span>
                  </div>
                </div>

                {/* Profile Icon with Dropdown */}
                <div style={{ position: 'relative' }}>
                  <div
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <>
                      <div
                        style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                        onClick={() => setIsProfileMenuOpen(false)}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '120%',
                        right: 0,
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        width: '220px',
                        zIndex: 100,
                        border: '1px solid #f3f4f6',
                        overflow: 'hidden'
                      }}>
                        {/* User Info Header */}
                        <div style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1f2937' }}>
                            {user?.name || location?.receiverName || 'Guest'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {user?.phone || user?.email || location?.receiverPhone || ''}
                          </div>
                        </div>

                        {/* Menu Items */}
                        {/* <div
                        onClick={() => { setIsProfileMenuOpen(false); onOpenProfile && onOpenProfile(); }}
                        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '0.9rem' }}
                        className="hover:bg-gray-50"
                      >
                        📦 Your Orders
                      </div> */}

                        <div
                          onClick={() => { setIsProfileMenuOpen(false); openModal(); }}
                          style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '0.9rem' }}
                          className="hover:bg-gray-50"
                        >
                          📍 Location
                        </div>

                        <div
                          onClick={() => { setIsProfileMenuOpen(false); navigate('/contact'); }}
                          style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '0.9rem' }}
                          className="hover:bg-gray-50"
                        >
                          🎧 Help & Support
                        </div>

                        {user && (
                          <div
                            onClick={handleLogout}
                            style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.9rem', borderTop: '1px solid #f3f4f6' }}
                            className="hover:bg-red-50"
                          >
                            🚪 Logout
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

              </div>

              {/* Admin Button - Visible if Admin */}
              {user?.role === 'admin' && (
                <div
                  onClick={onAdminClick}
                  className="hidden md:flex"
                  style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#ef4444' }}>Admin</span>
                </div>
              )}

              {/* Login Button - Visible on Desktop */}
              <div
                onClick={user ? () => navigate('/profile') : onLogin}
                className="hidden md:flex"
                style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#374151' }}>{user ? 'Profile' : 'Login'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Search Bar */}
        {!isAdminMode && (
          <div className="search-container" style={{ padding: '0 16px 12px 16px' }}>
            <form onSubmit={handleSearch} style={{ width: '100%' }}>
              <div style={{ position: 'relative', width: '100%' }}>

                {/* Icons inside Search */}
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                  {routeLocation.pathname !== '/' ? (
                    <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '4px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                    </div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>

                <input
                  type="text"
                  placeholder={placeholders[placeholderIndex]}
                  value={searchTerm}
                  onChange={(e) => {
                    onSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid transparent',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    color: '#1f2937',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxShadow: 'none'
                  }}
                  onKeyDown={(e) => {
                    // Add focus style manually or handle via class if possible
                  }}
                />

                {/* Clear Button */}
                {searchTerm && (
                  <div
                    onClick={() => onSearch("")}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', padding: '4px' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </div>
                )}
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchTerm && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {suggestions.slice(0, 5).map(product => (
                  <div
                    key={product._id}
                    onClick={() => {
                      onSearch(product.name);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderTop: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{product.emoji}</span>
                    <div>
                      <div style={{ fontWeight: '500', color: '#374151' }}>{product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{product.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main
        ref={mainRef}
        className="container"
        style={{
          flex: 1,
          padding: '0',
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          position: 'relative',
          paddingBottom: '80px',
          paddingTop: 0,
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {bottomNav}

      <LocationModal />
      {mapState.isOpen && (
        <MapAddressSelector
          initialLocation={mapState.initialCoordinates}
          onConfirm={(data) => updateLocation(data.address, data.coordinates, {
            receiverName: data.receiverName,
            receiverPhone: data.receiverPhone
          })}
          onCancel={closeMap}
        />
      )}
    </div>
  );
};

export default Layout;
