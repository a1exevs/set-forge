import { act, renderHook } from '@testing-library/react';

import { useLoadingPhase } from '../use-loading-phase';

describe('useLoadingPhase', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the content with no skeleton when the data comes within 300 ms', () => {
    const { result, rerender } = renderHook(({ isLoading }: { isLoading: boolean }) => useLoadingPhase(isLoading), {
      initialProps: { isLoading: true },
    });

    expect(result.current).toBe('blank');
    act(() => {
      jest.advanceTimersByTime(299);
    });
    rerender({ isLoading: false });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('content');
  });

  it('shows the skeleton after 300 ms and keeps it 500 ms', () => {
    const { result, rerender } = renderHook(({ isLoading }: { isLoading: boolean }) => useLoadingPhase(isLoading), {
      initialProps: { isLoading: true },
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('skeleton');

    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ isLoading: false });
    act(() => {
      jest.advanceTimersByTime(399);
    });
    expect(result.current).toBe('skeleton');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('content');
  });

  it('keeps the skeleton while loading goes on past the minimum', () => {
    const { result } = renderHook(() => useLoadingPhase(true));

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current).toBe('skeleton');
  });

  it('shows the content at once when nothing loads', () => {
    const { result } = renderHook(() => useLoadingPhase(false));

    expect(result.current).toBe('content');
  });
});
