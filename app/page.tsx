'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import {
  UploadCloud,
  Download,
  Pencil,
  BarChart3,
  Lightbulb,
  Search,
  FileText,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Wrench,
  ClipboardCopy,
  Loader2,
  Wand2,
  X,
  FolderOpen,
  ShieldCheck,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { generateRoadmapPdf } from '@/lib/pdfGenerator';
import GradientHeader from '@/components/common/GradientHeader';
import RoleSelector from '@/components/RoleSelector/RoleSelector';

/* ------------------------------------------------------------------ */
/*  Type definitions                                                   */
/* ------------------------------------------------------------------ */

interface WorkEntry {
  title: string;
  period: string;
  description: string;
}

interface EducationEntry {
  degree: string;
  year: string;
}

interface Suggestion {
  icon: typeof Lightbulb;
  title: string;
  detail: string;
}

interface ResumeVersion {
  label: string;
  date: string;
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const WORK_EXPERIENCE: WorkEntry[] = [];

const EDUCATION: EducationEntry[] = [];

const SKILLS: string[] = [];

const SUGGESTIONS: Suggestion[] = [];

const RESUME_VERSIONS: ResumeVersion[] = [];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  const router = useRouter();
  const { token } = useAuth();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoleStep, setShowRoleStep] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [editingWorkIdx, setEditingWorkIdx] = useState<number | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [workDescriptions, setWorkDescriptions] = useState(WORK_EXPERIENCE.map(e => e.description));
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const showToast = (msg: string, type: 'success' | 'info' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Load analysis data from sessionStorage to show real resume info
  useEffect(() => {
    const stored = sessionStorage.getItem('navResult');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAnalysisData(data);
        if (data.analysis?.readinessScore != null) {
          setHasResume(true);
        }
        const skills = data.extractedSkills || data.analysis?.matchedSkills || [];
        if (skills.length > 0) {
          setSummaryText(`Professional with expertise in ${skills.slice(0, 5).join(', ')}.`);
        }
      } catch {}
    }
  }, []);

  const realSkills = analysisData?.analysis?.matchedSkills || analysisData?.extractedSkills || SKILLS;
  const realScore = analysisData?.atsCheck?.score ?? null;
  const realRole = analysisData?.targetRole || null;

  const handleDownloadPdf = () => {
    const stored = sessionStorage.getItem('navResult');
    if (!stored) {
      showToast('Analyze your resume first to generate a PDF report');
      return;
    }
    try {
      const data = JSON.parse(stored);
      generateRoadmapPdf({
        targetRole: data.targetRole || role || 'target-role',
        readinessScore: data.analysis?.readinessScore || 0,
        matchedSkills: data.analysis?.matchedSkills || [],
        missingSkills: data.analysis?.missingSkills || [],
        weeks: data.roadmap || [],
      });
      showToast('PDF report downloaded!', 'success');
    } catch {
      showToast('Could not generate PDF. Try analyzing first.');
    }
  };

  const handleFileChange = (f: File) => {
    setFile(f);
    setError('');
    setShowRoleStep(true);
    setHasResume(false);
  };

  const handleAnalyze = async () => {
    if (!file || !role) {
      setError('Please select a resume and a target role.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', role);

      const uploadRes = await fetch('/api/resume', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      const analyzeRes = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ resumeId: uploadData.resumeId }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || 'Analysis failed');

      sessionStorage.setItem('navResult', JSON.stringify({ ...analyzeData, targetRole: role }));

      const historyItem = {
        type: 'Resume Uploaded',
        title: `Resume Uploaded: ${file.name}`,
        desc: 'Resume successfully analyzed for job readiness and ATS compatibility.',
        date: new Date().toISOString(),
      };
      const existing = localStorage.getItem('navigatorHistory');
      const historyList = existing ? JSON.parse(existing) : [];
      historyList.unshift(historyItem);
      localStorage.setItem('navigatorHistory', JSON.stringify(historyList.slice(0, 30)));

      setLoading(false);
      router.push('/scores');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] ">
      <div className="max-w-6xl mx-auto">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in-up ${
            toast.type === 'success' ? 'bg-[var(--success)] text-white' : 'bg-[var(--accent)] text-white'
          }`}>
            {toast.msg}
          </div>
        )}
        {/* Header */}
        <GradientHeader
          eyebrow="Resume"
          title="Resume"
          subtitle="Build, refine, and optimize your resume with AI insights"
          showBack
        />

        {/* Content grid */}
        <div className="px-5 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT: Live Resume Preview ────────────────────────── */}
          <div className="lg:col-span-2 animate-fade-in-up">
            {/* Toolbar */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full mb-3">
                <FileText size={12} />
                Resume Workspace
              </span>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold">Live Resume Preview</h2>
                  <p className="text-xs text-[var(--text-muted)]">Review and refine your resume sections with AI-powered guidance.</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)] px-3 py-2 rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    />
                    <UploadCloud size={13} />
                    Upload Resume
                  </label>
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)] px-3 py-2 rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Download size={13} />
                    Download PDF
                  </button>

                </div>
              </div>
            </div>

            {/* File upload area (hidden when resume preview is shown) */}
            {!hasResume && (
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 mb-4">
                {!file ? (
                  <label className="block border-2 border-dashed border-[var(--accent)]/40 bg-[var(--accent)]/5 rounded-2xl p-10 text-center cursor-pointer hover:bg-[var(--accent)]/10 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    />
                    <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-4">
                      <UploadCloud size={28} className="text-[var(--accent)]" />
                    </div>
                    <p className="font-semibold mb-1">Tap to upload or drag your resume here</p>
                    <p className="text-sm text-[var(--text-muted)] mb-5">PDF, DOCX</p>
                    <span className="inline-flex items-center gap-2 bg-[var(--accent)] text-white text-sm font-medium px-5 py-2.5 rounded-full">
                      <FolderOpen size={16} />
                      Browse Files
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                        <FileText size={18} className="text-[var(--accent)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[240px]">{file.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">Ready to analyze</p>
                      </div>
                    </div>
                    <button onClick={() => { setFile(null); setShowRoleStep(false); setHasResume(true); }} className="text-[var(--text-muted)] hover:text-[var(--danger)]">
                      <X size={18} />
                    </button>
                  </div>
                )}

                <div className="flex items-start gap-2 mt-4 text-xs text-[var(--text-muted)]">
                  <ShieldCheck size={16} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
                  <p>Supported files: PDF and DOCX up to 10MB. Your data is encrypted and never shared.</p>
                </div>

                {showRoleStep && (
                  <div className="mt-6 animate-fade-in-up">
                    <RoleSelector value={role} onChange={setRole} />
                  </div>
                )}

                {error && <p className="text-sm text-[var(--danger)] mt-4">{error}</p>}

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !file || !role}
                  className="w-full bg-[var(--accent)] text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-2 mt-6 hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Resume Preview Card */}
            {hasResume && (
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
                      {/* Matched */}
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
                      {/* Missing */}
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
            )}
          </div>

          {/* ── RIGHT: Sidebar ──────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">
            {/* ATS Score — real or fallback */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-base font-semibold">ATS Score</h2>
                <BarChart3 size={16} className="text-[var(--accent)]" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">Your resume readiness at a glance.</p>

              {analysisData ? (
                <>
                  <div className="flex items-end justify-between mb-3">
                    <p className="text-5xl font-bold text-[var(--text)]">{analysisData.atsCheck?.score ?? 0}</p>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full mb-1 ${
                      (analysisData.atsCheck?.score ?? 0) > 70
                        ? 'text-[var(--success)] bg-[var(--success)]/10'
                        : (analysisData.atsCheck?.score ?? 0) > 40
                        ? 'text-orange-500 bg-orange-100'
                        : 'text-[var(--danger)] bg-red-100'
                    }`}>
                      {(analysisData.atsCheck?.score ?? 0) > 70 ? 'Strong Match' : (analysisData.atsCheck?.score ?? 0) > 40 ? 'Needs Work' : 'Poor Match'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
                    <span>Optimization progress</span>
                    <span>{analysisData.atsCheck?.score ?? 0}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg)] mb-4">
                    <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${analysisData.atsCheck?.score ?? 0}%` }} />
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

            {/* Suggestions — real or fallback */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display text-base font-semibold">Suggestions</h2>
                <Lightbulb size={16} className="text-[var(--accent)]" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">AI-generated improvements to strengthen your resume.</p>

              {analysisData?.atsCheck?.suggestions?.length > 0 ? (
                <div className="space-y-3">
                  {analysisData.atsCheck.suggestions.slice(0, 3).map((s: string, i: number) => (
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
                        onClick={() => {
                          summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setEditingSummary(true);
                          showToast('Tip: ' + s.detail);
                        }}
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

            {/* Skill Match — replaces old Resume Versions */}
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
                        onClick={() => showToast(`Restored ${v.label} from ${v.date}`)}
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
          </div>
        </div>
      </div>
    </main>
  );
}
