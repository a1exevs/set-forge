import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { RolesController } from '@roles/roles.controller';
import { RolesService } from '@roles/roles.service';
import { RolesGuard, RefreshTokenGuard } from '@common/guards';
import { CreateRoleRequest } from '@roles/dto';
import { Role } from '@roles/roles.model';
import { HttpException, HttpStatus } from '@nestjs/common';
import { sendPseudoError } from '@test/unit/helpers';
import { ErrorMessages } from '@common/constants';

describe('RolesController', () => {
  let rolesController: RolesController;
  let rolesService: RolesService;
  let rolesGuard: RolesGuard;
  let refreshTokenGuard: RefreshTokenGuard;

  beforeEach(async () => {
    jest.clearAllMocks();

    const jwtService = { provide: JwtService, useValue: {} };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            createRole: jest.fn(x => x),
            getRoleByValue: jest.fn(x => x),
          },
        },
        jwtService,
      ],
    }).compile();
    rolesController = moduleRef.get<RolesController>(RolesController);
    rolesService = moduleRef.get<RolesService>(RolesService);
    rolesGuard = moduleRef.get<RolesGuard>(RolesGuard);
    refreshTokenGuard = moduleRef.get<RefreshTokenGuard>(RefreshTokenGuard);
  });

  describe('RolesController - definition', () => {
    it('RolesController - should be defined', () => {
      expect(rolesController).toBeDefined();
    });
    it('RolesService - should be defined', () => {
      expect(rolesService).toBeDefined();
    });
    it('RolesGuard - should be defined', () => {
      expect(rolesGuard).toBeDefined();
    });
    it('RefreshTokenGuard - should be defined', () => {
      expect(refreshTokenGuard).toBeDefined();
    });
  });

  describe('RolesController - create', () => {
    it('should be successful result', async () => {
      const reqDto: CreateRoleRequest.Dto = { value: 'super star', description: 'Super user' };
      const createdRole: Partial<Role> = { id: 1, ...reqDto };
      jest.spyOn(rolesService, 'createRole').mockImplementation(() => {
        return Promise.resolve(createdRole as Role);
      });
      const result = await rolesController.create(reqDto);

      expect(result).toEqual(createdRole);
      expect(rolesService.createRole).toBeCalledTimes(1);
      expect(rolesService.createRole).toBeCalledWith(reqDto);
    });
    it('should throw exception (error creating role)', async () => {
      const reqDto: CreateRoleRequest.Dto = { value: 'super star', description: 'Super user' };
      const errorMessage = ErrorMessages.ru.FAILED_TO_CREATE_ROLE;
      const errorStatus = HttpStatus.BAD_REQUEST;
      jest.spyOn(rolesService, 'createRole').mockImplementation(() => {
        throw new HttpException(errorMessage, errorStatus);
      });

      try {
        await rolesController.create(reqDto);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(errorStatus);
        expect(error.message).toBe(errorMessage);
        expect(rolesService.createRole).toBeCalledTimes(1);
        expect(rolesService.createRole).toBeCalledWith(reqDto);
      }
    });
  });

  describe('RolesController - getByValue', () => {
    it('should be successful result', async () => {
      const request = 'admin';
      const mockServiceResponse: Partial<Role> = { id: 1, value: request, description: 'Admin role' };
      jest.spyOn(rolesService, 'getRoleByValue').mockImplementation(() => {
        return Promise.resolve(mockServiceResponse as Role);
      });
      const result = await rolesController.getByValue(request);

      expect(result).toEqual(mockServiceResponse);
      expect(rolesService.getRoleByValue).toBeCalledTimes(1);
      expect(rolesService.getRoleByValue).toBeCalledWith(request);
    });
  });
});
