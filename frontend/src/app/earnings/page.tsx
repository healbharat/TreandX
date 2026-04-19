'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Wallet, ArrowUpRight, TrendingUp, History, Coins, Landmark } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function EarningsPage() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/earnings');
        setEarnings(data.earnings);
      } catch (err) {
        console.error('Failed to fetch earnings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return alert('Enter valid amount');
    
    try {
      setLoading(true);
      await axios.post('http://localhost:3001/earnings/withdraw', { amount });
      alert('Withdrawal request submitted!');
      setEarnings(prev => prev - amount);
      setWithdrawAmount('');
    } catch (err) {
      alert('Withdrawal failed: Insufficient balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-6 md:p-10 space-y-10">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Creator Earnings</h1>
          <p className="text-muted-foreground font-medium">Turn your news into revenue.</p>
        </div>

        <div className="glass p-10 rounded-[48px] border border-white/5 bg-gradient-to-br from-primary/20 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Coins size={120} />
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center space-x-2 text-primary font-black uppercase tracking-widest text-xs">
                <Wallet size={16} />
                <span>Available Balance</span>
             </div>
             <h2 className="text-7xl font-black italic tracking-tighter tabular-nums drop-shadow-2xl">
               {loading ? '...' : `₹${earnings.toLocaleString()}`}
             </h2>
             <div className="flex items-center text-green-500 font-bold text-xs">
                <TrendingUp size={14} className="mr-1" />
                +₹420 today
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="font-black italic uppercase tracking-widest text-sm">Quick Withdraw</h3>
              <Landmark size={18} className="text-muted-foreground" />
           </div>

           <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black italic opacity-30">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-12 pr-6 text-2xl font-black italic focus:border-primary/50 focus:outline-none transition-all placeholder:opacity-20"
                />
              </div>

              <button
                disabled={loading || !withdrawAmount}
                onClick={handleWithdraw}
                className="w-full py-5 bg-white text-black hover:bg-primary hover:text-white rounded-3xl font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <ArrowUpRight size={20} />
                <span>Transfer to Bank</span>
              </button>
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="font-black italic uppercase tracking-widest text-sm flex items-center">
             <History size={16} className="mr-2 text-primary" />
             Payout History
           </h3>
           <div className="space-y-4 opacity-40 italic font-bold text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
              No recent payouts.
           </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
