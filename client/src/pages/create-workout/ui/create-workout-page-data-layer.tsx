import { FC } from 'react';

import { type CreateWorkoutListDto, useCreateWorkoutListMutation } from '@entities/workout-list';

import CreateWorkoutPageLogicLayer from './create-workout-page-logic-layer';

const CreateWorkoutPageDataLayer: FC = () => {
  const createWorkoutListMutation = useCreateWorkoutListMutation();

  const onCreate = async (dto: CreateWorkoutListDto): Promise<void> => {
    await createWorkoutListMutation.mutateAsync(dto);
  };

  return <CreateWorkoutPageLogicLayer onCreate={onCreate} />;
};

export default CreateWorkoutPageDataLayer;
