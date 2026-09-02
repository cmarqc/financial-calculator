'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/Card';
import { CurrencyField, NumberField, SegmentedField, TextField } from '@/components/fields';
import { FeasibilityMeter } from '@/components/FeasibilityMeter';
import { useSettings } from '@/lib/settings-context';
import { formatCurrency } from '@/lib/format';
import {
  formatDuration,
  getFeasibility,
  monthsToReachGoal,
  targetDate,
  toMonthlyAmount,
  type Frequency,
} from '@/lib/calculations';

type BudgetMode = 'amount' | 'percent';

export function SavingsGoalCalculator() {
  const { annualIncome, currency } = useSettings();

  const [goalName, setGoalName] = useState('House Savings');
  const [targetAmount, setTargetAmount] = useState(30000);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>('amount');
  const [budgetAmount, setBudgetAmount] = useState(500);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [percent, setPercent] = useState(10);

  const monthlyContribution = useMemo(() => {
    if (budgetMode === 'percent' && annualIncome) {
      return (annualIncome * (percent / 100)) / 12;
    }
    return toMonthlyAmount(budgetAmount, frequency);
  }, [budgetMode, annualIncome, percent, budgetAmount, frequency]);

  const months = monthsToReachGoal(targetAmount, monthlyContribution);
  const feasibility = getFeasibility(monthlyContribution, annualIncome);
  const eta = targetDate(months);

  return (
    <Card eyebrow="Savings goal" title="Build a target">
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="grid gap-4">
        <TextField id="goal-name" label="Goal name" value={goalName} onChange={setGoalName} />
        <CurrencyField
          id="target-amount"
          label="Target amount"
          value={targetAmount}
          onChange={setTargetAmount}
          currency={currency}
        />

        <SegmentedField
          id="budget-mode"
          label="Budget by"
          value={budgetMode}
          onChange={setBudgetMode}
          options={[
            { value: 'amount', label: 'Amount' },
            { value: 'percent', label: 'Percent of income' },
          ]}
          tooltip="Percent of income requires a total annual income in Settings above."
        />

        {budgetMode === 'amount' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <CurrencyField
              id="budget-amount"
              label="Budget"
              value={budgetAmount}
              onChange={setBudgetAmount}
              currency={currency}
            />
            <SegmentedField
              id="frequency"
              label="Frequency"
              value={frequency}
              onChange={setFrequency}
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'annually', label: 'Annually' },
              ]}
            />
          </div>
        ) : annualIncome ? (
          <NumberField
            id="budget-percent"
            label="Percent of annual income"
            value={percent}
            onChange={setPercent}
            min={0}
            max={100}
            step={0.5}
            suffix="%"
          />
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--border)] p-3 text-sm text-[var(--text-muted)]">
            Add a total annual income in Settings to budget by percentage.
          </p>
        )}
      </div>

      <div className="flex flex-col justify-between gap-6 rounded-xl bg-[var(--bg-subtle)] p-5">
        <div className="grid gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Monthly contribution
            </p>
            <p className="text-2xl font-bold tabular-nums text-[var(--text)]">
              {formatCurrency(monthlyContribution, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Time to reach &ldquo;{goalName || 'your goal'}&rdquo;
            </p>
            <p className="text-2xl font-bold text-[var(--text)]">{formatDuration(months)}</p>
            {eta && <p className="text-sm text-[var(--text-muted)]">Around {eta}</p>}
          </div>
        </div>
        <FeasibilityMeter position={feasibility.position} label={feasibility.label} />
      </div>
      </div>
    </Card>
  );
}
