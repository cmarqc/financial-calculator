import type { FeasibilityLabel } from '@/lib/calculations';

const LABEL_COPY: Record<FeasibilityLabel, string> = {
  Easy: 'Below the typical savings pace — comfortable room to spare.',
  Balanced: 'Right around a typical savings pace for this budget.',
  Aggressive: 'Well above a typical savings pace — a stretch goal.',
};

export function FeasibilityMeter({ position, label }: { position: number; label: FeasibilityLabel }) {
  return (
    <div>
      <div
        role="meter"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Goal feasibility: ${label}`}
        className="relative h-2.5 w-full overflow-visible rounded-full bg-gradient-to-r from-brand-200 via-amber-500/40 to-red-400/50 dark:from-brand-900 dark:via-amber-600/40 dark:to-red-900/60"
      >
        <span
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-[var(--panel)] bg-[var(--accent)] shadow"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
        <span>Easy</span>
        <span>Balanced</span>
        <span>Aggressive</span>
      </div>
      <p className="mt-2 text-sm text-[var(--text)]">
        <strong className="font-semibold">{label}.</strong> {LABEL_COPY[label]}
      </p>
    </div>
  );
}
