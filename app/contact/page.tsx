'use client';

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Mail, Phone, MessageCircle, ChevronRight, Send } from 'lucide-react';
import GradientHeader from '@/components/common/GradientHeader';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactChannel {
  icon: typeof Mail;
  iconColor: string;
  iconBg: string;
  label: string;
  detail: string;
  href: string;
}

const CONTACT_CHANNELS: ContactChannel[] = [
  {
    icon: Mail,
    iconColor: 'text-[var(--accent)]',
    iconBg: 'bg-[var(--accent)]/10',
    label: 'Email',
    detail: 'support@aicareernavigator.com',
    href: 'mailto:support@aicareernavigator.com',
  },
  {
    icon: Phone,
    iconColor: 'text-[var(--accent)]',
    iconBg: 'bg-[var(--accent)]/10',
    label: 'Phone',
    detail: '+1 (555) 014-2026',
    href: 'tel:+15550142026',
  },
  {
    icon: MessageCircle,
    iconColor: 'text-[var(--accent)]',
    iconBg: 'bg-[var(--accent)]/10',
    label: 'Live Chat',
    detail: 'Available Mon-Fri, 9am-6pm',
    href: 'mailto:support@aicareernavigator.com?subject=Live%20Chat%20Request',
  },
];

const SOCIAL_LINKS = [
  {
    label: 'Twitter',
    href: 'https://twitter.com/aicareernav',
    svg: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/aicareernavigator',
    svg: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/anomalyco/ai-career-navigator',
    svg: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send');
      setSending(false);
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setSending(false);
      setToast({ msg: err instanceof Error ? err.message : 'Failed to send message.', type: 'error' });
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] ">
      <div className="max-w-5xl mx-auto">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in-up ${
            toast.type === 'success' ? 'bg-[var(--success)] text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.msg}
          </div>
        )}
        {/* Header */}
        <GradientHeader
          eyebrow="Contact"
          title="Contact Us"
          subtitle="We'd love to hear from you"
          showBack
        />

        {/* Content */}
        <div className="px-5 mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — Contact Form */}
          <div className="lg:col-span-3 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-[var(--text)] mb-1.5">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/60 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-[var(--text)] mb-1.5">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/60 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/60 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/60 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all resize-none"
                />
              </div>

              {/* Footer row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <p className="text-xs text-[var(--text-muted)] max-w-xs">
                  Share your question, feedback, or partnership idea and our team will get back to you as soon as possible.
                </p>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-dim)] text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  <Send size={16} />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>

              {sent && (
                <p className="text-sm text-[var(--success)] font-medium animate-fade-in-up">
                  ✓ Message sent! We'll get back to you shortly.
                </p>
              )}
            </form>
          </div>

          {/* Right — Sidebar */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Other Ways to Reach Us */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
              <h2 className="font-display text-lg mb-1">Other Ways to Reach Us</h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">Choose the channel that works best for you.</p>

              <div className="space-y-3">
                {CONTACT_CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <a
                      key={ch.label}
                      href={ch.href}
                      className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-full ${ch.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={ch.iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)]">{ch.label}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{ch.detail}</p>
                      </div>
                      <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Connect With Us */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
              <h2 className="font-display text-lg mb-1">Connect With Us</h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">Follow updates and announcements across our social channels.</p>

              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                  >
                    {s.svg}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
