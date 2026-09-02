import type { ReactNode } from 'react';

export function Card({
  title,
  eyebrow,
  action,
  children,
  className = '',
}: {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-panel ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                {eyebrow}
              </p>
            )}
            {title && <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
