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
    try {
        // Top-level await to get device info before exporting
        const info = await Device.getInfo();
        if (info.isVirtual) {
            console.log("Running on Emulator, using 10.0.2.2");
            isVirtual = true;
            apiUrl = `http://${EMULATOR_IP}:${PORT}/api`;
            baseUrl = `http://${EMULATOR_IP}:${PORT}`;
        } else {
            console.log("Running on Physical Device, using " + LAN_IP);
            apiUrl = `http://${LAN_IP}:${PORT}/api`;
            baseUrl = `http://${LAN_IP}:${PORT}`;
        }
    } catch (error) {
        console.error("Error getting device info, falling back to LAN IP", error);
        apiUrl = `http://${LAN_IP}:${PORT}/api`;
        baseUrl = `http://${LAN_IP}:${PORT}`;
    }
} else {
    // Web Environment (Vite)
    baseUrl = import.meta.env.VITE_API_URL || `http://localhost:${PORT}`;
    apiUrl = `${baseUrl}/api`;
}

export const API_URL = apiUrl;
export const BASE_URL = baseUrl;
export const IS_VIRTUAL = isVirtual;
