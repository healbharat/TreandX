'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, UserPlus, Newspaper, Bell, CheckCircle2, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import BottomNav from '@/components/BottomNav';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/notifications');
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: any) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on('new-notification', handleNewNotification);
    return () => {
      socket.off('new-notification', handleNewNotification);
    };
  }, [socket]);

  const markAllRead = async () => {
    try {
      await axios.post('http://localhost:3001/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return <Heart className="text-rose-500" size={16} fill="currentColor" />;
      case 'COMMENT': return <MessageCircle className="text-sky-500" size={16} fill="currentColor" />;
      case 'FOLLOW': return <UserPlus className="text-emerald-500" size={16} />;
      case 'POST': return <Newspaper className="text-amber-500" size={16} />;
      default: return <Bell size={16} />;
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-muted-foreground">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-black tracking-tighter">Activity</h2>
        </div>
        <button 
          onClick={markAllRead}
          className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors flex items-center space-x-2"
        >
          <CheckCircle2 size={14} />
          <span>Read All</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse space-y-4">
             <Bell size={48} className="text-muted-foreground opacity-20" />
             <p className="text-sm text-muted-foreground italic">Fetching your updates...</p>
          </div>
        ) : notifications.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {notifications.map((notif, index) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start space-x-4 p-4 rounded-3xl transition-all border ${
                  notif.isRead ? 'border-transparent bg-secondary/10' : 'border-primary/20 bg-primary/5 shadow-lg shadow-primary/5'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
                    <img src={notif.senderId.profileImage} alt={notif.senderId.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-card p-1.5 rounded-full shadow-lg border border-border">
                    {getIcon(notif.type)}
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-tight">
                    <span className="font-bold">{notif.senderId.name}</span>{' '}
                    <span className="opacity-80">{notif.message.replace(notif.senderId.name, '').trim()}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {formatDistanceToNow(new Date(notif.createdAt))} ago
                  </p>
                </div>

                {!notif.isRead && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse shadow-glow" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Bell size={64} strokeWidth={1} className="mb-4" />
            <h3 className="text-lg font-bold">No notifications yet</h3>
            <p className="text-sm px-10">When someone interacts with your posts, you'll see it here.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
