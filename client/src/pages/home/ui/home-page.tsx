import type { WorkoutList } from '@entities';
import { Link } from '@tanstack/react-router';
import { ChangeEvent, FC, MouseEvent, RefObject } from 'react';

import { IconButton, MenuButton } from '@shared';

import classes from 'src/pages/home/ui/home-page.module.scss';

// TODO: Replace inline SVG icons with a shared icon library (e.g. lucide-react, @heroicons/react, react-icons).
const IconDownload: FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 3v10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M8 9l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const IconUpload: FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 21V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M8 15l4-4 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 7h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const IconPlus: FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

type Props = {
  workoutLists: WorkoutList[];
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void | Promise<void>;
  onExport: () => void | Promise<void>;
  onImportClick: () => void;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  importInputRef: RefObject<HTMLInputElement>;
  formatDate: (date: string | null) => string;
};

const HomePage: FC<Props> = ({
  workoutLists,
  onEdit,
  onDelete,
  onExport,
  onImportClick,
  onImportFile,
  importInputRef,
  formatDate,
}) => {
  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <div className={classes.headerTop}>
          <img src="/logo.svg" alt="Set Forge" className={classes.logo} width={1909} height={420} />
          <div className={classes.headerActions}>
            <IconButton
              aria-label="Export workout lists"
              title="Export workout lists"
              disabled={workoutLists.length === 0}
              onClick={(): void => void onExport()}
            >
              <IconDownload />
            </IconButton>
            <IconButton aria-label="Import workout lists" title="Import workout lists" onClick={onImportClick}>
              <IconUpload />
            </IconButton>
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className={classes.hiddenFileInput}
              onChange={(event): void => void onImportFile(event)}
            />
          </div>
        </div>
      </header>

      <main className={classes.main}>
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

      <IconButton
        as={Link}
        to="/create"
        className={classes.createFab}
        variant="primary"
        size="lg"
        aria-label="Create workout list"
        title="Create workout list"
      >
        <IconPlus />
      </IconButton>
    </div>
  );
};

export default HomePage;
