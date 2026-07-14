'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  TrendingUp,
  CheckCircle2,
  Search,
  AlignLeft,
} from 'lucide-react';
import GradientHeader from '@/components/common/GradientHeader';

interface ScoreStat {
  label: string;
  value: number;
  change: string;
  desc: string;
  isPositive: boolean;
}

interface Recommendation {
  icon: typeof CheckCircle2;
  title: string;
  detail: string;
}

interface AnalyzeResult {
  extractedSkills: string[];
  targetRole?: string;
  analysis: {
    matchedSkills: string[];
    missingSkills: string[];
    readinessScore: number;
  };
  atsCheck: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
}

export default function ScoresPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyzeResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('navResult');
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse navResult', e);
      }
    }
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen bg-[var(--bg)] ">
        <div className="max-w-6xl mx-auto">
          <GradientHeader eyebrow="Scores" title="Scores" subtitle="No analysis data found" showBack />
          <div className="px-5 mt-20 flex flex-col items-center gap-4">
            <p className="text-[var(--text-muted)] text-sm">Upload and analyze your resume first to see scores.</p>
            <button onClick={() => router.push('/')} className="bg-[var(--accent)] text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-[var(--accent-dim)] transition-colors">
              Go to Resume Upload
            </button>
          </div>
        </div>
      </main>
    );
  }

  const overallScore = data?.analysis?.readinessScore ?? 0;
  const atsScore = data?.atsCheck?.score ?? 0;
  
  const matchCount = data?.analysis?.matchedSkills?.length ?? 0;
  const totalCount = (data?.analysis?.matchedSkills?.length ?? 0) + (data?.analysis?.missingSkills?.length ?? 0);
  const keywordsScore = totalCount > 0 ? Math.round((matchCount / totalCount) * 100) : 0;
  const clarityScore = Math.round((overallScore + atsScore) / 2);
  const impactScore = Math.round(overallScore * 0.95);

  const chartPoints = useMemo(() => {
    const points = [];
    const numPoints = 6;
    const startScore = Math.max(10, Math.round(overallScore * 0.4));
    const step = (overallScore - startScore) / (numPoints - 1);
    for (let i = 0; i < numPoints; i++) {
      const score = Math.round(startScore + step * i);
      const x = Math.round(20 + i * 72);
      const y = Math.round(140 - (score / 100) * 120);
      points.push({ x, y, score });
    }
    return points;
  }, [overallScore]);

  const chartPath = useMemo(() => {
    if (chartPoints.length < 2) return '';
    const pts = chartPoints;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [chartPoints]);

  const readinessPct = overallScore > 80 ? 'Excellent progress' : overallScore > 50 ? 'Good progress' : overallScore > 20 ? 'Needs improvement' : 'Start building your skills';

  const STATS: ScoreStat[] = [
    { label: 'Overall Readiness Score', value: overallScore, change: '', desc: readinessPct, isPositive: overallScore > 50 },
    { label: 'Clarity', value: clarityScore, change: '', desc: 'Based on resume structure', isPositive: true },
    { label: 'Impact', value: impactScore, change: '', desc: 'Quantify outcomes more clearly', isPositive: impactScore > 50 },
    { label: 'Keywords', value: keywordsScore, change: '', desc: totalCount > 0 ? `${matchCount}/${totalCount} skills matched` : 'No skills data', isPositive: keywordsScore > 50 },
  ];

  const BREAKDOWN_ITEMS = [
    { label: 'Clarity', score: clarityScore },
    { label: 'Impact', score: impactScore },
    { label: 'Keywords', score: keywordsScore },
    { label: 'Formatting', score: Math.round(overallScore * 0.9) },
  ];

  const dynamicRecommendations: Recommendation[] = data?.atsCheck?.suggestions?.map((s) => {
    let Icon = CheckCircle2;
    if (s.toLowerCase().includes('keyword') || s.toLowerCase().includes('skills')) {
      Icon = Search;
    } else if (s.toLowerCase().includes('format') || s.toLowerCase().includes('length') || s.toLowerCase().includes('summary')) {
      Icon = AlignLeft;
    }
    return {
      icon: Icon,
      title: s.split('.')[0] || s,
      detail: s.includes('.') ? s.substring(s.indexOf('.') + 1).trim() : 'Improvement suggestion for ATS matching.',
    };
  }) || [];

  const RECOMMENDATIONS: Recommendation[] = dynamicRecommendations.length > 0 ? dynamicRecommendations.slice(0, 3) : [
    { icon: CheckCircle2, title: 'Add stronger impact metrics', detail: 'Quantify achievements with numbers and outcomes.' },
    { icon: Search, title: 'Improve keyword alignment', detail: 'Match role-specific terms from target job descriptions.' },
    { icon: AlignLeft, title: 'Tighten formatting consistency', detail: 'Use cleaner spacing and consistent section hierarchy.' },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg)] ">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <GradientHeader
          eyebrow="Scores"
          title="Scores"
          subtitle={data?.targetRole ? `Analysis for ${data.targetRole.replace(/-/g, ' ')}` : "Track your career readiness and skill scores over time"}
          showBack
        />

        {/* Top KPI Cards Row */}
        <div className="px-5 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up"
            >
              <p className="text-xs text-[var(--text-muted)] font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-[var(--text)] mb-1">{stat.value}</p>
              {stat.change && (
                <p className="text-[11px] text-[var(--success)] font-medium">
                  {stat.change}
                </p>
              )}
              {stat.desc && (
                <p className="text-[11px] text-[var(--text-muted)]">
                  {stat.desc}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="px-5 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Center: Score Overview */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-lg font-semibold">Score Overview</h2>
                  <p className="text-xs text-[var(--text-muted)]">Overall readiness and recent trend</p>
                </div>
                <button 
                  onClick={() => router.push('/roadmap')}
                  className="flex items-center gap-1.5 text-xs font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-dim)] px-4 py-2 rounded-lg transition-colors"
                >
                  View Roadmap
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Radial Gauge */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-[var(--border)] rounded-2xl bg-[var(--bg)]/50">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="68"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 68}
                        strokeDashoffset={2 * Math.PI * 68 * (1 - (overallScore / 100))}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center -mt-2">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Overall Score</span>
                      <span className="text-4xl font-bold text-[var(--text)]">{overallScore}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-medium mt-2 ${
                    overallScore > 80 ? 'text-[var(--success)]' :
                    overallScore > 50 ? 'text-[var(--accent)]' :
                    overallScore > 20 ? 'text-orange-500' :
                    'text-[var(--text-muted)]'
                  }`}>
                    {overallScore > 80 ? 'Excellent progress' :
                     overallScore > 50 ? 'Good progress' :
                     overallScore > 20 ? 'Needs improvement' :
                     'Start building your skills'}
                  </span>
                </div>

                {/* Line Chart placeholder matching the layout exactly */}
                <div className="md:col-span-8 border border-[var(--border)] rounded-2xl p-5 bg-[var(--bg)]/30 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold">Weekly Trend</h3>
                      <p className="text-[11px] text-[var(--text-muted)]">Score movement over recent weeks</p>
                    </div>
                    <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full">
                      +6 this month
                    </span>
                  </div>

                  {/* SVG Line Graph */}
                  <div className="h-40 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 400 150">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="400" y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="0" y1="100" x2="400" y2="100" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="0" y1="140" x2="400" y2="140" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />

                      {/* Chart Path */}
                      <path
                        d={chartPath}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Dots on Path */}
                      {chartPoints.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--accent)" />
                      ))}
                    </svg>

                    {/* X-axis Labels */}
                    <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-1 px-2 font-mono">
                      <span>W1</span>
                      <span>W2</span>
                      <span>W3</span>
                      <span>W4</span>
                      <span>W5</span>
                      <span>W6</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Stats Grid at bottom of Score Overview */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
                {[
                  { label: 'Clarity', value: clarityScore },
                  { label: 'Impact', value: impactScore },
                  { label: 'Keywords', value: keywordsScore },
                ].map((item) => (
                  <div key={item.label} className="bg-[var(--bg)]/50 rounded-xl p-3 border border-[var(--border)]">
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] tracking-wider uppercase mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-xl font-bold text-[var(--text)]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Score Breakdown & Recommendations */}
          <div className="lg:col-span-1 space-y-6">
            {/* Score Breakdown */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
              <h2 className="font-display text-base font-semibold mb-1">Score Breakdown</h2>
              <p className="text-xs text-[var(--text-muted)] mb-5">Category performance and progress</p>

              <div className="space-y-4">
                {BREAKDOWN_ITEMS.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span>{item.label}</span>
                      <span className="text-[var(--accent)]">{item.score}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--bg)]">
                      <div
                        className="h-2 rounded-full bg-[var(--accent)]"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
              <h2 className="font-display text-base font-semibold mb-1">Recommendations</h2>
              <p className="text-xs text-[var(--text-muted)] mb-4">Prioritized actions to improve your score</p>

              <div className="space-y-3">
                {RECOMMENDATIONS.map((rec, idx) => {
                  const Icon = rec.icon;
                  return (
                    <div
                      key={`${rec.title}-${idx}`}
                      onClick={() => router.push('/')}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)]/40 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className="text-[var(--accent)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--text)]">{rec.title}</p>
                        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-0.5">{rec.detail}</p>
                      </div>
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

