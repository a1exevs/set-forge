import type { Theme, ThemeState } from 'src/shared/theme/model/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSelectors } from '@shared';

const applyThemeToDocument = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
};

const useThemeStoreBase = create<ThemeState>()(
  persist(
    set => ({
      theme: 'dark',

      setTheme: theme => {
        set({ theme });
        applyThemeToDocument(theme);
      },

      toggleTheme: () => {
        set(state => {
          const newTheme: Theme = state.theme === 'dark' ? 'light' : 'dark';
          applyThemeToDocument(newTheme);
          return { theme: newTheme };
        });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => state => {
        if (state) {
          applyThemeToDocument(state.theme);
        }
      },
    },
  ),
);

export const useThemeStore = createSelectors(useThemeStoreBase);
