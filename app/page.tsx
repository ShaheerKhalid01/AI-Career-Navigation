'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ResumeUpload from '@/components/ResumeUpload/ResumeUpload';
import RoleSelector from '@/components/RoleSelector/RoleSelector';
import { Loader2, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!file || !role) {
      setError('Select a resume and a target role before launch.');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: uploadData.resumeId }),
      });
      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok) throw new Error(analyzeData.error || 'Analysis failed');

      sessionStorage.setItem('navResult', JSON.stringify(analyzeData));
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Cannot reach the server. Check that it is running and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen radar-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-10">
          <span className="font-mono text-xs tracking-widest text-[var(--accent)]">CAREER NAVIGATOR</span>
          <h1 className="font-display text-4xl font-semibold mt-2 leading-tight">
            Plot your route to<br />the role you want.
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-3">
            Upload your resume, pick a destination role, and get a week-by-week flight plan for the skills you're missing.
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-6">
          <ResumeUpload onFileSelect={setFile} />
          <RoleSelector value={role} onChange={setRole} />

          {error && (
            <p className="text-sm text-[var(--danger)] font-mono">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[var(--accent)] text-[var(--bg)] font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[var(--accent-dim)] transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Plotting your course...
              </>
            ) : (
              <>
                Chart My Roadmap
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}