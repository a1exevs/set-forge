/**
 * The states a stand starts in. Each preset builds its data through the public API — the same validation and
 * business rules a user goes through — so a preset never holds a state the app could not reach.
 */

/** Test values for a throwaway database: the stand's MySQL lives only as long as the stand. */
export const STAND_USER = { email: 'stand-user@set-forge.test', password: 'stand-password' } as const;

export const STAND_PRESETS = {
  empty: 'no users — for flows that start from registration',
  user: `a registered user ${STAND_USER.email} without data`,
} as const;

export type StandPreset = keyof typeof STAND_PRESETS;

export function isStandPreset(value: string): value is StandPreset {
  return Object.hasOwn(STAND_PRESETS, value);
}

async function register(serverOrigin: string): Promise<void> {
  const response = await fetch(`${serverOrigin}/api/1.0/auth/registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...STAND_USER, consent: true, termsAccepted: true }),
  });
  if (!response.ok) {
    throw new Error(`Registering the stand user failed: ${response.status} ${await response.text()}`);
  }
}

/** Builds the preset's data and returns what to tell the person or agent who uses the stand. */
export async function applyPreset(preset: StandPreset, serverOrigin: string): Promise<string[]> {
  if (preset === 'empty') {
    return [];
  }
  await register(serverOrigin);
  return [`log in as ${STAND_USER.email} / ${STAND_USER.password}`];
}
