import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { CATEGORY_HIERARCHY } from '../../data/CategoryStructure'; // Ensure this path is correct

const ProductFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    // Get keys from hierarchy, excluding 'All' if it exists as a key (usually it's a value inside)
    // Structure keys are "Fresh Produce", "Dairy...", etc.
    const CATEGORIES = Object.keys(CATEGORY_HIERARCHY).filter(k => k !== "All");

    const [formData, setFormData] = useState(initialData || {
        name: '',
        price: '',
        unit: 'pcs', // Default unit

        category: CATEGORIES[0],
        subCategory: '',
        countInStock: '',
        description: '',
        image: null
    });

    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableSubCategories, setAvailableSubCategories] = useState([]);

    // 'upload' or 'url'
    const [imageInputType, setImageInputType] = useState('upload');

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
                // If it's a remote URL not from our domain/uploads, set type to url? 
                // Actually, simplify: Just default to upload, user can switch if they want to change it.
                // But if they are editing, and want to replace... 
            } else {
                setPreview('');
            }
        } else {
            // Reset for Add Mode
            setFormData({
                name: '',
                price: '',
                unit: 'pcs',

                category: CATEGORIES[0],
                subCategory: '',
                countInStock: '',
                description: '',
                image: null
            });
            setPreview('');
            setImageInputType('upload');
        }
    }, [initialData, isOpen]);

    // Update Available SubCategories when Category changes
    useEffect(() => {
        const cat = formData.category;
        if (cat && CATEGORY_HIERARCHY[cat]) {
            // Filter out 'All' and map to names
            const subs = CATEGORY_HIERARCHY[cat]
                .filter(item => item.name !== 'All')
                .map(item => item.name);
            setAvailableSubCategories(subs);

            // If current subCategory is not valid for new category, reset it
            if (formData.subCategory && !subs.includes(formData.subCategory)) {
                setFormData(prev => ({ ...prev, subCategory: '' }));
            }
        } else {
            setAvailableSubCategories([]);
            setFormData(prev => ({ ...prev, subCategory: '' }));
        }
    }, [formData.category]);


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

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, image: url }));
        setPreview(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] scale-100 animate-slide-up">

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
                        {/* Image Section */}
                        <div className="flex flex-col items-center justify-center gap-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                            {/* Image Type Toggle */}
                            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setImageInputType('upload')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${imageInputType === 'upload' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Upload File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageInputType('url')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${imageInputType === 'url' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Image URL
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-center w-full justify-center">
                                {/* Preview Box */}
                                <div className="relative w-40 h-40 rounded-3xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" onError={(e) => { e.target.style.display = 'none'; }} />
                                    ) : (
                                        <div className="text-center text-gray-300">
                                            <div className="text-4xl mb-1">🖼️</div>
                                        </div>
                                    )}
                                </div>

                                {/* Inputs */}
                                <div className="flex-1 w-full max-w-md space-y-3">
                                    {imageInputType === 'upload' ? (
                                        <div className="w-full">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Choose Image File</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all"
                                            />
                                            <p className="text-xs text-gray-400 mt-2 font-medium">Supports: JPG, PNG, WEBP</p>
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Paste Image URL</label>
                                            <input
                                                type="url"
                                                placeholder="https://example.com/image.png"
                                                value={typeof formData.image === 'string' ? formData.image : ''}
                                                onChange={handleImageUrlChange}
                                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-medium text-sm"
                                            />
                                            <p className="text-xs text-gray-400 mt-2 font-medium">Enter a direct link to an image</p>
                                        </div>
                                    )}
                                </div>
                            </div>
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

                        {/* Price & Unit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900 ml-1">Unit</label>
                                <select
                                    name="unit"
                                    value={formData.unit || 'pcs'}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-medium cursor-pointer"
                                >
                                    <option value="pcs">Piece (pcs)</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="g">Gram (g)</option>
                                    <option value="liter">Liter (l)</option>
                                    <option value="ml">Milliliter (ml)</option>
                                    <option value="packet">Packet</option>
                                    <option value="dozen">Dozen</option>
                                    <option value="box">Box</option>
                                    <option value="set">Set</option>
                                </select>
                            </div>
                        </div>

                        {/* Category & SubCategory */}
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
                                <label className="text-sm font-bold text-gray-900 ml-1">Sub Category</label>
                                <select
                                    name="subCategory"
                                    value={formData.subCategory}
                                    onChange={handleChange}
                                    disabled={availableSubCategories.length === 0}
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Select Sub Category</option>
                                    {availableSubCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
