import i18next from 'i18next';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from '../create-selectors';
import { detectLanguage } from './detect-language';
import type { LanguageState } from './language';
import { DEFAULT_LANGUAGE, isLanguage, type Language } from './languages';

const applyLanguage = (language: Language): void => {
  document.documentElement.lang = language;
  if (i18next.isInitialized) {
    void i18next.changeLanguage(language);
  }
};

const STORAGE_KEY = 'language-storage';

const browserLanguages = (): readonly string[] =>
  navigator.languages.length > 0 ? navigator.languages : [navigator.language];

const useLanguageStoreBase = create<LanguageState>()(
  devtools(
    immer(
      persist(
        set => ({
          language: DEFAULT_LANGUAGE,

          setLanguage: language => {
            set({ language });
            applyLanguage(language);
          },
        }),
        {
          name: STORAGE_KEY,
          partialize: state => ({ language: state.language }),
          // Detection runs only when the device holds no choice yet: a stored language always wins.
          merge: (persisted, current) => {
            const stored =
              typeof persisted === 'object' && persisted !== null && 'language' in persisted
                ? persisted.language
                : undefined;
            return { ...current, language: isLanguage(stored) ? stored : detectLanguage(browserLanguages()) };
          },
          // Hydration does not write the storage, so the detected language is saved here — the next open keeps it.
          onRehydrateStorage: () => state => {
            state?.setLanguage(state.language);
          },
        },
      ),
    ),
    { name: 'LanguageStore' },
  ),
);

export const useLanguageStore = createSelectors(useLanguageStoreBase);

// Another tab of the app changed the language: follow it at once, without a reload.
window.addEventListener('storage', (event: StorageEvent): void => {
  if (event.key === STORAGE_KEY) {
    void useLanguageStoreBase.persist.rehydrate();
  }
});
