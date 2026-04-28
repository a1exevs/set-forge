import '@root/string.extensions';

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

import { UsersController } from '@users/users.controller';
import { UsersService } from '@users/users.service';
import { GetUsersQuery } from '@users/queries';
import { AddRoleRequest } from '@users/dto';
import { User } from '@users/users.model';
import { sendPseudoError } from '@test/unit/helpers';
import { BanUserRequest, SetUserStatusRequest } from '@users/dto';
import { mockGetUsersResponse } from '@test/unit/helpers';
import { ErrorMessages } from '@common/constants';
import { Role } from '@roles/roles.model';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const jwtService = { provide: JwtService, useValue: {} };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUsers: jest.fn(x => x),
            addRole: jest.fn(x => x),
            ban: jest.fn(x => x),
            getStatus: jest.fn(x => x),
            setStatus: jest.fn(x => x),
          },
        },
        jwtService,
      ],
    }).compile();
    usersController = moduleRef.get<UsersController>(UsersController);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  describe('UsersController - definition', () => {
    it('UsersController - should be defined', () => {
      expect(usersController).toBeDefined();
    });
    it('UsersService - should be defined', () => {
      expect(usersService).toBeDefined();
    });
  });

  describe('UsersController - getUsers', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const req = { user: { id: userId } };
      const queryParams: GetUsersQuery.Params = { page: 1, count: 3 };
      const mockResponse = mockGetUsersResponse();
      jest.spyOn(usersService, 'getUsers').mockImplementation(() => {
        return Promise.resolve(mockResponse);
      });

      const result = await usersController.getUsers(queryParams, req);

      expect(usersService.getUsers).toBeCalledTimes(1);
      expect(usersService.getUsers).toBeCalledWith(queryParams.page, queryParams.count, userId);
      expect(result).toEqual(mockResponse);
    });
    it('should be successful result (with default query params)', async () => {
      const userId = 1;
      const req = { user: { id: userId } };
      const mockResponse = mockGetUsersResponse();
      jest.spyOn(usersService, 'getUsers').mockImplementation(() => {
        return Promise.resolve(mockResponse);
      });

      const result = await usersController.getUsers({ page: null, count: null }, req);

      expect(usersService.getUsers).toBeCalledTimes(1);
      expect(usersService.getUsers).toBeCalledWith(1, 10, userId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('UsersController - addRole', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const roleValue = 'admin';
      const reqDto: AddRoleRequest.Dto = { userId, value: roleValue };
      const mockUser: Partial<User> = { id: userId, roles: [{ value: roleValue, id: 1 } as Role] };
      jest.spyOn(usersService, 'addRole').mockImplementation(() => {
        return Promise.resolve(mockUser as User);
      });
      const result = await usersController.addRole(reqDto);
      expect(usersService.addRole).toBeCalledTimes(1);
      expect(usersService.addRole).toBeCalledWith(reqDto);
      expect(result).toEqual(mockUser);
    });
    it('should throw error (user already has the role)', async () => {
      const userId = 1;
      const roleValue = 'admin';
      const reqDto: AddRoleRequest.Dto = { userId, value: roleValue };
      const errorMessage = ErrorMessages.ru.USER_ALREADY_HAS_THE_ROLE_N.format(reqDto.value);
      const errorStatus = HttpStatus.BAD_REQUEST;
      jest.spyOn(usersService, 'addRole').mockImplementation(() => {
        throw new HttpException(errorMessage, errorStatus);
      });
      try {
        await usersController.addRole(reqDto);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(errorStatus);
        expect(error.message).toBe(errorMessage);
        expect(usersService.addRole).toBeCalledTimes(1);
        expect(usersService.addRole).toBeCalledWith(reqDto);
      }
    });
  });

  describe('UsersController - ban', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const banReason = 'banReason';
      const reqDto: BanUserRequest.Dto = { userId, banReason: 'reason' };
      const mockUser: Partial<User> = { id: userId, banned: true, banReason };
      jest.spyOn(usersService, 'ban').mockImplementation(() => {
        return Promise.resolve(mockUser as User);
      });
      const result = await usersController.ban(reqDto);
      expect(usersService.ban).toBeCalledTimes(1);
      expect(usersService.ban).toBeCalledWith(reqDto);
      expect(result).toEqual(mockUser);
    });
    it('should throw exception (user was not found)', async () => {
      const userId = 1;
      const reqDto: BanUserRequest.Dto = { userId, banReason: 'reason' };
      const errorStatus = HttpStatus.NOT_FOUND;
      const errorMessage = ErrorMessages.ru.FAILED_TO_FIND_USER;
      jest.spyOn(usersService, 'ban').mockImplementation(() => {
        throw new HttpException(errorMessage, errorStatus);
      });
      try {
        await usersController.ban(reqDto);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(errorStatus);
        expect(error.message).toBe(errorMessage);
        expect(usersService.ban).toBeCalledTimes(1);
        expect(usersService.ban).toBeCalledWith(reqDto);
      }
    });
  });

  describe('UsersController - getStatus', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const mockResponse = { status: 'status' };
      jest.spyOn(usersService, 'getStatus').mockImplementation(() => {
        return Promise.resolve(mockResponse);
      });
      const result = await usersController.getStatus(userId);
      expect(result).toEqual(mockResponse);
      expect(usersService.getStatus).toBeCalledTimes(1);
      expect(usersService.getStatus).toBeCalledWith(userId);
      expect(usersService.getStatus).toReturnWith(Promise.resolve(mockResponse));
    });
    it('should throw result (user was not found)', async () => {
      const userId = 1;
      jest.spyOn(usersService, 'getStatus').mockImplementation(() => {
        throw new NotFoundException();
      });
      try {
        await usersController.getStatus(userId);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
        expect(usersService.getStatus).toBeCalledTimes(1);
        expect(usersService.getStatus).toBeCalledWith(userId);
      }
    });
  });

  describe('UsersController - setStatus', () => {
    it('should be successful result', async () => {
      const dto: SetUserStatusRequest.Dto = { status: 'new status' };
      const userId = 1;
      const req = { user: { id: userId } };
      jest.spyOn(usersService, 'setStatus').mockImplementation(() => {
        return Promise.resolve([1, [{ id: userId } as User]]);
      });
      const result = await usersController.setStatus(req, dto);
      expect(usersService.setStatus).toBeCalledTimes(1);
      expect(usersService.setStatus).toBeCalledWith(dto, userId);
      expect(result.result).toBeTruthy();
    });
  });
});
