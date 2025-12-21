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

if (isNative) {
    // Force usage of Vercel Production Backend for Native App
    console.log("Running on Native Device/Emulator, using Vercel Backend");
    apiUrl = `https://hambasket.vercel.app/api`;
    baseUrl = `https://hambasket.vercel.app`;
} else {
    // Web Environment (Vite)
    baseUrl = import.meta.env.VITE_API_URL || `http://localhost:${PORT}`;
    apiUrl = `${baseUrl}/api`;
}

export const API_URL = apiUrl;
export const BASE_URL = baseUrl;
export const IS_VIRTUAL = isVirtual;
