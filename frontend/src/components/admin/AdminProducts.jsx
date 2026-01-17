import React, { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import { API_URL } from '../../config';
import { CATEGORY_HIERARCHY, MAIN_CATEGORIES } from '../../data/CategoryStructure';

const AdminProducts = () => {
    const productContext = useProducts();
    const { products, addProduct, updateProduct, deleteProduct } = productContext || {};

    // Safety check if context is not yet waiting or failed
    if (!productContext) {
        console.warn("ProductContext is undefined in AdminProducts");
    }
    const [lowStockProducts, setLowStockProducts] = useState([]);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const initialFormState = {
        name: '', price: '', emoji: '', category: 'Fresh Produce', subCategory: 'All', // Updated default category
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSetOutOfStock = async (product) => {
        if (!window.confirm(`Mark "${product.name}" as Out of Stock?`)) return;
        const fullData = new FormData();
        fullData.append('name', product.name);
        fullData.append('price', product.price);
        fullData.append('category', product.category);
        fullData.append('stock', 0);

        // Append other required fields to ensure no validation error, though usually PATCH is better.
        // Assuming the backend handles partial updates or we send existing values.
        // For safety, let's send what we have in the object if needed, but Context usually handles ID.
        // The original code re-sent everything, so we stick to that pattern if `updateProduct` requires it.
        // But `formData` pattern above used `new FormData()`. Let's stick to safe minimal if backend allows or full.
        // Re-using the manual append from previous code for safety:
        fullData.append('subCategory', product.subCategory || 'All');
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

    // Filter Logic
    const filteredProducts = (products || []).filter(product => {
        if (!product) return false;
        const name = product.name || '';
        const category = product.category || '';

        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                    <p className="text-gray-500 text-sm">Manage your inventory and catalog</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => {
                            if (showForm) {
                                resetForm();
                            } else {
                                resetForm();
                                setShowForm(true);
                            }
                        }}
                        className="btn btn-primary flex items-center justify-center gap-2 px-6 py-2.5 w-full md:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-medium"
                    >
                        <span>{showForm ? 'Cancel' : '+ Add Product'}</span>
                    </button>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 overflow-x-auto">
                    <h3 className="text-orange-800 font-bold mb-4 flex items-center gap-2">
                        <span>⚠️</span> Low Stock ({lowStockProducts.length})
                    </h3>
                    <div className="flex gap-4 pb-2">
                        {lowStockProducts.map(p => (
                            <div key={p._id} className="min-w-[220px] bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex flex-col gap-3 group hover:shadow-md transition-all">
                                <div className="font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="text-2xl bg-gray-50 p-2 rounded-lg">{p.emoji}</span>
                                    <span className="truncate">{p.name}</span>
                                </div>
                                <div className="text-red-500 text-sm font-bold bg-red-50 px-2 py-1 rounded w-fit">Only {p.stock} left</div>
                                <button
                                    onClick={() => handleEdit(p)}
                                    className="mt-auto w-full py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold hover:bg-orange-200 transition-colors"
                                >
                                    Refill Stock
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add/Edit Form - Slide Down Panel */}
            {showForm && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100 animate-slide-down relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
                    <h3 className="text-xl font-bold mb-6 text-gray-800">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-700">Basic Info</label>
                                <input
                                    placeholder="Product Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="input-field"
                                />
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Price (Rs.)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Stock</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            required
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Product Description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="input-field min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-700">Media & Taxonomy</label>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value, subCategory: 'All' })}
                                            className="input-field bg-white"
                                        >
                                            {(MAIN_CATEGORIES || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1 block">Sub-Category</label>
                                        <select
                                            value={formData.subCategory || 'All'}
                                            onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                                            className="input-field bg-white"
                                        >
                                            <option value="All">None</option>
                                            {((CATEGORY_HIERARCHY && CATEGORY_HIERARCHY[formData.category]) || []).filter(s => s.name !== 'All').map(sub => (
                                                <option key={sub.name} value={sub.name}>{sub.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="mb-3 flex items-center gap-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setFormData({ ...formData, imageFile: e.target.files[0] })}
                                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        />
                                        <input
                                            placeholder="Emoji"
                                            value={formData.emoji}
                                            onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                                            className="input-field w-16 text-center text-xl"
                                        />
                                    </div>
                                    <input
                                        placeholder="OR Image URL"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="input-field text-sm"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <input
                                        placeholder="Time (10 mins)"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        className="input-field flex-1"
                                    />
                                    <input
                                        placeholder="Weight (1 kg)"
                                        value={formData.weight}
                                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                        className="input-field flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Flash Sale Banner */}
                        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-100 rounded-xl p-4 flex flex-wrap items-center gap-4">
                            <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                                <span>⚡</span> Flash Sale
                            </h4>
                            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-sm">
                                <input
                                    type="checkbox"
                                    checked={formData.flashSale?.active || false}
                                    onChange={e => setFormData({ ...formData, flashSale: { ...formData.flashSale, active: e.target.checked } })}
                                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Enable</span>
                            </label>

                            {formData.flashSale?.active && (
                                <>
                                    <input
                                        type="number"
                                        placeholder="Discount %"
                                        value={formData.flashSale?.discount || ''}
                                        onChange={e => setFormData({ ...formData, flashSale: { ...formData.flashSale, discount: e.target.value } })}
                                        className="input-field w-28 !py-1.5 !bg-white"
                                    />
                                    <input
                                        type="datetime-local"
                                        value={formData.flashSale?.endTime ? new Date(formData.flashSale.endTime).toISOString().slice(0, 16) : ''}
                                        onChange={e => setFormData({ ...formData, flashSale: { ...formData.flashSale, endTime: e.target.value } })}
                                        className="input-field w-auto flex-1 !py-1.5 !bg-white"
                                    />
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" className="btn btn-primary px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-white" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <input
                    placeholder="🔍 Search products..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="input-field flex-1"
                />
                <select
                    value={filterCategory}
                    onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                    className="input-field md:w-64 bg-white"
                >
                    <option value="All">All Categories</option>
                    {(MAIN_CATEGORIES || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                            <tr>
                                <th className="p-5">Product</th>
                                <th className="p-5">Category</th>
                                <th className="p-5">Stock & Price</th>
                                <th className="p-5 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentProducts.length > 0 ? (
                                currentProducts.map(product => (
                                    <tr key={product._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover shadow-sm bg-white" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shadow-sm">
                                                        {product.emoji}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-800">{product.name}</div>
                                                    <div className="text-xs text-gray-400 font-medium">{product.weight}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="font-bold text-gray-800">Rs. {product.price}</div>
                                                <div className={`text-xs font-medium flex items-center gap-1 ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${product.stock < 10 ? 'bg-red-500' : 'bg-green-500'}`} />
                                                    Stock: {product.stock}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleSetOutOfStock(product)}
                                                    title="Mark Out of Stock"
                                                    className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                                >
                                                    🚫
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    title="Edit"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    title="Delete"
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-gray-400 italic">
                                        No products found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredProducts.length > itemsPerPage && (
                    <div className="p-4 border-t border-gray-100 flex justify-end items-center gap-4 bg-gray-50/30">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-gray-600">
                            Page {currentPage} of {Math.ceil(filteredProducts.length / itemsPerPage)}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProducts.length / itemsPerPage), p + 1))}
                            disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
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
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }
                .input-field:focus {
                    border-color: var(--primary);
                    background-color: white;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
                    transform: translateY(-1px);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default AdminProducts;
