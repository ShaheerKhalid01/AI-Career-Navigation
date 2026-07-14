'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface GradientHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  icon?: React.ReactNode;
}

export default function GradientHeader({ eyebrow, title, subtitle, showBack, icon }: GradientHeaderProps) {
  const router = useRouter();

  return (
    <div className="gradient-header rounded-b-3xl lg:rounded-3xl px-5 lg:px-8 pt-8 pb-8 shadow-lg">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          {(showBack || icon) && (
            <button
              onClick={showBack ? () => router.back() : undefined}
              className="w-11 h-11 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0"
            >
              {showBack ? <ArrowLeft size={18} /> : icon}
            </button>
          )}
          <div>
            {eyebrow && (
              <p className="text-xs font-bold tracking-widest uppercase text-[var(--text)]/60 mb-1">{eyebrow}</p>
            )}
            <h1 className="font-display text-3xl text-[var(--text)] font-extrabold">{title}</h1>
            {subtitle && <p className="text-sm text-[var(--text)]/70 mt-1 font-medium">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}