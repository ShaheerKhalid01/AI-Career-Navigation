import { FileText, UploadCloud, Download } from 'lucide-react';

interface ResumeWorkspaceToolbarProps {
  onFileChange: (file: File) => void;
  onDownloadPdf: () => void;
}

export default function ResumeWorkspaceToolbar({
  onFileChange,
  onDownloadPdf,
}: ResumeWorkspaceToolbarProps) {
  return (
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
              onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
            />
            <UploadCloud size={13} />
            Upload Resume
          </label>
          <button
            onClick={onDownloadPdf}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] border border-[var(--border)] px-3 py-2 rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            <Download size={13} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
