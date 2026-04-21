import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAhOozNulJ690vlN5Kcag_3vBwkxz4VMgY",
  authDomain: "treandsx.firebaseapp.com",
  projectId: "treandsx",
  storageBucket: "treandsx.firebasestorage.app",
  messagingSenderId: "363912394015",
  appId: "1:363912394015:web:afc16ddea2432cfb24ec2a",
  measurementId: "G-VB36Z3JC9V"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

import { Analytics } from "firebase/analytics";
import { Messaging } from "firebase/messaging";

// Initialize Remote Services (Client-side only)
let analytics: Analytics | undefined;
let messaging: Messaging | undefined;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
  messaging = getMessaging(app);
}

export { app, analytics, messaging };
