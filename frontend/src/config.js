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
    console.log("Running on Native Device/Emulator, using Railway Backend");
    baseUrl = `https://hambasket-production.up.railway.app`;
    apiUrl = `${baseUrl}/api`;
} else {
    // Web Environment (Vite)
    // Use Railway backend if VITE_API_URL is not set locally
    baseUrl = import.meta.env.VITE_API_URL || `https://hambasket-production.up.railway.app`;
    apiUrl = `${baseUrl}/api`;
}

export const API_URL = apiUrl;
export const BASE_URL = baseUrl;
export const IS_VIRTUAL = isVirtual;
