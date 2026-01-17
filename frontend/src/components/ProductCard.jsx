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
      className="flex flex-col h-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative"
      onClick={() => onClick(product)}
    >
      {/* Discount Badge */}
      {(isFlashSaleActive || discount > 0) && (
        <div className="absolute top-0 left-0 bg-[#3b82f6] text-white text-[9px] font-black px-1.5 py-0.5 rounded-br-lg z-10 uppercase tracking-wide">
          {isFlashSaleActive ? `${discount}% OFF` : '12% OFF'}
        </div>
      )}

      {/* 1. Image Container */}
      <div className="w-full aspect-square bg-[#fff] flex items-center justify-center p-3 relative">
        {/* Timer Tag floating inside image area */}
        <div className="absolute bottom-1 left-1 bg-gray-100/90 backdrop-blur-[2px] px-1.5 py-0.5 rounded-[6px] text-[8px] font-bold text-gray-600 flex items-center gap-0.5">
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
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-3xl">{product.emoji || '📦'}</div>
        )}
      </div>

      {/* 2. Content */}
      <div className="flex flex-col flex-1 p-2 gap-1">
        {/* Title */}
        <h3 className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-2 h-[2.5em]">
          {product.name}
        </h3>

        {/* Weight */}
        <div className="text-[10px] text-gray-500 font-medium">
          {product.weight || '500 g'}
        </div>

        {/* Footer: Price & Add Button */}
        <div className="mt-auto flex items-center justify-between pt-2">
          {/* Price Stack */}
          <div className="flex flex-col leading-none">
            <span className="text-[9px] text-gray-400 line-through">₹{price + 20}</span>
            <span className="text-[12px] font-black text-gray-900">₹{price}</span>
          </div>

          {/* ADD Button */}
          <div className="w-[60px] h-[26px] relative">
            {quantity > 0 ? (
              <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between w-full h-full bg-[#0c831f] text-white rounded-md shadow-sm">
                <button onClick={handleDecrement} className="w-5 h-full flex items-center justify-center text-sm font-bold">-</button>
                <span className="text-[10px] font-bold">{quantity}</span>
                <button onClick={handleIncrement} className="w-5 h-full flex items-center justify-center text-sm font-bold">+</button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`
                  w-full h-full rounded-md border text-[10px] font-bold tracking-wide uppercase shadow-sm transition-all active:scale-95
                  ${isOutOfStock
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-[#0c831f] bg-[#f7fee7] text-[#0c831f] hover:bg-[#0c831f] hover:text-white'
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
