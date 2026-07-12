import { FC } from 'react';

import { useCurrentUserQuery, useWorkoutHistoryInfiniteQuery } from '@entities';

import HistoryPageLogicLayer from 'src/pages/history/ui/history-page-logic-layer';

const HistoryPageDataLayer: FC = () => {
  const { data: user } = useCurrentUserQuery(true);
  const query = useWorkoutHistoryInfiniteQuery(Boolean(user));

  const sessions = query.data?.pages.flatMap(page => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return (
    <HistoryPageLogicLayer
      sessions={sessions}
      total={total}
      isLoading={query.isLoading}
      isError={query.isError}
      isFetchingNextPage={query.isFetchingNextPage}
      hasMore={Boolean(query.hasNextPage)}
      fetchNextPage={(): void => {
        void query.fetchNextPage();
      }}
    />
  );
};

export default HistoryPageDataLayer;
