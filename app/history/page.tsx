'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  BarChart3,
  Map,
  Users2,
  Filter,
  Download,
  Clock,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import GradientHeader from '@/components/common/GradientHeader';

interface TimelineEvent {
  id: string;
  icon: typeof FileText;
  iconBg: string;
  title: string;
  badge?: { text: string; variant: 'blue' | 'green' };
  date: string;
  time: string;
  description: string;
  tags?: string[];
  scores?: { label: string; value: number }[];
  status?: { done: string; next: string };
}

interface RecentChange {
  icon: typeof FileText;
  title: string;
  detail: string;
}

interface ActivityStat {
  value: string;
  label: string;
}

interface StoredHistoryItem {
  type: string;
  title: string;
  desc: string;
  date: string;
  readinessScore?: number;
  targetRole?: string;
}

export default function HistoryPage() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const [stats, setStats] = useState<ActivityStat[]>([]);
  const [liveData, setLiveData] = useState<Record<string,any>|null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleExport = () => {
    const raw = localStorage.getItem('navigatorHistory');
    if (!raw) {
      showToast('No history data to export.');
      return;
    }
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('History exported as JSON!');
  };

  useEffect(() => {
    // Load latest analysis data from session
    const stored = sessionStorage.getItem('navResult');
    if (stored) {
      try { setLiveData(JSON.parse(stored)); }
      catch { /* ignore */ }
    }

    // Load persistent history from local storage
    const rawHistory = localStorage.getItem('navigatorHistory');
    if (rawHistory) {
      try {
        const parsed: StoredHistoryItem[] = JSON.parse(rawHistory);
        
        // 1. Build timeline events from history
        const events: TimelineEvent[] = parsed.map((item, idx) => {
          const itemDate = new Date(item.date);
          const dateStr = itemDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const timeStr = itemDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

          const isLatest = idx === 0;

          if (item.readinessScore !== undefined) {
            return {
              id: String(idx),
              icon: BarChart3,
              iconBg: 'bg-orange-100',
              title: `Score calculated: ${item.readinessScore}`,
              badge: isLatest ? { text: 'Latest', variant: 'blue' } : undefined,
              date: dateStr,
              time: timeStr,
              description: `Resume analysis complete for target role: ${item.targetRole?.replace(/-/g, ' ')}.`,
              scores: [
                { label: 'Overall', value: item.readinessScore },
              ]
            };
          }

          return {
            id: String(idx),
            icon: FileText,
            iconBg: 'bg-[var(--accent)]/10',
            title: item.title || 'Resume uploaded',
            badge: isLatest ? { text: 'Latest', variant: 'blue' } : undefined,
            date: dateStr,
            time: timeStr,
            description: item.desc || 'Resume action was saved.',
            tags: ['ATS Checked', 'Local Save']
          };
        });

        // 2. Build recent changes list
        const changes: RecentChange[] = parsed.slice(0, 3).map((item) => ({
          icon: item.readinessScore !== undefined ? BarChart3 : FileText,
          title: item.readinessScore !== undefined ? 'Score updated' : 'Resume updated',
          detail: item.title || 'Action processed successfully.'
        }));

        // 3. Compute stats
        const scoredItems = parsed.filter(i => i.readinessScore !== undefined);
        const avgScore = scoredItems.reduce((acc, curr) => acc + (curr.readinessScore || 0), 0) / (scoredItems.length || 1);

        const activityStats: ActivityStat[] = [
          { value: String(parsed.length), label: 'Total Actions' },
          { value: scoredItems.length > 0 ? `${Math.round(avgScore)}%` : 'N/A', label: 'Avg score' },
          { value: String(parsed.filter(i => i.type === 'roadmap' || i.type === 'milestone').length || (stored ? '1' : '0')), label: 'Milestones done' },
          { value: stored ? '1' : '0', label: 'Active Plan' }
        ];

        setTimelineEvents(events);
        setRecentChanges(changes);
        setStats(activityStats);
      } catch (e) {
        console.error('Failed to parse history data', e);
      }
    } else if (stored) {
      // No history, but we have analysis data — build from session
      try {
        const d = JSON.parse(stored);
        const now = new Date();
        const dateStr = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        const events: TimelineEvent[] = [{
          id: '0',
          icon: BarChart3,
          iconBg: 'bg-orange-100',
          title: `Score: ${d.analysis?.readinessScore ?? '?'}`,
          badge: { text: 'Latest', variant: 'blue' },
          date: dateStr,
          time: timeStr,
          description: `Target role: ${(d.targetRole || '').replace(/-/g, ' ') || 'N/A'}`,
          scores: [{ label: 'Overall', value: d.analysis?.readinessScore ?? 0 }],
        }];
        const changes: RecentChange[] = [{
          icon: BarChart3,
          title: 'Resume analyzed',
          detail: (d.targetRole || '').replace(/-/g, ' ') || 'Career analysis'
        }];
        const activityStats: ActivityStat[] = [
          { value: '1', label: 'Total Actions' },
          { value: d.analysis?.readinessScore != null ? `${d.analysis.readinessScore}%` : 'N/A', label: 'Avg score' },
          { value: '1', label: 'Milestones done' },
          { value: '1', label: 'Active Plan' },
        ];
        setTimelineEvents(events);
        setRecentChanges(changes);
        setStats(activityStats);
      } catch { /* ignore */ }
    }
  }, []);

  // Fallbacks if no history or session data
  const displayTimeline = timelineEvents.length > 0 ? timelineEvents : [
    {
      id: '1',
      icon: FileText,
      iconBg: 'bg-[var(--accent)]/10',
      title: 'No history yet',
      date: '--',
      time: '--',
      description: 'Upload and analyze your resume to see your history here.',
    },
  ];

  const displayChanges = recentChanges.length > 0 ? recentChanges : [
    { icon: FileText, title: 'No recent changes', detail: 'Your activity will appear here after you analyze a resume.' },
  ];

  const displayStats = stats.length > 0 ? stats : [
    { value: '0', label: 'Actions' },
    { value: 'N/A', label: 'Avg. score' },
    { value: '0', label: 'Milestones' },
    { value: '0', label: 'Active Plans' },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg)] ">
      <div className="max-w-6xl mx-auto">
        {toast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium bg-[var(--accent)] text-white animate-fade-in-up">
            {toast}
          </div>
        )}
        {/* Header */}
        <GradientHeader
          eyebrow="History"
          title="History"
          subtitle="Review your past activity, updates, and progress over time"
          showBack
        />

        {/* Content grid */}
        <div className="px-5 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT: Activity Timeline ──────────────────────────── */}
          <div className="lg:col-span-2 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 animate-fade-in-up">
            {/* Section header */}
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display text-lg font-semibold">Activity Timeline</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)] px-3 py-2 rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Filter size={13} />
                  Filter
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 text-xs font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-dim)] px-3 py-2 rounded-lg transition-colors"
                >
                  <Download size={13} />
                  Export
                </button>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-6">
              A chronological view of your recent resume, score, and roadmap updates.
            </p>

            {showFilter && (
              <div className="mb-4 flex flex-wrap gap-2 animate-fade-in-up">
                {['All', 'Resume', 'Score', 'Roadmap'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { showToast(`Filtered by: ${f}`); setShowFilter(false); }}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            {/* Timeline */}
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--border)]" />

              <div className="space-y-6">
                {displayTimeline.map((event) => {
                  const Icon = event.icon;
                  return (
                    <div key={event.id} className="relative">
                      {/* Dot on timeline */}
                      <div className={`absolute -left-8 top-0 w-8 h-8 rounded-full ${event.iconBg} flex items-center justify-center z-10`}>
                        <Icon size={15} className="text-[var(--accent)]" />
                      </div>

                      {/* Card */}
                      <div
                        onClick={() => showToast(event.title)}
                        className="border border-[var(--border)] rounded-xl p-5 hover:shadow-sm transition-shadow cursor-pointer"
                      >
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-[var(--text)]">{event.title}</h3>
                            {event.badge && (
                              <span
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                  event.badge.variant === 'blue'
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'bg-[var(--success)]/10 text-[var(--success)]'
                                }`}
                              >
                                {event.badge.text}
                              </span>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-medium text-[var(--text)]">{event.date}</p>
                            <p className="text-[11px] text-[var(--text-muted)]">{event.time}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{event.description}</p>

                        {/* Tags */}
                        {event.tags && (
                          <div className="flex flex-wrap gap-2">
                            {event.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2.5 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Score cards */}
                        {event.scores && (
                          <div className="grid grid-cols-3 gap-3">
                            {event.scores.map((s) => (
                              <div
                                key={s.label}
                                className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-3"
                              >
                                <p className="text-[10px] font-semibold text-[var(--text-muted)] tracking-wider uppercase mb-1">
                                  {s.label}
                                </p>
                                <p className="text-xl font-bold text-[var(--text)]">{s.value}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Status */}
                        {event.status && (
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--success)] bg-[var(--success)]/10 px-2.5 py-1 rounded-full">
                              <CheckCircle2 size={12} />
                              {event.status.done}
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)]">{event.status.next}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ──────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recent Changes */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-base font-semibold">Recent Changes</h2>
                <Clock size={16} className="text-[var(--accent)]" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">Quick summary of your latest updates.</p>

              <div className="space-y-3">
                {displayChanges.map((change, idx) => {
                  const Icon = change.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => showToast(`${change.title}: ${change.detail}`)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)]/40 transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-[var(--accent)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text)] truncate">{change.title}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{change.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-base font-semibold">Activity Stats</h2>
                <TrendingUp size={16} className="text-[var(--accent)]" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">A snapshot of your progress over time.</p>

              <div className="grid grid-cols-2 gap-3">
                {displayStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3"
                  >
                    <p className="text-xs text-[var(--text-muted)] mb-0.5">{stat.label}</p>
                    <p className="text-xl font-bold text-[var(--text)]">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
