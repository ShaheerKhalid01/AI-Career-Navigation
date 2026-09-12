'use client';

import { useState, useEffect, useMemo } from 'react';
import { Mic, ChevronDown, ChevronUp, Lightbulb, Loader2, Sparkles, BookOpen, AlertCircle, Send, CheckCircle, XCircle, Star, Shield, Flame, Gauge, Lock, ArrowRight } from 'lucide-react';
import GradientHeader from '@/components/common/GradientHeader';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: Difficulty;
  answer: string;
  open: boolean;
}

interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
}

const DIFFICULTY_ORDER: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const DIFFICULTY_META: Record<
  Difficulty,
  {
    label: string;
    icon: typeof Shield;
    accent: string;
    chipBg: string;
    chipText: string;
    description: string;
    border: string;
    lockText: string;
  }
> = {
  Easy: {
    label: 'Easy',
    icon: Shield,
    accent: 'text-emerald-600',
    chipBg: 'bg-emerald-500/10',
    chipText: 'text-emerald-500',
    border: 'border-emerald-500/20',
    description: 'Warm-up questions. Icebreakers, background, basic role fit. Be concise and friendly.',
    lockText: 'Set a target role above to generate this level.',
  },
  Medium: {
    label: 'Medium',
    icon: Gauge,
    accent: 'text-amber-600',
    chipBg: 'bg-amber-500/10',
    chipText: 'text-amber-500',
    border: 'border-amber-500/20',
    description: 'Substantive questions. Bring concrete examples, use the STAR method, show your process.',
    lockText: 'Complete & submit all Easy questions to unlock Medium.',
  },
  Hard: {
    label: 'Hard',
    icon: Flame,
    accent: 'text-red-600',
    chipBg: 'bg-red-500/10',
    chipText: 'text-red-500',
    border: 'border-red-500/20',
    description: 'Pressure tests: mistakes, weaknesses, design, why-you. Be honest, structured, and self-aware.',
    lockText: 'Complete & submit all Medium questions to unlock Hard.',
  },
};

// Reserve id ranges per difficulty so answers/evaluations never collide across levels
const ID_BASE: Record<Difficulty, number> = { Easy: 100, Medium: 200, Hard: 300 };

