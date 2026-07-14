'use client';

import { useEffect, useRef, useState } from 'react';
import { FileCheck, MessageSquare, TrendingUp } from 'lucide-react';

interface Stats {
  roadmapsGenerated: number;
  communityPosts: number;
  avgReadiness: number;
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stats>({ roadmapsGenerated: 0, communityPosts: 0, avgReadiness: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => { setStats(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const roadmaps = useCountUp(loaded ? stats.roadmapsGenerated : 0);
  const posts = useCountUp(loaded ? stats.communityPosts : 0);
  const readiness = useCountUp(loaded ? stats.avgReadiness : 0);

  const items = [
    { icon: FileCheck, value: roadmaps, suffix: '', label: 'Roadmaps generated' },
    { icon: MessageSquare, value: posts, suffix: '', label: 'Community posts' },
    { icon: TrendingUp, value: readiness, suffix: '%', label: 'Average readiness' },
  ];

  return (
    <section className="border-t border-[var(--border)] py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-6 sm:gap-10">
          {items.map((item, i) => (
            <div
              key={item.label}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
            >
              <item.icon size={20} className="mx-auto mb-2 text-[var(--accent)]" />
              <p className="font-display text-3xl sm:text-4xl font-semibold">
                {item.value}{item.suffix}
              </p>
              <p className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wide mt-1">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}