import React, { useState } from 'react';
import { API_URL } from '../config';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("Password reset successful! Redirecting to login...");
                setTimeout(() => navigate('/'), 3000);
            } else {
                setMessage(data.message || "Reset failed");
            }
        } catch (error) {
            setMessage("Server error");
        }
    };

    if (!token) return <div className="container" style={{ marginTop: '2rem' }}>Invalid link</div>;

    return (
        <div className="container" style={{ marginTop: '2rem', maxWidth: '400px' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <h2>Reset Password</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '0.5rem' }}
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ padding: '0.5rem' }}
                    />
                    <button type="submit" className="btn btn-primary">Reset Password</button>
                </form>
                {message && <p style={{ marginTop: '1rem', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
            </div>
        </div>
    );
};

export default ResetPassword;
