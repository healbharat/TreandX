'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface Stats {
  userCount: number;
  postCount: number;
  pendingReports: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('https://treandx.onrender.com/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Users', value: stats?.userCount || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Posts', value: stats?.postCount || 0, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Pending Reports', value: stats?.pendingReports || 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Platform Overview</h1>
        <p className="text-muted-foreground font-medium">Monitoring TreandX performance and safety.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="glass p-8 rounded-[32px] border border-white/5 group hover:border-primary/20 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className={`${card.bg} ${card.color} p-4 rounded-3xl group-hover:scale-110 transition-transform`}>
                <card.icon size={28} />
              </div>
              <div className="flex items-center text-xs font-black px-2 py-1 bg-green-500/10 text-green-500 rounded-lg">
                <TrendingUp size={12} className="mr-1" />
                 +12%
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-bold uppercase text-xs tracking-widest">{card.label}</span>
              <h2 className="text-5xl font-black tracking-tighter tabular-nums">{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        <div className="glass p-8 rounded-[40px] border border-white/5 flex flex-col items-center justify-center text-center space-y-4 py-16">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-2xl font-black italic">System Health: Excellent</h3>
          <p className="text-muted-foreground text-sm max-w-[280px]">All services are running smoothly and the community is growing.</p>
        </div>

        <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6">
          <h3 className="text-xl font-black uppercase tracking-widest text-primary italic">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 hover:bg-white/5 rounded-2xl transition-colors cursor-default">
                <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-white/5 rounded animate-pulse mb-1" />
                  <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { ShieldCheck } from 'lucide-react';
