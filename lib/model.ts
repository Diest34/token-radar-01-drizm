// Token Radar's value model (radar-2), written fresh for the @driz-m entry.
//
// The model scores every pre-token protocol in the sealed snapshot and ranks
// it by an implied value: what its token would be worth if the protocol's
// record stayed as it is. It never predicts whether or when a token is
// issued; the implied value is this entry's own claim.
//
//   implied = tvl x categoryMultiple x growthFactor x tenureFactor
//             x chainFactor x plausibility
//
// Every factor comes from the snapshot's own figures: the protocol's TVL,
// its seven-day growth, how long it has run, how many chains it runs on,
// and whether a token launch is plausible for it at all.

export interface SnapshotProtocol {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
}

/** The whole snapshot document. */
export interface Snapshot {
  as_of: string;
  source: string;
  floor_usd: number;
  protocols: SnapshotProtocol[];
  watchlist: string[];
}

/** The model's constants, as the dashboard states them. */
export interface ModelConstants {
  growth_low: number;
  growth_high: number;
  growth_divisor: number;
  tenure_floor: number;
  tenure_days: number;
  unknown_age_factor: number;
  chain_step: number;
  chain_max: number;
}

export const MODEL: ModelConstants = {
  growth_low: -40,
  growth_high: 120,
  growth_divisor: 250,
  tenure_floor: 0.75,
  tenure_days: 1825,
  unknown_age_factor: 0.85,
  chain_step: 0.04,
  chain_max: 5,
};

/** The model's version label: the dashboard names it. */
export const MODEL_VERSION = 'radar-2';

/**
 * The FDV/TVL multiple a category typically commands, as this entry claims
 * it. A venue that takes trading fees prices higher than a wrapper of an
 * asset that already trades; a centralised exchange prices lowest of all,
 * because its token, where one exists, is a company's, not a protocol's.
 */
export const CATEGORY_MULTIPLES: Record<string, number> = {
  'Dexs': 0.42,
  'Chain': 0.45,
  'Prediction Market': 0.4,
  'Derivatives': 0.38,
  'RWA': 0.36,
  'Lending': 0.34,
  'Privacy': 0.34,
  'Interest Rate Derivatives': 0.34,
  'Payments': 0.33,
  'CDP': 0.32,
  'Yield': 0.3,
  'Yield Aggregator': 0.3,
  'Liquidity Manager': 0.3,
  'Basis Trading': 0.3,
  'Indexes': 0.3,
  'Options Vault': 0.3,
  'CDP Manager': 0.3,
  'Collateral Markets': 0.3,
  'Decentralized BTC': 0.3,
  'Leveraged Farming': 0.28,
  'OTC Marketplace': 0.28,
  'Anchor BTC': 0.28,
  'Onchain Capital Allocator': 0.26,
  'Risk Curators': 0.24,
  'Uncollateralized Lending': 0.26,
  'Insurance': 0.26,
  'Farm': 0.26,
  'Crypto Card Issuer': 0.24,
  'Restaking': 0.22,
  'Governance Incentives': 0.22,
  'Dual-Token Stablecoin': 0.2,
  'CeDeFi': 0.2,
  'Staking Pool': 0.18,
  'Bridge': 0.16,
  'Cross Chain Bridge': 0.16,
  'Liquid Staking': 0.14,
  'Liquid Restaking': 0.14,
  'Canonical Bridge': 0.14,
  'Restaked BTC': 0.12,
  'Stablecoin Wrapper': 0.12,
  'CEX': 0.1,
};

export const DEFAULT_MULTIPLE = 0.25;

/** Categories whose product is not a token that could launch: a wrapped or staked asset, or a bridge. */
const LOW_PLAUSIBILITY_CATEGORIES = new Set([
  'Bridge',
  'Canonical Bridge',
  'Cross Chain Bridge',
  'Liquid Staking',
  'Liquid Restaking',
  'Restaked BTC',
  'Stablecoin Wrapper',
]);

/** An exchange is a company, not a protocol launch: its token, where one exists, is a company's. */
const EXCHANGE_CATEGORIES = new Set(['CEX']);

