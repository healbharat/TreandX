'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import PostCard from '@/components/PostCard';
import SkeletonCard from '@/components/SkeletonCard';
import AdCard from '@/components/AdCard';
import StoryBar from '@/components/StoryBar';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Sparkles, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const { user, loading: authLoading, token } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const fetchPosts = async (pageNum: number) => {
    try {
      setLoading(true);
      const url = `http://localhost:3001/posts/feed?page=${pageNum}&limit=10`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => pageNum === 1 ? data : [...prev, ...data]);
      }
    } catch (err) {
      console.error('Failed to fetch feed', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggested = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/posts/suggested', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggested(data);
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
    }
  };

  const fetchAds = async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/ads');
      setAds(data);
    } catch (err) {
      console.error('Failed to fetch ads', err);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchPosts(1);
      fetchSuggested();
      if (!user.isPremium) fetchAds();
    }
  }, [user, token]);

  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          fetchPosts(nextPage);
          return nextPage;
        });
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-[100] px-6 py-5 flex items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-3xl">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white">TreandX</h1>
          <span className="text-[8px] font-bold tracking-[0.3em] text-primary/60 uppercase">Personalized Feed</span>
        </div>
        <div className="flex items-center space-x-4">
           <div className="w-10 h-10 rounded-[14px] p-0.5 bg-white/5 border border-white/10 group cursor-pointer hover:border-primary/40 transition-colors">
              <img src={user.profileImage} alt="" className="w-full h-full object-cover rounded-[12px]" onClick={() => router.push(`/profile/${user.username}`)} />
           </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pt-6 pb-40">
        <StoryBar />

        <div className="px-4 md:px-0 space-y-6">
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => {
              const showSuggestion = (index + 1) % 5 === 0 && suggested.length > 0;
              const suggestionIndex = Math.floor(index / 5) % suggested.length;
              
              const showAd = !user.isPremium && (index + 1) % 6 === 0 && ads.length > 0;
              const adIndex = Math.floor(index / 6) % ads.length;

              return (
                <div key={post._id} className="space-y-6">
                  {/* Regular Post */}
                  <div ref={posts.length === index + 1 ? lastPostElementRef : null}>
                    <PostCard post={post} />
                  </div>

                  {/* Interstitial Suggestion */}
                  {showSuggestion && suggested[suggestionIndex] && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="bg-card/50 backdrop-blur-xl border border-primary/10 rounded-3xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Sparkles size={16} className="text-primary" />
                          <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Suggested for you</h3>
                        </div>
                      </div>
                      <PostCard post={suggested[suggestionIndex]} />
                    </motion.div>
                  )}

                  {/* Interstitial Ad */}
                  {showAd && ads[adIndex] && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                    >
                      <AdCard ad={ads[adIndex]} />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <div className="space-y-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <PartyPopper size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">You're all caught up!</h3>
                <p className="text-sm text-white/40 font-medium">You've seen all the latest updates for now.</p>
              </div>
              <button 
                onClick={() => { setPage(1); fetchPosts(1); }}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center space-x-2"
              >
                <TrendingUp size={14} />
                <span>Refresh Feed</span>
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
