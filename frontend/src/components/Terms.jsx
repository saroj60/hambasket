import React from 'react';

const Terms = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--primary)' }}>Terms of Service</h1>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>1. Introduction</h2>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
                        Welcome to HamBasket. By accessing our website and using our services, you agree to be bound by the following terms and conditions.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>2. Use of Service</h2>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
                        You must be at least 18 years old to use our services. You agree to provide accurate and complete information when creating an account and placing orders.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>3. Pricing and Availability</h2>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
                        All prices are in Nepalese Rupees (NPR) and include applicable taxes unless stated otherwise. We reserve the right to change prices and product availability without notice.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>4. Delivery</h2>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
                        We aim to deliver within the estimated timeframes, but delays may occur due to traffic, weather, or other unforeseen circumstances.
                    </p>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>5. Contact</h2>
                    <p style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
                        If you have any questions about these Terms, please contact us at support@hambasket.com.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
