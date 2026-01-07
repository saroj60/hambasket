
// using native fetch

const API_URL = 'https://hambasket-backend.onrender.com/api/orders';

const testOrder = async () => {
    try {
        console.log(`Testing POST to ${API_URL}`);
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: [{ product: "677c0500a4d5508c90b6c6b3", name: "Test Item", quantity: 1, price: 100 }],
                subtotal: 100,
                deliveryFee: 0,
                tax: 0,
                totalAmount: 100,
                shippingAddress: "Test Address",
                deliveryLocation: { lat: 27.7, lng: 85.3 },
                paymentMethod: "WhatsApp",
                guestInfo: { name: "Test User", phone: "9800000000" }
            })
        });

        console.log(`Status: ${res.status} ${res.statusText}`);
        if (!res.ok) {
            const text = await res.text();
            console.log('Response Body:', text);
        } else {
            const data = await res.json();
            console.log('Order Created:', data._id);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

testOrder();
