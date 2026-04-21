'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  isPrivate?: boolean;
}

export default function FollowButton({ userId, initialIsFollowing = false, isPrivate = false }: FollowButtonProps) {
  const [status, setStatus] = useState<'follow' | 'following' | 'pending'>(initialIsFollowing ? 'following' : 'follow');
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    // If we don't have initial follow status, we might want to fetch it
    // But for now, let's assume it's passed or defaults to 'follow'
  }, [userId]);

  const handleFollow = async () => {
    if (!user || user.id === userId || loading) return;

    setLoading(true);
    try {
      const res = await axios.post(`https://treandx.onrender.com/follow/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.message === "Followed") {
        setStatus('following');
      } else if (res.data.message === "Unfollowed") {
        setStatus('follow');
      } else if (res.data.message === "Follow request sent") {
        setStatus('pending');
      }
    } catch (err) {
      console.error('Failed to toggle follow', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === userId) return null;

  const getButtonStyles = () => {
    switch (status) {
      case 'following':
        return 'bg-secondary text-muted-foreground';
      case 'pending':
        return 'bg-orange-500/20 text-orange-500 border border-orange-500/30';
      default:
        return 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'following':
        return <UserCheck size={14} />;
      case 'pending':
        return <Clock size={14} />;
      default:
        return <UserPlus size={14} />;
    }
  };

  const getText = () => {
    switch (status) {
      case 'following':
        return 'Following';
      case 'pending':
        return 'Requested';
      default:
        return 'Follow';
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center space-x-2 ${getButtonStyles()} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {getIcon()}
      <span>{getText()}</span>
    </button>
  );
}
