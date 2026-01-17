import React, { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import { API_URL } from '../../config';
import { CATEGORY_HIERARCHY, MAIN_CATEGORIES } from '../../data/CategoryStructure';

const AdminProducts = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const [lowStockProducts, setLowStockProducts] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const initialFormState = {
        name: '', price: '', emoji: '', category: 'Fruits & Vegetables', subCategory: 'All',
        time: '10 mins', weight: '1 kg', stock: 100, description: '', image: '', imageFile: null,
        flashSale: { active: false, discount: 0, endTime: '' }
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchLowStock();
    }, []);

    const fetchLowStock = async () => {
        try {
            const res = await fetch(`${API_URL}/products/low-stock`, { credentials: 'include' });
            if (res.ok) setLowStockProducts(await res.json());
        } catch (error) {
            console.error("Error fetching low stock products:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'imageFile') {
                    if (formData[key]) data.append('image', formData[key]);
                } else if (key === 'image') {
                    if (!formData.imageFile && formData[key]) data.append('image', formData[key]);
                } else if (key === 'flashSale') {
                    data.append('flashSale', JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });

            if (editingId) {
                await updateProduct(editingId, data);
            } else {
                await addProduct(data);
            }

            resetForm();
            alert(editingId ? "Product updated successfully!" : "Product added successfully!");
        } catch (error) {
            console.error("Error submitting product:", error);
            alert("Failed to save product.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (product) => {
        setFormData(product);
        setEditingId(product._id);
        setIsEditing(true);
        setShowForm(true);
        // Scroll to top or form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSetOutOfStock = async (product) => {
        if (!window.confirm(`Mark "${product.name}" as Out of Stock?`)) return;
        const fullData = new FormData();
        // Construct minimal necessary data or full data depending on backend requirement
        // Replicating original logic:
        fullData.append('name', product.name);
        fullData.append('price', product.price);
        fullData.append('category', product.category);
        fullData.append('subCategory', product.subCategory || 'All');
        fullData.append('stock', 0);
        fullData.append('description', product.description || '');
        fullData.append('time', product.time || '');
        fullData.append('weight', product.weight || '');
        fullData.append('emoji', product.emoji || '');
        if (product.image) fullData.append('image', product.image);

        await updateProduct(product._id, fullData);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
        }
    }

    const resetForm = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setIsEditing(false);
        setShowForm(false);
    };

    // Filter Logic for List if needed, but pagination handles slice
    const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
                <button
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <span>{showForm ? 'Cancel' : '+ Add New Product'}</span>
                </button>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 overflow-x-auto">
                    <h3 className="text-red-800 font-bold mb-3 flex items-center gap-2">
                        ⚠️ Low Stock Alert ({lowStockProducts.length})
                    </h3>
                    <div className="flex gap-4">
                        {lowStockProducts.map(p => (
                            <div key={p._id} className="min-w-[200px] bg-white p-3 rounded-lg border border-red-100 shadow-sm flex flex-col gap-2">
                                <div className="font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="text-xl">{p.emoji}</span> {p.name}
                                </div>
                                <div className="text-red-500 text-sm font-bold">Only {p.stock} left!</div>
                                <button
                                    onClick={() => handleEdit(p)}
                                    className="mt-auto text-xs bg-red-100 text-red-700 py-1 px-2 rounded hover:bg-red-200 transition-colors"
                                >
                                    Restock Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-slide-down">
                    <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                placeholder="Product Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="input-field"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Price (Rs.)"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    className="input-field flex-1"
                                />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                    className="input-field flex-1"
                                />
                            </div>
                        </div>

                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="input-field min-h-[80px]"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setFormData({ ...formData, imageFile: e.target.files[0] })}
                                        className="input-field text-sm"
                                    />
                                    <input
                                        placeholder="Emoji"
                                        value={formData.emoji}
                                        onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                                        className="input-field w-20 text-center"
                                    />
                                </div>
                                <input
                                    placeholder="OR Image URL"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    className="input-field text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value, subCategory: 'All' })}
                                        className="input-field flex-1"
                                    >
                                        {MAIN_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <select
                                        value={formData.subCategory || 'All'}
                                        onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                                        className="input-field flex-1"
                                    >
                                        <option value="All">Sub-Category</option>
                                        {(CATEGORY_HIERARCHY[formData.category] || []).filter(s => s.name !== 'All').map(sub => (
                                            <option key={sub.name} value={sub.name}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        placeholder="Time (10 mins)"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        required
                                        className="input-field flex-1"
                                    />
                                    <input
                                        placeholder="Weight (1 kg)"
                                        value={formData.weight}
                                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                        required
                                        className="input-field flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Flash Sale */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <h4 className="text-yellow-800 font-semibold mb-2 text-sm">⚡ Flash Sale Settings</h4>
                            <div className="flex flex-wrap gap-4 items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.flashSale?.active || false}
                                        onChange={e => setFormData({ ...formData, flashSale: { ...formData.flashSale, active: e.target.checked } })}
                                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Discount %"
                                    value={formData.flashSale?.discount || ''}
                                    onChange={e => setFormData({ ...formData, flashSale: { ...formData.flashSale, discount: e.target.value } })}
                                    className="input-field w-24 py-1"
                                />
                                <input
                                    type="datetime-local"
                                    value={formData.flashSale?.endTime ? new Date(formData.flashSale.endTime).toISOString().slice(0, 16) : ''}
                                    onChange={e => setFormData({ ...formData, flashSale: { ...formData.flashSale, endTime: e.target.value } })}
                                    className="input-field flex-1 py-1"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                            <button type="submit" className="btn btn-primary px-6" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="p-4 rounded-tl-2xl">Product</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price / Stock</th>
                                <th className="p-4 rounded-tr-2xl text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentProducts.map(product => (
                                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                                                    {product.emoji}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-gray-800">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.weight}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-medium text-gray-800">Rs. {product.price}</div>
                                        <div className={`text-xs font-medium ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                            Stock: {product.stock}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleSetOutOfStock(product)}
                                                title="Mark Out of Stock"
                                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                            >
                                                🚫
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                title="Edit"
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                title="Delete"
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {products.length > itemsPerPage && (
                    <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">Page {currentPage} of {Math.ceil(products.length / itemsPerPage)}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(products.length / itemsPerPage), p + 1))}
                            disabled={currentPage === Math.ceil(products.length / itemsPerPage)}
                            className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .input-field {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e5e7eb;
                    background-color: #f9fafb;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                    outline: none;
                }
                .input-field:focus {
                    border-color: var(--primary);
                    background-color: white;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                }
            `}</style>
        </div>
    );
};

export default AdminProducts;
