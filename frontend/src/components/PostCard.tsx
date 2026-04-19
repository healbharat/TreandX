import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
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
    createdAt: string;
    isLiked: boolean;
    isSaved: boolean;
    userId: {
      _id: string;
      name: string;
      username: string;
      profileImage: string;
    };
  };
}

export default function PostCard({ post: initialPost }: PostProps) {
  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewLike = (payload: any) => {
      if (payload.postId === post._id) {
        setPost((prev) => ({
          ...prev,
          likesCount: prev.likesCount + 1,
        }));
      }
    };

    socket.on('new-like', handleNewLike);
    return () => {
      socket.off('new-like', handleNewLike);
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
      await axios.post('http://localhost:3001/post/like', { postId: post._id });
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
      await axios.post('http://localhost:3001/post/save', { postId: post._id });
    } catch (err) {
      setPost({ ...post, isSaved: prevSaved });
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
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-sm tracking-tight">{post.userId.name}</h4>
                <FollowButton userId={post.userId._id} />
              </div>
              <p className="text-muted-foreground text-[10px]">
                @{post.userId.username} • {formatDistanceToNow(new Date(post.createdAt))} ago
              </p>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-[15px] leading-relaxed opacity-90">{post.content}</p>
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
            
            <button className="text-muted-foreground hover:text-white transition-colors">
              <Share2 size={22} />
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
