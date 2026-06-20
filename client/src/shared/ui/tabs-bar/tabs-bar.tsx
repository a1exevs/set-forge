import { Link } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import { FC } from 'react';

import classes from 'src/shared/ui/tabs-bar/tabs-bar.module.scss';

export type TabsBarItem = {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  badgeCount?: number;
};

type Props = {
  items: TabsBarItem[];
  activeItemId: string;
  className?: string;
};

const formatBadgeCount = (count: number): string => (count > 99 ? '99+' : String(count));

const TabsBar: FC<Props> = ({ items, activeItemId, className }) => {
  const classNames = [classes.tabsBar, className].filter(Boolean).join(' ');

  return (
    <nav className={classNames} role="tablist" aria-label="Main navigation">
      {items.map(item => {
        const isActive = item.id === activeItemId;
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            to={item.to}
            className={isActive ? `${classes.tab} ${classes.tabActive}` : classes.tab}
            role="tab"
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={classes.iconWrap}>
              <Icon className={classes.icon} size={24} strokeWidth={1.75} aria-hidden />
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className={classes.badge} aria-hidden>
                  {formatBadgeCount(item.badgeCount)}
                </span>
              )}
            </span>
            <span className={classes.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default TabsBar;
