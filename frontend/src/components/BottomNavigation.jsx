import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNavigation = ({ cartCount, onOpenCart, onOpenProfile, isAdminMode, setIsAdminMode }) => {
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path) => location.pathname === path;

    const handleHomeClick = () => {
        if (setIsAdminMode) setIsAdminMode(false);
    };

    return (
        <div className="bottom-nav" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0.5rem',
            zIndex: 100,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
        }}>
            <Link to="/" onClick={handleHomeClick} style={{ textDecoration: 'none', color: isActive('/') && !isAdminMode ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>🏠</span>
                <span>Home</span>
            </Link>

            <div onClick={() => { handleHomeClick(); onOpenCart(); }} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.75rem', position: 'relative' }}>
                <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>🛒</span>
                <span>Cart</span>
                {cartCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: 'var(--danger)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '1px 5px',
                        borderRadius: '10px',
                        minWidth: '16px',
                        textAlign: 'center'
                    }}>
                        {cartCount}
                    </span>
                )}
            </div>

            <div onClick={() => { handleHomeClick(); onOpenProfile(); }} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>👤</span>
                <span>{user ? 'Profile' : 'Login'}</span>
            </div>

            {user && user.role === 'admin' && (
                <div
                    onClick={() => setIsAdminMode && setIsAdminMode(true)}
                    style={{
                        cursor: 'pointer',
                        color: isAdminMode ? 'var(--primary)' : 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '0.75rem'
                    }}
                >
                    <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>🛡️</span>
                    <span>Admin</span>
                </div>
            )}
        </div>
    );
};

export default BottomNavigation;
