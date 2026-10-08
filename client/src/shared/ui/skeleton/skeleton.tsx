import { FC } from 'react';

import { cssVars } from '@shared/lib';

import classes from './skeleton.module.scss';

type Props = {
  /** `text` is a line of text, `rect` a block (a field, a button, a bar), `circle` an avatar or an icon. */
  variant?: 'text' | 'rect' | 'circle';
  /** Any CSS length; defaults to the full width (`text`, `rect`) or `1.5rem` (`circle`). */
  width?: string;
  /**
   * Any CSS length — give a text bone the line box of the text it stands in for (font size × line height), so the
   * content takes its place without moving. Defaults to `1.5rem` (`text`, `circle`) or `2.5rem` (`rect`).
   */
  height?: string;
  className?: string;
};

/** A placeholder bone with a calm pulse: hidden from assistive technology, so the page names its loading once. */
const Skeleton: FC<Props> = ({ variant = 'text', width = undefined, height = undefined, className = undefined }) => {
  const classNames: string = [classes.skeleton, classes[variant], className].filter(Boolean).join(' ');

  return (
    <span
      aria-hidden
      className={classNames}
      style={cssVars({ '--skeleton-width': width, '--skeleton-height': height })}
    />
  );
};

export default Skeleton;
