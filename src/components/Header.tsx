import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)] text-lg font-bold text-[var(--accent-contrast)]"
          aria-hidden="true"
        >
          F
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Planning workspace
          </p>
          <h1 className="text-xl font-bold text-[var(--text)]">Financial Freedom Calculator</h1>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
