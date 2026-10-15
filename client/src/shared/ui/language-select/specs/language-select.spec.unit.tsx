import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LANGUAGES, useLanguageStore } from '@shared/lib';

import LanguageSelectDataLayer from '../language-select-data-layer';

describe('LanguageSelect', () => {
  it('lists every supported language, each named in itself', async () => {
    const user = userEvent.setup();
    render(<LanguageSelectDataLayer ariaLabel="Language" />);

    await user.click(screen.getByRole('button', { name: /^Language/ }));

    expect(screen.getAllByRole('option')).toHaveLength(LANGUAGES.length);
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Русский' })).toBeInTheDocument();
  });

  it('marks every language name with its own language, so a screen reader pronounces it right', async () => {
    const user = userEvent.setup();
    render(<LanguageSelectDataLayer ariaLabel="Language" />);

    expect(screen.getByText('English')).toHaveAttribute('lang', 'en');
    await user.click(screen.getByRole('button', { name: /^Language/ }));

    expect(screen.getByText('Русский')).toHaveAttribute('lang', 'ru');
  });

  it('offers the same full list in its compact form', async () => {
    const user = userEvent.setup();
    render(<LanguageSelectDataLayer ariaLabel="Language" variant="compact" />);

    await user.click(screen.getByRole('button', { name: /^Language/ }));
    await user.click(screen.getByRole('option', { name: 'Русский' }));

    expect(useLanguageStore.getState().language).toBe('ru');
  });

  it('switches the app language and the page language on a choice', async () => {
    const user = userEvent.setup();
    render(<LanguageSelectDataLayer ariaLabel="Language" />);

    await user.click(screen.getByRole('button', { name: /^Language/ }));
    await user.click(screen.getByRole('option', { name: 'Русский' }));

    expect(useLanguageStore.getState().language).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
    expect(screen.getByRole('button', { name: /^Language/ })).toHaveTextContent('Русский');
  });
});
