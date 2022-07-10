import { authRoutes } from '../endpoints';

const createUserDto = {
  login: 'TEST_LOGIN',
  password: 'Tu6!@#%&',
};

const getTokenAndUserId = async (request) => {
  // create user
  const response = await request
    .post(authRoutes.signup)
    .set('Accept', 'application/json')
    .send(createUserDto);

  const mockUserId = response.body.id;

  // get token
  const response2 = await request
    .post(authRoutes.login)
    .set('Accept', 'application/json')
    .send(createUserDto);

  const token = `Bearer ${response2.body.accessToken}`;

  return { token, mockUserId };
};

export default getTokenAndUserId;
