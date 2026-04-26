import { Link } from '@tanstack/react-router';
import { FC } from 'react';

import { Button } from '@shared';

import classes from 'src/widgets/not-found-message/ui/not-found-message.module.scss';

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
