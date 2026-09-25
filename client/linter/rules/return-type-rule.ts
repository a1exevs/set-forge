import { Linter } from 'eslint';

/**
 * typescript-guidelines: named functions, hooks and exported arrow functions declare their return type.
 * Callbacks passed inline get their types from the call site (`allowExpressions`, `allowTypedFunctionExpressions`);
 * inline JSX callbacks are covered by {@link jsxCallbackSelectors} (component-typing).
 */
const returnTypeRule: Linter.RulesRecord = {
  '@typescript-eslint/explicit-function-return-type': [
    'error',
    {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
      allowDirectConstAssertionInArrowFunctions: true,
      allowIIFEs: true,
    },
  ],
};

const inlineFunction = ':matches(ArrowFunctionExpression, FunctionExpression)';

/**
 * component-typing: inline JSX callbacks declare parameter and return types
 * (`onChange={(e: ChangeEvent<HTMLInputElement>): void => …}`); list render callbacks type their parameter
 * (`items.map((item: Item) => …)`). Shared by every `no-restricted-syntax` config — flat config replaces the rule
 * options per block, so the ui blocks include these selectors too.
 */
export const jsxCallbackSelectors = [
  {
    selector: `JSXAttribute > JSXExpressionContainer > ${inlineFunction}:not([returnType])`,
    message: 'Inline JSX callbacks declare their return type: `onClick={(): void => …}` (component-typing).',
  },
  {
    selector: `JSXAttribute > JSXExpressionContainer > ${inlineFunction}[params.length>0]:not([params.0.typeAnnotation])`,
    message: 'Inline JSX callbacks type their parameters: `(e: ChangeEvent<HTMLInputElement>): void => …`.',
  },
  {
    selector: `JSXExpressionContainer > CallExpression[callee.property.name=/^(map|flatMap)$/] > ${inlineFunction}[params.length>0]:not([params.0.typeAnnotation])`,
    message: 'List render callbacks in JSX type their parameter: `items.map((item: Item) => …)` (component-typing).',
  },
];

export default returnTypeRule;

/** component-typing: props are a named type (`type Props = { … }`), not an inline object in `FC<{ … }>`. */
export const namedPropsSelector = {
  selector:
    'VariableDeclarator[id.typeAnnotation.typeAnnotation.typeName.name=/^(FC|FunctionComponent)$/] > Identifier > TSTypeAnnotation > TSTypeReference > TSTypeParameterInstantiation > TSTypeLiteral',
  message: 'Component props are a named type (`type Props = { … }`), not an inline object in `FC<{ … }>`.',
};
