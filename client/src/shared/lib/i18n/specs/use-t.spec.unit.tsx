import { act, render, screen } from '@testing-library/react';
import { FC } from 'react';

import { useLanguageStore } from '../language-store';
import { useT } from '../use-t';

const Probe: FC = () => {
  const { t, language } = useT();
  return (
    <p>
      {language}: {t('language.label')}
    </p>
  );
};

describe('useT', () => {
  it('translates in the current language and re-renders when the language changes', () => {
    render(<Probe />);
    expect(screen.getByText('en: Language')).toBeInTheDocument();

    act(() => {
      useLanguageStore.getState().setLanguage('ru');
    });

    expect(screen.getByText('ru: Язык')).toBeInTheDocument();
  });
});
