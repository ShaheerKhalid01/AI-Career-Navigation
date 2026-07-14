'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, BarChart3, Map, Users, Clock, LayoutDashboard, User, Mail, LogOut, Briefcase, Mic } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const LINKS = [
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

export default function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-[var(--border)] z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-10 px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-sm font-bold text-[var(--accent)] flex-shrink-0">
            CareerNav
          </Link>
          <nav className="flex items-center gap-0.5">
            {LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                    isActive ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]'
                  }`}
                >
                  <Icon size={12} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-muted)] hidden xl:block">{user.name}</span>
              <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-[var(--accent)]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button onClick={logout} className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-[11px] font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-dim)] px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
