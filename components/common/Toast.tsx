'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  msg: string;
  type?: ToastType;
  onClose?: () => void;
  duration?: number;
}

const config: Record<ToastType, {
  icon: React.ReactNode;
  bar: string;
  bg: string;
  border: string;
  iconColor: string;
  title: string;
  textColor: string;
}> = {
  success: {
    icon: <CheckCircle size={20} />, 
    bar: 'bg-emerald-500',
    bg: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-white',
    title: 'Success',
    textColor: 'text-white',
  },
  error: {
    icon: <XCircle size={20} />, 
    bar: 'bg-red-500',
    bg: 'bg-red-500',
    border: 'border-red-200 dark:border-red-800',
    iconColor: 'text-white',
    title: 'Error',
    textColor: 'text-white',
  },
  info: {
    icon: <Info size={20} />,
    bar: 'bg-blue-500',
    bg: 'bg-[var(--accent)] text-white',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-white',
    title: 'Info',
    textColor: 'text-white',
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    bar: 'bg-amber-500',
    bg: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-500',
    title: 'Heads up',
    textColor: 'text-white',
  },
};

export default function Toast({ msg, type = 'info', onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const c = config[type];

  useEffect(() => {
    // Slide in
    const showTimer = setTimeout(() => setVisible(true), 10);

    // Progress bar countdown
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 30);

    // Auto-dismiss
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 400);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`
        relative flex items-start gap-3 w-[340px] max-w-[90vw]
        ${c.bg} border ${c.border}
        rounded-2xl shadow-2xl px-4 pt-4 pb-3 overflow-hidden
        transition-all duration-400 ease-out
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
      style={{
        transition: 'opacity 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1)',
        transform: visible ? 'translateX(0)' : 'translateX(2rem)',
      }}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${c.bar}`} />

      {/* Icon */}
      <div className={`mt-0.5 shrink-0 ${c.iconColor}`}>{c.icon}</div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-0.5">
          {c.title}
        </p>
        <p className={`text-sm font-medium ${c.textColor} leading-snug`}>{msg}</p>
      </div>

      {/* Close button */}
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose?.(), 400);
        }}
        className="shrink-0 mt-0.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-lg p-0.5"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-1 right-0 h-[2px] bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className={`h-full ${c.bar} transition-all`}
          style={{ width: `${progress}%`, transition: 'width 30ms linear' }}
        />
      </div>
    </div>
  );
}
