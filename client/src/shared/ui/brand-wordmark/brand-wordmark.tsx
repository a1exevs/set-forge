import { FC } from 'react';

import classes from 'src/shared/ui/brand-wordmark/brand-wordmark.module.scss';

type Props = {
  title?: string;
  leadingTitle?: string;
  className?: string;
  titleAs?: 'span' | 'h1';
};

const BrandWordmark: FC<Props> = ({ title, leadingTitle, className, titleAs: TitleTag = 'span' }) => {
  const classNames = [classes.wordmark, className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      {leadingTitle && <span className={classes.leadingTitle}>{leadingTitle}</span>}
      <img src="/favicon.svg" alt="" className={classes.icon} width={512} height={512} aria-hidden />
      {title && <TitleTag className={classes.title}>{title}</TitleTag>}
    </div>
  );
};

export default BrandWordmark;
