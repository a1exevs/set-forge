import type { WorkoutList } from '@entities';
import { Link, useRouterState } from '@tanstack/react-router';
import { Download, Plus, Upload } from 'lucide-react';
import { ChangeEvent, FC, MouseEvent, RefObject } from 'react';

import { BrandWordmark, IconButton, MenuButton, useTabSwipeNavigation } from '@shared';
import { MAIN_TAB_ROUTES, MainTabsBar } from '@widgets';

import classes from 'src/pages/home/ui/home-page.module.scss';

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
  const pathname = useRouterState({ select: state => state.location.pathname });
  const swipeRef = useTabSwipeNavigation({ tabs: MAIN_TAB_ROUTES, activePath: pathname });

  return (
    <div ref={swipeRef} className={classes.container}>
      <header className={classes.header}>
        <div className={classes.headerTop}>
          <BrandWordmark title="Workout lists" />
          <div className={classes.headerActions}>
            <IconButton
              aria-label="Export workout lists"
              title="Export workout lists"
              disabled={workoutLists.length === 0}
              onClick={(): void => void onExport()}
            >
              <Download size={18} strokeWidth={1.75} aria-hidden />
            </IconButton>
            <IconButton aria-label="Import workout lists" title="Import workout lists" onClick={onImportClick}>
              <Upload size={18} strokeWidth={1.75} aria-hidden />
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
        shape="circle"
        size="lg"
        aria-label="Create workout list"
        title="Create workout list"
      >
        <Plus size={24} strokeWidth={2} aria-hidden />
      </IconButton>

      <MainTabsBar />
    </div>
  );
};

export default HomePage;
