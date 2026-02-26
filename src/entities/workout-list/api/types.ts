import type { WorkoutList } from 'src/entities/workout-list/model/types';

export interface IWorkoutListStorage {
  getAllLists(): WorkoutList[];
  getList(id: string): WorkoutList | null;
  saveList(list: WorkoutList): void;
  deleteList(id: string): void;
  updateList(id: string, updates: Partial<WorkoutList>): void;
  getUsagePercentage(): number;
  getUsagePercentageAsync(): Promise<number>;
}

export interface StorageStats {
  usedBytes: number;
  totalBytes: number;
  usagePercentage: number;
  isNearLimit: boolean;
}
