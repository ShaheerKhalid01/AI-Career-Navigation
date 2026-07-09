'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

interface ResumeUploadProps {
  onFileSelect: (file: File | null) => void;
}

export default function ResumeUpload({ onFileSelect }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    onFileSelect(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const clear = () => {
    setFile(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="font-mono text-xs tracking-widest text-[var(--text-muted)] uppercase mb-2 block">
        01 — Flight Manifest (Resume)
      </label>

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-[var(--accent)] bg-[var(--surface-hover)]' : 'border-[var(--border)] bg-[var(--surface)]'}`}
        >
          <UploadCloud className="mx-auto mb-3 text-[var(--accent)]" size={32} />
          <p className="text-sm text-[var(--text)]">Drop your resume here, or click to browse</p>
          <p className="font-mono text-xs text-[var(--text-muted)] mt-2">PDF or DOCX — max 5MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--surface)] rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="text-[var(--accent)]" size={20} />
            <span className="text-sm text-[var(--text)] truncate max-w-[240px]">{file.name}</span>
          </div>
          <button onClick={clear} className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}