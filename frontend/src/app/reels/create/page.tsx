'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, Loader2, Music, Upload, Video, X, Zap, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CreateReelPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [audios, setAudios] = useState<any[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAudios = async () => {
      const { data } = await axios.get('https://treandx.onrender.com/reels/audio');
      setAudios(data);
    };
    fetchAudios();
  }, []);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('Video file is too large (max 50MB)');
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleUpload = async () => {
    if (!videoFile || loading) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('caption', caption);
    if (selectedAudio) formData.append('audioId', selectedAudio);

    try {
      await axios.post('https://treandx.onrender.com/reels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      router.push('/reels');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-primary/30">
      <header className="sticky top-0 z-[100] px-6 py-4 flex items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-3xl">
         <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-2xl transition-all">
            <ChevronLeft size={24} />
         </button>
         <h1 className="text-sm font-black italic uppercase tracking-[0.2em]">Craft Reel</h1>
         <button 
           onClick={handleUpload}
           disabled={!videoFile || loading}
           className="px-6 py-2 bg-primary rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-20"
         >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Publish'}
         </button>
      </header>

      <main className="max-w-xl mx-auto p-8 space-y-10">
         {/* Video Preview / Upload area */}
         <div className="relative aspect-[9/16] bg-white/5 rounded-[40px] border-2 border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center group">
            {videoPreview ? (
              <video 
                src={videoPreview} 
                className="w-full h-full object-cover" 
                controls 
              />
            ) : (
              <div className="text-center p-12 space-y-6">
                 <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto">
                    <Video size={32} />
                 </div>
                 <div>
                    <h3 className="font-black italic text-lg uppercase">Broadcast Signal</h3>
                    <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.1em] mt-2 leading-relaxed">
                      Sync your raw data matrix. Short-form dynamics only.
                    </p>
                 </div>
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                 >
                    Inject MP4 / MOV
                 </button>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="video/*" 
              onChange={handleVideoSelect} 
            />
            
            {videoPreview && (
              <button 
                onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                className="absolute top-6 right-6 p-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-red-500/80 transition-all"
              >
                 <X size={20} />
              </button>
            )}
         </div>

         {/* Meta Data */}
         <div className="space-y-8">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-4 italic">Signal Caption</label>
               <textarea 
                 value={caption}
                 onChange={(e) => setCaption(e.target.value)}
                 placeholder="Embed your thought matrix..."
                 className="w-full h-32 bg-white/5 border border-white/10 rounded-[32px] p-6 text-sm font-medium outline-none focus:border-primary/40 focus:bg-white/10 transition-all resize-none placeholder:text-white/10"
               />
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between px-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Audio Matrix</label>
                  {selectedAudio && (
                    <button onClick={() => setSelectedAudio(null)} className="text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-white">Reset Signal</button>
                  )}
               </div>
               <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
                  {audios.map((audio) => {
                    const isActive = selectedAudio === audio._id;
                    return (
                      <button 
                        key={audio._id}
                        onClick={() => setSelectedAudio(audio._id)}
                        className={`shrink-0 flex flex-col items-center p-4 rounded-3xl border transition-all space-y-3 ${isActive ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                      >
                         <div className={`p-3 rounded-2xl ${isActive ? 'bg-primary text-white' : 'bg-white/5 text-white/20'}`}>
                            <Music size={18} />
                         </div>
                         <div className="text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest max-w-[80px] truncate">{audio.title}</p>
                            <p className="text-[7px] font-bold text-white/20 italic">{audio.artist}</p>
                         </div>
                      </button>
                    );
                  })}
                  <div className="shrink-0 w-32 flex flex-col items-center justify-center p-4 rounded-3xl border border-dashed border-white/10 opacity-30 hover:opacity-100 transition-all cursor-pointer">
                     <Plus size={20} />
                     <p className="text-[8px] font-black uppercase tracking-[0.1em] mt-2">Add Sound</p>
                  </div>
               </div>
            </div>
         </div>

         {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3">
               <Zap size={16} className="text-red-400" />
               <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{error}</p>
            </div>
         )}
      </main>
    </div>
  );
}
