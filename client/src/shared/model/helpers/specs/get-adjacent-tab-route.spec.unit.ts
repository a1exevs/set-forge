import { getAdjacentTabRoute } from 'src/shared/model/helpers/get-adjacent-tab-route';

const tabs = [
  { id: 'home', to: '/' },
  { id: 'profile', to: '/profile' },
  { id: 'settings', to: '/settings' },
];

describe('getAdjacentTabRoute', () => {
  it('returns next tab on swipe left from home', () => {
    expect(getAdjacentTabRoute(tabs, '/', 'left')).toEqual({ id: 'profile', to: '/profile' });
  });

  it('returns previous tab on swipe right from profile', () => {
    expect(getAdjacentTabRoute(tabs, '/profile', 'right')).toEqual({ id: 'home', to: '/' });
  });

  it('returns null on swipe left from rightmost tab', () => {
    expect(getAdjacentTabRoute(tabs, '/settings', 'left')).toBeNull();
  });

  it('returns null on swipe right from leftmost tab', () => {
    expect(getAdjacentTabRoute(tabs, '/', 'right')).toBeNull();
  });

  it('returns null for unknown active path', () => {
    expect(getAdjacentTabRoute(tabs, '/unknown', 'left')).toBeNull();
  });
});
