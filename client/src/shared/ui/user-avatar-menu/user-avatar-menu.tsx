import { MenuButton as HeadlessMenuButton, Menu, MenuItem, MenuItems } from '@headlessui/react';
import { FC } from 'react';

import type { MenuItem as MenuItemType } from 'src/shared/ui/menu-button/menu-button.types';
import classes from 'src/shared/ui/user-avatar-menu/user-avatar-menu.module.scss';

type Props = {
  letter: string;
  items: MenuItemType[];
  ariaLabel?: string;
};

const UserAvatarMenu: FC<Props> = ({ letter, items, ariaLabel }) => {
  return (
    <Menu>
      <HeadlessMenuButton className={classes.trigger} aria-label={ariaLabel ?? 'Account menu'} type="button">
        <span className={classes.letter} aria-hidden>
          {letter}
        </span>
      </HeadlessMenuButton>
      <MenuItems anchor="bottom start" className={classes.items}>
        {items.map(item => (
          <MenuItem key={item.id}>
            {({ close }): JSX.Element => (
              <button
                type="button"
                className={classes.item}
                onClick={(): void => {
                  item.onClick();
                  close();
                }}
              >
                {item.label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
};

export default UserAvatarMenu;
