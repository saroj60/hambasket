import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';

const InvoiceModal = ({ order, isOpen, onClose }) => {
    const invoiceRef = useRef();

    if (!isOpen || !order) return null;

    const handleDownloadPDF = () => {
        const element = invoiceRef.current;

        // PDF Config
        const opt = {
            margin: 10,
            filename: `Invoice_${order._id.slice(-6)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generate
        html2pdf().from(element).set(opt).save();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(3px)'
        }} onClick={onClose}>

            {/* Container - Prevent click propagation */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="animate-fade-in"
                style={{
                    width: '90%', maxWidth: '800px', maxHeight: '90vh',
                    backgroundColor: 'white', borderRadius: '8px',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden'
                }}
            >
                {/* Header Toolbar */}
                <div style={{
                    padding: '1rem', borderBottom: '1px solid #eee',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: '#f9fafb'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#374151' }}>
                        Invoice / Receipt
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={handleDownloadPDF}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                        >
                            <span>📥</span> Download PDF
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none', border: '1px solid #ddd', borderRadius: '4px',
                                padding: '0.5rem 0.8rem', cursor: 'pointer', fontSize: '1rem'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Invoice Content (Scrollable) */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', backgroundColor: '#525659' }}>

                    {/* Paper Effect */}
                    <div
                        ref={invoiceRef}
                        style={{
                            backgroundColor: 'white', maxWidth: '210mm', minHeight: '297mm', // A4 Dimensions
                            margin: '0 auto', padding: '20mm',
                            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                            color: '#111827', fontFamily: "'Arial', sans-serif"
                        }}
                    >
                        {/* INVOICE HEADER */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                            <div>
                                {/* Brand Logo / Name */}
                                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#dc2626', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
                                    HAMBASKET
                                </h1>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                    The Smartest Way to Shop
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Invoice</h2>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#4b5563' }}>
                                    <p><strong>Invoice #:</strong> INV-{order._id.slice(-6).toUpperCase()}</p>
                                    <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                                    <p><strong>Order Status:</strong> {order.status}</p>
                                </div>
                            </div>
                        </div>

                        {/* BILL TO / SHIP TO */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '2rem' }}>
                            <div style={{ width: '45%' }}>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.5rem' }}>Billed To</h3>
                                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{order.guestInfo?.name || order.user?.name || "Customer"}</p>
                                <p style={{ color: '#4b5563', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                                    {order.shippingAddress || "N/A"}<br />
                                    {order.guestInfo?.phone || order.user?.phone || ""}
                                </p>
                            </div>
                            <div style={{ width: '45%', textAlign: 'left' }}>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.5rem' }}>Shipped From</h3>
                                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>HamBasket Inc.</p>
                                <p style={{ color: '#4b5563', lineHeight: '1.4' }}>
                                    Kathmandu, Nepal<br />
                                    support@hambasket.com<br />
                                    +977 9815769007
                                </p>
                            </div>
                        </div>

                        {/* ITEMS TABLE */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb', fontSize: '0.85rem', textTransform: 'uppercase', color: '#374151' }}>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Description</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Qty</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Unit Price</th>
                                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '0.9rem' }}>
                                {order.items.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem', color: '#111827' }}>
                                            <span style={{ fontWeight: '600' }}>{item.name}</span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#4b5563' }}>{item.quantity}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: '#4b5563' }}>
                                            Rs. {item.price.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#111827' }}>
                                            Rs. {(item.price * item.quantity).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* TOTALS */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                            <div style={{ width: '250px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#4b5563', fontSize: '0.9rem' }}>
                                    <span>Subtotal:</span>
                                    <span>Rs. {order.subtotal?.toLocaleString() || 0}</span>
                                </div>

                                {order.deliveryFee > 0 ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#4b5563', fontSize: '0.9rem' }}>
                                        <span>Delivery Fee:</span>
                                        <span>Rs. {order.deliveryFee}</span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#16a34a', fontSize: '0.9rem' }}>
                                        <span>Delivery Fee:</span>
                                        <span>Free</span>
                                    </div>
                                )}

                                {order.discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#16a34a', fontSize: '0.9rem' }}>
                                        <span>Discount:</span>
                                        <span>- Rs. {order.discount}</span>
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', padding: '1rem 0',
                                    borderTop: '2px solid #e5e7eb', marginTop: '0.5rem',
                                    color: '#111827', fontSize: '1.2rem', fontWeight: 'bold'
                                }}>
                                    <span>Total:</span>
                                    <span>Rs. {order.totalAmount?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div style={{ marginTop: '4rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                            <p>Thank you for shopping with HamBasket!</p>
                            <p style={{ marginTop: '0.25rem' }}>For any questions, please contact support@hambasket.com</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
