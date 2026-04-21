'use client';

import { useState, useRef } from 'react';
import { X, Camera, Image as ImageIcon, Check, Loader2, Sparkles, Wand2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateStorySheetProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStorySheet({ onClose, onSuccess }: CreateStorySheetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'treandx_stories'); // Should match your Cloudinary preset

      // 1. Upload to Cloudinary
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        formData
      );

      // 2. Save in DB
      await axios.post('https://treandx.onrender.com/stories', {
        mediaUrl: res.data.secure_url,
        type: file.type.startsWith('video') ? 'video' : 'image',
        caption,
      });

      onSuccess();
    } catch (err) {
      console.error('Failed to post story', err);
      alert('Upload failed. Check Cloudinary settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-lg glass border border-white/10 rounded-[48px] overflow-hidden flex flex-col min-h-[600px]"
      >
        <div className="p-8 flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/20 text-primary rounded-2xl">
                 <Sparkles size={24} />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">Share Moment</h2>
           </div>
           <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
              <X size={28} />
           </button>
        </div>

        <div className="flex-1 p-8 flex flex-col justify-center items-center">
           {!preview ? (
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="w-full aspect-[3/4] rounded-[40px] border-4 border-dashed border-white/5 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-white/5 transition-all group"
             >
                <div className="p-6 bg-white/5 rounded-full text-white/20 group-hover:text-primary transition-colors">
                   <Camera size={48} />
                </div>
                <p className="font-bold text-white/20 uppercase tracking-widest text-xs">Tap to Capture / Upload</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*,video/*"
                  className="hidden" 
                />
             </div>
           ) : (
             <div className="w-full space-y-6">
                <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden border border-white/10 ring-8 ring-white/5">
                   {file?.type.startsWith('video') ? (
                     <video src={preview} className="w-full h-full object-cover" autoPlay muted loop />
                   ) : (
                     <img src={preview} alt="" className="w-full h-full object-cover" />
                   )}
                   <button 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white"
                   >
                     <X size={20} />
                   </button>
                </div>

                <div className="relative">
                  <Wand2 size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" />
                  <input 
                    type="text"
                    placeholder="Add a vibe caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-5 pl-14 pr-6 text-white font-bold italic focus:border-primary/50 focus:outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="w-full py-5 bg-primary hover:bg-rose-600 text-white rounded-3xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/30 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <span>Post to Stories</span>
                      <Check size={20} />
                    </>
                  )}
                </button>
             </div>
           )}
        </div>
      </motion.div>
    </div>
  );
}
