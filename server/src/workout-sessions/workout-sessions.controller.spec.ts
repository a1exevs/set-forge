import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';

import { WorkoutSessionsController } from '@workout-sessions/workout-sessions.controller';
import { WorkoutSessionsService } from '@workout-sessions/workout-sessions.service';
import { WorkoutSessionResponse } from '@workout-sessions/dto';
import { SESSION_STATUS } from '@workout-sessions/constants/session-status';
import { sendPseudoError } from '@test/unit/helpers';

const buildSession = (overrides: Partial<WorkoutSessionResponse.Dto> = {}): WorkoutSessionResponse.Dto =>
  new WorkoutSessionResponse.Dto({
    id: 'sess-1',
    workoutListId: 'list-1',
    workoutListName: 'Push Day',
    status: SESSION_STATUS.ACTIVE,
    startedAt: '2026-06-03T12:00:00.000Z',
    finishedAt: null,
    exercises: [
      {
        id: 'sess-ex-1',
        sourceExerciseId: 'tpl-1',
        name: 'Bench',
        muscleGroup: 'chest',
        weight: 60,
        reps: 10,
        sets: 3,
        completedSets: 0,
      },
    ],
    ...overrides,
  });

describe('WorkoutSessionsController', () => {
  let controller: WorkoutSessionsController;
  let service: WorkoutSessionsService;
  const userId = 7;
  const request = { user: { id: userId } };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutSessionsController],
      providers: [
        {
          provide: WorkoutSessionsService,
          useValue: {
            start: jest.fn(x => x),
            getActive: jest.fn(x => x),
            getHistory: jest.fn(x => x),
            incrementProgress: jest.fn(x => x),
            finish: jest.fn(x => x),
            resync: jest.fn(x => x),
            discard: jest.fn(x => x),
          },
        },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = moduleRef.get<WorkoutSessionsController>(WorkoutSessionsController);
    service = moduleRef.get<WorkoutSessionsService>(WorkoutSessionsService);
  });

  describe('definition', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });
    it('service should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('start', () => {
    it('starts a session for the current user from a workout list', async () => {
      const session = buildSession();
      jest.spyOn(service, 'start').mockResolvedValue({ session, created: true });
      const response = { status: jest.fn() } as unknown as Response;

      const result = await controller.start({ workoutListId: 'list-1' }, request, response);

      expect(service.start).toBeCalledWith(userId, 'list-1');
      expect(response.status).toBeCalledWith(HttpStatus.CREATED);
      expect(result).toEqual(session);
    });

    it('returns 200 when resuming an existing active session', async () => {
      const session = buildSession();
      jest.spyOn(service, 'start').mockResolvedValue({ session, created: false });
      const response = { status: jest.fn() } as unknown as Response;

      await controller.start({ workoutListId: 'list-1' }, request, response);

      expect(response.status).toBeCalledWith(HttpStatus.OK);
    });

    it('propagates NotFoundException when the list is missing', async () => {
      jest.spyOn(service, 'start').mockImplementation(() => {
        throw new NotFoundException();
      });
      const response = { status: jest.fn() } as unknown as Response;

      try {
        await controller.start({ workoutListId: 'missing' }, request, response);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
        expect(service.start).toBeCalledWith(userId, 'missing');
      }
    });

    it('propagates BadRequestException when the list has no exercises', async () => {
      jest.spyOn(service, 'start').mockImplementation(() => {
        throw new BadRequestException();
      });
      const response = { status: jest.fn() } as unknown as Response;

      try {
        await controller.start({ workoutListId: 'list-1' }, request, response);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('getActive', () => {
    it('returns the active session for a list', async () => {
      const session = buildSession();
      jest.spyOn(service, 'getActive').mockResolvedValue(session);

      const result = await controller.getActive({ workoutListId: 'list-1' }, request);

      expect(service.getActive).toBeCalledWith(userId, 'list-1');
      expect(result).toEqual(session);
    });

    it('returns null when there is no active session', async () => {
      jest.spyOn(service, 'getActive').mockResolvedValue(null);

      const result = await controller.getActive({ workoutListId: 'list-1' }, request);

      expect(result).toBeNull();
    });
  });

  describe('getHistory', () => {
    it('returns paginated completed sessions for the current user', async () => {
      const page = {
        items: [buildSession({ status: SESSION_STATUS.COMPLETED, finishedAt: '2026-06-03T13:00:00.000Z' })],
        total: 1,
        hasMore: false,
      };
      jest.spyOn(service, 'getHistory').mockResolvedValue(page);

      const result = await controller.getHistory({ limit: 20, offset: 0 }, request);

      expect(service.getHistory).toBeCalledWith(userId, 20, 0);
      expect(result).toEqual(page);
    });
  });

  describe('incrementProgress', () => {
    it('increments a session exercise progress', async () => {
      const session = buildSession();
      jest.spyOn(service, 'incrementProgress').mockResolvedValue(session);

      const result = await controller.incrementProgress('sess-1', 'sess-ex-1', request);

      expect(service.incrementProgress).toBeCalledWith(userId, 'sess-1', 'sess-ex-1');
      expect(result).toEqual(session);
    });
  });

  describe('finish', () => {
    it('finishes a session', async () => {
      const session = buildSession({ status: SESSION_STATUS.COMPLETED, finishedAt: '2026-06-03T13:00:00.000Z' });
      jest.spyOn(service, 'finish').mockResolvedValue(session);

      const result = await controller.finish('sess-1', request);

      expect(service.finish).toBeCalledWith(userId, 'sess-1');
      expect(result).toEqual(session);
    });
  });

  describe('resync', () => {
    it('resyncs a session from its workout list', async () => {
      const session = buildSession();
      jest.spyOn(service, 'resync').mockResolvedValue(session);

      const result = await controller.resync('sess-1', request);

      expect(service.resync).toBeCalledWith(userId, 'sess-1');
      expect(result).toEqual(session);
    });
  });

  describe('discard', () => {
    it('discards an active session for the current user', async () => {
      jest.spyOn(service, 'discard').mockResolvedValue({ result: true });

      const result = await controller.discard('sess-1', request);

      expect(service.discard).toBeCalledWith(userId, 'sess-1');
      expect(result).toEqual({ result: true });
    });

    it('propagates BadRequestException when the session is not active', async () => {
      jest.spyOn(service, 'discard').mockImplementation(() => {
        throw new BadRequestException();
      });

      try {
        await controller.discard('sess-1', request);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