const MID_PLAUSIBILITY_CATEGORIES = new Set(['Staking Pool', 'Restaking']);

const EXCHANGE_NAMES = ['Binance', 'Coinbase', 'Bybit', 'Kraken', 'Bitget', 'OKX', 'Bitfinex', 'Gemini'];

/** A farm step: the action, what it costs, and how long it takes. */
export interface FarmStep {
  text: string;
  cost: string;
  time: string;
}

/** One row of board.json: the ranked board's row. */
export interface BoardRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
  token_status: 'pre-token';
  age_days: number | null;
  implied_value_usd: number;
  model: {
    category_multiple: number;
    growth_factor: number;
    tenure_factor: number;
    chain_factor: number;
    plausibility: number;
  };
  farm_steps: string[];
}

/** The dashboard's compact view of one row. */
export interface RadarRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  age_days: number | null;
  implied_value_usd: number;
  plausibility: number;
  category_multiple: number;
  growth_factor: number;
  tenure_factor: number;
  chain_factor: number;
  farm_steps: string[];
}

/** A live-token protocol: it already trades, so the board shows the market's own value, not a model's. */
export interface LiveRow {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  mcap_usd: number | null;
  change_7d: number | null;
}

/** How many live-token protocols the Already trading view carries, by market cap. */
export const LIVE_ROWS = 24;

/** Everything the dashboard needs: the board, the live set, and the model it runs. */
export interface RadarData {
  as_of: string;
  source: string;
  floor_usd: number;
  model: ModelConstants;
  model_version: string;
  watchlist_size: number;
  board_size: number;
  live_size: number;
  rows: RadarRow[];
  live: LiveRow[];
}

/** Why the snapshot is not one this model can score. */
export class SnapshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SnapshotError';
  }
}

const DAY_MS = 86_400_000;

