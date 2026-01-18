import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';

// AdminDashboard Component
const AdminDashboard = ({ setActiveTab }) => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSales: 0,
        totalUsers: 0,
        salesPerDay: [],
        recentOrders: [],
        pendingOrders: 0,
        statusCounts: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/analytics`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
    );

    // Calculate Today's Stats
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStats = stats.salesPerDay.find(d => d._id === todayStr) || { count: 0, totalSales: 0 };

    // Function to handle navigation
    const handleCardClick = (destination) => {
        // If setActiveTab is provided (from AdminLayout), use it
        if (typeof setActiveTab === 'function') {
            setActiveTab(destination);
        } else {
            console.warn('setActiveTab prop missing in AdminDashboard');
        }
    };

    return (
        <div className="space-y-6 pb-24 w-full overflow-hidden px-1">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-1">Overview</h1>
                <p className="text-gray-500 font-medium text-sm">Daily performance & status.</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* 1. Status Breakdown Card (Replaces simple Pending) */}
                <div
                    onClick={() => handleCardClick('orders')}
                    className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md hover:border-purple-300 transition-all group"
                >
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-600 font-bold text-xs uppercase tracking-wider">Order Status</p>
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">Live</span>
                    </div>
                    <div className="space-y-1 mt-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Pending</span>
                            <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{stats.statusCounts?.['Pending'] || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Processing</span>
                            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{stats.statusCounts?.['Processing'] || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Delivered</span>
                            <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{stats.statusCounts?.['Delivered'] || 0}</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-purple-500 font-semibold mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">Tap to manage orders</p>
                </div>

                {/* 2. Today's Sales (Revenue) */}
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5">
                        <span className="text-6xl">💰</span>
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <p className="text-green-700 font-bold text-xs uppercase tracking-wider mb-1 truncate">Revenue Today</p>
                            <h3 className="text-2xl font-black text-gray-900">Rs. {todayStats.totalSales.toLocaleString()}</h3>
                        </div>
                        <p className="text-[11px] text-green-600 font-semibold mt-1">{todayStr}</p>
                    </div>
                </div>

                {/* 3. Today's Orders */}
                <div
                    onClick={() => handleCardClick('orders')}
                    className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                >
                    <div className="absolute right-0 top-0 p-3 opacity-5">
                        <span className="text-6xl">📦</span>
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <p className="text-blue-700 font-bold text-xs uppercase tracking-wider mb-1 truncate">Orders Today</p>
                            <h3 className="text-2xl font-black text-gray-900">{todayStats.count}</h3>
                        </div>
                        <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                            New orders
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">→</span>
                        </p>
                    </div>
                </div>

                {/* 4. Total Customers */}
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5">
                        <span className="text-6xl">👥</span>
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <p className="text-purple-700 font-bold text-xs uppercase tracking-wider mb-1 truncate">Total Users</p>
                            <h3 className="text-2xl font-black text-gray-900">{stats.totalUsers}</h3>
                        </div>
                        <p className="text-[11px] text-purple-600 font-semibold mt-1">Registered customers</p>
                    </div>
                </div>
            </div>

            {/* Daily Performance Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Daily Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Orders</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Revenue</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Avg Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats.salesPerDay.map((day) => (
                                <tr key={day._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm font-bold text-gray-700">{day._id}</td>
                                    <td className="p-4 text-sm font-medium text-gray-600">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-100">{day.count}</span>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-gray-800">Rs. {day.totalSales.toLocaleString()}</td>
                                    <td className="p-4 text-xs text-gray-500 font-medium">Rs. {Math.round(day.totalSales / day.count).toLocaleString()}</td>
                                </tr>
                            ))}
                            {stats.salesPerDay.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400 text-sm">No daily data available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
