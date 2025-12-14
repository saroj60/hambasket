import { useState } from "react";

function AddProductForm({ onAdd }) {
  const [product, setProduct] = useState({ name: "", price: "", description: "", image: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (product.name && product.price) {
      onAdd({ ...product, _id: Date.now() });
      setProduct({ name: "", price: "", description: "", image: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-md space-y-3 mt-8">
      <h2 className="text-xl font-semibold mb-2">Add New Product</h2>
      <input
        type="text"
        placeholder="Name"
        className="w-full border rounded p-2"
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        className="w-full border rounded p-2"
        value={product.price}
        onChange={(e) => setProduct({ ...product, price: e.target.value })}
      />
      <textarea
        placeholder="Description"
        className="w-full border rounded p-2"
        value={product.description}
        onChange={(e) => setProduct({ ...product, description: e.target.value })}
      />
      <input
        type="text"
        placeholder="Image URL"
        className="w-full border rounded p-2"
        value={product.image}
        onChange={(e) => setProduct({ ...product, image: e.target.value })}
      />
      <button type="submit" className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600">
        Add Product
      </button>
    </form>
  );
}

export default AddProductForm;
