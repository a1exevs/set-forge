import { Linter } from 'eslint';

import { jsxCallbackSelectors, namedPropsSelector } from './return-type-rule';

/** A top-level `const` that is not a component (`const X: FC<Props> = ...`). */
const nonComponentConst =
  'VariableDeclarator:not([id.typeAnnotation.typeAnnotation.typeName.name=/^(FC|FunctionComponent)$/])';

const constSelector = `Program > VariableDeclaration > ${nonComponentConst}, Program > ExportNamedDeclaration > VariableDeclaration > ${nonComponentConst}`;

const functionSelector = 'Program > FunctionDeclaration, Program > ExportNamedDeclaration > FunctionDeclaration';

const declarations = (selector: string): string =>
  `Program > ${selector}, Program > ExportNamedDeclaration > ${selector}`;

const noConstants = {
  selector: constSelector,
  message:
    'No constants in a ui file — move them to the config/ segment of the slice (`@shared/config` in shared). ' +
    'Components are `const X: FC<Props>`.',
};

const noFunctions = {
  selector: `${functionSelector}, Program > ExportDefaultDeclaration > :matches(FunctionDeclaration, ArrowFunctionExpression, FunctionExpression)`,
  message: 'No functions in a ui file — logic and hooks go to model/ (with a test), generic helpers to lib/.',
};

const noInterfacesOrEnums = {
  selector: declarations(':matches(TSInterfaceDeclaration, TSEnumDeclaration)'),
  message: 'No interfaces/enums in a ui file — props are `type Props`, domain types live in model/.',
};

/** styling-guidelines: runtime values reach styles only as CSS custom properties through `cssVars()`. */
const noInlineStyles = {
  selector:
    "JSXAttribute[name.name='style'] > JSXExpressionContainer > :not(CallExpression[callee.name='cssVars']), JSXAttribute[name.name='style'] > Literal",
  message:
    'No inline styles — put them in the module stylesheet; pass a runtime value as a CSS variable: ' +
    "`style={cssVars({ '--progress': `${n}%` })}` + `width: var(--progress)`.",
};

/**
 * component-architecture: presentation components take props only — no hooks. State, router and store hooks live
 * in `*-logic-layer.tsx` / `*-data-layer.tsx` (and context providers, `*-provider.tsx`).
 */
const noHooksInPresentation = {
  selector:
    "CallExpression[callee.name=/^use[A-Z]/], CallExpression[callee.property.name=/^use[A-Z]/], CallExpression[callee.object.property.name='use']",
  message:
    'Presentation components take props only — move hooks to the logic layer (`*-logic-layer.tsx`) or, for ' +
    'queries and stores, to the data layer (`*-data-layer.tsx`).',
};

/** component-architecture: logic layers hold state and handlers; stores and query hooks belong to the data layer. */
const noStoresOrQueriesInLogic = {
  selector: String.raw`CallExpression[callee.name=/^use\w*(Query|Mutation|Store)$/], CallExpression[callee.object.property.name='use']`,
  message:
    'Logic layers get server state and stores through props — call query/mutation hooks and stores in the data layer.',
};

export type UiFileKind = 'presentation' | 'logic' | 'data';

/** Files of a ui segment by role; everything else in a ui segment is presentation. */
export const uiLayerFiles: Record<Exclude<UiFileKind, 'presentation'>, string[]> = {
  logic: ['**/*-logic-layer.tsx'],
  // Context providers own state like a data layer.
  data: ['**/*-data-layer.tsx', '**/*-provider.tsx'],
};

/**
 * A `ui` segment holds components only; everything else has an FSD home:
 * constants → `config/`, types and logic (hooks included) → `model/`, helpers → `lib/`.
 * React specifics: a component's own `type Props` stays next to it.
 * In sliced layers that is the only type allowed; `shared/ui` may also export the types of its public contract
 * (`MenuItem`, `LegalContent`) — shared has no model to put them in.
 */
const onlyPropsTypes = {
  selector: declarations('TSTypeAliasDeclaration[id.name!=/Props$/]'),
  message:
    'Only props types (`type Props`, `type EditProps`) in a ui file — other types go to the model/ segment next to the logic using them.',
};

/**
 * `no-restricted-syntax` for a ui file. Flat config replaces the rule options per block, so every combination
 * (sliced / shared, presentation / layer file) gets the full list.
 */
export function uiRule({ shared, kind }: { shared: boolean; kind: UiFileKind }): Linter.RulesRecord {
  return {
    'no-restricted-syntax': [
      'error',
      ...jsxCallbackSelectors,
      namedPropsSelector,
      noConstants,
      noFunctions,
      noInterfacesOrEnums,
      noInlineStyles,
      ...(shared ? [] : [onlyPropsTypes]),
      ...(kind === 'presentation' ? [noHooksInPresentation] : []),
      ...(kind === 'logic' ? [noStoresOrQueriesInLogic] : []),
    ],
  };
}
