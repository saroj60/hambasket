
import React, { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory, addSubCategory, removeSubCategory } from '../../services/api';
import { BASE_URL } from '../../config';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        image: null,
        displayOrder: 0,
        isActive: true
    });
    const [preview, setPreview] = useState('');

    // Subcat State (for edit mode)
    const [newSubCat, setNewSubCat] = useState({ name: '', image: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getAllCategories(true);
            setCategories(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cat) => {
        setIsEditing(cat._id);
        setFormData({
            name: cat.name,
            displayOrder: cat.displayOrder,
            isActive: cat.isActive,
            image: cat.image
        });
        setPreview(cat.image ? (cat.image.startsWith('http') ? cat.image : `${BASE_URL}${cat.image}`) : '');
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete the category.")) return;
        try {
            await deleteCategory(id);
            setCategories(prev => prev.filter(c => c._id !== id));
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('displayOrder', formData.displayOrder);
        data.append('isActive', formData.isActive);

        if (formData.image instanceof File) {
            data.append('image', formData.image);
        } else if (typeof formData.image === 'string' && formData.image.startsWith('http')) {
            data.append('image', formData.image);
        }

        try {
            if (isEditing) {
                await updateCategory(isEditing, data);
            } else {
                await createCategory(data);
            }
            fetchCategories();
            handleCancel();
        } catch (error) {
            alert("Operation failed");
        }
    };

    const handleCancel = () => {
        setIsEditing(null);
        setShowForm(false);
        setFormData({ name: '', image: null, displayOrder: 0, isActive: true });
        setPreview('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    // Subcategory Handlers
    const handleAddSubCat = async (catId) => {
        if (!newSubCat.name) return;
        try {
            await addSubCategory(catId, newSubCat);
            setNewSubCat({ name: '', image: '' });
            fetchCategories(); // Refresh to show new subcat
        } catch (error) {
            alert("Failed to add subcategory");
        }
    };

    const handleRemoveSubCat = async (catId, subName) => {
        if (!window.confirm("Remove subcategory?")) return;
        try {
            await removeSubCategory(catId, subName);
            fetchCategories();
        } catch (error) {
            alert("Failed to remove");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
                {!showForm && (
                    <button
                        onClick={() => { handleCancel(); setShowForm(true); }}
                        className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700"
                    >
                        + New Category
                    </button>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-slide-up">
                    <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Category' : 'Create Category'}</h2>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 border rounded-xl"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Order</label>
                                <input
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={e => setFormData({ ...formData, displayOrder: e.target.value })}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 border rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden">
                                {preview ? <img src={preview} className="w-full h-full object-contain" /> : <span>No Img</span>}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold mb-1">Image</label>
                                <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-purple-50 file:text-purple-700" />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 font-bold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 accent-purple-600"
                                />
                                Is Active
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold">Save</button>
                            <button type="button" onClick={handleCancel} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {categories.map(cat => (
                    <div key={cat._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-xl shrink-0 p-2">
                            <img
                                src={cat.image && (cat.image.startsWith('http') ? cat.image : `${BASE_URL}${cat.image}`)}
                                className="w-full h-full object-contain"
                                onError={e => e.target.style.display = 'none'}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Order: {cat.displayOrder}</span>
                                    {!cat.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded ml-2">Inactive</span>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(cat)} className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100">✏️</button>
                                    <button onClick={() => handleDelete(cat._id)} className="text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100">🗑️</button>
                                </div>
                            </div>

                            {/* Subcategories */}
                            <div className="mt-4 border-t pt-2">
                                <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Subcategories</p>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {cat.subCategories.map(sub => (
                                        <div key={sub._id || sub.name} className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full text-sm border border-gray-200">
                                            <span>{sub.name}</span>
                                            <button onClick={() => handleRemoveSubCat(cat._id, sub.name)} className="text-red-400 hover:text-red-600 ml-1">×</button>
                                        </div>
                                    ))}
                                </div>
                                {/* Add Subcat quick input */}
                                <div className="flex gap-2 max-w-sm">
                                    <input
                                        type="text"
                                        placeholder="New Subcategory..."
                                        className="border rounded-lg px-3 py-1 text-sm flex-1 outline-none focus:border-purple-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddSubCat(cat._id);
                                                e.target.value = '';
                                            }
                                        }}
                                        onChange={(e) => setNewSubCat({ ...newSubCat, name: e.target.value })}
                                    />
                                    <button
                                        onClick={() => handleAddSubCat(cat._id)}
                                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCategories;
