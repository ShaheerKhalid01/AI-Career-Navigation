'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Lightbulb, FileText, AlignLeft, Search } from 'lucide-react';
import { setToast } from '@/lib/store/resumeSlice';

const SUGGESTIONS = [
  { icon: Lightbulb, title: 'Improve Summary', detail: 'Make it more action-oriented' },
  { icon: FileText, title: 'Quantify Results', detail: 'Add metrics to your experience' },
  { icon: Search, title: 'Keywords', detail: 'Add missing keywords from job description' }
];

export default function SuggestionsList() {
  const dispatch = useDispatch();
  const analysisData = useSelector((state: RootState) => state.resume.analysisData);
  const suggestions = analysisData?.atsCheck?.suggestions || [];

  const handleSuggestionClick = (detail: string) => {
    dispatch(setToast({ msg: 'Tip: ' + detail, type: 'info' }));
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-base font-semibold">Suggestions</h2>
        <Lightbulb size={16} className="text-[var(--accent)]" />
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-4">AI-generated improvements to strengthen your resume.</p>

      {suggestions.length > 0 ? (
        <div className="space-y-3">
          {suggestions.slice(0, 3).map((s: string, i: number) => (
            <div key={`sug-${i}`} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb size={14} className="text-[var(--accent)]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{s}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {SUGGESTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                onClick={() => handleSuggestionClick(s.detail)}
                className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)]/40 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={14} className="text-[var(--accent)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text)]">{s.title}</p>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{s.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
