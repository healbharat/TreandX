'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, TrendingUp, Users, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import SkeletonCard from '@/components/SkeletonCard';
import BottomNav from '@/components/BottomNav';

type Tab = 'top' | 'users' | 'posts';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('top');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ users: any[]; posts: any[] }>({ users: [], posts: [] });
  const [trending, setTrending] = useState<{ tag: string; count: number }[]>([]);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data } = await axios.get('https://treandx.onrender.com/search/trending');
        setTrending(data);
      } catch (err) {
        console.error('Failed to fetch trending', err);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery) {
        setResults({ users: [], posts: [] });
        return;
      }

      setLoading(true);
      try {
        let endpoint = 'https://treandx.onrender.com/search';
        if (activeTab === 'users') endpoint = 'https://treandx.onrender.com/search/users';
        if (activeTab === 'posts') endpoint = 'https://treandx.onrender.com/search/posts';

        const { data } = await axios.get(endpoint, { params: { q: debouncedQuery } });
        
        if (activeTab === 'top') {
          setResults(data);
        } else if (activeTab === 'users') {
          setResults(prev => ({ ...prev, users: data }));
        } else if (activeTab === 'posts') {
          setResults(prev => ({ ...prev, posts: data }));
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, activeTab]);

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-primary/10 px-4 py-4">
        <div className="flex items-center space-x-3">
          <Link href="/home" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1 relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search TreandX..."
              className="w-full bg-white/5 border border-primary/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Tabs */}
        {query && (
          <div className="flex items-center mt-4 space-x-1">
            {(['top', 'users', 'posts'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium capitalize rounded-xl transition-all ${
                  activeTab === tab 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {!query ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              key="trending"
            >
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="text-primary" size={20} />
                <h2 className="text-lg font-bold">Trending for you</h2>
              </div>
              
              <div className="space-y-4">
                {trending.length > 0 ? trending.map((item, index) => (
                  <button
                    key={item.tag}
                    onClick={() => setQuery(item.tag.replace('#', ''))}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-primary/5 hover:border-primary/20 hover:bg-white/10 transition-all group shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-muted-foreground font-mono text-sm">{index + 1}</span>
                      <div className="text-left">
                        <p className="font-bold group-hover:text-primary transition-colors">{item.tag}</p>
                        <p className="text-xs text-muted-foreground">{item.count} posts</p>
                      </div>
                    </div>
                  </button>
                )) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No trending topics yet. Start posting!
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="results"
              className="space-y-6"
            >
              {loading ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-primary" size={32} />
                  </div>
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <>
                  {/* Top Results Logic */}
                  {activeTab === 'top' && (
                    <>
                      {results.users.length > 0 && (
                        <section>
                          <h3 className="text-sm font-bold text-muted-foreground mb-4 flex items-center">
                            <Users size={16} className="mr-2" /> Users
                          </h3>
                          <div className="space-y-3">
                            {results.users.map(user => <UserListItem key={user._id} user={user} />)}
                          </div>
                        </section>
                      )}
                      
                      {results.posts.length > 0 && (
                        <section className="mt-8">
                          <h3 className="text-sm font-bold text-muted-foreground mb-4 flex items-center">
                            <FileText size={16} className="mr-2" /> Posts
                          </h3>
                          <div className="space-y-4">
                            {results.posts.map(post => <PostCard key={post._id} post={post} />)}
                          </div>
                        </section>
                      )}

                      {results.users.length === 0 && results.posts.length === 0 && <EmptyState />}
                    </>
                  )}

                  {/* Users Tab */}
                  {activeTab === 'users' && (
                    <div className="space-y-3">
                      {results.users.length > 0 ? (
                        results.users.map(user => <UserListItem key={user._id} user={user} />)
                      ) : <EmptyState />}
                    </div>
                  )}

                  {/* Posts Tab */}
                  {activeTab === 'posts' && (
                    <div className="space-y-4">
                      {results.posts.length > 0 ? (
                        results.posts.map(post => <PostCard key={post._id} post={post} />)
                      ) : <EmptyState />}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}

import FollowButton from '@/components/FollowButton';

function UserListItem({ user }: { user: any }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-primary/5 hover:border-primary/20 transition-all">
      <Link 
        href={`/profile/${user.username || user._id}`}
        className="flex items-center space-x-3 flex-1"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 flex-shrink-0">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary font-bold">
              {(user.name || user.username || '?')[0].toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-sm">{user.name || 'Anonymous'}</p>
          <p className="text-xs text-muted-foreground">@{user.username || 'user'}</p>
        </div>
      </Link>
      <FollowButton userId={user._id} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/10">
        <SearchIcon className="text-primary/40" size={32} />
      </div>
      <h3 className="text-lg font-bold">No results found</h3>
      <p className="text-sm text-muted-foreground mt-2 px-10">
        Try searching for something else or check your spelling.
      </p>
    </div>
  );
}
