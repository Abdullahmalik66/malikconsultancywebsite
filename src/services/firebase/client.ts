import { initializeApp, getApps, getApp } from "firebase/app";

const getEnv = (key: string): string => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv[key]) return metaEnv[key];
  const procEnv = (typeof process !== 'undefined') ? (process as any).env : null;
  return procEnv ? procEnv[key] : '';
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
  databaseURL: getEnv("VITE_FIREBASE_DATABASE_URL"),
};

// Safe initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app, firebaseConfig };
