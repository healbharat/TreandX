'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import FollowButton from './FollowButton';
import Link from 'next/link';

interface FollowUser {
  _id: string;
  name: string;
  username: string;
  profileImage: string;
}

interface FollowersListProps {
  userId: string;
  type: 'followers' | 'following';
}

export default function FollowersList({ userId, type }: FollowersListProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/follow/${userId}/${type}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Data structure from populate: { followerId: {...} } or { followingId: {...} }
        const mappedUsers = res.data.map((item: any) => type === 'followers' ? item.followerId : item.followingId);
        setUsers(mappedUsers);
      } catch (err) {
        console.error(`Failed to fetch ${type}`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type, token]);

  if (loading) return <div className="space-y-4 p-4 animate-pulse">
    {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-secondary rounded-full" />
            <div className="space-y-2">
                <div className="h-4 w-32 bg-secondary rounded" />
                <div className="h-3 w-24 bg-secondary rounded" />
            </div>
        </div>
    ))}
  </div>;

  if (users.length === 0) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">No {type} yet.</p>
    </div>
  );

  return (
    <div className="divide-y divide-white/5">
      {users.map((user) => (
        <div key={user._id} className="flex items-center justify-between py-4 group">
          <Link href={`/profile/${user.username}`} className="flex items-center space-x-4">
            <img
              src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 transition-all group-hover:scale-105"
            />
            <div>
              <p className="font-bold text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </Link>
          <FollowButton userId={user._id} initialIsFollowing={type === 'following'} />
        </div>
      ))}
    </div>
  );
}
