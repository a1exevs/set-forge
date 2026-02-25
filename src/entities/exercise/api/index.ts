import type { CreateExerciseDto, Exercise } from 'src/entities/exercise/model/types';

export const exerciseApi = {
  async getAll(): Promise<Exercise[]> {
    return [];
  },

  async create(dto: CreateExerciseDto): Promise<Exercise> {
    return {
      id: crypto.randomUUID(),
      ...dto,
      createdAt: new Date().toISOString(),
    };
  },

  // TODO: todo Implement when backend is ready
  async delete(_id: string): Promise<void> {
    return;
  },
};
