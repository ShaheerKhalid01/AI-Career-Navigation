'use client';

import { useState, useEffect } from 'react';
import { Mic, ChevronDown, ChevronUp, Lightbulb, Loader2, RefreshCw, Sparkles, BookOpen, Target, AlertCircle, Send, CheckCircle, XCircle, Star } from 'lucide-react';
import GradientHeader from '@/components/common/GradientHeader';

interface Question {
  id: number;
  question: string;
  category: string;
  answer: string;
  open: boolean;
}

interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
}

const DEFAULT_QUESTIONS: Question[] = [
  { id: 1, question: 'Tell me about yourself.', category: 'General', answer: 'Focus on your current role, key achievements, and why you are interested in this opportunity. Keep it concise and relevant to the job.', open: false },
  { id: 2, question: 'Why do you want to work here?', category: 'General', answer: 'Research the company beforehand. Mention specific projects, values, or aspects of their work that align with your career goals.', open: false },
  { id: 3, question: 'Describe a challenge you overcame at work.', category: 'Behavioral', answer: 'Use the STAR method: Situation, Task, Action, Result. Be specific about your role and the outcome.', open: false },
  { id: 4, question: 'Where do you see yourself in 5 years?', category: 'General', answer: 'Show ambition aligned with the role. Mention skills you want to develop and how they connect to the company\'s growth.', open: false },
  { id: 5, question: 'Tell me about a time you worked in a team.', category: 'Behavioral', answer: 'Describe a collaborative project. Highlight your specific contribution and how the team achieved its goal.', open: false },
  { id: 6, question: 'What is your greatest weakness?', category: 'General', answer: 'Be honest but choose a weakness that is not critical for the role. Explain steps you are taking to improve.', open: false },
  { id: 7, question: 'How do you handle pressure or stressful situations?', category: 'Behavioral', answer: 'Give a concrete example. Mention specific techniques you use like prioritization, delegation, or mindfulness.', open: false },
  { id: 8, question: 'Why should we hire you?', category: 'General', answer: 'Summarize your unique value proposition. Connect your skills and experience directly to the job requirements.', open: false },
];

