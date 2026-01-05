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
    if (!user) return alert("Please login to subscribe (Regular Delivery)");
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
    console.log("Add clicked", { user, isOutOfStock });
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const isFlashSaleActive = product.flashSale?.active && new Date(product.flashSale.endTime) > new Date();
  const discount = isFlashSaleActive ? product.flashSale.discount : 0;
  const finalPrice = isFlashSaleActive ? Math.round(product.price * (1 - discount / 100)) : product.price;

  return (
    <div
      className="card product-card"
      style={{
        opacity: isOutOfStock ? 0.8 : 1,
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '0.75rem',
        height: '100%',
        backgroundColor: 'white'
      }}
      onClick={() => onClick(product)}
    >
      {/* Discount Tag */}
      {(isFlashSaleActive || discount > 0) && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          backgroundColor: '#535bf2', // Different blue for offers
          color: 'white',
          fontSize: '0.6rem',
          fontWeight: '800',
          padding: '2px 8px',
          borderTopLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          zIndex: 1,
          textTransform: 'uppercase'
        }}>
          {isFlashSaleActive ? `⚡ ${discount}% OFF` : '20% OFF'}
        </div>
      )}

      {/* Image Area */}
      <div className="product-image" style={{ height: '120px', marginBottom: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {product.image ? (
          <img
            src={
              product.image.startsWith('http') || product.image.startsWith('/assets') || product.image.startsWith('data:')
                ? product.image
                : `${BASE_URL}${product.image}`
            }
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <div style={{ fontSize: '3rem' }}>{product.emoji}</div>
        )}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          backgroundColor: '#f8f8f8',
          width: 'fit-content',
          padding: '2px 4px',
          borderRadius: '4px',
          marginBottom: '4px'
        }}>
          ⏳ 12 MINS
        </div>
        <h3 style={{
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#1c1c1c',
          marginBottom: '0.25rem',
          lineHeight: '1.2',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.2em'
        }}>
          {product.name}
        </h3>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          {product.weight || '1 unit'}
        </div>

        {/* Price & Add Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {isFlashSaleActive ? (
              <>
                <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#999' }}>Rs {product.price}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1c1c1c' }}>Rs {finalPrice}</span>
              </>
            ) : (
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1c1c1c' }}>Rs {product.price}</span>
            )}
          </div>

          {/* ADD Button - Blinkit Style */}
          <div style={{ width: '70px', height: '32px' }}>
            {quantity > 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--primary)',
                borderRadius: '6px',
                height: '100%',
                color: 'white',
                fontWeight: '700',
                fontSize: '0.9rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <button onClick={handleDecrement} style={{ border: 'none', background: 'transparent', color: 'white', padding: '0 8px', height: '100%', cursor: 'pointer' }}>-</button>
                <span>{quantity}</span>
                <button onClick={handleIncrement} style={{ border: 'none', background: 'transparent', color: 'white', padding: '0 8px', height: '100%', cursor: 'pointer' }}>+</button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: isOutOfStock ? '#f0f0f0' : '#f7fff9',
                  border: `1px solid ${isOutOfStock ? '#ccc' : 'var(--primary)'}`,
                  color: isOutOfStock ? '#999' : 'var(--primary)',
                  borderRadius: '6px',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {isOutOfStock ? 'SOLD' : 'ADD'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
