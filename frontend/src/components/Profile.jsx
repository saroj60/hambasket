import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ onLocationSelect }) => {
    const [position, setPosition] = useState(null);
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
        locationfound(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
    }, [map]);

    const handleLocateMe = (e) => {
        e.preventDefault();
        e.stopPropagation();
        map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
    };

    const eventHandlers = React.useMemo(
        () => ({
            dragend() {
                const marker = this.markerRef.current;
                if (marker != null) {
                    const latlng = marker.getLatLng();
                    setPosition(latlng);
                    onLocationSelect(latlng);
                }
            },
        }),
        [onLocationSelect],
    );

    const markerRef = React.useRef(null);

    return (
        <>
            {position && (
                <Marker
                    draggable={true}
                    eventHandlers={{
                        dragend: (e) => {
                            const marker = e.target;
                            const latlng = marker.getLatLng();
                            setPosition(latlng);
                            onLocationSelect(latlng);
                        }
                    }}
                    position={position}
                    ref={markerRef}
                />
            )}
            <button
                onClick={handleLocateMe}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    backgroundColor: 'white',
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    padding: '5px 8px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                title="Locate Me"
            >
                📍
            </button>
        </>
    );
};

const Profile = ({ onClose, onTrackOrder }) => {
    const { user, logout, wishlist, removeFromWishlist } = useAuth();
    const { addToCart } = React.useContext(CartContext);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('history'); // history, addresses

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({ label: '', address: '', isDefault: false });

    useEffect(() => {
        if (activeTab === 'addresses') {
            fetchAddresses();
        }
    }, [activeTab]);

    const fetchAddresses = async () => {
        try {
            const res = await fetch(`${API_URL}/users/profile`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setAddresses(data.addresses || []);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/users/address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(addressForm)
            });
            if (res.ok) {
                const updatedAddresses = await res.json();
                setAddresses(updatedAddresses);
                setShowAddressForm(false);
                setAddressForm({ label: '', address: '', isDefault: false });
            }
        } catch (error) {
            console.error("Error adding address:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/my-orders`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const [subscriptions, setSubscriptions] = useState([]);

    useEffect(() => {
        if (activeTab === 'subscriptions') {
            fetchSubscriptions();
        }
    }, [activeTab]);

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch(`${API_URL}/subscriptions`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) setSubscriptions(data);
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
        }
    };

    const handleCancelSubscription = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this subscription?")) return;
        try {
            const res = await fetch(`${API_URL}/subscriptions/${id}/cancel`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (res.ok) {
                fetchSubscriptions();
            }
        } catch (error) {
            console.error("Error cancelling subscription:", error);
        }
    };

    return (
        <div className="animate-fade-in" style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'white',
            zIndex: 102,
            boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--primary)', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', backgroundColor: 'white', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{user?.name || 'User'}</h2>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>{user?.phone || user?.email}</p>
                    </div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{ flex: 1, minWidth: '100px', padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : 'none', color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
                >
                    Orders
                </button>
                <button
                    onClick={() => setActiveTab('subscriptions')}
                    style={{ flex: 1, minWidth: '120px', padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'subscriptions' ? '2px solid var(--primary)' : 'none', color: activeTab === 'subscriptions' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
                >
                    Subscriptions
                </button>
                <button
                    onClick={() => setActiveTab('addresses')}
                    style={{ flex: 1, minWidth: '100px', padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'addresses' ? '2px solid var(--primary)' : 'none', color: activeTab === 'addresses' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
                >
                    Addresses
                </button>
                <button
                    onClick={() => setActiveTab('wishlist')}
                    style={{ flex: 1, minWidth: '100px', padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'wishlist' ? '2px solid var(--primary)' : 'none', color: activeTab === 'wishlist' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
                >
                    Wishlist
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f9fafb' }}>
                {activeTab === 'history' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {orders.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No orders yet.</p>
                        ) : (
                            orders.map(order => (
                                <div key={order._id} className="card" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600' }}>Order #{order._id.slice(-6)}</span>
                                        <span style={{
                                            backgroundColor: order.status === 'Pending' ? '#fef3c7' : '#dcfce7',
                                            color: order.status === 'Pending' ? '#d97706' : '#16a34a',
                                            padding: '2px 8px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.5rem' }}>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                                <span>{item.quantity}x {item.name}</span>
                                                <span>Rs. {item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '700', alignItems: 'center' }}>
                                        <div>
                                            <span>Total: </span>
                                            <span>Rs. {order.totalAmount}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {order.status === 'Delivered' && (!order.refundStatus || order.refundStatus === 'None') && (
                                                <button
                                                    onClick={async () => {
                                                        const reason = prompt("Please enter a reason for the refund:");
                                                        if (reason) {
                                                            try {
                                                                const res = await fetch(`${API_URL}/orders/${order._id}/refund`, {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Content-Type': 'application/json'
                                                                    },
                                                                    credentials: 'include',
                                                                    body: JSON.stringify({ reason })
                                                                });
                                                                if (res.ok) {
                                                                    alert("Refund request submitted!");
                                                                    fetchOrders();
                                                                } else {
                                                                    const data = await res.json();
                                                                    alert(data.message || "Failed to request refund");
                                                                }
                                                            } catch (error) {
                                                                console.error("Error requesting refund:", error);
                                                            }
                                                        }
                                                    }}
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444' }}
                                                >
                                                    Request Refund
                                                </button>
                                            )}
                                            {order.refundStatus && order.refundStatus !== 'None' && (
                                                <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                                    Refund: {order.refundStatus}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => onTrackOrder(order)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                            >
                                                Track Order
                                            </button>
                                            <button
                                                onClick={() => {
                                                    order.items.forEach(item => {
                                                        // Assuming item.product is populated or we have enough info. 
                                                        // Ideally we need full product object. 
                                                        // But addToCart usually expects a product object.
                                                        // Let's check if item has product details.
                                                        // In order model: product: ObjectId ref Product.
                                                        // We need to populate product in fetchOrders.
                                                        if (item.product) {
                                                            addToCart(item.product, item.quantity);
                                                        }
                                                    });
                                                    alert("Items added to cart!");
                                                    onClose();
                                                }}
                                                className="btn btn-outline"
                                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                            >
                                                Reorder
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'subscriptions' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {subscriptions.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No active subscriptions.</p>
                        ) : (
                            subscriptions.map(sub => (
                                <div key={sub._id} className="card" style={{ padding: '1rem', borderLeft: sub.status === 'active' ? '4px solid #16a34a' : '4px solid #9ca3af' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{sub.frequency.charAt(0).toUpperCase() + sub.frequency.slice(1)} Delivery</span>
                                        <span style={{
                                            backgroundColor: sub.status === 'active' ? '#dcfce7' : '#f3f4f6',
                                            color: sub.status === 'active' ? '#16a34a' : '#374151',
                                            padding: '2px 8px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {sub.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        {sub.items.map((item, idx) => (
                                            <div key={idx} style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                                                {item.quantity}x {item.product?.name || 'Product'}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        Next Delivery: {new Date(sub.nextDelivery).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                        Address: {sub.address}
                                    </div>
                                    {sub.status === 'active' && (
                                        <button
                                            onClick={() => handleCancelSubscription(sub._id)}
                                            className="btn btn-outline"
                                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}
                                        >
                                            Cancel Subscription
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'addresses' && (
                    <div>
                        {!showAddressForm ? (
                            <div
                                onClick={() => setShowAddressForm(true)}
                                className="card"
                                style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px dashed var(--primary)', backgroundColor: 'var(--accent)' }}
                            >
                                <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>+</span>
                                <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Add New Address</span>
                            </div>
                        ) : (
                            <form onSubmit={handleAddAddress} className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>New Address</h3>

                                {/* Map */}
                                <div style={{ height: '200px', marginBottom: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                    <MapContainer center={[27.7172, 85.3240]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <LocationPicker onLocationSelect={async (latlng) => {
                                            setAddressForm(prev => ({ ...prev, coordinates: { lat: latlng.lat, lng: latlng.lng } }));
                                            try {
                                                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
                                                const data = await res.json();
                                                if (data && data.display_name) {
                                                    setAddressForm(prev => ({ ...prev, address: data.display_name }));
                                                }
                                            } catch (error) {
                                                console.error("Error fetching address:", error);
                                            }
                                        }} />
                                    </MapContainer>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
                                    Tap on the map to set your location automatically.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <input
                                        placeholder="Label (e.g., Home, Office)"
                                        value={addressForm.label}
                                        onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}
                                        required
                                        style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                    />
                                    <textarea
                                        placeholder="Full Address"
                                        value={addressForm.address}
                                        onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                                        required
                                        style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', minHeight: '60px' }}
                                    />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={addressForm.isDefault}
                                            onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                        />
                                        Set as default address
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                                        <button type="button" onClick={() => setShowAddressForm(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {addresses.map((addr, idx) => (
                            <div key={idx} className="card" style={{ padding: '1rem', marginBottom: '1rem', border: addr.isDefault ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: '600' }}>{addr.label}</span>
                                    {addr.isDefault && <span style={{ fontSize: '0.75rem', backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>Default</span>}
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{addr.address}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'wishlist' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {wishlist.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Your wishlist is empty.</p>
                        ) : (
                            wishlist.map(product => (
                                <div key={product._id} className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', backgroundColor: '#f3f4f6', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        {product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} /> : product.emoji}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600' }}>{product.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Rs. {product.price}</div>
                                    </div>
                                    <button
                                        onClick={() => removeFromWishlist(product._id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title="Remove"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'white' }}>
                <button onClick={() => { logout(); onClose(); }} className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                    Logout
                </button>
            </div>
        </div >
    );
};

export default Profile;
