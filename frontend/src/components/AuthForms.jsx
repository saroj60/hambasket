import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL, IS_VIRTUAL } from '../config';

const AuthForms = () => {
    const [authMethod, setAuthMethod] = useState('phone'); // 'phone' or 'email'
    const [isLogin, setIsLogin] = useState(true); // For email only
    const [showForgot, setShowForgot] = useState(false);
    const { login, register, sendOtp, verifyOtp, forgotPassword } = useAuth();

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        otp: ''
    });
    const [otpSent, setOtpSent] = useState(false);
    const [receivedOtp, setReceivedOtp] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let res;
        if (showForgot) {
            res = await forgotPassword(formData.email);
            if (res.success) {
                setError(''); // Clear error
                alert(res.message); // Simple alert for now
                setShowForgot(false);
                return;
            }
        } else if (!isLogin) {
            // Registration Logic (Universal)
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();
            res = await register(fullName, formData.email, formData.password, formData.phone);
        } else {
            // Login Logic
            if (authMethod === 'email') {
                res = await login(formData.email, formData.password, 'email');
            } else {
                res = await login(formData.phone, formData.password, 'phone');
            }
        }

        if (res && !res.success) {
            setError(res.message);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh'
        }}>
            <div className="card" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {showForgot ? 'Reset Password' : (isLogin ? (authMethod === 'phone' ? 'Login with Phone' : 'Login with Email') : 'Create Account')}
                </h2>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {showForgot && (
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                        />
                    )}

                    {!isLogin && !showForgot && (
                        // Registration Form (Universal)
                        <>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>First name</label>
                                    <input
                                        placeholder="Enter first name"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Last name</label>
                                    <input
                                        placeholder="Enter last name"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Email address</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Phone number</label>
                                <input
                                    type="tel"
                                    placeholder="Enter 10-digit phone number"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Password</label>
                                <input
                                    type="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Confirm password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                />
                            </div>
                        </>
                    )}

                    {isLogin && !showForgot && (
                        <>
                            {authMethod === 'email' ? (
                                // Email Login Form
                                <>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                    />
                                </>
                            ) : (
                                // Phone Login Form
                                <>
                                    <input
                                        type="tel"
                                        placeholder="Phone Number (e.g. 9800000000)"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                                    />
                                </>
                            )}
                        </>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                        {showForgot ? 'Send Reset Link' : (isLogin ? 'Login' : 'Create Account')}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {!showForgot && (
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                        >
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                        </button>
                    )}

                    {isLogin && !showForgot && (
                        <button
                            onClick={() => setShowForgot(true)}
                            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                            Forgot Password?
                        </button>
                    )}

                    {showForgot && (
                        <button
                            onClick={() => setShowForgot(false)}
                            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                            Back to Login
                        </button>
                    )}

                    <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>

                    {isLogin && (
                        <button
                            onClick={() => { setAuthMethod(authMethod === 'email' ? 'phone' : 'email'); setError(''); setShowForgot(false); }}
                            style={{ color: 'var(--text-main)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                            {authMethod === 'email' ? 'Login with Phone' : 'Login with Email'}
                        </button>
                    )}


                </div>
            </div>
            {/* Debug Info */}
            <div style={{ position: 'absolute', bottom: 5, left: 5, fontSize: '10px', color: 'gray', opacity: 0.7 }}>
                API: {API_URL} | Virtual: {IS_VIRTUAL ? 'Yes' : 'No'}
            </div>
        </div>
    );
};

export default AuthForms;
