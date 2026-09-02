'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import type { CurrencyCode } from '@/lib/format';

interface Settings {
  annualIncome: number | null;
  currency: CurrencyCode;
}

interface SettingsContextValue extends Settings {
  setAnnualIncome: (value: number | null) => void;
  setCurrency: (value: CurrencyCode) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>('financial-calculator:settings', {
    annualIncome: null,
    currency: 'USD',
  });

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      setAnnualIncome: (annualIncome) => setSettings((prev) => ({ ...prev, annualIncome })),
      setCurrency: (currency) => setSettings((prev) => ({ ...prev, currency })),
    }),
    [settings, setSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
