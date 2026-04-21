'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AtSign, Lock, ChevronRight, Grapes, Smartphone, ShieldCheck, Github } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, { identifier, password });
      login(data.token, data.user);
      router.push('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const { data } = await axios.post(`${API_BASE_URL}/auth/firebase`, { idToken });
      login(data.token, data.user);
      
      if (data.isNewUser) router.push('/auth/setup');
      else router.push('/home');
    } catch (err: any) {
      setError('Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent">
      <div className="w-full max-w-[420px] space-y-10">
        
        {/* Branding */}
        <div className="text-center space-y-2">
           <motion.h1 
             initial={{ opacity: 0, scale: 1.2 }}
             animate={{ opacity: 1, scale: 1 }}
             className="text-5xl font-black italic uppercase tracking-tighter text-white"
           >
             Treand<span className="text-primary">X</span>
           </motion.h1>
           <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Integrated Auth Signal</p>
        </div>

        {/* Login Card */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <form onSubmit={handleLogin} className="space-y-6 relative">
            <div className="space-y-4">
              <div className="relative group">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors w-4 h-4" />
                <input
                  type="text"
                  placeholder="Username, Email or Mobile"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:bg-white/10 outline-none transition-all placeholder:text-white/10"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors w-4 h-4" />
                <input
                  type="password"
                  placeholder="Secret Phase"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-primary/50 focus:bg-white/10 outline-none transition-all placeholder:text-white/10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center tracking-widest">{error}</p>}

            <button
              disabled={loading}
              className="w-full bg-white text-black hover:bg-white/90 disabled:bg-white/20 hover:scale-[1.02] active:scale-95 font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-white/5 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login Initial</span>
                  <ShieldCheck size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center space-x-4 my-8">
             <div className="flex-1 h-px bg-white/10" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10">Or Logic</span>
             <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={handleGoogleLogin}
               className="flex items-center justify-center space-x-3 py-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
             >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="" />
                <span className="text-[10px] font-black uppercase tracking-widest">Google</span>
             </button>
             <button 
               onClick={() => router.push('/auth/otp')}
               className="flex items-center justify-center space-x-3 py-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
             >
                <Smartphone className="w-4 h-4 text-white/40 group-hover:text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Mobile</span>
             </button>
          </div>
        </motion.div>

        <div className="text-center space-y-6">
           <button 
             onClick={() => router.push('/auth/signup')}
             className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-primary transition-colors"
           >
             Protocol Request <span className="text-white border-b border-white/10 pb-0.5 ml-2 hover:border-primary">New Account</span>
           </button>
           
           <div className="flex items-center justify-center space-x-6 pt-4 border-t border-white/5">
              <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">© 2026 TreandX Global</p>
              <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest hover:text-white/40 cursor-pointer">Security Terms</p>
           </div>
        </div>
      </div>
    </div>
  );
}
