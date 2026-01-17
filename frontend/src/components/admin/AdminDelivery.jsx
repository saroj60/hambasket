import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const AdminDelivery = () => {
    const [drivers, setDrivers] = useState([]);
    const [driverForm, setDriverForm] = useState({ name: '', phone: '', email: '', password: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const res = await fetch(`${API_URL}/drivers`, { credentials: 'include' });
            if (res.ok) setDrivers(await res.json());
        } catch (error) {
            console.error("Error fetching drivers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDriver = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/drivers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Delivery Management</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Driver Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Register New Driver</h3>
                        <form onSubmit={handleAddDriver} className="space-y-4">
                            <input
                                placeholder="Full Name"
                                value={driverForm.name}
                                onChange={e => setDriverForm({ ...driverForm, name: e.target.value })}
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <input
                                placeholder="Phone Number"
                                value={driverForm.phone}
                                onChange={e => setDriverForm({ ...driverForm, phone: e.target.value })}
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={driverForm.email}
                                onChange={e => setDriverForm({ ...driverForm, email: e.target.value })}
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={driverForm.password}
                                onChange={e => setDriverForm({ ...driverForm, password: e.target.value })}
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <button type="submit" className="w-full btn btn-primary py-2.5">
                                Add Driver
                            </button>
                        </form>
                    </div>
                </div>

                {/* Driver List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">Active Drivers ({drivers.length})</h3>
                    {drivers.length === 0 ? (
                        <p className="text-gray-500 italic">No drivers registered yet.</p>
                    ) : (
                        drivers.map(driver => (
                            <div key={driver._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                                        🚚
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-800">{driver.name}</div>
                                        <div className="text-sm text-gray-500">{driver.phone} • {driver.email}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${driver.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    <span className="text-xs text-gray-500 ml-2">{driver.isAvailable ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDelivery;
