import { existsSync, readdirSync } from 'fs';
import path from 'path';

import { rootDir } from './common';

/** FSD layers, top to bottom. A layer may import only layers below it. */
export const fsdLayers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] as const;

export type FsdLayer = (typeof fsdLayers)[number];

/** Layers split into slices; `app` and `shared` are split straight into segments. */
export const slicedLayers = ['pages', 'widgets', 'features', 'entities'] as const;

export type SlicedLayer = (typeof slicedLayers)[number];

const srcDir = path.join(rootDir, 'src');

const directories = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
    : [];

/** Slices of a layer, read from disk so every new slice is covered without touching the config. */
export const slicesOf = (layer: SlicedLayer): string[] => directories(path.join(srcDir, layer));

/** Segments of `shared`, read from disk. */
export const sharedSegments = (): string[] => directories(path.join(srcDir, 'shared'));
