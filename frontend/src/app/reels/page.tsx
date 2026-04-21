'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Music, User, Plus, Search, ChevronLeft, Disc, Play } from 'lucide-react';
import ReelCard from '@/components/ReelCard';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { token } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchReels = async (pageNum: number) => {
    try {
      const { data } = await axios.get(`http://localhost:3001/reels?page=${pageNum}`);
      if (data.length === 0) setHasMore(false);
      setReels(prev => pageNum === 1 ? data : [...prev, ...data]);
    } catch (err) {
      console.error('Failed to fetch reels', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels(1);
  }, []);

  const handleScroll = () => {
    if (!containerRef.current || !hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setPage(prev => {
        const next = prev + 1;
        fetchReels(next);
        return next;
      });
    }
  };

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      {/* Header Overlays */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between pointer-events-none">
        <h2 className="text-2xl font-black italic tracking-tighter text-white drop-shadow-lg pointer-events-auto">REELS</h2>
        <div className="flex items-center space-x-4 pointer-events-auto">
          <button className="p-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-white">
            <Search size={20} />
          </button>
          <Link href="/reels/create" className="p-2 bg-primary rounded-full text-white shadow-lg shadow-primary/20">
            <Plus size={20} />
          </Link>
        </div>
      </div>

      {/* Infinite Scroll Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {reels.map((reel, index) => (
          <ReelCard key={reel._id} reel={reel} active={true} />
        ))}

        {loading && (
          <div className="h-screen w-full flex items-center justify-center snap-start">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!hasMore && reels.length > 0 && (
          <div className="h-screen w-full flex flex-col items-center justify-center snap-start bg-[#050505]">
             <Play size={48} className="text-white/10 mb-6" />
             <p className="text-xs font-black uppercase tracking-widest text-white/20 italic">The abyss is empty. You've reached the end.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
