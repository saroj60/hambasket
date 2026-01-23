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
  const discount = isFlashSaleActive ? product.flashSale.discount : 0;
  const price = product.price;

  return (
    <div
      className="group flex flex-col h-full bg-white rounded-xl overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-lg hover:border-purple-100 relative"
      onClick={() => onClick(product)}
    >
      {/* Discount Badge */}
      {(isFlashSaleActive || discount > 0) && (
        <div className="absolute top-0 left-0 bg-[#2563eb] text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10 shadow-sm">
          {isFlashSaleActive ? `${discount}% OFF` : '12% OFF'}
        </div>
      )}

      {/* 1. Image Area - Clean & Spacious */}
      <div className="w-full aspect-[1/1] bg-white p-4 flex items-center justify-center relative mb-2">
        {product.image ? (
          <img
            src={
              product.image.startsWith('http') || product.image.startsWith('/assets') || product.image.startsWith('data:')
                ? product.image
                : `${BASE_URL}${product.image}`
            }
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 will-change-transform" // Smooth zoom on hover
          />
        ) : (
          <div className="text-4xl">📦</div>
        )}
      </div>

      {/* 2. Content Section - Equal Spacing */}
      <div className="flex flex-col flex-1 px-3 pb-3">

        {/* Time Badge (Optional - can be dynamic if data exists) */}
        {/* <div className="bg-gray-100 text-[9px] font-bold text-gray-600 px-1.5 py-0.5 rounded w-fit mb-2 flex items-center gap-1">
          <span>⏱️</span> 8 MINS
        </div> */}

        {/* Title: Stronger Font */}
        <h3 className="text-[14px] font-bold text-gray-900 leading-tight line-clamp-2 mb-1 group-hover:text-purple-700 transition-colors">
          {product.name}
        </h3>

        {/* Weights/Units - Below Name */}
        <div className="text-[12px] text-gray-500 mb-4 font-medium">
          {product.weight} {product.unit}
        </div>


        {/* Footer: Price & Action - Pushed to bottom */}
        <div className="mt-auto flex items-center justify-between">

          {/* Price Stack */}
          <div className="flex flex-col leading-none">
            {product.discount > 0 && (
              <span className="text-[11px] text-gray-400 line-through mb-0.5">
                ₹{product.originalPrice || (price + 20)}
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-[15px] font-bold text-gray-900">
                ₹{price}
              </span>
            </div>
          </div>

          {/* ADD Button - Classic Outline Style */}
          <div className="w-[85px] h-[34px]">
            {product.variants && product.variants.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(product);
                }}
                className="w-full h-full rounded-md text-[13px] font-bold uppercase border border-green-600 text-green-700 bg-white hover:bg-green-50 transition-colors active:scale-95"
              >
                Select
              </button>
            ) : (
              quantity > 0 ? (
                /* Counter for Quantity > 0 */
                <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between w-full h-full bg-green-600 text-white rounded-md shadow-sm overflow-hidden border border-green-600">
                  <button onClick={handleDecrement} className="w-8 h-full flex items-center justify-center hover:bg-green-700 transition-colors text-lg active:scale-90">-</button>
                  <span className="text-[13px] font-bold">{quantity}</span>
                  <button onClick={handleIncrement} className="w-8 h-full flex items-center justify-center hover:bg-green-700 transition-colors text-lg active:scale-90">+</button>
                </div>
              ) : (
                /* ADD Button Default */
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className={`
                        w-full h-full rounded-md text-[13px] font-bold uppercase transition-all shadow-sm active:scale-95 flex items-center justify-center border
                        ${isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                      : 'bg-white text-green-600 border-green-600 hover:bg-green-50'
                    }
                        `}
                >
                  {isOutOfStock ? 'Sold' : 'ADD'}
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
