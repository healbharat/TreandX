'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import FollowersList from './FollowersList';

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

export default function UsersModal({ isOpen, onClose, userId, type }: UsersModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tighter italic">
                {type === 'followers' ? 'Followers' : 'Following'}
              </h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-2">
              <FollowersList userId={userId} type={type} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
