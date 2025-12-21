import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import NotificationBell from './NotificationBell';
import LocationModal from './LocationModal';
import MapAddressSelector from './MapAddressSelector';

const Layout = ({ children, cartCount, onOpenCart, searchTerm, onSearch, suggestions = [], bottomNav }) => {
  const { location, openModal, mapState, closeMap, updateLocation } = useLocation();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container header-content">
          {/* Logo */}
          <Link to="/" className="header-logo" style={{ textDecoration: 'none' }}>
            <img src="/brand_logo.png" alt="Hamket" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          </Link>

          {/* Location Selector */}
          <div onClick={openModal} className="location-selector" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            minWidth: '150px', // Reduced minWidth
            maxWidth: '100%', // Ensure it doesn't overflow parent
            flex: 1 // Allow it to shrink/grow
          }}>
            <span style={{ fontSize: '1.2rem' }}>📍</span>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Delivering to</span>
              <span style={{
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px' // Explicitly limit text width
              }}>
                {location?.address || "Select Location"}
              </span>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--text-light)' }}>▼</span>
          </div>

          {/* Search Bar */}
          <form className="search-bar" onSubmit={handleSearch} style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => {
                  onSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem', // Removed padding right for mic
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border)',
                  backgroundColor: '#f9fafb',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
              />
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}>🔍</span>


            </div>

            {/* Auto-suggest Dropdown */}
            {showSuggestions && searchTerm && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                marginTop: '0.5rem',
                zIndex: 100,
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid var(--border)'
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
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{product.emoji}</span>
                    <div>
                      <div style={{ fontWeight: '500' }}>{product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{product.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Actions */}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <NotificationBell />
            <button
              onClick={onOpenCart}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
            >
              🛒
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-10px',
                  backgroundColor: 'var(--danger)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center'
                }}>
                  {cartCount}
                </span>
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--primary)' }}>Hamket</h3>
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
              <li>📍 Thamel, Kathmandu</li>
              <li>📞 +977 9815769007</li>
              <li>📧 support@hamket.com</li>
            </ul>
          </div>
        </div>
        <div className="container" style={{ borderTop: '1px solid #374151', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
          © 2024 Hamket. All rights reserved.
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
