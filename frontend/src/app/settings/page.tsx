'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Camera, ChevronLeft, Check, Loader2, Link as LinkIcon, Plus, X, User as UserIcon, Globe, Briefcase, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    links: user?.links || [],
    profileType: user?.profileType || 'personal',
    profileImage: user?.profileImage || '',
    isPrivate: user?.isPrivate || false,
  });

  const [newLink, setNewLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        links: user.links || [],
        profileType: user.profileType || 'personal',
        profileImage: user.profileImage || '',
        isPrivate: user.isPrivate || false,
      });
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      setUploading(true);
      const form = new FormData();
      form.append('image', e.target.files[0]);
      const { data } = await axios.post('https://treandx.onrender.com/upload/image', form);
      setFormData(prev => ({ ...prev, profileImage: data.url }));
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addLink = () => {
    if (!newLink || formData.links.length >= 3) return;
    setFormData(prev => ({ ...prev, links: [...prev.links, newLink] }));
    setNewLink('');
  };

  const removeLink = (idx: number) => {
    setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data } = await axios.patch('https://treandx.onrender.com/user/update', formData);
      updateUser(data);
      router.push(`/profile/${data.username}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-primary/30">
      <header className="sticky top-0 z-[100] px-6 py-5 flex items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-3xl">
         <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-2xl transition-all">
            <ChevronLeft size={24} />
         </button>
         <h1 className="text-lg font-black italic uppercase tracking-tight">Edit Profile</h1>
         <button 
           onClick={handleSave}
           disabled={loading}
           className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all disabled:opacity-50"
         >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
         </button>
      </header>

      <main className="max-w-xl mx-auto p-8 pb-40 space-y-12">
        
        {/* Profile Identity */}
        <section className="space-y-10">
           <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                 <div className="w-32 h-32 rounded-[40px] overflow-hidden p-1 bg-white/5 border border-white/10 group-hover:border-primary/40 transition-all duration-500">
                    <img src={formData.profileImage || '/placeholder.png'} alt="" className="w-full h-full object-cover rounded-[32px]" />
                 </div>
                 <label className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 transition-transform cursor-pointer border-4 border-[#080808] active:scale-95">
                    <Camera size={18} strokeWidth={3} />
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                 </label>
                 {uploading && (
                   <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-[40px] flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-primary" />
                   </div>
                 )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Click icon to switch identity</p>
           </div>

           <div className="grid gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Full Name</label>
                 <input 
                   type="text" 
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/50 text-sm font-bold uppercase italic tracking-tight"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Username</label>
                 <div className="relative">
                    <AtSign size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-primary/50 text-sm font-black lowercase tracking-tight"
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* Profile Tiers */}
        <section className="space-y-4">
           <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Profile Type</label>
           <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'personal', icon: UserIcon, label: 'Default' },
                { id: 'creator', icon: Sparkles, label: 'Creator' },
                { id: 'business', icon: Briefcase, label: 'Business' }
              ].map((type) => {
                const isActive = formData.profileType === type.id;
                const Icon = type.icon;
                return (
                  <button 
                    key={type.id}
                    onClick={() => setFormData({...formData, profileType: type.id})}
                    className={`flex flex-col items-center justify-center p-4 rounded-[24px] border transition-all space-y-2 ${isActive ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                     <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                     <span className="text-[8px] font-black uppercase tracking-widest">{type.label}</span>
                  </button>
                );
              })}
           </div>
        </section>

        {/* External Links */}
        <section className="space-y-4">
           <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Digital Links (Max 3)</label>
           <div className="space-y-3">
              {formData.links.map((link, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                   <LinkIcon size={14} className="text-primary/60" />
                   <span className="flex-1 text-xs font-bold truncate opacity-60 italic">{link}</span>
                   <button onClick={() => removeLink(idx)} className="p-1 hover:text-primary transition-colors">
                      <X size={14} />
                   </button>
                </div>
              ))}
              {formData.links.length < 3 && (
                <div className="flex items-center space-x-3 bg-white/5 p-2 rounded-2xl border border-white/5 focus-within:border-primary/50 transition-all">
                   <div className="p-2 bg-white/5 rounded-xl">
                      <Globe size={14} className="text-white/20" />
                   </div>
                   <input 
                     type="text" 
                     placeholder="https://yourlink.com"
                     value={newLink}
                     onChange={(e) => setNewLink(e.target.value)}
                     className="flex-1 bg-transparent border-none focus:outline-none text-xs font-bold"
                   />
                   <button onClick={addLink} className="p-3 bg-white/10 rounded-xl hover:bg-primary hover:text-white transition-all active:scale-90">
                      <Plus size={16} strokeWidth={3} />
                   </button>
                </div>
              )}
           </div>
        </section>

        {/* Privacy Toggle */}
        <section className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-4">Privacy</label>
            <div 
              className="p-5 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all"
              onClick={() => setFormData({...formData, isPrivate: !formData.isPrivate})}
            >
               <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${formData.isPrivate ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/10 text-white/20'}`}>
                     <Sparkles size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest">Private Account</p>
                     <p className="text-[9px] font-medium text-white/40 leading-none mt-1">Only followers can see your content.</p>
                  </div>
               </div>
               <div className={`w-10 h-5 rounded-full transition-all relative ${formData.isPrivate ? 'bg-primary/30' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${formData.isPrivate ? 'right-1 bg-primary' : 'left-1 bg-white/40'}`} />
               </div>
            </div>
        </section>

        <section className="p-5 rounded-[24px] bg-white/5 border border-white/5 flex items-center space-x-4 group cursor-pointer hover:border-primary/20 transition-all">
           <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <Zap size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Verify Profile</p>
              <p className="text-[9px] font-medium text-white/40">Apply for the gold verification badge.</p>
           </div>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}

function AtSign({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}
