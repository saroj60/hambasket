import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useLocation as useGeoLocation } from '../context/LocationContext';

const Navbar = ({ onCartClick, onLoginClick }) => {
  const { user, logout } = useAuth();
  const { cartItems } = useContext(CartContext);
  const { location, openMap } = useGeoLocation();
  const routeLocation = useLocation();

  const isActive = (path) => routeLocation.pathname === path;

  console.log("Navbar User:", user); // Debugging
  console.log("Navbar Role:", user?.role); // Debugging

  const placeholders = ['Search "milk"', 'Search "bread"', 'Search "potato"', 'Search "egg"', 'Search "rice"', 'Search "beer"'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Desktop/Tablet Header */}
      <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content header-container">
            {/* Logo */}
            <Link to="/" className="header-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/brand_logo.png" alt="Aone Kirana" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>Aone Kirana</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffdf00', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery in minutes ⚡</span>
              </div>
            </Link>

            {/* Location */}
            <div
              onClick={openMap}
              className="location-selector mobile-header-right"
            >
              <span style={{ fontSize: '1.2rem' }}>📍</span>
              <div className="location-label-group" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span className="location-label" style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivering to</span>
                <span className="location-address" style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {location?.address?.split(',')[0] || 'Select Location'}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>▼</span>
            </div>

            {/* Search Bar */}
            <div className="search-bar" style={{ display: 'flex', flexDirection: 'column' }}>
              {user && (
                <div className="mobile-visible" style={{
                  marginBottom: '8px',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: 'var(--text-main)',
                  alignSelf: 'flex-start',
                  paddingLeft: '4px'
                }}>
                  Hi {user.name ? user.name.split(' ')[0] : 'Guest'} 👋
                </div>
              )}

              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  placeholder={placeholders[placeholderIndex]}
                  className="search-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      window.location.href = `/?search=${e.target.value}`;
                    }
                  }}
                />
                {/* Back Button or Search Icon */}
                {routeLocation.pathname !== '/' ? (
                  <span
                    onClick={() => window.history.back()}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-main)',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      zIndex: 10
                    }}
                  >
                    ←
                  </span>
                ) : (
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="desktop-nav header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {!user ? (
                <button onClick={onLoginClick} className="btn" style={{ fontWeight: '600', color: 'white' }}>
                  Login
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: '600' }}>Hi, {user.name.split(' ')[0]}</span>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={logout} className="btn" style={{ color: 'var(--danger)' }}>Logout</button>
                </div>
              )}

              <button
                onClick={onCartClick}
                className="btn"
                style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-full)', gap: '0.5rem', backgroundColor: 'white', color: 'var(--primary)' }}
              >
                <span style={{ fontSize: '1.2rem' }}>🛒</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>My Cart</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                    {cartItems.length} items
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #f0f0f0',
        zIndex: 1000,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '8px 0',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))'
      }}>
        <Link to="/" style={{ textDecoration: 'none', color: isActive('/') ? '#7c3aed' : '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span style={{ fontSize: '0.7rem', fontWeight: isActive('/') ? '600' : '500' }}>Home</span>
        </Link>

        {/* Categories - linking to generic category or keeping dummy */}
        <div style={{ cursor: 'pointer', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} onClick={() => window.location.href = '#/category/Fresh%20Produce'}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span style={{ fontSize: '0.7rem', fontWeight: '500' }}>Category</span>
        </div>

        <div onClick={onCartClick} style={{ cursor: 'pointer', position: 'relative', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{
            position: 'absolute', top: '-4px', right: '30%',
            backgroundColor: '#ef4444', color: 'white',
            fontSize: '10px', padding: '0px 4px', borderRadius: '10px',
            fontWeight: 'bold', minWidth: '14px', textAlign: 'center'
          }}>
            {cartItems.length > 0 ? cartItems.length : ''}
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span style={{ fontSize: '0.7rem', fontWeight: '500' }}>Cart</span>
        </div>

        <div onClick={user ? () => { } : onLoginClick} style={{ cursor: 'pointer', color: user ? '#7c3aed' : '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span style={{ fontSize: '0.7rem', fontWeight: user ? '600' : '500' }}>{user ? 'Profile' : 'Login'}</span>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
