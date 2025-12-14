import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error("Session check failed", error);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (identifier, password, type = 'email') => {
        try {
            console.log("Attempting login for:", identifier);
            const payload = type === 'phone' ? { phone: identifier, password } : { email: identifier, password };

            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            console.log("Login Response Status:", res.status, res.statusText);
            const text = await res.text();
            console.log("Login Response Body:", text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                if (!res.ok) {
                    throw new Error(`Server Error (${res.status}): ${text.substring(0, 100)}`);
                }
                throw new Error("Server returned invalid response: " + text.substring(0, 50));
            }

            if (!res.ok) throw new Error(data.message);

            setUser(data);
            return { success: true };
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: error.message };
        }
    };

    const register = async (name, email, password, phone, role = 'customer') => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone, role })
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                if (!res.ok) {
                    throw new Error(`Server Error (${res.status}): ${text.substring(0, 100)}`);
                }
                throw new Error("Invalid server response");
            }

            if (!res.ok) throw new Error(data.message);

            return { success: true, message: data.message };
        } catch (error) {
            console.error("Registration Error:", error);
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
            setUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const verifyEmail = async (token) => {
        try {
            const res = await fetch(`${API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const sendOtp = async (phone, name) => {
        try {
            const res = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, name })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return { success: true, message: data.message, otp: data.otp };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const verifyOtp = async (phone, otp) => {
        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setUser(data);
            return { success: true, message: "Login successful" };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const [wishlist, setWishlist] = useState([]);

    // Fetch wishlist when user logs in
    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const res = await fetch(`${API_URL}/users/wishlist`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setWishlist(data);
            }
        } catch (error) {
            console.error("Error fetching wishlist", error);
        }
    };

    const addToWishlist = async (productId) => {
        try {
            const res = await fetch(`${API_URL}/users/wishlist/${productId}`, { method: 'POST', credentials: 'include' });
            if (res.ok) {
                // Optimistic update or refetch
                fetchWishlist();
                return { success: true };
            }
        } catch (error) {
            console.error("Error adding to wishlist", error);
        }
        return { success: false };
    };

    const removeFromWishlist = async (productId) => {
        try {
            const res = await fetch(`${API_URL}/users/wishlist/${productId}`, { method: 'DELETE', credentials: 'include' });
            if (res.ok) {
                fetchWishlist();
                return { success: true };
            }
        } catch (error) {
            console.error("Error removing from wishlist", error);
        }
        return { success: false };
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, verifyEmail, forgotPassword, sendOtp, verifyOtp, loading, wishlist, addToWishlist, removeFromWishlist }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
