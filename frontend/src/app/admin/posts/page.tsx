'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Eye, Ban, Search, Clock, Hash } from 'lucide-react';
import Image from 'next/image';

interface Post {
  _id: string;
  content: string;
  category: string;
  headline?: string;
  status: string;
  imageUrl?: string;
  userId: {
    _id: string;
    name: string;
    username: string;
  };
  createdAt: string;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get('https://treandx.onrender.com/admin/posts');
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  const blockPost = async (postId: string) => {
    if (!confirm('Are you sure you want to block this post? It will be hidden from all users.')) return;
    try {
      await axios.patch(`https://treandx.onrender.com/admin/post/${postId}/block`);
      setPosts(posts.map(p => p._id === postId ? { ...p, status: 'blocked' } : p));
    } catch (err) {
      console.error('Failed to block post', err);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.userId?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Content Moderation</h1>
          <p className="text-muted-foreground font-medium">Monitor and manage all news posts on the platform.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Filter posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-primary/50 focus:outline-none transition-all font-bold"
          />
        </div>
      </div>

      <div className="glass rounded-[40px] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic">Content</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic">Author</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic">Category</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic">Status</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-muted-foreground italic text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-28 bg-white/5" />
                  </tr>
                ))
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground font-bold italic">No posts found.</td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6 max-w-md">
                      <div className="flex items-start space-x-4">
                        {post.imageUrl && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                            <Image src={post.imageUrl} alt="post" fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-white truncate text-sm italic mb-1">{post.headline || 'Untitiled News'}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                          <div className="flex items-center space-x-3 mt-2">
                             <span className="flex items-center text-[10px] font-black uppercase text-white/40">
                               <Clock size={10} className="mr-1" />
                               {new Date(post.createdAt).toLocaleDateString()}
                             </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-black text-white text-sm">{post.userId?.name}</p>
                        <p className="text-xs font-bold text-muted-foreground">@{post.userId?.username}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <Hash size={12} className="text-primary mr-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{post.category}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        post.status === 'blocked' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                         <button
                          onClick={() => window.open(`/post/${post._id}`, '_blank')}
                          className="p-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-xl transition-all"
                          title="View Post"
                        >
                          <Eye size={18} />
                        </button>
                        {post.status !== 'blocked' && (
                          <button
                            onClick={() => blockPost(post._id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"
                            title="Block Post"
                          >
                            <Ban size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
