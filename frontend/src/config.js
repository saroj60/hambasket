import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

const isNative = Capacitor.isNativePlatform();

// Default to LAN IP for physical devices (fallback)
const LAN_IP = '192.168.254.40';
const EMULATOR_IP = '10.0.2.2';
const PORT = '5000';

let apiUrl = '/api';
let baseUrl = '';
let isVirtual = false;

// 1. Force Native Check
// const isNative = Capacitor.isNativePlatform(); // Removed duplicate

if (isNative) {
    console.log("Running on Native Device/Emulator, using Railway Backend");
    // HARDCODED PRODUCTION URL FOR NATIVE APP
    baseUrl = `https://hambasket-backend.onrender.com`;
    apiUrl = `${baseUrl}/api`;
} else {
    // 2. Web Environment
    // Always use Railway in production or if VITE_API_URL is missing
    baseUrl = import.meta.env.VITE_API_URL || `https://hambasket-production.up.railway.app`;

    // Fallback: If we are on Vercel and VITE_API_URL wasn't set, it might default to relative.
    // Let's force it if it's empty.
    if (!baseUrl || baseUrl === '/' || baseUrl.includes('vercel.app')) {
        baseUrl = `https://hambasket-backend.onrender.com`;
    }
    apiUrl = `${baseUrl}/api`;
}

export const API_URL = apiUrl;
export const BASE_URL = baseUrl;
export const IS_VIRTUAL = isVirtual;
