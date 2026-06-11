import type { WorkoutList } from '@entities';
import { Link } from '@tanstack/react-router';
import { FC, MouseEvent } from 'react';

import { Button, MenuButton } from '@shared';

import classes from 'src/pages/home/ui/home-page.module.scss';

const IconDownload: FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 3v10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path
      d="M8 9l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

type Props = {
  workoutLists: WorkoutList[];
  storageWarning: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void | Promise<void>;
  onExport: () => void;
  formatDate: (date: string | null) => string;
};

const HomePage: FC<Props> = ({ workoutLists, storageWarning, onEdit, onDelete, onExport, formatDate }) => {
  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <div className={classes.headerTop}>
          <div className={classes.headerTitles}>
            <h1>Set Forge</h1>
            <p className={classes.subtitle}>Track your workout progress</p>
          </div>
          <button
            type="button"
            className={classes.exportButton}
            aria-label="Export workout lists"
            title="Export workout lists"
            disabled={workoutLists.length === 0}
            onClick={onExport}
          >
            <IconDownload />
          </button>
        </div>
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
