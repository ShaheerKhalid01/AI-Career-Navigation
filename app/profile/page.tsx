'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import {
  User,
  Pencil,
  Trophy,
  Settings2,
  Sparkles,
  CheckCircle2,
  Target,
  Award,
} from 'lucide-react';
import GradientHeader from '@/components/common/GradientHeader';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';

interface ProfileData {
  fullName: string;
  email: string;
  location: string;
  role: string;
  bio: string;
}

interface AchievementStat {
  value: string;
  label: string;
}

interface Preference {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

interface RecentActivityItem {
  icon: typeof CheckCircle2;
  iconBg: string;
  title: string;
  detail: string;
}

interface HistoryItem {
  roadmapId: string;
  targetRole: string;
  readinessScore: number;
  date: string;
}

const PREFERENCES: Preference[] = [
  { id: 'email-notifications', label: 'Email notifications', description: 'Receive weekly progress updates', defaultOn: true },
  { id: 'dark-mode', label: 'Dark mode', description: 'Use system appearance', defaultOn: false },
  { id: 'career-alerts', label: 'Career alerts', description: 'Get matched opportunities', defaultOn: true },
];

export default function ProfilePage() {
  const { user, token } = useAuth();
  const { setDarkMode } = useTheme();

  function getProfile() {
    if (typeof window === 'undefined') return { fullName: '', email: '', location: '', role: '', bio: '' };
    return {
      fullName: user?.name || localStorage.getItem('navigatorDisplayName') || 'User',
      email: user?.email || localStorage.getItem('navigatorDisplayEmail') || '',
      location: localStorage.getItem('navigatorDisplayLocation') || '',
      role: localStorage.getItem('navigatorDisplayRole') || '',
      bio: localStorage.getItem('navigatorDisplayBio') || '',
    };
  }

  const [profile, setProfile] = useState<ProfileData>(getProfile);

  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    // 1. Load preferences
    const savedToggles: Record<string, boolean> = {};
    PREFERENCES.forEach((p) => {
      const stored = localStorage.getItem(`pref-${p.id}`);
      savedToggles[p.id] = stored !== null ? stored === 'true' : p.defaultOn;
    });
    setToggles(savedToggles);

    // 2. Load profile — fetch from API if logged in, else localStorage
    async function loadProfile() {
      if (token) {
        try {
          const res = await fetch('/api/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setProfile({
              fullName: data.profile.fullName || user?.name || 'User',
              email: data.profile.email || user?.email || '',
              location: data.profile.location || '',
              role: data.profile.role || '',
              bio: data.profile.bio || '',
            });
            setLoading(false);
            return;
          }
        } catch { /* fall through to localStorage */ }
      }

      setProfile({
        fullName: user?.name || localStorage.getItem('navigatorDisplayName') || 'User',
        email: user?.email || localStorage.getItem('navigatorDisplayEmail') || '',
        location: localStorage.getItem('navigatorDisplayLocation') || '',
        role: localStorage.getItem('navigatorDisplayRole') || '',
        bio: localStorage.getItem('navigatorDisplayBio') || '',
      });

      // 3. Load history
      const storedHistory = localStorage.getItem('navigatorHistory');
      if (storedHistory) {
        try {
          setHistoryItems(JSON.parse(storedHistory));
        } catch (e) {
          console.error('Failed to parse history', e);
        }
      }

