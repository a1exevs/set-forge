import { MenuButton as HeadlessMenuButton, Menu, MenuItem, MenuItems } from '@headlessui/react';
import { FC } from 'react';

import classes from 'src/shared/ui/menu-button/menu-button.module.scss';
import type { MenuItem as MenuItemType } from 'src/shared/ui/menu-button/menu-button.types';

type Props = {
  items: MenuItemType[];
  ariaLabel?: string;
};

const MenuButton: FC<Props> = ({ items, ariaLabel }) => {
  return (
    <Menu>
      <HeadlessMenuButton className={classes.trigger} aria-label={ariaLabel ?? 'Open menu'}>
        <span className={classes.icon} aria-hidden>
          ⋮
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

export default MenuButton;
