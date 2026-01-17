import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';

const AdminCustomers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/users`, { credentials: 'include' });
            if (res.ok) setUsers(await res.json());
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId) => {
        if (!window.confirm("Are you sure you want to block/unblock this user?")) return;
        try {
            const res = await fetch(`${API_URL}/users/${userId}/block`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error("Error blocking user:", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading customers...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Customers ({users.length})</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="p-4 rounded-tl-2xl">Name</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 rounded-tr-2xl text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map(u => (
                                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-800">{u.name}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-600">📧 {u.email}</div>
                                        <div className="text-sm text-gray-500">📞 {u.phone || '-'}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {u.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => handleBlockUser(u._id)}
                                                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${u.isBlocked
                                                        ? 'text-green-600 border-green-200 hover:bg-green-50'
                                                        : 'text-red-600 border-red-200 hover:bg-red-50'
                                                    }`}
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
        </div>
    );
};

export default AdminCustomers;
