'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Check, X, Clock } from 'lucide-react';
import Link from 'next/link';

interface FollowRequest {
  _id: string;
  followerId: {
    _id: string;
    name: string;
    username: string;
    profileImage: string;
  };
}

export default function FollowRequests() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchRequests = async () => {
      try {
        const res = await axios.get('http://localhost:3001/follow/requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data);
      } catch (err) {
        console.error('Failed to fetch requests', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token]);

  const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await axios.patch(`http://localhost:3001/follow/request/${requestId}`, { action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.filter(r => r._id !== requestId));
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
    }
  };

  if (loading || requests.length === 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Clock size={16} className="text-primary" />
        <h3 className="font-black uppercase tracking-widest text-xs">Follow Requests ({requests.length})</h3>
      </div>

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req._id} className="flex items-center justify-between">
            <Link href={`/profile/${req.followerId.username}`} className="flex items-center space-x-3">
              <img
                src={req.followerId.profileImage || `https://ui-avatars.com/api/?name=${req.followerId.name}&background=random`}
                alt={req.followerId.name}
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              <div>
                <p className="font-bold text-sm">{req.followerId.name}</p>
                <p className="text-xs text-muted-foreground">@{req.followerId.username}</p>
              </div>
            </Link>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAction(req._id, 'accept')}
                className="p-2 bg-primary text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => handleAction(req._id, 'reject')}
                className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
