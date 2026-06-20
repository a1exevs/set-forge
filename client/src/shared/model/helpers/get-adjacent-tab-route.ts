export type TabRoute = {
  id: string;
  to: string;
};

export type SwipeDirection = 'left' | 'right';

export function getAdjacentTabRoute(tabs: TabRoute[], activePath: string, direction: SwipeDirection): TabRoute | null {
  const activeIndex = tabs.findIndex(tab => tab.to === activePath);
  if (activeIndex === -1) {
    return null;
  }

  const nextIndex = direction === 'left' ? activeIndex + 1 : activeIndex - 1;
  if (nextIndex < 0 || nextIndex >= tabs.length) {
    return null;
  }

  return tabs[nextIndex] ?? null;
}
