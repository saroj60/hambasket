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
    // For local debugging on Emulator/Device
    // console.log("Running on Native Device/Emulator, using Local Backend");
    // const deviceIP = LAN_IP; 
    // baseUrl = `http://${deviceIP}:${PORT}`;
    // apiUrl = `${baseUrl}/api`;

    // To test with local backend on Android Emulator, uncomment the lines above and comment the ones below.
    // For now, we default to Vercel for stability unless debugging local backend specifically.

    // For this debugging session, we want to ensure connectivity to the LOCAL backend if running locally
    // ERROR: Localhost doesn't work on Android. Use 10.0.2.2

    console.log("Running on Native Device/Emulator");
    // Default to Emulator Loopback for easier local dev
    baseUrl = `http://${EMULATOR_IP}:${PORT}`;
    apiUrl = `${baseUrl}/api`;

    // console.log("Running on Native Device/Emulator, using Vercel Backend");
    // apiUrl = `https://hambasket.vercel.app/api`;
    // baseUrl = `https://hambasket.vercel.app`;
} else {
    // Web Environment (Vite)
    baseUrl = import.meta.env.VITE_API_URL || `http://localhost:${PORT}`;
    apiUrl = `${baseUrl}/api`;
}

export const API_URL = apiUrl;
export const BASE_URL = baseUrl;
export const IS_VIRTUAL = isVirtual;
