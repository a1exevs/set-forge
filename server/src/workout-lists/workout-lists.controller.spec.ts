import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus, NotFoundException } from '@nestjs/common';

import { WorkoutListsController } from '@workout-lists/workout-lists.controller';
import { WorkoutListsService } from '@workout-lists/workout-lists.service';
import {
  CreateWorkoutListRequest,
  ImportWorkoutListsResponse,
  UpdateWorkoutListRequest,
  WorkoutListResponse,
  WorkoutListsExportFile,
  WORKOUT_LISTS_EXPORT_APP,
} from '@workout-lists/dto';
import { sendPseudoError } from '@test/unit/helpers';

const buildList = (overrides: Partial<WorkoutListResponse.Dto> = {}): WorkoutListResponse.Dto =>
  new WorkoutListResponse.Dto({
    id: 'list-1',
    name: 'Push Day',
    description: 'chest',
    exercises: [{ id: 'ex-1', name: 'Bench', muscleGroup: 'chest', weight: 60, reps: 10, sets: 3, completedSets: 0 }],
    createdAt: '2026-06-03T12:00:00.000Z',
    lastUsedAt: null,
    ...overrides,
  });

describe('WorkoutListsController', () => {
  let controller: WorkoutListsController;
  let service: WorkoutListsService;
  const userId = 7;
  const request = { user: { id: userId } };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutListsController],
      providers: [
        {
          provide: WorkoutListsService,
          useValue: {
            getAll: jest.fn(x => x),
            getOne: jest.fn(x => x),
            create: jest.fn(x => x),
            update: jest.fn(x => x),
            remove: jest.fn(x => x),
            incrementProgress: jest.fn(x => x),
            resetAll: jest.fn(x => x),
            exportAll: jest.fn(x => x),
            importAll: jest.fn(x => x),
          },
        },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = moduleRef.get<WorkoutListsController>(WorkoutListsController);
    service = moduleRef.get<WorkoutListsService>(WorkoutListsService);
  });

  describe('definition', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
    it('service should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('returns lists scoped to the current user', async () => {
      const lists = [buildList()];
      jest.spyOn(service, 'getAll').mockResolvedValue(lists);

      const result = await controller.getAll(request);

      expect(service.getAll).toBeCalledTimes(1);
      expect(service.getAll).toBeCalledWith(userId);
      expect(result).toEqual(lists);
    });
  });

  describe('getOne', () => {
    it('returns a single list', async () => {
      const list = buildList();
      jest.spyOn(service, 'getOne').mockResolvedValue(list);

      const result = await controller.getOne('list-1', request);

      expect(service.getOne).toBeCalledWith(userId, 'list-1');
      expect(result).toEqual(list);
    });

    it('propagates NotFoundException', async () => {
      jest.spyOn(service, 'getOne').mockImplementation(() => {
        throw new NotFoundException();
      });

      try {
        await controller.getOne('missing', request);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
        expect(service.getOne).toBeCalledWith(userId, 'missing');
      }
    });
  });

  describe('create', () => {
    it('creates a list for the current user', async () => {
      const dto: CreateWorkoutListRequest.Dto = {
        name: 'Push Day',
        description: 'chest',
        exercises: [{ name: 'Bench', muscleGroup: 'chest', weight: 60, reps: 10, sets: 3 }],
      };
      const list = buildList();
      jest.spyOn(service, 'create').mockResolvedValue(list);

      const result = await controller.create(dto, request);

      expect(service.create).toBeCalledWith(userId, dto);
      expect(result).toEqual(list);
    });
  });

  describe('update', () => {
    it('updates a list', async () => {
      const dto: UpdateWorkoutListRequest.Dto = {
        name: 'New',
        description: 'd',
        exercises: [
          { id: 'ex-1', name: 'Bench', muscleGroup: 'chest', weight: 65, reps: 8, sets: 4, completedSets: 1 },
        ],
      };
      const list = buildList({ name: 'New' });
      jest.spyOn(service, 'update').mockResolvedValue(list);

      const result = await controller.update('list-1', dto, request);

      expect(service.update).toBeCalledWith(userId, 'list-1', dto);
      expect(result).toEqual(list);
    });
  });

  describe('remove', () => {
    it('wraps the deletion result into OperationResultResponse', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue({ result: true });

      const result = await controller.remove('list-1', request);

      expect(service.remove).toBeCalledWith(userId, 'list-1');
      expect(result.result).toBe(true);
    });
  });

  describe('incrementProgress', () => {
    it('increments exercise progress', async () => {
      const list = buildList();
      jest.spyOn(service, 'incrementProgress').mockResolvedValue(list);

      const result = await controller.incrementProgress('list-1', 'ex-1', request);

      expect(service.incrementProgress).toBeCalledWith(userId, 'list-1', 'ex-1');
      expect(result).toEqual(list);
    });
  });

  describe('resetAll', () => {
    it('resets all progress', async () => {
      const list = buildList();
      jest.spyOn(service, 'resetAll').mockResolvedValue(list);

      const result = await controller.resetAll('list-1', request);

      expect(service.resetAll).toBeCalledWith(userId, 'list-1');
      expect(result).toEqual(list);
    });
  });

  describe('exportAll', () => {
    it('exports all lists for the current user', async () => {
      const exportFile: WorkoutListsExportFile.Dto = {
        formatVersion: 1,
        app: WORKOUT_LISTS_EXPORT_APP,
        exportedAt: '2026-06-03T12:00:00.000Z',
        workoutLists: [],
      };
      jest.spyOn(service, 'exportAll').mockResolvedValue(exportFile);

      const result = await controller.exportAll(request);

      expect(service.exportAll).toBeCalledWith(userId);
      expect(result).toEqual(exportFile);
    });
  });

  describe('importAll', () => {
    it('imports lists for the current user', async () => {
      const body = {
        formatVersion: 1,
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
      const response = new ImportWorkoutListsResponse.Dto({ importedCount: 1, lists: [buildList()] });
      jest.spyOn(service, 'importAll').mockResolvedValue(response);

      const result = await controller.importAll(body, request);

      expect(service.importAll).toBeCalledWith(userId, body);
      expect(result).toEqual(response);
    });
  });
});
