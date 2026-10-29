import JSDOMEnvironment from 'jest-environment-jsdom';

/**
 * jsdom plus Node's `Response` / `Headers` / `Request`: TanStack Router throws every `redirect()` as a `Response`, so
 * a redirecting route guard needs them. A global jsdom already defines is left alone.
 */
export default class AppJsdomEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);
    const target = this.global as unknown as Record<string, unknown>;
    for (const name of ['Response', 'Headers', 'Request'] as const) {
      if (typeof target[name] === 'undefined') {
        target[name] = globalThis[name];
      }
    }
  }
}
