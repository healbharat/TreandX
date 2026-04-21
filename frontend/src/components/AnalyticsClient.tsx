'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Eye, Zap, Crown, ArrowUpRight, ArrowDownRight, Calendar, UserPlus, Share2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';

export default function AnalyticsClient() {
  const params = useParams();
  const [username, setUsername] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const parts = window.location.pathname.split('/');
    const profileIdx = parts.indexOf('profile');
    if (profileIdx !== -1 && parts[profileIdx + 1]) {
      setUsername(parts[profileIdx + 1]);
    }
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get('https://treandx.onrender.com/user/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAnalytics();
  }, [token]);

  const StatCard = ({ label, value, icon: Icon, trend }: any) => (
    <div className="p-6 bg-white/5 border border-white/5 rounded-[32px] space-y-4">
       <div className="flex items-center justify-between">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
             <Icon size={20} />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
               <span className="text-[10px] font-black">{trend}%</span>
               {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            </div>
          )}
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</p>
          <h3 className="text-2xl font-black italic tracking-tighter mt-1">{value}</h3>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-primary/30">
      <header className="px-8 py-8 flex items-center justify-between">
         <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl">
               <BarChart3 size={20} className="text-primary" />
            </button>
            <div>
               <h1 className="text-xl font-black italic uppercase tracking-tighter">Insights Dashboard</h1>
               <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Creator Signal Metrics</p>
            </div>
         </div>
         <div className="flex items-center space-x-2 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20">
            <Crown size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-[8px] font-black uppercase text-amber-500 tracking-widest">Premium Logic</span>
         </div>
      </header>

      <main className="p-8 space-y-8 pb-32">
         {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
         ) : analytics ? (
            <>
               <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Profile Signal Views" value={analytics.totalViews} icon={Eye} trend={12} />
                  <StatCard label="Unique Reach Matrix" value={analytics.uniqueReach} icon={Users} trend={-3} />
                  <StatCard label="Follower Velocity" value={user?.followersCount} icon={UserPlus} trend={24} />
                  <StatCard label="Social Viral Rate" value="8.4%" icon={Share2} trend={5} />
               </div>

               <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-6">
                  {/* ... chart logic ... */}
                  <div className="h-48 flex items-end space-x-2">
                     {analytics.sparkline?.map((day: any, i: number) => (
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: `${(day.count / (Math.max(...analytics.sparkline.map((d:any)=>d.count)) || 1)) * 100}%` }}
                         key={i} 
                         className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg relative group"
                       />
                     ))}
                  </div>
               </div>

               <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[40px] flex items-center justify-between">
                  {/* ... footer ... */}
                  <button className="px-6 py-3 bg-primary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Init Boost</button>
               </div>
            </>
         ) : (
            <div className="text-center py-20 opacity-20 italic font-black uppercase text-xs tracking-widest">No signal data detected.</div>
         )}
      </main>
    </div>
  );
}
