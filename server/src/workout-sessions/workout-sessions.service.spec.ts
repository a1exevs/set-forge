import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/sequelize';
import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';

import { WorkoutList } from '@workout-lists/workout-list.model';
import { WorkoutSession } from '@workout-sessions/workout-session.model';
import { WorkoutSessionExercise } from '@workout-sessions/workout-session-exercise.model';
import { WorkoutSessionsService } from '@workout-sessions/workout-sessions.service';
import { SESSION_STATUS } from '@workout-sessions/constants/session-status';
import { sendPseudoError } from '@test/unit/helpers';

type MockSessionExercise = {
  id: string;
  sourceExerciseId: string | null;
  name: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  sets: number;
  completedSets: number;
  position: number;
  update: jest.Mock;
};

const buildSessionExercise = (overrides: Partial<MockSessionExercise> = {}): MockSessionExercise => {
  const exercise: MockSessionExercise = {
    id: 'sess-ex-1',
    sourceExerciseId: 'tpl-ex-1',
    name: 'Bench',
    muscleGroup: 'chest',
    weight: 60,
    reps: 10,
    sets: 3,
    completedSets: 0,
    position: 0,
    update: jest.fn(),
    ...overrides,
  };
  exercise.update = jest.fn(async (patch: Partial<MockSessionExercise>) => {
    Object.assign(exercise, patch);
    return exercise;
  });
  return exercise;
};

const buildSessionModel = (exercises: MockSessionExercise[], overrides: Record<string, unknown> = {}) => {
  const session: Record<string, unknown> = {
    id: 'sess-1',
    userId: 7,
    workoutListId: 'list-1',
    workoutListName: 'Push Day',
    status: SESSION_STATUS.ACTIVE,
    startedAt: new Date('2026-06-03T12:00:00.000Z'),
    finishedAt: null,
    exercises,
    ...overrides,
  };
  session.update = jest.fn(async (patch: Record<string, unknown>) => {
    Object.assign(session, patch);
    return session;
  });
  return session;
};

const buildTemplateExercise = (overrides: Record<string, unknown> = {}) => ({
  id: 'tpl-ex-1',
  name: 'Bench',
  muscleGroup: 'chest',
  weight: 60,
  reps: 10,
  sets: 3,
  position: 0,
  ...overrides,
});

