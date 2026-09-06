'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  msg: string;
  type?: ToastType;
  onClose?: () => void;
  duration?: number;
  /**
   * Force a specific theme for the toast regardless of system theme.
   * 'dark' will use dark background colors, 'light' will use light colors.
   */
  theme?: 'dark' | 'light';
}

const config: Record<ToastType, {
  icon: React.ReactNode;
  bar: string;
  bg: string;
  border: string;
  iconColor: string;
  title: string;
  titleColor: string;
  textColor: string;
  // Additional fields for forced theme styling
  lightBg: string;
  darkBg: string;
  lightBorder: string;
  darkBorder: string;
}> = {
  success: {
    icon: <CheckCircle size={20} />, 
    bar: 'bg-emerald-500',
    bg: 'bg-white dark:bg-[#1A1D27]',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-500',
    title: 'Success',
    titleColor: 'text-[var(--text)]',
    textColor: 'text-[var(--text)]',
    lightBg: 'bg-white',
    darkBg: 'bg-[#1A1D27]',
    lightBorder: 'border-emerald-200',
    darkBorder: 'border-emerald-800',
  },
  error: {
    icon: <XCircle size={20} />, 
    bar: 'bg-red-500',
    bg: 'bg-white dark:bg-[#1A1D27]',
    border: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
    title: 'Error',
    titleColor: 'text-[var(--text)]',
    textColor: 'text-[var(--text)]',
    lightBg: 'bg-white',
    darkBg: 'bg-[#1A1D27]',
    lightBorder: 'border-red-200',
    darkBorder: 'border-red-800',
  },
  info: {
    icon: <Info size={20} />, 
    bar: 'bg-blue-500',
    bg: 'bg-white dark:bg-[#1A1D27]',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
    title: 'Info',
    titleColor: 'text-[var(--text)]',
    textColor: 'text-[var(--text)]',
    lightBg: 'bg-white',
    darkBg: 'bg-[#1A1D27]',
    lightBorder: 'border-blue-200',
    darkBorder: 'border-blue-800',
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    bar: 'bg-amber-500',
    bg: 'bg-white dark:bg-[#1A1D27]',
    border: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-500',
    title: 'Heads up',
    titleColor: 'text-[var(--text)]',
    textColor: 'text-[var(--text)]',
    lightBg: 'bg-white',
    darkBg: 'bg-[#1A1D27]',
    lightBorder: 'border-amber-200',
    darkBorder: 'border-amber-800',
  },
};

export default function Toast({ msg, type = 'info', onClose, duration = 4000, theme }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const c = config[type];
  // Determine if we should force dark or light styles
  const isDark = theme === 'dark' || (!theme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

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
        ${isDark ? c.darkBg : c.lightBg} border ${isDark ? c.darkBorder : c.lightBorder}
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
        <p className={`text-xs font-semibold ${c.titleColor} uppercase tracking-widest mb-0.5`}>
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
        className="shrink-0 mt-0.5 text-white hover:text-white transition-colors rounded-lg p-0.5"
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
