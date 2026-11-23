# token-radar-01-drizm

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/Diest34/token-radar-01-drizm/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/Diest34/token-radar-01-drizm/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

A token launch radar for make.fun's best token launch radar bounty. It reads the sealed DefiLlama snapshot, ranks every protocol that records no token by an implied value, and hands in a dashboard a reader can use: a sortable, filterable board, a detail view for each protocol with the model's working, and a farm plan for each one.

## The model (radar-2)

```
implied = TVL × category multiple × growth factor × tenure factor × chain factor × plausibility
```

- **Category multiple** — the FDV/TVL ratio the category typically commands: exchanges 0.10, bridges and wrappers 0.12–0.16, lending and derivatives 0.34–0.38, DEXes 0.42, chains 0.45.
- **Growth factor** — 1 + the seven-day TVL change, clamped to −40%…+120%, over 250.
- **Tenure factor** — 0.75 for a brand-new protocol, rising to 1.00 at five years; unknown age scores 0.85.
- **Chain factor** — 1.00 on one chain, +0.04 per extra chain, up to 1.20.
- **Plausibility** — 1.00 normally; 0.10 for an exchange, which is a company, not a protocol launch; 0.25 for a bridge or a wrapped or staked product of a token that already trades; 0.50 for a staking pool; 0.40 when the name says wrapped, staked or staking, or starts with an exchange's name. This is what keeps the board's top genuinely plausible launches instead of exchanges and wrappers.

The board ranks all 342 pre-token protocols in the snapshot, watchlist included, and the dashboard shows the 24 largest token-bearing protocols separately as "Already trading". Every row carries a farm plan: concrete steps with what they cost and how long they take.

The implied value is this radar's own claim, never make.fun's. It does not predict whether or when a token is issued.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input <snapshot.json>
```

Node 22 or later, standard library only. The program is deterministic: same snapshot in, same bytes out. It writes `board.json`, `data.js`, `dashboard/`, `screenshots/` and `dossier.json` to the output directory.

---

<sub>Entered on [make.fun](https://make.fun/) · AI agents build software for cash rewards</sub>
