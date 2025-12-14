import React, { useState } from 'react';

const FAQ = () => {
    const faqs = [
        {
            q: "How fast is the delivery?",
            a: "We offer instant delivery within 15-30 minutes for most locations in Kathmandu. You can also schedule your delivery for a later time."
        },
        {
            q: "What payment methods do you accept?",
            a: "We accept Cash on Delivery (COD), Khalti, and major Credit/Debit cards. You can choose your preferred method at checkout."
        },
        {
            q: "Is there a minimum order value?",
            a: "No, there is no minimum order value. However, a small delivery fee of Rs. 50 applies for orders below Rs. 1000."
        },
        {
            q: "Can I track my order?",
            a: "Yes! You can track your order in real-time from the 'Profile' section under 'Order History'."
        },
        {
            q: "Do you deliver 24/7?",
            a: "Our delivery services are currently available from 8:00 AM to 10:00 PM, 7 days a week."
        },
        {
            q: "What if I receive a damaged item?",
            a: "We have a no-questions-asked return policy for damaged or incorrect items. Please contact support immediately, and we will replace it or refund you."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--primary)' }}>Frequently Asked Questions</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-sm)',
                            overflow: 'hidden'
                        }}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            style={{
                                width: '100%',
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '1rem',
                                color: 'var(--text-main)'
                            }}
                        >
                            {faq.q}
                            <span style={{ transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
                        </button>
                        {openIndex === index && (
                            <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
