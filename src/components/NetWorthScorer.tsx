'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { CurrencyField, TextField } from '@/components/fields';
import { TierBadge } from '@/components/Badge';
import { useSettings } from '@/lib/settings-context';
import { formatCurrency, formatOrdinal } from '@/lib/format';
import {
  badgeFromScore,
  percentileFromScore,
  scoreAssetAccount,
  scoreLiabilityAccount,
  scoreNetWorth,
} from '@/lib/calculations';

interface Account {
  id: string;
  name: string;
  amount: number;
}

function AccountList({
  title,
  accounts,
  onAdd,
  onRemove,
  onChange,
  currency,
  addLabel,
  className = '',
}: {
  title: string;
  accounts: Account[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<Account>) => void;
  currency: Parameters<typeof CurrencyField>[0]['currency'];
  addLabel: string;
  className?: string;
}) {
  return (
    <div className={`grid min-w-0 content-start gap-3 self-start ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          + {addLabel}
        </button>
      </div>
      {accounts.length === 0 && (
        <p className="text-xs text-[var(--text-muted)]">None added yet.</p>
      )}
      {accounts.length > 0 && (
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr),minmax(0,1fr),auto] gap-2" aria-hidden="true">
          <span className="text-sm font-medium text-[var(--text)]">Name</span>
          <span className="text-sm font-medium text-[var(--text)]">Amount</span>
          <span />
        </div>
      )}
      <div className="grid gap-3">
        {accounts.map((account) => (
          <div key={account.id} className="grid min-w-0 grid-cols-[minmax(0,1fr),minmax(0,1fr),auto] items-start gap-2">
            <TextField
              id={`${account.id}-name`}
              label="Name"
              value={account.name}
              onChange={(name) => onChange(account.id, { name })}
              hideLabel
            />
            <CurrencyField
              id={`${account.id}-amount`}
              label="Amount"
              value={account.amount}
              onChange={(amount) => onChange(account.id, { amount })}
              currency={currency}
              hideLabel
            />
            <button
              type="button"
              onClick={() => onRemove(account.id)}
              aria-label={`Remove ${account.name || title.slice(0, -1)}`}
              className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--danger)] hover:text-[var(--danger)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreGroup({
  title,
  accounts,
  score,
  currency,
  emptyLabel,
  className = '',
}: {
  title: string;
  accounts: Account[];
  score: (amount: number) => number;
  currency: Parameters<typeof CurrencyField>[0]['currency'];
  emptyLabel: string;
  className?: string;
}) {
  return (
    <div className={`grid min-w-0 content-start gap-3 self-start ${className}`}>
      <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
      {accounts.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">None added yet.</p>
      ) : (
        <div className="grid gap-3">
          {accounts.map((account) => {
            const accountScore = score(account.amount);
            return (
              <div
                key={account.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{account.name || emptyLabel}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatCurrency(account.amount, currency)} · {accountScore.toFixed(1)}/10 ·{' '}
                    {formatOrdinal(percentileFromScore(accountScore))} pct
                  </p>
                </div>
                <TierBadge tier={badgeFromScore(accountScore)} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function makeAccount(name: string, id = crypto.randomUUID()): Account {
  return { id, name, amount: 0 };
}

export function NetWorthScorer() {
  const { currency } = useSettings();
  const [assets, setAssets] = useState<Account[]>([makeAccount('Savings account', 'asset-default')]);
  const [liabilities, setLiabilities] = useState<Account[]>([makeAccount('Credit card', 'liability-default')]);
  const [scored, setScored] = useState(false);

  const updateList = (
    list: Account[],
    setList: (a: Account[]) => void,
    id: string,
    patch: Partial<Account>,
  ) => setList(list.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const totalAssets = assets.reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.amount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const overallScore = scoreNetWorth(netWorth);

  return (
    <Card eyebrow="Net worth" title="Score your accounts">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-0">
        <AccountList
          title="Assets"
          accounts={assets}
          onAdd={() => setAssets([...assets, makeAccount('')])}
          onRemove={(id) => setAssets(assets.filter((a) => a.id !== id))}
          onChange={(id, patch) => updateList(assets, setAssets, id, patch)}
          currency={currency}
          addLabel="Add asset"
          className="lg:pr-6"
        />
        <AccountList
          title="Liabilities"
          accounts={liabilities}
          onAdd={() => setLiabilities([...liabilities, makeAccount('')])}
          onRemove={(id) => setLiabilities(liabilities.filter((l) => l.id !== id))}
          onChange={(id, patch) => updateList(liabilities, setLiabilities, id, patch)}
          currency={currency}
          addLabel="Add liability"
          className="lg:border-l lg:border-[var(--border)] lg:pl-6"
        />
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setScored(true)}
          className="rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] transition-transform hover:-translate-y-px"
        >
          Get Scored
        </button>
      </div>

      {scored && (
        <div className="mt-6 grid gap-6 border-t border-[var(--border)] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--bg-subtle)] p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Net worth</p>
              <p className="text-2xl font-bold tabular-nums text-[var(--text)]">{formatCurrency(netWorth, currency)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-muted)]">
                Score {overallScore.toFixed(1)}/10 · {formatOrdinal(percentileFromScore(overallScore))} percentile
              </span>
              <TierBadge tier={badgeFromScore(overallScore)} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-0">
            <ScoreGroup
              title="Assets"
              accounts={assets}
              score={scoreAssetAccount}
              currency={currency}
              emptyLabel="Untitled asset"
              className="lg:pr-6"
            />
            <ScoreGroup
              title="Liabilities"
              accounts={liabilities}
              score={scoreLiabilityAccount}
              currency={currency}
              emptyLabel="Untitled liability"
              className="lg:border-l lg:border-[var(--border)] lg:pl-6"
            />
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Scores are simplified, informational estimates based on typical account sizes — not financial advice.
          </p>
        </div>
      )}
    </Card>
  );
}
