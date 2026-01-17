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
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const isFlashSaleActive = product.flashSale?.active && new Date(product.flashSale.endTime) > new Date();
  const discount = isFlashSaleActive ? product.flashSale.discount : 0;
  const price = product.price;

  return (
    <div
      className="flex flex-col h-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] relative"
      onClick={() => onClick(product)}
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Discount Badge */}
      {(isFlashSaleActive || discount > 0) && (
        <div className="absolute top-0 left-0 bg-[#2563eb] text-white text-[9px] font-black px-1.5 py-0.5 rounded-br-lg z-10 uppercase tracking-wide shadow-sm">
          {isFlashSaleActive ? `${discount}% OFF` : '12% OFF'}
        </div>
      )}

      {/* 1. Image Container */}
      <div className="w-full h-[120px] bg-white flex items-center justify-center p-4 relative">
        {/* Timer Tag floating inside image area */}
        <div className="absolute bottom-1 left-1 bg-gray-50/90 backdrop-blur-[2px] border border-gray-100 px-1.5 py-0.5 rounded-[6px] text-[8px] font-bold text-gray-500 flex items-center gap-0.5">
          <span>⏱</span> 8M
        </div>

        {product.image ? (
          <img
            src={
              product.image.startsWith('http') || product.image.startsWith('/assets') || product.image.startsWith('data:')
                ? product.image
                : `${BASE_URL}${product.image}`
            }
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-sm"
          />
        ) : (
          <div className="text-3xl">{product.emoji || '📦'}</div>
        )}
      </div>

      {/* 2. Content */}
      <div className="flex flex-col flex-1 px-2 pb-2 pt-0 gap-1 bg-white">
        {/* Title */}
        <h3 className="text-[11px] font-bold text-gray-800 leading-tight line-clamp-2 min-h-[2.5em]">
          {product.name}
        </h3>

        {/* Weight */}
        <div className="text-[10px] text-gray-400 font-medium">
          {product.weight || '500 g'}
        </div>

        {/* Footer: Price & Add Button */}
        <div className="mt-auto flex items-center justify-between pt-1">
          {/* Price Stack */}
          <div className="flex flex-col leading-none">
            <span className="text-[9px] text-gray-400 line-through">₹{price + 20}</span>
            <span className="text-[12px] font-extrabold text-gray-900">₹{price}</span>
          </div>

          {/* ADD Button */}
          <div className="w-[64px] h-[28px] relative">
            {quantity > 0 ? (
              <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between w-full h-full bg-[#16a34a] text-white rounded-lg shadow-sm">
                <button onClick={handleDecrement} className="w-6 h-full flex items-center justify-center text-sm font-bold pb-0.5">-</button>
                <span className="text-[10px] font-bold">{quantity}</span>
                <button onClick={handleIncrement} className="w-6 h-full flex items-center justify-center text-sm font-bold pb-0.5">+</button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`
                  w-full h-full rounded-lg border text-[10px] font-extrabold tracking-wide uppercase shadow-sm transition-all active:scale-95 flex items-center justify-center
                  ${isOutOfStock
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-[#15803d] bg-[#f0fdf4] text-[#15803d] hover:bg-[#15803d] hover:text-white'
                  }
                `}
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
