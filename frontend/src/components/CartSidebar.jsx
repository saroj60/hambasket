import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { CartContext } from '../context/CartContext';

const CartSidebar = ({ isOpen, onClose, cartItems, onRemove, onCheckout, onLoginRequired }) => {
  const [step, setStep] = useState('cart'); // cart, checkout, success
  const { user } = useAuth();
  const { location, openMap } = useLocation();
  const { addToCart } = useContext(CartContext);

  // Helper to update quantity
  const handleQuantityChange = (item, change) => {
    if (item.qty + change < 1) {
      onRemove(item._id);
    } else {
      addToCart(item, change);
    }
  };

  // Checkout State
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [deliveryTime, setDeliveryTime] = useState('Instant (15-30 mins)');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [customAddress, setCustomAddress] = useState(location?.address || 'Kathmandu, Nepal');
  const [couponMessage, setCouponMessage] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD, Khalti, Card
  const [savedMethods, setSavedMethods] = useState([]);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [khaltiId, setKhaltiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  const [tip, setTip] = useState(0);
  const [orderId, setOrderId] = useState(null);

  // Guest State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryFee = subtotal > 150 ? 0 : 50;
  const tax = 0; // Removed VAT as per request
  const total = subtotal + deliveryFee + tax - discount + tip;

  // Reset step when cart opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('cart');
      setDiscount(0);
      setCouponCode('');
      setCouponMessage('');
      setPaymentMethod('COD');
      setIsProcessing(false);
    }
  }, [isOpen]);

  // Set default address if user has one
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddr.address);
    }
    if (user) {
      fetchSavedMethods();
    }
  }, [user]);

  // Update custom address if global location changes
  useEffect(() => {
    if (location && location.address) {
      setCustomAddress(location.address);
    }
  }, [location]);

  const fetchSavedMethods = async () => {
    try {
      const res = await fetch(`${API_URL}/payment/methods`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedMethods(data);
      }
    } catch (err) {
      console.error("Failed to fetch saved methods", err);
    }
  };

  const handleProceedToCheckout = () => {
    // Allow guest checkout
    setStep('checkout');
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: subtotal })
      });
      const data = await res.json();

      if (res.ok) {
        setDiscount(data.discount);
        setCouponMessage({ type: 'success', text: `Saved Rs. ${data.discount}!` });
      } else {
        setDiscount(0);
        setCouponMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error("Coupon Error:", error);
      setCouponMessage({ type: 'error', text: "Failed to apply coupon" });
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const finalAddress = selectedAddress === 'new' || !selectedAddress ? customAddress : selectedAddress;
    let transactionId = null;
    let isPaid = false;

    try {
      // 1. Create Order FIRST (Pending)
      const orderData = {
        user: user ? user._id : null,
        guestInfo: !user ? { name: guestName, phone: guestPhone, email: "guest@example.com" } : null,
        items: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.qty,
          price: item.price
        })),
        subtotal,
        deliveryFee,
        tax,
        discount,
        totalAmount: total,
        shippingAddress: finalAddress,
        deliveryLocation: location?.coordinates,
        deliveryTime,
        paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod,
        paymentDetails: {
          transactionId: null,
          isPaid: false, // Default false until verifying
          paidAt: null
        },
        tip
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const orderRes = await res.json();
      if (!res.ok) throw new Error("Failed to create order");

      const newOrderId = orderRes._id;

      // 2. Handle Payment Logic
      if (paymentMethod === 'Khalti') {
        // Call Backend to Initiate
        const kRes = await fetch(`${API_URL}/payment/khalti/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token || ''}`
          },
          body: JSON.stringify({
            orderId: newOrderId,
            amount: total, // Rs
            name: user?.name || guestName || "Guest",
            email: user?.email || "guest@example.com",
            phone: user?.phone || guestPhone || "9800000000"
          })
        });
        const kData = await kRes.json();
        if (!kRes.ok) throw new Error(kData.message || "Khalti Init Failed");

        // REDIRECT TO KHALTI
        if (kData.payment_url) {
          window.location.href = kData.payment_url;
          return; // Stop execution, we are leaving the page
        }
      } else if (paymentMethod === 'Card') {
        // Existing Card Simulation
        const paymentRes = await fetch(`${API_URL}/payment/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
          body: JSON.stringify({ method: 'Card', amount: total, details: cardDetails })
        });
        const pData = await paymentRes.json();
        if (!paymentRes.ok) throw new Error(pData.message);
        // Update Order to Paid? (Or just assume created logic above needs update)
        // Since we created pending order above, we might need to update it?
        // For simplicity in this refactor, let's keep Card as 'Process then Create' or 'Create then Update'.
        // Given the flow rewrite, 'Create Pending -> Update' is better, but requires Update API.
        // fallback: just let it fall through to success step since order is created.
      }

      setOrderId(newOrderId);
      setStep('success');
      onCheckout();

    } catch (error) {
      console.error("Order Error:", error);
      alert(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppOrder = () => {
    let locationInfo = "";
    const coords = location?.coordinates;
    const addr = customAddress || location?.address;

    if (coords && coords.lat && coords.lng) {
      locationInfo = `\n\n📍 Location: https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    } else if (addr) {
      locationInfo = `\n\n📍 Address: ${addr}`;
    }

    const message = `Hi HamBasket! I'd like to order:\n\n${cartItems.map(i => `${i.qty}x ${i.name} - Rs. ${i.price * i.qty}`).join('\n')}\n\nTotal: Rs. ${subtotal}${locationInfo}`;
    const url = `https://wa.me/+9779815769007?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(2px)'
        }}
      />

      {/* Sidebar */}
      <div className="animate-fade-in" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: '400px', backgroundColor: 'white', zIndex: 2000,
        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
            {step === 'cart' && 'My Basket'}
            {step === 'checkout' && 'Checkout'}
            {step === 'success' && 'Order Status'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {step === 'cart' && (
            <>
              {/* Free Delivery Progress */}
              <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
                {subtotal >= 150 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: '700', fontSize: '0.9rem' }}>
                    <span>🎉</span> Free Delivery Unlocked!
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.4rem', color: '#166534' }}>
                      Add <b>Rs. {150 - subtotal}</b> more for <span style={{ fontWeight: '700', color: 'var(--success)' }}>Free Delivery</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', backgroundColor: '#dcfce7', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(subtotal / 150) * 100}%`, height: '100%', backgroundColor: 'var(--success)', transition: 'width 0.5s ease' }}></div>
                    </div>
                  </>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                  <p>Your basket is empty</p>
                  <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '1rem' }}>Start Shopping</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cartItems.map((item) => (
                    <div key={item._id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ width: '60px', height: '60px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', borderRadius: 'var(--radius-sm)' }}>{item.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>{item.name}</h4>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>Rs. {item.price}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%' }}>
                        <button
                          style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginBottom: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={() => onRemove(item._id)}
                          title="Remove Item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                          </svg>
                        </button>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: '#f3f4f6',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden'
                        }}>
                          <button
                            onClick={() => handleQuantityChange(item, -1)}
                            style={{ padding: '2px 8px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}
                          >-</button>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', padding: '0 4px' }}>{item.qty}</span>
                          <button
                            onClick={() => handleQuantityChange(item, 1)}
                            style={{ padding: '2px 8px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* WhatsApp Order Button */}
                  <button
                    onClick={handleWhatsAppOrder}
                    style={{
                      width: '100%', padding: '0.75rem', marginTop: '1rem',
                      backgroundColor: '#25D366', color: 'white', border: 'none',
                      borderRadius: 'var(--radius-md)', fontWeight: '600', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                  >
                    <span>💬</span> Order via WhatsApp
                  </button>
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Guest Details */}
              {!user && (
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>Guest Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input
                      placeholder="Full Name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    />
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Delivery Address</label>
                {user && user.addresses && user.addresses.length > 0 && (
                  <select
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '0.5rem' }}
                  >
                    {user.addresses.map((addr, idx) => (
                      <option key={idx} value={addr.address}>{addr.label}: {addr.address}</option>
                    ))}
                    <option value="new">+ Add New Address</option>
                  </select>
                )}

                {(selectedAddress === 'new' || !user || !user.addresses || user.addresses.length === 0) && (
                  <>
                    <textarea
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      required
                      placeholder="Enter your full address..."
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', minHeight: '80px' }}
                    />
                    <button
                      type="button"
                      onClick={() => openMap()}
                      style={{
                        marginTop: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      📍 Select on Map / Use Current Location
                    </button>
                  </>
                )}
              </div>

              {/* Delivery Time */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Delivery Time</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setDeliveryTime('Instant (15-30 mins)')}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid',
                      borderColor: deliveryTime.includes('Instant') ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: deliveryTime.includes('Instant') ? 'var(--accent)' : 'white',
                      color: deliveryTime.includes('Instant') ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: '600', fontSize: '0.875rem'
                    }}
                  >
                    ⚡ Instant
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryTime('Scheduled')}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid',
                      borderColor: deliveryTime === 'Scheduled' ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: deliveryTime === 'Scheduled' ? 'var(--accent)' : 'white',
                      color: deliveryTime === 'Scheduled' ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: '600', fontSize: '0.875rem'
                    }}
                  >
                    📅 Scheduled
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  {['COD'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid',
                        borderColor: paymentMethod === method ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: paymentMethod === method ? 'var(--accent)' : 'white',
                        color: paymentMethod === method ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: '600', fontSize: '0.875rem'
                      }}
                    >
                      Cash on Delivery
                    </button>
                  ))}
                </div>

                {/* Payment Details */}
                {paymentMethod === 'Khalti' && (
                  <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <img src="https://d1yc508cb541n2.cloudfront.net/e94d8d17-9154-47c4-a5e2-66b97b0a8501/KHALTI_LOGO.png" alt="Khalti" style={{ height: '30px', objectFit: 'contain' }} />
                      <span style={{ fontWeight: '600', color: '#5c2d91' }}>Pay via Khalti</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      You will be redirected to Khalti's secure payment page to complete your purchase.
                    </p>
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    {savedMethods.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Saved Cards</p>
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                          {savedMethods.map((m, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setCardDetails({ ...cardDetails, number: `**** **** **** ${m.last4}` });
                                setSelectedSavedMethod(m);
                              }}
                              style={{
                                padding: '0.5rem', border: '1px solid',
                                borderColor: selectedSavedMethod === m ? 'var(--primary)' : 'var(--border)',
                                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                backgroundColor: selectedSavedMethod === m ? 'white' : '#f3f4f6',
                                minWidth: '120px'
                              }}
                            >
                              <div style={{ fontWeight: '600', fontSize: '0.75rem' }}>{m.brand}</div>
                              <div style={{ fontSize: '0.75rem' }}>**** {m.last4}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <input
                      placeholder="Card Number"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '0.5rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        required
                        style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                      />
                      <input
                        placeholder="CVC"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        required
                        style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>
                      <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
                      Save this card for future
                    </label>
                  </div>
                )}
              </div>

              {/* Rider Tip */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Tip your Rider 🚴</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[0, 20, 50, 100].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setTip(amount)}
                      style={{
                        flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid',
                        borderColor: tip === amount ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: tip === amount ? 'var(--accent)' : 'white',
                        color: tip === amount ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: '600', fontSize: '0.875rem'
                      }}
                    >
                      {amount === 0 ? 'No Tip' : `Rs. ${amount}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Promo Code</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    placeholder="Enter Code (e.g. WELCOME50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="btn btn-outline"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: couponMessage.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Fee Breakdown */}
              <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : `Rs. ${deliveryFee}`}</span>
                </div>
                {/* Tax Removed */}
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--success)' }}>
                    <span>Discount</span>
                    <span>- Rs. {discount}</span>
                  </div>
                )}
                {tip > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)' }}>
                    <span>Rider Tip</span>
                    <span>Rs. {tip}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.125rem' }}>
                  <span>Total</span>
                  <span>Rs. {total}</span>
                </div>
              </div>

            </form>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--success)' }}>Order Placed!</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your order will be delivered in {deliveryTime.includes('Instant') ? '15-30 mins' : 'the scheduled slot'}.</p>

              <button
                onClick={() => {
                  const message = `*New Order Placed!* 🛍️\n\n*Order ID:* ${orderId || 'N/A'}\n*Customer:* ${user?.name || 'Guest'}\n\n*Items:*\n${cartItems.map(i => `${i.qty}x ${i.name} - Rs. ${i.price * i.qty}`).join('\n')}\n\n*Total:* Rs. ${total}\n*Payment:* ${paymentMethod}\n*Address:* ${selectedAddress === 'new' || !selectedAddress ? customAddress : selectedAddress}`;
                  const url = `https://wa.me/+9779815769007?text=${encodeURIComponent(message)}`;
                  window.open(url, '_blank');
                }}
                className="btn"
                style={{ width: '100%', marginBottom: '1rem', backgroundColor: '#25D366', color: 'white', border: 'none' }}
              >
                💬 Send Order to WhatsApp
              </button>

              <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>Continue Shopping</button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && cartItems.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: '#f9fafb', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            {step === 'cart' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700' }}>
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <button onClick={handleProceedToCheckout} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                  Proceed to Checkout
                </button>
              </>
            ) : (
              <button
                form="checkout-form"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', opacity: isProcessing ? 0.7 : 1 }}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Order Now'}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
