'use client';

import { ExternalLink, Megaphone, Info } from 'lucide-react';
import Image from 'next/image';

interface AdProps {
  ad: {
    title: string;
    content: string;
    imageUrl?: string;
    link: string;
  };
}

export default function AdCard({ ad }: AdProps) {
  return (
    <div className="glass rounded-[40px] border border-primary/20 bg-primary/5 overflow-hidden mb-6 relative group">
      <div className="absolute top-4 right-6 px-2 py-0.5 bg-background/50 backdrop-blur-md rounded-full border border-white/10 flex items-center space-x-1 z-10">
         <span className="text-[8px] font-black tracking-widest uppercase text-white/60">Sponsored</span>
         <Info size={8} className="text-white/40" />
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center space-x-4">
           <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
             <Megaphone size={20} />
           </div>
           <div>
              <h3 className="font-black italic tracking-tight uppercase text-primary">Promoted Content</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Brand Partner</p>
           </div>
        </div>

        <div className="space-y-4">
           {ad.imageUrl && (
             <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-white/5">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
             </div>
           )}
           
           <div className="space-y-2">
              <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-tight">{ad.title}</h4>
              <p className="text-sm text-muted-foreground leading-extended font-medium">{ad.content}</p>
           </div>

           <button
             onClick={() => ad.link && window.open(ad.link, '_blank')}
             className="w-full py-4 bg-white text-black hover:bg-primary hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 shadow-xl active:scale-95"
           >
             <span>Learn More</span>
             <ExternalLink size={16} />
           </button>
        </div>
      </div>
    </div>
  );
}
