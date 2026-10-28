import type { useLanguageStore as LanguageStore } from '../language-store';

const STORAGE_KEY = 'language-storage';

const setBrowserLanguages = (languages: string[]): void => {
  Object.defineProperty(window.navigator, 'languages', { value: languages, configurable: true });
};

/** A fresh module is a fresh app open: the store hydrates from the device storage again. */
const openApp = (): typeof LanguageStore => {
  let store: typeof LanguageStore | undefined;
  jest.isolateModules(() => {
    store = jest.requireActual<{ useLanguageStore: typeof LanguageStore }>('../language-store').useLanguageStore;
  });
  if (!store) {
    throw new Error('language store did not load');
  }
  return store;
};

const storedLanguage = (): unknown => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as { state: { language: unknown } }).state.language : undefined;
};

describe('language store', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  // @invariant session/interface-language
  it('detects Russian on the first open with a Russian browser and keeps it on the device', () => {
    setBrowserLanguages(['ru-RU', 'en-US']);

    const store = openApp();

    expect(store.getState().language).toBe('ru');
    expect(storedLanguage()).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
  });

  it('gives English on the first open with any other browser language', () => {
    setBrowserLanguages(['de-DE', 'ru-RU']);

    const store = openApp();

    expect(store.getState().language).toBe('en');
    expect(storedLanguage()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  // @invariant session/interface-language
  it('keeps the stored choice on the next open and does not detect again', () => {
    setBrowserLanguages(['en-US']);
    openApp().getState().setLanguage('ru');

    setBrowserLanguages(['en-US']);
    const store = openApp();

    expect(store.getState().language).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
  });

  it('follows a language chosen in another tab without a reload', () => {
    setBrowserLanguages(['en-US']);
    const store = openApp();

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { language: 'ru' }, version: 0 }));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));

    expect(store.getState().language).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
  });

  it('applies a change to the page language at once and stores it', () => {
    setBrowserLanguages(['en-US']);
    const store = openApp();

    store.getState().setLanguage('ru');

    expect(document.documentElement.lang).toBe('ru');
    expect(storedLanguage()).toBe('ru');
  });
});
