import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { WorkoutList } from '@workout-lists/workout-list.model';
import { WorkoutExercise } from '@workout-lists/workout-exercise.model';
import { WorkoutSession } from '@workout-sessions/workout-session.model';
import { WorkoutSessionExercise } from '@workout-sessions/workout-session-exercise.model';
import { SESSION_STATUS, SessionStatus } from '@workout-sessions/constants/session-status';
import { WorkoutSessionResponse } from '@workout-sessions/dto';

export interface StartWorkoutSessionResult {
  session: WorkoutSessionResponse.Dto;
  created: boolean;
}

type SessionExerciseProgress = Pick<WorkoutSessionExercise, 'sets' | 'completedSets'>;

@Injectable()
export class WorkoutSessionsService {
  constructor(
    @InjectModel(WorkoutSession) private workoutSessionRepository: typeof WorkoutSession,
    @InjectModel(WorkoutSessionExercise) private workoutSessionExerciseRepository: typeof WorkoutSessionExercise,
    @InjectModel(WorkoutList) private workoutListRepository: typeof WorkoutList,
    @InjectConnection() private sequelize: Sequelize,
  ) {}

  public async getOne(userId: number, id: string): Promise<WorkoutSessionResponse.Dto> {
    const session = await this.findOwnedOrThrow(userId, id);
    return WorkoutSessionsService.mapToResponse(session);
  }

  public async getActive(userId: number, workoutListId: string): Promise<WorkoutSessionResponse.Dto | null> {
    const session = await this.findActiveSession(userId, workoutListId);
    return session ? WorkoutSessionsService.mapToResponse(session) : null;
  }

