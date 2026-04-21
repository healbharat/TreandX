'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Heart, Reply, Pin, EyeOff, MoreHorizontal, MessageCircle, Crown } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

interface CommentSheetProps {
  postId: string;
  postOwnerId?: string;
  onClose: () => void;
}

export default function CommentSheet({ postId, postOwnerId, onClose }: CommentSheetProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:3001/interactions/comments?postId=${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, token]);

  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (payload: any) => {
      // Re-fetch to ensure threading is correct, or update local state
      // For threading, it's safer to re-fetch if it's a reply or complex update
      fetchComments();
    };

        const handleCommentLiked = (payload: any) => {
          setComments(prev => {
            const updateComment = (list: any[]): any[] => {
              return list.map(c => {
                 if (c._id === payload.commentId) {
                   return { ...c, likesCount: payload.likesCount };
                 }
                 if (c.replies) {
                   return { ...c, replies: updateComment(c.replies) };
                 }
                 return c;
              });
            };
            return updateComment(prev);
          });
        };

    socket.on('newComment', handleNewComment);
    socket.on('commentLiked', handleCommentLiked);
    return () => {
      socket.off('newComment', handleNewComment);
      socket.off('commentLiked', handleCommentLiked);
    };
  }, [socket, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await axios.post('http://localhost:3001/interactions/comment', {
        postId,
        text: newComment,
        parentId: replyingTo?._id || null,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
      setReplyingTo(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Moderation block: Comment contains offensive content.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (commentId: string) => {
    try {
      await axios.post(`http://localhost:3001/interactions/comment/like/${commentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  const handlePin = async (commentId: string) => {
    try {
      await axios.patch(`http://localhost:3001/interactions/comment/pin/${commentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (err) {
      console.error('Pin failed', err);
    }
  };

  const handleHide = async (commentId: string) => {
    try {
      await axios.patch(`http://localhost:3001/interactions/comment/hide/${commentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (err) {
      console.error('Hide failed', err);
    }
  };

  const CommentItem = ({ c, isReply = false }: { c: any; isReply?: boolean }) => (
    <motion.div 
      initial={{ opacity: 0, x: isReply ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative group ${isReply ? 'ml-12 mt-4' : 'mt-6'}`}
    >
      <div className="flex space-x-3">
        <div className={`shrink-0 relative ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
           <img src={c.userId.profileImage} alt="" className="w-full h-full rounded-[14px] object-cover" />
           {c.userId._id === postOwnerId && (
             <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-[#161616]">
                <Crown size={6} className="text-white fill-white" />
             </div>
           )}
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
               <span className="text-xs font-black uppercase tracking-tighter text-white/90">@{c.userId.username}</span>
               {c.isPinned && (
                 <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-primary/10 rounded-md">
                    <Pin size={8} className="text-primary fill-primary" />
                    <span className="text-[8px] font-black uppercase text-primary">Pinned</span>
                 </div>
               )}
            </div>
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              {formatDistanceToNow(new Date(c.createdAt))} ago
            </span>
          </div>
          
          <p className="text-[13px] font-medium leading-relaxed text-white/70 italic-ish">
            {c.text}
          </p>

          <div className="flex items-center space-x-4 pt-1">
             <button 
               onClick={() => handleToggleLike(c._id)}
               className={`flex items-center space-x-1 transition-all ${c.isLiked ? 'text-primary' : 'text-white/20 hover:text-white'}`}
             >
                <Heart size={12} fill={c.isLiked ? 'currentColor' : 'none'} />
                <span className="text-[10px] font-black">{c.likesCount || 0}</span>
             </button>
             
             {!isReply && (
               <button 
                 onClick={() => { setReplyingTo(c); inputRef.current?.focus(); }}
                 className="flex items-center space-x-1 text-white/20 hover:text-white transition-all"
               >
                  <Reply size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Reply</span>
               </button>
             )}

             {user?._id === postOwnerId && (
                <button 
                  onClick={() => handlePin(c._id)}
                  className={`flex items-center space-x-1 transition-all ${c.isPinned ? 'text-primary' : 'text-white/20 hover:text-white'}`}
                >
                   <Pin size={12} />
                </button>
             )}

             {(user?._id === postOwnerId || user?._id === c.userId._id) && (
                <button 
                  onClick={() => handleHide(c._id)}
                  className="text-white/20 hover:text-red-400 transition-all"
                >
                   <EyeOff size={12} />
                </button>
             )}
          </div>

          {c.replies && c.replies.map((r: any) => (
             <CommentItem key={r._id} c={r} isReply={true} />
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/80 backdrop-blur-xl p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-xl h-[85vh] bg-[#0c0c0c] sm:rounded-[32px] rounded-t-[32px] border-t sm:border border-white/10 flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <MessageCircle size={20} />
             </div>
             <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">Conversations</h3>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Public Feed Matrix</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide pb-32">
          {loading && comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Syncing Threads...</p>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem key={comment._id} c={comment} />
            ))
          ) : (
            <div className="text-center py-32 opacity-20 flex flex-col items-center">
              <MessageCircle size={48} strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-widest mt-6">Void identified. Initiate signal.</p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#0c0c0c]/80 backdrop-blur-3xl border-t border-white/5">
          <AnimatePresence>
            {replyingTo && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                   <Reply size={12} className="text-primary" />
                   <span className="text-[10px] font-black uppercase text-primary/80">Refining signal for @{replyingTo.userId.username}</span>
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-primary">
                   <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="flex-1 relative group">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? "Compose reply..." : "Broadcast thought..."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-primary/40 focus:bg-white/10 transition-all placeholder:text-white/10"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 pointer-events-none opacity-20">
                 <Send size={16} />
              </div>
            </div>
            <button 
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-20 disabled:grayscale transition-all hover:scale-105 active:scale-95"
            >
              {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Loader2({ size, className }: { size: number; className?: string }) {
  return (
    <div className={`animate-spin ${className}`} style={{ width: size, height: size }}>
       <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
    </div>
  );
}
