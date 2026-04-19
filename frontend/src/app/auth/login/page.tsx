'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Phone, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:3001/auth/send-otp', { mobile });
      sessionStorage.setItem('temp_mobile', mobile);
      router.push('/auth/otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center animate-in">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold">Welcome Back</h2>
        <p className="text-muted-foreground mt-2">Enter your mobile number to continue</p>
      </div>

      <form onSubmit={handleSendOtp} className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Phone size={20} />
          </div>
          <input
            type="number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile Number"
            className="w-full bg-card border-2 border-border focus:border-primary rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-lg font-medium"
            required
            maxLength={10}
            disabled={loading}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-destructive text-sm font-medium text-center"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading || mobile.length !== 10}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Send OTP</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-muted-foreground text-sm mt-8 px-8">
        By continuing, you agree to TreandX's <span className="text-foreground font-semibold">Terms</span> and <span className="text-foreground font-semibold">Privacy Policy</span>.
      </p>
    </div>
  );
}
