'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, BarChart3, Map, Users, Clock, LayoutDashboard, User, Mail, LogIn, Briefcase, Mic } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const TABS = [
  { href: '/', label: 'Home', icon: FileText },
  { href: '/scores', label: 'Scores', icon: BarChart3 },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/contact', label: 'Contact', icon: Mail },
  { href: '/cover-letter', label: 'Cover Letter', icon: FileText },
  { href: '/interview-prep', label: 'Interview', icon: Mic },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = user ? TABS : [...TABS, { href: '/login', label: 'Sign In', icon: LogIn }];

  return (
    <nav aria-label="Main navigation" className="bottom-nav fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] z-50">
      <div className="flex items-center justify-around overflow-x-auto px-1 py-0.5">
        {items.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-0 px-1.5 py-0.5 rounded-lg transition-colors flex-shrink-0 ${
                isActive ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon size={13} />
              <span className="text-[7px] font-medium whitespace-nowrap leading-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}