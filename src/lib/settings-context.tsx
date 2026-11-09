'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '@/lib/format';

// Annual income is deliberately NOT part of this type. It's the one input here that
// identifies the person rather than their preferences, so it lives in memory only
// (see SettingsProvider) and never reaches localStorage.
interface StoredSettings {
  currency: CurrencyCode;
}

interface SettingsContextValue extends StoredSettings {
  annualIncome: number | null;
  setAnnualIncome: (value: number | null) => void;
  setCurrency: (value: CurrencyCode) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const STORAGE_KEY = 'financial-calculator:settings';

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return SUPPORTED_CURRENCIES.some((c) => c.code === value);
}

// Keeps only `currency`. Earlier versions persisted `annualIncome` alongside it, so
// this also drops that field from storage the first time an existing user loads the app.
function sanitizeSettings(stored: unknown): StoredSettings {
  const currency = (stored as { currency?: unknown } | null)?.currency;
  return { currency: isCurrencyCode(currency) ? currency : 'USD' };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<StoredSettings>(
    STORAGE_KEY,
    { currency: 'USD' },
    sanitizeSettings,
  );

  // In-memory only: income is gone on reload or when the tab closes.
  const [annualIncome, setAnnualIncome] = useState<number | null>(null);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      annualIncome,
      setAnnualIncome,
      setCurrency: (currency) => setSettings((prev) => ({ ...prev, currency })),
    }),
    [settings, setSettings, annualIncome],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
