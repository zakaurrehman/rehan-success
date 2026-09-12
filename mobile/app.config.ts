import { ExpoConfig, ConfigContext } from 'expo/config'

/**
 * Rehan Success — Expo app config.
 * API base URL and EAS project are injected via env so each environment
 * (dev / preview / production) can target its own backend.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Rehan Success',
  slug: 'rehan-success',
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
    // Set EAS_PROJECT_ID after running `npx eas-cli init` for this new project.
    eas: process.env.EAS_PROJECT_ID ? { projectId: process.env.EAS_PROJECT_ID } : undefined,
  },
})
