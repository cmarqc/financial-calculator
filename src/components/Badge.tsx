import type { Badge as BadgeTier } from '@/lib/calculations';

const TIER_STYLE: Record<BadgeTier, { bg: string; text: string; ring: string; label: string }> = {
  bronze: {
    bg: 'bg-[#f1e3d3] dark:bg-[#3a2a1a]',
    text: 'text-[#8a5a2b] dark:text-[#d9a86c]',
    ring: 'ring-[#c99a63]',
    label: 'Bronze',
  },
  silver: {
    bg: 'bg-[#e7ebee] dark:bg-[#2a3236]',
    text: 'text-[#54636e] dark:text-[#c3ccd1]',
    ring: 'ring-[#9fadb6]',
    label: 'Silver',
  },
  gold: {
    bg: 'bg-[#f7ecc8] dark:bg-[#3a3316]',
    text: 'text-[#8a6d16] dark:text-[#e3c96b]',
    ring: 'ring-[#d4af37]',
    label: 'Gold',
  },
};

export function TierBadge({ tier }: { tier: BadgeTier }) {
  const style = TIER_STYLE[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.bg} ${style.text} ${style.ring}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
        <circle cx="12" cy="14" r="6" />
        <path strokeLinecap="round" d="M9 9 7 3M15 9l2-6" />
      </svg>
      {style.label}
    </span>
  );
}
