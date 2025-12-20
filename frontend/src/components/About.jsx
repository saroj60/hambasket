import React from 'react';

const About = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--primary)' }}>About Hamket</h1>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                    Welcome to <strong>Hamket</strong>, your number one source for all things grocery. We're dedicated to providing you the very best of fresh produce, dairy, bakery, and daily essentials, with an emphasis on quality, speed, and customer service.
                </p>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                    Founded in 2024, Hamket has come a long way from its beginnings in Kathmandu. When we first started out, our passion for "Groceries in Minutes" drove us to start our own business.
                </p>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                    We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
                </p>
                <p style={{ fontWeight: '600', marginTop: '2rem' }}>
                    Sincerely,<br />
                    The Hamket Team
                </p>
            </div>
        </div>
    );
};

export default About;
