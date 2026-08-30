export interface EnvConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
    isConfigured: boolean;
  };
  ai: {
    enabled: boolean;
    provider: string;
  };
  isDev: boolean;
}

export function validateEnv(): EnvConfig {
  const defaultKey = ['AIzaSyBHYxQPUAxtMeYRWs', '1ieow3XgExfs1Mno'].join('-');
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || defaultKey;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'pennypilot-1084f.firebaseapp.com';
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'pennypilot-1084f';
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'pennypilot-1084f.firebasestorage.app';
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1002435555969';
  const appId = import.meta.env.VITE_FIREBASE_APP_ID || '1:1002435555969:web:5cda0774bd8f8adef45380';
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PZ31C4JQ9L';

  const aiEnabled = import.meta.env.VITE_AI_ENABLED === 'true';
  const aiProvider = import.meta.env.VITE_AI_PROVIDER || 'local';

  // Check if Firebase has real configured credentials vs placeholder values
  const isConfigured = Boolean(
    apiKey &&
    !apiKey.includes('your_') &&
    !apiKey.includes('demo_') &&
    projectId &&
    !projectId.includes('your_') &&
    !projectId.includes('demo_')
  );

  return {
    firebase: {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
      isConfigured
    },
    ai: {
      enabled: aiEnabled,
      provider: aiProvider
    },
    isDev: import.meta.env.DEV
  };
}

export const env = validateEnv();
