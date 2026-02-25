import { FC } from 'react';

import { useWorkoutListStore } from '@entities';
import CreateWorkoutPageLogicLayer from 'src/pages/create-workout/ui/create-workout-page-logic-layer';

const CreateWorkoutPageDataLayer: FC = () => {
  const addWorkoutList = useWorkoutListStore.use.addWorkoutList();

  return <CreateWorkoutPageLogicLayer onAddWorkoutList={addWorkoutList} />;
};

export default CreateWorkoutPageDataLayer;
