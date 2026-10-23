import { FC, useCallback, useEffect, useRef, useState } from 'react';

import { type MuscleGroup, muscleGroupLabel } from '@entities/workout-exercise';
import type { WorkoutSession } from '@entities/workout-session';
import { useLoadingPhase, useT } from '@shared/lib';
import { useMainTabSwipe } from '@widgets/main-tabs-bar';

import HistoryPage from './history-page';
import { formatSessionDate, formatSummary } from '../lib/history-formatters';

type Props = {
  sessions: WorkoutSession[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
};

const HistoryPageLogicLayer: FC<Props> = ({
  sessions,
  total,
  isLoading,
  isError,
  isFetchingNextPage,
  hasMore,
  fetchNextPage,
}) => {
  const { t, language } = useT();
  const swipeRef = useMainTabSwipe();
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingPhase = useLoadingPhase(isLoading);
  const nextPagePhase = useLoadingPhase(isFetchingNextPage);

  const handleToggle = useCallback((id: string): void => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // `loadingPhase`: the sentinel renders with the list, which may come after the sessions while a skeleton is held
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    observer.observe(node);

    return (): void => observer.disconnect();
  }, [hasMore, isFetchingNextPage, fetchNextPage, sessions.length, loadingPhase]);

  return (
    <HistoryPage
      t={t}
      language={language}
      swipeRef={swipeRef}
      sessions={sessions}
      total={total}
      loadingPhase={loadingPhase}
      isError={isError}
      showNextPageSkeleton={nextPagePhase === 'skeleton'}
      expandedIds={expandedIds}
      onToggle={handleToggle}
      sentinelRef={sentinelRef}
      formatSessionDate={(iso: string | null): string => formatSessionDate(iso, language)}
      formatSummary={(session: WorkoutSession): string => formatSummary(session, t)}
      formatMuscleGroup={(group: MuscleGroup): string => muscleGroupLabel(group, t)}
    />
  );
};

export default HistoryPageLogicLayer;
