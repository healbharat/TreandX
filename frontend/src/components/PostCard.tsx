'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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

  const [showHeartPop, setShowHeartPop] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const doubleTapRef = useRef<number>(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - doubleTapRef.current < 300) {
      if (!post.isLiked) handleLike();
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
    doubleTapRef.current = now;
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
               <div className={`w-10 h-10 rounded-full p-0.5 ${post.userId.isPremium ? 'bg-gradient-to-tr from-amber-400 to-yellow-600' : 'bg-white/10'}`}>
                 <img src={post.userId.profileImage} alt="" className="w-full h-full rounded-full object-cover border border-[#1a1a1a]" />
               </div>
               {post.userId.isPremium && (
                 <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 border-2 border-[#121212]">
                    <Crown size={8} className="text-white fill-white" />
                 </div>
               )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-sm tracking-tight text-white/90 cursor-pointer" onClick={() => router.push(`/profile/${post.userId.username}`)}>
                  {post.userId.username}
                </h4>
                {!isOwner && <FollowButton userId={post.userId._id} />}
              </div>
              <div className="flex items-center space-x-1 opacity-50">
                 {post.location && (
                   <span className="text-[10px] font-medium flex items-center">
                     {post.location} •
                   </span>
                 )}
                 <span className="text-[10px] font-medium">
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
        <div 
          className="relative aspect-square bg-[#090909] flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={handleDoubleTap}
        >
          {post.mediaUrls.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMediaIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  {isVideo(post.mediaUrls[currentMediaIndex]) ? (
                    <video 
                      src={post.mediaUrls[currentMediaIndex]} 
                      className="w-full h-full object-cover" 
                      autoPlay 
                      muted 
                      loop
                      playsInline
                    />
                  ) : (
                    <img 
                      src={post.mediaUrls[currentMediaIndex]} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Heart Pop Animation */}
              <AnimatePresence>
                {showHeartPop && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, ease: "backOut" }}
                    className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                  >
                    <Heart size={100} className="text-white fill-white drop-shadow-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Carousel Controls */}
              {post.mediaUrls.length > 1 && (
                <>
                  {currentMediaIndex > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-white/10 transition-all z-20"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                  {currentMediaIndex < post.mediaUrls.length - 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-white/10 transition-all z-20"
                    >
                      <ChevronRight size={16} />
                    </button>
                  )}
                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 z-20">
                    {post.mediaUrls.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === currentMediaIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-white/5 space-y-2">
               <Zap size={48} strokeWidth={1} />
               <p className="text-[10px] font-black uppercase tracking-widest italic">Signal lost.</p>
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className="p-4 pt-4">
          {/* Actions Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-5">
              <motion.button 
                onClick={handleLike}
                whileTap={{ scale: 1.4 }}
                className={`${post.isLiked ? 'text-rose-500' : 'text-white'}`}
              >
                <Heart size={26} fill={post.isLiked ? 'currentColor' : 'none'} className="transition-all duration-300" />
              </motion.button>

              <button 
                onClick={() => setShowComments(true)}
                className="text-white hover:opacity-70 transition-opacity"
              >
                <MessageCircle size={26} />
              </button>
              
              <button 
                onClick={handleShare}
                className="text-white hover:opacity-70 transition-opacity"
              >
                <Share2 size={26} />
              </button>
            </div>

            <button 
              onClick={handleSave}
              className={`transition-all ${post.isSaved ? 'text-white' : 'text-white'}`}
            >
              <Bookmark size={26} fill={post.isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="space-y-2">
             <p className="text-sm font-bold text-white tracking-tight tabular-nums">
               {post.likesCount.toLocaleString()} {post.likesCount === 1 ? 'like' : 'likes'}
             </p>

             <div className="text-sm leading-relaxed tracking-tight text-white/80">
               <span className="font-bold text-white mr-2">@{post.userId.username}</span>
               {post.caption.length > 80 && !isCaptionExpanded ? (
                 <>
                   {post.caption.slice(0, 80)}...
                   <button 
                     onClick={() => setIsCaptionExpanded(true)}
                     className="text-white/40 ml-1 font-bold"
                   >
                     more
                   </button>
                 </>
               ) : (
                 post.caption
               )}
               
               <button 
                  onClick={handleFetchSummary}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold ml-2 hover:bg-primary/20 transition-all"
               >
                  {isLoadingSummary ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                  <span>{showSummary ? 'Hide summary' : 'AI Summary'}</span>
               </button>
             </div>

             <AnimatePresence>
                {showSummary && summary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 p-3 rounded-xl bg-white/5 border-l-2 border-primary/50"
                  >
                    <p className="text-[11px] font-medium leading-relaxed text-white/70 italic">
                      "{summary}"
                    </p>
                  </motion.div>
                )}
             </AnimatePresence>

             {post.hashtags && post.hashtags.length > 0 && (
               <div className="flex flex-wrap gap-2 pt-1">
                 {post.hashtags.map(tag => (
                   <span key={tag} className="text-xs text-blue-400 hover:underline cursor-pointer">
                     #{tag}
                   </span>
                 ))}
               </div>
             )}

             {post.commentsCount && post.commentsCount > 0 && (
               <button 
                 onClick={() => setShowComments(true)}
                 className="text-sm text-white/40 font-medium block pt-1"
               >
                 View all {post.commentsCount} comments
               </button>
             )}
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
