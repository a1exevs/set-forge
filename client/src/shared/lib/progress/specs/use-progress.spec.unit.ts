import { act, renderHook } from '@testing-library/react';
import { createElement, type FC, type PropsWithChildren, StrictMode } from 'react';

import { useProgress } from '../use-progress';

type Deferred = { promise: Promise<void>; resolve: () => void; reject: (error: Error) => void };

const deferred = (): Deferred => {
  let resolve: () => void = (): void => undefined;
  let reject: (error: Error) => void = (): void => undefined;
  const promise = new Promise<void>((res, rej): void => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('useProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('locks at once and shows no indicator for an answer within 300 ms', async () => {
    const request = deferred();
    const { result } = renderHook(() => useProgress<'save'>());

    let done: Promise<boolean> = Promise.resolve(false);
    act(() => {
      done = result.current.run('save', () => request.promise);
    });
    expect(result.current.progressOf('save')).toBe('pending');
    expect(result.current.busy).toBe(true);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(299);
      request.resolve();
      await done;
    });

    expect(await done).toBe(true);
    expect(result.current.progressOf('save')).toBe('idle');
    expect(result.current.busy).toBe(false);
  });

  it('shows the indicator after 300 ms and holds it 500 ms before resolving', async () => {
    const request = deferred();
    const { result } = renderHook(() => useProgress<'save'>());

    let resolved = false;
    act(() => {
      void result.current
        .run('save', () => request.promise)
        .then((): void => {
          resolved = true;
        });
    });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(300);
    });
    expect(result.current.progressOf('save')).toBe('shown');

    await act(async () => {
      await jest.advanceTimersByTimeAsync(100);
      request.resolve();
      await jest.advanceTimersByTimeAsync(399);
    });
    expect(resolved).toBe(false);
    expect(result.current.progressOf('save')).toBe('shown');

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(resolved).toBe(true);
    expect(result.current.progressOf('save')).toBe('idle');
  });

  it('ignores a second run while one is in flight', async () => {
    const request = deferred();
    const second = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useProgress<'save'>());

    let first: Promise<boolean> = Promise.resolve(false);
    act(() => {
      first = result.current.run('save', () => request.promise);
    });
    let ignored = true;
    await act(async () => {
      ignored = !(await result.current.run('save', second));
    });

    expect(ignored).toBe(true);
    expect(second).not.toHaveBeenCalled();

    await act(async () => {
      request.resolve();
      await first;
    });
  });

  it('locks the other actions of the group without an indicator', async () => {
    const request = deferred();
    const { result } = renderHook(() => useProgress<'logout' | 'delete'>());

    act(() => {
      void result.current.run('logout', () => request.promise);
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(300);
    });

    expect(result.current.progressOf('logout')).toBe('shown');
    expect(result.current.progressOf('delete')).toBe('locked');

    await act(async () => {
      request.resolve();
      await jest.advanceTimersByTimeAsync(500);
    });
  });

  it('rejects with the error after the hold and returns to idle', async () => {
    const request = deferred();
    const { result } = renderHook(() => useProgress<'save'>());

    let outcome: unknown = null;
    act(() => {
      result.current
        .run('save', () => request.promise)
        .catch((error: unknown): void => {
          outcome = error;
        });
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(300);
      request.reject(new Error('offline'));
      await jest.advanceTimersByTimeAsync(499);
    });
    expect(outcome).toBeNull();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1);
    });
    expect(outcome).toEqual(new Error('offline'));
    expect(result.current.progressOf('save')).toBe('idle');
  });

  it('shows and releases its progress under StrictMode, which mounts every effect twice', async () => {
    const request = deferred();
    const wrapper: FC<PropsWithChildren> = ({ children }) => createElement(StrictMode, null, children);
    const { result } = renderHook(() => useProgress<'save'>(), { wrapper });

    act(() => {
      void result.current.run('save', () => request.promise);
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(300);
    });
    expect(result.current.progressOf('save')).toBe('shown');

    await act(async () => {
      request.resolve();
      await jest.advanceTimersByTimeAsync(500);
    });
    expect(result.current.progressOf('save')).toBe('idle');
  });
});
