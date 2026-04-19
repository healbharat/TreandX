'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft } from 'lucide-react';

export default function OtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [mobile, setMobile] = useState('');
  
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const storedMobile = sessionStorage.getItem('temp_mobile');
    if (!storedMobile) {
      router.push('/auth/login');
      return;
    }
    setMobile(storedMobile);

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('http://localhost:3001/auth/verify-otp', {
        mobile,
        otp: otpValue,
      });

      login(data.token, data.user);

      if (data.isNewUser) {
        router.push('/auth/setup');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (timer > 0) return;
    setTimer(30);
    try {
      await axios.post('http://localhost:3001/auth/send-otp', { mobile });
    } catch (err) {}
  };

  useEffect(() => {
    if (otp.join('').length === 6) {
      handleVerify();
    }
  }, [otp]);

  return (
    <div className="flex-1 flex flex-col justify-center animate-in">
      <button 
        onClick={() => router.push('/auth/login')}
        className="absolute top-8 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold">Verification</h2>
        <p className="text-muted-foreground mt-2">
          We sent a code to <span className="text-foreground font-semibold">+91 {mobile}</span>
        </p>
      </div>

      <div className="flex justify-between gap-2 mb-8">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="number"
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 bg-card border-2 border-border focus:border-primary rounded-xl text-center text-2xl font-bold outline-none transition-all focus:ring-4 focus:ring-primary/10"
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-destructive text-sm font-medium text-center mb-6"
        >
          {error}
        </motion.p>
      )}

      <button
        onClick={() => handleVerify()}
        disabled={loading || otp.join('').length !== 6}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg mb-6 transition-all shadow-lg active:scale-[0.98]"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          'Verify & Continue'
        )}
      </button>

      <div className="text-center">
        <p className="text-muted-foreground">
          Didn't receive code?{' '}
          <button
            onClick={resendOtp}
            disabled={timer > 0}
            className={`font-semibold transition-colors ${
              timer > 0 ? 'text-muted-foreground/50' : 'text-primary'
            }`}
          >
            {timer > 0 ? `Resend in ${timer}s` : 'Resend Now'}
          </button>
        </p>
      </div>
    </div>
  );
}
