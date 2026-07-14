'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  FileText,
  Mic,
  Map,
  Briefcase,
  Users2,
  Radio,
  MessageCircle,
  Users,
  Sparkles,
  Hash,
  ArrowRight,
} from 'lucide-react';
import GradientHeader from '@/components/common/GradientHeader';

interface Community {
  slug: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  image: string;
  members: number;
  online: number;
  postsToday: number;
  category: string;
}

const COMMUNITIES: Community[] = [
  { slug: 'resume-review', name: 'Resume Review', description: 'ATS tips, templates, and peer reviews for your resume', icon: FileText, image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=200&fit=crop', members: 2840, online: 142, postsToday: 18, category: 'Career' },
  { slug: 'interview-prep', name: 'Interview Prep', description: 'Mock interviews, behavioral questions, and feedback', icon: Mic, image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop', members: 3210, online: 198, postsToday: 24, category: 'Career' },
  { slug: 'career-switch', name: 'Career Switch', description: 'Navigate your transition into a new field', icon: Map, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop', members: 1890, online: 95, postsToday: 12, category: 'Career' },
  { slug: 'portfolio-review', name: 'Portfolio Review', description: 'Showcase your work and get constructive feedback', icon: Briefcase, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop', members: 1560, online: 78, postsToday: 9, category: 'Skills' },
  { slug: 'networking', name: 'Networking', description: 'Connect with peers, mentors, and industry pros', icon: Users2, image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop', members: 2100, online: 112, postsToday: 15, category: 'Career' },
  { slug: 'job-search', name: 'Job Search', description: 'Strategies, referrals, and offer negotiation tips', icon: MessageSquare, image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop', members: 2670, online: 156, postsToday: 21, category: 'Career' },
  { slug: 'skill-development', name: 'Skill Development', description: 'Courses, certifications, and learning roadmaps', icon: Sparkles, image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=200&fit=crop', members: 1750, online: 88, postsToday: 11, category: 'Skills' },
  { slug: 'general-discussion', name: 'General Discussion', description: 'Open chat about tech, careers, and everything else', icon: MessageCircle, image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=200&fit=crop', members: 4320, online: 234, postsToday: 32, category: 'General' },
];

const CATEGORIES = ['All', 'Career', 'Skills', 'General'];

const UPCOMING_EVENTS = [
  { icon: Briefcase, iconBg: 'bg-[var(--accent)]/10', name: 'Portfolio Clinic', time: 'Thu · 6:00 PM', attendees: 45 },
  { icon: Users2, iconBg: 'bg-orange-100', name: 'Networking Hour', time: 'Fri · 5:30 PM', attendees: 62 },
  { icon: Radio, iconBg: 'bg-purple-100', name: 'AMA with Recruiters', time: 'Mon · 7:00 PM', attendees: 128 },
];

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? COMMUNITIES
    : COMMUNITIES.filter(c => c.category === activeCategory);

  const sorted = useMemo(() =>
    [...COMMUNITIES].sort((a, b) => b.members - a.members),
  []);

  const totalMembers = useMemo(() =>
    COMMUNITIES.reduce((s, c) => s + c.members, 0),
  []);

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto">
        <GradientHeader
          eyebrow="Community"
          title="Explore Communities"
          subtitle="Find your people, share your journey, grow together"
          showBack
        />

        <div className="px-5 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT: Community Grid ─────────────────────────────── */}
          <div className="lg:col-span-8 space-y-5 animate-fade-in-up">

            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-medium px-4 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Community cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((community) => {
                const Icon = community.icon;
                return (
                  <Link
                    href={`/community/${community.slug}`}
                    key={community.slug}
                    className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all cursor-pointer group block overflow-hidden"
                  >
                    <div className="h-28 overflow-hidden">
                      <img
                        src={community.image}
                        alt={community.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--surface)] shadow-sm border border-[var(--border)] flex items-center justify-center flex-shrink-0 -mt-8 relative z-10">
                          <Icon size={18} className="text-[var(--accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-[var(--text)]">r/{community.name.toLowerCase().replace(/\s+/g, '')}</h3>
                            <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded-full">{community.category}</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{community.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border)]">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {community.members.toLocaleString()} members
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          {community.online} online
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash size={12} />
                          {community.postsToday} today
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Sidebar ───────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-5 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>

            {/* Global Stats */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
              <h2 className="font-display text-base font-semibold mb-1">Your Community</h2>
              <p className="text-xs text-[var(--text-muted)] mb-4">Across all communities</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <p className="text-lg font-bold text-[var(--accent)]">{totalMembers.toLocaleString()}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Total members</p>
                </div>
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <p className="text-lg font-bold text-[var(--accent)]">{COMMUNITIES.length}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Communities</p>
                </div>
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <p className="text-lg font-bold text-[var(--accent)]">{COMMUNITIES.reduce((s, c) => s + c.postsToday, 0)}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Posts today</p>
                </div>
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                  <p className="text-lg font-bold text-[var(--accent)]">{COMMUNITIES.reduce((s, c) => s + c.online, 0)}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Online now</p>
                </div>
              </div>
            </div>

            {/* Top Communities */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
              <h2 className="font-display text-base font-semibold mb-1">Top Communities</h2>
              <p className="text-xs text-[var(--text-muted)] mb-4">Most active this month</p>
              <div className="space-y-2">
                {sorted.slice(0, 5).map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <Link
                      href={`/community/${c.slug}`}
                      key={c.slug}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg)] transition-colors"
                    >
                      <span className="w-6 text-center text-xs font-bold text-[var(--text-muted)]">{i + 1}</span>
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text)] truncate">{c.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{c.members.toLocaleString()} members</p>
                      </div>
                      <ArrowRight size={14} className="text-[var(--text-muted)]" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
              <h2 className="font-display text-base font-semibold mb-1">Upcoming Events</h2>
              <p className="text-xs text-[var(--text-muted)] mb-4">Live sessions and community meetups</p>
              <div className="space-y-3">
                {UPCOMING_EVENTS.map((event) => {
                  const Icon = event.icon;
                  return (
                    <div
                      key={event.name}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]"
                    >
                      <div className={`w-9 h-9 rounded-lg ${event.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} className="text-[var(--accent)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text)]">{event.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{event.time}</p>
                      </div>
                      <span className="text-[10px] font-medium text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-full">
                        {event.attendees} going
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
