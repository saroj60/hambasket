import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Click Handler for selection
const LocationMarker = ({ setPosition, position }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const AdminStores = () => {
    const [stores, setStores] = useState([]);
    const [storeForm, setStoreForm] = useState({ name: '', address: '', description: '', lat: 27.7172, lng: 85.3240 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const res = await fetch(`${API_URL}/stores/admin`, { credentials: 'include' });
            if (res.ok) setStores(await res.json());
        } catch (error) {
            console.error("Error fetching stores:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStore = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/stores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...storeForm,
                    location: { lat: parseFloat(storeForm.lat), lng: parseFloat(storeForm.lng) }
                })
            });
            if (res.ok) {
                alert("Store created successfully!");
                setStoreForm({ name: '', address: '', description: '', lat: 27.7172, lng: 85.3240 });
                fetchStores();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to create store");
            }
        } catch (error) {
            console.error("Error creating store:", error);
        }
    };

    const handleDeleteStore = async (id) => {
        if (!window.confirm("Are you sure you want to delete this store?")) return;
        try {
            const res = await fetch(`${API_URL}/stores/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) fetchStores();
        } catch (error) {
            console.error("Error deleting store:", error);
        }
    };

    const setPosition = (latlng) => {
        setStoreForm(prev => ({ ...prev, lat: latlng.lat, lng: latlng.lng }));
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800">Store Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Create Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Store Location</h3>
                    <form onSubmit={handleCreateStore} className="space-y-4">
                        <input
                            placeholder="Store Name"
                            value={storeForm.name}
                            onChange={e => setStoreForm({ ...storeForm, name: e.target.value })}
                            required
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary outline-none"
                        />
                        <input
                            placeholder="Address"
                            value={storeForm.address}
                            onChange={e => setStoreForm({ ...storeForm, address: e.target.value })}
                            required
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary outline-none"
                        />
                        <textarea
                            placeholder="Description (Optional)"
                            value={storeForm.description}
                            onChange={e => setStoreForm({ ...storeForm, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary outline-none h-20"
                        />

                        <div className="h-64 rounded-xl overflow-hidden border border-gray-200 relative z-0">
                            <MapContainer center={[27.7172, 85.3240]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker position={{ lat: storeForm.lat, lng: storeForm.lng }} setPosition={setPosition} />
                            </MapContainer>
                            <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 text-xs rounded shadow z-[1000]">
                                Tap map to set location
                            </div>
                        </div>

                        <div className="flex gap-2 text-sm text-gray-500">
                            <div>Lat: {storeForm.lat?.toFixed(4)}</div>
                            <div>Lng: {storeForm.lng?.toFixed(4)}</div>
                        </div>

                        <button type="submit" className="w-full btn btn-primary py-2.5">
                            Create Store
                        </button>
                    </form>
                </div>

                {/* Store List */}
                <div className="space-y-4 overflow-y-auto max-h-[800px]">
                    <h3 className="text-lg font-bold text-gray-800">Existing Stores</h3>
                    {stores.map(store => (
                        <div key={store._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">{store.name}</h4>
                                    <p className="text-gray-600 text-sm mt-1">{store.address}</p>
                                    {store.description && <p className="text-gray-400 text-xs mt-1">{store.description}</p>}
                                </div>
                                <button
                                    onClick={() => handleDeleteStore(store._id)}
                                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminStores;
