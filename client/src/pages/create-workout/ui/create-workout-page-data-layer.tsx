import { FC } from 'react';

import { CreateWorkoutListDto, useCreateWorkoutListMutation } from '@entities';

import CreateWorkoutPageLogicLayer from 'src/pages/create-workout/ui/create-workout-page-logic-layer';

const CreateWorkoutPageDataLayer: FC = () => {
  const createWorkoutListMutation = useCreateWorkoutListMutation();

  const onCreate = async (dto: CreateWorkoutListDto): Promise<void> => {
    await createWorkoutListMutation.mutateAsync(dto);
  };

  return <CreateWorkoutPageLogicLayer onCreate={onCreate} />;
};

export default CreateWorkoutPageDataLayer;
