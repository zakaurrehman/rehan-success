import { ExpoConfig, ConfigContext } from 'expo/config'

/**
 * EAS project ID (not a secret). After running `npx eas-cli init`, paste the
 * ID it prints between the quotes. EAS cannot write into a .ts config itself,
 * and build servers don't see your local .env, so it must live here.
 */
const EAS_PROJECT_ID = ''

/**
 * Rehan Success — Expo app config.
 * API base URL and EAS project are injected via env so each environment
 * (dev / preview / production) can target its own backend.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Rehan Success',
  slug: 'rehan-success',
  owner: 'zakarehmanai',
  scheme: 'rehansuccess',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  // Follows the device theme; users can override in Profile → Appearance.
  userInterfaceStyle: 'automatic',
  backgroundColor: '#0b1020',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0b1020',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: process.env.IOS_BUNDLE_ID ?? 'com.rehansuccess.app',
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
      // HTTPS/TLS only (standard encryption) — exempt from export compliance docs.
      ITSAppUsesNonExemptEncryption: false,
      // Intentionally no NSUserTrackingUsageDescription: the app does not track users.
    },
  },
  android: {
    package: process.env.ANDROID_PACKAGE ?? 'com.rehansuccess.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0f766e',
    },
    permissions: ['NOTIFICATIONS', 'POST_NOTIFICATIONS'],
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    'expo-web-browser',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#0f766e',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
    websiteUrl: process.env.EXPO_PUBLIC_WEBSITE_URL ?? 'https://www.rehansuccess.com',
    supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? 'support@rehansuccess.com',
    eas: { projectId: process.env.EAS_PROJECT_ID || EAS_PROJECT_ID },
  },
})
