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
      className="flex flex-col h-full bg-white relative gap-2"
      onClick={() => onClick(product)}
    >
      {/* 1. Image Container - Separate Box with Border */}
      <div className="w-full h-[120px] bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden">
        {/* Discount Badge */}
        {(isFlashSaleActive || discount > 0) && (
          <div className="absolute top-0 left-0 bg-[#2563eb] text-white text-[9px] font-black px-1.5 py-0.5 rounded-br-lg z-10 uppercase tracking-wide">
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
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-3xl">{product.emoji || '📦'}</div>
        )}
      </div>

      {/* 2. Content Section */}
      <div className="flex flex-col flex-1 gap-1 px-2 pb-2">
        {/* Timer Tag */}


        {/* Title */}
        <h3 className="text-[12px] font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2.4em]">
          {product.name}
        </h3>



        {/* Footer: Price & Add Button */}
        <div className="mt-auto flex items-end justify-between pt-2 min-h-[32px]">
          {/* Price Stack */}
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-gray-400 line-through mb-0.5">Rs. {price + 20}</span>
            <span className="text-[14px] font-black text-gray-900">Rs. {price} <span className="text-[10px] text-gray-500 font-normal">/ {product.unit || 'pcs'}</span></span>
          </div>

          {/* ADD Button */}
          <div className="w-[70px] h-[30px] relative">
            {product.variants && product.variants.length > 0 ? (
              // Variant Product: Always show OPTIONS
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(product); // Trigger modal
                }}
                className="w-full h-full rounded-lg text-[10px] font-bold uppercase transition-all active:scale-95 flex items-center justify-center border border-purple-600 bg-purple-50 text-purple-700 shadow-sm"
              >
                Options
              </button>
            ) : (
              // Regular Product: Add/Counter
              quantity > 0 ? (
                <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between w-full h-full bg-[#16a34a] text-white rounded-lg shadow-sm">
                  <button onClick={handleDecrement} className="w-6 h-full flex items-center justify-center text-lg font-bold pb-1">-</button>
                  <span className="text-[12px] font-bold">{quantity}</span>
                  <button onClick={handleIncrement} className="w-6 h-full flex items-center justify-center text-lg font-bold pb-1">+</button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className={`
                    w-full h-full rounded-lg text-[12px] font-bold uppercase transition-all active:scale-95 flex items-center justify-center border
                    ${isOutOfStock
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-[#16a34a] bg-white text-[#16a34a] shadow-sm'
                    }
                    `}
                >
                  {isOutOfStock ? 'SOLD' : 'ADD'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
