import { useState } from "react";
import { addProduct } from "./api/api.js";

function AddProduct({ onAdd }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addProduct({ name, price, description });
      onAdd(data); // update product list
      setName("");
      setPrice("");
      setDescription("");
    } catch (error) {
      console.error("Error adding product", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Product</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <button type="submit">Add Product</button>
    </form>
  );
}

export default AddProduct;
