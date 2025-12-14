import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('Verifying...');
    const { verifyEmail } = useAuth();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('Invalid verification link.');
            return;
        }

        const verify = async () => {
            const res = await verifyEmail(token);
            if (res.success) {
                setStatus('Email verified successfully! Redirecting to login...');
                setTimeout(() => navigate('/'), 3000);
            } else {
                setStatus(`Verification failed: ${res.message}`);
            }
        };

        verify();
    }, [token, verifyEmail, navigate]);

    return (
        <div className="container" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <div className="card" style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
                <h2>Email Verification</h2>
                <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>{status}</p>
            </div>
        </div>
    );
};

export default VerifyEmail;
