'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, Zap, Flame, TrendingUp, Grid, Play, LayoutGrid } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ExplorePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, trendingRes] = await Promise.all([
          axios.get('http://localhost:3001/search/explore'),
          axios.get('http://localhost:3001/search/trending')
        ]);
        setPosts(postsRes.data);
        setTrending(trendingRes.data);
      } catch (err) {
        console.error('Failed to fetch explore data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-primary/30">
      <header className="sticky top-0 z-[100] px-6 py-6 border-b border-white/5 bg-background/80 backdrop-blur-3xl space-y-6">
         <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter flex items-center space-x-3">
               <Compass className="text-primary" size={28} />
               <span>Explore</span>
            </h1>
            <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
               <Zap size={14} className="text-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase text-primary">Live Matrix</span>
            </div>
         </div>

         <div className="relative group">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Inject search sequence..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[28px] pl-16 pr-8 py-5 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10"
            />
         </div>

         {/* Trending Tags */}
         <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
            {trending.map((tag, i) => (
               <Link 
                 href={`/explore/tag/${tag.tag.replace('#', '')}`}
                 key={i} 
                 className="shrink-0 flex items-center space-x-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/40 transition-all"
               >
                  <TrendingUp size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{tag.tag}</span>
                  <span className="text-[8px] font-bold text-white/20 ml-1">{tag.count}</span>
               </Link>
            ))}
         </div>
      </header>

      <main className="p-6 pb-32">
         {loading ? (
           <div className="grid grid-cols-3 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-2xl" />
              ))}
           </div>
         ) : (
           <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {posts.map((post, i) => {
                 // Spicing up the grid with some 2x2 or 1x2 blocks for visual interest
                 const isWide = i % 10 === 0; 
                 const isTall = i % 7 === 0;
                 return (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     key={post._id} 
                     className={`relative group overflow-hidden rounded-2xl bg-white/5 ${isWide ? 'col-span-2' : ''} ${isTall ? 'row-span-2' : ''}`}
                   >
                      <img 
                        src={post.mediaUrls?.[0] || post.thumbnail} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt="" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                         <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/20">
                               <img src={post.userId.profileImage} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[8px] font-black uppercase text-white">@{post.userId.username}</span>
                         </div>
                      </div>
                      {post.mediaUrls?.length > 1 && (
                        <div className="absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-lg">
                           <LayoutGrid size={12} className="text-white" />
                        </div>
                      )}
                      {post.videoUrl && (
                        <div className="absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-lg">
                           <Play size={12} className="text-white" fill="white" />
                        </div>
                      )}
                   </motion.div>
                 );
              })}
           </div>
         )}
      </main>

      <BottomNav />
    </div>
  );
}
