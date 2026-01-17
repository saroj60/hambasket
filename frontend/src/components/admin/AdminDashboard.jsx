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
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-xl shadow-gray-200/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-4 z-40">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        Good Morning! <span className="text-2xl animate-bounce">👋</span>
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition-all font-medium text-sm hover:-translate-y-0.5"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`Rs. ${analytics.totalSales?.toLocaleString() || 0}`}
                    icon="💰"
                    trend="+12%"
                    color="green"
                />
                <StatCard
                    title="Total Orders"
                    value={analytics.totalOrders || 0}
                    icon="📦"
                    trend="+5%"
                    color="blue"
                />
                <StatCard
                    title="Active Users"
                    value={analytics.totalUsers || 0}
                    icon="👥"
                    trend="+8%"
                    color="purple"
                />
            </div>

            {/* Daily Sales Chart (Vertical Bar Chart) */}
            {analytics.salesPerDay && analytics.salesPerDay.length > 0 ? (
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">📊</div>
                            Sales Performance
                        </h3>
                    </div>

                    <div className="h-64 flex items-end gap-3 md:gap-6 overflow-x-auto pb-4 custom-scrollbar px-2">
                        {analytics.salesPerDay.map((day, index) => {
                            const maxSales = Math.max(...analytics.salesPerDay.map(d => d.totalSales));
                            const percentage = maxSales > 0 ? (day.totalSales / maxSales) * 100 : 0;
                            return (
                                <div key={day._id} className="group relative flex flex-col items-center flex-1 min-w-[50px] h-full justify-end">
                                    {/* Tooltip */}
                                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 text-white text-xs py-2 px-3 rounded-lg pointer-events-none whitespace-nowrap z-50 shadow-xl mb-2 font-medium transform translate-y-2 group-hover:translate-y-0">
                                        Rs. {day.totalSales.toLocaleString()}
                                        <div className="text-gray-400 text-[10px] mt-0.5">{day._id}</div>
                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>

                                    {/* Bar */}
                                    <div
                                        className="w-full max-w-[60px] bg-gradient-to-t from-primary/80 to-primary rounded-xl transition-all duration-500 ease-out group-hover:scale-y-105 group-hover:shadow-lg group-hover:shadow-primary/30 origin-bottom relative overflow-hidden"
                                        style={{ height: `${percentage}%`, minHeight: '8px' }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                    </div>

                                    {/* X-Axis Label */}
                                    <div className="mt-4 text-xs text-gray-400 font-semibold group-hover:text-primary transition-colors">
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
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-1">
                            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">⚡</div>
                            AI Demand Forecast
                        </h3>
                        <p className="text-gray-500 text-sm ml-11">Predicted demand for the next 7 days based on data.</p>
                    </div>
                </div>

                {forecast.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 text-gray-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-5 pl-6">Product</th>
                                    <th className="p-5 text-center">History (30d)</th>
                                    <th className="p-5 text-center">Daily Avg</th>
                                    <th className="p-5 pr-6 text-right">Prediction</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {forecast.map(item => (
                                    <tr key={item.productId} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-5 pl-6 font-semibold text-gray-700 flex items-center gap-4">
                                            <span className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">{item.emoji}</span>
                                            {item.name}
                                        </td>
                                        <td className="p-5 text-center text-gray-500 font-medium">{item.totalSoldLast30Days}</td>
                                        <td className="p-5 text-center text-gray-500">{item.dailyAverage}</td>
                                        <td className="p-5 pr-6 text-right">
                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-green-50 text-green-600 border border-green-100">
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
                        <div className="text-4xl mb-3 grayscale opacity-30">🤖</div>
                        <p className="text-gray-400 font-medium">Not enough historical data for AI predictions</p>
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
                    background-color: #f3f4f6;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #e5e7eb;
                }
            `}</style>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, color }) => {
    const colorClasses = {
        green: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3.5 rounded-2xl ${colorClasses[color]} text-2xl shadow-sm`}>
                    {icon}
                </div>
                <div className="px-2.5 py-1 rounded-full bg-gray-50 text-xs font-bold text-gray-400 border border-gray-100 flex items-center gap-1">
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">{title}</p>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">{value}</h3>
            </div>
        </div>
    );
};

export default AdminDashboard;
