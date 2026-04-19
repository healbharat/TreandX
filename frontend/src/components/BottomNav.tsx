'use client';

import { Home, PlusSquare, Bell, User, Search, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/notifications/unread-count');
        setUnreadCount(data);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    fetchUnread();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNotif = () => setUnreadCount(prev => prev + 1);
    socket.on('new-notification', handleNotif);
    return () => { socket.off('new-notification', handleNotif); };
  }, [socket]);

  const navItems = [
    { icon: Home, label: 'Home', href: '/home' },
    { icon: Search, label: 'Explore', href: '/search' },
    { icon: PlusSquare, label: 'Create', href: '/create' },
    { icon: Bell, label: 'Alerts', href: '/notifications', badge: unreadCount },
    { icon: User, label: 'Me', href: '/profile' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ icon: ShieldCheck, label: 'Admin', href: '/admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pointer-events-none">
      <div className="glass shadow-2xl shadow-primary/20 rounded-full px-4 py-3 flex items-center space-x-4 md:space-x-8 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`relative p-2 rounded-full transition-all group ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[8px] text-white flex items-center justify-center font-bold rounded-full border border-background"
                  >
                    {item.badge}
                  </motion.div>
                )}
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
