import type { CSSProperties } from 'react';

type CssVars = Record<`--${string}`, string | number | undefined>;

/**
 * The one way to pass a runtime value to styles: CSS custom properties that the module stylesheet consumes
 * (`width: var(--progress)`). React's `CSSProperties` has no index signature for custom properties, hence the cast.
 */
export const cssVars = (vars: CssVars): CSSProperties => vars as CSSProperties;
