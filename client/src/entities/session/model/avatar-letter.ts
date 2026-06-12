/**
 * First letter of the email local-part for avatar display (uppercase). Empty local-part → "?".
 */
export function emailToAvatarLetter(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  const local = at === -1 ? trimmed : trimmed.slice(0, at);
  const first = local.charAt(0);
  if (!first) {
    return '?';
  }
  return first.toLocaleUpperCase();
}
