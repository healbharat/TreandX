'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import PostCard from '@/components/PostCard';
import SkeletonCard from '@/components/SkeletonCard';
import AdCard from '@/components/AdCard';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
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
      const { data } = await axios.get(`http://localhost:3001/feed?page=${pageNum}&limit=10`);
      
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

  const fetchRecommended = async () => {
    try {
      setLoadingRecommended(true);
      const { data } = await axios.get('http://localhost:3001/ai/recommendations');
      setRecommended(data);
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    } finally {
      setLoadingRecommended(false);
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
    if (user) {
      fetchPosts(1);
      fetchRecommended();
      if (!user.isPremium) fetchAds();
    }
  }, [user]);

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
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black gradient-text tracking-tighter">TreandX</h1>
        <div className="w-8 h-8 rounded-full border border-primary/20 overflow-hidden">
          <img src={user.profileImage} alt="Me" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Recommended Section */}
      <AnimatePresence>
        {recommended.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <div className="px-4 flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <h2 className="text-sm font-black tracking-widest uppercase opacity-80">Recommended for you</h2>
              </div>
              <span className="text-[8px] font-bold px-2 py-0.5 rounded-full border border-primary/20 text-primary">AI CUSTOM</span>
            </div>
            
            <div className="flex overflow-x-auto space-x-4 px-4 pb-4 no-scrollbar scroll-smooth">
              {recommended.map((post) => (
                <div key={post._id} className="min-w-[280px] max-w-[280px]">
                  <div className="glass rounded-2xl p-4 h-full border border-primary/10 hover:border-primary/30 transition-all active:scale-[0.98]">
                    <div className="flex items-center space-x-2 mb-3">
                      <img src={post.userId.profileImage} alt="" className="w-6 h-6 rounded-full" />
                      <span className="text-[10px] font-bold truncate">@{post.userId.username}</span>
                    </div>
                    <p className="text-xs line-clamp-3 font-medium opacity-90 mb-3">{post.content}</p>
                    {post.imageUrl && (
                      <div className="aspect-video rounded-xl overflow-hidden mb-3">
                        <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase text-primary/60">{post.category}</span>
                      <button className="text-[10px] font-bold text-primary">Read full</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Feed */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => {
            const showAd = !user.isPremium && ads.length > 0 && (index + 1) % 5 === 0;
            const adIndex = Math.floor(index / 5) % ads.length;

            return (
              <div key={post._id}>
                {showAd && ads[adIndex] && <AdCard ad={ads[adIndex]} />}
                {posts.length === index + 1 ? (
                  <div ref={lastPostElementRef}>
                    <PostCard post={post} />
                  </div>
                ) : (
                  <PostCard post={post} />
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
          <div className="text-center py-10 opacity-50">
            <p className="text-sm font-medium">You've caught up with everything!</p>
          </div>
        )}

        {posts.length === 0 && !loading && (
          <div className="text-center py-20 opacity-50">
            <p className="text-lg font-bold">No posts yet</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
