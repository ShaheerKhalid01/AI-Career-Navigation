'use client';

interface WeekCardProps {
  weekNumber: number;
  topics: string[];
  resources: { title: string; url: string }[];
  miniProjects: string[];
  isLast: boolean;
}

export default function WeekCard({ weekNumber, topics, resources, miniProjects, isLast }: WeekCardProps) {
  return (
    <div
      className="relative pl-10 animate-fade-in-up"
      style={{ animationDelay: `${weekNumber * 80}ms`, opacity: 0 }}
    >
      <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center waypoint-pulse">
        <div className="w-2 h-2 rounded-full bg-[var(--bg)]" />
      </div>
      {!isLast && (
        <div className="absolute left-[9px] top-6 bottom-[-32px] w-[2px] border-l-2 border-dashed border-[var(--border)]" />
      )}

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 mb-8 hover-lift">
        <span className="font-mono text-xs tracking-widest text-[var(--accent)]">WEEK {String(weekNumber).padStart(2, '0')}</span>

        <div className="mt-3">
          <p className="text-xs text-[var(--text-muted)] mb-1">Topics</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <span
                key={t}
                className="text-xs bg-[var(--surface-hover)] border border-[var(--border)] rounded-full px-3 py-1 text-[var(--text)] transition-colors hover:border-[var(--accent)]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {resources.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-[var(--text-muted)] mb-1">Resources</p>
            <div className="flex flex-col gap-1">
              {resources.map((r) => (
                
                  <a key={r.title} 
href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--accent)] hover:underline transition-colors hover:text-[var(--accent-dim)] w-fit"
                >
                  {r.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {miniProjects.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-[var(--text-muted)] mb-1">Mini Project</p>
            <p className="text-sm text-[var(--text)]">{miniProjects[0]}</p>
          </div>
        )}
      </div>
    </div>
  );
}