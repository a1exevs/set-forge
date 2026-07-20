import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import type { LegalContent, LegalLang } from 'src/shared/ui/legal-document/legal-document';
import LegalDocument from 'src/shared/ui/legal-document/legal-document-logic-layer';

const mockBack = jest.fn();
const mockNavigate = jest.fn();
let mockCanGoBack = true;

jest.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
  useRouter: () => ({
    history: { canGoBack: (): boolean => mockCanGoBack, back: mockBack },
    navigate: mockNavigate,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCanGoBack = true;
});

const content: Record<LegalLang, LegalContent> = {
  ru: {
    title: 'Политика обработки персональных данных',
    effectiveLabel: 'Действует с',
    intro: 'Вводный абзац на русском.',
    sections: [
      {
        heading: 'Раздел 1',
        blocks: [
          { type: 'p', text: 'Первый абзац.' },
          { type: 'ul', items: ['пункт один', 'пункт два'] },
          { type: 'p', text: ['См. ', { text: 'Соглашение', to: '/terms' }, '.'] },
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    effectiveLabel: 'Effective from',
    intro: 'English intro paragraph.',
    sections: [{ heading: 'Section 1', blocks: [{ type: 'p', text: 'First paragraph.' }] }],
  },
};

describe('LegalDocument', () => {
  it('renders the default (ru) language with title, effective date and sections', () => {
    render(<LegalDocument content={content} effectiveDate="2026-07-18" />);

    expect(screen.getByText('Политика обработки персональных данных')).toBeInTheDocument();
    expect(screen.getByText('Действует с: 2026-07-18')).toBeInTheDocument();
    expect(screen.getByText('Раздел 1')).toBeInTheDocument();
    expect(screen.getByText('пункт один')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Соглашение' })).toHaveAttribute('href', '/terms');
  });

  it('switches to English when the EN button is pressed', async () => {
    const user = userEvent.setup();
    render(<LegalDocument content={content} effectiveDate="2026-07-18" />);

    await user.click(screen.getByRole('button', { name: 'EN' }));

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Effective from: 2026-07-18')).toBeInTheDocument();
    expect(screen.getByText('English intro paragraph.')).toBeInTheDocument();
  });

  it('steps back through history when the Back button is clicked and there is history', async () => {
    mockCanGoBack = true;
    const user = userEvent.setup();
    render(<LegalDocument content={content} effectiveDate="2026-07-18" />);

    await user.click(screen.getByRole('button', { name: /Назад/ }));

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('falls back to backTo (default /login) when there is no history to step back to', async () => {
    mockCanGoBack = false;
    const user = userEvent.setup();
    render(<LegalDocument content={content} effectiveDate="2026-07-18" />);

    await user.click(screen.getByRole('button', { name: /Назад/ }));

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('honours a custom backTo for the fallback', async () => {
    mockCanGoBack = false;
    const user = userEvent.setup();
    render(<LegalDocument content={content} effectiveDate="2026-07-18" backTo="/register" />);

    await user.click(screen.getByRole('button', { name: /Назад/ }));

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/register' });
  });
});