export default function InterviewPrepPage() {
  const [generatedQs, setGeneratedQs] = useState<Question[]>([]);
  const [generatingLevel, setGeneratingLevel] = useState<Difficulty | null>(null);
  const [freeMode, setFreeMode] = useState(false); // when true, any level can be generated/practiced regardless of lock
  const [targetRole, setTargetRole] = useState('');
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userMissingSkills, setUserMissingSkills] = useState<string[]>([]);
  const [error, setError] = useState('');

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [evaluating, setEvaluating] = useState<Record<number, boolean>>({});
  const [evaluations, setEvaluations] = useState<Record<number, Evaluation>>({});

  // ── Pull role + skills from the uploaded resume if any ──────────
  useEffect(() => {
    const stored = sessionStorage.getItem('navResult');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const role = data.targetRole?.replace(/-/g, ' ') || '';
        if (role) setTargetRole(role);

        const matched = data.analysis?.matchedSkills || [];
        const extracted = data.extractedSkills || [];
        const combined = Array.from(new Set([...matched, ...extracted])).slice(0, 8);
        if (combined.length > 0) setUserSkills(combined);

        const missing = data.analysis?.missingSkills || [];
        if (missing.length > 0) setUserMissingSkills(missing);
      } catch {}
    }
  }, []);

  const normalizedDifficulty = (d: string, fallback: Difficulty): Difficulty => {
    const lower = d?.toLowerCase();
    if (lower === 'easy') return 'Easy';
    if (lower === 'medium') return 'Medium';
    if (lower === 'hard' || lower === 'difficult') return 'Hard';
    return fallback;
  };

  // Generate the 3 questions for ONE requested difficulty level
  const generateLevel = async (level: Difficulty) => {
    if (!targetRole.trim()) return;
    setGeneratingLevel(level);
    setError('');

    try {
      const res = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: targetRole.trim(),
          skills: userSkills,
          missingSkills: userMissingSkills,
          difficulty: level,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');

      const base = ID_BASE[level];
      const newQs: Question[] = (data.questions || []).slice(0, 3).map((q: any, i: number) => ({
        id: base + i,
        question: q.question,
        category: q.category || 'General',
        difficulty: normalizedDifficulty(q.difficulty || '', level),
        answer: q.answer || '',
        open: false,
      }));

      // Replace any previous questions/answers/evaluations for this level, keep other levels intact
      setGeneratedQs((prev) => [...prev.filter((q) => q.difficulty !== level), ...newQs]);
      setUserAnswers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (Number(k) >= base && Number(k) < base + 100) delete next[Number(k)];
        });
        return next;
      });
      setEvaluations((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (Number(k) >= base && Number(k) < base + 100) delete next[Number(k)];
        });
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setGeneratingLevel(null);
    }
  };

  const evaluateAnswer = async (q: Question) => {
    const answer = userAnswers[q.id]?.trim();
    if (!answer || answer.length < 20) {
      setEvaluations((prev) => ({
        ...prev,
        [q.id]: {
          score: 0,
          strengths: [],
          improvements: [
            'Please write a more detailed answer (at least 20 characters) before submitting for evaluation.',
          ],
          sampleAnswer: '',
        },
      }));
      return;
    }

    setEvaluating((prev) => ({ ...prev, [q.id]: true }));
    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.question, answer, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed');
      setEvaluations((prev) => ({ ...prev, [q.id]: data }));
    } catch {
      setEvaluations((prev) => ({
        ...prev,
        [q.id]: { score: 0, strengths: [], improvements: ['Failed to evaluate. Try again.'], sampleAnswer: '' },
      }));
    } finally {
      setEvaluating((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  // ── Grouping + progressive unlock logic ─────────────────────────
  const groupedQuestions = useMemo(() => {
    return DIFFICULTY_ORDER.map((d) => ({
      difficulty: d,
      items: generatedQs.filter((q) => q.difficulty === d),
    }));
  }, [generatedQs]);

  const completedCountByDifficulty = useMemo(() => {
    const counts: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
    DIFFICULTY_ORDER.forEach((d) => {
      const items = generatedQs.filter((q) => q.difficulty === d);
      counts[d] = items.reduce((sum, q) => {
        const ev = evaluations[q.id];
        if (!ev) return sum;
        const hasRealEvaluation =
          (ev.strengths && ev.strengths.length > 0) ||
          (ev.improvements && ev.improvements.length > 0 && !ev.improvements[0]?.includes('at least 20 characters')) ||
          (ev.sampleAnswer && ev.sampleAnswer.length > 0);
        return hasRealEvaluation ? sum + 1 : sum;
      }, 0);
    });
    return counts;
  }, [generatedQs, evaluations]);

  /** A difficulty level is "unlocked" (i.e. its Generate button is available / its questions are shown) if:
   *  - Easy: unlocked as soon as a target role is entered
   *  - Medium: ALL Easy questions have been generated AND submitted/evaluated
   *  - Hard:   ALL Medium questions have been generated AND submitted/evaluated
   */
  const isUnlocked = (d: Difficulty): boolean => {
    if (freeMode) return targetRole.trim().length > 0;
    if (d === 'Easy') return targetRole.trim().length > 0;
    const prev = DIFFICULTY_ORDER[DIFFICULTY_ORDER.indexOf(d) - 1];
    const prevQuestions = generatedQs.filter((q) => q.difficulty === prev);
    if (prevQuestions.length === 0) return false;
    const prevEvaluatedCount = completedCountByDifficulty[prev];
    return prevEvaluatedCount >= prevQuestions.length;
  };

  const toggle = (id: number) => {
    setGeneratedQs((prev) => prev.map((q) => (q.id === id ? { ...q, open: !q.open } : q)));
  };

  const clearAll = () => {
    setGeneratedQs([]);
    setEvaluations({});
    setUserAnswers({});
  };

  // ────────────────────────────────────────────────────────────────
  // Question Card Component
  // ────────────────────────────────────────────────────────────────
  const QuestionCard = ({ q }: { q: Question }) => {
    const evaluation = evaluations[q.id];
    const isEvaluating = evaluating[q.id];
    const meta = DIFFICULTY_META[q.difficulty];
    const isSubmitted = !!evaluation;

    return (
      <div
        className={`bg-[var(--surface)] rounded-2xl border ${meta.border} overflow-hidden hover:border-[var(--accent)]/40 transition-colors`}
      >
        <button
          onClick={() => toggle(q.id)}
          className="w-full flex items-center justify-between p-4 md:p-5 text-left"
        >
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full ${meta.chipBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Mic size={14} className={meta.accent} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text)] leading-snug">{q.question}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${meta.chipBg} ${meta.chipText} flex items-center gap-1`}
                >
                  {(() => {
                    const I = meta.icon;
                    return <I size={10} />;
                  })()}
                  {q.difficulty}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                  {q.category}
                </span>
                <span className="text-[10px] text-[var(--accent)] font-medium">AI · Skills-based</span>
                {isSubmitted && !evaluating[q.id] && evaluation && (
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      evaluation.score >= 70
                        ? 'text-green-500 bg-green-500/10'
                        : evaluation.score >= 40
                        ? 'text-yellow-500 bg-yellow-500/10'
                        : 'text-red-500 bg-red-500/10'
                    }`}
                  >
                    Score: {evaluation.score}
                  </span>
                )}
                {!isSubmitted && !evaluating[q.id] && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-orange-500 bg-orange-500/10">
                    Pending answer
                  </span>
                )}
              </div>
            </div>
          </div>
          {q.open ? (
            <ChevronUp size={16} className="text-[var(--text-muted)] flex-shrink-0 ml-2" />
          ) : (
            <ChevronDown size={16} className="text-[var(--text-muted)] flex-shrink-0 ml-2" />
          )}
        </button>

        {q.open && (
          <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-[var(--border)] pt-3 animate-fade-in-up space-y-4">
            {/* Tip */}
            <div className="flex items-start gap-2.5 bg-[var(--bg)] rounded-xl p-4">
              <Lightbulb size={14} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)] mb-1">
                  How to Answer
                </p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{q.answer}</p>
              </div>
            </div>

            {/* Answer input */}
            <div>
              <label className="text-[11px] font-medium text-[var(--text)] mb-1.5 block">Your Answer</label>
              <textarea
                value={userAnswers[q.id] || ''}
                onChange={(e) => setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Type your answer here..."
                rows={4}
                maxLength={2000}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-[var(--text-muted)]">
                  {(userAnswers[q.id] || '').length}/2000
                </span>
                <button
                  onClick={() => evaluateAnswer(q)}
                  disabled={!userAnswers[q.id]?.trim() || isEvaluating}
                  className="flex items-center gap-1.5 bg-[var(--accent)] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-50"
                >
                  {isEvaluating ? <Loader2 className="animate-spin" size={13} /> : <Send size={13} />}
                  {isEvaluating ? 'Evaluating...' : isSubmitted ? 'Re-submit Review' : 'Submit for Review'}
                </button>
              </div>
            </div>

            {/* Evaluation Result */}
            {evaluation && !isEvaluating && (
              <div className="bg-[var(--bg)] rounded-xl border border-[var(--border)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text)]">Score</span>
                  <div
                    className={`flex items-center gap-1 text-sm font-bold ${
                      evaluation.score >= 70
                        ? 'text-green-500'
                        : evaluation.score >= 40
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    <Star size={14} fill="currentColor" />
                    {evaluation.score}/100
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      evaluation.score >= 70
                        ? 'bg-green-500'
                        : evaluation.score >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${evaluation.score}%` }}
                  />
                </div>
                {evaluation.strengths.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-green-600 mb-1.5 flex items-center gap-1">
                      <CheckCircle size={12} /> Strengths
                    </p>
                    <ul className="space-y-1">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-[var(--text-muted)] flex items-start gap-1.5">
                          <span className="text-green-500 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {evaluation.improvements.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-orange-600 mb-1.5 flex items-center gap-1">
                      <XCircle size={12} /> Areas to Improve
                    </p>
                    <ul className="space-y-1">
                      {evaluation.improvements.map((s, i) => (
                        <li key={i} className="text-xs text-[var(--text-muted)] flex items-start gap-1.5">
                          <span className="text-orange-500 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {evaluation.sampleAnswer && (
                  <div className="border-t border-[var(--border)] pt-3">
                    <p className="text-[11px] font-semibold text-[var(--accent)] mb-1.5">Model Answer</p>
                    <p className="text-xs text-[var(--text-muted)] italic">{evaluation.sampleAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Locked / not-yet-generated banner (with its own Generate button when eligible) ──
  const LevelActionBanner = ({ level }: { level: Difficulty }) => {
    const meta = DIFFICULTY_META[level];
    const Icon = meta.icon;
    const unlocked = isUnlocked(level);
    const isGenerating = generatingLevel === level;
    const prev = DIFFICULTY_ORDER[DIFFICULTY_ORDER.indexOf(level) - 1];
    const prevMeta = prev ? DIFFICULTY_META[prev] : null;
    const prevCount = prev ? generatedQs.filter((q) => q.difficulty === prev).length : 0;
    const prevDone = prev ? completedCountByDifficulty[prev] : 0;

    return (
      <div
        className={`bg-[var(--surface)] rounded-2xl border ${
          unlocked ? meta.border : 'border-dashed border-[var(--border)]'
        } p-6 md:p-8 text-center`}
      >
        <div className={`w-12 h-12 rounded-full ${meta.chipBg} flex items-center justify-center mx-auto mb-3 ${unlocked ? '' : 'opacity-60'}`}>
          {unlocked ? <Icon size={20} className={meta.accent} /> : <Lock size={20} className={meta.accent} />}
        </div>
        <h4 className={`font-semibold mb-1 ${meta.accent}`}>
          {level} {unlocked ? '' : '· Locked'}
        </h4>
        <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
          {unlocked
            ? `Generate 3 ${level} questions${userSkills.length > 0 ? ', tailored to your resume skills' : ''}.`
            : freeMode
            ? 'Set a target role above to generate this level.'
            : meta.lockText}
        </p>

        {!freeMode && !unlocked && prev && prevMeta && prevCount > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-[var(--bg)] rounded-full px-4 py-2 text-xs border border-[var(--border)]">
            <span className={`font-semibold ${prevMeta.accent}`}>{prev} progress</span>
            <div className="w-28 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className={`h-full ${prevMeta.accent.replace('text-', 'bg-')}`}
                style={{ width: `${(prevDone / prevCount) * 100}%` }}
              />
            </div>
            <span className="font-semibold text-[var(--text-muted)]">
              {prevDone}/{prevCount}
            </span>
            <ArrowRight size={12} className="text-[var(--text-muted)]" />
            <span className={`font-bold ${meta.accent}`}>Unlock</span>
          </div>
        )}

        {unlocked && (
          <button
            onClick={() => generateLevel(level)}
            disabled={isGenerating || !targetRole.trim()}
            className="mt-4 inline-flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-60"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {isGenerating ? 'Generating...' : `Generate ${level} Questions`}
          </button>
        )}
      </div>
    );
  };

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────
  const hasAnyQuestions = generatedQs.length > 0;

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto">
        <GradientHeader
          eyebrow="Interview Prep"
          title="Interview Preparation"
          subtitle="Skill-based, progressive practice — Easy → Medium → Hard. Generate and complete each level to unlock the next."
          showBack
        />
        <div className="px-5 mt-6 space-y-6 pb-10">
          {/* ── Target role input ─────────────────────────────────── */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
            <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--accent)]" />
                <h2 className="font-display text-base font-semibold">AI Question Generator</h2>
              </div>
              <div className="flex items-center gap-1 bg-[var(--bg)] border border-[var(--border)] rounded-full p-1">
                <button
                  onClick={() => setFreeMode(false)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors ${
                    !freeMode ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Guided
                </button>
                <button
                  onClick={() => setFreeMode(true)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-full transition-colors ${
                    freeMode ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Free Practice
                </button>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              {freeMode ? (
                <>
                  <b>Free Practice:</b> generate and practice any difficulty level in any order — nothing is locked.
                </>
              ) : (
                <>
                  <b>Guided:</b> generate one difficulty level at a time — answer and submit all questions in a level
                  to unlock the next.
                </>
              )}
            </p>

            {userSkills.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)] mb-2">
                  Using skills from your resume
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {userSkills.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] font-medium text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full"
                    >
                      ✓ {s}
                    </span>
                  ))}
                  {userMissingSkills.slice(0, 4).map((s) => (
                    <span
                      key={`m-${s}`}
                      className="text-[11px] font-medium text-orange-600 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full"
                    >
                      ▲ Learn: {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              {!hasAnyQuestions && !freeMode && (
                <button
                  onClick={() => generateLevel('Easy')}
                  disabled={generatingLevel !== null || !targetRole.trim()}
                  className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {generatingLevel === 'Easy' ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {generatingLevel === 'Easy' ? 'Generating...' : 'Start with Easy'}
                </button>
              )}
            </div>

            {freeMode && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {DIFFICULTY_ORDER.map((d) => {
                  const m = DIFFICULTY_META[d];
                  const Icon = m.icon;
                  const isGen = generatingLevel === d;
                  return (
                    <button
                      key={d}
                      onClick={() => generateLevel(d)}
                      disabled={generatingLevel !== null || !targetRole.trim()}
                      className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl border ${m.border} ${m.chipBg} ${m.chipText} hover:opacity-80 transition-opacity disabled:opacity-50`}
                    >
                      {isGen ? <Loader2 className="animate-spin" size={13} /> : <Icon size={13} />}
                      {isGen ? 'Generating...' : `Generate ${d}`}
                    </button>
                  );
                })}
              </div>
            )}

            {hasAnyQuestions && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-[11px] text-[var(--success)] bg-[var(--success)]/10 px-2 py-0.5 rounded-full font-medium">
                  {generatedQs.length} AI questions for {targetRole}
                </span>
                {userSkills.length > 0 && (
                  <span className="text-[11px] text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full font-medium">
                    Skill-focused
                  </span>
                )}
                {DIFFICULTY_ORDER.map((d) => {
                  const m = DIFFICULTY_META[d];
                  const total = generatedQs.filter((q) => q.difficulty === d).length;
                  const done = completedCountByDifficulty[d];
                  if (total === 0) return null;
                  return (
                    <span
                      key={d}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.chipBg} ${m.chipText}`}
                    >
                      {d} {done}/{total}
                    </span>
                  );
                })}
                <button
                  onClick={clearAll}
                  className="text-[11px] text-[var(--text-muted)] hover:text-red-500 underline ml-auto transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2 mt-3">
                <AlertCircle size={13} />
                {error}
              </div>
            )}
          </div>

          {/* ── Empty state (before generating anything) ─────────── */}
          {!hasAnyQuestions && (
            <div className="text-center py-16 md:py-20 bg-[var(--surface)] rounded-2xl border border-dashed border-[var(--border)]">
              <BookOpen size={36} className="mx-auto mb-4 opacity-40 text-[var(--accent)]" />
              <p className="text-base font-semibold text-[var(--text)] mb-1">No questions yet</p>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
                Enter a target role above and click <b>Start with Easy</b> to generate your first 3 questions.
                Answer and submit them all to unlock Medium, then Hard.
              </p>
              {!userSkills.length && (
                <p className="text-[11px] text-[var(--accent)] mt-4">
                  💡 Upload your resume on the Resume page to get skills-focused questions.
                </p>
              )}
            </div>
          )}

          {/* ── Difficulty Sections (Easy → Medium → Hard) ────────── */}
          {hasAnyQuestions && (
            <div className="space-y-8">
              {groupedQuestions.map(({ difficulty, items }) => {
                const meta = DIFFICULTY_META[difficulty];
                const Icon = meta.icon;
                const unlocked = isUnlocked(difficulty);
                const total = items.length;
                const done = completedCountByDifficulty[difficulty];

                return (
                  <section key={difficulty} className="scroll-mt-6">
                    <div className="flex items-end gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${meta.chipBg} flex items-center justify-center`}>
                        <Icon size={18} className={meta.accent} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-display text-lg font-bold ${meta.accent}`}>
                            {difficulty}
                          </h3>
                          {total > 0 && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.chipBg} ${meta.chipText}`}
                            >
                              {total} Questions
                            </span>
                          )}
                          {!unlocked && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 flex items-center gap-1">
                              <Lock size={10} /> Locked
                            </span>
                          )}
                          {unlocked && total > 0 && (
                            <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                              Progress: {done}/{total}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{meta.description}</p>
                      </div>
                      {unlocked && total > 0 && (
                        <div className="flex-1 max-w-[160px] hidden md:block">
                          <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                done >= total ? 'bg-emerald-500' : meta.accent.replace('text-', 'bg-')
                              }`}
                              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {total === 0 ? (
                      <LevelActionBanner level={difficulty} />
                    ) : (
                      <div className="space-y-3">
                        {items.map((q) => (
                          <QuestionCard key={q.id} q={q} />
                        ))}
                        {!freeMode && unlocked && done >= total && difficulty !== 'Hard' && (
                          <p className="text-[11px] text-emerald-600 text-center pt-1">
                            ✓ {difficulty} complete — next level unlocked below.
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}