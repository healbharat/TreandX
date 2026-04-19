import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, AlertTriangle, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useSocket } from '@/context/SocketContext';
import CommentSheet from './CommentSheet';
import FollowButton from './FollowButton';

interface PostProps {
  post: {
    _id: string;
    content: string;
    imageUrl?: string;
    likesCount: number;
    sharesCount?: number;
    createdAt: string;
    isLiked: boolean;
    isSaved: boolean;
    headline?: string;
    summary?: string;
    userId: {
      _id: string;
      name: string;
      username: string;
      profileImage: string;
      isPremium?: boolean;
    };
  };
}

export default function PostCard({ post: initialPost }: PostProps) {
  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLiking] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [summary, setSummary] = useState(post.summary || '');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const { socket } = useSocket();

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

    const handlePostShared = (payload: any) => {
      if (payload.postId === post._id) {
        setPost((prev) => ({
          ...prev,
          sharesCount: payload.sharesCount,
        }));
      }
    };

    socket.on('postLiked', handlePostLiked);
    socket.on('postShared', handlePostShared);
    return () => {
      socket.off('postLiked', handlePostLiked);
      socket.off('postShared', handlePostShared);
    };
  }, [socket, post._id]);

  const handleLike = async () => {
    if (isLiking) return;

    // Optimistic UI
    const prevLiked = post.isLiked;
    const prevCount = post.likesCount;
    
    setPost({
      ...post,
      isLiked: !prevLiked,
      likesCount: prevLiked ? prevCount - 1 : prevCount + 1,
    });

    try {
      setIsLiking(true);
      await axios.post('http://localhost:3001/interactions/like/toggle', { postId: post._id });
    } catch (err) {
      setPost({
        ...post,
        isLiked: prevLiked,
        likesCount: prevCount,
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    const prevSaved = post.isSaved;
    setPost({ ...post, isSaved: !prevSaved });

    try {
      await axios.post('http://localhost:3001/interactions/save/toggle', { postId: post._id });
    } catch (err) {
      setPost({ ...post, isSaved: prevSaved });
    }
  };

  const handleShare = async () => {
    try {
      await axios.post('http://localhost:3001/interactions/share', { postId: post._id });
      const shareUrl = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const handleFetchSummary = async () => {
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }

    try {
      setIsLoadingSummary(true);
      const { data } = await axios.post('http://localhost:3001/ai/summarize', { content: post.content });
      setSummary(data.summary);
      setShowSummary(true);
    } catch (err) {
      console.error('Failed to fetch summary', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleReport = async () => {
    const reason = window.prompt('Why are you reporting this post? (e.g. Hate speech, Spreading misinformation, Abusive)');
    if (!reason) return;

    try {
      await axios.post('http://localhost:3001/report', {
        postId: post._id,
        reason,
      });
      alert('Post reported successfully. Our moderators will review it.');
    } catch (err) {
      console.error('Failed to report post', err);
      alert('Failed to report post.');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl overflow-hidden mb-6"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full border border-primary/20 p-0.5">
              <img src={post.userId.profileImage} alt={post.userId.name} className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <h4 className="font-bold text-sm tracking-tight">{post.userId.name}</h4>
                {post.userId.isPremium && (
                  <Crown size={12} className="text-primary fill-primary" />
                )}
                <FollowButton userId={post.userId._id} />
              </div>
              <p className="text-muted-foreground text-[10px]">
                @{post.userId.username} • {formatDistanceToNow(new Date(post.createdAt))} ago
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={handleReport}
              className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
              title="Report Post"
            >
              <AlertTriangle size={18} />
            </button>
            <button className="p-2 text-muted-foreground hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          {post.headline && (
            <h3 className="text-xl font-black mb-2 leading-tight tracking-tight bg-gradient-to-r from-primary to-rose-400 bg-clip-text text-transparent">
              {post.headline}
            </h3>
          )}
          <p className="text-[15px] leading-relaxed opacity-90">{post.content}</p>
          
          <AnimatePresence>
            {showSummary && summary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 relative group"
              >
                <div className="absolute -top-2 left-4 px-2 bg-background border border-primary/20 rounded-full flex items-center space-x-1">
                  <span className="text-[8px] font-bold tracking-widest text-primary">AI GENERATED</span>
                </div>
                <p className="text-xs italic text-muted-foreground leading-extended font-medium">
                  {summary}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleFetchSummary}
            className="mt-3 flex items-center space-x-1.5 text-[10px] font-bold text-primary/60 hover:text-primary transition-colors py-1 px-3 rounded-full border border-primary/10 hover:border-primary/30 bg-primary/5"
          >
            {isLoadingSummary ? (
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            <span>{showSummary ? 'HIDE AI SUMMARY' : 'VIEW AI SUMMARY'}</span>
          </button>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="relative aspect-video bg-secondary/30 flex items-center justify-center overflow-hidden">
            <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}

        {/* Actions */}
        <div className="p-4 pt-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-all active:scale-125 ${post.isLiked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
            >
              <div className="relative">
                <Heart size={22} fill={post.isLiked ? 'currentColor' : 'none'} />
                <AnimatePresence>
                  {post.isLiked && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      className="absolute inset-0 text-rose-500"
                    >
                      <Heart size={22} fill="currentColor" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-sm font-bold">{post.likesCount}</span>
            </button>

            <button 
              onClick={() => setShowComments(true)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors active:scale-95"
            >
              <MessageCircle size={22} />
              <span className="text-sm font-bold">Comments</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 text-muted-foreground hover:text-white transition-colors active:scale-95"
            >
              <Share2 size={22} />
              {post.sharesCount ? <span className="text-[10px] font-black">{post.sharesCount}</span> : null}
            </button>
          </div>

          <button 
            onClick={handleSave}
            className={`transition-all active:scale-125 ${post.isSaved ? 'text-indigo-400' : 'text-muted-foreground hover:text-indigo-400'}`}
          >
            <Bookmark size={22} fill={post.isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showComments && (
          <CommentSheet postId={post._id} onClose={() => setShowComments(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
