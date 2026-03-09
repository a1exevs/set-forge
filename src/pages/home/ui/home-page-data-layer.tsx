import { FC } from 'react';

import { useWorkoutListStore } from '@entities';
import { formatDate } from '@shared';

import HomePageLogicLayer from 'src/pages/home/ui/home-page-logic-layer';

const HomePageDataLayer: FC = () => {
  const workoutLists = useWorkoutListStore.use.workoutLists();
  const loadFromStorage = useWorkoutListStore.use.loadFromStorage();
  const deleteWorkoutList = useWorkoutListStore.use.deleteWorkoutList();
  const getUsagePercentageAsync = useWorkoutListStore.use.getUsagePercentageAsync();

  return (
    <HomePageLogicLayer
      workoutLists={workoutLists}
      deleteWorkoutList={deleteWorkoutList}
      formatDate={formatDate}
      getUsagePercentageAsync={getUsagePercentageAsync}
      loadFromStorage={loadFromStorage}
    />
  );
};

export default HomePageDataLayer;
