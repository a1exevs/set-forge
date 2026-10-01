import { Linter } from 'eslint';

import { FsdLayer, fsdLayers, sharedSegments, SlicedLayer, slicedLayers, slicesOf } from '../fsd';

type Pattern = { group: string[]; message: string } | { regex: string; message: string };

/** Layers reachable through an `@layer/...` alias (`app` is the top: nobody imports it, its entry point is `app/entrypoint`). */
const aliasedLayers = fsdLayers.filter(layer => layer !== 'app');

/** FSD: relative paths inside a slice, aliases across slices. `src/...` paths are neither. */
const srcPathImports: Pattern = {
  group: ['src', 'src/*'],
  message: 'Use a relative path inside the slice (`./home-page`) or an alias across slices (`@entities/session`).',
};

/** `.`, `..`, `../..` — a file importing its own slice (or segment) index is a cycle. */
const ownIndexImports: Pattern = {
  regex: String.raw`^\.{1,2}(\/\.\.)*\/?$`,
  message: 'Import the file you need (`../model/workout-list`), not your own slice/segment index — that is a cycle.',
};

/** Bare layer aliases (`@entities`, `@shared`): FSD has no layer public API. */
const layerImports: Pattern = {
  regex: String.raw`^@(app|pages|widgets|features|entities|shared)$`,
  message: 'Layers have no public API — import a slice (`@entities/session`) or a shared segment (`@shared/ui`).',
};

/**
 * Sidestepping a public API: deeper than `@layer/slice` or `@shared/segment`.
 * `@entities/<slice>/@x/<consumer>` is the one sanctioned deep path — allowed only for `<consumer>` itself.
 */
function publicApiSidestep(ownEntity?: string): Pattern {
  // Regex, not a group: gitignore-style negation cannot re-include a path under an excluded parent.
  const allowedX = ownEntity ? `(?!@x/${ownEntity}$)` : '';
  return {
    regex: `^@(${slicedLayers.join('|')}|shared)/[^/]+/${allowedX}`,
    message:
      'Import a slice (or a shared segment) through its public API: `@entities/session`, `@shared/ui`. ' +
      'Entities cross-import through `@entities/<slice>/@x/<your-slice>`.',
  };
}

/** Third-party UI primitives are wrapped in `shared/ui`, toasts go through `shared/lib`. */
const uiKitImports: Pattern = {
  group: ['@headlessui/*', 'sonner'],
  message: 'Headless UI and sonner are wrapped in `src/shared` — import the wrapper from `@shared/ui` / `@shared/lib`.',
};

/** Server state lives in the `model` / `api` segments, components get it through entity hooks. */
const queryClientImports: Pattern = {
  group: ['@tanstack/react-query'],
  message: 'React Query belongs to `model` / `api` segments — expose a hook from the entity model instead.',
};

function upperLayerImports(layer: FsdLayer): Pattern | null {
  const upper = aliasedLayers.slice(0, aliasedLayers.indexOf(layer as (typeof aliasedLayers)[number]));
  if (layer === 'app' || upper.length === 0) {
    return null;
  }
  return {
    group: upper.map(name => `@${name}/*`),
    message:
      layer === 'shared'
        ? 'FSD: `shared` is the bottom layer — it imports no other layer (and knows nothing about the domain).'
        : `FSD: \`${layer}\` may import only layers below it.`,
  };
}

function sameLayerImports(layer: SlicedLayer, ownEntity?: string): Pattern {
  // Regex, not a group: gitignore-style negation cannot re-include a path under an excluded parent.
  const allowedX = ownEntity ? `(?![^/]+/@x/${ownEntity}$)` : '';
  return {
    regex: `^@${layer}/${allowedX}`,
    message:
      layer === 'entities'
        ? 'FSD: entities must not import each other — use the `@x` API (`@entities/<slice>/@x/<your-slice>`); ' +
          'inside a slice use relative paths.'
        : `FSD: slices of \`${layer}\` must not import each other; inside a slice use relative paths.`,
  };
}

function rule(patterns: (Pattern | null)[]): Linter.RulesRecord {
  return { 'no-restricted-imports': ['error', { patterns: patterns.filter(Boolean) }] };
}

const base = (ownEntity?: string): Pattern[] => [
  srcPathImports,
  ownIndexImports,
  layerImports,
  publicApiSidestep(ownEntity),
];

/**
 * `no-restricted-imports` blocks for every FSD location, one block per layer (per slice for `entities`, per segment
 * for `shared`):
 * - `src/...` paths, bare layer aliases, own-index imports and public-API sidesteps are always banned
 *   (relative paths leaving a slice are Steiger's job);
 * - upper layers are banned, so are sibling slices through the alias — except the `@x` API between entities;
 * - `@shared/<segment>` is banned inside that very segment (relative paths there);
 * - Headless UI / sonner only inside `shared`, React Query outside `ui` segments.
 */
export function fsdImportsConfigs(): Linter.Config[] {
  const configs: Linter.Config[] = [];

  configs.push({
    files: ['src/app/**/*.{ts,tsx}'],
    rules: rule([...base(), uiKitImports]),
  });

  for (const layer of slicedLayers) {
    const common = [upperLayerImports(layer), uiKitImports];
    if (layer === 'entities') {
      for (const slice of slicesOf(layer)) {
        configs.push({
          files: [`src/entities/${slice}/**/*.{ts,tsx}`],
          rules: rule([...base(slice), ...common, sameLayerImports(layer, slice)]),
        });
      }
    } else {
      configs.push({
        files: [`src/${layer}/**/*.{ts,tsx}`],
        rules: rule([...base(), ...common, sameLayerImports(layer)]),
      });
    }
  }

  const segments = sharedSegments();
  for (const segment of segments) {
    const others = segments.filter(other => other !== segment);
    configs.push({
      files: [`src/shared/${segment}/**/*.{ts,tsx}`],
      rules: rule([
        ...base(),
        upperLayerImports('shared'),
        {
          group: [`@shared/${segment}`],
          message: `Inside \`shared/${segment}\` import files by relative path — its index is for other segments.`,
        },
        // `../lib/toast` from shared/ui sidesteps the lib public API; Steiger does not check sliceless layers.
        {
          regex: String.raw`^(\.\./)+(${others.join('|')})(/|$)`,
          message: 'Another shared segment is reached through its public API (`@shared/lib`), not a relative path.',
        },
        segment === 'ui' ? queryClientImports : null,
      ]),
    });
  }

  // Components receive server state through entity hooks. Declared last: flat config replaces the whole
  // rule options, so the ui block repeats the location's patterns and adds React Query on top.
  for (const layer of slicedLayers) {
    const slices = layer === 'entities' ? slicesOf(layer) : [undefined];
    for (const slice of slices) {
      configs.push({
        files: [`src/${layer}/${slice ?? '*'}/ui/**/*.{ts,tsx}`],
        ignores: ['src/**/specs/**', 'src/**/*.stories.tsx'],
        rules: rule([
          ...base(slice),
          upperLayerImports(layer),
          uiKitImports,
          sameLayerImports(layer, slice),
          queryClientImports,
        ]),
      });
    }
  }

  return configs;
}
