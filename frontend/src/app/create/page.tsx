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
  const [headline, setHeadline] = useState('');
  const [isGeneratingHeadline, setIsGeneratingHeadline] = useState(false);
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

  const handleGenerateHeadline = async () => {
    if (!content.trim()) return;
    
    setIsGeneratingHeadline(true);
    setError('');
    
    try {
      const { data } = await axios.post('https://treandx.onrender.com/ai/headline', { content });
      setHeadline(data.headline);
    } catch (err: any) {
      console.error('Failed to generate headline', err);
      setError('AI service unavailable. Please write a headline manually.');
    } finally {
      setIsGeneratingHeadline(false);
    }
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
        const uploadRes = await axios.post('https://treandx.onrender.com/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.url;
      }

      // 2. Create Post
      await axios.post('https://treandx.onrender.com/post/create', {
        content,
        category,
        imageUrl,
        headline,
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
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 1000))}
              placeholder="What's happening in your local area?"
              className="w-full bg-transparent border-none outline-none text-xl resize-none placeholder:text-muted-foreground/30 h-40"
              disabled={loading}
            />
            <div className="absolute bottom-2 right-2 text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
              {content.length}/1000
            </div>
          </div>

          {/* AI Headline Generator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Type size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Headline</span>
              </div>
              <button
                onClick={handleGenerateHeadline}
                disabled={!content.trim() || isGeneratingHeadline}
                className="flex items-center space-x-1.5 text-[10px] font-bold text-primary hover:text-primary/80 disabled:opacity-30 transition-all uppercase tracking-tighter"
              >
                {isGeneratingHeadline ? (
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3 h-3 fill-primary" viewBox="0 0 24 24">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                  </svg>
                )}
                <span>Generate Smart Headline</span>
              </button>
            </div>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Enter a catchy headline or use AI..."
              className="w-full bg-white/5 border border-border rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-all"
            />
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
