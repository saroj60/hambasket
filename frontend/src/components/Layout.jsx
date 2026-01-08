import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import NotificationBell from './NotificationBell';
import LocationModal from './LocationModal';
import MapAddressSelector from './MapAddressSelector';

const Layout = ({ children, cartCount, onOpenCart, searchTerm, onSearch, suggestions = [], bottomNav, onLogin }) => {
  const { location, openModal, mapState, closeMap, updateLocation } = useLocation();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      {/* Blinkit-style Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="container header-container" style={{ display: 'flex', alignItems: 'center', height: '80px', gap: '2rem' }}>
          {/* Logo */}
          <Link to="/" className="header-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            {/* Using text logo for now if image fails, or the brand logo */}
            <h1 style={{ fontWeight: '900', fontSize: '2rem', color: 'var(--brand-yellow)', letterSpacing: '-1px', textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>Aone Shop</h1>
          </Link>

          {/* Location Block */}
          <div onClick={openModal} className="location-block" style={{ cursor: 'pointer', minWidth: '200px' }}>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', lineHeight: '1.2' }}>Delivery in minutes</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
              {location?.address ? location.address : "Select Location"} <span style={{ fontSize: '0.6rem' }}>▼</span>
            </div>
          </div>

          {/* Search Bar - Big & Central */}
          <div style={{ flex: 1, position: 'relative' }}>
            <form onSubmit={handleSearch}>
              <div style={{ position: 'relative', width: '100%' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder='Search "milk"'
                  value={searchTerm}
                  onChange={(e) => {
                    onSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem 0.9rem 3rem',
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0',
                    backgroundColor: '#f8f8f8',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
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

      {/* Footer */}
      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '3rem 0', marginTop: 'auto', width: '100%' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--primary)' }}>Aone Shop</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Fresh groceries delivered to your doorstep in minutes. Quality you can trust.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, color: '#9ca3af', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About Us</Link></li>
              <li><Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</Link></li>
              <li><Link to="/faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</Link></li>
              <li><Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Contact</h4>
            <ul style={{ listStyle: 'none', padding: 0, color: '#9ca3af', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>📍 Tikathali, Lalitpur</li>
              <li>📞 +977 9815769007</li>
              <li>📧 sarojbhagat666@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="container" style={{ borderTop: '1px solid #374151', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
          © 2024 Aone Shop. All rights reserved.
        </div>
      </footer>

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
