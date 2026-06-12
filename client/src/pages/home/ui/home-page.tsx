import type { WorkoutList } from '@entities';
import { Link } from '@tanstack/react-router';
import { ChangeEvent, FC, MouseEvent, RefObject } from 'react';

import { Button, MenuButton, UserAvatarMenu } from '@shared';

import classes from 'src/pages/home/ui/home-page.module.scss';

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

type Props = {
  workoutLists: WorkoutList[];
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void | Promise<void>;
  onExport: () => void | Promise<void>;
  onImportClick: () => void;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  importInputRef: RefObject<HTMLInputElement>;
  formatDate: (date: string | null) => string;
  userEmail: string;
  avatarLetter: string;
  onLogout: () => void | Promise<void>;
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
  userEmail,
  avatarLetter,
  onLogout,
}) => {
  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <div className={classes.headerTop}>
          <UserAvatarMenu
            letter={avatarLetter}
            ariaLabel={userEmail ? `Account menu for ${userEmail}` : 'Account menu'}
            items={[{ id: 'logout', label: 'Log out', onClick: (): void => void onLogout() }]}
          />
          <div className={classes.headerTitles}>
            <h1>Set Forge</h1>
            <p className={classes.subtitle}>Track your workout progress</p>
          </div>
          <div className={classes.headerActions}>
            <button
              type="button"
              className={classes.iconButton}
              aria-label="Export workout lists"
              title="Export workout lists"
              disabled={workoutLists.length === 0}
              onClick={(): void => void onExport()}
            >
              <IconDownload />
            </button>
            <button
              type="button"
              className={classes.iconButton}
              aria-label="Import workout lists"
              title="Import workout lists"
              onClick={onImportClick}
            >
              <IconUpload />
            </button>
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
