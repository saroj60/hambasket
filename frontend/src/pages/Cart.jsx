import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const Cart = () => {
  const { cartItems, removeFromCart } = useContext(CartContext);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item._id || item.id} className="cart-item" style={{ marginBottom: "10px" }}>
              <p>
                {item.name} (x{item.qty}) - Rs. {item.price * item.qty}{" "}
                <button onClick={() => removeFromCart(item._id || item.id)}>Remove</button>
              </p>
            </div>
          ))}
          <h3>Total: Rs. {total}</h3>
        </>
      )}
    </div>
  );
};

export default Cart;
