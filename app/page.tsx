'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setAnalysisData, setLoading, setError, setHasResume } from '@/lib/store/resumeSlice';
import { generateRoadmapPdf } from '@/lib/pdfGenerator';
import GradientHeader from '@/components/common/GradientHeader';
import { useToast } from '@/components/common/ToastProvider';

// Components
import ResumeWorkspaceToolbar from '@/components/resume/ResumeWorkspaceToolbar';
import ResumeUploader from '@/components/resume/ResumeUploader';
import ResumePreview from '@/components/resume/ResumePreview';
import ATSScoreCard from '@/components/resume/ATSScoreCard';
import SuggestionsList from '@/components/resume/SuggestionsList';
import SkillMatchSummary from '@/components/resume/SkillMatchSummary';

function HomeContent() {
  const router = useRouter();
  const { token } = useAuth();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  const { loading, error, hasResume, analysisData } = useSelector(
    (state: RootState) => state.resume
  );
  const searchParams = useSearchParams();

  const toastShown = useRef(false);

  // Show toast for messages coming from redirects (e.g. from dashboard)
  useEffect(() => {
    const message = searchParams.get('message');
    if (message && !toastShown.current) {
      toastShown.current = true;
      showToast(message, 'info');
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    const stored = sessionStorage.getItem('navResult');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        dispatch(setAnalysisData(data));
      } catch {}
    }
  }, [dispatch]);

  const handleDownloadPdf = () => {
    if (!analysisData) {
      showToast('Analyze your resume first to generate a PDF report', 'info');
      return;
    }
    try {
      generateRoadmapPdf({
        targetRole: analysisData.targetRole || 'target-role',
        readinessScore: analysisData.analysis?.readinessScore || 0,
        matchedSkills: analysisData.analysis?.matchedSkills || [],
        missingSkills: analysisData.analysis?.missingSkills || [],
        weeks: analysisData.roadmap || [],
      });
      showToast('PDF report downloaded!', 'success');
    } catch {
      showToast('Could not generate PDF. Try analyzing first.', 'warning');
    }
  };

  const handleAnalyze = async (file: File, role: string) => {
    dispatch(setError(null));
    dispatch(setLoading(true));

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

      const finalData = { ...analyzeData, targetRole: role };
      sessionStorage.setItem('navResult', JSON.stringify(finalData));
      dispatch(setAnalysisData(finalData));

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

      router.push('/scores');
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] ">
      <div className="max-w-6xl mx-auto">
        
        <GradientHeader
          eyebrow="Resume"
          title="Resume"
          subtitle="Build, refine, and optimize your resume with AI insights"
          showBack
        />

        <div className="px-5 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 animate-fade-in-up">
            <ResumeWorkspaceToolbar 
              onFileChange={() => dispatch(setHasResume(false))}
              onDownloadPdf={handleDownloadPdf} 
            />
            
            {!hasResume && (
              <ResumeUploader 
                onAnalyze={handleAnalyze} 
                loading={loading} 
                error={error} 
                onCancel={() => dispatch(setHasResume(true))}
              />
            )}

            {hasResume && <ResumePreview />}
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1 space-y-6">
            <ATSScoreCard />
            <SuggestionsList />
            <SkillMatchSummary />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <HomeContent />
    </Suspense>
  );
}
