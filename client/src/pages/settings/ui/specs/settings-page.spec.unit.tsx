import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useLanguageStore } from '@shared/lib';

import SettingsPageLogicLayer from '../settings-page-logic-layer';

const history = { canGoBack: jest.fn(), back: jest.fn() };
const navigate = jest.fn();

jest.mock('@tanstack/react-router', () => ({
  useRouter: (): unknown => ({ history, navigate }),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the current language', () => {
    render(<SettingsPageLogicLayer />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Language/ })).toHaveTextContent('English');
  });

  it('switches the whole page to the chosen language at once', async () => {
    const user = userEvent.setup();
    render(<SettingsPageLogicLayer />);

    await user.click(screen.getByRole('button', { name: /^Language/ }));
    await user.click(screen.getByRole('option', { name: 'Русский' }));

    expect(useLanguageStore.getState().language).toBe('ru');
    expect(screen.getByRole('heading', { name: 'Настройки' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Назад' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Язык/ })).toHaveTextContent('Русский');
  });

  it('steps back to where the user came from', async () => {
    history.canGoBack.mockReturnValue(true);
    const user = userEvent.setup();
    render(<SettingsPageLogicLayer />);

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(history.back).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('falls back to Profile when there is no history', async () => {
    history.canGoBack.mockReturnValue(false);
    const user = userEvent.setup();
    render(<SettingsPageLogicLayer />);

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(navigate).toHaveBeenCalledWith({ to: '/profile' });
  });
});
