jest.mock('src/entities/session/model/bootstrap-session', () => ({
  ...jest.requireActual('src/entities/session/model/bootstrap-session'),
  bootstrapSessionAndPrimeCache: jest.fn(
    async (qc: { setQueryData: (key: readonly unknown[], data: unknown) => void }) => {
      const user = { id: 1, email: 'test@example.com' };
      qc.setQueryData(['session', 'me'], user);
      return user;
    },
  ),
}));

import { dictionaries } from 'src/app/i18n/dictionaries';
// The i18n files themselves, not the `shared/lib` index: loading the index here would load its other modules before
// a test's `jest.mock` of them.
import { initI18n } from 'src/shared/lib/i18n/init-i18n';
import { useLanguageStore } from 'src/shared/lib/i18n/language-store';

// Tests read the English texts unless they switch the language themselves.
initI18n(dictionaries);
beforeEach(() => {
  useLanguageStore.getState().setLanguage('en');
});

// jest-dom matchers for DOM nodes (`toHaveTextContent`, …): https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
