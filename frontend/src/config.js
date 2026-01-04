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
    baseUrl = `https://hambasket-production.up.railway.app`;
    apiUrl = `${baseUrl}/api`;
} else {
    // 2. Web Environment
    // If we are in development (npm run dev), we might want localhost.
    // BUT if we are in production (Vercel), we want Railway.
    if (import.meta.env.PROD) {
        baseUrl = `https://hambasket-production.up.railway.app`;
    } else {
        // Local Development: Use VITE_API_URL or fallback to Railway
        baseUrl = import.meta.env.VITE_API_URL || `https://hambasket-production.up.railway.app`;
    }
    apiUrl = `${baseUrl}/api`;
}

export const API_URL = apiUrl;
export const BASE_URL = baseUrl;
export const IS_VIRTUAL = isVirtual;
