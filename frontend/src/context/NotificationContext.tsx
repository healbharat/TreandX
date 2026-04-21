'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      if (!messaging || !user || !token) return;

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const currentToken = await getToken(messaging, {
            vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' // This usually comes from Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
          });

          if (currentToken) {
            setFcmToken(currentToken);
            // Save token to backend
            await axios.post('https://treandx.onrender.com/notifications/token', { token: currentToken }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    if (user && token) {
      requestPermission();
    }
  }, [user, token]);

  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#1a1a1a] shadow-2xl rounded-[24px] pointer-events-auto flex ring-1 ring-white/10 p-4 border border-primary/20`}>
            <div className="flex-1 w-0 p-1">
              <div className="flex items-start">
                <div className="shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black italic uppercase">
                    TX
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-black uppercase tracking-widest text-white">
                    {payload.notification?.title || 'Signal Inbound'}
                  </p>
                  <p className="mt-1 text-xs font-medium text-white/40">
                    {payload.notification?.body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ), { position: 'top-right', duration: 4000 });
      });
      return () => unsubscribe();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ fcmToken }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
