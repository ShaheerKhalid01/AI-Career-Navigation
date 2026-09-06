'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { BarChart3 } from 'lucide-react';

export default function ATSScoreCard() {
  const analysisData = useSelector((state: RootState) => state.resume.analysisData);
  const score = analysisData?.atsCheck?.score ?? 0;
  const isStrong = score > 70;
  const isFair = score > 40;

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-base font-semibold">ATS Score</h2>
        <BarChart3 size={16} className="text-[var(--accent)]" />
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-4">Your resume readiness at a glance.</p>

      {analysisData ? (
        <>
          <div className="flex items-end justify-between mb-3">
            <p className="text-5xl font-bold text-[var(--text)]">{score}</p>
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full mb-1 ${
              isStrong
                ? 'text-[var(--success)] bg-[var(--success)]/10'
                : isFair
                ? 'text-orange-500 bg-orange-100'
                : 'text-[var(--danger)] bg-red-100'
            }`}>
              {isStrong ? 'Strong Match' : isFair ? 'Needs Work' : 'Poor Match'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
            <span>Optimization progress</span>
            <span>{score}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--bg)] mb-4">
            <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${score}%` }} />
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            <p>Target: <span className="font-medium text-[var(--text)] capitalize">{analysisData.targetRole?.replace(/-/g, ' ') || 'N/A'}</span></p>
            <p className="mt-1">Matched: <span className="font-medium text-[var(--success)]">{analysisData.analysis?.matchedSkills?.length || 0}</span> / {(analysisData.analysis?.matchedSkills?.length || 0) + (analysisData.analysis?.missingSkills?.length || 0)} skills</p>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-end justify-between mb-3">
            <p className="text-5xl font-bold text-[var(--text)]">--</p>
            <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-gray-100 px-2 py-1 rounded-full mb-1">
              No Data
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
            <span>Optimization progress</span>
            <span>--</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--bg)] mb-4">
            <div className="h-2 rounded-full bg-gray-200" style={{ width: '0%' }} />
          </div>
          <p className="text-xs text-[var(--text-muted)]">Upload and analyze your resume to see your ATS score.</p>
        </>
      )}
    </div>
  );
}
