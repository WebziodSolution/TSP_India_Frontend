import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.timesheetspro',
  appName: 'Timesheetspro',
  webDir: 'build',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 3000, // Keep splash screen visible for 3 seconds
      launchFadeOutDuration: 500, // Fade-out animation duration
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
