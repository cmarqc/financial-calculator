'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/Card';
import { CheckboxField, CurrencyField, NumberField, SegmentedField } from '@/components/fields';
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
  coastFire:
    'Coast FIRE is the point where you can stop saving and still retire on time. Set the two ages below: the age you stop adding money, and the age you retire.',
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
  const [continueContributing, setContinueContributing] = useState(false);
  const [monthlyContribution, setMonthlyContribution] = useState(500);

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
        monthlyContribution: continueContributing ? monthlyContribution : 0,
      }),
    [outcome, currentAge, targetAge, retirementAge, netWorth, annualSpend, returnPct, continueContributing, monthlyContribution],
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
            // Coast FIRE needs the two ages to differ, or there are no coasting years
            // left and the check collapses into the traditional one. Default to "can I
            // stop contributing today?", the question people actually arrive with.
            if (v === 'coastFire' && targetAge >= retirementAge) setTargetAge(currentAge);
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
            label={outcome === 'coastFire' ? 'Age you stop contributing' : 'Target retirement age'}
            value={targetAge}
            onChange={setTargetAge}
            min={currentAge}
            max={outcome === 'coastFire' ? retirementAge : 100}
            helpText={outcome === 'coastFire' ? 'The last age you add money. Use your current age to ask “can I stop today?”' : undefined}
            tooltip={
              outcome === 'coastFire'
                ? 'The age you plan to stop saving for retirement. From here on, your balance grows on its own.'
                : undefined
            }
          />
        </div>

        {outcome === 'coastFire' && (
          <>
            <NumberField
              id="retirement-age"
              label="Age you retire"
              value={retirementAge}
              onChange={setRetirementAge}
              min={targetAge}
              max={100}
              helpText={`Your balance has ${retirementAge - targetAge} year${
                retirementAge - targetAge === 1 ? '' : 's'
              } of untouched growth between the two ages.`}
              tooltip="When you start living off the money. Your balance must reach the full FIRE number by this age with no further contributions."
            />
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 text-xs leading-relaxed text-[var(--text-muted)]">
              <p className="mb-2 font-semibold text-[var(--text)]">How this check works</p>
              <ol className="grid list-decimal gap-1.5 pl-4">
                <li>
                  Your net worth grows{continueContributing ? ' (plus your monthly contributions)' : ''} from age{' '}
                  {currentAge} to age {targetAge} — that’s your <strong className="font-semibold text-[var(--text)]">projected</strong> balance.
                </li>
                <li>Contributions stop at age {targetAge}. Nothing goes in after that.</li>
                <li>
                  That balance then compounds alone until age {retirementAge}, when it needs to equal your full FIRE
                  number of {formatCurrency(result.fireNumber, currency)}.
                </li>
                <li>
                  Working backwards, you need{' '}
                  <strong className="font-semibold text-[var(--text)]">{formatCurrency(result.requiredAmount, currency)}</strong>{' '}
                  banked by age {targetAge} to coast the rest of the way.
                </li>
              </ol>
            </div>
          </>
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

        <CheckboxField
          id="continue-contributing"
          label="Continue contributing"
          checked={continueContributing}
          onChange={setContinueContributing}
          tooltip={`Factor in ongoing monthly contributions from now until age ${targetAge}, on top of your current net worth growing.${
            outcome === 'coastFire' ? ` Nothing is added after age ${targetAge} — that’s the point of coasting.` : ''
          }`}
        />
        {continueContributing && (
          <CurrencyField
            id="monthly-contribution"
            label="Monthly contribution"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            currency={currency}
          />
        )}
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
            <span className="text-[var(--text-muted)]">
              {outcome === 'coastFire' ? `Needed by age ${targetAge} to coast` : `Required by age ${targetAge}`}
              {outcome === 'coastFire' && (
                <span className="block text-xs">grows to the full FIRE number by age {retirementAge}</span>
              )}
            </span>
            <strong className="tabular-nums text-[var(--text)]">{formatCurrency(result.requiredAmount, currency)}</strong>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[var(--text-muted)]">
              Projected at age {targetAge}
              {continueContributing && (
                <span className="block text-xs">+{formatCurrency(monthlyContribution, currency)}/mo assumed until then</span>
              )}
            </span>
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
