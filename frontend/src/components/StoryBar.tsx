'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
      const { data } = await axios.get('http://localhost:3001/stories/following');
      setGroupedStories(data);
    } catch (err) {
      console.error('Failed to fetch stories', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 pl-4">
      <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar pb-2">
        {/* Create Story Button */}
        <div className="flex flex-col items-center space-y-2 flex-shrink-0">
          <button 
            onClick={() => setShowCreateStory(true)}
            className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-white/20 flex items-center justify-center group hover:border-primary transition-all"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden relative">
              <img src={user?.profileImage} alt="" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 border-2 border-background shadow-lg group-hover:scale-110 transition-transform">
              <Plus size={12} strokeWidth={4} />
            </div>
          </button>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">You</span>
        </div>

        {/* Following Stories */}
        {groupedStories.map((group) => (
          <div key={group.user._id} className="flex flex-col items-center space-y-2 flex-shrink-0">
            <button 
              onClick={() => setSelectedUserStories(group)}
              className="relative w-16 h-16 rounded-full p-[2.5px] animated-story-border hover:scale-105 transition-all"
            >
              <div className="w-full h-full rounded-full border-2 border-background overflow-hidden">
                <img src={group.user.profileImage} alt={group.user.username} className="w-full h-full object-cover" />
              </div>
            </button>
            <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter truncate w-16 text-center italic">
              {group.user.username}
            </span>
          </div>
        ))}

        {loading && [1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center space-y-2 flex-shrink-0 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-white/5" />
            <div className="w-12 h-2 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {selectedUserStories && (
        <StoryViewer 
          userStories={selectedUserStories} 
          onClose={() => setSelectedUserStories(null)} 
        />
      )}

      {showCreateStory && (
        <CreateStorySheet 
          onClose={() => setShowCreateStory(false)} 
          onSuccess={() => {
            setShowCreateStory(false);
            fetchStories();
          }}
        />
      )}

      <style jsx>{`
        .animated-story-border {
          background: linear-gradient(45deg, #E11D48, #FB7185, #F43F5E);
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