  // Idempotent start: returns the existing active session for the list, or snapshots a new one.
  // The workout list row is locked for the transaction so concurrent starts cannot create duplicates.
  public async start(userId: number, workoutListId: string): Promise<StartWorkoutSessionResult> {
    const { sessionId, created } = await this.sequelize.transaction(async transaction => {
      const list = await this.workoutListRepository.findOne({
        where: { id: workoutListId, userId },
        include: [WorkoutExercise],
        transaction,
        lock: Transaction.LOCK.UPDATE,
      });
      if (!list) {
        throw new NotFoundException();
      }

      const existing = await this.findActiveSession(userId, workoutListId, transaction);
      if (existing) {
        return { sessionId: existing.id, created: false };
      }

      if (!list.exercises?.length) {
        throw new BadRequestException();
      }

      const session = await this.workoutSessionRepository.create(
        {
          userId,
          workoutListId: list.id,
          workoutListName: list.name,
          status: SESSION_STATUS.ACTIVE,
          startedAt: new Date(),
          finishedAt: null,
        },
        { transaction },
      );

      const exercises = [...(list.exercises ?? [])].sort((a, b) => a.position - b.position);
      await this.workoutSessionExerciseRepository.bulkCreate(
        exercises.map((exercise, index) => ({
          workoutSessionId: session.id,
          sourceExerciseId: exercise.id,
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

      await list.update({ lastUsedAt: new Date() }, { transaction });
      return { sessionId: session.id, created: true };
    });

    return { session: await this.getOne(userId, sessionId), created };
  }

  public async incrementProgress(
    userId: number,
    sessionId: string,
    exerciseId: string,
  ): Promise<WorkoutSessionResponse.Dto> {
    const session = await this.findOwnedOrThrow(userId, sessionId);
    if (session.status !== SESSION_STATUS.ACTIVE) {
      throw new BadRequestException();
    }

    const exercise = session.exercises.find(item => item.id === exerciseId);
    if (!exercise) {
      throw new NotFoundException();
    }

    await this.sequelize.transaction(async transaction => {
      if (exercise.completedSets < exercise.sets) {
        await exercise.update({ completedSets: exercise.completedSets + 1 }, { transaction });
      }

      if (WorkoutSessionsService.isFullyCompleted(session.exercises)) {
        await session.update({ status: SESSION_STATUS.COMPLETED, finishedAt: new Date() }, { transaction });
      }
    });

    return this.getOne(userId, sessionId);
  }

  public async finish(userId: number, sessionId: string): Promise<WorkoutSessionResponse.Dto> {
    const session = await this.findOwnedOrThrow(userId, sessionId);
    if (session.status === SESSION_STATUS.ACTIVE) {
      await session.update({ status: SESSION_STATUS.COMPLETED, finishedAt: new Date() });
    }
    return this.getOne(userId, sessionId);
  }

  // Re-snapshot an active session from its current workout list, preserving progress by sourceExerciseId.
  public async resync(userId: number, sessionId: string): Promise<WorkoutSessionResponse.Dto> {
    const session = await this.findOwnedOrThrow(userId, sessionId);
    if (session.status !== SESSION_STATUS.ACTIVE) {
      throw new BadRequestException();
    }
    if (!session.workoutListId) {
      throw new BadRequestException();
    }

    const list = await this.workoutListRepository.findOne({
      where: { id: session.workoutListId, userId },
      include: [WorkoutExercise],
    });
    if (!list) {
      throw new BadRequestException();
    }

    const completedBySource = new Map(
      session.exercises.filter(item => item.sourceExerciseId).map(item => [item.sourceExerciseId, item.completedSets]),
    );

    const exercises = [...(list.exercises ?? [])].sort((a, b) => a.position - b.position);
    const rows = exercises.map((exercise, index) => {
      const preserved = completedBySource.get(exercise.id) ?? 0;
      return {
        workoutSessionId: session.id,
        sourceExerciseId: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        weight: exercise.weight,
        reps: exercise.reps,
        sets: exercise.sets,
        completedSets: Math.min(preserved, exercise.sets),
        position: index,
      };
    });

    await this.sequelize.transaction(async transaction => {
      const sessionPatch: { workoutListName: string; status?: SessionStatus; finishedAt?: Date } = {
        workoutListName: list.name,
      };
      if (WorkoutSessionsService.isFullyCompleted(rows)) {
        sessionPatch.status = SESSION_STATUS.COMPLETED;
        sessionPatch.finishedAt = new Date();
      }

      await session.update(sessionPatch, { transaction });
      await this.workoutSessionExerciseRepository.destroy({ where: { workoutSessionId: session.id }, transaction });
      await this.workoutSessionExerciseRepository.bulkCreate(rows, { transaction });
    });

    return this.getOne(userId, sessionId);
  }

  private async findActiveSession(
    userId: number,
    workoutListId: string,
    transaction?: Transaction,
  ): Promise<WorkoutSession | null> {
    return this.workoutSessionRepository.findOne({
      where: { userId, workoutListId, status: SESSION_STATUS.ACTIVE },
      include: [WorkoutSessionExercise],
      ...(transaction ? { transaction } : {}),
    });
  }

  private async findOwnedOrThrow(userId: number, id: string): Promise<WorkoutSession> {
    const session = await this.workoutSessionRepository.findOne({
      where: { id, userId },
      include: [WorkoutSessionExercise],
    });
    if (!session) {
      throw new NotFoundException();
    }
    return session;
  }

  private static isFullyCompleted(exercises: SessionExerciseProgress[]): boolean {
    if (!exercises || exercises.length === 0) {
      return false;
    }
    return exercises.every(exercise => exercise.sets > 0 && exercise.completedSets >= exercise.sets);
  }

  private static mapToResponse(session: WorkoutSession): WorkoutSessionResponse.Dto {
    const exercises = [...(session.exercises ?? [])]
      .sort((a, b) => a.position - b.position)
      .map(exercise => ({
        id: exercise.id,
        sourceExerciseId: exercise.sourceExerciseId ?? null,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup as WorkoutSessionResponse.ExerciseDto['muscleGroup'],
        weight: exercise.weight,
        reps: exercise.reps,
        sets: exercise.sets,
        completedSets: exercise.completedSets,
      }));

    return new WorkoutSessionResponse.Dto({
      id: session.id,
      workoutListId: session.workoutListId ?? null,
      workoutListName: session.workoutListName,
      status: session.status,
      startedAt: session.startedAt instanceof Date ? session.startedAt.toISOString() : String(session.startedAt),
      finishedAt: session.finishedAt ? new Date(session.finishedAt).toISOString() : null,
      exercises,
    });
  }
}
