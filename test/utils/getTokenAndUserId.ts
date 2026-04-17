import { authRoutes } from '../endpoints';
import promoteUserRole from './promoteUserRole';

const createUserDto = {
  login: 'TEST_AUTH_LOGIN',
  password: 'Tu6!@#%&',
};

const getTokenAndUserId = async (request) => {
  // create user (signup always yields a viewer per spec)
  const {
    body: { id: mockUserId },
  } = await request
    .post(authRoutes.signup)
    .set('Accept', 'application/json')
    .send(createUserDto);

  if (mockUserId === undefined) {
    throw new Error('Authorization is not implemented');
  }

  // promote directly in DB so base tests run as admin and can mutate
  await promoteUserRole(mockUserId, 'admin');

  // get token after promotion so the JWT payload role === 'admin'
  const {
    body: { accessToken, refreshToken },
  } = await request
    .post(authRoutes.login)
    .set('Accept', 'application/json')
    .send(createUserDto);

  if (accessToken === undefined) {
    throw new Error('Authorization is not implemented');
  }

  const token = `Bearer ${accessToken}`;

  return {
    token,
    accessToken,
    refreshToken,
    mockUserId,
    login: createUserDto.login,
  };
};

export default getTokenAndUserId;
