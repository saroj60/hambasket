import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';

const StoreList = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const res = await fetch(`${API_URL}/stores`);
            const data = await res.json();
            setStores(data);
        } catch (error) {
            console.error("Error fetching stores:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Stores...</div>;

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Our Partner Stores</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stores.map(store => (
                    <Link to={`/stores/${store._id}`} key={store._id} className="card hover:shadow-lg transition-shadow">
                        <div className="h-32 bg-gray-100 flex items-center justify-center text-4xl">
                            🏪
                        </div>
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-2">{store.name}</h2>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{store.description}</p>
                            <div className="flex items-center text-sm text-gray-500">
                                📍 {store.address}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default StoreList;
