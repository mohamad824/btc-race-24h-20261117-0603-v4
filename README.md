# btc-race-24h-20261117-0603 v4 — dip-recovery swing bot

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/mohamad824/btc-race-24h-20261117-0603-v4/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/mohamad824/btc-race-24h-20261117-0603-v4/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
Long-only cbBTC/USDC trading bot for make.fun's "Race a BTC trading bot live for 24 hours" ($250, top 10 by net PnL on the 24h race window).

## Strategy

- **Main arm:** close >= 110 bps below the trailing-60-bar high AND two consecutive up closes -> buy 98% of cash.
- **Deep arm:** close >= 350 bps below the trailing-360-bar high AND an up close -> buy 100% of cash (race-window washout catcher).
- **Fallback:** if no fill has ever landed by bar 1300, buy 98% of cash unconditionally, so a zero-trade finish is impossible by construction.
- **Exits (whole position):** take-profit +180 bps, hard stop -100 bps, time stop 480 bars; past bar 1200 the time stop is lifted while >= 40 bps in profit (hold to the close). 60-bar cooldown after a sell.
- Pure integer math on closes/fills only: no clock, no environment, no randomness. Deterministic: repeated runs produce byte-identical action logs.

Dev grade-local: net PnL +$33.89, 4 trades, max drawdown 0.647%, Sharpe 0.0526.
