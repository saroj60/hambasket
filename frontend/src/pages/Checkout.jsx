import React, { useState, useContext } from "react";
import { checkoutCart } from "../services/api";
import { CartContext } from "../context/CartContext";

const Checkout = () => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    pincode: "",
  });
  const { cartItems, clearCart } = useContext(CartContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const checkoutData = { ...form, items: cartItems };
    const response = await checkoutCart(checkoutData);

    if (response) {
      alert("Order placed successfully!");
      clearCart(); // clear cart after checkout
      setForm({ name: "", address: "", city: "", pincode: "" });
    }
  };

  return (
    <div className="checkout">
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
        <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} required />
        <input type="text" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required />
        <button type="submit">Place Order</button>
      </form>
    </div>
  );
};

export default Checkout;
