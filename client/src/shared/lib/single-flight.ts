/**
 * Wraps an async function so that concurrent calls share one run: while it is pending every caller gets its result
 * (the arguments of the callers that join it are ignored); once it settles, the next call starts a new run.
 */
export const createSingleFlight = <A extends unknown[], T>(
  run: (...args: A) => Promise<T>,
): ((...args: A) => Promise<T>) => {
  let pending: Promise<T> | null = null;

  const start = (args: A): Promise<T> => {
    try {
      return run(...args);
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return (...args: A): Promise<T> => {
    pending ??= start(args).finally(() => {
      pending = null;
    });
    return pending;
  };
};
