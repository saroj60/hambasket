import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

const isNative = Capacitor.isNativePlatform();

// Default to LAN IP for physical devices (fallback)
const LAN_IP = '192.168.16.105'; // Updated to your current IP
const EMULATOR_IP = '10.0.2.2';
const PORT = '5000';

let apiUrl = '/api';
let baseUrl = '';
let isVirtual = false;

// 1. Force Native Check
if (isNative) {
    console.log("Running on Native Device/Emulator, using Local Backend");
    // baseUrl = `https://hambasket-backend.onrender.com`; // Production (Commented out)
    baseUrl = `http://${EMULATOR_IP}:${PORT}`; // Local Dev (Emulator)
    apiUrl = `${baseUrl}/api`;
} else {
    // 2. Web Environment
    const hostname = window.location.hostname;

    // Smart Local Dev Detection: If serving from localhost or local IP, look for backend on same IP
    if (hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
        // baseUrl = `http://${hostname}:${PORT}`; // CONNECT TO LOCAL BACKEND
        baseUrl = `https://hambasket-backend.onrender.com`; // FORCE REMOTE BACKEND FOR TESTING
    } else {
        // Production / Vercel
        baseUrl = import.meta.env.VITE_API_URL || `https://hambasket-backend.onrender.com`;

        // Fallback safety
        if (!baseUrl || baseUrl === '/' || baseUrl.includes('vercel.app')) {
            baseUrl = `https://hambasket-backend.onrender.com`;
        }
    }
    apiUrl = `${baseUrl}/api`;
}

export const API_URL = apiUrl;
export const BASE_URL = baseUrl;
export const IS_VIRTUAL = isVirtual;
