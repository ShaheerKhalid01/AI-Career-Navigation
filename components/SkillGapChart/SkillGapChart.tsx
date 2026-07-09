'use client';

import { Check, X } from 'lucide-react';

interface SkillGapChartProps {
  matched: string[];
  missing: string[];
}

export default function SkillGapChart({ matched, missing }: SkillGapChartProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
        <p className="font-mono text-xs tracking-widest text-[var(--success)] uppercase mb-3">
          Onboard ({matched.length})
        </p>
        <div className="flex flex-col gap-2">
          {matched.map((skill) => (
            <div key={skill} className="flex items-center gap-2 text-sm text-[var(--text)]">
              <Check size={14} className="text-[var(--success)] shrink-0" />
              {skill}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
        <p className="font-mono text-xs tracking-widest text-[var(--danger)] uppercase mb-3">
          Gap ({missing.length})
        </p>
        <div className="flex flex-col gap-2">
          {missing.map((skill) => (
            <div key={skill} className="flex items-center gap-2 text-sm text-[var(--text)]">
              <X size={14} className="text-[var(--danger)] shrink-0" />
              {skill}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}