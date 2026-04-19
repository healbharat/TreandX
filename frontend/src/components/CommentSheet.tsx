'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

interface CommentSheetProps {
  postId: string;
  onClose: () => void;
}

export default function CommentSheet({ postId, onClose }: CommentSheetProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3001/interactions/comments?postId=${postId}`);
        setComments(data);
      } catch (err) {
        console.error('Failed to fetch comments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (payload: any) => {
      if (payload.postId === postId) {
        setComments((prev) => [payload.comment, ...prev]);
      }
    };

    socket.on('newComment', handleNewComment);
    return () => {
      socket.off('newComment', handleNewComment);
    };
  }, [socket, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await axios.post('http://localhost:3001/interactions/comment', {
        postId,
        content: newComment,
      });
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-[420px] h-[80vh] bg-card rounded-t-[3rem] p-6 flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Comments</h3>
          <button onClick={onClose} className="p-2 bg-secondary rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pb-20 scrollbar-hide">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment, index) => (
              <motion.div 
                key={comment._id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex space-x-4"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                  <img src={comment.userId.profileImage} alt={comment.userId.name} />
                </div>
                <div className="flex-1 bg-secondary/30 p-4 rounded-3xl rounded-tl-none">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{comment.userId.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{comment.content}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 opacity-40">
              <p className="font-bold">No comments yet</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        {/* Input */}
        <form 
          onSubmit={handleSubmit}
          className="absolute bottom-0 left-0 right-0 p-6 bg-card border-t border-border flex items-center space-x-3"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 shrink-0">
            <img src={user?.profileImage} alt="Me" />
          </div>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-secondary border-none outline-none rounded-2xl px-4 py-3 text-sm"
          />
          <button 
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="bg-primary text-white p-3 rounded-2xl disabled:opacity-50 transition-all active:scale-90"
          >
            <Send size={18} />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
