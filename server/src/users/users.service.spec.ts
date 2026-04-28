import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateOptions } from 'sequelize';
import { FindOptions } from 'sequelize';

import { ProfilesService } from '@profiles/profiles.service';
import { UsersService } from '@users/users.service';
import { User } from '@users/users.model';
import { RolesService } from '@roles/roles.service';
import { FollowersService } from '@followers/followers.service';
import { Role } from '@roles/roles.model';
import { CreateUserRequest, AddRoleRequest, BanUserRequest, SetUserStatusRequest } from '@users/dto';
import { mockUsers } from '@test/unit/helpers';
import { Follower } from '@followers/followers.model';
import { sendPseudoError } from '@test/unit/helpers';
import { ErrorMessages } from '@common/constants';
import { GetProfileResponse } from '@profiles/dto';

jest.mock('../profiles/profiles.service.ts');
jest.mock('./users.model');

describe('UsersService', () => {
  let usersService: UsersService;
  let model: typeof User;
  let rolesService: RolesService;
  let followersService: FollowersService;
  let profilesService: ProfilesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: {
            create: jest.fn(x => x),
            $set: jest.fn(x => x),
            findAll: jest.fn(x => x),
            findOne: jest.fn(x => x),
            findByPk: jest.fn(x => x),
            count: jest.fn(x => x),
            update: jest.fn(x => x),
          },
        },
        {
          provide: RolesService,
          useValue: {
            getRoleByValue: jest.fn(x => x),
          },
        },
        {
          provide: FollowersService,
          useValue: {
            findFollowRows: jest.fn(x => x),
          },
        },
        {
          provide: ProfilesService,
          useValue: {
            getUserProfile: jest.fn(x => x),
          },
        },
      ],
    }).compile();
    usersService = moduleRef.get<UsersService>(UsersService);
    model = moduleRef.get<typeof User>(getModelToken(User));
    rolesService = moduleRef.get<RolesService>(RolesService);
    followersService = moduleRef.get<FollowersService>(FollowersService);
    profilesService = moduleRef.get<ProfilesService>(ProfilesService);
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
    it('FollowersService - should be defined', () => {
      expect(followersService).toBeDefined();
    });
    it('ProfilesService - should be defined', () => {
      expect(profilesService).toBeDefined();
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

  describe('UsersService - getUsers', () => {
    it('should be successful result', async () => {
      const users = mockUsers(10);
      const page = 1;
      const count = 10;
      const userId = users[0].id;
      jest.spyOn(model, 'findAll').mockImplementation(() => {
        return Promise.resolve(users as User[]);
      });
      jest.spyOn(model, 'count').mockImplementation(() => {
        return Promise.resolve(users.length);
      });
      const mockFollowRows: Partial<Follower>[] = [{ followerId: userId, userId: users[1].id }];
      jest.spyOn(followersService, 'findFollowRows').mockImplementation(() => {
        return Promise.resolve(mockFollowRows as Follower[]);
      });
      jest.spyOn(profilesService, 'getUserProfile').mockImplementation((userId: number) => {
        return Promise.resolve({
          photos: { small: `small${userId}`, large: `large${userId}` },
        } as GetProfileResponse.Dto);
      });
      const result = await usersService.getUsers(page, count, userId);

      expect(result.totalCount).toBe(users.length);
      expect(model.findAll).toBeCalledTimes(1);
      expect(model.findAll).toBeCalledWith({ offset: (page - 1) * count, limit: count });
      expect(model.count).toBeCalledTimes(1);
      expect(followersService.findFollowRows).toBeCalledTimes(1);
      expect(followersService.findFollowRows).toBeCalledWith(
        userId,
        users.map(user => user.id),
      );
      expect(profilesService.getUserProfile).toBeCalledTimes(users.length);
      expect(profilesService.getUserProfile).toBeCalledWith(users[0].id);
      expect(profilesService.getUserProfile).toBeCalledWith(users[users.length - 1].id);
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

  describe('UsersService - addRole', () => {
    it('should be successful result (search with all user data)', async () => {
      const roleValue = 'admin';
      const user = {
        ...mockUsers(1)[0],
        $add: jest.fn((field, roleId) => {
          if (field === 'roles') {
            user.roles = [{ id: roleId, value: roleValue } as Role];
          }
        }),
      };
      const userId = user.id;
      const roleId = 1;
      const dto: AddRoleRequest.Dto = { userId, value: roleValue };
      jest.spyOn(model, 'findByPk').mockImplementation((id: number) => {
        return Promise.resolve(id === user.id ? (user as unknown as User) : null);
      });
      jest.spyOn(rolesService, 'getRoleByValue').mockImplementation((value: string) => {
        return Promise.resolve(value === dto.value ? ({ id: roleId, value } as Role) : null);
      });
      const result = await usersService.addRole(dto);

      expect(model.findByPk).toBeCalledTimes(1);
      expect(model.findByPk).toBeCalledWith(userId, { include: { all: true } });
      expect(rolesService.getRoleByValue).toBeCalledTimes(1);
      expect(rolesService.getRoleByValue).toBeCalledWith(dto.value);
      expect(result.roles.some(r => r.id === roleId)).toBeTruthy();
      expect(user.$add).toBeCalledTimes(1);
      expect(user.$add).toBeCalledWith('roles', roleId);
    });
    it('should throw exception (user already has the role)', async () => {
      const roleValue = 'admin';
      const user = { ...mockUsers(1)[0], roles: [{ id: 1, value: roleValue }], $add: jest.fn() };
      const userId = user.id;
      const dto: AddRoleRequest.Dto = { userId, value: roleValue };
      jest.spyOn(model, 'findByPk').mockImplementation((id: number) => {
        return Promise.resolve(id === user.id ? (user as unknown as User) : null);
      });

      try {
        await usersService.addRole(dto);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe(`Пользователь уже имеет роль ${dto.value}`);
        expect(model.findByPk).toBeCalledTimes(1);
        expect(model.findByPk).toBeCalledWith(userId, { include: { all: true } });
        expect(rolesService.getRoleByValue).toBeCalledTimes(0);
        expect(user.$add).toBeCalledTimes(0);
      }
    });
    it('should throw exception (user was not found)', async () => {
      const roleValue = 'admin';
      const user = { ...mockUsers(1)[0], roles: [{ id: 1, value: roleValue }], $add: jest.fn() };
      const userId = user.id + 1;
      const dto: AddRoleRequest.Dto = { userId, value: roleValue };
      jest.spyOn(model, 'findByPk').mockImplementation((id: number) => {
        return Promise.resolve(id === user.id ? (user as unknown as User) : null);
      });

      try {
        await usersService.addRole(dto);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe(ErrorMessages.ru.FAILED_TO_FIND_USER);
        expect(model.findByPk).toBeCalledTimes(1);
        expect(model.findByPk).toBeCalledWith(userId, { include: { all: true } });
        expect(rolesService.getRoleByValue).toBeCalledTimes(0);
        expect(user.$add).toBeCalledTimes(0);
      }
    });
    it('should throw exception (role was not found)', async () => {
      const roleValue = 'admin';
      const user = { ...mockUsers(1)[0], $add: jest.fn() };
      const userId = user.id;
      const dto: AddRoleRequest.Dto = { userId, value: roleValue };
      jest.spyOn(model, 'findByPk').mockImplementation((id: number) => {
        return Promise.resolve(id === user.id ? (user as User) : null);
      });
      jest.spyOn(rolesService, 'getRoleByValue').mockImplementation(() => {
        return Promise.resolve(null);
      });

      try {
        await usersService.addRole(dto);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe(ErrorMessages.ru.FAILED_TO_FIND_ROLE);
        expect(model.findByPk).toBeCalledTimes(1);
        expect(model.findByPk).toBeCalledWith(userId, { include: { all: true } });
        expect(rolesService.getRoleByValue).toBeCalledTimes(1);
        expect(rolesService.getRoleByValue).toBeCalledWith(dto.value);
        expect(user.$add).toBeCalledTimes(0);
      }
    });
  });

  describe('UsersService - ban', () => {
    it('should be successful result', async () => {
      const user = { ...mockUsers(1)[0], save: jest.fn(), banned: false, banReason: '' };
      const userId = user.id;
      const dto: BanUserRequest.Dto = { userId, banReason: 'banReason' };
      jest.spyOn(model, 'findByPk').mockImplementation((id: number) => {
        return Promise.resolve(id === user.id ? (user as User) : null);
      });
      const result = await usersService.ban(dto);

      expect(result.id).toBe(userId);
      expect(result.banned).toBeTruthy();
      expect(result.banReason).toBe(dto.banReason);
      expect(model.findByPk).toBeCalledTimes(1);
      expect(model.findByPk).toBeCalledWith(dto.userId);
      expect(user.save).toBeCalledTimes(1);
    });
    it('should throw exception (user was not found)', async () => {
      const user = { ...mockUsers(1)[0], save: jest.fn(), banned: false, banReason: '' };
      const userId = user.id + 1;
      const dto: BanUserRequest.Dto = { userId, banReason: 'banReason' };
      jest.spyOn(model, 'findByPk').mockImplementation((id: number) => {
        return Promise.resolve(id === user.id ? (user as User) : null);
      });
      try {
        await usersService.ban(dto);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe(ErrorMessages.ru.FAILED_TO_FIND_USER);
        expect(model.findByPk).toBeCalledTimes(1);
        expect(model.findByPk).toBeCalledWith(dto.userId);
        expect(user.save).toBeCalledTimes(0);
      }
    });
  });

  describe('UsersService - getStatus', () => {
    it('should be successful result', async () => {
      const userId = 1;
      const status = 'status';
      jest.spyOn(model, 'findOne').mockImplementation(() => {
        return Promise.resolve({ status } as User);
      });
      const result = await usersService.getStatus(userId);
      expect(result.status).toBe(status);
      expect(model.findOne).toBeCalledTimes(1);
      expect(model.findOne).toBeCalledWith({ attributes: ['status'], where: { id: userId } });
    });
    it('should throw exception (user was not found)', async () => {
      const userId = 1;
      jest.spyOn(model, 'findOne').mockImplementation(() => {
        return Promise.resolve(null);
      });
      try {
        await usersService.getStatus(userId);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
        expect(model.findOne).toBeCalledTimes(1);
        expect(model.findOne).toBeCalledWith({ attributes: ['status'], where: { id: userId } });
      }
    });
  });

  describe('UsersService - setStatus', () => {
    it('should be successful result', async () => {
      const user = mockUsers(1)[0];
      const userId = user.id;
      const status = 'new status';
      const updatedRowsCount = 1;
      const dto: SetUserStatusRequest.Dto = { status };
      jest.spyOn(model, 'update').mockImplementation((values: { status }, options: UpdateOptions) => {
        if (options.where['id'] === userId) {
          user.status = values.status;
          return Promise.resolve([updatedRowsCount, [user]]);
        } else return Promise.resolve(null);
      });
      const result = await usersService.setStatus(dto, userId);

      expect(result[0]).toBe(updatedRowsCount);
      expect(result[1][0].id).toBe(userId);
      expect(result[1][0].status).toBe(status);
      expect(model.update).toBeCalledTimes(1);
      expect(model.update).toBeCalledWith({ status: dto.status }, { where: { id: userId }, returning: true });
    });
  });
});
