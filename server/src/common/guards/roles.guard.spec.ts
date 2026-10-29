import { HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ErrorMessages } from '@common/constants';
import { ROLES_KEY } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { getMockExecutionContextData, getMockJWTServiceData, sendPseudoError } from '@test/unit/helpers';

type GuardSetup = {
  rolesGuard: RolesGuard;
  reflector: Reflector;
  mockContext: ReturnType<typeof getMockExecutionContextData>['mockContext'];
  request: { user: unknown };
};

const setupGuard = (params: {
  userRoles: string[];
  requiredRoles: string[] | undefined;
  authorization?: (token: string) => string;
}): GuardSetup => {
  const payload = { id: 1, roles: params.userRoles.map(value => ({ value })) };
  const { jwtService, token } = getMockJWTServiceData({ expiresIn: '600s', payload });
  const authorization = params.authorization ? params.authorization(token) : `Bearer ${token}`;
  const req = { user: null, headers: { authorization } };
  const { mockContext, request } = getMockExecutionContextData({ req });
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockImplementation(() => params.requiredRoles);

  return { rolesGuard: new RolesGuard(jwtService, reflector), reflector, mockContext, request };
};

const expectRejected = (setup: GuardSetup, status: HttpStatus, message: string): void => {
  try {
    setup.rolesGuard.canActivate(setup.mockContext);
    sendPseudoError();
  } catch (err) {
    expect(err.status).toBe(status);
    expect(err.message).toBe(message);
  }
};

describe('RolesGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('canActivate', () => {
    it('should pass a user who has the required roles', () => {
      const setup = setupGuard({ userRoles: ['admin'], requiredRoles: ['admin'] });

      expect(setup.rolesGuard.canActivate(setup.mockContext)).toBe(true);
      expect(setup.reflector.getAllAndOverride).toBeCalledWith(ROLES_KEY, [
        setup.mockContext.getHandler(),
        setup.mockContext.getClass(),
      ]);
      expect(setup.request.user).toEqual(expect.objectContaining({ id: 1, roles: [{ value: 'admin' }] }));
    });
    it('should work as JWT Auth Guard when no roles are required', () => {
      const withoutRoles = setupGuard({ userRoles: ['user'], requiredRoles: undefined });
      const withEmptyRoles = setupGuard({ userRoles: ['user'], requiredRoles: [] });

      expect(withoutRoles.rolesGuard.canActivate(withoutRoles.mockContext)).toBe(true);
      expect(withEmptyRoles.rolesGuard.canActivate(withEmptyRoles.mockContext)).toBe(true);
    });
    it('should answer 401 to an expired token', () => {
      const expiresIn = 600;
      const setup = setupGuard({ userRoles: ['admin'], requiredRoles: ['admin'] });

      jest.useFakeTimers();
      expect.assertions(3);
      setTimeout(() => {
        expectRejected(setup, HttpStatus.UNAUTHORIZED, ErrorMessages.UNAUTHORIZED);
        expect(setup.reflector.getAllAndOverride).toBeCalledTimes(0);
      }, expiresIn * 1000);
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    it('should answer 401 without a Bearer token', () => {
      const setup = setupGuard({ userRoles: ['admin'], requiredRoles: ['admin'], authorization: token => token });

      expectRejected(setup, HttpStatus.UNAUTHORIZED, ErrorMessages.UNAUTHORIZED);
      expect(setup.reflector.getAllAndOverride).toBeCalledTimes(0);
    });
    it('should answer 401 to a damaged Bearer token', () => {
      const setup = setupGuard({
        userRoles: ['admin'],
        requiredRoles: ['admin'],
        authorization: token => `Bearer ${token}1234`,
      });

      expectRejected(setup, HttpStatus.UNAUTHORIZED, ErrorMessages.UNAUTHORIZED);
      expect(setup.reflector.getAllAndOverride).toBeCalledTimes(0);
    });
    it('should answer 403 to a token without roles', () => {
      const { jwtService, token } = getMockJWTServiceData({
        expiresIn: '600s',
        payload: {},
        subject: '1',
        jwtId: 'refresh-token-id',
      });
      const req = { user: null, headers: { authorization: `Bearer ${token}` } };
      const { mockContext, request } = getMockExecutionContextData({ req });
      const reflector = new Reflector();
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation(() => ['admin']);

      expectRejected(
        { rolesGuard: new RolesGuard(jwtService, reflector), reflector, mockContext, request },
        HttpStatus.FORBIDDEN,
        ErrorMessages.NOT_ENOUGH_PERMISSIONS,
      );
    });
    it('should answer 403 to a user without the required roles', () => {
      const setup = setupGuard({ userRoles: ['user'], requiredRoles: ['admin'] });

      expectRejected(setup, HttpStatus.FORBIDDEN, ErrorMessages.NOT_ENOUGH_PERMISSIONS);
      expect(setup.reflector.getAllAndOverride).toBeCalledTimes(1);
    });
  });
});
