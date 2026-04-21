importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAhOozNulJ690vlN5Kcag_3vBwkxz4VMgY",
  authDomain: "treandsx.firebaseapp.com",
  projectId: "treandsx",
  storageBucket: "treandsx.firebasestorage.app",
  messagingSenderId: "363912394015",
  appId: "1:363912394015:web:afc16ddea2432cfb24ec2a",
  measurementId: "G-VB36Z3JC9V"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/tx-logo.png' // Replace with actual icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
