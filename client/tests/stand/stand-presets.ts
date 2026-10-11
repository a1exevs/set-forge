/**
 * The states a stand starts in. Each preset builds its data through the public API — the same validation and
 * business rules a user goes through — so a preset never holds a state the app could not reach.
 */

/** Test values for a throwaway database: the stand's MySQL lives only as long as the stand. */
export const STAND_USER = { email: 'stand-user@set-forge.test', password: 'stand-password' } as const;

export const STAND_PRESETS = {
  empty: 'no users — for flows that start from registration',
  user: `a registered user ${STAND_USER.email} without data`,
  data: `a registered user ${STAND_USER.email} with two workout lists and one completed session`,
} as const;

export type StandPreset = keyof typeof STAND_PRESETS;

export function isStandPreset(value: string): value is StandPreset {
  return Object.hasOwn(STAND_PRESETS, value);
}

type Envelope<T> = { resultCode: number; data: T | null; messages: string[] };

/** What the API needs from a signed-in user: the Bearer token and the `refreshToken` cookie login has set. */
type Auth = { accessToken: string; cookie: string };

async function call<T>(
  serverOrigin: string,
  method: 'POST' | 'PATCH',
  path: string,
  body?: unknown,
  auth?: Auth,
): Promise<{ data: T; cookie: string }> {
  const response = await fetch(`${serverOrigin}/api/1.0${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth.accessToken}`, Cookie: auth.cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} failed: ${response.status} ${await response.text()}`);
  }
  const envelope = (await response.json()) as Envelope<T>;
  if (envelope.resultCode !== 0 || envelope.data === null) {
    throw new Error(`${method} ${path} failed: ${envelope.messages.join('; ')}`);
  }
  // `refreshToken=<value>; Path=/; HttpOnly; …` → the `refreshToken=<value>` pair a later request sends back.
  const cookie = response.headers.get('set-cookie')?.split(';')[0] ?? '';
  return { data: envelope.data, cookie };
}

async function register(serverOrigin: string): Promise<void> {
  await call(serverOrigin, 'POST', '/auth/registration', { ...STAND_USER, consent: true, termsAccepted: true });
}

async function login(serverOrigin: string): Promise<Auth> {
  const { data, cookie } = await call<{ accessToken: string }>(serverOrigin, 'POST', '/auth/login', STAND_USER);
  return { accessToken: data.accessToken, cookie };
}

type SeededExercise = { id: string; sets: number };
type SeededList = { id: string; exercises: SeededExercise[] };
type SeededSession = { id: string; status: string; exercises: SeededExercise[] };

const PUSH_DAY = {
  name: 'Push Day',
  description: 'Chest, shoulders, triceps',
  exercises: [
    { name: 'Bench Press', muscleGroup: 'chest', weight: 80, reps: 10, sets: 3 },
    { name: 'Overhead Press', muscleGroup: 'shoulders', weight: 40, reps: 8, sets: 3 },
    { name: 'Triceps Pushdown', muscleGroup: 'arms', weight: 25, reps: 12, sets: 2 },
  ],
};

const LEG_DAY = {
  name: 'Leg Day',
  description: '',
  exercises: [
    { name: 'Squat', muscleGroup: 'legs', weight: 100, reps: 5, sets: 5 },
    { name: 'Romanian Deadlift', muscleGroup: 'legs', weight: 80, reps: 8, sets: 3 },
  ],
};

/** Two lists and one completed session of the first: every set logged, which finishes the session by itself. */
async function seedData(serverOrigin: string): Promise<void> {
  const auth = await login(serverOrigin);
  const { data: pushDay } = await call<SeededList>(serverOrigin, 'POST', '/workout-lists', PUSH_DAY, auth);
  await call<SeededList>(serverOrigin, 'POST', '/workout-lists', LEG_DAY, auth);
  const { data: session } = await call<SeededSession>(
    serverOrigin,
    'POST',
    '/workout-sessions',
    { workoutListId: pushDay.id },
    auth,
  );
  for (const exercise of session.exercises) {
    for (let set = 0; set < exercise.sets; set += 1) {
      await call<SeededSession>(
        serverOrigin,
        'PATCH',
        `/workout-sessions/${session.id}/exercises/${exercise.id}/progress`,
        undefined,
        auth,
      );
    }
  }
}

/** Builds the preset's data and returns what to tell the person or agent who uses the stand. */
export async function applyPreset(preset: StandPreset, serverOrigin: string): Promise<string[]> {
  if (preset === 'empty') {
    return [];
  }
  await register(serverOrigin);
  if (preset === 'data') {
    await seedData(serverOrigin);
  }
  return [`log in as ${STAND_USER.email} / ${STAND_USER.password}`];
}
