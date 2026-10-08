import JSDOMEnvironment from 'jest-environment-jsdom';

/**
 * jsdom plus the Fetch API classes of Node. jsdom has no `Response` / `Headers` / `Request`, but TanStack Router
 * builds every `redirect()` as a `Response` and checks thrown values with `instanceof Response`, so a route guard
 * that redirects (`app/routes/__root.tsx`) cannot be tested on plain jsdom. The classes are copied from the Node
 * realm the environment is constructed in; a global jsdom already defines is left alone.
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