export default function InterviewPrepPage() {
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [generatedQs, setGeneratedQs] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'behavioral' | 'technical'>('all');
  const [targetRole, setTargetRole] = useState('');
  const [error, setError] = useState('');

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [evaluating, setEvaluating] = useState<Record<number, boolean>>({});
  const [evaluations, setEvaluations] = useState<Record<number, Evaluation>>({});

  useEffect(() => {
    const stored = sessionStorage.getItem('navResult');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const role = data.targetRole?.replace(/-/g, ' ') || '';
        if (role) setTargetRole(role);
      } catch {}
    }
  }, []);

  const generateQuestions = async () => {
    if (!targetRole.trim()) return;
    setGenerating(true);
    setError('');

    const stored = sessionStorage.getItem('navResult');
    const skills = stored ? (JSON.parse(stored).extractedSkills || []) : [];

    try {
      const res = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: targetRole.trim(), skills }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      const newQs: Question[] = (data.questions || []).map((q: any, i: number) => ({
        id: 100 + i,
        question: q.question,
        category: q.category,
        answer: q.answer,
        open: false,
      }));
      setGeneratedQs(newQs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const evaluateAnswer = async (q: Question) => {
    const answer = userAnswers[q.id]?.trim();
    if (!answer) return;

    setEvaluating(prev => ({ ...prev, [q.id]: true }));
    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.question, answer, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed');
      setEvaluations(prev => ({ ...prev, [q.id]: data }));
    } catch {
      setEvaluations(prev => ({ ...prev, [q.id]: { score: 0, strengths: [], improvements: ['Failed to evaluate. Try again.'], sampleAnswer: '' } }));
    } finally {
      setEvaluating(prev => ({ ...prev, [q.id]: false }));
    }
  };

  const allQuestions = [...generatedQs, ...questions];
  const filteredQuestions = activeTab === 'all' ? allQuestions : allQuestions.filter(q => q.category.toLowerCase() === activeTab);

  const toggle = (id: number) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, open: !q.open } : q));
    setGeneratedQs(prev => prev.map(q => q.id === id ? { ...q, open: !q.open } : q));
  };

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto">
        <GradientHeader eyebrow="Interview Prep" title="Interview Preparation" subtitle="Practice with role-specific questions and get AI-powered feedback" showBack />
        <div className="px-5 mt-6 space-y-6 pb-10">

          {/* ── AI Question Generator ───────────────────────────── */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-[var(--accent)]" />
              <h2 className="font-display text-base font-semibold">AI Question Generator</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">Generate realistic interview questions tailored to your target role</p>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <button
                onClick={generateQuestions}
                disabled={generating || !targetRole.trim()}
                className="flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {generating ? <Loader2 className="animate-spin" size={16} /> : <Target size={16} />}
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>

            {generatedQs.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] text-[var(--success)] bg-[var(--success)]/10 px-2 py-0.5 rounded-full font-medium">
                  {generatedQs.length} questions generated for {targetRole}
                </span>
                <button
                  onClick={() => { setGeneratedQs([]); setEvaluations({}); setUserAnswers({}); }}
                  className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] underline ml-auto"
                >
                  Clear
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

          {/* ── Category Tabs ───────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'general', 'behavioral', ...(generatedQs.some(q => q.category.toLowerCase() === 'technical') ? ['technical' as const] : [])] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-medium px-4 py-2 rounded-full capitalize transition-colors ${
                  activeTab === tab ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'
                }`}
              >
                {tab === 'all' ? `All (${allQuestions.length})` : `${tab} (${allQuestions.filter(q => q.category.toLowerCase() === tab).length})`}
              </button>
            ))}
            {generatedQs.length > 0 && (
              <button
                onClick={() => { setGeneratedQs([]); setEvaluations({}); setUserAnswers({}); }}
                className="text-xs text-[var(--text-muted)] hover:text-red-500 ml-auto transition-colors"
              >
                Reset to defaults
              </button>
            )}
          </div>

          {/* ── Questions List ──────────────────────────────────── */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-16 text-[var(--text-muted)]">
                <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No questions in this category</p>
                <p className="text-xs mt-1">Try generating role-specific questions above</p>
              </div>
            ) : filteredQuestions.map(q => {
              const evaluation = evaluations[q.id];
              const isEvaluating = evaluating[q.id];

              return (
                <div key={q.id} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-[var(--accent)]/20 transition-colors">
                  <button
                    onClick={() => toggle(q.id)}
                    className="w-full flex items-center justify-between p-4 md:p-5 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Mic size={14} className="text-[var(--accent)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text)] leading-snug">{q.question}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            q.category === 'Behavioral' ? 'bg-purple-500/10 text-purple-500' :
                            q.category === 'Technical' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-[var(--accent)]/10 text-[var(--accent)]'
                          }`}>
                            {q.category}
                          </span>
                          {q.id >= 100 && (
                            <span className="text-[10px] text-[var(--accent)] font-medium">AI-generated</span>
                          )}
                          {evaluation && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              evaluation.score >= 70 ? 'text-green-500 bg-green-500/10' :
                              evaluation.score >= 40 ? 'text-yellow-500 bg-yellow-500/10' :
                              'text-red-500 bg-red-500/10'
                            }`}>
                              Score: {evaluation.score}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {q.open ? <ChevronUp size={16} className="text-[var(--text-muted)] flex-shrink-0 ml-2" /> : <ChevronDown size={16} className="text-[var(--text-muted)] flex-shrink-0 ml-2" />}
                  </button>

                  {q.open && (
                    <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-[var(--border)] pt-3 animate-fade-in-up space-y-4">
                      {/* Tip */}
                      <div className="flex items-start gap-2.5 bg-[var(--bg)] rounded-xl p-4">
                        <Lightbulb size={14} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)] mb-1">Tip</p>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">{q.answer}</p>
                        </div>
                      </div>

                      {/* Answer input */}
                      <div>
                        <label className="text-[11px] font-medium text-[var(--text)] mb-1.5 block">Your Answer</label>
                        <textarea
                          value={userAnswers[q.id] || ''}
                          onChange={e => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="Type your answer here (use STAR method for behavioral questions)..."
                          rows={4}
                          maxLength={2000}
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm outline-none focus:border-[var(--accent)] transition-colors resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-[var(--text-muted)]">{(userAnswers[q.id] || '').length}/2000</span>
                          <button
                            onClick={() => evaluateAnswer(q)}
                            disabled={!userAnswers[q.id]?.trim() || isEvaluating}
                            className="flex items-center gap-1.5 bg-[var(--accent)] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-50"
                          >
                            {isEvaluating ? <Loader2 className="animate-spin" size={13} /> : <Send size={13} />}
                            {isEvaluating ? 'Evaluating...' : 'Submit for Review'}
                          </button>
                        </div>
                      </div>

                      {/* Evaluation Result */}
                      {evaluation && !isEvaluating && (
                        <div className="bg-[var(--bg)] rounded-xl border border-[var(--border)] p-4 space-y-3">
                          {/* Score */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[var(--text)]">Score</span>
                            <div className={`flex items-center gap-1 text-sm font-bold ${
                              evaluation.score >= 70 ? 'text-green-500' :
                              evaluation.score >= 40 ? 'text-yellow-500' :
                              'text-red-500'
                            }`}>
                              <Star size={14} fill="currentColor" />
                              {evaluation.score}/100
                            </div>
                          </div>

                          {/* Score bar */}
                          <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${
                              evaluation.score >= 70 ? 'bg-green-500' :
                              evaluation.score >= 40 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} style={{ width: `${evaluation.score}%` }} />
                          </div>

                          {/* Strengths */}
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

                          {/* Improvements */}
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

                          {/* Sample Answer */}
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
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
