import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { getProductById, getSimilarProducts } from "../services/api";
import { CartContext } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useContext(CartContext);

  // ... inside ProductDetail component ...
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getProductById(id);
      setProduct(data);

      // Fetch similar
      try {
        const similar = await getSimilarProducts(id);
        setSimilarProducts(similar || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [id]);

  if (!product) return <p>Loading...</p>;

  const handleAddToCart = () => {
    addToCart(product, 1);
    alert("Added to cart!");
  };

  return (
    <div className="product-detail p-6">
      <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
      <p className="text-xl mb-4">Price: Rs. {product.price}</p>
      <p className="mb-6">{product.description}</p>
      <button
        onClick={handleAddToCart}
        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold mb-8"
      >
        Add to Cart
      </button>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">You Might Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Simplified rendering or import ProductCard */}
            {similarProducts.map(p => (
              <div key={p._id} className="border p-4 rounded-lg">
                <p className="font-bold">{p.name}</p>
                <p>Rs. {p.price}</p>
                <a href={`/product/${p._id}`} className="text-blue-600 text-sm">View</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
