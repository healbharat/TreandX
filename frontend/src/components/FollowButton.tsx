'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

interface FollowButtonProps {
  userId: string;
}

export default function FollowButton({ userId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    if (!user || user.id === userId) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3001/interactions/follow/status?targetUserId=${userId}`);
        setIsFollowing(data.following);
      } catch (err) {
        console.error('Failed to check follow status', err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [userId, user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewFollow = (payload: any) => {
      if (payload.followingId === userId && payload.followerId === user?.id) {
        setIsFollowing(true);
      }
    };

    socket.on('new-follow', handleNewFollow);
    return () => {
      socket.off('new-follow', handleNewFollow);
    };
  }, [socket, userId, user]);

  const handleFollow = async () => {
    if (!user || user.id === userId) return;

    // Optimistic UI
    const prevState = isFollowing;
    setIsFollowing(!prevState);

    try {
      await axios.post('http://localhost:3001/interactions/follow/toggle', { targetUserId: userId });
    } catch (err) {
      setIsFollowing(prevState);
    }
  };

  if (loading || !user || user.id === userId) return null;

  return (
    <button
      onClick={handleFollow}
      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center space-x-1.5 ${
        isFollowing 
          ? 'bg-secondary text-muted-foreground' 
          : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
      }`}
    >
      {isFollowing ? (
        <>
          <UserCheck size={12} />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus size={12} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
