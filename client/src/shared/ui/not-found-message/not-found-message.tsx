import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import classes from './not-found-message.module.scss';
import Button from '../button/button';

type Props = {
  title: string;
  backToLink?: string;
  backToLabel?: string;
};

const NotFoundMessage: FC<Props> = ({ title, backToLink = '/', backToLabel }) => {
  return (
    <div className={classes.container}>
      <h2 className={classes.title}>{title}</h2>
      <Link to={backToLink} className={classes.link}>
        <Button>{backToLabel ?? 'Back to Home'}</Button>
      </Link>
    </div>
  );
};

export default NotFoundMessage;
