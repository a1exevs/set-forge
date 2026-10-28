/**
 * The states a stand starts in. Each preset builds its data through the public API — the same validation and
 * business rules a user goes through — so a preset never holds a state the app could not reach.
 */

/** Test values for a throwaway database: the stand's MySQL lives only as long as the stand. */
export const STAND_USER = { email: 'stand-user@set-forge.test', password: 'stand-password' } as const;

/** History loads 20 sessions a page: 1 + 24 completed sessions make the second page. */
const EXTRA_HISTORY_SESSIONS = 24;

export const STAND_PRESETS = {
  empty: 'no users — for flows that start from registration',
  user: `a registered user ${STAND_USER.email} without data`,
  data: `a registered user ${STAND_USER.email} with two workout lists and one completed session`,
  history: `the data of "data" plus a one-set list finished ${EXTRA_HISTORY_SESSIONS} times — history has a second page`,
  reconsent: `the user of "user", who accepted the documents of version 1, and a server that now requires version 2 — the re-consent gate after login`,
} as const;

export type StandPreset = keyof typeof STAND_PRESETS;

export function isStandPreset(value: string): value is StandPreset {
  return Object.hasOwn(STAND_PRESETS, value);
}

/**
 * The server configuration a preset moves to once its data is in: a document update is a raised required version, and
 * a user who accepted the old one can be made only before it.
 */
export function presetServerEnv(preset: StandPreset): Record<string, string> | null {
  return preset === 'reconsent' ? { TERMS_VERSION: '2', PRIVACY_VERSION: '2' } : null;
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

const PLANK = {
  name: 'Plank',
  description: 'One set, for a long history',
  exercises: [{ name: 'Plank', muscleGroup: 'core', weight: 0, reps: 1, sets: 1 }],
};

/** Starts a session of the list and logs every set, which finishes the session by itself. */
async function completeSession(serverOrigin: string, workoutListId: string, auth: Auth): Promise<void> {
  const { data: session } = await call<SeededSession>(
    serverOrigin,
    'POST',
    '/workout-sessions',
    { workoutListId },
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

/** Two lists and one completed session of the first. */
async function seedData(serverOrigin: string, auth: Auth): Promise<void> {
  const { data: pushDay } = await call<SeededList>(serverOrigin, 'POST', '/workout-lists', PUSH_DAY, auth);
  await call<SeededList>(serverOrigin, 'POST', '/workout-lists', LEG_DAY, auth);
  await completeSession(serverOrigin, pushDay.id, auth);
}

async function seedHistory(serverOrigin: string, auth: Auth): Promise<void> {
  const { data: plank } = await call<SeededList>(serverOrigin, 'POST', '/workout-lists', PLANK, auth);
  for (let index = 0; index < EXTRA_HISTORY_SESSIONS; index += 1) {
    await completeSession(serverOrigin, plank.id, auth);
  }
}

/** Builds the preset's data and returns what to tell the person or agent who uses the stand. */
export async function applyPreset(preset: StandPreset, serverOrigin: string): Promise<string[]> {
  if (preset === 'empty') {
    return [];
  }
  await register(serverOrigin);
  if (preset === 'data' || preset === 'history') {
    const auth = await login(serverOrigin);
    await seedData(serverOrigin, auth);
    if (preset === 'history') {
      await seedHistory(serverOrigin, auth);
    }
  }
  const notes = [`log in as ${STAND_USER.email} / ${STAND_USER.password}`];
  if (preset === 'reconsent') {
    notes.push('the documents are at version 2: the re-consent gate opens after login');
  }
  return notes;
}
