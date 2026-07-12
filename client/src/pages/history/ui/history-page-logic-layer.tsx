import type { WorkoutSession } from '@entities';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import HistoryPage from 'src/pages/history/ui/history-page';
import { formatSessionDate, formatSummary } from 'src/pages/history/ui/history-page-formatters';

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
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback((id: string): void => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

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
  }, [hasMore, isFetchingNextPage, fetchNextPage, sessions.length]);

  return (
    <HistoryPage
      sessions={sessions}
      total={total}
      isLoading={isLoading}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      expandedIds={expandedIds}
      onToggle={handleToggle}
      sentinelRef={sentinelRef}
      formatSessionDate={formatSessionDate}
      formatSummary={formatSummary}
    />
  );
};

export default HistoryPageLogicLayer;
