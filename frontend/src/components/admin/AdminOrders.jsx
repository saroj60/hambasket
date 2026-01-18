import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/orders`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                // Ensure sorting: Newest first (backend usually does this, but safely sorting here too)
                const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
                setOrders(sorted);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        // Optimistic UI update
        const prevOrders = [...orders];
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));

        try {
            const res = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error("Failed to update");
        } catch (error) {
            console.error("Error updating status:", error);
            // Revert on error
            setOrders(prevOrders);
            alert("Failed to update status. Please try again.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Accepted': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Packed': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Out for delivery': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredOrders = filterStatus === 'All'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const STATUS_OPTIONS = ["New", "Accepted", "Packed", "Out for delivery", "Delivered", "Cancelled"];

    if (loading && orders.length === 0) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-400">
                <span className="animate-pulse">Loading orders...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Orders Management</h2>
                    <p className="text-gray-500 text-sm font-medium">Manage and track all customer orders</p>
                </div>
                <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setFilterStatus('All')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === 'All' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All
                    </button>
                    {['New', 'Processing', 'Delivered'].map(s => (
                        // Mapping some key statuses for quick filters, or use a dropdown for full filter
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s === 'Processing' ? 'Packed' : s)} // Mapping simplified filter names if needed, or just exact matches
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === s ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {s === 'Processing' ? 'Active' : s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="text-5xl mb-4 opacity-20">📦</div>
                    <h3 className="text-gray-400 font-bold text-lg">No orders found</h3>
                    <p className="text-gray-400 text-sm">Waiting for new orders...</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredOrders.map(order => (
                        <div key={order._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl font-bold text-gray-400 border border-gray-100">
                                        #{order._id.slice(-4)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800 text-lg">
                                                {order.user?.name || order.guestInfo?.name || 'Guest User'}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center gap-4">
                                            <span className="flex items-center gap-1">📞 {order.user?.phone || order.guestInfo?.phone || 'N/A'}</span>
                                            <span className="flex items-center gap-1">📍 {order.shippingAddress || 'No Address'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </div>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 font-medium cursor-pointer outline-none hover:bg-gray-100 transition-colors"
                                    >
                                        {STATUS_OPTIONS.map(status => (
                                            <option key={status} value={status}>Mark as {status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Order Items Summary */}
                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-50">
                                <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-600">{item.quantity}x</span>
                                                <span className="text-gray-700">{item.name || item.product?.name}</span>
                                            </div>
                                            <span className="text-gray-500 font-medium">Rs. {item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Total Amount</span>
                                    <span className="text-lg font-black text-gray-800">Rs. {order.totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
