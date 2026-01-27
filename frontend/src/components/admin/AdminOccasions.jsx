import React, { useState, useEffect } from 'react';
import { getAllOccasions, createOccasion, updateOccasion, deleteOccasion, getProducts, createProduct } from '../../services/api';
import ProductFormModal from './ProductFormModal';
import { API_URL } from '../../config'; // For product fetch if needed, though api.js is used

const AdminOccasions = () => {
    const [occasions, setOccasions] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        isActive: true,
        image: null,
        products: [] // Array of product IDs
    });
    // For file input clearing
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    // Product Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [occasionsData, productsData] = await Promise.all([
                getAllOccasions(),
                getProducts() // Fetch all products for selection
            ]);
            setOccasions(occasionsData || []);
            setAllProducts(productsData || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            image: e.target.files[0]
        }));
    };

    const handleProductToggle = (productId) => {
        setFormData(prev => {
            const current = prev.products || [];
            if (current.includes(productId)) {
                return { ...prev, products: current.filter(id => id !== productId) };
            } else {
                return { ...prev, products: [...current, productId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('startDate', formData.startDate);
        data.append('endDate', formData.endDate);
        data.append('isActive', formData.isActive);
        data.append('products', JSON.stringify(formData.products)); // Send as JSON string

        if (formData.image instanceof File) {
            data.append('image', formData.image);
        }

        try {
            if (isEditing) {
                await updateOccasion(isEditing, data);
                alert("Occasion updated successfully!");
            } else {
                await createOccasion(data);
                alert("Occasion created successfully!");
            }
            fetchData();
            handleCancel();
        } catch (error) {
            console.error("Operation failed:", error);
            alert("Operation failed. See console.");
        }
    };

    const handleEdit = (occ) => {
        setIsEditing(occ._id);
        const productIds = occ.products ? occ.products.map(p => typeof p === 'object' ? p._id : p) : [];
        setFormData({
            name: occ.name,
            title: occ.title,
            description: occ.description || '',
            startDate: occ.startDate ? new Date(occ.startDate).toISOString().split('T')[0] : '',
            endDate: occ.endDate ? new Date(occ.endDate).toISOString().split('T')[0] : '',
            isActive: occ.isActive,
            image: occ.image, // URL
            products: productIds
        });
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await deleteOccasion(id);
            setOccasions(prev => prev.filter(o => o._id !== id));
        } catch (error) {
            console.error(error);
            alert("Delete failed");
        }
    };

    const handleCancel = () => {
        setIsEditing(null);
        setFormData({
            name: '',
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            isActive: true,
            image: null,
            products: []
        });
        setFileInputKey(Date.now());
    };

    // Helper to check if date range is active
    const checkActive = (start, end, active) => {
        const now = new Date();
        const s = new Date(start);
        const e = new Date(end);
        return active && s <= now && e >= now;
    };

    const handleCreateProduct = async (productFormData) => {
        try {
            // Build FormData from the modal's plain object if needed, but the modal might pass a plain object 
            // productFormData from ProductFormModal is just a state object. We need to convert to FormData.
            // Wait, createProduct in api.js expects FormData.
            // Let's replicate logic from AdminProducts to build FormData

            const data = new FormData();
            data.append('name', productFormData.name);
            data.append('price', productFormData.price);
            data.append('unit', productFormData.unit || 'pcs');
            data.append('category', productFormData.category);
            if (productFormData.subCategory) data.append('subCategory', productFormData.subCategory);
            data.append('stock', productFormData.countInStock);
            data.append('description', productFormData.description);
            if (productFormData.weight) data.append('weight', productFormData.weight);
            if (productFormData.variants) data.append('variants', JSON.stringify(productFormData.variants));
            if (productFormData.isTopPick !== undefined) data.append('isTopPick', productFormData.isTopPick);

            if (productFormData.image instanceof File) {
                data.append('image', productFormData.image);
            } else if (typeof productFormData.image === 'string' && productFormData.image.trim() !== '') {
                data.append('image', productFormData.image);
            }

            const newProduct = await createProduct(data);

            // Re-fetch products locally or append
            // Assuming the API returns the created product with _id
            if (newProduct && newProduct._id) {
                setAllProducts(prev => [newProduct, ...prev]);
                // Automatically select the new product
                handleProductToggle(newProduct._id);
                alert("Product created and added to selection!");
                setIsProductModalOpen(false);
            } else {
                alert("Failed to create product");
            }

        } catch (error) {
            console.error("Error creating product:", error);
            alert("Error creating product");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto mt-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Occasion Management</h2>
                    <p className="text-gray-500">Manage festivals, sales, and special events.</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6">
                <h3 className="font-bold text-lg mb-4">{isEditing ? '✏️ Edit Occasion' : '✨ Create New Occasion'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Name (e.g. "xmas_2025")</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Title (e.g. "Christmas Special")</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none h-20"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                                required
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 accent-purple-600"
                                />
                                <span className="text-gray-700 font-medium">Is Active?</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                        <input
                            key={fileInputKey}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        {formData.image && typeof formData.image === 'string' && (
                            <img src={formData.image} alt="Preview" className="h-20 mt-2 rounded object-cover" />
                        )}
                    </div>

                    {/* Product Selection */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Select Products</label>
                            <button
                                type="button"
                                onClick={() => setIsProductModalOpen(true)}
                                className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200 hover:bg-purple-100"
                            >
                                + Add New Product
                            </button>
                        </div>
                        <div className="h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {allProducts.map(prod => (
                                <div
                                    key={prod._id}
                                    onClick={() => handleProductToggle(prod._id)}
                                    className={`p-2 rounded border cursor-pointer text-sm flex items-center gap-2 ${formData.products.includes(prod._id) ? 'bg-purple-100 border-purple-300' : 'bg-white border-gray-200 hover:bg-gray-100'}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.products.includes(prod._id)}
                                        readOnly
                                        className="accent-purple-600"
                                    />
                                    <span className="truncate">{prod.name}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{formData.products.length} products selected</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold shadow-lg shadow-purple-200">
                            {isEditing ? 'Update Occasion' : 'Create Occasion'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={handleCancel} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-700">Existing Occasions</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {occasions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No occasions found. Create one above!</div>
                    ) : (
                        occasions.map(occ => {
                            const activeNow = checkActive(occ.startDate, occ.endDate, occ.isActive);
                            return (
                                <div key={occ._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                            {occ.image ? (
                                                <img src={occ.image} alt={occ.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">🎉</div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{occ.title} <span className="text-gray-400 font-normal text-xs">({occ.name})</span></h4>
                                            <div className="text-xs text-gray-500 flex gap-2">
                                                <span>{new Date(occ.startDate).toLocaleDateString()} - {new Date(occ.endDate).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className={`${activeNow ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                                                    {activeNow ? 'Active Now' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(occ)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(occ._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            {/* Product Create Modal */}
            <ProductFormModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSave={handleCreateProduct}
                initialData={null}
            />
        </div>
    );
};

export default AdminOccasions;
