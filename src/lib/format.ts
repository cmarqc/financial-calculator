export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; label: string; enabled: boolean }[] = [
  { code: 'USD', label: 'USD — US Dollar', enabled: true },
  { code: 'EUR', label: 'EUR — Euro', enabled: false },
  { code: 'GBP', label: 'GBP — British Pound', enabled: false },
  { code: 'JPY', label: 'JPY — Japanese Yen', enabled: false },
  { code: 'CAD', label: 'CAD — Canadian Dollar', enabled: false },
  { code: 'AUD', label: 'AUD — Australian Dollar', enabled: false },
];

export function formatCurrency(value: number, currency: CurrencyCode = 'USD'): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompact(value: number, currency: CurrencyCode = 'USD'): string | null {
  if (!Number.isFinite(value) || Math.abs(value) < 1000) return null;
  const symbol = currency === 'USD' ? '$' : '';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000_000) return `${sign}${symbol}${(abs / 1_000_000_000).toFixed(2)} bil`;
  if (abs >= 1_000_000) return `${sign}${symbol}${(abs / 1_000_000).toFixed(2)} mil`;
  return `${sign}${symbol}${(abs / 1_000).toFixed(1)}k`;
}

export function parseCurrencyInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.-]/g, '');
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

export function formatPercent(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatOrdinal(value: number): string {
  const rounded = Math.round(value);
  const remainder100 = rounded % 100;
  if (remainder100 >= 11 && remainder100 <= 13) return `${rounded}th`;
  switch (rounded % 10) {
    case 1:
      return `${rounded}st`;
    case 2:
      return `${rounded}nd`;
    case 3:
      return `${rounded}rd`;
    default:
      return `${rounded}th`;
  }
}
