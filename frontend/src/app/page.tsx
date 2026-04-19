'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SplashScreen from '@/components/SplashScreen';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash && !loading) {
      if (user) {
        if (user.isProfileComplete) {
          router.push('/home');
        } else {
          router.push('/auth/setup');
        }
      } else {
        router.push('/auth/login');
      }
    }
  }, [showSplash, loading, user, router]);

  return <SplashScreen />;
}
