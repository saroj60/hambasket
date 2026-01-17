import React, { useState } from 'react';
import { Link, useLocation as useRouteLocation, useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import LocationModal from './LocationModal';
import MapAddressSelector from './MapAddressSelector';

const Layout = ({ children, cartCount, onOpenCart, searchTerm, onSearch, suggestions = [], bottomNav, onLogin, onAdminClick, isAdminMode }) => {
  const { location, openModal, mapState, closeMap, updateLocation } = useLocation();
  const { user } = useAuth();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const routeLocation = useRouteLocation();
  const navigate = useNavigate();

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
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: '100%', margin: '0 auto' }}>

          {/* Row 1: Logo & Location */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px 16px' }}>

            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <h1 style={{ fontWeight: '900', fontSize: '1.8rem', color: 'var(--brand-yellow)', letterSpacing: '-0.5px', margin: 0 }}>
                Aone <span style={{ color: '#6b21a8' }}>Kirana</span>
              </h1>
            </Link>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Location / Delivery Info */}
              <div onClick={openModal} style={{ textAlign: 'right', cursor: 'pointer' }}>
                <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#1f2937', letterSpacing: '0.5px' }}>
                  Delivery in minutes
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', maxWidth: '160px' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {location?.address ? location.address.split(',')[0] : "Select Location"}
                  </span>
                  <span style={{ fontSize: '0.7rem' }}>▼</span>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, padding: '0', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
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
