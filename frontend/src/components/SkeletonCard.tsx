'use client';

export default function SkeletonCard() {
  return (
    <div className="glass rounded-3xl p-6 space-y-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-secondary rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-secondary rounded w-1/4" />
          <div className="h-3 bg-secondary rounded w-1/6" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-secondary rounded w-full" />
        <div className="h-4 bg-secondary rounded w-5/6" />
      </div>
      <div className="h-48 bg-secondary rounded-2xl w-full" />
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="w-10 h-10 bg-secondary rounded-full" />
          <div className="w-10 h-10 bg-secondary rounded-full" />
        </div>
        <div className="w-10 h-10 bg-secondary rounded-full" />
      </div>
    </div>
  );
}
