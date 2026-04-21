'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Camera, AtSign, User as UserIcon } from 'lucide-react';

export default function ProfileSetupPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, updateUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('https://treandx.onrender.com/user/setup-profile', {
        name,
        username,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      });

      updateUser(data);
      router.push('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Try another username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center animate-in">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold">Complete Profile</h2>
        <p className="text-muted-foreground mt-2">Let people know who you are</p>
      </div>

      <div className="flex flex-col items-center mb-10">
        <div className="relative group cursor-pointer">
          <div className="w-28 h-28 rounded-full bg-secondary border-4 border-border overflow-hidden flex items-center justify-center transition-all group-hover:border-primary">
            {username ? (
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon size={40} className="text-muted-foreground" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-full shadow-lg">
            <Camera size={16} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSetup} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1 text-muted-foreground uppercase tracking-wider">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary">
              <UserIcon size={20} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-card border-2 border-border focus:border-primary rounded-2xl py-4 pl-12 pr-4 outline-none transition-all"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold ml-1 text-muted-foreground uppercase tracking-wider">Username</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary">
              <AtSign size={20} />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
              placeholder="johndoe"
              className="w-full bg-card border-2 border-border focus:border-primary rounded-2xl py-4 pl-12 pr-4 outline-none transition-all"
              disabled={loading}
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-destructive text-sm font-medium text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !name || !username}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-[0.98] mt-4"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            'Get Started'
          )}
        </button>
      </form>
    </div>
  );
}
