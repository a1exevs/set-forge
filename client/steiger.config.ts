import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // TanStack Router code generation output, not part of the FSD structure.
    ignores: ['./src/app/router/route-tree.gen.ts'],
  },
  {
    // "Pages first" hint: a slice used in one place could live inside its consumer. A warning, not an error:
    // entities are expected to gain consumers as features land.
    rules: {
      'fsd/insignificant-slice': 'warn',
    },
  },
]);
