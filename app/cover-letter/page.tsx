'use client';

import { useState } from 'react';
import { FileText, Copy, Check, Loader2, RefreshCw, ArrowRight, Building2, Briefcase, Sparkles, AlertCircle } from 'lucide-react';
import GradientHeader from '@/components/common/GradientHeader';

export default function CoverLetterPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generate = async (regenerate?: boolean) => {
    if (!jobTitle || !company) return;
    setLoading(true);
    setError('');
    if (!regenerate) setLetter('');

    const stored = sessionStorage.getItem('navResult');
    const analysisData = stored ? JSON.parse(stored) : null;
    const extractedSkills = analysisData?.extractedSkills || [];
    const targetRole = analysisData?.targetRole || jobTitle;

    try {
      const res = await fetch('/api/generate/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          company,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          extractedSkills,
          targetRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      setLetter(data.letter || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto">
        <GradientHeader eyebrow="Cover Letter" title="Cover Letter Generator" subtitle="Create a tailored, ATS-friendly cover letter for your next application" showBack />
        <div className="px-5 mt-6 space-y-6 pb-10">

          {/* ── Input Form ──────────────────────────────────────── */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-[var(--accent)]" />
              <h2 className="font-display text-base font-semibold">Job Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1.5 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-[var(--accent)]" /> Job Title
                </label>
                <input
                  type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Product Designer"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1.5 flex items-center gap-1.5">
                  <Building2 size={13} className="text-[var(--accent)]" /> Company
                </label>
                <input
                  type="text" value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[var(--accent)]" /> Key Skills <span className="text-[var(--text-muted)] font-normal">(comma-separated, optional)</span>
              </label>
              <input
                type="text" value={skills} onChange={e => setSkills(e.target.value)}
                placeholder="e.g. UX research, prototyping, design systems"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors"
              />
              {skills && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} className="text-[10px] font-medium bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => generate()}
              disabled={loading || !jobTitle || !company}
              className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              {loading ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          </div>

          {/* ── Error ───────────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-3">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* ── Result ──────────────────────────────────────────── */}
          {letter && (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]/50">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[var(--accent)]" />
                  <h2 className="font-display text-base font-semibold">Your Cover Letter</h2>
                  <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                    {letter.split(/\s+/).length} words
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generate(true)}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                  >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    Regenerate
                  </button>
                  <button
                    onClick={copy}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] border border-[var(--accent)] px-3 py-1.5 rounded-lg hover:bg-[var(--accent)]/5 transition-colors"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="prose prose-sm max-w-none">
                  {letter.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-[var(--text)] leading-relaxed mb-4 last:mb-0">{para}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
