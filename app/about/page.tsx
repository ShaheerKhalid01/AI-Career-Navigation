import Link from 'next/link';
import { Compass, Target, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';

const VALUES = [
  { icon: Target, title: 'Precision over guesswork', desc: 'Skill matching runs on deterministic logic, not AI guesses — so your readiness score is consistent every time.' },
  { icon: Sparkles, title: 'Built for every field', desc: 'Fifteen career domains supported, from software engineering to HR to teaching — not just tech.' },
  { icon: ShieldCheck, title: 'Reliable resources', desc: 'Every roadmap link points to a real, verified resource — no broken or hallucinated URLs.' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <nav className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold flex items-center gap-2">
            <Compass size={18} className="text-[var(--accent)]" />
            Career Navigator
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <ArrowLeft size={15} />
            Home
          </Link>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-4 py-20">
        <span className="font-mono text-xs tracking-widest text-[var(--accent)] uppercase">About</span>
        <h1 className="font-display text-4xl font-semibold mt-3 mb-6 leading-[1.2]">
          A resume tool that tells you the truth.
        </h1>
        <p className="text-[var(--text-muted)] leading-relaxed mb-4">
          Most resume tools either flatter you with an inflated score or bury you in vague advice. Career Navigator
          takes a different approach: it compares your actual skills against what a role really requires, tells you
          exactly what's missing, and hands you a week-by-week plan to close the gap.
        </p>
        <p className="text-[var(--text-muted)] leading-relaxed mb-14">
          It combines AI for the parts that need judgment — like evaluating writing quality — with plain code for the
          parts that need to be exact, like matching skills. That mix is what keeps the results consistent instead
          of random.
        </p>

        <div className="grid sm:grid-cols-3 gap-8">
          {VALUES.map((v) => (
            <div key={v.title}>
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                <v.icon size={18} className="text-[var(--accent)]" />
              </div>
              <h3 className="font-display text-base font-semibold mb-1.5">{v.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>© 2026 Career Navigator</span>
          <span className="font-mono">Built with Next.js</span>
        </div>
      </footer>
    </main>
  );
}