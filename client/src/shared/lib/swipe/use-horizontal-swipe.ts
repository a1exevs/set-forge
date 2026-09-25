import { RefObject, useEffect, useRef } from 'react';

export type UseHorizontalSwipeOptions = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minDistance?: number;
  maxVerticalDeviation?: number;
};

export function useHorizontalSwipe({
  onSwipeLeft,
  onSwipeRight,
  minDistance = 60,
  maxVerticalDeviation = 40,
}: UseHorizontalSwipeOptions): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    const handleTouchStart = (event: TouchEvent): void => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (event: TouchEvent): void => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start) {
        return;
      }

      const touch = event.changedTouches[0];
      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;

      if (Math.abs(deltaY) > maxVerticalDeviation) {
        return;
      }
      if (Math.abs(deltaX) < minDistance) {
        return;
      }

      if (deltaX < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return (): void => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, minDistance, maxVerticalDeviation]);

  return ref;
}
