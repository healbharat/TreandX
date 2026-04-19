'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Check, Sparkles, Shield, Zap, MegaphoneOff, Crown } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Script from 'next/script';

export default function PremiumPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (plan: { name: string, price: number }) => {
    try {
      setLoading(true);
      const { data: order } = await axios.post('http://localhost:3001/payments/create-order', {
        amount: plan.price
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Should be in env
        amount: order.amount,
        currency: order.currency,
        name: 'TreandX Premium',
        description: `${plan.name} Subscription`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const { data } = await axios.post('http://localhost:3001/payments/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            alert('Premium Activated!');
            updateUser({ isPremium: true });
          } catch (err) {
             alert('Verification failed');
          }
        },
        prefill: {
          contact: user?.mobile,
        },
        theme: {
          color: '#E11D48',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment failed', err);
      alert('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: MegaphoneOff, label: 'Ad-Free Experience', desc: 'No more interruptions between news.' },
    { icon: Zap, label: 'Priority Feed', desc: 'Your posts get pushed to more people.' },
    { icon: Shield, label: 'Verified Badge', desc: 'Get the exclusive gold checkmark.' },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="p-6 md:p-10 space-y-10">
        <div className="text-center space-y-4">
           <div className="inline-flex p-3 bg-primary/10 text-primary rounded-3xl mb-2">
             <Crown size={40} />
           </div>
           <h1 className="text-5xl font-black italic tracking-tighter uppercase">Go Premium</h1>
           <p className="text-muted-foreground font-bold max-w-xs mx-auto">Support real journalism and get the best features.</p>
        </div>

        <div className="space-y-4">
          {benefits.map((b) => (
            <div key={b.label} className="glass p-6 rounded-[32px] border border-white/5 flex items-center space-x-5">
               <div className="p-3 bg-white/5 text-primary rounded-2xl">
                 <b.icon size={24} />
               </div>
               <div>
                 <h3 className="font-black italic text-lg">{b.label}</h3>
                 <p className="text-xs text-muted-foreground font-medium">{b.desc}</p>
               </div>
            </div>
          ))}
        </div>

        <div className="glass p-10 rounded-[48px] border-2 border-primary/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
            <Sparkles size={100} className="text-primary animate-pulse" />
          </div>
          
          <div className="space-y-6 relative z-10">
             <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-primary italic">Best Value Plan</span>
                <h2 className="text-4xl font-black italic uppercase">Annual Pass</h2>
             </div>
             
             <div className="flex items-baseline space-x-2">
                <span className="text-6xl font-black tabular-nums">₹999</span>
                <span className="text-muted-foreground font-bold uppercase text-sm tracking-tighter">/ Year</span>
             </div>

             <div className="space-y-3">
                {['All premium features', 'Unlimited Summaries', 'Early access to updates'].map(t => (
                  <div key={t} className="flex items-center space-x-2">
                    <Check size={16} className="text-green-500" />
                    <span className="text-xs font-bold text-white/70">{t}</span>
                  </div>
                ))}
             </div>

             <button
               disabled={loading || user?.isPremium}
               onClick={() => handlePayment({ name: 'Annual Pass', price: 999 })}
               className="w-full py-5 bg-primary hover:bg-rose-600 text-white rounded-3xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-50"
             >
               {user?.isPremium ? 'Already Premium' : loading ? 'Processing...' : 'Subscribe Now'}
             </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
