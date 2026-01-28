import React, { useContext } from 'react';
import { BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product, onClick }) => {
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
  const price = product.price;
  const originalPrice = product.originalPrice || (product.discount > 0 ? (product.originalPrice || (price + 20)) : null); // Fallback logic or explicit field

  let discountPercentage = 0;
  if (isFlashSaleActive) {
    discountPercentage = product.flashSale.discount;
  } else if (originalPrice > price) {
    discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  return (
    <div
      className="group flex flex-col h-[280px] w-full bg-white rounded-xl overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-lg hover:border-purple-100 relative"
      onClick={() => onClick(product)}
    >
      {/* Discount Badge */}
      {(discountPercentage > 0) && (
        <div className="absolute top-0 left-0 bg-[#2563eb] text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10 shadow-sm">
          {discountPercentage}% OFF
        </div>
      )}

      {/* 1. Image Area - Fixed Height for Uniformity */}
      <div className="w-full h-[140px] bg-white p-3 flex items-center justify-center relative shrink-0 mb-2">
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase">
              Out of Stock
            </span>
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
            className={`h-full w-full object-contain transition-transform duration-300 group-hover:scale-110 will-change-transform ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
          />
        ) : (
          <div className="text-4xl">📦</div>
        )}
      </div>

      {/* 2. Content Section - Equal Spacing */}
      <div className="flex flex-col flex-1 px-3 pb-3 min-h-0">

        {/* Title: Stronger Font, Fixed Lines */}
        <h3 className={`text-[13px] font-bold text-gray-900 leading-tight line-clamp-2 mb-1 group-hover:text-purple-700 transition-colors h-[32px] ${isOutOfStock ? 'text-gray-500' : ''}`}>
          {product.name}
        </h3>

        {/* Weights/Units - Below Name */}
        <div className="text-[11px] text-gray-500 mb-2 font-medium">
          {product.weight} {product.unit}
        </div>


        {/* Footer: Price & Action - Pushed to bottom */}
        <div className="mt-auto flex items-end justify-between w-full">

          {/* Price Stack */}
          <div className="flex flex-col leading-none mb-1">
            {(originalPrice > price) && (
              <span className="text-[10px] text-gray-400 line-through mb-0.5">
                Rs {originalPrice}
              </span>
            )}
            <div className="flex items-center gap-0.5">
              <span className="text-[14px] font-bold text-gray-900">
                Rs {price}
              </span>
            </div>
          </div>

          {/* ADD Button - Compact, Bottom Right */}
          <div className="w-[75px] h-[28px] shrink-0">
            {product.variants && product.variants.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(product);
                }}
                className="w-full h-full rounded text-[11px] font-bold uppercase border border-green-600 text-green-700 bg-white hover:bg-green-50 transition-colors active:scale-95 flex items-center justify-center"
              >
                Select
              </button>
            ) : (
              quantity > 0 && !isOutOfStock ? (
                /* Counter for Quantity > 0 */
                <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between w-full h-full bg-green-600 text-white rounded shadow-sm overflow-hidden border border-green-600">
                  <button onClick={handleDecrement} className="w-6 h-full flex items-center justify-center hover:bg-green-700 transition-colors text-lg active:scale-90 pb-0.5">-</button>
                  <span className="text-[11px] font-bold">{quantity}</span>
                  <button onClick={handleIncrement} className="w-6 h-full flex items-center justify-center hover:bg-green-700 transition-colors text-lg active:scale-90 pb-0.5">+</button>
                </div>
              ) : (
                /* ADD Button Default */
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock || (isFlashSaleActive && product.flashSale.sold >= product.flashSale.quantity)}
                  className={`
                        w-full h-full rounded text-[10px] font-bold uppercase transition-all shadow-sm flex items-center justify-center border
                        ${isOutOfStock
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200'
                      : 'bg-white text-green-600 border-green-600 hover:bg-green-50 active:scale-95'
                    }
                        `}
                >
                  {isOutOfStock ? 'Out of Stock' : 'ADD'}
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
