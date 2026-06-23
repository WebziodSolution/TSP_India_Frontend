import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';

export const isNative = () => Capacitor.isNativePlatform();
export const platform = () => Capacitor.getPlatform(); // 'android', 'ios', or 'web'

export const checkCameraPermission = async () => {
    try {
        const permission = await Camera.requestPermissions();
        if (permission.camera !== 'granted') {
            throw new Error("Camera permission not granted.");
        }

    } catch (error) {
        throw new Error("Failed to check camera permission: " + error.message);
    }
};

// export const getPreferredTheme = () => {
//   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//   return prefersDark ? 'dark' : 'light';
// };