import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { HttpException, HttpStatus } from '@nestjs/common';
import { FindOptions } from 'sequelize';

import { UsersService } from '@users/users.service';
import { User } from '@users/users.model';
import { RolesService } from '@roles/roles.service';
import { Role } from '@roles/roles.model';
import { CreateUserRequest } from '@users/dto';
import { mockUsers } from '@test/unit/helpers';
import { ErrorMessages } from '@common/constants';

jest.mock('./users.model');

describe('UsersService', () => {
  let usersService: UsersService;
  let model: typeof User;
  let rolesService: RolesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: {
            create: jest.fn(x => x),
            findOne: jest.fn(x => x),
          },
        },
        {
          provide: RolesService,
          useValue: {
            getRoleByValue: jest.fn(x => x),
          },
        },
      ],
    }).compile();
    usersService = moduleRef.get<UsersService>(UsersService);
    model = moduleRef.get<typeof User>(getModelToken(User));
    rolesService = moduleRef.get<RolesService>(RolesService);
  });

  describe('UsersService - definition', () => {
    it('UsersService - should be defined', () => {
      expect(usersService).toBeDefined();
    });
    it('User - should be defined', () => {
      expect(model).toBeDefined();
    });
    it('RolesService - should be defined', () => {
      expect(rolesService).toBeDefined();
    });
  });

  describe('UsersService - createUser', () => {
    it('should be successful result', async () => {
      const dto: CreateUserRequest.Dto = { email: 'email', password: 'password' };
      const mockRole: Partial<Role> = { id: 1, value: 'user' };
      const mockUser: Partial<User> = { $set: jest.fn(() => Promise.resolve(null)), id: 1, roles: [] };
      jest.spyOn(rolesService, 'getRoleByValue').mockImplementation(() => {
        return Promise.resolve(mockRole as Role);
      });
      jest.spyOn(model, 'create').mockImplementation(() => {
        return Promise.resolve(mockUser);
      });
      const result = await usersService.createUser(dto);

      expect(result).toEqual({ ...mockUser, roles: [mockRole] });
      expect(rolesService.getRoleByValue).toBeCalledTimes(1);
      expect(rolesService.getRoleByValue).toBeCalledWith('user');
      expect(model.create).toBeCalledTimes(1);
      expect(model.create).toBeCalledWith(dto);
      expect(mockUser.$set).toBeCalledTimes(1);
      expect(mockUser.$set).toBeCalledWith('roles', [mockRole.id]);
    });
    it('should throw exception (roles configuration was missing)', async () => {
      const dto: CreateUserRequest.Dto = { email: 'email', password: 'password' };
      jest.spyOn(rolesService, 'getRoleByValue').mockImplementation(() => null);
      try {
        await usersService.createUser(dto);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe(
          `${
            ErrorMessages.ru.SERVICE_IS_UNAVAILABLE
          }: ${ErrorMessages.ru.USER_ROLE_CONFIGURATION_IS_MISSING.toLowerCase()}`,
        );
        expect(rolesService.getRoleByValue).toBeCalledTimes(1);
        expect(rolesService.getRoleByValue).toBeCalledWith('user');
        expect(model.create).toBeCalledTimes(0);
      }
    });
    it('should throw exception (user creation error)', async () => {
      const dto: CreateUserRequest.Dto = { email: 'email', password: 'password' };
      const mockRole: Partial<Role> = { id: 1, value: 'user' };
      const mockUser: Partial<User> = { $set: jest.fn(() => Promise.resolve(null)), id: 1, roles: [] };
      const errorMessage = 'errorMessage';
      jest.spyOn(rolesService, 'getRoleByValue').mockImplementation(() => {
        return Promise.resolve(mockRole as Role);
      });
      jest.spyOn(model, 'create').mockImplementation(() => {
        throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
      });
      try {
        await usersService.createUser(dto);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(`${ErrorMessages.ru.FAILED_TO_CREATE_USER}. ${errorMessage}`);
        expect(rolesService.getRoleByValue).toBeCalledTimes(1);
        expect(rolesService.getRoleByValue).toBeCalledWith('user');
        expect(model.create).toBeCalledTimes(1);
        expect(model.create).toBeCalledWith(dto);
        expect(mockUser.$set).toBeCalledTimes(0);
      }
    });
  });

  describe('UsersService - getUserByEmail', () => {
    it('should be successful result', async () => {
      const user = mockUsers(1)[0];
      const email = user.email;
      jest.spyOn(model, 'findOne').mockImplementation((options: FindOptions) => {
        return Promise.resolve(options.where['email'] === user.email ? (user as User) : null);
      });
      const result = await usersService.getUserByEmail(email);
      expect(model.findOne).toBeCalledTimes(1);
      expect(model.findOne).toBeCalledWith({ where: { email } });
      expect(result).toEqual(user);
    });
    it('should be successful result (search with all user data)', async () => {
      const user = mockUsers(1)[0];
      const email = user.email;
      jest.spyOn(model, 'findOne').mockImplementation((options: FindOptions) => {
        return Promise.resolve(options.where['email'] === user.email ? (user as User) : null);
      });
      const result = await usersService.getUserByEmail(email, true);
      expect(model.findOne).toBeCalledTimes(1);
      expect(model.findOne).toBeCalledWith({ where: { email }, include: { all: true } });
      expect(result).toEqual(user);
    });
  });

  describe('UsersService - getUserById', () => {
    it('should be successful result (search with all user data)', async () => {
      const user = mockUsers(1)[0];
      const userId = user.id;
      jest.spyOn(model, 'findOne').mockImplementation((options: FindOptions) => {
        return Promise.resolve(options.where['id'] === user.id ? (user as User) : null);
      });
      const result = await usersService.getUserById(userId);
      expect(model.findOne).toBeCalledTimes(1);
      expect(model.findOne).toBeCalledWith({ where: { id: userId }, include: { all: true } });
      expect(result).toEqual(user);
    });
  });
});
