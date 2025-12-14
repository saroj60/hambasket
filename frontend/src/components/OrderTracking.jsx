import React, { useState, useEffect } from 'react';
import OrderTrackingMap from './OrderTrackingMap';
import { useSocket } from '../context/SocketContext';

const OrderTracking = ({ order, onClose }) => {
    const [driverLocation, setDriverLocation] = useState(order.driver?.location || { lat: 27.7172, lng: 85.3240 }); // Default to Kathmandu
    const [deliveryLocation, setDeliveryLocation] = useState(() => {
        if (order.deliveryLocation && order.deliveryLocation.lat && order.deliveryLocation.lng) {
            return order.deliveryLocation;
        }
        // Fallback for older orders or missing coordinates
        return { lat: 27.7172, lng: 85.3240 };
    });

    const { socket } = useSocket() || {}; // Handle case where socket might be null initially
    const [status, setStatus] = useState(order.status);

    useEffect(() => {
        if (!socket) return;

        // Join Order Room
        socket.emit('joinOrder', order._id);

        // Listen for updates
        socket.on('orderUpdate', (updatedOrder) => {
            console.log("Received order update:", updatedOrder);
            setStatus(updatedOrder.status);
            if (updatedOrder.driver && updatedOrder.driver.location) {
                setDriverLocation(updatedOrder.driver.location);
            }
        });

        return () => {
            socket.off('orderUpdate');
        };
    }, [socket, order._id]);

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 105, backdropFilter: 'blur(2px)'
        }}>
            <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()} style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                backgroundColor: 'white', borderRadius: 'var(--radius-lg)',
                width: '90%', maxWidth: '600px', zIndex: 106,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                padding: '2rem', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Track Order #{order._id.slice(-6)}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Status: {status}</span>
                        <span style={{ color: 'var(--text-light)' }}>ETA: 15 mins</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            width: status === 'Delivered' ? '100%' : status === 'Out for Delivery' ? '75%' : '25%',
                            height: '100%',
                            backgroundColor: 'var(--success)',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <OrderTrackingMap driverLocation={driverLocation} deliveryLocation={deliveryLocation} />
                </div>

                {order.driver && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ width: '50px', height: '50px', backgroundColor: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            🛵
                        </div>
                        <div>
                            <div style={{ fontWeight: '600' }}>{order.driver.name}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Your Delivery Partner</div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                            <a href={`tel:${order.driver.phone}`} className="btn" style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'white', border: '1px solid var(--border)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>📞</a>
                            <a href="mailto:support@hambasket.com" className="btn" style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'white', border: '1px solid var(--border)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>💬</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;