      setLoading(false);
    }

    loadProfile();
  }, [user, token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    localStorage.setItem('navigatorDisplayName', profile.fullName);
    localStorage.setItem('navigatorDisplayEmail', profile.email);
    localStorage.setItem('navigatorDisplayLocation', profile.location);
    localStorage.setItem('navigatorDisplayRole', profile.role);
    localStorage.setItem('navigatorDisplayBio', profile.bio);

    setSaving(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...profile, preferences: toggles }),
      });
      if (!res.ok) throw new Error('API error');
      setToast({ msg: 'Profile saved successfully!', type: 'success' });
    } catch {
      setToast({ msg: 'Saved locally. Could not sync to server.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    const nextVal = !toggles[id];
    setToggles((prev) => ({ ...prev, [id]: nextVal }));
    localStorage.setItem(`pref-${id}`, String(nextVal));
    if (id === 'dark-mode') setDarkMode(nextVal);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...profile, preferences: { ...toggles, [id]: nextVal } }),
      });
    } catch {}
  };

  const avgScore = historyItems.length > 0
    ? Math.round(historyItems.reduce((sum, item) => sum + (item.readinessScore || 0), 0) / historyItems.length)
    : 0;

  const [activePlan, setActivePlan] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('navResult');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setActivePlan(!!parsed.roadmap || !!parsed.roadmapId);
      } catch { /* ignore */ }
    }
  }, []);

  const latestResult = typeof window !== 'undefined' ? sessionStorage.getItem('navResult') : null;
  const latestData = latestResult ? (() => { try { return JSON.parse(latestResult); } catch { return null; } })() : null;

  const skillsCompleted = latestData?.analysis?.matchedSkills?.length ?? 0;
  const roadmapGoals = historyItems.length || 0;
  const profileStrength = latestData?.analysis?.readinessScore ?? (historyItems.length > 0 ? avgScore : null);
  const pctScore = profileStrength !== null ? `${Math.max(0, Math.min(100, profileStrength))}%` : 'N/A';

  const ACHIEVEMENT_STATS: AchievementStat[] = [
    { value: `${skillsCompleted}`, label: 'Skills completed' },
    { value: `${roadmapGoals}`, label: 'Roadmap goals' },
    { value: pctScore, label: 'Profile strength' },
    { value: latestData?.analysis?.missingSkills?.length != null ? `${latestData.analysis.missingSkills.length}` : '0', label: 'Areas to improve' },
  ];

  const RECENT_ACTIVITY: RecentActivityItem[] = historyItems.length > 0 ? historyItems.slice(0, 3).map((item) => ({
    icon: CheckCircle2,
    iconBg: 'bg-[var(--accent)]/10',
    title: `Analyzed Resume`,
    detail: `Targeted role: ${(item.targetRole || '').replace(/-/g, ' ')} with score ${item.readinessScore}%`
  })) : [
    ...(latestData ? [{
      icon: CheckCircle2 as typeof CheckCircle2,
      iconBg: 'bg-[var(--accent)]/10',
      title: 'Resume analyzed',
      detail: `Target role: ${(latestData.targetRole || '').replace(/-/g, ' ') || 'N/A'}`
    }] : []),
    ...(activePlan ? [{
      icon: Target as typeof Target,
      iconBg: 'bg-orange-100' as const,
      title: 'Active roadmap',
      detail: 'Your career roadmap is ready'
    }] : []),
  ];

  if (loading) return null;

  return (
    <main className="min-h-screen bg-[var(--bg)] ">
      <div className="max-w-6xl mx-auto">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in-up ${
            toast.type === 'success' ? 'bg-[var(--success)] text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.msg}
          </div>
        )}
        {/* Header */}
        <GradientHeader
          eyebrow="Profile"
          title="Profile"
          subtitle="Manage your account, achievements, and preferences"
          showBack
        />

        {/* Content */}
        <div className="px-5 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN ─────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 animate-fade-in-up">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                  <User size={28} className="text-[var(--accent)]" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-semibold truncate">{profile.fullName}</h2>
                  <p className="text-xs text-[var(--text-muted)]">{profile.role} · Career Explorer</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                Building a stronger career path with guided learning, skill tracking, and personalized recommendations.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2.5 py-1 rounded-full">
                  Open to opportunities
                </span>
                <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2.5 py-1 rounded-full">
                  Remote friendly
                </span>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-base font-semibold">Achievements</h2>
                <Trophy size={16} className="text-[var(--accent)]" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">Milestones reached this month</p>

              <div className="grid grid-cols-2 gap-3">
                {ACHIEVEMENT_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3"
                  >
                    <p className="text-xl font-bold text-[var(--accent)]">{stat.value}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Settings */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 animate-fade-in-up" style={{ animationDelay: '0.04s' }}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="font-display text-lg font-semibold">Account Settings</h2>
                  <p className="text-xs text-[var(--text-muted)]">Update your profile details and preferences</p>
                </div>
                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-dim)] px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  <Pencil size={13} />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="profile-fullName" className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="profile-fullName"
                    name="fullName"
                    type="text"
                    value={profile.fullName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="profile-email" className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                    Email
                  </label>
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="profile-location" className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                    Location
                  </label>
                  <input
                    id="profile-location"
                    name="location"
                    type="text"
                    value={profile.location}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="profile-role" className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                    Role
                  </label>
                  <input
                    id="profile-role"
                    name="role"
                    type="text"
                    value={profile.role}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="mt-5">
                <label htmlFor="profile-bio" className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  name="bio"
                  rows={3}
                  value={profile.bio}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Bottom row: Preferences + Recent Activity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Preferences */}
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-display text-base font-semibold">Preferences</h2>
                  <Settings2 size={16} className="text-[var(--accent)]" />
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-5">Customize your experience</p>

                <div className="space-y-4">
                  {PREFERENCES.map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">{pref.label}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{pref.description}</p>
                      </div>
                      {/* Toggle switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={toggles[pref.id]}
                        onClick={() => handleToggle(pref.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                          toggles[pref.id] ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            toggles[pref.id] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-display text-base font-semibold">Recent Activity</h2>
                  <Sparkles size={16} className="text-[var(--accent)]" />
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-5">Your latest profile actions</p>

                <div className="space-y-3">
                  {RECENT_ACTIVITY.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]"
                      >
                        <div className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={16} className="text-[var(--accent)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text)] truncate">{item.title}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{item.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
