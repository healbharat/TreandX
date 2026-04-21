'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import StoryViewer from './StoryViewer';
import CreateStorySheet from './CreateStorySheet';

interface UserStories {
  user: {
    _id: string;
    name: string;
    username: string;
    profileImage: string;
  };
  stories: any[];
}

export default function StoryBar() {
  const { user } = useAuth();
  const [groupedStories, setGroupedStories] = useState<UserStories[]>([]);
  const [selectedUserStories, setSelectedUserStories] = useState<UserStories | null>(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data } = await axios.get('https://treandx.onrender.com/stories/following');
      setGroupedStories(data);
    } catch (err) {
      console.error('Failed to fetch stories', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-10 pl-5">
      <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar py-2">
        {/* Create Story Button */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center space-y-3 flex-shrink-0"
        >
          <button 
            onClick={() => setShowCreateStory(true)}
            className="relative w-20 h-20 rounded-[28px] p-1 bg-white/5 border border-white/10 flex items-center justify-center transition-all bg-[#141414]"
          >
            <div className="w-full h-full rounded-[22px] overflow-hidden relative">
              <img src={user?.profileImage} alt="" className="w-full h-full object-cover opacity-40 grayscale" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="bg-primary text-white rounded-xl p-1.5 shadow-2xl shadow-primary/40 border-2 border-[#141414]">
                 <Plus size={16} strokeWidth={4} />
               </div>
            </div>
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">You</span>
        </motion.div>

        {/* Following Stories */}
        <AnimatePresence>
          {groupedStories.map((group, idx) => (
            <motion.div 
              key={group.user._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center space-y-3 flex-shrink-0"
            >
              <button 
                onClick={() => setSelectedUserStories(group)}
                className="relative w-20 h-20 rounded-[28px] p-0.5 story-ring animate-flow transition-all"
              >
                <div className="w-full h-full rounded-[26px] border-[3px] border-[#0f0f0f] overflow-hidden bg-[#141414]">
                  <img src={group.user.profileImage} alt={group.user.username} className="w-full h-full object-cover" />
                </div>
              </button>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter truncate w-20 text-center italic">
                {group.user.username}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && [1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center space-y-3 flex-shrink-0 animate-pulse">
            <div className="w-20 h-20 rounded-[28px] bg-white/5" />
            <div className="w-12 h-2 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedUserStories && (
          <StoryViewer 
            userStories={selectedUserStories} 
            onClose={() => setSelectedUserStories(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateStory && (
          <CreateStorySheet 
            onClose={() => setShowCreateStory(false)} 
            onSuccess={() => {
              setShowCreateStory(false);
              fetchStories();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
