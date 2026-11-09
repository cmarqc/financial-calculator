'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { formatCompact, formatCurrency, parseCurrencyInput, type CurrencyCode } from '@/lib/format';
import { InfoTooltip } from '@/components/InfoTooltip';

function FieldShell({
  label,
  htmlFor,
  tooltip,
  helpText,
  hideLabel,
  children,
}: {
  label: string;
  htmlFor: string;
  tooltip?: string;
  helpText?: string;
  hideLabel?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className={
          hideLabel
            ? 'sr-only'
            : 'flex items-center gap-1.5 text-sm font-medium text-[var(--text)]'
        }
      >
        {label}
        {tooltip && <InfoTooltip label={`More info: ${label}`} text={tooltip} />}
      </label>
      {children}
      {helpText && <p className="text-xs text-[var(--text-muted)]">{helpText}</p>}
    </div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  tooltip,
  placeholder,
  hideLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  tooltip?: string;
  placeholder?: string;
  hideLabel?: boolean;
}) {
  return (
    <FieldShell label={label} htmlFor={id} tooltip={tooltip} hideLabel={hideLabel}>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
      />
    </FieldShell>
  );
}

export function CurrencyField({
  id,
  label,
  value,
  onChange,
  currency = 'USD',
  tooltip,
  min = 0,
  hideLabel,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  currency?: CurrencyCode;
  tooltip?: string;
  min?: number;
  hideLabel?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(String(value || ''));

  useEffect(() => {
    if (!focused) setDraft(value ? String(value) : '');
  }, [value, focused]);

  const compact = formatCompact(value, currency);

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      tooltip={tooltip}
      helpText={compact ? `≈ ${compact}` : undefined}
      hideLabel={hideLabel}
    >
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={focused ? draft : value ? formatCurrency(value, currency) : ''}
        placeholder={formatCurrency(0, currency)}
        onFocus={(e) => {
          const raw = value ? String(value) : '';
          setFocused(true);
          setDraft(raw);
          // Set the DOM value directly (not just React state) so the field already
          // shows the unformatted number before this event returns — otherwise a fast
          // typist (or an autofill/paste) can insert into the stale "$X,XXX" text
          // instead of the plain digits, since React's re-render commits a tick later.
          e.target.value = raw;
          e.target.select();
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setFocused(false);
          const parsed = Math.max(min, parseCurrencyInput(draft));
          onChange(parsed);
        }}
        className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm font-medium tabular-nums text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
      />
    </FieldShell>
  );
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  tooltip,
  helpText,
  min,
  max,
  step = 1,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(Number.isFinite(value) ? String(value) : '');

  useEffect(() => {
    if (!focused) setDraft(Number.isFinite(value) ? String(value) : '');
  }, [value, focused]);

  return (
    <FieldShell label={label} htmlFor={id} tooltip={tooltip} helpText={helpText}>
      <div className="relative">
        <input
          id={id}
          type="number"
          value={draft}
          min={min}
          max={max}
          step={step}
          onFocus={() => setFocused(true)}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            // Skip transient states ("", "-", "1.") instead of coercing them to 0 —
            // forcing a value back into a controlled input mid-edit traps the user
            // behind a leading "0" they can never clear.
            const parsed = Number.parseFloat(raw);
            if (raw !== '' && Number.isFinite(parsed)) onChange(parsed);
          }}
          onBlur={() => {
            setFocused(false);
            let parsed = Number.parseFloat(draft);
            if (!Number.isFinite(parsed)) parsed = min ?? 0;
            if (min !== undefined) parsed = Math.max(min, parsed);
            if (max !== undefined) parsed = Math.min(max, parsed);
            setDraft(String(parsed));
            onChange(parsed);
          }}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm font-medium tabular-nums text-[var(--text)] outline-none transition-colors [appearance:textfield] focus:border-[var(--accent)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
            {suffix}
          </span>
        )}
      </div>
    </FieldShell>
  );
}

export function SegmentedField<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  tooltip?: string;
}) {
  const groupId = useId();
  return (
    <FieldShell label={label} htmlFor={`${id}-${options[0]?.value}`} tooltip={tooltip}>
      <div role="radiogroup" aria-labelledby={groupId} className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg)] p-1">
        {options.map((opt) => {
          const checked = opt.value === value;
          return (
            <button
              key={opt.value}
              id={`${id}-${opt.value}`}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                checked
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </FieldShell>
  );
}

export function SelectField<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; disabled?: boolean }[];
  tooltip?: string;
}) {
  return (
    <FieldShell label={label} htmlFor={id} tooltip={tooltip}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm font-medium text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
            {opt.disabled ? ' (coming soon)' : ''}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  tooltip,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
}) {
  return (
    <label htmlFor={id} className="flex w-fit items-center gap-2 text-sm font-medium text-[var(--text)]">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
      />
      {label}
      {tooltip && <InfoTooltip label={`More info: ${label}`} text={tooltip} />}
    </label>
  );
}
