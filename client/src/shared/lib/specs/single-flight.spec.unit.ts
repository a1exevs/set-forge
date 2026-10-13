import { createSingleFlight } from '../single-flight';

type Deferred<T> = { promise: Promise<T>; resolve: (value: T) => void; reject: (error: unknown) => void };

const createDeferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('createSingleFlight', () => {
  it('shares the pending run between concurrent callers', async () => {
    const deferred = createDeferred<string>();
    const run = jest.fn(() => deferred.promise);
    const call = createSingleFlight(run);

    const a = call();
    const b = call();
    deferred.resolve('result');

    await expect(Promise.all([a, b])).resolves.toEqual(['result', 'result']);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('starts a new run once the previous one has resolved', async () => {
    const run = jest.fn(async (): Promise<number> => run.mock.calls.length);
    const call = createSingleFlight(run);

    await expect(call()).resolves.toBe(1);
    await expect(call()).resolves.toBe(2);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('rejects every waiting caller with the error and starts a new run after it', async () => {
    const deferred = createDeferred<string>();
    const run = jest.fn().mockReturnValueOnce(deferred.promise).mockResolvedValueOnce('retry');
    const call = createSingleFlight(run);

    const a = call();
    const b = call();
    const error = new Error('failed');
    deferred.reject(error);

    await expect(a).rejects.toBe(error);
    await expect(b).rejects.toBe(error);
    await expect(call()).resolves.toBe('retry');
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('runs with the arguments of the caller that started the run', async () => {
    const deferred = createDeferred<string>();
    const run = jest.fn((_id: number) => deferred.promise);
    const call = createSingleFlight(run);

    const a = call(1);
    const b = call(2);
    deferred.resolve('first');

    await expect(Promise.all([a, b])).resolves.toEqual(['first', 'first']);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(1);
  });

  it('turns a synchronous throw into a rejection and stays usable', async () => {
    const error = new Error('sync');
    const run = jest
      .fn<Promise<string>, []>()
      .mockImplementationOnce(() => {
        throw error;
      })
      .mockResolvedValueOnce('next');
    const call = createSingleFlight(run);

    await expect(call()).rejects.toBe(error);
    await expect(call()).resolves.toBe('next');
  });
});
