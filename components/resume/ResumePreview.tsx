'use client';

import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Pencil, Check, Briefcase, Wrench, AlertTriangle, FileText } from 'lucide-react';

interface WorkEntry {
  title: string;
  period: string;
  description: string;
}

const WORK_EXPERIENCE: WorkEntry[] = [];
const SKILLS: string[] = [];

export default function ResumePreview() {
  const analysisData = useSelector((state: RootState) => state.resume.analysisData);
  const realSkills = analysisData?.analysis?.matchedSkills || analysisData?.extractedSkills || SKILLS;
  
  const summaryRef = useRef<HTMLDivElement>(null);
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState(
    realSkills.length > 0 ? `Professional with expertise in ${realSkills.slice(0, 5).join(', ')}.` : ''
  );
  const [editingWorkIdx, setEditingWorkIdx] = useState<number | null>(null);
  const [workDescriptions, setWorkDescriptions] = useState(WORK_EXPERIENCE.map(e => e.description));
  const [showRawText, setShowRawText] = useState(false);

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 space-y-6">
      {/* Professional Summary */}
      <div className="border border-[var(--border)] rounded-xl p-5" ref={summaryRef}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[var(--text)]">Professional Summary</h3>
          <button
            onClick={() => setEditingSummary(!editingSummary)}
            className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
          >
            {editingSummary ? <Check size={12} /> : <Pencil size={12} />}
            {editingSummary ? 'Done' : 'Edit'}
          </button>
        </div>
        {editingSummary ? (
          <textarea
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            className="w-full text-xs text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 resize-none focus:outline-none focus:border-[var(--accent)]"
            rows={3}
          />
        ) : (
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">{summaryText}</p>
        )}
      </div>

      {/* Work Experience — from real data or fallback */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-[var(--accent)]/10 flex items-center justify-center">
            <Briefcase size={13} className="text-[var(--accent)]" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--text)]">
            {analysisData ? 'Extracted Skills' : 'Work Experience'}
          </h3>
        </div>
        {analysisData ? (
          <div className="pl-8">
            <p className="text-xs text-[var(--text-muted)]">
              {realSkills.length > 0
                ? `${realSkills.length} skills match your target role. ${analysisData?.extractedSkills?.length || 0} total extracted from resume.`
                : 'Upload and analyze your resume to see extracted skills.'}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {(realSkills as string[]).map((s: string, i: number) => (
                <span key={`es-${i}`} className="text-[11px] font-medium text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-1.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="pl-8 space-y-3">
            {WORK_EXPERIENCE.map((entry, idx) => (
              <div key={entry.title} className="border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{entry.title}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{entry.period}</p>
                  </div>
                  <button
                    onClick={() => setEditingWorkIdx(editingWorkIdx === idx ? null : idx)}
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex-shrink-0"
                  >
                    {editingWorkIdx === idx ? <Check size={13} /> : <Pencil size={13} />}
                  </button>
                </div>
                {editingWorkIdx === idx ? (
                  <textarea
                    value={workDescriptions[idx]}
                    onChange={(e) => {
                      const updated = [...workDescriptions];
                      updated[idx] = e.target.value;
                      setWorkDescriptions(updated);
                    }}
                    className="w-full text-xs text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 resize-none focus:outline-none focus:border-[var(--accent)] mt-2"
                    rows={3}
                  />
                ) : (
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-2">{workDescriptions[idx]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Comparison — all matched vs missing skills */}
      {analysisData && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--accent)]/10 flex items-center justify-center">
              <Wrench size={13} className="text-[var(--accent)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text)]">Skill Comparison</h3>
          </div>
          <div className="pl-8">
            <p className="text-xs font-medium text-[var(--success)] mb-2">
              You have ({analysisData.analysis?.matchedSkills?.length || 0})
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {(analysisData.analysis?.matchedSkills || []).map((s: string, i: number) => (
                <span key={`have-${i}`} className="text-[11px] font-medium text-[var(--success)] bg-[var(--success)]/10 border border-[var(--success)]/20 px-3 py-1.5 rounded-full">
                  {s}
                </span>
              ))}
              {(!analysisData.analysis?.matchedSkills || analysisData.analysis.matchedSkills.length === 0) && (
                <span className="text-[11px] text-[var(--text-muted)]">No matched skills</span>
              )}
            </div>
            <p className="text-xs font-medium text-[var(--danger)] mb-2">
              You don't have ({analysisData.analysis?.missingSkills?.length || 0})
            </p>
            <div className="flex flex-wrap gap-2">
              {(analysisData.analysis?.missingSkills || []).map((s: string, i: number) => (
                <span key={`missing-${i}`} className="text-[11px] font-medium text-[var(--danger)] bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
                  {s}
                </span>
              ))}
              {(!analysisData.analysis?.missingSkills || analysisData.analysis.missingSkills.length === 0) && (
                <span className="text-[11px] text-[var(--text-muted)]">No missing skills — great match!</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ATS Issues — only when analysis data exists */}
      {analysisData?.atsCheck?.issues?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center">
              <AlertTriangle size={13} className="text-[var(--danger)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text)]">ATS Issues</h3>
          </div>
          <div className="pl-8 space-y-2">
            {analysisData.atsCheck.issues.map((issue: string, i: number) => (
              <div key={`issue-${i}`} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                <span className="text-[var(--danger)] mt-0.5">•</span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resume Raw Text — collapsible */}
      {analysisData?.rawText && (
        <div>
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="flex items-center gap-2 w-full text-left"
          >
            <div className="w-6 h-6 rounded-md bg-[var(--accent)]/10 flex items-center justify-center">
              <FileText size={13} className="text-[var(--accent)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text)] flex-1">Extracted Resume Text</h3>
            <span className="text-[10px] text-[var(--text-muted)]">{showRawText ? 'Hide' : 'Show'}</span>
          </button>
          {showRawText && (
            <div className="pl-8 mt-2">
              <pre className="text-xs text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 whitespace-pre-wrap max-h-80 overflow-y-auto">
                {analysisData.rawText}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Skills Summary — only show when no analysis data */}
      {!analysisData && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--accent)]/10 flex items-center justify-center">
              <Wrench size={13} className="text-[var(--accent)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text)]">Skills</h3>
          </div>
          <div className="pl-8 flex flex-wrap gap-2">
            {SKILLS.map((skill, i) => (
              <span key={`sk-${i}`} className="text-[11px] font-medium text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-3 py-1.5 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
