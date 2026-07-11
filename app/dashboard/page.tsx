'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReadinessScore from '@/components/ReadinessScore/ReadinessScore';
import SkillGapChart from '@/components/SkillGapChart/SkillGapChart';
import RoadmapView from '@/components/RoadmapView/RoadmapView';
import ATSScoreCard from '@/components/common/ATSScoreCard';
import { ArrowLeft } from 'lucide-react';

interface AnalyzeResult {
  extractedSkills: string[];
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
  roadmap: {
    weekNumber: number;
    topics: string[];
    resources: { title: string; url: string }[];
    miniProjects: string[];
  }[];
}

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<AnalyzeResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('navResult');
    if (!stored) {
      router.push('/');
      return;
    }
    setData(JSON.parse(stored));
  }, [router]);

  if (!data) return null;

  return (
    <main className="min-h-screen radar-bg px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          New flight plan
        </button>

        <div className="mb-10">
          <span className="font-mono text-xs tracking-widest text-[var(--accent)]">MISSION BRIEFING</span>
          <h1 className="font-display text-3xl font-semibold mt-2">Your Skill Gap Report</h1>
        </div>

        <div
          className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 flex flex-col items-center mb-8 animate-fade-in-up"
          style={{ animationDelay: '0ms' }}
        >
          <ReadinessScore score={data.analysis.readinessScore} />
          <p className="text-sm text-[var(--text-muted)] mt-4 text-center max-w-sm">
            You're {data.analysis.readinessScore}% ready for this role based on {data.analysis.matchedSkills.length + data.analysis.missingSkills.length} core skills evaluated.
          </p>
        </div>

        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
          <SkillGapChart matched={data.analysis.matchedSkills} missing={data.analysis.missingSkills} />
        </div>

        {data.atsCheck && (
          <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
            <ATSScoreCard
              score={data.atsCheck.score}
              issues={data.atsCheck.issues}
              suggestions={data.atsCheck.suggestions}
            />
          </div>
        )}

        <div className="animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
          <RoadmapView weeks={data.roadmap} />
        </div>
      </div>
    </main>
  );
}