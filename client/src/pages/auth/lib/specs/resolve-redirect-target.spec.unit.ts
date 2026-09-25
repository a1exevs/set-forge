import { resolveRedirectTarget } from '../resolve-redirect-target';

describe('resolveRedirectTarget', () => {
  it('keeps an in-app path', () => {
    expect(resolveRedirectTarget('/history?tab=1')).toBe('/history?tab=1');
  });

  it('falls back to home without a target', () => {
    expect(resolveRedirectTarget(undefined)).toBe('/');
    expect(resolveRedirectTarget('')).toBe('/');
  });

  it('rejects targets outside the app', () => {
    expect(resolveRedirectTarget('https://evil.example')).toBe('/');
    expect(resolveRedirectTarget('//evil.example')).toBe('/');
  });
});
