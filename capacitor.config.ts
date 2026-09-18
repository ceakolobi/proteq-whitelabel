import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.318082df06ef425b80ed83bf5d49688a',
  appName: 'Harmonia Proteção Veicular',
  webDir: 'dist',
  android: {
    minWebViewVersion: 55,
    allowMixedContent: true,
    backgroundColor: '#1a1a2e'
  },
  server: {
    url: 'https://318082df-06ef-425b-80ed-83bf5d49688a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP'
    }
  }
};

export default config;
