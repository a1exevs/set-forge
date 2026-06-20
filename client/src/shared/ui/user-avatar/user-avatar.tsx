import { FC } from 'react';

import classes from 'src/shared/ui/user-avatar/user-avatar.module.scss';

type Props = {
  letter: string;
  className?: string;
};

const UserAvatar: FC<Props> = ({ letter, className }) => {
  const classNames = [classes.avatar, className].filter(Boolean).join(' ');

  return (
    <div className={classNames} aria-hidden>
      <span className={classes.letter}>{letter}</span>
    </div>
  );
};

export default UserAvatar;
