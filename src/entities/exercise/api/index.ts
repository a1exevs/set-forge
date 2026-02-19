import type { Exercise, CreateExerciseDto } from 'src/entities/exercise/model/types';

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

  async delete(id: string): Promise<void> {
    return;
  },
};
