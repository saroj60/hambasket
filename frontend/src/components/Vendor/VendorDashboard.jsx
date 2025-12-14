import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const VendorDashboard = () => {
    const { user } = useAuth();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, settings
    const [loading, setLoading] = useState(true);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '', price: '', stock: '', category: 'Fruits & Vegetables', description: '', image: '', emoji: '🍎'
    });

    useEffect(() => {
        fetchStoreDetails();
    }, []);

    const fetchStoreDetails = async () => {
        try {
            const res = await fetch(`${API_URL}/stores/my-store`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setStore(data);
                fetchStoreProducts(data._id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching store:", error);
            setLoading(false);
        }
    };

    const fetchStoreProducts = async (storeId) => {
        try {
            const res = await fetch(`${API_URL}/products?store=${storeId}`);
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStore = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const storeData = {
            name: formData.get('name'),
            description: formData.get('description'),
            address: formData.get('address'),
        };

        try {
            const res = await fetch(`${API_URL}/stores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(storeData)
            });
            if (res.ok) {
                const data = await res.json();
                setStore(data);
                window.location.reload();
            }
        } catch (error) {
            console.error("Error creating store:", error);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(productForm).forEach(key => {
            if (key === 'imageFile' && productForm[key]) {
                formData.append('image', productForm[key]);
            } else if (key !== 'imageFile' && key !== 'image') {
                formData.append(key, productForm[key]);
            }
        });

        try {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    // Content-Type is automatically set by browser for FormData
                },
                credentials: 'include',
                body: formData
            });
            if (res.ok) {
                alert("Product added successfully!");
                setShowAddProduct(false);
                fetchStoreProducts(store._id);
                setProductForm({ name: '', price: '', stock: '', category: 'Fruits & Vegetables', description: '', image: '', emoji: '🍎', imageFile: null });
            }
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

    if (!store) {
        return (
            <div className="max-w-2xl mx-auto p-8">
                <div className="card p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Become a Vendor</h2>
                    <p className="text-gray-600 mb-8">Start selling your products on HamBasket today!</p>

                    <form onSubmit={handleCreateStore} className="text-left space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Store Name</label>
                            <input name="name" required className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea name="description" className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <input name="address" required className="w-full p-2 border rounded" />
                        </div>
                        <button type="submit" className="btn btn-primary w-full">Create Store</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">{store.name}</h1>
                    <p className="text-gray-600">Vendor Dashboard</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${store.status === 'Active' ? 'bg-green-100 text-green-800' :
                    store.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {store.status}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="card p-4 space-y-2 h-fit">
                    {['overview', 'products', 'orders', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left p-2 rounded capitalize ${activeTab === tab ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="md:col-span-3">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="card p-4">
                                <h3 className="text-gray-500 text-sm">Total Products</h3>
                                <p className="text-2xl font-bold">{products.length}</p>
                            </div>
                            <div className="card p-4">
                                <h3 className="text-gray-500 text-sm">Total Orders</h3>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                            <div className="card p-4">
                                <h3 className="text-gray-500 text-sm">Revenue</h3>
                                <p className="text-2xl font-bold">Rs. 0</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="card p-4">
                            <div className="flex justify-between mb-4">
                                <h2 className="text-lg font-bold">Products</h2>
                                <button
                                    onClick={() => setShowAddProduct(!showAddProduct)}
                                    className="btn btn-primary text-sm"
                                >
                                    {showAddProduct ? 'Cancel' : '+ Add Product'}
                                </button>
                            </div>

                            {showAddProduct && (
                                <form onSubmit={handleAddProduct} className="mb-6 p-4 border rounded bg-gray-50 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            placeholder="Product Name"
                                            value={productForm.name}
                                            onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                            className="p-2 border rounded w-full"
                                            required
                                        />
                                        <input
                                            placeholder="Price"
                                            type="number"
                                            value={productForm.price}
                                            onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                            className="p-2 border rounded w-full"
                                            required
                                        />
                                        <input
                                            placeholder="Stock"
                                            type="number"
                                            value={productForm.stock}
                                            onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                                            className="p-2 border rounded w-full"
                                            required
                                        />
                                        <input
                                            placeholder="Emoji"
                                            value={productForm.emoji}
                                            onChange={e => setProductForm({ ...productForm, emoji: e.target.value })}
                                            className="p-2 border rounded w-full"
                                        />
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium mb-1">Product Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setProductForm({ ...productForm, imageFile: e.target.files[0] })}
                                                className="p-2 border rounded w-full"
                                            />
                                        </div>
                                    </div>
                                    <textarea
                                        placeholder="Description"
                                        value={productForm.description}
                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                        className="p-2 border rounded w-full"
                                    />
                                    <button type="submit" className="btn btn-primary w-full">Add Product</button>
                                </form>
                            )}

                            <div className="space-y-4">
                                {products.map(product => (
                                    <div key={product._id} className="flex items-center gap-4 p-4 border rounded">
                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">
                                            {product.emoji}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{product.name}</h4>
                                            <p className="text-sm text-gray-500">Rs. {product.price}</p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Stock: {product.stock}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
