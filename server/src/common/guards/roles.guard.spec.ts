import { HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { sendPseudoError, getMockJWTServiceData, getMockExecutionContextData } from '@test/unit/helpers';
import { RolesGuard } from '@common/guards';
import { ROLES_KEY } from '@common/decorators';
import { ErrorMessages } from '@common/constants';

describe('RolesGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('canActivate', () => {
    it('should be successful result', async () => {
      const payloadPropertyName1 = 'id';
      const payloadPropertyName2 = 'roles';
      const payloadPropertyValue1 = 1;
      const payloadPropertyValue2 = [{ value: 'admin' }];
      const payload = {
        [payloadPropertyName1]: payloadPropertyValue1,
        [payloadPropertyName2]: payloadPropertyValue2,
      };
      const { jwtService, token } = getMockJWTServiceData({ expiresIn: '600s', payload });
      const req = {
        user: null,
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const { mockContext, mockGetRequest, request } = getMockExecutionContextData({ req });
      const reflector = new Reflector();
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation(() => {
        return ['admin'];
      });

      const rolesGuard = new RolesGuard(jwtService, reflector);
      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockGetRequest).toBeCalledTimes(1);
      expect(reflector.getAllAndOverride).toBeCalledTimes(1);
      expect(reflector.getAllAndOverride).toBeCalledWith(ROLES_KEY, [mockContext.getHandler(), mockContext.getClass()]);
      expect(request.user).toHaveProperty(payloadPropertyName1, payloadPropertyValue1);
      expect(request.user).toHaveProperty(payloadPropertyName2, payloadPropertyValue2);
    });
    it('token should be expired', async () => {
      const expiresIn = 600;
      const payloadPropertyName1 = 'id';
      const payloadPropertyName2 = 'roles';
      const payloadPropertyValue1 = 1;
      const payloadPropertyValue2 = [{ value: 'admin' }];
      const payload = {
        [payloadPropertyName1]: payloadPropertyValue1,
        [payloadPropertyName2]: payloadPropertyValue2,
      };
      const { jwtService, token } = getMockJWTServiceData({
        expiresIn: `${expiresIn}s`,
        payload,
      });

      const req = {
        user: null,
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const { mockContext, mockGetRequest } = getMockExecutionContextData({ req });
      const reflector = new Reflector();
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation(() => {
        return ['admin'];
      });
      const rolesGuard = new RolesGuard(jwtService, reflector);
      jest.useFakeTimers();
      expect.assertions(4);
      setTimeout(() => {
        try {
          rolesGuard.canActivate(mockContext);
          sendPseudoError();
        } catch (err) {
          expect(err.status).toBe(HttpStatus.FORBIDDEN);
          expect(err.message).toBe(ErrorMessages.ru.FORBIDDEN);
          expect(mockGetRequest).toBeCalledTimes(1);
          expect(reflector.getAllAndOverride).toBeCalledTimes(0);
        }
      }, expiresIn * 1000);
      jest.runOnlyPendingTimers();
    });
    it('should throw exception (no Bearer token in headers)', async () => {
      const expiresIn = 600;
      const payloadPropertyName1 = 'id';
      const payloadPropertyName2 = 'roles';
      const payloadPropertyValue1 = 1;
      const payloadPropertyValue2 = [{ value: 'admin' }];
      const payload = {
        [payloadPropertyName1]: payloadPropertyValue1,
        [payloadPropertyName2]: payloadPropertyValue2,
      };
      const { jwtService, token } = getMockJWTServiceData({
        expiresIn: `${expiresIn}s`,
        payload,
      });

      const req = {
        user: null,
        headers: {
          authorization: `${token}`,
        },
      };
      const { mockContext, mockGetRequest } = getMockExecutionContextData({ req });
      const reflector = new Reflector();
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation(() => {
        return ['admin'];
      });

      const rolesGuard = new RolesGuard(jwtService, reflector);
      try {
        rolesGuard.canActivate(mockContext);
        sendPseudoError();
      } catch (err) {
        expect(err.status).toBe(HttpStatus.FORBIDDEN);
        expect(err.message).toBe(ErrorMessages.ru.FORBIDDEN);
        expect(mockGetRequest).toBeCalledTimes(1);
        expect(reflector.getAllAndOverride).toBeCalledTimes(0);
      }
    });
    it('should throw exception (incorrect Bearer token in headers)', async () => {
      const expiresIn = 600;
      const payloadPropertyName1 = 'id';
      const payloadPropertyName2 = 'roles';
      const payloadPropertyValue1 = 1;
      const payloadPropertyValue2 = [{ value: 'admin' }];
      const payload = {
        [payloadPropertyName1]: payloadPropertyValue1,
        [payloadPropertyName2]: payloadPropertyValue2,
      };
      const { jwtService, token } = getMockJWTServiceData({
        expiresIn: `${expiresIn}s`,
        payload,
      });

      const req = {
        user: null,
        headers: {
          authorization: `Bearer ${token}1234`,
        },
      };
      const { mockContext, mockGetRequest } = getMockExecutionContextData({ req });
      const reflector = new Reflector();
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation(() => {
        return ['admin'];
      });

      const rolesGuard = new RolesGuard(jwtService, reflector);
      try {
        rolesGuard.canActivate(mockContext);
        sendPseudoError();
      } catch (err) {
        expect(err.status).toBe(HttpStatus.FORBIDDEN);
        expect(err.message).toBe(ErrorMessages.ru.FORBIDDEN);
        expect(mockGetRequest).toBeCalledTimes(1);
        expect(reflector.getAllAndOverride).toBeCalledTimes(0);
      }
    });
    it('should work as JWT Auth Guard if required roles are missing', async () => {
      const payloadPropertyName1 = 'id';
      const payloadPropertyName2 = 'roles';
      const payloadPropertyValue1 = 1;
      const payloadPropertyValue2 = [{ value: 'admin' }];
      const payload = {
        [payloadPropertyName1]: payloadPropertyValue1,
        [payloadPropertyName2]: payloadPropertyValue2,
      };
      const { jwtService, token } = getMockJWTServiceData({ expiresIn: '600s', payload });
      const req = {
        user: null,
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const { mockContext, mockGetRequest, request } = getMockExecutionContextData({ req });
      const reflector = new Reflector();
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation(() => []);

      const rolesGuard = new RolesGuard(jwtService, reflector);
      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockGetRequest).toBeCalledTimes(1);
      expect(reflector.getAllAndOverride).toBeCalledTimes(1);
      expect(reflector.getAllAndOverride).toBeCalledWith(ROLES_KEY, [mockContext.getHandler(), mockContext.getClass()]);
      expect(request.user).toHaveProperty(payloadPropertyName1, payloadPropertyValue1);
      expect(request.user).toHaveProperty(payloadPropertyName2, payloadPropertyValue2);
    });
    it('should throw error (user has not requirement roles', async () => {
      const payloadPropertyName1 = 'id';
      const payloadPropertyName2 = 'roles';
      const payloadPropertyValue1 = 1;
      const payloadPropertyValue2 = [{ value: 'user' }];
      const payload = {
        [payloadPropertyName1]: payloadPropertyValue1,
        [payloadPropertyName2]: payloadPropertyValue2,
      };
      const { jwtService, token } = getMockJWTServiceData({ expiresIn: '600s', payload });
      const req = {
        user: null,
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const { mockContext, mockGetRequest, request } = getMockExecutionContextData({ req });
      const reflector = new Reflector();
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation(() => {
        return ['admin'];
      });

      const rolesGuard = new RolesGuard(jwtService, reflector);
      try {
        rolesGuard.canActivate(mockContext);
        sendPseudoError();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe(ErrorMessages.ru.FORBIDDEN);
        expect(mockGetRequest).toBeCalledTimes(1);
        expect(reflector.getAllAndOverride).toBeCalledTimes(1);
        expect(reflector.getAllAndOverride).toBeCalledWith(ROLES_KEY, [
          mockContext.getHandler(),
          mockContext.getClass(),
        ]);
        expect(request.user).toHaveProperty(payloadPropertyName1, payloadPropertyValue1);
        expect(request.user).toHaveProperty(payloadPropertyName2, payloadPropertyValue2);
      }
    });
  });
});
