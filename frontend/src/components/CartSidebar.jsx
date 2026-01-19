import React, { useState, useEffect, useContext } from 'react';
import { API_URL, BASE_URL } from '../config';
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
  const [selectedAddress, setSelectedAddress] = useState('');
  const [customAddress, setCustomAddress] = useState(location?.address || 'Kathmandu, Nepal');

  // Guest State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryFee = 0; // subtotal > 150 ? 0 : 50;
  const total = subtotal + deliveryFee;

  const [whatsappUrl, setWhatsAppUrl] = useState('');

  const handleFinalizeWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
      clearCart();
      onClose();
    }
  };

  // Reset step when cart opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('cart');

    }
  }, [isOpen]);

  // Set default address if user has one
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddr.address);
    }
  }, [user]);

  // Update custom address and guest info if global location changes
  useEffect(() => {
    console.log("CartSidebar Location Update:", location);
    if (location) {
      if (location.address) setCustomAddress(location.address);
      if (location.receiverName) {
        console.log("Setting Guest Name:", location.receiverName);
        setGuestName(location.receiverName);
      }
      if (location.receiverPhone) {
        console.log("Setting Guest Phone:", location.receiverPhone);
        setGuestPhone(location.receiverPhone);
      }
    }
  }, [location]);

  const handleProceedToCheckout = () => {
    setStep('checkout');
  };



  const handleWhatsAppCheckout = async (e) => {
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

    if (!user && guestPhone.length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    // 3. Construct Payload
    const name = user?.name || guestName;
    const phone = user?.phone || guestPhone;
    const addressToUse = selectedAddress === 'new' || !selectedAddress ? customAddress : selectedAddress;

    const orderPayload = {
      items: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        quantity: item.qty,
        price: item.price
      })),
      subtotal,
      deliveryFee,
      discount: 0,
      tax: 0,
      totalAmount: total,
      shippingAddress: addressToUse,
      deliveryLocation: location.coordinates,
      paymentMethod: 'WhatsApp',
      guestInfo: user ? null : { name: guestName, phone: guestPhone }
    };

    if (user) {
      orderPayload.user = user._id; // Ensure user ID is passed if logged in
    }

    try {
      // 4. Create Order in Backend
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Order Failed: ${errorData.message}`);
        return;
      }

      const newOrder = await res.json();
      const orderId = newOrder._id ? newOrder._id.slice(-6).toUpperCase() : 'N/A';

      // 5. Construct Message with Order ID
      const itemsList = cartItems.map(i => {
        const variantText = i.variant ? ` (${i.variant.weight})` : '';
        return `• ${i.name}${variantText} (x${i.qty}) - Rs. ${i.price * i.qty}`;
      }).join('\n');
      const locationLink = location.coordinates ? `https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}` : 'N/A';

      const message = `*New Order Request* 🛒\n` +
        `*Order ID:* #${orderId}\n\n` +
        `*Customer:* ${name}\n` +
        `*Phone:* ${phone}\n\n` +
        `*Items:*\n${itemsList}\n\n` +
        `*Subtotal:* Rs. ${subtotal}\n` +
        `*Delivery Fee:* ${deliveryFee === 0 ? 'Free' : 'Rs. ' + deliveryFee}\n` +

        `*Total:* Rs. ${total}\n\n` +
        `*Address:* ${addressToUse}\n` +
        `*Location:* ${locationLink}`;

      // 6. Generate Link & Switch to Success Step
      // We do NOT open window here to avoid popup blockers on iOS (async context)
      const url = `https://wa.me/+9779815769007?text=${encodeURIComponent(message)}`;

      setWhatsAppUrl(url);
      setStep('success');

    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Failed to place order. Please check your connection.");
    }
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: '700', fontSize: '0.9rem' }}>
                <span>🎉</span> Free Delivery on All Orders!
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
                      {console.log('Cart Item:', item)}
                      {console.log('BASE_URL:', BASE_URL, 'Image:', item.image)}
                      <div style={{ width: '60px', height: '60px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        {item.image ? (
                          <img
                            src={
                              item.image.startsWith('http') || item.image.startsWith('/assets') || item.image.startsWith('data:')
                                ? item.image
                                : `${BASE_URL}${item.image}`
                            }
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span>{item.emoji}</span>
                        )}
                      </div>
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
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={guestPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setGuestPhone(val);
                      }}
                      required
                      maxLength={10}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    />
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



              <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}><span>Subtotal</span><span>Rs. {subtotal}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}><span>Delivery Fee</span><span>{deliveryFee === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : `Rs. ${deliveryFee}`}</span></div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.125rem' }}><span>Total</span><span>Rs. {total}</span></div>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)', marginBottom: '0.5rem' }}>Order Placed!</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Your order ID has been generated.<br />
                Please send the order details to us on WhatsApp to confirm delivery.
              </p>

              <button
                onClick={handleFinalizeWhatsApp}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  backgroundColor: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px' }}>
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                </svg>
                Open WhatsApp
              </button>
            </div>
          )}

        </div>

        {cartItems.length > 0 && step !== 'success' && (
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                  </svg>
                  Send Order on WhatsApp
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