/** A finite number, else `fallback`. */
function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** A whole day count from `from` to `to`, clamped at zero; null when either date is absent or bad. */
export function ageDays(asOf: string, listedAt: string | null): number | null {
  if (listedAt === null) return null;
  const a = Date.parse(`${asOf}T00:00:00Z`);
  const b = Date.parse(`${listedAt}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.max(0, Math.floor((a - b) / DAY_MS));
}

/** The category's FDV/TVL multiple, or the default for a category the table does not name. */
export function categoryMultiple(category: string | null): number {
  if (category === null) return DEFAULT_MULTIPLE;
  return CATEGORY_MULTIPLES[category] ?? DEFAULT_MULTIPLE;
}

/**
 * How plausible a token launch is for this protocol, from 0 to 1. An
 * exchange scores 0.10: it is a company, not a protocol launch. A bridge or
 * a wrapped or staked product of a token that already trades scores 0.25:
 * its token, where one exists, is not a launch waiting to happen. A staking
 * pool scores 0.50. Everything else scores 1.
 */
export function plausibility(p: SnapshotProtocol): number {
  if (p.category !== null && EXCHANGE_CATEGORIES.has(p.category)) return 0.1;
  if (p.category !== null && LOW_PLAUSIBILITY_CATEGORIES.has(p.category)) return 0.25;
  if (p.category !== null && MID_PLAUSIBILITY_CATEGORIES.has(p.category)) return 0.5;
  if (/\b(wrapped|staked|staking)\b/i.test(p.name)) return 0.4;
  for (const ex of EXCHANGE_NAMES) {
    if (p.name.toLowerCase().startsWith(ex.toLowerCase())) return 0.4;
  }
  return 1;
}

/** The growth factor: 1 + the seven-day change, clamped, over 250. A missing change scores 1. */
export function growthFactor(change7d: number | null, model: ModelConstants = MODEL): number {
  if (change7d === null) return 1;
  const c = Math.min(model.growth_high, Math.max(model.growth_low, change7d));
  return 1 + c / model.growth_divisor;
}

/** The tenure factor: 0.75 for a brand-new protocol, rising to 1.0 at five years. Unknown age scores 0.85. */
export function tenureFactor(age: number | null, model: ModelConstants = MODEL): number {
  if (age === null) return model.unknown_age_factor;
  return model.tenure_floor + (1 - model.tenure_floor) * Math.min(age, model.tenure_days) / model.tenure_days;
}

/** The chain factor: 1.0 on one chain, +0.04 per extra chain up to +0.20. */
export function chainFactor(chains: string[], model: ModelConstants = MODEL): number {
  const extra = Math.min(Math.max(chains.length - 1, 0), model.chain_max);
  return 1 + model.chain_step * extra;
}

/** The implied value and every factor behind it. */
export function impliedValue(
  p: SnapshotProtocol,
  asOf: string,
  model: ModelConstants = MODEL,
): { implied: number; category_multiple: number; growth_factor: number; tenure_factor: number; chain_factor: number; plausibility: number; age: number | null } {
  const age = ageDays(asOf, p.listed_at);
  const cm = categoryMultiple(p.category);
  const gf = growthFactor(p.change_7d, model);
  const tf = tenureFactor(age, model);
  const cf = chainFactor(p.chains, model);
  const pl = plausibility(p);
  const implied = Math.max(1, Math.round(p.tvl_usd * cm * gf * tf * cf * pl));
  return { implied, category_multiple: cm, growth_factor: gf, tenure_factor: tf, chain_factor: cf, plausibility: pl, age };
}

/** True when DefiLlama records no token for the protocol. */
export function isPreToken(p: SnapshotProtocol): boolean {
  return p.gecko_id === null && p.symbol === null;
}

/** The first chain the protocol runs on, for the gas note. */
function firstChain(p: SnapshotProtocol): string {
  return p.chains.length > 0 ? p.chains[0]! : 'Ethereum';
}

/** What one transaction costs on the protocol's main chain, as a short note. */
function gasNote(p: SnapshotProtocol): string {
  const c = firstChain(p).toLowerCase();
  if (c === 'ethereum') return 'about $5–20 in gas per transaction on Ethereum';
  if (c === 'solana') return 'about $0.001 in fees per transaction on Solana';
  if (c === 'bsc' || c === 'bnb chain' || c === 'binance smart chain') return 'about $0.05–0.20 in gas per transaction on BSC';
  if (['arbitrum', 'optimism', 'base', 'polygon', 'zksync', 'linea', 'scroll', 'blast', 'mode', 'fraxtal'].includes(c)) {
    return 'about $0.01–0.50 in gas per transaction on an L2';
  }
  return 'about $0.10–2.00 in gas per transaction';
}

/** A short money note for the protocol's size. */
function sizeNote(p: SnapshotProtocol): string {
  if (p.tvl_usd >= 1_000_000_000) return 'a large protocol, so expect a points program rather than a quick airdrop';
  if (p.tvl_usd >= 100_000_000) return 'a mid-size protocol, early enough that activity still counts';
  return 'a small protocol, so start with a test amount and treat it as higher risk';
}

/** The category's playbook: what to actually do on the protocol. */
function playbook(p: SnapshotProtocol): { verb: string; action: string; follow: string } {
  const cat = p.category ?? '';
  const gas = gasNote(p);
  const chain = firstChain(p);
  switch (cat) {
    case 'Risk Curators':
    case 'Onchain Capital Allocator':
      return {
        verb: 'deposit',
        action: `Deposit into a ${p.name} curator vault on ${chain} and let the curator allocate it. Cost: ${gas}, plus the capital you choose. Time: 15 minutes.`,
        follow: `Leave the deposit in for at least four weeks and check the vault's allocation weekly; a curator that moves your capital often is one to watch closely. Cost: ${gas} per move. Time: 10 minutes a week.`,
      };
    case 'Dexs':
      return {
        verb: 'trade',
        action: `Swap a small amount on ${p.name} on ${chain} to test the router, then add liquidity to a pool you understand. Cost: ${gas}, plus the capital you choose. Time: 15 minutes.`,
        follow: `Keep the liquidity in for at least four weeks and check the pool weekly, so the activity reads as real use rather than one trade. Cost: nothing but gas to check. Time: 10 minutes a week.`,
      };
    case 'Lending':
      return {
        verb: 'lend',
        action: `Supply USDC or ETH as collateral on ${p.name} on ${chain}. Cost: ${gas}, plus the capital you choose. Time: 10 minutes.`,
        follow: `Borrow a small amount against it and repay it a week later, keeping the health factor above 2 the whole time. Cost: ${gas} per move plus borrow interest. Time: 10 minutes a week.`,
      };
    case 'Yield':
    case 'Yield Aggregator':
      return {
        verb: 'deposit',
        action: `Deposit into a ${p.name} vault on ${chain} and let it compound. Cost: ${gas}, plus the capital you choose. Time: 10 minutes.`,
        follow: `Leave the deposit in for at least four weeks and check the vault weekly; try a second vault only if you understand its strategy. Cost: ${gas} per move. Time: 10 minutes a week.`,
      };
    case 'Derivatives':
      return {
        verb: 'trade',
        action: `Open a small perpetual or derivatives position on ${p.name} on ${chain} with low leverage. Cost: ${gas}, plus the margin you choose. Time: 10 minutes.`,
        follow: `Close the position after a few days and trade once a week with small size, never more than you can lose. Cost: ${gas} per trade plus funding. Time: 15 minutes a week.`,
      };
    case 'RWA':
      return {
        verb: 'hold',
        action: `Mint or buy the tokenised asset on ${p.name} on ${chain}. Cost: ${gas}, plus the capital you choose. Time: 15 minutes.`,
        follow: `Hold the asset in the protocol's own app and check its yield weekly; a tokenised real-world asset rewards holders, not flippers. Cost: nothing to hold. Time: 5 minutes a week.`,
      };
    case 'CDP':
    case 'CDP Manager':
      return {
        verb: 'mint',
        action: `Lock collateral and mint the protocol's stablecoin on ${p.name} on ${chain}. Cost: ${gas}, plus the collateral you choose. Time: 15 minutes.`,
        follow: `Keep the collateral ratio well above the liquidation line and check it weekly; repay part of the debt before any sharp market move. Cost: ${gas} per move. Time: 5 minutes a week.`,
      };
    case 'Bridge':
    case 'Canonical Bridge':
    case 'Cross Chain Bridge':
      return {
        verb: 'bridge',
        action: `Bridge a small amount through ${p.name} from ${chain} to another chain it serves. Cost: ${gas} plus the bridge fee. Time: 10 minutes.`,
        follow: `Bridge back or use the funds on the destination chain, and repeat with small amounts once a month. Cost: ${gas} plus the bridge fee each time. Time: 15 minutes a month.`,
      };
    case 'CEX':
      return {
        verb: 'trade',
        action: `Use ${p.name} as an exchange: place a small spot trade. Cost: the trading fee, about 0.1% of the trade. Time: 10 minutes.`,
        follow: `Do not keep funds on the exchange longer than you need to; withdraw to a wallet you hold. Cost: the withdrawal fee. Time: 10 minutes.`,
      };
    case 'Liquid Staking':
    case 'Liquid Restaking':
    case 'Restaked BTC':
    case 'Staking Pool':
      return {
        verb: 'stake',
        action: `Stake a small amount through ${p.name} on ${chain} and hold the receipt token it gives you. Cost: ${gas}, plus the capital you choose. Time: 10 minutes.`,
        follow: `Hold the receipt token and use it in one DeFi app, so the stake reads as real use. Cost: ${gas} per move. Time: 10 minutes a week.`,
      };
    case 'Prediction Market':
      return {
        verb: 'predict',
        action: `Place a small prediction on a market on ${p.name} on ${chain}. Cost: ${gas}, plus the stake you choose. Time: 10 minutes.`,
        follow: `Settle or close the position when the market resolves, and try one new market a week. Cost: ${gas} per market. Time: 10 minutes a week.`,
      };
    default:
      return {
        verb: 'use',
        action: `Open ${p.name} on ${chain} and make a first real transaction in its app. Cost: ${gas}, plus the capital you choose. Time: 10 minutes.`,
        follow: `Come back once a week and use the app again, so the activity reads as a real user rather than a single visit. Cost: ${gas} per visit. Time: 10 minutes a week.`,
      };
  }
}

