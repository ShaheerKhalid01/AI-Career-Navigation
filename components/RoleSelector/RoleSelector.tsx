'use client';

const ROLES = [
  { value: 'software-development', label: 'Software Development' },
  { value: 'frontend', label: 'Frontend Engineering' },
  { value: 'backend', label: 'Backend Engineering' },
  { value: 'ai-ml', label: 'AI / Machine Learning' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data-science', label: 'Data Science' },
];

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div>
      <label className="font-mono text-xs tracking-widest text-[var(--text-muted)] uppercase mb-2 block">
        02 — Destination Role
      </label>
      <div className="grid grid-cols-2 gap-2">
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
    </div>
  );
}