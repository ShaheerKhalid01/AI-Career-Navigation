'use client';

import { AlertCircle, Lightbulb } from 'lucide-react';

interface ATSScoreCardProps {
  score: number;
  issues: string[];
  suggestions: string[];
}

export default function ATSScoreCard({ score, issues, suggestions }: ATSScoreCardProps) {
  const scoreColor = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--accent)' : 'var(--danger)';

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 hover-lift">
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs tracking-widest text-[var(--text-muted)] uppercase">
          Radar Signal — ATS Compatibility
        </p>
        <span className="font-mono text-2xl font-semibold transition-number" style={{ color: scoreColor }}>
          {score}
        </span>
      </div>

      {issues.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mb-2">
            <AlertCircle size={13} className="text-[var(--danger)]" />
            Issues Detected
          </p>
          <ul className="space-y-1.5">
            {issues.map((issue, i) => (
              <li
                key={i}
                className="text-sm text-[var(--text)] pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-[var(--text-muted)] animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
              >
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mb-2">
            <Lightbulb size={13} className="text-[var(--accent)]" />
            Suggestions
          </p>
          <ul className="space-y-1.5">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="text-sm text-[var(--text)] pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-[var(--text-muted)] animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}