const buildListModel = (exercises: Record<string, unknown>[], overrides: Record<string, unknown> = {}) => ({
  id: 'list-1',
  userId: 7,
  name: 'Push Day',
  exercises,
  update: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('WorkoutSessionsService', () => {
  let service: WorkoutSessionsService;
  let sessionModel: { findOne: jest.Mock; create: jest.Mock };
  let sessionExerciseModel: { bulkCreate: jest.Mock; destroy: jest.Mock };
  let listModel: { findOne: jest.Mock };
  let connection: { transaction: jest.Mock };
  const userId = 7;

  beforeEach(async () => {
    jest.clearAllMocks();

    sessionModel = { findOne: jest.fn(), create: jest.fn() };
    sessionExerciseModel = { bulkCreate: jest.fn(), destroy: jest.fn() };
    listModel = { findOne: jest.fn() };
    connection = { transaction: jest.fn(async (cb: (t: unknown) => unknown) => cb({})) };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutSessionsService,
        { provide: getModelToken(WorkoutSession), useValue: sessionModel },
        { provide: getModelToken(WorkoutSessionExercise), useValue: sessionExerciseModel },
        { provide: getModelToken(WorkoutList), useValue: listModel },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = moduleRef.get<WorkoutSessionsService>(WorkoutSessionsService);
  });

  describe('definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getOne', () => {
    it('returns the mapped session when owned and sorts exercises by position', async () => {
      const session = buildSessionModel([
        buildSessionExercise({ id: 'b', position: 1 }),
        buildSessionExercise({ id: 'a', position: 0 }),
      ]);
      sessionModel.findOne.mockResolvedValue(session);

      const result = await service.getOne(userId, 'sess-1');

      expect(sessionModel.findOne).toBeCalledWith(expect.objectContaining({ where: { id: 'sess-1', userId } }));
      expect(result.id).toBe('sess-1');
      expect(result.startedAt).toBe('2026-06-03T12:00:00.000Z');
      expect(result.finishedAt).toBeNull();
      expect(result.exercises.map(e => e.id)).toEqual(['a', 'b']);
    });

    it('throws NotFoundException when missing/not owned', async () => {
      sessionModel.findOne.mockResolvedValue(null);

      try {
        await service.getOne(userId, 'missing');
        sendPseudoError();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getActive', () => {
    it('returns the mapped active session for a list', async () => {
      sessionModel.findOne.mockResolvedValue(buildSessionModel([buildSessionExercise()]));

      const result = await service.getActive(userId, 'list-1');

      expect(sessionModel.findOne).toBeCalledWith(
        expect.objectContaining({ where: { userId, workoutListId: 'list-1', status: SESSION_STATUS.ACTIVE } }),
      );
      expect(result?.id).toBe('sess-1');
    });

    it('returns null when there is no active session', async () => {
      sessionModel.findOne.mockResolvedValue(null);

      const result = await service.getActive(userId, 'list-1');

      expect(result).toBeNull();
    });
  });

  describe('start', () => {
    it('throws NotFoundException when the list is missing/not owned', async () => {
      listModel.findOne.mockResolvedValue(null);

      try {
        await service.start(userId, 'missing');
        sendPseudoError();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
      expect(sessionModel.create).not.toBeCalled();
    });

    it('throws BadRequestException when the list has no exercises', async () => {
      listModel.findOne.mockResolvedValue(buildListModel([]));
      sessionModel.findOne.mockResolvedValueOnce(null);

      try {
        await service.start(userId, 'list-1');
        sendPseudoError();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
      expect(sessionModel.create).not.toBeCalled();
    });

    it('returns the existing active session without creating a new one', async () => {
      const existingSession = buildSessionModel([buildSessionExercise()]);
      listModel.findOne.mockResolvedValue(buildListModel([buildTemplateExercise()]));
      sessionModel.findOne
        .mockResolvedValueOnce(existingSession) // active check inside transaction
        .mockResolvedValueOnce(existingSession); // getOne

      const result = await service.start(userId, 'list-1');

      expect(connection.transaction).toBeCalledTimes(1);
      expect(listModel.findOne).toBeCalledWith(
        expect.objectContaining({
          where: { id: 'list-1', userId },
          lock: 'UPDATE',
        }),
      );
      expect(sessionModel.create).not.toBeCalled();
      expect(result.created).toBe(false);
      expect(result.session.id).toBe('sess-1');
    });

    it('snapshots a new session from the list when none is active', async () => {
      const list = buildListModel([
        buildTemplateExercise({ id: 'tpl-2', name: 'Fly', position: 1 }),
        buildTemplateExercise({ id: 'tpl-1', name: 'Bench', position: 0 }),
      ]);
      listModel.findOne.mockResolvedValue(list);
      sessionModel.findOne
        .mockResolvedValueOnce(null) // no active session inside transaction
        .mockResolvedValueOnce(buildSessionModel([buildSessionExercise()], { id: 'sess-new' })); // getOne
      sessionModel.create.mockResolvedValue({ id: 'sess-new' });

      const result = await service.start(userId, 'list-1');

      expect(connection.transaction).toBeCalledTimes(1);
      expect(sessionModel.create).toBeCalledWith(
        expect.objectContaining({
          userId,
          workoutListId: 'list-1',
          workoutListName: 'Push Day',
          status: SESSION_STATUS.ACTIVE,
          finishedAt: null,
        }),
        expect.anything(),
      );
      const rows = sessionExerciseModel.bulkCreate.mock.calls[0][0];
      expect(rows).toHaveLength(2);
      // exercises snapshotted in template position order with sourceExerciseId and fresh progress
      expect(rows[0]).toEqual(
        expect.objectContaining({ sourceExerciseId: 'tpl-1', name: 'Bench', completedSets: 0, position: 0 }),
      );
      expect(rows[1]).toEqual(expect.objectContaining({ sourceExerciseId: 'tpl-2', name: 'Fly', position: 1 }));
      expect(list.update).toBeCalledWith(expect.objectContaining({ lastUsedAt: expect.any(Date) }), expect.anything());
      expect(result.created).toBe(true);
      expect(result.session.id).toBe('sess-new');
    });
  });

  describe('incrementProgress', () => {
    it('increments completedSets when below sets', async () => {
      const exercise = buildSessionExercise({ completedSets: 1, sets: 3 });
      const other = buildSessionExercise({ id: 'sess-ex-2', completedSets: 0, sets: 3 });
      const session = buildSessionModel([exercise, other]);
      sessionModel.findOne.mockResolvedValue(session);

      await service.incrementProgress(userId, 'sess-1', 'sess-ex-1');

      expect(connection.transaction).toBeCalledTimes(1);
      expect(exercise.update).toBeCalledWith({ completedSets: 2 }, expect.anything());
      expect(session.update).not.toBeCalled();
    });

    it('does not increment when already at sets', async () => {
      const done = buildSessionExercise({ completedSets: 3, sets: 3 });
      const other = buildSessionExercise({ id: 'sess-ex-2', completedSets: 0, sets: 3 });
      const session = buildSessionModel([done, other]);
      sessionModel.findOne.mockResolvedValue(session);

      await service.incrementProgress(userId, 'sess-1', 'sess-ex-1');

      expect(done.update).not.toBeCalled();
      expect(session.update).not.toBeCalled();
      expect(connection.transaction).toBeCalledTimes(1);
    });

    it('auto-finishes the session when the last set completes', async () => {
      const exercise = buildSessionExercise({ completedSets: 2, sets: 3 });
      const session = buildSessionModel([exercise]);
      sessionModel.findOne.mockResolvedValue(session);

      await service.incrementProgress(userId, 'sess-1', 'sess-ex-1');

      expect(exercise.update).toBeCalledWith({ completedSets: 3 }, expect.anything());
      expect(session.update).toBeCalledWith(
        expect.objectContaining({ status: SESSION_STATUS.COMPLETED, finishedAt: expect.any(Date) }),
        expect.anything(),
      );
    });

    it('throws BadRequestException when the session is not active', async () => {
      const session = buildSessionModel([buildSessionExercise()], { status: SESSION_STATUS.COMPLETED });
      sessionModel.findOne.mockResolvedValue(session);

      try {
        await service.incrementProgress(userId, 'sess-1', 'sess-ex-1');
        sendPseudoError();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('throws NotFoundException when the exercise is missing', async () => {
      const session = buildSessionModel([buildSessionExercise({ id: 'other' })]);
      sessionModel.findOne.mockResolvedValue(session);

      try {
        await service.incrementProgress(userId, 'sess-1', 'sess-ex-1');
        sendPseudoError();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('finish', () => {
    it('completes an active session and stamps finishedAt', async () => {
      const session = buildSessionModel([buildSessionExercise()]);
      sessionModel.findOne.mockResolvedValue(session);

      await service.finish(userId, 'sess-1');

      expect(session.update).toBeCalledWith(
        expect.objectContaining({ status: SESSION_STATUS.COMPLETED, finishedAt: expect.any(Date) }),
      );
    });

    it('is a no-op when the session is already completed', async () => {
      const session = buildSessionModel([buildSessionExercise()], { status: SESSION_STATUS.COMPLETED });
      sessionModel.findOne.mockResolvedValue(session);

      await service.finish(userId, 'sess-1');

      expect(session.update).not.toBeCalled();
    });
  });

  describe('resync', () => {
    it('throws BadRequestException when the session is not active', async () => {
      const session = buildSessionModel([buildSessionExercise()], { status: SESSION_STATUS.COMPLETED });
      sessionModel.findOne.mockResolvedValue(session);

      try {
        await service.resync(userId, 'sess-1');
        sendPseudoError();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('throws BadRequestException when the source list is gone', async () => {
      const session = buildSessionModel([buildSessionExercise()], { workoutListId: null });
      sessionModel.findOne.mockResolvedValue(session);

      try {
        await service.resync(userId, 'sess-1');
        sendPseudoError();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it('re-snapshots from the list preserving completedSets by sourceExerciseId (clamped)', async () => {
      const session = buildSessionModel([
        buildSessionExercise({ id: 'old-1', sourceExerciseId: 'tpl-keep', completedSets: 5, sets: 5 }),
        buildSessionExercise({ id: 'old-2', sourceExerciseId: 'tpl-gone', completedSets: 1, sets: 3 }),
      ]);
      sessionModel.findOne.mockResolvedValue(session);

      const list = buildListModel([
        buildTemplateExercise({ id: 'tpl-keep', name: 'Bench', sets: 2, position: 0 }),
        buildTemplateExercise({ id: 'tpl-new', name: 'Row', muscleGroup: 'back', sets: 4, position: 1 }),
      ]);
      listModel.findOne.mockResolvedValue(list);

      await service.resync(userId, 'sess-1');

      expect(sessionExerciseModel.destroy).toBeCalledWith(
        expect.objectContaining({ where: { workoutSessionId: 'sess-1' } }),
      );
      const rows = sessionExerciseModel.bulkCreate.mock.calls[0][0];
      expect(rows).toHaveLength(2);
      // kept exercise preserves progress clamped to the new (smaller) sets count
      expect(rows[0]).toEqual(
        expect.objectContaining({ sourceExerciseId: 'tpl-keep', completedSets: 2, sets: 2, position: 0 }),
      );
      // brand new exercise starts at 0
      expect(rows[1]).toEqual(expect.objectContaining({ sourceExerciseId: 'tpl-new', completedSets: 0, position: 1 }));
    });

    it('auto-finishes when clamped progress completes every exercise after resync', async () => {
      const session = buildSessionModel([
        buildSessionExercise({ id: 'old-1', sourceExerciseId: 'tpl-1', completedSets: 3, sets: 4 }),
      ]);
      sessionModel.findOne.mockResolvedValueOnce(session).mockResolvedValueOnce(
        buildSessionModel([buildSessionExercise({ completedSets: 2, sets: 2 })], {
          status: SESSION_STATUS.COMPLETED,
          finishedAt: new Date('2026-06-03T13:00:00.000Z'),
        }),
      );

      const list = buildListModel([buildTemplateExercise({ id: 'tpl-1', sets: 2, position: 0 })]);
      listModel.findOne.mockResolvedValue(list);

      await service.resync(userId, 'sess-1');

      expect(session.update).toBeCalledWith(
        expect.objectContaining({
          workoutListName: 'Push Day',
          status: SESSION_STATUS.COMPLETED,
          finishedAt: expect.any(Date),
        }),
        expect.anything(),
      );
      const rows = sessionExerciseModel.bulkCreate.mock.calls[0][0];
      expect(rows[0]).toEqual(expect.objectContaining({ completedSets: 2, sets: 2 }));
    });
  });
});
