import { Header } from '@/components/Header';
import { SettingsPanel } from '@/components/SettingsPanel';
import { SavingsGoalCalculator } from '@/components/SavingsGoalCalculator';
import { RetirementTracker } from '@/components/RetirementTracker';
import { NetWorthScorer } from '@/components/NetWorthScorer';

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Header />
      <main className="grid gap-6">
        <SettingsPanel />
        <SavingsGoalCalculator />
        <RetirementTracker />
        <NetWorthScorer />
      </main>
      <footer className="mt-10 border-t border-[var(--border)] pt-6 text-xs leading-relaxed text-[var(--text-muted)]">
        Everything here runs locally in your browser — nothing is saved to a server. Figures are
        planning estimates only, not licensed financial advice, and shouldn&rsquo;t be the sole
        basis for financial decisions.
      </footer>
    </div>
  );
}
