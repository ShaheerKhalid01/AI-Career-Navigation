'use client';

interface ReadinessScoreProps {
  score: number;
}

export default function ReadinessScore({ score }: ReadinessScoreProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            fill="none" stroke="var(--border)" strokeWidth="10"
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="none" stroke="var(--accent)" strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-4xl font-semibold text-[var(--text)]">{score}%</span>
          <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] mt-1">READY</span>
        </div>
      </div>
    </div>
  );
}