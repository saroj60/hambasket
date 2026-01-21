import React, { useEffect, useState, useContext } from 'react';
import ProductCard from './ProductCard';
import { getTopPickedProducts } from '../services/api';
import { CartContext } from '../context/CartContext';
import ProductDetails from './ProductDetails';

const TopPicks = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchTopPicks = async () => {
            try {
                const data = await getTopPickedProducts();
                if (Array.isArray(data)) {
                    setProducts(data);
                }
            } catch (err) {
                console.error("Failed to load top picks", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopPicks();
    }, []);

    if (loading || products.length === 0) return null;

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>⭐</span> Top Picks
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {products.map((product) => (
                    <ProductCard
                        key={`top-${product._id || product.id}`}
                        product={product}
                        onClick={setSelectedProduct}
                    />
                ))}
            </div>

            {selectedProduct && (
                <ProductDetails
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAdd={(item) => addToCart(item, item.quantity)}
                    onProductSelect={setSelectedProduct}
                />
            )}
        </div>
    );
};

export default TopPicks;
