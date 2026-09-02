import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)] text-xl text-[var(--accent-contrast)]"
          aria-hidden="true"
        >
          💸
        </div>
        <h1 className="text-xl font-bold text-[var(--text)]">(Financial) Freedom Rings!</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
