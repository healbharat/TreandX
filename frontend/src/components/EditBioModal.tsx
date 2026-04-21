'use client';

import { useState } from 'react';
import { X, Check, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface EditBioModalProps {
  currentBio: string;
  onClose: () => void;
  onSuccess: (newBio: string) => void;
}

export default function EditBioModal({ currentBio, onClose, onSuccess }: EditBioModalProps) {
  const [bio, setBio] = useState(currentBio);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.patch('http://localhost:3001/user/update', { bio });
      onSuccess(bio);
    } catch (err) {
      console.error('Failed to update bio', err);
      alert('Failed to update bio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm glass rounded-[40px] p-8 space-y-6 overflow-hidden"
      >
        <div className="flex items-center justify-between">
           <div className="flex items-center space-x-2">
              <Sparkles size={18} className="text-primary" />
              <h3 className="font-black italic uppercase tracking-tighter text-lg">Edit Bio</h3>
           </div>
           <button onClick={onClose} className="text-white/40 hover:text-white">
              <X size={20} />
           </button>
        </div>

        <div className="space-y-4">
           <textarea 
             value={bio}
             onChange={(e) => setBio(e.target.value)}
             placeholder="Tell the world who you are..."
             rows={4}
             maxLength={150}
             className="w-full bg-white/5 border border-white/10 rounded-[24px] p-4 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all resize-none"
           />
           <div className="flex justify-end">
              <span className="text-[10px] font-bold text-white/20">{bio.length}/150</span>
           </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /><span>Save Bio</span></>}
        </button>
      </motion.div>
    </div>
  );
}
