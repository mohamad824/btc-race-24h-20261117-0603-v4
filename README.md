# btc-race-24h-20261117-0603 — v4 candidate (held backup, not submitted)

Dip-recovery swing bot for make.fun's "Race a BTC trading bot live for 24 hours"
bounty. Long-only, one position, integer bps math, deterministic.

Strategy: buy 98% of cash when the close is >=110bps below the trailing-60-bar
high with 2 consecutive up closes; exits at +180bps take-profit / -100bps stop /
480-bar time stop (lifted past bar 1200 while >=40bps in profit); 60-bar cooldown
after a sell; deep washout arm (360-bar dip-350 + 1 up close, full size);
guaranteed-trade fallback buys at bar 1300 if never filled.
