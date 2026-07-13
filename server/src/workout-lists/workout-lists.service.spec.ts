import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/sequelize';
import { HttpStatus, NotFoundException } from '@nestjs/common';

import { WorkoutListsService } from '@workout-lists/workout-lists.service';
import { WorkoutList } from '@workout-lists/workout-list.model';
import { WorkoutExercise } from '@workout-lists/workout-exercise.model';
import { WorkoutSessionsService } from '@workout-sessions/workout-sessions.service';

import {
  CreateWorkoutListRequest,
  UpdateWorkoutListRequest,
  WORKOUT_LISTS_EXPORT_APP,
  WORKOUT_LISTS_EXPORT_FORMAT_VERSION,
} from '@workout-lists/dto';
import { sendPseudoError } from '@test/unit/helpers';

type MockExercise = {
  id: string;
  name: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  sets: number;
  position: number;
  update: jest.Mock;
};

const buildExercise = (overrides: Partial<MockExercise> = {}): MockExercise => ({
  id: 'ex-1',
  name: 'Bench',
  muscleGroup: 'chest',
  weight: 60,
  reps: 10,
  sets: 3,
  position: 0,
  update: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const buildListModel = (exercises: MockExercise[], overrides: Record<string, unknown> = {}) => ({
  id: 'list-1',
  userId: 7,
  name: 'Push Day',
  description: 'chest',
  createdAt: new Date('2026-06-03T12:00:00.000Z'),
  lastUsedAt: null,
  exercises,
  update: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('WorkoutListsService', () => {
  let service: WorkoutListsService;
  let listModel: { findAll: jest.Mock; findOne: jest.Mock; create: jest.Mock };
  let exerciseModel: { bulkCreate: jest.Mock; destroy: jest.Mock; update: jest.Mock };
  let workoutSessionsService: { discardActiveForList: jest.Mock };
  let connection: { transaction: jest.Mock };
  const userId = 7;

  beforeEach(async () => {
    jest.clearAllMocks();

    listModel = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() };
    exerciseModel = { bulkCreate: jest.fn(), destroy: jest.fn(), update: jest.fn() };
    workoutSessionsService = { discardActiveForList: jest.fn().mockResolvedValue(undefined) };
    connection = { transaction: jest.fn(async (cb: (t: unknown) => unknown) => cb({})) };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutListsService,
        { provide: getModelToken(WorkoutList), useValue: listModel },
        { provide: getModelToken(WorkoutExercise), useValue: exerciseModel },
        { provide: WorkoutSessionsService, useValue: workoutSessionsService },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = moduleRef.get<WorkoutListsService>(WorkoutListsService);
  });

  describe('definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('maps owned lists and sorts exercises by position', async () => {
      const list = buildListModel([
        buildExercise({ id: 'ex-2', position: 1 }),
        buildExercise({ id: 'ex-1', position: 0 }),
      ]);
      listModel.findAll.mockResolvedValue([list]);

      const result = await service.getAll(userId);

      expect(listModel.findAll).toBeCalledWith(expect.objectContaining({ where: { userId } }));
      expect(result).toHaveLength(1);
      expect(result[0].exercises.map(e => e.id)).toEqual(['ex-1', 'ex-2']);
      expect(result[0].createdAt).toBe('2026-06-03T12:00:00.000Z');
      expect(result[0].lastUsedAt).toBeNull();
    });
  });

  describe('getOne', () => {
    it('returns the mapped list when owned', async () => {
      listModel.findOne.mockResolvedValue(buildListModel([buildExercise()]));

      const result = await service.getOne(userId, 'list-1');

      expect(listModel.findOne).toBeCalledWith(expect.objectContaining({ where: { id: 'list-1', userId } }));
      expect(result.id).toBe('list-1');
    });

    it('throws NotFoundException when missing/not owned', async () => {
      listModel.findOne.mockResolvedValue(null);

      try {
        await service.getOne(userId, 'missing');
        sendPseudoError();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('create', () => {
    it('creates list + exercises and returns the mapped result', async () => {
      const dto: CreateWorkoutListRequest.Dto = {
        name: 'Push Day',
        description: 'chest',
        exercises: [
          { name: 'Bench', muscleGroup: 'chest', weight: 60, reps: 10, sets: 3 },
          { name: 'Fly', muscleGroup: 'chest', weight: 15, reps: 12, sets: 3 },
        ],
      };
      listModel.create.mockResolvedValue({ id: 'list-1' });
      listModel.findOne.mockResolvedValue(buildListModel([buildExercise()]));

      const result = await service.create(userId, dto);

      expect(connection.transaction).toBeCalledTimes(1);
      expect(listModel.create).toBeCalledWith(
        expect.objectContaining({ userId, name: 'Push Day', description: 'chest', lastUsedAt: null }),
        expect.anything(),
      );
      const bulkArgs = exerciseModel.bulkCreate.mock.calls[0][0];
      expect(bulkArgs).toHaveLength(2);
      expect(bulkArgs[0]).toEqual(expect.objectContaining({ workoutListId: 'list-1', position: 0 }));
      expect(bulkArgs[0]).not.toHaveProperty('completedSets');
      expect(bulkArgs[1]).toEqual(expect.objectContaining({ position: 1 }));
      expect(result.id).toBe('list-1');
    });
  });

  describe('update', () => {
    it('keeps existing exercises by id, adds new, drops removed', async () => {
      const existing = buildListModel([buildExercise({ id: 'ex-keep', sets: 3 }), buildExercise({ id: 'ex-remove' })]);
      // first findOne -> owned list for reconciliation, second findOne -> getOne result
      listModel.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(buildListModel([buildExercise()]));

      const dto: UpdateWorkoutListRequest.Dto = {
        name: 'Push Day v2',
        description: 'updated',
        exercises: [
          { id: 'ex-keep', name: 'Bench', muscleGroup: 'chest', weight: 65, reps: 8, sets: 4 },
          { name: 'New', muscleGroup: 'back', weight: 0, reps: 10, sets: 3 },
        ],
      };

      await service.update(userId, 'list-1', dto);

      expect(existing.update).toBeCalledWith(
        expect.objectContaining({ name: 'Push Day v2', description: 'updated' }),
        expect.anything(),
      );
      expect(exerciseModel.destroy).toBeCalledWith(expect.objectContaining({ where: { workoutListId: 'list-1' } }));
      const rows = exerciseModel.bulkCreate.mock.calls[0][0];
      expect(rows).toHaveLength(2);
      // existing exercise keeps its id (so an active session can resync against it)
      expect(rows[0]).toEqual(expect.objectContaining({ id: 'ex-keep', position: 0 }));
      expect(rows[0]).not.toHaveProperty('completedSets');
      // new exercise has no id
      expect(rows[1].id).toBeUndefined();
      expect(rows[1]).toEqual(expect.objectContaining({ position: 1 }));
    });
  });

  describe('remove', () => {
    it('discards active sessions and destroys an owned list in one transaction', async () => {
      const list = buildListModel([buildExercise()]);
      listModel.findOne.mockResolvedValue(list);
      let transaction: unknown;
      connection.transaction.mockImplementation(async (cb: (t: unknown) => unknown) => {
        transaction = { id: 'tx-1' };
        return cb(transaction);
      });

      const result = await service.remove(userId, 'list-1');

      expect(connection.transaction).toBeCalledTimes(1);
      expect(workoutSessionsService.discardActiveForList).toBeCalledWith(userId, 'list-1', transaction);
      expect(list.destroy).toBeCalledWith({ transaction });
      expect(result).toEqual({ result: true });
    });

    it('throws when not owned', async () => {
      listModel.findOne.mockResolvedValue(null);

      try {
        await service.remove(userId, 'missing');
        sendPseudoError();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }

      expect(workoutSessionsService.discardActiveForList).not.toBeCalled();
      expect(connection.transaction).not.toBeCalled();
    });
  });

  describe('exportAll', () => {
    it('returns export file without ids and progress', async () => {
      const list = buildListModel([buildExercise()]);
      listModel.findAll.mockResolvedValue([list]);

      const result = await service.exportAll(userId);

      expect(result.formatVersion).toBe(WORKOUT_LISTS_EXPORT_FORMAT_VERSION);
      expect(result.app).toBe(WORKOUT_LISTS_EXPORT_APP);
      expect(result.workoutLists).toHaveLength(1);
      expect(result.workoutLists[0]).toEqual(
        expect.objectContaining({
          name: 'Push Day',
          description: 'chest',
          exercises: [{ name: 'Bench', muscleGroup: 'chest', weight: 60, reps: 10, sets: 3 }],
        }),
      );
    });
  });

  describe('importAll', () => {
    it('creates all lists from export file in one transaction', async () => {
      const body = {
        formatVersion: WORKOUT_LISTS_EXPORT_FORMAT_VERSION,
        app: WORKOUT_LISTS_EXPORT_APP,
        exportedAt: '2026-06-03T12:00:00.000Z',
        workoutLists: [
          {
            name: 'Push Day',
            description: 'chest',
            exercises: [{ name: 'Bench', muscleGroup: 'chest', weight: 60, reps: 10, sets: 3 }],
          },
        ],
      };
      listModel.create.mockResolvedValue({ id: 'list-new' });
      listModel.findOne.mockResolvedValue(buildListModel([buildExercise()]));

      const result = await service.importAll(userId, body);

      expect(connection.transaction).toBeCalledTimes(1);
      expect(listModel.create).toBeCalledTimes(1);
      expect(result.importedCount).toBe(1);
      expect(result.lists).toHaveLength(1);
    });

    it('accepts legacy localStorage array format', async () => {
      const legacy = [
        {
          id: 'legacy-1',
          name: 'Legacy Day',
          description: 'back',
          exercises: [
            {
              id: 'ex-legacy',
              name: 'Row',
              muscleGroup: 'back',
              weight: 40,
              reps: 8,
              sets: 4,
              completedSets: 2,
            },
          ],
          createdAt: '2026-01-01T00:00:00.000Z',
          lastUsedAt: null,
        },
      ];
      listModel.create.mockResolvedValue({ id: 'list-new' });
      listModel.findOne.mockResolvedValue(buildListModel([buildExercise({ name: 'Row', muscleGroup: 'back' })]));

      const result = await service.importAll(userId, legacy);

      expect(result.importedCount).toBe(1);
      expect(listModel.create).toBeCalledWith(
        expect.objectContaining({ name: 'Legacy Day', description: 'back' }),
        expect.anything(),
      );
    });
  });
});
