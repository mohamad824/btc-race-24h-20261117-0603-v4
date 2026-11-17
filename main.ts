// Dip-recovery swing bot, v4 candidate: W60 dip-110 + 2 up closes, TP180/SL100,
// 480-bar time stop (lifted past bar 1200 while >=40bps in profit), 60-bar cooldown,
// deep washout arm (W360 dip-350 + 1 up close), guaranteed-trade fallback at bar 1300.
// Pure integer bps math; deterministic: no clock, no environment, no randomness.
import { runBars } from './vendor/makefun-bars.ts';
import type { BarsState, Batch } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const DIP_BPS = 110n;
const DEEP_DIP_BPS = 350n;
const TP_BPS = 180n;
const SL_BPS = 100n;
const LIFT_BPS = 40n;
const TIME_STOP = 480;
const COOLDOWN = 60;
const FALLBACK_BAR = 1300; const LIFT_BAR = 1200;
const BPS = 10000n;

const closes: bigint[] = [];
let entryPrice: bigint | null = null;
let held = 0;
let cool = 0;
let everFilled = false;

function trailHigh(window: number): bigint | null {
  const n = closes.length;
  if (n < 2) return null;
  const start = Math.max(0, n - 1 - window);
  let hi = closes[start]!;
  for (let i = start + 1; i < n - 1; i++) if (closes[i]! > hi) hi = closes[i]!;
  return hi;
}

await runBars({
  onBatch(state: BarsState, batch: Batch) {
    // Fold this batch's fills first: record entry price from any filled buy.
    for (const f of batch.fills) {
      if (f.status === 'filled' && f.side === 'buy') {
        entryPrice = BigInt(f.price);
        everFilled = true;
      }
    }
    const bar = state.latest.get(SYMBOL);
    if (bar === undefined) return [];
    const close = BigInt(bar.c);
    closes.push(close);
    const k = state.seq;
    const pos = state.positions.get(SYMBOL);
    const qty = pos?.qty ?? 0n;
    if (qty > 0n) everFilled = true;
    if (cool > 0) cool--;

    if (qty > 0n && entryPrice !== null) {
      held++;
      const up = close * BPS >= entryPrice * (BPS + TP_BPS);
      const down = close * BPS <= entryPrice * (BPS - SL_BPS);
      const lifted = k >= LIFT_BAR && close * BPS >= entryPrice * (BPS + LIFT_BPS);
      if (up || down || (held >= TIME_STOP && !lifted)) {
        held = 0;
        cool = COOLDOWN;
        return [{ side: 'sell', symbol: SYMBOL, qty, max_slippage_bps: 300 }];
      }
      return [];
    }
    held = 0;
    entryPrice = null;
    if (cool > 0) return [];
    if (k >= FALLBACK_BAR && !everFilled) {
      return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: (state.cash * 9800n) / BPS, max_slippage_bps: 300 }];
    }
    if (k < 60 || k >= 1439) return [];
    const n = closes.length;
    const up1 = n >= 2 && closes[n - 1]! > closes[n - 2]!;
    const up2 = n >= 3 && up1 && closes[n - 2]! > closes[n - 3]!;
    const hi360 = trailHigh(360);
    if (hi360 !== null && up1 && close * BPS <= hi360 * (BPS - DEEP_DIP_BPS)) {
      return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: state.cash, max_slippage_bps: 300 }];
    }
    const hi60 = trailHigh(60);
    if (hi60 !== null && up2 && close * BPS <= hi60 * (BPS - DIP_BPS)) {
      return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: (state.cash * 9800n) / BPS, max_slippage_bps: 300 }];
    }
    return [];
  },
});
