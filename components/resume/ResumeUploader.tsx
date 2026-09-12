'use client';

import { useState, useEffect } from 'react';
import { UploadCloud, FolderOpen, FileText, X, ShieldCheck, Loader2, Wand2 } from 'lucide-react';
import RoleSelector from '@/components/RoleSelector/RoleSelector';

interface ResumeUploaderProps {
  onAnalyze: (file: File, role: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  initialFile?: File | null;
}

export default function ResumeUploader({ onAnalyze, loading, error, onCancel, initialFile }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [role, setRole] = useState('');
  const [showRoleStep, setShowRoleStep] = useState(!!initialFile);

  const handleFileChange = (f: File) => {
    setFile(f);
    setShowRoleStep(true);
  };

  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
      setShowRoleStep(true);
    }
  }, [initialFile]);

  const handleAnalyzeClick = () => {
    if (file && role) {
      onAnalyze(file, role);
    }
  };

  return (
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
          <button
            onClick={() => {
              setFile(null);
              setShowRoleStep(false);
              onCancel();
            }}
            className="text-[var(--text-muted)] hover:text-[var(--danger)]"
          >
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
        onClick={handleAnalyzeClick}
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
  );
}
