import React from "react";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const products = [
    { id: 1, name: "Laptop", price: 55000, image: "/assets/laptop.jpg" },
    { id: 2, name: "Tablet", price: 18000, image: "/assets/tablet.jpg" },
    { id: 3, name: "Camera", price: 40000, image: "/assets/camera.jpg" },
  ];

  return (
    <div>
      <h2>All Products</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Products;
