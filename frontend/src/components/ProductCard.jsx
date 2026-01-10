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
        border: 'none', /* No outer border */
        boxShadow: 'none', /* No outer shadow */
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: '0', /* Remove padding from outer container */
        height: '100%',
        backgroundColor: 'transparent',
        gap: '0.5rem'
      }}
      onClick={() => onClick(product)}
    >

      {/* Image Area - The "Box" */}
      <div className="product-image" style={{
        height: '100px', /* Slightly taller to accommodate badge */
        position: 'relative',
        borderRadius: '12px',
        border: '1px solid #e0e0e0', /* The Box Border */
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        overflow: 'hidden' /* Clip the badge */
      }}>

        {/* Blue Discount Badge (Inside Image Box) */}
        {(isFlashSaleActive || discount > 0) && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            backgroundColor: '#2563eb', /* Royal Blue */
            color: 'white',
            fontSize: '0.6rem',
            fontWeight: '900',
            padding: '2px 6px',
            borderBottomRightRadius: '10px',
            zIndex: 1,
            textTransform: 'uppercase',
          }}>
            {isFlashSaleActive ? `${discount}% OFF` : '12% OFF'}
          </div>
        )}

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
          <div style={{ fontSize: '2.5rem' }}>{product.emoji}</div>
        )}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Timer Pill */}
        <div style={{
          fontSize: '0.6rem',
          color: '#333',
          fontWeight: '700',
          backgroundColor: '#f3f4f6',
          width: 'fit-content',
          padding: '2px 6px',
          borderRadius: '4px',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          <span>⏱</span> 8 MINS
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '0.85rem',
          fontWeight: '700',
          color: '#1c1c1c',
          marginBottom: '0.1rem',
          lineHeight: '1.2',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.4em'
        }}>
          {product.name}
        </h3>

        {/* Weight */}
        <div style={{ fontSize: '0.75rem', color: '#828282', marginBottom: '0.5rem', fontWeight: '500' }}>
          {product.weight || '48 g'}
        </div>

        {/* Price & Add Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
            <span style={{ fontSize: '0.7rem', textDecoration: 'line-through', color: '#999', marginBottom: '2px' }}>₹{product.price + 20}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1c1c1c' }}>₹{product.price}</span>
          </div>

          {/* ADD Button - Green Outline (Screenshot Match) */}
          <div style={{ width: '65px', height: '30px' }}>
            {quantity > 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#0c831f', /* Blinkit Green */
                borderRadius: '6px',
                height: '100%',
                color: 'white',
                fontWeight: '800',
                fontSize: '0.8rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <button onClick={handleDecrement} style={{ border: 'none', background: 'transparent', color: 'white', padding: '0 6px', height: '100%', cursor: 'pointer' }}>-</button>
                <span>{quantity}</span>
                <button onClick={handleIncrement} style={{ border: 'none', background: 'transparent', color: 'white', padding: '0 6px', height: '100%', cursor: 'pointer' }}>+</button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: isOutOfStock ? '#f0f0f0' : 'white',
                  border: `1px solid ${isOutOfStock ? '#ccc' : '#0c831f'}`, /* Green Border */
                  color: isOutOfStock ? '#999' : '#0c831f', /* Green Text */
                  borderRadius: '6px',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  boxShadow: '0 1px 1px rgba(0,0,0,0.05)'
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
