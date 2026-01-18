import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';

// Premium Line Chart Component (SVG)
const SalesChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400 font-medium">No sales data available yet</div>;

    const sortedData = [...data].sort((a, b) => new Date(a._id) - new Date(b._id)).reverse().slice(0, 14).reverse();
    const maxVal = Math.max(...sortedData.map(d => d.totalSales), 100);
    const height = 300;
    const width = 800;
    const padding = 20;

    const points = sortedData.map((d, i) => {
        const x = padding + (i / (sortedData.length - 1)) * (width - 2 * padding);
        const y = height - padding - (d.totalSales / maxVal) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    const fillPath = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full drop-shadow-lg">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>

                {/* Grid */}
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                    <line
                        key={i}
                        x1={padding}
                        y1={padding + t * (height - 2 * padding)}
                        x2={width - padding}
                        y2={padding + t * (height - 2 * padding)}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                ))}

                {/* Area */}
                <polygon points={fillPath} fill="url(#chartGradient)" />

                {/* Line */}
                <polyline points={points} fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                {/* Interactive Dots */}
                {sortedData.map((d, i) => {
                    const x = padding + (i / (sortedData.length - 1)) * (width - 2 * padding);
                    const y = height - padding - (d.totalSales / maxVal) * (height - 2 * padding);
                    return (
                        <g key={i} className="group cursor-pointer">
                            <circle cx={x} cy={y} r="6" fill="#fff" stroke="#7c3aed" strokeWidth="3" className="transition-all duration-300 group-hover:scale-125 shadow-sm" />
                            {/* Tooltip */}
                            <foreignObject x={x - 60} y={y - 70} width="120" height="60" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 text-center shadow-xl transform translate-y-1">
                                    <div className="font-bold text-sm">Rs. {d.totalSales.toLocaleString()}</div>
                                    <div className="text-gray-400 text-[10px]">{d._id}</div>
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}
            </svg>
            <div className="flex justify-between px-2 text-xs font-semibold text-gray-400 mt-2 uppercase tracking-wide">
                <span>{sortedData[0]?._id}</span>
                <span>{sortedData[sortedData.length - 1]?._id}</span>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSales: 0,
        totalUsers: 0,
        salesPerDay: [],
        recentOrders: []
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

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header - Clean, No Search Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Overview</h1>
                    <p className="text-gray-500 font-medium text-lg">Detailed analysis of your store's performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-sm font-bold text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live Updates
                    </div>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-1 rounded-[2rem] shadow-xl shadow-purple-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="bg-[#1e1b4b] h-full rounded-[1.8rem] p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                <span className="text-2xl">💰</span>
                            </div>
                            <span className="text-xs font-bold bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500/20">+12% vs last mo</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-indigo-200 font-medium text-sm uppercase tracking-wider mb-1">Total Revenue</p>
                            <h3 className="text-3xl font-black text-white tracking-tight">Rs. {stats.totalSales.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-orange-50 rounded-2xl group-hover:bg-orange-100 transition-colors">
                            <span className="text-2xl">📦</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-1">Total Orders</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.totalOrders}</h3>
                    </div>
                </div>

                {/* Customers Card */}
                <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                            <span className="text-2xl">👥</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-1">Total Customers</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.totalUsers}</h3>
                    </div>
                </div>
            </div>

            {/* Sales Chart Section */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Revenue Trends</h3>
                        <p className="text-gray-400 text-sm font-medium">Daily income over time</p>
                    </div>
                    <select className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer">
                        <option>Last 14 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
                <div className="h-0 md:h-auto overflow-hidden">
                    <SalesChart data={stats.salesPerDay} />
                </div>
                <div className="md:hidden text-center text-gray-400 text-xs mt-4 bg-gray-50 p-3 rounded-xl">
                    Full interactive chart available on desktop view.
                </div>
            </div>

            {/* Minimal Recent Activity */}
            {stats.recentOrders && stats.recentOrders.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 px-2">Recent Activity</h3>
                    <div className="bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden">
                        {stats.recentOrders.map((order, i) => (
                            <div key={order._id} className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${i !== stats.recentOrders.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl shadow-inner">
                                        🛍️
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Order #{order._id.slice(-4)}</p>
                                        <p className="text-xs text-gray-500 font-medium">{order.user?.name || 'Guest'} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900">Rs. {order.totalAmount}</p>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-orange-100 text-orange-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
