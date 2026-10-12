/**
 * How an action control looks while a request of its group runs: `pending` — its own, no indicator yet; `shown` — its
 * own, the indicator is on; `locked` — another action of the group holds it, so it looks disabled.
 */
export type Progress = 'idle' | 'pending' | 'shown' | 'locked';

/** A request that answers sooner shows no progress at all — a fast answer never flashes an indicator. */
export const PROGRESS_SHOW_AFTER_MS = 300;

/** Progress, once shown, stays at least this long — a slow answer never blinks it away. */
export const PROGRESS_MIN_VISIBLE_MS = 500;
