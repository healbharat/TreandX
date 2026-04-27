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
    <div className="mb-6 pt-2 h-28 border-b border-white/5">
      <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar px-4">
        {/* Create Story Button */}
        <motion.div 
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center space-y-1.5 flex-shrink-0"
        >
          <button 
            onClick={() => setShowCreateStory(true)}
            className="relative w-16 h-16 rounded-full p-0.5 bg-white/5 flex items-center justify-center transition-all"
          >
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <img src={user?.profileImage} alt="" className="w-full h-full object-cover grayscale opacity-50" />
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-black">
              <Plus size={14} strokeWidth={4} />
            </div>
          </button>
          <span className="text-[11px] font-medium text-white/40">Your story</span>
        </motion.div>

        {/* Following Stories */}
        <AnimatePresence>
          {groupedStories.map((group, idx) => (
            <motion.div 
              key={group.user._id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center space-y-1.5 flex-shrink-0"
            >
              <button 
                onClick={() => setSelectedUserStories(group)}
                className="relative w-16 h-16 rounded-full p-0.5 story-ring"
              >
                <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-muted">
                  <img src={group.user.profileImage} alt={group.user.username} className="w-full h-full object-cover" />
                </div>
              </button>
              <span className="text-[11px] font-medium text-white/60 truncate w-16 text-center">
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
