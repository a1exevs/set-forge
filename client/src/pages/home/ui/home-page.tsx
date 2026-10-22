import { Link } from '@tanstack/react-router';
import { Download, Plus, Upload } from 'lucide-react';
import { ChangeEvent, FC, RefObject } from 'react';

import type { WorkoutList } from '@entities/workout-list';
import type { LoadingPhase, Progress, Translate } from '@shared/lib';
import { BrandWordmark, IconButton, MenuButton } from '@shared/ui';
import { MainTabsBar } from '@widgets/main-tabs-bar';

import HomePageSkeleton from './home-page-skeleton';
import classes from './home-page.module.scss';

type Props = {
  t: Translate;
  swipeRef: RefObject<HTMLDivElement>;
  workoutLists: WorkoutList[];
  loadingPhase: LoadingPhase;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void | Promise<void>;
  exportProgress: Progress;
  onExport: () => void | Promise<void>;
  onImportClick: () => void;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  importInputRef: RefObject<HTMLInputElement>;
  formatDate: (iso: string) => string;
};

const HomePage: FC<Props> = ({
  t,
  swipeRef,
  workoutLists,
  loadingPhase,
  onEdit,
  onDelete,
  exportProgress,
  onExport,
  onImportClick,
  onImportFile,
  importInputRef,
  formatDate,
}) => {
  const renderLists = (): JSX.Element | null => {
    if (loadingPhase === 'skeleton') {
      return <HomePageSkeleton t={t} />;
    }
    if (loadingPhase === 'blank') {
      return null;
    }

    if (workoutLists.length === 0) {
      return (
        <div className={classes.empty}>
          <p>{t('home.empty')}</p>
          <p className={classes.emptyHint}>{t('home.emptyHint')}</p>
        </div>
      );
    }

    return (
      <div className={classes.listGrid}>
        {workoutLists.map((list: WorkoutList) => (
          <div key={list.id} className={classes.card}>
            <Link
              to="/workout/$id"
              params={{ id: list.id }}
              className={classes.cardLink}
              aria-label={t('home.openList', { name: list.name })}
            />
            <div className={classes.cardContent}>
              <div className={classes.cardHeader}>
                <h2>{list.name}</h2>
                <span className={classes.badge}>{t('home.exercisesBadge', { number: list.exercises.length })}</span>
                <div className={classes.menuButton}>
                  <MenuButton
                    ariaLabel={t('home.listActions')}
                    items={[
                      { id: 'edit', label: t('common.edit'), onClick: (): void => onEdit(list.id) },
                      {
                        id: 'delete',
                        label: t('common.delete'),
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
                <span className={classes.date}>{t('home.created', { date: formatDate(list.createdAt) })}</span>
                {list.lastUsedAt && (
                  <span className={classes.lastUsed}>{t('home.lastUsed', { date: formatDate(list.lastUsedAt) })}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={swipeRef}
      className={loadingPhase === 'skeleton' ? `${classes.container} ${classes.containerLoading}` : classes.container}
    >
      <header className={classes.header}>
        <div className={classes.headerTop}>
          <BrandWordmark title={t('home.title')} />
          <div className={classes.headerActions}>
            <IconButton
              aria-label={t('home.export')}
              title={t('home.export')}
              disabled={workoutLists.length === 0}
              progress={exportProgress}
              onClick={(): void => void onExport()}
            >
              <Download size={18} strokeWidth={1.75} aria-hidden />
            </IconButton>
            <IconButton aria-label={t('home.import')} title={t('home.import')} onClick={onImportClick}>
              <Upload size={18} strokeWidth={1.75} aria-hidden />
            </IconButton>
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              className={classes.hiddenFileInput}
              onChange={(event: ChangeEvent<HTMLInputElement>): void => void onImportFile(event)}
            />
          </div>
        </div>
      </header>

      <main className={classes.main} aria-busy={loadingPhase !== 'content'}>
        {renderLists()}
      </main>

      <IconButton
        as={Link}
        to="/create"
        className={classes.createFab}
        variant="primary"
        shape="circle"
        size="lg"
        aria-label={t('home.create')}
        title={t('home.create')}
      >
        <Plus size={24} strokeWidth={2} aria-hidden />
      </IconButton>

      <MainTabsBar />
    </div>
  );
};

export default HomePage;
