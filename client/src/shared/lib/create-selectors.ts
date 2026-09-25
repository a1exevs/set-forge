import { StoreApi, UseBoundStore } from 'zustand';

type WithSelectors<S> = S extends { getState: () => infer T } ? S & { use: { [K in keyof T]: () => T[K] } } : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(store: S) => {
  const storeWithSelectors = store as WithSelectors<typeof store>;
  storeWithSelectors.use = {} as Record<string, unknown>;
  for (const k of Object.keys(storeWithSelectors.getState())) {
    (storeWithSelectors.use as Record<string, () => unknown>)[k] = () =>
      storeWithSelectors(s => s[k as keyof typeof s]);
  }

  return storeWithSelectors;
};
