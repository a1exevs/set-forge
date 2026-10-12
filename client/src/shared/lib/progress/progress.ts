/**
 * How an action control looks while its request runs: `idle`; `locked` — its request (or its pair's) is in flight,
 * no indicator yet; `shown` — the indicator is on.
 */
export type Progress = 'idle' | 'locked' | 'shown';

/** A request that answers sooner shows no progress at all — a fast answer never flashes an indicator. */
export const PROGRESS_SHOW_AFTER_MS = 300;

/** Progress, once shown, stays at least this long — a slow answer never blinks it away. */
export const PROGRESS_MIN_VISIBLE_MS = 500;
