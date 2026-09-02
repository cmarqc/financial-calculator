# (Financial) Freedom Rings!

A local-only web app for planning savings goals, checking retirement/FIRE progress, and
scoring net worth. No accounts, no database, no server-side APIs — everything runs and stays
in your browser.

## Features

- **Savings goal calculator** — name a goal, set a target and a budget (fixed amount or
  percent of income, weekly/monthly/annually), and see the time to reach it plus an
  Easy → Balanced → Aggressive feasibility read.
- **Retirement readiness** — check progress toward traditional retirement, FIRE, or Coast
  FIRE from your current age, net worth, and spending goal.
- **Net worth scorer** — add assets/liabilities and get a net worth figure with a 0–10
  score, percentile, and bronze/silver/gold badge per account.

## Stack

Next.js (static export) + TypeScript + Tailwind CSS, with light/dark themes and
accessibility (labels, tooltips, non-color-only status indicators) built in.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to /out
```
