import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Sequelize } from 'sequelize-typescript';

import { WorkoutList } from '@workout-lists/workout-list.model';
import { WorkoutExercise } from '@workout-lists/workout-exercise.model';
import { WorkoutSessionsService } from '@workout-sessions/workout-sessions.service';
import {
  CreateWorkoutListRequest,
  ImportWorkoutListsRequest,
  ImportWorkoutListsResponse,
  UpdateWorkoutListRequest,
  WorkoutListResponse,
  WorkoutListsExportFileResponse,
  WORKOUT_LISTS_EXPORT_APP,
  WORKOUT_LISTS_EXPORT_FORMAT_VERSION,
} from '@workout-lists/dto';

@Injectable()
export class WorkoutListsService {
  constructor(
    @InjectModel(WorkoutList) private workoutListRepository: typeof WorkoutList,
    @InjectModel(WorkoutExercise) private workoutExerciseRepository: typeof WorkoutExercise,
    private workoutSessionsService: WorkoutSessionsService,
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

    // Reconcile by replace: existing exercises keep their id (so active sessions can resync
    // against a stable sourceExerciseId), new ones get fresh ids, removed ones are dropped.
    const rows = dto.exercises.map((exercise, index) => {
      const existing = exercise.id ? existingById.get(exercise.id) : undefined;
      return {
        ...(existing ? { id: existing.id } : {}),
        workoutListId: id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        weight: exercise.weight,
        reps: exercise.reps,
        sets: exercise.sets,
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

    await this.sequelize.transaction(async transaction => {
      await this.workoutSessionsService.discardActiveForList(userId, id, transaction);
      await list.destroy({ transaction });
    });

    return { result: true };
  }

  public async exportAll(userId: number): Promise<WorkoutListsExportFileResponse.Dto> {
    const lists = await this.getAll(userId);
    return WorkoutListsService.toExportFile(lists);
  }

  // Reserved for GET /workout-lists/:id/export
  public async exportOne(userId: number, listId: string): Promise<WorkoutListsExportFileResponse.Dto> {
    const list = await this.getOne(userId, listId);
    return WorkoutListsService.toExportFile([list]);
  }

  public async importAll(userId: number, body: unknown): Promise<ImportWorkoutListsResponse.Dto> {
    const normalized = WorkoutListsService.normalizeImportBody(body);
    const file = await WorkoutListsService.validateExportFile(normalized);

    if (file.workoutLists.length === 0) {
      return new ImportWorkoutListsResponse.Dto({ importedCount: 0, lists: [] });
    }

    const createDtos: CreateWorkoutListRequest.Dto[] = file.workoutLists.map(item => ({
      name: item.name,
      description: item.description ?? '',
      exercises: item.exercises.map(exercise => ({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        weight: exercise.weight,
        reps: exercise.reps,
        sets: exercise.sets,
      })),
    }));

    const createdIds = await this.sequelize.transaction(async transaction =>
      Promise.all(
        createDtos.map(async dto => {
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
              position: index,
            })),
            { transaction },
          );
          return list.id;
        }),
      ),
    );

    const lists = await Promise.all(createdIds.map(id => this.getOne(userId, id)));
    return new ImportWorkoutListsResponse.Dto({ importedCount: lists.length, lists });
  }

  public static toExportFile(lists: WorkoutListResponse.Dto[]): WorkoutListsExportFileResponse.Dto {
    return {
      formatVersion: WORKOUT_LISTS_EXPORT_FORMAT_VERSION,
      app: WORKOUT_LISTS_EXPORT_APP,
      exportedAt: new Date().toISOString(),
      workoutLists: lists.map(list => ({
        name: list.name,
        description: list.description,
        exercises: list.exercises.map(({ name, muscleGroup, weight, reps, sets }) => ({
          name,
          muscleGroup,
          weight,
          reps,
          sets,
        })),
        createdAt: list.createdAt,
        lastUsedAt: list.lastUsedAt,
      })),
    };
  }

  private static normalizeImportBody(body: unknown): WorkoutListsExportFileResponse.Dto {
    if (Array.isArray(body)) {
      return WorkoutListsService.toExportFile(body.map(item => WorkoutListsService.legacyListToResponse(item)));
    }

    if (typeof body === 'object' && body !== null && 'workoutLists' in body) {
      return body as WorkoutListsExportFileResponse.Dto;
    }

    throw new BadRequestException('Invalid import file format');
  }

  private static legacyListToResponse(item: unknown): WorkoutListResponse.Dto {
    if (typeof item !== 'object' || item === null) {
      throw new BadRequestException('Invalid import file format');
    }

    const record = item as Record<string, unknown>;
    const exercises = record.exercises;
    if (!Array.isArray(exercises) || exercises.length === 0) {
      throw new BadRequestException('Invalid import file format');
    }

    return new WorkoutListResponse.Dto({
      id: typeof record.id === 'string' ? record.id : 'legacy',
      name: typeof record.name === 'string' ? record.name : '',
      description: typeof record.description === 'string' ? record.description : '',
      exercises: exercises.map((exercise, index) => {
        if (typeof exercise !== 'object' || exercise === null) {
          throw new BadRequestException('Invalid import file format');
        }
        const ex = exercise as Record<string, unknown>;
        return {
          id: typeof ex.id === 'string' ? ex.id : `legacy-${index}`,
          name: typeof ex.name === 'string' ? ex.name : '',
          muscleGroup: ex.muscleGroup as WorkoutListResponse.ExerciseDto['muscleGroup'],
          weight: Number(ex.weight),
          reps: Number(ex.reps),
          sets: Number(ex.sets),
        };
      }),
      createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
      lastUsedAt: typeof record.lastUsedAt === 'string' ? record.lastUsedAt : null,
    });
  }

  private static async validateExportFile(
    file: WorkoutListsExportFileResponse.Dto,
  ): Promise<ImportWorkoutListsRequest.Dto> {
    const instance = plainToInstance(ImportWorkoutListsRequest.Dto, file);
    const errors = await validate(instance);
    if (errors.length > 0) {
      throw new BadRequestException('Invalid import file format');
    }
    if (instance.formatVersion !== WORKOUT_LISTS_EXPORT_FORMAT_VERSION) {
      throw new BadRequestException('Unsupported export file version');
    }
    return instance;
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
