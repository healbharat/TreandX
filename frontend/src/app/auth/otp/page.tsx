'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ShieldCheck, ChevronRight, Hash, PhoneIncoming } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { auth, RecaptchaVerifier } from '@/lib/firebase';
import { signInWithPhoneNumber } from 'firebase/auth';

export default function OtpPage() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedMobile = mobile.startsWith('+') ? mobile : `+${mobile}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedMobile, appVerifier);
      setConfirmationResult(confirmation);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError('Failed to send OTP. Check mobile format.');
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      
      const { data } = await axios.post(`${API_BASE_URL}/auth/firebase`, { idToken });
      login(data.token, data.user);
      
      if (data.isNewUser) router.push('/auth/setup');
      else router.push('/home');
    } catch (err: any) {
      setError('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
      {/* Invisible Captcha container */}
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-[420px] space-y-10">
        
        <div className="text-center space-y-2">
           <motion.div 
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-20 h-20 bg-primary/20 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-primary shadow-2xl shadow-primary/20"
           >
              {step === 1 ? <Smartphone size={32} /> : <ShieldCheck size={32} />}
           </motion.div>
           <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
             {step === 1 ? 'Mobile Phase' : 'Verification'}
           </h1>
           <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Secure Auth Signal</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-2xl"
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Phone Matrix (Incl Country Code)</label>
                  <div className="relative group">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4 group-focus-within:text-primary transition-colors" />
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-12 pr-4 text-lg font-black tracking-widest focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/20 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-2 active:scale-95"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Transmit Code</span>
                      <PhoneIncoming size={18} />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp} 
                className="space-y-6"
              >
                <div className="space-y-2 text-center pb-4">
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Code transmitted to</p>
                  <p className="text-xs font-black tracking-widest text-primary">{mobile}</p>
                </div>

                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="6-Digit Protocol"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-12 pr-4 text-2xl font-black tracking-[0.5em] text-center focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-white/90 disabled:bg-white/20 text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Interface</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[10px] font-black uppercase text-white/20 hover:text-white transition-colors py-2 tracking-widest"
                >
                  Change Signal Matrix
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center tracking-widest">{error}</p>}
      </div>
    </div>
  );
}
