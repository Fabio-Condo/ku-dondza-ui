import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dikahub.app',
  appName: 'Dikahub',
  webDir: 'dist/post-app',
  server: {
    androidScheme: 'https'
  }
};

export default config;
