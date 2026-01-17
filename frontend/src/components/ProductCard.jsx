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
      className="flex flex-col h-full gap-2 p-0 bg-transparent"
      onClick={() => onClick(product)}
    >

      {/* 1. Image Container (The "Box") */}
      <div className="relative w-full aspect-square bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center p-2">

        {/* Discount Badge */}
        {(isFlashSaleActive || discount > 0) && (
          <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-br-lg z-10 uppercase tracking-wide">
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
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-4xl">{product.emoji || '📦'}</div>
        )}
      </div>

      {/* 2. Content */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Timer / Delivery Pill */}
        <div className="bg-gray-100 w-fit px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-600 mb-1.5 flex items-center gap-1">
          <span>⏱</span> 8 MINS
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-semibold text-gray-900 leading-tight line-clamp-2 mb-1 min-h-[2.4em]">
          {product.name}
        </h3>

        {/* Weight */}
        <div className="text-[11px] text-gray-500 font-medium mb-3">
          {product.weight || '48 g'}
        </div>

        {/* Footer: Price & Add Button */}
        <div className="mt-auto flex items-end justify-between gap-1">
          {/* Price Stack */}
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-gray-400 line-through mb-0.5">₹{price + 20}</span>
            <span className="text-sm font-bold text-gray-900">₹{price}</span>
          </div>

          {/* ADD Button */}
          <div className="w-[70px] h-[32px] relative">
            {quantity > 0 ? (
              <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between w-full h-full bg-[#0c831f] text-white rounded-lg shadow-sm">
                <button onClick={handleDecrement} className="w-6 h-full flex items-center justify-center text-lg font-bold pb-1">-</button>
                <span className="text-xs font-bold">{quantity}</span>
                <button onClick={handleIncrement} className="w-6 h-full flex items-center justify-center text-lg font-bold pb-1">+</button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`
                  w-full h-full rounded-lg border text-xs font-bold tracking-wide uppercase shadow-sm transition-all active:scale-95
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
