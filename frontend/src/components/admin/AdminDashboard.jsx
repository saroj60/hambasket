import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchAnalytics(), fetchForecast()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/analytics`, { credentials: 'include' });
            if (res.ok) setAnalytics(await res.json());
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    };

    const fetchForecast = async () => {
        try {
            const res = await fetch(`${API_URL}/analytics/forecast`, { credentials: 'include' });
            if (res.ok) setForecast(await res.json());
        } catch (error) {
            console.error("Error fetching forecast:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="animate-pulse font-medium">Loading Dashboard...</p>
            </div>
        );
    }

    if (!analytics) return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
            <span className="text-4xl mb-2">⚠️</span>
            <p>Failed to load analytics data.</p>
            <button onClick={fetchData} className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Retry</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-8 rounded-3xl border border-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h2>
                    <p className="text-gray-500 mt-1 font-medium">Welcome back! Here's what's happening today.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all font-medium text-sm"
                >
                    🔄 Refresh Data
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`Rs. ${analytics.totalSales?.toLocaleString() || 0}`}
                    icon="💰"
                    bg="from-green-500 to-emerald-500"
                    shadow="shadow-green-500/20"
                />
                <StatCard
                    title="Total Orders"
                    value={analytics.totalOrders || 0}
                    icon="📦"
                    bg="from-blue-500 to-indigo-500"
                    shadow="shadow-blue-500/20"
                />
                <StatCard
                    title="Active Users"
                    value={analytics.totalUsers || 0}
                    icon="👥"
                    bg="from-purple-500 to-pink-500"
                    shadow="shadow-purple-500/20"
                />
            </div>

            {/* Daily Sales Chart (Vertical Bar Chart) */}
            {analytics.salesPerDay && analytics.salesPerDay.length > 0 ? (
                <div className="bg-white p-8 rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">📊</span> Sales Performance
                        </h3>
                        {/* <select className="bg-gray-50 border-none rounded-lg text-sm px-3 py-1 text-gray-500 focus:ring-0 cursor-pointer hover:bg-gray-100"><option>Last 30 Days</option></select> */}
                    </div>

                    <div className="h-64 flex items-end gap-2 md:gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {analytics.salesPerDay.map((day, index) => {
                            const maxSales = Math.max(...analytics.salesPerDay.map(d => d.totalSales));
                            const percentage = maxSales > 0 ? (day.totalSales / maxSales) * 100 : 0;
                            return (
                                <div key={day._id} className="group relative flex flex-col items-center flex-1 min-w-[40px] h-full justify-end">
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 mb-2">
                                        Rs. {day.totalSales.toLocaleString()} <br />
                                        <span className="text-gray-400">{day._id}</span>
                                    </div>

                                    {/* Bar */}
                                    <div
                                        className="w-full max-w-[50px] bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-700 ease-out group-hover:from-primary group-hover:to-primary group-hover:scale-y-105 origin-bottom relative overflow-hidden"
                                        style={{ height: `${percentage}%`, minHeight: '4px' }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                    </div>

                                    {/* X-Axis Label */}
                                    <div className="mt-3 text-[10px] md:text-xs text-gray-400 font-medium rotate-0 truncate w-full text-center">
                                        {day._id.split('-').slice(1).join('/')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center text-gray-400 italic">
                    No sales data available for the charts yet.
                </div>
            )}

            {/* AI Forecast */}
            <div className="bg-white p-8 rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-1">
                            <span className="text-2xl">⚡</span> AI Demand Forecast
                        </h3>
                        <p className="text-gray-500 text-sm">Predicted demand for the next 7 days based on historical trends.</p>
                    </div>
                </div>

                {forecast.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="p-4 pl-6">Product</th>
                                    <th className="p-4 text-center">History (30d)</th>
                                    <th className="p-4 text-center">Daily Avg</th>
                                    <th className="p-4 pr-6 text-right">Predicted Demand</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {forecast.map(item => (
                                    <tr key={item.productId} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 pl-6 font-medium text-gray-700 flex items-center gap-3">
                                            <span className="p-2 bg-gray-50 rounded-lg text-lg shadow-sm border border-gray-100">{item.emoji}</span>
                                            {item.name}
                                        </td>
                                        <td className="p-4 text-center text-gray-600 font-medium">{item.totalSoldLast30Days}</td>
                                        <td className="p-4 text-center text-gray-600">{item.dailyAverage}</td>
                                        <td className="p-4 pr-6 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 shadow-sm">
                                                <span>📈</span> {item.forecastNext7Days} units
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-3 grayscale opacity-50">🤖</div>
                        <p className="text-gray-500 font-medium">Not enough historical data for AI predictions
                            <br /><span className="text-xs font-normal">Keep selling to unlock smart insights!</span>
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

const StatCard = ({ title, value, icon, bg, shadow }) => (
    <div className={`
        bg-gradient-to-br ${bg} 
        p-6 rounded-3xl shadow-xl ${shadow} 
        text-white overflow-hidden relative group
        transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1
    `}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl rotate-12 transform translate-x-2 -translate-y-2">
            {icon}
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl mb-4 shadow-inner">
                {icon}
            </div>
            <div>
                <p className="text-blue-50 text-sm font-medium mb-1 tracking-wide uppercase opacity-90">{title}</p>
                <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            </div>
        </div>
    </div>
);

export default AdminDashboard;
