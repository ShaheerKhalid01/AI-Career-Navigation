'use client';

const ROLES = [
  { value: 'software-development', label: 'Software Development' },
  { value: 'frontend', label: 'Frontend Engineering' },
  { value: 'backend', label: 'Backend Engineering' },
  { value: 'ai-ml', label: 'AI / Machine Learning' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'human-resources', label: 'Human Resources' },
  { value: 'finance-accounting', label: 'Finance & Accounting' },
  { value: 'graphic-design', label: 'Graphic Design' },
  { value: 'content-writing', label: 'Content Writing' },
  { value: 'customer-support', label: 'Customer Support' },
  { value: 'project-management', label: 'Project Management' },
  { value: 'teaching-education', label: 'Teaching / Education' },
];

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="relative">
      <label className="font-mono text-xs tracking-widest text-[var(--text-muted)] uppercase mb-2 block">
        02 — Destination Role
      </label>
      <div className="relative">
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 scroll-smooth">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={`text-sm text-left px-4 py-3 rounded-lg border transition-all
                ${value === role.value
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'}`}
            >
              {role.label}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--surface)] to-transparent" />
      </div>
    </div>
  );
}