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
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
  const appId = import.meta.env.VITE_FIREBASE_APP_ID || '';
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '';

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
