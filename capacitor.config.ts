import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jagx.connect',
  appName: 'JagX Connect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
