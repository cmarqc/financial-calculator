'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/Card';
import { CurrencyField, NumberField, SegmentedField } from '@/components/fields';
import { useSettings } from '@/lib/settings-context';
import { formatCurrency } from '@/lib/format';
import { checkRetirementProgress, type RetirementOutcome } from '@/lib/calculations';

const OUTCOME_LABEL: Record<RetirementOutcome, string> = {
  traditional: 'Traditional retirement',
  fire: 'FIRE',
  coastFire: 'Coast FIRE',
};

const OUTCOME_HELP: Record<RetirementOutcome, string> = {
  traditional: 'On track if your current net worth, left to grow, reaches 25x your annual spending by your retirement age.',
  fire: 'Same 25x rule, but checked against the earlier target age you choose for financial independence.',
  coastFire: 'On track if what you have today will compound on its own — no more contributions needed — into your full FIRE number by your traditional retirement age.',
};

export function RetirementTracker() {
  const { currency } = useSettings();

  const [outcome, setOutcome] = useState<RetirementOutcome>('traditional');
  const [currentAge, setCurrentAge] = useState(30);
  const [targetAge, setTargetAge] = useState(65);
  const [retirementAge, setRetirementAge] = useState(65);
  const [netWorth, setNetWorth] = useState(50000);
  const [annualSpend, setAnnualSpend] = useState(50000);
  const [returnPct, setReturnPct] = useState(7);

  const result = useMemo(
    () =>
      checkRetirementProgress({
        outcome,
        currentAge,
        targetAge,
        retirementAge,
        netWorth,
        annualSpend,
        annualReturnPct: returnPct,
      }),
    [outcome, currentAge, targetAge, retirementAge, netWorth, annualSpend, returnPct],
  );

  return (
    <Card eyebrow="Retirement readiness" title="Check your track">
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="grid gap-4">
        <SegmentedField
          id="outcome"
          label="Outcome"
          value={outcome}
          onChange={(v) => {
            setOutcome(v);
            if (v === 'traditional') setTargetAge(retirementAge);
          }}
          options={(Object.keys(OUTCOME_LABEL) as RetirementOutcome[]).map((value) => ({
            value,
            label: OUTCOME_LABEL[value],
          }))}
        />
        <p className="-mt-2 text-xs text-[var(--text-muted)]">{OUTCOME_HELP[outcome]}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField id="current-age" label="Current age" value={currentAge} onChange={setCurrentAge} min={0} max={100} />
          <NumberField
            id="target-age"
            label={outcome === 'coastFire' ? 'Check coast status by age' : 'Target retirement age'}
            value={targetAge}
            onChange={setTargetAge}
            min={currentAge}
            max={100}
          />
        </div>

        {outcome === 'coastFire' && (
          <NumberField
            id="retirement-age"
            label="Traditional retirement age"
            value={retirementAge}
            onChange={setRetirementAge}
            min={targetAge}
            max={100}
            tooltip="The age your coasted savings need to grow to the full FIRE number by, without further contributions."
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <CurrencyField id="net-worth" label="Current net worth" value={netWorth} onChange={setNetWorth} currency={currency} />
          <CurrencyField
            id="annual-spend"
            label="Annual spending goal"
            value={annualSpend}
            onChange={setAnnualSpend}
            currency={currency}
            tooltip="Used with the 25x rule to estimate the total nest egg you'll need."
          />
        </div>

        <NumberField
          id="return-pct"
          label="Expected annual return"
          value={returnPct}
          onChange={setReturnPct}
          min={0}
          max={20}
          step={0.1}
          suffix="%"
        />
      </div>

      <div className="flex flex-col gap-5 rounded-xl bg-[var(--bg-subtle)] p-5">
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
            result.onTrack
              ? 'bg-[var(--success-bg)] text-[var(--success)]'
              : 'bg-[var(--danger-bg)] text-[var(--danger)]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0" aria-hidden="true">
            {result.onTrack ? <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />}
          </svg>
          {result.onTrack ? 'On track' : 'Not yet on track'} for {OUTCOME_LABEL[outcome]}
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-[var(--text-muted)]">FIRE number (25x spending)</span>
            <strong className="tabular-nums text-[var(--text)]">{formatCurrency(result.fireNumber, currency)}</strong>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[var(--text-muted)]">Required by age {outcome === 'coastFire' ? targetAge : targetAge}</span>
            <strong className="tabular-nums text-[var(--text)]">{formatCurrency(result.requiredAmount, currency)}</strong>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[var(--text-muted)]">Projected at age {targetAge}</span>
            <strong className="tabular-nums text-[var(--text)]">{formatCurrency(result.projectedAmount, currency)}</strong>
          </div>
          <div className="flex justify-between gap-3 border-t border-[var(--border)] pt-3">
            <span className="text-[var(--text-muted)]">{result.gapOrSurplus >= 0 ? 'Surplus' : 'Gap'}</span>
            <strong className={`tabular-nums ${result.onTrack ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
              {formatCurrency(Math.abs(result.gapOrSurplus), currency)}
            </strong>
          </div>
        </div>
      </div>
      </div>
    </Card>
  );
}
