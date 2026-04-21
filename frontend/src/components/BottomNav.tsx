'use client';

import { Home, PlusSquare, Bell, User, Crown, Coins, ShieldCheck, PlayCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import CreatePostSheet from './CreatePostSheet';

export default function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
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
    if (user) fetchUnread();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handleNotif = () => setUnreadCount(prev => prev + 1);
    socket.on('new-notification', handleNotif);
    return () => { socket.off('new-notification', handleNotif); };
  }, [socket]);

  const navItems = [
    { icon: Home, label: 'Feed', href: '/home' },
    { icon: PlayCircle, label: 'Reels', href: '/reels' },
    { icon: PlusSquare, label: 'Idea', href: '/create' },
    { icon: Bell, label: 'Hits', href: '/notifications', badge: unreadCount },
    { icon: Crown, label: 'Pro', href: '/premium' },
    { icon: User, label: 'You', href: `/profile/${user?.username}` },
  ];

  if (user?.role === 'admin') {
    navItems.push({ icon: ShieldCheck, label: 'Admin', href: '/admin' });
  }

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none">
        <nav className="glass rounded-[30px] p-2 flex items-center gap-1 shadow-[0_32px_64px_rgba(0,0,0,0.5)] pointer-events-auto max-w-full overflow-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            const isCreate = item.label === 'Idea';

            const LinkOrButton = ({ children, ...props }: any) => {
               if (isCreate) return <div {...props}>{children}</div>;
               return <Link href={item.href} {...props}>{children}</Link>;
            };

            return (
              <LinkOrButton 
                key={item.label} 
                onClick={isCreate ? () => setShowCreate(true) : undefined}
                className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-[22px] transition-all group cursor-pointer ${isActive ? 'text-primary' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
              >
                <div className="relative z-10 transition-transform duration-300 group-active:scale-85">
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                  {item.badge && item.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-primary text-[8px] text-white px-1.5 py-0.5 font-black rounded-full border-2 border-[#121212]"
                    >
                      {item.badge}
                    </motion.div>
                  )}
                </div>

                {isActive && (
                  <motion.div
                    layoutId="navTab"
                    className="absolute inset-0 bg-primary/10 rounded-[22px] -z-0"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  >
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_#E11D48]" />
                  </motion.div>
                )}
              </LinkOrButton>
            );
          })}
        </nav>
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreatePostSheet 
            onClose={() => setShowCreate(false)} 
            onSuccess={() => window.location.reload()} 
          />
        )}
      </AnimatePresence>
    </>
  );
}

