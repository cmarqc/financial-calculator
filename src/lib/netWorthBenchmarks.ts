// Real household net worth percentile data, replacing a guessed heuristic with actual
// published figures. Source: Federal Reserve Survey of Consumer Finances, 2022 edition
// (released October 2023) — the most recently published SCF as of 2026, which runs on a
// three-year cadence. Figures include primary residence value and are not inflation-adjusted
// past the survey year.
export const NET_WORTH_DATA_NOTE =
  'Compares against the Federal Reserve’s 2022 Survey of Consumer Finances — the most recently published edition. Data as of 2026.';

interface PercentilePoint {
  p: number;
  amount: number;
}

// All U.S. households, not conditioned on age.
const ALL_AGES: PercentilePoint[] = [
  { p: 10, amount: 440 },
  { p: 20, amount: 13_528 },
  { p: 25, amount: 27_016 },
  { p: 30, amount: 51_366 },
  { p: 40, amount: 110_314 },
  { p: 50, amount: 192_084 },
  { p: 60, amount: 312_622 },
  { p: 70, amount: 493_068 },
  { p: 75, amount: 658_340 },
  { p: 80, amount: 891_750 },
  { p: 90, amount: 1_920_758 },
  { p: 95, amount: 3_779_600 },
  { p: 99, amount: 13_666_778 },
];

interface AgeBracket {
  minAge: number;
  maxAge: number;
  points: PercentilePoint[];
}

const AGE_BRACKETS: AgeBracket[] = [
  { minAge: 18, maxAge: 24, points: [{ p: 25, amount: 88 }, { p: 50, amount: 10_222 }, { p: 75, amount: 33_898 }, { p: 90, amount: 184_516 }, { p: 99, amount: 653_224 }] },
  { minAge: 25, maxAge: 29, points: [{ p: 25, amount: 3_784 }, { p: 50, amount: 31_470 }, { p: 75, amount: 130_606 }, { p: 90, amount: 296_830 }, { p: 99, amount: 2_121_910 }] },
  { minAge: 30, maxAge: 34, points: [{ p: 25, amount: 11_016 }, { p: 50, amount: 88_631 }, { p: 75, amount: 186_140 }, { p: 90, amount: 538_750 }, { p: 99, amount: 2_636_882 }] },
  { minAge: 35, maxAge: 39, points: [{ p: 25, amount: 16_548 }, { p: 50, amount: 138_588 }, { p: 75, amount: 389_432 }, { p: 90, amount: 864_340 }, { p: 99, amount: 4_741_320 }] },
  { minAge: 40, maxAge: 44, points: [{ p: 25, amount: 23_812 }, { p: 50, amount: 134_382 }, { p: 75, amount: 436_892 }, { p: 90, amount: 1_182_580 }, { p: 99, amount: 7_835_420 }] },
  { minAge: 45, maxAge: 49, points: [{ p: 25, amount: 47_668 }, { p: 50, amount: 213_586 }, { p: 75, amount: 680_298 }, { p: 90, amount: 1_428_714 }, { p: 99, amount: 8_701_500 }] },
  { minAge: 50, maxAge: 54, points: [{ p: 25, amount: 54_414 }, { p: 50, amount: 266_140 }, { p: 75, amount: 913_012 }, { p: 90, amount: 2_576_540 }, { p: 99, amount: 13_231_940 }] },
  { minAge: 55, maxAge: 59, points: [{ p: 25, amount: 84_977 }, { p: 50, amount: 321_074 }, { p: 75, amount: 1_137_318 }, { p: 90, amount: 2_672_160 }, { p: 99, amount: 15_371_684 }] },
  { minAge: 60, maxAge: 64, points: [{ p: 25, amount: 80_372 }, { p: 50, amount: 392_860 }, { p: 75, amount: 1_131_122 }, { p: 90, amount: 3_042_280 }, { p: 99, amount: 17_869_960 }] },
  { minAge: 65, maxAge: 69, points: [{ p: 25, amount: 68_972 }, { p: 50, amount: 393_480 }, { p: 75, amount: 1_154_552 }, { p: 90, amount: 2_961_060 }, { p: 99, amount: 22_102_660 }] },
  { minAge: 70, maxAge: 74, points: [{ p: 25, amount: 124_757 }, { p: 50, amount: 438_700 }, { p: 75, amount: 1_234_946 }, { p: 90, amount: 2_999_396 }, { p: 99, amount: 18_761_580 }] },
  { minAge: 75, maxAge: 79, points: [{ p: 25, amount: 89_504 }, { p: 50, amount: 338_180 }, { p: 75, amount: 991_520 }, { p: 90, amount: 2_914_188 }, { p: 99, amount: 19_868_894 }] },
  { minAge: 80, maxAge: Infinity, points: [{ p: 25, amount: 95_230 }, { p: 50, amount: 327_200 }, { p: 75, amount: 944_334 }, { p: 90, amount: 2_540_500 }, { p: 99, amount: 16_229_800 }] },
];

function interpolatePercentile(netWorth: number, points: PercentilePoint[]): number {
  const safe = Math.max(0, netWorth);
  // Anchor the curve at (0th percentile, $0) so values below the lowest published
  // breakpoint still interpolate sensibly instead of clamping straight to it.
  const anchored = [{ p: 0, amount: 0 }, ...points];
  const top = anchored[anchored.length - 1];

  if (safe >= top.amount) return top.p;

  for (let i = 0; i < anchored.length - 1; i++) {
    const lo = anchored[i];
    const hi = anchored[i + 1];
    if (safe <= hi.amount) {
      if (hi.amount === lo.amount) return hi.p;
      // Net worth is log-distributed (a few households dominate the top), so
      // interpolating in log space tracks the real curve far better than a
      // straight line between two dollar figures would.
      const t = (Math.log(safe + 1) - Math.log(lo.amount + 1)) / (Math.log(hi.amount + 1) - Math.log(lo.amount + 1));
      return lo.p + t * (hi.p - lo.p);
    }
  }
  return top.p;
}

export function percentileFromNetWorth(netWorth: number, age?: number | null): number {
  const bracket = age != null && age >= 18 ? AGE_BRACKETS.find((b) => age >= b.minAge && age <= b.maxAge) : undefined;
  const points = bracket ? bracket.points : ALL_AGES;
  return Math.round(interpolatePercentile(netWorth, points));
}
