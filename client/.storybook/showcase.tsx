import type { Decorator } from '@storybook/react';
import type { FC, PropsWithChildren, ReactElement } from 'react';

import { cssVars } from '@shared/lib';

import classes from './showcase.module.scss';

/** The canvas of a story: app background, padding, text colour. Applied to every `shared` meta as a decorator. */
export const Frame: FC<PropsWithChildren> = ({ children }) => <div className={classes.frame}>{children}</div>;

export const withFrame: Decorator = (Story): ReactElement => (
  <Frame>
    <Story />
  </Frame>
);

/** A wrapping flex row: one axis of a component (variants, sizes, tones) side by side. */
export const Row: FC<PropsWithChildren> = ({ children }) => <div className={classes.row}>{children}</div>;

type GridProps = PropsWithChildren<{ columns: number }>;

/** A matrix of two axes (variant × size): `columns` is the length of the inner axis. */
export const Grid: FC<GridProps> = ({ columns, children }) => (
  <div className={classes.grid} style={cssVars({ '--columns': columns })}>
    {children}
  </div>
);

/** A column of fields or blocks at a form width. */
export const Stack: FC<PropsWithChildren> = ({ children }) => <div className={classes.stack}>{children}</div>;

/** The content card of a dialog story: what `ConfirmDialog` draws for real. */
export const Panel: FC<PropsWithChildren> = ({ children }) => <div className={classes.panel}>{children}</div>;

/** A short line under a showcase block: what the reader is looking at. */
export const Caption: FC<PropsWithChildren> = ({ children }) => <p className={classes.caption}>{children}</p>;
