import type { ErrorParams } from '@common/constants/error-messages';

/** Fills the named `{param}` placeholders of a template; a placeholder without its param stays as it is. */
export function formatMessage(template: string, params: ErrorParams = {}): string {
  return template.replace(/{(\w+)}/g, (placeholder: string, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}
