import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CATEGORIES = [
    "Fruits & Vegetables",
    "Dairy, Bread & Eggs",
    "Atta, Rice, Oil & Dals",
    "Meat, Fish & Eggs",
    "Masala & Dry Fruits",
    "Breakfast & Sauces",
    "Packaged Food",
    "Tea, Coffee & More",
    "Ice Creams & Frozen",
    "Pharmacy"
];

const AdminPanel = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const { user, logout } = useAuth();
    const { sendPromo } = useNotifications();

    const [activeTab, setActiveTab] = useState('products'); // products, orders, promo
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        emoji: '',
        category: 'Fruits & Vegetables',
        time: '10 mins',
        weight: '1 kg',
        stock: 100,
        description: '',
        image: '',
        imageFile: null,
        flashSale: { active: false, discount: 0, endTime: '' }
    });
    const [editingId, setEditingId] = useState(null);
    const [promoMessage, setPromoMessage] = useState('');

    const [drivers, setDrivers] = useState([]);
    const [driverForm, setDriverForm] = useState({ name: '', phone: '', email: '', password: '' });

    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [forecast, setForecast] = useState([]);

    const [lowStockProducts, setLowStockProducts] = useState([]);

    const [stores, setStores] = useState([]);
    const [storeForm, setStoreForm] = useState({ name: '', address: '', description: '', lat: '', lng: '' });

    // Fetch Data based on tab
    useEffect(() => {
        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'delivery') fetchDrivers();
        if (activeTab === 'customers') fetchUsers();
        if (activeTab === 'analytics') { fetchAnalytics(); fetchForecast(); }
        if (activeTab === 'products') fetchLowStock();
        if (activeTab === 'stores') fetchStores();
    }, [activeTab]);

    const fetchStores = async () => {
        try {
            const res = await fetch(`${API_URL}/stores/admin`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setStores(data);
        } catch (error) {
            console.error("Error fetching stores:", error);
        }
    };

    const handleCreateStore = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/stores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...storeForm,
                    location: { lat: parseFloat(storeForm.lat), lng: parseFloat(storeForm.lng) }
                })
            });
            if (res.ok) {
                alert("Store created successfully!");
                setStoreForm({ name: '', address: '', description: '', lat: '', lng: '' });
                fetchStores();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to create store");
            }
        } catch (error) {
            console.error("Error creating store:", error);
        }
    };

    const handleDeleteStore = async (id) => {
        if (!window.confirm("Are you sure you want to delete this store?")) return;
        try {
            const res = await fetch(`${API_URL}/stores/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                fetchStores();
            }
        } catch (error) {
            console.error("Error deleting store:", error);
        }
    };

    const fetchLowStock = async () => {
        try {
            const res = await fetch(`${API_URL}/products/low-stock`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setLowStockProducts(data);
        } catch (error) {
            console.error("Error fetching low stock products:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const fetchDrivers = async () => {
        try {
            const res = await fetch(`${API_URL}/drivers`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setDrivers(data);
        } catch (error) {
            console.error("Error fetching drivers:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/users`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/analytics`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setAnalytics(data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    };

    const fetchForecast = async () => {
        try {
            const res = await fetch(`${API_URL}/analytics/forecast`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setForecast(data);
        } catch (error) {
            console.error("Error fetching forecast:", error);
        }
    };

    const handleBlockUser = async (userId) => {
        if (!window.confirm("Are you sure you want to block/unblock this user?")) return;
        try {
            const res = await fetch(`${API_URL}/users/${userId}/block`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Error blocking user:", error);
        }
    };

    const handleAddDriver = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/drivers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(driverForm)
            });
            if (res.ok) {
                alert("Driver added successfully!");
                setDriverForm({ name: '', phone: '', email: '', password: '' });
                fetchDrivers();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to add driver");
            }
        } catch (error) {
            console.error("Error adding driver:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'imageFile' && formData[key]) {
                data.append('image', formData[key]);
            } else if (key === 'flashSale') {
                data.append('flashSale', JSON.stringify(formData[key]));
            } else if (key !== 'imageFile' && key !== 'image') {
                data.append(key, formData[key]);
            }
        });

        if (editingId) {
            await updateProduct(editingId, data);
            setEditingId(null);
        } else {
            await addProduct(data);
        }
        setFormData({ name: '', price: '', emoji: '', category: 'Fruits & Vegetables', time: '10 mins', weight: '1 kg', stock: 100, description: '', image: '', imageFile: null });
    };

    const handleEdit = (product) => {
        setFormData(product);
        setEditingId(product._id);
        setActiveTab('products');
    };

    const handleSendPromo = async (e) => {
        e.preventDefault();
        if (!promoMessage.trim()) return;
        await sendPromo(promoMessage);
        setPromoMessage('');
        alert('Promo sent to all users!');
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div className="admin-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Admin Dashboard</h2>
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to logout?")) {
                                logout();
                            }
                        }}
                        className="btn btn-outline"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                        Logout
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Analytics 📊
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Customers 👥
                    </button>
                    <button
                        onClick={() => setActiveTab('promo')}
                        className={`btn ${activeTab === 'promo' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Promo
                    </button>
                    <button
                        onClick={() => setActiveTab('delivery')}
                        className={`btn ${activeTab === 'delivery' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Delivery 🚚
                    </button>
                    <button
                        onClick={() => setActiveTab('stores')}
                        className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Stores 🏪
                    </button>
                </div>
            </div>

            {activeTab === 'analytics' ? (
                /* Analytics Tab */
                <div className="admin-layout" style={{ display: 'block' }}>
                    {analytics ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Sales</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>Rs. {analytics.totalSales.toLocaleString()}</div>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Orders</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{analytics.totalOrders}</div>
                            </div>
                            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Users</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{analytics.totalUsers}</div>
                            </div>
                        </div>
                    ) : (
                        <p>Loading analytics...</p>
                    )}

                    {/* Demand Forecast Section */}
                    <div className="card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📈 AI Demand Forecast (Next 7 Days)
                        </h3>
                        {forecast.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                            <th style={{ padding: '0.75rem' }}>Product</th>
                                            <th style={{ padding: '0.75rem' }}>Sold (Last 30 Days)</th>
                                            <th style={{ padding: '0.75rem' }}>Daily Avg</th>
                                            <th style={{ padding: '0.75rem' }}>Predicted Demand</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forecast.map(item => (
                                            <tr key={item.productId} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '0.75rem' }}>{item.emoji} {item.name}</td>
                                                <td style={{ padding: '0.75rem' }}>{item.totalSoldLast30Days}</td>
                                                <td style={{ padding: '0.75rem' }}>{item.dailyAverage}</td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{ fontWeight: '700', color: '#059669', backgroundColor: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>
                                                        {item.forecastNext7Days} units
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>Not enough data to generate forecast.</p>
                        )}
                    </div>
                </div>
            ) : activeTab === 'customers' ? (
                /* Customers Tab */
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Registered Customers ({users.length})</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem' }}>Name</th>
                                    <th style={{ padding: '0.75rem' }}>Email</th>
                                    <th style={{ padding: '0.75rem' }}>Phone</th>
                                    <th style={{ padding: '0.75rem' }}>Role</th>
                                    <th style={{ padding: '0.75rem' }}>Status</th>
                                    <th style={{ padding: '0.75rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem' }}>{u.name}</td>
                                        <td style={{ padding: '0.75rem' }}>{u.email}</td>
                                        <td style={{ padding: '0.75rem' }}>{u.phone || '-'}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem',
                                                backgroundColor: u.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                                                color: u.role === 'admin' ? '#1e40af' : '#374151'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                color: u.isBlocked ? '#ef4444' : '#16a34a',
                                                fontWeight: '600'
                                            }}>
                                                {u.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {u.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleBlockUser(u._id)}
                                                    className="btn btn-outline"
                                                    style={{
                                                        padding: '0.25rem 0.5rem', fontSize: '0.75rem',
                                                        color: u.isBlocked ? '#16a34a' : '#ef4444',
                                                        borderColor: u.isBlocked ? '#16a34a' : '#ef4444'
                                                    }}
                                                >
                                                    {u.isBlocked ? 'Unblock' : 'Block'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'products' ? (
                <div className="admin-layout">
                    {/* Low Stock Alert */}
                    {lowStockProducts.length > 0 && (
                        <div className="card" style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', marginBottom: '1rem', gridColumn: '1 / -1' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ⚠️ Low Stock Alert ({lowStockProducts.length})
                            </h3>
                            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                {lowStockProducts.map(p => (
                                    <div key={p._id} style={{ minWidth: '200px', backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.emoji} {p.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>
                                            Only {p.stock} left!
                                        </div>
                                        <button
                                            onClick={() => handleEdit(p)}
                                            style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Restock Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add/Edit Form */}
                    <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                placeholder="Product Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', minHeight: '80px' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="number"
                                    placeholder="Price (Rs.)"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                    style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setFormData({ ...formData, imageFile: e.target.files[0] })}
                                        style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', width: '100%' }}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {formData.imageFile ? 'Selected: ' + formData.imageFile.name : 'No file selected'}
                                    </div>
                                    <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>OR</div>
                                    <input
                                        placeholder="Image URL (https://...)"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', width: '100%' }}
                                    />
                                    {(formData.image || formData.imageFile) && (
                                        <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                            <img
                                                src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.image}
                                                alt="Preview"
                                                style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <input
                                    placeholder="Emoji"
                                    value={formData.emoji}
                                    onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                                    style={{ width: '80px', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                />
                            </div>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    placeholder="Time (e.g. 10 mins)"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    required
                                    style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                />
                                <input
                                    placeholder="Weight (e.g. 1 kg)"
                                    value={formData.weight}
                                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                    required
                                    style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                />
                            </div>

                            {/* Flash Sale Section */}
                            <div style={{ padding: '1rem', border: '1px solid #fcd34d', borderRadius: 'var(--radius-sm)', backgroundColor: '#fffbeb' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: '#b45309' }}>⚡ Flash Sale Settings</h4>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.flashSale?.active || false}
                                            onChange={e => setFormData({ ...formData, flashSale: { ...formData.flashSale, active: e.target.checked } })}
                                        />
                                        Active
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Discount %"
                                        value={formData.flashSale?.discount || ''}
                                        onChange={e => setFormData({ ...formData, flashSale: { ...formData.flashSale, discount: e.target.value } })}
                                        style={{ width: '100px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                    />
                                </div>
                                <input
                                    type="datetime-local"
                                    value={formData.flashSale?.endTime ? new Date(formData.flashSale.endTime).toISOString().slice(0, 16) : ''}
                                    onChange={e => setFormData({ ...formData, flashSale: { ...formData.flashSale, endTime: e.target.value } })}
                                    style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary">
                                {editingId ? 'Update Product' : 'Add Product'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', price: '', emoji: '', category: 'Fruits & Vegetables', time: '10 mins', weight: '1 kg', stock: 100, description: '', image: '', imageFile: null }); }} className="btn btn-outline">
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Product List */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Product List ({products.length})</h3>
                        <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {products.map(product => (
                                <div key={product._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                                        ) : (
                                            <span style={{ fontSize: '1.5rem' }}>{product.emoji}</span>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Rs. {product.price} • Stock: {product.stock}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEdit(product)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
                                        <button onClick={() => deleteProduct(product._id)} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#ef4444' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : activeTab === 'orders' ? (
                /* Orders Tab */
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Recent Orders</h3>
                    {orders.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No orders found.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.map(order => (
                                <div key={order._id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                                        <div>
                                            <span style={{ fontWeight: '700' }}>Order #{order._id.slice(-6)}</span>
                                            <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {new Date(order.createdAt).toLocaleString()}
                                            </span>
                                            <div style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.25rem' }}>
                                                👤 {order.user ? order.user.name : (order.guestInfo?.name || 'Guest')}
                                                <span style={{ marginLeft: '0.5rem', fontWeight: '600' }}>
                                                    📞 {order.user?.phone || order.guestInfo?.phone || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <select
                                                value={order.status}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    try {
                                                        const res = await fetch(`${API_URL}/orders/${order._id}`, {
                                                            method: 'PUT',
                                                            headers: {
                                                                'Content-Type': 'application/json'
                                                            },
                                                            credentials: 'include',
                                                            body: JSON.stringify({ status: newStatus })
                                                        });
                                                        if (res.ok) {
                                                            setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: newStatus } : o));
                                                        }
                                                    } catch (err) {
                                                        console.error("Failed to update status", err);
                                                    }
                                                }}
                                                style={{
                                                    padding: '0.25rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '1px solid var(--border)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    backgroundColor: order.status === 'Pending' ? '#fef3c7' :
                                                        order.status === 'Processing' ? '#e0f2fe' :
                                                            order.status === 'Out for Delivery' ? '#f3e8ff' :
                                                                order.status === 'Delivered' ? '#dcfce7' : '#fee2e2',
                                                    color: order.status === 'Pending' ? '#d97706' :
                                                        order.status === 'Processing' ? '#0284c7' :
                                                            order.status === 'Out for Delivery' ? '#7c3aed' :
                                                                order.status === 'Delivered' ? '#16a34a' : '#ef4444'
                                                }}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Out for Delivery">Out for Delivery</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Items:</div>
                                            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                        <span>{item.quantity}x {item.name}</span>
                                                        <span style={{ fontWeight: '500' }}>
                                                            Rs. {item.price * item.quantity} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({item.price}/ea)</span>
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Total:</div>
                                            <div style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--primary)' }}>Rs. {order.totalAmount}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{order.paymentMethod}</div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        <strong>Deliver to:</strong> {order.shippingAddress}
                                    </div>
                                    {order.deliveryLocation && order.deliveryLocation.lat && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLocation.lat},${order.deliveryLocation.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                                marginTop: '0.5rem', fontSize: '0.875rem', padding: '0.25rem 0.75rem',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            🚗 Get Directions
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : activeTab === 'delivery' ? (
                /* Delivery Management Tab */
                <div className="admin-layout">
                    {/* Add Driver Form */}
                    <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Add New Driver</h3>
                        <form onSubmit={handleAddDriver} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                placeholder="Driver Name"
                                value={driverForm.name}
                                onChange={e => setDriverForm({ ...driverForm, name: e.target.value })}
                                required
                                style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                            <input
                                placeholder="Phone Number"
                                value={driverForm.phone}
                                onChange={e => setDriverForm({ ...driverForm, phone: e.target.value })}
                                required
                                style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={driverForm.email}
                                onChange={e => setDriverForm({ ...driverForm, email: e.target.value })}
                                required
                                style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={driverForm.password}
                                onChange={e => setDriverForm({ ...driverForm, password: e.target.value })}
                                required
                                style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                            <button type="submit" className="btn btn-primary">Add Driver</button>
                        </form>
                    </div>

                    {/* Driver List & Map */}
                    <div className="card" style={{ padding: '1.5rem', flex: 1 }}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Active Drivers ({drivers.length})</h3>

                        {/* Simple List View for now, Map can be added below */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                            {drivers.map(driver => (
                                <div key={driver._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: driver.status === 'Available' ? '#f0fdf4' : '#fff' }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{driver.user?.name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {driver.user?.phone} • {driver.status}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '999px', backgroundColor: driver.status === 'Available' ? '#dcfce7' : driver.status === 'Busy' ? '#fee2e2' : '#f3f4f6', color: driver.status === 'Available' ? '#166534' : driver.status === 'Busy' ? '#991b1b' : '#374151' }}>
                                        {driver.status}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Driver Map */}
                        <div style={{ height: '400px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <MapContainer center={[27.7172, 85.3240]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {drivers.map(driver => (
                                    driver.currentLocation && driver.currentLocation.lat && (
                                        <Marker
                                            key={driver._id}
                                            position={[driver.currentLocation.lat, driver.currentLocation.lng]}
                                        >
                                            <Popup>
                                                <div style={{ fontWeight: '600' }}>{driver.user?.name}</div>
                                                <div>Status: {driver.status}</div>
                                                <div>Phone: {driver.user?.phone}</div>
                                            </Popup>
                                        </Marker>
                                    )
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'stores' ? (
                /* Stores Tab */
                <div className="admin-layout">
                    {/* Add Store Form */}
                    <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Add New Store</h3>
                        <form onSubmit={handleCreateStore} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                placeholder="Store Name"
                                value={storeForm.name}
                                onChange={e => setStoreForm({ ...storeForm, name: e.target.value })}
                                required
                                style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                            <textarea
                                placeholder="Address"
                                value={storeForm.address}
                                onChange={e => setStoreForm({ ...storeForm, address: e.target.value })}
                                required
                                style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                            <textarea
                                placeholder="Description"
                                value={storeForm.description}
                                onChange={e => setStoreForm({ ...storeForm, description: e.target.value })}
                                style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="number"
                                    placeholder="Latitude"
                                    value={storeForm.lat}
                                    onChange={e => setStoreForm({ ...storeForm, lat: e.target.value })}
                                    style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Longitude"
                                    value={storeForm.lng}
                                    onChange={e => setStoreForm({ ...storeForm, lng: e.target.value })}
                                    style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Create Store</button>
                        </form>
                    </div>

                    {/* Store List */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Active Stores ({stores.length})</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stores.map(store => (
                                <div key={store._id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{store.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{store.address}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manager: {store.owner?.name || 'N/A'}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteStore(store._id)}
                                        className="btn btn-outline"
                                        style={{ color: '#ef4444', borderColor: '#ef4444', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Promo Tab */
                <div className="card" style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Send Promotional Notification</h3>
                    <form onSubmit={handleSendPromo}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Message</label>
                            <textarea
                                value={promoMessage}
                                onChange={(e) => setPromoMessage(e.target.value)}
                                placeholder="Enter your promo message here..."
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', minHeight: '100px' }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Send to All Users 🚀
                        </button>
                    </form>
                </div>
            )
            }
        </div >
    );
};

export default AdminPanel;
