import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.irinthekkan.expensetracker',
  appName: 'Expense Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
