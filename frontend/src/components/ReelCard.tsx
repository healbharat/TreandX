'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Music, User, Disc, MoreHorizontal, MapPin, Zap, Crown, UserPlus, Repeat } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import CommentSheet from './CommentSheet';

interface ReelCardProps {
  reel: any;
  active: boolean;
}

export default function ReelCard({ reel, active }: ReelCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!videoRef.current) return;

    if (active) {
      videoRef.current.play().catch(e => console.log('Autoplay blocked'));
      // Track view
      axios.patch(`https://treandx.onrender.com/reels/${reel._id}/view`);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [active]);

  const handleLike = async () => {
    // Simple toggle logic for demo, using same post interaction endpoint if compatible
    setLiked(!liked);
    setLikesCount((prev: number) => liked ? prev - 1 : prev + 1);
    try {
      await axios.post('https://treandx.onrender.com/interactions/like/toggle', { postId: reel._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  const handleRemix = async () => {
    try {
      await axios.post(`https://treandx.onrender.com/reels/remix/${reel._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Remix created! Check your profile.');
    } catch (err) {
      alert('Remix failed');
    }
  };

  return (
    <div className="h-screen w-full snap-start relative bg-black flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        loop
        playsInline
        muted={isMuted}
        onClick={() => setIsMuted(!isMuted)}
        className="h-full w-full object-cover"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Content Overlay */}
      <div className="absolute bottom-10 left-4 right-16 z-20">
        <div className="flex items-center space-x-3 mb-3">
           <img src={reel.userId.profileImage} alt="" className="w-9 h-9 rounded-full border border-white/20 object-cover" />
           <div className="flex items-center space-x-2">
              <h4 className="font-bold text-sm text-white">{reel.userId.username}</h4>
              <button className="text-[12px] font-bold text-white border border-white/40 px-3 py-1 rounded-lg hover:bg-white/10 transition-all">Follow</button>
           </div>
        </div>

        <p className="text-sm text-white/90 mb-4 line-clamp-2 max-w-[90%]">
          {reel.caption}
        </p>

        <div className="flex items-center space-x-2 max-w-[60%]">
           <Music size={12} className="text-white" />
           <div className="overflow-hidden whitespace-nowrap">
              <p className="text-[12px] text-white font-medium animate-marquee">
                 {reel.audioId?.title || 'Original Audio'} • {reel.userId.username}
              </p>
           </div>
        </div>
      </div>

      {/* Interaction Bar */}
      <div className="absolute right-3 bottom-12 z-20 flex flex-col items-center space-y-5">
         <div className="flex flex-col items-center space-y-1">
            <motion.button 
              whileTap={{ scale: 1.3 }}
              onClick={handleLike}
              className={`transition-all ${liked ? 'text-rose-500' : 'text-white'}`}
            >
               <Heart size={28} fill={liked ? 'currentColor' : 'none'} />
            </motion.button>
            <span className="text-[12px] font-bold text-white drop-shadow-md">{likesCount}</span>
         </div>

         <div className="flex flex-col items-center space-y-1">
            <button 
              onClick={() => setShowComments(true)}
              className="text-white transition-all hover:opacity-70"
            >
               <MessageCircle size={28} />
            </button>
            <span className="text-[12px] font-bold text-white drop-shadow-md">{reel.commentsCount || 0}</span>
         </div>

         <button 
            onClick={handleRemix}
            className="text-white transition-all hover:opacity-70"
          >
             <Repeat size={28} />
         </button>

         <button className="text-white transition-all hover:opacity-70">
            <Share2 size={28} />
         </button>

         <button className="text-white transition-all hover:opacity-70">
            <MoreHorizontal size={28} />
         </button>

         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
           className="w-8 h-8 rounded-lg border-2 border-white/40 p-0.5 mt-2 bg-gradient-to-tr from-neutral-800 to-neutral-600"
         >
            <div className="w-full h-full rounded-md overflow-hidden bg-black flex items-center justify-center">
               <Music size={12} className="text-white opacity-40" />
            </div>
         </motion.div>
      </div>

      <AnimatePresence>
        {showComments && (
          <CommentSheet postId={reel._id} postOwnerId={reel.userId._id} onClose={() => setShowComments(false)} />
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
