'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Grid, Tag, Settings, Trash2, Edit3, Grid3X3, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '@/components/PostCard';
import BottomNav from '@/components/BottomNav';
import FollowButton from '@/components/FollowButton';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'stories'>('posts');

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: userData } = await axios.get(`http://localhost:3001/user/${username}`);
      setUser(userData);
      
      const { data: userPosts } = await axios.get(`http://localhost:3001/user/${userData._id}/posts`);
      setPosts(userPosts);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Delete this post permanently?')) return;
    
    try {
      await axios.delete(`http://localhost:3001/post/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <div className="p-10 text-center">User not found</div>;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-12">
           <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[48px] overflow-hidden border-4 border-white/5 p-1 glass">
                 <img src={user.profileImage} alt="" className="w-full h-full object-cover rounded-[36px]" />
              </div>
              {isOwnProfile && (
                <button className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
                  <Edit3 size={18} />
                </button>
              )}
           </div>

           <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="space-y-2">
                 <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase">{user.name}</h1>
                    {isOwnProfile ? (
                      <button 
                        onClick={() => router.push('/settings')}
                        className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <FollowButton userId={user._id} />
                    )}
                 </div>
                 <p className="text-muted-foreground font-bold">@{user.username}</p>
                 <p className="text-sm font-medium leading-relaxed max-w-md">{user.bio || 'No bio yet.'}</p>
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-8">
                 <div className="text-center md:text-left">
                    <p className="text-2xl font-black italic">{posts.length}</p>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Posts</p>
                 </div>
                 <div className="text-center md:text-left">
                    <p className="text-2xl font-black italic">{user.followersCount}</p>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Followers</p>
                 </div>
                 <div className="text-center md:text-left">
                    <p className="text-2xl font-black italic">{user.followingCount}</p>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Following</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
           <button 
             onClick={() => setActiveTab('posts')}
             className={`flex-1 py-4 flex items-center justify-center space-x-2 border-b-2 transition-all ${activeTab === 'posts' ? 'border-primary text-primary font-black uppercase tracking-widest text-xs' : 'border-transparent text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-50'}`}
           >
             <Grid3X3 size={16} />
             <span>Feed</span>
           </button>
           <button 
             onClick={() => setActiveTab('stories')}
             className={`flex-1 py-4 flex items-center justify-center space-x-2 border-b-2 transition-all ${activeTab === 'stories' ? 'border-primary text-primary font-black uppercase tracking-widest text-xs' : 'border-transparent text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-50'}`}
           >
             <Film size={16} />
             <span>Highlights</span>
           </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-1 md:gap-4">
           {posts.map((post) => (
             <div key={post._id} className="relative group aspect-square rounded-xl md:rounded-3xl overflow-hidden glass border border-white/5">
                <img src={post.imageUrl || '/placeholder.png'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                   <div className="text-white text-center">
                      <p className="font-black italic text-lg">{post.likesCount}</p>
                      <p className="text-[8px] font-black uppercase opacity-60">Likes</p>
                   </div>
                   {isOwnProfile && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleDeletePost(post._id); }}
                       className="p-3 bg-red-500 text-white rounded-2xl hover:scale-110 transition-transform"
                     >
                       <Trash2 size={18} />
                     </button>
                   )}
                </div>
             </div>
           ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 opacity-20 italic font-black uppercase tracking-widest">
            No posts shared yet.
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
