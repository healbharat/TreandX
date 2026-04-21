'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { User as UserIcon, Shield, ShieldAlert, Search, MoreVertical } from 'lucide-react';
import Image from 'next/image';

interface User {
  _id: string;
  name: string;
  username: string;
  mobile: string;
  isBlocked: boolean;
  role: string;
  profileImage?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('https://treandx.onrender.com/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId: string) => {
    try {
      await axios.patch(`https://treandx.onrender.com/admin/user/${userId}/toggle-block`);
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
    } catch (err) {
      console.error('Failed to toggle block', err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobile?.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">User Management</h1>
          <p className="text-muted-foreground font-medium">Manage and moderate TreandX community members.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-primary/50 focus:outline-none transition-all font-bold"
          />
        </div>
      </div>

      <div className="glass rounded-[40px] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic">User</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic">Contact</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic">Role</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic">Status</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-20 bg-white/5" />
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground font-bold italic">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-primary/10 border border-white/10">
                          {user.profileImage ? (
                            <Image src={user.profileImage} alt={user.username} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary">
                              <UserIcon size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-white">{user.name || 'Incognito User'}</p>
                          <p className="text-xs font-bold text-muted-foreground">@{user.username || 'user'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-sm text-muted-foreground tabular-nums">{user.mobile}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${user.isBlocked ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
                        <span className={`text-xs font-black uppercase tracking-widest ${user.isBlocked ? 'text-red-500' : 'text-green-500'}`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => toggleBlock(user._id)}
                        disabled={user.role === 'admin'}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
                          user.isBlocked 
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white' 
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
