import type { WorkoutList } from '@entities';
import { Link } from '@tanstack/react-router';
import { FC, MouseEvent } from 'react';

import { Button } from '@shared';
import classes from 'src/pages/home/ui/home-page.module.scss';

type Props = {
  workoutLists: WorkoutList[];
  storageWarning: boolean;
  onDelete: (id: string, name: string) => void;
  formatDate: (date: string | null) => string;
};

const HomePage: FC<Props> = ({ workoutLists, storageWarning, onDelete, formatDate }) => {
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
                  </div>
                  {list.description && <p className={classes.description}>{list.description}</p>}
                  <div className={classes.cardFooter}>
                    <span className={classes.date}>Created: {formatDate(list.createdAt)}</span>
                    {list.lastUsedAt && (
                      <span className={classes.lastUsed}>Last used: {formatDate(list.lastUsedAt)}</span>
                    )}
                  </div>
                </Link>
                <button
                  className={classes.deleteButton}
                  onClick={(e: MouseEvent<HTMLButtonElement>): void => {
                    e.preventDefault();
                    onDelete(list.id, list.name);
                  }}
                  aria-label="Delete list"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
