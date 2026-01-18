import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

const ProductFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    const CATEGORIES = ["Vegetables", "Fruits", "Dairy", "Bakery and Biscuits", "Beverages", "Snacks", "Frozen", "Baby Care", "Chocolate and Ice Cream", "Cooking Oil, Masala and more", "Birthday items", "Other"];

    const [formData, setFormData] = useState(initialData || {
        name: '',
        price: '',
        category: CATEGORIES[0],
        countInStock: '',
        description: '',
        image: null
    });

    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);

    // Initialize state when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            // Fix Preview Logic:
            if (initialData.image) {
                const img = initialData.image.startsWith('http')
                    ? initialData.image
                    : `${BASE_URL}/${initialData.image}`;
                setPreview(img);
            } else {
                setPreview('');
            }
        } else {
            // Reset for Add Mode
            setFormData({
                name: '',
                price: '',
                category: CATEGORIES[0],
                countInStock: '',
                description: '',
                image: null
            });
            setPreview('');
        }
    }, [initialData, isOpen]); // Rerun when modal opens or data changes

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] scale-100 animate-slide-up">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {initialData ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium">Enter product details below</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-xl font-bold">✕</button>
                </div>

                {/* Scrollable Form */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* Image Upload */}
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="relative w-40 h-40 rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden hover:border-purple-500 transition-colors cursor-pointer group shadow-inner">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="text-center text-gray-400 group-hover:text-purple-600 transition-colors">
                                        <div className="text-4xl mb-2">📷</div>
                                        <span className="text-xs font-bold uppercase tracking-wide">Upload Image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            <p className="text-xs text-gray-400 font-medium">Supported formats: JPG, PNG, WEBP</p>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900 ml-1">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Fresh Milk"
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900 ml-1">Price (Rs.)</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* Category & Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900 ml-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-medium cursor-pointer"
                                >
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900 ml-1">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="countInStock"
                                    required
                                    value={formData.countInStock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900 ml-1">Description</label>
                            <textarea
                                name="description"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the product features..."
                                className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-medium resize-none shadow-sm"
                            ></textarea>
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="product-form"
                        disabled={loading}
                        className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