/**
 * The farm plan for one protocol: 4 to 6 concrete steps, each stating what
 * it costs and how long it takes. A low-plausibility protocol gets a plain
 * warning first, so the reader is not misled about a launch.
 */
export function farmSteps(p: SnapshotProtocol, age: number | null): string[] {
  const pb = playbook(p);
  const steps: string[] = [];
  const pl = plausibility(p);
  if (pl < 1) {
    steps.push(
      `Note first: ${p.name} scores low on launch plausibility, because it is a ${p.category ?? 'product'} whose token already trades or which wraps one that does. Farm it for the product itself, not for a launch. Cost: nothing. Time: 2 minutes to read this.`,
    );
  }
  steps.push(
    `Open ${p.name} on ${firstChain(p)} from its official site and connect a fresh wallet you use only for farming. Cost: nothing to connect. Time: 5 minutes.`,
  );
  steps.push(pb.action);
  steps.push(pb.follow);
  steps.push(
    `Watch for the token: follow ${p.name} on X and Discord and check its announcements weekly, so you hear about a launch or a points program first. Cost: nothing. Time: 5 minutes a week.`,
  );
  if (p.tvl_usd < 50_000_000) {
    steps.push(
      `Mind the size: ${p.name} holds $${Math.round(p.tvl_usd / 1_000_000)}M in TVL, ${sizeNote(p)}. Cost: nothing extra. Time: 5 minutes to check the TVL before you deposit.`,
    );
  } else {
    steps.push(
      `Mind the size: ${p.name} holds $${(p.tvl_usd / 1_000_000_000).toFixed(1)}B in TVL, ${sizeNote(p)}. Cost: nothing extra. Time: 5 minutes to check the TVL before you deposit.`,
    );
  }
  steps.push(
    `Stay safe: never approve unlimited spending, never paste a seed phrase into a site, and revoke the approval once you are done. Cost: ${gasNote(p)} to revoke. Time: 5 minutes.`,
  );
  return steps.slice(0, 6);
}

