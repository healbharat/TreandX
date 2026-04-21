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
      <div className="absolute bottom-24 left-6 right-20 space-y-4">
        {/* Author Info */}
        <div className="flex items-center space-x-3 mb-2">
           <div className={`p-0.5 rounded-2xl ${reel.userId.isPremium ? 'bg-gradient-to-br from-amber-400 to-yellow-600' : 'bg-white/20'}`}>
              <img src={reel.userId.profileImage} alt="" className="w-10 h-10 rounded-[14px] object-cover" />
           </div>
           <div>
              <div className="flex items-center space-x-2">
                 <h4 className="font-black italic text-sm tracking-tighter">@{reel.userId.username}</h4>
                 {reel.userId.isPremium && <Crown size={10} className="text-amber-500 fill-amber-500" />}
                 <button className="text-[10px] font-black uppercase text-primary border border-primary/40 px-2 py-0.5 rounded-md hover:bg-primary hover:text-white transition-all">Follow</button>
              </div>
           </div>
        </div>

        {/* Caption */}
        <p className="text-sm font-medium text-white/90 leading-snug line-clamp-2 max-w-[80%]">
          {reel.caption}
        </p>

        {/* Audio Info */}
        <div className="flex items-center space-x-3 group cursor-pointer">
           <div className="p-2 bg-white/10 backdrop-blur-3xl rounded-xl border border-white/10 group-hover:bg-white/20 transition-all">
              <Music size={14} className="text-primary" />
           </div>
           <div className="overflow-hidden whitespace-nowrap">
              <p className="text-[10px] font-black uppercase tracking-widest animate-marquee inline-block mr-8">
                 {reel.audioId?.title || 'Original Audio - System Signal Matrix'} • {reel.userId.username}
              </p>
           </div>
        </div>
      </div>

      {/* Vertical Interaction Bar */}
      <div className="absolute right-6 bottom-32 flex flex-col items-center space-y-6">
         {/* Like */}
         <div className="flex flex-col items-center space-y-1">
            <motion.button 
              whileTap={{ scale: 1.4 }}
              onClick={handleLike}
              className={`p-4 rounded-2xl backdrop-blur-3xl border border-white/10 transition-all ${liked ? 'bg-primary text-white shadow-lg shadow-primary/30 border-primary' : 'bg-white/10 text-white/60 hover:text-white'}`}
            >
               <Heart size={22} fill={liked ? 'currentColor' : 'none'} className={liked ? 'animate-pulse' : ''} />
            </motion.button>
            <span className="text-[10px] font-black tracking-tighter opacity-60 italic">{likesCount}</span>
         </div>

         {/* Comments */}
         <div className="flex flex-col items-center space-y-1">
            <button 
              onClick={() => setShowComments(true)}
              className="p-4 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all"
            >
               <MessageCircle size={22} />
            </button>
            <span className="text-[10px] font-black tracking-tighter opacity-60 italic">{reel.commentsCount || 0}</span>
         </div>

         {/* remix */}
         <div className="flex flex-col items-center space-y-1">
            <button 
              onClick={handleRemix}
              className="p-4 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all group"
            >
               <Repeat size={22} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <span className="text-[10px] font-black tracking-tighter opacity-60 italic">Remix</span>
         </div>

         {/* Share */}
         <button className="p-4 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all">
            <Share2 size={22} />
         </button>

         {/* Spinning Audio Disc */}
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
           className="relative mt-4"
         >
            <div className="w-12 h-12 rounded-full border-2 border-white/20 p-1 bg-black overflow-hidden shadow-2xl">
               <img src={reel.userId.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-black bg-white/10 backdrop-blur-3xl" />
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
