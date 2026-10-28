import { Linter } from 'eslint';

import { slicedLayers, slicesOf } from '../fsd';

/**
 * fsd-architecture §4: the segments each segment must not import, not even their types. `model` is missing for
 * api / lib / config on purpose: they may `import type` from it ({@link modelTypeOnlyRule}), just not its code.
 */
const forbiddenBySegment: Record<string, string[]> = {
  model: ['ui'],
  api: ['ui'],
  lib: ['ui', 'api'],
  config: ['ui', 'api', 'lib'],
};

/** Every place the direction applies to: each slice of a sliced layer, plus `shared`. */
const segmentOwners = (): string[] => [
  ...slicedLayers.flatMap(layer => slicesOf(layer).map(slice => `${layer}/${slice}`)),
  'shared',
];

/**
 * `import/no-restricted-paths` zones generated from the real folders, so every new slice is covered.
 * Resolves paths, so relative and alias imports (`@shared/lib` inside `shared/ui`) are both checked.
 * The direction applies within one slice (or within `shared`) only — cross-layer imports are not affected.
 */
export function segmentDirectionRule(): Linter.RulesRecord {
  const zones = segmentOwners().flatMap(owner =>
    Object.entries(forbiddenBySegment).flatMap(([segment, forbidden]) =>
      forbidden.map(from => ({
        target: `./src/${owner}/${segment}/**/*`,
        from: `./src/${owner}/${from}/**/*`,
        message: `FSD segments: \`${segment}\` must not import \`${from}\` (direction ui → model → api → lib, config).`,
      })),
    ),
  );
  return { 'import/no-restricted-paths': ['error', { zones }] };
}

/** Segments below `model` that may use its domain types. */
export const modelTypeReaders = ['api', 'lib', 'config'] as const;

const modelTypeOnly = (regex: string): Linter.RulesRecord => ({
  '@typescript-eslint/no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          regex,
          allowTypeImports: true,
          message:
            'FSD segments: only `import type` from model here — model uses this segment, not the other way round.',
        },
      ],
    },
  ],
});

/**
 * `api`, `lib` and `config` may `import type` from their own `model` (a request returning `WorkoutList`, a typed
 * formatter) but never import its code — type imports are erased, so at runtime the direction stays one-way.
 * In a slice the own model is the relative `../model/...` (other slices go through their public API).
 */
export const sliceModelTypeOnlyRule: Linter.RulesRecord = modelTypeOnly(String.raw`^(\.\./)+model(/|$)`);

/** In `shared` the own model is reached through its public API, `@shared/model`. */
export const sharedModelTypeOnlyRule: Linter.RulesRecord = modelTypeOnly(
  String.raw`^(@shared/model|(\.\./)+model)(/|$)`,
);
