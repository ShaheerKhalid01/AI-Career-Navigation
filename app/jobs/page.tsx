'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, Building, ExternalLink, Search, Bookmark, Loader2 } from 'lucide-react';
import GradientHeader from '@/components/common/GradientHeader';

interface JobItem {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  role: string;
  url: string;
  postedAt: string;
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(data => { if (data.jobs) setJobs(data.jobs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase()) ||
        (j.requirements || []).some(r => r.toLowerCase().includes(search.toLowerCase()))
      )
    : jobs;

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto">
        <GradientHeader eyebrow="Jobs" title="Job Board" subtitle="Find opportunities matching your career goals" showBack />
        <div className="px-5 mt-6">
          <div className="relative mb-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs by title, company, or skill..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--accent)]" size={24} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase size={40} className="mx-auto text-[var(--text-muted)] mb-4" />
              <p className="text-[var(--text-muted)] text-sm">No jobs found{search ? ' matching your search' : ''}.</p>
              {!search && (
                <p className="text-[var(--text-muted)] text-xs mt-2">Jobs will appear here once posted by the community.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(job => (
                <div key={job._id} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text)]">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1"><Building size={12} />{job.company}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-3 line-clamp-2">{job.description}</p>
                      {job.requirements?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.requirements.slice(0, 5).map((r, i) => (
                            <span key={i} className="text-[10px] font-medium bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded-full">{r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {job.url && (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline">
                          Apply <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
