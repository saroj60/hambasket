import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`, { credentials: 'include' });
            if (res.ok) setOrders(await res.json());
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchOrders(); // Refresh
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading orders...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
                    No orders found.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 pb-4 border-b border-gray-50">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-lg text-gray-800">Order #{order._id.slice(-6)}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                                    >
                                        {['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-xs uppercase text-gray-400 font-bold mb-2">Customer Details</h4>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">👤</span>
                                        <span className="font-medium">{order.user ? order.user.name : (order.guestInfo?.name || 'Guest')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="text-xl">📞</span>
                                        <span>{order.user?.phone || order.guestInfo?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                                        <span className="text-xl">📍</span>
                                        <span>{order.shippingAddress?.address || 'No Address'}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs uppercase text-gray-400 font-bold mb-2">Order Items</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">{item.quantity}x</span>
                                                    <span className="font-medium text-gray-700">
                                                        {item.product?.name || 'Unknown Product'}
                                                    </span>
                                                </div>
                                                <span className="text-gray-600">Rs. {item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between font-bold text-gray-800">
                                        <span>Total:</span>
                                        <span>Rs. {order.totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Delivered': return 'bg-green-100 text-green-700';
        case 'Cancelled': return 'bg-red-100 text-red-700';
        case 'Pending': return 'bg-yellow-100 text-yellow-700';
        case 'Processing': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

export default AdminOrders;
