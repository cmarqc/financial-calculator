'use client';

import { useId, useState } from 'react';

export function InfoTooltip({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-label={label}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="grid h-4 w-4 place-items-center rounded-full border border-[var(--text-muted)] text-[10px] font-semibold leading-none text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2.5 text-xs leading-snug text-[var(--text)] shadow-panel"
        >
          {text}
        </span>
      )}
    </span>
  );
}
