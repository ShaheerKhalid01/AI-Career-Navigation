'use client';

import WeekCard from './WeekCard';

interface Week {
  weekNumber: number;
  topics: string[];
  resources: { title: string; url: string }[];
  miniProjects: string[];
}

interface RoadmapViewProps {
  weeks: Week[];
}

export default function RoadmapView({ weeks }: RoadmapViewProps) {
  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-[var(--text-muted)] uppercase mb-6">
        Flight Path — {weeks.length} Week Route
      </p>
      <div>
        {weeks.map((week, i) => (
          <WeekCard key={week.weekNumber} {...week} isLast={i === weeks.length - 1} />
        ))}
      </div>
    </div>
  );
}