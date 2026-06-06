import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { WorkoutList } from '@workout-lists/workout-list.model';
import { WorkoutExercise } from '@workout-lists/workout-exercise.model';
import { CreateWorkoutListRequest, UpdateWorkoutListRequest, WorkoutListResponse } from '@workout-lists/dto';

@Injectable()
export class WorkoutListsService {
  constructor(
    @InjectModel(WorkoutList) private workoutListRepository: typeof WorkoutList,
    @InjectModel(WorkoutExercise) private workoutExerciseRepository: typeof WorkoutExercise,
    @InjectConnection() private sequelize: Sequelize,
  ) {}

  public async getAll(userId: number): Promise<WorkoutListResponse.Dto[]> {
    const lists = await this.workoutListRepository.findAll({
      where: { userId },
      include: [WorkoutExercise],
      order: [['createdAt', 'ASC']],
    });
    return lists.map(list => WorkoutListsService.mapToResponse(list));
  }

  public async getOne(userId: number, id: string): Promise<WorkoutListResponse.Dto> {
    const list = await this.findOwnedOrThrow(userId, id);
    return WorkoutListsService.mapToResponse(list);
  }

  public async create(userId: number, dto: CreateWorkoutListRequest.Dto): Promise<WorkoutListResponse.Dto> {
    const created = await this.sequelize.transaction(async transaction => {
      const list = await this.workoutListRepository.create(
        { userId, name: dto.name, description: dto.description ?? '', createdAt: new Date(), lastUsedAt: null },
        { transaction },
      );
      await this.workoutExerciseRepository.bulkCreate(
        dto.exercises.map((exercise, index) => ({
          workoutListId: list.id,
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          weight: exercise.weight,
          reps: exercise.reps,
          sets: exercise.sets,
          completedSets: 0,
          position: index,
        })),
        { transaction },
      );
      return list;
    });

    return this.getOne(userId, created.id);
  }

  public async update(userId: number, id: string, dto: UpdateWorkoutListRequest.Dto): Promise<WorkoutListResponse.Dto> {
    const list = await this.findOwnedOrThrow(userId, id);
    const existingById = new Map(list.exercises.map(exercise => [exercise.id, exercise]));

    // Reconcile by replace: existing exercises keep their id (so progress/currentWorkout stay
    // stable) and completedSets, new ones get fresh ids, removed ones are dropped via destroy.
    const rows = dto.exercises.map((exercise, index) => {
      const existing = exercise.id ? existingById.get(exercise.id) : undefined;
      let completedSetsSource = 0;
      if (exercise.completedSets !== undefined) {
        completedSetsSource = exercise.completedSets;
      } else if (existing) {
        completedSetsSource = existing.completedSets;
      }
      return {
        ...(existing ? { id: existing.id } : {}),
        workoutListId: id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        weight: exercise.weight,
        reps: exercise.reps,
        sets: exercise.sets,
        completedSets: Math.min(completedSetsSource, exercise.sets),
        position: index,
      };
    });

    await this.sequelize.transaction(async transaction => {
      await list.update({ name: dto.name, description: dto.description ?? '' }, { transaction });
      await this.workoutExerciseRepository.destroy({ where: { workoutListId: id }, transaction });
      await this.workoutExerciseRepository.bulkCreate(rows, { transaction });
    });

    return this.getOne(userId, id);
  }

  public async remove(userId: number, id: string): Promise<{ result: boolean }> {
    const list = await this.findOwnedOrThrow(userId, id);
    await list.destroy();
    return { result: true };
  }

  public async incrementProgress(userId: number, listId: string, exerciseId: string): Promise<WorkoutListResponse.Dto> {
    const list = await this.findOwnedOrThrow(userId, listId);
    const exercise = list.exercises.find(item => item.id === exerciseId);
    if (!exercise) {
      throw new NotFoundException();
    }

    if (exercise.completedSets < exercise.sets) {
      await exercise.update({ completedSets: exercise.completedSets + 1 });
    }
    await list.update({ lastUsedAt: new Date() });

    return this.getOne(userId, listId);
  }

  public async resetAll(userId: number, listId: string): Promise<WorkoutListResponse.Dto> {
    await this.findOwnedOrThrow(userId, listId);
    await this.workoutExerciseRepository.update({ completedSets: 0 }, { where: { workoutListId: listId } });
    return this.getOne(userId, listId);
  }

  private async findOwnedOrThrow(userId: number, id: string): Promise<WorkoutList> {
    const list = await this.workoutListRepository.findOne({
      where: { id, userId },
      include: [WorkoutExercise],
    });
    if (!list) {
      throw new NotFoundException();
    }
    return list;
  }

  private static mapToResponse(list: WorkoutList): WorkoutListResponse.Dto {
    const exercises = [...(list.exercises ?? [])]
      .sort((a, b) => a.position - b.position)
      .map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup as WorkoutListResponse.ExerciseDto['muscleGroup'],
        weight: exercise.weight,
        reps: exercise.reps,
        sets: exercise.sets,
        completedSets: exercise.completedSets,
      }));

    return new WorkoutListResponse.Dto({
      id: list.id,
      name: list.name,
      description: list.description ?? '',
      exercises,
      createdAt: list.createdAt instanceof Date ? list.createdAt.toISOString() : String(list.createdAt),
      lastUsedAt: list.lastUsedAt ? new Date(list.lastUsedAt).toISOString() : null,
    });
  }
}
