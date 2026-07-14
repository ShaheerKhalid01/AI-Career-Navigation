'use client';

import { useState } from 'react';
import { BarChart3, Map, Users2, FileText, Info, Clock } from 'lucide-react';
import GradientHeader from '@/components/common/GradientHeader';

interface Feature {
  icon: typeof BarChart3;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: BarChart3,
    title: 'Smart Skill Scoring',
    description: 'Evaluate strengths, identify gaps, and track progress with clear score breakdowns.',
  },
  {
    icon: Map,
    title: 'Personal Roadmaps',
    description: 'Follow step-by-step guidance designed to move you toward your next role faster.',
  },
  {
    icon: Users2,
    title: 'Community Support',
    description: 'Learn from peers, share progress, and stay motivated with a supportive network.',
  },
  {
    icon: FileText,
    title: 'Resume Guidance',
    description: 'Improve your resume with targeted suggestions that align with your goals.',
  },
];

interface Step {
  number: string;
  label: string;
}

const STEPS: Step[] = [
  { number: '01', label: 'Assess' },
  { number: '02', label: 'Plan' },
  { number: '03', label: 'Grow' },
];

type Theme = 'Blue Theme';

export default function AboutPage() {
  const [activeTheme] = useState<Theme>('Blue Theme');

  return (
    <main className="min-h-screen bg-[var(--bg)] ">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <GradientHeader
          eyebrow="About"
          title="About Us"
          subtitle="Discover the mission, features, and team behind AI Career Navigator"
          showBack
        />

        {/* Main Content */}
        <div className="px-5 mt-6">
          {/* Mission Section */}
          <section className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 sm:p-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <Clock size={14} />
              Our Mission
            </div>

            <h2 className="font-display text-2xl sm:text-3xl leading-tight mb-4">
              Helping every career move feel clear, confident, and actionable.
            </h2>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
              AI Career Navigator combines resume insights, skill scoring, and guided roadmaps to help
              professionals understand where they stand and what to do next. The platform turns complex career
              planning into a simple, visual experience with practical recommendations tailored to each user.
            </p>
          </section>

          {/* Feature Cards */}
          <div className="mt-6 space-y-4">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 0.08}s` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-[var(--accent)]" />
                  </div>
                  <h3 className="font-display text-base font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* What makes us different */}
          <div
            className="mt-6 bg-[var(--surface-hover)] rounded-2xl border border-[var(--border)] p-6 sm:p-8 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                <Info size={18} className="text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold">What makes us different</h3>
                <p className="text-xs text-[var(--text-muted)]">A focused experience built for clarity and momentum.</p>
              </div>
            </div>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-3">
              We blend AI-driven analysis with a clean, human-centered interface so users can quickly understand
              their career position and next best actions.
            </p>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Every screen is designed to reduce friction, highlight priorities, and keep the journey visually
              calm and easy to follow.
            </p>
          </div>

          {/* Built for modern professionals */}
          <div
            className="mt-6 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 sm:p-8 animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display text-base font-semibold mb-1">Built for modern professionals</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Designed to support job seekers, career switchers, and growth-minded teams.
                </p>
              </div>
              <span className="inline-flex items-center text-xs font-medium text-[var(--accent)] border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">
                {activeTheme}
              </span>
            </div>

            <div className="space-y-3">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="bg-[var(--bg)] rounded-xl border border-[var(--border)] px-5 py-4"
                >
                  <p className="font-display text-xl font-bold">{step.number}</p>
                  <p className="text-sm text-[var(--text-muted)]">{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
