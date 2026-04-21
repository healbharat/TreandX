'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import PostCard from '@/components/PostCard';
import BottomNav from '@/components/BottomNav';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

export default function PostDetailClient() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:3001/post/${id}`);
        setPost(data);
      } catch (err) {
        console.error('Failed to fetch post', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center space-y-4">
        <p className="font-black uppercase tracking-widest opacity-20">Post not found</p>
        <button onClick={() => router.back()} className="text-primary font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <header className="sticky top-0 z-50 glass px-6 py-4 flex items-center space-x-4">
         <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={24} />
         </button>
         <h1 className="text-lg font-black italic uppercase tracking-tight">Post Detail</h1>
      </header>

      <main className="max-w-2xl mx-auto pt-6 pb-40 px-4 md:px-0">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.4 }}
        >
          <PostCard post={post} />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
