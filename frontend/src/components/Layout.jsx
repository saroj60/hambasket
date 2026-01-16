import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import NotificationBell from './NotificationBell';
import LocationModal from './LocationModal';
import MapAddressSelector from './MapAddressSelector';

const Layout = ({ children, cartCount, onOpenCart, searchTerm, onSearch, suggestions = [], bottomNav, onLogin }) => {
  const { location, openModal, mapState, closeMap, updateLocation } = useLocation();
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="container header-container">

          {/* Mobile: App Name (Left) */}
          <Link to="/" className="header-logo mobile-visible" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <h1 style={{ fontWeight: '900', fontSize: '1.8rem', color: 'var(--brand-yellow)', letterSpacing: '-1px' }}>Aone Kirana</h1>
          </Link>

          {/* Location Block (Right) */}
          <div onClick={openModal} className="location-block mobile-header-right">
            <div className="delivery-text" style={{ fontWeight: '800', fontSize: '1.0rem', lineHeight: '1.2', color: 'black', textAlign: 'right' }}>
              Delivery in minutes
            </div>
            <div className="location-subtext" style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
              {location?.address ? location.address.split(',')[0] : "Select Location"} <span style={{ fontSize: '0.6rem' }}>▼</span>
            </div>
          </div>

          {/* Desktop Only: Full Location Block (Hidden on Mobile if using above) */}
          {/* Note: We can reuse the same block for desktop if styled right, but for now keeping mobile-header-right distinct for grid placement if needed, or merging. 
              Let's use the one block above for Mobile Right and Desktop Right (with adjustments). 
              Actually, simpler to keep the structure: Logo (Left), Location (Right).
          */}

          {/* Desktop Logo (Hidden on Mobile) */}
          <Link to="/" className="header-logo mobile-hidden">
            <h1 style={{ fontWeight: '900', fontSize: '2rem', color: 'var(--brand-yellow)', letterSpacing: '-1px' }}>Aone Kirana</h1>
          </Link>

          {/* Desktop Location (Hidden on Mobile) */}
          <div onClick={openModal} className="location-block desktop-only" style={{ cursor: 'pointer', minWidth: '200px' }}>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', lineHeight: '1.2' }}>Delivery in minutes</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {location?.address ? location.address : "Select Location"} <span style={{ fontSize: '0.6rem' }}>▼</span>
            </div>
          </div>

          {/* Search Bar - Big & Central */}
          <div className="search-container">
            <form onSubmit={handleSearch} style={{ width: '100%' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                {searchTerm ? (
                  <div
                    onClick={() => {
                      onSearch("");
                      setShowSuggestions(false);
                    }}
                    className="search-icon"
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </div>
                ) : (
                  <span className="search-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                )}
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
                  className="search-input-field"
                />
              </div>
            </form>

            {/* Auto-suggest Dropdown */}
            {showSuggestions && searchTerm && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderRadius: '0 0 12px 12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                marginTop: '0',
                zIndex: 100,
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #f0f0f0',
                borderTop: 'none'
              }}>
                {suggestions.slice(0, 5).map(product => (
                  <div
                    key={product._id}
                    onClick={() => {
                      onSearch(product.name);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f8f8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{product.emoji}</span>
                    <div>
                      <div style={{ fontWeight: '500' }}>{product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Login / Cart Actions */}
          <div className="header-actions">
            <button onClick={onLogin} style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-main)', cursor: 'pointer' }}>
              Login
            </button>
            <button
              onClick={onOpenCart}
              className="btn"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '8px',
                padding: '0.8rem 1.5rem',
                gap: '0.5rem',
                fontWeight: '700'
              }}
            >
              🛒 My Cart
              {cartCount > 0 && (
                <div style={{ padding: '0px 6px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', fontSize: '0.9rem' }}>
                  {cartCount}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, padding: '2rem 0', width: '100%' }}>
        {children}
      </main>



      {/* Bottom Navigation */}
      {bottomNav}

      <LocationModal />
      {mapState.isOpen && (
        <MapAddressSelector
          initialLocation={mapState.initialCoordinates}
          onConfirm={(data) => updateLocation(data.address, data.coordinates)}
          onCancel={closeMap}
        />
      )}
    </div>
  );
};

export default Layout;
