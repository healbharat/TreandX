'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldCheck, Users, FileText, AlertTriangle, LayoutDashboard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/home');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: FileText, label: 'Posts', href: '/admin/posts' },
    { icon: AlertTriangle, label: 'Reports', href: '/admin/reports' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-secondary/20 p-6 space-y-8 sticky top-0 h-screen">
        <div className="flex items-center space-x-3 text-primary">
          <ShieldCheck size={32} />
          <span className="font-black text-xl tracking-tighter uppercase">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                pathname === item.href
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <Link 
          href="/home"
          className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-bold text-sm">Back to App</span>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 pb-32 md:pb-10 overflow-y-auto">
        {/* Header - Mobile */}
        <div className="md:hidden flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 text-primary">
            <ShieldCheck size={28} />
            <span className="font-black text-lg tracking-tight uppercase">Admin</span>
          </div>
          <Link href="/home" className="p-2 bg-white/5 rounded-full">
            <ArrowLeft size={20} />
          </Link>
        </div>
        
        {children}
      </main>

      {/* Navigation - Mobile Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 flex justify-around items-center p-4 rounded-t-3xl shadow-2xl">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`p-3 rounded-2xl transition-all ${
              pathname === item.href
                ? 'bg-primary text-white shadow-lg'
                : 'text-muted-foreground'
            }`}
          >
            <item.icon size={24} />
          </Link>
        ))}
      </nav>
    </div>
  );
}
