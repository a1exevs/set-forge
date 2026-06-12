import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createSelectors } from 'src/shared/model/helpers/stores';
import type { Theme, ThemeState } from 'src/shared/model/theme/types';

const applyThemeToDocument = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme);
};

const useThemeStoreBase = create<ThemeState>()(
  devtools(
    immer(
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
    ),
    { name: 'ThemeStore' },
  ),
);

export const useThemeStore = createSelectors(useThemeStoreBase);
