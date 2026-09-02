'use client';

import { Card } from '@/components/Card';
import { CurrencyField, SelectField } from '@/components/fields';
import { useSettings } from '@/lib/settings-context';
import { SUPPORTED_CURRENCIES } from '@/lib/format';

export function SettingsPanel() {
  const { annualIncome, setAnnualIncome, currency, setCurrency } = useSettings();

  return (
    <Card eyebrow="Settings" title="Your baseline">
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyField
          id="annual-income"
          label="Total annual income"
          value={annualIncome ?? 0}
          onChange={(v) => setAnnualIncome(v || null)}
          currency={currency}
          tooltip="Optional. Powers percentage-based budgeting and scales the feasibility meter to your income."
        />
        <SelectField
          id="currency"
          label="Currency"
          value={currency}
          onChange={setCurrency}
          tooltip="USD is fully supported today. Other major currencies are planned for a future release."
          options={SUPPORTED_CURRENCIES.map((c) => ({ value: c.code, label: c.label, disabled: !c.enabled }))}
        />
      </div>
    </Card>
  );
}
