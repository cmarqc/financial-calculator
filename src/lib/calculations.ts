import { percentileFromNetWorth } from '@/lib/netWorthBenchmarks';

export type Frequency = 'weekly' | 'monthly' | 'annually';

// Reference points used only to scale the "feasibility" meter — not exact statistics,
// just a reasonable midpoint so the slider has a meaningful center.
const MEDIAN_MONTHLY_SAVINGS = 600;
const MEDIAN_MONTHLY_INCOME = 6718;

export function toMonthlyAmount(amount: number, frequency: Frequency): number {
  if (!Number.isFinite(amount) || amount < 0) return 0;
  switch (frequency) {
    case 'weekly':
      return (amount * 52) / 12;
    case 'annually':
      return amount / 12;
    case 'monthly':
    default:
      return amount;
  }
}

export function monthsToReachGoal(targetAmount: number, monthlyContribution: number): number | null {
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) return 0;
  if (!Number.isFinite(monthlyContribution) || monthlyContribution <= 0) return null;
  return Math.ceil(targetAmount / monthlyContribution);
}

export function formatDuration(months: number | null): string {
  if (months === null) return 'Add a budget to see a timeline';
  if (months === 0) return 'Goal already met';
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years === 1 ? '' : 's'}`);
  if (remMonths > 0) parts.push(`${remMonths} mo${remMonths === 1 ? '' : 's'}`);
  return parts.length ? parts.join(' ') : 'Less than a month';
}

export function targetDate(months: number | null): string | null {
  if (months === null || months === 0) return null;
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export type FeasibilityLabel = 'Easy' | 'Balanced' | 'Aggressive';

export interface FeasibilityResult {
  position: number; // 0-100, 50 = balanced midpoint
  label: FeasibilityLabel;
  benchmark: number;
}

export function getFeasibility(monthlyContribution: number, annualIncome?: number | null): FeasibilityResult {
  let benchmark = MEDIAN_MONTHLY_SAVINGS;
  if (annualIncome && annualIncome > 0) {
    const monthlyIncome = annualIncome / 12;
    benchmark = MEDIAN_MONTHLY_SAVINGS * (monthlyIncome / MEDIAN_MONTHLY_INCOME);
  }
  benchmark = Math.max(benchmark, 1);

  const ratio = monthlyContribution / benchmark;
  const position = Math.min(100, Math.max(0, ratio * 50));

  let label: FeasibilityLabel = 'Balanced';
  if (position < 34) label = 'Easy';
  else if (position > 66) label = 'Aggressive';

  return { position, label, benchmark };
}

// --- Retirement tracking -----------------------------------------------

export type RetirementOutcome = 'traditional' | 'fire' | 'coastFire';

export function fireNumber(annualSpend: number, multiplier = 25): number {
  if (!Number.isFinite(annualSpend) || annualSpend <= 0) return 0;
  return annualSpend * multiplier;
}

export function projectedValue(principal: number, annualReturnPct: number, years: number): number {
  if (!Number.isFinite(principal) || principal < 0) principal = 0;
  if (years <= 0) return principal;
  const r = annualReturnPct / 100;
  return principal * Math.pow(1 + r, years);
}

// Same as projectedValue, but adds the future value of an ongoing monthly contribution
// (compounded monthly, contributed at the start of each month) on top of the existing
// balance's growth.
export function projectedValueWithContributions(
  principal: number,
  monthlyContribution: number,
  annualReturnPct: number,
  years: number,
): number {
  if (!Number.isFinite(principal) || principal < 0) principal = 0;
  if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) monthlyContribution = 0;
  if (years <= 0) return principal;
  if (monthlyContribution === 0) return projectedValue(principal, annualReturnPct, years);

  const monthlyRate = annualReturnPct / 100 / 12;
  const months = years * 12;

  if (monthlyRate === 0) return principal + monthlyContribution * months;

  const futureValueOfPrincipal = principal * Math.pow(1 + monthlyRate, months);
  const futureValueOfContributions =
    monthlyContribution * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));

  return futureValueOfPrincipal + futureValueOfContributions;
}

export interface RetirementCheckInput {
  outcome: RetirementOutcome;
  currentAge: number;
  targetAge: number;
  retirementAge: number; // horizon used for the "coast" projection (traditional retirement age)
  netWorth: number;
  annualSpend: number;
  annualReturnPct: number;
  // Ongoing monthly contribution assumed only up to targetAge — a Coast FIRE check still
  // assumes no further contributions between targetAge and retirementAge, by definition.
  monthlyContribution?: number;
}

export interface RetirementCheckResult {
  onTrack: boolean;
  requiredAmount: number;
  projectedAmount: number;
  gapOrSurplus: number;
  fireNumber: number;
}

export function checkRetirementProgress(input: RetirementCheckInput): RetirementCheckResult {
  const { outcome, currentAge, targetAge, retirementAge, netWorth, annualSpend, annualReturnPct, monthlyContribution } = input;
  const yearsToTarget = Math.max(0, targetAge - currentAge);
  const required = fireNumber(annualSpend);

  let requiredAmount = required;
  const projectedAmount = projectedValueWithContributions(netWorth, monthlyContribution ?? 0, annualReturnPct, yearsToTarget);

  if (outcome === 'coastFire') {
    const yearsFromTargetToRetirement = Math.max(0, retirementAge - targetAge);
    requiredAmount = required / Math.pow(1 + annualReturnPct / 100, yearsFromTargetToRetirement || 0);
  }

  const gapOrSurplus = projectedAmount - requiredAmount;

  return {
    onTrack: gapOrSurplus >= 0,
    requiredAmount,
    projectedAmount,
    gapOrSurplus,
    fireNumber: required,
  };
}

// --- Net worth scoring ----------------------------------------------------
// Individual account scores below are a heuristic (no benchmark data exists for
// "how big is a typical savings account"). Overall net worth, though, is scored
// against real published figures — see netWorthBenchmarks.ts.

export type Badge = 'bronze' | 'silver' | 'gold' | 'diamond';

export function badgeFromScore(score: number): Badge {
  // Compare against the same rounded percentile shown in the UI, so the badge
  // and the "Nth percentile" text never disagree at the boundary.
  if (percentileFromScore(score) >= 97) return 'diamond';
  if (score >= 7) return 'gold';
  if (score >= 4) return 'silver';
  return 'bronze';
}

function logScale(amount: number, ceiling: number): number {
  const safeAmount = Math.max(0, amount);
  const score = (Math.log10(safeAmount + 1) / Math.log10(ceiling + 1)) * 10;
  return Math.min(10, Math.max(0, score));
}

export function scoreAssetAccount(amount: number): number {
  return Math.round(logScale(amount, 500_000) * 10) / 10;
}

export function scoreLiabilityAccount(amount: number): number {
  return Math.round((10 - logScale(amount, 500_000)) * 10) / 10;
}

export function scoreNetWorth(netWorth: number, age?: number | null): number {
  return percentileFromNetWorth(netWorth, age) / 10;
}

export function percentileFromScore(score: number): number {
  return Math.round(Math.min(100, Math.max(0, score * 10)));
}
