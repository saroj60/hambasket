import React, { useContext } from 'react';
import { API_URL, BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product, onClick }) => {
  const { user, wishlist, addToWishlist, removeFromWishlist } = useAuth();
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const isOutOfStock = product.stock <= 0;

  const cartItem = cartItems.find(item => item._id === product._id);
  const quantity = cartItem ? cartItem.qty : 0;

  const handleSubscribe = async (e) => {
    e.stopPropagation();
    if (!user) return alert("Please login to subscribe");
    try {
      const res = await fetch(`${API_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          items: [{ product: product._id, quantity: 1 }],
          frequency: 'weekly'
        })
      });
      if (res.ok) alert(`Subscribed to ${product.name} (Weekly)!`);
      else alert("Failed to subscribe");
    } catch (err) {
      alert("Failed to subscribe");
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity > 1) {
      addToCart(product, -1);
    } else {
      removeFromCart(product._id);
    }
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!isOutOfStock) addToCart(product, 1);
  };

  const isFlashSaleActive = product.flashSale?.active && new Date(product.flashSale.endTime) > new Date();
  const discount = isFlashSaleActive ? product.flashSale.discount : 0;
  const finalPrice = isFlashSaleActive ? Math.round(product.price * (1 - discount / 100)) : product.price;

  return (
    <div
      className="card product-card"
      style={{ opacity: isOutOfStock ? 0.8 : 1 }}
      onClick={() => onClick(product)}
    >
      {/* Discount Tag */}
      {(isFlashSaleActive || discount > 0) && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '0',
          backgroundColor: '#ef4444',
          color: 'white',
          fontSize: '0.65rem',
          fontWeight: '700',
          padding: '2px 8px',
          borderTopRightRadius: '4px',
          borderBottomRightRadius: '4px',
          zIndex: 1
        }}>
          {isFlashSaleActive ? `⚡ ${discount}% OFF` : 'GET 20% OFF'}
        </div>
      )}

      {/* Wishlist Heart */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!user) return alert("Please login to use wishlist");
          if (wishlist.includes(product._id)) {
            removeFromWishlist(product._id);
          } else {
            addToWishlist(product._id);
          }
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          color: wishlist.includes(product._id) ? '#ef4444' : '#9ca3af'
        }}
      >
        ♥
      </button>

      {/* Image Area */}
      <div className="product-image">
        {product.image ? (
          <img
            src={
              product.image.startsWith('http') || product.image.startsWith('/assets')
                ? product.image
                : `${BASE_URL}${product.image}`
            }
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }}
          />
        ) : (
          product.emoji
        )}
        {isOutOfStock && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--danger)', fontWeight: '800', fontSize: '1rem',
            borderRadius: 'var(--radius-md)'
          }}>
            OUT OF STOCK
          </div>
        )}
      </div>

      {/* DEBUG: Show raw image path */}
      <div style={{ fontSize: '10px', color: 'red', wordBreak: 'break-all' }}>
        DEBUG: {product.image}
      </div>

      {/* Veg Indicator */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.25rem' }}>
        <div style={{
          width: '12px',
          height: '12px',
          border: '1px solid #16a34a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1px'
        }}>
          <div style={{ width: '6px', height: '6px', backgroundColor: '#16a34a', borderRadius: '50%' }}></div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 className="product-title" style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
          {product.name}
        </h3>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          {/* Hide weight on very small screens if needed, or keep small */}
          {product.weight}
        </p>

        <div className="product-actions">
          <div style={{ flex: 1, lineHeight: 1 }}>
            {isFlashSaleActive ? (
              <>
                <div style={{ fontSize: '0.65rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  Rs. {product.price}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ef4444' }}>
                  Rs. {finalPrice}
                </div>
              </>
            ) : (
              <>
                {/* Only show one price if no discount to save space */}
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  Rs. {product.price}
                </div>
              </>
            )}
          </div>

          {/* Add / Quantity Button - Compact */}
          {quantity > 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              height: '30px', /* Smaller height */
              width: '100%',
              maxWidth: '80px',
              justifyContent: 'space-between'
            }}>
              <button
                onClick={handleDecrement}
                style={{
                  padding: '0 6px',
                  color: 'white',
                  fontWeight: 'bold',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  height: '100%',
                  fontSize: '1rem'
                }}
              >
                -
              </button>
              <span style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.8rem'
              }}>
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                style={{
                  padding: '0 6px',
                  color: 'white',
                  fontWeight: 'bold',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  height: '100%',
                  fontSize: '1rem'
                }}
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="btn btn-outline"
              style={{
                fontWeight: '800',
                color: isOutOfStock ? 'var(--text-muted)' : 'var(--primary)',
                borderColor: isOutOfStock ? 'var(--border)' : 'var(--primary)',
                borderWidth: '1px',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                backgroundColor: isOutOfStock ? '#f3f4f6' : '#f0fdf4', /* Light green tint when idle */
                height: '32px',
                width: '100%',
                maxWidth: '70px',
                fontSize: '0.8rem',
                padding: '0',
                boxShadow: isOutOfStock ? 'none' : '0 2px 5px rgba(0,184,83,0.1)'
              }}
            >
              {isOutOfStock ? 'SOLD' : 'ADD'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
