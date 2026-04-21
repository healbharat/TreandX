'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Edit3, Grid3X3, Film, Camera, Settings, Share2, Bookmark, User as UserIcon, Link as LinkIcon, Globe, Briefcase, Sparkles, MapPin, AtSign, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import FollowButton from '@/components/FollowButton';
import EditBioModal from '@/components/EditBioModal';
import UsersModal from '@/components/UsersModal';

type ProfileTab = 'posts' | 'reels' | 'saved' | 'tagged';

export default function ProfileClient() {
  const params = useParams();
  const [username, setUsername] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (params?.username) {
      setUsername(params.username as string);
    } else {
      const parts = window.location.pathname.split('/');
      const profileIdx = parts.indexOf('profile');
      if (profileIdx !== -1 && parts[profileIdx + 1]) {
        // Handle trailing slash or sub-paths
        const name = parts[profileIdx + 1];
        if (name && name !== 'analytics') setUsername(name);
      }
    }
  }, [params]);

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [showEditBio, setShowEditBio] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [usersModalType, setUsersModalType] = useState<'followers' | 'following'>('followers');

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: userData } = await axios.get(`https://treandx.onrender.com/user/${username}`);
      setUser(userData);
      
      const { data: userPosts } = await axios.get(`https://treandx.onrender.com/posts/user/${userData._id}`);
      setPosts(userPosts);

      const { data: highData } = await axios.get(`https://treandx.onrender.com/stories/user/${userData._id}/highlights`);
      setHighlights(highData);

      if (isOwnProfile) {
        const { data: savedData } = await axios.get('https://treandx.onrender.com/interactions/saved-posts');
        setSavedPosts(savedData);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: ProfileTab) => setActiveTab(tab);

  const displayPosts = activeTab === 'posts' ? posts : 
                      activeTab === 'saved' ? savedPosts : 
                      activeTab === 'reels' ? posts.filter(p => !p.imageUrl && p.content.length > 50) : 
                      [];

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-hidden pb-40">
      <div className="max-w-4xl mx-auto pt-10">
        
        {/* Profile Header */}
        <div className="px-6 space-y-10">
           <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-12">
              <div className="relative mb-8 md:mb-0">
                 <div className={`w-36 h-36 md:w-44 md:h-44 rounded-[48px] overflow-hidden p-1.5 transition-all duration-700 ${user?.profileType === 'creator' ? 'bg-gradient-to-tr from-rose-500 via-primary to-orange-400' : 'bg-white/5 border border-white/10'}`}>
                    <img src={user?.profileImage || '/placeholder.png'} alt="" className="w-full h-full object-cover rounded-[38px] shadow-2xl" />
                 </div>
                 {isOwnProfile && (
                   <button className="absolute -bottom-2 -right-2 p-3.5 bg-primary text-white rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-[#080808]">
                      <Camera size={20} strokeWidth={2.5} />
                   </button>
                 )}
              </div>

              <div className="flex-1 space-y-6 text-center md:text-left">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                       <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{user?.name}</h1>
                       <div className="flex items-center justify-center md:justify-start space-x-2 text-white/40">
                          <AtSign size={12} className="text-primary" />
                          <p className="text-[11px] font-black uppercase tracking-[0.2em]">{user?.username}</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                       {isOwnProfile ? (
                          <button 
                             onClick={() => router.push('/settings')}
                             className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center space-x-2"
                          >
                             <Edit3 size={14} />
                             <span>Edit Profile</span>
                          </button>
                       ) : (
                          <>
                             <FollowButton userId={user?._id} />
                             <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                                <Share2 size={18} />
                             </button>
                          </>
                       )}
                    </div>
                 </div>

                 <div className="flex items-center justify-center md:justify-start space-x-12">
                    <div className="text-center md:text-left">
                       <p className="text-2xl font-black italic">{posts.length}</p>
                       <p className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em]">Posts</p>
                    </div>
                    <div className="text-center md:text-left cursor-pointer hover:opacity-70 transition-opacity" onClick={() => { setUsersModalType('followers'); setShowUsersModal(true); }}>
                       <p className="text-2xl font-black italic">{user?.followersCount || 0}</p>
                       <p className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em]">Followers</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/5 mt-10">
           {/* ... tabs ... */}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
