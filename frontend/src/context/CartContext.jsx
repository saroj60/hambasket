import React, { createContext, useState, useEffect } from "react";
import { getCartItems, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from "../services/api";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  // Fetch cart items from backend on load
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (user) {
          const items = await getCartItems();
          // API might return error object if auth failed despite user check
          if (Array.isArray(items)) {
            setCartItems(items);
          } else {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error("Failed to fetch cart", err);
        setCartItems([]);
      }
    };
    fetchCart();
  }, [user]);

  // Add item to cart
  const addToCart = async (product, qty = 1) => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      const addedItem = await apiAddToCart({
        productId: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty
      });

      // Update local state based on API response
      // The API returns the updated/new cart item
      const existingItemIndex = cartItems.findIndex((item) => item.productId === (product._id || product.id) || item._id === addedItem._id);

      if (existingItemIndex > -1) {
        // If it was an update, replace the item
        const newCart = [...cartItems];
        newCart[existingItemIndex] = addedItem; // Updated item from backend
        setCartItems(newCart);
      } else {
        // If it is new
        setCartItems([...cartItems, addedItem]);
      }
    } catch (e) {
      console.error("Add to cart failed", e);
      alert("Failed to add to cart");
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      await apiRemoveFromCart(productId); // sync with backend
      setCartItems(cartItems.filter((item) => item.productId !== productId && item._id !== productId));
    } catch (e) {
      console.error("Remove from cart failed", e);
    }
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
