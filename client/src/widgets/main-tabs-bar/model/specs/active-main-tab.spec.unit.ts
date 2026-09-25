import { getActiveMainTabId } from '../active-main-tab';

describe('getActiveMainTabId', () => {
  it('returns the tab of a main route', () => {
    expect(getActiveMainTabId('/')).toBe('home');
    expect(getActiveMainTabId('/history')).toBe('history');
    expect(getActiveMainTabId('/profile')).toBe('profile');
  });

  it('is empty outside the main tabs', () => {
    expect(getActiveMainTabId('/create')).toBe('');
  });
});
