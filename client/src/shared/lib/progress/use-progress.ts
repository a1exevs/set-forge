import { useCallback, useEffect, useRef, useState } from 'react';

import { type Progress, PROGRESS_MIN_VISIBLE_MS, PROGRESS_SHOW_AFTER_MS } from './progress';

type ProgressControl<K extends string> = {
  /**
   * Runs `task` as action `key`. Resolves `true` once the task succeeded and the shown progress has been held,
   * `false` when ignored because an action is already in flight; rejects with the task's error after the hold.
   */
  run: (key: K, task: () => Promise<unknown>) => Promise<boolean>;
  /** The look of action `key`: its own progress, or `locked` while another action of the group runs. */
  progressOf: (key: K) => Progress;
  /** An action of the group is in flight — fields and the other controls lock on it. */
  busy: boolean;
};

const wait = (ms: number): Promise<void> =>
  new Promise<void>((resolve): void => {
    setTimeout(resolve, ms);
  });

/**
 * One group of actions that lock each other (a form's submit, two actions that end each other): a second press
 * is ignored at once, the indicator shows after `PROGRESS_SHOW_AFTER_MS` and stays `PROGRESS_MIN_VISIBLE_MS`.
 * The caller goes on only after `run` resolves, so progress never blinks away.
 */
export function useProgress<K extends string>(): ProgressControl<K> {
  const [active, setActive] = useState<K | null>(null);
  const [shown, setShown] = useState<boolean>(false);
  // A ref, not the state: two presses in one frame both see the state as idle.
  const activeRef = useRef<K | null>(null);
  const mountedRef = useRef<boolean>(true);

  // Set on every mount: StrictMode mounts twice, and a ref left false would keep the group locked for good.
  useEffect(() => {
    mountedRef.current = true;
    return (): void => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(async (key: K, task: () => Promise<unknown>): Promise<boolean> => {
    if (activeRef.current !== null) {
      return false;
    }
    activeRef.current = key;
    setActive(key);

    let shownAt: number | null = null;
    const showTimer = setTimeout((): void => {
      shownAt = Date.now();
      if (mountedRef.current) {
        setShown(true);
      }
    }, PROGRESS_SHOW_AFTER_MS);

    let failure: { error: unknown } | null = null;
    try {
      await task();
    } catch (error: unknown) {
      failure = { error };
    }

    clearTimeout(showTimer);
    if (shownAt !== null && mountedRef.current) {
      await wait(Math.max(0, PROGRESS_MIN_VISIBLE_MS - (Date.now() - shownAt)));
    }

    activeRef.current = null;
    if (mountedRef.current) {
      setActive(null);
      setShown(false);
    }

    if (failure !== null) {
      throw failure.error;
    }
    return true;
  }, []);

  const progressOf = useCallback(
    (key: K): Progress => {
      if (active === null) {
        return 'idle';
      }
      return active === key && shown ? 'shown' : 'locked';
    },
    [active, shown],
  );

  return { run, progressOf, busy: active !== null };
}
