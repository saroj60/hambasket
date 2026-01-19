import React, { useState, useEffect } from 'react';
import { API_URL, BASE_URL } from '../../config';
import ProductFormModal from './ProductFormModal';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/products`);
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async (formData) => {
        const isEdit = !!editingProduct;
        const endpoint = isEdit ? `${API_URL}/products/${editingProduct._id}` : `${API_URL}/products`;
        const method = isEdit ? 'PUT' : 'POST';

        // Build FormData
        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('unit', formData.unit || 'pcs');
        data.append('category', formData.category);
        if (formData.subCategory) data.append('subCategory', formData.subCategory);
        data.append('stock', formData.countInStock);
        data.append('description', formData.description);

        // Fix: Append Weight and Variants
        if (formData.weight) data.append('weight', formData.weight);
        if (formData.variants) data.append('variants', JSON.stringify(formData.variants));

        if (formData.image instanceof File) {
            data.append('image', formData.image);
        } else if (typeof formData.image === 'string' && formData.image.trim() !== '') {
            data.append('image', formData.image);
        }

        try {
            const res = await fetch(endpoint, {
                method,
                // Headers: NO Content-Type (auto-set by fetch for FormData)
                // NO Authorization header (we use cookies via credentials: 'include')
                // headers: { 'Authorization': ... }, 
                body: data,
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Server Error: ${res.status} ${res.statusText}`);
            }

            await fetchProducts(); // Refresh list
            setIsModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error("Error saving product:", error);
            alert(`Failed to save product: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setProducts(products.filter(p => p._id !== id));
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const handleEditProduct = (product) => {
        // Ensure subCategory is passed to modal (it might be undefined in old records)
        setEditingProduct({ ...product, subCategory: product.subCategory || '', countInStock: product.stock });
        setIsModalOpen(true);
    };

    if (loading && products.length === 0) return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Inventory</h1>
                    <p className="text-gray-500 font-medium text-lg">Manage your store's products.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto items-center">
                    {/* Add Product Button */}
                    <button
                        onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                    >
                        <span className="text-lg leading-none">+</span> Add Product
                    </button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => {
                    // Fix Image URL: Use BASE_URL for uploads
                    const imageUrl = product.image
                        ? (product.image.startsWith('http') ? product.image : `${BASE_URL}/${product.image}`)
                        : null;

                    return (
                        <div key={product._id} className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col relative overflow-hidden">
                            {/* Stock Badge */}
                            <div className="absolute top-4 right-4 z-10">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border backdrop-blur-md ${product.stock > 0
                                    ? 'bg-white/80 text-gray-700 border-gray-100'
                                    : 'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                    {product.stock > 0 ? `${product.stock} Left` : 'Out of Stock'}
                                </span>
                            </div>

                            {/* Image Area */}
                            <div className="aspect-[4/3] bg-gray-50 rounded-2xl mb-4 overflow-hidden relative flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-contain mix-blend-multiply p-4 transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-4xl">📦</span>'; }}
                                    />
                                ) : (
                                    <span className="text-4xl">📦</span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1 opacity-80">
                                    {product.category} {product.subCategory ? `• ${product.subCategory}` : ''}
                                </p>
                                <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2 text-lg">{product.name}</h3>
                                <div className="flex items-center justify-between mt-auto pt-2">
                                    <span className="text-xl font-black text-gray-900">Rs. {product.price}</span>
                                </div>
                            </div>

                            {/* Actions Overlay */}
                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                <button
                                    onClick={() => handleEditProduct(product)}
                                    className="py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                                >
                                    <span>✏️</span> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                                >
                                    <span>🗑️</span> Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {products.length === 0 && !loading && (
                <div className="text-center py-20 opacity-50">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-800">No products found</h3>
                    <p className="text-gray-500">Try adjusting your search or add a new product.</p>
                </div>
            )}

            {/* Modal */}
            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                initialData={editingProduct}
            />
        </div>
    );
};

export default AdminProducts;
