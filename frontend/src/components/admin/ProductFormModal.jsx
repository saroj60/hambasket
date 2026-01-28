import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { getAllCategories } from '../../services/api';

const ProductFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    // Dynamic Categories State
    const [categories, setCategories] = useState([]);
    const [categoryMap, setCategoryMap] = useState({}); // Map for quick subcat lookup

    const [formData, setFormData] = useState(initialData || {
        name: '',
        price: '',
        unit: 'pcs',

        category: '',
        subCategory: '',
        countInStock: '',
        description: '',
        isTopPick: false,
        image: null
    });

    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableSubCategories, setAvailableSubCategories] = useState([]);

    // 'upload' or 'url'
    const [imageInputType, setImageInputType] = useState('upload');

    // Fetch Categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                // Try fetching admin categories first (includes hidden ones)
                let data = await getAllCategories(true);

                // If API returns error (object) instead of array, or fails, fallback to public
                if (!Array.isArray(data)) {
                    console.warn("Admin categories failed, falling back to public:", data);
                    data = await getAllCategories(false);
                }

                if (Array.isArray(data)) {
                    // Transform to map for easier subcat access
                    const map = {};
                    data.forEach(cat => {
                        if (cat && cat.name) {
                            map[cat.name] = (cat.subCategories || []).map(sub => sub.name);
                        }
                    });
                    setCategories(data);
                    setCategoryMap(map);
                } else {
                    console.error("Failed to load categories: Data is not an array", data);
                    setCategories([]);
                }
            } catch (error) {
                console.error("Failed to load categories", error);
                // Last dich attempt: try public if exception occurred in first call
                try {
                    const data = await getAllCategories(false);
                    if (Array.isArray(data)) {
                        const map = {};
                        data.forEach(cat => {
                            map[cat.name] = (cat.subCategories || []).map(sub => sub.name);
                        });
                        setCategories(data);
                        setCategoryMap(map);
                    }
                } catch (e) {
                    console.error("Fallback failed", e);
                }
            }
        };
        if (isOpen) loadCategories();
    }, [isOpen]);

    // Initialize state when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            if (initialData.image) {
                const img = initialData.image.startsWith('http')
                    ? initialData.image
                    : `${BASE_URL}${initialData.image.startsWith('/') ? '' : '/'}${initialData.image}`;
                setPreview(img);
            } else {
                setPreview('');
            }
        } else {
            // Reset for Add Mode
            setFormData({
                name: '',
                price: '',
                unit: 'pcs',

                category: '', // Don't auto-select first category
                subCategory: '',
                countInStock: '',
                description: '',
                image: null,
                isTopPick: false,
                variants: []
            });
            setPreview('');
            setImageInputType('upload');
            setVariantInput({ weight: '', price: '', stock: '' });
        }
    }, [initialData, isOpen]); // Removed categories from dependency to prevent reset when categories load

    // Local state for new variant input
    const [variantInput, setVariantInput] = useState({ weight: '', price: '', stock: '' });

    const handleVariantAdd = () => {
        if (variantInput.weight && variantInput.price) {
            setFormData(prev => ({
                ...prev,
                variants: [...(prev.variants || []), { ...variantInput }]
            }));
            setVariantInput({ weight: '', price: '', stock: '' });
        }
    };

    const handleVariantRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    // Update Available SubCategories when Category changes
    useEffect(() => {
        const cat = formData.category;
        if (cat && categoryMap[cat]) {
            const subs = categoryMap[cat];
            setAvailableSubCategories(subs);

            // If current subCategory is not valid for new category, reset it
            if (formData.subCategory && !subs.includes(formData.subCategory)) {
                setFormData(prev => ({ ...prev, subCategory: '' }));
            }
        } else {
            setAvailableSubCategories([]);
            setFormData(prev => ({ ...prev, subCategory: '' }));
        }
    }, [formData.category, categoryMap]);


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
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            {initialData ? <>✏️ Edit Product</> : <>✨ Add New Product</>}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium ml-1">Fill in the details below</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all font-bold">✕</button>
                </div>

                {/* Scrollable Form */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">


                    <form id="product-form" onSubmit={handleSubmit} className="space-y-10">
                        {/* Image Section */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <label className="text-base font-bold text-gray-900">Product Image</label>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setImageInputType('upload')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${imageInputType === 'upload' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Upload
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageInputType('url')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${imageInputType === 'url' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        URL
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Preview Box */}
                                <div className="relative group w-40 h-40 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 transition-colors hover:border-purple-400 hover:bg-purple-50">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" onError={(e) => { e.target.style.display = 'none'; }} />
                                    ) : (
                                        <div className="text-center text-gray-400 transition-colors group-hover:text-purple-400">
                                            <div className="text-3xl mb-1">🖼️</div>
                                            <span className="text-xs font-bold">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Inputs */}
                                <div className="flex-1 w-full space-y-4">
                                    {imageInputType === 'upload' ? (
                                        <div className="w-full relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="file-upload"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-all">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <p className="mb-2 text-sm text-gray-500 font-bold"><span className="text-purple-600">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF</p>
                                                </div>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            <input
                                                type="url"
                                                placeholder="https://example.com/image.png"
                                                value={typeof formData.image === 'string' ? formData.image : ''}
                                                onChange={handleImageUrlChange}
                                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all font-medium text-sm"
                                            />
                                            <p className="text-xs text-gray-400 mt-2 ml-1">Paste a direct link to an image</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Fresh Organic Milk"
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-medium text-gray-800 placeholder-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Base Price (Rs.)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="w-full pl-12 pr-5 py-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-bold text-gray-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category & SubCategory */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-medium text-gray-800 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Sub Category</label>
                                <div className="relative">
                                    <select
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleChange}
                                        disabled={availableSubCategories.length === 0}
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-medium text-gray-800 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select Sub Category</option>
                                        {availableSubCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Weight/Size</label>
                                <input
                                    type="text"
                                    name="weight"
                                    value={formData.weight || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. 500g"
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Unit</label>
                                <select
                                    name="unit"
                                    value={formData.unit || 'pcs'}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-medium cursor-pointer"
                                >
                                    <option value="pcs">Piece (pcs)</option>
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="g">Gram (g)</option>
                                    <option value="liter">Liter (l)</option>
                                    <option value="ml">Milliliter (ml)</option>
                                    <option value="packet">Packet</option>
                                    <option value="dozen">Dozen</option>
                                    <option value="box">Box</option>
                                    <option value="bottle">Bottle</option>
                                    <option value="can">Can</option>
                                    <option value="set">Set</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Stock</label>
                                <input
                                    type="number"
                                    name="countInStock"
                                    required
                                    value={formData.countInStock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* Top Pick Toggle */}
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, isTopPick: !prev.isTopPick }))}>
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${formData.isTopPick ? 'bg-yellow-400 border-yellow-500' : 'bg-white border-gray-300'}`}>
                                {formData.isTopPick && <span className="text-white text-sm font-bold">✓</span>}
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-900 cursor-pointer">Mark as Top Pick</label>
                                <p className="text-xs text-gray-500">Highlight this product in the featured section</p>
                            </div>
                            <span className="text-2xl ml-auto">⭐</span>
                        </div>

                        {/* Variants Section */}
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-5">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-lg font-black text-gray-800">Product Variants</h3>
                                    <p className="text-sm text-gray-500 mt-1">Add different size options (e.g. 500g, 1kg)</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-3 items-end bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex-1 w-full space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-1">Weight</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1kg"
                                        value={variantInput.weight}
                                        onChange={e => setVariantInput({ ...variantInput, weight: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm font-medium"
                                    />
                                </div>
                                <div className="flex-1 w-full space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-1">Price</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={variantInput.price}
                                        onChange={e => setVariantInput({ ...variantInput, price: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm font-medium"
                                    />
                                </div>
                                <div className="flex-1 w-full space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-1">Stock</label>
                                    <input
                                        type="number"
                                        placeholder="Opt."
                                        value={variantInput.stock}
                                        onChange={e => setVariantInput({ ...variantInput, stock: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm font-medium"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleVariantAdd}
                                    disabled={!variantInput.weight || !variantInput.price}
                                    className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-200 h-[42px]"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Variants List */}
                            {formData.variants && formData.variants.length > 0 && (
                                <div className="grid grid-cols-1 gap-2">
                                    {formData.variants.map((v, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors group">
                                            <div className="flex gap-6 text-sm font-medium text-gray-700 items-center">
                                                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{v.weight}</span>
                                                <span>Rs. {v.price}</span>
                                                {v.stock && <span className="text-gray-400 text-xs bg-gray-50 px-2 py-1 rounded">Stock: {v.stock}</span>}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleVariantRemove(i)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 font-bold"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the product features..."
                                className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-medium resize-none"
                            ></textarea>
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-gray-100 flex gap-4 bg-white z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="product-form"
                        disabled={loading}
                        className="flex-1 py-4 rounded-2xl font-bold text-white bg-gray-900 hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {initialData ? 'Save Changes' : 'Create Product'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
