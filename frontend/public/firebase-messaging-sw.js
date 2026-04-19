importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// Use compat versions for service worker support.
firebase.initializeApp({
  apiKey: "PLACEHOLDER_KEY",
  authDomain: "PLACEHOLDER_DOMAIN",
  projectId: "PLACEHOLDER_PROJECT_ID",
  storageBucket: "PLACEHOLDER_BUCKET",
  messagingSenderId: "PLACEHOLDER_SENDER_ID",
  appId: "PLACEHOLDER_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification (title, icon, etc) here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
