'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import ReadinessScore from '@/components/ReadinessScore/ReadinessScore';
import SkillGapChart from '@/components/SkillGapChart/SkillGapChart';
import RoadmapView from '@/components/RoadmapView/RoadmapView';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';

interface RoadmapData {
  roadmap: {
    weekNumber: number;
    topics: string[];
    resources: { title: string; url: string }[];
    miniProjects: string[];
  }[];
  targetRole: string;
  analysis: {
    matchedSkills: string[];
    missingSkills: string[];
    readinessScore: number;
  } | null;
}

export default function RoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [data, setData] = useState<RoadmapData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`/api/roadmap/${params.id}`, { headers });
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || 'Could not load this roadmap.');
          return;
        }
        setData(json);
      } catch {
        setError('Network error. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchRoadmap();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen radar-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
          <Loader2 className="animate-spin text-[var(--accent)]" size={28} />
          <p className="font-mono text-xs tracking-widest">LOADING FLIGHT PLAN...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen radar-bg flex items-center justify-center px-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 max-w-sm text-center">
          <AlertTriangle className="mx-auto mb-3 text-[var(--danger)]" size={28} />
          <p className="text-[var(--text)] font-medium mb-1">Route not found</p>
          <p className="text-sm text-[var(--text-muted)] mb-5">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[var(--accent)] text-[var(--bg)] text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[var(--accent-dim)] transition-colors"
          >
            Start a new flight plan
          </button>
        </div>
      </main>
    );
  }

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
          <span className="font-mono text-xs tracking-widest text-[var(--accent)]">
            SAVED ROUTE — {data.targetRole.toUpperCase()}
          </span>
          <h1 className="font-display text-3xl font-semibold mt-2">Your Skill Gap Report</h1>
        </div>

        {data.analysis && (
          <>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 flex flex-col items-center mb-8">
              <ReadinessScore score={data.analysis.readinessScore} />
            </div>
            <div className="mb-10">
              <SkillGapChart matched={data.analysis.matchedSkills} missing={data.analysis.missingSkills} />
            </div>
          </>
        )}

        <RoadmapView weeks={data.roadmap} />
      </div>
    </main>
  );
}