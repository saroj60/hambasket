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
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                Loading Dashboard...
            </div>
        );
    }

    if (!analytics) return <div className="text-center text-gray-500 mt-10">Failed to load analytics data.</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <p className="text-gray-500 text-sm">Welcome back to your store analytics.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Sales"
                    value={`Rs. ${analytics.totalSales?.toLocaleString() || 0}`}
                    icon="💰"
                    bg="bg-green-50"
                    color="text-green-600"
                />
                <StatCard
                    title="Total Orders"
                    value={analytics.totalOrders || 0}
                    icon="📦"
                    bg="bg-blue-50"
                    color="text-blue-600"
                />
                <StatCard
                    title="Total Users"
                    value={analytics.totalUsers || 0}
                    icon="👥"
                    bg="bg-purple-50"
                    color="text-purple-600"
                />
            </div>

            {/* Daily Sales Chart (Bar) */}
            {analytics.salesPerDay && analytics.salesPerDay.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span>📊</span> Sales Performance (Last 30 Days)
                    </h3>
                    <div className="space-y-4">
                        {analytics.salesPerDay.map((day) => {
                            const maxSales = Math.max(...analytics.salesPerDay.map(d => d.totalSales));
                            const percentage = maxSales > 0 ? (day.totalSales / maxSales) * 100 : 0;
                            return (
                                <div key={day._id} className="flex items-center text-sm group">
                                    <div className="w-24 text-gray-400 font-medium">{day._id}</div>
                                    <div className="flex-1 px-4">
                                        <div className="relative h-6 rounded-md bg-gray-50 overflow-hidden w-full">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-primary/80 rounded-md transition-all duration-1000 ease-out group-hover:bg-primary"
                                                style={{ width: `${percentage}%`, minWidth: '4px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-24 text-right font-bold text-gray-700">Rs. {day.totalSales.toLocaleString()}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* AI Forecast */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span>📈</span> AI Demand Forecast (Next 7 Days)
                </h3>
                {forecast.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="pb-3 pl-2">Product</th>
                                    <th className="pb-3 text-center">30-Day Sales</th>
                                    <th className="pb-3 text-center">Daily Avg</th>
                                    <th className="pb-3 text-right pr-2">Predicted Demand</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {forecast.map(item => (
                                    <tr key={item.productId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 pl-2 font-medium text-gray-700">
                                            <span className="mr-2 text-lg">{item.emoji}</span> {item.name}
                                        </td>
                                        <td className="py-4 text-center text-gray-600">{item.totalSoldLast30Days}</td>
                                        <td className="py-4 text-center text-gray-600">{item.dailyAverage}</td>
                                        <td className="py-4 text-right pr-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {item.forecastNext7Days} units
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400 italic">
                        Not enough data yet to generate AI predictions.
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, bg, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bg}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
            <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
        </div>
    </div>
);

export default AdminDashboard;
