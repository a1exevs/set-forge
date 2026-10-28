import { detectLanguage } from '../detect-language';

describe('detectLanguage', () => {
  it('gives Russian for a Russian first browser language, with or without a region', () => {
    expect(detectLanguage(['ru-RU', 'en-US'])).toBe('ru');
    expect(detectLanguage(['ru'])).toBe('ru');
    expect(detectLanguage(['RU-ru'])).toBe('ru');
  });

  it('gives English for any other first language, even when Russian follows', () => {
    expect(detectLanguage(['en-GB'])).toBe('en');
    expect(detectLanguage(['de-DE', 'ru-RU'])).toBe('en');
    expect(detectLanguage(['uk-UA'])).toBe('en');
  });

  it('gives English when the browser names no language', () => {
    expect(detectLanguage([])).toBe('en');
  });
});
