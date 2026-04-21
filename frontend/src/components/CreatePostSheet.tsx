'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, MapPin, Loader2, Sparkles, Plus, Image as ImageIcon, Video } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface CreatePostSheetProps {
  onClose: () => void;
  onSuccess: (newPost: any) => void;
}

export default function CreatePostSheet({ onClose, onSuccess }: CreatePostSheetProps) {
  const { token } = useAuth();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 10) {
      alert('Maximum 10 files allowed');
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    try {
      setLoading(true);
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('caption', caption);
      formData.append('location', location);

      const { data } = await axios.post('https://treandx.onrender.com/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      onSuccess(data);
      onClose();
    } catch (err) {
      console.error('Post creation failed', err);
      alert('Upload failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative w-full max-w-xl bg-[#0a0a0a] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all">
            <X size={20} />
          </button>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] italic">New Transmission</h2>
          <button 
            onClick={handleSubmit}
            disabled={loading || files.length === 0}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loading || files.length === 0 ? 'bg-white/5 text-white/20' : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'}`}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Broadcast'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* Media Selection */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Reality Capture</label>
                <span className="text-[9px] font-bold text-white/20">{files.length}/10</span>
             </div>
             
             <div className="flex overflow-x-auto space-x-3 pb-2 no-scrollbar">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="min-w-[120px] h-[160px] rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center space-y-2 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <Plus size={20} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tighter">Add Media</span>
                </button>

                {previews.map((url, idx) => (
                  <div key={idx} className="min-w-[120px] h-[160px] relative rounded-2xl overflow-hidden group">
                     <img src={url} alt="" className="w-full h-full object-cover" />
                     <button 
                       onClick={() => removeFile(idx)}
                       className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <X size={12} />
                     </button>
                  </div>
                ))}
             </div>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileChange} 
               multiple 
               accept="image/*,video/*" 
               className="hidden" 
             />
          </div>

          {/* Caption */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Signal Description</label>
             <textarea 
               value={caption}
               onChange={(e) => setCaption(e.target.value)}
               placeholder="Write your transmission coordinates... #hashtags @mentions"
               className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 min-h-[120px] focus:outline-none focus:border-primary/40 text-sm font-medium leading-relaxed placeholder:text-white/10"
             />
          </div>

          {/* Metadata */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Coordinates</label>
             <div className="relative">
                <MapPin size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Earth, Milky Way..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-primary/40 text-sm font-bold uppercase tracking-tight placeholder:text-white/10"
                />
             </div>
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center space-x-3">
             <Sparkles size={16} className="text-primary" />
             <p className="text-[10px] font-bold text-primary/80 italic">AI will automatically index your hashtags and mentions for maximum reach.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
