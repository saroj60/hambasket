function Cart({ cartItems }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-8">
      <h2 className="text-xl font-semibold mb-3">🛒 Cart Items</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        cartItems.map((item) => (
          <div key={item._id} className="flex justify-between border-b py-2">
            <span>{item.name}</span>
            <span>${item.price}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default Cart;