/** The board: every pre-token protocol, ranked by implied value. */
export function buildBoard(snapshot: Snapshot, model: ModelConstants = MODEL): BoardRow[] {
  const rows: BoardRow[] = [];
  for (const p of snapshot.protocols) {
    if (!isPreToken(p)) continue;
    const v = impliedValue(p, snapshot.as_of, model);
    rows.push({
      rank: 0,
      slug: p.slug,
      name: p.name,
      category: p.category,
      chains: p.chains,
      tvl_usd: p.tvl_usd,
      change_7d: p.change_7d,
      mcap_usd: p.mcap_usd,
      listed_at: p.listed_at,
      gecko_id: p.gecko_id,
      symbol: p.symbol,
      token_status: 'pre-token',
      age_days: v.age,
      implied_value_usd: v.implied,
      model: {
        category_multiple: v.category_multiple,
        growth_factor: v.growth_factor,
        tenure_factor: v.tenure_factor,
        chain_factor: v.chain_factor,
        plausibility: v.plausibility,
      },
      farm_steps: farmSteps(p, v.age),
    });
  }
  rows.sort((a, b) => {
    if (b.implied_value_usd !== a.implied_value_usd) return b.implied_value_usd - a.implied_value_usd;
    if (b.tvl_usd !== a.tvl_usd) return b.tvl_usd - a.tvl_usd;
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });
  return rows;
}

/** The live set: the token-bearing protocols with the largest market caps. */
export function liveRows(snapshot: Snapshot): LiveRow[] {
  return snapshot.protocols
    .filter((p) => p.mcap_usd !== null && p.mcap_usd > 0)
    .sort((a, b) => (b.mcap_usd ?? 0) - (a.mcap_usd ?? 0))
    .slice(0, LIVE_ROWS)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      chains: p.chains,
      tvl_usd: p.tvl_usd,
      mcap_usd: p.mcap_usd,
      change_7d: p.change_7d,
    }));
}

