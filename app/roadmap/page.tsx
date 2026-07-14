'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Filter,
  Plus,
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  FileText,
  BookOpen,
  Users2,
  Calendar,
  Zap,
} from 'lucide-react';
import GradientHeader from '@/components/common/GradientHeader';

interface PhaseItem {
  name: string;
  progress: number;
  status: string;
  statusColor: string;
}

interface Phase {
  title: string;
  tag: string;
  tagColor: string;
  desc: string;
  items: PhaseItem[];
}

interface AnalyzeResult {
  extractedSkills: string[];
  targetRole?: string;
  analysis: {
    matchedSkills: string[];
    missingSkills: string[];
    readinessScore: number;
  };
  roadmap: {
    weekNumber: number;
    topics: string[];
    resources: { title: string; url: string }[];
    miniProjects: string[];
  }[];
}

export default function GeneralRoadmapPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyzeResult | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [milestones, setMilestones] = useState<{ title: string; date: string }[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('navResult');
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse navResult', e);
      }
    }
    const savedMilestones = localStorage.getItem('roadmap_milestones');
    if (savedMilestones) {
      try { setMilestones(JSON.parse(savedMilestones)); } catch {}
    }
  }, []);

  const overallScore = data?.analysis?.readinessScore ?? 86;
  const targetRole = data?.targetRole ? data.targetRole.replace(/-/g, ' ') : 'Product Designer';

  // Compute stats based on the generated roadmap dynamic weeks
  const totalWeeks = data?.roadmap?.length ?? 6;
  const matchedSkillsCount = data?.analysis?.matchedSkills?.length ?? 8;
  const missingSkillsCount = data?.analysis?.missingSkills?.length ?? 4;
  const totalSkillsCount = matchedSkillsCount + missingSkillsCount;
  
  // Calculate completion percentage: Matched / Total
  const completionPercentage = totalSkillsCount > 0 ? Math.round((matchedSkillsCount / totalSkillsCount) * 100) : 68;

  // Adapt phases dynamically based on missing skills if present
  const dynamicPhase1Items = [
    { name: 'Resume audit', progress: 100, status: 'Done', statusColor: 'text-[var(--text-muted)]' },
    { name: 'Skill gap review', progress: completionPercentage, status: `${matchedSkillsCount}/${totalSkillsCount} matched`, statusColor: 'text-blue-600' },
    { name: 'Target role definition', progress: 100, status: 'Completed', statusColor: 'text-[var(--text-muted)]' },
  ];

  const dynamicPhase2Items = data?.roadmap ? data.roadmap.slice(0, 3).map((w, idx) => ({
    name: `Week ${w.weekNumber}: ${w.topics[0] || 'Skill building'}`,
    progress: idx === 0 ? 40 : 0,
    status: w.miniProjects?.[0] ? 'Project Ready' : 'Pending',
    statusColor: 'text-[var(--text-muted)]'
  })) : [
    { name: 'Roadmap milestones', progress: 40, status: '4 tasks', statusColor: 'text-[var(--text-muted)]' },
    { name: 'Weekly schedule', progress: 90, status: 'Ready', statusColor: 'text-[var(--text-muted)]' },
    { name: 'Mentor check-in', progress: 15, status: 'Booked', statusColor: 'text-[var(--text-muted)]' },
  ];

  const PHASES: Phase[] = [
    {
      title: 'Phase 1 · Assess',
      tag: 'Current',
      tagColor: 'bg-blue-100 text-blue-700',
      desc: 'Understand your baseline and identify gaps.',
      items: dynamicPhase1Items,
    },
    {
      title: 'Phase 2 · Plan',
      tag: 'Upcoming',
      tagColor: 'bg-gray-100 text-gray-700',
      desc: 'Turn insights into a focused action plan.',
      items: dynamicPhase2Items,
    },
    {
      title: 'Phase 3 · Grow',
      tag: 'Goal',
      tagColor: 'bg-purple-100 text-purple-700',
      desc: 'Build confidence through practice and feedback.',
      items: [
        { name: 'Interview practice', progress: 35, status: '2 sessions', statusColor: 'text-[var(--text-muted)]' },
        { name: 'Portfolio refresh', progress: 50, status: 'In review', statusColor: 'text-[var(--text-muted)]' },
        { name: 'Applications', progress: 10, status: 'Ready to launch', statusColor: 'text-[var(--text-muted)]' },
      ],
    },
  ];

  // Dynamic timeline events matching the weeks
  const TIMELINE_EVENTS = data?.roadmap ? data.roadmap.slice(0, 3).map((w) => ({
    icon: Clock,
    title: w.topics[0] || 'Optimize Core Skills',
    week: `Week ${w.weekNumber}`,
    desc: w.miniProjects[0] || 'Focus on learning and applying these topics to projects.'
  })) : [
    { icon: Clock, title: 'Resume optimization sprint', week: 'Week 1', desc: 'Refine summary, strengthen keywords, and align achievements to target roles.' },
    { icon: BookOpen, title: 'Skill-building roadmap', week: 'Week 2', desc: 'Complete focused learning modules and track progress against role requirements.' },
    { icon: Users2, title: 'Community feedback loop', week: 'Week 3', desc: 'Share progress, gather peer feedback, and iterate on your portfolio and interview prep.' },
  ];

  // Dynamic Next Actions listing missing skills to learn
  const dynamicNextActions = data?.analysis?.missingSkills?.map((s) => ({
    icon: BookOpen,
    title: `Learn ${s}`,
    desc: `Tackle this missing skill from your gap report to reach 100% readiness.`
  })) || [];

  const NEXT_ACTIONS = dynamicNextActions.length > 0 ? dynamicNextActions.slice(0, 3) : [
    { icon: FileText, title: 'Update resume bullets', desc: 'Add measurable outcomes to your latest role and projects.' },
    { icon: BookOpen, title: 'Complete learning module', desc: 'Finish the next skill lesson tied to your target role.' },
    { icon: Users2, title: 'Request peer review', desc: 'Share your roadmap draft with the community for feedback.' },
  ];

  const filteredPhases = selectedFilter === 'All'
    ? PHASES
    : PHASES.map(phase => ({
        ...phase,
        items: phase.items.filter(item =>
          item.name.toLowerCase().includes(selectedFilter.toLowerCase())
        ),
      })).filter(phase => phase.items.length > 0);

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
          eyebrow="Roadmap"
          title="Roadmap"
          subtitle={data?.targetRole ? `Career Plan for ${targetRole}` : "Plan your next steps with guided milestones and skill-building actions"}
          showBack
        />

        {/* Content Section */}
        <div className="px-5 mt-6 space-y-6">
          {/* Main Top Block */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full">
                <Compass size={12} />
                Roadmap Overview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)] px-3 py-2 rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Filter size={13} />
                  Filter
                </button>
                <button
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="flex items-center gap-1.5 text-xs font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-dim)] px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus size={13} />
                  Add Milestone
                </button>
              </div>
            </div>

            <h2 className="font-display text-2xl font-semibold mb-2">Your career roadmap at a glance</h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl">
              A structured plan to help you build momentum across resume improvements, skill growth, interview readiness, and community engagement.
            </p>

            {showFilter && (
              <div className="mt-4 flex flex-wrap gap-2 animate-fade-in-up">
                {['All', 'Resume', 'Skills', 'Interview', 'Portfolio'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { setSelectedFilter(f); setShowFilter(false); }}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      selectedFilter === f
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            {showAddMilestone && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (milestoneTitle.trim()) {
                  const newMilestones = [...milestones, { title: milestoneTitle.trim(), date: new Date().toISOString() }];
                  setMilestones(newMilestones);
                  localStorage.setItem('roadmap_milestones', JSON.stringify(newMilestones));
                  setMilestoneTitle('');
                  setShowAddMilestone(false);
                }
              }} className="mt-4 flex items-center gap-2 animate-fade-in-up">
                <input
                  type="text"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Milestone title..."
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                />
                <button type="submit" className="text-xs font-medium text-white bg-[var(--accent)] px-3 py-2 rounded-lg hover:bg-[var(--accent-dim)]">
                  Save
                </button>
              </form>
            )}
            {milestones.length > 0 && (
              <div className="mt-4 space-y-2">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    <span className="text-[var(--text)]">{m.title}</span>
                    <span className="text-[var(--text-muted)] ml-auto">{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Three columns matching Phase 1, Phase 2, Phase 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredPhases.map((phase, idx) => (
              <div
                key={phase.title}
                className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display text-base font-semibold">{phase.title}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${phase.tagColor}`}>
                    {phase.tag}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-5">{phase.desc}</p>

                <div className="space-y-4">
                  {phase.items.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="truncate max-w-[180px]">{item.name}</span>
                        <span className={item.statusColor}>{item.status}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[var(--bg)]">
                        <div
                          className="h-1.5 rounded-full bg-[var(--accent)]"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Two-column layout: Milestone Timeline + Next Actions & Roadmap Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Milestone Timeline */}
            <div className="lg:col-span-5 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-base font-semibold">Milestone Timeline</h3>
                <Clock size={16} className="text-[var(--accent)]" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-6">A chronological view of your roadmap progress.</p>

              <div className="relative pl-6 space-y-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--border)]" />
                {TIMELINE_EVENTS.map((event, idx) => {
                  const Icon = event.icon;
                  return (
                    <div key={`${event.week}-${idx}`} className="relative">
                      <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                        <Icon size={12} className="text-[var(--accent)]" />
                      </div>
                      <div className="flex justify-between text-xs font-semibold mb-0.5">
                        <span className="text-[var(--text)] truncate max-w-[200px]">{event.title}</span>
                        <span className="text-[var(--text-muted)] font-mono">{event.week}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{event.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Middle: Next Actions */}
            <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-base font-semibold">Next Actions</h3>
                <Zap size={16} className="text-[var(--accent)]" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">Recommended actions to keep momentum high.</p>

              <div className="space-y-3">
                {NEXT_ACTIONS.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={`${action.title}-${idx}`}
                      onClick={() => router.push('/')}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)]/40 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className="text-[var(--accent)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--text)]">{action.title}</p>
                        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-0.5">{action.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => router.push('/')}
                className="w-full mt-4 flex items-center justify-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-dim)] text-white text-xs font-semibold py-3 rounded-xl transition-colors"
              >
                Continue Roadmap
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Right: Roadmap Progress Panel */}
            <div className="lg:col-span-3 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display text-base font-semibold">Roadmap Progress</h3>
                <TrendingUp size={16} className="text-[var(--accent)]" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">Track completion across your current plan.</p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span>Overall completion</span>
                    <span className="text-[var(--accent)]">{completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[var(--bg)]">
                    <div className="h-2.5 rounded-full bg-[var(--accent)]" style={{ width: `${completionPercentage}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Tasks Done</p>
                    <p className="text-2xl font-bold text-[var(--text)]">{matchedSkillsCount}</p>
                  </div>
                  <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Remaining</p>
                    <p className="text-2xl font-bold text-[var(--text)]">{missingSkillsCount}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                      <Calendar size={14} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--text)]">Next checkpoint</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Friday - 4:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={14} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--text)]">Momentum streak</p>
                      <p className="text-[10px] text-[var(--text-muted)]">7 days of consistent progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

