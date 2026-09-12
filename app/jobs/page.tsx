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
  remotiveCategory?: string;
  url: string;
  postedAt: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Jobs', remotiveCategories: [], keywords: [] },
  { id: 'software-development', label: 'Software Dev', remotiveCategories: ['software-dev'], keywords: ['developer', 'software', 'engineer', 'programmer', 'coding', 'full stack', 'frontend', 'backend', 'web', 'app'] },
  { id: 'ai-ml', label: 'AI/ML', remotiveCategories: ['data-science'], keywords: ['ai', 'machine learning', 'ml', 'artificial intelligence', 'data scientist', 'data science'] },
  { id: 'devops', label: 'DevOps', remotiveCategories: ['devops-engineering'], keywords: ['devops', 'aws', 'cloud', 'kubernetes', 'docker', 'ci/cd', 'infrastructure'] },
  { id: 'data-science', label: 'Data Science', remotiveCategories: ['data-science'], keywords: ['data', 'analytics', 'analyst', 'data scientist', 'data engineer', 'sql', 'database'] },
  { id: 'frontend', label: 'Frontend', remotiveCategories: ['software-dev'], keywords: ['frontend', 'react', 'vue', 'angular', 'ui', 'ux', 'javascript', 'typescript', 'css', 'html'] },
  { id: 'backend', label: 'Backend', remotiveCategories: ['software-dev'], keywords: ['backend', 'api', 'node', 'python', 'java', 'server', 'database'] },
  { id: 'digital-marketing', label: 'Marketing', remotiveCategories: ['marketing'], keywords: ['marketing', 'seo', 'sem', 'social media', 'content', 'growth', 'brand'] },
  { id: 'sales', label: 'Sales', remotiveCategories: ['sales'], keywords: ['sales', 'account executive', 'business development', 'revenue', 'closing'] },
  { id: 'human-resources', label: 'HR', remotiveCategories: ['human-resources'], keywords: ['hr', 'human resources', 'recruiting', 'talent', 'people', 'hiring'] },
  { id: 'finance-accounting', label: 'Finance', remotiveCategories: ['finance'], keywords: ['finance', 'accounting', 'financial', 'accountant', 'cfo', 'controller'] },
  { id: 'graphic-design', label: 'Design', remotiveCategories: ['design'], keywords: ['design', 'designer', 'graphic', 'visual', 'creative', 'ui', 'ux'] },
  { id: 'content-writing', label: 'Writing', remotiveCategories: ['writing'], keywords: ['writer', 'content', 'copywriter', 'editor', 'blog', 'writing'] },
  { id: 'customer-support', label: 'Support', remotiveCategories: ['customer-service'], keywords: ['support', 'customer service', 'help', 'success', 'service'] },
  { id: 'project-management', label: 'PM', remotiveCategories: ['product'], keywords: ['project manager', 'pm', 'product', 'scrum', 'agile', 'management'] },
  { id: 'teaching-education', label: 'Education', remotiveCategories: [], keywords: ['teacher', 'education', 'teaching', 'instructor', 'trainer', 'educator'] }
];

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Fetch all jobs from API, filter client-side
    fetch('/api/jobs')
      .then(r => r.json())
      .then(data => { if (data.jobs) setJobs(data.jobs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    // Get the expected remotive categories and keywords for the selected category
    const selectedCat = CATEGORIES.find(c => c.id === selectedCategory);
    const expectedRemotiveCategories = selectedCat?.remotiveCategories || [];
    const keywords = selectedCat?.keywords || [];

    // Check if job matches the selected category
    const matchesCategory = selectedCategory === 'all' ||
      j.role === selectedCategory ||
      (j.remotiveCategory && expectedRemotiveCategories.includes(j.remotiveCategory)) ||
      (j.role && expectedRemotiveCategories.includes(j.role)) ||
      // For education, only show database jobs (no remotiveCategory)
      (selectedCategory === 'teaching-education' && j.role === 'teaching-education' && !j.remotiveCategory) ||
      // Fallback: check if job title contains keywords
      (keywords.length > 0 && keywords.some(keyword =>
        j.title.toLowerCase().includes(keyword.toLowerCase()) ||
        (j.requirements || []).some(req => req.toLowerCase().includes(keyword.toLowerCase()))
      ));

    const matchesSearch = !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      (j.requirements || []).some(r => r.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto">
        <GradientHeader eyebrow="Jobs" title="Job Board" subtitle="Find opportunities matching your career goals" showBack />
        <div className="px-5 mt-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
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
              <p className="text-[var(--text-muted)] text-sm">No jobs found{search ? ' matching your search' : ` in ${CATEGORIES.find(c => c.id === selectedCategory)?.label || 'this category'}`}.</p>
              {!search && selectedCategory === 'teaching-education' && (
                <p className="text-[var(--text-muted)] text-xs mt-2">Education jobs will appear here once posted by the community.</p>
              )}
              {!search && selectedCategory !== 'teaching-education' && (
                <p className="text-[var(--text-muted)] text-xs mt-2">Jobs will appear here once posted by the community or from external sources.</p>
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
