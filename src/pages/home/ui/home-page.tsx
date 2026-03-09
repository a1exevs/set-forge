import type { WorkoutList } from '@entities';
import { Link } from '@tanstack/react-router';
import { FC, MouseEvent } from 'react';

import { Button, MenuButton } from '@shared';

import classes from 'src/pages/home/ui/home-page.module.scss';

type Props = {
  workoutLists: WorkoutList[];
  storageWarning: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void | Promise<void>;
  formatDate: (date: string | null) => string;
};

const HomePage: FC<Props> = ({ workoutLists, storageWarning, onEdit, onDelete, formatDate }) => {
  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>Set Forge</h1>
        <p className={classes.subtitle}>Track your workout progress</p>
      </header>

      {storageWarning && (
        <div className={classes.warning}>
          <span className={classes.warningIcon}>⚠️</span>
          <p>Storage is over 80% full. Consider deleting old workout lists.</p>
        </div>
      )}

      <main className={classes.main}>
        <Link to="/create" className={classes.addButton}>
          <Button size="lg">
            <span className={classes.addIcon}>+</span>
            Create Workout List
          </Button>
        </Link>

        {workoutLists.length === 0 ? (
          <div className={classes.empty}>
            <p>No workout lists yet</p>
            <p className={classes.emptyHint}>Create your first list to start tracking progress</p>
          </div>
        ) : (
          <div className={classes.listGrid}>
            {workoutLists.map((list: WorkoutList) => (
              <div key={list.id} className={classes.card}>
                <Link to="/workout/$id" params={{ id: list.id }} className={classes.cardLink}>
                  <div className={classes.cardHeader}>
                    <h2>{list.name}</h2>
                    <span className={classes.badge}>{list.exercises.length} ex.</span>
                    <div
                      className={classes.menuButton}
                      onClick={(e: MouseEvent<HTMLDivElement>): void => e.stopPropagation()}
                    >
                      <MenuButton
                        ariaLabel="Workout list actions"
                        items={[
                          { id: 'edit', label: 'Edit', onClick: (): void => onEdit(list.id) },
                          {
                            id: 'delete',
                            label: 'Delete',
                            onClick: (): void => {
                              onDelete(list.id, list.name);
                            },
                          },
                        ]}
                      />
                    </div>
                  </div>
                  {list.description && <p className={classes.description}>{list.description}</p>}
                  <div className={classes.cardFooter}>
                    <span className={classes.date}>Created: {formatDate(list.createdAt)}</span>
                    {list.lastUsedAt && (
                      <span className={classes.lastUsed}>Last used: {formatDate(list.lastUsedAt)}</span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
