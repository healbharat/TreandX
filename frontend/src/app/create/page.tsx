'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, X, Send, ChevronLeft, Type, Hash, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['Local', 'Politics', 'Sports', 'Emergency'];

export default function CreatePostPage() {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Local');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handlePost = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      let imageUrl = '';

      // 1. Upload image if exists
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        const uploadRes = await axios.post('http://localhost:3001/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.url;
      }

      // 2. Create Post
      await axios.post('http://localhost:3001/post/create', {
        content,
        category,
        imageUrl,
      });

      router.push('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish post. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col h-screen animate-in">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-muted-foreground hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold">Create News</h2>
        <button 
          onClick={handlePost}
          disabled={loading || !content.trim()}
          className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all flex items-center space-x-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Post</span>
              <Send size={16} />
            </>
          )}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* User Info */}
        <div className="flex items-center space-x-3 opacity-70">
          <div className="w-10 h-10 rounded-full border border-border overflow-hidden">
            <img src={user.profileImage} alt="Me" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold">{user.name}</p>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Publishing as @{user.username}</p>
          </div>
        </div>

        {/* Content Input */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 280))}
            placeholder="What's happening in your local area?"
            className="w-full bg-transparent border-none outline-none text-xl resize-none placeholder:text-muted-foreground/30 h-40"
            disabled={loading}
          />
          <div className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
            {content.length}/280
          </div>
        </div>

        {/* Category Selector */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Hash size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  category === cat 
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-secondary border-border text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Image Preview / Upload */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Camera size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Media</span>
          </div>
          
          {!preview ? (
            <label className="flex flex-col items-center justify-center w-full h-48 glass rounded-3xl border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera size={32} className="text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                <p className="text-sm text-muted-foreground">Add high-quality photos</p>
                <p className="text-[10px] text-muted-foreground opacity-50 mt-1">Maximum size 2MB</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          ) : (
            <div className="relative rounded-3xl overflow-hidden border border-border group">
              <img src={preview} alt="Preview" className="w-full aspect-video object-cover" />
              <button 
                onClick={removeImage}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-rose-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-destructive bg-destructive/10 p-4 rounded-2xl animate-pulse">
            <ShieldAlert size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-center text-muted-foreground pb-8 px-12">
        Maintain community guidelines. TreandX moderates all news content for safety.
      </p>
    </div>
  );
}
