'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import FollowButton from './FollowButton';
import Link from 'next/link';

interface SuggestedUser {
  _id: string;
  name: string;
  username: string;
  profileImage: string;
}

export default function UserSuggestions() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchSuggestions = async () => {
      try {
        const res = await axios.get('https://treandx.onrender.com/follow/suggestions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [token]);

  if (loading) return <div className="p-4 space-y-4">
    {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary rounded-full" />
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-secondary rounded" />
                    <div className="h-2 w-16 bg-secondary rounded" />
                </div>
            </div>
            <div className="h-8 w-20 bg-secondary rounded-lg" />
        </div>
    ))}
  </div>;

  if (users.length === 0) return null;

  return (
    <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg tracking-tight">Suggested for you</h3>
        <button className="text-primary text-xs font-bold hover:underline">See All</button>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user._id} className="flex items-center justify-between group">
            <Link href={`/profile/${user.username}`} className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt={user.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary transition-colors"
                />
              </div>
              <div>
                <p className="font-bold text-sm truncate max-w-[120px]">{user.name}</p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>
            </Link>
            <FollowButton userId={user._id} />
          </div>
        ))}
      </div>
    </div>
  );
}
