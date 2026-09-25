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

/**
 * A `ui` segment holds components only; everything else has an FSD home:
 * constants → `config/`, types and logic (hooks included) → `model/`, helpers → `lib/`.
 * React specifics: a component's own `type Props` stays next to it.
 * In sliced layers that is the only type allowed; `shared/ui` may also export the types of its public contract
 * (`MenuItem`, `LegalContent`) — shared has no model to put them in.
 */
export const slicedUiRule: Linter.RulesRecord = {
  'no-restricted-syntax': [
    'error',
    ...jsxCallbackSelectors,
    namedPropsSelector,
    noConstants,
    noFunctions,
    noInterfacesOrEnums,
    {
      selector: declarations('TSTypeAliasDeclaration[id.name!=/Props$/]'),
      message:
        'Only props types (`type Props`, `type EditProps`) in a ui file — other types go to the model/ segment next to the logic using them.',
    },
  ],
};

export const sharedUiRule: Linter.RulesRecord = {
  'no-restricted-syntax': [
    'error',
    ...jsxCallbackSelectors,
    namedPropsSelector,
    noConstants,
    noFunctions,
    noInterfacesOrEnums,
  ],
};
