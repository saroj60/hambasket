import React, { createContext, useState, useEffect } from "react";
import { getCartItems, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from "../services/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart items from backend on load
  useEffect(() => {
    const fetchCart = async () => {
      const items = await getCartItems();
      setCartItems(items);
    };
    fetchCart();
  }, []);

  // Add item to cart
  const addToCart = async (product, qty = 1) => {
    await apiAddToCart({
      productId: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty
    });
    const existingItem = cartItems.find((item) => item._id === (product._id || product.id));
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item._id === (product._id || product.id)
            ? { ...item, qty: item.qty + qty }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, qty }]);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    await apiRemoveFromCart(productId); // sync with backend
    setCartItems(cartItems.filter((item) => item._id !== productId));
  };

  // Clear cart after checkout
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
