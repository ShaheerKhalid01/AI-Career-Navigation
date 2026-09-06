'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setAnalysisData, setLoading, setError, setToast, setHasResume } from '@/lib/store/resumeSlice';
import { generateRoadmapPdf } from '@/lib/pdfGenerator';
import GradientHeader from '@/components/common/GradientHeader';

// Components
import ResumeWorkspaceToolbar from '@/components/resume/ResumeWorkspaceToolbar';
import ResumeUploader from '@/components/resume/ResumeUploader';
import ResumePreview from '@/components/resume/ResumePreview';
import ATSScoreCard from '@/components/resume/ATSScoreCard';
import SuggestionsList from '@/components/resume/SuggestionsList';
import SkillMatchSummary from '@/components/resume/SkillMatchSummary';

export default function Home() {
  const router = useRouter();
  const { token } = useAuth();
  const dispatch = useDispatch();
  
  const { loading, error, hasResume, toast, analysisData } = useSelector(
    (state: RootState) => state.resume
  );

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => dispatch(setToast(null)), 2500);
      return () => clearTimeout(t);
    }
  }, [toast, dispatch]);

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
      dispatch(setToast({ msg: 'Analyze your resume first to generate a PDF report', type: 'info' }));
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
      dispatch(setToast({ msg: 'PDF report downloaded!', type: 'success' }));
    } catch {
      dispatch(setToast({ msg: 'Could not generate PDF. Try analyzing first.', type: 'info' }));
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
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in-up ${
            toast.type === 'success' ? 'bg-[var(--success)] text-white' : 'bg-[var(--accent)] text-white'
          }`}>
            {toast.msg}
          </div>
        )}
        
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
