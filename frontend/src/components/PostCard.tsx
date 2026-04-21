'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Zap, Crown, MapPin, ChevronLeft, ChevronRight, Edit3, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import CommentSheet from './CommentSheet';
import FollowButton from './FollowButton';

interface PostProps {
  post: {
    _id: string;
    caption: string;
    mediaUrls: string[];
    location?: string;
    hashtags?: string[];
    mentions?: string[];
    likesCount: number;
    sharesCount?: number;
    commentsCount?: number;
    createdAt: string;
    isLiked: boolean;
    isSaved: boolean;
    userId: {
      _id: string;
      name: string;
      username: string;
      profileImage: string;
      isPremium?: boolean;
    };
  };
  onDelete?: (postId: string) => void;
  onUpdate?: (post: any) => void;
}

export default function PostCard({ post: initialPost, onDelete, onUpdate }: PostProps) {
  const [post, setPost] = useState({
    ...initialPost,
    mediaUrls: initialPost.mediaUrls || [],
    hashtags: initialPost.hashtags || [],
    mentions: initialPost.mentions || [],
  });
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();

  const isOwner = user?._id === post.userId._id;

  useEffect(() => {
    if (!socket) return;

    const handlePostLiked = (payload: any) => {
      if (payload.postId === post._id) {
        setPost((prev) => ({
          ...prev,
          likesCount: payload.likesCount,
        }));
      }
    };

    socket.on('postLiked', handlePostLiked);
    return () => {
      socket.off('postLiked', handlePostLiked);
    };
  }, [socket, post._id]);

  const handleLike = async () => {
    if (isLiking) return;
    const prevLiked = post.isLiked;
    const prevCount = post.likesCount;
    setPost({
      ...post,
      isLiked: !prevLiked,
      likesCount: prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1,
    });
    try {
      setIsLiking(true);
      await axios.post('https://treandx.onrender.com/interactions/like/toggle', { postId: post._id });
    } catch (err) {
      setPost({ ...post, isLiked: prevLiked, likesCount: prevCount });
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    const prevSaved = post.isSaved;
    setPost({ ...post, isSaved: !prevSaved });
    try {
      await axios.post('https://treandx.onrender.com/interactions/save/toggle', { postId: post._id });
    } catch (err) {
      setPost({ ...post, isSaved: prevSaved });
    }
  };

  const handleShare = async () => {
    try {
      await axios.post('https://treandx.onrender.com/interactions/share', { postId: post._id });
      const shareUrl = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const nextMedia = () => {
    if (currentMediaIndex < post.mediaUrls.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`https://treandx.onrender.com/posts/${post._id}`);
      onDelete?.(post._id);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const handleFetchSummary = async () => {
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }
    try {
      setIsLoadingSummary(true);
      const { data } = await axios.post('https://treandx.onrender.com/ai/summarize', { content: post.caption });
      setSummary(data.summary);
      setShowSummary(true);
    } catch (err) {
      console.error('Failed to fetch summary', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('video/upload');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="premium-card p-0 mb-6 overflow-hidden border border-white/5 bg-[#121212]/50 backdrop-blur-3xl group"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-5">
          <div className="flex items-center space-x-3">
            <div className="relative">
               <div className={`w-10 h-10 rounded-[14px] p-0.5 ${post.userId.isPremium ? 'bg-gradient-to-tr from-amber-400 to-yellow-600' : 'bg-white/10'}`}>
                 <img src={post.userId.profileImage} alt="" className="w-full h-full rounded-[12px] object-cover" />
               </div>
               {post.userId.isPremium && (
                 <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 border-2 border-[#090909]">
                    <Crown size={8} className="text-white fill-white" />
                 </div>
               )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-sm tracking-tight text-white/90">@{post.userId.username}</h4>
                {!isOwner && <FollowButton userId={post.userId._id} />}
              </div>
              <div className="flex items-center space-x-1 opacity-50">
                 {post.location && (
                   <span className="text-[9px] font-medium flex items-center">
                     <MapPin size={8} className="mr-0.5" /> {post.location} •
                   </span>
                 )}
                 <span className="text-[9px] font-medium">
                   {formatDistanceToNow(new Date(post.createdAt))} ago
                 </span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-white/40 hover:text-white transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {isOwner ? (
                    <>
                      <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-white/5 text-sm font-medium transition-colors">
                        <Edit3 size={16} />
                        <span>Edit Post</span>
                      </button>
                      <button onClick={handleDelete} className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-red-500/10 text-red-400 text-sm font-medium transition-colors border-t border-white/5">
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </>
                  ) : (
                    <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-white/5 text-sm font-medium transition-colors">
                      <AlertTriangle size={16} />
                      <span>Report Post</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Media */}
        <div className="relative aspect-square md:aspect-video bg-black flex items-center justify-center overflow-hidden">
          {post.mediaUrls.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMediaIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full h-full"
                >
                  {isVideo(post.mediaUrls[currentMediaIndex]) ? (
                    <video 
                      src={post.mediaUrls[currentMediaIndex]} 
                      className="w-full h-full object-contain" 
                      controls 
                      autoPlay 
                      muted 
                      loop
                    />
                  ) : (
                    <img 
                      src={post.mediaUrls[currentMediaIndex]} 
                      alt="" 
                      className="w-full h-full object-contain"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Carousel Controls */}
              {post.mediaUrls.length > 1 && (
                <>
                  {currentMediaIndex > 0 && (
                    <button 
                      onClick={prevMedia}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  {currentMediaIndex < post.mediaUrls.length - 1 && (
                    <button 
                      onClick={nextMedia}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}
                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 p-2 bg-black/20 backdrop-blur-sm rounded-full">
                    {post.mediaUrls.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-300 ${i === currentMediaIndex ? 'w-4 bg-primary' : 'w-1 bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-white/10 space-y-2">
               <Zap size={48} strokeWidth={1} />
               <p className="text-[10px] font-black uppercase tracking-widest italic">Signal lost. No visual data.</p>
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className="p-5 px-6">
          <div className="space-y-4 mb-5">
             <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-relaxed tracking-tight text-white/90 underline-offset-4">
                  <span className="font-black mr-2">@{post.userId.username}</span>
                  {post.caption}
                </p>
                <button 
                   onClick={handleFetchSummary}
                   className="p-2 rounded-xl bg-white/5 text-primary/40 hover:text-primary transition-all ml-4"
                >
                   {isLoadingSummary ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                </button>
             </div>

             <AnimatePresence>
                {showSummary && summary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                    <p className="text-[11px] font-bold italic leading-relaxed text-white/60">
                      {summary}
                    </p>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.hashtags.map(tag => (
                <span key={tag} className="text-[10px] font-black uppercase text-primary/80 hover:text-primary cursor-pointer transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Premium Actions Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center space-x-6">
              <motion.button 
                onClick={handleLike}
                whileTap={{ scale: 1.4 }}
                className={`flex items-center space-x-2.5 group/btn ${post.isLiked ? 'text-primary' : 'text-white/40 hover:text-white'}`}
              >
                <Heart size={22} fill={post.isLiked ? 'currentColor' : 'none'} className="transition-all duration-300" />
                <span className="text-sm font-black italic tracking-tighter tabular-nums">{post.likesCount}</span>
              </motion.button>

              <button 
                onClick={() => setShowComments(true)}
                className="flex items-center space-x-2.5 text-white/40 hover:text-white transition-colors group/btn"
              >
                <MessageCircle size={22} className="group-hover/btn:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest opacity-40">Talk</span>
              </button>
              
              <button 
                onClick={handleShare}
                className="text-white/40 hover:text-white transition-colors group/btn"
              >
                <Share2 size={22} className="group-hover/btn:rotate-12 transition-transform" />
              </button>
            </div>

            <button 
              onClick={handleSave}
              className={`transition-all ${post.isSaved ? 'text-blue-400' : 'text-white/40 hover:text-white'}`}
            >
              <Bookmark size={22} fill={post.isSaved ? 'currentColor' : 'none'} className={post.isSaved ? 'scale-110' : ''} />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showComments && (
          <CommentSheet 
            postId={post._id} 
            postOwnerId={post.userId._id}
            onClose={() => setShowComments(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
