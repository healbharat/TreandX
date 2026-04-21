'use client';

import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '@/firebase';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';

export default function NotificationManager() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const setupNotifications = async () => {
      // 1. Request Permission and Get Token
      const fcmToken = await requestForToken();
      
      if (fcmToken) {
        console.log('[FCM] Token acquired:', fcmToken);
        // 2. Save Token to Backend
        try {
          await axios.post('https://treandx.onrender.com/notifications/save-token', { fcmToken });
        } catch (err) {
          console.error('[FCM] Failed to save token to backend', err);
        }
      }
    };

    setupNotifications();

    onMessageListener()
      .then((payload: any) => {
        if (!payload) return;
        console.log('[FCM] Foreground message received:', payload);
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-card shadow-2xl rounded-3xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border border-primary/20`}
          >
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-white">
                    {payload.notification.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {payload.notification.body}
                  </p>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded-full flex items-center justify-center text-muted-foreground hover:text-white"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ));
      })
      .catch((err) => console.log('failed: ', err));
  }, [user]);

  return <Toaster position="top-center" />;
}
