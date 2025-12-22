import React, { createContext, useState, useEffect } from "react";
import { getCartItems, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from "../services/api";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Initial Load
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        // Logged in: Fetch from API
        try {
          const items = await getCartItems();
          if (Array.isArray(items)) {
            setCartItems(items);
          } else {
            setCartItems([]);
          }
        } catch (err) {
          console.error("Failed to fetch cart", err);
          setCartItems([]);
        }
      } else {
        // Guest: Fetch from LocalStorage
        const savedCart = localStorage.getItem('guest_cart');
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch (e) {
            console.error("Failed to parse guest cart", e);
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
      setLoading(false);
    };
    loadCart();
  }, [user]);

  // Sync Guest Cart to LocalStorage whenever it changes (only if no user)
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user, loading]);

  // Add item to cart
  const addToCart = async (product, qty = 1) => {
    if (user) {
      // API Internal Logic
      try {
        const addedItem = await apiAddToCart({
          productId: product._id || product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty
        });

        const existingItemIndex = cartItems.findIndex((item) => item.productId === (product._id || product.id) || item._id === addedItem._id);

        if (existingItemIndex > -1) {
          const newCart = [...cartItems];
          newCart[existingItemIndex] = addedItem;
          setCartItems(newCart);
        } else {
          setCartItems([...cartItems, addedItem]);
        }
      } catch (e) {
        console.error("Add to cart failed", e);
        alert("Failed to add to cart");
      }
    } else {
      // Guest Logic
      const productId = product._id || product.id;
      const existingItemIndex = cartItems.findIndex(item => (item.productId === productId) || (item._id === productId));

      let newCart = [...cartItems];
      if (existingItemIndex > -1) {
        // Update quantity
        const currentItem = newCart[existingItemIndex];
        const newQty = currentItem.qty + qty;
        if (newQty <= 0) {
          newCart.splice(existingItemIndex, 1);
        } else {
          newCart[existingItemIndex] = { ...currentItem, qty: newQty };
        }
      } else {
        if (qty > 0) {
          // New Item
          newCart.push({
            _id: productId, // Use product ID as cart ID for guests
            productId: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            qty: qty,
            emoji: product.emoji
          });
        }
      }
      setCartItems(newCart);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    if (user) {
      try {
        await apiRemoveFromCart(itemId);
        setCartItems(cartItems.filter((item) => item.productId !== itemId && item._id !== itemId));
      } catch (e) {
        console.error("Remove from cart failed", e);
      }
    } else {
      // Guest Logic
      setCartItems(cartItems.filter((item) => item._id !== itemId && item.productId !== itemId));
    }
  };

  // Clear cart after checkout
  const clearCart = () => {
    setCartItems([]);
    if (!user) {
      localStorage.removeItem('guest_cart');
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};
