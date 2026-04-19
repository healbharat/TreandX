'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import PostCard from '@/components/PostCard';
import SkeletonCard from '@/components/SkeletonCard';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
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

  useEffect(() => {
    if (user) {
      fetchPosts(1);
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

      {/* Feed */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return (
                <div ref={lastPostElementRef} key={post._id}>
                  <PostCard post={post} />
                </div>
              );
            } else {
              return <PostCard key={post._id} post={post} />;
            }
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
