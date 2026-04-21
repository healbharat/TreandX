'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { AtSign, Mail, Lock, Phone, User, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/register`, formData);
      login(data.token, data.user);
      router.push('/auth/setup');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent">
      <div className="w-full max-w-[420px] space-y-10">
        
        {/* Branding */}
        <div className="text-center space-y-2">
           <motion.h1 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl font-black italic uppercase tracking-tighter text-white"
           >
             Treand<span className="text-primary italic">X</span>
           </motion.h1>
           <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Phase: Genesis Register</p>
        </div>

        {/* Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden group"
        >
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-700" />

          <form onSubmit={handleSignup} className="space-y-6 relative">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center tracking-widest">{error}</p>}

            <button
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/20 hover:scale-[1.02] active:scale-95 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <div className="text-center">
           <button 
             onClick={() => router.push('/auth/login')}
             className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-primary transition-colors"
           >
             Already Have Account? <span className="text-white border-b border-white/10 pb-0.5 ml-2 hover:border-primary">Login Phase</span>
           </button>
        </div>
      </div>
    </div>
  );
}
