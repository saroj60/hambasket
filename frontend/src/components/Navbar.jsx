import React, { useContext } from 'react';
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

  return (
    <>
      {/* Desktop/Tablet Header */}
      <header style={{
        backgroundColor: 'var(--primary)',
        borderBottom: '1px solid var(--border)',
        borderTop: '4px solid',
        borderImage: 'var(--gradient-header) 1',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container">
          <div className="header-content">
            {/* Logo & Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
              <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src="/brand_logo.png" alt="Hamket" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
              </Link>

              <div
                onClick={openMap}
                className="location-selector"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  backgroundColor: '#f3f4f6', padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)', cursor: 'pointer',
                  maxWidth: '200px'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>📍</span>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivering to</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {location?.address?.split(',')[0] || 'Select Location'}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>▼</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search for products..."
                className="search-input"
              />
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
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
      <nav className="mobile-bottom-nav">
        <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </Link>

        <div className="nav-item" onClick={() => { }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Categories</span>
        </div>

        <div className="nav-item" onClick={onCartClick} style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '-8px', right: '0',
            backgroundColor: 'var(--danger)', color: 'white',
            fontSize: '0.6rem', padding: '2px 5px', borderRadius: '10px',
            fontWeight: 'bold'
          }}>
            {cartItems.length}
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>Cart</span>
        </div>

        <div className="nav-item" onClick={user ? () => { } : onLoginClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>{user ? 'Profile' : 'Login'}</span>
        </div>

        {user && user.role === 'admin' && (
          <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span>Admin</span>
          </Link>
        )}
      </nav>
    </>
  );
};

export default Navbar;
