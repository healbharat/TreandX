'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface StoryViewerProps {
  userStories: {
    user: any;
    stories: any[];
  };
  onClose: () => void;
}

export default function StoryViewer({ userStories, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const currentStory = userStories.stories[currentIndex];

  const nextStory = useCallback(() => {
    if (currentIndex < userStories.stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, userStories.stories.length, onClose]);

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds per story approx (100 * 50ms)

    return () => clearInterval(timer);
  }, [nextStory]);

  useEffect(() => {
    // Track view when story changes
    if (currentStory) {
      axios.post(`http://localhost:3001/stories/${currentStory._id}/view`).catch(() => {});
    }
  }, [currentStory]);

  const handleReact = async (emoji: string) => {
    try {
      await axios.post(`http://localhost:3001/stories/${currentStory._id}/react`, { type: emoji });
      // Visual feedback could be added here
    } catch (err) {
      console.error('Reaction failed', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="relative w-full h-full md:max-w-md md:h-[90%] md:rounded-[40px] overflow-hidden bg-neutral-900 shadow-2xl">
        
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-50 flex space-x-1">
          {userStories.stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/20 overflow-hidden rounded-full">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={userStories.user.profileImage} alt="" className="w-8 h-8 rounded-full border border-white/20" />
            <div className="text-white">
              <p className="text-sm font-black italic tracking-tight">{userStories.user.name}</p>
              <p className="text-[10px] opacity-70">@{userStories.user.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStory._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full h-full"
            >
              {currentStory.type === 'video' ? (
                <video src={currentStory.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <img src={currentStory.mediaUrl} alt="" className="w-full h-full object-cover" />
              )}
              
              {currentStory.caption && (
                 <div className="absolute bottom-32 left-0 right-0 p-8 text-center bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-bold text-lg italic tracking-tight drop-shadow-lg">{currentStory.caption}</p>
                 </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Overlay */}
          <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full cursor-pointer" onClick={prevStory} />
            <div className="w-2/3 h-full cursor-pointer" onClick={nextStory} />
          </div>
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-6 left-4 right-4 z-50 flex items-center space-x-4">
           <div className="flex-1 relative">
             <input 
               type="text" 
               placeholder="Reply to story..." 
               className="w-full bg-white/10 border border-white/20 rounded-full py-3 px-6 text-white text-sm focus:outline-none focus:border-white/40 glass"
             />
             <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white opacity-60 hover:opacity-100 transition-opacity">
                <Send size={18} />
             </button>
           </div>
           
           <div className="flex items-center space-x-2">
             {['❤️', '🔥', '😮', '😂'].map(emoji => (
               <button 
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-2xl hover:scale-125 transition-transform"
               >
                 {emoji}
               </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