/** The dashboard's compact view of one board row. */
export function radarRow(row: BoardRow): RadarRow {
  return {
    rank: row.rank,
    slug: row.slug,
    name: row.name,
    category: row.category,
    chains: row.chains,
    tvl_usd: row.tvl_usd,
    change_7d: row.change_7d,
    mcap_usd: row.mcap_usd,
    listed_at: row.listed_at,
    age_days: row.age_days,
    implied_value_usd: row.implied_value_usd,
    plausibility: row.model.plausibility,
    category_multiple: row.model.category_multiple,
    growth_factor: row.model.growth_factor,
    tenure_factor: row.model.tenure_factor,
    chain_factor: row.model.chain_factor,
    farm_steps: row.farm_steps,
  };
}

/** The board and everything the dashboard needs, from one snapshot. */
export function buildRadar(snapshot: Snapshot, model: ModelConstants = MODEL): { board: BoardRow[]; radar: RadarData } {
  const board = buildBoard(snapshot, model);
  const live = liveRows(snapshot);
  const radar: RadarData = {
    as_of: snapshot.as_of,
    source: snapshot.source,
    floor_usd: snapshot.floor_usd,
    model,
    model_version: MODEL_VERSION,
    watchlist_size: snapshot.watchlist.length,
    board_size: board.length,
    live_size: live.length,
    rows: board.map(radarRow),
    live,
  };
  return { board, radar };
}

/** Parse and check the snapshot document. */
export function parseSnapshot(text: string): Snapshot {
  let doc: unknown;
  try {
    doc = JSON.parse(text);
  } catch {
    throw new SnapshotError('snapshot is not JSON');
  }
  if (doc === null || typeof doc !== 'object') throw new SnapshotError('snapshot is not an object');
  const d = doc as Record<string, unknown>;
  if (typeof d.as_of !== 'string' || typeof d.source !== 'string' || typeof d.floor_usd !== 'number') {
    throw new SnapshotError('snapshot is missing as_of, source or floor_usd');
  }
  if (!Array.isArray(d.protocols) || !Array.isArray(d.watchlist)) {
    throw new SnapshotError('snapshot is missing protocols or watchlist');
  }
  return d as unknown as Snapshot;
}

/** The gate's own checks on the board, as a single issue string or null when it passes. */
export function boardIssue(board: BoardRow[], snapshot: Snapshot): string | null {
  if (board.length < 100) return `board holds ${board.length} rows, fewer than the 100 the gate needs`;
  if (board.length > 4000) return `board holds ${board.length} rows, more than the 4,000 the gate allows`;
  const seen = new Set<string>();
  let prev = Number.POSITIVE_INFINITY;
  for (let i = 0; i < board.length; i++) {
    const r = board[i]!;
    if (r.rank !== i + 1) return `row ${i} has rank ${r.rank}, not ${i + 1}`;
    if (seen.has(r.slug)) return `slug ${r.slug} appears twice`;
    seen.add(r.slug);
    if (!Number.isSafeInteger(r.implied_value_usd) || r.implied_value_usd <= 0) {
      return `row ${r.slug} has implied_value_usd ${r.implied_value_usd}`;
    }
    if (r.implied_value_usd > prev) return `row ${r.slug} rises above the row before it`;
    prev = r.implied_value_usd;
    if (!Array.isArray(r.farm_steps) || r.farm_steps.length < 3 || r.farm_steps.length > 12) {
      return `row ${r.slug} has ${Array.isArray(r.farm_steps) ? r.farm_steps.length : 0} farm steps`;
    }
    for (const s of r.farm_steps) {
      const t = typeof s === 'string' ? s.trim() : '';
      if (t.length < 20 || t.length > 600) return `row ${r.slug} has a farm step of ${t.length} characters`;
    }
  }
  for (const slug of snapshot.watchlist) {
    if (!seen.has(slug)) return `watchlist slug ${slug} is missing from the board`;
  }
  return null;
}

/** The dashboard's data file: window.RADAR, written beside dashboard/. */
export function dataScript(radar: RadarData): string {
  return `window.RADAR=${JSON.stringify(radar)};\n`;
}
