import request from '../lib/request';
import { authRoutes } from '../endpoints';
import {
  shouldAuthorizationBeTested,
  removeTokenUser,
  getTokenAndUserId,
  generateRefreshToken,
} from '../utils';
import { HttpStatus } from '@nestjs/common';
import { decode, JwtPayload } from 'jsonwebtoken';
import { validate } from 'uuid';

type UserTokens = {
  userId: string;
  login: string;
  accessToken: string;
  refreshToken: string;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

interface TokenPayload extends JwtPayload {
  userId: string;
  login: string;
}

describe('Refresh (e2e)', () => {
  let userTokens: UserTokens;
  const headers = { Accept: 'application/json' };

  const verifyToken = async (token: string): Promise<TokenPayload> => {
    const payload = decode(token, { json: true });
    if (!payload) {
      throw new Error('Token is not valid!');
    }
    const { userId, login, exp } = payload as TokenPayload;
    expect(payload).toBeInstanceOf(Object);
    expect(login).toBeDefined();
    expect(typeof login).toBe('string');
    expect(userId).toBeDefined();
    expect(typeof userId).toBe('string');
    expect(validate(userId)).toBeTruthy();
    expect(exp).toBeDefined();
    expect(typeof exp).toBe('number');
    expect(exp).toBeGreaterThan(0);
    return payload as TokenPayload;
  };

  beforeAll(async () => {
    if (shouldAuthorizationBeTested) {
      const { accessToken, refreshToken, mockUserId, login, token } =
        await getTokenAndUserId(request);
      userTokens = { userId: mockUserId, login, accessToken, refreshToken };
      headers['Authorization'] = token;
    }
  });

  afterAll(async () => {
    if (userTokens) {
      removeTokenUser(request, userTokens.userId, headers);
      delete headers['Authorization'];
    }
  });

  describe('Refresh', () => {
    it('should correctly get new tokens pair', async () => {
      const response = await request
        .post(authRoutes.refresh)
        .send({ refreshToken: userTokens.refreshToken });

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toBeInstanceOf(Object);

      const { accessToken, refreshToken } = response.body as RefreshResponse;
      expect(accessToken).toBeDefined();
      expect(typeof accessToken).toBe('string');

      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');

      const accessTokenPayload: TokenPayload = await verifyToken(accessToken);
      const refreshTokenPayload: TokenPayload = await verifyToken(refreshToken);
      expect(refreshTokenPayload.exp).toBeGreaterThan(accessTokenPayload.exp);
    });

    it('should fail with 403 (invalid refresh token)', async () => {
      const invalidRefreshToken = Math.random().toString();
      const response = await request
        .post(authRoutes.refresh)
        .send({ refreshToken: invalidRefreshToken });

      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    it('should fail with 401 (no refresh token)', async () => {
      const response = await request.post(authRoutes.refresh).send();
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should fail with 403 (expired refresh token)', async () => {
      const payload: TokenPayload = {
        userId: userTokens.userId,
        login: userTokens.login,
      };
      const refreshToken = generateRefreshToken(payload, { expiresIn: '0s' });
      const response = await request
        .post(authRoutes.refresh)
        .send({ refreshToken });
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
  });
});
