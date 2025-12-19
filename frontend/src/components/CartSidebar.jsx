import React, { useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { CartContext } from '../context/CartContext';

const CartSidebar = ({ isOpen, onClose, cartItems, onRemove, onCheckout, onLoginRequired }) => {
  const [step, setStep] = useState('cart'); // cart, checkout, success
  const { user } = useAuth();
  const { location, openModal } = useLocation();
  const { addToCart, clearCart } = useContext(CartContext);

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
  const [selectedAddress, setSelectedAddress] = useState('');
  const [customAddress, setCustomAddress] = useState(location?.address || 'Kathmandu, Nepal');
  const [couponMessage, setCouponMessage] = useState('');

  // Guest State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryFee = subtotal > 150 ? 0 : 50;
  const total = subtotal + deliveryFee - discount;

  // Reset step when cart opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('cart');
      setDiscount(0);
      setCouponCode('');
      setCouponMessage('');
    }
  }, [isOpen]);

  // Set default address if user has one
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddr.address);
    }
  }, [user]);

  // Update custom address if global location changes
  useEffect(() => {
    if (location && location.address) {
      setCustomAddress(location.address);
    }
  }, [location]);

  const handleProceedToCheckout = () => {
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

  const handleWhatsAppCheckout = (e) => {
    e.preventDefault();

    // 1. Mandatory Location Check
    if (!location?.coordinates) {
      alert("⚠️ Location Mandatory\n\nPlease select your precise location on the map before placing an order.");
      openModal();
      return;
    }

    // 2. Guest Validation
    if (!user && (!guestName || !guestPhone)) {
      alert("Please provide your name and phone number.");
      return;
    }

    // 3. Construct Message
    const name = user?.name || guestName;
    const phone = user?.phone || guestPhone;
    const addressToUse = selectedAddress === 'new' || !selectedAddress ? customAddress : selectedAddress;

    const itemsList = cartItems.map(i => `• ${i.name} (x${i.qty}) - Rs. ${i.price * i.qty}`).join('\n');
    const locationLink = location.coordinates ? `https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}` : 'N/A';

    const message = `*New Order Request* 🛒\n\n` +
      `*Customer:* ${name}\n` +
      `*Phone:* ${phone}\n\n` +
      `*Items:*\n${itemsList}\n\n` +
      `*Subtotal:* Rs. ${subtotal}\n` +
      `*Delivery Fee:* ${deliveryFee === 0 ? 'Free' : 'Rs. ' + deliveryFee}\n` +
      (discount > 0 ? `*Discount:* -Rs. ${discount}\n` : '') +
      `*Total:* Rs. ${total}\n\n` +
      `*Address:* ${addressToUse}\n` +
      `*Location:* ${locationLink}`;

    // 4. Open WhatsApp
    const url = `https://wa.me/+9779815769007?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // 5. Clear Cart & Close
    clearCart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(2px)'
        }}
      />

      <div className="animate-fade-in" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: '400px', backgroundColor: 'white', zIndex: 2000,
        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
            {step === 'cart' ? 'My Basket' : 'Checkout via WhatsApp'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {step === 'cart' && (
            <>
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
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                          <button onClick={() => handleQuantityChange(item, -1)} style={{ padding: '2px 8px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', padding: '0 4px' }}>{item.qty}</span>
                          <button onClick={() => handleQuantityChange(item, 1)} style={{ padding: '2px 8px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="whatsapp-checkout-form" onSubmit={handleWhatsAppCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {!user && (
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>Contact Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input placeholder="Full Name" value={guestName} onChange={(e) => setGuestName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                    <input type="tel" placeholder="Phone Number" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Delivery Address</label>
                {/* Simplified Address Selection */}
                <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: '#f9fafb' }}>
                  <textarea
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    required
                    placeholder="Describe your location..."
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', minHeight: '80px', marginBottom: '0.5rem' }}
                  />

                  {/* Explicit Mandatory Location Check */}
                  {!location?.coordinates ? (
                    <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      ⚠️ Location selection on map is required.
                    </div>
                  ) : (
                    <div style={{ color: 'var(--success)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      ✅ Location Selected
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => openModal()}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: location?.coordinates ? '#dcfce7' : 'white',
                      border: `1px solid ${location?.coordinates ? 'var(--success)' : 'var(--primary)'}`,
                      color: location?.coordinates ? 'var(--success)' : 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    📍 {location?.coordinates ? 'Update Location' : 'Select Location on Map'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Promo Code</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input placeholder="Enter Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                  <button type="button" onClick={applyCoupon} className="btn btn-outline">Apply</button>
                </div>
                {couponMessage && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: couponMessage.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>{couponMessage.text}</p>}
              </div>

              <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}><span>Subtotal</span><span>Rs. {subtotal}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}><span>Delivery Fee</span><span>{deliveryFee === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : `Rs. ${deliveryFee}`}</span></div>
                {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--success)' }}><span>Discount</span><span>- Rs. {discount}</span></div>}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.125rem' }}><span>Total</span><span>Rs. {total}</span></div>
              </div>
            </form>
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: '#f9fafb', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            {step === 'cart' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700' }}><span>Subtotal</span><span>Rs. {subtotal}</span></div>
                <button onClick={handleProceedToCheckout} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Proceed to Checkout</button>
              </>
            ) : (
              <button
                form="whatsapp-checkout-form"
                type="submit"
                className="btn"
                style={{
                  width: '100%', padding: '1rem',
                  backgroundColor: '#25D366', color: 'white', border: 'none',
                  fontWeight: 'bold', fontSize: '1rem'
                }}
              >
                💬 Order on WhatsApp
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
