'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { BarChart3, ClipboardCopy } from 'lucide-react';
import { setToast } from '@/lib/store/resumeSlice';

const RESUME_VERSIONS = [
  { label: 'Initial Draft', date: '2 days ago' },
  { label: 'Version 2', date: 'Yesterday' }
];

export default function SkillMatchSummary() {
  const dispatch = useDispatch();
  const analysisData = useSelector((state: RootState) => state.resume.analysisData);

  const handleVersionClick = (v: any) => {
    dispatch(setToast({ msg: `Restored ${v.label} from ${v.date}`, type: 'info' }));
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.24s' }}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-base font-semibold">Skill Match</h2>
        <BarChart3 size={16} className="text-[var(--accent)]" />
      </div>

      {analysisData ? (
        <>
          <p className="text-xs text-[var(--text-muted)] mb-4">Matched vs missing skills for target role.</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
              <div>
                <p className="text-sm font-medium text-[var(--success)]">Matched</p>
                <p className="text-[11px] text-[var(--text-muted)]">{analysisData.analysis?.matchedSkills?.join(', ') || 'None'}</p>
              </div>
              <span className="text-xl font-bold text-[var(--success)]">{analysisData.analysis?.matchedSkills?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
              <div>
                <p className="text-sm font-medium text-[var(--danger)]">Missing</p>
                <p className="text-[11px] text-[var(--text-muted)]">{analysisData.analysis?.missingSkills?.join(', ') || 'None'}</p>
              </div>
              <span className="text-xl font-bold text-[var(--danger)]">{analysisData.analysis?.missingSkills?.length || 0}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-[var(--text-muted)] mb-4">Upload and analyze to see your skill match.</p>
          <div className="space-y-3">
            {RESUME_VERSIONS.map((v) => (
              <div
                key={v.label}
                onClick={() => handleVersionClick(v)}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)]/40 transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--accent)]">{v.label}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{v.date}</p>
                </div>
                <ClipboardCopy size={15} className="text-[var(--text-muted)]" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
