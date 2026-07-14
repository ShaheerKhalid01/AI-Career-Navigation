'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, Heart, MessageCircle, Share2, Users, Hash, Sparkles, FileText, Mic, Map, Briefcase, Users2, MessageSquare, ExternalLink, Globe2, Plus, ChevronDown, ChevronUp, Reply, CalendarDays } from 'lucide-react';
import { getExternalCommunities } from '@/lib/externalCommunities';

interface Post {
  _id: string;
  authorName: string;
  message: string;
  readinessScore?: number;
  createdAt: string;
}

interface MappedPost {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  body: string;
  likes: number;
}

interface Comment {
  id: string;
  author: string;
  body: string;
  timeAgo: string;
  createdAt: number;
}

const COMMUNITY_INFO: Record<string, { name: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }>; image: string; members: number; online: number }> = {
  'resume-review': { name: 'Resume Review', description: 'ATS tips, templates, and peer reviews for your resume', icon: FileText, image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=300&fit=crop', members: 2840, online: 142 },
  'interview-prep': { name: 'Interview Prep', description: 'Mock interviews, behavioral questions, and feedback', icon: Mic, image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=300&fit=crop', members: 3210, online: 198 },
  'career-switch': { name: 'Career Switch', description: 'Navigate your transition into a new field', icon: Map, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop', members: 1890, online: 95 },
  'portfolio-review': { name: 'Portfolio Review', description: 'Showcase your work and get constructive feedback', icon: Briefcase, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=300&fit=crop', members: 1560, online: 78 },
  'networking': { name: 'Networking', description: 'Connect with peers, mentors, and industry pros', icon: Users2, image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=300&fit=crop', members: 2100, online: 112 },
  'job-search': { name: 'Job Search', description: 'Strategies, referrals, and offer negotiation tips', icon: MessageSquare, image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=300&fit=crop', members: 2670, online: 156 },
  'skill-development': { name: 'Skill Development', description: 'Courses, certifications, and learning roadmaps', icon: Sparkles, image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&h=300&fit=crop', members: 1750, online: 88 },
  'general-discussion': { name: 'General Discussion', description: 'Open chat about tech, careers, and everything else', icon: MessageCircle, image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=300&fit=crop', members: 4320, online: 234 },
};

const PLATFORM_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Reddit: MessageCircle,
  LinkedIn: Users2,
  Discord: MessageSquare,
  Forum: MessageSquare,
  Tool: Sparkles,
  Practice: Mic,
  Portfolio: Briefcase,
  Jobs: Briefcase,
  Learning: FileText,
  Events: CalendarDays,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getCommentsKey(role: string, postId: string): string {
  return `community_comments_${role}_${postId}`;
}

function loadComments(role: string, postId: string): Comment[] {
  try {
    const raw = localStorage.getItem(getCommentsKey(role, postId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveComments(role: string, postId: string, comments: Comment[]) {
  localStorage.setItem(getCommentsKey(role, postId), JSON.stringify(comments));
}

function getDisplayName(): string {
  return localStorage.getItem('navigatorDisplayName') || localStorage.getItem('userName') || 'Anonymous User';
}

export default function CommunityRoomPage() {
  const params = useParams();
  const router = useRouter();
  const role = params.role as string;
  const info = COMMUNITY_INFO[role];
  const externalCommunities = getExternalCommunities(role);

  const [posts, setPosts] = useState<Post[]>([]);
  const [mappedPosts, setMappedPosts] = useState<MappedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community?role=${role}`);
      const json = await res.json();
      const fetched = json.posts || [];
      setPosts(fetched);
      setMappedPosts(fetched.map((p: Post, i: number) => ({
        id: p._id || String(i),
        title: p.message?.substring(0, 80) || 'Discussion',
        author: p.authorName || 'Anonymous',
        timeAgo: p.createdAt ? timeAgo(p.createdAt) : 'recent',
        body: p.message || '',
        likes: p.readinessScore || 0,
      })));
    } catch {
      setError('Could not load discussions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [role]);

  useEffect(() => {
    setCommentAuthor(getDisplayName());
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) {
      setError('Please enter your name and a message.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: name, message, targetRole: role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to post');
      setMessage('');
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const nextLiked = !prev[id];
      setMappedPosts(prevPosts =>
        prevPosts.map(p => p.id === id ? { ...p, likes: p.likes + (nextLiked ? 1 : -1) } : p)
      );
      return { ...prev, [id]: nextLiked };
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  const toggleExpand = useCallback((postId: string) => {
    setExpandedPost(prev => {
      const next = prev === postId ? null : postId;
      if (next && !comments[next]) {
        const loaded = loadComments(role, next);
        setComments(c => ({ ...c, [next]: loaded }));
      }
      return next;
    });
  }, [role, comments]);

  const handleAddComment = useCallback((postId: string) => {
    if (!commentText.trim() || !commentAuthor.trim()) return;
    const newComment: Comment = {
      id: String(Date.now()),
      author: commentAuthor.trim(),
      body: commentText.trim(),
      timeAgo: 'just now',
      createdAt: Date.now(),
    };
    const updated = [...(comments[postId] || []), newComment];
    setComments(c => ({ ...c, [postId]: updated }));
    saveComments(role, postId, updated);
    setCommentText('');
  }, [commentText, commentAuthor, comments, role]);

  const displayName = useMemo(() => info?.name || role.replace(/-/g, ' '), [role, info]);
  const Icon = info?.icon || MessageCircle;

  if (!info) {
    return (
      <main className="min-h-screen bg-[var(--bg)] px-4 py-10">
        <div className="max-w-2xl mx-auto text-center">
          <button onClick={() => router.push('/community')} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-6 transition-colors">
            <ArrowLeft size={16} /> All Communities
          </button>
          <p className="text-[var(--text-muted)]">Community not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/community')}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          All Communities
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── MAIN ────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Community Header */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="h-36 overflow-hidden">
                <img src={info.image} alt={displayName} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4 -mt-12 relative z-10 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] shadow-md border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                    <Icon size={24} className="text-[var(--accent)]" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h1 className="font-display text-xl font-semibold text-[var(--text)]">r/{displayName.toLowerCase().replace(/\s+/g, '')}</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">{info.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1"><Users size={13} /> {info.members.toLocaleString()} members</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {info.online} online</span>
                </div>
              </div>
            </div>

            {/* ── EXTERNAL COMMUNITIES ──────────────────────────── */}
            {externalCommunities.length > 0 && (
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Globe2 size={16} className="text-[var(--accent)]" />
                  <h2 className="font-display text-base font-semibold text-[var(--text)]">Explore External Communities</h2>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-5">Join real discussions with thousands of people on these platforms</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {externalCommunities.map((c) => {
                    const PlatformIcon = PLATFORM_ICONS[c.platform] || Globe2;
                    return (
                      <a
                        key={c.url}
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] hover:shadow-md transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <PlatformIcon size={18} className="text-[var(--accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{c.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{c.platform}</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium text-white bg-[var(--accent)] px-3 py-1.5 rounded-lg group-hover:bg-[var(--accent-dim)] transition-colors whitespace-nowrap">
                          Visit <ExternalLink size={12} />
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── INTERNAL POSTS ────────────────────────────────── */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-base font-semibold text-[var(--text)]">Community Posts</h2>
                  <p className="text-xs text-[var(--text-muted)]">Discuss with other users here</p>
                </div>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-dim)] text-white text-xs font-medium px-4 py-2 rounded-full transition-colors"
                >
                  <Plus size={14} />
                  {showForm ? 'Cancel' : 'New Post'}
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleSubmit} className="bg-[var(--bg)] rounded-xl border border-[var(--border)] p-4 space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                  />
                  <textarea
                    placeholder="Share your thoughts..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs outline-none focus:border-[var(--accent)] resize-none"
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-[var(--accent)] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[var(--accent-dim)] disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                    Post
                  </button>
                </form>
              )}

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
                </div>
              ) : mappedPosts.length === 0 ? (
                <div className="text-center py-10 text-[var(--text-muted)]">
                  <MessageCircle className="mx-auto mb-2" size={28} />
                  <p className="text-sm">No discussions yet</p>
                  <p className="text-xs mt-1">Be the first to post!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mappedPosts.map((post) => {
                    const postComments = comments[post.id] || [];
                    const isExpanded = expandedPost === post.id;

                    return (
                      <div key={post.id} className="bg-[var(--bg)] rounded-xl border border-[var(--border)] overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-7 h-7 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[var(--accent)]">
                              {post.author.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[var(--text)]">{post.title}</p>
                              <p className="text-[11px] text-[var(--text-muted)]">{post.author} · {post.timeAgo}</p>
                            </div>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 pl-10">{post.body}</p>
                          <div className="flex items-center gap-4 pl-10 text-[var(--text-muted)]">
                            <button
                              onClick={() => toggleLike(post.id)}
                              className={`flex items-center gap-1 text-xs ${liked[post.id] ? 'text-red-500' : 'hover:text-[var(--accent)]'} transition-colors`}
                            >
                              <Heart size={13} fill={liked[post.id] ? 'currentColor' : 'none'} />
                              {post.likes}
                            </button>
                            <button
                              onClick={() => toggleExpand(post.id)}
                              className={`flex items-center gap-1 text-xs transition-colors ${isExpanded ? 'text-[var(--accent)]' : 'hover:text-[var(--accent)]'}`}
                            >
                              <MessageCircle size={13} />
                              {postComments.length}
                            </button>
                            <button onClick={handleShare} className="flex items-center gap-1 text-xs hover:text-[var(--accent)] transition-colors">
                              <Share2 size={13} /> Share
                            </button>
                            <button
                              onClick={() => toggleExpand(post.id)}
                              className="flex items-center gap-1 text-xs hover:text-[var(--accent)] transition-colors ml-auto"
                            >
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              {isExpanded ? 'Hide' : 'Reply'}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-[var(--border)]">
                            {postComments.length > 0 && (
                              <div className="divide-y divide-[var(--border)]">
                                {postComments.map((c) => (
                                  <div key={c.id} className="px-4 py-2.5 pl-12">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-medium text-[var(--text)]">{c.author}</span>
                                      <span className="text-[10px] text-[var(--text-muted)]">{c.timeAgo}</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)]">{c.body}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="px-4 py-3 border-t border-[var(--border)]">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Name"
                                  value={commentAuthor}
                                  onChange={(e) => setCommentAuthor(e.target.value)}
                                  maxLength={30}
                                  className="w-20 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                                />
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                                  maxLength={500}
                                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                                />
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  disabled={!commentText.trim() || !commentAuthor.trim()}
                                  className="flex items-center gap-1 bg-[var(--accent)] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--accent-dim)] disabled:opacity-50 transition-colors"
                                >
                                  <Reply size={11} /> Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── SIDEBAR ─────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">

            {/* About */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
              <h2 className="font-display text-base font-semibold mb-3">About Community</h2>
              <p className="text-xs text-[var(--text-muted)] mb-4">{info.description}</p>
              <div className="space-y-2 text-xs text-[var(--text-muted)]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Users size={13} /> Members</span>
                  <span className="font-semibold text-[var(--text)]">{info.members.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online</span>
                  <span className="font-semibold text-[var(--text)]">{info.online}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Hash size={13} /> Posts</span>
                  <span className="font-semibold text-[var(--text)]">{mappedPosts.length}</span>
                </div>
              </div>
            </div>

            {/* Active Now */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
              <h2 className="font-display text-base font-semibold mb-3">Active Now</h2>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const recentUsers = new Set<string>();
                  Object.entries(comments).forEach(([, cmts]) => {
                    cmts.forEach(c => { if (Date.now() - c.createdAt < 3600000) recentUsers.add(c.author); });
                  });
                  mappedPosts.forEach(p => recentUsers.add(p.author));
                  const users = Array.from(recentUsers).slice(0, 8);
                  return users.length > 0 ? users.map((u) => (
                    <div key={u} className="flex items-center gap-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-full px-3 py-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-[11px] text-[var(--text)]">{u}</span>
                    </div>
                  )) : <p className="text-xs text-[var(--text-muted)]">No one active yet</p>;
                })()}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
              <h2 className="font-display text-base font-semibold mb-3">Quick Resources</h2>
              <div className="space-y-2">
                {externalCommunities.slice(0, 3).map((c) => (
                  <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between text-xs px-3 py-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
                  >
                    <span className="text-[var(--text)]">{c.name}</span>
                    <ExternalLink size={11} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
              <h2 className="font-display text-base font-semibold mb-3">Community Rules</h2>
              <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                <li className="flex items-start gap-2"><span className="text-[var(--accent)] mt-0.5">1.</span> Be respectful</li>
                <li className="flex items-start gap-2"><span className="text-[var(--accent)] mt-0.5">2.</span> No spam</li>
                <li className="flex items-start gap-2"><span className="text-[var(--accent)] mt-0.5">3.</span> Stay on topic</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
